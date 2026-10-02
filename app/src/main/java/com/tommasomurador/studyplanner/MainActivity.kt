package com.tommasomurador.studyplanner

import android.Manifest
import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    companion object {
        const val CHANNEL_ID = "studyplanner_notifications"
        const val NOTIF_PERMISSION_CODE = 101
        var activeInstance: MainActivity? = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        activeInstance = this

        // Setup Edge-to-Edge UI
        WindowCompat.setDecorFitsSystemWindows(window, true)

        createNotificationChannel()
        checkAndRequestNotificationPermission()

        webView = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#F9F7F1"))
        }
        setContentView(webView)

        setupWebViewSettings()
        setupBackNavigation()

        // Load the local app bundle
        webView.loadUrl("file:///android_asset/index.html")
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Notifiche Study Planner"
            val descriptionText = "Promemoria di studio, sessioni Pomodoro e avvisi verifiche"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 200, 100, 200)
            }
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun checkAndRequestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.POST_NOTIFICATIONS), NOTIF_PERMISSION_CODE)
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebViewSettings() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.mediaPlaybackRequiresUserGesture = false

        // Bridge for native features (haptic feedback, platform check, native notifications)
        webView.addJavascriptInterface(WebAppInterface(this), "AndroidNative")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                return if (url.startsWith("file:///android_asset/") || url.startsWith("https://tommasomurador-png.github.io/")) {
                    false
                } else {
                    // Open external links (e.g. GitHub, documentation) in external browser
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                    true
                }
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                handleTargetView(intent)
                syncWidgetCompletionToJs()
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                return super.onConsoleMessage(consoleMessage)
            }
        }
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                webView.evaluateJavascript("window.handleAndroidBackPressed ? window.handleAndroidBackPressed() : 'false'") { result ->
                    val handledInJs = result?.replace("\"", "") == "true"
                    if (!handledInJs) {
                        if (webView.canGoBack()) {
                            webView.goBack()
                        } else {
                            isEnabled = false
                            onBackPressedDispatcher.onBackPressed()
                        }
                    }
                }
            }
        })
    }

    override fun onResume() {
        super.onResume()
        activeInstance = this
        webView.onResume()
        syncWidgetCompletionToJs()
    }

    override fun onPause() {
        webView.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        if (activeInstance == this) activeInstance = null
        webView.destroy()
        super.onDestroy()
    }

    fun syncWidgetCompletionToJs() {
        try {
            val prefs = getSharedPreferences(StudyPlannerWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE)
            val completedJson = prefs.getString(StudyPlannerWidgetProvider.KEY_COMPLETED_JSON, "{}") ?: "{}"
            val escaped = completedJson.replace("\\", "\\\\").replace("'", "\\'")
            webView.post {
                webView.evaluateJavascript("window.syncFromNativeWidget ? window.syncFromNativeWidget('$escaped') : null", null)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    inner class WebAppInterface(private val context: Context) {
        @JavascriptInterface
        fun isNativeAndroid(): Boolean = true

        @JavascriptInterface
        fun hasNotificationPermission(): Boolean {
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
            } else {
                true
            }
        }

        @JavascriptInterface
        fun requestNotificationPermission() {
            runOnUiThread {
                checkAndRequestNotificationPermission()
            }
        }

        private fun stripEmojis(input: String): String {
            val emojiPattern = java.util.regex.Pattern.compile("[\\p{So}\\p{Cn}\\p{Cs}\\p{Extended_Pictographic}]|[\\uD83C-\\uDBFF\\uDC00-\\uDFFF]|[\\u2600-\\u27BF]")
            return emojiPattern.matcher(input).replaceAll("").trim()
        }

        @JavascriptInterface
        fun showNotification(title: String, body: String) {
            try {
                val cleanTitle = stripEmojis(title)
                val cleanBody = stripEmojis(body)

                val intent = Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                val pendingIntent = PendingIntent.getActivity(
                    context,
                    0,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

                val builder = NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(R.drawable.ic_notification)
                    .setContentTitle(cleanTitle)
                    .setContentText(cleanBody)
                    .setStyle(NotificationCompat.BigTextStyle().bigText(cleanBody))
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setAutoCancel(true)
                    .setContentIntent(pendingIntent)
                    .setVibrate(longArrayOf(0, 200, 100, 200))

                val notificationManager = NotificationManagerCompat.from(context)
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
                    ActivityCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
                    val notifId = (System.currentTimeMillis() % 100000).toInt()
                    notificationManager.notify(notifId, builder.build())
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        @JavascriptInterface
        fun updateWidgetTasks(tasksJson: String, completedJson: String) {
            try {
                val prefs = context.getSharedPreferences(StudyPlannerWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE)
                prefs.edit()
                    .putString(StudyPlannerWidgetProvider.KEY_TASKS_JSON, tasksJson)
                    .putString(StudyPlannerWidgetProvider.KEY_COMPLETED_JSON, completedJson)
                    .apply()
                StudyPlannerWidgetProvider.updateAllWidgets(context)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        @JavascriptInterface
        fun setWidgetSettings(theme: String, transparency: Int) {
            try {
                val prefs = context.getSharedPreferences(StudyPlannerWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE)
                prefs.edit()
                    .putString(StudyPlannerWidgetProvider.KEY_THEME, theme)
                    .putInt(StudyPlannerWidgetProvider.KEY_TRANSPARENCY, transparency)
                    .apply()
                StudyPlannerWidgetProvider.updateAllWidgets(context)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        @JavascriptInterface
        fun updateWidgetData(streak: Int, tasksSummary: String) {
            try {
                val prefs = context.getSharedPreferences(StudyPlannerWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE)
                prefs.edit()
                    .putInt(StudyPlannerWidgetProvider.KEY_STREAK, streak)
                    .putString("tasks_summary", tasksSummary)
                    .apply()
                StudyPlannerWidgetProvider.updateAllWidgets(context)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        @JavascriptInterface
        fun vibrate(durationMs: Long) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                    vibratorManager?.defaultVibrator?.vibrate(
                        VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE)
                    )
                } else {
                    @Suppress("DEPRECATION")
                    val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                    @Suppress("DEPRECATION")
                    vibrator?.vibrate(durationMs)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleTargetView(intent)
        syncWidgetCompletionToJs()
    }

    fun updateWidgetSettingsInJs(theme: String, transparency: Int) {
        webView.post {
            webView.evaluateJavascript("window.setWidgetSettingsFromNative ? window.setWidgetSettingsFromNative('$theme', $transparency) : null", null)
        }
    }

    private fun handleTargetView(intent: Intent?) {
        val action = intent?.getStringExtra(StudyPlannerWidgetProvider.EXTRA_ACTION)
        if (action == StudyPlannerWidgetProvider.ACTION_OPEN_ADD) {
            webView.postDelayed({
                webView.evaluateJavascript("window.openChoiceModal ? window.openChoiceModal() : (window.openTodoModal ? window.openTodoModal() : null)", null)
            }, 300)
            return
        }

        val targetView = intent?.getStringExtra(StudyPlannerWidgetProvider.EXTRA_VIEW)
        if (!targetView.isNullOrEmpty()) {
            webView.post {
                webView.evaluateJavascript("window.switchView ? window.switchView('$targetView', document.getElementById('nav-$targetView')) : null", null)
            }
        }
    }
}
