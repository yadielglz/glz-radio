package com.yadielglz.radiostreamer

import android.Manifest
import android.app.Activity
import android.app.AlertDialog as PlatformAlertDialog
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.location.Location
import android.location.LocationManager
import android.os.Bundle
import android.os.Build
import android.os.SystemClock
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.FileProvider
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.Image
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
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.PlaybackException
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import coil.compose.AsyncImage
import com.google.common.util.concurrent.ListenableFuture
import com.google.common.util.concurrent.MoreExecutors
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileInputStream
import java.net.URL
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.roundToInt

private var DarkInk = Color(0xFFECFDF5)
private var DarkMuted = Color(0xFF94A3B8)
private var DarkBg = Color(0xFF071113)
private var DarkSurface = Color(0xFF0E1E21)
private var DarkCard = Color(0xFF12262A)
private var DarkField = Color(0xFF0B191C)
private var DarkStroke = Color(0xFF234348)
private var Teal = Color(0xFF14B8A6)
private var Coral = Color(0xFFDC5247)
private var Gold = Color(0xFFB47C26)
private val GoogleSans = FontFamily.SansSerif
private const val APP_PREFS = "radio_streamer"
private const val FAVORITES_PREF = "favorites"
private const val THEME_PREF = "theme_name"
private const val ACCENT_PREF = "accent_name"
private const val LAYOUT_PREF = "layout_mode"
private const val PLAYER_SIZE_PREF = "player_size"
private const val SAN_JUAN_LAT = 18.4655
private const val SAN_JUAN_LON = -66.1057

private data class SettingChoice(
    val name: String,
    val description: String,
    val color: Color? = null
)

private val ThemeChoices = listOf(
    SettingChoice("Midnight Radio", "Deep black glass, teal signal highlights", DarkBg),
    SettingChoice("Signal Noir", "High contrast studio dark", Color(0xFF050A0C)),
    SettingChoice("Coastal Night", "Cool dark surface with softer blue undertones", Color(0xFF061720)),
    SettingChoice("Graphite Studio", "Neutral dark gray for long listening sessions", Color(0xFF111315)),
    SettingChoice("Tropical Dark", "Warm dark base with saturated controls", Color(0xFF11140D))
)

private val AccentChoices = listOf(
    SettingChoice("Teal", "Glz classic", Teal),
    SettingChoice("Cyan", "Bright broadcast blue", Color(0xFF22D3EE)),
    SettingChoice("Lime", "Electric tuner green", Color(0xFF84CC16)),
    SettingChoice("Amber", "Warm dial glow", Color(0xFFF59E0B)),
    SettingChoice("Coral", "Recording-forward red coral", Coral)
)

private val LayoutChoices = listOf(
    SettingChoice("Auto", "Resize from the current screen size"),
    SettingChoice("Compact", "Tighter cards and controls"),
    SettingChoice("Comfortable", "Roomier spacing for phones and tablets"),
    SettingChoice("Large", "Bigger touch targets and calmer density")
)

private val PlayerSizeChoices = listOf(
    SettingChoice("Balanced", "Player stays meaningful without dominating"),
    SettingChoice("Compact", "More room for stations"),
    SettingChoice("Expanded", "Larger art and live controls")
)

private fun applyAppearance(themeName: String, accentName: String) {
    when (themeName) {
        "Signal Noir" -> {
            DarkInk = Color(0xFFF8FAFC)
            DarkMuted = Color(0xFF9CA3AF)
            DarkBg = Color(0xFF050A0C)
            DarkSurface = Color(0xFF0B1114)
            DarkCard = Color(0xFF11181C)
            DarkField = Color(0xFF070D10)
            DarkStroke = Color(0xFF283338)
        }
        "Coastal Night" -> {
            DarkInk = Color(0xFFE6F7FF)
            DarkMuted = Color(0xFF8CAFC1)
            DarkBg = Color(0xFF061720)
            DarkSurface = Color(0xFF0B2430)
            DarkCard = Color(0xFF11313E)
            DarkField = Color(0xFF071D27)
            DarkStroke = Color(0xFF285163)
        }
        "Graphite Studio" -> {
            DarkInk = Color(0xFFF1F5F9)
            DarkMuted = Color(0xFFA1A1AA)
            DarkBg = Color(0xFF111315)
            DarkSurface = Color(0xFF1A1D20)
            DarkCard = Color(0xFF23272B)
            DarkField = Color(0xFF151719)
            DarkStroke = Color(0xFF3F454B)
        }
        "Tropical Dark" -> {
            DarkInk = Color(0xFFF7FEE7)
            DarkMuted = Color(0xFFB7BE92)
            DarkBg = Color(0xFF11140D)
            DarkSurface = Color(0xFF1A2012)
            DarkCard = Color(0xFF222B18)
            DarkField = Color(0xFF151A10)
            DarkStroke = Color(0xFF3E4B2B)
        }
        else -> {
            DarkInk = Color(0xFFECFDF5)
            DarkMuted = Color(0xFF94A3B8)
            DarkBg = Color(0xFF071113)
            DarkSurface = Color(0xFF0E1E21)
            DarkCard = Color(0xFF12262A)
            DarkField = Color(0xFF0B191C)
            DarkStroke = Color(0xFF234348)
        }
    }

    Teal = when (accentName) {
        "Cyan" -> Color(0xFF22D3EE)
        "Lime" -> Color(0xFF84CC16)
        "Amber" -> Color(0xFFF59E0B)
        "Coral" -> Color(0xFFFB7185)
        else -> Color(0xFF14B8A6)
    }
    Coral = if (accentName == "Coral") Color(0xFFDC5247) else Color(0xFFDC5247)
    Gold = if (accentName == "Amber") Color(0xFFF59E0B) else Color(0xFFB47C26)
}

class MainActivity : ComponentActivity() {
    private var controllerFuture: ListenableFuture<MediaController>? = null
    private var controller by mutableStateOf<MediaController?>(null)
    private lateinit var recorder: StreamRecorder

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        recorder = StreamRecorder(this)
        val token = SessionToken(this, ComponentName(this, PlaybackService::class.java))
        controllerFuture = MediaController.Builder(this, token).buildAsync().also { future ->
            future.addListener(
                { controller = future.get() },
                MoreExecutors.directExecutor()
            )
        }

        setContent {
            var themeName by remember { mutableStateOf(loadSetting(this@MainActivity, THEME_PREF, ThemeChoices.first().name)) }
            var accentName by remember { mutableStateOf(loadSetting(this@MainActivity, ACCENT_PREF, AccentChoices.first().name)) }
            GlzRadioTheme(themeName = themeName, accentName = accentName) {
                val activeController = controller
                var showSplash by rememberSaveable { mutableStateOf(true) }
                LaunchedEffect(Unit) {
                    delay(3000)
                    showSplash = false
                }
                if (showSplash) {
                    SplashScreen()
                } else if (activeController == null) {
                    LoadingApp()
                } else {
                    RadioApp(
                        player = activeController,
                        recorder = recorder,
                        themeName = themeName,
                        accentName = accentName,
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

    override fun onDestroy() {
        super.onDestroy()
        recorder.shutdown()
        controllerFuture?.let(MediaController::releaseFuture)
        controllerFuture = null
    }

    private fun handleMenuAction(action: MenuAction) {
        if (action == MenuAction.About) showAbout()
    }

    private fun showAbout() {
        PlatformAlertDialog.Builder(this)
            .setTitle("About Glz Radio")
            .setMessage("A native Android radio streamer for Puerto Rico live radio.\n\nUI: Jetpack Compose Material 3\nPlayback: Media3 ExoPlayer")
            .setPositiveButton("Done", null)
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

@Composable
private fun GlzRadioTheme(
    themeName: String,
    accentName: String,
    content: @Composable () -> Unit
) {
    applyAppearance(themeName, accentName)
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Teal,
            onPrimary = Color(0xFF031312),
            secondary = Teal,
            tertiary = Coral,
            background = DarkBg,
            surface = DarkSurface,
            surfaceVariant = DarkCard,
            onBackground = DarkInk,
            onSurface = DarkInk,
            onSurfaceVariant = DarkMuted,
            outline = DarkStroke
        ),
        typography = MaterialTheme.typography.copy(
            displaySmall = MaterialTheme.typography.displaySmall.copy(fontFamily = GoogleSans),
            headlineMedium = MaterialTheme.typography.headlineMedium.copy(fontFamily = GoogleSans),
            titleLarge = MaterialTheme.typography.titleLarge.copy(fontFamily = GoogleSans),
            titleMedium = MaterialTheme.typography.titleMedium.copy(fontFamily = GoogleSans),
            bodyLarge = MaterialTheme.typography.bodyLarge.copy(fontFamily = GoogleSans),
            bodyMedium = MaterialTheme.typography.bodyMedium.copy(fontFamily = GoogleSans),
            labelLarge = MaterialTheme.typography.labelLarge.copy(fontFamily = GoogleSans)
        ),
        content = content
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun RadioApp(
    player: Player,
    recorder: StreamRecorder,
    themeName: String,
    accentName: String,
    onTheme: (String) -> Unit,
    onAccent: (String) -> Unit,
    onShowMenu: (MenuAction) -> Unit
) {
    val context = LocalContext.current
    val activity = context as Activity
    var stations by remember { mutableStateOf(StationStore.load(context)) }
    var query by rememberSaveable { mutableStateOf("") }
    var filter by rememberSaveable { mutableStateOf("All") }
    var current by remember { mutableStateOf(stations.firstOrNull()) }
    var expanded by rememberSaveable { mutableStateOf(false) }
    var menuOpen by rememberSaveable { mutableStateOf(false) }
    var settingsOpen by rememberSaveable { mutableStateOf(false) }
    var recordingsOpen by rememberSaveable { mutableStateOf(false) }
    var weatherOpen by rememberSaveable { mutableStateOf(false) }
    var editorOpen by rememberSaveable { mutableStateOf(false) }
    var searchOpen by rememberSaveable { mutableStateOf(false) }
    var weatherRefresh by remember { mutableStateOf(0) }
    var weather by remember { mutableStateOf<WeatherState>(WeatherState.Loading) }
    var isPlaying by remember { mutableStateOf(false) }
    var status by remember { mutableStateOf("Ready") }
    var recording by remember { mutableStateOf(false) }
    var favorites by remember { mutableStateOf(loadFavorites(context)) }
    var layoutMode by remember { mutableStateOf(loadSetting(context, LAYOUT_PREF, LayoutChoices.first().name)) }
    var playerSize by remember { mutableStateOf(loadSetting(context, PLAYER_SIZE_PREF, PlayerSizeChoices.first().name)) }
    var stationHealth by remember { mutableStateOf<Map<String, StationHealth>>(emptyMap()) }
    var pendingExport by remember { mutableStateOf<RecordingExport?>(null) }
    var retryCount by remember { mutableStateOf(0) }
    var elapsedMs by remember { mutableLongStateOf(0L) }
    var accumulatedMs by remember { mutableLongStateOf(0L) }
    var playStartedAtMs by remember { mutableLongStateOf(0L) }
    var rdsIndex by remember { mutableStateOf(0) }
    var intentionallyStopped by remember { mutableStateOf(false) }

    val configuration = LocalConfiguration.current
    val autoCompact = configuration.screenWidthDp < 390 || configuration.screenHeightDp < 720
    val compact = when (layoutMode) {
        "Compact" -> true
        "Comfortable", "Large" -> false
        else -> autoCompact
    }
    val locationLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) {
        weatherRefresh += 1
    }
    val notificationLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) {}
    val exportMp3Launcher = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument(ExportFormat.Mp3.mimeType)) { uri ->
        val export = pendingExport
        pendingExport = null
        if (uri != null && export != null) {
            exportRecordingToUri(context, export.file, uri, export.format)
        }
    }
    val exportAacLauncher = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument(ExportFormat.Aac.mimeType)) { uri ->
        val export = pendingExport
        pendingExport = null
        if (uri != null && export != null) {
            exportRecordingToUri(context, export.file, uri, export.format)
        }
    }
    val visibleStations = remember(stations, query, filter, favorites) {
        stations.filter { station ->
            val filterMatches = filter == "All" ||
                station.band() == filter ||
                (filter == "Saved" && favorites.contains(station.name))
            filterMatches && station.matches(query)
        }
    }

    BackHandler {
        activity.moveTaskToBack(true)
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

    fun setStation(station: Station, autoplay: Boolean) {
        if (recording && current != station) {
            recorder.stop()
            recording = false
        }
        current = station
        accumulatedMs = 0L
        playStartedAtMs = 0L
        elapsedMs = 0L
        rdsIndex = 0
        retryCount = 0
        intentionallyStopped = false
        player.setMediaItem(RadioPlayback.stationItem(station))
        player.prepare()
        if (autoplay) {
            player.play()
        }
        status = if (autoplay) "Loading ${station.name}" else "Selected ${station.name}"
    }

    fun togglePlayback() {
        val station = current ?: return
        intentionallyStopped = false
        if (player.mediaItemCount == 0) {
            setStation(station, true)
            return
        }
        if (player.isPlaying) {
            player.pause()
            status = "Paused"
        } else {
            player.play()
            status = "Loading ${station.name}"
        }
    }

    fun stopPlayback() {
        intentionallyStopped = true
        player.stop()
        player.clearMediaItems()
        syncElapsed(false)
        accumulatedMs = 0L
        playStartedAtMs = 0L
        elapsedMs = 0L
        status = "Stopped"
    }

    fun toggleFavorite(station: Station) {
        favorites = favorites.toMutableSet().also {
            if (it.contains(station.name)) it.remove(station.name) else it.add(station.name)
        }
        saveFavorites(context, favorites)
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
                        if (player.isPlaying) "Live / ${current?.name.orEmpty()}" else "Ready"
                    }
                    Player.STATE_ENDED -> "Stream ended"
                    else -> status
                }
            }

            override fun onPlayerError(error: PlaybackException) {
                val station = current ?: return
                if (intentionallyStopped) return
                stationHealth = stationHealth + (station.name to StationHealth.Retrying)
                status = "Retrying ${station.name}"
                if (retryCount < 2) {
                    retryCount += 1
                    player.prepare()
                    player.play()
                } else {
                    stationHealth = stationHealth + (station.name to StationHealth.Offline)
                    status = "${station.name} unavailable"
                    retryCount = 0
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

    LaunchedEffect(current, isPlaying, status) {
        while (true) {
            delay(4200)
            rdsIndex += 1
        }
    }

    LaunchedEffect(weatherRefresh) {
        weather = WeatherState.Loading
        weather = loadWeather(context)
    }

    LaunchedEffect(Unit) {
        if (Build.VERSION.SDK_INT >= 33 &&
            context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            notificationLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    if (current != null && player.mediaItemCount == 0 && !intentionallyStopped) {
        LaunchedEffect(current) { current?.let { setStation(it, false) } }
    }

    Scaffold(
        containerColor = DarkBg,
        bottomBar = {
            AnimatedVisibility(!expanded) {
                MiniPlayerBar(
                    station = current,
                    isPlaying = isPlaying,
                    elapsed = elapsedMs,
                    onExpand = { expanded = true },
                    onPlayPause = { togglePlayback() },
                    onStop = { stopPlayback() }
                )
            }
        }
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = if (compact) 12.dp else 18.dp)
                    .padding(top = if (compact) 10.dp else 18.dp)
            ) {
                AppBar(
                    searching = searchOpen,
                    query = query,
                    onQueryChange = { query = it },
                    onToggleSearch = {
                        searchOpen = !searchOpen
                        if (!searchOpen) query = ""
                    },
                    onMenu = { menuOpen = true }
                )
                FilterRow(
                    active = filter,
                    onFilter = { filter = it }
                )
                Text(
                    text = "${visibleStations.size} of ${stations.size} stations",
                    color = DarkMuted,
                    style = MaterialTheme.typography.labelLarge,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    contentPadding = PaddingValues(bottom = 14.dp)
                ) {
                    items(visibleStations, key = { it.name }) { station ->
                        StationCard(
                            station = station,
                            active = current?.name == station.name,
                            saved = favorites.contains(station.name),
                            health = stationHealth[station.name],
                            compact = compact,
                            onClick = { setStation(station, true) },
                            onFavorite = { toggleFavorite(station) }
                        )
                    }
                }
            }

            if (expanded) {
                FullPlayer(
                    station = current,
                    isPlaying = isPlaying,
                    elapsed = elapsedMs,
                    status = status,
                    weather = weather,
                    rds = rdsText(current, status, rdsIndex, isPlaying),
                    recording = recording,
                    saved = current?.let { favorites.contains(it.name) } == true,
                    compact = compact,
                    onDismiss = { expanded = false },
                    onPlayPause = { togglePlayback() },
                    onStop = { stopPlayback() },
                    onRecord = { toggleRecording() },
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
                    }
                )
            }
        }
    }

    if (menuOpen) {
        val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
        ModalBottomSheet(
            onDismissRequest = { menuOpen = false },
            sheetState = sheetState,
            containerColor = DarkSurface
        ) {
            MenuSheet(
                onSettings = {
                    menuOpen = false
                    settingsOpen = true
                },
                onRecordings = {
                    menuOpen = false
                    recordingsOpen = true
                },
                onWeather = {
                    menuOpen = false
                    weatherOpen = true
                },
                onStationEditor = {
                    menuOpen = false
                    editorOpen = true
                },
                onStop = {
                    menuOpen = false
                    stopPlayback()
                },
                onClearSaved = {
                    menuOpen = false
                    favorites = emptySet()
                    saveFavorites(context, favorites)
                },
                onAbout = {
                    menuOpen = false
                    onShowMenu(MenuAction.About)
                }
            )
        }
    }

    if (editorOpen) {
        val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
        ModalBottomSheet(
            onDismissRequest = { editorOpen = false },
            sheetState = sheetState,
            containerColor = DarkSurface
        ) {
            StationEditorSheet(
                stations = stations,
                onSave = { originalName, station ->
                    val next = stations.toMutableList()
                    val index = originalName?.let { name -> next.indexOfFirst { it.name == name } } ?: -1
                    if (index >= 0) {
                        next[index] = station
                    } else {
                        next.add(station)
                    }
                    stations = next
                    StationStore.save(context, stations)
                    if (current?.name == originalName || current == null) {
                        current = station
                        if (player.mediaItemCount > 0) {
                            player.setMediaItem(RadioPlayback.stationItem(station))
                            player.prepare()
                            if (isPlaying) player.play()
                        }
                    }
                    Toast.makeText(context, "Station saved", Toast.LENGTH_SHORT).show()
                },
                onDelete = { station ->
                    if (stations.size <= 1) {
                        Toast.makeText(context, "Keep at least one station", Toast.LENGTH_SHORT).show()
                    } else {
                        stations = stations.filterNot { it.name == station.name }
                        StationStore.save(context, stations)
                        favorites = favorites - station.name
                        saveFavorites(context, favorites)
                        if (current?.name == station.name) {
                            stopPlayback()
                            current = stations.firstOrNull()
                        }
                        Toast.makeText(context, "Station deleted", Toast.LENGTH_SHORT).show()
                    }
                },
                onRestoreDefaults = {
                    stations = StationStore.reset(context)
                    favorites = favorites.filter { saved -> stations.any { it.name == saved } }.toSet()
                    saveFavorites(context, favorites)
                    current = stations.firstOrNull()
                    stopPlayback()
                    Toast.makeText(context, "Default stations restored", Toast.LENGTH_SHORT).show()
                }
            )
        }
    }

    if (recordingsOpen) {
        val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
        var recordings by remember { mutableStateOf(listRecordings(context)) }
        ModalBottomSheet(
            onDismissRequest = { recordingsOpen = false },
            sheetState = sheetState,
            containerColor = DarkSurface
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
                onShare = { file, format ->
                    shareRecording(context, file, format)
                }
            )
        }
    }
}

@Composable
private fun AppBar(
    searching: Boolean,
    query: String,
    onQueryChange: (String) -> Unit,
    onToggleSearch: () -> Unit,
    onMenu: () -> Unit
) {
    Column {
        Image(
            painter = painterResource(R.drawable.header_banner),
            contentDescription = "Glz Radio",
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .fillMaxWidth()
                .height(132.dp)
                .clip(RoundedCornerShape(22.dp))
                .border(1.dp, DarkStroke, RoundedCornerShape(22.dp))
        )
        Spacer(Modifier.height(10.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            HeaderClock()
            Spacer(Modifier.weight(1f))
            IconButton(onClick = onToggleSearch) {
                Text(if (searching) "×" else "⌕", color = Teal, fontSize = if (searching) 28.sp else 30.sp)
            }
            FilledTonalButton(onClick = onMenu) {
                Text("Menu")
            }
        }
        AnimatedVisibility(searching) {
            OutlinedTextField(
                value = query,
                onValueChange = onQueryChange,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 12.dp),
                singleLine = true,
                placeholder = { Text("Search stations") },
                shape = RoundedCornerShape(18.dp)
            )
        }
    }
}

@Composable
private fun HeaderClock() {
    var clock by remember { mutableStateOf(formatHeaderClock()) }
    LaunchedEffect(Unit) {
        while (true) {
            clock = formatHeaderClock()
            delay(1000)
        }
    }
    Text(
        text = clock,
        color = DarkInk,
        fontWeight = FontWeight.Bold,
        fontSize = 18.sp,
        maxLines = 1
    )
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
    onClose: () -> Unit,
    onTheme: (String) -> Unit,
    onAccent: (String) -> Unit,
    onLayout: (String) -> Unit,
    onPlayerSize: (String) -> Unit
) {
    Surface(color = DarkBg, modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 18.dp, vertical = 16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                TextButton(onClick = onClose) { Text("Close") }
                Text(
                    "Settings",
                    color = DarkInk,
                    fontWeight = FontWeight.Bold,
                    fontSize = 24.sp,
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
                    SettingsSummaryCard(
                        themeName = themeName,
                        accentName = accentName,
                        layoutMode = layoutMode,
                        playerSize = playerSize,
                        compact = compact
                    )
                }
                item {
                    SettingsChoiceSection(
                        title = "Theme",
                        subtitle = "Dark presets for different listening moods",
                        choices = ThemeChoices,
                        selected = themeName,
                        onSelect = onTheme
                    )
                }
                item {
                    SettingsChoiceSection(
                        title = "Accent",
                        subtitle = "Signal color used by controls and highlights",
                        choices = AccentChoices,
                        selected = accentName,
                        onSelect = onAccent
                    )
                }
                item {
                    SettingsChoiceSection(
                        title = "Layout",
                        subtitle = "Controls how aggressively the app resizes",
                        choices = LayoutChoices,
                        selected = layoutMode,
                        onSelect = onLayout
                    )
                }
                item {
                    SettingsChoiceSection(
                        title = "Player",
                        subtitle = "Keeps the player useful without taking over",
                        choices = PlayerSizeChoices,
                        selected = playerSize,
                        onSelect = onPlayerSize
                    )
                }
                item {
                    SettingsInfoSection(
                        stationCount = stationCount,
                        savedCount = savedCount
                    )
                }
                item {
                    AboutSection()
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
    Surface(color = DarkCard, shape = RoundedCornerShape(28.dp), modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Glz Radio", color = DarkInk, fontWeight = FontWeight.Bold, fontSize = 26.sp)
            Text("Theme $themeName / Accent $accentName", color = DarkMuted)
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
    Surface(color = DarkField, shape = RoundedCornerShape(18.dp), modifier = modifier) {
        Column(Modifier.padding(horizontal = 10.dp, vertical = 10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(label, color = DarkMuted, fontSize = 11.sp, maxLines = 1)
            Text(value, color = DarkInk, fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
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
    WeatherSection(title) {
        Text(subtitle, color = DarkMuted, fontSize = 13.sp)
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
            color = DarkInk,
            fontWeight = FontWeight.Bold,
            fontSize = 13.sp
        )
    }
}

@Composable
private fun SettingsInfoSection(stationCount: Int, savedCount: Int) {
    WeatherSection("System") {
        SettingsInfoRow("Stations", stationCount.toString())
        SettingsInfoRow("Saved stations", savedCount.toString())
        SettingsInfoRow("Font", "Google Sans fallback")
        SettingsInfoRow("Storage", "App recordings only")
        SettingsInfoRow("Playback", "Media3 with Android Auto")
    }
}

@Composable
private fun SettingsInfoRow(label: String, value: String) {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
        Text(label, color = DarkMuted, modifier = Modifier.weight(1f))
        Text(value, color = DarkInk, fontWeight = FontWeight.Bold, textAlign = TextAlign.End)
    }
}

@Composable
private fun AboutSection() {
    WeatherSection("About") {
        Text("Glz Radio", color = DarkInk, fontWeight = FontWeight.Bold, fontSize = 22.sp)
        Text("Version 3.0", color = Teal, fontWeight = FontWeight.Bold)
        Text("© 2012 Glz Technical Services | © 2024 Glz Tech", color = DarkMuted)
        Text("mailto: service@glztech.com", color = DarkInk, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun SplashScreen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBg),
        contentAlignment = Alignment.Center
    ) {
        Image(
            painter = painterResource(R.drawable.splash),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )
    }
}

@Composable
private fun LoadingApp() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBg),
        contentAlignment = Alignment.Center
    ) {
        Text("Starting Glz Radio…", color = DarkInk, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun FilterRow(active: String, onFilter: (String) -> Unit) {
    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(vertical = 12.dp)
    ) {
        items(listOf("All", "FM", "AM", "Satellite", "Saved")) { filter ->
            FilterChip(
                selected = active == filter,
                onClick = { onFilter(filter) },
                label = { Text(filter) }
            )
        }
    }
}

@Composable
private fun WeatherCard(
    weather: WeatherState,
    compact: Boolean,
    onRefresh: () -> Unit,
    onRequestLocation: () -> Unit
) {
    Surface(
        color = DarkCard,
        shape = RoundedCornerShape(20.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 12.dp)
            .border(1.dp, DarkStroke, RoundedCornerShape(20.dp))
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 14.dp, vertical = if (compact) 10.dp else 12.dp)
        ) {
            Text("☁", color = Teal, fontSize = if (compact) 24.sp else 28.sp)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                when (weather) {
                    WeatherState.Loading -> {
                        Text("Weather", color = DarkInk, fontWeight = FontWeight.Bold)
                        Text("Updating forecast", color = DarkMuted, fontSize = 12.sp)
                    }

                    is WeatherState.Ready -> {
                        Text("${weather.temperature.roundToInt()}°F / ${weather.description}", color = DarkInk, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        Text("${weather.place} / wind ${weather.wind.roundToInt()} mph", color = DarkMuted, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    }

                    is WeatherState.Error -> {
                        Text("Weather unavailable", color = DarkInk, fontWeight = FontWeight.Bold)
                        Text(weather.message, color = DarkMuted, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    }
                }
            }
            TextButton(onClick = onRefresh) { Text("Refresh") }
            TextButton(onClick = onRequestLocation) { Text("Local") }
        }
    }
}

@Composable
private fun WeatherFlyout(
    weather: WeatherState,
    onClose: () -> Unit,
    onRefresh: () -> Unit,
    onRequestLocation: () -> Unit
) {
    Surface(
        color = DarkBg,
        modifier = Modifier.fillMaxSize()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 18.dp, vertical = 16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                TextButton(onClick = onClose) { Text("Close") }
                Text(
                    "Weather",
                    color = DarkInk,
                    fontWeight = FontWeight.Bold,
                    fontSize = 24.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(1f)
                )
                TextButton(onClick = onRefresh) { Text("Refresh") }
            }
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(bottom = 24.dp)
            ) {
                item {
                    when (weather) {
                        WeatherState.Loading -> WeatherLoadingPanel()
                        is WeatherState.Error -> WeatherErrorPanel(weather.message, onRequestLocation)
                        is WeatherState.Ready -> WeatherReadyPanel(weather, onRequestLocation)
                    }
                }
            }
        }
    }
}

@Composable
private fun WeatherReadyPanel(weather: WeatherState.Ready, onRequestLocation: () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Surface(color = DarkCard, shape = RoundedCornerShape(28.dp), modifier = Modifier.fillMaxWidth()) {
            Column(
                modifier = Modifier.padding(22.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(weather.description, color = DarkMuted, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                Text("${weather.temperature.roundToInt()}°F", color = Teal, fontWeight = FontWeight.Bold, fontSize = 60.sp)
                Text("Feels like ${weather.feelsLike.roundToInt()}°F", color = DarkInk, fontWeight = FontWeight.Bold, fontSize = 22.sp)
                Spacer(Modifier.height(6.dp))
                Text(weather.place, color = DarkMuted, textAlign = TextAlign.Center)
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            WeatherMetric("Wind", "${weather.wind.roundToInt()} mph", Modifier.weight(1f))
            WeatherMetric("Humidity", "${weather.humidity.roundToInt()}%", Modifier.weight(1f))
            WeatherMetric("Rain", "${weather.precipitation.roundToInt()} in", Modifier.weight(1f))
        }
        WeatherSection("Outlook") {
            if (weather.outlook.isEmpty()) {
                Text("No hourly outlook available.", color = DarkMuted)
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    weather.outlook.forEach { item ->
                        WeatherOutlookRow(item)
                    }
                }
            }
        }
        WeatherSection("Forecast") {
            if (weather.forecast.isEmpty()) {
                Text("No forecast available.", color = DarkMuted)
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    weather.forecast.forEach { day ->
                        WeatherForecastRow(day)
                    }
                }
            }
        }
        FilledTonalButton(onClick = onRequestLocation, modifier = Modifier.fillMaxWidth().height(50.dp)) {
            Text("Use local conditions")
        }
    }
}

@Composable
private fun WeatherLoadingPanel() {
    Surface(color = DarkCard, shape = RoundedCornerShape(28.dp), modifier = Modifier.fillMaxWidth()) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(28.dp)
        ) {
            Text("☁", color = Teal, fontSize = 54.sp)
            Spacer(Modifier.height(8.dp))
            Text("Updating forecast", color = DarkInk, fontWeight = FontWeight.Bold, fontSize = 22.sp)
            Text("Checking current conditions", color = DarkMuted, textAlign = TextAlign.Center)
        }
    }
}

@Composable
private fun WeatherErrorPanel(message: String, onRequestLocation: () -> Unit) {
    Surface(color = DarkCard, shape = RoundedCornerShape(28.dp), modifier = Modifier.fillMaxWidth()) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(24.dp)
        ) {
            Text("Weather unavailable", color = DarkInk, fontWeight = FontWeight.Bold, fontSize = 22.sp)
            Spacer(Modifier.height(8.dp))
            Text(message, color = DarkMuted, textAlign = TextAlign.Center)
            Spacer(Modifier.height(14.dp))
            FilledTonalButton(onClick = onRequestLocation, modifier = Modifier.fillMaxWidth()) {
                Text("Use local conditions")
            }
        }
    }
}

@Composable
private fun WeatherMetric(label: String, value: String, modifier: Modifier = Modifier) {
    Surface(color = DarkCard, shape = RoundedCornerShape(20.dp), modifier = modifier) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 14.dp)
        ) {
            Text(label, color = DarkMuted, fontSize = 12.sp, maxLines = 1)
            Text(value, color = DarkInk, fontWeight = FontWeight.Bold, fontSize = 17.sp, maxLines = 1)
        }
    }
}

@Composable
private fun WeatherSection(title: String, content: @Composable () -> Unit) {
    Surface(color = DarkSurface, shape = RoundedCornerShape(24.dp), modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(title, color = DarkInk, fontWeight = FontWeight.Bold, fontSize = 20.sp)
            content()
        }
    }
}

@Composable
private fun WeatherOutlookRow(item: WeatherOutlook) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .background(DarkCard, RoundedCornerShape(18.dp))
            .padding(horizontal = 14.dp, vertical = 12.dp)
    ) {
        Text(item.timeLabel, color = Teal, fontWeight = FontWeight.Bold, modifier = Modifier.width(68.dp))
        Column(Modifier.weight(1f)) {
            Text(item.description, color = DarkInk, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text("Feels ${item.feelsLike.roundToInt()}°F / rain ${item.rainChance}%", color = DarkMuted, fontSize = 12.sp)
        }
        Text("${item.temperature.roundToInt()}°", color = DarkInk, fontWeight = FontWeight.Bold, fontSize = 20.sp)
    }
}

@Composable
private fun WeatherForecastRow(day: WeatherForecastDay) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .background(DarkCard, RoundedCornerShape(18.dp))
            .padding(horizontal = 14.dp, vertical = 12.dp)
    ) {
        Column(Modifier.weight(1f)) {
            Text(day.dayLabel, color = DarkInk, fontWeight = FontWeight.Bold, maxLines = 1)
            Text(day.description, color = DarkMuted, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        Text("${day.low.roundToInt()}°", color = DarkMuted, fontWeight = FontWeight.Bold)
        Spacer(Modifier.width(10.dp))
        Text("${day.high.roundToInt()}°", color = Teal, fontWeight = FontWeight.Bold, fontSize = 20.sp)
        Spacer(Modifier.width(12.dp))
        Text("${day.rainChance}%", color = DarkMuted, fontSize = 12.sp)
    }
}

@Composable
private fun StationCard(
    station: Station,
    active: Boolean,
    saved: Boolean,
    health: StationHealth?,
    compact: Boolean,
    onClick: () -> Unit,
    onFavorite: () -> Unit
) {
    ElevatedCard(
        onClick = onClick,
        colors = CardDefaults.elevatedCardColors(containerColor = DarkCard),
        modifier = Modifier
            .fillMaxWidth()
            .border(
                width = if (active) 2.dp else 1.dp,
                color = if (active) Teal else DarkStroke,
                shape = RoundedCornerShape(20.dp)
            )
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(if (compact) 10.dp else 12.dp)
        ) {
            StationLogo(station.logoUrl, if (compact) 50 else 64)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(station.name, color = DarkInk, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text("${station.meta()}${healthLabel(health)}", color = healthColor(health), fontWeight = FontWeight.Bold, fontSize = 13.sp)
                Text("${station.location} / ${station.tagline}", color = DarkMuted, maxLines = 1, overflow = TextOverflow.Ellipsis, fontSize = 13.sp)
            }
            IconButton(onClick = onFavorite) {
                Text(if (saved) "♥" else "♡", color = if (saved) Teal else DarkInk, fontSize = 26.sp)
            }
        }
    }
}

@Composable
private fun MiniPlayerBar(
    station: Station?,
    isPlaying: Boolean,
    elapsed: Long,
    onExpand: () -> Unit,
    onPlayPause: () -> Unit,
    onStop: () -> Unit
) {
    Surface(
        color = DarkSurface,
        tonalElevation = 6.dp,
        shadowElevation = 12.dp,
        shape = RoundedCornerShape(24.dp),
        modifier = Modifier
            .padding(12.dp)
            .height(82.dp)
            .fillMaxWidth()
            .clickable(onClick = onExpand)
            .border(1.dp, Teal, RoundedCornerShape(24.dp))
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 12.dp)
        ) {
            StationLogo(station?.logoUrl, 54)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(station?.name ?: "Choose a station", color = DarkInk, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(station?.meta() ?: "Ready", color = DarkMuted, fontSize = 12.sp, maxLines = 1, modifier = Modifier.weight(1f))
                    Text(formatElapsed(elapsed), color = Teal, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
            IconButton(onClick = onPlayPause) {
                Text(if (isPlaying) "⏸" else "▶", color = Teal, fontSize = 24.sp)
            }
            IconButton(onClick = onStop) {
                Text("■", color = DarkInk, fontSize = 18.sp)
            }
        }
    }
}

@Composable
private fun FullPlayer(
    station: Station?,
    isPlaying: Boolean,
    elapsed: Long,
    status: String,
    weather: WeatherState,
    rds: String,
    recording: Boolean,
    saved: Boolean,
    compact: Boolean,
    onDismiss: () -> Unit,
    onPlayPause: () -> Unit,
    onStop: () -> Unit,
    onRecord: () -> Unit,
    onFavorite: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBg)
            .padding(horizontal = if (compact) 16.dp else 22.dp, vertical = 18.dp)
    ) {
        Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                TextButton(onClick = onDismiss) { Text("Close") }
                Text(
                    "Now Playing",
                    color = DarkMuted,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(1f)
                )
                IconButton(onClick = onFavorite) {
                    Text(if (saved) "♥" else "♡", color = if (saved) Teal else DarkInk, fontSize = 28.sp)
                }
            }
            Spacer(Modifier.height(if (compact) 22.dp else 30.dp))
            StationLogo(station?.logoUrl, if (compact) 164 else 220)
            Spacer(Modifier.height(18.dp))
            Text(station?.name ?: "Choose a station", color = DarkInk, fontWeight = FontWeight.Bold, fontSize = if (compact) 28.sp else 34.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(station?.let { "${it.meta()} / ${it.location}" } ?: "Ready", color = DarkMuted, textAlign = TextAlign.Center)
            Spacer(Modifier.height(if (compact) 18.dp else 26.dp))
            LiveCounter(elapsed = elapsed, isPlaying = isPlaying)
            Spacer(Modifier.height(if (compact) 16.dp else 22.dp))
            Surface(color = DarkCard, shape = RoundedCornerShape(22.dp), modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(rds, color = DarkInk, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                    Spacer(Modifier.height(8.dp))
                    Text(weatherDashboardText(weather), color = DarkMuted, textAlign = TextAlign.Center, fontSize = 13.sp)
                }
            }
            Text(status, color = DarkMuted, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 14.dp))
            Spacer(Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                FilledTonalButton(onClick = onPlayPause, modifier = Modifier.size(width = 88.dp, height = 56.dp)) {
                    Text(if (isPlaying) "⏸" else "▶", fontSize = 24.sp)
                }
                FilledTonalButton(onClick = onStop, modifier = Modifier.size(width = 88.dp, height = 56.dp)) {
                    Text("■", fontSize = 18.sp)
                }
            }
            Spacer(Modifier.height(14.dp))
            FilledTonalButton(
                onClick = onRecord,
                colors = ButtonDefaults.filledTonalButtonColors(containerColor = if (recording) Gold else Coral, contentColor = Color.White),
                modifier = Modifier.fillMaxWidth().height(48.dp)
            ) {
                Text(if (recording) "Stop recording" else "Record stream")
            }
        }
    }
}

@Composable
private fun LiveCounter(elapsed: Long, isPlaying: Boolean) {
    val transition = rememberInfiniteTransition(label = "livePulse")
    val alpha by transition.animateFloat(
        initialValue = 0.45f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(900), RepeatMode.Reverse),
        label = "liveAlpha"
    )
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .graphicsLayer { this.alpha = if (isPlaying) alpha else 0.35f }
                .background(if (isPlaying) Teal else DarkMuted, CircleShape)
        )
        Spacer(Modifier.width(10.dp))
        Text(formatElapsed(elapsed), color = Teal, fontSize = 44.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun StationLogo(url: String?, sizeDp: Int) {
    AsyncImage(
        model = url ?: R.drawable.app_icon,
        contentDescription = null,
        contentScale = ContentScale.Crop,
        modifier = Modifier
            .size(sizeDp.dp)
            .clip(RoundedCornerShape(if (sizeDp > 100) 28.dp else 16.dp))
            .background(DarkField)
            .border(1.dp, DarkStroke, RoundedCornerShape(if (sizeDp > 100) 28.dp else 16.dp))
    )
}

@Composable
private fun MenuSheet(
    onSettings: () -> Unit,
    onRecordings: () -> Unit,
    onWeather: () -> Unit,
    onStationEditor: () -> Unit,
    onStop: () -> Unit,
    onClearSaved: () -> Unit,
    onAbout: () -> Unit
) {
    Column(Modifier.padding(20.dp).fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Glz Radio", color = DarkInk, fontWeight = FontWeight.Bold, fontSize = 24.sp)
        FilledTonalButton(onClick = onSettings, modifier = Modifier.fillMaxWidth()) { Text("Settings") }
        FilledTonalButton(onClick = onRecordings, modifier = Modifier.fillMaxWidth()) { Text("Recordings") }
        FilledTonalButton(onClick = onWeather, modifier = Modifier.fillMaxWidth()) { Text("Weather") }
        FilledTonalButton(onClick = onStationEditor, modifier = Modifier.fillMaxWidth()) { Text("Station editor") }
        FilledTonalButton(onClick = onStop, modifier = Modifier.fillMaxWidth()) { Text("Stop playback") }
        FilledTonalButton(onClick = onClearSaved, modifier = Modifier.fillMaxWidth()) { Text("Clear saved stations") }
        FilledTonalButton(onClick = onAbout, modifier = Modifier.fillMaxWidth()) { Text("About") }
        Spacer(Modifier.height(18.dp))
    }
}

@Composable
private fun StationEditorSheet(
    stations: List<Station>,
    onSave: (String?, Station) -> Unit,
    onDelete: (Station) -> Unit,
    onRestoreDefaults: () -> Unit
) {
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
        Text("Station editor", color = DarkInk, fontWeight = FontWeight.Bold, fontSize = 26.sp)
        Text(
            "Edit the station name, stream, logo image, and display details used across Glz Radio.",
            color = DarkMuted,
            fontSize = 13.sp
        )
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            item {
                FilterChip(
                    selected = originalName == null,
                    onClick = { loadStation(null) },
                    label = { Text("New") }
                )
            }
            items(stations, key = { it.name }) { station ->
                FilterChip(
                    selected = selectedName == station.name,
                    onClick = { loadStation(station) },
                    label = { Text(station.name, maxLines = 1, overflow = TextOverflow.Ellipsis) }
                )
            }
        }
        if (logoUrl.isNotBlank()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                StationLogo(logoUrl, 58)
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(name.ifBlank { "Station preview" }, color = DarkInk, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text(frequency.ifBlank { "Live" }, color = DarkMuted, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
            }
        }
        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            label = { Text("Name") }
        )
        OutlinedTextField(
            value = streamUrl,
            onValueChange = { streamUrl = it },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            label = { Text("Stream URL") }
        )
        OutlinedTextField(
            value = logoUrl,
            onValueChange = { logoUrl = it },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            label = { Text("Logo image URL") }
        )
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = frequency,
                onValueChange = { frequency = it },
                modifier = Modifier.weight(1f),
                singleLine = true,
                label = { Text("Frequency") }
            )
            OutlinedTextField(
                value = callSign,
                onValueChange = { callSign = it },
                modifier = Modifier.weight(1f),
                singleLine = true,
                label = { Text("Call sign") }
            )
        }
        OutlinedTextField(
            value = tagline,
            onValueChange = { tagline = it },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            label = { Text("Tagline") }
        )
        OutlinedTextField(
            value = location,
            onValueChange = { location = it },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            label = { Text("Location") }
        )
        error?.let { Text(it, color = Coral, fontWeight = FontWeight.Bold, fontSize = 13.sp) }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            FilledTonalButton(onClick = { saveStation() }, modifier = Modifier.weight(1f)) {
                Text("Save")
            }
            FilledTonalButton(onClick = { loadStation(null) }, modifier = Modifier.weight(1f)) {
                Text("New")
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            TextButton(
                onClick = { selected?.let { onDelete(it); loadStation(null) } },
                enabled = selected != null,
                modifier = Modifier.weight(1f)
            ) {
                Text("Delete", color = if (selected != null) Coral else DarkMuted)
            }
            TextButton(onClick = { onRestoreDefaults(); loadStation(StationCatalog.all().firstOrNull()) }, modifier = Modifier.weight(1f)) {
                Text("Restore defaults")
            }
        }
        Spacer(Modifier.height(10.dp))
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
    Column(
        Modifier
            .padding(20.dp)
            .fillMaxWidth()
            .heightIn(max = 520.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text("Recordings", color = DarkInk, fontWeight = FontWeight.Bold, fontSize = 24.sp)
        if (recordings.isEmpty()) {
            Surface(color = DarkCard, shape = RoundedCornerShape(20.dp), modifier = Modifier.fillMaxWidth()) {
                Text(
                    "No recordings yet.",
                    color = DarkMuted,
                    modifier = Modifier.padding(18.dp),
                    textAlign = TextAlign.Center
                )
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
    Surface(color = DarkCard, shape = RoundedCornerShape(18.dp), modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(recordingTitle(file), color = DarkInk, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text("${fileExtension(file)} / ${formatFileSize(file.length())}", color = DarkMuted, fontSize = 12.sp)
                }
                TextButton(onClick = onPlay) { Text("Play") }
                TextButton(onClick = onDelete) { Text("Delete", color = Coral) }
            }
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                item {
                    FilledTonalButton(onClick = { onExport(ExportFormat.Mp3) }) {
                        Text("Export MP3")
                    }
                }
                item {
                    FilledTonalButton(onClick = { onExport(ExportFormat.Aac) }) {
                        Text("Export AAC")
                    }
                }
                item {
                    TextButton(onClick = { onShare(ExportFormat.Mp3) }) {
                        Text("Share MP3")
                    }
                }
                item {
                    TextButton(onClick = { onShare(ExportFormat.Aac) }) {
                        Text("Share AAC")
                    }
                }
            }
        }
    }
}

private fun rdsText(station: Station?, status: String, index: Int, playing: Boolean): String {
    if (station == null) return "RDS / Waiting for station"
    val parts = listOf(station.name, station.tagline, station.location, station.meta(), status)
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
    } catch (exception: Exception) {
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
    } catch (exception: Exception) {
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

private sealed interface WeatherState {
    data object Loading : WeatherState
    data class Ready(
        val temperature: Double,
        val feelsLike: Double,
        val wind: Double,
        val humidity: Double,
        val precipitation: Double,
        val description: String,
        val place: String,
        val outlook: List<WeatherOutlook>,
        val forecast: List<WeatherForecastDay>
    ) : WeatherState

    data class Error(val message: String) : WeatherState
}

private data class WeatherOutlook(
    val timeLabel: String,
    val temperature: Double,
    val feelsLike: Double,
    val rainChance: Int,
    val description: String
)

private data class WeatherForecastDay(
    val dayLabel: String,
    val high: Double,
    val low: Double,
    val rainChance: Int,
    val description: String
)

private suspend fun loadWeather(context: Context): WeatherState {
    return withContext(Dispatchers.IO) {
        try {
            val location = lastKnownLocation(context)
            val lat = location?.latitude ?: SAN_JUAN_LAT
            val lon = location?.longitude ?: SAN_JUAN_LON
            val place = if (location == null) "San Juan fallback" else "Local weather"
            val url = "https://api.open-meteo.com/v1/forecast" +
                "?latitude=$lat&longitude=$lon" +
                "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m" +
                "&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code" +
                "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
                "&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=5"
            val body = URL(url).openStream().bufferedReader().use { it.readText() }
            val root = JSONObject(body)
            val current = root.getJSONObject("current")
            WeatherState.Ready(
                temperature = current.getDouble("temperature_2m"),
                feelsLike = current.getDouble("apparent_temperature"),
                wind = current.getDouble("wind_speed_10m"),
                humidity = current.getDouble("relative_humidity_2m"),
                precipitation = current.getDouble("precipitation"),
                description = weatherDescription(current.getInt("weather_code")),
                place = place,
                outlook = parseHourlyOutlook(root.optJSONObject("hourly")),
                forecast = parseDailyForecast(root.optJSONObject("daily"))
            )
        } catch (exception: Exception) {
            WeatherState.Error("Tap Refresh to try again")
        }
    }
}

private fun parseHourlyOutlook(hourly: JSONObject?): List<WeatherOutlook> {
    if (hourly == null) return emptyList()
    val times = hourly.optJSONArray("time") ?: return emptyList()
    val temperatures = hourly.optJSONArray("temperature_2m") ?: return emptyList()
    val feelsLike = hourly.optJSONArray("apparent_temperature") ?: return emptyList()
    val rain = hourly.optJSONArray("precipitation_probability") ?: return emptyList()
    val codes = hourly.optJSONArray("weather_code") ?: return emptyList()
    val start = findNextHourlyIndex(times)
    return listOf(start, start + 3, start + 6, start + 9)
        .filter { it in 0 until times.length() }
        .map { index ->
            WeatherOutlook(
                timeLabel = formatHourLabel(times.optString(index)),
                temperature = temperatures.optDouble(index),
                feelsLike = feelsLike.optDouble(index),
                rainChance = rain.optInt(index),
                description = weatherDescription(codes.optInt(index))
            )
        }
}

private fun parseDailyForecast(daily: JSONObject?): List<WeatherForecastDay> {
    if (daily == null) return emptyList()
    val times = daily.optJSONArray("time") ?: return emptyList()
    val codes = daily.optJSONArray("weather_code") ?: return emptyList()
    val highs = daily.optJSONArray("temperature_2m_max") ?: return emptyList()
    val lows = daily.optJSONArray("temperature_2m_min") ?: return emptyList()
    val rain = daily.optJSONArray("precipitation_probability_max") ?: return emptyList()
    return (0 until times.length()).map { index ->
        WeatherForecastDay(
            dayLabel = formatDayLabel(times.optString(index)),
            high = highs.optDouble(index),
            low = lows.optDouble(index),
            rainChance = rain.optInt(index),
            description = weatherDescription(codes.optInt(index))
        )
    }
}

private fun findNextHourlyIndex(times: JSONArray): Int {
    val currentHour = java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH"))
    for (index in 0 until times.length()) {
        if (times.optString(index).take(13) >= currentHour) return index
    }
    return 0
}

private fun formatHourLabel(value: String): String {
    return runCatching {
        val hour = value.substringAfter("T").take(2).toInt()
        val suffix = if (hour < 12) "AM" else "PM"
        val display = when (val adjusted = hour % 12) {
            0 -> 12
            else -> adjusted
        }
        "$display $suffix"
    }.getOrDefault(value)
}

private fun formatDayLabel(value: String): String {
    return runCatching {
        val date = LocalDate.parse(value)
        val today = LocalDate.now()
        when (date) {
            today -> "Today"
            today.plusDays(1) -> "Tomorrow"
            else -> date.format(DateTimeFormatter.ofPattern("EEE, MMM d", Locale.US))
        }
    }.getOrDefault(value)
}

private fun lastKnownLocation(context: Context): Location? {
    if (context.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
        return null
    }
    val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return null
    return locationManager.getProviders(true)
        .mapNotNull { provider ->
            try {
                locationManager.getLastKnownLocation(provider)
            } catch (exception: SecurityException) {
                null
            }
        }
        .maxByOrNull { it.time }
}

private fun weatherDescription(code: Int): String {
    return when (code) {
        0 -> "Clear"
        1, 2 -> "Partly cloudy"
        3 -> "Cloudy"
        45, 48 -> "Fog"
        51, 53, 55 -> "Drizzle"
        56, 57 -> "Freezing drizzle"
        61, 63, 65 -> "Rain"
        66, 67 -> "Freezing rain"
        71, 73, 75, 77 -> "Snow"
        80, 81, 82 -> "Rain showers"
        85, 86 -> "Snow showers"
        95 -> "Thunderstorms"
        96, 99 -> "Storms with hail"
        else -> "Current conditions"
    }
}

private fun healthLabel(health: StationHealth?): String {
    return when (health) {
        StationHealth.Buffering -> " / buffering"
        StationHealth.Online -> " / online"
        StationHealth.Retrying -> " / retrying"
        StationHealth.Offline -> " / offline"
        null -> ""
    }
}

private fun healthColor(health: StationHealth?): Color {
    return when (health) {
        StationHealth.Retrying -> Gold
        StationHealth.Offline -> Coral
        else -> Teal
    }
}

private fun weatherDashboardText(weather: WeatherState): String {
    return when (weather) {
        WeatherState.Loading -> "Weather / updating"
        is WeatherState.Ready -> "Weather / ${weather.temperature.roundToInt()}°F / feels ${weather.feelsLike.roundToInt()}°F / ${weather.description}"
        is WeatherState.Error -> "Weather / unavailable"
    }
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
