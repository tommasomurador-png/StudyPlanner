<div align="center">

# 📚 Study Planner
### *Il taccuino digitale intelligente per la gestione dello studio, delle verifiche e del focus*

[![GitHub Pages](https://img.shields.io/badge/Status-Online-success?style=for-the-badge&logo=github)](https://tommasomurador-png.github.io/StudyPlanner/)
[![Download APK](https://img.shields.io/badge/Download-APK-success?style=for-the-badge&logo=android)](https://github.com/tommasomurador-png/StudyPlanner/releases/latest)
[![Build Android APK](https://img.shields.io/github/actions/workflow/status/tommasomurador-png/StudyPlanner/build-apk.yml?branch=main&style=for-the-badge&logo=github-actions&label=BUILD)](https://github.com/tommasomurador-png/StudyPlanner/actions/workflows/build-apk.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <a href="https://tommasomurador-png.github.io/StudyPlanner/"><b>🌐 Apri la Web App Online</b></a>
</p>

</div>

---

## ✨ Caratteristiche Principali

- **🧠 Algoritmo di Studio Intelligente:** Divide le pagine e gli esercizi in modo bilanciato fino al giorno della verifica, calcolando automaticamente il ritmo giornaliero.
- **🔄 Gestione Dinamica del Carico:** Se un giorno studi meno del previsto, il sistema redistribuisce equamente le pagine rimanenti sui giorni successivi.
- **🎯 Focus Timer & Deep Work (Stile Curbox):** Timer Pomodoro integrato (15, 25, 45, 60 min) con indicatore circolare, frasi motivazionali, conteggio delle sessioni, vibrazione aptica e ricompense in XP per mantenere alta la concentrazione ed eliminare le distrazioni.
- **📅 Calendario Interattivo a Scorrimento:** Naviga tra le giornate passate e future con un fluido slider settimanale.
- **💤 Modalità Snooze (Rimanda Task):** Rimanda manualmente o lascia che l'intelligenza automatica riprogrammi i tuoi compiti in base a priorità e carichi di lavoro.
- **⛔ Giorni di Pausa Specifici:** Seleziona date precise e multiple in cui non vuoi ricevere compiti (con validità compresa tra oggi e la scadenza).
- **🎨 Temi & Sfondi Personalizzabili:** Scegli tra tema Chiaro e Scuro e imposta lo sfondo a pallini, righe, quadretti o pulito in stile Bullet Journal.
- **🔥 Serie di Fuoco & XP:** Tieni traccia della tua costanza giornaliera e sblocca gradi accademici (da Matricola a Einstein) completando i task e le sessioni di focus.

---

## 📲 Come Installarla

### 1. Download App Android (APK)
Puoi scaricare direttamente l'applicazione Android nativa (`StudyPlanner.apk`):
1. Vai nella sezione **[Releases](https://github.com/tommasomurador-png/StudyPlanner/releases/latest)** del repository.
2. Scarica il file `StudyPlanner.apk` generato in automatico tramite CI/CD (GitHub Actions).
3. Installalo sul tuo dispositivo Android.

### 2. Installazione Web App (PWA - Android / iOS)
In alternativa, puoi installare Study Planner direttamente dal browser:
1. Apri la Web App: **[tommasomurador-png.github.io/StudyPlanner](https://tommasomurador-png.github.io/StudyPlanner/)**
2. Tocca i tre puntini del browser su Android o il tasto *Condividi* su Safari (iOS).
3. Seleziona **"Aggiungi a schermata Home"** o **"Installa app"**.

---

## 🏗️ Architettura del Progetto

Il progetto è strutturato seguendo gli standard moderni delle applicazioni Android open-source (come [curbox-android](https://github.com/curbox-app/curbox-android)):

```text
StudyPlanner/
├── .github/workflows/       # CI/CD GitHub Actions (Compilazione automatica APK e Release)
│   └── build-apk.yml
├── app/                     # Modulo applicazione Android nativo
│   ├── src/main/
│   │   ├── assets/          # Bundle offline dell'app (HTML, CSS, JS, immagini)
│   │   ├── java/.../        # MainActivity.kt (gestione WebView, tasto indietro, vibrazione aptica)
│   │   ├── res/             # Icone mipmap, temi nativi Day/Night, colori, stringhe
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts     # Configurazione Gradle del modulo App
├── css/
│   └── style.css            # Fogli di stile modulari e temi Dotted Journal
├── js/
│   └── app.js               # Logica dell'app, algoritmo di carico, timer focus, XP
├── gradle/wrapper/          # Gradle Wrapper v8.13 per compilazione riproducibile
├── build.gradle.kts         # Configurazione root Gradle
├── settings.gradle.kts      # Definizione moduli e repository
├── index.html               # Entrypoint web pulito e accessibile
├── manifest.json            # Configurazione PWA
├── sw.js                    # Service Worker per funzionamento 100% offline
└── LICENSE                  # Licenza open-source MIT
```

---

## 🛠️ Tecnologie Utilizzate

- **Android & Kotlin:** Gradle 8.13, Android Gradle Plugin 8.5.2, AndroidX WebKit, Activity KTX, Edge-to-Edge display.
- **Frontend Web & PWA:** HTML5 semantico, CSS3 modulare (Light/Dark Dotted Journal), JavaScript Vanilla, Canvas Confetti.
- **Automazione & DevOps:** GitHub Actions CI/CD per la generazione automatica dei file APK ad ogni push.
- **Font & Icone:** Font Awesome 6, Google Fonts (Poppins).

---

## 📄 Licenza

Distribuito sotto licenza **MIT**. Consulta il file [LICENSE](LICENSE) per ulteriori dettagli.
