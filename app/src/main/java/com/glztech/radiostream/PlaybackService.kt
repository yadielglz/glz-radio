package com.glztech.radiostream

import android.app.PendingIntent
import android.content.Context
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
        Log.i("GlzAuto", "MediaLibrarySession created")
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaLibrarySession? {
        Log.i("GlzAuto", "onGetSession: ${controllerInfo.packageName}, ready=${session != null}")
        return session
    }

    override fun onDestroy() {
        session?.release()
        session = null
        RadioPlayback.release(this)
        super.onDestroy()
    }

    override fun onTaskRemoved(rootIntent: android.content.Intent?) {
        // Android Auto may remain connected after the phone task is removed.
        if (session?.player?.playWhenReady == true || session?.player?.isPlaying == true) return
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
        override fun onGetLibraryRoot(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            params: LibraryParams?
        ): ListenableFuture<LibraryResult<MediaItem>> {
            Log.i("GlzAuto", "root requested by ${browser.packageName}")
            return Futures.immediateFuture(LibraryResult.ofItem(AutoLibrary.root(), params))
        }

        override fun onGetChildren(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            parentId: String,
            page: Int,
            pageSize: Int,
            params: LibraryParams?
        ): ListenableFuture<LibraryResult<ImmutableList<MediaItem>>> {
            val items = runCatching { AutoLibrary.children(context, parentId) }
                .onFailure { Log.e("GlzAuto", "browse failed: $parentId", it) }
                .getOrDefault(emptyList())
            Log.i("GlzAuto", "children: parent=$parentId count=${items.size} client=${browser.packageName}")
            // Android Auto hosts can request the complete category without pagination.
            return Futures.immediateFuture(LibraryResult.ofItemList(items, params))
        }

        override fun onGetItem(
            session: MediaLibrarySession,
            browser: MediaSession.ControllerInfo,
            mediaId: String
        ): ListenableFuture<LibraryResult<MediaItem>> {
            AutoLibrary.item(context, mediaId)?.let {
                return Futures.immediateFuture(LibraryResult.ofItem(it, null))
            }
            val stations = AutoLibrary.stations(context)
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
                ?: AutoLibrary.stations(context).firstOrNull()
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
            val matchCount = AutoLibrary.stations(context).count { it.matches(query) }
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
            val matches = AutoLibrary.stations(context)
                .filter { it.matches(query) }
                .map { RadioPlayback.stationItem(it) }
            return Futures.immediateFuture(LibraryResult.ofItemList(matches, params))
        }
    }

    companion object {
        const val ROOT_ID = "glz_radio_root"
    }
}

internal fun isAutoPackage(packageName: String): Boolean {
    val pkg = packageName.lowercase(Locale.ROOT)
    return pkg == "com.google.android.projection.gearhead" ||
        pkg == "com.google.android.carui.media" ||
        pkg.contains("gearhead") ||
        pkg.contains("android.car")
}

@androidx.annotation.OptIn(UnstableApi::class)
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

@androidx.annotation.OptIn(UnstableApi::class)
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

