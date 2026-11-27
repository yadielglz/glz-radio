package com.glztech.radiostream

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Geocoder
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Looper
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.coroutines.resume
import kotlin.math.roundToInt

private const val SAN_JUAN_LAT = 18.4655
private const val SAN_JUAN_LON = -66.1057

internal sealed interface WeatherState {
    data object Loading : WeatherState
    data class Ready(
        val temperature: Double,
        val feelsLike: Double,
        val wind: Double,
        val humidity: Double,
        val precipitation: Double,
        val description: String,
        val place: String,
        val outlook: List<WeatherOutlook>,
        val forecast: List<WeatherForecastDay>
    ) : WeatherState

    data class Error(val message: String) : WeatherState
}

internal data class WeatherOutlook(
    val timeLabel: String,
    val temperature: Double,
    val feelsLike: Double,
    val rainChance: Int,
    val description: String
)

internal data class WeatherForecastDay(
    val dayLabel: String,
    val high: Double,
    val low: Double,
    val rainChance: Int,
    val description: String
)

internal fun weatherDashboardText(weather: WeatherState): String {
    return when (weather) {
        WeatherState.Loading -> "Weather / updating"
        is WeatherState.Ready -> "${weather.place} · ${weather.temperature.roundToInt()}°F · ${weather.description}"
        is WeatherState.Error -> "Weather unavailable"
    }
}

@Composable
internal fun MiniWeatherChip(
    weather: WeatherState,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val palette = LocalGlzPalette.current
    val label = when (weather) {
        WeatherState.Loading -> "Weather…"
        is WeatherState.Ready -> "${weather.temperature.roundToInt()}°F · ${weather.description}"
        is WeatherState.Error -> "Weather"
    }
    Surface(
        color = palette.field,
        shape = RoundedCornerShape(50),
        modifier = modifier
            .height(36.dp)
            .clickable(onClick = onClick)
            .border(1.dp, palette.stroke, RoundedCornerShape(50))
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 11.dp)
        ) {
            Icon(Icons.Filled.Cloud, contentDescription = null, tint = palette.accent, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(7.dp))
            Text(
                label,
                color = palette.ink,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
internal fun SectionCard(title: String, content: @Composable () -> Unit) {
    val palette = LocalGlzPalette.current
    Surface(
        color = palette.surface,
        shape = RoundedCornerShape(22.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, palette.stroke.copy(alpha = 0.65f), RoundedCornerShape(22.dp))
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(title, color = palette.ink, fontWeight = FontWeight.Bold, fontSize = 18.sp)
            content()
        }
    }
}

@Composable
internal fun WeatherFlyout(
    weather: WeatherState,
    onClose: () -> Unit,
    onRefresh: () -> Unit,
    onRequestLocation: () -> Unit
) {
    val palette = LocalGlzPalette.current
    Surface(color = palette.bg, modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 18.dp, vertical = 14.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                TextButton(onClick = onClose) {
                    Icon(Icons.Filled.Close, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Close")
                }
                Text(
                    "Weather",
                    color = palette.ink,
                    fontWeight = FontWeight.Bold,
                    fontSize = 22.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(1f)
                )
                TextButton(onClick = onRefresh) {
                    Icon(Icons.Filled.Cloud, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Refresh")
                }
            }
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(bottom = 24.dp)
            ) {
                item {
                    when (weather) {
                        WeatherState.Loading -> WeatherLoadingPanel()
                        is WeatherState.Error -> WeatherErrorPanel(weather.message, onRequestLocation)
                        is WeatherState.Ready -> WeatherReadyPanel(weather, onRequestLocation)
                    }
                }
            }
        }
    }
}

@Composable
private fun WeatherReadyPanel(weather: WeatherState.Ready, onRequestLocation: () -> Unit) {
    val palette = LocalGlzPalette.current
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Surface(color = palette.card, shape = RoundedCornerShape(26.dp), modifier = Modifier.fillMaxWidth()) {
            Column(
                modifier = Modifier.padding(22.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(weather.description, color = palette.muted, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                Text("${weather.temperature.roundToInt()}°F", color = palette.accent, fontWeight = FontWeight.Bold, fontSize = 58.sp)
                Text("Feels like ${weather.feelsLike.roundToInt()}°F", color = palette.ink, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                Spacer(Modifier.height(6.dp))
                Text(weather.place, color = palette.muted, textAlign = TextAlign.Center)
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            WeatherMetric("Wind", "${weather.wind.roundToInt()} mph", Modifier.weight(1f))
            WeatherMetric("Humidity", "${weather.humidity.roundToInt()}%", Modifier.weight(1f))
            WeatherMetric("Rain", "${weather.precipitation.roundToInt()} in", Modifier.weight(1f))
        }
        SectionCard("Outlook") {
            if (weather.outlook.isEmpty()) {
                Text("No hourly outlook available.", color = palette.muted)
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    weather.outlook.forEach { WeatherOutlookRow(it) }
                }
            }
        }
        SectionCard("5-Day Forecast") {
            if (weather.forecast.isEmpty()) {
                Text("No forecast available.", color = palette.muted)
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    weather.forecast.forEach { WeatherForecastRow(it) }
                }
            }
        }
        FilledTonalButton(onClick = onRequestLocation, modifier = Modifier.fillMaxWidth().height(48.dp)) {
            Text("Use local conditions")
        }
    }
}

@Composable
private fun WeatherLoadingPanel() {
    val palette = LocalGlzPalette.current
    Surface(color = palette.card, shape = RoundedCornerShape(26.dp), modifier = Modifier.fillMaxWidth()) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(28.dp)) {
            Icon(Icons.Filled.Cloud, contentDescription = null, tint = palette.accent, modifier = Modifier.size(52.dp))
            Spacer(Modifier.height(8.dp))
            Text("Updating forecast", color = palette.ink, fontWeight = FontWeight.Bold, fontSize = 20.sp)
            Text("Checking current conditions", color = palette.muted, textAlign = TextAlign.Center)
        }
    }
}

@Composable
private fun WeatherErrorPanel(message: String, onRequestLocation: () -> Unit) {
    val palette = LocalGlzPalette.current
    Surface(color = palette.card, shape = RoundedCornerShape(26.dp), modifier = Modifier.fillMaxWidth()) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(24.dp)) {
            Text("Weather unavailable", color = palette.ink, fontWeight = FontWeight.Bold, fontSize = 20.sp)
            Spacer(Modifier.height(8.dp))
            Text(message, color = palette.muted, textAlign = TextAlign.Center)
            Spacer(Modifier.height(14.dp))
            FilledTonalButton(onClick = onRequestLocation, modifier = Modifier.fillMaxWidth()) {
                Text("Use local conditions")
            }
        }
    }
}

@Composable
private fun WeatherMetric(label: String, value: String, modifier: Modifier = Modifier) {
    val palette = LocalGlzPalette.current
    Surface(color = palette.card, shape = RoundedCornerShape(18.dp), modifier = modifier) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 14.dp)
        ) {
            Text(label, color = palette.muted, fontSize = 12.sp, maxLines = 1)
            Text(value, color = palette.ink, fontWeight = FontWeight.Bold, fontSize = 16.sp, maxLines = 1)
        }
    }
}

@Composable
private fun WeatherOutlookRow(item: WeatherOutlook) {
    val palette = LocalGlzPalette.current
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .background(palette.card, RoundedCornerShape(16.dp))
            .padding(horizontal = 14.dp, vertical = 11.dp)
    ) {
        Text(item.timeLabel, color = palette.accent, fontWeight = FontWeight.Bold, modifier = Modifier.width(66.dp))
        Column(Modifier.weight(1f)) {
            Text(item.description, color = palette.ink, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text("Feels ${item.feelsLike.roundToInt()}°F · rain ${item.rainChance}%", color = palette.muted, fontSize = 12.sp)
        }
        Text("${item.temperature.roundToInt()}°", color = palette.ink, fontWeight = FontWeight.Bold, fontSize = 19.sp)
    }
}

@Composable
private fun WeatherForecastRow(day: WeatherForecastDay) {
    val palette = LocalGlzPalette.current
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .background(palette.card, RoundedCornerShape(16.dp))
            .padding(horizontal = 14.dp, vertical = 11.dp)
    ) {
        Column(Modifier.weight(1f)) {
            Text(day.dayLabel, color = palette.ink, fontWeight = FontWeight.Bold, maxLines = 1)
            Text(day.description, color = palette.muted, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        Text("${day.low.roundToInt()}°", color = palette.muted, fontWeight = FontWeight.Bold)
        Spacer(Modifier.width(10.dp))
        Text("${day.high.roundToInt()}°", color = palette.accent, fontWeight = FontWeight.Bold, fontSize = 19.sp)
        Spacer(Modifier.width(10.dp))
        Text("${day.rainChance}%", color = palette.muted, fontSize = 12.sp)
    }
}

internal suspend fun loadWeather(context: Context): WeatherState {
    return withContext(Dispatchers.IO) {
        try {
            val location = localWeatherLocation(context)
            val lat = location?.latitude ?: SAN_JUAN_LAT
            val lon = location?.longitude ?: SAN_JUAN_LON
            val place = resolveWeatherPlace(context, location)
            val url = "https://api.open-meteo.com/v1/forecast" +
                "?latitude=$lat&longitude=$lon" +
                "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m" +
                "&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code" +
                "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
                "&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=5"
            val connection = (URL(url).openConnection() as HttpURLConnection).apply {
                connectTimeout = 12_000
                readTimeout = 12_000
                setRequestProperty("User-Agent", "GlzRadio/${BuildConfig.VERSION_NAME}")
            }
            val body = try {
                require(connection.responseCode in 200..299) { "Weather request failed" }
                connection.inputStream.bufferedReader().use { it.readText() }
            } finally {
                connection.disconnect()
            }
            val root = JSONObject(body)
            val current = root.getJSONObject("current")
            WeatherState.Ready(
                temperature = current.getDouble("temperature_2m"),
                feelsLike = current.getDouble("apparent_temperature"),
                wind = current.getDouble("wind_speed_10m"),
                humidity = current.getDouble("relative_humidity_2m"),
                precipitation = current.getDouble("precipitation"),
                description = weatherDescription(current.getInt("weather_code")),
                place = place,
                outlook = parseHourlyOutlook(root.optJSONObject("hourly")),
                forecast = parseDailyForecast(root.optJSONObject("daily"))
            )
        } catch (exception: Exception) {
            WeatherState.Error("Tap Refresh to try again")
        }
    }
}

@Suppress("DEPRECATION")
private fun resolveWeatherPlace(context: Context, location: Location?): String {
    if (location == null) return "San Juan, PR"
    if (!Geocoder.isPresent()) return "Local area"

    return runCatching {
        val address = Geocoder(context, Locale.getDefault())
            .getFromLocation(location.latitude, location.longitude, 1)
            ?.firstOrNull()
            ?: return@runCatching "Local area"
        val city = address.locality ?: address.subLocality ?: address.subAdminArea
        val region = when (address.adminArea) {
            "Puerto Rico" -> "PR"
            "Florida" -> "FL"
            else -> address.adminArea
        }
        listOfNotNull(city, region)
            .filter { it.isNotBlank() }
            .distinct()
            .joinToString(", ")
            .ifBlank { "Local area" }
    }.getOrDefault("Local area")
}

private fun parseHourlyOutlook(hourly: JSONObject?): List<WeatherOutlook> {
    if (hourly == null) return emptyList()
    val times = hourly.optJSONArray("time") ?: return emptyList()
    val temperatures = hourly.optJSONArray("temperature_2m") ?: return emptyList()
    val feelsLike = hourly.optJSONArray("apparent_temperature") ?: return emptyList()
    val rain = hourly.optJSONArray("precipitation_probability") ?: return emptyList()
    val codes = hourly.optJSONArray("weather_code") ?: return emptyList()
    val start = findNextHourlyIndex(times)
    return listOf(start, start + 3, start + 6, start + 9)
        .filter { it in 0 until times.length() }
        .map { index ->
            WeatherOutlook(
                timeLabel = formatHourLabel(times.optString(index)),
                temperature = temperatures.optDouble(index),
                feelsLike = feelsLike.optDouble(index),
                rainChance = rain.optInt(index),
                description = weatherDescription(codes.optInt(index))
            )
        }
}

private fun parseDailyForecast(daily: JSONObject?): List<WeatherForecastDay> {
    if (daily == null) return emptyList()
    val times = daily.optJSONArray("time") ?: return emptyList()
    val codes = daily.optJSONArray("weather_code") ?: return emptyList()
    val highs = daily.optJSONArray("temperature_2m_max") ?: return emptyList()
    val lows = daily.optJSONArray("temperature_2m_min") ?: return emptyList()
    val rain = daily.optJSONArray("precipitation_probability_max") ?: return emptyList()
    return (0 until times.length()).map { index ->
        WeatherForecastDay(
            dayLabel = formatDayLabel(times.optString(index)),
            high = highs.optDouble(index),
            low = lows.optDouble(index),
            rainChance = rain.optInt(index),
            description = weatherDescription(codes.optInt(index))
        )
    }
}

private fun findNextHourlyIndex(times: JSONArray): Int {
    val currentHour = java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH"))
    for (index in 0 until times.length()) {
        if (times.optString(index).take(13) >= currentHour) return index
    }
    return 0
}

private fun formatHourLabel(value: String): String {
    return runCatching {
        val hour = value.substringAfter("T").take(2).toInt()
        val suffix = if (hour < 12) "AM" else "PM"
        val display = when (val adjusted = hour % 12) {
            0 -> 12
            else -> adjusted
        }
        "$display $suffix"
    }.getOrDefault(value)
}

private fun formatDayLabel(value: String): String {
    return runCatching {
        val date = LocalDate.parse(value)
        val today = LocalDate.now()
        when (date) {
            today -> "Today"
            today.plusDays(1) -> "Tomorrow"
            else -> date.format(DateTimeFormatter.ofPattern("EEE, MMM d", Locale.US))
        }
    }.getOrDefault(value)
}

private suspend fun localWeatherLocation(context: Context): Location? {
    return lastKnownLocation(context) ?: currentLocation(context)
}

private fun lastKnownLocation(context: Context): Location? {
    if (context.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
        return null
    }
    val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager ?: return null
    return locationManager.getProviders(true)
        .mapNotNull { provider ->
            try {
                locationManager.getLastKnownLocation(provider)
            } catch (exception: SecurityException) {
                null
            }
        }
        .maxByOrNull { it.time }
}

@Suppress("DEPRECATION")
private suspend fun currentLocation(context: Context): Location? {
    if (context.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
        return null
    }
    return withContext(Dispatchers.Main) {
        withTimeoutOrNull(6_000L) {
            suspendCancellableCoroutine { continuation ->
                val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
                if (locationManager == null) {
                    continuation.resume(null)
                    return@suspendCancellableCoroutine
                }
                val provider = listOf(
                    LocationManager.NETWORK_PROVIDER,
                    LocationManager.PASSIVE_PROVIDER,
                    LocationManager.GPS_PROVIDER
                ).firstOrNull { providerName ->
                    runCatching { locationManager.isProviderEnabled(providerName) }.getOrDefault(false)
                }
                if (provider == null) {
                    continuation.resume(null)
                    return@suspendCancellableCoroutine
                }
                val listener = object : LocationListener {
                    override fun onLocationChanged(location: Location) {
                        if (continuation.isActive) continuation.resume(location)
                        locationManager.removeUpdates(this)
                    }

                    override fun onProviderDisabled(provider: String) = Unit
                    override fun onProviderEnabled(provider: String) = Unit
                }
                continuation.invokeOnCancellation { locationManager.removeUpdates(listener) }
                try {
                    locationManager.requestSingleUpdate(provider, listener, Looper.getMainLooper())
                } catch (exception: SecurityException) {
                    if (continuation.isActive) continuation.resume(null)
                } catch (exception: IllegalArgumentException) {
                    if (continuation.isActive) continuation.resume(null)
                }
            }
        }
    }
}

private fun weatherDescription(code: Int): String {
    return when (code) {
        0 -> "Clear"
        1, 2 -> "Partly cloudy"
        3 -> "Cloudy"
        45, 48 -> "Fog"
        51, 53, 55 -> "Drizzle"
        56, 57 -> "Freezing drizzle"
        61, 63, 65 -> "Rain"
        66, 67 -> "Freezing rain"
        71, 73, 75, 77 -> "Snow"
        80, 81, 82 -> "Rain showers"
        85, 86 -> "Snow showers"
        95 -> "Thunderstorms"
        96, 99 -> "Storms with hail"
        else -> "Current conditions"
    }
}
