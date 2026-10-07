package com.tommasomurador.studyplanner

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.widget.RemoteViews
import org.json.JSONArray
import org.json.JSONObject

class MascotWidgetProvider : AppWidgetProvider() {

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

            val views = RemoteViews(context.packageName, R.layout.widget_mascot_streak)

            // Setup Theme & Transparency
            val isLight = theme == "light"
            val alpha = (((100 - transparency) * 255) / 100).coerceIn(0, 255)
            val baseColor = if (isLight) Color.parseColor("#FFFFFF") else Color.parseColor("#141416")

            views.setInt(R.id.mascot_widget_bg, "setColorFilter", baseColor)
            views.setInt(R.id.mascot_widget_bg, "setImageAlpha", alpha)
            if (alpha == 0) {
                views.setViewVisibility(R.id.mascot_widget_bg, android.view.View.INVISIBLE)
            } else {
                views.setViewVisibility(R.id.mascot_widget_bg, android.view.View.VISIBLE)
            }

            val textColor = if (isLight) Color.parseColor("#111111") else Color.parseColor("#FFFFFF")
            val subColor = if (isLight) Color.parseColor("#666666") else Color.parseColor("#A0A0A0")

            views.setTextColor(R.id.mascot_streak_num, textColor)
            views.setTextColor(R.id.mascot_status_text, textColor)
            views.setTextColor(R.id.mascot_streak_label, subColor)
            views.setTextColor(R.id.mascot_sub_text, subColor)

            views.setTextViewText(R.id.mascot_streak_num, streak.toString())
            views.setTextViewText(R.id.mascot_streak_label, if (streak == 1) "giorno" else "giorni")

            // Mascot state based on streak and daily progress
            when {
                streak >= 7 && (allDone || noTasks) -> {
                    views.setImageViewResource(R.id.mascot_image, R.drawable.ic_mascot_fire)
                    views.setTextViewText(R.id.mascot_status_text, "Inarrestabile!")
                    views.setTextViewText(R.id.mascot_sub_text, "Super serie attiva")
                }
                allDone -> {
                    views.setImageViewResource(R.id.mascot_image, R.drawable.ic_mascot_happy)
                    views.setTextViewText(R.id.mascot_status_text, "Obiettivo centrato!")
                    views.setTextViewText(R.id.mascot_sub_text, "Serie protetta per oggi")
                }
                noTasks -> {
                    views.setImageViewResource(R.id.mascot_image, R.drawable.ic_mascot_happy)
                    views.setTextViewText(R.id.mascot_status_text, "Nessun compito")
                    views.setTextViewText(R.id.mascot_sub_text, "Giorno libero")
                }
                pendingCount > 0 && streak > 0 -> {
                    views.setImageViewResource(R.id.mascot_image, R.drawable.ic_mascot_warning)
                    views.setTextViewText(R.id.mascot_status_text, "Serie in pericolo!")
                    views.setTextViewText(R.id.mascot_sub_text, "$pendingCount da completare oggi")
                }
                else -> {
                    views.setImageViewResource(R.id.mascot_image, R.drawable.ic_mascot_sad)
                    views.setTextViewText(R.id.mascot_status_text, "Inizia a studiare")
                    views.setTextViewText(R.id.mascot_sub_text, "$pendingCount task in attesa")
                }
            }

            // Click to open main app
            val mainIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                101,
                mainIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.mascot_widget_root, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        fun updateAllWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val thisWidget = ComponentName(context, MascotWidgetProvider::class.java)
            val allIds = appWidgetManager.getAppWidgetIds(thisWidget)
            for (id in allIds) {
                updateAppWidget(context, appWidgetManager, id)
            }
        }
    }
}
