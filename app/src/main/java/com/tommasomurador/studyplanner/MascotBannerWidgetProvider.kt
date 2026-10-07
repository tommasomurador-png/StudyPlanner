package com.tommasomurador.studyplanner

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.view.View
import android.widget.RemoteViews
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

class MascotBannerWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
        super.onUpdate(context, appWidgetManager, appWidgetIds)
    }

    companion object {
        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val prefs = context.getSharedPreferences(StudyPlannerWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE)
            val theme = prefs.getString(StudyPlannerWidgetProvider.KEY_THEME, "dark") ?: "dark"
            val transparency = prefs.getInt(StudyPlannerWidgetProvider.KEY_TRANSPARENCY, 0).coerceIn(0, 100)
            val streak = prefs.getInt(StudyPlannerWidgetProvider.KEY_STREAK, 0)
            val tasksJson = prefs.getString(StudyPlannerWidgetProvider.KEY_TASKS_JSON, "[]") ?: "[]"
            val completedJson = prefs.getString(StudyPlannerWidgetProvider.KEY_COMPLETED_JSON, "{}") ?: "{}"

            var totalTasks = 0
            var doneTasks = 0
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
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }

            val pendingCount = (totalTasks - doneTasks).coerceAtLeast(0)
            val allDone = totalTasks > 0 && pendingCount == 0
            val noTasks = totalTasks == 0

            val views = RemoteViews(context.packageName, R.layout.widget_mascot_banner)

            // Current hour for progressive Duolingo urgency
            val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
            val isNightPanic = pendingCount > 0 && streak > 0 && (hour >= 21 || hour < 4)

            // Theme & Transparency
            val isLight = theme == "light"
            val alpha = (((100 - transparency) * 255) / 100).coerceIn(0, 255)
            val baseColor = when {
                isNightPanic -> Color.parseColor("#881337")
                isLight -> Color.parseColor("#FFFFFF")
                else -> Color.parseColor("#141416")
            }

            views.setInt(R.id.mascot_banner_widget_bg, "setColorFilter", baseColor)
            views.setInt(R.id.mascot_banner_widget_bg, "setImageAlpha", alpha)
            if (alpha == 0) {
                views.setViewVisibility(R.id.mascot_banner_widget_bg, View.INVISIBLE)
            } else {
                views.setViewVisibility(R.id.mascot_banner_widget_bg, View.VISIBLE)
            }

            val textColor = when {
                isNightPanic -> Color.parseColor("#FFFFFF")
                isLight -> Color.parseColor("#111111")
                else -> Color.parseColor("#FFFFFF")
            }
            val subColor = when {
                isNightPanic -> Color.parseColor("#FECDD3")
                isLight -> Color.parseColor("#666666")
                else -> Color.parseColor("#A0A0A0")
            }

            views.setTextColor(R.id.mascot_banner_streak_num, textColor)
            views.setTextColor(R.id.mascot_banner_status_text, textColor)
            views.setTextColor(R.id.mascot_banner_streak_label, subColor)
            views.setTextColor(R.id.mascot_banner_progress_badge, subColor)
            views.setTextColor(R.id.mascot_banner_sub_text, subColor)

            views.setTextViewText(R.id.mascot_banner_streak_num, streak.toString())
            views.setTextViewText(R.id.mascot_banner_streak_label, if (streak == 1) "giorno" else "giorni")

            // Progress Bar & Badge
            if (totalTasks > 0) {
                val progressPercent = ((doneTasks * 100) / totalTasks).coerceIn(0, 100)
                views.setViewVisibility(R.id.mascot_banner_progress_bar, View.VISIBLE)
                views.setProgressBar(R.id.mascot_banner_progress_bar, 100, progressPercent, false)
                views.setTextViewText(R.id.mascot_banner_progress_badge, "$doneTasks/$totalTasks")
            } else {
                views.setViewVisibility(R.id.mascot_banner_progress_bar, View.GONE)
                views.setTextViewText(R.id.mascot_banner_progress_badge, "Riposo")
            }

            // Progressive Duolingo Mascot states
            when {
                streak >= 7 && (allDone || noTasks) -> {
                    views.setImageViewResource(R.id.mascot_banner_image, R.drawable.ic_mascot_fire)
                    views.setTextViewText(R.id.mascot_banner_status_text, "Inarrestabile!")
                    views.setTextViewText(R.id.mascot_banner_sub_text, "Super serie attiva ($streak giorni consecutivi)")
                }
                allDone -> {
                    views.setImageViewResource(R.id.mascot_banner_image, R.drawable.ic_mascot_happy)
                    views.setTextViewText(R.id.mascot_banner_status_text, "Obiettivo centrato!")
                    views.setTextViewText(R.id.mascot_banner_sub_text, "Tutti i compiti completati per oggi")
                }
                noTasks -> {
                    views.setImageViewResource(R.id.mascot_banner_image, R.drawable.ic_mascot_relax)
                    views.setTextViewText(R.id.mascot_banner_status_text, "Giorno di riposo")
                    views.setTextViewText(R.id.mascot_banner_sub_text, "Nessun compito programmato")
                }
                streak == 0 && pendingCount > 0 -> {
                    views.setImageViewResource(R.id.mascot_banner_image, R.drawable.ic_mascot_sad)
                    views.setTextViewText(R.id.mascot_banner_status_text, "Inizia la tua serie!")
                    views.setTextViewText(R.id.mascot_banner_sub_text, "$pendingCount compiti pronti da studiare")
                }
                // Urgenza progressiva oraria in stile Duolingo
                hour in 4..11 -> {
                    // Mattina: incoraggiamento
                    views.setImageViewResource(R.id.mascot_banner_image, R.drawable.ic_mascot_morning)
                    views.setTextViewText(R.id.mascot_banner_status_text, "Buongiorno!")
                    views.setTextViewText(R.id.mascot_banner_sub_text, "$pendingCount compiti da completare oggi")
                }
                hour in 12..17 -> {
                    // Pomeriggio: focus e studio
                    views.setImageViewResource(R.id.mascot_banner_image, R.drawable.ic_mascot_thinking)
                    views.setTextViewText(R.id.mascot_banner_status_text, "Pausa studio?")
                    views.setTextViewText(R.id.mascot_banner_sub_text, "Ti mancano $pendingCount compiti per salvare la serie")
                }
                hour in 18..20 -> {
                    // Sera: allerta media
                    views.setImageViewResource(R.id.mascot_banner_image, R.drawable.ic_mascot_warning)
                    views.setTextViewText(R.id.mascot_banner_status_text, "Non dimenticare i compiti!")
                    views.setTextViewText(R.id.mascot_banner_sub_text, "Mancano solo poche ore ($pendingCount rimasti)")
                }
                else -> {
                    // Notte (21..23 o 0..3): Panico Duolingo rosso
                    views.setImageViewResource(R.id.mascot_banner_image, R.drawable.ic_mascot_desperate)
                    views.setTextViewText(R.id.mascot_banner_status_text, "SERIE IN PERICOLO!")
                    views.setTextViewText(R.id.mascot_banner_sub_text, "Completa subito $pendingCount compiti prima di mezzanotte!")
                }
            }

            // Click to open main app
            val mainIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                102,
                mainIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.mascot_banner_widget_root, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        fun updateAllWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val thisWidget = ComponentName(context, MascotBannerWidgetProvider::class.java)
            val allIds = appWidgetManager.getAppWidgetIds(thisWidget)
            for (id in allIds) {
                updateAppWidget(context, appWidgetManager, id)
            }
        }
    }
}
