package com.glztech.radiostream

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale

internal data class StreamProbeResult(
    val stationName: String,
    val online: Boolean,
    val latencyMs: Long? = null,
    val bitrateKbps: Int? = null,
    val codec: String? = null,
    val detail: String = ""
)

internal object StreamHealthChecker {
    suspend fun probe(station: Station): StreamProbeResult = withContext(Dispatchers.IO) {
        val start = System.currentTimeMillis()
        var conn: HttpURLConnection? = null
        try {
            conn = (URL(station.streamUrl).openConnection() as HttpURLConnection).apply {
                connectTimeout = 5000
                readTimeout = 5000
                requestMethod = "GET"
                instanceFollowRedirects = true
                setRequestProperty("User-Agent", "GlzRadio/${BuildConfig.VERSION_NAME}")
                setRequestProperty("Icy-MetaData", "1")
            }
            val code = conn.responseCode
            val latency = (System.currentTimeMillis() - start).coerceAtLeast(1L)
            if (code in 200..399) {
                val contentType = conn.contentType.orEmpty().lowercase(Locale.ROOT)
                val bitrate = conn.getHeaderField("icy-br")
                    ?.split(",")
                    ?.firstOrNull()
                    ?.trim()
                    ?.toIntOrNull()
                val codec = when {
                    contentType.contains("aac") || station.streamUrl.contains(".aac", true) -> "AAC"
                    contentType.contains("ogg") || station.streamUrl.contains(".ogg", true) -> "OGG"
                    contentType.contains("mpegurl") || station.streamUrl.contains(".m3u8", true) -> "HLS"
                    else -> "MP3"
                }
                val summary = buildList {
                    add(codec)
                    if (bitrate != null && bitrate > 0) add("${bitrate}k")
                    add("${latency}ms")
                }.joinToString(" · ")
                StreamProbeResult(
                    stationName = station.name,
                    online = true,
                    latencyMs = latency,
                    bitrateKbps = bitrate,
                    codec = codec,
                    detail = summary
                )
            } else {
                StreamProbeResult(
                    stationName = station.name,
                    online = false,
                    latencyMs = latency,
                    detail = "HTTP $code"
                )
            }
        } catch (e: Exception) {
            StreamProbeResult(
                stationName = station.name,
                online = false,
                detail = "Offline"
            )
        } finally {
            conn?.disconnect()
        }
    }

    suspend fun probeAll(
        stations: List<Station>,
        onProgress: (StreamProbeResult) -> Unit
    ): Map<String, StreamProbeResult> = coroutineScope {
        val results = mutableMapOf<String, StreamProbeResult>()
        stations.chunked(4).forEach { batch ->
            val batchResults = batch.map { station -> async { probe(station) } }.awaitAll()
            batchResults.forEach { res ->
                results[res.stationName] = res
                onProgress(res)
            }
        }
        results
    }
}
