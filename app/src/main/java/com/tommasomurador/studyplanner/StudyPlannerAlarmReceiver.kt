package com.tommasomurador.studyplanner

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class StudyPlannerAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        if (action == Intent.ACTION_BOOT_COMPLETED || action == "android.intent.action.QUICKBOOT_POWERON") {
            scheduleDailyAlarms(context)
            StudyPlannerWidgetProvider.updateAllWidgets(context)
            return
        }

        val prefs = context.getSharedPreferences(StudyPlannerWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE)
        val userName = prefs.getString("user_name", "")?.trim().let {
            if (it.isNullOrEmpty()) "Studente" else it
        }

        val tasksJson = prefs.getString(StudyPlannerWidgetProvider.KEY_TASKS_JSON, "[]") ?: "[]"
        val completedJson = prefs.getString(StudyPlannerWidgetProvider.KEY_COMPLETED_JSON, "{}") ?: "{}"

        var totalTasks = 0
        var doneTasks = 0
        var firstCourse = "Studio"

        try {
            val tasksArray = JSONArray(tasksJson)
            val completedObj = JSONObject(completedJson)
            totalTasks = tasksArray.length()
            for (i in 0 until tasksArray.length()) {
                val t = tasksArray.getJSONObject(i)
                val setKey = t.optString("setKey", "")
                val isDone = t.optBoolean("isDone", false) || (setKey.isNotEmpty() && completedObj.optBoolean(setKey, false))
                if (isDone) {
                    doneTasks++
                } else if (firstCourse == "Studio") {
                    val sub = t.optString("subject", "").trim()
                    if (sub.isNotEmpty()) firstCourse = sub
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        val pendingTasks = (totalTasks - doneTasks).coerceAtLeast(0)
        val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())

        // Se non ci sono compiti oggi, non inviare alcuna notifica
        if (totalTasks > 0) {
            if (pendingTasks == 0) {
                // Congratulazioni finali (una sola volta al giorno)
                val lastCompletedDate = prefs.getString("last_completed_notif_date", "")
                if (lastCompletedDate != todayStr) {
                    showNotification(context, "Serie completata", pickRandom(completedPhrases))
                    prefs.edit().putString("last_completed_notif_date", todayStr).apply()
                }
            } else {
                // Controlla fascia oraria in base al giorno della settimana
                val cal = Calendar.getInstance()
                val dayOfWeek = cal.get(Calendar.DAY_OF_WEEK)
                val isWeekend = (dayOfWeek == Calendar.SATURDAY || dayOfWeek == Calendar.SUNDAY)
                val minutesOfDay = cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE)
                val minAllowedMinutes = if (isWeekend) (8 * 60) else (14 * 60 + 30)

                if (minutesOfDay >= minAllowedMinutes) {
                    val (title, pool) = when {
                        isWeekend && minutesOfDay < 13 * 60 -> "Buongiorno" to morningPhrases
                        minutesOfDay < 17 * 60 -> "Ora di iniziare" to afternoonPhrases
                        minutesOfDay < 20 * 60 -> "Continua cosi'" to eveningPhrases
                        minutesOfDay < 22 * 60 + 30 -> "Chiusura di giornata" to nightUrgentPhrases
                        else -> "Ultimo avviso" to lateNightCriticalPhrases
                    }
                    val pendingLabel = if (pendingTasks == 1) "1 task" else "$pendingTasks task"
                    val message = pickRandom(pool)
                        .replace("[Username]", userName)
                        .replace("[USERNAME]", userName.uppercase())
                        .replace("[Course]", firstCourse)
                        .replace("[Pending]", pendingLabel)

                    showNotification(context, title, message)
                }
            }
        }

        // Aggiorna lo stato visivo del widget To-Do
        StudyPlannerWidgetProvider.updateAllWidgets(context)

        // Riprogramma gli allarmi per continuare ad averli attivi
        scheduleDailyAlarms(context)
    }

    private fun showNotification(context: Context, title: String, message: String) {
        try {
            ensureNotificationChannel(context)

            val mainIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                mainIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val cleanTitle = stripEmojis(title)
            val cleanBody = stripEmojis(message)

            val builder = NotificationCompat.Builder(context, MainActivity.CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle(cleanTitle)
                .setContentText(cleanBody)
                .setStyle(NotificationCompat.BigTextStyle().bigText(cleanBody))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setVibrate(longArrayOf(0, 200, 100, 200))

            val notificationManager = NotificationManagerCompat.from(context)
            val notifId = (System.currentTimeMillis() % 100000).toInt()
            notificationManager.notify(notifId, builder.build())
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun ensureNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Notifiche Study Planner"
            val descriptionText = "Promemoria motivazionali di studio e completamento serie"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(MainActivity.CHANNEL_ID, name, importance).apply {
                description = descriptionText
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 200, 100, 200)
            }
            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.createNotificationChannel(channel)
        }
    }

    private fun stripEmojis(input: String): String {
        val emojiPattern = java.util.regex.Pattern.compile("[\\p{So}\\p{Cn}\\p{Cs}\\p{Extended_Pictographic}]|[\\uD83C-\\uDBFF\\uDC00-\\uDFFF]|[\\u2600-\\u27BF]")
        return emojiPattern.matcher(input).replaceAll("").trim()
    }

    private fun pickRandom(list: List<String>): String {
        return if (list.isNotEmpty()) list.random() else "E' il momento di studiare."
    }

    companion object {
        private val completedPhrases = listOf(
            "Ottimo lavoro. Hai completato tutte le task di oggi.",
            "Serie di oggi completata. Ora puoi riposarti.",
            "Complimenti, nessuna task rimasta per oggi.",
            "Obiettivo raggiunto. A domani per la prossima serie.",
            "Tutto fatto per oggi. Ottima costanza."
        )

        // Fascia Mattina (08:00 - 12:59, solo Sabato e Domenica)
        private val morningPhrases = listOf(
            "Inizia subito con [Course] e liberati il pomeriggio.",
            "Hai [Pending] oggi. Parti con calma ma parti ora.",
            "Un passo alla volta stamattina e finisci presto.",
            "Apri i libri adesso, il resto della giornata sara' tuo.",
            "Prima inizi [Course], prima sei libero."
        )

        // Fascia Primo Pomeriggio (14:30 - 16:59 Lun-Ven | 13:00 - 16:59 Sab-Dom)
        private val afternoonPhrases = listOf(
            "Ti aspettano [Pending] oggi. Inizia da [Course].",
            "Mettiti al lavoro adesso, basta iniziare per prendere ritmo.",
            "Concentrazione su [Course]. Finisci prima di sera.",
            "Il momento migliore per studiare e' adesso.",
            "Un blocco alla volta e chiudi tutto oggi."
        )

        // Fascia Tardo Pomeriggio (17:00 - 19:59)
        private val eveningPhrases = listOf(
            "Ti restano [Pending]. Chiudile prima di cena.",
            "Non rimandare a stasera, completa [Course] ora.",
            "Ultimo sforzo del pomeriggio, sei vicino al traguardo.",
            "Mantieni il ritmo: manca poco per finire oggi.",
            "Dedica mezz'ora adesso e poi stacca del tutto."
        )

        // Fascia Sera (20:00 - 22:29)
        private val nightUrgentPhrases = listOf(
            "La giornata sta finendo: chiudi [Pending].",
            "Completa [Course] adesso e goditi la serata.",
            "Non lasciare in sospeso le task di oggi.",
            "Ancora uno sforzo per proteggere la tua serie.",
            "Finisci quello che manca e riposati senza pensieri."
        )

        // Fascia Pre-mezzanotte (22:30 - 23:59)
        private val lateNightCriticalPhrases = listOf(
            "Manca poco a mezzanotte. Completa [Pending] per salvare la serie.",
            "Ultimo sprint prima di mezzanotte: ti manca [Course].",
            "Non perdere la serie proprio ora, chiudi [Pending].",
            "Ultime battute della giornata. Dai il massimo adesso.",
            "Ancora pochi minuti prima di mezzanotte. Ce la puoi fare."
        )

        fun scheduleDailyAlarms(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return

            // Slot orari: 08:00 e 10:30 (attivi solo Sab/Dom), 14:30, 17:00, 19:30, 21:30, 23:00 (tutti i giorni fino a mezzanotte)
            val targetSlots = listOf(
                Pair(8, 0),
                Pair(10, 30),
                Pair(14, 30),
                Pair(17, 0),
                Pair(19, 30),
                Pair(21, 30),
                Pair(23, 0)
            )

            for ((hour, minute) in targetSlots) {
                val calendar = Calendar.getInstance().apply {
                    set(Calendar.HOUR_OF_DAY, hour)
                    set(Calendar.MINUTE, minute)
                    set(Calendar.SECOND, 0)
                    set(Calendar.MILLISECOND, 0)
                    if (before(Calendar.getInstance())) {
                        add(Calendar.DAY_OF_YEAR, 1)
                    }
                }

                val reqCode = hour * 100 + minute
                val intent = Intent(context, StudyPlannerAlarmReceiver::class.java).apply {
                    action = "com.tommasomurador.studyplanner.NOTIFICATION_ALARM_$reqCode"
                }
                val pendingIntent = PendingIntent.getBroadcast(
                    context,
                    reqCode,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        alarmManager.setAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            calendar.timeInMillis,
                            pendingIntent
                        )
                    } else {
                        alarmManager.set(
                            AlarmManager.RTC_WAKEUP,
                            calendar.timeInMillis,
                            pendingIntent
                        )
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
    }
}
