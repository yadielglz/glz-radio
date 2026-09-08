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
    private const val LAST_STATION_PREF = "last_station_name"
    private const val LAST_AUTO_STATION_PREF = "last_auto_station_name"
    private const val REMOTE_CATALOG_URL = "https://glzhub.glztech.com/api/v1/radio/stations"
    private const val FALLBACK_CATALOG_URL = "https://radio.glztech.com/stations.json"
    private const val GITHUB_CATALOG_URL = "https://raw.githubusercontent.com/yadielglz/glz-radio/main/web/public/stations.json"

    private val executor = Executors.newSingleThreadExecutor()

    fun load(context: Context): List<Station> {
        val prefs = context.getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
        val catalogRaw = prefs.getString(STATIONS_PREF, null)
        val catalogStations = if (catalogRaw != null) {
            val parsed = parseCatalogJson(catalogRaw)
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
        val customStations = if (customRaw != null) parseCatalogJson(customRaw) else emptyList()

        return catalogStations + customStations
    }

    fun syncRemoteCatalog(context: Context, onComplete: ((Boolean) -> Unit)? = null) {
        executor.submit {
            val jsonString = fetchUrl(REMOTE_CATALOG_URL)
                ?: fetchUrl(FALLBACK_CATALOG_URL)
                ?: fetchUrl(GITHUB_CATALOG_URL)

            if (jsonString != null && jsonString.isNotBlank()) {
                val parsed = parseCatalogJson(jsonString)
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

    fun getLastStation(context: Context): Station? {
        val allStations = load(context)
        if (allStations.isEmpty()) return null
        val lastStationName = context.getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
            .getString(LAST_STATION_PREF, null) ?: return allStations.firstOrNull()

        return allStations.firstOrNull {
            it.name.equals(lastStationName, ignoreCase = true) ||
                it.callSign.equals(lastStationName, ignoreCase = true) ||
                it.streamUrl == lastStationName
        } ?: allStations.firstOrNull()
    }

    fun setLastStation(context: Context, station: Station) {
        context.getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(LAST_STATION_PREF, station.name)
            .apply()
    }

    fun getLastAutoStation(context: Context): Station? {
        val allStations = load(context)
        if (allStations.isEmpty()) return null
        val lastAutoName = context.getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
            .getString(LAST_AUTO_STATION_PREF, null)
            ?: return getLastStation(context)

        return allStations.firstOrNull {
            it.name.equals(lastAutoName, ignoreCase = true) ||
                it.callSign.equals(lastAutoName, ignoreCase = true) ||
                it.streamUrl == lastAutoName
        } ?: getLastStation(context)
    }

    fun setLastAutoStation(context: Context, station: Station) {
        context.getSharedPreferences(APP_PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(LAST_AUTO_STATION_PREF, station.name)
            .apply()
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
        return parseCatalogJson(raw)
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
            .remove(LAST_STATION_PREF)
            .remove(LAST_AUTO_STATION_PREF)
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

    internal fun parseCatalogJson(raw: String): List<Station> {
        return runCatching {
            val trimmed = raw.trim()
            val array = if (trimmed.startsWith("{")) {
                val rootObj = JSONObject(trimmed)
                rootObj.optJSONArray("stations") ?: JSONArray()
            } else {
                JSONArray(trimmed)
            }

            buildList {
                for (index in 0 until array.length()) {
                    val item = array.getJSONObject(index)
                    val streamUrl = cleanString(item, "streamUrl")
                    val rawName = cleanString(item, "name")
                    val logoUrl = cleanString(item, "logoUrl")
                    val genre = cleanString(item, "genre")
                    val explicitFreq = cleanString(item, "frequency")
                    val explicitCallSign = cleanString(item, "callSign")
                    val explicitTagline = cleanString(item, "tagline")
                    val explicitLocation = cleanString(item, "location")

                    if (streamUrl.isNotBlank() && rawName.isNotBlank()) {
                        val (name, freq, callSign, tagline, location) = parseStationMetadata(
                            rawName = rawName,
                            genre = genre,
                            explicitFreq = explicitFreq,
                            explicitCallSign = explicitCallSign,
                            explicitTagline = explicitTagline,
                            explicitLocation = explicitLocation
                        )

                        add(
                            Station(
                                name,
                                logoUrl,
                                streamUrl,
                                freq,
                                callSign,
                                tagline,
                                location
                            )
                        )
                    }
                }
            }
        }.getOrDefault(emptyList())
    }

    private fun parseStationMetadata(
        rawName: String,
        genre: String,
        explicitFreq: String,
        explicitCallSign: String,
        explicitTagline: String,
        explicitLocation: String
    ): ParsedMeta {
        if (explicitFreq.isNotBlank()) {
            return ParsedMeta(
                name = rawName,
                frequency = explicitFreq,
                callSign = explicitCallSign.ifBlank { null },
                tagline = explicitTagline.ifBlank { rawName },
                location = explicitLocation
            )
        }

        // Check if name is formatted like "FM 95.7 | FIDELITY" or "ONLINE | LATINO 99"
        if (rawName.contains("|")) {
            val parts = rawName.split("|", limit = 2)
            val prefix = parts[0].trim()
            val suffix = parts[1].trim()

            val freq = when {
                prefix.startsWith("FM", ignoreCase = true) -> prefix
                prefix.startsWith("AM", ignoreCase = true) -> prefix
                prefix.equals("ONLINE", ignoreCase = true) -> "Satellite"
                else -> if (genre.isNotBlank()) genre else "Live"
            }

            val displayName = suffix.ifBlank { rawName }
            val callSign = explicitCallSign.ifBlank {
                if (displayName.endsWith("AM", ignoreCase = true) || displayName.endsWith("FM", ignoreCase = true)) {
                    displayName
                } else null
            }
            val tagline = explicitTagline.ifBlank { displayName }
            val location = explicitLocation.ifBlank {
                if (freq == "Satellite") "Online" else "Puerto Rico"
            }

            return ParsedMeta(displayName, freq, callSign, tagline, location)
        }

        val fallbackFreq = when {
            genre.contains("FM", ignoreCase = true) -> "FM"
            genre.contains("AM", ignoreCase = true) -> "AM"
            genre.contains("Online", ignoreCase = true) -> "Satellite"
            else -> "Live"
        }

        return ParsedMeta(
            name = rawName,
            frequency = fallbackFreq,
            callSign = explicitCallSign.ifBlank { null },
            tagline = explicitTagline.ifBlank { rawName },
            location = explicitLocation
        )
    }

    private data class ParsedMeta(
        val name: String,
        val frequency: String,
        val callSign: String?,
        val tagline: String,
        val location: String
    )

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
            conn.setRequestProperty("User-Agent", "GlzRadio/26.908.100")
            if (conn.responseCode == 200) {
                val text = conn.inputStream.bufferedReader().use { it.readText() }.trim()
                if (text.startsWith("[") || text.startsWith("{")) text else null
            } else null
        } catch (e: Exception) {
            null
        }
    }
}
