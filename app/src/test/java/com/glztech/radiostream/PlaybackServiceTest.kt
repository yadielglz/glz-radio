package com.glztech.radiostream

import org.junit.Assert.assertEquals
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
    fun rejectsUnknownAndroidAutoMediaId() {
        assertNull(findStationByMediaId("missing", listOf(station)))
    }
}
