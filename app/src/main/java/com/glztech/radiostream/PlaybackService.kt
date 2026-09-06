package com.glztech.radiostream

import android.app.PendingIntent
import android.content.Context
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.session.LibraryResult
import androidx.media3.session.MediaLibraryService
import androidx.media3.session.MediaSession
import com.google.common.collect.ImmutableList
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture

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
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaLibrarySession? {
        return session
    }

    override fun onDestroy() {
        session?.release()
        session = null
        RadioPlayback.release()
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
            val station = findStationByMediaId(mediaId, stations)
                ?: StationStore.getLastStation(context)
                ?: stations.firstOrNull()
                ?: StationCatalog.all().first()

            return Futures.immediateFuture(LibraryResult.ofItem(RadioPlayback.stationItem(station), null))
        }

        override fun onAddMediaItems(
            mediaSession: MediaSession,
            controller: MediaSession.ControllerInfo,
            mediaItems: List<MediaItem>
        ): ListenableFuture<List<MediaItem>> {
            val stations = StationStore.load(context)
            val resolved = resolvePlayableItems(mediaItems, stations, context)
            return Futures.immediateFuture(resolved)
        }

        override fun onPlaybackResumption(
            mediaSession: MediaSession,
            controller: MediaSession.ControllerInfo
        ): ListenableFuture<MediaSession.MediaItemsWithStartPosition> {
            val lastStation = StationStore.getLastStation(context)
                ?: StationStore.load(context).firstOrNull()
                ?: StationCatalog.all().first()

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
        const val ROOT_ID = "glz_radio_root"
    }
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
    context: Context? = null
): List<MediaItem> {
    val fallbackStation by lazy {
        (context?.let { StationStore.getLastStation(it) }
            ?: stations.firstOrNull()
            ?: StationCatalog.all().first())
    }

    if (requestedItems.isEmpty()) {
        return listOf(RadioPlayback.stationItem(fallbackStation))
    }

    return requestedItems.map { requested ->
        if (requested.localConfiguration != null && requested.mediaId != PlaybackService.ROOT_ID) {
            requested
        } else {
            val station = findStationByMediaId(requested.mediaId, stations) ?: fallbackStation
            RadioPlayback.stationItem(station)
        }
    }
}
