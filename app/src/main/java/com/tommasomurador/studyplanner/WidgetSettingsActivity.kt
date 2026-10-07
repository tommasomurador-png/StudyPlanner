package com.tommasomurador.studyplanner

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.SeekBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class WidgetSettingsActivity : AppCompatActivity() {

    private var appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID
    private var selectedTheme = "dark"
    private var selectedTransparency = 0

    private lateinit var btnThemeDark: LinearLayout
    private lateinit var btnThemeLight: LinearLayout
    private lateinit var textThemeDark: TextView
    private lateinit var textThemeLight: TextView
    private lateinit var iconThemeDark: ImageView
    private lateinit var iconThemeLight: ImageView

    private lateinit var textTransVal: TextView
    private lateinit var seekBarTrans: SeekBar

    private lateinit var previewBg: ImageView
    private lateinit var previewTitle: TextView
    private lateinit var previewAdd: ImageView
    private lateinit var previewChk1: ImageView
    private lateinit var previewItem1: TextView
    private lateinit var previewChk2: ImageView
    private lateinit var previewItem2: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setResult(Activity.RESULT_OK)

        val intent = intent
        val extras = intent.extras
        if (extras != null) {
            appWidgetId = extras.getInt(
                AppWidgetManager.EXTRA_APPWIDGET_ID,
                AppWidgetManager.INVALID_APPWIDGET_ID
            )
        }

        setContentView(R.layout.activity_widget_settings)

        val prefs = getSharedPreferences(StudyPlannerWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE)
        selectedTheme = prefs.getString(StudyPlannerWidgetProvider.KEY_THEME, "dark") ?: "dark"
        selectedTransparency = prefs.getInt(StudyPlannerWidgetProvider.KEY_TRANSPARENCY, 0).coerceIn(0, 100)

        // Find Theme Views
        btnThemeDark = findViewById(R.id.btn_theme_dark)
        btnThemeLight = findViewById(R.id.btn_theme_light)
        textThemeDark = findViewById(R.id.text_theme_dark)
        textThemeLight = findViewById(R.id.text_theme_light)
        iconThemeDark = findViewById(R.id.icon_theme_dark)
        iconThemeLight = findViewById(R.id.icon_theme_light)

        // Find Transparency Views
        textTransVal = findViewById(R.id.text_transparency_value)
        seekBarTrans = findViewById(R.id.seekbar_transparency)

        // Find Preview Views
        previewBg = findViewById(R.id.widget_preview_bg)
        previewTitle = findViewById(R.id.widget_preview_title)
        previewAdd = findViewById(R.id.widget_preview_add)
        previewChk1 = findViewById(R.id.widget_preview_chk1)
        previewItem1 = findViewById(R.id.widget_preview_item1)
        previewChk2 = findViewById(R.id.widget_preview_chk2)
        previewItem2 = findViewById(R.id.widget_preview_item2)

        val btnCancel = findViewById<TextView>(R.id.btn_cancel)
        val btnSave = findViewById<TextView>(R.id.btn_save)

        // Setup Theme Click Listeners
        btnThemeDark.setOnClickListener {
            selectedTheme = "dark"
            updateThemeButtons()
            updatePreview()
        }

        btnThemeLight.setOnClickListener {
            selectedTheme = "light"
            updateThemeButtons()
            updatePreview()
        }

        // Setup SeekBar
        seekBarTrans.progress = selectedTransparency
        textTransVal.text = "$selectedTransparency%"

        seekBarTrans.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                selectedTransparency = progress.coerceIn(0, 100)
                textTransVal.text = "$selectedTransparency%"
                updatePreview()
            }
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        btnCancel.setOnClickListener {
            finish()
        }

        btnSave.setOnClickListener {
            prefs.edit()
                .putString(StudyPlannerWidgetProvider.KEY_THEME, selectedTheme)
                .putInt(StudyPlannerWidgetProvider.KEY_TRANSPARENCY, selectedTransparency)
                .apply()

            StudyPlannerWidgetProvider.updateAllWidgets(this)
            MascotWidgetProvider.updateAllWidgets(this)
            MascotBannerWidgetProvider.updateAllWidgets(this)

            MainActivity.activeInstance?.runOnUiThread {
                MainActivity.activeInstance?.updateWidgetSettingsInJs(selectedTheme, selectedTransparency)
            }

            val resultValue = Intent().apply {
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
            }
            setResult(Activity.RESULT_OK, resultValue)
            finish()
        }

        updateThemeButtons()
        updatePreview()
    }

    private fun updateThemeButtons() {
        if (selectedTheme == "light") {
            btnThemeLight.setBackgroundResource(R.drawable.bg_pill_active)
            textThemeLight.setTextColor(Color.WHITE)
            iconThemeLight.setColorFilter(Color.WHITE)

            btnThemeDark.setBackgroundResource(R.drawable.bg_pill_inactive)
            textThemeDark.setTextColor(Color.parseColor("#9E9EA6"))
            iconThemeDark.setColorFilter(Color.parseColor("#9E9EA6"))
        } else {
            btnThemeDark.setBackgroundResource(R.drawable.bg_pill_active)
            textThemeDark.setTextColor(Color.WHITE)
            iconThemeDark.setColorFilter(Color.WHITE)

            btnThemeLight.setBackgroundResource(R.drawable.bg_pill_inactive)
            textThemeLight.setTextColor(Color.parseColor("#9E9EA6"))
            iconThemeLight.setColorFilter(Color.parseColor("#9E9EA6"))
        }
    }

    private fun updatePreview() {
        val isLight = selectedTheme == "light"
        val alpha = (((100 - selectedTransparency) * 255) / 100).coerceIn(0, 255)

        val cardColor = if (isLight) Color.parseColor("#FFFFFF") else Color.parseColor("#141416")
        previewBg.setColorFilter(cardColor)
        previewBg.imageAlpha = alpha

        if (alpha == 0) {
            previewBg.visibility = View.INVISIBLE
        } else {
            previewBg.visibility = View.VISIBLE
        }

        val primaryTextColor = if (isLight) Color.parseColor("#111111") else Color.parseColor("#FFFFFF")
        val secondaryTextColor = if (isLight) Color.parseColor("#666666") else Color.parseColor("#A0A0A0")
        val iconTint = if (isLight) Color.parseColor("#333333") else Color.parseColor("#DDDDDD")

        previewTitle.setTextColor(primaryTextColor)
        previewAdd.setColorFilter(primaryTextColor)
        previewItem1.setTextColor(primaryTextColor)
        previewItem2.setTextColor(secondaryTextColor)
        previewChk1.setColorFilter(iconTint)
    }
}
