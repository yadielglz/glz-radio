package com.yadielglz.radiostreamer;

import android.content.Context;
import android.os.Environment;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

final class StreamRecorder {
    interface Listener {
        void onStarted(File file);

        void onStopped(File file);

        void onFailed(Exception exception);
    }

    private final Context context;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private volatile boolean recording;
    private Future<?> task;
    private File activeFile;
    private HttpURLConnection connection;

    StreamRecorder(Context context) {
        this.context = context.getApplicationContext();
    }

    boolean isRecording() {
        return recording;
    }

    File activeFile() {
        return activeFile;
    }

    File recordingsDir() {
        return recordingsDir(context);
    }

    static File recordingsDir(Context context) {
        File dir = context.getExternalFilesDir(Environment.DIRECTORY_MUSIC);
        if (dir == null) {
            dir = context.getFilesDir();
        }
        File recordings = new File(dir, "recordings");
        if (!recordings.exists()) {
            recordings.mkdirs();
        }
        return recordings;
    }

    void start(Station station, Listener listener) {
        if (recording || station == null) {
            return;
        }
        recording = true;
        activeFile = outputFile(station);
        task = executor.submit(() -> {
            byte[] buffer = new byte[16 * 1024];
            try (FileOutputStream out = new FileOutputStream(activeFile)) {
                connection = (HttpURLConnection) new URL(station.streamUrl).openConnection();
                connection.setConnectTimeout(12000);
                connection.setReadTimeout(12000);
                connection.setRequestProperty("Icy-MetaData", "0");
                connection.connect();
                listener.onStarted(activeFile);
                try (InputStream in = connection.getInputStream()) {
                    int read;
                    while (recording && (read = in.read(buffer)) != -1) {
                        out.write(buffer, 0, read);
                    }
                }
                out.flush();
                listener.onStopped(activeFile);
            } catch (Exception exception) {
                if (recording) {
                    listener.onFailed(exception);
                } else {
                    listener.onStopped(activeFile);
                }
            } finally {
                recording = false;
                if (connection != null) {
                    connection.disconnect();
                    connection = null;
                }
            }
        });
    }

    void stop() {
        recording = false;
        if (connection != null) {
            connection.disconnect();
        }
        if (task != null) {
            task.cancel(true);
            task = null;
        }
    }

    void shutdown() {
        stop();
        executor.shutdownNow();
    }

    private File outputFile(Station station) {
        File recordings = recordingsDir();
        String timestamp = new SimpleDateFormat("yyyyMMdd-HHmmss", Locale.US).format(new Date());
        String name = station.name.replaceAll("[^A-Za-z0-9]+", "-").replaceAll("(^-|-$)", "").toLowerCase(Locale.US);
        return new File(recordings, name + "-" + timestamp + extensionFor(station.streamUrl));
    }

    private String extensionFor(String url) {
        String lower = url.toLowerCase(Locale.US);
        if (lower.contains(".aac")) {
            return ".aac";
        }
        if (lower.contains(".ogg")) {
            return ".ogg";
        }
        return ".mp3";
    }
}
