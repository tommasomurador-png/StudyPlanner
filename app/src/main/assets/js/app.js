    function generateId() { return Math.random().toString(36).substr(2, 9); }
    function formatDateStr(dateObj) { return `${dateObj.getFullYear()}-${(dateObj.getMonth()+1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`; }

    let globalNow = new Date();
    let globalTomorrow = new Date();
    globalTomorrow.setDate(globalNow.getDate() + 1);
    let todayDateStr = formatDateStr(globalNow);
    let tomorrowStr = formatDateStr(globalTomorrow);
    let selectedDateStr = todayDateStr;

    const motivationalPhrases = [
        "Inizia a studiare, dai che prima inizi prima finisci!",
        "Il successo è la somma di piccoli sforzi ripetuti giorno dopo giorno.",
        "Non rimandare a domani quello che puoi studiare oggi!",
        "Ogni pagina studiata è un passo in più verso i tuoi sogni.",
        "Mettiti comodo, apri il libro e fai il vuoto intorno a te: tu vali!",
        "La fatica di oggi è il successo di domani. Coraggio!",
        "Concentrazione al massimo: il tuo futuro ti sta aspettando.",
        "Anche un piccolo progresso quotidiano fa la differenza.",
        "Spegni le distrazioni e dai il massimo in questa sessione!",
        "Sei più vicino al tuo traguardo rispetto a ieri. Continua così!"
    ];

    const completedPhrases = [
        "Ottimo lavoro! Hai completato tutte le task di oggi. Ora puoi rilassarti!",
        "Spettacolare! Hai chiuso la giornata con zero debiti di studio.",
        "Missione compiuta! Goditi il tuo meritato riposo.",
        "Sei un mito! Hai completato tutto il programma di oggi.",
        "Giornata sbaragliata! Riposati, te lo sei proprio meritato.",
        "Tutto fatto! La tua costanza ti porterà lontano.",
        "Fantastico! Hai terminato ogni singola task odierna.",
        "Obiettivo raggiunto con successo! Rilassati e stacca la mente.",
        "Perfetto! Un'altra giornata di studio portata a termine alla grande.",
        "Campione! Hai completato tutto ciò che c'era da fare oggi."
    ];

    function customConfirm(options) {
        return new Promise((resolve) => {
            const modal = document.getElementById('custom-alert-modal');
            const titleEl = document.getElementById('custom-alert-title');
            const msgEl = document.getElementById('custom-alert-message');
            const iconEl = document.getElementById('custom-alert-icon');
            const cancelBtn = document.getElementById('custom-alert-cancel');
            const confirmBtn = document.getElementById('custom-alert-confirm');

            titleEl.innerText = options.title || 'Attenzione';
            msgEl.innerText = options.message || '';
            
            if (options.isDanger) {
                iconEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
                iconEl.style.background = 'rgba(217, 83, 79, 0.12)';
                iconEl.style.color = 'var(--danger-color)';
                confirmBtn.className = 'custom-alert-btn danger';
            } else {
                iconEl.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
                iconEl.style.background = 'rgba(44, 44, 44, 0.08)';
                iconEl.style.color = 'var(--theme-strong)';
                confirmBtn.className = 'custom-alert-btn primary';
            }

            confirmBtn.innerText = options.confirmText || 'Ok';
            cancelBtn.innerText = options.cancelText || 'Annulla';

            if (options.showCancel === false) {
                cancelBtn.style.display = 'none';
            } else {
                cancelBtn.style.display = 'block';
            }

            const cleanup = (result) => {
                modal.classList.remove('active');
                confirmBtn.onclick = null;
                cancelBtn.onclick = null;
                resolve(result);
            };

            confirmBtn.onclick = () => cleanup(true);
            cancelBtn.onclick = () => cleanup(false);

            modal.classList.add('active');
        });
    }

    function customAlert(message, title = 'Attenzione', isDanger = false) {
        return customConfirm({
            title: title,
            message: message,
            showCancel: false,
            confirmText: 'Capito',
            isDanger: isDanger
        });
    }

    function animateCount(id, target, suffix = '', formatter = (v) => v.toLocaleString()) {
        const el = document.getElementById(id);
        if (!el) return;
        let current = parseInt(el.getAttribute('data-current') || el.innerText.replace(/[^0-9]/g, '')) || 0;
        if (current === target) {
            el.innerHTML = formatter(target) + (suffix ? ` <span>${suffix}</span>` : '');
            return;
        }
        let startTime = null;
        const duration = 500;
        function update(currentTime) {
            if (!startTime) startTime = currentTime;
            let progress = Math.min((currentTime - startTime) / duration, 1);
            let ease = 1 - Math.pow(1 - progress, 3);
            let val = Math.round(current + (target - current) * ease);
            el.innerHTML = formatter(val) + (suffix ? ` <span>${suffix}</span>` : '');
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.setAttribute('data-current', target);
                el.innerHTML = formatter(target) + (suffix ? ` <span>${suffix}</span>` : '');
            }
        }
        requestAnimationFrame(update);
    }

    function initPopoverDatePicker(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        let minDate = options.min !== undefined ? options.min : tomorrowStr; 
        let currentDate = options.defaultDate || minDate;
        let maxDate = options.max || '';
        let onChange = options.onChange || function(){};

        let viewDate = new Date();
        if (currentDate) {
            const parts = currentDate.split('-');
            viewDate = new Date(parts[0], parts[1]-1, parts[2]);
        }

        container.innerHTML = `
            <div class="popover-container" id="pop_wrap_${containerId}">
                <button type="button" class="popover-trigger-btn" id="pop_trig_${containerId}">
                    <span id="pop_text_${containerId}">${formatDateItalian(currentDate)}</span>
                    <i class="fa-regular fa-calendar"></i>
                </button>
                <div class="popover-popup-content" id="pop_content_${containerId}">
                    <div class="popover-cal-header">
                        <button type="button" onclick="window.datePickers['${containerId}'].changeMonth(-1)"><i class="fa-solid fa-chevron-left"></i></button>
                        <span class="popover-cal-title" id="pop_title_${containerId}">Settembre 2026</span>
                        <button type="button" onclick="window.datePickers['${containerId}'].changeMonth(1)"><i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                    <div class="popover-cal-grid" id="pop_grid_${containerId}"></div>
                </div>
            </div>
        `;

        if (!window.datePickers) window.datePickers = {};

        const pickerObj = {
            getValue: () => currentDate,
            setValue: (dStr) => {
                currentDate = dStr;
                const txt = document.getElementById(`pop_text_${containerId}`);
                if (txt) txt.innerText = formatDateItalian(currentDate);
                const parts = dStr.split('-');
                viewDate = new Date(parts[0], parts[1]-1, parts[2]);
                renderCalendar();
                onChange(currentDate);
            },
            setMin: (mStr) => { minDate = mStr; renderCalendar(); },
            setMax: (mStr) => { maxDate = mStr; renderCalendar(); },
            changeMonth: (dir) => {
                viewDate.setMonth(viewDate.getMonth() + dir);
                renderCalendar();
            }
        };

        window.datePickers[containerId] = pickerObj;

        const trigBtn = document.getElementById(`pop_trig_${containerId}`);
        const contentDiv = document.getElementById(`pop_content_${containerId}`);

        trigBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.popover-popup-content').forEach(p => {
                if(p.id !== `pop_content_${containerId}`) p.classList.remove('active');
            });
            contentDiv.classList.toggle('active');
            renderCalendar();
        });

        document.addEventListener('click', (e) => {
            const wrap = document.getElementById(`pop_wrap_${containerId}`);
            if(wrap && !wrap.contains(e.target)) {
                contentDiv.classList.remove('active');
            }
        });

        function formatDateItalian(dStr) {
            if (!dStr) return "Seleziona data";
            const [y, m, d] = dStr.split('-');
            const months = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
            return `${d} ${months[parseInt(m)-1]} ${y}`;
        }

        function renderCalendar() {
            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();
            const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
            
            const titleEl = document.getElementById(`pop_title_${containerId}`);
            if (titleEl) titleEl.innerText = `${monthNames[month]} ${year}`;

            const gridEl = document.getElementById(`pop_grid_${containerId}`);
            if (!gridEl) return;

            let html = `
                <div class="popover-day-name">Lu</div>
                <div class="popover-day-name">Ma</div>
                <div class="popover-day-name">Me</div>
                <div class="popover-day-name">Gi</div>
                <div class="popover-day-name">Ve</div>
                <div class="popover-day-name">Sa</div>
                <div class="popover-day-name">Do</div>
            `;

            const firstDayIndex = new Date(year, month, 1).getDay();
            const totalDays = new Date(year, month + 1, 0).getDate();
            let offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

            for (let i = 0; i < offset; i++) html += `<div></div>`;

            for (let day = 1; day <= totalDays; day++) {
                const dStr = `${year}-${(month+1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const isSelected = dStr === currentDate;
                
                let isDisabled = false;
                if (minDate && dStr < minDate) isDisabled = true;
                if (maxDate && dStr > maxDate) isDisabled = true;

                html += `<div class="popover-cal-cell ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}" ${!isDisabled ? `onclick="window.datePickers['${containerId}'].selectDate('${dStr}')"` : ''}>${day}</div>`;
            }

            gridEl.innerHTML = html;
        }

        pickerObj.selectDate = function(dStr) {
            currentDate = dStr;
            const txt = document.getElementById(`pop_text_${containerId}`);
            if (txt) txt.innerText = formatDateItalian(currentDate);
            contentDiv.classList.remove('active');
            onChange(currentDate);
        };

        renderCalendar();
        return pickerObj;
    }

    function initOptionPopover(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        let items = options.items || [];
        let currentItem = options.defaultItem || (items[0] || "");
        let onChange = options.onChange || function(){};
        let iconClass = options.icon || "fa-solid fa-list";

        container.innerHTML = `
            <div class="popover-container" id="pop_opt_wrap_${containerId}">
                <button type="button" class="popover-trigger-btn" id="pop_opt_trig_${containerId}">
                    <span id="pop_opt_text_${containerId}">${currentItem}</span>
                    <i class="${iconClass}"></i>
                </button>
                <div class="popover-popup-content" id="pop_opt_content_${containerId}">
                    <div class="option-selector-grid" id="pop_opt_grid_${containerId}"></div>
                </div>
            </div>
        `;

        const trigBtn = document.getElementById(`pop_opt_trig_${containerId}`);
        const contentDiv = document.getElementById(`pop_opt_content_${containerId}`);
        const gridDiv = document.getElementById(`pop_opt_grid_${containerId}`);

        function renderOptions() {
            gridDiv.innerHTML = '';
            items.forEach(it => {
                const isSelected = it === currentItem;
                gridDiv.innerHTML += `
                    <div class="option-selector-btn ${isSelected ? 'selected' : ''}" onclick="window.optionPickers['${containerId}'].selectOption('${it}')">
                        <span>${it}</span>
                        ${isSelected ? '<i class="fa-solid fa-check"></i>' : ''}
                    </div>
                `;
            });
        }

        if (!window.optionPickers) window.optionPickers = {};

        const pickerObj = {
            getValue: () => currentItem,
            setValue: (val) => {
                currentItem = val;
                const txt = document.getElementById(`pop_opt_text_${containerId}`);
                if (txt) txt.innerText = currentItem;
                renderOptions();
                onChange(currentItem);
            },
            setItems: (newItems) => {
                items = newItems;
                if (!items.includes(currentItem)) currentItem = items[0] || '';
                const txt = document.getElementById(`pop_opt_text_${containerId}`);
                if (txt) txt.innerText = currentItem;
                renderOptions();
            }
        };

        window.optionPickers[containerId] = pickerObj;

        pickerObj.selectOption = function(val) {
            currentItem = val;
            document.getElementById(`pop_opt_text_${containerId}`).innerText = currentItem;
            contentDiv.classList.remove('active');
            renderOptions();
            onChange(currentItem);
        };

        trigBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.popover-popup-content').forEach(p => {
                if(p.id !== `pop_opt_content_${containerId}`) p.classList.remove('active');
            });
            contentDiv.classList.toggle('active');
            renderOptions();
        });

        document.addEventListener('click', (e) => {
            const wrap = document.getElementById(`pop_opt_wrap_${containerId}`);
            if(wrap && !wrap.contains(e.target)) {
                contentDiv.classList.remove('active');
            }
        });

        renderOptions();
        return pickerObj;
    }

    let todoDatePicker = null;
    let todoPausePicker = null;
    let snoozeDatePicker = null;
    let examDatePicker = null;
    let examPausePicker = null;
    let examIntDatePicker = null;

    let unifiedIntDatePicker = null;
    let unifiedSingleDatePicker = null;

    let todoSubjectPicker = null;
    let examSubjectPicker = null;
    let examTypePicker = null;

    let editTodoDatePicker = null;
    let editTodoSubjectPicker = null;
    let editPriority = 1;
    let editDifficulty = 1;

    let currentTodoPauseDates = [];
    let currentExamPauseDates = [];
    let currentExamInterrogazioneDates = [];
    let manageInterrogazioneDates = [];

    const defaultSubjects = ["Matematica", "Fisica", "Scienze motorie", "Arte", "Latino", "Italiano", "Storia", "Scienze", "Ed. Civica", "Inglese", "IGCSE", "CDM"];
    let userSubjects = JSON.parse(localStorage.getItem('studylog_subjects') || JSON.stringify(defaultSubjects));

    function initAllDatePickers() {
        todoDatePicker = initPopoverDatePicker('todo-date-popover-container', {
            defaultDate: tomorrowStr,
            min: tomorrowStr,
            onChange: (val) => { updatePauseBounds('todo'); }
        });

        todoPausePicker = initPopoverDatePicker('todo-pause-popover-container', {
            defaultDate: tomorrowStr,
            min: tomorrowStr,
            onChange: (val) => {}
        });

        snoozeDatePicker = initPopoverDatePicker('snooze-date-popover-container', {
            defaultDate: tomorrowStr,
            min: tomorrowStr,
            onChange: (val) => {}
        });

        examDatePicker = initPopoverDatePicker('exam-date-popover-container', {
            defaultDate: tomorrowStr,
            min: tomorrowStr,
            onChange: (val) => { updatePauseBounds('exam'); }
        });

        examPausePicker = initPopoverDatePicker('exam-pause-popover-container', {
            defaultDate: tomorrowStr,
            min: tomorrowStr,
            onChange: (val) => {}
        });

        examIntDatePicker = initPopoverDatePicker('exam-int-dates-popover-container', {
            defaultDate: tomorrowStr,
            min: tomorrowStr,
            onChange: (val) => {}
        });

        unifiedIntDatePicker = initPopoverDatePicker('unified-int-date-picker-container', {
            defaultDate: tomorrowStr,
            min: tomorrowStr,
            onChange: (val) => {}
        });

        unifiedSingleDatePicker = initPopoverDatePicker('unified-single-date-container', {
            defaultDate: tomorrowStr,
            min: tomorrowStr,
            onChange: (val) => {}
        });

        editTodoDatePicker = initPopoverDatePicker('edit-todo-date-popover-container', {
            defaultDate: tomorrowStr,
            min: tomorrowStr,
            onChange: (val) => {}
        });

        todoSubjectPicker = initOptionPopover('todo-subject-popover-container', {
            items: userSubjects,
            defaultItem: userSubjects[0] || 'Matematica',
            icon: 'fa-solid fa-book-bookmark'
        });

        editTodoSubjectPicker = initOptionPopover('edit-todo-subject-popover-container', {
            items: userSubjects,
            defaultItem: userSubjects[0] || 'Matematica',
            icon: 'fa-solid fa-book-bookmark'
        });

        examSubjectPicker = initOptionPopover('exam-subject-popover-container', {
            items: userSubjects,
            defaultItem: userSubjects[0] || 'Matematica',
            icon: 'fa-solid fa-book-bookmark',
            onChange: (sub) => {
                updateExamTypesForSubject(sub);
                updateExamInputLabel();
            }
        });

        examTypePicker = initOptionPopover('exam-type-popover-container', {
            items: ["Verifica", "Interrogazione", "Presentazione"],
            defaultItem: "Verifica",
            icon: 'fa-solid fa-layer-group',
            onChange: (type) => {
                onExamTypeChanged(type);
            }
        });
    }

    function updateExamTypesForSubject(sub) {
        const isLatino = sub && sub.toLowerCase().includes('latino');
        const types = isLatino ? ["Verifica", "Interrogazione", "Presentazione", "Versione"] : ["Verifica", "Interrogazione", "Presentazione"];
        if (examTypePicker) {
            examTypePicker.setItems(types);
            onExamTypeChanged(examTypePicker.getValue());
        }
    }

    function onExamTypeChanged(type) {
        const isInterrogazione = type === 'Interrogazione';
        document.getElementById('group-interrogazione-days').style.display = isInterrogazione ? 'block' : 'none';
        document.getElementById('group-exam-date').style.display = isInterrogazione ? 'none' : 'block';
        updateExamInputLabel();
    }

    window.addSpecificInterrogazioneDate = function(scope) {
        const picker = scope === 'create' ? examIntDatePicker : unifiedIntDatePicker;
        const val = picker ? picker.getValue() : '';
        if (!val || val <= todayDateStr) {
            customAlert("Seleziona una data a partire da domani! Non puoi scegliere oggi stesso.", "Data non valida", true);
            return;
        }

        let list = scope === 'create' ? currentExamInterrogazioneDates : manageInterrogazioneDates;
        if (!list.includes(val)) {
            list.push(val);
            list.sort();
            renderInterrogazioneChips(scope);
        } else {
            customAlert("Hai già aggiunto questa data per l'interrogazione!", "Data duplicata");
        }
    }

    window.removeSpecificInterrogazioneDate = function(scope, index) {
        let list = scope === 'create' ? currentExamInterrogazioneDates : manageInterrogazioneDates;
        list.splice(index, 1);
        renderInterrogazioneChips(scope);
    }

    function renderInterrogazioneChips(scope) {
        const container = document.getElementById(scope === 'create' ? 'exam-int-dates-chips' : 'unified-int-chips');
        const list = scope === 'create' ? currentExamInterrogazioneDates : manageInterrogazioneDates;
        if (!container) return;
        container.innerHTML = '';
        list.forEach((dStr, idx) => {
            const [y, m, d] = dStr.split('-');
            container.innerHTML += `
                <div class="subject-tag-chip">
                    <span>${d}/${m}/${y}</span>
                    <button type="button" class="remove-tag" onclick="removeSpecificInterrogazioneDate('${scope}', ${idx})"><i class="fa-solid fa-xmark"></i></button>
                </div>
            `;
        });
    }

    const rankTiers = [{ name: "Einstein", minXp: 80000 }, { name: "Laurea Lode", minXp: 40000 }, { name: "Ricercatore", minXp: 12000 }, { name: "Universitario", minXp: 5000 }, { name: "Studente", minXp: 1000 }, { name: "Matricola", minXp: 0 }];

    let myTodos = JSON.parse(localStorage.getItem('studylog_todos') || '[]'); 
    let myExams = JSON.parse(localStorage.getItem('studylog_exams') || '[]'); 
    let completedTasks = JSON.parse(localStorage.getItem('studylog_completed') || '{}'); 
    let rankedData = JSON.parse(localStorage.getItem('studylog_ranked') || '{"xp": 0}');
    let xpHistory = JSON.parse(localStorage.getItem('studylog_xp_hist') || '{}');

    function updatePauseBounds(type) {
        if (type === 'todo') {
            const deadline = todoDatePicker ? todoDatePicker.getValue() : tomorrowStr;
            if (todoPausePicker) {
                todoPausePicker.setMin(tomorrowStr);
                todoPausePicker.setMax(deadline || tomorrowStr);
            }
            currentTodoPauseDates = currentTodoPauseDates.filter(d => d >= tomorrowStr && (!deadline || d <= deadline));
            renderPauseChips('todo');
        } else {
            const examDate = examDatePicker ? examDatePicker.getValue() : tomorrowStr;
            if (examPausePicker) {
                examPausePicker.setMin(tomorrowStr);
                examPausePicker.setMax(examDate || tomorrowStr);
            }
            currentExamPauseDates = currentExamPauseDates.filter(d => d >= tomorrowStr && (!examDate || d <= examDate));
            renderPauseChips('exam');
        }
    }

    window.addPauseDate = function(type) {
        const val = type === 'todo' ? (todoPausePicker ? todoPausePicker.getValue() : '') : (examPausePicker ? examPausePicker.getValue() : '');
        const maxLimit = type === 'todo' ? (todoDatePicker ? todoDatePicker.getValue() : '') : (examDatePicker ? examDatePicker.getValue() : '');
        
        if (!val || val <= todayDateStr) { 
            customAlert("La data di pausa deve essere successiva a oggi! Non puoi scegliere il giorno stesso.", "Data non valida", true); 
            return; 
        }
        if (maxLimit && val > maxLimit) { 
            customAlert("La data deve essere compresa tra domani e la scadenza!", "Intervallo non valido"); 
            return; 
        }

        let list = type === 'todo' ? currentTodoPauseDates : currentExamPauseDates;
        if (!list.includes(val)) {
            list.push(val);
            list.sort();
            renderPauseChips(type);
        } else {
            customAlert("Data già inserita nelle pause!", "Data duplicata");
        }
    }

    window.removePauseDate = function(type, index) {
        if (type === 'todo') {
            currentTodoPauseDates.splice(index, 1);
            renderPauseChips('todo');
        } else {
            currentExamPauseDates.splice(index, 1);
            renderPauseChips('exam');
        }
    }

    function renderPauseChips(type) {
        const container = document.getElementById(type === 'todo' ? 'todo-pause-chips' : 'exam-pause-chips');
        const list = type === 'todo' ? currentTodoPauseDates : currentExamPauseDates;
        if (!container) return;
        container.innerHTML = '';
        list.forEach((dateStr, index) => {
            const [y, m, d] = dateStr.split('-');
            container.innerHTML += `
                <div class="subject-tag-chip">
                    <span>${d}/${m}/${y}</span>
                    <button type="button" class="remove-tag" onclick="removePauseDate('${type}', ${index})"><i class="fa-solid fa-xmark"></i></button>
                </div>
            `;
        });
    }

    function renderSettingsSubjectTags() {
        const container = document.getElementById('settings-tags-list');
        if (!container) return;
        container.innerHTML = '';
        userSubjects.forEach((sub, index) => {
            container.innerHTML += `
                <div class="subject-tag-chip">
                    <span>${sub}</span>
                    <button type="button" class="remove-tag" onclick="removeSubjectTag(${index})"><i class="fa-solid fa-xmark"></i></button>
                </div>
            `;
        });
    }

    window.addSubjectFromSettings = function() {
        const input = document.getElementById('settings-subject-input');
        const val = input.value.trim();
        if (val) {
            if (!userSubjects.map(s => s.toLowerCase()).includes(val.toLowerCase())) {
                userSubjects.push(val);
                input.value = '';
                localStorage.setItem('studylog_subjects', JSON.stringify(userSubjects));
                renderSettingsSubjectTags();
                if (todoSubjectPicker) todoSubjectPicker.setItems(userSubjects);
                if (editTodoSubjectPicker) editTodoSubjectPicker.setItems(userSubjects);
                if (examSubjectPicker) examSubjectPicker.setItems(userSubjects);
                showToast("Materia aggiunta!");
            } else {
                customAlert("Questa materia è già presente nella lista!", "Materia esistente");
            }
        }
    }

    window.removeSubjectTag = function(index) {
        if (userSubjects.length <= 1) {
            customAlert("Devi mantenere almeno una materia nel diario!", "Attenzione");
            return;
        }
        userSubjects.splice(index, 1);
        localStorage.setItem('studylog_subjects', JSON.stringify(userSubjects));
        renderSettingsSubjectTags();
        if (todoSubjectPicker) todoSubjectPicker.setItems(userSubjects);
        if (editTodoSubjectPicker) editTodoSubjectPicker.setItems(userSubjects);
        if (examSubjectPicker) examSubjectPicker.setItems(userSubjects);
    }

    window.updateExamInputLabel = function() {
        const sub = examSubjectPicker ? examSubjectPicker.getValue() : '';
        const type = examTypePicker ? examTypePicker.getValue() : 'Verifica';
        const label = document.getElementById('exam-amount-label');
        const input = document.getElementById('exam-pages');
        const lowerVal = sub ? sub.toLowerCase() : '';
        
        if (type === 'Versione') {
            label.innerText = 'Numero di versioni da svolgere';
            input.placeholder = 'Es. 6';
        } else if (lowerVal.includes('matematica') || lowerVal.includes('fisica')) {
            label.innerText = 'Esercizi al giorno';
            input.placeholder = 'Es. 10';
        } else {
            label.innerText = 'Pagine totali da studiare';
            input.placeholder = 'Es. 35';
        }
    }
    
    let currentStreak = 0;
    let recordStreak = parseInt(localStorage.getItem('studylog_record_streak') || '0');
    let navDate = new Date(); let streakNavDate = new Date();

    function applySettingsUI() {
        let bgBtn = document.getElementById('btn-bg-' + savedBg); 
        document.querySelectorAll('.settings-grid .choice-btn').forEach(btn => {
            if(btn.id.startsWith('btn-bg-')) btn.classList.remove('active-setting');
        });
        if (bgBtn) bgBtn.classList.add('active-setting');
        document.getElementById('app-container').setAttribute('data-bg', savedBg);

        const iconEl = document.getElementById('theme-toggler-icon');
        const textEl = document.getElementById('theme-toggler-text');
        if (iconEl && textEl) {
            if (savedTheme === 'dark') {
                iconEl.className = "fa-solid fa-moon";
                textEl.innerText = "Modalità Scura";
            } else {
                iconEl.className = "fa-solid fa-sun";
                textEl.innerText = "Modalità Chiara";
            }
        }
        updateNotificationBellUI();
    }

    window.toggleAppTheme = function(event) {
        const nextTheme = savedTheme === 'light' ? 'dark' : 'light';
        const x = event.clientX || window.innerWidth / 2;
        const y = event.clientY || window.innerHeight / 2;
        const newBgColor = nextTheme === 'dark' ? '#161616' : '#F9F7F1';

        const overlay = document.createElement('div');
        overlay.className = 'theme-transition-overlay';
        overlay.style.backgroundColor = newBgColor;
        
        const maxRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlay.style.clipPath = `circle(${maxRadius}px at ${x}px ${y}px)`;
            });
        });

        setTimeout(() => {
            savedTheme = nextTheme;
            localStorage.setItem('studylog_theme', nextTheme);
            document.documentElement.setAttribute('data-theme', nextTheme);
            applySettingsUI();
        }, 250);

        setTimeout(() => { overlay.remove(); }, 650);
    }

    function updateNotificationBellUI() {
        const label = document.getElementById('notif-status-label');
        const badge = document.getElementById('notif-badge-count');
        if (!label) return;
        
        if (!("Notification" in window)) {
            label.innerText = "Non supportate";
            return;
        }

        if (Notification.permission === "granted") {
            label.innerText = "Notifiche Attive";
            if(badge) badge.style.display = 'none';
        } else if (Notification.permission === "denied") {
            label.innerText = "Notifiche Bloccate";
            if(badge) badge.style.display = 'none';
        } else {
            label.innerText = "Attiva Notifiche";
            if(badge) badge.style.display = 'inline-block';
        }
    }

    window.handleNotificationBellClick = function(btnElement) {
        btnElement.classList.add('animate-bell');
        setTimeout(() => {
            btnElement.classList.remove('animate-bell');
        }, 500);

        if (!("Notification" in window)) {
            customAlert("Il tuo browser o dispositivo non supporta le notifiche.");
            return;
        }

        if (Notification.permission === "granted") {
            showToast("Le notifiche sono già attive!");
            sendLocalNotification("Study Planner 📚", "Le notifiche sono configurate e operative correttamente!");
        } else if (Notification.permission === "denied") {
            customAlert("Hai bloccato le notifiche in precedenza. Sblocca i permessi dalle impostazioni del browser.", "Permessi negati", true);
        } else {
            Notification.requestPermission().then(permission => {
                updateNotificationBellUI();
                if (permission === "granted") {
                    showToast("Notifiche attivate con successo!");
                    sendLocalNotification("Study Planner 🎉", "Grazie per aver attivato le notifiche! Ti ricorderemo di studiare.");
                    checkAndSendSmartNotification();
                } else {
                    showToast("Permesso negato.", true);
                }
            });
        }
    }

    function sendLocalNotification(title, body) {
        if (!("Notification" in window) || Notification.permission !== "granted") return;
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body: body,
                    icon: '1790418729575_cutout.png',
                    badge: '1790418729575_cutout.png',
                    vibrate: [200, 100, 200]
                });
            });
        } else {
            new Notification(title, { body: body, icon: '1790418729575_cutout.png' });
        }
    }

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function checkAndSendSmartNotification() {
        if (!("Notification" in window) || Notification.permission !== "granted") return;
        let tasks = getTasksForDate(todayDateStr);
        let actionableTasks = tasks.filter(t => !t.isExamDay);
        if (actionableTasks.length === 0) return; 

        let completedCount = 0;
        actionableTasks.forEach(t => {
            let setKey = `${todayDateStr}_${t._id}`;
            if (t.isNormalTodo || t.isExamReview) {
                if (completedTasks[setKey]) completedCount++;
            } else if (t.isExamStudy || t.isPractice || t.isVersion) {
                if (t.isDone) completedCount++;
            }
        });

        let notifHistory = JSON.parse(localStorage.getItem('studylog_notif_history') || '{}');
        let todayHistory = notifHistory[todayDateStr] || { completedSent: false, lastMsgTime: 0 };

        const nowTime = Date.now();
        const threeHoursMs = 3 * 60 * 60 * 1000;

        if (completedCount === actionableTasks.length) {
            if (!todayHistory.completedSent) {
                let randomPraise = getRandomItem(completedPhrases);
                sendLocalNotification("Study Planner 🎉", randomPraise);
                todayHistory.completedSent = true;
                notifHistory[todayDateStr] = todayHistory;
                localStorage.setItem('studylog_notif_history', JSON.stringify(notifHistory));
            }
        } else {
            if (nowTime - (todayHistory.lastMsgTime || 0) >= threeHoursMs) {
                let randomMotivation = getRandomItem(motivationalPhrases);
                sendLocalNotification("Study Planner 📚", randomMotivation);
                todayHistory.lastMsgTime = nowTime;
                notifHistory[todayDateStr] = todayHistory;
                localStorage.setItem('studylog_notif_history', JSON.stringify(notifHistory));
            }
        }
    }

    window.setAppBg = function(bg) { savedBg = bg; localStorage.setItem('studylog_bg', bg); document.getElementById('app-container').setAttribute('data-bg', bg); applySettingsUI(); }

    let currentPriority = 1;
    document.querySelectorAll('#todo-priority i').forEach(star => { star.addEventListener('click', function() { currentPriority = parseInt(this.getAttribute('data-val')); document.querySelectorAll('#todo-priority i').forEach(s => { s.classList.toggle('active', parseInt(s.getAttribute('data-val')) <= currentPriority); }); }); });

    let currentDifficulty = 1;
    document.querySelectorAll('#todo-difficulty .diff-input-bar').forEach(bar => { bar.addEventListener('click', function() { currentDifficulty = parseInt(this.getAttribute('data-val')); document.querySelectorAll('#todo-difficulty .diff-input-bar').forEach(b => { b.classList.toggle('active', parseInt(b.getAttribute('data-val')) <= currentDifficulty); }); }); });

    document.querySelectorAll('#edit-todo-priority i').forEach(star => {
        star.addEventListener('click', function() {
            editPriority = parseInt(this.getAttribute('data-val'));
            document.querySelectorAll('#edit-todo-priority i').forEach(s => {
                s.classList.toggle('active', parseInt(s.getAttribute('data-val')) <= editPriority);
            });
        });
    });

    document.querySelectorAll('#edit-todo-difficulty .diff-input-bar').forEach(bar => {
        bar.addEventListener('click', function() {
            editDifficulty = parseInt(this.getAttribute('data-val'));
            document.querySelectorAll('#edit-todo-difficulty .diff-input-bar').forEach(b => {
                b.classList.toggle('active', parseInt(b.getAttribute('data-val')) <= editDifficulty);
            });
        });
    });

    window.openChoiceModal = () => document.getElementById('choice-modal').classList.add('active');
    window.closeModal = (id) => document.getElementById(id).classList.remove('active');
    
    window.openTodoModal = () => { 
        closeModal('choice-modal'); 
        document.getElementById('todo-title').value = ''; 
        if (todoSubjectPicker) todoSubjectPicker.setItems(userSubjects);
        currentTodoPauseDates = [];
        renderPauseChips('todo');
        if (todoDatePicker) todoDatePicker.setValue(tomorrowStr);
        if (todoPausePicker) todoPausePicker.setValue(tomorrowStr);
        updatePauseBounds('todo');
        document.getElementById('add-todo-modal').classList.add('active'); 
    }
    
    window.openExamModal = () => { 
        closeModal('choice-modal'); 
        if (examSubjectPicker) examSubjectPicker.setItems(userSubjects);
        updateExamTypesForSubject(examSubjectPicker ? examSubjectPicker.getValue() : '');
        document.getElementById('exam-pages').value = ''; 
        currentExamPauseDates = [];
        currentExamInterrogazioneDates = [];
        renderPauseChips('exam');
        renderInterrogazioneChips('create');
        if (examDatePicker) examDatePicker.setValue(tomorrowStr);
        if (examPausePicker) examPausePicker.setValue(tomorrowStr);
        if (examIntDatePicker) examIntDatePicker.setValue(tomorrowStr);
        updatePauseBounds('exam');
        document.getElementById('add-exam-modal').classList.add('active'); 
    }

    window.openBottomSheet = (id) => {
        if (id === 'settings-sheet') {
            renderSettingsSubjectTags();
        } else if (id === 'streak-sheet') {
            streakNavDate = new Date();
            renderStreakCalendar();
        }
        document.getElementById(id).classList.add('active');
    };
    window.closeBottomSheet = (id) => document.getElementById(id).classList.remove('active');

    function addDays(dateStr, days) { const parts = dateStr.split('-'); let d = new Date(parts[0], parts[1]-1, parts[2]); d.setDate(d.getDate() + days); return formatDateStr(d); }
    
    function getDayLoad(dateStr) { 
        let load = 0; 
        myTodos.forEach(t => { if (t.assignedDate === dateStr) load += (t.difficulty || 1); }); 
        myExams.forEach(e => { if (e.date === dateStr) load += 5; }); 
        return load; 
    }

    function calculateAssignedDate(deadlineStr, priority, difficulty, todayStr, excludedDates) {
        let deadlineDate = new Date(deadlineStr); deadlineDate.setHours(0,0,0,0);
        let today = new Date(todayStr); today.setHours(0,0,0,0);
        if (deadlineDate <= today) return todayStr;
        
        let effectiveDeadlineStr = addDays(deadlineStr, -1);
        if (new Date(effectiveDeadlineStr) < today) { effectiveDeadlineStr = todayStr; }
        
        let validDates = []; let curr = todayStr;
        while (new Date(curr) <= new Date(effectiveDeadlineStr)) {
            if (!excludedDates.includes(curr)) {
                validDates.push(curr);
            }
            curr = addDays(curr, 1);
        }
        
        if (validDates.length === 0) validDates = [effectiveDeadlineStr];
        
        let minLoad = Infinity; let dateLoads = {};
        validDates.forEach(d => { let l = getDayLoad(d); dateLoads[d] = l; if (l < minLoad) minLoad = l; });
        let minLoadDates = validDates.filter(d => dateLoads[d] === minLoad);
        if (priority === 3) return minLoadDates[0];
        else if (priority === 1) return minLoadDates[minLoadDates.length - 1];
        else return minLoadDates[Math.floor(minLoadDates.length / 2)];
    }

    window.saveTodo = () => {
        const subject = todoSubjectPicker ? todoSubjectPicker.getValue() : '';
        const title = document.getElementById('todo-title').value.trim(); 
        const deadline = todoDatePicker ? todoDatePicker.getValue() : ''; 
        const repeat = document.getElementById('todo-repeat').checked;

        if(!subject || !title || !deadline) { 
            customAlert('Compila materia, titolo e scadenza!'); 
            return; 
        }

        if (deadline <= todayDateStr) {
            customAlert("La data di scadenza deve essere successiva a oggi!", "Data non valida", true);
            return;
        }
        
        let assignedDate = todayDateStr;
        if (!repeat) {
            assignedDate = calculateAssignedDate(deadline, currentPriority, currentDifficulty, todayDateStr, currentTodoPauseDates);
        }

        myTodos.push({ 
            id: 'td_' + generateId(), 
            subject: subject,
            title: title, 
            priority: currentPriority, 
            difficulty: currentDifficulty, 
            deadline: deadline, 
            assignedDate: assignedDate, 
            repeat: repeat,
            createdAt: todayDateStr,
            excludedDays: [...currentTodoPauseDates] 
        });
        
        localStorage.setItem('studylog_todos', JSON.stringify(myTodos)); 
        closeModal('add-todo-modal'); 
        updateAllDots();
        if(selectedDateStr) generateTasksForDate(selectedDateStr);
        updateWeekSliderVisuals(selectedDateStr);
        renderMonthCalendar();
    }

    window.openUnifiedTodoModal = function(id) {
        const todo = myTodos.find(t => t.id === id);
        if (!todo) return;

        document.getElementById('edit-todo-id').value = id;
        document.getElementById('edit-todo-title').value = todo.title || '';
        document.getElementById('edit-todo-repeat').checked = !!todo.repeat;

        if (editTodoSubjectPicker) {
            editTodoSubjectPicker.setItems(userSubjects);
            editTodoSubjectPicker.setValue(todo.subject || userSubjects[0] || 'Matematica');
        }

        editPriority = todo.priority || 1;
        document.querySelectorAll('#edit-todo-priority i').forEach(s => {
            s.classList.toggle('active', parseInt(s.getAttribute('data-val')) <= editPriority);
        });

        editDifficulty = todo.difficulty || 1;
        document.querySelectorAll('#edit-todo-difficulty .diff-input-bar').forEach(b => {
            b.classList.toggle('active', parseInt(b.getAttribute('data-val')) <= editDifficulty);
        });

        if (editTodoDatePicker) {
            editTodoDatePicker.setMin(tomorrowStr);
            editTodoDatePicker.setValue(todo.deadline && todo.deadline > todayDateStr ? todo.deadline : tomorrowStr);
        }

        document.getElementById('unified-todo-modal').classList.add('active');
    }

    window.saveUnifiedTodoChanges = function() {
        const id = document.getElementById('edit-todo-id').value;
        const todo = myTodos.find(t => t.id === id);
        if (!todo) return;

        const subject = editTodoSubjectPicker ? editTodoSubjectPicker.getValue() : '';
        const title = document.getElementById('edit-todo-title').value.trim();
        const deadline = editTodoDatePicker ? editTodoDatePicker.getValue() : '';
        const repeat = document.getElementById('edit-todo-repeat').checked;

        if (!subject || !title || !deadline) {
            customAlert('Compila tutti i campi obbligatori!');
            return;
        }

        if (deadline <= todayDateStr) {
            customAlert("La data di scadenza deve essere successiva a oggi!", "Data non valida", true);
            return;
        }

        todo.subject = subject;
        todo.title = title;
        todo.priority = editPriority;
        todo.difficulty = editDifficulty;
        todo.deadline = deadline;
        todo.repeat = repeat;

        if (!repeat) {
            if (todo.assignedDate > deadline || todo.assignedDate < todayDateStr) {
                todo.assignedDate = calculateAssignedDate(deadline, editPriority, editDifficulty, todayDateStr, todo.excludedDays || []);
            }
        }

        localStorage.setItem('studylog_todos', JSON.stringify(myTodos));
        closeModal('unified-todo-modal');
        updateAllDots();
        generateTasksForDate(selectedDateStr);
        updateWeekSliderVisuals(selectedDateStr);
        renderMonthCalendar();
        showToast("Task aggiornata!");
    }

    window.deleteTodoFromUnifiedModal = async function() {
        const id = document.getElementById('edit-todo-id').value;
        const ok = await customConfirm({
            title: "Elimina Task",
            message: "Sei sicuro di voler eliminare questa task dal diario?",
            confirmText: "Elimina",
            cancelText: "Annulla",
            isDanger: true
        });
        if (!ok) return;

        myTodos = myTodos.filter(t => t.id !== id);
        localStorage.setItem('studylog_todos', JSON.stringify(myTodos));
        closeModal('unified-todo-modal');
        updateAllDots();
        generateTasksForDate(selectedDateStr);
        updateWeekSliderVisuals(selectedDateStr);
        renderMonthCalendar();
        showToast("Task eliminata!");
    }

    window.saveExam = () => {
        const type = examTypePicker ? examTypePicker.getValue() : 'Verifica'; 
        const subject = examSubjectPicker ? examSubjectPicker.getValue() : ''; 
        const pages = document.getElementById('exam-pages').value;
        
        let examDate = examDatePicker ? examDatePicker.getValue() : '';
        if (type === 'Interrogazione') {
            if (currentExamInterrogazioneDates.length === 0) {
                customAlert("Aggiungi almeno una data specifica (da domani in poi) per l'interrogazione!");
                return;
            }
            examDate = currentExamInterrogazioneDates[currentExamInterrogazioneDates.length - 1];
        }

        if(!type || !subject || !pages || !examDate) { 
            customAlert('Compila tutti i campi obbligatori!'); 
            return; 
        }

        if (examDate <= todayDateStr) {
            customAlert("La data della prova deve essere da domani in poi!", "Data non valida", true);
            return;
        }

        myExams.push({ 
            id: 'ex_' + generateId(), 
            type: type, 
            subject: subject, 
            date: examDate, 
            startDate: todayDateStr,
            pages: parseInt(pages), 
            specificInterrogazioneDates: type === 'Interrogazione' ? [...currentExamInterrogazioneDates] : [],
            progress: {},
            excludedDays: [...currentExamPauseDates],
            snoozedDays: []
        });
        
        localStorage.setItem('studylog_exams', JSON.stringify(myExams));
        closeModal('add-exam-modal'); 
        updateAllDots();
        if(selectedDateStr) generateTasksForDate(selectedDateStr); 
        updateWeekSliderVisuals(selectedDateStr); 
        renderMonthCalendar();
    }

    window.openUnifiedExamModal = function(id) {
        const exam = myExams.find(e => e.id === id);
        if (!exam) return;

        document.getElementById('unified-exam-id').value = id;
        document.getElementById('unified-exam-delta').value = '';
        document.getElementById('unified-modal-title').innerText = `Gestisci: ${exam.subject} (${exam.type})`;
        
        let labelUnit = 'pagine';
        if (exam.type === 'Versione') labelUnit = 'versioni';
        else if (exam.subject && (exam.subject.toLowerCase().includes('matematica') || exam.subject.toLowerCase().includes('fisica'))) labelUnit = 'esercizi';
        
        document.getElementById('unified-current-pages').innerText = `Attualmente impostato a: ${exam.pages} ${labelUnit}`;
        document.getElementById('unified-load-label').innerText = `Aggiungi o Rimuovi ${labelUnit}`;

        const intGroup = document.getElementById('unified-interrogazione-group');
        const singleGroup = document.getElementById('unified-single-date-group');

        if (exam.type === 'Interrogazione') {
            intGroup.style.display = 'block';
            singleGroup.style.display = 'none';
            manageInterrogazioneDates = exam.specificInterrogazioneDates ? [...exam.specificInterrogazioneDates] : [exam.date];
            renderInterrogazioneChips('manage');
        } else {
            intGroup.style.display = 'none';
            singleGroup.style.display = 'block';
            if (unifiedSingleDatePicker) {
                unifiedSingleDatePicker.setMin(tomorrowStr);
                unifiedSingleDatePicker.setValue(exam.date && exam.date > todayDateStr ? exam.date : tomorrowStr);
            }
        }

        document.getElementById('unified-exam-modal').classList.add('active');
    }

    window.applyDeltaExamLoad = function(action) {
        const id = document.getElementById('unified-exam-id').value;
        const exam = myExams.find(e => e.id === id);
        const deltaInput = parseInt(document.getElementById('unified-exam-delta').value);
        if (!exam || isNaN(deltaInput) || deltaInput < 1) {
            customAlert("Inserisci un numero valido maggiore di 0.");
            return;
        }

        if (action === 'add') {
            exam.pages += deltaInput;
        } else if (action === 'remove') {
            exam.pages = Math.max(1, exam.pages - deltaInput);
        }

        document.getElementById('unified-exam-delta').value = '';
        let labelUnit = exam.type === 'Versione' ? 'versioni' : 'pagine';
        document.getElementById('unified-current-pages').innerText = `Attualmente impostato a: ${exam.pages} ${labelUnit}`;
        showToast("Carico aggiornato!");
    }

    window.saveUnifiedExamChanges = function() {
        const id = document.getElementById('unified-exam-id').value;
        const exam = myExams.find(e => e.id === id);
        if (!exam) return;

        if (exam.type === 'Interrogazione') {
            if (manageInterrogazioneDates.length === 0) {
                customAlert("Devi impostare almeno una data per l'interrogazione!");
                return;
            }
            exam.specificInterrogazioneDates = [...manageInterrogazioneDates];
            exam.date = manageInterrogazioneDates[manageInterrogazioneDates.length - 1];
        } else {
            const newDate = unifiedSingleDatePicker ? unifiedSingleDatePicker.getValue() : exam.date;
            if (newDate <= todayDateStr) {
                customAlert("La data della prova deve essere successiva a oggi!", "Data non valida", true);
                return;
            }
            exam.date = newDate;
        }

        localStorage.setItem('studylog_exams', JSON.stringify(myExams));
        closeModal('unified-exam-modal');
        updateAllDots();
        generateTasksForDate(selectedDateStr);
        updateWeekSliderVisuals(selectedDateStr);
        renderMonthCalendar();
        showToast("Modifiche salvate!");
    }

    window.deleteExamFromUnifiedModal = async function() {
        const id = document.getElementById('unified-exam-id').value;
        const ok = await customConfirm({
            title: "Elimina Prova",
            message: "Sei sicuro di voler eliminare questa prova e tutte le relative task di studio?",
            confirmText: "Elimina",
            cancelText: "Annulla",
            isDanger: true
        });
        if (!ok) return;
        
        myExams = myExams.filter(e => e.id !== id);
        localStorage.setItem('studylog_exams', JSON.stringify(myExams));
        closeModal('unified-exam-modal');
        updateAllDots();
        generateTasksForDate(selectedDateStr);
        updateWeekSliderVisuals(selectedDateStr);
        renderMonthCalendar();
        showToast("Prova eliminata!");
    }

    window.openSnoozeModal = function(id, type = 'todo') {
        document.getElementById('snooze-task-id').value = id;
        document.getElementById('snooze-task-type').value = type;

        let deadlineStr = '';
        let today = new Date();
        today.setHours(0,0,0,0);
        let minDate = new Date(today);
        minDate.setDate(minDate.getDate() + 1);

        if (type === 'todo') {
            let todo = myTodos.find(t => t.id === id);
            if (!todo) return;
            deadlineStr = todo.deadline;
        } else {
            let exam = myExams.find(e => e.id === id);
            if (!exam) return;
            deadlineStr = exam.date;
        }

        let maxDate = new Date(deadlineStr);
        maxDate.setHours(0,0,0,0);
        maxDate.setDate(maxDate.getDate() - 1); 
        
        if (minDate > maxDate) {
            customAlert("Non c'è più tempo materiale! Questa prova/task scade domani o oggi, non puoi rimandarla ulteriormente.");
            return;
        }

        if (snoozeDatePicker) {
            snoozeDatePicker.setMin(formatDateStr(minDate));
            snoozeDatePicker.setMax(formatDateStr(maxDate));
            snoozeDatePicker.setValue(formatDateStr(minDate));
        }
        document.getElementById('snooze-modal').classList.add('active');
    }

    window.executeManualSnooze = function() {
        let id = document.getElementById('snooze-task-id').value;
        let type = document.getElementById('snooze-task-type').value;
        let newDateStr = snoozeDatePicker ? snoozeDatePicker.getValue() : '';
        if (!newDateStr) return;
        
        if (type === 'todo') {
            let todo = myTodos.find(t => t.id === id);
            if (todo) {
                todo.assignedDate = newDateStr;
                localStorage.setItem('studylog_todos', JSON.stringify(myTodos));
            }
        } else {
            let exam = myExams.find(e => e.id === id);
            if (exam) {
                if (!exam.snoozedDays) exam.snoozedDays = [];
                exam.snoozedDays.push(selectedDateStr);
                if (!exam.excludedDays) exam.excludedDays = [];
                exam.excludedDays.push(selectedDateStr);
                localStorage.setItem('studylog_exams', JSON.stringify(myExams));
            }
        }

        closeModal('snooze-modal');
        updateAllDots();
        generateTasksForDate(selectedDateStr);
        updateWeekSliderVisuals(selectedDateStr);
        renderMonthCalendar();
        showToast("Rimandato con successo!");
    }

    window.executeAutoSnooze = function() {
        let id = document.getElementById('snooze-task-id').value;
        let type = document.getElementById('snooze-task-type').value;

        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        let tomorrowStrVal = formatDateStr(tomorrow);

        if (type === 'todo') {
            let todo = myTodos.find(t => t.id === id);
            if (!todo) return;
            let newDateStr = calculateAssignedDate(todo.deadline, todo.priority, todo.difficulty, tomorrowStrVal, todo.excludedDays || []);
            todo.assignedDate = newDateStr;
            localStorage.setItem('studylog_todos', JSON.stringify(myTodos));
        } else {
            let exam = myExams.find(e => e.id === id);
            if (!exam) return;
            if (!exam.snoozedDays) exam.snoozedDays = [];
            exam.snoozedDays.push(selectedDateStr);
            if (!exam.excludedDays) exam.excludedDays = [];
            exam.excludedDays.push(selectedDateStr);
            localStorage.setItem('studylog_exams', JSON.stringify(myExams));
        }
        
        closeModal('snooze-modal');
        updateAllDots();
        generateTasksForDate(selectedDateStr);
        updateWeekSliderVisuals(selectedDateStr);
        renderMonthCalendar();
        showToast("Riprogrammato in automatico!");
    }

    window.deleteTodoDirect = async function(id) {
        const ok = await customConfirm({
            title: "Elimina Task",
            message: "Vuoi eliminare questa task dal diario?",
            confirmText: "Elimina",
            cancelText: "Annulla",
            isDanger: true
        });
        if (!ok) return;

        myTodos = myTodos.filter(t => t.id !== id);
        localStorage.setItem('studylog_todos', JSON.stringify(myTodos));
        updateAllDots();
        generateTasksForDate(selectedDateStr);
        updateWeekSliderVisuals(selectedDateStr);
        renderMonthCalendar();
        showToast("Task eliminata!");
    }

    function getExamDayInfo(exam, targetDateStr) {
        let eDate = new Date(exam.date); eDate.setHours(0,0,0,0);
        let sDate = new Date(exam.startDate || todayDateStr); sDate.setHours(0,0,0,0);
        let tDate = new Date(targetDateStr); tDate.setHours(0,0,0,0);

        if (tDate.getTime() < sDate.getTime()) return null; 
        if (tDate.getTime() > eDate.getTime()) return null; 

        let excluded = exam.excludedDays || [];
        if (excluded.includes(targetDateStr)) return null;

        const lowerSub = exam.subject ? exam.subject.toLowerCase() : '';

        if (exam.type === 'Versione') {
            if (tDate.getTime() === eDate.getTime()) {
                return { type: 'EXAM', title: `⚠ PROVA: Versione di ${exam.subject}` };
            }
            let validDates = [];
            let curr = new Date(sDate);
            while(curr.getTime() < eDate.getTime()) {
                let cStr = formatDateStr(curr);
                if (!excluded.includes(cStr)) validDates.push(cStr);
                curr.setDate(curr.getDate() + 1);
            }

            let numVersions = exam.pages || 1;
            let totalDays = validDates.length;
            if (totalDays === 0) return null;

            let assignedVersionDays = [];
            if (numVersions >= totalDays) {
                assignedVersionDays = [...validDates];
            } else {
                let step = totalDays / numVersions;
                for (let v = 0; v < numVersions; v++) {
                    let idx = Math.min(Math.floor(v * step), totalDays - 1);
                    if (!assignedVersionDays.includes(validDates[idx])) {
                        assignedVersionDays.push(validDates[idx]);
                    }
                }
            }

            if (assignedVersionDays.includes(targetDateStr)) {
                return { type: 'VERSION', title: `✍ Versione di Prova: ${exam.subject}`, amount: 1 };
            }
            return null;
        }

        if (exam.type === 'Interrogazione' && exam.specificInterrogazioneDates && exam.specificInterrogazioneDates.length > 0) {
            let intDates = [...exam.specificInterrogazioneDates].sort();

            if (intDates.includes(targetDateStr)) {
                return { type: 'EXAM', title: `⚠ POSSIBILE INTERROGAZIONE: ${exam.subject}` };
            }

            let firstDateStr = intDates[0];
            let firstDate = new Date(firstDateStr); firstDate.setHours(0,0,0,0);

            if (tDate.getTime() < firstDate.getTime()) {
                let validPreDates = [];
                let curr = new Date(sDate);
                while(curr.getTime() < firstDate.getTime()) {
                    let cStr = formatDateStr(curr);
                    if (!excluded.includes(cStr)) validPreDates.push(cStr);
                    curr.setDate(curr.getDate() + 1);
                }

                if (validPreDates.length === 0) return null;

                let totalPages = exam.pages || 1;
                let daysCount = validPreDates.length;

                let reviewDays = daysCount >= 10 ? 3 : (daysCount >= 6 ? 2 : (daysCount >= 4 ? 1 : 0));
                let studyDaysCount = Math.max(1, daysCount - reviewDays);

                let targetIdx = validPreDates.indexOf(targetDateStr);
                if (targetIdx === -1) return null;

                if (targetIdx >= studyDaysCount) {
                    return { type: 'FINAL_REVIEW', title: `📚 RIPASSO FINALE: ${exam.subject}`, desc: `Ripassa tutto il programma in vista dell'interrogazione del ${formatDateShort(firstDateStr)}` };
                }

                let basePagesPerDay = Math.floor(totalPages / studyDaysCount);
                let remainder = totalPages % studyDaysCount;
                let daily = basePagesPerDay + (targetIdx < remainder ? 1 : 0);
                if (daily < 1) daily = 1;

                return { type: 'STUDY', title: `📖 Studio (in vista di ${formatDateShort(firstDateStr)}): ${exam.subject}`, pages: daily };
            } 
            else {
                let nextExamDateStr = intDates.find(d => new Date(d).getTime() > tDate.getTime());
                if (!nextExamDateStr) return null;

                let nextExamTime = new Date(nextExamDateStr).getTime();
                let diffDays = Math.round((nextExamTime - tDate.getTime()) / (1000 * 60 * 60 * 24));

                let reviewDaysNeeded = 1;
                if (exam.pages > 50) reviewDaysNeeded = 3;
                else if (exam.pages > 25) reviewDaysNeeded = 2;

                if (diffDays <= reviewDaysNeeded && diffDays >= 1) {
                    let pagesPart = Math.ceil(exam.pages / reviewDaysNeeded);
                    return { 
                        type: 'INTER_REVIEW', 
                        title: `🔄 Ripasso Interrogazione: ${exam.subject}`, 
                        desc: `Sessione ${reviewDaysNeeded - diffDays + 1} di ${reviewDaysNeeded} (~${pagesPart} pag.) in vista del ${formatDateShort(nextExamDateStr)}` 
                    };
                }
                return null;
            }
        }

        const isPractice = (lowerSub.includes('matematica') || lowerSub.includes('fisica'));
        if (isPractice) {
            if (tDate.getTime() === eDate.getTime()) return { type: 'EXAM', title: `⚠ PROVA: ${exam.subject}` };
            return { type: 'PRACTICE', title: `📝 Esercizi: ${exam.subject}`, amount: exam.pages };
        }

        if (tDate.getTime() === eDate.getTime()) return { type: 'EXAM', title: `⚠ PROVA: ${exam.subject}` };

        let validDates = [];
        let curr = new Date(sDate);
        while(curr.getTime() < eDate.getTime()) {
            let cStr = formatDateStr(curr);
            if (!excluded.includes(cStr)) validDates.push(cStr);
            curr.setDate(curr.getDate() + 1);
        }

        let targetIndex = validDates.indexOf(targetDateStr);
        if (targetIndex === -1) return null; 

        let N = validDates.length;
        let finalReviewCount = N >= 10 ? 3 : (N >= 6 ? 2 : (N >= 4 ? 1 : 0));
        let phase1Count = Math.max(1, N - finalReviewCount);

        if (targetIndex >= phase1Count) { 
            return { type: 'FINAL_REVIEW', title: `📚 RIPASSO FINALE: ${exam.subject}`, desc: `Ripassa tutto il programma in vista della prova` }; 
        }

        let totalPages = exam.pages || 1;
        let basePerDay = Math.floor(totalPages / phase1Count);
        let rem = totalPages % phase1Count;
        let dailyPace = basePerDay + (targetIndex < rem ? 1 : 0);
        if (dailyPace < 1) dailyPace = 1;

        return { type: 'STUDY', title: `📖 STUDIO: ${exam.subject}`, pages: dailyPace };
    }

    function formatDateShort(dStr) {
        if (!dStr) return "";
        const parts = dStr.split('-');
        return `${parts[2]}/${parts[1]}`;
    }

    function getTasksForDate(dateStr) {
        const targetDateObj = new Date(dateStr); 
        let dailyTasks = [];
        let targetTime = targetDateObj.getTime();
        
        myTodos.forEach(todo => {
            let excluded = todo.excludedDays || [];
            if (excluded.includes(dateStr)) return;

            if (todo.repeat) {
                let createTime = new Date(todo.createdAt || todo.assignedDate || todayDateStr).getTime();
                let deadlineTime = new Date(todo.deadline).setHours(23,59,59,999);
                
                if (targetTime >= createTime && targetTime <= deadlineTime) {
                    dailyTasks.push({ _id: todo.id, subject: todo.subject, title: todo.title, priority: todo.priority, difficulty: todo.difficulty, isNormalTodo: true, isRepeat: true });
                }
            } else {
                let tDate = todo.assignedDate || todo.date;
                if (tDate === dateStr) {
                    dailyTasks.push({ _id: todo.id, subject: todo.subject, title: todo.title, priority: todo.priority, difficulty: todo.difficulty, isNormalTodo: true, isRepeat: false });
                }
            }
        });

        myExams.forEach(exam => {
            if(!exam.progress) exam.progress = {};
            let info = getExamDayInfo(exam, dateStr);
            if (!info) return;

            let isDoneToday = exam.progress[dateStr] !== undefined;
            let loggedToday = exam.progress[dateStr] || 0;

            if (info.type === 'EXAM') { 
                dailyTasks.push({ _id: exam.id, isExamDay: true, title: info.title, priority: 3, isExamRelated: true }); 
            } 
            else if (info.type === 'FINAL_REVIEW' || info.type === 'INTER_REVIEW') { 
                dailyTasks.push({ _id: exam.id, isExamReview: true, title: info.title, desc: info.desc || '', priority: 3, isExamRelated: true, isExamStudyObj: true }); 
            } 
            else if (info.type === 'STUDY') { 
                dailyTasks.push({ _id: exam.id, isExamStudy: true, title: info.title, priority: 3, desc: isDoneToday ? `Fatto: ${loggedToday} pag.` : `Obiettivo di oggi: ${info.pages} pag.`, pagesSuggested: info.pages, isDone: isDoneToday, loggedPages: loggedToday, isExamRelated: true, isExamStudyObj: true }); 
            }
            else if (info.type === 'PRACTICE') { 
                dailyTasks.push({ _id: exam.id, isExamStudy: true, title: info.title, priority: 3, desc: isDoneToday ? `Fatto: ${loggedToday} es.` : `Obiettivo fisso: ${info.amount} es.`, pagesSuggested: info.amount, isDone: isDoneToday, loggedPages: loggedToday, isPractice: true, isExamRelated: true, isExamStudyObj: true }); 
            }
            else if (info.type === 'VERSION') {
                dailyTasks.push({ _id: exam.id, isExamStudy: true, isVersion: true, title: info.title, priority: 3, desc: isDoneToday ? `Completata: ${loggedToday} versione` : `Oggi: svolgi 1 versione di prova`, pagesSuggested: 1, isDone: isDoneToday, loggedPages: loggedToday, isExamRelated: true, isExamStudyObj: true });
            }
        });
        
        dailyTasks.sort((a, b) => b.priority - a.priority); return dailyTasks;
    }

    function generateTasksForDate(dateStr) {
        const container = document.getElementById('exercises-container'); 
        document.getElementById('today-title').innerHTML = (dateStr === todayDateStr) ? "Oggi: Da fare" : "Piano Studio";
        container.innerHTML = '';
        const dailyTasks = getTasksForDate(dateStr);
        if (dailyTasks.length === 0) { 
            container.innerHTML = `<div style="text-align:center; padding: 40px 0;"><h3 style="color:var(--text-muted); font-weight:500;">Nessun task in programma</h3></div>`; 
            return; 
        }

        dailyTasks.forEach(task => {
            const card = document.createElement('div'); card.className = `exercise-card`;
            const setKey = `${dateStr}_${task._id}`;
            let isDoneClass = (task.isNormalTodo || task.isExamReview) && completedTasks[setKey] ? 'done' : '';
            let isTextCrossed = isDoneClass || (task.isExamStudy && task.isDone);
            
            let displayTitle = task.title;
            if (task.isNormalTodo && task.subject) {
                displayTitle = `<span style="text-decoration: underline; font-weight: 600; color: var(--theme-strong);">${task.subject}</span> :: ${task.title}`;
            }

            let diffHtml = '';
            if (task.difficulty) {
                diffHtml = `<div class="ex-diff-bars">`;
                for(let i=1; i<=3; i++) { let active = i <= task.difficulty ? 'active' : ''; diffHtml += `<div class="ex-bar ${active}" data-lvl="${i}"></div>`; }
                diffHtml += `</div>`;
            }

            let prioHtml = '';
            if (task.priority) {
                prioHtml = `<div class="ex-priority">`;
                for(let i=0; i<3; i++) { prioHtml += `<i class="fa-solid fa-star ${i < task.priority ? 'active' : ''}"></i>`; }
                prioHtml += `</div>`;
            }

            let actionButtonsHtml = '';
            if (task.isNormalTodo) {
                if (!task.isRepeat && !isDoneClass) {
                    actionButtonsHtml += `<button class="icon-btn" onclick="openSnoozeModal('${task._id}', 'todo')" title="Rimanda"><i class="fa-solid fa-clock"></i></button>`;
                }
                actionButtonsHtml += `<button class="icon-btn" onclick="openUnifiedTodoModal('${task._id}')" title="Modifica e Gestisci Task"><i class="fa-solid fa-pen-to-square"></i></button>`;
            } else if (task.isExamRelated) {
                if (task.isExamStudyObj && !task.isDone) {
                    actionButtonsHtml += `<button class="icon-btn" onclick="openSnoozeModal('${task._id}', 'exam')" title="Rimanda Studio di Oggi"><i class="fa-solid fa-clock"></i></button>`;
                }
                actionButtonsHtml += `<button class="icon-btn" onclick="openUnifiedExamModal('${task._id}')" title="Gestisci e Modifica Prova"><i class="fa-solid fa-pen-to-square"></i></button>`;
            }
            
            let html = `
            <div class="ex-header">
                <div class="ex-title" style="${isTextCrossed ? 'text-decoration: line-through; color: var(--text-muted); opacity:0.7;' : ''}">${displayTitle}</div>
                <div style="display:flex; align-items:center; gap: 4px;">
                    ${actionButtonsHtml}
                </div>
            </div>
            ${task.desc ? `<div class="ex-desc">${task.desc}</div>` : ''}
            <div class="ex-footer">
                <div class="ex-meta-row">
                    ${diffHtml ? `<div class="tag-pill" title="Carico">${diffHtml}</div>` : ''}
                    ${!task.isExamDay && prioHtml ? `<div class="tag-pill" title="Priorità">${prioHtml}</div>` : ''}
                </div>`;
            
            if(task.isExamStudy) {
                if (task.isDone) {
                    html += `<div class="ex-action" style="color:var(--theme-strong); font-weight:700; text-align:center; font-size: 0.8rem;"><i class="fa-solid fa-check-square" style="font-size:1.2rem; margin-bottom:4px;"></i><br>Completato (${task.loggedPages})</div></div>`;
                } else {
                    html += `<div class="ex-action" style="flex-direction:row; gap:6px;"><input type="number" id="pages_${task._id}" value="${task.pagesSuggested}" style="width: 55px; padding: 6px 4px; border: 2px solid var(--border-color); background:var(--surface-color); color:var(--text-main); border-radius: 8px; text-align: center; font-weight: 700; font-family: 'Poppins';"><button onclick="logExamProgress('${task._id}', '${dateStr}')" style="background:var(--theme-strong); color:var(--surface-color); border:none; padding:6px 14px; border-radius:8px; font-weight:bold; cursor:pointer; font-family: 'Poppins';">OK</button></div></div>`;
                }
            } else if (!task.isExamDay) {
                html += `<div class="ex-action"><div class="set-circle ${isDoneClass}" id="${setKey}" onclick="tickTask('${setKey}', this)"></div></div></div>`;
            }
            
            card.innerHTML = html; container.appendChild(card);
        });
    }

    let audioCtx = null;
    function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); }
    function playTone() { try { initAudio(); const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.connect(gain); gain.connect(audioCtx.destination); osc.type = 'square'; osc.frequency.setValueAtTime(400, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05); gain.gain.setValueAtTime(0.5, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05); osc.start(); osc.stop(audioCtx.currentTime + 0.05); } catch(e) {} }
    
    let toastTimeout = null;
    function showToast(text, isNegative = false) { 
        const toast = document.getElementById('xp-toast'); 
        const icon = document.getElementById('xp-toast-icon');
        document.getElementById('xp-toast-text').innerText = text; 
        
        if(isNegative) {
            toast.classList.add('negative');
            icon.className = "fa-solid fa-circle-exclamation";
        } else {
            toast.classList.remove('negative');
            icon.className = "fa-solid fa-pen-nib";
        }

        toast.classList.add('show'); 
        if (toastTimeout) clearTimeout(toastTimeout); 
        toastTimeout = setTimeout(() => toast.classList.remove('show'), 2000); 
    }

    function addXP(amount) {
        rankedData.xp += amount; if(rankedData.xp < 0) rankedData.xp = 0; localStorage.setItem('studylog_ranked', JSON.stringify(rankedData));
        xpHistory[todayDateStr] = (xpHistory[todayDateStr] || 0) + amount; if(xpHistory[todayDateStr] < 0) xpHistory[todayDateStr] = 0;
        localStorage.setItem('studylog_xp_hist', JSON.stringify(xpHistory));
        renderRankedView(); updateDashboard(); renderSheetData(); if(amount !== 0) showToast(amount > 0 ? `+${amount} XP` : `${amount} XP`, amount < 0);
    }

    window.logExamProgress = function(examId, dateStr) {
        let keyDateObj = new Date(dateStr.split('-')[0], dateStr.split('-')[1]-1, dateStr.split('-')[2]);
        let todayDateObj = new Date(todayDateStr.split('-')[0], todayDateStr.split('-')[1]-1, todayDateStr.split('-')[2]);
        
        if (keyDateObj.getTime() > todayDateObj.getTime()) { 
            showToast("Non puoi completare task future.", true); 
            return; 
        }

        const inputEl = document.getElementById(`pages_${examId}`);
        const pagesDone = parseInt(inputEl ? inputEl.value : '0');

        if (isNaN(pagesDone) || pagesDone <= 0) {
            customAlert("Inserisci un numero valido di pagine o esercizi.");
            return;
        }

        let exam = myExams.find(e => e.id === examId);
        if (!exam) return;

        if (!exam.progress) exam.progress = {};
        exam.progress[dateStr] = pagesDone;
        localStorage.setItem('studylog_exams', JSON.stringify(myExams));

        const earnedXP = Math.max(15, pagesDone * 3);

        playTone();
        addXP(earnedXP);
        calculateStreak();
        updateDashboard();
        updateAllDots();
        updateWeekSliderVisuals(selectedDateStr);
        generateTasksForDate(selectedDateStr);
        renderStreakCalendar();
        renderMonthCalendar();
        checkAndSendSmartNotification();
        showToast(`Completato! +${earnedXP} XP`);
    }

    window.tickTask = function(setKey, el) {
        const parts = setKey.split('_'); const keyDate = parts[0];
        let keyDateObj = new Date(keyDate.split('-')[0], keyDate.split('-')[1]-1, keyDate.split('-')[2]);
        let todayDateObj = new Date(todayDateStr.split('-')[0], todayDateStr.split('-')[1]-1, todayDateStr.split('-')[2]);
        
        if (keyDateObj.getTime() > todayDateObj.getTime()) { 
            showToast("Non puoi completare task future.", true); 
            return; 
        }
        
        if(completedTasks[setKey]) { 
            delete completedTasks[setKey]; el.classList.remove('done'); localStorage.setItem('studylog_completed', JSON.stringify(completedTasks)); 
            addXP(-15); calculateStreak(); updateDashboard(); updateAllDots(); updateWeekSliderVisuals(selectedDateStr); generateTasksForDate(selectedDateStr); renderStreakCalendar(); renderMonthCalendar(); 
            checkAndSendSmartNotification();
            return; 
        }
        
        completedTasks[setKey] = true; el.classList.add('done'); localStorage.setItem('studylog_completed', JSON.stringify(completedTasks)); 
        playTone(); addXP(15); calculateStreak(); updateDashboard(); updateAllDots(); updateWeekSliderVisuals(selectedDateStr); generateTasksForDate(selectedDateStr); renderStreakCalendar(); renderMonthCalendar();
        checkAndSendSmartNotification();
    }

    function init() {
        document.body.addEventListener('click', initAudio, { once: true }); 
        applySettingsUI(); 
        initAllDatePickers();
        calculateStreak(); 
        updateDashboard(); 
        initWeekSlider(); 
        generateTasksForDate(selectedDateStr); 
        renderRankedView(); 
        renderSheetData(); 
        renderHeatmap(); 
        renderStreakCalendar(); 
        renderMonthCalendar();
        
        setInterval(() => {
            checkAndSendSmartNotification();
        }, 60 * 1000);

        setTimeout(() => {
            checkAndSendSmartNotification();
        }, 1500);
    }

    function isDayStudied(dStr) {
        if(xpHistory[dStr] && xpHistory[dStr] > 0) return true;
        for (const key in completedTasks) { if (key.startsWith(dStr)) return true; }
        let hasExamProgress = false; myExams.forEach(ex => { if(ex.progress && ex.progress[dStr] > 0) hasExamProgress = true; }); return hasExamProgress;
    }

    function calculateStreak() {
        currentStreak = 0; let checkDate = new Date(); let tempStreak = 0;
        for (let i = 0; i < 365; i++) {
            let dStr = formatDateStr(checkDate); let tasksForDay = getTasksForDate(dStr); let hasTasks = tasksForDay.length > 0;
            let isPast = checkDate.setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
            let allCompleted = true;
            if (hasTasks) { tasksForDay.forEach(t => { if (!t.isExamDay && !t.isDone && !completedTasks[`${dStr}_${t._id}`]) allCompleted = false; }); }

            if (hasTasks) { if (allCompleted) tempStreak++; else if (isPast) break; } 
            else { if (isDayStudied(dStr)) tempStreak++; } checkDate.setDate(checkDate.getDate() - 1);
        }
        currentStreak = tempStreak; if(currentStreak > recordStreak) { recordStreak = currentStreak; localStorage.setItem('studylog_record_streak', recordStreak.toString()); }
    }

    function updateDashboard() {
        animateCount('dash-streak-count', currentStreak, 'gg');
        animateCount('dash-streak-record', recordStreak, '');
        animateCount('dash-xp-count', rankedData.xp, '');
        
        let tasksThisMonth = 0; const prefix = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-`;
        for (const key in completedTasks) { if (key.startsWith(prefix)) tasksThisMonth++; }
        animateCount('dash-workouts-count', tasksThisMonth, 'v');

        const dashesContainer = document.getElementById('dash-streak-dashes'); dashesContainer.innerHTML = '';
        for(let i=5; i>=0; i--) { let d = new Date(); d.setDate(d.getDate() - i); let activeClass = isDayStudied(formatDateStr(d)) ? 'active' : ''; dashesContainer.innerHTML += `<div class="streak-dash ${activeClass}"></div>`; }
    }

    let scrollTimeout;
    function initWeekSlider() {
        const slider = document.getElementById('week-slider');
        slider.innerHTML = '';
        const dayNames = ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"];
        
        let startD = new Date();
        startD.setDate(startD.getDate() - 30); 
        
        let html = '<div style="min-width: calc(50% - 22px); flex-shrink: 0;"></div>';
        for (let i = 0; i < 90; i++) { 
            const d = new Date(startD);
            d.setDate(startD.getDate() + i);
            const dateStr = formatDateStr(d);
            const isToday = dateStr === todayDateStr;
            
            html += `<div class="day-bubble ${isToday ? 'today' : ''}" id="bubble_${dateStr}" data-date="${dateStr}" onclick="clickDate('${dateStr}')">
                <span class="day-name">${dayNames[d.getDay()]}</span>
                <span class="day-num">${d.getDate()}</span>
                <div class="workout-dot" id="dot_${dateStr}"></div>
            </div>`;
        }
        html += '<div style="min-width: calc(50% - 22px); flex-shrink: 0;"></div>';
        slider.innerHTML = html;
        
        updateAllDots();
        updateWeekSliderVisuals(todayDateStr);
        
        setTimeout(() => {
            const todayBubble = document.getElementById('bubble_' + todayDateStr);
            if (todayBubble) todayBubble.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
        }, 50);

        slider.addEventListener('scroll', handleSliderScroll);
    }

    window.clickDate = function(dateStr) {
        const sel = document.getElementById('bubble_' + dateStr);
        if (sel) { sel.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
        if (selectedDateStr !== dateStr) {
            selectedDateStr = dateStr;
            updateWeekSliderVisuals(dateStr);
            generateTasksForDate(dateStr);
        }
    }

    function handleSliderScroll() {
        const slider = document.getElementById('week-slider');
        const bubbles = slider.querySelectorAll('.day-bubble');
        let closestBubble = null;
        let minDistance = Infinity;
        const sliderCenter = slider.getBoundingClientRect().left + slider.offsetWidth / 2;

        bubbles.forEach(bubble => {
            const rect = bubble.getBoundingClientRect();
            const bubbleCenter = rect.left + rect.width / 2;
            const distance = Math.abs(sliderCenter - bubbleCenter);
            if (distance < minDistance) {
                minDistance = distance;
                closestBubble = bubble;
            }
        });

        if (closestBubble) {
            const newDate = closestBubble.getAttribute('data-date');
            updateWeekSliderVisuals(newDate); 

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (selectedDateStr !== newDate) {
                    selectedDateStr = newDate;
                    generateTasksForDate(newDate);
                }
            }, 150); 
        }
    }

    function updateAllDots() {
        document.querySelectorAll('.day-bubble').forEach(b => {
            let dStr = b.getAttribute('data-date');
            let hasPending = false;
            getTasksForDate(dStr).forEach(t => {
                if(!t.isExamDay && !t.isDone && !completedTasks[`${dStr}_${t._id}`]) hasPending = true;
            });
            if (hasPending) b.classList.add('has-workout');
            else b.classList.remove('has-workout');
        });
    }

    function updateWeekSliderVisuals(activeDate) {
        document.querySelectorAll('.day-bubble').forEach(b => b.classList.remove('selected'));
        const sel = document.getElementById('bubble_' + activeDate);
        if (sel) sel.classList.add('selected');
    }

    function renderRankedView() {
        let currentRank = rankTiers[rankTiers.length - 1]; let nextRank = null;
        for (let i = 0; i < rankTiers.length; i++) { if (rankedData.xp >= rankTiers[i].minXp) { currentRank = rankTiers[i]; nextRank = rankTiers[i - 1] || null; break; } }
        document.getElementById('rank-title').innerText = currentRank.name;
        let progressPercent = nextRank ? ((rankedData.xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) * 100 : 100;
        document.getElementById('rank-xp-text').innerText = nextRank ? `XP: ${rankedData.xp.toLocaleString()} / ${nextRank.minXp.toLocaleString()}` : 'STUDIO SUPREMO';
        document.getElementById('xp-bar-fill').style.width = `${Math.min(Math.max(progressPercent, 0), 100)}%`;

        const listContainer = document.getElementById('inline-rank-list'); listContainer.innerHTML = '';
        rankTiers.forEach(rank => { const isCurrent = rankedData.xp >= rank.minXp && rankedData.xp < (rankTiers[rankTiers.indexOf(rank)-1]?.minXp || Infinity); listContainer.innerHTML += `<div class="rank-list-item ${isCurrent ? 'current-rank-item' : ''}"><div><div style="font-weight: 700; font-size: 1.1rem; color: var(--text-main);">${rank.name}</div><div style="font-size: 0.8rem; color: var(--text-muted);">${rank.minXp.toLocaleString()} XP minimi</div></div>${isCurrent ? '<i class="fa-solid fa-arrow-left-long" style="color:var(--theme-strong); font-size: 1.2rem;"></i>' : ''}</div>`; });
    }

    window.switchView = function(view, element) {
        document.querySelectorAll('.bottom-nav .nav-item').forEach(el => el.classList.remove('active')); if(element) element.classList.add('active');
        document.getElementById('study-view').style.display = view === 'study' ? 'block' : 'none';
        const focusView = document.getElementById('focus-view');
        if (focusView) focusView.style.display = view === 'focus' ? 'block' : 'none';
        document.getElementById('ranked-view').style.display = view === 'ranked' ? 'block' : 'none';
        document.getElementById('calendar-view').style.display = view === 'calendar' ? 'block' : 'none';
        if(view === 'calendar') { renderSheetData(); renderMonthCalendar(); }
        if(view === 'focus') { updateFocusTaskSelector(); updateFocusStatsUI(); updateFocusTimerUI(); }
    }

    function renderSheetData() {
        animateCount('sheet-big-streak-num', currentStreak, '');
        animateCount('sheet-total-xp', rankedData.xp, '');
        
        const streakRow = document.getElementById('streak-circles-row'); streakRow.innerHTML = '';
        const dayNamesMap = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
        let d = new Date(); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); let monday = new Date(d.setDate(diff));
        
        for(let i = 0; i < 7; i++) {
            let tempDate = new Date(monday); tempDate.setDate(monday.getDate() + i); 
            let dStr = formatDateStr(tempDate); let isPast = tempDate.setHours(0,0,0,0) < new Date().setHours(0,0,0,0); let isToday = dStr === todayDateStr;
            let tasksForDay = getTasksForDate(dStr); let hasTasks = tasksForDay.length > 0;
            let allCompleted = true;
            if (hasTasks) { tasksForDay.forEach(t => { if (!t.isExamDay && !t.isDone && !completedTasks[`${dStr}_${t._id}`]) allCompleted = false; }); }

            let circleClass = ''; let icon = '<i class="fa-solid fa-minus"></i>';
            if (!hasTasks) { if (isDayStudied(dStr)) { circleClass = 'done'; icon = '<i class="fa-solid fa-check"></i>'; } } else {
                if (allCompleted) { circleClass = 'done'; icon = '<i class="fa-solid fa-check"></i>'; } else {
                    if (isPast) { circleClass = 'missed'; icon = '<i class="fa-solid fa-xmark"></i>'; } else if (isToday) { circleClass = ''; icon = ''; }
                }
            }
            streakRow.innerHTML += `<div class="streak-circle-item"><div class="streak-circle ${circleClass}">${icon}</div><span>${dayNamesMap[tempDate.getDay()]}</span></div>`;
        }

        const chartContainer = document.getElementById('sheet-bar-chart'); chartContainer.innerHTML = '';
        let weekXP = 0; let maxXP = 100; let dataList = [];
        for(let i = 0; i < 6; i++) { let tempDate = new Date(monday); tempDate.setDate(monday.getDate() + i); let dStr = formatDateStr(tempDate); let xp = xpHistory[dStr] || 0; weekXP += xp; if(xp > maxXP) maxXP = xp; dataList.push({ name: dayNamesMap[tempDate.getDay()][0], xp: xp }); }
        
        animateCount('week-xp-total-widget', weekXP, '');
        animateCount('sheet-week-xp', weekXP, '');
        
        dataList.forEach((data) => { let h = (data.xp / maxXP) * 100; chartContainer.innerHTML += `<div class="bar-col"><div class="bar-track"><div class="bar-fill" style="height: ${h}%;"></div></div><div class="bar-label">${data.name}</div></div>`; });
    }

    function renderStreakCalendar() {
        const streakRow = document.getElementById('streak-circles-row'); 
        if(!streakRow) return;
        streakRow.innerHTML = '';
        const dayNamesMap = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
        
        let d = new Date(streakNavDate);
        const day = d.getDay(); 
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
        let monday = new Date(d.setDate(diff));
        
        let sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const monthNames = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
        const weekLabelEl = document.getElementById('streak-week-label');
        if (weekLabelEl) {
            weekLabelEl.innerText = `${monday.getDate()} ${monthNames[monday.getMonth()]} - ${sunday.getDate()} ${monthNames[sunday.getMonth()]} ${sunday.getFullYear()}`;
        }
        
        for(let i = 0; i < 7; i++) {
            let tempDate = new Date(monday); 
            tempDate.setDate(monday.getDate() + i); 
            let dStr = formatDateStr(tempDate); 
            let isPast = tempDate.setHours(0,0,0,0) < new Date().setHours(0,0,0,0); 
            let isToday = dStr === todayDateStr;
            let tasksForDay = getTasksForDate(dStr); 
            let hasTasks = tasksForDay.length > 0;
            let allCompleted = true;
            if (hasTasks) { tasksForDay.forEach(t => { if (!t.isExamDay && !t.isDone && !completedTasks[`${dStr}_${t._id}`]) allCompleted = false; }); }

            let circleClass = ''; let icon = '<i class="fa-solid fa-minus"></i>';
            if (!hasTasks) { 
                if (isDayStudied(dStr)) { circleClass = 'done'; icon = '<i class="fa-solid fa-check"></i>'; } 
            } else {
                if (allCompleted) { circleClass = 'done'; icon = '<i class="fa-solid fa-check"></i>'; } 
                else {
                    if (isPast) { circleClass = 'missed'; icon = '<i class="fa-solid fa-xmark"></i>'; } 
                    else if (isToday) { circleClass = ''; icon = ''; }
                }
            }
            streakRow.innerHTML += `<div class="streak-circle-item"><div class="streak-circle ${circleClass}">${icon}</div><span>${dayNamesMap[tempDate.getDay()]}</span><span style="font-size:0.55rem; color:var(--text-muted); font-weight:400;">${tempDate.getDate()}</span></div>`;
        }
    }
    window.changeStreakWeek = function(dir) { 
        streakNavDate.setDate(streakNavDate.getDate() + (dir * 7)); 
        renderStreakCalendar(); 
    }

    function renderMonthCalendar() {
        const grid = document.getElementById('analytics-calendar-grid'); if(!grid) return;
        const monthYearLabel = document.getElementById('cal-month-year'); const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
        const year = navDate.getFullYear(); const month = navDate.getMonth(); if(monthYearLabel) monthYearLabel.innerText = `${monthNames[month]} ${year}`;
        grid.innerHTML = `<div class="cal-day-name">Lu</div><div class="cal-day-name">Ma</div><div class="cal-day-name">Me</div><div class="cal-day-name">Gi</div><div class="cal-day-name">Ve</div><div class="cal-day-name">Sa</div><div class="cal-day-name">Do</div>`;
        const firstDayIndex = new Date(year, month, 1).getDay(); const totalDays = new Date(year, month + 1, 0).getDate();
        let offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1; 
        for (let i = 0; i < offset; i++) grid.innerHTML += `<div class="cal-cell empty"></div>`;
        const todayNoTime = new Date(new Date().setHours(0,0,0,0)).getTime();

        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${(month+1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const cellTime = new Date(year, month, day).getTime(); const isToday = cellTime === todayNoTime;
            const tasks = getTasksForDate(dateStr); let hasPending = false; let hasCompleted = false;

            tasks.forEach(t => { if(!t.isExamDay) { if(t.isDone || completedTasks[`${dateStr}_${t._id}`]) hasCompleted = true; else hasPending = true; } });
            
            let hasExamDay = false;
            myExams.forEach(e => {
                if (e.type === 'Interrogazione' && e.specificInterrogazioneDates && e.specificInterrogazioneDates.includes(dateStr)) hasExamDay = true;
                else if (e.date === dateStr) hasExamDay = true;
            });

            let statusClass = ''; if (hasExamDay) statusClass = 'has-exam'; else if (hasPending) statusClass = 'has-pending'; else if (hasCompleted && !hasPending) statusClass = 'all-done';

            let dotsHtml = '';
            const activeStudyTasks = tasks.filter(t => !t.isExamDay);
            if (hasExamDay || activeStudyTasks.length > 0) {
                dotsHtml = '<div class="cal-cell-dots">';
                let dotCount = 0;
                if (hasExamDay) {
                    dotsHtml += '<div class="cal-dot exam"></div>';
                    dotCount++;
                }
                for (let k = 0; k < activeStudyTasks.length && dotCount < 3; k++) {
                    const t = activeStudyTasks[k];
                    const isDone = t.isDone || completedTasks[`${dateStr}_${t._id}`];
                    dotsHtml += `<div class="cal-dot ${isDone ? 'done' : ''}"></div>`;
                    dotCount++;
                }
                dotsHtml += '</div>';
            }

            grid.innerHTML += `<div class="cal-cell ${isToday ? 'today' : ''} ${statusClass}" onclick="window.openDayDetails('${dateStr}')"><span class="cal-day-num">${day}</span>${dotsHtml}</div>`;
        }
    }
    window.changeMonth = function(dir) { navDate.setMonth(navDate.getMonth() + dir); renderMonthCalendar(); }

    window.openDayDetails = function(dateStr) {
        const tasks = getTasksForDate(dateStr); 
        let exactExams = [];
        myExams.forEach(e => {
            if (e.type === 'Interrogazione' && e.specificInterrogazioneDates && e.specificInterrogazioneDates.includes(dateStr)) exactExams.push(e);
            else if (e.date === dateStr) exactExams.push(e);
        });

        const contentDiv = document.getElementById('details-modal-content'); const titleDiv = document.getElementById('details-modal-title');
        const [y, m, d] = dateStr.split('-'); titleDiv.innerText = `Piano del ${d}/${m}/${y}`;
        let html = '';

        if (exactExams.length > 0) {
            html += `<h4 style="color: var(--danger-color); margin-bottom: 12px; text-transform: uppercase; font-size: 0.85rem;">⚠ Da ricordare:</h4>`;
            exactExams.forEach(ex => { html += `<div style="padding: 12px; border-radius: 12px; background: rgba(217, 83, 79, 0.05); border-left: 4px solid var(--danger-color); margin-bottom: 15px;"><div style="font-weight: 700; color: var(--text-main);">${ex.type}: ${ex.subject}</div><div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Pagine/Esercizi/Versioni tot: ${ex.pages}</div></div>`; });
        }
        if (tasks.length > 0) {
            html += `<h4 style="color: var(--theme-strong); margin-bottom: 12px; text-transform: uppercase; font-size: 0.85rem;">Data da fare:</h4>`;
            tasks.forEach(t => {
                if(t.isExamDay) return; const isDone = t.isDone || completedTasks[`${dateStr}_${t._id}`];
                let displayTitle = t.title;
                if (t.isNormalTodo && t.subject) {
                    displayTitle = `<span style="text-decoration: underline; font-weight: 600;">${t.subject}</span> :: ${t.title}`;
                }
                html += `<div style="padding: 12px 0; border-bottom: 1px dashed var(--border-color); border-top: 1px solid transparent; display: flex; align-items: center; gap: 12px; opacity: ${isDone ? '0.5' : '1'};"><div style="width: 20px; height: 20px; border: 2px solid var(--theme-strong); border-radius: 6px; background: ${isDone ? 'var(--theme-strong)' : 'transparent'}; display:flex; align-items:center; justify-content:center;">${isDone ? '<i class="fa-solid fa-check" style="color:var(--surface-color); font-size:0.7rem;"></i>' : ''}</div><div><div style="font-weight: 600; color: var(--text-main); text-decoration: ${isDone ? 'line-through' : 'none'};">${displayTitle}</div></div></div>`;
            });
        } else if (exactExams.length === 0) { html += `<div style="text-align: center; color: var(--text-muted); padding: 40px 0; font-weight: 500;">Nessun impegno previsto.</div>`; }

        contentDiv.innerHTML = html; document.getElementById('day-details-modal').classList.add('active');
    }

    function renderHeatmap() {
        const grid = document.getElementById('heatmap-grid'); if(!grid) return; grid.innerHTML = '';
        for(let i=83; i>=0; i--) { let d = new Date(); d.setDate(d.getDate() - i); let dStr = formatDateStr(d); let activeClass = isDayStudied(dStr) ? 'lvl-3' : ''; grid.innerHTML += `<div class="heat-cell ${activeClass}"></div>`; }
    }

    // --- FOCUS MODE (IN SPIRITO CURBOX) ---
    let focusMinutes = 25;
    let focusSecondsLeft = focusMinutes * 60;
    let focusInterval = null;
    let isFocusRunning = false;
    let focusTotalSeconds = focusMinutes * 60;

    let focusStats = JSON.parse(localStorage.getItem('studylog_focus_stats') || '{"totalMinutes": 0, "sessions": 0}');

    function updateFocusStatsUI() {
        const totalMinEl = document.getElementById('focus-total-minutes');
        const sessEl = document.getElementById('focus-completed-sessions');
        if (totalMinEl) totalMinEl.innerHTML = `${focusStats.totalMinutes}<span>m</span>`;
        if (sessEl) sessEl.innerText = focusStats.sessions;
    }

    window.setFocusDuration = function(minutes, btn) {
        if (isFocusRunning) {
            if (!confirm('Vuoi interrompere la sessione corrente per cambiare durata?')) return;
            clearInterval(focusInterval);
            isFocusRunning = false;
            updateFocusPlayBtnUI();
        }
        focusMinutes = minutes;
        focusTotalSeconds = minutes * 60;
        focusSecondsLeft = focusTotalSeconds;
        document.querySelectorAll('.focus-pill').forEach(p => p.classList.remove('active'));
        if (btn) btn.classList.add('active');
        updateFocusTimerUI();
    };

    function updateFocusTimerUI() {
        const min = Math.floor(focusSecondsLeft / 60);
        const sec = focusSecondsLeft % 60;
        const timeStr = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        const timeEl = document.getElementById('focus-time-text');
        if (timeEl) timeEl.innerText = timeStr;

        const labelEl = document.getElementById('focus-mode-label');
        if (labelEl) {
            if (isFocusRunning) {
                labelEl.innerText = 'IN CONCENTRAZIONE';
                labelEl.style.color = 'var(--theme-strong)';
            } else if (focusSecondsLeft < focusTotalSeconds) {
                labelEl.innerText = 'SESSIONE IN PAUSA';
                labelEl.style.color = 'var(--theme-mid)';
            } else {
                labelEl.innerText = 'STUDIO PROFONDO';
                labelEl.style.color = 'var(--text-muted)';
            }
        }

        const progressEl = document.getElementById('focus-circle-progress');
        if (progressEl) {
            const circumference = 2 * Math.PI * 82; // approx 515.22
            const fraction = (focusTotalSeconds - focusSecondsLeft) / focusTotalSeconds;
            const offset = circumference * (1 - fraction);
            progressEl.style.strokeDasharray = `${circumference}`;
            progressEl.style.strokeDashoffset = `${offset}`;
        }
    }

    function updateFocusPlayBtnUI() {
        const iconEl = document.getElementById('focus-icon-play');
        const textEl = document.getElementById('focus-text-play');
        if (!iconEl || !textEl) return;
        if (isFocusRunning) {
            iconEl.className = 'fa-solid fa-pause';
            textEl.innerText = 'Pausa';
        } else {
            iconEl.className = 'fa-solid fa-play';
            textEl.innerText = focusSecondsLeft < focusTotalSeconds ? 'Riprendi' : 'Inizia Focus';
        }
    }

    window.toggleFocusTimer = function() {
        if (isFocusRunning) {
            clearInterval(focusInterval);
            isFocusRunning = false;
            updateFocusPlayBtnUI();
        } else {
            isFocusRunning = true;
            updateFocusPlayBtnUI();
            
            const quoteEl = document.getElementById('focus-quote');
            if (quoteEl && motivationalPhrases.length > 0) {
                quoteEl.innerText = `"${motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)]}"`;
            }

            focusInterval = setInterval(() => {
                if (focusSecondsLeft > 0) {
                    focusSecondsLeft--;
                    updateFocusTimerUI();
                } else {
                    clearInterval(focusInterval);
                    isFocusRunning = false;
                    updateFocusPlayBtnUI();
                    completeFocusSession();
                }
            }, 1000);
        }
    };

    window.resetFocusTimer = function() {
        clearInterval(focusInterval);
        isFocusRunning = false;
        focusSecondsLeft = focusTotalSeconds;
        updateFocusTimerUI();
        updateFocusPlayBtnUI();
    };

    function completeFocusSession() {
        focusStats.totalMinutes += focusMinutes;
        focusStats.sessions += 1;
        localStorage.setItem('studylog_focus_stats', JSON.stringify(focusStats));
        updateFocusStatsUI();

        // Segna studio per la serie di fuoco
        if (typeof studyDays !== 'undefined') {
            studyDays[todayDateStr] = true;
            localStorage.setItem('studylog_studydays', JSON.stringify(studyDays));
            updateStreakDisplay();
        }

        // Confetti celebration
        if (typeof confetti === 'function') {
            confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });
        }

        // Award XP
        addXP(30);

        const taskSelect = document.getElementById('focus-task-select');
        const studiedSubject = taskSelect ? taskSelect.value : 'Studio';

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_NOTIFICATION',
                title: 'Sessione di Focus Completata! 🎯',
                body: `Ottimo lavoro con ${studiedSubject}! Hai completato ${focusMinutes} min di studio concentrato (+30 XP).`
            });
        }
    }

    function updateFocusTaskSelector() {
        const select = document.getElementById('focus-task-select');
        if (!select) return;
        const currentVal = select.value;
        select.innerHTML = '<option value="Studio Libero">📖 Studio Libero</option>';
        const todayTasks = getTasksForDate(todayDateStr);
        todayTasks.forEach(t => {
            if (!t.isExamDay && !t.isDone && !completedTasks[`${todayDateStr}_${t._id}`]) {
                const opt = document.createElement('option');
                opt.value = t.title;
                opt.textContent = `📝 ${t.subject ? t.subject + ' - ' : ''}${t.title}`;
                select.appendChild(opt);
            }
        });
        if (currentVal && [...select.options].some(o => o.value === currentVal)) {
            select.value = currentVal;
        }
    }

    // Android Hardware Back Button Bridge
    window.handleAndroidBackPressed = function() {
        const activeModals = document.querySelectorAll('.modal-overlay.active, .bottom-sheet-overlay.active, .choice-modal-overlay.active');
        if (activeModals.length > 0) {
            activeModals.forEach(m => m.classList.remove('active'));
            return "true";
        }
        const currentActive = document.querySelector('.bottom-nav .nav-item.active');
        if (currentActive && currentActive.id !== 'nav-study') {
            switchView('study', document.getElementById('nav-study'));
            return "true";
        }
        return "false";
    };

    window.promptHardReset = function() { document.getElementById('reset-modal').classList.add('active'); }
    window.executeHardReset = function() { localStorage.clear(); localStorage.setItem('studylog_record_streak', '0'); window.location.reload(true); }

    init();
    updateFocusStatsUI();
    updateFocusTimerUI();