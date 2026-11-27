package com.glztech.radiostream;

import android.util.Log;

import java.io.ByteArrayOutputStream;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** A bounded, in-process HLS window for MP3 and ADTS AAC radio streams that preserves ICY metadata. */
final class TimeshiftServer {
    interface MetadataListener {
        void onStreamTitle(String id, String title);
    }

    interface StreamInfoListener {
        void onStreamInfo(String id, int bitrateKbps, String codec);
    }

    private static final String TAG = "TimeshiftServer";
    private static final int SEGMENT_MS = 2000;
    private static final int WINDOW_MS = 120000;
    private final ExecutorService workers = Executors.newCachedThreadPool();
    private final Map<String, String> stations = new HashMap<>();
    private final ServerSocket socket;
    private volatile MetadataListener metadataListener;
    private volatile StreamInfoListener streamInfoListener;
    private Feed feed;

    TimeshiftServer() throws IOException {
        socket = new ServerSocket(0, 16, InetAddress.getByName("127.0.0.1"));
        workers.execute(() -> {
            while (!socket.isClosed()) {
                try {
                    Socket client = socket.accept();
                    workers.execute(() -> serve(client));
                } catch (IOException e) {
                    if (!socket.isClosed()) Log.w(TAG, "accept", e);
                }
            }
        });
    }

    void setMetadataListener(MetadataListener listener) {
        this.metadataListener = listener;
    }

    void setStreamInfoListener(StreamInfoListener listener) {
        this.streamInfoListener = listener;
    }

    synchronized String register(String id, String streamUrl) {
        stations.put(id, streamUrl);
        return "http://127.0.0.1:" + socket.getLocalPort() + "/radio/" + id + "/index.m3u8";
    }

    synchronized void stop() {
        if (feed != null) feed.stop();
        feed = null;
    }

    synchronized void close() {
        stop();
        try {
            socket.close();
        } catch (IOException ignored) {
        }
        workers.shutdownNow();
    }

    private synchronized Feed getFeed(String id, boolean start) {
        String url = stations.get(id);
        if (url == null) return null;
        if (feed == null || !feed.id.equals(id)) {
            if (!start) return null;
            stop();
            feed = new Feed(id, url);
            workers.execute(feed::capture);
        }
        return feed;
    }

    private void serve(Socket client) {
        try (Socket s = client) {
            s.setSoTimeout(10000);
            InputStream input = s.getInputStream();
            ByteArrayOutputStream request = new ByteArrayOutputStream();
            int ch;
            while ((ch = input.read()) >= 0 && ch != '\n' && request.size() < 2048) request.write(ch);
            String[] parts = request.toString("UTF-8").trim().split(" ");
            if (parts.length < 2 || !"GET".equals(parts[0])) {
                reply(s, 400, "text/plain", new byte[0]);
                return;
            }
            // Drain headers before responding so the player can reuse normal HTTP semantics.
            int lineLength = 0;
            while ((ch = input.read()) >= 0) {
                if (ch == '\n') {
                    if (lineLength <= 1) break;
                    lineLength = 0;
                } else {
                    lineLength++;
                }
                if (lineLength > 8192) break;
            }
            String[] path = parts[1].split("/");
            if (path.length != 4 || !"radio".equals(path[1])) {
                reply(s, 404, "text/plain", new byte[0]);
                return;
            }
            Feed current = getFeed(path[2], "index.m3u8".equals(path[3]));
            if (current == null) {
                reply(s, 404, "text/plain", new byte[0]);
                return;
            }
            if ("index.m3u8".equals(path[3])) {
                current.awaitStartup();
                reply(s, current.failed ? 503 : 200, "application/vnd.apple.mpegurl", current.playlist().getBytes(StandardCharsets.UTF_8));
            } else if (path[3].endsWith(".mp3") || path[3].endsWith(".aac")) {
                long sequence;
                try {
                    sequence = Long.parseLong(path[3].substring(0, path[3].length() - 4));
                } catch (NumberFormatException e) {
                    reply(s, 404, "text/plain", new byte[0]);
                    return;
                }
                byte[] bytes = current.segment(sequence);
                reply(s, bytes == null ? 404 : 200, path[3].endsWith(".aac") ? "audio/aac" : "audio/mpeg", bytes == null ? new byte[0] : bytes);
            } else {
                reply(s, 404, "text/plain", new byte[0]);
            }
        } catch (IOException e) {
            Log.w(TAG, "client", e);
        }
    }

    private static void reply(Socket client, int status, String type, byte[] body) throws IOException {
        OutputStream out = client.getOutputStream();
        String label = status == 200 ? "OK" : status == 503 ? "Service Unavailable" : "Not Found";
        out.write(("HTTP/1.1 " + status + " " + label + "\r\nContent-Type: " + type +
                "\r\nContent-Length: " + body.length + "\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n")
                .getBytes(StandardCharsets.US_ASCII));
        out.write(body);
        out.flush();
    }

    static String parseIcyStreamTitle(String rawMetadata) {
        if (rawMetadata == null || rawMetadata.isEmpty()) return null;
        int start = rawMetadata.indexOf("StreamTitle='");
        if (start < 0) return null;
        int valueStart = start + "StreamTitle='".length();
        int end = rawMetadata.indexOf("';", valueStart);
        if (end < 0) {
            end = rawMetadata.indexOf('\'', valueStart);
        }
        if (end <= valueStart) return null;
        String title = rawMetadata.substring(valueStart, end).trim();
        return title.isEmpty() ? null : title;
    }

    private static final class Segment {
        final long sequence;
        final byte[] data;
        final double seconds;

        Segment(long sequence, byte[] data, double seconds) {
            this.sequence = sequence;
            this.data = data;
            this.seconds = seconds;
        }
    }

    private final class Feed {
        final String id, url;
        final ArrayDeque<Segment> segments = new ArrayDeque<>();
        volatile boolean failed;
        volatile boolean running = true;
        volatile String extension = "mp3";
        HttpURLConnection connection;
        long nextSequence, timestamp90k;
        int totalDurationMs;
        boolean reportedInfo;

        Feed(String id, String url) {
            this.id = id;
            this.url = url;
        }

        void awaitStartup() {
            synchronized (this) {
                long deadline = System.currentTimeMillis() + 9000;
                while (segments.size() < 2 && !failed && running && System.currentTimeMillis() < deadline) {
                    try {
                        wait(250);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }

        void stop() {
            running = false;
            if (connection != null) connection.disconnect();
        }

        synchronized String playlist() {
            // A live playlist has no end marker: Media3 refreshes it as segments arrive.
            long first = segments.isEmpty() ? nextSequence : segments.peekFirst().sequence;
            StringBuilder hls = new StringBuilder("#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:3\n" +
                    "#EXT-X-MEDIA-SEQUENCE:" + first + "\n");
            for (Segment segment : segments) {
                hls.append("#EXTINF:").append(String.format(java.util.Locale.US, "%.3f", segment.seconds))
                        .append(",\n").append(segment.sequence).append('.').append(extension).append("\n");
            }
            return hls.toString();
        }

        synchronized byte[] segment(long sequence) {
            for (Segment s : segments) if (s.sequence == sequence) return s.data;
            return null;
        }

        void capture() {
            try {
                connection = (HttpURLConnection) new URL(url).openConnection();
                connection.setConnectTimeout(12000);
                connection.setReadTimeout(20000);
                // Request ICY metadata so live song titles continue working while timeshift is active.
                connection.setRequestProperty("Icy-MetaData", "1");
                connection.setInstanceFollowRedirects(true);
                if (connection.getResponseCode() / 100 != 2) {
                    throw new IOException("HTTP " + connection.getResponseCode());
                }
                int metadataInterval = 0;
                try {
                    String header = connection.getHeaderField("icy-metaint");
                    if (header != null) metadataInterval = Integer.parseInt(header.trim());
                } catch (Exception ignored) {
                }
                int headerBitrate = 0;
                try {
                    String br = connection.getHeaderField("icy-br");
                    if (br != null) headerBitrate = Integer.parseInt(br.split(",")[0].trim());
                } catch (Exception ignored) {
                }

                try (InputStream raw = connection.getInputStream();
                     InputStream input = metadataInterval > 0
                             ? new IcyAudioInput(raw, metadataInterval, title -> {
                                 MetadataListener listener = metadataListener;
                                 if (listener != null && running) {
                                     listener.onStreamTitle(id, title);
                                 }
                             })
                             : raw) {
                    ByteArrayOutputStream pending = new ByteArrayOutputStream();
                    ByteArrayOutputStream audio = new ByteArrayOutputStream();
                    int segmentMs = 0;
                    byte[] incoming = new byte[8192];
                    int count;
                    while (running && (count = input.read(incoming)) >= 0) {
                        pending.write(incoming, 0, count);
                        byte[] bytes = pending.toByteArray();
                        int cursor = 0;
                        while (cursor + 7 <= bytes.length) {
                            Frame frame = Frame.parse(bytes, cursor);
                            if (frame == null) {
                                cursor++;
                                continue;
                            }
                            if (cursor + frame.size > bytes.length) break;
                            extension = frame.aac ? "aac" : "mp3";
                            if (!reportedInfo) {
                                reportedInfo = true;
                                int effectiveBitrate = headerBitrate > 0 ? headerBitrate : frame.bitrateKbps;
                                StreamInfoListener infoListener = streamInfoListener;
                                if (infoListener != null) {
                                    infoListener.onStreamInfo(id, effectiveBitrate, frame.aac ? "AAC" : "MP3");
                                }
                            }
                            audio.write(bytes, cursor, frame.size);
                            cursor += frame.size;
                            segmentMs += frame.durationMs;
                            if (segmentMs >= SEGMENT_MS) {
                                publish(audio.toByteArray(), segmentMs);
                                audio.reset();
                                segmentMs = 0;
                            }
                        }
                        pending.reset();
                        pending.write(bytes, cursor, bytes.length - cursor);
                        if (pending.size() > 65536) throw new IOException("Unsupported radio audio format");
                    }
                }
            } catch (Exception e) {
                if (running) {
                    failed = true;
                    Log.w(TAG, "Timeshift unavailable for " + id, e);
                }
            } finally {
                if (connection != null) connection.disconnect();
            }
        }

        private synchronized void publish(byte[] audio, int durationMs) throws IOException {
            if (!running) return;
            ByteArrayOutputStream data = new ByteArrayOutputStream();
            data.write(timestampTag(timestamp90k));
            data.write(audio);
            segments.addLast(new Segment(nextSequence++, data.toByteArray(), durationMs / 1000.0));
            notifyAll();
            timestamp90k += durationMs * 90L;
            totalDurationMs += durationMs;
            while (totalDurationMs > WINDOW_MS && segments.size() > 2) {
                totalDurationMs -= (int) (segments.removeFirst().seconds * 1000);
            }
        }
    }

    private interface TitleConsumer {
        void accept(String title);
    }

    private static final class IcyAudioInput extends FilterInputStream {
        private final int interval;
        private final TitleConsumer titleConsumer;
        private int remaining;
        private String lastTitle;

        IcyAudioInput(InputStream input, int interval, TitleConsumer titleConsumer) {
            super(input);
            this.interval = interval;
            this.titleConsumer = titleConsumer;
            this.remaining = interval;
        }

        @Override
        public int read() throws IOException {
            byte[] one = new byte[1];
            return read(one, 0, 1) < 0 ? -1 : one[0] & 255;
        }

        @Override
        public int read(byte[] bytes, int offset, int length) throws IOException {
            if (length == 0) return 0;
            if (remaining == 0) {
                int blocks = in.read();
                if (blocks < 0) return -1;
                int metaLen = blocks * 16;
                if (metaLen > 0) {
                    byte[] metaBytes = new byte[metaLen];
                    int readTotal = 0;
                    while (readTotal < metaLen) {
                        int n = in.read(metaBytes, readTotal, metaLen - readTotal);
                        if (n < 0) return -1;
                        readTotal += n;
                    }
                    String rawMeta = new String(metaBytes, StandardCharsets.UTF_8).replace("\0", "");
                    String parsed = parseIcyStreamTitle(rawMeta);
                    if (parsed != null && !parsed.equals(lastTitle)) {
                        lastTitle = parsed;
                        if (titleConsumer != null) {
                            titleConsumer.accept(parsed);
                        }
                    }
                }
                remaining = interval;
            }
            int count = in.read(bytes, offset, Math.min(length, remaining));
            if (count > 0) remaining -= count;
            return count;
        }
    }

    // HLS packed audio requires an ID3 PRIV transport timestamp at every segment start.
    private static byte[] timestampTag(long ticks) throws IOException {
        byte[] owner = "com.apple.streaming.transportStreamTimestamp".getBytes(StandardCharsets.US_ASCII);
        ByteArrayOutputStream frame = new ByteArrayOutputStream();
        frame.write(owner);
        frame.write(0);
        for (int i = 7; i >= 0; i--) frame.write((int) (ticks >>> (8 * i)) & 0xff);
        byte[] payload = frame.toByteArray();
        ByteArrayOutputStream tag = new ByteArrayOutputStream();
        tag.write(new byte[]{'I', 'D', '3', 4, 0, 0, 0, 0, 0, (byte) (payload.length + 10)});
        tag.write(new byte[]{'P', 'R', 'I', 'V', 0, 0, 0, (byte) payload.length, 0, 0});
        tag.write(payload);
        return tag.toByteArray();
    }

    private static final class Frame {
        final int size, durationMs, bitrateKbps;
        final boolean aac;

        Frame(int size, int durationMs, int bitrateKbps, boolean aac) {
            this.size = size;
            this.durationMs = durationMs;
            this.bitrateKbps = bitrateKbps;
            this.aac = aac;
        }

        static Frame parse(byte[] b, int p) {
            int a = b[p] & 255, c = b[p + 1] & 255;
            if (a != 255 || (c & 0xe0) != 0xe0) return null;
            // ADTS AAC (7 or 9 byte header).
            if ((c & 0xf6) == 0xf0) {
                int rateIndex = (b[p + 2] >> 2) & 15;
                int[] rates = {96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350};
                if (rateIndex >= rates.length) return null;
                int length = ((b[p + 3] & 3) << 11) | ((b[p + 4] & 255) << 3) | ((b[p + 5] & 224) >> 5);
                int durationMs = Math.max(1, 1024000 / rates[rateIndex]);
                int approxBitrate = length * 8 / Math.max(1, durationMs);
                return length >= 7 ? new Frame(length, durationMs, approxBitrate, true) : null;
            }
            if (p + 4 > b.length) return null;
            int version = (c >> 3) & 3, layer = (c >> 1) & 3;
            if (version == 1 || layer != 1) return null; // MPEG Layer III
            int bitrateIndex = (b[p + 2] >> 4) & 15, rateIndex = (b[p + 2] >> 2) & 3;
            if (bitrateIndex == 0 || bitrateIndex == 15 || rateIndex == 3) return null;
            int[] rates = {44100, 48000, 32000};
            int[] v1 = {0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320};
            int[] v2 = {0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160};
            int rate = rates[rateIndex] / (version == 3 ? 1 : version == 2 ? 2 : 4);
            int bitrate = (version == 3 ? v1 : v2)[bitrateIndex];
            int samples = version == 3 ? 1152 : 576;
            int length = (version == 3 ? 144 : 72) * bitrate * 1000 / rate + ((b[p + 2] >> 1) & 1);
            return length >= 4 ? new Frame(length, Math.max(1, samples * 1000 / rate), bitrate, false) : null;
        }
    }
}
