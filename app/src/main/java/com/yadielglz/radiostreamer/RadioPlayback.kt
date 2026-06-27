package com.yadielglz.radiostreamer

import android.content.Context
import android.net.Uri
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.exoplayer.ExoPlayer

object RadioPlayback {
    private var player: ExoPlayer? = null

    internal fun player(context: Context): ExoPlayer {
        return player ?: ExoPlayer.Builder(context.applicationContext).build().apply {
            setAudioAttributes(
                AudioAttributes.Builder()
                    .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
                    .setUsage(C.USAGE_MEDIA)
                    .build(),
                true
            )
            setWakeMode(C.WAKE_MODE_NETWORK)
            player = this
        }
    }

    internal fun stationItem(station: Station): MediaItem {
        return MediaItem.Builder()
            .setMediaId(station.name)
            .setUri(station.streamUrl)
            .setMediaMetadata(
                MediaMetadata.Builder()
                    .setTitle(station.name)
                    .setArtist(station.location)
                    .setAlbumTitle(station.meta())
                    .setArtworkUri(Uri.parse(station.logoUrl))
                    .setIsPlayable(true)
                    .setIsBrowsable(false)
                    .build()
            )
            .build()
    }

    internal fun rootItem(): MediaItem {
        return MediaItem.Builder()
            .setMediaId(PlaybackService.ROOT_ID)
            .setMediaMetadata(
                MediaMetadata.Builder()
                    .setTitle("Glz Radio")
                    .setIsPlayable(false)
                    .setIsBrowsable(true)
                    .build()
            )
            .build()
    }

    internal fun release() {
        player?.release()
        player = null
    }
}
