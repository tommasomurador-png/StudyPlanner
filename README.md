<div align="center">

<img src="1790418729575_cutout.png" width="130" alt="Study Planner Icon" />

# Study Planner

Il taccuino digitale per la gestione intelligente dello studio, delle verifiche, del focus profondo e della memorizzazione a lungo termine.

[![Status](https://img.shields.io/badge/Status-Online-success?style=for-the-badge&logo=github)](https://tommasomurador-png.github.io/StudyPlanner/)
[![Download APK](https://img.shields.io/badge/Download-APK-success?style=for-the-badge&logo=android)](https://github.com/tommasomurador-png/StudyPlanner/releases/latest)
[![Build Android APK](https://img.shields.io/github/actions/workflow/status/tommasomurador-png/StudyPlanner/build-apk.yml?branch=main&style=for-the-badge&logo=github-actions&label=BUILD)](https://github.com/tommasomurador-png/StudyPlanner/actions/workflows/build-apk.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <a href="https://tommasomurador-png.github.io/StudyPlanner/"><b>Apri la Web App Online</b></a>
</p>

</div>

---

## Screenshots

Fai clic su un'immagine per aprirla a piena risoluzione.

<p align="center">
  <img src="screenshots/dashboard_view.png" width="31%" alt="Dashboard di studio e Serie" />
  <img src="screenshots/calendar_view.jpg" width="31%" alt="Calendario planning e mappa di impegno" />
  <img src="screenshots/interface_view.jpg" width="31%" alt="Interfaccia dell'applicazione" />
</p>

---

## Perche Study Planner fa la differenza

A differenza delle tradizionali applicazioni per to-do list, Study Planner e' progettato appositamente per le reali necessita' di studenti e studentesse. Integra pianificazione automatica dei carichi, monitoraggio dell'impegno e statistiche avanzate all'interno di un'unica interfaccia pulita, priva di pubblicita' e orientata alla massima privacy locale.

- **Privacy totale e funzionamento offline:** Tutti i dati, i voti, le verifiche e le note rimangono memorizzati unicamente sul dispositivo dell'utente. Non richiede registrazione di account, login remoti ne' tracciamento pubblicitario.
- **Ripartizione dinamica del carico di lavoro:** Calcola il ritmo ottimale di pagine ed esercizi giorno per giorno fino alla data della prova. Se un giorno studi meno del previsto, l'algoritmo distribuisce automaticamente il carico residuo sulle giornate rimanenti.
- **Gamification e Gradi Accademici:** Punti Conoscenza (XP), Serie di Fuoco continuativa e avanzamento di livello da Matricola fino a Einstein per mantenere alta la motivazione giorno dopo giorno.
- **Statistiche e Analisi Visiva:** Calendario planning con indicatori mensili, grafico a torta Donut con distribuzione per materia e mappa di impegno storico a 90 giorni.
- **Widget nativo per Android:** Widget integrabile sulla schermata home dello smartphone per consultare lo stato della serie di giorni e le task odierne a colpo d'occhio.

### Piattaforme supportate

- **Android:** Applicazione nativa con Widget per la schermata Home, integrazione del tasto Indietro hardware, vibrazione aptica e canali di notifica locali.
- **Web e Progressive Web App (PWA):** Accessibile da qualsiasi browser moderno su computer, tablet e smartphone, installabile sulla schermata iniziale e fruibile senza connessione a Internet.

---

## Come installare

### 1. Applicazione Android nativa (APK)

1. Apri la sezione **[Releases](https://github.com/tommasomurador-png/StudyPlanner/releases/latest)** del repository GitHub.
2. Scarica il pacchetto `StudyPlanner.apk` compilato tramite il sistema di Continuous Integration.
3. Apri il file scaricato sul dispositivo Android e conferma l'installazione.
4. Tieni premuto uno spazio vuoto della schermata iniziale per aggiungere il widget Study Planner.

### 2. Installazione Web App (PWA)

1. Visita la pagina ufficiale: **[tommasomurador-png.github.io/StudyPlanner](https://tommasomurador-png.github.io/StudyPlanner/)**.
2. Apri il menu del browser (o il pulsante Condividi su iOS / Safari).
3. Seleziona **"Aggiungi a schermata Home"** o **"Installa applicazione"**.

---

## Funzionalita Principali nel Dettaglio

### 1. Pianificazione dello Studio e Gestione Verifiche
- Calcolo automatico della quantita' di studio giornaliera fino al giorno della verifica o dell'interrogazione.
- Riorganizzazione immediata del carico residuo in caso di compiti incompleti o imprevisti.
- Esclusione mirata di date di pausa per festivi, vacanze o impegni personali compresi tra oggi e la scadenza.
- Sistema Snooze con opzione di riprogrammazione manuale o automatica dei compiti.
- Gestione flessibile di compiti To-Do con priorita a stelle e difficolta stimata.

### 2. Gamification e Gradi Accademici
- Meccanismo motivazionale basato su punti Conoscenza (XP) maturati a ogni task completata.
- Serie di Fuoco con tracciamento dei giorni consecutivi di studio sul piano.
- Gradi accademici progressivi da Matricola fino a Einstein con indicatore di progresso live.
- Notifiche locali motivazionali intelligenti per non perdere la serie di studio.

### 3. Statistiche, Calendario e Grafico per Materia
- Calendario mensile con indicatori distinti per verifiche in programma e compiti da completare.
- Grafico Donut vettoriale per osservare la percentuale e il numero di task suddivisi per materia.
- Mappa di impegno continuativo a 90 giorni ispirata ai contributi di GitHub.
- Grafico a barre dell'andamento settimanale con conteggio complessivo degli XP maturati.

### 4. Widget Nativo per Schermata Home Android
- Componente AppWidget nativo sviluppato tramite AppWidgetProvider di Android.
- Monitoraggio in tempo reale del numero di giorni consecutivi di studio (Serie di Fuoco).
- Promemoria sintetico delle task ancora da svolgere nel corso della giornata.
- Accesso immediato con tocco per aprire direttamente la dashboard dell'applicazione.

---

## Architettura del Progetto

```text
StudyPlanner/
|-- .github/workflows/
|   `-- build-apk.yml               Compilazione automatica APK e pubblicazione release
|-- app/
|   |-- src/main/
|   |   |-- assets/                 File sorgente web inclusi nell'applicazione nativa
|   |   |-- java/.../
|   |   |   |-- MainActivity.kt     Gestione WebView, navigazione e interfaccia JavaScript
|   |   |   `-- StudyPlannerWidgetProvider.kt   Logica del Widget per la schermata home
|   |   |-- res/
|   |   |   |-- layout/             Layout XML del widget nativo Android
|   |   |   |-- xml/                Metadati di configurazione del widget
|   |   |   `-- values/             Definizione colori, stringhe e stili nativi
|   |   `-- AndroidManifest.xml     Permessi, configurazione receiver e activity
|   `-- build.gradle.kts            Configurazione di compilazione del modulo Android
|-- css/
|   `-- style.css                   Stili modulari, temi Chiaro/Scuro e fogli grafici
|-- js/
|   `-- app.js                      Algoritmo di carico, pianificazione, gamification e storage
|-- screenshots/
|   |-- dashboard_view.png          Cattura della schermata dashboard
|   |-- calendar_view.jpg           Cattura della schermata calendario e statistiche
|   `-- interface_view.jpg          Cattura dell'interfaccia principale
|-- gradle/wrapper/                 Gradle Wrapper v8.13 per compilazione uniforme
|-- build.gradle.kts                Configurazione root di Gradle
|-- settings.gradle.kts             Definizione moduli di progetto
|-- index.html                      Interfaccia grafica principale dell'applicazione
|-- manifest.json                   Manifest PWA con scorciatoie rapide
|-- sw.js                           Service Worker per la cache offline
|-- 1790418729575_cutout.png        Icona ufficiale dell'applicazione
`-- LICENSE                         Licenza open source MIT
```

---

## Come Contribuire

I contributi da parte della community sono benvenuti per migliorare Study Planner:

1. Esegui il Fork del repository.
2. Crea un branch dedicato alla tua funzionalita':
   `git checkout -b feature/nome-funzionalita`
3. Effettua il commit delle modifiche:
   `git commit -m "feat: descrizione delle modifiche apportate"`
4. Esegui il push del branch sul tuo fork:
   `git push origin feature/nome-funzionalita`
5. Apri una Pull Request descrivendo gli interventi effettuati.

---

## Licenza

Questo progetto e' rilasciato sotto i termini della Licenza **MIT**. Consulta il file [LICENSE](LICENSE) per tutti i dettagli legali.

---

## Contatti e Supporto

- Repository GitHub: [tommasomurador-png/StudyPlanner](https://github.com/tommasomurador-png/StudyPlanner)
- Segnalazione bug e suggerimenti: [GitHub Issues](https://github.com/tommasomurador-png/StudyPlanner/issues)
- Autore: [@tommasomurador-png](https://github.com/tommasomurador-png)
