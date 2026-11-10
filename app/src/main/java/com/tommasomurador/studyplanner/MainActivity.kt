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
import android.webkit.PermissionRequest
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.util.Base64
import java.io.ByteArrayOutputStream
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var speechRecognizer: SpeechRecognizer? = null

    companion object {
        const val CHANNEL_ID = "studyplanner_notifications"
        const val NOTIF_PERMISSION_CODE = 101
        const val AUDIO_PERMISSION_CODE = 102
        const val SPEECH_REQUEST_CODE = 103
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

        // Schedula gli allarmi giornalieri per le notifiche anche ad app chiusa
        StudyPlannerAlarmReceiver.scheduleDailyAlarms(this)

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
        val permissionsNeeded = mutableListOf<String>()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsNeeded.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            permissionsNeeded.add(Manifest.permission.RECORD_AUDIO)
        }
        if (permissionsNeeded.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, permissionsNeeded.toTypedArray(), NOTIF_PERMISSION_CODE)
        }
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
        val bridge = WebAppInterface(this)
        webView.addJavascriptInterface(bridge, "AndroidNative")
        webView.addJavascriptInterface(bridge, "Android")

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
            override fun onPermissionRequest(request: PermissionRequest?) {
                runOnUiThread {
                    request?.grant(request.resources)
                }
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

    
    private var isManualListeningActive = false
    private var isContinuousAudioRecording = false
    private var continuousAudioRecord: AudioRecord? = null
    private var continuousAudioThread: Thread? = null
    @Volatile
    private var lastRecordedAudioBase64: String = ""

    fun startContinuousAudioRecording() {
        runOnUiThread {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.RECORD_AUDIO), AUDIO_PERMISSION_CODE)
                webView.evaluateJavascript("window.onAndroidSpeechError ? window.onAndroidSpeechError('permission_denied') : null", null)
                return@runOnUiThread
            }
            if (isContinuousAudioRecording) return@runOnUiThread

            try {
                val sampleRate = 16000
                val channelConfig = AudioFormat.CHANNEL_IN_MONO
                val audioFormat = AudioFormat.ENCODING_PCM_16BIT
                val minBuf = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)
                val bufferSize = maxOf(minBuf * 2, 4096)

                val recorder = AudioRecord(
                    MediaRecorder.AudioSource.VOICE_RECOGNITION,
                    sampleRate,
                    channelConfig,
                    audioFormat,
                    bufferSize
                )
                if (recorder.state != AudioRecord.STATE_INITIALIZED) {
                    recorder.release()
                    startNativeListening()
                    return@runOnUiThread
                }

                continuousAudioRecord = recorder
                lastRecordedAudioBase64 = ""
                isContinuousAudioRecording = true
                recorder.startRecording()
                webView.evaluateJavascript("window.onAndroidSpeechStart ? window.onAndroidSpeechStart() : null", null)

                continuousAudioThread = Thread {
                    val pcmOut = ByteArrayOutputStream()
                    val buffer = ShortArray(bufferSize / 2)
                    val byteBuf = ByteArray(bufferSize)
                    var lastRmsPostMs = 0L

                    try {
                        while (isContinuousAudioRecording) {
                            val readShorts = recorder.read(buffer, 0, buffer.size)
                            if (readShorts > 0) {
                                var sumSq = 0.0
                                for (i in 0 until readShorts) {
                                    val s = buffer[i].toInt()
                                    sumSq += s.toDouble() * s.toDouble()
                                    byteBuf[i * 2] = (s and 0xFF).toByte()
                                    byteBuf[i * 2 + 1] = ((s shr 8) and 0xFF).toByte()
                                }
                                pcmOut.write(byteBuf, 0, readShorts * 2)

                                val nowMs = System.currentTimeMillis()
                                if (nowMs - lastRmsPostMs >= 55) {
                                    lastRmsPostMs = nowMs
                                    val rms = kotlin.math.sqrt(sumSq / readShorts)
                                    val db = if (rms > 1.0) (20.0 * kotlin.math.log10(rms / 32767.0) + 45.0) / 4.0 else -2.0
                                    webView.post {
                                        webView.evaluateJavascript("window.onAndroidSpeechRms ? window.onAndroidSpeechRms($db) : null", null)
                                    }
                                }
                            }
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    } finally {
                        try {
                            recorder.stop()
                        } catch (_: Exception) {}
                        try {
                            recorder.release()
                        } catch (_: Exception) {}
                        continuousAudioRecord = null

                        val pcmBytes = pcmOut.toByteArray()
                        if (pcmBytes.size > 1600) {
                            val wavBytes = buildWavBytes(pcmBytes, sampleRate, 1, 16)
                            lastRecordedAudioBase64 = Base64.encodeToString(wavBytes, Base64.NO_WRAP)
                            webView.post {
                                webView.evaluateJavascript("window.onAndroidAudioReady ? window.onAndroidAudioReady() : null", null)
                            }
                        } else {
                            webView.post {
                                webView.evaluateJavascript("window.onAndroidAudioReady ? window.onAndroidAudioReady() : null", null)
                            }
                        }
                    }
                }.apply { start() }
            } catch (e: Exception) {
                e.printStackTrace()
                isContinuousAudioRecording = false
                startNativeListening()
            }
        }
    }

    fun stopContinuousAudioRecording() {
        isContinuousAudioRecording = false
    }

    fun cancelContinuousAudioRecording() {
        isContinuousAudioRecording = false
        lastRecordedAudioBase64 = ""
    }

    private fun buildWavBytes(pcmData: ByteArray, sampleRate: Int, channels: Int, bitsPerSample: Int): ByteArray {
        val totalDataLen = pcmData.size + 36
        val byteRate = sampleRate * channels * bitsPerSample / 8
        val header = ByteArray(44)
        header[0] = 'R'.code.toByte(); header[1] = 'I'.code.toByte(); header[2] = 'F'.code.toByte(); header[3] = 'F'.code.toByte()
        header[4] = (totalDataLen and 0xff).toByte(); header[5] = ((totalDataLen shr 8) and 0xff).toByte()
        header[6] = ((totalDataLen shr 16) and 0xff).toByte(); header[7] = ((totalDataLen shr 24) and 0xff).toByte()
        header[8] = 'W'.code.toByte(); header[9] = 'A'.code.toByte(); header[10] = 'V'.code.toByte(); header[11] = 'E'.code.toByte()
        header[12] = 'f'.code.toByte(); header[13] = 'm'.code.toByte(); header[14] = 't'.code.toByte(); header[15] = ' '.code.toByte()
        header[16] = 16; header[17] = 0; header[18] = 0; header[19] = 0
        header[20] = 1; header[21] = 0
        header[22] = channels.toByte(); header[23] = 0
        header[24] = (sampleRate and 0xff).toByte(); header[25] = ((sampleRate shr 8) and 0xff).toByte()
        header[26] = ((sampleRate shr 16) and 0xff).toByte(); header[27] = ((sampleRate shr 24) and 0xff).toByte()
        header[28] = (byteRate and 0xff).toByte(); header[29] = ((byteRate shr 8) and 0xff).toByte()
        header[30] = ((byteRate shr 16) and 0xff).toByte(); header[31] = ((byteRate shr 24) and 0xff).toByte()
        header[32] = (channels * bitsPerSample / 8).toByte(); header[33] = 0
        header[34] = bitsPerSample.toByte(); header[35] = 0
        header[36] = 'd'.code.toByte(); header[37] = 'a'.code.toByte(); header[38] = 't'.code.toByte(); header[39] = 'a'.code.toByte()
        header[40] = (pcmData.size and 0xff).toByte(); header[41] = ((pcmData.size shr 8) and 0xff).toByte()
        header[42] = ((pcmData.size shr 16) and 0xff).toByte(); header[43] = ((pcmData.size shr 24) and 0xff).toByte()
        return header + pcmData
    }

    private fun buildSpeechIntent(): Intent {
        return Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "it-IT")
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "it-IT")
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 5000L)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 4000L)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 8000L)
        }
    }

    fun startNativeListening() {
        runOnUiThread {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.RECORD_AUDIO), AUDIO_PERMISSION_CODE)
                return@runOnUiThread
            }

            try {
                isManualListeningActive = true
                speechRecognizer?.destroy()
                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this).apply {
                    setRecognitionListener(object : RecognitionListener {
                        override fun onReadyForSpeech(params: Bundle?) {
                            webView.evaluateJavascript("window.onAndroidSpeechStart ? window.onAndroidSpeechStart() : null", null)
                        }

                        override fun onBeginningOfSpeech() {}

                        override fun onRmsChanged(rmsdB: Float) {
                            webView.evaluateJavascript("window.onAndroidSpeechRms ? window.onAndroidSpeechRms($rmsdB) : null", null)
                        }

                        override fun onBufferReceived(buffer: ByteArray?) {}

                        override fun onEndOfSpeech() {}

                        override fun onError(error: Int) {
                            if (isManualListeningActive && (error == SpeechRecognizer.ERROR_NO_MATCH || error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT || error == SpeechRecognizer.ERROR_CLIENT)) {
                                webView.postDelayed({
                                    if (isManualListeningActive) {
                                        try {
                                            speechRecognizer?.startListening(buildSpeechIntent())
                                        } catch (e: Exception) {}
                                    }
                                }, 80)
                            } else if (!isManualListeningActive) {
                                webView.evaluateJavascript("window.onAndroidSpeechStopped ? window.onAndroidSpeechStopped() : null", null)
                            } else {
                                webView.evaluateJavascript("window.onAndroidSpeechError ? window.onAndroidSpeechError('$error') : null", null)
                            }
                        }

                        override fun onResults(results: Bundle?) {
                            val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                            val text = matches?.firstOrNull() ?: ""
                            val escaped = text.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ").trim()
                            if (escaped.isNotEmpty()) {
                                webView.evaluateJavascript("window.onAndroidSpeechSegment ? window.onAndroidSpeechSegment('$escaped') : null", null)
                            }
                            if (isManualListeningActive) {
                                webView.postDelayed({
                                    if (isManualListeningActive) {
                                        try {
                                            speechRecognizer?.startListening(buildSpeechIntent())
                                        } catch (e: Exception) {}
                                    }
                                }, 60)
                            } else {
                                webView.evaluateJavascript("window.onAndroidSpeechStopped ? window.onAndroidSpeechStopped() : null", null)
                            }
                        }

                        override fun onPartialResults(partialResults: Bundle?) {
                            val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                            val text = matches?.firstOrNull() ?: ""
                            if (text.isNotEmpty()) {
                                val escaped = text.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ").trim()
                                webView.evaluateJavascript("window.onAndroidSpeechResult ? window.onAndroidSpeechResult('$escaped', false) : null", null)
                            }
                        }

                        override fun onEvent(eventType: Int, params: Bundle?) {}
                    })
                }

                speechRecognizer?.startListening(buildSpeechIntent())
                webView.evaluateJavascript("window.onAndroidSpeechStart ? window.onAndroidSpeechStart() : null", null)
            } catch (e: Exception) {
                e.printStackTrace()
                isManualListeningActive = false
                webView.evaluateJavascript("window.onAndroidSpeechError ? window.onAndroidSpeechError('${e.message}') : null", null)
            }
        }
    }

    fun stopNativeListening() {
        runOnUiThread {
            isManualListeningActive = false
            try {
                speechRecognizer?.stopListening()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun cancelNativeListening() {
        runOnUiThread {
            isManualListeningActive = false
            try {
                speechRecognizer?.cancel()
                speechRecognizer?.destroy()
                speechRecognizer = null
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == SPEECH_REQUEST_CODE) {
            if (resultCode == RESULT_OK && data != null) {
                val matches = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
                val text = matches?.firstOrNull() ?: ""
                val escaped = text.replace("'", "\\'").replace("\n", " ").trim()
                webView.evaluateJavascript("window.onAndroidSpeechResult ? window.onAndroidSpeechResult('$escaped', true) : null", null)
            } else {
                webView.evaluateJavascript("window.onAndroidSpeechCancel ? window.onAndroidSpeechCancel() : null", null)
            }
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        val audioIndex = permissions.indexOf(Manifest.permission.RECORD_AUDIO)
        if (audioIndex != -1 && grantResults.getOrNull(audioIndex) == PackageManager.PERMISSION_GRANTED) {
            webView.post {
                webView.evaluateJavascript("window.onMicrophonePermissionGranted ? window.onMicrophonePermissionGranted() : null", null)
            }
            if (requestCode == AUDIO_PERMISSION_CODE) {
                startNativeListening()
            }
        }
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
        isContinuousAudioRecording = false
        try {
            speechRecognizer?.destroy()
            speechRecognizer = null
        } catch (e: Exception) {}
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
        fun isNativeSpeechAvailable(): Boolean {
            return SpeechRecognizer.isRecognitionAvailable(context)
        }

        @JavascriptInterface
        fun startNativeSpeechRecognition() {
            (context as? MainActivity)?.startNativeListening()
        }

        @JavascriptInterface
        fun stopNativeSpeechRecognition() {
            (context as? MainActivity)?.stopNativeListening()
        }

        @JavascriptInterface
        fun cancelNativeSpeechRecognition() {
            (context as? MainActivity)?.cancelNativeListening()
        }

        @JavascriptInterface
        fun startContinuousAudioRecording() {
            (context as? MainActivity)?.startContinuousAudioRecording()
        }

        @JavascriptInterface
        fun stopContinuousAudioRecording() {
            (context as? MainActivity)?.stopContinuousAudioRecording()
        }

        @JavascriptInterface
        fun cancelContinuousAudioRecording() {
            (context as? MainActivity)?.cancelContinuousAudioRecording()
        }

        @JavascriptInterface
        fun getLastRecordedAudioBase64(): String {
            return (context as? MainActivity)?.lastRecordedAudioBase64 ?: ""
        }

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
        fun setUserProfile(name: String, age: Int, distraction: String) {
            try {
                val prefs = context.getSharedPreferences(StudyPlannerWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE)
                prefs.edit()
                    .putString("user_name", name)
                    .putInt("user_age", age)
                    .putString("user_distraction", distraction)
                    .apply()
                StudyPlannerAlarmReceiver.scheduleDailyAlarms(context)
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
