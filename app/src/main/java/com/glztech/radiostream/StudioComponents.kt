package com.glztech.radiostream

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Alarm
import androidx.compose.material.icons.filled.AlarmOff
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.sin

internal fun stationCityName(station: Station): String {
    val raw = station.location?.trim().orEmpty()
    if (raw.isBlank()) return "Puerto Rico"
    return raw.replace(Regex(",\\s*(PR|Puerto Rico|FL|Florida)$", RegexOption.IGNORE_CASE), "")
        .trim()
        .ifBlank { raw }
}

internal fun stationSlug(name: String): String {
    return name.lowercase()
        .replace(Regex("[^a-z0-9]+"), "-")
        .trim('-')
}

internal fun parseNumericFrequency(frequency: String?): Double {
    val match = Regex("(\\d+(?:\\.\\d+)?)").find(frequency.orEmpty())
    return match?.groupValues?.get(1)?.toDoubleOrNull() ?: 9999.0
}

@Composable
internal fun LiveSpectrumVisualizer(
    isPlaying: Boolean,
    ambientColor: Color,
    modifier: Modifier = Modifier
) {
    val palette = LocalGlzPalette.current
    val transition = rememberInfiniteTransition(label = "spectrum")
    val phase by transition.animateFloat(
        initialValue = 0f,
        targetValue = (2.0 * PI).toFloat(),
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1600, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "spectrumPhase"
    )

    Surface(
        color = palette.field,
        shape = RoundedCornerShape(16.dp),
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, palette.stroke, RoundedCornerShape(16.dp))
    ) {
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
                .padding(horizontal = 12.dp, vertical = 8.dp)
        ) {
            val barCount = 24
            val gap = 4.dp.toPx()
            val barWidth = ((size.width - gap * (barCount - 1)) / barCount).coerceAtLeast(2f)
            val brush = Brush.verticalGradient(listOf(palette.accent, ambientColor))

            for (i in 0 until barCount) {
                val ratio = if (isPlaying) {
                    val centerWeight = 1f - abs((i.toFloat() / (barCount - 1)) * 2f - 1f) * 0.48f
                    val w1 = sin(phase * 1.5f + i * 0.62f) * 0.30f
                    val w2 = cos(phase * 2.5f - i * 0.37f) * 0.24f
                    val w3 = sin(phase + i * 0.21f) * 0.14f
                    ((0.46f + w1 + w2 + w3) * centerWeight).coerceIn(0.14f, 0.96f)
                } else {
                    0.12f
                }
                val h = (size.height * ratio).coerceAtLeast(4.dp.toPx())
                val x = i * (barWidth + gap)
                val y = size.height - h
                drawRoundRect(
                    brush = brush,
                    topLeft = Offset(x, y),
                    size = Size(barWidth, h),
                    cornerRadius = CornerRadius(barWidth / 2f, barWidth / 2f)
                )
            }
        }
    }
}

@Composable
internal fun AnalogFrequencyDial(
    stations: List<Station>,
    current: Station?,
    onSelect: (Station) -> Unit,
    modifier: Modifier = Modifier
) {
    val palette = LocalGlzPalette.current
    if (current == null) return
    val band = current.band()
    val bandStations = remember(stations, band) {
        stations.filter { it.band() == band }
            .sortedBy { parseNumericFrequency(it.frequency) }
    }
    if (bandStations.size <= 1) return

    val listState = rememberLazyListState()
    val activeIdx = bandStations.indexOfFirst { it.name == current.name }
    LaunchedEffect(activeIdx) {
        if (activeIdx >= 0) {
            listState.animateScrollToItem((activeIdx - 2).coerceAtLeast(0))
        }
    }

    Surface(
        color = palette.field,
        shape = RoundedCornerShape(16.dp),
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, palette.stroke, RoundedCornerShape(16.dp))
    ) {
        Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    "${band.uppercase()} TUNER DIAL",
                    color = palette.muted,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    modifier = Modifier.weight(1f)
                )
                Text(
                    current.frequency ?: "Live",
                    color = palette.accent,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(Modifier.height(6.dp))
            LazyRow(
                state = listState,
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                contentPadding = PaddingValues(horizontal = 2.dp)
            ) {
                items(bandStations, key = { it.name }) { station ->
                    val isSelected = station.name == current.name
                    val shortLabel = (station.frequency ?: station.name)
                        .replace(Regex("^(FM|AM)\\s*", RegexOption.IGNORE_CASE), "")
                        .ifBlank { station.name.take(6) }
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSelected) palette.accent.copy(alpha = 0.16f) else Color.Transparent)
                            .clickable { onSelect(station) }
                            .padding(horizontal = 9.dp, vertical = 5.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .width(2.5.dp)
                                .height(if (isSelected) 16.dp else 10.dp)
                                .clip(RoundedCornerShape(2.dp))
                                .background(if (isSelected) palette.accent else palette.stroke)
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            shortLabel,
                            color = if (isSelected) palette.accent else palette.muted,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            maxLines = 1
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
internal fun PresetsBar(
    presets: List<String?>,
    stations: List<Station>,
    current: Station?,
    onTapSlot: (Int) -> Unit,
    onLongPressSlot: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val palette = LocalGlzPalette.current
    Column(modifier = modifier.fillMaxWidth()) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth().padding(bottom = 6.dp)
        ) {
            Text(
                "PRESETS 1–6",
                color = palette.muted,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp,
                modifier = Modifier.weight(1f)
            )
            Text(
                "Tap tune · Hold to save",
                color = palette.muted,
                fontSize = 11.sp
            )
        }
        Row(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            presets.forEachIndexed { idx, name ->
                val station = name?.let { n -> stations.firstOrNull { it.name.equals(n, true) } }
                val active = station != null && current?.name.equals(station.name, true)
                Surface(
                    color = when {
                        active -> palette.accent.copy(alpha = 0.18f)
                        station != null -> palette.card
                        else -> palette.field
                    },
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp)
                        .border(
                            width = if (active) 1.5.dp else 1.dp,
                            color = if (active) palette.accent else palette.stroke,
                            shape = RoundedCornerShape(12.dp)
                        )
                        .clip(RoundedCornerShape(12.dp))
                        .combinedClickable(
                            onClick = { onTapSlot(idx) },
                            onLongClick = { onLongPressSlot(idx) }
                        )
                ) {
                    Column(
                        verticalArrangement = Arrangement.Center,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp)
                    ) {
                        Text(
                            "P${idx + 1}",
                            color = if (station != null) palette.accent else palette.muted,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            station?.name ?: "+ Save",
                            color = if (station != null) palette.ink else palette.muted,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }
    }
}

@Composable
internal fun RecentlyPlayedShelf(
    recentStations: List<Station>,
    current: Station?,
    onSelect: (Station) -> Unit,
    modifier: Modifier = Modifier
) {
    val palette = LocalGlzPalette.current
    if (recentStations.isEmpty()) return
    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            "RECENTLY PLAYED",
            color = palette.muted,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp,
            modifier = Modifier.padding(bottom = 6.dp)
        )
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(recentStations, key = { it.name }) { station ->
                val active = current?.name == station.name
                Surface(
                    color = if (active) palette.accent.copy(alpha = 0.16f) else palette.card,
                    shape = RoundedCornerShape(50),
                    modifier = Modifier
                        .border(1.dp, if (active) palette.accent else palette.stroke, RoundedCornerShape(50))
                        .clip(RoundedCornerShape(50))
                        .clickable { onSelect(station) }
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(start = 5.dp, end = 12.dp, top = 5.dp, bottom = 5.dp)
                    ) {
                        AsyncImage(
                            model = station.logoUrl ?: R.drawable.app_icon,
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(Color.White)
                        )
                        Spacer(Modifier.width(7.dp))
                        Text(
                            station.name,
                            color = palette.ink,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1
                        )
                    }
                }
            }
        }
    }
}

@Composable
internal fun ActiveEqualizerOverlay(modifier: Modifier = Modifier) {
    val palette = LocalGlzPalette.current
    val transition = rememberInfiniteTransition(label = "cardEq")
    val b1 by transition.animateFloat(0.25f, 1f, infiniteRepeatable(tween(420), RepeatMode.Reverse), label = "b1")
    val b2 by transition.animateFloat(0.95f, 0.3f, infiniteRepeatable(tween(520), RepeatMode.Reverse), label = "b2")
    val b3 by transition.animateFloat(0.35f, 0.9f, infiniteRepeatable(tween(380), RepeatMode.Reverse), label = "b3")

    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier.background(Color.Black.copy(alpha = 0.65f))
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(3.dp),
            verticalAlignment = Alignment.Bottom,
            modifier = Modifier.height(20.dp)
        ) {
            listOf(b1, b2, b3).forEach { level ->
                Box(
                    modifier = Modifier
                        .width(3.5.dp)
                        .height((20f * level).dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(palette.accent)
                )
            }
        }
    }
}

@Composable
internal fun WakeUpAlarmSheet(
    config: WakeUpAlarmConfig,
    stations: List<Station>,
    currentStation: Station?,
    onSave: (WakeUpAlarmConfig) -> Unit,
    onCancelAlarm: () -> Unit
) {
    val palette = LocalGlzPalette.current
    var hour by remember(config) { mutableIntStateOf(config.hour) }
    var minute by remember(config) { mutableIntStateOf(config.minute) }
    var selectedStation by remember(config, currentStation) {
        mutableStateOf(config.stationName ?: currentStation?.name ?: stations.firstOrNull()?.name)
    }
    var fadeIn by remember(config) { mutableStateOf(config.fadeIn) }

    val previewConfig = WakeUpAlarmConfig(true, hour, minute, selectedStation, fadeIn)

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .padding(bottom = 26.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            Icon(Icons.Filled.Alarm, contentDescription = null, tint = palette.accent)
            Spacer(Modifier.width(10.dp))
            Text(
                "Wake-Up Radio Alarm",
                color = palette.ink,
                fontWeight = FontWeight.Bold,
                fontSize = 22.sp,
                modifier = Modifier.weight(1f)
            )
        }
        Text(
            "Automatically start your favorite Puerto Rico station in the morning.",
            color = palette.muted,
            fontSize = 13.sp
        )

        Surface(
            color = palette.card,
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier.fillMaxWidth().border(1.dp, palette.stroke, RoundedCornerShape(20.dp))
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    previewConfig.formattedTime(),
                    color = palette.accent,
                    fontWeight = FontWeight.Bold,
                    fontSize = 38.sp
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilledTonalButton(onClick = { hour = (hour + 23) % 24 }) { Text("−1 hr") }
                    FilledTonalButton(onClick = { hour = (hour + 1) % 24 }) { Text("+1 hr") }
                    FilledTonalButton(onClick = { minute = (minute + 55) % 60 }) { Text("−5 m") }
                    FilledTonalButton(onClick = { minute = (minute + 5) % 60 }) { Text("+5 m") }
                }
            }
        }

        Text("Wake-Up Station", color = palette.ink, fontWeight = FontWeight.Bold, fontSize = 14.sp)
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(stations, key = { it.name }) { station ->
                FilterChip(
                    selected = selectedStation == station.name,
                    onClick = { selectedStation = station.name },
                    label = { Text(station.name, maxLines = 1, overflow = TextOverflow.Ellipsis) }
                )
            }
        }

        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(Modifier.weight(1f)) {
                Text("Gentle 15s fade-in", color = palette.ink, fontWeight = FontWeight.Bold)
                Text("Gradually raise volume from quiet to full", color = palette.muted, fontSize = 12.sp)
            }
            Switch(checked = fadeIn, onCheckedChange = { fadeIn = it })
        }

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            FilledTonalButton(
                onClick = { onSave(previewConfig) },
                colors = ButtonDefaults.filledTonalButtonColors(
                    containerColor = palette.accent,
                    contentColor = palette.onAccent
                ),
                modifier = Modifier.weight(1f).height(48.dp)
            ) {
                Icon(Icons.Filled.Alarm, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text(if (config.enabled) "Update Alarm" else "Set Alarm", fontWeight = FontWeight.Bold)
            }
            if (config.enabled) {
                TextButton(
                    onClick = onCancelAlarm,
                    modifier = Modifier.height(48.dp)
                ) {
                    Icon(Icons.Filled.AlarmOff, contentDescription = null, tint = palette.coral, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Turn Off", color = palette.coral)
                }
            }
        }
    }
}
