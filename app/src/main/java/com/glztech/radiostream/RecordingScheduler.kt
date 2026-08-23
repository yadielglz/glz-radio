package com.glztech.radiostream

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.SystemClock
import java.io.File
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit

internal data class ScheduledTaskInfo(
    val stationName: String,
    val durationMinutes: Int,
    val startTimestampMs: Long
)

internal object RecordingScheduler {
    private val scheduler = Executors.newScheduledThreadPool(2)
    private var scheduledStartFuture: ScheduledFuture<*>? = null
    private var scheduledStopFuture: ScheduledFuture<*>? = null
    var activeScheduledInfo: ScheduledTaskInfo? = null
        private set

    fun scheduleRecording(
        context: Context,
        station: Station,
        delayMinutes: Int,
        durationMinutes: Int,
        streamRecorder: StreamRecorder,
        listener: StreamRecorder.Listener
    ) {
        cancel()

        val delayMs = delayMinutes.toLong() * 60_000L
        val durationMs = durationMinutes.toLong() * 60_000L
        val startMs = System.currentTimeMillis() + delayMs

        activeScheduledInfo = ScheduledTaskInfo(
            stationName = station.name,
            durationMinutes = durationMinutes,
            startTimestampMs = startMs
        )

        scheduledStartFuture = scheduler.schedule({
            streamRecorder.start(station, object : StreamRecorder.Listener {
                override fun onStarted(file: File) {
                    listener.onStarted(file)
                    // Schedule automatic stop after duration completes
                    scheduledStopFuture = scheduler.schedule({
                        streamRecorder.stop()
                        activeScheduledInfo = null
                    }, durationMs, TimeUnit.MILLISECONDS)
                }

                override fun onStopped(file: File) {
                    listener.onStopped(file)
                    activeScheduledInfo = null
                }

                override fun onFailed(exception: Exception) {
                    listener.onFailed(exception)
                    activeScheduledInfo = null
                }
            })
        }, delayMs, TimeUnit.MILLISECONDS)
    }

    fun cancel() {
        scheduledStartFuture?.cancel(true)
        scheduledStopFuture?.cancel(true)
        scheduledStartFuture = null
        scheduledStopFuture = null
        activeScheduledInfo = null
    }
}
