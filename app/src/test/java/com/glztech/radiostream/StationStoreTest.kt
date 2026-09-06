package com.glztech.radiostream

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class StationStoreTest {

    @Test
    fun parsesGlzHubCatalogFormat() {
        val glzHubJson = """
        {
          "version": "27c655d5c8daa35045aa02b2c0afcc9479fe15d15317cbd2584dee72cda0cb86",
          "generatedAt": "2026-09-06T21:06:44.500Z",
          "stations": [
            {
              "code": "RADIO_LAT99",
              "name": "ONLINE | LATINO 99",
              "genre": "Online Radio",
              "streamUrl": "https://lmmradiocast.com/Latino99fm?_=68068",
              "logoUrl": "https://mm.aiircdn.com/371/5928f28889f51.png",
              "epgChannelId": "radio.lat99",
              "bitrateKbps": 128,
              "requestHeaders": {}
            },
            {
              "code": "RADIO_WFID",
              "name": "FM 95.7 | FIDELITY",
              "genre": "FM Radio",
              "streamUrl": "https://server7.servistreaming.com/proxy/fidelity?mp=%2Fstream%3Ftype%3D.mp3&_=1",
              "logoUrl": "https://fidelitypr.com/wp-content/uploads/2025/09/cropped-Untitled-design-45.png",
              "epgChannelId": "radio.wfid",
              "bitrateKbps": 128,
              "requestHeaders": {}
            },
            {
              "code": "RADIO_WKAQAM",
              "name": "AM 580 | WKAQ AM",
              "genre": "AM Radio",
              "streamUrl": "https://televicentro.streamguys1.com/wkaqqam-icy",
              "logoUrl": "https://bloximages.chicago2.vip.townnews.com/wkaq580.png",
              "epgChannelId": "radio.wkaqam",
              "bitrateKbps": 128,
              "requestHeaders": {}
            }
          ]
        }
        """.trimIndent()

        val stations = StationStore.parseCatalogJson(glzHubJson)
        assertEquals(3, stations.size)

        val lat99 = stations[0]
        assertEquals("LATINO 99", lat99.name)
        assertEquals("Satellite", lat99.band())
        assertEquals("https://lmmradiocast.com/Latino99fm?_=68068", lat99.streamUrl)

        val wfid = stations[1]
        assertEquals("FIDELITY", wfid.name)
        assertEquals("FM", wfid.band())
        assertEquals("FM 95.7", wfid.frequency)

        val wkaq = stations[2]
        assertEquals("WKAQ AM", wkaq.name)
        assertEquals("AM", wkaq.band())
        assertEquals("AM 580", wkaq.frequency)
    }

    @Test
    fun parsesLegacyArrayCatalogFormat() {
        val legacyJson = """
        [
          {
            "name": "Radio Isla",
            "logoUrl": "https://radioIsla.tv/logo.png",
            "streamUrl": "https://server7.servistreaming.com/proxy/radioisla",
            "frequency": "AM 1320",
            "callSign": "WSKN AM",
            "tagline": "Radio Isla",
            "location": "San Juan, PR"
          }
        ]
        """.trimIndent()

        val stations = StationStore.parseCatalogJson(legacyJson)
        assertEquals(1, stations.size)
        assertEquals("Radio Isla", stations[0].name)
        assertEquals("AM 1320", stations[0].frequency)
        assertEquals("WSKN AM", stations[0].callSign)
    }
}
