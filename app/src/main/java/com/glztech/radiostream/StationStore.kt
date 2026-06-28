package com.glztech.radiostream

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

internal object StationStore {
    private const val APP_PREFS = "radio_streamer"
    private const val STATIONS_PREF = "stations_json"

    fun load(context: Context): List<Station> {
        val raw = context.getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
            .getString(STATIONS_PREF, null)
            ?: return StationCatalog.all().toList()

        return runCatching {
            val array = JSONArray(raw)
            buildList {
                for (index in 0 until array.length()) {
                    val item = array.getJSONObject(index)
                    val name = item.optString("name").trim()
                    val streamUrl = item.optString("streamUrl").trim()
                    if (name.isNotBlank() && streamUrl.isNotBlank()) {
                        add(
                            Station(
                                name,
                                item.optString("logoUrl").trim(),
                                streamUrl,
                                item.optString("frequency").trim().ifBlank { "Live" },
                                item.optString("callSign").trim().ifBlank { null },
                                item.optString("tagline").trim(),
                                item.optString("location").trim()
                            )
                        )
                    }
                }
            }.ifEmpty { StationCatalog.all().toList() }
        }.getOrElse {
            StationCatalog.all().toList()
        }
    }

    fun save(context: Context, stations: List<Station>) {
        val array = JSONArray()
        stations.forEach { station ->
            array.put(
                JSONObject()
                    .put("name", station.name)
                    .put("logoUrl", station.logoUrl.orEmpty())
                    .put("streamUrl", station.streamUrl)
                    .put("frequency", station.frequency.orEmpty())
                    .put("callSign", station.callSign.orEmpty())
                    .put("tagline", station.tagline.orEmpty())
                    .put("location", station.location.orEmpty())
            )
        }
        context.getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(STATIONS_PREF, array.toString())
            .apply()
    }

    fun reset(context: Context): List<Station> {
        context.getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
            .edit()
            .remove(STATIONS_PREF)
            .apply()
        return StationCatalog.all().toList()
    }
}
