package com.glztech.radiostream

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class AppUpdaterTest {
    @Test
    fun parsesValidUpdateMetadata() {
        val update = parseUpdate(
            JSONObject(
                """
                {
                  "versionCode": 32001,
                  "versionName": "3.2.1",
                  "minimumSupportedVersionCode": 32000,
                  "apkUrl": "https://github.com/yadielglz/glz-radio/releases/download/v3.2.1/glz-radio-3.2.1.apk",
                  "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                  "releaseNotes": "Playback fixes"
                }
                """.trimIndent()
            )
        )

        assertEquals(32001L, update.versionCode)
        assertEquals("3.2.1", update.versionName)
    }

    @Test(expected = IllegalArgumentException::class)
    fun rejectsInvalidChecksum() {
        parseUpdate(
            JSONObject(
                """
                {
                  "versionCode": 32001,
                  "versionName": "3.2.1",
                  "apkUrl": "https://github.com/yadielglz/glz-radio/releases/download/v3.2.1/app.apk",
                  "sha256": "not-a-checksum"
                }
                """.trimIndent()
            )
        )
    }

    @Test
    fun permitsOnlyExpectedHttpsReleaseHosts() {
        assertTrue(isAllowedDownloadUrl("https://github.com/yadielglz/glz-radio/releases/download/v1/app.apk"))
        assertFalse(isAllowedDownloadUrl("http://github.com/yadielglz/glz-radio/app.apk"))
        assertFalse(isAllowedDownloadUrl("https://example.com/app.apk"))
    }
}
