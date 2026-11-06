    // ==========================================================================
    // REGISTRO VOTI (VALUTAZIONI) - CLASSEVIVA STYLE ENGINE (Screenshots 1, 3, 4, 5)
    // ==========================================================================
    let myGrades = JSON.parse(localStorage.getItem('studylog_grades') || '[]');
    let geminiApiKey = localStorage.getItem('studylog_gemini_key') || '';
    let selectedGradeType = 'Scritto';
    let selectedGradeQuadrimestre = '1° Quadrimestre';
    let currentGradesTab = 'materie'; // 'ultime', 'materie', 'q1', 'q2'
    let currentDetailSubject = null; // null = Panoramica, string = Materia specifica
    let currentSubjectTab = 'ultime'; // 'ultime', 'q1', 'q2'
    let isAiListening = false;
    let speechRecognitionInstance = null;

    function getQuadrimestreForDate(dateStr) {
        if (!dateStr) return '1° Quadrimestre';
        let parts = dateStr.split('-');
        let m = parseInt(parts[1], 10);
        if (m >= 9 || m === 1) return '1° Quadrimestre';
        return '2° Quadrimestre';
    }

    window.selectGradesTab = function(tab) {
        currentGradesTab = tab;
        renderGradesView();
    };

    window.selectSubjectTab = function(tab) {
        currentSubjectTab = tab;
        renderGradesView();
    };

    window.openSubjectDetail = function(subjectName) {
        currentDetailSubject = subjectName;
        currentSubjectTab = 'ultime';
        renderGradesView();
    };

    window.closeSubjectDetail = function() {
        currentDetailSubject = null;
        renderGradesView();
    };

    window.handleGradesBack = function() {
        if (currentDetailSubject) {
            closeSubjectDetail();
        } else {
            switchView('study', document.getElementById('nav-study'));
        }
    };

    window.refreshGradesUI = function() {
        showToast('Valutazioni aggiornate');
        renderGradesView();
    };

    window.selectGradeQuadrimestre = function(q, btnEl) {
        selectedGradeQuadrimestre = q;
        document.querySelectorAll('#grade-quadrimestre-segment .segment-btn').forEach(b => b.classList.remove('active'));
        if (btnEl) btnEl.classList.add('active');
    };

    function parseGradeNumeric(valStr) {
        if (!valStr) return null;
        valStr = String(valStr).trim().toLowerCase().replace(',', '.');
        if (valStr.includes('e mezzo')) {
            let base = parseFloat(valStr.split(' ')[0]);
            return isNaN(base) ? null : base + 0.5;
        }
        if (valStr.endsWith('+')) {
            let base = parseFloat(valStr.slice(0, -1));
            return isNaN(base) ? null : base + 0.25;
        }
        if (valStr.endsWith('-')) {
            let base = parseFloat(valStr.slice(0, -1));
            return isNaN(base) ? null : base - 0.25;
        }
        if (valStr.includes('/')) {
            let parts = valStr.split('/');
            let n1 = parseFloat(parts[0]);
            let n2 = parseFloat(parts[1]);
            if (!isNaN(n1) && !isNaN(n2)) return (n1 + n2) / 2;
        }
        let num = parseFloat(valStr);
        return isNaN(num) ? null : num;
    }

    window.getSubjectGradeAverage = function(subject, period = null) {
        if (!subject) return null;
        let subGrades = myGrades.filter(g => g.subject.toLowerCase() === subject.toLowerCase());
        if (period) {
            subGrades = subGrades.filter(g => (g.quadrimestre || getQuadrimestreForDate(g.date)) === period);
        }
        if (subGrades.length === 0) return null;
        let sum = subGrades.reduce((acc, g) => acc + (parseFloat(g.numericValue) || 0), 0);
        return Math.round((sum / subGrades.length) * 100) / 100;
    };

    window.getAllGradesAverage = function(period = null) {
        let grades = myGrades;
        if (period) {
            grades = grades.filter(g => (g.quadrimestre || getQuadrimestreForDate(g.date)) === period);
        }
        if (grades.length === 0) return null;
        let sum = grades.reduce((acc, g) => acc + (parseFloat(g.numericValue) || 0), 0);
        return Math.round((sum / grades.length) * 100) / 100;
    };

    window.renderGradesView = function() {
        const headerTitleEl = document.getElementById('grades-header-title');
        const pillsBarEl = document.getElementById('grades-pills-bar');
        const summaryCardEl = document.getElementById('grades-summary-card');
        const tabContentEl = document.getElementById('grades-tab-content');
        if (!summaryCardEl || !tabContentEl) return;

        // 1. HEADER & PILLS (Screenshot 1, 3, 4, 5)
        if (currentDetailSubject) {
            if (headerTitleEl) headerTitleEl.innerText = currentDetailSubject;
            if (pillsBarEl) {
                pillsBarEl.innerHTML = `
                    <button type="button" class="grades-pill-btn ${currentSubjectTab === 'ultime' ? 'active' : ''}" onclick="selectSubjectTab('ultime')">Ultime valutazioni</button>
                    <button type="button" class="grades-pill-btn ${currentSubjectTab === 'q1' ? 'active' : ''}" onclick="selectSubjectTab('q1')">1° Quadrimestre</button>
                    <button type="button" class="grades-pill-btn ${currentSubjectTab === 'q2' ? 'active' : ''}" onclick="selectSubjectTab('q2')">2° Quadrimestre</button>
                `;
            }
        } else {
            if (headerTitleEl) headerTitleEl.innerText = 'Valutazioni';
            if (pillsBarEl) {
                pillsBarEl.innerHTML = `
                    <button type="button" class="grades-pill-btn ${currentGradesTab === 'ultime' ? 'active' : ''}" onclick="selectGradesTab('ultime')">Ultime valutazioni</button>
                    <button type="button" class="grades-pill-btn ${currentGradesTab === 'materie' ? 'active' : ''}" onclick="selectGradesTab('materie')">Materie</button>
                    <button type="button" class="grades-pill-btn ${currentGradesTab === 'q1' ? 'active' : ''}" onclick="selectGradesTab('q1')">1° Quadrimestre</button>
                    <button type="button" class="grades-pill-btn ${currentGradesTab === 'q2' ? 'active' : ''}" onclick="selectGradesTab('q2')">2° Quadrimestre</button>
                `;
            }
        }

        // 2. CALCOLO MEDIE E CONTEGGI
        let gradesForSummary = currentDetailSubject 
            ? myGrades.filter(g => g.subject.toLowerCase() === currentDetailSubject.toLowerCase())
            : myGrades;

        let totalCount = gradesForSummary.length;
        let avgOverall = null;
        if (totalCount > 0) {
            let sum = gradesForSummary.reduce((acc, g) => acc + (parseFloat(g.numericValue) || 0), 0);
            avgOverall = Math.round((sum / totalCount) * 100) / 100;
        }

        let q1Grades = gradesForSummary.filter(g => (g.quadrimestre || getQuadrimestreForDate(g.date)) === '1° Quadrimestre');
        let q2Grades = gradesForSummary.filter(g => (g.quadrimestre || getQuadrimestreForDate(g.date)) === '2° Quadrimestre');

        let q1Avg = q1Grades.length > 0 ? (q1Grades.reduce((acc, g) => acc + (parseFloat(g.numericValue) || 0), 0) / q1Grades.length) : null;
        let q2Avg = q2Grades.length > 0 ? (q2Grades.reduce((acc, g) => acc + (parseFloat(g.numericValue) || 0), 0) / q2Grades.length) : null;

        // Card color style: good (>=6, verde da screenshot 4), warning (<6, arancione caldo da screenshot 3), neutral
        let cardColorClass = 'neutral';
        let ringValText = '-';
        if (avgOverall !== null) {
            ringValText = avgOverall % 1 === 0 ? avgOverall.toFixed(0) : avgOverall.toFixed(2);
            if (avgOverall >= 6.0) cardColorClass = 'good';
            else if (avgOverall >= 5.0) cardColorClass = 'warning';
            else cardColorClass = 'danger';
        }

        let quadrimestriHtml = '';
        if (!currentDetailSubject) {
            quadrimestriHtml = `
                <div class="grades-quadrimestri-row">
                    <div class="grades-q-pill" onclick="selectGradesTab('q1')">
                        <span class="grades-q-pill-label">1° Quadrimestre</span>
                        <span class="grades-q-pill-count">${q1Grades.length} valutazioni</span>
                        <span class="grades-q-pill-val">${q1Avg !== null ? (q1Avg % 1 === 0 ? q1Avg.toFixed(0) : q1Avg.toFixed(2)) : '0'}</span>
                    </div>
                    <div class="grades-q-pill" onclick="selectGradesTab('q2')">
                        <span class="grades-q-pill-label">2° Quadrimestre</span>
                        <span class="grades-q-pill-count">${q2Grades.length} valutazioni</span>
                        <span class="grades-q-pill-val">${q2Avg !== null ? (q2Avg % 1 === 0 ? q2Avg.toFixed(0) : q2Avg.toFixed(2)) : '0'}</span>
                    </div>
                </div>
            `;
        }

        summaryCardEl.innerHTML = `
            <div class="grades-media-card ${cardColorClass}">
                <div class="grades-media-card-top">
                    <div class="grades-media-title-area">
                        <div class="grades-media-title">
                            Media voti generale <i class="fa-regular fa-eye"></i>
                        </div>
                        <div class="grades-media-count">${totalCount} valutazioni</div>
                    </div>
                    <div class="grades-media-ring">${ringValText}</div>
                </div>
                ${quadrimestriHtml}
            </div>
        `;

        // 3. CONTENUTO TAB
        if (currentDetailSubject) {
            // DETTAGLIO MATERIA (Screenshots 1, 4, 5)
            let subGrades = myGrades.filter(g => g.subject.toLowerCase() === currentDetailSubject.toLowerCase());
            if (currentSubjectTab === 'q1') {
                subGrades = subGrades.filter(g => (g.quadrimestre || getQuadrimestreForDate(g.date)) === '1° Quadrimestre');
            } else if (currentSubjectTab === 'q2') {
                subGrades = subGrades.filter(g => (g.quadrimestre || getQuadrimestreForDate(g.date)) === '2° Quadrimestre');
            }

            if (subGrades.length === 0) {
                // Empty state con icona identica allo Screenshot 1!
                tabContentEl.innerHTML = `
                    <div class="grades-empty-state">
                        <svg class="grades-empty-icon" width="80" height="80" viewBox="0 0 80 80" fill="none">
                            <path d="M18 16 V62 H64" stroke="#8E8E93" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="32" y1="28" x2="56" y2="28" stroke="#8E8E93" stroke-width="7" stroke-linecap="round"/>
                            <line x1="32" y1="40" x2="50" y2="40" stroke="#8E8E93" stroke-width="7" stroke-linecap="round"/>
                            <line x1="32" y1="52" x2="60" y2="52" stroke="#8E8E93" stroke-width="7" stroke-linecap="round"/>
                        </svg>
                        <div class="grades-empty-text">Voti non trovati per questo periodo</div>
                    </div>
                `;
            } else {
                let rowsHtml = '';
                subGrades.slice().reverse().forEach(g => {
                    let num = parseFloat(g.numericValue) || 0;
                    let badgeClass = num >= 6.0 ? 'good' : (num >= 5.0 ? 'warning' : 'danger');
                    rowsHtml += `
                        <div class="grade-item-row" onclick="promptEditOrDeleteGrade('${g.id}')">
                            <div class="grade-item-left">
                                <div class="grade-val-badge ${badgeClass}">${g.displayValue}</div>
                                <div class="grade-item-info">
                                    <div class="grade-item-subject">${g.subject}</div>
                                    <div class="grade-item-meta">
                                        <span><i class="fa-regular fa-calendar"></i> ${formatDateShort(g.date)}</span>
                                        <span><i class="fa-solid fa-pen-nib"></i> ${g.type || 'Unico'}</span>
                                        ${g.notes ? `<span>• ${g.notes}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                            <div class="grade-item-chevron"><i class="fa-solid fa-chevron-right"></i></div>
                        </div>
                    `;
                });
                tabContentEl.innerHTML = `<div class="grades-list-container">${rowsHtml}</div>`;
            }
        } else {
            // PANORAMICA (Screenshot 3 o Ultime Valutazioni)
            if (currentGradesTab === 'materie' || currentGradesTab === 'q1' || currentGradesTab === 'q2') {
                let filterQ = currentGradesTab === 'q1' ? '1° Quadrimestre' : (currentGradesTab === 'q2' ? '2° Quadrimestre' : null);
                let allUniqueSubjects = Array.from(new Set([...userSubjects, ...myGrades.map(g => g.subject)])).sort();

                let gridCardsHtml = '';
                allUniqueSubjects.forEach(sub => {
                    let subGrades = myGrades.filter(g => g.subject.toLowerCase() === sub.toLowerCase());
                    if (filterQ) {
                        subGrades = subGrades.filter(g => (g.quadrimestre || getQuadrimestreForDate(g.date)) === filterQ);
                    }
                    let count = subGrades.length;
                    let avg = null;
                    if (count > 0) {
                        let sum = subGrades.reduce((acc, g) => acc + (parseFloat(g.numericValue) || 0), 0);
                        avg = Math.round((sum / count) * 100) / 100;
                    }

                    let ringClass = 'none';
                    let ringText = '-';
                    if (avg !== null) {
                        ringText = avg % 1 === 0 ? avg.toFixed(0) : avg.toFixed(2);
                        if (avg >= 6.0) ringClass = 'good';
                        else if (avg >= 5.5) ringClass = 'warning';
                        else ringClass = 'danger';
                    }

                    gridCardsHtml += `
                        <div class="materia-card" onclick="openSubjectDetail('${sub.replace(/'/g, "\\'")}')">
                            <div class="materia-card-header">
                                <div>
                                    <div class="materia-card-name">${sub}</div>
                                    <div class="materia-card-count">${count} valutazioni</div>
                                </div>
                                <div class="materia-card-chevron"><i class="fa-solid fa-chevron-right"></i></div>
                            </div>
                            <div class="materia-avg-ring ${ringClass}">${ringText}</div>
                        </div>
                    `;
                });

                tabContentEl.innerHTML = `<div class="grades-materie-grid">${gridCardsHtml}</div>`;
            } else {
                // Ultime Valutazioni generali
                if (myGrades.length === 0) {
                    tabContentEl.innerHTML = `
                        <div class="grades-empty-state">
                            <svg class="grades-empty-icon" width="80" height="80" viewBox="0 0 80 80" fill="none">
                                <path d="M18 16 V62 H64" stroke="#8E8E93" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
                                <line x1="32" y1="28" x2="56" y2="28" stroke="#8E8E93" stroke-width="7" stroke-linecap="round"/>
                                <line x1="32" y1="40" x2="50" y2="40" stroke="#8E8E93" stroke-width="7" stroke-linecap="round"/>
                                <line x1="32" y1="52" x2="60" y2="52" stroke="#8E8E93" stroke-width="7" stroke-linecap="round"/>
                            </svg>
                            <div class="grades-empty-text">Nessun voto registrato. Tocca <b>+ Nuovo Voto</b> per iniziare!</div>
                        </div>
                    `;
                } else {
                    let rowsHtml = '';
                    myGrades.slice().reverse().forEach(g => {
                        let num = parseFloat(g.numericValue) || 0;
                        let badgeClass = num >= 6.0 ? 'good' : (num >= 5.0 ? 'warning' : 'danger');
                        rowsHtml += `
                            <div class="grade-item-row" onclick="promptEditOrDeleteGrade('${g.id}')">
                                <div class="grade-item-left">
                                    <div class="grade-val-badge ${badgeClass}">${g.displayValue}</div>
                                    <div class="grade-item-info">
                                        <div class="grade-item-subject">${g.subject}</div>
                                        <div class="grade-item-meta">
                                            <span><i class="fa-regular fa-calendar"></i> ${formatDateShort(g.date)}</span>
                                            <span><i class="fa-solid fa-pen-nib"></i> ${g.type || 'Unico'}</span>
                                            <span>(${g.quadrimestre || getQuadrimestreForDate(g.date)})</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="grade-item-chevron"><i class="fa-solid fa-chevron-right"></i></div>
                            </div>
                        `;
                    });
                    tabContentEl.innerHTML = `<div class="grades-list-container">${rowsHtml}</div>`;
                }
            }
        }
    };

    window.openAddGradeModal = function(preselectedSubject = null, examId = null) {
        const subSelect = document.getElementById('grade-subject-select');
        const examSelect = document.getElementById('grade-exam-select');
        const dateInput = document.getElementById('grade-date-input');
        const valInput = document.getElementById('grade-val-input');
        const notesInput = document.getElementById('grade-notes-input');

        let targetSub = preselectedSubject || currentDetailSubject;

        if (subSelect) {
            subSelect.innerHTML = '';
            userSubjects.forEach(s => {
                let opt = document.createElement('option');
                opt.value = s;
                opt.innerText = s;
                if (targetSub && s.toLowerCase() === targetSub.toLowerCase()) opt.selected = true;
                subSelect.appendChild(opt);
            });
        }

        if (examSelect) {
            examSelect.innerHTML = '<option value="">Nessuna verifica collegata</option>';
            myExams.forEach(e => {
                let opt = document.createElement('option');
                opt.value = e.id;
                opt.innerText = `${e.subject} (${e.type || 'Verifica'}) - ${formatDateShort(e.date)}`;
                if (examId && e.id === examId) opt.selected = true;
                examSelect.appendChild(opt);
            });
        }

        if (dateInput) dateInput.value = todayDateStr;
        if (valInput) valInput.value = '';
        if (notesInput) notesInput.value = '';
        selectedGradeType = 'Scritto';
        selectedGradeQuadrimestre = getQuadrimestreForDate(todayDateStr);

        document.querySelectorAll('#grade-type-segment .segment-btn').forEach((b, idx) => {
            b.classList.toggle('active', idx === 0);
        });
        document.querySelectorAll('#grade-quadrimestre-segment .segment-btn').forEach((b) => {
            b.classList.toggle('active', b.innerText === selectedGradeQuadrimestre);
        });

        openModal('add-grade-modal');
    };

    window.selectGradeType = function(type, btnEl) {
        selectedGradeType = type;
        document.querySelectorAll('#grade-type-segment .segment-btn').forEach(b => b.classList.remove('active'));
        if (btnEl) btnEl.classList.add('active');
    };

    window.saveGradeFromModal = function() {
        const subSelect = document.getElementById('grade-subject-select');
        const valInput = document.getElementById('grade-val-input');
        const dateInput = document.getElementById('grade-date-input');
        const examSelect = document.getElementById('grade-exam-select');
        const notesInput = document.getElementById('grade-notes-input');

        let rawVal = valInput.value.trim();
        let numVal = parseGradeNumeric(rawVal);
        if (numVal === null || numVal < 1 || numVal > 10) {
            showCustomAlert('Inserisci un voto valido compreso tra 1 e 10 (es. 8, 7.5, 6+).');
            return;
        }

        let dateVal = dateInput.value || todayDateStr;
        let newGrade = {
            id: 'gr_' + generateId(),
            subject: subSelect.value || 'Generale',
            displayValue: rawVal,
            numericValue: numVal,
            type: selectedGradeType || 'Scritto',
            quadrimestre: selectedGradeQuadrimestre || getQuadrimestreForDate(dateVal),
            date: dateVal,
            examId: examSelect.value || null,
            notes: notesInput.value.trim()
        };

        myGrades.push(newGrade);
        localStorage.setItem('studylog_grades', JSON.stringify(myGrades));
        closeModal('add-grade-modal');
        renderGradesView();
        addXP(20);
        showToast(`Voto registrato: ${rawVal} in ${newGrade.subject}! +20 XP`);

        triggerMallowGradeFeedback(newGrade);
    };

    window.promptEditOrDeleteGrade = function(gradeId) {
        let g = myGrades.find(x => x.id === gradeId);
        if (!g) return;
        showCustomConfirm(`Voto: ${g.displayValue} in ${g.subject} (${g.type || 'Unico'}) del ${formatDateShort(g.date)}.\n\nVuoi eliminare questo voto dal registro?`, () => {
            myGrades = myGrades.filter(x => x.id !== gradeId);
            localStorage.setItem('studylog_grades', JSON.stringify(myGrades));
            renderGradesView();
            showToast('Voto rimosso dal registro');
        });
    };

    window.promptDeleteGrade = function(gradeId) {
        window.promptEditOrDeleteGrade(gradeId);
    };
    function triggerMallowGradeFeedback(gradeObj) {
        let num = gradeObj.numericValue;
        let sub = gradeObj.subject;
        let advice = '';

        if (num >= 8.0) {
            advice = `Ottimo risultato! Hai preso ${gradeObj.displayValue} in ${sub}. Il tuo metodo di studio per questa materia è efficace. Continua ad applicare il richiamo attivo e la sintesi concettuale!`;
        } else if (num >= 6.0) {
            advice = `Hai preso ${gradeObj.displayValue} in ${sub}, una buona sufficienza. Per salire verso l'8, aumenta i quiz di autoverifica prima della prova.`;
        } else {
            advice = `Ho registrato ${gradeObj.displayValue} in ${sub}. Ho già adattato il tuo piano di studio per questa materia: per le prossime verifiche riserveremo più giorni di ripasso spaziato (35%) e blocchi giornalieri ridotti del 25% per evitare il sovraccarico cognitivo. Non mollare!`;
        }

        const bubble = document.getElementById('ai-speech-bubble');
        if (bubble) bubble.innerHTML = `🎓 <b>Nuovo Voto Registrato:</b><br>${advice}`;
    }

    // ==========================================================================
        // ==========================================================================
    // MALLOW VOICE AI ASSISTANT & AUDIO-REACTIVE ENGINE (Paper Sketch Spec)
    // ==========================================================================
    let micAudioCtx = null;
    let analyser = null;
    let micStream = null;
    let audioAnimFrameId = null;
    let pendingAiAction = null; // Memorizza l'azione da confermare

    window.openMallowVoiceOverlay = function() {
        const overlay = document.getElementById('mallow-voice-overlay');
        const hotbar = document.getElementById('split-hotbar');
        const speechText = document.getElementById('mallow-speech-text');
        const transcriptLabel = document.getElementById('mallow-transcript-label');
        const pendingCard = document.getElementById('pending-action-card');
        const mascotBox = document.getElementById('mallow-mascot-box');

        // 1. Unisci la hotbar: il bot scivola in alto e le due ali si uniscono
        if (hotbar) hotbar.classList.add('is-merged');

        // 2. Apri la schermata vocale
        if (overlay) overlay.classList.add('open');
        if (pendingCard) pendingCard.style.display = 'none';
        pendingAiAction = null;

        let name = localStorage.getItem('studylog_user_name') || 'Studente';
        if (speechText) {
            speechText.innerHTML = `Ciao <b>${name}</b>! Sono <b>Mallow</b>. Dimmi pure cosa vuoi <b>aggiungere</b>, <b>togliere</b> o <b>modificare</b> nei tuoi compiti, verifiche e voti!`;
        }
        if (transcriptLabel) transcriptLabel.innerText = 'Ascolto avviato... parla pure!';

        // 3. Avvia audio reattività e riconoscimento vocale
        startVoiceListening();
    };

    window.closeMallowVoiceOverlay = function() {
        const overlay = document.getElementById('mallow-voice-overlay');
        const hotbar = document.getElementById('split-hotbar');
        const pendingCard = document.getElementById('pending-action-card');

        stopVoiceListening();
        if (pendingCard) pendingCard.style.display = 'none';
        pendingAiAction = null;

        // Chiudi l'overlay
        if (overlay) overlay.classList.remove('open');

        // Ri-separa la hotbar facendo tornare il bot al centro
        if (hotbar) hotbar.classList.remove('is-merged');
    };

    window.toggleVoiceListening = function() {
        if (isAiListening) {
            stopVoiceListening();
        } else {
            startVoiceListening();
        }
    };

    function startVoiceListening() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const mascotBox = document.getElementById('mallow-mascot-box');
        const statusDot = document.getElementById('voice-status-dot');
        const stateSubtitle = document.getElementById('mallow-state-subtitle');
        const transcriptLabel = document.getElementById('mallow-transcript-label');

        if (mascotBox) mascotBox.classList.add('is-listening');
        if (statusDot) statusDot.classList.add('listening');
        if (stateSubtitle) stateSubtitle.innerText = 'In ascolto... parla ora';
        if (transcriptLabel) transcriptLabel.innerText = 'Ti sto ascoltando...';

        // Avvia analisi frequenza audio del microfono per reattività visiva
        startAudioReactivity();

        if (!SpeechRecognition) {
            if (transcriptLabel) transcriptLabel.innerText = 'Riconoscimento vocale non supportato nel browser. Usa la tastiera sotto.';
            return;
        }

        try {
            if (speechRecognitionInstance) {
                try { speechRecognitionInstance.stop(); } catch(e){}
            }
            speechRecognitionInstance = new SpeechRecognition();
            speechRecognitionInstance.lang = 'it-IT';
            speechRecognitionInstance.continuous = false;
            speechRecognitionInstance.interimResults = true;

            speechRecognitionInstance.onstart = function() {
                isAiListening = true;
            };

            speechRecognitionInstance.onresult = function(event) {
                let current = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    current += event.results[i][0].transcript;
                }
                if (transcriptLabel) transcriptLabel.innerText = `"${current}"`;
                if (event.results[0].isFinal) {
                    stopVoiceListening();
                    processMallowAiCommand(current);
                }
            };

            speechRecognitionInstance.onerror = function(event) {
                stopVoiceListening();
                if (transcriptLabel) transcriptLabel.innerText = 'Non ho sentito bene, tocca Mallow per riprovare.';
            };

            speechRecognitionInstance.onend = function() {
                stopVoiceListening();
            };

            speechRecognitionInstance.start();
        } catch(e) {
            console.error('Speech recognition error:', e);
            stopVoiceListening();
        }
    }

    function stopVoiceListening() {
        isAiListening = false;
        if (speechRecognitionInstance) {
            try { speechRecognitionInstance.stop(); } catch(e){}
            speechRecognitionInstance = null;
        }
        stopAudioReactivity();

        const mascotBox = document.getElementById('mallow-mascot-box');
        const statusDot = document.getElementById('voice-status-dot');
        const stateSubtitle = document.getElementById('mallow-state-subtitle');

        if (mascotBox) mascotBox.classList.remove('is-listening');
        if (statusDot) statusDot.classList.remove('listening');
        if (stateSubtitle) stateSubtitle.innerText = 'Tocca Mallow o parla per iniziare';
    }

    // Audio-Reattività in Tempo Reale: Mallow si ingrandisce e rimpicciolisce con la voce
    async function startAudioReactivity() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
            if (micStream) return;

            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = micAudioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.45;
            const source = micAudioCtx.createMediaStreamSource(micStream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const mascotSvg = document.getElementById('mallow-screen-mascot');
            let currentScale = 1.0;

            function renderAudioPulse() {
                if (!isAiListening) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                let avg = sum / dataArray.length;

                // Calcolo fattore di scala in base al volume/tono e alle pause ("spazi")
                let targetScale = 1.0;
                if (avg > 7) {
                    let norm = Math.min((avg - 7) / 30, 1.4);
                    targetScale = 1.0 + norm * 0.36; // Si allarga proporzionalmente alla voce
                } else {
                    targetScale = 1.0; // Torna a 1 nelle pause della voce
                }

                currentScale += (targetScale - currentScale) * 0.35;
                if (mascotSvg) {
                    mascotSvg.style.transform = `scale(${currentScale.toFixed(3)})`;
                }

                audioAnimFrameId = requestAnimationFrame(renderAudioPulse);
            }
            renderAudioPulse();
        } catch(err) {
            console.warn('Audio analyser non accessibile, fallback visivo:', err);
        }
    }

    function stopAudioReactivity() {
        if (audioAnimFrameId) cancelAnimationFrame(audioAnimFrameId);
        audioAnimFrameId = null;
        if (micStream) {
            micStream.getTracks().forEach(track => track.stop());
            micStream = null;
        }
        if (micAudioCtx) {
            try { micAudioCtx.close(); } catch(e){}
            micAudioCtx = null;
        }
        const mascotSvg = document.getElementById('mallow-screen-mascot');
        if (mascotSvg) mascotSvg.style.transform = 'scale(1)';
    }

    window.feedAiQuickCommand = function(text) {
        processMallowAiCommand(text);
    };

    window.submitVoiceManualInput = function() {
        const input = document.getElementById('voice-manual-input');
        if (!input) return;
        let val = input.value.trim();
        if (!val) return;
        input.value = '';
        processMallowAiCommand(val);
    };

    window.speakMallowVoice = function(text) {
        if (!('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            let clean = text.replace(/<[^>]*>/g, '').replace(/[★•📝📅🎯💡✏️🗑️]/g, '');
            let utterance = new SpeechSynthesisUtterance(clean);
            utterance.lang = 'it-IT';
            utterance.rate = 1.04;
            utterance.pitch = 1.05;
            window.speechSynthesis.speak(utterance);
        } catch(e) {
            console.warn('TTS error:', e);
        }
    };

    // Interprete di Mallow: Aggiunge, Toglie e Modifica Compiti, Verifiche e Voti
    window.processMallowAiCommand = async function(rawText) {
        const speechText = document.getElementById('mallow-speech-text');
        const transcriptLabel = document.getElementById('mallow-transcript-label');
        const pendingCard = document.getElementById('pending-action-card');
        const pendingBadge = document.getElementById('pending-action-badge');
        const pendingDesc = document.getElementById('pending-action-desc');

        if (transcriptLabel) transcriptLabel.innerText = `"${rawText}"`;
        if (speechText) speechText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mallow sta elaborando la richiesta...';
        if (pendingCard) pendingCard.style.display = 'none';
        pendingAiAction = null;

        let text = rawText.toLowerCase().trim();

        // -------------------------------------------------------------
        // 1. ELIMINAZIONE / TOGLIERE (Compito, Verifica o Voto)
        // -------------------------------------------------------------
        if (text.includes('togli') || text.includes('elimina') || text.includes('cancella') || text.includes('rimuovi')) {
            // A) Togli Voto
            if (text.includes('voto') || text.includes('voti')) {
                let sub = extractSubjectFromText(text);
                let targetGrade = null;
                for (let i = myGrades.length - 1; i >= 0; i--) {
                    if (myGrades[i].subject.toLowerCase() === sub.toLowerCase()) {
                        targetGrade = myGrades[i];
                        break;
                    }
                }
                if (!targetGrade && myGrades.length > 0) targetGrade = myGrades[myGrades.length - 1];

                if (targetGrade) {
                    let intro = 'Ricevuto! Ho individuato il voto da rimuovere:';
                    let desc = `Eliminerò il voto <b>${targetGrade.displayValue} in ${targetGrade.subject}</b> (${formatDateShort(targetGrade.date)}).`;
                    setupPendingAction('ELIMINA VOTO', 'delete_grade', targetGrade.id, null, intro, desc);
                    return;
                } else {
                    respondNoAction('Non ho trovato nessun voto registrato da eliminare.');
                    return;
                }
            }

            // B) Togli Verifica
            if (text.includes('verifica') || text.includes('interrogazione') || text.includes('esame') || text.includes('versione')) {
                let sub = extractSubjectFromText(text);
                let targetExam = myExams.find(e => e.subject.toLowerCase() === sub.toLowerCase());
                if (!targetExam && myExams.length > 0) targetExam = myExams[0];

                if (targetExam) {
                    let intro = 'Ricevuto! Rimuoverò questa verifica dal tuo piano:';
                    let desc = `Eliminerò la <b>${targetExam.type || 'Verifica'} di ${targetExam.subject}</b> del ${formatDateShort(targetExam.date)} (${targetExam.pages} pag.).`;
                    setupPendingAction('ELIMINA VERIFICA', 'delete_exam', targetExam.id, null, intro, desc);
                    return;
                } else {
                    respondNoAction(`Non ho trovato nessuna verifica di ${sub} da eliminare.`);
                    return;
                }
            }

            // C) Togli Compito
            if (text.includes('compito') || text.includes('compiti') || text.includes('esercizi') || text.includes('task')) {
                let sub = extractSubjectFromText(text);
                let targetTodo = myTodos.find(t => t.subject.toLowerCase() === sub.toLowerCase());
                if (!targetTodo && myTodos.length > 0) targetTodo = myTodos[0];

                if (targetTodo) {
                    let intro = 'Ricevuto! Ho trovato il compito da rimuovere:';
                    let desc = `Eliminerò il compito di <b>${targetTodo.subject}</b>: "${targetTodo.title}".`;
                    setupPendingAction('ELIMINA COMPITO', 'delete_todo', targetTodo.id, null, intro, desc);
                    return;
                } else {
                    respondNoAction(`Nessun compito di ${sub} trovato da rimuovere.`);
                    return;
                }
            }
        }

        // -------------------------------------------------------------
        // 2. MODIFICARE (Compito, Verifica o Voto)
        // -------------------------------------------------------------
        if (text.includes('modifica') || text.includes('cambia') || text.includes('sposta') || text.includes('aggiorna')) {
            // A) Modifica Voto
            if (text.includes('voto')) {
                let sub = extractSubjectFromText(text);
                let targetGrade = myGrades.find(g => g.subject.toLowerCase() === sub.toLowerCase()) || myGrades[myGrades.length - 1];
                let numMatch = text.match(/([0-9]+(?:[\.,][0-9]+)?|[0-9]+\+|[0-9]+\-|[0-9]+\s+e\s+mezzo)/);
                if (targetGrade && numMatch) {
                    let newVal = numMatch[1];
                    let newNumeric = parseGradeNumeric(newVal);
                    let intro = 'Ho preparato la correzione del voto:';
                    let desc = `Modificherò il voto di <b>${targetGrade.subject}</b> portandolo da ${targetGrade.displayValue} a <b>${newVal}</b>.`;
                    setupPendingAction('MODIFICA VOTO', 'edit_grade', targetGrade.id, { numericValue: newNumeric, displayValue: newVal }, intro, desc);
                    return;
                }
            }

            // B) Modifica Verifica (Pagine o Data)
            if (text.includes('verifica') || text.includes('interrogazione') || text.includes('esame')) {
                let sub = extractSubjectFromText(text);
                let targetExam = myExams.find(e => e.subject.toLowerCase() === sub.toLowerCase()) || myExams[0];
                if (targetExam) {
                    let pagesMatch = text.match(/([0-9]+)\s*(?:pagine|pag|pg)/);
                    let newPages = pagesMatch ? parseInt(pagesMatch[1]) : null;
                    let newDate = extractDateFromItalianText(text);

                    let changesDesc = [];
                    if (newPages) changesDesc.push(`pagine: <b>${newPages}</b> (erano ${targetExam.pages})`);
                    if (newDate && newDate !== targetExam.date) changesDesc.push(`data: <b>${formatDateShort(newDate)}</b>`);

                    if (changesDesc.length === 0 && newPages === null) {
                        changesDesc.push(`data: <b>${formatDateShort(newDate)}</b>`);
                    }

                    let intro = 'Ho ricalcolato il piano di studio per questa verifica:';
                    let desc = `Aggiornerò la <b>${targetExam.type || 'Verifica'} di ${targetExam.subject}</b>: ${changesDesc.join(', ')}.`;
                    setupPendingAction('MODIFICA VERIFICA', 'edit_exam', targetExam.id, { pages: newPages || targetExam.pages, date: newDate || targetExam.date }, intro, desc);
                    return;
                }
            }

            // C) Modifica Compito (Data o Descrizione)
            if (text.includes('compito') || text.includes('esercizi') || text.includes('task')) {
                let sub = extractSubjectFromText(text);
                let targetTodo = myTodos.find(t => t.subject.toLowerCase() === sub.toLowerCase()) || myTodos[0];
                if (targetTodo) {
                    let newDate = extractDateFromItalianText(text);
                    let intro = 'Ho preparato la modifica del compito:';
                    let desc = `Sposterò il compito di <b>${targetTodo.subject}</b> ("${targetTodo.title}") al <b>${formatDateShort(newDate)}</b>.`;
                    setupPendingAction('MODIFICA COMPITO', 'edit_todo', targetTodo.id, { deadline: newDate, assignedDate: newDate }, intro, desc);
                    return;
                }
            }
        }

        // -------------------------------------------------------------
        // 3. AGGIUNGERE (Voto, Verifica o Compito)
        // -------------------------------------------------------------
        // A) Voto (es. "ho preso 8 in storia", "voto 7.5 inglese")
        let gradeMatch = text.match(/(?:ho\s+preso|preso|voto)\s+([0-9]+(?:[\.,][0-9]+)?|[0-9]+\+|[0-9]+\-|[0-9]+\s+e\s+mezzo)(?:\s+(?:in|a|per|di))?\s+([a-zA-ZÀ-ſ\s]+)/i);
        if (gradeMatch) {
            let gradeVal = gradeMatch[1];
            let gradeSub = findBestSubjectMatch(gradeMatch[2].trim());
            let numVal = parseGradeNumeric(gradeVal);
            if (numVal !== null) {
                let intro = 'Congratulazioni per la prova!';
                let desc = `Registrerò il voto <b>${gradeVal} in ${gradeSub}</b> (Scritto) nel Registro Voti.`;
                let gradeData = {
                    id: 'gr_' + generateId(),
                    subject: gradeSub,
                    displayValue: gradeVal,
                    numericValue: numVal,
                    type: 'Scritto',
                    date: todayDateStr,
                    examId: null,
                    notes: 'Aggiunto con Mallow'
                };
                setupPendingAction('NUOVO VOTO', 'add_grade', null, gradeData, intro, desc);
                return;
            }
        }

        // B) Verifica / Interrogazione
        if (text.includes('verifica') || text.includes('interrogazione') || text.includes('esame') || text.includes('versione')) {
            let isInterrogazione = text.includes('interrogazione');
            let isVersione = text.includes('versione');
            let type = isInterrogazione ? 'Interrogazione' : (isVersione ? 'Versione' : 'Verifica');
            let pagesMatch = text.match(/([0-9]+)\s*(?:pagine|pag|pg)/);
            let pages = pagesMatch ? parseInt(pagesMatch[1]) : 25;
            let targetDate = extractDateFromItalianText(text);
            let sub = extractSubjectFromText(text);

            let intro = 'Ottimo, organizziamo lo studio con il metodo scientifico!';
            let desc = `Pianificherò la <b>${type} di ${sub}</b> per il <b>${formatDateShort(targetDate)}</b> (${pages} pagine) con studio spaziato Dunlosky.`;
            let examData = {
                id: 'ex_' + generateId(),
                type: type,
                subject: sub,
                date: targetDate,
                startDate: todayDateStr,
                pages: pages,
                specificInterrogazioneDates: [],
                progress: {},
                excludedDays: [],
                snoozedDays: []
            };
            setupPendingAction('NUOVA VERIFICA', 'add_exam', null, examData, intro, desc);
            return;
        }

        // C) Compito / Esercizi
        if (text.includes('compito') || text.includes('compiti') || text.includes('esercizi') || text.includes('studiare') || text.includes('da fare')) {
            let sub = extractSubjectFromText(text);
            let targetDate = extractDateFromItalianText(text);
            let title = rawText.replace(/(?:metti|aggiungi|ho|da fare|il|i|un|compito|compiti)\s+/gi, '').trim();
            if (!title || title.length < 3) title = `Compito di ${sub}`;
            if (title.length > 55) title = title.slice(0, 55) + '...';

            let intro = 'Perfetto, ho registrato il tuo compito!';
            let desc = `Aggiungerò il compito di <b>${sub}</b> per il <b>${formatDateShort(targetDate)}</b>: "${title}".`;
            let todoData = {
                id: 'td_' + generateId(),
                subject: sub,
                title: title,
                priority: 2,
                difficulty: 1,
                deadline: targetDate,
                assignedDate: targetDate,
                repeat: 'none',
                isAutoScheduled: false
            };
            setupPendingAction('NUOVO COMPITO', 'add_todo', null, todoData, intro, desc);
            return;
        }

        // 4. Se è configurata la chiave Gemini Flash -> Richiesta ad alta intelligenza
        if (geminiApiKey) {
            try {
                let geminiReply = await callGeminiFlashApi(rawText);
                if (geminiReply) {
                    if (speechText) speechText.innerHTML = `💡 ${geminiReply}`;
                    speakMallowVoice(geminiReply);
                    return;
                }
            } catch(e) {
                console.error('Gemini call error:', e);
            }
        }

        // Fallback
        respondNoAction(`Ho ascoltato: "${rawText}".<br>Puoi dirmi:<br>• <i>"Aggiungi compito di matematica per domani"</i><br>• <i>"Verifica di storia di 30 pagine venerdì"</i><br>• <i>"Modifica verifica di storia metti 40 pagine"</i><br>• <i>"Togli compito di matematica"</i><br>• <i>"Ho preso 8 in inglese"</i>`);
    };

    function setupPendingAction(badgeText, actionType, targetId, actionData, introText, descHtml) {
        const speechText = document.getElementById('mallow-speech-text');
        const pendingCard = document.getElementById('pending-action-card');
        const pendingBadge = document.getElementById('pending-action-badge');
        const pendingDesc = document.getElementById('pending-action-desc');

        pendingAiAction = {
            badge: badgeText,
            action: actionType,
            id: targetId,
            data: actionData,
            intro: introText,
            desc: descHtml
        };

        if (speechText) {
            speechText.innerHTML = `${introText}<br><span style="color:var(--text-muted); font-size:0.86rem;">Premi <b>Conferma ed Esegui</b> per applicare, oppure tocca Mallow per parlare di nuovo.</span>`;
        }
        if (pendingBadge) pendingBadge.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> ${badgeText}`;
        if (pendingDesc) pendingDesc.innerHTML = descHtml;
        if (pendingCard) pendingCard.style.display = 'block';

        // Voce TTS di introduzione ed esecuzione
        speakMallowVoice(`${introText} ${descHtml.replace(/<[^>]*>/g, '')}. Premi conferma per applicare.`);
    }

    function respondNoAction(messageHtml) {
        const speechText = document.getElementById('mallow-speech-text');
        const pendingCard = document.getElementById('pending-action-card');
        if (pendingCard) pendingCard.style.display = 'none';
        pendingAiAction = null;
        if (speechText) speechText.innerHTML = messageHtml;
        speakMallowVoice(messageHtml.replace(/<[^>]*>/g, ''));
    }

    // Esegue l'azione confermata dall'utente con il pulsante d'invio
    window.executePendingAiAction = function() {
        if (!pendingAiAction) return;

        const { action, id, data } = pendingAiAction;
        const speechText = document.getElementById('mallow-speech-text');
        const pendingCard = document.getElementById('pending-action-card');

        switch(action) {
            case 'add_todo':
                myTodos.push(data);
                localStorage.setItem('studylog_todos', JSON.stringify(myTodos));
                addXP(15);
                showToast(`Compito di ${data.subject} aggiunto! +15 XP`);
                break;

            case 'delete_todo':
                myTodos = myTodos.filter(t => t.id !== id);
                localStorage.setItem('studylog_todos', JSON.stringify(myTodos));
                showToast('Compito rimosso!');
                break;

            case 'edit_todo':
                let todo = myTodos.find(t => t.id === id);
                if (todo) {
                    Object.assign(todo, data);
                    localStorage.setItem('studylog_todos', JSON.stringify(myTodos));
                    showToast('Compito aggiornato!');
                }
                break;

            case 'add_exam':
                myExams.push(data);
                localStorage.setItem('studylog_exams', JSON.stringify(myExams));
                addXP(25);
                showToast(`Verifica di ${data.subject} pianificata! +25 XP`);
                break;

            case 'delete_exam':
                myExams = myExams.filter(e => e.id !== id);
                localStorage.setItem('studylog_exams', JSON.stringify(myExams));
                showToast('Verifica eliminata dal calendario!');
                break;

            case 'edit_exam':
                let exam = myExams.find(e => e.id === id);
                if (exam) {
                    Object.assign(exam, data);
                    localStorage.setItem('studylog_exams', JSON.stringify(myExams));
                    showToast('Verifica modificata!');
                }
                break;

            case 'add_grade':
                myGrades.push(data);
                localStorage.setItem('studylog_grades', JSON.stringify(myGrades));
                addXP(20);
                showToast(`Voto ${data.displayValue} in ${data.subject} registrato! +20 XP`);
                triggerMallowGradeFeedback(data);
                break;

            case 'delete_grade':
                myGrades = myGrades.filter(g => g.id !== id);
                localStorage.setItem('studylog_grades', JSON.stringify(myGrades));
                showToast('Voto rimosso dal registro!');
                break;

            case 'edit_grade':
                let gr = myGrades.find(g => g.id === id);
                if (gr) {
                    Object.assign(gr, data);
                    localStorage.setItem('studylog_grades', JSON.stringify(myGrades));
                    showToast('Voto aggiornato!');
                }
                break;
        }

        // Aggiorna tutte le viste e componenti dell'applicazione
        updateAllDots();
        generateTasksForDate(selectedDateStr);
        renderStreakCalendar();
        renderMonthCalendar();
        renderGradesView();

        if (speechText) {
            speechText.innerHTML = `✅ <b>Fatto!</b> Modifiche applicate con successo al tuo piano di studio.`;
        }
        if (pendingCard) pendingCard.style.display = 'none';
        speakMallowVoice('Fatto! Modifiche applicate con successo.');
        pendingAiAction = null;
    };

    window.cancelPendingAiAction = function() {
        const speechText = document.getElementById('mallow-speech-text');
        const pendingCard = document.getElementById('pending-action-card');
        pendingAiAction = null;
        if (pendingCard) pendingCard.style.display = 'none';
        if (speechText) speechText.innerHTML = 'Azione annullata. Dimmi pure un altro comando o tocca Mallow per parlare!';
    };

    window.saveGeminiApiKeyFromSettings = function() {
        const input = document.getElementById('settings-gemini-key-input');
        if (!input) return;
        let val = input.value.trim();
        geminiApiKey = val;
        localStorage.setItem('studylog_gemini_key', val);
        updateGeminiKeyStatusUI();
        showToast(val ? 'Chiave Gemini salvata con successo!' : 'Chiave Gemini rimossa');
    };

    function updateGeminiKeyStatusUI() {
        const statusEl = document.getElementById('gemini-key-status');
        const input = document.getElementById('settings-gemini-key-input');
        if (input && geminiApiKey) input.value = geminiApiKey;
        if (statusEl) {
            if (geminiApiKey) {
                statusEl.innerHTML = '<span style="color:#10B981;"><i class="fa-solid fa-check"></i> Chiave Gemini attiva (Gemini Flash abilitato)</span>';
            } else {
                statusEl.innerHTML = '<span>Motore locale offline attivo (nessuna chiave necessaria)</span>';
            }
        }
    }

    window.executeHardReset = function() { localStorage.clear(); localStorage.setItem('studylog_record_streak', '0'); window.location.reload(true); }

    init();
