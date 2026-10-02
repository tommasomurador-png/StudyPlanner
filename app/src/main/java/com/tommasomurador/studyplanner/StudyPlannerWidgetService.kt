package com.tommasomurador.studyplanner

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.text.SpannableString
import android.text.Spanned
import android.text.style.StrikethroughSpan
import android.widget.RemoteViews
import android.widget.RemoteViewsService
import org.json.JSONArray
import org.json.JSONObject

class StudyPlannerWidgetService : RemoteViewsService() {
    override fun onGetViewFactory(intent: Intent): RemoteViewsFactory {
        return StudyPlannerRemoteViewsFactory(this.applicationContext)
    }
}

class StudyPlannerRemoteViewsFactory(private val context: Context) : RemoteViewsService.RemoteViewsFactory {

    private val taskList = ArrayList<WidgetTask>()
    private var isLightTheme = false

    data class WidgetTask(
        val id: String,
        val title: String,
        val subtitle: String,
        val subject: String,
        val isDone: Boolean
    )

    override fun onCreate() {
        loadData()
    }

    override fun onDataSetChanged() {
        loadData()
    }

    private fun loadData() {
        taskList.clear()
        val prefs = context.getSharedPreferences(StudyPlannerWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE)
        val theme = prefs.getString(StudyPlannerWidgetProvider.KEY_THEME, "dark") ?: "dark"
        isLightTheme = theme == "light"

        val rawTasks = prefs.getString(StudyPlannerWidgetProvider.KEY_TASKS_JSON, "[]") ?: "[]"
        val rawCompleted = prefs.getString(StudyPlannerWidgetProvider.KEY_COMPLETED_JSON, "{}") ?: "{}"

        try {
            val jsonArray = JSONArray(rawTasks)
            val completedObj = JSONObject(rawCompleted)

            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                val id = obj.optString("id", "")
                val key = obj.optString("setKey", id)
                val title = obj.optString("title", "")
                val subtitle = obj.optString("subtitle", "")
                val subject = obj.optString("subject", "")
                
                val isCompleted = completedObj.optBoolean(key, false) || obj.optBoolean("isDone", false)

                taskList.add(WidgetTask(id = key, title = title, subtitle = subtitle, subject = subject, isDone = isCompleted))
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onDestroy() {
        taskList.clear()
    }

    override fun getCount(): Int = taskList.size

    override fun getViewAt(position: Int): RemoteViews {
        if (position >= taskList.size) return RemoteViews(context.packageName, R.layout.widget_task_item)

        val task = taskList[position]
        val views = RemoteViews(context.packageName, R.layout.widget_task_item)

        val displayTitle = if (task.subject.isNotEmpty()) {
            "[${task.subject}] ${task.title}"
        } else {
            task.title
        }

        val textColor = if (isLightTheme) {
            if (task.isDone) Color.parseColor("#888888") else Color.parseColor("#111111")
        } else {
            if (task.isDone) Color.parseColor("#777777") else Color.parseColor("#FFFFFF")
        }

        val subtitleColor = if (isLightTheme) Color.parseColor("#666666") else Color.parseColor("#A0A0A5")

        if (task.isDone) {
            val spannable = SpannableString(displayTitle)
            spannable.setSpan(StrikethroughSpan(), 0, spannable.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
            views.setTextViewText(R.id.widget_item_title, spannable)
            views.setImageViewResource(R.id.widget_item_checkbox, R.drawable.ic_widget_check_done)
        } else {
            views.setTextViewText(R.id.widget_item_title, displayTitle)
            views.setImageViewResource(R.id.widget_item_checkbox, R.drawable.ic_widget_check_empty)
            val iconTint = if (isLightTheme) Color.parseColor("#333333") else Color.parseColor("#DDDDDD")
            views.setInt(R.id.widget_item_checkbox, "setColorFilter", iconTint)
        }
        views.setTextColor(R.id.widget_item_title, textColor)

        if (task.subtitle.isNotEmpty()) {
            views.setViewVisibility(R.id.widget_item_subtitle, android.view.View.VISIBLE)
            views.setTextViewText(R.id.widget_item_subtitle, task.subtitle)
            views.setTextColor(R.id.widget_item_subtitle, subtitleColor)
        } else {
            views.setViewVisibility(R.id.widget_item_subtitle, android.view.View.GONE)
        }

        // Fill-in intent for toggling the task
        val fillInIntent = Intent().apply {
            putExtra(StudyPlannerWidgetProvider.EXTRA_TASK_KEY, task.id)
            putExtra(StudyPlannerWidgetProvider.EXTRA_IS_DONE, !task.isDone)
        }
        views.setOnClickFillInIntent(R.id.widget_item_checkbox, fillInIntent)

        // Tapping anywhere on the item (except checkbox) opens the app
        val openAppIntent = Intent().apply {
            putExtra(StudyPlannerWidgetProvider.EXTRA_OPEN_APP, true)
        }
        views.setOnClickFillInIntent(R.id.widget_item_container, openAppIntent)
        views.setOnClickFillInIntent(R.id.widget_item_title, openAppIntent)
        views.setOnClickFillInIntent(R.id.widget_item_subtitle, openAppIntent)

        return views
    }

    override fun getLoadingView(): RemoteViews? = null
    override fun getViewTypeCount(): Int = 1
    override fun getItemId(position: Int): Long = position.toLong()
    override fun hasStableIds(): Boolean = true
}
