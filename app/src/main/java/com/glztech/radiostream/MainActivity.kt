package com.glztech.radiostream

import android.Manifest
import android.app.Activity
import android.app.AlertDialog as PlatformAlertDialog
import android.content.ComponentCallbacks2
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.os.SystemClock
import android.provider.Settings
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Alarm
import androidx.compose.material.icons.filled.Bedtime
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.FiberManualRecord
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.LocationCity
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.NetworkCheck
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Radio
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material.icons.filled.SkipPrevious
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.FileProvider
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import coil.compose.AsyncImage
import com.google.common.util.concurrent.ListenableFuture
import com.google.common.util.concurrent.MoreExecutors
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileInputStream
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.Locale

private const val APP_PREFS = "radio_streamer"
private const val FAVORITES_PREF = "favorites"
private const val THEME_PREF = "theme_name"
private const val ACCENT_PREF = "accent_name"
private const val LAYOUT_PREF = "layout_mode"
private const val PLAYER_SIZE_PREF = "player_size"
private const val LOCATION_PROMPTED_PREF = "location_prompted"
private const val BATTERY_PROMPTED_PREF = "battery_prompted"
private const val DEFAULT_THEME = "Signal Noir"
private const val DEFAULT_ACCENT = "Amber"
private const val STREAM_RETRY_BASE_DELAY_MS = 2_000L
private const val STREAM_RETRY_MAX_DELAY_MS = 30_000L

private data class AlarmLaunchRequest(
    val stationName: String,
    val fadeIn: Boolean,
    val token: Long = SystemClock.elapsedRealtime()
)

class MainActivity : ComponentActivity() {
    private var controllerFuture: ListenableFuture<MediaController>? = null
    private var controller by mutableStateOf<MediaController?>(null)
    private var permissionRefresh by mutableIntStateOf(0)
    private var pendingAlarm by mutableStateOf<AlarmLaunchRequest?>(null)
    private lateinit var recorder: StreamRecorder
    private val startupPermissionsLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
            permissionRefresh += 1
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        recorder = StreamRecorder(this)
        handleAlarmIntent(intent)
        requestStartupPermissions()
        StationStore.syncRemoteCatalog(this)
        val token = SessionToken(this, ComponentName(this, PlaybackService::class.java))
        controllerFuture = MediaController.Builder(this, token).buildAsync().also { future ->
            future.addListener(
                { controller = future.get() },
                MoreExecutors.directExecutor()
            )
        }

        setContent {
            var themeName by remember { mutableStateOf(loadSetting(this@MainActivity, THEME_PREF, DEFAULT_THEME)) }
            var accentName by remember { mutableStateOf(loadSetting(this@MainActivity, ACCENT_PREF, DEFAULT_ACCENT)) }
            GlzRadioTheme(themeName = themeName, accentName = accentName) {
                val activeController = controller
                if (activeController == null) {
                    LoadingApp()
                } else {
                    RadioApp(
                        player = activeController,
                        recorder = recorder,
                        themeName = themeName,
                        accentName = accentName,
                        permissionRefresh = permissionRefresh,
                        pendingAlarm = pendingAlarm,
                        onAlarmHandled = { pendingAlarm = null },
                        onTheme = {
                            themeName = it
                            saveSetting(this@MainActivity, THEME_PREF, it)
                        },
                        onAccent = {
                            accentName = it
                            saveSetting(this@MainActivity, ACCENT_PREF, it)
                        },
                        onShowMenu = { action -> handleMenuAction(action) }
                    )
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleAlarmIntent(intent)
    }

    private fun handleAlarmIntent(intent: Intent?) {
        val stationName = intent?.getStringExtra(RadioAlarm.EXTRA_ALARM_STATION) ?: return
        val fadeIn = intent.getBooleanExtra(RadioAlarm.EXTRA_ALARM_FADE, true)
        pendingAlarm = AlarmLaunchRequest(stationName = stationName, fadeIn = fadeIn)
        intent.removeExtra(RadioAlarm.EXTRA_ALARM_STATION)
    }

    override fun onDestroy() {
        super.onDestroy()
        recorder.shutdown()
        controllerFuture?.let(MediaController::releaseFuture)
        controllerFuture = null
    }

    override fun onTrimMemory(level: Int) {
        super.onTrimMemory(level)
        if (level >= ComponentCallbacks2.TRIM_MEMORY_UI_HIDDEN) {
            runCatching {
                coil.Coil.imageLoader(this).memoryCache?.clear()
            }
            RadioPlayback.trimMemory()
        }
    }

    private fun handleMenuAction(action: MenuAction) {
        if (action == MenuAction.About) showAbout()
    }

    private fun requestStartupPermissions() {
        val permissions = buildList {
            val prefs = getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
            val locationPrompted = prefs.getBoolean(LOCATION_PROMPTED_PREF, false)
            if (!locationPrompted &&
                checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED
            ) {
                add(Manifest.permission.ACCESS_COARSE_LOCATION)
                prefs.edit().putBoolean(LOCATION_PROMPTED_PREF, true).apply()
            }
            if (Build.VERSION.SDK_INT >= 33 &&
                checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
            ) {
                add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
        if (permissions.isNotEmpty()) {
            startupPermissionsLauncher.launch(permissions.toTypedArray())
        }
        requestUnrestrictedBatteryIfNeeded()
    }

    private fun requestUnrestrictedBatteryIfNeeded() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as? PowerManager ?: return
        if (!powerManager.isIgnoringBatteryOptimizations(packageName)) {
            val prefs = getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
            val batteryPrompted = prefs.getBoolean(BATTERY_PROMPTED_PREF, false)
            if (!batteryPrompted) {
                prefs.edit().putBoolean(BATTERY_PROMPTED_PREF, true).apply()
                try {
                    val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                        data = Uri.parse("package:$packageName")
                    }
                    startActivity(intent)
                } catch (_: Exception) {
                    try {
                        startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
                    } catch (_: Exception) {
                    }
                }
            }
        }
    }

    private fun showAbout() {
        val sessionId = RadioPlayback.audioSessionId
        val sessionStr = if (sessionId > 0) "$sessionId" else "Pending playback"
        val powerManager = getSystemService(Context.POWER_SERVICE) as? PowerManager
        val isBatteryUnrestricted = powerManager?.isIgnoringBatteryOptimizations(packageName) == true
        val batteryStr = if (isBatteryUnrestricted) "Unrestricted (Optimal for Android Auto)" else "Optimized (May sleep on AA)"
        val catalogSource = StationStore.catalogSourceLabel(this)
        PlatformAlertDialog.Builder(this)
            .setTitle("About Glz Radio")
            .setMessage(
                "Version ${BuildConfig.VERSION_NAME}\n\n" +
                    "Native Android radio streamer for Puerto Rico live radio.\n\n" +
                    "Catalog: $catalogSource\n" +
                    "UI: Jetpack Compose Material 3\n" +
                    "Playback: Media3 ExoPlayer + ICY Timeshift\n" +
                    "Audio Session ID: $sessionStr\n" +
                    "Battery Usage: $batteryStr"
            )
            .setPositiveButton("Done", null)
            .setNeutralButton("Battery Settings") { _, _ ->
                try {
                    startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
                } catch (_: Exception) {
                    try {
                        val appDetail = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                            data = Uri.parse("package:$packageName")
                        }
                        startActivity(appDetail)
                    } catch (_: Exception) {
                    }
                }
            }
            .show()
    }
}

private enum class MenuAction {
    Settings,
    About
}

private enum class StationHealth {
    Buffering,
    Online,
    Retrying,
    Offline
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun RadioApp(
    player: Player,
    recorder: StreamRecorder,
    themeName: String,
    accentName: String,
    permissionRefresh: Int,
    pendingAlarm: AlarmLaunchRequest?,
    onAlarmHandled: () -> Unit,
    onTheme: (String) -> Unit,
    onAccent: (String) -> Unit,
    onShowMenu: (MenuAction) -> Unit
) {
    val palette = LocalGlzPalette.current
    val context = LocalContext.current
    val activity = context as Activity
    val scope = rememberCoroutineScope()

    var stations by remember { mutableStateOf(StationStore.load(context)) }
    var catalogSource by remember { mutableStateOf(StationStore.catalogSourceLabel(context)) }
    var presets by remember { mutableStateOf(StationStore.loadPresets(context)) }
    var recentStations by remember { mutableStateOf(StationStore.getRecentStations(context)) }
    var alarmConfig by remember { mutableStateOf(RadioAlarm.load(context)) }

    var query by rememberSaveable { mutableStateOf("") }
    var filter by rememberSaveable { mutableStateOf("All") }
    var selectedCity by rememberSaveable { mutableStateOf("All Cities") }
    var current by remember { mutableStateOf(StationStore.getLastStation(context) ?: stations.firstOrNull()) }
    var expanded by rememberSaveable { mutableStateOf(false) }
    var menuOpen by rememberSaveable { mutableStateOf(false) }
    var settingsOpen by rememberSaveable { mutableStateOf(false) }
    var recordingsOpen by rememberSaveable { mutableStateOf(false) }
    var weatherOpen by rememberSaveable { mutableStateOf(false) }
    var editorOpen by rememberSaveable { mutableStateOf(false) }
    var historyOpen by rememberSaveable { mutableStateOf(false) }
    var scheduleDVROpen by rememberSaveable { mutableStateOf(false) }
    var sleepTimerSheetOpen by rememberSaveable { mutableStateOf(false) }
    var alarmSheetOpen by rememberSaveable { mutableStateOf(false) }
    var searchOpen by rememberSaveable { mutableStateOf(false) }

    var liveTrackTitle by remember { mutableStateOf<String?>(null) }
    var streamTelemetry by remember { mutableStateOf(RadioPlayback.currentTelemetry) }
    var trackHistory by remember { mutableStateOf<List<Pair<String, String>>>(emptyList()) }
    var activeScheduledInfo by remember { mutableStateOf(RecordingScheduler.activeScheduledInfo) }
    var weatherRefresh by remember { mutableIntStateOf(0) }
    var weather by remember { mutableStateOf<WeatherState>(WeatherState.Loading) }
    var isPlaying by remember { mutableStateOf(false) }
    var status by remember { mutableStateOf("Ready") }
    var recording by remember { mutableStateOf(false) }
    var favorites by remember { mutableStateOf(loadFavorites(context)) }
    var layoutMode by remember { mutableStateOf(loadSetting(context, LAYOUT_PREF, LayoutChoices.first().name)) }
    var playerSize by remember { mutableStateOf(loadSetting(context, PLAYER_SIZE_PREF, PlayerSizeChoices.first().name)) }
    var stationHealth by remember { mutableStateOf<Map<String, StationHealth>>(emptyMap()) }
    var probeResults by remember { mutableStateOf<Map<String, StreamProbeResult>>(emptyMap()) }
    var probingStreams by remember { mutableStateOf(false) }
    var pendingExport by remember { mutableStateOf<RecordingExport?>(null) }
    var retryCount by remember { mutableIntStateOf(0) }
    var reconnectEnabled by remember { mutableStateOf(false) }
    var elapsedMs by remember { mutableLongStateOf(0L) }
    var accumulatedMs by remember { mutableLongStateOf(0L) }
    var playStartedAtMs by remember { mutableLongStateOf(0L) }
    var rdsIndex by remember { mutableIntStateOf(0) }
    var intentionallyStopped by remember { mutableStateOf(false) }
    var sleepTimerMinutes by remember { mutableStateOf(SleepTimer.remainingMinutes()) }
    var sleepTimerDuration by remember { mutableStateOf(SleepTimer.durationMinutes) }
    var updateCheckRequest by remember { mutableIntStateOf(0) }
    var seekPosition by remember { mutableLongStateOf(0L) }
    var seekDuration by remember { mutableLongStateOf(0L) }
    var canSeek by remember { mutableStateOf(false) }
    var updateStatus by remember { mutableStateOf("Automatic checks every 12 hours") }
    var targetAmbientColor by remember { mutableStateOf(palette.accent) }

    val ambientColor by animateColorAsState(
        targetValue = targetAmbientColor,
        animationSpec = tween(550),
        label = "ambientGlow"
    )

    val configuration = LocalConfiguration.current
    val autoCompact = configuration.screenWidthDp < 390 || configuration.screenHeightDp < 720
    val compact = when (layoutMode) {
        "Compact" -> true
        "Comfortable", "Large" -> false
        else -> autoCompact
    }

    val cities = remember(stations) {
        listOf("All Cities") + stations.map(::stationCityName).distinct().sorted()
    }
    if (selectedCity !in cities) {
        selectedCity = "All Cities"
    }

    val visibleStations = remember(stations, query, filter, selectedCity, favorites) {
        stations.filter { station ->
            val filterMatches = filter == "All" ||
                station.band() == filter ||
                (filter == "Saved" && favorites.contains(station.name))
            val cityMatches = selectedCity == "All Cities" || stationCityName(station) == selectedCity
            filterMatches && cityMatches && station.matches(query)
        }
    }

    val locationLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) {
        weatherRefresh += 1
    }
    val exportMp3Launcher = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument(ExportFormat.Mp3.mimeType)) { uri ->
        val export = pendingExport
        pendingExport = null
        if (uri != null && export != null) exportRecordingToUri(context, export.file, uri, export.format)
    }
    val exportAacLauncher = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument(ExportFormat.Aac.mimeType)) { uri ->
        val export = pendingExport
        pendingExport = null
        if (uri != null && export != null) exportRecordingToUri(context, export.file, uri, export.format)
    }

    // Smart Back navigation: close full-screen overlays before minimizing app.
    BackHandler {
        when {
            settingsOpen -> settingsOpen = false
            weatherOpen -> weatherOpen = false
            expanded -> expanded = false
            searchOpen -> {
                searchOpen = false
                query = ""
            }
            else -> activity.moveTaskToBack(true)
        }
    }

    fun syncElapsed(playing: Boolean) {
        val now = SystemClock.elapsedRealtime()
        if (playing) {
            if (playStartedAtMs == 0L) playStartedAtMs = now
        } else if (playStartedAtMs != 0L) {
            accumulatedMs += now - playStartedAtMs
            playStartedAtMs = 0L
        }
    }

    fun setStation(station: Station, autoplay: Boolean, fadeIn: Boolean = false) {
        if (recording && current != station) {
            recorder.stop()
            recording = false
        }
        current = station
        StationStore.setLastStation(context, station)
        recentStations = StationStore.getRecentStations(context)
        Log.i("MainActivity", "Selected station ${station.name}, audioSessionId=${RadioPlayback.audioSessionId}")
        accumulatedMs = 0L
        playStartedAtMs = 0L
        elapsedMs = 0L
        rdsIndex = 0
        retryCount = 0
        reconnectEnabled = autoplay
        intentionallyStopped = false
        player.setMediaItem(RadioPlayback.stationItem(station))
        player.prepare()
        if (autoplay) {
            if (fadeIn) RadioPlayback.fadeInVolume(15_000L)
            player.play()
        }
        status = if (autoplay) "Loading ${station.name}" else "Selected ${station.name}"
    }

    fun skipStation(direction: Int) {
        val list = visibleStations.ifEmpty { stations }
        if (list.isEmpty()) return
        val idx = list.indexOfFirst { it.name == current?.name }
        val nextIdx = if (idx < 0) 0 else ((idx + direction) % list.size + list.size) % list.size
        setStation(list[nextIdx], autoplay = true)
    }

    fun togglePlayback() {
        val station = current ?: return
        intentionallyStopped = false
        if (player.mediaItemCount == 0) {
            setStation(station, true)
            return
        }
        if (player.isPlaying) {
            reconnectEnabled = false
            player.pause()
            status = "Paused"
        } else {
            reconnectEnabled = true
            player.play()
            status = "Loading ${station.name}"
        }
    }

    fun stopPlayback() {
        intentionallyStopped = true
        reconnectEnabled = false
        player.stop()
        player.clearMediaItems()
        syncElapsed(false)
        accumulatedMs = 0L
        playStartedAtMs = 0L
        elapsedMs = 0L
        status = "Stopped"
        SleepTimer.cancel()
        sleepTimerMinutes = null
        sleepTimerDuration = null
    }

    fun toggleFavorite(station: Station) {
        favorites = favorites.toMutableSet().also {
            if (it.contains(station.name)) it.remove(station.name) else it.add(station.name)
        }
        saveFavorites(context, favorites)
    }

    fun shareStation(station: Station?) {
        if (station == null) return
        val url = "https://radio.glztech.com/?station=${stationSlug(station.name)}"
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, "${station.name} · Glz Radio")
            putExtra(Intent.EXTRA_TEXT, "Listen live to ${station.name} (${station.meta()}) on Glz Radio:\n$url")
        }
        runCatching {
            context.startActivity(Intent.createChooser(shareIntent, "Share ${station.name}"))
        }
    }

    fun syncFromGlzHub(showFeedback: Boolean) {
        StationStore.syncRemoteCatalog(context) { success ->
            activity.runOnUiThread {
                stations = StationStore.load(context)
                catalogSource = StationStore.catalogSourceLabel(context)
                recentStations = StationStore.getRecentStations(context)
                if (showFeedback) {
                    Toast.makeText(
                        context,
                        if (success) "Synced ${stations.size} stations ($catalogSource)" else "Could not reach GlzHub; using cached catalog",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    fun handlePresetTap(slotIndex: Int) {
        val savedName = presets.getOrNull(slotIndex)
        val station = savedName?.let { n -> stations.firstOrNull { it.name.equals(n, true) } }
        if (station != null) {
            setStation(station, true)
        } else {
            val active = current
            if (active == null) {
                Toast.makeText(context, "Select a station first to save Preset ${slotIndex + 1}", Toast.LENGTH_SHORT).show()
            } else {
                presets = StationStore.savePreset(context, slotIndex, active.name)
                Toast.makeText(context, "Saved ${active.name} to Preset ${slotIndex + 1}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    fun handlePresetLongPress(slotIndex: Int) {
        val active = current
        val existing = presets.getOrNull(slotIndex)
        if (active == null) {
            if (existing != null) {
                presets = StationStore.savePreset(context, slotIndex, null)
                Toast.makeText(context, "Cleared Preset ${slotIndex + 1}", Toast.LENGTH_SHORT).show()
            }
            return
        }
        if (existing.equals(active.name, ignoreCase = true)) {
            presets = StationStore.savePreset(context, slotIndex, null)
            Toast.makeText(context, "Cleared Preset ${slotIndex + 1}", Toast.LENGTH_SHORT).show()
        } else {
            presets = StationStore.savePreset(context, slotIndex, active.name)
            Toast.makeText(context, "Assigned ${active.name} to Preset ${slotIndex + 1}", Toast.LENGTH_SHORT).show()
        }
    }

    fun toggleRecording() {
        val station = current ?: return
        if (recording) {
            recorder.stop()
            recording = false
            Toast.makeText(context, "Recording saved", Toast.LENGTH_SHORT).show()
            return
        }
        recorder.start(station, object : StreamRecorder.Listener {
            override fun onStarted(file: File) {
                activity.runOnUiThread {
                    recording = true
                    status = "Recording ${station.name}"
                }
            }

            override fun onStopped(file: File) {
                activity.runOnUiThread {
                    recording = false
                    status = if (player.isPlaying) "Live / ${station.name}" else "Ready"
                }
            }

            override fun onFailed(exception: Exception) {
                activity.runOnUiThread {
                    recording = false
                    status = "Recording failed"
                    Toast.makeText(context, "Could not record this stream", Toast.LENGTH_SHORT).show()
                }
            }
        })
    }

    // Extract dynamic logo ambient accent whenever the station changes.
    LaunchedEffect(current?.logoUrl, palette.accent) {
        targetAmbientColor = extractLogoAmbientColor(context, current?.logoUrl, palette.accent)
    }

    // Handle Wake-Up Radio Alarm trigger.
    LaunchedEffect(pendingAlarm, stations) {
        val alarm = pendingAlarm ?: return@LaunchedEffect
        val target = stations.firstOrNull { it.name.equals(alarm.stationName, ignoreCase = true) }
            ?: stations.firstOrNull()
        if (target != null) {
            setStation(target, autoplay = true, fadeIn = alarm.fadeIn)
            expanded = true
            Toast.makeText(context, "Good morning! Tuning ${target.name}", Toast.LENGTH_LONG).show()
        }
        onAlarmHandled()
    }

    DisposableEffect(player) {
        val listener = object : Player.Listener {
            override fun onIsPlayingChanged(nextPlaying: Boolean) {
                syncElapsed(nextPlaying)
                isPlaying = nextPlaying
                if (nextPlaying && current != null) status = "Live / ${current!!.name}"
            }

            override fun onPlaybackStateChanged(playbackState: Int) {
                status = when (playbackState) {
                    Player.STATE_BUFFERING -> {
                        current?.let { stationHealth = stationHealth + (it.name to StationHealth.Buffering) }
                        "Buffering ${current?.name.orEmpty()}"
                    }
                    Player.STATE_READY -> {
                        current?.let { stationHealth = stationHealth + (it.name to StationHealth.Online) }
                        retryCount = 0
                        reconnectEnabled = player.playWhenReady
                        if (player.isPlaying) "Live / ${current?.name.orEmpty()}" else "Ready"
                    }
                    Player.STATE_ENDED -> "Stream ended"
                    else -> status
                }
            }

            override fun onPlayerError(error: PlaybackException) {
                val station = current ?: return
                if (RadioPlayback.rewindStatus(station) == "No rewind" &&
                    player.currentMediaItem?.localConfiguration?.uri?.host != "127.0.0.1"
                ) {
                    status = "Live / ${station.name} / rewind unavailable"
                    return
                }
                if (intentionallyStopped) return
                stationHealth = stationHealth + (station.name to StationHealth.Retrying)
                reconnectEnabled = true
                retryCount += 1
                val attempt = retryCount
                val retryStation = station
                status = "Reconnecting ${station.name} / attempt $attempt"
                scope.launch {
                    delay(streamRetryDelayMs(attempt))
                    if (current?.name == retryStation.name && !intentionallyStopped && reconnectEnabled) {
                        stationHealth = stationHealth + (retryStation.name to StationHealth.Retrying)
                        status = "Reconnecting ${retryStation.name}"
                        player.setMediaItem(RadioPlayback.stationItem(retryStation))
                        player.prepare()
                        player.play()
                    }
                }
            }
        }
        player.addListener(listener)
        onDispose { player.removeListener(listener) }
    }

    LaunchedEffect(isPlaying, accumulatedMs, playStartedAtMs) {
        while (true) {
            elapsedMs = if (playStartedAtMs == 0L) {
                accumulatedMs
            } else {
                accumulatedMs + SystemClock.elapsedRealtime() - playStartedAtMs
            }
            delay(1000)
        }
    }

    LaunchedEffect(player) {
        while (true) {
            val duration = player.duration
            canSeek = player.isCurrentMediaItemSeekable && duration != C.TIME_UNSET && duration > 0
            seekDuration = if (canSeek) duration else 0L
            seekPosition = if (canSeek) player.currentPosition.coerceIn(0L, duration) else 0L
            if (canSeek) current?.let(RadioPlayback::markRewindAvailable)
            delay(500)
        }
    }

    LaunchedEffect(current, isPlaying, status) {
        while (true) {
            delay(4200)
            rdsIndex += 1
        }
    }

    LaunchedEffect(weatherRefresh, permissionRefresh) {
        weather = WeatherState.Loading
        weather = loadWeather(context)
    }

    LaunchedEffect(Unit) {
        while (true) {
            sleepTimerMinutes = SleepTimer.remainingMinutes()
            delay(1_000)
        }
    }

    DisposableEffect(Unit) {
        RadioPlayback.setTrackListener { title ->
            liveTrackTitle = title
            if (!title.isNullOrBlank()) {
                val timeStr = java.text.SimpleDateFormat("hh:mm a", Locale.US).format(java.util.Date())
                val stationName = current?.name ?: "Radio"
                trackHistory = (listOf("$timeStr ($stationName)" to title) + trackHistory).take(30)
            }
        }
        RadioPlayback.setTelemetryListener { info ->
            streamTelemetry = info
        }
        onDispose {
            RadioPlayback.setTrackListener(null)
            RadioPlayback.setTelemetryListener(null)
        }
    }

    LaunchedEffect(Unit) {
        syncFromGlzHub(showFeedback = false)
    }

    if (current != null && player.mediaItemCount == 0 && !intentionallyStopped) {
        LaunchedEffect(current) { current?.let { setStation(it, false) } }
    }

    Scaffold(
        containerColor = palette.bg,
        bottomBar = {
            AnimatedVisibility(!expanded) {
                MiniPlayerBar(
                    station = current,
                    isPlaying = isPlaying,
                    elapsed = elapsedMs,
                    liveTrackTitle = liveTrackTitle,
                    playerSize = playerSize,
                    onExpand = { expanded = true },
                    onPrev = { skipStation(-1) },
                    onPlayPause = { togglePlayback() },
                    onNext = { skipStation(1) }
                )
            }
        }
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = if (compact) 12.dp else 16.dp)
                    .padding(top = if (compact) 8.dp else 14.dp)
            ) {
                AppBar(
                    searching = searchOpen,
                    query = query,
                    weather = weather,
                    compact = compact,
                    onQueryChange = { query = it },
                    onToggleSearch = {
                        searchOpen = !searchOpen
                        if (!searchOpen) query = ""
                    },
                    onWeather = { weatherOpen = true },
                    onMenu = { menuOpen = true }
                )

                Spacer(Modifier.height(10.dp))

                // Inline Band + City Filters
                InlineFilterBar(
                    activeBand = filter,
                    savedCount = favorites.size,
                    cities = cities,
                    selectedCity = selectedCity,
                    onBand = { filter = it },
                    onCity = { selectedCity = it }
                )

                Spacer(Modifier.height(10.dp))

                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    contentPadding = PaddingValues(bottom = 16.dp)
                ) {
                    if (query.isBlank()) {
                        item(key = "presets") {
                            PresetsBar(
                                presets = presets,
                                stations = stations,
                                current = current,
                                onTapSlot = { handlePresetTap(it) },
                                onLongPressSlot = { handlePresetLongPress(it) }
                            )
                        }
                        if (recentStations.isNotEmpty() && filter == "All" && selectedCity == "All Cities") {
                            item(key = "recent") {
                                RecentlyPlayedShelf(
                                    recentStations = recentStations,
                                    current = current,
                                    onSelect = { setStation(it, true) }
                                )
                            }
                        }
                    }

                    if (visibleStations.isEmpty()) {
                        item(key = "empty") {
                            Surface(
                                color = palette.card,
                                shape = RoundedCornerShape(18.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    "No stations match your current filter.",
                                    color = palette.muted,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.padding(24.dp)
                                )
                            }
                        }
                    } else {
                        items(visibleStations, key = { it.name }) { station ->
                            StationCard(
                                station = station,
                                active = current?.name == station.name,
                                isPlaying = isPlaying && current?.name == station.name,
                                saved = favorites.contains(station.name),
                                health = stationHealth[station.name],
                                probeResult = probeResults[station.name],
                                rewindAvailable = RadioPlayback.rewindStatus(station) == "Rewind available",
                                compact = compact,
                                onClick = { setStation(station, true) },
                                onFavorite = { toggleFavorite(station) }
                            )
                        }
                    }
                }
            }

            if (expanded) {
                FullPlayer(
                    station = current,
                    stations = stations,
                    isPlaying = isPlaying,
                    elapsed = elapsedMs,
                    status = status,
                    weather = weather,
                    rds = rdsText(current, status, rdsIndex, isPlaying),
                    liveTrackTitle = liveTrackTitle,
                    telemetry = streamTelemetry,
                    ambientColor = ambientColor,
                    recording = recording,
                    saved = current?.let { favorites.contains(it.name) } == true,
                    sleepTimerMinutes = sleepTimerMinutes,
                    alarmConfig = alarmConfig,
                    compact = compact,
                    playerSize = playerSize,
                    canSeek = canSeek,
                    seekPosition = seekPosition,
                    seekDuration = seekDuration,
                    rewindStatus = current?.let(RadioPlayback::rewindStatus) ?: "Rewind not checked",
                    onSeek = { if (canSeek) player.seekTo(it.coerceIn(0L, seekDuration)) },
                    onDismiss = { expanded = false },
                    onPrev = { skipStation(-1) },
                    onPlayPause = { togglePlayback() },
                    onNext = { skipStation(1) },
                    onStop = { stopPlayback() },
                    onSelectStation = { setStation(it, true) },
                    onRecord = { toggleRecording() },
                    onScheduleDVR = { scheduleDVROpen = true },
                    onSleepTimer = { sleepTimerSheetOpen = true },
                    onAlarm = { alarmSheetOpen = true },
                    onShare = { shareStation(current) },
                    onFavorite = { current?.let { toggleFavorite(it) } }
                )
            }

            if (weatherOpen) {
                WeatherFlyout(
                    weather = weather,
                    onClose = { weatherOpen = false },
                    onRefresh = { weatherRefresh += 1 },
                    onRequestLocation = { locationLauncher.launch(Manifest.permission.ACCESS_COARSE_LOCATION) }
                )
            }

            if (settingsOpen) {
                SettingsFlyout(
                    themeName = themeName,
                    accentName = accentName,
                    layoutMode = layoutMode,
                    playerSize = playerSize,
                    compact = compact,
                    stationCount = stations.size,
                    savedCount = favorites.size,
                    catalogSource = catalogSource,
                    sleepTimerMinutes = sleepTimerMinutes,
                    sleepTimerDuration = sleepTimerDuration,
                    alarmConfig = alarmConfig,
                    updateStatus = updateStatus,
                    onClose = { settingsOpen = false },
                    onTheme = onTheme,
                    onAccent = onAccent,
                    onLayout = {
                        layoutMode = it
                        saveSetting(context, LAYOUT_PREF, it)
                    },
                    onPlayerSize = {
                        playerSize = it
                        saveSetting(context, PLAYER_SIZE_PREF, it)
                    },
                    onSleepTimer = { minutes ->
                        if (minutes == null) {
                            SleepTimer.cancel()
                        } else {
                            SleepTimer.schedule(player, minutes)
                        }
                        sleepTimerMinutes = SleepTimer.remainingMinutes()
                        sleepTimerDuration = SleepTimer.durationMinutes
                    },
                    onOpenAlarm = { alarmSheetOpen = true },
                    onSyncGlzHub = { syncFromGlzHub(showFeedback = true) },
                    onCheckForUpdates = { updateCheckRequest += 1 }
                )
            }
        }
    }

    if (sleepTimerSheetOpen) {
        ModalBottomSheet(
            onDismissRequest = { sleepTimerSheetOpen = false },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
            containerColor = palette.surface
        ) {
            SleepTimerQuickSheet(
                sleepTimerMinutes = sleepTimerMinutes,
                sleepTimerDuration = sleepTimerDuration,
                onSelect = { minutes ->
                    if (minutes == null) {
                        SleepTimer.cancel()
                        Toast.makeText(context, "Sleep timer turned off", Toast.LENGTH_SHORT).show()
                    } else {
                        SleepTimer.schedule(player, minutes)
                        Toast.makeText(context, "Sleep timer set for $minutes min", Toast.LENGTH_SHORT).show()
                    }
                    sleepTimerMinutes = SleepTimer.remainingMinutes()
                    sleepTimerDuration = SleepTimer.durationMinutes
                    sleepTimerSheetOpen = false
                }
            )
        }
    }

    if (alarmSheetOpen) {
        ModalBottomSheet(
            onDismissRequest = { alarmSheetOpen = false },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
            containerColor = palette.surface
        ) {
            WakeUpAlarmSheet(
                config = alarmConfig,
                stations = stations,
                currentStation = current,
                onSave = { next ->
                    RadioAlarm.saveAndSchedule(context, next)
                    alarmConfig = next
                    alarmSheetOpen = false
                    Toast.makeText(
                        context,
                        "Wake-Up Alarm set for ${next.formattedTime()} (${next.stationName ?: "Glz Radio"})",
                        Toast.LENGTH_LONG
                    ).show()
                },
                onCancelAlarm = {
                    RadioAlarm.cancelAlarm(context)
                    alarmConfig = RadioAlarm.load(context)
                    alarmSheetOpen = false
                    Toast.makeText(context, "Wake-Up Alarm turned off", Toast.LENGTH_SHORT).show()
                }
            )
        }
    }

    if (menuOpen) {
        ModalBottomSheet(
            onDismissRequest = { menuOpen = false },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
            containerColor = palette.surface
        ) {
            MenuSheet(
                alarmConfig = alarmConfig,
                sleepTimerMinutes = sleepTimerMinutes,
                catalogSource = catalogSource,
                onSettings = { menuOpen = false; settingsOpen = true },
                onWakeAlarm = { menuOpen = false; alarmSheetOpen = true },
                onSleepTimer = { menuOpen = false; sleepTimerSheetOpen = true },
                onRecordings = { menuOpen = false; recordingsOpen = true },
                onTrackHistory = { menuOpen = false; historyOpen = true },
                onScheduleDVR = { menuOpen = false; scheduleDVROpen = true },
                onWeather = { menuOpen = false; weatherOpen = true },
                onStationEditor = { menuOpen = false; editorOpen = true },
                onSyncGlzHub = { menuOpen = false; syncFromGlzHub(showFeedback = true) },
                onStop = { menuOpen = false; stopPlayback() },
                onClearSaved = {
                    menuOpen = false
                    favorites = emptySet()
                    saveFavorites(context, favorites)
                },
                onAbout = { menuOpen = false; onShowMenu(MenuAction.About) }
            )
        }
    }

    if (editorOpen) {
        ModalBottomSheet(
            onDismissRequest = { editorOpen = false },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
            containerColor = palette.surface
        ) {
            StationEditorSheet(
                stations = stations,
                catalogSource = catalogSource,
                probeResults = probeResults,
                probing = probingStreams,
                onSyncGlzHub = { syncFromGlzHub(showFeedback = true) },
                onTestAllStreams = {
                    if (!probingStreams) {
                        probingStreams = true
                        Toast.makeText(context, "Testing ${stations.size} streams…", Toast.LENGTH_SHORT).show()
                        scope.launch {
                            StreamHealthChecker.probeAll(stations) { result ->
                                probeResults = probeResults + (result.stationName to result)
                            }
                            probingStreams = false
                            Toast.makeText(context, "Stream health check finished", Toast.LENGTH_SHORT).show()
                        }
                    }
                },
                onSave = { originalName, station ->
                    StationStore.saveCustomOrEdit(context, originalName, station)
                    stations = StationStore.load(context)
                    if (current?.name == originalName || current == null) {
                        current = station
                        if (player.mediaItemCount > 0) {
                            player.setMediaItem(RadioPlayback.stationItem(station))
                            player.prepare()
                            if (isPlaying) player.play()
                        }
                    }
                    Toast.makeText(context, "Saved safely (preserved across GlzHub syncs)", Toast.LENGTH_SHORT).show()
                },
                onDelete = { station ->
                    if (stations.size <= 1) {
                        Toast.makeText(context, "Keep at least one station", Toast.LENGTH_SHORT).show()
                    } else {
                        StationStore.deleteStation(context, station)
                        stations = StationStore.load(context)
                        favorites = favorites - station.name
                        saveFavorites(context, favorites)
                        if (current?.name == station.name) {
                            stopPlayback()
                            current = stations.firstOrNull()
                        }
                        Toast.makeText(context, "Station removed", Toast.LENGTH_SHORT).show()
                    }
                },
                onRestoreDefaults = {
                    stations = StationStore.reset(context)
                    favorites = favorites.filter { saved -> stations.any { it.name == saved } }.toSet()
                    saveFavorites(context, favorites)
                    current = stations.firstOrNull()
                    stopPlayback()
                    syncFromGlzHub(showFeedback = false)
                    Toast.makeText(context, "Default stations restored", Toast.LENGTH_SHORT).show()
                }
            )
        }
    }

    if (recordingsOpen) {
        var recordings by remember { mutableStateOf(listRecordings(context)) }
        ModalBottomSheet(
            onDismissRequest = { recordingsOpen = false },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
            containerColor = palette.surface
        ) {
            RecordingsSheet(
                recordings = recordings,
                onPlay = { file ->
                    player.setMediaItem(MediaItem.fromUri(file.toURI().toString()))
                    player.prepare()
                    player.play()
                    current = null
                    accumulatedMs = 0L
                    playStartedAtMs = SystemClock.elapsedRealtime()
                    elapsedMs = 0L
                    status = "Playing recording"
                    recordingsOpen = false
                },
                onDelete = { file ->
                    file.delete()
                    recordings = listRecordings(context)
                },
                onExport = { file, format ->
                    pendingExport = RecordingExport(file, format)
                    val name = exportFileName(file, format)
                    when (format) {
                        ExportFormat.Mp3 -> exportMp3Launcher.launch(name)
                        ExportFormat.Aac -> exportAacLauncher.launch(name)
                    }
                },
                onShare = { file, format -> shareRecording(context, file, format) }
            )
        }
    }

    if (historyOpen) {
        ModalBottomSheet(
            onDismissRequest = { historyOpen = false },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
            containerColor = palette.surface
        ) {
            TrackHistorySheet(
                history = trackHistory,
                onClear = { trackHistory = emptyList() }
            )
        }
    }

    if (scheduleDVROpen) {
        ModalBottomSheet(
            onDismissRequest = { scheduleDVROpen = false },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
            containerColor = palette.surface
        ) {
            ScheduleDVRSheet(
                station = current,
                activeInfo = activeScheduledInfo,
                onSchedule = { delayMin, durationMin ->
                    val stationToRecord = current ?: return@ScheduleDVRSheet
                    RecordingScheduler.scheduleRecording(
                        context = context,
                        station = stationToRecord,
                        delayMinutes = delayMin,
                        durationMinutes = durationMin,
                        streamRecorder = recorder,
                        listener = object : StreamRecorder.Listener {
                            override fun onStarted(file: File) {
                                activity.runOnUiThread {
                                    recording = true
                                    status = "DVR Recording ${stationToRecord.name}"
                                    activeScheduledInfo = RecordingScheduler.activeScheduledInfo
                                }
                            }

                            override fun onStopped(file: File) {
                                activity.runOnUiThread {
                                    recording = false
                                    status = if (player.isPlaying) "Live / ${stationToRecord.name}" else "Ready"
                                    activeScheduledInfo = null
                                    Toast.makeText(context, "DVR Recording saved!", Toast.LENGTH_SHORT).show()
                                }
                            }

                            override fun onFailed(exception: Exception) {
                                activity.runOnUiThread {
                                    recording = false
                                    status = "DVR Recording failed"
                                    activeScheduledInfo = null
                                }
                            }
                        }
                    )
                    activeScheduledInfo = RecordingScheduler.activeScheduledInfo
                    scheduleDVROpen = false
                    Toast.makeText(context, "DVR Recording scheduled!", Toast.LENGTH_SHORT).show()
                },
                onCancel = {
                    RecordingScheduler.cancel()
                    activeScheduledInfo = null
                    scheduleDVROpen = false
                    Toast.makeText(context, "Scheduled DVR cancelled", Toast.LENGTH_SHORT).show()
                }
            )
        }
    }

    AppUpdateController(
        activity = activity,
        manualCheckRequest = updateCheckRequest,
        onStatus = { updateStatus = it }
    )
}

@Composable
private fun AppBar(
    searching: Boolean,
    query: String,
    weather: WeatherState,
    compact: Boolean,
    onQueryChange: (String) -> Unit,
    onToggleSearch: () -> Unit,
    onWeather: () -> Unit,
    onMenu: () -> Unit
) {
    val palette = LocalGlzPalette.current
    Column {
        Image(
            painter = painterResource(R.drawable.header_banner),
            contentDescription = "Glz Radio",
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .fillMaxWidth()
                .height(if (compact) 86.dp else 108.dp)
                .clip(RoundedCornerShape(20.dp))
                .border(1.dp, palette.stroke, RoundedCornerShape(20.dp))
        )
        Spacer(Modifier.height(8.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            HeaderClock()
            Spacer(Modifier.width(10.dp))
            MiniWeatherChip(
                weather = weather,
                onClick = onWeather,
                modifier = Modifier.weight(1f)
            )
            IconButton(onClick = onToggleSearch) {
                Icon(
                    imageVector = if (searching) Icons.Filled.Close else Icons.Filled.Search,
                    contentDescription = if (searching) "Close search" else "Search",
                    tint = palette.accent
                )
            }
            IconButton(onClick = onMenu) {
                Icon(
                    imageVector = Icons.Filled.Menu,
                    contentDescription = "Menu",
                    tint = palette.accent
                )
            }
        }
        AnimatedVisibility(searching) {
            OutlinedTextField(
                value = query,
                onValueChange = onQueryChange,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp),
                singleLine = true,
                placeholder = { Text("Search stations, dial, or city") },
                shape = RoundedCornerShape(16.dp)
            )
        }
    }
}

@Composable
private fun InlineFilterBar(
    activeBand: String,
    savedCount: Int,
    cities: List<String>,
    selectedCity: String,
    onBand: (String) -> Unit,
    onCity: (String) -> Unit
) {
    val palette = LocalGlzPalette.current
    var cityMenuExpanded by remember { mutableStateOf(false) }

    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(listOf("All", "Saved", "FM", "AM", "Satellite")) { band ->
                val label = if (band == "Saved" && savedCount > 0) "Saved ($savedCount)" else band
                FilterChip(
                    selected = activeBand == band,
                    onClick = { onBand(band) },
                    label = { Text(label, fontSize = 12.sp) }
                )
            }
        }

        Box {
            Surface(
                color = if (selectedCity != "All Cities") palette.accent.copy(alpha = 0.16f) else palette.field,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .height(34.dp)
                    .border(
                        1.dp,
                        if (selectedCity != "All Cities") palette.accent else palette.stroke,
                        RoundedCornerShape(12.dp)
                    )
                    .clip(RoundedCornerShape(12.dp))
                    .clickable { cityMenuExpanded = true }
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 9.dp)
                ) {
                    Icon(
                        Icons.Filled.LocationCity,
                        contentDescription = null,
                        tint = if (selectedCity != "All Cities") palette.accent else palette.muted,
                        modifier = Modifier.size(15.dp)
                    )
                    Spacer(Modifier.width(4.dp))
                    Text(
                        if (selectedCity == "All Cities") "City" else selectedCity,
                        color = palette.ink,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1
                    )
                    Icon(
                        Icons.Filled.KeyboardArrowDown,
                        contentDescription = null,
                        tint = palette.muted,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
            DropdownMenu(
                expanded = cityMenuExpanded,
                onDismissRequest = { cityMenuExpanded = false }
            ) {
                cities.forEach { city ->
                    DropdownMenuItem(
                        text = {
                            Text(
                                city,
                                fontWeight = if (city == selectedCity) FontWeight.Bold else FontWeight.Normal,
                                color = if (city == selectedCity) palette.accent else palette.ink
                            )
                        },
                        onClick = {
                            onCity(city)
                            cityMenuExpanded = false
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun HeaderClock() {
    val palette = LocalGlzPalette.current
    var clock by remember { mutableStateOf(formatHeaderClock()) }
    LaunchedEffect(Unit) {
        while (true) {
            clock = formatHeaderClock()
            delay(1000)
        }
    }
    Text(
        text = clock,
        color = palette.ink,
        fontWeight = FontWeight.Bold,
        fontSize = 17.sp,
        maxLines = 1
    )
}

@Composable
private fun LoadingApp() {
    val palette = LocalGlzPalette.current
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(palette.bg),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Image(
                painter = painterResource(R.drawable.app_icon),
                contentDescription = "Glz Radio",
                modifier = Modifier.size(72.dp).clip(RoundedCornerShape(18.dp))
            )
            Text("Glz Radio", color = palette.ink, fontWeight = FontWeight.Bold, fontSize = 20.sp)
        }
    }
}

@Composable
private fun StationCard(
    station: Station,
    active: Boolean,
    isPlaying: Boolean,
    saved: Boolean,
    health: StationHealth?,
    probeResult: StreamProbeResult?,
    rewindAvailable: Boolean,
    compact: Boolean,
    onClick: () -> Unit,
    onFavorite: () -> Unit
) {
    val palette = LocalGlzPalette.current
    val logoSize = if (compact) 48 else 56

    ElevatedCard(
        onClick = onClick,
        colors = CardDefaults.elevatedCardColors(
            containerColor = if (active) palette.accent.copy(alpha = 0.11f) else palette.card
        ),
        elevation = CardDefaults.elevatedCardElevation(
            defaultElevation = if (active) 5.dp else 1.dp,
            pressedElevation = 0.dp
        ),
        modifier = Modifier
            .fillMaxWidth()
            .border(
                width = if (active) 1.5.dp else 1.dp,
                color = if (active) palette.accent else palette.stroke.copy(alpha = 0.7f),
                shape = RoundedCornerShape(18.dp)
            )
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(if (compact) 10.dp else 12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(logoSize.dp)
                    .clip(RoundedCornerShape(14.dp))
            ) {
                StationLogo(station.logoUrl, logoSize)
                if (isPlaying) {
                    ActiveEqualizerOverlay(modifier = Modifier.fillMaxSize())
                }
            }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        station.name,
                        color = palette.ink,
                        fontWeight = FontWeight.Bold,
                        fontSize = if (compact) 15.sp else 16.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f, fill = false)
                    )
                    if (rewindAvailable && active) {
                        Surface(
                            color = palette.accent.copy(alpha = 0.18f),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                "REW",
                                color = palette.accent,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                            )
                        }
                    }
                    if (probeResult != null) {
                        Box(
                            modifier = Modifier
                                .size(7.dp)
                                .clip(CircleShape)
                                .background(if (probeResult.online) palette.ok else palette.coral)
                        )
                    }
                }
                val statusTag = when (health) {
                    StationHealth.Buffering -> " · Buffering"
                    StationHealth.Retrying -> " · Reconnecting"
                    StationHealth.Offline -> " · Offline"
                    else -> ""
                }
                Text(
                    "${station.meta()}$statusTag",
                    color = when (health) {
                        StationHealth.Retrying -> palette.gold
                        StationHealth.Offline -> palette.coral
                        else -> palette.accent
                    },
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    listOfNotNull(
                        station.location?.takeIf { it.isNotBlank() },
                        station.tagline?.takeIf { it.isNotBlank() && !it.equals(station.name, true) }
                    ).joinToString(" · ").ifBlank { station.band() },
                    color = palette.muted,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    fontSize = 12.sp
                )
            }
            IconButton(onClick = onFavorite) {
                Icon(
                    imageVector = if (saved) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                    contentDescription = if (saved) "Remove favorite" else "Save favorite",
                    tint = if (saved) palette.accent else palette.muted
                )
            }
        }
    }
}

@Composable
private fun MiniPlayerBar(
    station: Station?,
    isPlaying: Boolean,
    elapsed: Long,
    liveTrackTitle: String?,
    playerSize: String,
    onExpand: () -> Unit,
    onPrev: () -> Unit,
    onPlayPause: () -> Unit,
    onNext: () -> Unit
) {
    val palette = LocalGlzPalette.current
    val heightDp = when (playerSize) {
        "Compact" -> 68.dp
        "Expanded" -> 86.dp
        else -> 76.dp
    }
    val logoSize = if (playerSize == "Compact") 44 else 50

    Surface(
        color = palette.surface,
        tonalElevation = 6.dp,
        shadowElevation = 12.dp,
        shape = RoundedCornerShape(22.dp),
        modifier = Modifier
            .padding(horizontal = 12.dp, vertical = 10.dp)
            .height(heightDp)
            .fillMaxWidth()
            .clickable(onClick = onExpand)
            .border(1.dp, palette.accent.copy(alpha = 0.7f), RoundedCornerShape(22.dp))
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 10.dp)
        ) {
            StationLogo(station?.logoUrl, logoSize)
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    station?.name ?: "Choose a station",
                    color = palette.ink,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        liveTrackTitle?.takeIf { it.isNotBlank() } ?: (station?.meta() ?: "Ready"),
                        color = if (!liveTrackTitle.isNullOrBlank()) palette.accent else palette.muted,
                        fontSize = 12.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(Modifier.width(6.dp))
                    Text(formatElapsed(elapsed), color = palette.muted, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                }
            }
            if (playerSize != "Compact") {
                IconButton(onClick = onPrev, modifier = Modifier.size(36.dp)) {
                    Icon(Icons.Filled.SkipPrevious, contentDescription = "Previous station", tint = palette.ink)
                }
            }
            FilledIconButton(
                onClick = onPlayPause,
                colors = IconButtonDefaults.filledIconButtonColors(
                    containerColor = palette.accent,
                    contentColor = palette.onAccent
                ),
                modifier = Modifier.size(42.dp)
            ) {
                Icon(
                    imageVector = if (isPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                    contentDescription = if (isPlaying) "Pause" else "Play"
                )
            }
            IconButton(onClick = onNext, modifier = Modifier.size(36.dp)) {
                Icon(Icons.Filled.SkipNext, contentDescription = "Next station", tint = palette.ink)
            }
        }
    }
}

@Composable
private fun FullPlayer(
    station: Station?,
    stations: List<Station>,
    isPlaying: Boolean,
    elapsed: Long,
    status: String,
    weather: WeatherState,
    rds: String,
    liveTrackTitle: String?,
    telemetry: StreamTelemetry,
    ambientColor: Color,
    recording: Boolean,
    saved: Boolean,
    sleepTimerMinutes: Int?,
    alarmConfig: WakeUpAlarmConfig,
    compact: Boolean,
    playerSize: String,
    canSeek: Boolean,
    seekPosition: Long,
    seekDuration: Long,
    rewindStatus: String,
    onSeek: (Long) -> Unit,
    onDismiss: () -> Unit,
    onPrev: () -> Unit,
    onPlayPause: () -> Unit,
    onNext: () -> Unit,
    onStop: () -> Unit,
    onSelectStation: (Station) -> Unit,
    onRecord: () -> Unit,
    onScheduleDVR: () -> Unit,
    onSleepTimer: () -> Unit,
    onAlarm: () -> Unit,
    onShare: () -> Unit,
    onFavorite: () -> Unit
) {
    val palette = LocalGlzPalette.current
    val artSize = when (playerSize) {
        "Compact" -> 136
        "Expanded" -> if (compact) 196 else 236
        else -> if (compact) 160 else 196
    }

    val backdropBrush = Brush.verticalGradient(
        colors = listOf(
            ambientColor.copy(alpha = if (palette.isLight) 0.16f else 0.24f),
            palette.bg,
            palette.bg
        )
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backdropBrush)
            .padding(horizontal = if (compact) 16.dp else 20.dp, vertical = 14.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                TextButton(onClick = onDismiss) {
                    Icon(Icons.Filled.KeyboardArrowDown, contentDescription = null, modifier = Modifier.size(22.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("Back")
                }
                Text(
                    "Studio Player",
                    color = palette.muted,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(1f)
                )
                IconButton(onClick = onShare) {
                    Icon(Icons.Filled.Share, contentDescription = "Share station", tint = palette.ink)
                }
                IconButton(onClick = onFavorite) {
                    Icon(
                        imageVector = if (saved) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                        contentDescription = if (saved) "Remove favorite" else "Save favorite",
                        tint = if (saved) palette.accent else palette.ink
                    )
                }
            }

            Spacer(Modifier.height(if (playerSize == "Compact") 10.dp else 18.dp))
            StationLogo(station?.logoUrl, artSize)
            Spacer(Modifier.height(14.dp))

            Text(
                station?.name ?: "Choose a station",
                color = palette.ink,
                fontWeight = FontWeight.Bold,
                fontSize = if (compact) 26.sp else 30.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                station?.let { "${it.meta()} · ${it.location}" } ?: "Ready",
                color = palette.muted,
                fontSize = 13.sp,
                textAlign = TextAlign.Center
            )

            // Telemetry badges
            val telemetryParts = buildList {
                telemetry.codec?.let { add(it) }
                telemetry.bitrateKbps?.takeIf { it > 0 }?.let { add("$it kbps") }
                if (canSeek) add("Rewind ready")
            }
            if (telemetryParts.isNotEmpty()) {
                Spacer(Modifier.height(8.dp))
                Surface(
                    color = palette.field,
                    shape = RoundedCornerShape(50),
                    modifier = Modifier.border(1.dp, palette.stroke, RoundedCornerShape(50))
                ) {
                    Text(
                        telemetryParts.joinToString(" · "),
                        color = palette.accent,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(Modifier.height(12.dp))
            LiveCounter(elapsed = elapsed, isPlaying = isPlaying)
            Spacer(Modifier.height(12.dp))

            LiveSpectrumVisualizer(isPlaying = isPlaying, ambientColor = ambientColor)

            if (playerSize != "Compact") {
                Spacer(Modifier.height(10.dp))
                AnalogFrequencyDial(
                    stations = stations,
                    current = station,
                    onSelect = onSelectStation
                )
            }

            Spacer(Modifier.height(10.dp))
            Surface(
                color = palette.card,
                shape = RoundedCornerShape(18.dp),
                modifier = Modifier.fillMaxWidth().border(1.dp, palette.stroke.copy(alpha = 0.65f), RoundedCornerShape(18.dp))
            ) {
                Column(Modifier.padding(14.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    if (!liveTrackTitle.isNullOrBlank()) {
                        Text(
                            liveTrackTitle,
                            color = palette.accent,
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center,
                            fontSize = 15.sp,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )
                        Spacer(Modifier.height(4.dp))
                    }
                    Text(rds, color = palette.ink, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center, fontSize = 13.sp)
                    Spacer(Modifier.height(4.dp))
                    Text(weatherDashboardText(weather), color = palette.muted, textAlign = TextAlign.Center, fontSize = 12.sp)
                }
            }

            if (canSeek) {
                Spacer(Modifier.height(6.dp))
                Slider(
                    value = seekPosition.toFloat().coerceIn(0f, seekDuration.toFloat()),
                    onValueChange = { onSeek(it.toLong()) },
                    valueRange = 0f..seekDuration.toFloat(),
                    modifier = Modifier.fillMaxWidth()
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    TextButton(onClick = { onSeek(seekPosition - 30_000L) }) { Text("−30s") }
                    TextButton(onClick = { onSeek(seekPosition + 15_000L) }) { Text("+15s") }
                    TextButton(onClick = { onSeek(seekDuration) }, enabled = seekDuration - seekPosition >= 2_000L) {
                        Text("● LIVE")
                    }
                }
                Text(
                    if (seekDuration - seekPosition < 2_000L) "At live edge" else "${(seekDuration - seekPosition) / 1000}s behind live",
                    color = palette.muted,
                    fontSize = 12.sp
                )
            } else if (rewindStatus == "No rewind") {
                Text(
                    "Live rewind unavailable for this station",
                    color = palette.muted,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            Text(status, color = palette.muted, fontWeight = FontWeight.Bold, fontSize = 12.sp, modifier = Modifier.padding(top = 10.dp))
            Spacer(Modifier.height(12.dp))

            // Primary Transport Row (Prev · Play/Pause · Next · Stop)
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                FilledIconButton(
                    onClick = onPrev,
                    colors = IconButtonDefaults.filledIconButtonColors(containerColor = palette.card, contentColor = palette.ink),
                    modifier = Modifier.size(50.dp)
                ) {
                    Icon(Icons.Filled.SkipPrevious, contentDescription = "Previous station")
                }
                FilledIconButton(
                    onClick = onPlayPause,
                    colors = IconButtonDefaults.filledIconButtonColors(
                        containerColor = palette.accent,
                        contentColor = palette.onAccent
                    ),
                    modifier = Modifier.size(66.dp)
                ) {
                    Icon(
                        imageVector = if (isPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                        contentDescription = if (isPlaying) "Pause" else "Play",
                        modifier = Modifier.size(34.dp)
                    )
                }
                FilledIconButton(
                    onClick = onNext,
                    colors = IconButtonDefaults.filledIconButtonColors(containerColor = palette.card, contentColor = palette.ink),
                    modifier = Modifier.size(50.dp)
                ) {
                    Icon(Icons.Filled.SkipNext, contentDescription = "Next station")
                }
                FilledIconButton(
                    onClick = onStop,
                    colors = IconButtonDefaults.filledIconButtonColors(containerColor = palette.card, contentColor = palette.coral),
                    modifier = Modifier.size(50.dp)
                ) {
                    Icon(Icons.Filled.Stop, contentDescription = "Stop")
                }
            }

            Spacer(Modifier.height(14.dp))

            // Utility Row: Sleep Timer + Wake Alarm
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                FilledTonalButton(
                    onClick = onSleepTimer,
                    colors = ButtonDefaults.filledTonalButtonColors(
                        containerColor = if (sleepTimerMinutes != null) palette.accent.copy(alpha = 0.22f) else palette.card,
                        contentColor = if (sleepTimerMinutes != null) palette.accent else palette.ink
                    ),
                    modifier = Modifier.weight(1f).height(46.dp)
                ) {
                    Icon(Icons.Filled.Bedtime, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text(sleepTimerMinutes?.let { "Sleep ${it}m" } ?: "Sleep Timer", maxLines = 1)
                }
                FilledTonalButton(
                    onClick = onAlarm,
                    colors = ButtonDefaults.filledTonalButtonColors(
                        containerColor = if (alarmConfig.enabled) palette.accent.copy(alpha = 0.22f) else palette.card,
                        contentColor = if (alarmConfig.enabled) palette.accent else palette.ink
                    ),
                    modifier = Modifier.weight(1f).height(46.dp)
                ) {
                    Icon(Icons.Filled.Alarm, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text(if (alarmConfig.enabled) alarmConfig.formattedTime() else "Wake Alarm", maxLines = 1)
                }
            }

            Spacer(Modifier.height(10.dp))

            // Recording Row: Record Now + Schedule DVR
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                FilledTonalButton(
                    onClick = onRecord,
                    colors = ButtonDefaults.filledTonalButtonColors(
                        containerColor = if (recording) palette.gold else palette.coral,
                        contentColor = Color.White
                    ),
                    modifier = Modifier.weight(1f).height(46.dp)
                ) {
                    Icon(Icons.Filled.FiberManualRecord, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text(if (recording) "Stop Rec" else "Record")
                }
                FilledTonalButton(
                    onClick = onScheduleDVR,
                    colors = ButtonDefaults.filledTonalButtonColors(containerColor = palette.card, contentColor = palette.ink),
                    modifier = Modifier.weight(1f).height(46.dp)
                ) {
                    Icon(Icons.Filled.Schedule, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Schedule DVR")
                }
            }
        }
    }
}

@Composable
private fun LiveCounter(elapsed: Long, isPlaying: Boolean) {
    val palette = LocalGlzPalette.current
    val transition = rememberInfiniteTransition(label = "livePulse")
    val alpha by transition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(900), RepeatMode.Reverse),
        label = "liveAlpha"
    )
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .graphicsLayer { this.alpha = if (isPlaying) alpha else 0.35f }
                .background(if (isPlaying) palette.accent else palette.muted, CircleShape)
        )
        Spacer(Modifier.width(10.dp))
        Text(formatElapsed(elapsed), color = palette.accent, fontSize = 36.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun StationLogo(url: String?, sizeDp: Int) {
    val palette = LocalGlzPalette.current
    val corner = if (sizeDp > 100) 26.dp else 14.dp
    AsyncImage(
        model = url ?: R.drawable.app_icon,
        contentDescription = null,
        contentScale = ContentScale.Fit,
        modifier = Modifier
            .size(sizeDp.dp)
            .clip(RoundedCornerShape(corner))
            .background(Color.White)
            .padding(if (sizeDp > 100) 10.dp else 4.dp)
            .border(0.5.dp, palette.stroke.copy(alpha = 0.35f), RoundedCornerShape(corner))
    )
}

@Composable
private fun SleepTimerQuickSheet(
    sleepTimerMinutes: Int?,
    sleepTimerDuration: Int?,
    onSelect: (Int?) -> Unit
) {
    val palette = LocalGlzPalette.current
    Column(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp).padding(bottom = 28.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Sleep Timer", color = palette.ink, fontWeight = FontWeight.Bold, fontSize = 22.sp)
        Text(
            sleepTimerMinutes?.let { "About $it minutes remaining" } ?: "Stop playback automatically after a set time.",
            color = palette.muted,
            fontSize = 13.sp
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            listOf(15, 30, 45, 60).forEach { mins ->
                val selected = sleepTimerDuration == mins
                FilledTonalButton(
                    onClick = { onSelect(mins) },
                    colors = ButtonDefaults.filledTonalButtonColors(
                        containerColor = if (selected) palette.accent else palette.card,
                        contentColor = if (selected) palette.onAccent else palette.ink
                    ),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("${mins}m", fontWeight = FontWeight.Bold)
                }
            }
        }
        if (sleepTimerMinutes != null) {
            TextButton(onClick = { onSelect(null) }, modifier = Modifier.fillMaxWidth()) {
                Text("Turn off sleep timer", color = palette.coral, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun MenuSheet(
    alarmConfig: WakeUpAlarmConfig,
    sleepTimerMinutes: Int?,
    catalogSource: String,
    onSettings: () -> Unit,
    onWakeAlarm: () -> Unit,
    onSleepTimer: () -> Unit,
    onRecordings: () -> Unit,
    onTrackHistory: () -> Unit,
    onScheduleDVR: () -> Unit,
    onWeather: () -> Unit,
    onStationEditor: () -> Unit,
    onSyncGlzHub: () -> Unit,
    onStop: () -> Unit,
    onClearSaved: () -> Unit,
    onAbout: () -> Unit
) {
    val palette = LocalGlzPalette.current
    Column(
        modifier = Modifier
            .padding(horizontal = 20.dp)
            .padding(bottom = 24.dp)
            .fillMaxWidth()
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text("Glz Radio", color = palette.ink, fontWeight = FontWeight.Bold, fontSize = 24.sp)
        Text("v${BuildConfig.VERSION_NAME} · $catalogSource", color = palette.muted, fontSize = 12.sp)
        Spacer(Modifier.height(4.dp))

        MenuRowButton(Icons.Filled.Settings, "Appearance & Settings", onSettings)
        MenuRowButton(
            Icons.Filled.Alarm,
            if (alarmConfig.enabled) "Wake-Up Alarm (${alarmConfig.formattedTime()})" else "Wake-Up Radio Alarm",
            onWakeAlarm
        )
        MenuRowButton(
            Icons.Filled.Bedtime,
            sleepTimerMinutes?.let { "Sleep Timer (${it}m left)" } ?: "Sleep Timer",
            onSleepTimer
        )
        MenuRowButton(Icons.Filled.Radio, "Station Editor & Health Check", onStationEditor)
        MenuRowButton(Icons.Filled.Refresh, "Sync Stations from GlzHub", onSyncGlzHub)
        MenuRowButton(Icons.Filled.FiberManualRecord, "Recordings", onRecordings)
        MenuRowButton(Icons.Filled.History, "Live Track History", onTrackHistory)
        MenuRowButton(Icons.Filled.Schedule, "Schedule DVR Recording", onScheduleDVR)
        MenuRowButton(Icons.Filled.Cloud, "Weather Forecast", onWeather)
        MenuRowButton(Icons.Filled.Stop, "Stop Playback", onStop)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            TextButton(onClick = onClearSaved, modifier = Modifier.weight(1f)) {
                Text("Clear Saved", color = palette.coral)
            }
            TextButton(onClick = onAbout, modifier = Modifier.weight(1f)) {
                Icon(Icons.Filled.Info, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text("About")
            }
        }
    }
}

@Composable
private fun MenuRowButton(icon: ImageVector, label: String, onClick: () -> Unit) {
    val palette = LocalGlzPalette.current
    FilledTonalButton(
        onClick = onClick,
        colors = ButtonDefaults.filledTonalButtonColors(containerColor = palette.card, contentColor = palette.ink),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Icon(icon, contentDescription = null, tint = palette.accent, modifier = Modifier.size(19.dp))
        Spacer(Modifier.width(12.dp))
        Text(label, modifier = Modifier.weight(1f), fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun SettingsFlyout(
    themeName: String,
    accentName: String,
    layoutMode: String,
    playerSize: String,
    compact: Boolean,
    stationCount: Int,
    savedCount: Int,
    catalogSource: String,
    sleepTimerMinutes: Int?,
    sleepTimerDuration: Int?,
    alarmConfig: WakeUpAlarmConfig,
    updateStatus: String,
    onClose: () -> Unit,
    onTheme: (String) -> Unit,
    onAccent: (String) -> Unit,
    onLayout: (String) -> Unit,
    onPlayerSize: (String) -> Unit,
    onSleepTimer: (Int?) -> Unit,
    onOpenAlarm: () -> Unit,
    onSyncGlzHub: () -> Unit,
    onCheckForUpdates: () -> Unit
) {
    val palette = LocalGlzPalette.current
    Surface(color = palette.bg, modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 18.dp, vertical = 14.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                TextButton(onClick = onClose) {
                    Icon(Icons.Filled.Close, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Close")
                }
                Text(
                    "Settings",
                    color = palette.ink,
                    fontWeight = FontWeight.Bold,
                    fontSize = 22.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(1f)
                )
                Spacer(Modifier.width(64.dp))
            }
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(bottom = 28.dp)
            ) {
                item {
                    SettingsSummaryCard(themeName, accentName, layoutMode, playerSize, compact)
                }
                item {
                    SettingsChoiceSection("Theme", "Studio presets for day and night listening", ThemeChoices, themeName, onTheme)
                }
                item {
                    SettingsChoiceSection("Accent", "Signal color used by controls and highlights", AccentChoices, accentName, onAccent)
                }
                item {
                    SettingsChoiceSection("Layout", "Controls station card density", LayoutChoices, layoutMode, onLayout)
                }
                item {
                    SettingsChoiceSection("Player", "Controls Studio Player artwork, dial, and mini bar size", PlayerSizeChoices, playerSize, onPlayerSize)
                }
                item {
                    SettingsChoiceSection(
                        title = "Sleep timer",
                        subtitle = sleepTimerMinutes?.let { "About $it minutes remaining" } ?: "Stop playback automatically",
                        choices = SleepTimerChoices,
                        selected = sleepTimerDuration?.let { "$it minutes" } ?: "Off",
                        onSelect = { value -> onSleepTimer(value.substringBefore(" ").toIntOrNull()) }
                    )
                }
                item {
                    SectionCard("Wake-Up Alarm & GlzHub") {
                        Text(
                            if (alarmConfig.enabled) "Active alarm: ${alarmConfig.formattedTime()} (${alarmConfig.stationName ?: "Glz Radio"})"
                            else "No wake-up alarm scheduled.",
                            color = palette.muted,
                            fontSize = 13.sp
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                            FilledTonalButton(onClick = onOpenAlarm, modifier = Modifier.weight(1f)) {
                                Icon(Icons.Filled.Alarm, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(6.dp))
                                Text("Configure Alarm")
                            }
                            FilledTonalButton(onClick = onSyncGlzHub, modifier = Modifier.weight(1f)) {
                                Icon(Icons.Filled.Refresh, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(6.dp))
                                Text("Sync GlzHub")
                            }
                        }
                    }
                }
                item {
                    SectionCard("App updates") {
                        Text(updateStatus, color = palette.muted, fontSize = 13.sp)
                        Text(
                            "Release APKs are verified via SHA-256 through GitHub. Android always asks before installation.",
                            color = palette.ink,
                            fontSize = 13.sp
                        )
                        FilledTonalButton(onClick = onCheckForUpdates, modifier = Modifier.fillMaxWidth()) {
                            Icon(Icons.Filled.Download, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("Check for updates")
                        }
                    }
                }
                item {
                    SectionCard("System") {
                        SettingsInfoRow("Version", BuildConfig.VERSION_NAME)
                        SettingsInfoRow("Catalog", catalogSource)
                        SettingsInfoRow("Stations", stationCount.toString())
                        SettingsInfoRow("Saved stations", savedCount.toString())
                        SettingsInfoRow("Playback", "Media3 + ICY Timeshift + Android Auto")
                    }
                }
            }
        }
    }
}

@Composable
private fun SettingsSummaryCard(
    themeName: String,
    accentName: String,
    layoutMode: String,
    playerSize: String,
    compact: Boolean
) {
    val palette = LocalGlzPalette.current
    Surface(color = palette.card, shape = RoundedCornerShape(24.dp), modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Glz Radio", color = palette.ink, fontWeight = FontWeight.Bold, fontSize = 24.sp)
            Text("Theme $themeName · Accent $accentName", color = palette.muted)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                SettingsPill("Layout", layoutMode, Modifier.weight(1f))
                SettingsPill("Sizing", if (compact) "Compact" else "Comfortable", Modifier.weight(1f))
                SettingsPill("Player", playerSize, Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun SettingsPill(label: String, value: String, modifier: Modifier = Modifier) {
    val palette = LocalGlzPalette.current
    Surface(color = palette.field, shape = RoundedCornerShape(16.dp), modifier = modifier) {
        Column(Modifier.padding(horizontal = 10.dp, vertical = 10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(label, color = palette.muted, fontSize = 11.sp, maxLines = 1)
            Text(value, color = palette.ink, fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
    }
}

@Composable
private fun SettingsChoiceSection(
    title: String,
    subtitle: String,
    choices: List<SettingChoice>,
    selected: String,
    onSelect: (String) -> Unit
) {
    val palette = LocalGlzPalette.current
    SectionCard(title) {
        Text(subtitle, color = palette.muted, fontSize = 13.sp)
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(choices, key = { it.name }) { choice ->
                FilterChip(
                    selected = selected == choice.name,
                    onClick = { onSelect(choice.name) },
                    label = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            choice.color?.let { color ->
                                Box(
                                    modifier = Modifier
                                        .size(12.dp)
                                        .clip(CircleShape)
                                        .background(color)
                                )
                                Spacer(Modifier.width(8.dp))
                            }
                            Text(choice.name)
                        }
                    }
                )
            }
        }
        Text(
            choices.firstOrNull { it.name == selected }?.description.orEmpty(),
            color = palette.ink,
            fontWeight = FontWeight.Bold,
            fontSize = 13.sp
        )
    }
}

@Composable
private fun SettingsInfoRow(label: String, value: String) {
    val palette = LocalGlzPalette.current
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
        Text(label, color = palette.muted, modifier = Modifier.weight(1f))
        Text(value, color = palette.ink, fontWeight = FontWeight.Bold, textAlign = TextAlign.End)
    }
}

@Composable
private fun StationEditorSheet(
    stations: List<Station>,
    catalogSource: String,
    probeResults: Map<String, StreamProbeResult>,
    probing: Boolean,
    onSyncGlzHub: () -> Unit,
    onTestAllStreams: () -> Unit,
    onSave: (String?, Station) -> Unit,
    onDelete: (Station) -> Unit,
    onRestoreDefaults: () -> Unit
) {
    val palette = LocalGlzPalette.current
    var selectedName by remember(stations) { mutableStateOf(stations.firstOrNull()?.name) }
    val selected = stations.firstOrNull { it.name == selectedName }
    var originalName by remember { mutableStateOf(selected?.name) }
    var name by remember { mutableStateOf(selected?.name.orEmpty()) }
    var streamUrl by remember { mutableStateOf(selected?.streamUrl.orEmpty()) }
    var logoUrl by remember { mutableStateOf(selected?.logoUrl.orEmpty()) }
    var frequency by remember { mutableStateOf(selected?.frequency.orEmpty()) }
    var callSign by remember { mutableStateOf(selected?.callSign.orEmpty()) }
    var tagline by remember { mutableStateOf(selected?.tagline.orEmpty()) }
    var location by remember { mutableStateOf(selected?.location.orEmpty()) }
    var error by remember { mutableStateOf<String?>(null) }

    fun loadStation(station: Station?) {
        selectedName = station?.name
        originalName = station?.name
        name = station?.name.orEmpty()
        streamUrl = station?.streamUrl.orEmpty()
        logoUrl = station?.logoUrl.orEmpty()
        frequency = station?.frequency.orEmpty()
        callSign = station?.callSign.orEmpty()
        tagline = station?.tagline.orEmpty()
        location = station?.location.orEmpty()
        error = null
    }

    fun saveStation() {
        val cleanName = name.trim()
        val cleanStream = streamUrl.trim()
        if (cleanName.isBlank()) {
            error = "Station name is required."
            return
        }
        if (cleanStream.isBlank()) {
            error = "Stream URL is required."
            return
        }
        val duplicate = stations.any { it.name.equals(cleanName, ignoreCase = true) && it.name != originalName }
        if (duplicate) {
            error = "Another station already uses that name."
            return
        }
        val station = Station(
            cleanName,
            logoUrl.trim(),
            cleanStream,
            frequency.trim().ifBlank { "Live" },
            callSign.trim().ifBlank { null },
            tagline.trim(),
            location.trim()
        )
        onSave(originalName, station)
        loadStation(station)
    }

    Column(
        modifier = Modifier
            .padding(horizontal = 20.dp)
            .padding(bottom = 20.dp)
            .fillMaxWidth()
            .heightIn(max = 680.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("Station Editor & Health", color = palette.ink, fontWeight = FontWeight.Bold, fontSize = 24.sp)
        Text(
            "Source: $catalogSource. Custom additions and edits are stored separately so GlzHub syncs never overwrite them.",
            color = palette.muted,
            fontSize = 12.sp
        )

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            FilledTonalButton(onClick = onSyncGlzHub, modifier = Modifier.weight(1f)) {
                Icon(Icons.Filled.Refresh, contentDescription = null, modifier = Modifier.size(17.dp))
                Spacer(Modifier.width(6.dp))
                Text("Sync GlzHub")
            }
            FilledTonalButton(
                onClick = onTestAllStreams,
                enabled = !probing,
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Filled.NetworkCheck, contentDescription = null, modifier = Modifier.size(17.dp))
                Spacer(Modifier.width(6.dp))
                Text(if (probing) "Testing…" else "Test Streams")
            }
        }

        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            item {
                FilterChip(
                    selected = originalName == null,
                    onClick = { loadStation(null) },
                    label = { Text("+ New") }
                )
            }
            items(stations, key = { it.name }) { station ->
                val probe = probeResults[station.name]
                FilterChip(
                    selected = selectedName == station.name,
                    onClick = { loadStation(station) },
                    label = {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(5.dp)) {
                            if (probe != null) {
                                Box(
                                    Modifier
                                        .size(8.dp)
                                        .clip(CircleShape)
                                        .background(if (probe.online) palette.ok else palette.coral)
                                )
                            }
                            Text(station.name, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        }
                    }
                )
            }
        }

        selected?.let { currentSel ->
            probeResults[currentSel.name]?.let { probe ->
                Surface(
                    color = if (probe.online) palette.ok.copy(alpha = 0.14f) else palette.coral.copy(alpha = 0.14f),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        if (probe.online) "Stream Online · ${probe.detail}" else "Stream Unreachable · ${probe.detail}",
                        color = if (probe.online) palette.ok else palette.coral,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                    )
                }
            }
        }

        if (logoUrl.isNotBlank()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                StationLogo(logoUrl, 54)
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(name.ifBlank { "Station preview" }, color = palette.ink, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text(frequency.ifBlank { "Live" }, color = palette.muted, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
            }
        }
        OutlinedTextField(value = name, onValueChange = { name = it }, modifier = Modifier.fillMaxWidth(), singleLine = true, label = { Text("Name") })
        OutlinedTextField(value = streamUrl, onValueChange = { streamUrl = it }, modifier = Modifier.fillMaxWidth(), singleLine = true, label = { Text("Stream URL") })
        OutlinedTextField(value = logoUrl, onValueChange = { logoUrl = it }, modifier = Modifier.fillMaxWidth(), singleLine = true, label = { Text("Logo image URL") })
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            OutlinedTextField(value = frequency, onValueChange = { frequency = it }, modifier = Modifier.weight(1f), singleLine = true, label = { Text("Frequency") })
            OutlinedTextField(value = callSign, onValueChange = { callSign = it }, modifier = Modifier.weight(1f), singleLine = true, label = { Text("Call sign") })
        }
        OutlinedTextField(value = tagline, onValueChange = { tagline = it }, modifier = Modifier.fillMaxWidth(), singleLine = true, label = { Text("Tagline") })
        OutlinedTextField(value = location, onValueChange = { location = it }, modifier = Modifier.fillMaxWidth(), singleLine = true, label = { Text("Location / City") })
        error?.let { Text(it, color = palette.coral, fontWeight = FontWeight.Bold, fontSize = 13.sp) }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            FilledTonalButton(
                onClick = { saveStation() },
                colors = ButtonDefaults.filledTonalButtonColors(containerColor = palette.accent, contentColor = palette.onAccent),
                modifier = Modifier.weight(1f)
            ) { Text("Save", fontWeight = FontWeight.Bold) }
            FilledTonalButton(onClick = { loadStation(null) }, modifier = Modifier.weight(1f)) { Text("New") }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            TextButton(
                onClick = { selected?.let { onDelete(it); loadStation(null) } },
                enabled = selected != null,
                modifier = Modifier.weight(1f)
            ) {
                Text("Delete", color = if (selected != null) palette.coral else palette.muted)
            }
            TextButton(onClick = { onRestoreDefaults(); loadStation(StationCatalog.all().firstOrNull()) }, modifier = Modifier.weight(1f)) {
                Text("Restore defaults")
            }
        }
    }
}

@Composable
private fun RecordingsSheet(
    recordings: List<File>,
    onPlay: (File) -> Unit,
    onDelete: (File) -> Unit,
    onExport: (File, ExportFormat) -> Unit,
    onShare: (File, ExportFormat) -> Unit
) {
    val palette = LocalGlzPalette.current
    Column(
        Modifier.padding(20.dp).fillMaxWidth().heightIn(max = 520.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text("Recordings", color = palette.ink, fontWeight = FontWeight.Bold, fontSize = 24.sp)
        if (recordings.isEmpty()) {
            Surface(color = palette.card, shape = RoundedCornerShape(18.dp), modifier = Modifier.fillMaxWidth()) {
                Text("No recordings yet.", color = palette.muted, modifier = Modifier.padding(18.dp), textAlign = TextAlign.Center)
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(recordings, key = { it.absolutePath }) { file ->
                    RecordingRow(
                        file = file,
                        onPlay = { onPlay(file) },
                        onDelete = { onDelete(file) },
                        onExport = { format -> onExport(file, format) },
                        onShare = { format -> onShare(file, format) }
                    )
                }
            }
        }
        Spacer(Modifier.height(12.dp))
    }
}

@Composable
private fun RecordingRow(
    file: File,
    onPlay: () -> Unit,
    onDelete: () -> Unit,
    onExport: (ExportFormat) -> Unit,
    onShare: (ExportFormat) -> Unit
) {
    val palette = LocalGlzPalette.current
    Surface(color = palette.card, shape = RoundedCornerShape(18.dp), modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(recordingTitle(file), color = palette.ink, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text("${fileExtension(file)} · ${formatFileSize(file.length())}", color = palette.muted, fontSize = 12.sp)
                }
                IconButton(onClick = onPlay) {
                    Icon(Icons.Filled.PlayArrow, contentDescription = "Play recording", tint = palette.accent)
                }
                IconButton(onClick = onDelete) {
                    Icon(Icons.Filled.Delete, contentDescription = "Delete recording", tint = palette.coral)
                }
            }
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                item {
                    FilledTonalButton(onClick = { onExport(ExportFormat.Mp3) }) {
                        Icon(Icons.Filled.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Export MP3")
                    }
                }
                item {
                    FilledTonalButton(onClick = { onExport(ExportFormat.Aac) }) {
                        Icon(Icons.Filled.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Export AAC")
                    }
                }
                item {
                    TextButton(onClick = { onShare(ExportFormat.Mp3) }) {
                        Icon(Icons.Filled.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Share MP3")
                    }
                }
                item {
                    TextButton(onClick = { onShare(ExportFormat.Aac) }) {
                        Icon(Icons.Filled.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Share AAC")
                    }
                }
            }
        }
    }
}

@Composable
private fun TrackHistorySheet(
    history: List<Pair<String, String>>,
    onClear: () -> Unit
) {
    val palette = LocalGlzPalette.current
    Column(
        modifier = Modifier.fillMaxWidth().padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            Text("Live Track History", color = palette.ink, fontWeight = FontWeight.Bold, fontSize = 22.sp, modifier = Modifier.weight(1f))
            if (history.isNotEmpty()) {
                TextButton(onClick = onClear) { Text("Clear", color = palette.coral) }
            }
        }
        if (history.isEmpty()) {
            Text(
                "No song tracks detected yet. Tune into stations like Z 93 or Magic 97.3 to capture live ICY/SHOUTcast track names — now preserved even during local timeshift.",
                color = palette.muted,
                fontSize = 14.sp
            )
        } else {
            LazyColumn(
                modifier = Modifier.heightIn(max = 360.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(history) { (timeAndStation, songTitle) ->
                    Surface(color = palette.card, shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth()) {
                        Column(Modifier.padding(12.dp)) {
                            Text(songTitle, color = palette.ink, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                            Text(timeAndStation, color = palette.accent, fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ScheduleDVRSheet(
    station: Station?,
    activeInfo: ScheduledTaskInfo?,
    onSchedule: (delayMin: Int, durationMin: Int) -> Unit,
    onCancel: () -> Unit
) {
    val palette = LocalGlzPalette.current
    var selectedDelay by remember { mutableIntStateOf(0) }
    var selectedDuration by remember { mutableIntStateOf(30) }

    Column(
        modifier = Modifier.fillMaxWidth().padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("Schedule Stream DVR", color = palette.ink, fontWeight = FontWeight.Bold, fontSize = 22.sp)
        Text("Record ${station?.name ?: "selected station"} automatically to local storage.", color = palette.muted, fontSize = 14.sp)

        if (activeInfo != null) {
            Surface(color = palette.card, shape = RoundedCornerShape(14.dp), modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.padding(14.dp)) {
                    Text("Active DVR Schedule", color = palette.gold, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text("Station: ${activeInfo.stationName}", color = palette.ink)
                    Text("Duration: ${activeInfo.durationMinutes} min", color = palette.muted, fontSize = 13.sp)
                    Spacer(Modifier.height(8.dp))
                    FilledTonalButton(
                        onClick = onCancel,
                        colors = ButtonDefaults.filledTonalButtonColors(containerColor = palette.coral, contentColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    ) { Text("Cancel Scheduled DVR") }
                }
            }
        } else {
            Text("Start Recording In:", color = palette.ink, fontWeight = FontWeight.Bold)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(0 to "Now", 5 to "5 min", 15 to "15 min", 30 to "30 min").forEach { (min, label) ->
                    FilterChip(selected = selectedDelay == min, onClick = { selectedDelay = min }, label = { Text(label) })
                }
            }
            Text("Recording Duration:", color = palette.ink, fontWeight = FontWeight.Bold)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(15 to "15m", 30 to "30m", 60 to "60m", 120 to "2 hrs").forEach { (min, label) ->
                    FilterChip(selected = selectedDuration == min, onClick = { selectedDuration = min }, label = { Text(label) })
                }
            }
            Spacer(Modifier.height(6.dp))
            FilledTonalButton(
                onClick = { onSchedule(selectedDelay, selectedDuration) },
                colors = ButtonDefaults.filledTonalButtonColors(containerColor = palette.accent, contentColor = palette.onAccent),
                modifier = Modifier.fillMaxWidth().height(48.dp)
            ) {
                Text("Confirm DVR Schedule", fontWeight = FontWeight.Bold)
            }
        }
    }
}

private fun rdsText(station: Station?, status: String, index: Int, playing: Boolean): String {
    if (station == null) return "RDS / Waiting for station"
    val parts = listOf(station.name, station.tagline, station.location, station.meta(), status)
        .filter { !it.isNullOrBlank() }
    val prefix = if (playing) "LIVE / " else "RDS / "
    return prefix + parts[index.floorMod(parts.size)]
}

private fun Int.floorMod(divisor: Int): Int = ((this % divisor) + divisor) % divisor

private enum class ExportFormat(val extension: String, val mimeType: String) {
    Mp3("mp3", "audio/mpeg"),
    Aac("aac", "audio/aac")
}

private data class RecordingExport(val file: File, val format: ExportFormat)

private fun exportRecordingToUri(context: Context, file: File, uri: Uri, format: ExportFormat) {
    try {
        context.contentResolver.openOutputStream(uri)?.use { output ->
            FileInputStream(file).use { input -> input.copyTo(output) }
        } ?: throw IllegalStateException("Could not open export destination")
        Toast.makeText(context, "Exported ${format.extension.uppercase(Locale.US)}", Toast.LENGTH_SHORT).show()
    } catch (_: Exception) {
        Toast.makeText(context, "Could not export recording", Toast.LENGTH_SHORT).show()
    }
}

private fun shareRecording(context: Context, file: File, format: ExportFormat) {
    try {
        val sharedFile = sharedRecordingFile(context, file, format)
        FileInputStream(file).use { input ->
            sharedFile.outputStream().use { output -> input.copyTo(output) }
        }
        val uri = FileProvider.getUriForFile(context, "${context.packageName}.files", sharedFile)
        val intent = Intent(Intent.ACTION_SEND)
            .setType(format.mimeType)
            .putExtra(Intent.EXTRA_STREAM, uri)
            .putExtra(Intent.EXTRA_TITLE, sharedFile.name)
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        context.startActivity(Intent.createChooser(intent, "Share recording"))
    } catch (_: Exception) {
        Toast.makeText(context, "Could not share recording", Toast.LENGTH_SHORT).show()
    }
}

private fun sharedRecordingFile(context: Context, file: File, format: ExportFormat): File {
    val dir = File(context.cacheDir, "shared-recordings")
    if (!dir.exists()) dir.mkdirs()
    dir.listFiles()?.forEach { it.delete() }
    return File(dir, exportFileName(file, format))
}

private fun exportFileName(file: File, format: ExportFormat): String {
    val base = file.nameWithoutExtension
        .replace(Regex("[^A-Za-z0-9._-]+"), "-")
        .trim('-')
        .ifBlank { "glz-radio-recording" }
    return "$base.${format.extension}"
}

private fun formatElapsed(millis: Long): String {
    val totalSeconds = (millis / 1000).coerceAtLeast(0)
    val hours = totalSeconds / 3600
    val minutes = (totalSeconds % 3600) / 60
    val seconds = totalSeconds % 60
    return if (hours > 0) {
        String.format(Locale.US, "%d:%02d:%02d", hours, minutes, seconds)
    } else {
        String.format(Locale.US, "%02d:%02d", minutes, seconds)
    }
}

private fun listRecordings(context: Context): List<File> {
    return StreamRecorder.recordingsDir(context)
        .listFiles { file -> file.isFile }
        ?.sortedByDescending { it.lastModified() }
        ?: emptyList()
}

private fun recordingTitle(file: File): String {
    val rawName = file.nameWithoutExtension.substringBeforeLast("-", file.nameWithoutExtension).replace("-", " ").trim()
    return rawName.replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.US) else it.toString() }
}

private fun fileExtension(file: File): String = file.extension.uppercase(Locale.US).ifBlank { "AUDIO" }

private fun formatFileSize(bytes: Long): String {
    val kb = bytes / 1024.0
    if (kb < 1024) return String.format(Locale.US, "%.0f KB", kb)
    return String.format(Locale.US, "%.1f MB", kb / 1024.0)
}

private fun streamRetryDelayMs(attempt: Int): Long {
    return (STREAM_RETRY_BASE_DELAY_MS * attempt.coerceAtMost(15))
        .coerceAtMost(STREAM_RETRY_MAX_DELAY_MS)
}

private fun formatHeaderClock(): String {
    return LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a", Locale.US))
}

private fun loadFavorites(context: Context): Set<String> {
    return context.getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
        .getStringSet(FAVORITES_PREF, emptySet())
        ?.toSet()
        ?: emptySet()
}

private fun saveFavorites(context: Context, favorites: Set<String>) {
    context.getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
        .edit()
        .putStringSet(FAVORITES_PREF, favorites)
        .apply()
}

private fun loadSetting(context: Context, key: String, fallback: String): String {
    return context.getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
        .getString(key, fallback)
        ?: fallback
}

private fun saveSetting(context: Context, key: String, value: String) {
    context.getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
        .edit()
        .putString(key, value)
        .apply()
}
