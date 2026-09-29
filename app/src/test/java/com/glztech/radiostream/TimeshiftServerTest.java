package com.glztech.radiostream;

import org.junit.Test;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URL;
import java.nio.charset.StandardCharsets;
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
}
