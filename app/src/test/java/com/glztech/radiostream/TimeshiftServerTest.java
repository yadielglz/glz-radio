package com.glztech.radiostream;

import org.junit.Test;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.Assert.*;

public class TimeshiftServerTest {
    @Test public void servesSeekableHlsSegmentsFromProgressiveMp3() throws Exception {
        try (ServerSocket origin = new ServerSocket(0, 1, InetAddress.getByName("127.0.0.1"))) {
            Thread producer = new Thread(() -> {
                try (Socket client = origin.accept()) {
                    OutputStream out = client.getOutputStream();
                    out.write("HTTP/1.1 200 OK\r\nContent-Type: audio/mpeg\r\n\r\n".getBytes(StandardCharsets.US_ASCII));
                    byte[] frame = new byte[417];
                    frame[0] = (byte) 0xff; frame[1] = (byte) 0xfb;
                    frame[2] = (byte) 0x90; frame[3] = 0;
                    for (int i = 0; i < 250; i++) out.write(frame);
                    out.flush();
                    Thread.sleep(2000);
                } catch (Exception e) { throw new RuntimeException(e); }
            });
            producer.setDaemon(true);
            producer.start();
            TimeshiftServer timeshift = new TimeshiftServer();
            try {
                String playlistUrl = timeshift.register("test", "http://127.0.0.1:" + origin.getLocalPort() + "/stream");
                String playlist = new String(new URL(playlistUrl).openStream().readAllBytes(), StandardCharsets.UTF_8);
                assertTrue(playlist, playlist.contains("#EXT-X-MEDIA-SEQUENCE:0"));
                assertTrue(playlist, playlist.contains("0.mp3"));
                byte[] segment = new URL(playlistUrl.replace("index.m3u8", "0.mp3")).openStream().readAllBytes();
                assertEquals('I', segment[0]);
                assertEquals('D', segment[1]);
                assertEquals('3', segment[2]);
                assertTrue(segment.length > 1000);
            } finally { timeshift.close(); }
        }
    }

    @Test public void extractsIcyStreamTitleWhileServingTimeshiftAudio() throws Exception {
        assertEquals("Marc Anthony - Vivir Mi Vida", TimeshiftServer.parseIcyStreamTitle("StreamTitle='Marc Anthony - Vivir Mi Vida';StreamUrl='';"));
        assertNull(TimeshiftServer.parseIcyStreamTitle("StreamTitle='';"));

        final int metaint = 417 * 10;
        CountDownLatch titleLatch = new CountDownLatch(1);
        AtomicReference<String> receivedTitle = new AtomicReference<>();

        try (ServerSocket origin = new ServerSocket(0, 1, InetAddress.getByName("127.0.0.1"))) {
            Thread producer = new Thread(() -> {
                try (Socket client = origin.accept()) {
                    OutputStream out = client.getOutputStream();
                    String headers = "HTTP/1.1 200 OK\r\nContent-Type: audio/mpeg\r\nicy-metaint: " + metaint + "\r\nicy-br: 128\r\n\r\n";
                    out.write(headers.getBytes(StandardCharsets.US_ASCII));
                    byte[] frame = new byte[417];
                    frame[0] = (byte) 0xff; frame[1] = (byte) 0xfb;
                    frame[2] = (byte) 0x90; frame[3] = 0;

                    String meta = "StreamTitle='El Gran Combo - Un Verano en Nueva York';";
                    int blocks = (meta.length() + 15) / 16;
                    byte[] metaPadded = new byte[blocks * 16];
                    byte[] rawMeta = meta.getBytes(StandardCharsets.UTF_8);
                    System.arraycopy(rawMeta, 0, metaPadded, 0, rawMeta.length);

                    for (int chunk = 0; chunk < 25; chunk++) {
                        for (int i = 0; i < 10; i++) out.write(frame);
                        if (chunk == 0) {
                            out.write(blocks);
                            out.write(metaPadded);
                        } else {
                            out.write(0);
                        }
                    }
                    out.flush();
                    Thread.sleep(2000);
                } catch (Exception e) { throw new RuntimeException(e); }
            });
            producer.setDaemon(true);
            producer.start();

            TimeshiftServer timeshift = new TimeshiftServer();
            timeshift.setMetadataListener((id, title) -> {
                receivedTitle.set(title);
                titleLatch.countDown();
            });
            try {
                String playlistUrl = timeshift.register("icytest", "http://127.0.0.1:" + origin.getLocalPort() + "/stream");
                String playlist = new String(new URL(playlistUrl).openStream().readAllBytes(), StandardCharsets.UTF_8);
                assertTrue(playlist, playlist.contains("0.mp3"));
                assertTrue("Expected ICY StreamTitle callback", titleLatch.await(5, TimeUnit.SECONDS));
                assertEquals("El Gran Combo - Un Verano en Nueva York", receivedTitle.get());
            } finally { timeshift.close(); }
        }
    }
}
