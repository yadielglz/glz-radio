package com.glztech.radiostream

import android.app.Activity
import android.content.Context
import android.widget.Toast
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import kotlinx.coroutines.launch

private const val UPDATE_PREFS = "app_updates"
private const val LAST_CHECK_PREF = "last_check_ms"
private const val AUTOMATIC_CHECK_INTERVAL_MS = 12 * 60 * 60 * 1000L

@Composable
internal fun AppUpdateController(
    activity: Activity,
    manualCheckRequest: Int,
    onStatus: (String) -> Unit
) {
    val updater = remember { AppUpdater(activity.applicationContext) }
    val scope = rememberCoroutineScope()
    var availableUpdate by remember { mutableStateOf<AppUpdate?>(null) }
    var downloading by remember { mutableStateOf(false) }
    var progress by remember { mutableIntStateOf(0) }

    LaunchedEffect(manualCheckRequest) {
        val prefs = activity.getSharedPreferences(UPDATE_PREFS, Context.MODE_PRIVATE)
        val now = System.currentTimeMillis()
        val lastCheck = prefs.getLong(LAST_CHECK_PREF, 0L)
        val isManual = manualCheckRequest > 0
        if (!isManual && now - lastCheck < AUTOMATIC_CHECK_INTERVAL_MS) return@LaunchedEffect

        onStatus("Checking for updates…")
        when (val result = updater.check(BuildConfig.VERSION_CODE.toLong())) {
            UpdateCheckResult.UpToDate -> {
                prefs.edit().putLong(LAST_CHECK_PREF, now).apply()
                onStatus("Glz Radio is up to date")
                if (isManual) Toast.makeText(activity, "You have the latest version", Toast.LENGTH_SHORT).show()
            }
            is UpdateCheckResult.Available -> {
                prefs.edit().putLong(LAST_CHECK_PREF, now).apply()
                availableUpdate = result.update
                onStatus("Version ${result.update.versionName} is available")
            }
            is UpdateCheckResult.Failed -> {
                onStatus(result.message)
                if (isManual) Toast.makeText(activity, result.message, Toast.LENGTH_SHORT).show()
            }
        }
    }

    val update = availableUpdate ?: return
    AlertDialog(
        onDismissRequest = { if (!downloading) availableUpdate = null },
        title = { Text("Glz Radio ${update.versionName}") },
        text = {
            if (downloading) {
                LinearProgressIndicator(
                    progress = { progress / 100f },
                    modifier = Modifier
                )
            } else {
                Text(update.releaseNotes.ifBlank { "A new version is ready to install." })
            }
        },
        confirmButton = {
            TextButton(
                enabled = !downloading,
                onClick = {
                    if (!updater.canRequestInstall()) {
                        updater.openInstallPermission(activity)
                        Toast.makeText(
                            activity,
                            "Allow Glz Radio to install updates, then tap Update again",
                            Toast.LENGTH_LONG
                        ).show()
                        return@TextButton
                    }
                    downloading = true
                    onStatus("Downloading version ${update.versionName}…")
                    scope.launch {
                        runCatching {
                            updater.download(update) { next ->
                                activity.runOnUiThread { progress = next }
                            }
                        }.onSuccess { apk ->
                            downloading = false
                            onStatus("Update downloaded")
                            updater.install(activity, apk)
                        }.onFailure {
                            downloading = false
                            onStatus("Update download failed")
                            Toast.makeText(
                                activity,
                                it.message ?: "Could not download update",
                                Toast.LENGTH_LONG
                            ).show()
                        }
                    }
                }
            ) {
                Text(if (downloading) "$progress%" else "Update")
            }
        },
        dismissButton = {
            TextButton(
                enabled = !downloading,
                onClick = { availableUpdate = null }
            ) {
                Text("Later", color = Color.Unspecified)
            }
        }
    )
}
