package com.tommasomurador.studyplanner

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.widget.RemoteViews
import org.json.JSONObject

class StudyPlannerWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
        super.onUpdate(context, appWidgetManager, appWidgetIds)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        when (intent.action) {
            ACTION_TOGGLE_TASK -> {
                val openApp = intent.getBooleanExtra(EXTRA_OPEN_APP, false)
                if (openApp) {
                    val mainIntent = Intent(context, MainActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    }
                    context.startActivity(mainIntent)
                    return
                }

                val taskKey = intent.getStringExtra(EXTRA_TASK_KEY)
                val isDone = intent.getBooleanExtra(EXTRA_IS_DONE, false)

                if (!taskKey.isNullOrEmpty()) {
                    try {
                        val vibrator = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                            val vm = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? android.os.VibratorManager
                            vm?.defaultVibrator
                        } else {
                            @Suppress("DEPRECATION")
                            context.getSystemService(Context.VIBRATOR_SERVICE) as? android.os.Vibrator
                        }
                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                            vibrator?.vibrate(android.os.VibrationEffect.createOneShot(35, android.os.VibrationEffect.DEFAULT_AMPLITUDE))
                        } else {
                            @Suppress("DEPRECATION")
                            vibrator?.vibrate(35)
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }

                    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                    val rawCompleted = prefs.getString(KEY_COMPLETED_JSON, "{}") ?: "{}"
                    try {
                        val completedObj = JSONObject(rawCompleted)
                        if (isDone) {
                            completedObj.put(taskKey, true)
                        } else {
                            completedObj.remove(taskKey)
                        }
                        prefs.edit().putString(KEY_COMPLETED_JSON, completedObj.toString()).apply()

                        // Notify widget data changed
                        val appWidgetManager = AppWidgetManager.getInstance(context)
                        val thisWidget = ComponentName(context, StudyPlannerWidgetProvider::class.java)
                        val allIds = appWidgetManager.getAppWidgetIds(thisWidget)
                        appWidgetManager.notifyAppWidgetViewDataChanged(allIds, R.id.widget_list_view)
                        for (id in allIds) {
                            updateAppWidget(context, appWidgetManager, id)
                        }



                        // Also notify MainActivity if active
                        MainActivity.activeInstance?.runOnUiThread {
                            MainActivity.activeInstance?.syncWidgetCompletionToJs()
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }
        }
    }

    companion object {
        const val PREFS_NAME = "studylog_widget_prefs"
        const val KEY_TASKS_JSON = "widget_tasks_json"
        const val KEY_COMPLETED_JSON = "widget_completed_json"
        const val KEY_THEME = "widget_theme"
        const val KEY_TRANSPARENCY = "widget_transparency"
        const val KEY_STREAK = "streak_days"

        const val ACTION_TOGGLE_TASK = "com.tommasomurador.studyplanner.ACTION_TOGGLE_TASK"
        const val ACTION_OPEN_ADD = "open_add_todo"
        const val EXTRA_ACTION = "widget_action"
        const val EXTRA_TASK_KEY = "task_key"
        const val EXTRA_IS_DONE = "is_done"
        const val EXTRA_OPEN_APP = "open_app"
        const val EXTRA_VIEW = "target_view"

        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val theme = prefs.getString(KEY_THEME, "dark") ?: "dark"
            val transparency = prefs.getInt(KEY_TRANSPARENCY, 0).coerceIn(0, 100)

            val views = RemoteViews(context.packageName, R.layout.widget_study_planner)

            // Setup Theme & Transparency
            val isLight = theme == "light"
            val alpha = (((100 - transparency) * 255) / 100).coerceIn(0, 255)
            val baseColor = if (isLight) Color.parseColor("#FFFFFF") else Color.parseColor("#141416")

            views.setInt(R.id.widget_bg, "setColorFilter", baseColor)
            views.setInt(R.id.widget_bg, "setImageAlpha", alpha)
            if (alpha == 0) {
                views.setViewVisibility(R.id.widget_bg, android.view.View.INVISIBLE)
            } else {
                views.setViewVisibility(R.id.widget_bg, android.view.View.VISIBLE)
            }

            val textColor = if (isLight) Color.parseColor("#111111") else Color.parseColor("#FFFFFF")
            val emptyTextColor = if (isLight) Color.parseColor("#666666") else Color.parseColor("#999999")

            views.setTextColor(R.id.widget_header_title, textColor)
            views.setTextColor(R.id.widget_empty_text, emptyTextColor)
            views.setInt(R.id.widget_btn_add, "setColorFilter", textColor)

            // Intent to open Main App on header tap
            val mainIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val mainPendingIntent = PendingIntent.getActivity(
                context,
                0,
                mainIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_header_title, mainPendingIntent)
            views.setOnClickPendingIntent(R.id.widget_empty_text, mainPendingIntent)
            views.setOnClickPendingIntent(R.id.widget_root, mainPendingIntent)
            views.setOnClickPendingIntent(R.id.widget_bg, mainPendingIntent)

            // Intent to open "Add Task" modal on "+" tap
            val addIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra(EXTRA_ACTION, ACTION_OPEN_ADD)
            }
            val addPendingIntent = PendingIntent.getActivity(
                context,
                2,
                addIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_btn_add, addPendingIntent)

            // Bind RemoteViewsService for ListView
            val serviceIntent = Intent(context, StudyPlannerWidgetService::class.java).apply {
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
                data = Uri.parse(toUri(Intent.URI_INTENT_SCHEME))
            }
            views.setRemoteAdapter(R.id.widget_list_view, serviceIntent)
            views.setEmptyView(R.id.widget_list_view, R.id.widget_empty_text)

            // Pending intent template for items in the list
            val itemClickIntent = Intent(context, StudyPlannerWidgetProvider::class.java).apply {
                action = ACTION_TOGGLE_TASK
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
            }
            val itemClickPendingIntent = PendingIntent.getBroadcast(
                context,
                10,
                itemClickIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
            )
            views.setPendingIntentTemplate(R.id.widget_list_view, itemClickPendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        fun updateAllWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val thisWidget = ComponentName(context, StudyPlannerWidgetProvider::class.java)
            val allWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget)
            appWidgetManager.notifyAppWidgetViewDataChanged(allWidgetIds, R.id.widget_list_view)
            for (widgetId in allWidgetIds) {
                updateAppWidget(context, appWidgetManager, widgetId)
            }
        }
    }
}
