package com.glztech.radiostream

import androidx.media3.common.MediaItem
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertSame
import org.junit.Test

class PlaybackServiceTest {
    private val station = Station(
        "Test FM",
        "https://example.com/logo.png",
        "https://example.com/live.mp3",
        "FM 99.9",
        "WTEST",
        "Test station",
        "San Juan, PR"
    )

    @Test
    fun resolvesAndroidAutoMediaIdToStation() {
        val resolved = findStationByMediaId(station.name, listOf(station))

        assertSame(station, resolved)
        assertEquals("https://example.com/live.mp3", resolved?.streamUrl)
    }

    @Test
    fun resolvesAndroidAutoMediaIdCaseInsensitive() {
        val resolved = findStationByMediaId("test fm", listOf(station))
        assertSame(station, resolved)
    }

    @Test
    fun resolvesAndroidAutoMediaIdByCallSign() {
        val resolved = findStationByMediaId("WTEST", listOf(station))
        assertSame(station, resolved)
    }

    @Test
    fun resolvesAndroidAutoMediaIdByStreamUrl() {
        val resolved = findStationByMediaId("https://example.com/live.mp3", listOf(station))
        assertSame(station, resolved)
    }

    @Test
    fun rejectsUnknownAndroidAutoMediaId() {
        assertNull(findStationByMediaId("missing", listOf(station)))
    }

    @Test
    fun resolvePlayableItemsAlwaysProvidesPlayableFallbackOnEmptyOrUnknown() {
        val emptyListResult = resolvePlayableItems(emptyList(), listOf(station))
        assertEquals(1, emptyListResult.size)
        assertEquals(station.name, emptyListResult.first().mediaId)

        val unknownRequested = MediaItem.Builder().setMediaId("non_existent").build()
        val unknownResult = resolvePlayableItems(listOf(unknownRequested), listOf(station))
        assertEquals(1, unknownResult.size)
        assertEquals(station.name, unknownResult.first().mediaId)
    }

    @Test
    fun resolvePlayableItemsUsesExplicitFallbackStation() {
        val alternateStation = Station(
            "Alternate FM",
            "https://example.com/alt.png",
            "https://example.com/alt.mp3",
            "FM 101.1",
            "WALT",
            "Alt station",
            "Ponce, PR"
        )
        val stations = listOf(station, alternateStation)

        val emptyResult = resolvePlayableItems(emptyList(), stations, alternateStation)
        assertEquals(1, emptyResult.size)
        assertEquals(alternateStation.name, emptyResult.first().mediaId)

        val unknownRequested = MediaItem.Builder().setMediaId("non_existent").build()
        val unknownResult = resolvePlayableItems(listOf(unknownRequested), stations, alternateStation)
        assertEquals(1, unknownResult.size)
        assertEquals(alternateStation.name, unknownResult.first().mediaId)
    }

    @Test
    fun isAutoPackageDetectsAndroidAutoAndAutomotive() {
        assertEquals(true, isAutoPackage("com.google.android.projection.gearhead"))
        assertEquals(true, isAutoPackage("com.google.android.carui.media"))
        assertEquals(true, isAutoPackage("com.android.car.media"))
        assertEquals(true, isAutoPackage("com.google.android.apps.gearhead"))
    }

    @Test
    fun isAutoPackageRejectsStandardAppPackages() {
        assertEquals(false, isAutoPackage("com.glztech.radiostream"))
        assertEquals(false, isAutoPackage("com.android.chrome"))
        assertEquals(false, isAutoPackage("com.google.android.music"))
    }

    @Test
    fun findStationByMediaIdHandlesNullAndRootId() {
        assertNull(findStationByMediaId(null, listOf(station)))
        assertNull(findStationByMediaId("", listOf(station)))
        assertNull(findStationByMediaId(PlaybackService.ROOT_ID, listOf(station)))
    }
}
