package com.glztech.radiostream

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

internal object StationStore {
    private const val APP_PREFS = "radio_streamer"
    private const val STATIONS_PREF = "stations_json"
    private const val CUSTOM_STATIONS_PREF = "custom_stations_json"
    private const val REMOTE_CATALOG_URL = "https://radio.glztech.com/stations.json"
    private const val GITHUB_CATALOG_URL = "https://raw.githubusercontent.com/yadielglz/glz-radio/main/web/public/stations.json"

    private val executor = Executors.newSingleThreadExecutor()

    fun load(context: Context): List<Station> {
        val prefs = context.getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
        val catalogRaw = prefs.getString(STATIONS_PREF, null)
        val catalogStations = if (catalogRaw != null) {
            val parsed = parseJsonArray(catalogRaw)
            if (parsed.isEmpty()) {
                prefs.edit().remove(STATIONS_PREF).apply()
                StationCatalog.all().toList()
            } else {
                parsed
            }
        } else {
            StationCatalog.all().toList()
        }

        val customRaw = prefs.getString(CUSTOM_STATIONS_PREF, null)
        val customStations = if (customRaw != null) parseJsonArray(customRaw) else emptyList()

        return catalogStations + customStations
    }

    fun syncRemoteCatalog(context: Context, onComplete: ((Boolean) -> Unit)? = null) {
        executor.submit {
            val jsonString = fetchUrl(REMOTE_CATALOG_URL) ?: fetchUrl(GITHUB_CATALOG_URL)
            if (jsonString != null && jsonString.isNotBlank()) {
                val parsed = parseJsonArray(jsonString)
                if (parsed.isNotEmpty()) {
                    context.getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
                        .edit()
                        .putString(STATIONS_PREF, jsonString)
                        .apply()
                    onComplete?.invoke(true)
                    return@submit
                }
            }
            onComplete?.invoke(false)
        }
    }

    fun addCustomStation(context: Context, station: Station) {
        val currentCustom = getCustomStations(context).toMutableList()
        currentCustom.removeAll { it.name.equals(station.name, ignoreCase = true) || it.streamUrl == station.streamUrl }
        currentCustom.add(station)
        saveCustomStations(context, currentCustom)
    }

    fun removeCustomStation(context: Context, station: Station) {
        val currentCustom = getCustomStations(context).toMutableList()
        currentCustom.removeAll { it.name.equals(station.name, ignoreCase = true) || it.streamUrl == station.streamUrl }
        saveCustomStations(context, currentCustom)
    }

    fun getCustomStations(context: Context): List<Station> {
        val raw = context.getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
            .getString(CUSTOM_STATIONS_PREF, null) ?: return emptyList()
        return parseJsonArray(raw)
    }

    fun isCustomStation(context: Context, station: Station): Boolean {
        return getCustomStations(context).any { it.name.equals(station.name, ignoreCase = true) && it.streamUrl == station.streamUrl }
    }

    private fun saveCustomStations(context: Context, stations: List<Station>) {
        val array = JSONArray()
        stations.forEach { station ->
            array.put(stationToJson(station))
        }
        context.getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(CUSTOM_STATIONS_PREF, array.toString())
            .apply()
    }

    fun save(context: Context, stations: List<Station>) {
        val array = JSONArray()
        stations.forEach { station ->
            array.put(stationToJson(station))
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
            .remove(CUSTOM_STATIONS_PREF)
            .apply()
        return StationCatalog.all().toList()
    }

    private fun stationToJson(station: Station): JSONObject {
        return JSONObject()
            .put("name", station.name)
            .put("logoUrl", station.logoUrl.orEmpty())
            .put("streamUrl", station.streamUrl)
            .put("frequency", station.frequency.orEmpty())
            .put("callSign", station.callSign.orEmpty())
            .put("tagline", station.tagline.orEmpty())
            .put("location", station.location.orEmpty())
    }

    private fun parseJsonArray(raw: String): List<Station> {
        return runCatching {
            val array = JSONArray(raw)
            buildList {
                for (index in 0 until array.length()) {
                    val item = array.getJSONObject(index)
                    val name = cleanString(item, "name")
                    val streamUrl = cleanString(item, "streamUrl")
                    if (name.isNotBlank() && streamUrl.isNotBlank()) {
                        add(
                            Station(
                                name,
                                cleanString(item, "logoUrl"),
                                streamUrl,
                                cleanString(item, "frequency").ifBlank { "Live" },
                                cleanString(item, "callSign").ifBlank { null },
                                cleanString(item, "tagline"),
                                cleanString(item, "location")
                            )
                        )
                    }
                }
            }
        }.getOrDefault(emptyList())
    }

    private fun cleanString(item: JSONObject, key: String): String {
        if (item.isNull(key)) return ""
        val str = item.optString(key, "").trim()
        return if (str.equals("null", ignoreCase = true)) "" else str
    }

    private fun fetchUrl(urlStr: String): String? {
        return try {
            val conn = URL(urlStr).openConnection() as HttpURLConnection
            conn.connectTimeout = 8000
            conn.readTimeout = 8000
            conn.requestMethod = "GET"
            conn.setRequestProperty("Accept", "application/json")
            if (conn.responseCode == 200) {
                val text = conn.inputStream.bufferedReader().use { it.readText() }.trim()
                if (text.startsWith("[")) text else null
            } else null
        } catch (e: Exception) {
            null
        }
    }
}

