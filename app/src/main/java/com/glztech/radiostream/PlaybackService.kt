package com.glztech.radiostream

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.util.Log
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.session.LibraryResult
import androidx.media3.session.MediaLibraryService
import androidx.media3.session.MediaSession
import com.google.common.collect.ImmutableList
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import java.util.Locale

@androidx.annotation.OptIn(UnstableApi::class)
class PlaybackService : MediaLibraryService() {
    private var session: MediaLibrarySession? = null
    private var carConnectionReceiver: BroadcastReceiver? = null

    override fun onCreate() {
        super.onCreate()
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = if (launchIntent != null) {
            PendingIntent.getActivity(
                this,
                0,
                launchIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
        } else null

        val builder = MediaLibrarySession.Builder(this, RadioPlayback.player(this), LibraryCallback(this))
        if (pendingIntent != null) {
            builder.setSessionActivity(pendingIntent)
        }
        session = builder.build()
        registerCarConnectionReceiver()
    }

    private fun registerCarConnectionReceiver() {
        carConnectionReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent?) {
                if (intent?.action == ACTION_CAR_CONNECTION_UPDATED) {
                    val connectionType = intent.getIntExtra(EXTRA_CAR_CONNECTION_STATE, CONNECTION_TYPE_NOT_CONNECTED)
                    Log.i(TAG, "Car connection broadcast received: state=$connectionType")
                    val player = session?.player ?: RadioPlayback.player(context)
                    if (connectionType == CONNECTION_TYPE_NOT_CONNECTED) {
                        // Disconnected from Android Auto / Automotive -> Stop playing and buffering
                        Log.i(TAG, "Car disconnected: stopping playback and buffering")
                        val currentMediaId = player.currentMediaItem?.mediaId
                        val stations = StationStore.load(context)
                        findStationByMediaId(currentMediaId, stations)?.let { station ->
                            StationStore.setLastAutoStation(context, station)
                        }
                        player.stop()
                        player.clearMediaItems()
                    } else if (connectionType == CONNECTION_TYPE_PROJECTION || connectionType == CONNECTION_TYPE_NATIVE) {
                        // Connected to Android Auto / Automotive -> Restart last played station
                        Log.i(TAG, "Car connected: restarting last played station")
                        val lastStation = StationStore.getLastAutoStation(context)
                            ?: StationStore.getLastStation(context)
                            ?: StationStore.load(context).firstOrNull()
                            ?: StationCatalog.all().first()

                        if (!player.isPlaying) {
                            player.setMediaItem(RadioPlayback.stationItem(lastStation))
                            player.prepare()
                            player.play()
                        }
                    }
                }
            }
        }
        val filter = IntentFilter(ACTION_CAR_CONNECTION_UPDATED)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(carConnectionReceiver, filter, Context.RECEIVER_EXPORTED)
        } else {
            registerReceiver(carConnectionReceiver, filter)
        }
    }

    private fun unregisterCarConnectionReceiver() {
        carConnectionReceiver?.let {
            try {
                unregisterReceiver(it)
            } catch (e: Exception) {
                Log.w(TAG, "Failed to unregister car connection receiver", e)
            }
            carConnectionReceiver = null
        }
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaLibrarySession? {
        return session
    }

    override fun onDestroy() {
        unregisterCarConnectionReceiver()
        session?.release()
        session = null
        RadioPlayback.release(this)
        super.onDestroy()
    }

    override fun onTaskRemoved(rootIntent: android.content.Intent?) {
        // Swiping the task away is an explicit exit. Ordinary backgrounding,
        // screen-off, and Home navigation continue playback through this service.
        SleepTimer.cancel()
        session?.player?.run {
            stop()
            clearMediaItems()
        }
        pauseAllPlayersAndStopSelf()
        stopSelf()
        super.onTaskRemoved(rootIntent)
    }

    override fun onTrimMemory(level: Int) {
        super.onTrimMemory(level)
        if (level >= android.content.ComponentCallbacks2.TRIM_MEMORY_UI_HIDDEN) {
            RadioPlayback.trimMemory()
        }
    }

    private class LibraryCallback(private val context: Context) : MediaLibrarySession.Callback {
        private val activeAutoControllers = mutableSetOf<MediaSession.ControllerInfo>()

        override fun onConnect(
            session: MediaSession,
            controller: MediaSession.ControllerInfo
        ): MediaSession.ConnectionResult {
            val isAuto = isAutoController(session, controller)
            Log.i(TAG, "onConnect: pkg=${controller.packageName}, isAuto=$isAuto")

            if (isAuto) {
                activeAutoControllers.add(controller)
                val lastStation = StationStore.getLastAutoStation(context)
                    ?: StationStore.getLastStation(context)
                    ?: StationStore.load(context).firstOrNull()
                    ?: StationCatalog.all().first()

                val player = session.player
                if (!player.isPlaying) {
                    val item = RadioPlayback.stationItem(lastStation)
                    player.setMediaItem(item)
                    player.prepare()
                    player.play()
                }
            }

            val sessionCommands = MediaSession.ConnectionResult.DEFAULT_SESSION_COMMANDS.buildUpon().build()
            val playerCommands = MediaSession.ConnectionResult.DEFAULT_PLAYER_COMMANDS.buildUpon().build()

            return MediaSession.ConnectionResult.AcceptedResultBuilder(session)
                .setAvailableSessionCommands(sessionCommands)
                .setAvailablePlayerCommands(playerCommands)
                .build()
        }

        override fun onDisconnected(
            session: MediaSession,
            controller: MediaSession.ControllerInfo
        ) {
            val wasAuto = isAutoController(session, controller) || activeAutoControllers.contains(controller)
            activeAutoControllers.remove(controller)
            Log.i(TAG, "onDisconnected: pkg=${controller.packageName}, wasAuto=$wasAuto, remainingAuto=${activeAutoControllers.size}")

            if (wasAuto && activeAutoControllers.isEmpty()) {
                val stations = StationStore.load(context)
                val currentMediaId = session.player.currentMediaItem?.mediaId
                val currentStation = findStationByMediaId(currentMediaId, stations)
                if (currentStation != null) {
                    StationStore.setLastAutoStation(context, currentStation)
                }

                Log.i(TAG, "Android Auto disconnected: stopping player and buffering")
                session.player.stop()
                session.player.clearMediaItems()
            }
            super.onDisconnected(session, controller)
        }

        override fun onGetLibraryRoot(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            params: LibraryParams?
        ): ListenableFuture<LibraryResult<MediaItem>> {
            return Futures.immediateFuture(LibraryResult.ofItem(RadioPlayback.rootItem(), params))
        }

        override fun onGetChildren(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            parentId: String,
            page: Int,
            pageSize: Int,
            params: LibraryParams?
        ): ListenableFuture<LibraryResult<ImmutableList<MediaItem>>> {
            val items = if (parentId == ROOT_ID) {
                StationStore.load(context).map { RadioPlayback.stationItem(it) }
            } else {
                emptyList()
            }
            return Futures.immediateFuture(LibraryResult.ofItemList(items, params))
        }

        override fun onGetItem(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            mediaId: String
        ): ListenableFuture<LibraryResult<MediaItem>> {
            if (mediaId == ROOT_ID) {
                return Futures.immediateFuture(LibraryResult.ofItem(RadioPlayback.rootItem(), null))
            }
            val stations = StationStore.load(context)
            val isAuto = isAutoController(session, browser)
            val fallbackStation = (if (isAuto) StationStore.getLastAutoStation(context) else null)
                ?: StationStore.getLastStation(context)
                ?: stations.firstOrNull()
                ?: StationCatalog.all().first()

            val station = findStationByMediaId(mediaId, stations) ?: fallbackStation
            return Futures.immediateFuture(LibraryResult.ofItem(RadioPlayback.stationItem(station), null))
        }

        override fun onAddMediaItems(
            mediaSession: MediaSession,
            controller: MediaSession.ControllerInfo,
            mediaItems: List<MediaItem>
        ): ListenableFuture<List<MediaItem>> {
            val isAuto = isAutoController(mediaSession, controller)
            val stations = StationStore.load(context)
            val fallbackStation = (if (isAuto) StationStore.getLastAutoStation(context) else null)
                ?: StationStore.getLastStation(context)
                ?: stations.firstOrNull()
                ?: StationCatalog.all().first()

            val resolved = resolvePlayableItems(mediaItems, stations, fallbackStation)
            if (isAuto) {
                resolved.firstOrNull()?.let { item ->
                    findStationByMediaId(item.mediaId, stations)?.let { station ->
                        StationStore.setLastAutoStation(context, station)
                    }
                }
            }
            return Futures.immediateFuture(resolved)
        }

        override fun onSetMediaItems(
            mediaSession: MediaSession,
            controller: MediaSession.ControllerInfo,
            mediaItems: List<MediaItem>,
            startIndex: Int,
            startPositionMs: Long
        ): ListenableFuture<MediaSession.MediaItemsWithStartPosition> {
            val isAuto = isAutoController(mediaSession, controller)
            val stations = StationStore.load(context)
            val fallbackStation = (if (isAuto) StationStore.getLastAutoStation(context) else null)
                ?: StationStore.getLastStation(context)
                ?: stations.firstOrNull()
                ?: StationCatalog.all().first()

            val resolved = resolvePlayableItems(mediaItems, stations, fallbackStation)
            if (isAuto) {
                resolved.firstOrNull()?.let { item ->
                    findStationByMediaId(item.mediaId, stations)?.let { station ->
                        StationStore.setLastAutoStation(context, station)
                    }
                }
            }
            return Futures.immediateFuture(
                MediaSession.MediaItemsWithStartPosition(
                    resolved,
                    startIndex.coerceIn(0, (resolved.size - 1).coerceAtLeast(0)),
                    startPositionMs
                )
            )
        }

        override fun onPlaybackResumption(
            mediaSession: MediaSession,
            controller: MediaSession.ControllerInfo
        ): ListenableFuture<MediaSession.MediaItemsWithStartPosition> {
            val isAuto = isAutoController(mediaSession, controller)
            val lastStation = (if (isAuto) StationStore.getLastAutoStation(context) else null)
                ?: StationStore.getLastStation(context)
                ?: StationStore.load(context).firstOrNull()
                ?: StationCatalog.all().first()

            if (isAuto) {
                StationStore.setLastAutoStation(context, lastStation)
            }

            val item = RadioPlayback.stationItem(lastStation)
            val startPosition = MediaSession.MediaItemsWithStartPosition(
                listOf(item),
                0,
                0L
            )
            return Futures.immediateFuture(startPosition)
        }

        override fun onSearch(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            query: String,
            params: LibraryParams?
        ): ListenableFuture<LibraryResult<Void>> {
            val matchCount = StationStore.load(context).count { it.matches(query) }
            session.notifySearchResultChanged(browser, query, matchCount, params)
            return Futures.immediateFuture(LibraryResult.ofVoid())
        }

        override fun onGetSearchResult(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            query: String,
            page: Int,
            pageSize: Int,
            params: LibraryParams?
        ): ListenableFuture<LibraryResult<ImmutableList<MediaItem>>> {
            val matches = StationStore.load(context)
                .filter { it.matches(query) }
                .map { RadioPlayback.stationItem(it) }
            return Futures.immediateFuture(LibraryResult.ofItemList(matches, params))
        }
    }

    companion object {
        const val TAG = "PlaybackService"
        const val ROOT_ID = "glz_radio_root"
        const val ACTION_CAR_CONNECTION_UPDATED = "androidx.car.app.connection.action.CAR_CONNECTION_UPDATED"
        const val EXTRA_CAR_CONNECTION_STATE = "androidx.car.app.connection.extra.CAR_CONNECTION_STATE"
        const val CONNECTION_TYPE_NOT_CONNECTED = 0
        const val CONNECTION_TYPE_NATIVE = 1
        const val CONNECTION_TYPE_PROJECTION = 2
    }
}

internal fun isAutoPackage(packageName: String): Boolean {
    val pkg = packageName.lowercase(Locale.ROOT)
    return pkg == "com.google.android.projection.gearhead" ||
        pkg == "com.google.android.carui.media" ||
        pkg.contains("gearhead") ||
        pkg.contains("android.car")
}

internal fun isAutoController(session: MediaSession, controller: MediaSession.ControllerInfo): Boolean {
    if (session.isAutoCompanionController(controller) || session.isAutomotiveController(controller)) {
        return true
    }
    return isAutoPackage(controller.packageName)
}

internal fun findStationByMediaId(mediaId: String?, stations: List<Station>): Station? {
    if (mediaId.isNullOrBlank() || mediaId == PlaybackService.ROOT_ID) return null

    // 1. Exact name match
    stations.firstOrNull { it.name.equals(mediaId, ignoreCase = true) }?.let { return it }

    // 2. Stream URL match
    stations.firstOrNull { it.streamUrl.equals(mediaId, ignoreCase = true) }?.let { return it }

    // 3. Callsign match
    stations.firstOrNull { it.callSign?.equals(mediaId, ignoreCase = true) == true }?.let { return it }

    // 4. Fuzzy match / contains
    stations.firstOrNull { it.matches(mediaId) }?.let { return it }

    return null
}

internal fun resolvePlayableItems(
    requestedItems: List<MediaItem>,
    stations: List<Station>,
    fallbackStation: Station? = null
): List<MediaItem> {
    val fallback = fallbackStation
        ?: stations.firstOrNull()
        ?: StationCatalog.all().first()

    if (requestedItems.isEmpty()) {
        return listOf(RadioPlayback.stationItem(fallback))
    }

    return requestedItems.map { requested ->
        if (requested.localConfiguration != null && requested.mediaId != PlaybackService.ROOT_ID) {
            requested
        } else {
            val station = findStationByMediaId(requested.mediaId, stations) ?: fallback
            RadioPlayback.stationItem(station)
        }
    }
}

internal fun resolvePlayableItems(
    requestedItems: List<MediaItem>,
    stations: List<Station>,
    context: Context?
): List<MediaItem> {
    val fallback = (context?.let { StationStore.getLastStation(it) }
        ?: stations.firstOrNull()
        ?: StationCatalog.all().first())
    return resolvePlayableItems(requestedItems, stations, fallback)
}


