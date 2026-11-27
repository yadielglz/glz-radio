package com.glztech.radiostream

import android.app.Activity
import android.content.Context
import android.graphics.Bitmap
import android.graphics.drawable.BitmapDrawable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowCompat
import coil.Coil
import coil.request.ImageRequest
import coil.request.SuccessResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

internal val GoogleSans = FontFamily(
    Font(R.font.google_sans_regular, FontWeight.Normal),
    Font(R.font.google_sans_bold, FontWeight.Bold)
)

internal data class SettingChoice(
    val name: String,
    val description: String,
    val color: Color? = null
)

@Immutable
internal data class GlzPalette(
    val ink: Color,
    val muted: Color,
    val bg: Color,
    val surface: Color,
    val card: Color,
    val field: Color,
    val stroke: Color,
    val accent: Color,
    val onAccent: Color,
    val coral: Color,
    val gold: Color,
    val ok: Color,
    val isLight: Boolean
)

internal val DefaultGlzPalette = GlzPalette(
    ink = Color(0xFFF8FAFC),
    muted = Color(0xFF9CA3AF),
    bg = Color(0xFF050A0C),
    surface = Color(0xFF0B1114),
    card = Color(0xFF11181C),
    field = Color(0xFF070D10),
    stroke = Color(0xFF283338),
    accent = Color(0xFFF59E0B),
    onAccent = Color(0xFF0A0F11),
    coral = Color(0xFFDC5247),
    gold = Color(0xFFF59E0B),
    ok = Color(0xFF22C55E),
    isLight = false
)

internal val LocalGlzPalette = staticCompositionLocalOf { DefaultGlzPalette }

internal val ThemeChoices = listOf(
    SettingChoice("Signal Noir", "High contrast studio dark", Color(0xFF050A0C)),
    SettingChoice("Signal Light", "Clean daylight studio with warm amber controls", Color(0xFFF7F4ED)),
    SettingChoice("Midnight Radio", "Deep black glass, teal signal highlights", Color(0xFF071113)),
    SettingChoice("Coastal Night", "Cool dark surface with softer blue undertones", Color(0xFF061720)),
    SettingChoice("Graphite Studio", "Neutral dark gray for long listening sessions", Color(0xFF111315)),
    SettingChoice("Tropical Dark", "Warm dark base with saturated controls", Color(0xFF11140D))
)

internal val AccentChoices = listOf(
    SettingChoice("Amber", "Warm dial glow", Color(0xFFF59E0B)),
    SettingChoice("Teal", "Glz classic", Color(0xFF14B8A6)),
    SettingChoice("Cyan", "Bright broadcast blue", Color(0xFF22D3EE)),
    SettingChoice("Lime", "Electric tuner green", Color(0xFF84CC16)),
    SettingChoice("Coral", "Recording-forward red coral", Color(0xFFFB7185))
)

internal val LayoutChoices = listOf(
    SettingChoice("Auto", "Resize from the current screen size"),
    SettingChoice("Compact", "Tighter cards and controls"),
    SettingChoice("Comfortable", "Roomier spacing for phones and tablets"),
    SettingChoice("Large", "Bigger touch targets and calmer density")
)

internal val PlayerSizeChoices = listOf(
    SettingChoice("Balanced", "Player stays meaningful without dominating"),
    SettingChoice("Compact", "More room for stations, streamlined controls"),
    SettingChoice("Expanded", "Larger artwork, dial, and studio presence")
)

internal val SleepTimerChoices = listOf(
    SettingChoice("Off", "Playback continues until you stop it"),
    SettingChoice("15 minutes", "Stop playback after 15 minutes"),
    SettingChoice("30 minutes", "Stop playback after 30 minutes"),
    SettingChoice("45 minutes", "Stop playback after 45 minutes"),
    SettingChoice("60 minutes", "Stop playback after one hour")
)

private val AppShapes = Shapes(
    extraSmall = RoundedCornerShape(10.dp),
    small = RoundedCornerShape(14.dp),
    medium = RoundedCornerShape(18.dp),
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(30.dp)
)

internal fun buildGlzPalette(themeName: String, accentName: String): GlzPalette {
    val light = themeName == "Signal Light"
    val accent = when (accentName) {
        "Cyan" -> if (light) Color(0xFF087A91) else Color(0xFF22D3EE)
        "Lime" -> if (light) Color(0xFF4D7C0F) else Color(0xFF84CC16)
        "Amber" -> if (light) Color(0xFF9A5B00) else Color(0xFFF59E0B)
        "Coral" -> if (light) Color(0xFFB4234A) else Color(0xFFFB7185)
        else -> if (light) Color(0xFF087F73) else Color(0xFF14B8A6)
    }
    val onAccent = if (light) Color.White else Color(0xFF061012)
    val coral = Color(0xFFDC5247)
    val gold = if (accentName == "Amber") Color(0xFFF59E0B) else Color(0xFFB47C26)
    val ok = if (light) Color(0xFF15803D) else Color(0xFF22C55E)

    return when (themeName) {
        "Signal Noir" -> GlzPalette(
            ink = Color(0xFFF8FAFC), muted = Color(0xFF9CA3AF),
            bg = Color(0xFF050A0C), surface = Color(0xFF0B1114),
            card = Color(0xFF11181C), field = Color(0xFF070D10),
            stroke = Color(0xFF283338), accent = accent, onAccent = onAccent,
            coral = coral, gold = gold, ok = ok, isLight = false
        )
        "Signal Light" -> GlzPalette(
            ink = Color(0xFF172124), muted = Color(0xFF5E6A6E),
            bg = Color(0xFFF7F4ED), surface = Color(0xFFFFFDF8),
            card = Color(0xFFFFFFFF), field = Color(0xFFF0ECE3),
            stroke = Color(0xFFD8D2C7), accent = accent, onAccent = onAccent,
            coral = coral, gold = gold, ok = ok, isLight = true
        )
        "Coastal Night" -> GlzPalette(
            ink = Color(0xFFE6F7FF), muted = Color(0xFF8CAFC1),
            bg = Color(0xFF061720), surface = Color(0xFF0B2430),
            card = Color(0xFF11313E), field = Color(0xFF071D27),
            stroke = Color(0xFF285163), accent = accent, onAccent = onAccent,
            coral = coral, gold = gold, ok = ok, isLight = false
        )
        "Graphite Studio" -> GlzPalette(
            ink = Color(0xFFF1F5F9), muted = Color(0xFFA1A1AA),
            bg = Color(0xFF111315), surface = Color(0xFF1A1D20),
            card = Color(0xFF23272B), field = Color(0xFF151719),
            stroke = Color(0xFF3F454B), accent = accent, onAccent = onAccent,
            coral = coral, gold = gold, ok = ok, isLight = false
        )
        "Tropical Dark" -> GlzPalette(
            ink = Color(0xFFF7FEE7), muted = Color(0xFFB7BE92),
            bg = Color(0xFF11140D), surface = Color(0xFF1A2012),
            card = Color(0xFF222B18), field = Color(0xFF151A10),
            stroke = Color(0xFF3E4B2B), accent = accent, onAccent = onAccent,
            coral = coral, gold = gold, ok = ok, isLight = false
        )
        else -> GlzPalette(
            ink = Color(0xFFECFDF5), muted = Color(0xFF94A3B8),
            bg = Color(0xFF071113), surface = Color(0xFF0E1E21),
            card = Color(0xFF12262A), field = Color(0xFF0B191C),
            stroke = Color(0xFF234348), accent = accent, onAccent = onAccent,
            coral = coral, gold = gold, ok = ok, isLight = false
        )
    }
}

@Composable
internal fun GlzRadioTheme(
    themeName: String,
    accentName: String,
    content: @Composable () -> Unit
) {
    val palette = buildGlzPalette(themeName, accentName)
    val view = LocalView.current
    SideEffect {
        val window = (view.context as? Activity)?.window ?: return@SideEffect
        @Suppress("DEPRECATION")
        window.statusBarColor = palette.bg.toArgb()
        @Suppress("DEPRECATION")
        window.navigationBarColor = palette.bg.toArgb()
        WindowCompat.getInsetsController(window, view).run {
            isAppearanceLightStatusBars = palette.isLight
            isAppearanceLightNavigationBars = palette.isLight
        }
    }
    val colors = if (palette.isLight) {
        lightColorScheme(
            primary = palette.accent,
            onPrimary = palette.onAccent,
            primaryContainer = palette.accent.copy(alpha = 0.16f),
            onPrimaryContainer = palette.ink,
            secondary = palette.accent,
            tertiary = palette.coral,
            background = palette.bg,
            surface = palette.surface,
            surfaceVariant = palette.card,
            onBackground = palette.ink,
            onSurface = palette.ink,
            onSurfaceVariant = palette.muted,
            outline = palette.stroke
        )
    } else {
        darkColorScheme(
            primary = palette.accent,
            onPrimary = palette.onAccent,
            primaryContainer = palette.accent.copy(alpha = 0.22f),
            onPrimaryContainer = palette.ink,
            secondary = palette.accent,
            tertiary = palette.coral,
            background = palette.bg,
            surface = palette.surface,
            surfaceVariant = palette.card,
            onBackground = palette.ink,
            onSurface = palette.ink,
            onSurfaceVariant = palette.muted,
            outline = palette.stroke
        )
    }
    CompositionLocalProvider(LocalGlzPalette provides palette) {
        MaterialTheme(
            colorScheme = colors,
            typography = MaterialTheme.typography.copy(
                displayLarge = MaterialTheme.typography.displayLarge.copy(fontFamily = GoogleSans, fontWeight = FontWeight.Bold),
                displayMedium = MaterialTheme.typography.displayMedium.copy(fontFamily = GoogleSans, fontWeight = FontWeight.Bold),
                displaySmall = MaterialTheme.typography.displaySmall.copy(fontFamily = GoogleSans, fontWeight = FontWeight.Bold),
                headlineLarge = MaterialTheme.typography.headlineLarge.copy(fontFamily = GoogleSans, fontWeight = FontWeight.Bold),
                headlineMedium = MaterialTheme.typography.headlineMedium.copy(fontFamily = GoogleSans, fontWeight = FontWeight.Bold),
                headlineSmall = MaterialTheme.typography.headlineSmall.copy(fontFamily = GoogleSans, fontWeight = FontWeight.Bold),
                titleLarge = MaterialTheme.typography.titleLarge.copy(fontFamily = GoogleSans, fontWeight = FontWeight.Bold),
                titleMedium = MaterialTheme.typography.titleMedium.copy(fontFamily = GoogleSans, fontWeight = FontWeight.Bold),
                titleSmall = MaterialTheme.typography.titleSmall.copy(fontFamily = GoogleSans, fontWeight = FontWeight.Bold),
                bodyLarge = MaterialTheme.typography.bodyLarge.copy(fontFamily = GoogleSans),
                bodyMedium = MaterialTheme.typography.bodyMedium.copy(fontFamily = GoogleSans),
                bodySmall = MaterialTheme.typography.bodySmall.copy(fontFamily = GoogleSans),
                labelLarge = MaterialTheme.typography.labelLarge.copy(fontFamily = GoogleSans, fontWeight = FontWeight.Bold),
                labelMedium = MaterialTheme.typography.labelMedium.copy(fontFamily = GoogleSans, fontWeight = FontWeight.Bold),
                labelSmall = MaterialTheme.typography.labelSmall.copy(fontFamily = GoogleSans, fontWeight = FontWeight.Bold)
            ),
            shapes = AppShapes,
            content = content
        )
    }
}

internal suspend fun extractLogoAmbientColor(
    context: Context,
    logoUrl: String?,
    fallback: Color
): Color = withContext(Dispatchers.IO) {
    if (logoUrl.isNullOrBlank()) return@withContext fallback
    runCatching {
        val request = ImageRequest.Builder(context)
            .data(logoUrl)
            .size(48)
            .allowHardware(false)
            .build()
        val result = Coil.imageLoader(context).execute(request)
        val bitmap = ((result as? SuccessResult)?.drawable as? BitmapDrawable)?.bitmap
            ?: return@withContext fallback
        sampleDominantColor(bitmap, fallback)
    }.getOrDefault(fallback)
}

private fun sampleDominantColor(bitmap: Bitmap, fallback: Color): Color {
    val width = bitmap.width.coerceAtMost(48)
    val height = bitmap.height.coerceAtMost(48)
    var bestScore = -1f
    var bestColor: Int? = null
    val stepX = (bitmap.width / width).coerceAtLeast(1)
    val stepY = (bitmap.height / height).coerceAtLeast(1)
    var y = 0
    while (y < bitmap.height) {
        var x = 0
        while (x < bitmap.width) {
            val pixel = bitmap.getPixel(x, y)
            val alpha = (pixel ushr 24) and 0xFF
            if (alpha >= 180) {
                val r = (pixel ushr 16) and 0xFF
                val g = (pixel ushr 8) and 0xFF
                val b = pixel and 0xFF
                val max = maxOf(r, g, b)
                val min = minOf(r, g, b)
                val sat = if (max == 0) 0f else (max - min).toFloat() / max.toFloat()
                val lum = (0.299f * r + 0.587f * g + 0.114f * b) / 255f
                if (lum in 0.16f..0.88f) {
                    val score = sat * 2.2f + (1f - kotlin.math.abs(lum - 0.52f))
                    if (score > bestScore) {
                        bestScore = score
                        bestColor = pixel
                    }
                }
            }
            x += stepX
        }
        y += stepY
    }
    return if (bestColor != null && bestScore > 0.7f) Color(bestColor) else fallback
}
