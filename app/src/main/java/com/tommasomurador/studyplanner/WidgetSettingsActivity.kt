package com.tommasomurador.studyplanner

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.RadioButton
import android.widget.RadioGroup
import android.widget.SeekBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class WidgetSettingsActivity : AppCompatActivity() {

    private var appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID

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
        val currentTheme = prefs.getString(StudyPlannerWidgetProvider.KEY_THEME, "dark") ?: "dark"
        val currentTrans = prefs.getInt(StudyPlannerWidgetProvider.KEY_TRANSPARENCY, 0).coerceIn(0, 100)

        val radioGroupTheme = findViewById<RadioGroup>(R.id.radio_group_theme)
        val radioDark = findViewById<RadioButton>(R.id.radio_theme_dark)
        val radioLight = findViewById<RadioButton>(R.id.radio_theme_light)
        val textTransVal = findViewById<TextView>(R.id.text_transparency_value)
        val seekBarTrans = findViewById<SeekBar>(R.id.seekbar_transparency)
        val btnCancel = findViewById<Button>(R.id.btn_cancel)
        val btnSave = findViewById<Button>(R.id.btn_save)

        if (currentTheme == "light") {
            radioLight.isChecked = true
        } else {
            radioDark.isChecked = true
        }

        seekBarTrans.progress = currentTrans
        textTransVal.text = "$currentTrans%"

        seekBarTrans.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                textTransVal.text = "$progress%"
            }
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        btnCancel.setOnClickListener {
            finish()
        }

        btnSave.setOnClickListener {
            val selectedTheme = if (radioLight.isChecked) "light" else "dark"
            val selectedTrans = seekBarTrans.progress

            prefs.edit()
                .putString(StudyPlannerWidgetProvider.KEY_THEME, selectedTheme)
                .putInt(StudyPlannerWidgetProvider.KEY_TRANSPARENCY, selectedTrans)
                .apply()

            StudyPlannerWidgetProvider.updateAllWidgets(this)

            MainActivity.activeInstance?.runOnUiThread {
                MainActivity.activeInstance?.updateWidgetSettingsInJs(selectedTheme, selectedTrans)
            }

            val resultValue = Intent().apply {
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
            }
            setResult(Activity.RESULT_OK, resultValue)
            finish()
        }
    }
}
