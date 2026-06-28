package com.glztech.radiostream

import android.content.Context
import android.net.Uri
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.datasource.DefaultDataSource
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.exoplayer.DefaultLoadControl
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory

object RadioPlayback {
    private var player: ExoPlayer? = null

    internal fun player(context: Context): ExoPlayer {
        val appContext = context.applicationContext
        val httpDataSourceFactory = DefaultHttpDataSource.Factory()
            .setAllowCrossProtocolRedirects(true)
            .setConnectTimeoutMs(15_000)
            .setReadTimeoutMs(30_000)
            .setUserAgent("GlzRadio/1.0")
            .setDefaultRequestProperties(
                mapOf(
                    "Connection" to "keep-alive",
                    "Icy-MetaData" to "1"
                )
            )
        val dataSourceFactory = DefaultDataSource.Factory(appContext, httpDataSourceFactory)
        val loadControl = DefaultLoadControl.Builder()
            .setBufferDurationsMs(
                15_000,
                90_000,
                2_500,
                5_000
            )
            .build()
        return player ?: ExoPlayer.Builder(appContext)
            .setMediaSourceFactory(DefaultMediaSourceFactory(dataSourceFactory))
            .setLoadControl(loadControl)
            .build()
            .apply {
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
