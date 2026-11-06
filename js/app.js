    function generateId() { return Math.random().toString(36).substr(2, 9); }
    function formatDateStr(dateObj) { return `${dateObj.getFullYear()}-${(dateObj.getMonth()+1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`; }

    let globalNow = new Date();
    let globalTomorrow = new Date();
    globalTomorrow.setDate(globalNow.getDate() + 1);
    let todayDateStr = formatDateStr(globalNow);
    let tomorrowStr = formatDateStr(globalTomorrow);
    let selectedDateStr = todayDateStr;

    const notifCompletedPhrases = [
        "All homework done! See you tomorrow!",
        "Great study session! Till next time!",
        "All tasks completed! Way to go!",
        "Homework finished! Enjoy your rest!",
        "Great job studying today!",
        "Streak protected for today! See you tomorrow!",
        "Awesome work! See you next study session!"
    ];

    const notifNightPhrases = [
        "Late night study session, [Username]?",
        "Still awake? Knock out some homework!",
        "Can't sleep, [Username]? Review your notes!",
        "Start early and get your homework done!",
        "Finish your homework and get some rest, [Username]!"
    ];

    const notifMorningPhrases = [
        "Good morning, [Username]!",
        "Start your day with some homework!",
        "Coffee + [Course] study time?",
        "Get your homework started early, [Username]!",
        "Ready to study [Course] today?",
        "Early study session, [Username]!",
        "Time to plan your study tasks today!"
    ];

    const notifAfternoonPhrases = [
        "Time to do your homework!",
        "Time to study [Course], [Username]!",
        "Ready for your homework, [Username]?",
        "Study time! Let's get it done!",
        "Work on your [Course] homework now!",
        "Got a few minutes? Start your homework!",
        "Don't postpone your study session, [Username]!",
        "Time to study! Open your books!",
        "Hey [Username], your homework is waiting!"
    ];

    const notifEveningPhrases = [
        "Time to finish your homework, [Username]!",
        "Don't forget your homework tonight!",
        "It's getting late, finish your study tasks!",
        "Ready to finish your homework, [Username]?",
        "Complete your [Course] homework before dinner!",
        "Keep your streak alive! Finish your homework!",
        "Homework time, [Username]! Don't put it off!",
        "Finish studying today and protect your streak!"
    ];

    const notifNightUrgentPhrases = [
        "Finish your homework now, [Username]!",
        "Your homework isn't done yet, [Username]!",
        "Time is running out! Do your homework!",
        "Don't lose your streak! Study now!",
        "Finish your [Course] tasks before bed!",
        "Last chance to complete today's homework!",
        "Protect your study streak, [Username]!",
        "Still haven't finished your homework?",
        "Complete your study tasks and keep your streak!"
    ];

    const notifLateNightCriticalPhrases = [
        "HOMEWORK NOW, [USERNAME]!",
        "Midnight is almost here! Finish your homework!",
        "Save your study streak before midnight!",
        "Last chance to finish your homework today!",
        "Now or never, [Username]! Do your homework!",
        "It's VERY late! Complete your study tasks!",
        "Don't break your streak! Finish your tasks!",
        "ALMOST TOO LATE FOR HOMEWORK, [USERNAME]!",
        "Finish your [Course] homework right now!",
        "URGENT: Save your study streak tonight!"
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

    const subjectIconMap = {
        'matematica': 'fa-solid fa-calculator',
        'fisica': 'fa-solid fa-atom',
        'scienze motorie': 'fa-solid fa-person-running',
        'ed. fisica': 'fa-solid fa-person-running',
        'educazione fisica': 'fa-solid fa-person-running',
        'ginnastica': 'fa-solid fa-person-running',
        'arte': 'fa-solid fa-palette',
        'storia dell\'arte': 'fa-solid fa-palette',
        'latino': 'fa-solid fa-landmark',
        'greco': 'fa-solid fa-scroll',
        'italiano': 'fa-solid fa-book-open',
        'storia': 'fa-solid fa-hourglass-half',
        'scienze': 'fa-solid fa-flask',
        'biologia': 'fa-solid fa-dna',
        'chimica': 'fa-solid fa-flask-vial',
        'ed. civica': 'fa-solid fa-scale-balanced',
        'educazione civica': 'fa-solid fa-scale-balanced',
        'civica': 'fa-solid fa-scale-balanced',
        'diritto': 'fa-solid fa-gavel',
        'economia': 'fa-solid fa-chart-line',
        'inglese': 'fa-solid fa-earth-americas',
        'francese': 'fa-solid fa-earth-europe',
        'spagnolo': 'fa-solid fa-earth-americas',
        'tedesco': 'fa-solid fa-earth-europe',
        'lingue': 'fa-solid fa-language',
        'igcse': 'fa-solid fa-graduation-cap',
        'cdm': 'fa-solid fa-shapes',
        'filosofia': 'fa-solid fa-brain',
        'geografia': 'fa-solid fa-globe',
        'informatica': 'fa-solid fa-laptop-code',
        'musica': 'fa-solid fa-music',
        'religione': 'fa-solid fa-hands-praying',
        'disegno': 'fa-solid fa-compass-drafting',
        'tecnologia': 'fa-solid fa-microchip',
        'verifica': 'fa-solid fa-pen-to-square',
        'interrogazione': 'fa-solid fa-comments',
        'presentazione': 'fa-solid fa-person-chalkboard',
        'versione': 'fa-solid fa-pen-fancy'
    };

    function cleanSubjectName(name) {
        if (!name) return '';
        return name
            .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{200D}\u{FE0F}]/gu, '')
            .trim();
    }

    function getSubjectIcon(subjectName) {
        if (!subjectName) return 'fa-solid fa-book';
        const clean = cleanSubjectName(subjectName).toLowerCase();
        for (const [key, icon] of Object.entries(subjectIconMap)) {
            if (clean === key || clean.includes(key)) {
                return icon;
            }
        }
        return 'fa-solid fa-book';
    }

    function initOptionPopover(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        let items = options.items || [];
        let currentItem = options.defaultItem || (items[0] || "");
        let onChange = options.onChange || function(){};
        let iconClass = options.icon || "fa-solid fa-list";
        let isSubject = options.isSubject || false;

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

        function updateTriggerDisplay() {
            const txt = document.getElementById(`pop_opt_text_${containerId}`);
            if (txt) {
                const itemIcon = isSubject ? getSubjectIcon(currentItem) : (subjectIconMap[currentItem.toLowerCase()] || null);
                const iconHtml = itemIcon ? `<i class="${itemIcon}" style="margin-right: 8px; opacity: 0.85;"></i>` : '';
                txt.innerHTML = `${iconHtml}${currentItem}`;
            }
        }

        function renderOptions() {
            gridDiv.innerHTML = '';
            items.forEach(it => {
                const isSelected = it === currentItem;
                const btn = document.createElement('div');
                btn.className = `option-selector-btn ${isSelected ? 'selected' : ''}`;
                const itemIcon = isSubject ? getSubjectIcon(it) : (subjectIconMap[it.toLowerCase()] || null);
                const iconHtml = itemIcon ? `<i class="${itemIcon}" style="margin-right: 8px; width: 16px; text-align: center; opacity: 0.85;"></i>` : '';
                
                btn.innerHTML = `
                    <div style="display: flex; align-items: center;">
                        ${iconHtml}
                        <span>${it}</span>
                    </div>
                    ${isSelected ? '<i class="fa-solid fa-check"></i>' : ''}
                `;
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    pickerObj.selectOption(it);
                });
                gridDiv.appendChild(btn);
            });
        }

        if (!window.optionPickers) window.optionPickers = {};

        const pickerObj = {
            getValue: () => currentItem,
            setValue: (val) => {
                currentItem = val;
                updateTriggerDisplay();
                renderOptions();
                onChange(currentItem);
            },
            setItems: (newItems) => {
                items = newItems;
                if (!items.includes(currentItem)) currentItem = items[0] || '';
                updateTriggerDisplay();
                renderOptions();
            }
        };

        window.optionPickers[containerId] = pickerObj;

        pickerObj.selectOption = function(val) {
            currentItem = val;
            updateTriggerDisplay();
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

        updateTriggerDisplay();
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
    let rawLoadedSubjects = JSON.parse(localStorage.getItem('studylog_subjects') || JSON.stringify(defaultSubjects));
    let userSubjects = rawLoadedSubjects.map(s => cleanSubjectName(s)).filter(s => s && s.length > 0);
    if (userSubjects.length === 0) userSubjects = [...defaultSubjects];
    localStorage.setItem('studylog_subjects', JSON.stringify(userSubjects));

    function initAllDatePickers() {
        todoDatePicker = initPopoverDatePicker('todo-date-popover-container', {
            defaultDate: tomorrowStr,
            min: tomorrowStr,
            onChange: (val) => { updatePauseBounds('todo'); }
        });

        todoPausePicker = initPopoverDatePicker('todo-pause-popover-container', {
            defaultDate: todayDateStr,
            min: todayDateStr,
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
            defaultDate: todayDateStr,
            min: todayDateStr,
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
            icon: 'fa-solid fa-book-bookmark',
            isSubject: true
        });

        editTodoSubjectPicker = initOptionPopover('edit-todo-subject-popover-container', {
            items: userSubjects,
            defaultItem: userSubjects[0] || 'Matematica',
            icon: 'fa-solid fa-book-bookmark',
            isSubject: true
        });

        examSubjectPicker = initOptionPopover('exam-subject-popover-container', {
            items: userSubjects,
            defaultItem: userSubjects[0] || 'Matematica',
            icon: 'fa-solid fa-book-bookmark',
            isSubject: true,
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
            customAlert("Hai giÃ  aggiunto questa data per l'interrogazione!", "Data duplicata");
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
                todoPausePicker.setMin(todayDateStr);
                todoPausePicker.setMax(deadline || tomorrowStr);
            }
            currentTodoPauseDates = currentTodoPauseDates.filter(d => d >= todayDateStr && (!deadline || d <= deadline));
            renderPauseChips('todo');
        } else {
            const examDate = examDatePicker ? examDatePicker.getValue() : tomorrowStr;
            if (examPausePicker) {
                examPausePicker.setMin(todayDateStr);
                examPausePicker.setMax(examDate || tomorrowStr);
            }
            currentExamPauseDates = currentExamPauseDates.filter(d => d >= todayDateStr && (!examDate || d <= examDate));
            renderPauseChips('exam');
        }
    }

    window.addPauseDate = function(type) {
        const val = type === 'todo' ? (todoPausePicker ? todoPausePicker.getValue() : '') : (examPausePicker ? examPausePicker.getValue() : '');
        const maxLimit = type === 'todo' ? (todoDatePicker ? todoDatePicker.getValue() : '') : (examDatePicker ? examDatePicker.getValue() : '');
        
        if (!val || val < todayDateStr) { 
            customAlert("La data di pausa non può essere nel passato! Puoi selezionare da oggi in poi.", "Data non valida", true); 
            return; 
        }
        if (maxLimit && val > maxLimit) { 
            customAlert("La data di pausa deve essere compresa tra oggi e la scadenza!", "Intervallo non valido"); 
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
            const icon = getSubjectIcon(sub);
            container.innerHTML += `
                <div class="subject-tag-chip">
                    <i class="${icon}" style="font-size: 0.85rem; opacity: 0.85;"></i>
                    <span>${sub}</span>
                    <button type="button" class="remove-tag" onclick="removeSubjectTag(${index})"><i class="fa-solid fa-xmark"></i></button>
                </div>
            `;
        });
    }

    window.addSubjectFromSettings = function() {
        const input = document.getElementById('settings-subject-input');
        const rawVal = input.value.trim();
        const val = cleanSubjectName(rawVal);
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
            label.innerText = 'Versioni totali';
            input.placeholder = 'Es. 6';
        } else if (lowerVal.includes('matematica') || lowerVal.includes('fisica')) {
            label.innerText = 'Esercizi al giorno';
            input.placeholder = 'Es. 10';
        } else {
            label.innerText = 'Pagine totali';
            input.placeholder = 'Es. 35';
        }
    }
    
    let currentStreak = 0;
    let recordStreak = parseInt(localStorage.getItem('studylog_record_streak') || '0');
    let navDate = new Date(); let streakNavDate = new Date();

    let savedTheme = localStorage.getItem('studylog_theme') || 'light';
    let savedStyle = 'classic';

    function applySettingsUI() {
        const btnThemeLight = document.getElementById('btn-theme-light');
        const btnThemeDark = document.getElementById('btn-theme-dark');
        if (btnThemeLight && btnThemeDark) {
            btnThemeLight.classList.toggle('active-setting', savedTheme === 'light');
            btnThemeDark.classList.toggle('active-setting', savedTheme === 'dark');
        }

        document.documentElement.setAttribute('data-theme', savedTheme);
        document.documentElement.setAttribute('data-style', 'classic');

        renderSettingsSubjectTags();
        if (typeof updateWidgetSettingsUI === 'function') updateWidgetSettingsUI();
    }

    window.setAppStyle = function(style) {
        savedStyle = style;
        localStorage.setItem('studylog_style', style);
        document.documentElement.setAttribute('data-style', style);
        applySettingsUI();
        showToast(`Stile: ${style === 'pixel' ? 'Pixel (ISO-CORE)' : 'Classic'}`);
    };

    window.setAppTheme = function(theme) {
        savedTheme = theme;
        localStorage.setItem('studylog_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        applySettingsUI();
        if (typeof renderSubjectDonutChart === 'function') renderSubjectDonutChart();
        showToast(`Tema: ${theme === 'dark' ? 'Scuro' : 'Chiaro'}`);
    };

    window.toggleAppTheme = function() {
        const nextTheme = savedTheme === 'light' ? 'dark' : 'light';
        window.setAppTheme(nextTheme);
    };

    window.setAppBg = function(bg) {
        // Compatibilita' retroattiva
        applySettingsUI();
    };

    function updateNotificationBellUI() {
        const label = document.getElementById('notif-status-label');
        const badge = document.getElementById('notif-badge-count');
        if (!label) return;
        
        if (window.AndroidNative && window.AndroidNative.isNativeAndroid()) {
            const hasPerm = window.AndroidNative.hasNotificationPermission ? window.AndroidNative.hasNotificationPermission() : true;
            if (hasPerm) {
                label.innerText = "Attive";
                if(badge) badge.style.display = 'none';
            } else {
                label.innerText = "Disattivate";
                if(badge) badge.style.display = 'inline-block';
            }
            return;
        }

        if (!("Notification" in window)) {
            label.innerText = "Non supportate";
            return;
        }

        if (Notification.permission === "granted") {
            label.innerText = "Attive";
            if(badge) badge.style.display = 'none';
        } else if (Notification.permission === "denied") {
            label.innerText = "Bloccate";
            if(badge) badge.style.display = 'none';
        } else {
            label.innerText = "Disattivate";
            if(badge) badge.style.display = 'inline-block';
        }
    }

    window.handleNotificationBellClick = function(btnElement) {
        btnElement.classList.add('animate-bell');
        setTimeout(() => {
            btnElement.classList.remove('animate-bell');
        }, 500);

        if (window.AndroidNative && window.AndroidNative.isNativeAndroid()) {
            if (window.AndroidNative.requestNotificationPermission) {
                window.AndroidNative.requestNotificationPermission();
            }
            showToast("Notifiche Android collegate!");
            sendLocalNotification("Study Planner", "Le notifiche sono configurate e operative correttamente!");
            updateNotificationBellUI();
            return;
        }

        if (!("Notification" in window)) {
            customAlert("Il tuo browser o dispositivo non supporta le notifiche.");
            return;
        }

        if (Notification.permission === "granted") {
            showToast("Le notifiche sono giÃ  attive!");
            sendLocalNotification("Study Planner", "Le notifiche sono configurate e operative correttamente!");
        } else if (Notification.permission === "denied") {
            customAlert("Hai bloccato le notifiche in precedenza. Sblocca i permessi dalle impostazioni del browser.", "Permessi negati", true);
        } else {
            Notification.requestPermission().then(permission => {
                updateNotificationBellUI();
                if (permission === "granted") {
                    showToast("Notifiche attivate con successo!");
                    sendLocalNotification("Study Planner", "Grazie per aver attivato le notifiche! Ti ricorderemo di studiare.");
                    checkAndSendSmartNotification();
                } else {
                    showToast("Permesso negato.", true);
                }
            });
        }
    }

    function stripNotificationEmojis(text) {
        if (!text) return '';
        return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
    }

    function sendLocalNotification(title, body) {
        const cleanTitle = stripNotificationEmojis(title);
        const cleanBody = stripNotificationEmojis(body);
        if (window.AndroidNative && window.AndroidNative.showNotification) {
            window.AndroidNative.showNotification(cleanTitle, cleanBody);
            return;
        }

        if (!("Notification" in window) || Notification.permission !== "granted") return;
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(cleanTitle, {
                    body: cleanBody,
                    icon: '1790418729575_cutout.png',
                    badge: '1790418729575_cutout.png',
                    vibrate: [200, 100, 200]
                });
            });
        } else {
            new Notification(cleanTitle, { body: cleanBody, icon: '1790418729575_cutout.png' });
        }
    }

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function getStudentName() {
        return (localStorage.getItem('studylog_user_name') || '').trim() || 'Campione';
    }

    function checkAndSendSmartNotification() {
        const isAndroid = window.AndroidNative && window.AndroidNative.isNativeAndroid();
        if (!isAndroid && (!("Notification" in window) || Notification.permission !== "granted")) return;
        let tasks = getTasksForDate(todayDateStr);
        let actionableTasks = tasks.filter(t => !t.isExamDay);
        if (actionableTasks.length === 0) return; 

        let completedCount = 0;
        let firstCourse = "Studio";
        actionableTasks.forEach(t => {
            let setKey = `${todayDateStr}_${t._id}`;
            let isDone = false;
            if (t.isNormalTodo || t.isExamReview) {
                if (completedTasks[setKey]) isDone = true;
            } else if (t.isExamStudy || t.isPractice || t.isVersion) {
                if (t.isDone) isDone = true;
            }
            if (isDone) {
                completedCount++;
            } else if (firstCourse === "Studio" && t.subject) {
                firstCourse = cleanSubjectName(t.subject);
            }
        });

        let notifHistory = JSON.parse(localStorage.getItem('studylog_notif_history') || '{}');
        let todayHistory = notifHistory[todayDateStr] || { completedSent: false, lastMsgTime: 0 };

        const nowTime = Date.now();
        const twoHoursMs = 2 * 60 * 60 * 1000;
        const currentHour = new Date().getHours();
        const userName = getStudentName();

        if (completedCount === actionableTasks.length) {
            if (!todayHistory.completedSent) {
                let randomPraise = getRandomItem(notifCompletedPhrases);
                sendLocalNotification("Study Planner", randomPraise);
                todayHistory.completedSent = true;
                notifHistory[todayDateStr] = todayHistory;
                localStorage.setItem('studylog_notif_history', JSON.stringify(notifHistory));
            }
        } else {
            if (nowTime - (todayHistory.lastMsgTime || 0) >= twoHoursMs) {
                let phrasesPool = notifAfternoonPhrases;
                if (currentHour >= 0 && currentHour < 4) {
                    phrasesPool = notifNightPhrases;
                } else if (currentHour >= 4 && currentHour < 12) {
                    phrasesPool = notifMorningPhrases;
                } else if (currentHour >= 12 && currentHour < 16) {
                    phrasesPool = notifAfternoonPhrases;
                } else if (currentHour >= 16 && currentHour < 20) {
                    phrasesPool = notifEveningPhrases;
                } else if (currentHour >= 20 && currentHour < 22) {
                    phrasesPool = notifNightUrgentPhrases;
                } else {
                    phrasesPool = notifLateNightCriticalPhrases;
                }

                let template = getRandomItem(phrasesPool);
                let message = template
                    .replace(/\[Username\]/g, userName)
                    .replace(/\[USERNAME\]/g, userName.toUpperCase())
                    .replace(/\[Course\]/g, firstCourse);

                sendLocalNotification("Study Planner", message);
                todayHistory.lastMsgTime = nowTime;
                notifHistory[todayDateStr] = todayHistory;
                localStorage.setItem('studylog_notif_history', JSON.stringify(notifHistory));
            }
        }
    }

    // Retrocompatibilita' setAppBg
    window.setAppBg = function(bg) { applySettingsUI(); };

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
        const el = document.getElementById(id);
        if (!el) return;
        const content = el.querySelector('.bottom-sheet-content');
        if (content) {
            content.style.transform = '';
            content.style.transition = '';
        }
        el.style.opacity = '';
        el.style.transition = '';
        if (id === 'settings-sheet') {
            renderSettingsSubjectTags();
        } else if (id === 'streak-sheet') {
            streakNavDate = new Date();
            renderStreakCalendar();
        }
        el.classList.add('active');
    };

    window.closeBottomSheet = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('active');
        const content = el.querySelector('.bottom-sheet-content');
        if (content) {
            content.style.transform = '';
            content.style.transition = '';
        }
        el.style.opacity = '';
        el.style.transition = '';
    };

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
        document.getElementById('unified-modal-title').innerText = `${exam.subject} - ${exam.type}`;
        
        let labelUnit = 'pagine';
        if (exam.type === 'Versione') labelUnit = 'versioni';
        else if (exam.subject && (exam.subject.toLowerCase().includes('matematica') || exam.subject.toLowerCase().includes('fisica'))) labelUnit = 'esercizi';
        
        document.getElementById('unified-current-pages').innerText = `Totale: ${exam.pages} ${labelUnit}`;
        document.getElementById('unified-load-label').innerText = `Modifica ${labelUnit}`;

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
        document.getElementById('unified-current-pages').innerText = `Totale: ${exam.pages} ${labelUnit}`;
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
            customAlert("Non c'Ã¨ piÃ¹ tempo materiale! Questa prova/task scade domani o oggi, non puoi rimandarla ulteriormente.");
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
                return { type: 'EXAM', title: `PROVA: Versione` };
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
                return { type: 'VERSION', title: `Versione di Prova`, amount: 1 };
            }
            return null;
        }

        if (exam.type === 'Interrogazione' && exam.specificInterrogazioneDates && exam.specificInterrogazioneDates.length > 0) {
            let intDates = [...exam.specificInterrogazioneDates].sort();

            if (intDates.includes(targetDateStr)) {
                return { type: 'EXAM', title: `Possibile interrogazione` };
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

                // Principio di Sicurezza 80% prima della prima data di interrogazione
                let studyDaysCount = daysCount <= 1 ? 1 : Math.max(1, Math.round(daysCount * 0.80));

                let targetIdx = validPreDates.indexOf(targetDateStr);
                if (targetIdx === -1) return null;

                if (targetIdx >= studyDaysCount) {
                    return { 
                        type: 'FINAL_REVIEW', 
                        title: `Ripasso`, 
                        desc: `Ripasso per il ${formatDateShort(firstDateStr)}` 
                    };
                }

                let basePagesPerDay = Math.floor(totalPages / studyDaysCount);
                let remainder = totalPages % studyDaysCount;
                let daily = basePagesPerDay + (targetIdx < remainder ? 1 : 0);
                if (daily < 1) daily = 1;

                return { 
                    type: 'STUDY', 
                    title: `Studio`, 
                    pages: daily, 
                    desc: `${daily} pag.` 
                };
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
                        title: `Ripasso Interrogazione`, 
                        desc: `${reviewDaysNeeded - diffDays + 1}/${reviewDaysNeeded} - circa ${pagesPart} pag.` 
                    };
                }
                return null;
            }
        }

        const isPractice = (lowerSub.includes('matematica') || lowerSub.includes('fisica'));
        if (isPractice) {
            if (tDate.getTime() === eDate.getTime()) return { type: 'EXAM', title: `PROVA: ${exam.type || 'Scritta'}` };
            return { type: 'PRACTICE', title: `Esercizi`, amount: exam.pages };
        }

        if (tDate.getTime() === eDate.getTime()) return { type: 'EXAM', title: `PROVA: ${exam.type || 'Scritta'}` };

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
        if (N === 0) return null;

        // SCIENTIFIC PLANNING: Dunlosky et al. 2013 (Spaced Practice) + Adaptive Grade Weighting
        let subAvg = typeof getSubjectGradeAverage === 'function' ? getSubjectGradeAverage(exam.subject) : null;
        let safetyFactor = 0.80;
        let methodTip = ' • 10 min Active Recall';

        if (subAvg !== null && subAvg < 6.0) {
            // Media insufficiente: estende il buffer di consolidamento al 32% e riduce il carico per prevenire il sovraccarico
            safetyFactor = 0.68;
            methodTip = ' • Micro-richiamo guidato';
        } else if (subAvg !== null && subAvg >= 8.0) {
            safetyFactor = 0.82;
            methodTip = ' • Sintesi avanzata';
        }

        let studyDaysCount = N <= 1 ? 1 : Math.max(1, Math.round(N * safetyFactor));

        if (targetIndex >= studyDaysCount) { 
            let revNum = targetIndex - studyDaysCount + 1;
            let totRev = N - studyDaysCount;
            return { 
                type: 'FINAL_REVIEW', 
                title: `Ripasso Spaziato`, 
                desc: `Sessione ${revNum}/${totRev} • Active Recall e Simulazione domande` 
            }; 
        }

        let totalPages = exam.pages || 1;
        let basePerDay = Math.floor(totalPages / studyDaysCount);
        let rem = totalPages % studyDaysCount;
        let dailyPace = basePerDay + (targetIndex < rem ? 1 : 0);
        if (dailyPace < 1) dailyPace = 1;

        return { 
            type: 'STUDY', 
            title: `Studio Scientifico`, 
            pages: dailyPace, 
            desc: `${dailyPace} pag.${methodTip}` 
        };
    }

    function formatDateShort(dStr) {
        if (!dStr) return "";
        const parts = dStr.split('-');
        return `${parts[2]}/${parts[1]}`;
    }

    // 2. L'INTERFERENZA CONTESTUALE (Lo switch cognitivo)
    // Evita la 'massed practice' su una singola materia forzando l'alternanza tra materie diverse
    function interleaveTasksBySubject(tasks) {
        if (!tasks || tasks.length <= 1) return tasks;
        const groups = {};
        tasks.forEach(t => {
            const sub = (t.subject || 'Generale').trim().toLowerCase();
            if (!groups[sub]) groups[sub] = [];
            groups[sub].push(t);
        });

        const subjectKeys = Object.keys(groups);
        if (subjectKeys.length <= 1) return tasks;

        const interleaved = [];
        let hasRemaining = true;
        let index = 0;
        while (hasRemaining) {
            hasRemaining = false;
            for (let i = 0; i < subjectKeys.length; i++) {
                const list = groups[subjectKeys[i]];
                if (index < list.length) {
                    interleaved.push(list[index]);
                    if (index + 1 < list.length) {
                        hasRemaining = true;
                    }
                }
            }
            index++;
        }
        return interleaved;
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

            const setKey = `${dateStr}_${exam.id}`;
            let isDoneToday = (exam.progress[dateStr] !== undefined) || !!completedTasks[setKey];
            let loggedToday = exam.progress[dateStr] || 0;

            if (info.type === 'EXAM') { 
                dailyTasks.push({ _id: exam.id, isExamDay: true, title: info.title, subject: exam.subject, priority: 3, isExamRelated: true }); 
            } 
            else if (info.type === 'FINAL_REVIEW' || info.type === 'INTER_REVIEW') { 
                dailyTasks.push({ _id: exam.id, isExamReview: true, title: info.title, subject: exam.subject, desc: info.desc || '', priority: 3, isExamRelated: true, isExamStudyObj: true, isDone: isDoneToday }); 
            } 
            else if (info.type === 'STUDY') { 
                dailyTasks.push({ _id: exam.id, isExamStudy: true, title: info.title, subject: exam.subject, priority: 3, desc: isDoneToday ? `Fatto: ${loggedToday || info.pages} pag.` : `${info.pages} pag.`, pagesSuggested: info.pages, isDone: isDoneToday, loggedPages: loggedToday || info.pages, isExamRelated: true, isExamStudyObj: true }); 
            }
            else if (info.type === 'PRACTICE') { 
                dailyTasks.push({ _id: exam.id, isExamStudy: true, title: info.title, subject: exam.subject, priority: 3, desc: isDoneToday ? `Fatto: ${loggedToday || info.amount} es.` : `${info.amount} es.`, pagesSuggested: info.amount, isDone: isDoneToday, loggedPages: loggedToday || info.amount, isPractice: true, isExamRelated: true, isExamStudyObj: true }); 
            }
            else if (info.type === 'VERSION') {
                dailyTasks.push({ _id: exam.id, isExamStudy: true, isVersion: true, title: info.title, subject: exam.subject, priority: 3, desc: isDoneToday ? `Completata: 1 versione` : `1 versione`, pagesSuggested: 1, isDone: isDoneToday, loggedPages: loggedToday || 1, isExamRelated: true, isExamStudyObj: true });
            }
        });
        
        dailyTasks.sort((a, b) => (b.priority || 1) - (a.priority || 1));
        return interleaveTasksBySubject(dailyTasks);
    }

    function renderGoalGradient(dateStr, dailyTasks) {
        const goalBox = document.getElementById('goal-gradient-box');
        if (!goalBox) return;

        let totalActionable = 0;
        let doneCount = 0;

        dailyTasks.forEach(task => {
            if (task.isExamDay) return;
            totalActionable++;
            const setKey = `${dateStr}_${task._id}`;
            const isDone = ((task.isNormalTodo || task.isExamReview) && completedTasks[setKey]) || (task.isExamStudy && task.isDone);
            if (isDone) doneCount++;
        });

        if (totalActionable === 0) {
            goalBox.style.display = 'none';
            goalBox.innerHTML = '';
            return;
        }

        goalBox.style.display = 'block';
        const percent = Math.round((doneCount / totalActionable) * 100);
        const remaining = totalActionable - doneCount;
        const isAllDone = doneCount === totalActionable;

        let captionText = '';
        if (isAllDone) {
            captionText = "Tutti i compiti completati! Ottimo lavoro, serie protetta!";
        } else if (remaining === 1) {
            captionText = "Manca solo 1 compito per completare la giornata!";
        } else {
            captionText = `Mancano ${remaining} compiti per completare la giornata.`;
        }

        goalBox.innerHTML = `
            <div class="goal-gradient-card ${isAllDone ? 'completed' : ''}">
                <div class="goal-gradient-top">
                    <span class="goal-gradient-title">
                        <i class="fa-solid ${isAllDone ? 'fa-circle-check' : 'fa-list-check'}"></i>
                        Progresso: ${doneCount} di ${totalActionable}
                    </span>
                    <span class="goal-gradient-percent">${percent}%</span>
                </div>
                <div class="goal-gradient-track">
                    <div class="goal-gradient-bar" style="width: ${percent}%;"></div>
                </div>
                <div class="goal-gradient-caption">${captionText}</div>
            </div>
        `;
    }

    let confettiActive = false;
    function launchConfetti() {
        const canvas = document.getElementById('celebration-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = savedStyle === 'pixel' 
            ? ['#38BDF8', '#0284C7', '#F43F5E', '#F59E0B', '#10B981']
            : ['#222222', '#777777', '#CCCCCC', '#EAEAEA', '#555555'];

        const particles = [];
        for (let i = 0; i < 70; i++) {
            particles.push({
                x: canvas.width * 0.5 + (Math.random() - 0.5) * 120,
                y: canvas.height * 0.35 + (Math.random() - 0.5) * 60,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() * -10) - 4,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                opacity: 1
            });
        }

        confettiActive = true;
        canvas.style.display = 'block';
        const startTime = Date.now();
        function animate() {
            if (!confettiActive) return;
            const elapsed = Date.now() - startTime;
            if (elapsed > 2500) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                confettiActive = false;
                canvas.style.display = 'none';
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.35;
                p.rotation += p.rotationSpeed;
                p.opacity = Math.max(0, 1 - (elapsed / 2500));

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = p.color;
                if (savedStyle === 'pixel') {
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                } else {
                    ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
                }
                ctx.restore();
            });

            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }

    function playCelebrationFanfare() {
        try {
            initAudio();
            const notes = [261.63, 329.63, 392.00, 523.25];
            notes.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = savedStyle === 'pixel' ? 'square' : 'triangle';
                const startTime = audioCtx.currentTime + (idx * 0.08);
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0.25, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
                osc.start(startTime);
                osc.stop(startTime + 0.3);
            });
        } catch(e) {}
    }

    function triggerPeakEndCelebration() {
        playCelebrationFanfare();
        if (navigator.vibrate) {
            try { navigator.vibrate([100, 50, 150, 50, 200]); } catch(e) {}
        }
        showToast("Tutti i compiti completati! Ottimo lavoro!");
        launchConfetti();
    }

    function checkDayCompletionCelebration(dateStr) {
        if (dateStr !== todayDateStr) return;
        const dailyTasks = getTasksForDate(dateStr);
        let totalActionable = 0;
        let doneCount = 0;
        dailyTasks.forEach(task => {
            if (task.isExamDay) return;
            totalActionable++;
            const setKey = `${dateStr}_${task._id}`;
            const isDone = ((task.isNormalTodo || task.isExamReview) && completedTasks[setKey]) || (task.isExamStudy && task.isDone);
            if (isDone) doneCount++;
        });

        if (totalActionable > 0 && doneCount === totalActionable) {
            triggerPeakEndCelebration();
        }
    }

    function generateTasksForDate(dateStr) {
        const container = document.getElementById('exercises-container'); 
        document.getElementById('today-title').innerHTML = (dateStr === todayDateStr) ? "Oggi" : formatDateShort(dateStr);
        container.innerHTML = '';
        const dailyTasks = getTasksForDate(dateStr);
        if (dateStr === todayDateStr) {
            syncAndroidWidget();
        }
        if (dailyTasks.length === 0) { 
            renderGoalGradient(dateStr, []);
            container.innerHTML = `<div style="text-align:center; padding: 40px 0;"><h3 style="color:var(--text-muted); font-weight:500;">Nessuna task</h3></div>`; 
            return; 
        }

        renderGoalGradient(dateStr, dailyTasks);

        dailyTasks.forEach(task => {
            const card = document.createElement('div'); card.className = `exercise-card`;
            const setKey = `${dateStr}_${task._id}`;
            let isDoneClass = (task.isNormalTodo || task.isExamReview) && completedTasks[setKey] ? 'done' : '';
            let isTextCrossed = isDoneClass || (task.isExamStudy && task.isDone);
            
            let displayTitle = task.title;
            if (task.subject) {
                const subIcon = getSubjectIcon(task.subject);
                displayTitle = `<span class="task-subject-tag"><i class="${subIcon}"></i> ${task.subject}</span> ${task.title}`;
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
                    ${!task.isExamDay && prioHtml ? `<div class="tag-pill" title="PrioritÃ ">${prioHtml}</div>` : ''}
                </div>`;
            
            if(task.isExamStudy) {
                if (task.isDone) {
                    html += `<div class="ex-action" style="cursor:pointer;" onclick="undoExamProgress('${task._id}', '${dateStr}')" title="Clicca per annullare il completamento">
                                <div style="color:var(--theme-strong); font-weight:700; text-align:center; font-size: 0.8rem;">
                                    <i class="fa-solid fa-square-check" style="font-size:1.3rem; margin-bottom:2px;"></i><br>${task.loggedPages}
                                </div>
                             </div></div>`;
                } else {
                    html += `<div class="ex-action" style="flex-direction:row; gap:6px;">
                                <input type="number" id="pages_${task._id}" value="${task.pagesSuggested}" style="width: 55px; padding: 6px 4px; border: 2px solid var(--border-color); background:var(--surface-color); color:var(--text-main); border-radius: 8px; text-align: center; font-weight: 700; font-family: 'Poppins';">
                                <button onclick="logExamProgress('${task._id}', '${dateStr}')" style="background:var(--theme-strong); color:var(--surface-color); border:none; padding:6px 14px; border-radius:8px; font-weight:bold; cursor:pointer; font-family: 'Poppins';">Compi</button>
                             </div></div>`;
                }
            } else if (!task.isExamDay) {
                html += `<div class="ex-action"><div class="set-circle ${isDoneClass}" id="${setKey}" onclick="tickTask('${setKey}', this)"></div></div></div>`;
            }
            
            card.innerHTML = html; container.appendChild(card);
        });
    }

    let toneAudioCtx = null;
    function initAudio() { if (!toneAudioCtx) toneAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (toneAudioCtx.state === 'suspended') toneAudioCtx.resume(); }
    function playTone() { try { initAudio(); const osc = toneAudioCtx.createOscillator(); const gain = toneAudioCtx.createGain(); osc.connect(gain); gain.connect(toneAudioCtx.destination); osc.type = 'square'; osc.frequency.setValueAtTime(400, toneAudioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(800, toneAudioCtx.currentTime + 0.05); gain.gain.setValueAtTime(0.5, toneAudioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, toneAudioCtx.currentTime + 0.05); osc.start(); osc.stop(toneAudioCtx.currentTime + 0.05); } catch(e) {} }
    
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

    window.undoExamProgress = function(examId, dateStr) {
        let exam = myExams.find(e => e.id === examId);
        let pagesDone = 0;
        if (exam && exam.progress && exam.progress[dateStr] !== undefined) {
            pagesDone = exam.progress[dateStr];
            delete exam.progress[dateStr];
            localStorage.setItem('studylog_exams', JSON.stringify(myExams));
            const earnedXP = Math.max(15, pagesDone * 3);
            addXP(-earnedXP);
        }
        const setKey = `${dateStr}_${examId}`;
        if (completedTasks[setKey]) {
            delete completedTasks[setKey];
            localStorage.setItem('studylog_completed', JSON.stringify(completedTasks));
        }
        calculateStreak();
        updateDashboard();
        updateAllDots();
        updateWeekSliderVisuals(selectedDateStr);
        generateTasksForDate(selectedDateStr);
        renderStreakCalendar();
        renderMonthCalendar();
        checkAndSendSmartNotification();
        syncAndroidWidget();
        showToast("Progresso annullato");
    };

    window.logExamProgress = function(examId, dateStr) {
        let keyDateObj = new Date(dateStr.split('-')[0], dateStr.split('-')[1]-1, dateStr.split('-')[2]);
        let todayDateObj = new Date(todayDateStr.split('-')[0], todayDateStr.split('-')[1]-1, todayDateStr.split('-')[2]);
        
        if (keyDateObj.getTime() < todayDateObj.getTime()) {
            showToast("Non puoi completare task di giorni passati.", true);
            return;
        }

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

        const setKey = `${dateStr}_${examId}`;
        completedTasks[setKey] = true;
        localStorage.setItem('studylog_completed', JSON.stringify(completedTasks));

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
        syncAndroidWidget();
        showToast(`Completato! +${earnedXP} XP`);
        checkDayCompletionCelebration(selectedDateStr);
    };

    window.tickTask = function(setKey, el) {
        const parts = setKey.split('_'); const keyDate = parts[0];
        let keyDateObj = new Date(keyDate.split('-')[0], keyDate.split('-')[1]-1, keyDate.split('-')[2]);
        let todayDateObj = new Date(todayDateStr.split('-')[0], todayDateStr.split('-')[1]-1, todayDateStr.split('-')[2]);
        
        if (keyDateObj.getTime() < todayDateObj.getTime()) {
            showToast("Non puoi completare task di giorni passati.", true);
            return;
        }

        if (keyDateObj.getTime() > todayDateObj.getTime()) { 
            showToast("Non puoi completare task future.", true); 
            return; 
        }
        
        if(completedTasks[setKey]) { 
            delete completedTasks[setKey]; el.classList.remove('done'); localStorage.setItem('studylog_completed', JSON.stringify(completedTasks)); 
            addXP(-15); calculateStreak(); updateDashboard(); updateAllDots(); updateWeekSliderVisuals(selectedDateStr); generateTasksForDate(selectedDateStr); renderStreakCalendar(); renderMonthCalendar(); 
            checkAndSendSmartNotification();
            syncAndroidWidget();
            return; 
        }
        
        completedTasks[setKey] = true; el.classList.add('done'); localStorage.setItem('studylog_completed', JSON.stringify(completedTasks)); 
        playTone(); addXP(15); calculateStreak(); updateDashboard(); updateAllDots(); updateWeekSliderVisuals(selectedDateStr); generateTasksForDate(selectedDateStr); renderStreakCalendar(); renderMonthCalendar();
        checkAndSendSmartNotification();
        syncAndroidWidget();
        checkDayCompletionCelebration(selectedDateStr);
    }

    let currentWidgetTheme = localStorage.getItem('studylog_widget_theme') || 'dark';
    let currentWidgetTransparency = parseInt(localStorage.getItem('studylog_widget_transparency') || '0');

    window.setWidgetTheme = function(theme) {
        currentWidgetTheme = theme;
        localStorage.setItem('studylog_widget_theme', theme);
        updateWidgetSettingsUI();
        if (window.AndroidNative && typeof window.AndroidNative.setWidgetSettings === 'function') {
            window.AndroidNative.setWidgetSettings(currentWidgetTheme, currentWidgetTransparency);
        }
        syncAndroidWidget();
        showToast(`Widget impostato su: ${theme === 'dark' ? 'Scuro' : 'Chiaro'}`);
    };

    window.onWidgetTransparencySlider = function(val) {
        const intVal = Math.max(0, Math.min(100, parseInt(val) || 0));
        currentWidgetTransparency = intVal;
        localStorage.setItem('studylog_widget_transparency', intVal.toString());
        const lbl = document.getElementById('widget-trans-val');
        if (lbl) lbl.innerText = `${intVal}%`;
        if (window.AndroidNative && typeof window.AndroidNative.setWidgetSettings === 'function') {
            window.AndroidNative.setWidgetSettings(currentWidgetTheme, currentWidgetTransparency);
        }
        syncAndroidWidget();
    };

    window.setWidgetSettingsFromNative = function(theme, trans) {
        if (theme) {
            currentWidgetTheme = theme;
            localStorage.setItem('studylog_widget_theme', theme);
        }
        if (typeof trans === 'number') {
            currentWidgetTransparency = trans;
            localStorage.setItem('studylog_widget_transparency', trans.toString());
        }
        updateWidgetSettingsUI();
    };

    function updateWidgetSettingsUI() {
        const btnDark = document.getElementById('btn-widget-theme-dark');
        const btnLight = document.getElementById('btn-widget-theme-light');
        if (btnDark && btnLight) {
            btnDark.classList.toggle('selected', currentWidgetTheme === 'dark');
            btnLight.classList.toggle('selected', currentWidgetTheme === 'light');
        }
        const slider = document.getElementById('widget-trans-slider');
        const lbl = document.getElementById('widget-trans-val');
        if (slider) slider.value = currentWidgetTransparency;
        if (lbl) lbl.innerText = `${currentWidgetTransparency}%`;
    }

    window.syncFromNativeWidget = function(completedJsonStr) {
        if (!completedJsonStr) return;
        try {
            const nativeCompleted = typeof completedJsonStr === 'string' ? JSON.parse(completedJsonStr) : completedJsonStr;
            let changed = false;
            let examsModified = false;

            for (const [key, val] of Object.entries(nativeCompleted)) {
                const parts = key.split('_');
                const taskDate = parts[0];
                const taskId = parts[1];
                const exam = myExams.find(e => e.id === taskId);

                if (completedTasks[key] !== val) {
                    if (val) {
                        completedTasks[key] = true;
                        if (exam) {
                            if (!exam.progress) exam.progress = {};
                            if (exam.progress[taskDate] === undefined) {
                                const info = getExamDayInfo(exam, taskDate);
                                const pagesDone = (info && (info.pages || info.amount)) ? (info.pages || info.amount) : 1;
                                exam.progress[taskDate] = pagesDone;
                                examsModified = true;
                                const earnedXP = Math.max(15, pagesDone * 3);
                                addXP(earnedXP);
                            }
                        }
                    } else {
                        delete completedTasks[key];
                        if (exam && exam.progress && exam.progress[taskDate] !== undefined) {
                            const pagesDone = exam.progress[taskDate];
                            delete exam.progress[taskDate];
                            examsModified = true;
                            const earnedXP = Math.max(15, pagesDone * 3);
                            addXP(-earnedXP);
                        }
                    }
                    changed = true;
                }
            }
            if (changed) {
                localStorage.setItem('studylog_completed', JSON.stringify(completedTasks));
                if (examsModified) {
                    localStorage.setItem('studylog_exams', JSON.stringify(myExams));
                }
                calculateStreak();
                updateDashboard();
                updateAllDots();
                updateWeekSliderVisuals(selectedDateStr);
                generateTasksForDate(selectedDateStr);
                renderStreakCalendar();
                renderMonthCalendar();
            }
        } catch(e) {
            console.warn('syncFromNativeWidget error:', e);
        }
    };

    function syncAndroidWidget() {
        try {
            if (window.AndroidNative) {
                const todayTasks = getTasksForDate(todayDateStr).filter(t => !t.isExamDay);
                const widgetTasks = todayTasks.map(t => {
                    const setKey = `${todayDateStr}_${t._id}`;
                    const cleanSub = t.subject ? cleanSubjectName(t.subject) : '';
                    const isDone = !!(completedTasks[setKey] || t.isDone);

                    let title = t.title || '';
                    let subtitle = '';

                    if (t.isNormalTodo) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = t.title || '';
                        title = tempDiv.textContent || tempDiv.innerText || t.title;

                        const details = [];
                        if (t.difficulty) {
                            const diffLabels = ['', 'Carico leggero', 'Carico medio', 'Carico alto'];
                            details.push(diffLabels[t.difficulty] || '');
                        }
                        if (t.priority && t.priority > 1) {
                            details.push(t.priority === 3 ? 'Priorita alta' : 'Priorita media');
                        }
                        if (t.isRepeat) {
                            details.push('Ricorrente');
                        }
                        subtitle = details.filter(Boolean).join(' • ');
                        if (isDone) {
                            subtitle = subtitle ? `Completato • ${subtitle}` : 'Completato';
                        }
                    } else if (t.isExamStudy) {
                        if (t.isPractice) {
                            title = `Esercizi: ${t.pagesSuggested || 1} es.`;
                            subtitle = isDone ? `Fatti ${t.loggedPages || t.pagesSuggested} esercizi` : `Obiettivo: ${t.pagesSuggested || 1} esercizi`;
                        } else if (t.isVersion) {
                            title = `Versione di prova`;
                            subtitle = isDone ? `Completata 1 versione` : `Svolgi 1 versione per la prova`;
                        } else {
                            title = `Studio: ${t.pagesSuggested || 1} pagine`;
                            subtitle = isDone ? `Completate ${t.loggedPages || t.pagesSuggested} pagine` : `Quota 80% sicurezza: ${t.pagesSuggested || 1} pag. oggi`;
                        }
                    } else if (t.isExamReview) {
                        title = `Ripasso Consolidato`;
                        subtitle = isDone ? `Ripasso completato` : (t.desc || `Margine di sicurezza 80%: consolidamento`);
                    }

                    return {
                        id: t._id,
                        setKey: setKey,
                        title: title,
                        subtitle: subtitle,
                        subject: cleanSub,
                        isDone: isDone
                    };
                });

                if (typeof window.AndroidNative.updateWidgetTasks === 'function') {
                    window.AndroidNative.updateWidgetTasks(JSON.stringify(widgetTasks), JSON.stringify(completedTasks));
                }

                if (typeof window.AndroidNative.updateWidgetData === 'function') {
                    const pendingTasks = todayTasks.filter(t => !t.isDone && !completedTasks[`${todayDateStr}_${t._id}`]);
                    let summaryText = "";
                    if (todayTasks.length === 0) {
                        summaryText = "Nessuna task per oggi";
                    } else if (pendingTasks.length === 0) {
                        summaryText = "Tutte le task completate!";
                    } else {
                        const firstSub = pendingTasks[0].subject || "Studio";
                        summaryText = `${pendingTasks.length} da completare (${cleanSubjectName(firstSub)})`;
                    }
                    window.AndroidNative.updateWidgetData(currentStreak || 0, summaryText);
                }
            }
        } catch(err) {
            console.warn('Android widget sync error:', err);
        }
    }

    function initBottomSheetDrag() {
        const sheets = document.querySelectorAll('.bottom-sheet-overlay');
        sheets.forEach(overlay => {
            const content = overlay.querySelector('.bottom-sheet-content');
            const handle = overlay.querySelector('.sheet-handle');
            if (!content) return;

            let startY = 0;
            let currentY = 0;
            let isDragging = false;

            const onTouchStart = (e) => {
                if (content.scrollTop > 5 && e.target !== handle) return;
                startY = e.touches[0].clientY;
                currentY = startY;
                isDragging = true;
                content.style.transition = 'none';
            };

            const onTouchMove = (e) => {
                if (!isDragging) return;
                currentY = e.touches[0].clientY;
                const deltaY = currentY - startY;
                if (deltaY > 0) {
                    content.style.transform = `translateY(${deltaY}px)`;
                    overlay.style.opacity = Math.max(0.15, 1 - (deltaY / 400));
                    if (e.cancelable && (e.target === handle || content.scrollTop <= 0)) {
                        e.preventDefault();
                    }
                } else {
                    content.style.transform = `translateY(${deltaY * 0.15}px)`;
                }
            };

            const onTouchEnd = () => {
                if (!isDragging) return;
                isDragging = false;
                const deltaY = currentY - startY;

                content.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
                overlay.style.transition = 'opacity 0.25s ease';

                if (deltaY > 90) {
                    content.style.transform = 'translateY(100%)';
                    overlay.style.opacity = '0';
                    setTimeout(() => {
                        closeBottomSheet(overlay.id);
                        content.style.transform = '';
                        content.style.transition = '';
                        overlay.style.opacity = '';
                        overlay.style.transition = '';
                    }, 260);
                } else {
                    content.style.transform = 'translateY(0)';
                    overlay.style.opacity = '1';
                    setTimeout(() => {
                        content.style.transform = '';
                        content.style.transition = '';
                        overlay.style.opacity = '';
                        overlay.style.transition = '';
                    }, 280);
                }
            };

            if (handle) {
                handle.addEventListener('touchstart', onTouchStart, { passive: false });
                handle.addEventListener('touchmove', onTouchMove, { passive: false });
                handle.addEventListener('touchend', onTouchEnd, { passive: true });
            }
            content.addEventListener('touchstart', onTouchStart, { passive: true });
            content.addEventListener('touchmove', onTouchMove, { passive: false });
            content.addEventListener('touchend', onTouchEnd, { passive: true });
        });
    }

    function initTaskSwipeNavigation() {
        const target = document.getElementById('exercises-container');
        if (!target) return;

        let startX = 0;
        let startY = 0;
        let deltaX = 0;
        let deltaY = 0;
        let isHorizontalSwipe = false;
        let isVerticalScroll = false;

        const onTouchStart = (e) => {
            if (e.touches.length !== 1) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            deltaX = 0;
            deltaY = 0;
            isHorizontalSwipe = false;
            isVerticalScroll = false;
            target.style.transition = 'none';
        };

        const onTouchMove = (e) => {
            if (isVerticalScroll || e.touches.length !== 1) return;
            deltaX = e.touches[0].clientX - startX;
            deltaY = e.touches[0].clientY - startY;

            if (!isHorizontalSwipe && !isVerticalScroll) {
                if (Math.abs(deltaY) > 12 && Math.abs(deltaY) > Math.abs(deltaX)) {
                    isVerticalScroll = true;
                    return;
                } else if (Math.abs(deltaX) > 14 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
                    isHorizontalSwipe = true;
                }
            }

            if (isHorizontalSwipe) {
                if (e.cancelable) e.preventDefault();
                target.style.transform = `translateX(${deltaX * 0.32}px)`;
                target.style.opacity = Math.max(0.65, 1 - Math.abs(deltaX) / 380);
            }
        };

        const onTouchEnd = () => {
            if (!isHorizontalSwipe) {
                target.style.transform = '';
                target.style.opacity = '';
                return;
            }

            target.style.transition = 'transform 0.22s ease-out, opacity 0.22s ease-out';
            const threshold = 45;

            if (deltaX < -threshold) {
                target.style.transform = 'translateX(-35px)';
                target.style.opacity = '0';
                setTimeout(() => {
                    navigateDayOffset(1);
                    target.style.transition = 'none';
                    target.style.transform = 'translateX(35px)';
                    setTimeout(() => {
                        target.style.transition = 'transform 0.22s ease-out, opacity 0.22s ease-out';
                        target.style.transform = '';
                        target.style.opacity = '1';
                    }, 20);
                }, 120);
            } else if (deltaX > threshold) {
                target.style.transform = 'translateX(35px)';
                target.style.opacity = '0';
                setTimeout(() => {
                    navigateDayOffset(-1);
                    target.style.transition = 'none';
                    target.style.transform = 'translateX(-35px)';
                    setTimeout(() => {
                        target.style.transition = 'transform 0.22s ease-out, opacity 0.22s ease-out';
                        target.style.transform = '';
                        target.style.opacity = '1';
                    }, 20);
                }, 120);
            } else {
                target.style.transform = '';
                target.style.opacity = '1';
            }
            isHorizontalSwipe = false;
        };

        target.addEventListener('touchstart', onTouchStart, { passive: true });
        target.addEventListener('touchmove', onTouchMove, { passive: false });
        target.addEventListener('touchend', onTouchEnd, { passive: true });

        const todayTitle = document.getElementById('today-title');
        if (todayTitle) {
            todayTitle.addEventListener('touchstart', onTouchStart, { passive: true });
            todayTitle.addEventListener('touchmove', onTouchMove, { passive: false });
            todayTitle.addEventListener('touchend', onTouchEnd, { passive: true });
        }
    }

    function navigateDayOffset(offset) {
        const parts = selectedDateStr.split('-');
        const cur = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        cur.setDate(cur.getDate() + offset);
        const newStr = formatDateStr(cur);
        clickDate(newStr);
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
        renderSubjectDonutChart();
        initBottomSheetDrag();
        initTaskSwipeNavigation();
        syncAndroidWidget();
        checkOnboarding(); renderGradesView(); updateGeminiKeyStatusUI();
        
        setInterval(() => {
            checkAndSendSmartNotification();
        }, 60 * 1000);

        setTimeout(() => {
            checkAndSendSmartNotification();
        }, 1500);
    }

    function checkOnboarding() {
        const hasCompleted = localStorage.getItem('studylog_onboarding_done');
        const nameInput = document.getElementById('settings-user-name');
        const savedName = localStorage.getItem('studylog_user_name') || '';

        if (nameInput) nameInput.value = savedName;

        if (!hasCompleted && !savedName) {
            setTimeout(() => {
                const modal = document.getElementById('onboarding-modal');
                if (modal) modal.classList.add('active');
            }, 600);
        }
    }

    window.finishOnboarding = function() {
        const name = (document.getElementById('onboarding-name')?.value || '').trim();

        if (!name) {
            customAlert("Inserisci il tuo nome per continuare.", "Nome richiesto");
            return;
        }

        localStorage.setItem('studylog_user_name', name);
        localStorage.setItem('studylog_onboarding_done', 'true');

        if (window.AndroidNative && typeof window.AndroidNative.setUserProfile === 'function') {
            window.AndroidNative.setUserProfile(name, 0, '');
        }

        const nameInput = document.getElementById('settings-user-name');
        if (nameInput) nameInput.value = name;

        const modal = document.getElementById('onboarding-modal');
        if (modal) modal.classList.remove('active');

        showToast(`Benvenuto, ${name}!`);
        sendLocalNotification("Study Planner", `Benvenuto ${name}! Pronto a conquistare la tua serie di studio?`);
    };

    window.saveUserProfileFromSettings = function() {
        const name = (document.getElementById('settings-user-name')?.value || '').trim();

        if (!name) {
            customAlert("Il nome non puo' essere vuoto.", "Nome richiesto");
            return;
        }

        localStorage.setItem('studylog_user_name', name);

        if (window.AndroidNative && typeof window.AndroidNative.setUserProfile === 'function') {
            window.AndroidNative.setUserProfile(name, 0, '');
        }

        showToast("Nome aggiornato!");
    };

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
        
        syncAndroidWidget();
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
        closeMallowVoiceOverlay();
        document.querySelectorAll('.bottom-nav .nav-item').forEach(el => el.classList.remove('active')); if(element) element.classList.add('active');
        document.getElementById('study-view').style.display = view === 'study' ? 'block' : 'none';
        document.getElementById('ranked-view').style.display = view === 'ranked' ? 'block' : 'none';
        document.getElementById('calendar-view').style.display = view === 'calendar' ? 'block' : 'none';
        let gradesView = document.getElementById('grades-view');
        if (gradesView) gradesView.style.display = view === 'grades' ? 'block' : 'none';
        if(view === 'calendar') { renderSheetData(); renderMonthCalendar(); renderSubjectDonutChart(); }
        if(view === 'grades') { renderGradesView(); }
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
    window.changeMonth = function(dir) { navDate.setMonth(navDate.getMonth() + dir); renderMonthCalendar(); renderSubjectDonutChart(); }

    window.openDayDetails = function(dateStr) {
        const tasks = getTasksForDate(dateStr); 
        let exactExams = [];
        myExams.forEach(e => {
            if (e.type === 'Interrogazione' && e.specificInterrogazioneDates && e.specificInterrogazioneDates.includes(dateStr)) exactExams.push(e);
            else if (e.date === dateStr) exactExams.push(e);
        });

        const contentDiv = document.getElementById('details-modal-content'); const titleDiv = document.getElementById('details-modal-title');
        const [y, m, d] = dateStr.split('-'); titleDiv.innerText = `${d}/${m}/${y}`;
        let html = '';

        if (exactExams.length > 0) {
            html += `<h4 style="color: var(--danger-color); margin-bottom: 12px; text-transform: uppercase; font-size: 0.85rem;"><i class="fa-solid fa-triangle-exclamation"></i> Da ricordare:</h4>`;
            exactExams.forEach(ex => { 
                const subIcon = getSubjectIcon(ex.subject);
                html += `<div style="padding: 12px; border-radius: 12px; background: rgba(217, 83, 79, 0.05); border-left: 4px solid var(--danger-color); margin-bottom: 15px;"><div style="font-weight: 700; color: var(--text-main);"><span class="task-subject-tag"><i class="${subIcon}"></i> ${ex.subject}</span> ${ex.type}</div><div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Pagine/Esercizi/Versioni tot: ${ex.pages}</div></div>`; 
            });
        }
        if (tasks.length > 0) {
            html += `<h4 style="color: var(--theme-strong); margin-bottom: 12px; text-transform: uppercase; font-size: 0.85rem;">Data da fare:</h4>`;
            tasks.forEach(t => {
                if(t.isExamDay) return; const isDone = t.isDone || completedTasks[`${dateStr}_${t._id}`];
                let displayTitle = t.title;
                if (t.subject) {
                    const subIcon = getSubjectIcon(t.subject);
                    displayTitle = `<span class="task-subject-tag"><i class="${subIcon}"></i> ${t.subject}</span> ${t.title}`;
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

    // =========================================================================
    // FEATURE 5: GRAFICO A TORTA / DONUT DEL TEMPO DI STUDIO PER MATERIA
    // =========================================================================
    window.renderSubjectDonutChart = function() {
        const container = document.getElementById('subject-donut-container');
        const slicesGroup = document.getElementById('donut-slices-group');
        const centerVal = document.getElementById('donut-center-val');
        const legendList = document.getElementById('subject-donut-legend');
        if (!container || !slicesGroup || !legendList) return;

        slicesGroup.innerHTML = '';
        legendList.innerHTML = '';

        const colors = [
            '#6366f1', '#ec4899', '#f59e0b', '#10b981', 
            '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4', '#e11d48'
        ];

        let subjectCounts = {};
        let totalTasks = 0;

        // Raccoglie i compiti da myTodos
        if (typeof myTodos !== 'undefined' && Array.isArray(myTodos)) {
            myTodos.forEach(t => {
                const sub = (t.subject || 'Generale').trim();
                subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;
                totalTasks++;
            });
        }

        // Raccoglie gli esami/verifiche da myExams
        if (typeof myExams !== 'undefined' && Array.isArray(myExams)) {
            myExams.forEach(e => {
                const sub = (e.subject || 'Generale').trim();
                subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;
                totalTasks++;
            });
        }

        // Se non ci sono ancora task create, visualizza una panoramica delle materie configurate
        if (totalTasks === 0) {
            if (typeof userSubjects !== 'undefined' && userSubjects && userSubjects.length > 0) {
                userSubjects.slice(0, 4).forEach(s => {
                    subjectCounts[s] = 1;
                    totalTasks++;
                });
            } else {
                subjectCounts['Studio'] = 1;
                totalTasks = 1;
            }
        }

        const subjects = Object.keys(subjectCounts);
        const radius = 58;
        const circumference = 2 * Math.PI * radius; // ~364.42

        let accumulatedOffset = 0;
        if (centerVal) centerVal.innerText = `${totalTasks}`;
        const centerLabel = document.querySelector('.donut-center-label');
        if (centerLabel) centerLabel.innerText = totalTasks === 1 ? 'Task' : 'Task';

        subjects.forEach((sub, idx) => {
            const count = subjectCounts[sub];
            const pct = (count / totalTasks) * 100;
            const dashLen = (pct / 100) * circumference;
            const color = colors[idx % colors.length];

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('class', 'donut-slice');
            circle.setAttribute('cx', '80');
            circle.setAttribute('cy', '80');
            circle.setAttribute('r', radius.toString());
            circle.setAttribute('stroke', color);
            circle.setAttribute('stroke-dasharray', `${dashLen} ${circumference}`);
            circle.setAttribute('stroke-dashoffset', `${-accumulatedOffset}`);
            circle.setAttribute('title', `${sub}: ${Math.round(pct)}%`);
            slicesGroup.appendChild(circle);

            accumulatedOffset += dashLen;

            const legendItem = document.createElement('div');
            legendItem.className = 'donut-legend-item';
            legendItem.innerHTML = `
                <div class="donut-legend-subject">
                    <span class="donut-legend-dot" style="background: ${color};"></span>
                    <span>${sub}</span>
                </div>
                <div class="donut-legend-meta">
                    <span class="donut-legend-pct">${Math.round(pct)}%</span>
                    <span>(${count} ${count === 1 ? 'task' : 'task'})</span>
                </div>
            `;
            legendList.appendChild(legendItem);
        });
    };


        // Android Hardware Back Button Bridge
    window.handleAndroidBackPressed = function() {
        const activeModals = document.querySelectorAll('.fullscreen-modal.active, .modal-overlay.active, .bottom-sheet-overlay.active, .choice-modal-overlay.active');
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
    
    // ==========================================================================
    // REGISTRO VOTI (GRADEBOOK) & ADAPTIVE STUDY FEEDBACK (Dunlosky 2013)
    // ==========================================================================
    let myGrades = JSON.parse(localStorage.getItem('studylog_grades') || '[]');
    let geminiApiKey = localStorage.getItem('studylog_gemini_key') || '';
    let selectedGradeType = 'Scritto';
    let isAiListening = false;
    let speechRecognitionInstance = null;

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

    window.getSubjectGradeAverage = function(subject) {
        if (!subject) return null;
        let subGrades = myGrades.filter(g => g.subject.toLowerCase() === subject.toLowerCase());
        if (subGrades.length === 0) return null;
        let sum = subGrades.reduce((acc, g) => acc + (parseFloat(g.numericValue) || 0), 0);
        return Math.round((sum / subGrades.length) * 100) / 100;
    };

    window.getAllGradesAverage = function() {
        if (myGrades.length === 0) return null;
        let sum = myGrades.reduce((acc, g) => acc + (parseFloat(g.numericValue) || 0), 0);
        return Math.round((sum / myGrades.length) * 100) / 100;
    };

    window.renderGradesView = function() {
        const overallNumEl = document.getElementById('gpa-overall-num');
        const overallBadgeEl = document.getElementById('gpa-overall-badge');
        const statCountEl = document.getElementById('grades-stat-count');
        const statPassedEl = document.getElementById('grades-stat-passed');
        const statFailedEl = document.getElementById('grades-stat-failed');
        const listEl = document.getElementById('grades-subjects-list');

        if (!listEl) return;

        let overall = getAllGradesAverage();
        if (overall !== null) {
            overallNumEl.innerText = overall.toFixed(2);
            if (overall >= 8.0) {
                overallBadgeEl.className = 'gpa-badge excellent';
                overallBadgeEl.innerText = 'Eccellente ★';
            } else if (overall >= 6.0) {
                overallBadgeEl.className = 'gpa-badge good';
                overallBadgeEl.innerText = 'Sufficiente';
            } else if (overall >= 5.5) {
                overallBadgeEl.className = 'gpa-badge warning';
                overallBadgeEl.innerText = 'A rischio';
            } else {
                overallBadgeEl.className = 'gpa-badge danger';
                overallBadgeEl.innerText = 'Critico';
            }
        } else {
            overallNumEl.innerText = '--';
            overallBadgeEl.className = 'gpa-badge';
            overallBadgeEl.innerText = 'Nessun voto';
        }

        let passed = myGrades.filter(g => (parseFloat(g.numericValue) || 0) >= 6.0).length;
        let failed = myGrades.length - passed;
        if (statCountEl) statCountEl.innerText = myGrades.length;
        if (statPassedEl) statPassedEl.innerText = passed;
        if (statFailedEl) statFailedEl.innerText = failed;

        listEl.innerHTML = '';

        if (userSubjects.length === 0 && myGrades.length === 0) {
            listEl.innerHTML = '<div class="grade-empty-msg"><i class="fa-solid fa-graduation-cap" style="font-size:2.5rem; margin-bottom:12px; opacity:0.3;"></i><br>Nessun voto registrato. Tocca <b>+ Voto</b> per iniziare!</div>';
            return;
        }

        let allUniqueSubjects = Array.from(new Set([...userSubjects, ...myGrades.map(g => g.subject)])).sort();

        allUniqueSubjects.forEach(sub => {
            let subGrades = myGrades.filter(g => g.subject.toLowerCase() === sub.toLowerCase());
            let avg = getSubjectGradeAverage(sub);

            let avgBadgeClass = 'warning';
            let avgText = avg !== null ? avg.toFixed(1) : '--';
            if (avg !== null) {
                if (avg >= 8.0) avgBadgeClass = 'excellent';
                else if (avg >= 6.0) avgBadgeClass = 'good';
                else if (avg >= 5.5) avgBadgeClass = 'warning';
                else avgBadgeClass = 'danger';
            }

            let card = document.createElement('div');
            card.className = 'subject-grade-card';

            let pillsHtml = '';
            if (subGrades.length > 0) {
                subGrades.forEach(g => {
                    let num = parseFloat(g.numericValue) || 0;
                    let color = num >= 8 ? '#10B981' : (num >= 6 ? 'var(--theme-strong)' : '#EF4444');
                    pillsHtml += `
                        <div class="grade-pill-item" onclick="promptDeleteGrade('${g.id}')" title="${g.notes ? g.notes + ' - ' : ''}Tocca per eliminare">
                            <span style="color:${color}; font-weight:800;">${g.displayValue}</span>
                            <span class="grade-pill-type">${g.type ? g.type.slice(0,3) : 'Scr'}</span>
                            <span style="font-size:0.65rem; color:var(--text-muted);">${formatDateShort(g.date)}</span>
                        </div>
                    `;
                });
            } else {
                pillsHtml = '<span style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">Nessun voto in questa materia</span>';
            }

            card.innerHTML = `
                <div class="subject-grade-header">
                    <div class="subject-grade-name">${sub}</div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="subject-grade-avg ${avgBadgeClass}">Media: ${avgText}</span>
                        <button onclick="openAddGradeModal('${sub}')" style="background:none; border:none; color:var(--theme-strong); cursor:pointer; font-size:0.9rem;" title="Aggiungi voto a ${sub}"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
                <div class="subject-grade-pills">
                    ${pillsHtml}
                </div>
            `;

            listEl.appendChild(card);
        });
    };

    window.openAddGradeModal = function(preselectedSubject = null, examId = null) {
        const subSelect = document.getElementById('grade-subject-select');
        const examSelect = document.getElementById('grade-exam-select');
        const dateInput = document.getElementById('grade-date-input');
        const valInput = document.getElementById('grade-val-input');
        const notesInput = document.getElementById('grade-notes-input');

        if (subSelect) {
            subSelect.innerHTML = '';
            userSubjects.forEach(s => {
                let opt = document.createElement('option');
                opt.value = s;
                opt.innerText = s;
                if (preselectedSubject && s.toLowerCase() === preselectedSubject.toLowerCase()) opt.selected = true;
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
        document.querySelectorAll('#grade-type-segment .segment-btn').forEach((b, idx) => {
            b.classList.toggle('active', idx === 0);
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

        let newGrade = {
            id: 'gr_' + generateId(),
            subject: subSelect.value || 'Generale',
            displayValue: rawVal,
            numericValue: numVal,
            type: selectedGradeType || 'Scritto',
            date: dateInput.value || todayDateStr,
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

    window.promptDeleteGrade = function(gradeId) {
        let g = myGrades.find(x => x.id === gradeId);
        if (!g) return;
        showCustomConfirm(`Eliminare il voto ${g.displayValue} di ${g.subject}?`, () => {
            myGrades = myGrades.filter(x => x.id !== gradeId);
            localStorage.setItem('studylog_grades', JSON.stringify(myGrades));
            renderGradesView();
            showToast('Voto rimosso');
        });
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
