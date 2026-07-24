package com.glztech.radiostream

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.core.content.FileProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URI
import java.net.URL
import java.security.MessageDigest
import java.util.Locale

internal data class AppUpdate(
    val versionCode: Long,
    val versionName: String,
    val minimumSupportedVersionCode: Long,
    val apkUrl: String,
    val sha256: String,
    val releaseNotes: String
)

internal sealed interface UpdateCheckResult {
    data object UpToDate : UpdateCheckResult
    data class Available(val update: AppUpdate) : UpdateCheckResult
    data class Failed(val message: String) : UpdateCheckResult
}

internal class AppUpdater(private val context: Context) {
    suspend fun check(currentVersionCode: Long): UpdateCheckResult = withContext(Dispatchers.IO) {
        runCatching {
            val metadataUrl = findUpdateMetadataUrl(getJsonArray(RELEASES_URL))
                ?: return@runCatching UpdateCheckResult.UpToDate

            val update = parseUpdate(getJson(metadataUrl))
            if (update.versionCode > currentVersionCode) {
                UpdateCheckResult.Available(update)
            } else {
                UpdateCheckResult.UpToDate
            }
        }.getOrElse {
            UpdateCheckResult.Failed("Update check unavailable")
        }
    }

    suspend fun download(update: AppUpdate, onProgress: (Int) -> Unit): File =
        withContext(Dispatchers.IO) {
            require(isAllowedDownloadUrl(update.apkUrl)) { "Untrusted update URL" }
            val updatesDir = File(context.cacheDir, "updates").apply { mkdirs() }
            val partial = File(updatesDir, "glz-radio-${update.versionName}.apk.part")
            val target = File(updatesDir, "glz-radio-${update.versionName}.apk")
            partial.delete()
            target.delete()

            val digest = MessageDigest.getInstance("SHA-256")
            val connection = openConnection(update.apkUrl)
            try {
                require(connection.responseCode in 200..299) { "Download failed" }
                val total = connection.contentLengthLong
                connection.inputStream.use { input ->
                    partial.outputStream().buffered().use { output ->
                        val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
                        var copied = 0L
                        while (true) {
                            val count = input.read(buffer)
                            if (count < 0) break
                            output.write(buffer, 0, count)
                            digest.update(buffer, 0, count)
                            copied += count
                            if (total > 0) onProgress(((copied * 100) / total).toInt())
                        }
                    }
                }
                val actual = digest.digest().joinToString("") { "%02x".format(it) }
                require(actual.equals(update.sha256, ignoreCase = true)) {
                    "Downloaded update did not pass verification"
                }
                require(partial.renameTo(target)) { "Could not finalize update" }
                target
            } catch (exception: Exception) {
                partial.delete()
                throw exception
            } finally {
                connection.disconnect()
            }
        }

    fun canRequestInstall(): Boolean = context.packageManager.canRequestPackageInstalls()

    fun openInstallPermission(activity: Activity) {
        activity.startActivity(
            Intent(
                Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:${context.packageName}")
            )
        )
    }

    fun install(activity: Activity, apk: File) {
        val uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.files",
            apk
        )
        activity.startActivity(
            Intent(Intent.ACTION_VIEW)
                .setDataAndType(uri, APK_MIME_TYPE)
                .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        )
    }

    private fun getJson(url: String): JSONObject {
        return JSONObject(getBody(url))
    }

    private fun getJsonArray(url: String): JSONArray {
        return JSONArray(getBody(url))
    }

    private fun getBody(url: String): String {
        require(url.startsWith("https://")) { "HTTPS required" }
        val connection = openConnection(url)
        return try {
            require(connection.responseCode in 200..299) { "Request failed" }
            connection.inputStream.bufferedReader().use { it.readText() }
        } finally {
            connection.disconnect()
        }
    }

    private fun openConnection(url: String): HttpURLConnection {
        return (URL(url).openConnection() as HttpURLConnection).apply {
            connectTimeout = 15_000
            readTimeout = 30_000
            instanceFollowRedirects = true
            setRequestProperty("Accept", "application/vnd.github+json")
            setRequestProperty("User-Agent", "GlzRadio/${BuildConfig.VERSION_NAME}")
        }
    }

    companion object {
        private const val RELEASES_URL =
            "https://api.github.com/repos/yadielglz/glz-radio/releases?per_page=10"
        private const val UPDATE_METADATA_NAME = "update.json"
        private const val APK_MIME_TYPE = "application/vnd.android.package-archive"
    }
}

internal fun findUpdateMetadataUrl(releases: JSONArray): String? {
    for (releaseIndex in 0 until releases.length()) {
        val release = releases.optJSONObject(releaseIndex) ?: continue
        if (release.optBoolean("draft")) continue
        val assets = release.optJSONArray("assets") ?: continue
        for (assetIndex in 0 until assets.length()) {
            val asset = assets.optJSONObject(assetIndex) ?: continue
            if (asset.optString("name") == "update.json") {
                return asset.optString("browser_download_url").takeIf { it.startsWith("https://") }
            }
        }
    }
    return null
}

internal fun parseUpdate(json: JSONObject): AppUpdate {
    val update = AppUpdate(
        versionCode = json.getLong("versionCode"),
        versionName = json.getString("versionName").trim(),
        minimumSupportedVersionCode = json.optLong("minimumSupportedVersionCode", 1L),
        apkUrl = json.getString("apkUrl").trim(),
        sha256 = json.getString("sha256").lowercase(Locale.US),
        releaseNotes = json.optString("releaseNotes", "A new version is available.").trim()
    )
    require(update.versionCode > 0)
    require(update.versionName.isNotBlank())
    require(update.minimumSupportedVersionCode > 0)
    require(update.sha256.matches(Regex("[a-f0-9]{64}")))
    require(isAllowedDownloadUrl(update.apkUrl))
    return update
}

internal fun isAllowedDownloadUrl(value: String): Boolean {
    return runCatching {
        val uri = URI(value)
        uri.scheme == "https" && uri.host?.lowercase(Locale.US) in setOf(
            "github.com",
            "objects.githubusercontent.com",
            "release-assets.githubusercontent.com"
        )
    }.getOrDefault(false)
}
