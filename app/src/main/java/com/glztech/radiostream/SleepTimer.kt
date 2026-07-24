package com.glztech.radiostream

import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import androidx.media3.common.Player

internal object SleepTimer {
    private val handler = Handler(Looper.getMainLooper())
    private var stopAction: Runnable? = null

    @Volatile
    var deadlineElapsedRealtime: Long? = null
        private set

    @Volatile
    var durationMinutes: Int? = null
        private set

    fun schedule(player: Player, minutes: Int) {
        require(minutes > 0)
        cancel()
        durationMinutes = minutes
        deadlineElapsedRealtime = SystemClock.elapsedRealtime() + minutes * 60_000L
        stopAction = Runnable {
            player.stop()
            player.clearMediaItems()
            deadlineElapsedRealtime = null
            durationMinutes = null
            stopAction = null
        }.also { handler.postDelayed(it, minutes * 60_000L) }
    }

    fun cancel() {
        stopAction?.let(handler::removeCallbacks)
        stopAction = null
        deadlineElapsedRealtime = null
        durationMinutes = null
    }

    fun remainingMinutes(): Int? {
        val deadline = deadlineElapsedRealtime ?: return null
        val remaining = (deadline - SystemClock.elapsedRealtime()).coerceAtLeast(0L)
        return ((remaining + 59_999L) / 60_000L).toInt()
    }
}
