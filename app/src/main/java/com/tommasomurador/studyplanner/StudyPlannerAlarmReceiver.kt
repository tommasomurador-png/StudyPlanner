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
import java.util.Calendar

class StudyPlannerAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        if (action == Intent.ACTION_BOOT_COMPLETED || action == "android.intent.action.QUICKBOOT_POWERON") {
            scheduleDailyAlarms(context)
            return
        }

        // Recupera profilo utente e preferenze
        val prefs = context.getSharedPreferences(StudyPlannerWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE)
        val userName = prefs.getString("user_name", "")?.trim().let {
            if (it.isNullOrEmpty()) "Campione" else it
        }

        val tasksJson = prefs.getString(StudyPlannerWidgetProvider.KEY_TASKS_JSON, "[]") ?: "[]"
        val completedJson = prefs.getString(StudyPlannerWidgetProvider.KEY_COMPLETED_JSON, "{}") ?: "{}"
        val streak = prefs.getInt(StudyPlannerWidgetProvider.KEY_STREAK, 0)

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
        val everythingCompleted = totalTasks > 0 && pendingTasks == 0

        // Se tutto è completato, usa le frasi di chiusura
        val title = "Study Planner"
        val message = if (everythingCompleted) {
            pickRandom(completedPhrases)
        } else {
            // Seleziona la fascia oraria attuale
            val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
            val list = when (hour) {
                in 0..3 -> nightPhrases
                in 4..11 -> morningPhrases
                in 12..15 -> afternoonPhrases
                in 16..19 -> eveningPhrases
                in 20..21 -> nightUrgentPhrases
                else -> lateNightCriticalPhrases // 22..23
            }
            pickRandom(list)
                .replace("[Username]", userName)
                .replace("[USERNAME]", userName.uppercase())
                .replace("[Course]", firstCourse)
        }

        showNotification(context, title, message)

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
            val descriptionText = "Promemoria di studio, sessioni Pomodoro e avvisi verifiche"
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
        return if (list.isNotEmpty()) list.random() else "Tempo di studiare!"
    }

    companion object {
        private val completedPhrases = listOf(
            "See you tomorrow!",
            "Till next time!",
            "See you again?",
            "See you later!",
            "Miss me yet?",
            "Way to go!",
            "Miss you already!",
            "Come back soon!",
            "Don't forget me!"
        )

        private val nightPhrases = listOf(
            "Late night lesson?",
            "Since you're up...",
            "Learn from bed?",
            "Can't sleep, [Username]?",
            "Start early, [Username]!"
        )

        private val morningPhrases = listOf(
            "Morning, [Username]!",
            "[Username]! You're up!",
            "Coffee + [Course]?",
            "Get started early!",
            "Early lesson?",
            "Gooooood morning!"
        )

        private val afternoonPhrases = listOf(
            "Time to practice!",
            "Time to learn [Course]",
            "[Username]! Practice?",
            "Practice time!",
            "[Course] lesson?",
            "Pleasseeeeee?",
            "Lesson, [Username]?",
            "Start a lesson!",
            "Got 3 minutes?",
            "Let's practice!",
            "Hey, [Username]."
        )

        private val eveningPhrases = listOf(
            "Seriously, [Username].",
            "Please practice!",
            "Duo's waiting!",
            "[Username]?",
            "Ready??????",
            "[Username]! It's late!",
            "I'm waitingggg!",
            "Extend your streak!",
            "It's getting late!",
            "You ready, [Username]?"
        )

        private val nightUrgentPhrases = listOf(
            "[Username]...",
            "Last chance, [Username]!",
            "[Username]????",
            "It's late!",
            "Time's up [Username]!",
            "Don't let it break!",
            "Time's almost up!",
            "Where ARE you?",
            "Do! Your! [Course]!",
            "Protect your streak!",
            "Duo's worried!",
            "Save your streak!",
            "Last chance!",
            "Run or Rest?",
            "Save your streak"
        )

        private val lateNightCriticalPhrases = listOf(
            "[Username].",
            "[USERNAME], PLEASE??",
            "Last chance!",
            "Now or never!",
            "Don't forget me!",
            "Save your streak!",
            "Duo's not happy...",
            "Duo is watching...",
            "It's VERY late!",
            "Bye-bye, streak??",
            "Practice now!",
            "Almost midnight!",
            "LESSON NOW, [USERNAME]",
            "ALMOST TOO LATE, [USERNAME]",
            "*screams internally*",
            "*PANIC NOISES*"
        )

        fun scheduleDailyAlarms(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return

            // Ore di notifica durante la giornata
            val targetHours = listOf(8, 14, 18, 20, 22)

            for (hour in targetHours) {
                val calendar = Calendar.getInstance().apply {
                    set(Calendar.HOUR_OF_DAY, hour)
                    set(Calendar.MINUTE, 0)
                    set(Calendar.SECOND, 0)
                    set(Calendar.MILLISECOND, 0)
                    if (before(Calendar.getInstance())) {
                        add(Calendar.DAY_OF_YEAR, 1)
                    }
                }

                val intent = Intent(context, StudyPlannerAlarmReceiver::class.java).apply {
                    action = "com.tommasomurador.studyplanner.NOTIFICATION_ALARM_$hour"
                }
                val pendingIntent = PendingIntent.getBroadcast(
                    context,
                    hour,
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
