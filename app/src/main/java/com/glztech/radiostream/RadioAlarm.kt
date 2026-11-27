package com.glztech.radiostream

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import java.util.Calendar
import java.util.Locale

internal data class WakeUpAlarmConfig(
    val enabled: Boolean = false,
    val hour: Int = 7,
    val minute: Int = 0,
    val stationName: String? = null,
    val fadeIn: Boolean = true
) {
    fun formattedTime(): String {
        val amPm = if (hour < 12) "AM" else "PM"
        val displayHour = when (val h = hour % 12) {
            0 -> 12
            else -> h
        }
        return String.format(Locale.US, "%d:%02d %s", displayHour, minute, amPm)
    }
}

internal object RadioAlarm {
    private const val PREFS = "radio_alarm"
    private const val KEY_ENABLED = "enabled"
    private const val KEY_HOUR = "hour"
    private const val KEY_MINUTE = "minute"
    private const val KEY_STATION = "station_name"
    private const val KEY_FADE = "fade_in"
    private const val REQUEST_CODE = 261127
    const val CHANNEL_ID = "glz_wakeup_alarm"
    const val EXTRA_ALARM_STATION = "extra_alarm_station"
    const val EXTRA_ALARM_FADE = "extra_alarm_fade"

    fun load(context: Context): WakeUpAlarmConfig {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        return WakeUpAlarmConfig(
            enabled = prefs.getBoolean(KEY_ENABLED, false),
            hour = prefs.getInt(KEY_HOUR, 7).coerceIn(0, 23),
            minute = prefs.getInt(KEY_MINUTE, 0).coerceIn(0, 59),
            stationName = prefs.getString(KEY_STATION, null),
            fadeIn = prefs.getBoolean(KEY_FADE, true)
        )
    }

    fun saveAndSchedule(context: Context, config: WakeUpAlarmConfig) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_ENABLED, config.enabled)
            .putInt(KEY_HOUR, config.hour.coerceIn(0, 23))
            .putInt(KEY_MINUTE, config.minute.coerceIn(0, 59))
            .putString(KEY_STATION, config.stationName)
            .putBoolean(KEY_FADE, config.fadeIn)
            .apply()

        if (config.enabled) {
            scheduleNext(context, config)
        } else {
            cancelAlarm(context)
        }
    }

    fun nextTriggerTimeMs(hour: Int, minute: Int, nowMs: Long = System.currentTimeMillis()): Long {
        val cal = Calendar.getInstance().apply {
            timeInMillis = nowMs
            set(Calendar.HOUR_OF_DAY, hour.coerceIn(0, 23))
            set(Calendar.MINUTE, minute.coerceIn(0, 59))
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            if (timeInMillis <= nowMs) {
                add(Calendar.DAY_OF_YEAR, 1)
            }
        }
        return cal.timeInMillis
    }

    private fun alarmPendingIntent(context: Context, config: WakeUpAlarmConfig?): PendingIntent {
        val intent = Intent(context, RadioAlarmReceiver::class.java).apply {
            putExtra(EXTRA_ALARM_STATION, config?.stationName)
            putExtra(EXTRA_ALARM_FADE, config?.fadeIn ?: true)
        }
        return PendingIntent.getBroadcast(
            context,
            REQUEST_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun scheduleNext(context: Context, config: WakeUpAlarmConfig) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val triggerAt = nextTriggerTimeMs(config.hour, config.minute)
        val pending = alarmPendingIntent(context, config)
        alarmManager.cancel(pending)
        alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pending)
    }

    fun cancelAlarm(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        alarmManager.cancel(alarmPendingIntent(context, null))
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_ENABLED, false)
            .apply()
    }

    fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
            if (nm.getNotificationChannel(CHANNEL_ID) == null) {
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    "Wake-Up Radio Alarm",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Starts your chosen Puerto Rico radio station at your wake-up time."
                }
                nm.createNotificationChannel(channel)
            }
        }
    }
}

class RadioAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val config = RadioAlarm.load(context)
        val stationName = intent.getStringExtra(RadioAlarm.EXTRA_ALARM_STATION)
            ?: config.stationName
            ?: StationStore.getLastStation(context)?.name
        val fadeIn = intent.getBooleanExtra(RadioAlarm.EXTRA_ALARM_FADE, config.fadeIn)

        // Reschedule for tomorrow if still enabled.
        if (config.enabled) {
            RadioAlarm.saveAndSchedule(context, config)
        }

        val launchIntent = Intent(context, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            putExtra(RadioAlarm.EXTRA_ALARM_STATION, stationName)
            putExtra(RadioAlarm.EXTRA_ALARM_FADE, fadeIn)
        }

        RadioAlarm.ensureChannel(context)
        val contentIntent = PendingIntent.getActivity(
            context,
            261128,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, RadioAlarm.CHANNEL_ID)
            .setSmallIcon(R.drawable.app_icon)
            .setContentTitle("Glz Radio Wake-Up Alarm")
            .setContentText("Tuning in to ${stationName ?: "Glz Radio"}")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setContentIntent(contentIntent)
            .build()

        runCatching {
            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            nm?.notify(261128, notification)
        }

        runCatching {
            context.startActivity(launchIntent)
        }
    }
}
