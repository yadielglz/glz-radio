package com.glztech.radiostream

import android.content.Context
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata

/**
 * Android Auto's host renders this media hierarchy. No phone Activity or network
 * request is required for a cold-start browse request.
 */
internal object AutoLibrary {
    const val ALL = "glz:auto:all"
    const val FAVORITES = "glz:auto:favorites"
    const val RECENT = "glz:auto:recent"
    const val LAST = "glz:auto:last"

    fun stations(context: Context): List<Station> =
        runCatching { StationStore.load(context) }
            .getOrDefault(emptyList())
            .ifEmpty { StationCatalog.all().toList() }

    fun root(): MediaItem = folder(PlaybackService.ROOT_ID, "Glz Radio")

    private fun folder(id: String, title: String): MediaItem =
        MediaItem.Builder().setMediaId(id).setMediaMetadata(
            MediaMetadata.Builder().setTitle(title)
                .setIsBrowsable(true).setIsPlayable(false)
                .setMediaType(MediaMetadata.MEDIA_TYPE_FOLDER_MIXED).build()
        ).build()

    fun children(context: Context, parentId: String): List<MediaItem> {
        val stations = stations(context)
        return when (parentId) {
            PlaybackService.ROOT_ID -> listOf(
                folder(ALL, "All Stations"),
                folder(FAVORITES, "Favorites"),
                folder(RECENT, "Recently Played"),
                folder(LAST, "Last Played Station")
            )
            ALL -> stations.map(RadioPlayback::stationItem)
            FAVORITES -> {
                val favorites = context.getSharedPreferences("radio_streamer", Context.MODE_PRIVATE)
                    .getStringSet("favorites", emptySet()).orEmpty()
                stations.filter { station ->
                    favorites.any { it.equals(station.name, true) || it == station.streamUrl }
                }.map(RadioPlayback::stationItem)
            }
            RECENT -> listOfNotNull(StationStore.getLastAutoStation(context),
                StationStore.getLastStation(context)).distinctBy { it.streamUrl }
                .map(RadioPlayback::stationItem)
            LAST -> listOfNotNull(StationStore.getLastAutoStation(context)
                ?: StationStore.getLastStation(context) ?: stations.firstOrNull())
                .map(RadioPlayback::stationItem)
            else -> emptyList()
        }
    }

    fun item(context: Context, id: String): MediaItem? =
        when (id) {
            PlaybackService.ROOT_ID -> root()
            ALL -> folder(ALL, "All Stations")
            FAVORITES -> folder(FAVORITES, "Favorites")
            RECENT -> folder(RECENT, "Recently Played")
            LAST -> folder(LAST, "Last Played Station")
            else -> findStationByMediaId(id, stations(context))?.let(RadioPlayback::stationItem)
        }
}
