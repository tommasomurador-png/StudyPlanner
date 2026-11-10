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
        let gridCols = options.columns || 2;

        container.innerHTML = `
            <div class="popover-container" id="pop_opt_wrap_${containerId}">
                <button type="button" class="popover-trigger-btn" id="pop_opt_trig_${containerId}">
                    <span id="pop_opt_text_${containerId}">${currentItem}</span>
                    <i class="${iconClass}"></i>
                </button>
                <div class="popover-popup-content" id="pop_opt_content_${containerId}">
                    <div class="option-selector-grid ${gridCols === 4 ? 'cols-4' : ''}" id="pop_opt_grid_${containerId}"></div>
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
    let gradeSubjectPicker = null;
    let gradeValuePicker = null;
    const ITALIAN_GRADE_OPTIONS = ["2","2+","2.5","3-","3","3+","3.5","4-","4","4+","4.5","5-","5","5+","5.5","6-","6","6+","6.5","7-","7","7+","7.5","8-","8","8+","8.5","9-","9","9+","9.5","10-","10"];

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

        gradeSubjectPicker = initOptionPopover('grade-subject-popover-container', {
            items: userSubjects,
            defaultItem: userSubjects[0] || 'Matematica',
            icon: 'fa-solid fa-book-bookmark',
            isSubject: true
        });

        gradeValuePicker = initOptionPopover('grade-value-popover-container', {
            items: ITALIAN_GRADE_OPTIONS,
            defaultItem: '7',
            icon: 'fa-solid fa-award',
            isSubject: false,
            columns: 4
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
        if (gradeSubjectPicker) gradeSubjectPicker.setItems(userSubjects);
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

    window.openChoiceModal = () => window.openModal('choice-modal');
    
    window.openModal = function(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
    };
    window.closeModal = function(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    };

    
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
        try { document.body.addEventListener('click', initAudio, { once: true }); } catch(e){}
        try { applySettingsUI(); } catch(e){}
        try { initAllDatePickers(); } catch(e){}
        try { calculateStreak(); } catch(e){}
        try { updateDashboard(); } catch(e){}
        try { initWeekSlider(); } catch(e){}
        try { generateTasksForDate(selectedDateStr); } catch(e){}
        try { renderRankedView(); } catch(e){}
        try { renderSheetData(); } catch(e){}
        try { renderHeatmap(); } catch(e){}
        try { renderStreakCalendar(); } catch(e){}
        try { renderMonthCalendar(); } catch(e){}
        try { renderSubjectDonutChart(); } catch(e){}
        try { initBottomSheetDrag(); } catch(e){}
        try { initTaskSwipeNavigation(); } catch(e){}
        try { syncAndroidWidget(); } catch(e){}
        try { checkOnboarding(); } catch(e){}
        try { renderGradesView(); } catch(e){}
        try { updateGeminiKeyStatusUI(); } catch(e){}
        
        try {
            setInterval(() => {
                checkAndSendSmartNotification();
            }, 60 * 1000);

            setTimeout(() => {
                checkAndSendSmartNotification();
            }, 1500);
        } catch(e){}
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
        if (element && element.tagName === 'I') {
            element = element.closest('.dock-item, .dock-center-btn');
        }

        document.querySelectorAll('.dock-item, .dock-center-btn, .nav-item').forEach(el => {
            el.classList.remove('active');
            el.classList.remove('is-active-view');
        });

        if (element) {
            if (element.classList.contains('dock-center-btn') || element.id === 'nav-ai') {
                element.classList.add('is-active-view');
            } else {
                element.classList.add('active');
            }
        } else {
            const defaultNav = document.getElementById('nav-' + view);
            if (defaultNav) {
                if (defaultNav.classList.contains('dock-center-btn')) defaultNav.classList.add('is-active-view');
                else defaultNav.classList.add('active');
            }
        }

        // Main Header (Study Planner, Impostazioni, +) is ALWAYS visible at the exact same height
        const mainHeader = document.querySelector('header');
        if (mainHeader) mainHeader.style.display = 'flex';

        // Lock outer page scroll when in AI view so ONLY the chat messages scroll (zero bounce)
        document.documentElement.classList.toggle('ai-view-locked', view === 'ai');
        document.body.classList.toggle('ai-view-locked', view === 'ai');

        const viewsMap = {
            study: document.getElementById('study-view'),
            calendar: document.getElementById('calendar-view'),
            ai: document.getElementById('ai-view'),
            grades: document.getElementById('grades-view'),
            ranked: document.getElementById('ranked-view')
        };

        Object.keys(viewsMap).forEach(k => {
            const vEl = viewsMap[k];
            if (!vEl) return;
            if (k === view) {
                vEl.style.display = (k === 'ai') ? 'flex' : 'block';
                vEl.classList.remove('view-animate-in');
                void vEl.offsetWidth; // reflow for smooth animation restart
                vEl.classList.add('view-animate-in');
            } else {
                vEl.style.display = 'none';
                vEl.classList.remove('view-animate-in');
            }
        });

        if (view === 'calendar') { 
            try { renderMonthCalendar(); } catch(e){}
        }
        if (view === 'ranked') { 
            try { renderSheetData(); renderSubjectDonutChart(); renderHeatmap(); } catch(e){}
        }
        if (view === 'grades') { 
            try { renderGradesView(); } catch(e){}
        }
        if (view === 'ai') { 
            try { initAiView(); } catch(e){}
        }
    };

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
        const currentActive = document.querySelector('.dock-navbar .dock-item.active, .bottom-nav .nav-item.active');
        if (currentActive && currentActive.id !== 'nav-study') {
            switchView('study', document.getElementById('nav-study'));
            return "true";
        }
        return "false";
    };

    window.promptHardReset = function() { document.getElementById('reset-modal').classList.add('active'); }
    
    // ==========================================================================
    // REGISTRO VOTI (VALUTAZIONI) - CLASSEVIVA STYLE ENGINE (Screenshots 1, 3, 4, 5)
    // ==========================================================================
    let myGrades = JSON.parse(localStorage.getItem('studylog_grades') || '[]');
    let geminiApiKey = localStorage.getItem('studylog_gemini_key') || '';
    let groqApiKey = localStorage.getItem('studylog_groq_key') || '';
    let selectedGradeType = 'Scritto';
    let selectedGradeQuadrimestre = '1° Quadrimestre';
    let currentGradesTab = 'materie'; // 'ultime', 'materie', 'q1', 'q2'
    let currentDetailSubject = null; // null = Panoramica, string = Materia specifica
    let currentSubjectTab = 'ultime'; // 'ultime', 'q1', 'q2'

    function getQuadrimestreForDate(dateStr) {
        let dStr = dateStr || formatDateStr(new Date());
        let parts = dStr.split('-');
        let m = parseInt(parts[1], 10);
        // Da Settembre (9) a Dicembre (12) compreso = 1° Trimestre
        // Da Gennaio (1) a fine scuola (8) = 2° Pentamestre
        if (m >= 9 && m <= 12) return '1° Trimestre';
        return '2° Pentamestre';
    }

    function isFirstPeriodGrade(g) {
        const p = g.quadrimestre || getQuadrimestreForDate(g.date);
        if (p === '1° Trimestre') return true;
        // Per voti vecchi salvati con la dicitura precedente, ricalcola dal mese della data
        if (g.date) {
            const m = parseInt(g.date.split('-')[1], 10);
            return (m >= 9 && m <= 12);
        }
        return p === '1° Quadrimestre';
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

    function parseGradeNumeric(valStr) {
        if (!valStr) return null;
        valStr = String(valStr).trim().toLowerCase().replace(',', '.');
        if (valStr.includes('e mezzo') || valStr.includes('mezzo')) {
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
        if (period === '1° Trimestre') {
            subGrades = subGrades.filter(g => isFirstPeriodGrade(g));
        } else if (period === '2° Pentamestre') {
            subGrades = subGrades.filter(g => !isFirstPeriodGrade(g));
        }
        if (subGrades.length === 0) return null;
        let sum = subGrades.reduce((acc, g) => acc + (parseFloat(g.numericValue) || 0), 0);
        return Math.round((sum / subGrades.length) * 100) / 100;
    };

    window.getAllGradesAverage = function(period = null) {
        let grades = myGrades;
        if (period === '1° Trimestre') {
            grades = grades.filter(g => isFirstPeriodGrade(g));
        } else if (period === '2° Pentamestre') {
            grades = grades.filter(g => !isFirstPeriodGrade(g));
        }
        if (grades.length === 0) return null;
        let sum = grades.reduce((acc, g) => acc + (parseFloat(g.numericValue) || 0), 0);
        return Math.round((sum / grades.length) * 100) / 100;
    };

    window.renderGradesView = function() {
        const themeTitleEl = document.getElementById('grades-theme-title');
        const backBtnEl = document.getElementById('btn-grades-back');
        const newGradeBtnEl = document.getElementById('btn-new-grade-top');
        const summaryCardEl = document.getElementById('grades-summary-card');
        const tabContentEl = document.getElementById('grades-tab-content');
        if (!summaryCardEl || !tabContentEl) return;

        // 1. HEADER (Title, Back button, Add button)
        if (currentDetailSubject) {
            if (themeTitleEl) themeTitleEl.innerText = currentDetailSubject;
            if (backBtnEl) backBtnEl.style.display = 'flex';
            if (newGradeBtnEl) {
                newGradeBtnEl.onclick = () => openAddGradeModal(currentDetailSubject);
            }
        } else {
            if (themeTitleEl) themeTitleEl.innerText = 'Valutazioni';
            if (backBtnEl) backBtnEl.style.display = 'none';
            if (newGradeBtnEl) {
                newGradeBtnEl.onclick = () => openAddGradeModal();
            }
        }

        // 2. CALCOLO MEDIE E CONTEGGI (1° Trimestre Set-Dic, 2° Pentamestre Gen-Giu)
        let gradesForSummary = currentDetailSubject 
            ? myGrades.filter(g => g.subject.toLowerCase() === currentDetailSubject.toLowerCase())
            : myGrades;

        let totalCount = gradesForSummary.length;
        let avgOverall = null;
        if (totalCount > 0) {
            let sum = gradesForSummary.reduce((acc, g) => acc + (parseFloat(g.numericValue) || 0), 0);
            avgOverall = Math.round((sum / totalCount) * 100) / 100;
        }

        let q1Grades = gradesForSummary.filter(g => isFirstPeriodGrade(g));
        let q2Grades = gradesForSummary.filter(g => !isFirstPeriodGrade(g));

        let q1Avg = q1Grades.length > 0 ? (q1Grades.reduce((acc, g) => acc + (parseFloat(g.numericValue) || 0), 0) / q1Grades.length) : null;
        let q2Avg = q2Grades.length > 0 ? (q2Grades.reduce((acc, g) => acc + (parseFloat(g.numericValue) || 0), 0) / q2Grades.length) : null;

        let cardColorClass = 'neutral';
        // Cerchio vuoto senza trattino quando non ci sono voti
        let ringValText = '';
        if (avgOverall !== null) {
            ringValText = avgOverall % 1 === 0 ? avgOverall.toFixed(0) : avgOverall.toFixed(2);
            if (avgOverall >= 6.0) cardColorClass = 'good';
            else if (avgOverall >= 5.0) cardColorClass = 'warning';
            else cardColorClass = 'danger';
        }

        let periodiHtml = '';
        if (!currentDetailSubject) {
            periodiHtml = `
                <div class="grades-quadrimestri-row">
                    <div class="grades-q-pill">
                        <span class="grades-q-pill-label">1° Trimestre</span>
                        <span class="grades-q-pill-count">${q1Grades.length} valutazioni</span>
                        <span class="grades-q-pill-val">${q1Avg !== null ? (q1Avg % 1 === 0 ? q1Avg.toFixed(0) : q1Avg.toFixed(2)) : ''}</span>
                    </div>
                    <div class="grades-q-pill">
                        <span class="grades-q-pill-label">2° Pentamestre</span>
                        <span class="grades-q-pill-count">${q2Grades.length} valutazioni</span>
                        <span class="grades-q-pill-val">${q2Avg !== null ? (q2Avg % 1 === 0 ? q2Avg.toFixed(0) : q2Avg.toFixed(2)) : ''}</span>
                    </div>
                </div>
            `;
        }

        // Senza icona occhio accanto a Media voti generale
        summaryCardEl.innerHTML = `
            <div class="grades-media-card ${cardColorClass}">
                <div class="grades-media-card-top">
                    <div class="grades-media-title-area">
                        <div class="grades-media-title">Media voti generale</div>
                        <div class="grades-media-count">${totalCount} valutazioni</div>
                    </div>
                    <div class="grades-media-ring">${ringValText}</div>
                </div>
                ${periodiHtml}
            </div>
        `;

        // 3. CONTENUTO TAB (con animazione fluida a cascata)
        if (currentDetailSubject) {
            let subGrades = myGrades.filter(g => g.subject.toLowerCase() === currentDetailSubject.toLowerCase());

            if (subGrades.length === 0) {
                tabContentEl.innerHTML = `
                    <div class="grades-empty-state view-animate-in">
                        <svg class="grades-empty-icon" width="80" height="80" viewBox="0 0 80 80" fill="none">
                            <path d="M18 16 V62 H64" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
                            <line x1="32" y1="28" x2="56" y2="28" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
                            <line x1="32" y1="40" x2="50" y2="40" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
                            <line x1="32" y1="52" x2="60" y2="52" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
                        </svg>
                        <div class="grades-empty-text">Voti non trovati per questa materia</div>
                    </div>
                `;
            } else {
                let rowsHtml = '';
                subGrades.slice().reverse().forEach((g, idx) => {
                    let num = parseFloat(g.numericValue) || 0;
                    let badgeClass = num >= 6.0 ? 'good' : (num >= 5.0 ? 'warning' : 'danger');
                    let periodLabel = isFirstPeriodGrade(g) ? '1° Trimestre' : '2° Pentamestre';
                    let delayMs = Math.min(idx * 40, 280);
                    rowsHtml += `
                        <div class="grade-item-row" style="animation-delay: ${delayMs}ms;" onclick="promptEditOrDeleteGrade('${g.id}')">
                            <div class="grade-item-left">
                                <div class="grade-badge-num ${badgeClass}">${g.displayValue}</div>
                                <div class="grade-item-info">
                                    <div class="grade-item-sub-title">${g.subject.toUpperCase()}</div>
                                    <div class="grade-item-meta">
                                        <span><i class="fa-regular fa-calendar"></i> ${formatDateShort(g.date)}</span>
                                        <span>• ${periodLabel}</span>
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
            let allUniqueSubjects = Array.from(new Set([...userSubjects, ...myGrades.map(g => g.subject)])).sort();

            let gridCardsHtml = '';
            allUniqueSubjects.forEach((sub, idx) => {
                let subGrades = myGrades.filter(g => g.subject.toLowerCase() === sub.toLowerCase());
                let count = subGrades.length;
                let avg = null;
                if (count > 0) {
                    let sum = subGrades.reduce((acc, g) => acc + (parseFloat(g.numericValue) || 0), 0);
                    avg = Math.round((sum / count) * 100) / 100;
                }

                let ringClass = 'none';
                // Cerchio vuoto senza trattino quando non ci sono voti
                let ringText = '';
                if (avg !== null) {
                    ringText = avg % 1 === 0 ? avg.toFixed(0) : avg.toFixed(2);
                    if (avg >= 6.0) ringClass = 'good';
                    else if (avg >= 5.0) ringClass = 'warning';
                    else ringClass = 'danger';
                }

                let delayMs = Math.min(idx * 30, 300);
                gridCardsHtml += `
                    <div class="materia-card" style="animation-delay: ${delayMs}ms;" onclick="openSubjectDetail('${sub.replace(/'/g, "\\'")}')">
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
        }
    };

    window.openAddGradeModal = function(preselectedSubject = null) {
        let targetSub = preselectedSubject || currentDetailSubject || userSubjects[0] || 'Matematica';

        if (gradeSubjectPicker) {
            gradeSubjectPicker.setItems(userSubjects);
            gradeSubjectPicker.setValue(targetSub);
        }
        if (gradeValuePicker) {
            gradeValuePicker.setValue('7');
        }

        openModal('add-grade-modal');
    };

    window.saveGradeFromModal = function() {
        const subjectVal = gradeSubjectPicker ? gradeSubjectPicker.getValue() : (userSubjects[0] || 'Matematica');
        const rawVal = gradeValuePicker ? gradeValuePicker.getValue() : '7';
        const numVal = parseGradeNumeric(rawVal);

        if (numVal === null || numVal < 2 || numVal > 10) {
            customAlert('Seleziona un voto valido dalla lista (da 2 a 10).');
            return;
        }

        // Calcolo automatico della data corrente dal telefono e del periodo scolastico italiano
        const nowDateStr = formatDateStr(new Date());
        const autoPeriodo = getQuadrimestreForDate(nowDateStr);

        let newGrade = {
            id: 'gr_' + generateId(),
            subject: subjectVal,
            displayValue: rawVal,
            numericValue: numVal,
            quadrimestre: autoPeriodo,
            date: nowDateStr
        };

        myGrades.push(newGrade);
        localStorage.setItem('studylog_grades', JSON.stringify(myGrades));
        closeModal('add-grade-modal');
        renderGradesView();
        addXP(20);
        showToast(`Voto ${rawVal} in ${newGrade.subject} salvato (${autoPeriodo})! +20 XP`);
    };

    window.promptEditOrDeleteGrade = function(gradeId) {
        let g = myGrades.find(x => x.id === gradeId);
        if (!g) return;
        let periodLabel = isFirstPeriodGrade(g) ? '1° Trimestre' : '2° Pentamestre';
        showCustomConfirm(`Voto: ${g.displayValue} in ${g.subject} (${periodLabel}) del ${formatDateShort(g.date)}.\n\nVuoi eliminare questo voto dal registro?`, () => {
            myGrades = myGrades.filter(x => x.id !== gradeId);
            localStorage.setItem('studylog_grades', JSON.stringify(myGrades));
            renderGradesView();
            showToast('Voto rimosso dal registro');
        });
    };

    window.promptDeleteGrade = function(gradeId) {
        window.promptEditOrDeleteGrade(gradeId);
    };

    // ==========================================================================
    // PROXIMA AI ENGINE (Image 2 UI + Multi-Task Offline NLU + Gemini 2.5 Flash)
    // ==========================================================================
    let isAiListening = false;
    let aiChatHistory = JSON.parse(localStorage.getItem('studylog_ai_chat') || '[]');
    window.pendingAiActionsStore = {};

    const PROXIMA_CUBE_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <polygon points="12,2 21,7 12,12 3,7" fill="currentColor"/>
        <polygon points="3,7 12,12 12,22 3,17" fill="currentColor" opacity="0.72"/>
        <polygon points="21,7 12,12 12,22 21,17" stroke="currentColor" stroke-width="1.8" fill="currentColor" fill-opacity="0.2"/>
    </svg>`;

    function getUserName() {
        return localStorage.getItem('studylog_user_name') || 'Studente';
    }

    window.promptChangeUserName = function() {
        const cur = getUserName();
        showCustomPrompt('Come ti chiami?', cur, (newName) => {
            if (newName && newName.trim()) {
                localStorage.setItem('studylog_user_name', newName.trim());
                initAiView();
                showToast('Nome aggiornato: ' + newName.trim());
            }
        });
    };

    window.fillAiQuickPrompt = function(promptText) {
        const input = document.getElementById('ai-prompt-input');
        if (!input) return;
        input.value = promptText;
        input.focus();
    };

    window.initAiView = function() {
        const nameEl = document.getElementById('ai-user-name');
        const welcomeEl = document.getElementById('ai-welcome-container');
        const threadEl = document.getElementById('ai-chat-thread');

        if (nameEl) nameEl.innerText = getUserName();

        if (aiChatHistory.length > 0) {
            if (welcomeEl) welcomeEl.style.display = 'none';
            renderAiChatThread();
        } else {
            if (welcomeEl) welcomeEl.style.display = 'flex';
            if (threadEl) threadEl.innerHTML = '';
        }
    };

    window.copyAiTurnText = function(idx) {
        const item = aiChatHistory[idx];
        if (!item || !item.text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(item.text).then(() => showToast('Risposta copiata'));
        } else {
            showToast('Risposta copiata');
        }
    };

    function scrollAiViewportToBottom() {
        const vp = document.getElementById('ai-scroll-viewport');
        if (vp) {
            setTimeout(() => {
                vp.scrollTo({ top: vp.scrollHeight, behavior: 'smooth' });
            }, 30);
        }
    }

    function getActionCardMeta(act) {
        if (!act) return { icon: 'fa-bolt', label: 'Azione', editableVal: '', btnText: 'Conferma' };
        if (act.type === 'add_task') {
            return {
                icon: 'fa-list-check',
                label: 'Compito • ' + (act.subject || 'Materia') + ' • ' + formatDateShort(act.date || tomorrowStr),
                editableVal: act.details || 'Esercizi',
                btnText: 'Aggiungi'
            };
        }
        if (act.type === 'modify_task') {
            return {
                icon: 'fa-pen-to-square',
                label: 'Sposta Compito • ' + (act.subject || 'Materia') + ' → ' + formatDateShort(act.date || tomorrowStr),
                editableVal: act.details || 'Compito',
                btnText: 'Conferma Modifica'
            };
        }
        if (act.type === 'remove_task') {
            return {
                icon: 'fa-trash-can',
                label: 'Rimuovi Compito • ' + (act.subject || 'Materia'),
                editableVal: act.details || 'Compito',
                btnText: 'Rimuovi'
            };
        }
        if (act.type === 'add_exam') {
            return {
                icon: 'fa-file-pen',
                label: (act.examType || 'Verifica') + ' • ' + (act.subject || 'Materia') + ' • ' + formatDateShort(act.date || tomorrowStr),
                editableVal: act.details || ((act.pages || 20) + ' pagine'),
                btnText: 'Aggiungi Verifica'
            };
        }
        if (act.type === 'modify_exam') {
            return {
                icon: 'fa-calendar-days',
                label: 'Sposta Verifica • ' + (act.subject || 'Materia') + ' → ' + formatDateShort(act.date || tomorrowStr),
                editableVal: act.details || ((act.pages || 20) + ' pagine'),
                btnText: 'Aggiorna'
            };
        }
        if (act.type === 'add_grade') {
            return {
                icon: 'fa-graduation-cap',
                label: 'Voto • ' + (act.subject || 'Materia') + ' • ' + getQuadrimestreForDate(formatDateStr(new Date())),
                editableVal: String(act.value || '7'),
                btnText: 'Salva Voto'
            };
        }
        return { icon: 'fa-bolt', label: 'Attività', editableVal: act.details || '', btnText: 'Aggiungi' };
    }

    window.autoResizeSingleCardTextarea = function(el) {
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = Math.max(26, el.scrollHeight) + 'px';
    };

    window.updatePendingSingleActionText = function(turnIdx, actIdx, el) {
        const turn = aiChatHistory[turnIdx];
        if (!turn || !turn.actionCard || !turn.actionCard.action) return;
        const list = Array.isArray(turn.actionCard.action) ? turn.actionCard.action : [turn.actionCard.action];
        const act = list[actIdx];
        if (!act || !el) return;

        const val = el.value;
        if (act.type === 'add_grade') {
            act.value = val.trim() || act.value;
        } else if (act.type === 'add_exam' || act.type === 'modify_exam') {
            act.details = val;
            const numMatch = val.match(/(\d+)/);
            if (numMatch) act.pages = parseInt(numMatch[1], 10);
        } else {
            act.details = val;
        }
        localStorage.setItem('studylog_ai_chat', JSON.stringify(aiChatHistory));
        window.autoResizeSingleCardTextarea(el);
    };

    window.confirmSinglePendingAction = function(turnIdx, actIdx, btnEl) {
        const turn = aiChatHistory[turnIdx];
        if (!turn || !turn.actionCard || !turn.actionCard.action) return;
        const list = Array.isArray(turn.actionCard.action) ? turn.actionCard.action : [turn.actionCard.action];
        const act = list[actIdx];
        if (!act || act._status === 'confirmed') return;

        // Read latest text from sibling editable textarea before saving
        const cardEl = btnEl ? btnEl.closest('.ai-single-action-card') : null;
        if (cardEl) {
            const inputField = cardEl.querySelector('.ai-card-edit-input');
            if (inputField) {
                const cleanEdited = inputField.value.trim();
                if (cleanEdited) {
                    if (act.type === 'add_grade') act.value = cleanEdited;
                    else if (act.type === 'add_exam' || act.type === 'modify_exam') {
                        act.details = cleanEdited;
                        const nm = cleanEdited.match(/(\d+)/);
                        if (nm) act.pages = parseInt(nm[1], 10);
                    } else {
                        act.details = cleanEdited;
                    }
                }
                inputField.disabled = true;
            }
            cardEl.classList.add('is-confirmed');
            const dismissBtn = cardEl.querySelector('.btn-ai-single-dismiss');
            if (dismissBtn) dismissBtn.style.display = 'none';
        }

        if (btnEl) {
            btnEl.disabled = true;
            btnEl.innerHTML = '<i class="fa-solid fa-check"></i> Aggiunto';
        }

        act._status = 'confirmed';
        localStorage.setItem('studylog_ai_chat', JSON.stringify(aiChatHistory));
        // Execute silently (toast only, no extra spam chat messages)
        window.executePendingAiAction([act], true);
    };

    window.dismissSinglePendingAction = function(turnIdx, actIdx, btnEl) {
        const turn = aiChatHistory[turnIdx];
        if (!turn || !turn.actionCard || !turn.actionCard.action) return;
        const list = Array.isArray(turn.actionCard.action) ? turn.actionCard.action : [turn.actionCard.action];
        const act = list[actIdx];
        if (!act) return;
        act._status = 'dismissed';
        localStorage.setItem('studylog_ai_chat', JSON.stringify(aiChatHistory));
        const cardEl = btnEl ? btnEl.closest('.ai-single-action-card') : null;
        if (cardEl) {
            cardEl.classList.add('is-dismissed');
            const inputField = cardEl.querySelector('.ai-card-edit-input');
            if (inputField) inputField.disabled = true;
            const confirmBtn = cardEl.querySelector('.btn-ai-single-confirm');
            if (confirmBtn) confirmBtn.style.display = 'none';
            if (btnEl) {
                btnEl.disabled = true;
                btnEl.innerText = 'Ignorato';
            }
        }
    };

    function renderAiChatThread() {
        const threadEl = document.getElementById('ai-chat-thread');
        const welcomeEl = document.getElementById('ai-welcome-container');
        if (!threadEl) return;

        if (aiChatHistory.length > 0 && welcomeEl) {
            welcomeEl.style.display = 'none';
        }

        threadEl.innerHTML = '';
        const uName = getUserName();
        const uInitial = (uName.charAt(0) || 'U').toUpperCase();

        aiChatHistory.forEach((item, idx) => {
            const turnDiv = document.createElement('div');
            turnDiv.className = 'proxima-turn ' + (item.sender === 'user' ? 'user-turn' : 'ai-turn');

            if (item.sender === 'user') {
                turnDiv.innerHTML = `
                    <div class="proxima-turn-header">
                        <div class="proxima-user-avatar">${uInitial}</div>
                        <span class="proxima-turn-name">You</span>
                    </div>
                    <div class="proxima-turn-body"></div>
                `;
                turnDiv.querySelector('.proxima-turn-body').innerText = item.text;
            } else {
                turnDiv.innerHTML = `
                    <div class="proxima-turn-header">
                        <div class="proxima-ai-avatar">${PROXIMA_CUBE_SVG}</div>
                        <span class="proxima-turn-name">Proxima</span>
                    </div>
                    <div class="proxima-turn-body"></div>
                    <div class="proxima-turn-toolbar">
                        <button type="button" class="proxima-tool-btn" onclick="showToast('Grazie per il feedback!')" title="Utile"><i class="fa-regular fa-thumbs-up"></i></button>
                        <button type="button" class="proxima-tool-btn" onclick="showToast('Feedback registrato')" title="Non utile"><i class="fa-regular fa-thumbs-down"></i></button>
                        <button type="button" class="proxima-tool-btn" onclick="copyAiTurnText(${idx})" title="Copia"><i class="fa-regular fa-copy"></i></button>
                        <button type="button" class="proxima-tool-btn" onclick="resetAiChatConversation()" title="Nuova chat"><i class="fa-solid fa-rotate-right"></i></button>
                    </div>
                `;
                turnDiv.querySelector('.proxima-turn-body').innerText = item.text;

                if (item.actionCard && item.actionCard.action) {
                    const actList = Array.isArray(item.actionCard.action) ? item.actionCard.action : [item.actionCard.action];
                    const stackDiv = document.createElement('div');
                    stackDiv.className = 'ai-actions-stack';

                    actList.forEach((act, actIdx) => {
                        const meta = getActionCardMeta(act);
                        const isConfirmed = act._status === 'confirmed';
                        const isDismissed = act._status === 'dismissed';

                        const singleCard = document.createElement('div');
                        singleCard.className = 'ai-single-action-card' + (isConfirmed ? ' is-confirmed' : '') + (isDismissed ? ' is-dismissed' : '');
                        singleCard.innerHTML = `
                            <div class="ai-card-top-row">
                                <span class="ai-card-badge"><i class="fa-solid ${meta.icon}"></i> ${meta.label}</span>
                                <span class="ai-card-edit-hint"><i class="fa-solid fa-pen"></i> Tocca per modificare</span>
                            </div>
                            <div class="ai-card-edit-wrap">
                                <textarea class="ai-card-edit-input" rows="1" ${(isConfirmed || isDismissed) ? 'disabled' : ''} oninput="updatePendingSingleActionText(${idx}, ${actIdx}, this)"></textarea>
                            </div>
                            <div class="ai-card-actions-row">
                                <button type="button" class="btn-ai-single-confirm" ${(isConfirmed || isDismissed) ? 'disabled' : ''} onclick="confirmSinglePendingAction(${idx}, ${actIdx}, this)" style="${isDismissed ? 'display:none;' : ''}">
                                    <i class="fa-solid fa-check"></i> ${isConfirmed ? 'Aggiunto' : meta.btnText}
                                </button>
                                <button type="button" class="btn-ai-single-dismiss" ${(isConfirmed || isDismissed) ? 'disabled' : ''} onclick="dismissSinglePendingAction(${idx}, ${actIdx}, this)" style="${isConfirmed ? 'display:none;' : ''}">
                                    ${isDismissed ? 'Ignorato' : '<i class="fa-solid fa-xmark"></i> Ignora'}
                                </button>
                            </div>
                        `;
                        const ta = singleCard.querySelector('.ai-card-edit-input');
                        ta.value = meta.editableVal;
                        stackDiv.appendChild(singleCard);
                        setTimeout(() => window.autoResizeSingleCardTextarea(ta), 10);
                    });

                    turnDiv.insertBefore(stackDiv, turnDiv.querySelector('.proxima-turn-toolbar'));
                }
            }

            threadEl.appendChild(turnDiv);
        });

        scrollAiViewportToBottom();
    }

    window.resetAiChatConversation = function() {
        aiChatHistory = [];
        localStorage.removeItem('studylog_ai_chat');
        initAiView();
        showToast('Conversazione azzerata');
    };

    window.autoResizeAiPrompt = function(el) {
        if (!el) el = document.getElementById('ai-prompt-input');
        if (!el) return;
        el.style.height = 'auto';
        const nextH = Math.min(116, Math.max(24, el.scrollHeight));
        el.style.height = nextH + 'px';
    };

    window.sendAiChatMessage = function() {
        // If user taps Send (↑) while recording is active, stop recording and auto-send once transcription finishes
        if (isAiListening) {
            if (usingContinuousFreeFlowMode) {
                pendingAutoSendAfterTranscription = true;
                stopAiVoiceRecordingToInput();
                return;
            }
            const spoken = getFullVoiceTranscript();
            stopAiVoiceEngineOnly();
            setGeminiVoiceBarMode(false);
            const inputEl = document.getElementById('ai-prompt-input');
            const finalSpoken = applyLocalFreeFlowCleanup((spoken || (inputEl ? inputEl.value : '')).trim());
            if (inputEl) {
                inputEl.value = '';
                window.autoResizeAiPrompt(inputEl);
                inputEl.blur();
            }
            accumulatedVoiceText = '';
            currentPartialVoiceText = '';
            if (finalSpoken) {
                appendChatMessage('user', finalSpoken);
                processStudyAiCommand(finalSpoken);
            }
            return;
        }

        const input = document.getElementById('ai-prompt-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        window.autoResizeAiPrompt(input);
        appendChatMessage('user', text);
        processStudyAiCommand(text);
    };

    function appendChatMessage(sender, text, actionCard = null) {
        aiChatHistory.push({ sender, text, actionCard, time: Date.now() });
        if (aiChatHistory.length > 30) aiChatHistory.shift();
        localStorage.setItem('studylog_ai_chat', JSON.stringify(aiChatHistory));
        renderAiChatThread();
    }

    // ==========================================================================
    // FREEFLOW-INSPIRED CONTINUOUS VOICE RECORDING + GEMINI INLINE WAVEFORM
    // ==========================================================================
    let accumulatedVoiceText = '';
    let currentPartialVoiceText = '';
    let currentVoiceRmsLevel = 0.15;
    let geminiWaveAnimFrame = null;
    let usingContinuousFreeFlowMode = false;
    let pendingAutoSendAfterTranscription = false;
    let existingPrefixBeforeVoice = '';

    function applyLocalFreeFlowCleanup(rawStr) {
        let s = (rawStr || '').trim();
        if (!s) return '';
        // Fix common Italian continuous dictation ASR artifacts
        s = s.replace(/\b(ehm|uhm|mmm|mah|allora allora)\b/gi, '');
        s = s.replace(/\bquesti tre novembre\b/gi, '23 novembre');
        s = s.replace(/\bquesti\s+(\d+)\b/gi, '$1');
        s = s.replace(/\s+/g, ' ').trim();
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function getFullVoiceTranscript() {
        const p1 = (accumulatedVoiceText || '').trim();
        const p2 = (currentPartialVoiceText || '').trim();
        if (p1 && p2) {
            if (p1.toLowerCase().endsWith(p2.toLowerCase())) return p1;
            return p1 + ' ' + p2;
        }
        return p1 || p2;
    }

    function setGeminiVoiceBarMode(active) {
        const inputBar = document.getElementById('ai-input-bar');
        const composerTop = document.getElementById('ai-composer-top');
        const inputEl = document.getElementById('ai-prompt-input');
        const waveTrack = document.getElementById('ai-gemini-wave-track');
        const micBtn = document.getElementById('btn-ai-mic');
        const micIcon = document.getElementById('btn-ai-mic-icon');
        const stopSquare = document.getElementById('btn-ai-stop-square');

        if (inputBar) inputBar.classList.toggle('is-voice-active', active);
        if (micBtn) micBtn.classList.toggle('is-listening', active);
        if (micIcon) micIcon.style.display = active ? 'none' : 'inline-block';
        if (stopSquare) stopSquare.style.display = active ? 'inline-block' : 'none';

        if (active) {
            if (inputEl) inputEl.blur();
            if (composerTop) composerTop.style.display = 'none';
            if (waveTrack) waveTrack.style.display = 'flex';
            startGeminiWaveAnimation();
        } else {
            stopGeminiWaveAnimation();
            if (waveTrack) waveTrack.style.display = 'none';
            if (composerTop) composerTop.style.display = 'flex';
            if (inputEl) {
                inputEl.style.display = 'block';
                window.autoResizeAiPrompt(inputEl);
            }
        }
    }

    function startGeminiWaveAnimation() {
        stopGeminiWaveAnimation();
        const ticks = document.querySelectorAll('#ai-gemini-wave-track .gemini-wave-tick');
        const animateFrame = () => {
            if (!isAiListening) return;
            const t = performance.now() / 115;
            ticks.forEach((tick, idx) => {
                const wave = Math.sin(t + idx * 0.55) * 0.5 + 0.5;
                const wave2 = Math.cos(t * 0.7 - idx * 0.35) * 0.5 + 0.5;
                const voiceBoost = Math.max(0.18, currentVoiceRmsLevel);
                const h = Math.round(5 + (wave * 0.65 + wave2 * 0.35) * voiceBoost * 19);
                tick.style.height = Math.min(24, Math.max(4, h)) + 'px';
                tick.style.opacity = (0.45 + voiceBoost * 0.55).toFixed(2);
            });
            geminiWaveAnimFrame = requestAnimationFrame(animateFrame);
        };
        geminiWaveAnimFrame = requestAnimationFrame(animateFrame);
    }

    function stopGeminiWaveAnimation() {
        if (geminiWaveAnimFrame) {
            cancelAnimationFrame(geminiWaveAnimFrame);
            geminiWaveAnimFrame = null;
        }
    }

    window.toggleAiVoiceRecording = function() {
        if (isAiListening) {
            // User manually clicked the Stop square -> stop recording and place clean text in input box
            pendingAutoSendAfterTranscription = false;
            stopAiVoiceRecordingToInput();
        } else {
            // User manually clicked the Mic icon -> start continuous recording
            startAiVoiceRecording();
        }
    };

    function hasCloudTranscriptionKey() {
        const hasGroq = typeof groqApiKey === 'string' && groqApiKey.trim().length > 10;
        const hasGemini = typeof geminiApiKey === 'string' && geminiApiKey.trim().length > 10;
        return navigator.onLine && (hasGroq || hasGemini);
    }

    function startAiVoiceRecording() {
        const inputEl = document.getElementById('ai-prompt-input');
        existingPrefixBeforeVoice = inputEl && inputEl.value.trim() ? inputEl.value.trim() : '';
        accumulatedVoiceText = existingPrefixBeforeVoice;
        currentPartialVoiceText = '';
        currentVoiceRmsLevel = 0.22;
        pendingAutoSendAfterTranscription = false;
        isAiListening = true;
        setGeminiVoiceBarMode(true);

        const nativeBridge = window.AndroidNative || window.Android;
        // FreeFlow HD Pipeline: Continuous uninterrupted 16kHz PCM WAV capture + Whisper/Gemini cleanup
        if (nativeBridge && typeof nativeBridge.startContinuousAudioRecording === 'function' && hasCloudTranscriptionKey()) {
            usingContinuousFreeFlowMode = true;
            try {
                nativeBridge.startContinuousAudioRecording();
                return;
            } catch (err) {
                console.warn('Continuous FreeFlow record start error:', err);
                usingContinuousFreeFlowMode = false;
            }
        }

        // Offline / No-Key Android SpeechRecognizer fallback
        usingContinuousFreeFlowMode = false;
        if (nativeBridge && typeof nativeBridge.startNativeSpeechRecognition === 'function') {
            try {
                nativeBridge.startNativeSpeechRecognition();
                return;
            } catch (err) {
                console.warn('Native speech start error:', err);
            }
        }

        // Web Speech API fallback (desktop / Chrome browser) with continuous manual mode
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
            try {
                const rec = new SpeechRec();
                window._activeWebSpeechRec = rec;
                rec.lang = 'it-IT';
                rec.continuous = true;
                rec.interimResults = true;
                rec.onresult = (e) => {
                    let finalChunk = '';
                    let interimChunk = '';
                    for (let i = e.resultIndex; i < e.results.length; i++) {
                        if (e.results[i].isFinal) {
                            finalChunk += e.results[i][0].transcript + ' ';
                        } else {
                            interimChunk += e.results[i][0].transcript;
                        }
                    }
                    if (finalChunk.trim()) {
                        window.onAndroidSpeechSegment(finalChunk.trim());
                    }
                    currentPartialVoiceText = interimChunk.trim();
                    currentVoiceRmsLevel = 0.75;
                };
                rec.onerror = () => {};
                rec.onend = () => {
                    if (isAiListening && window._activeWebSpeechRec) {
                        try { window._activeWebSpeechRec.start(); } catch(e){}
                    }
                };
                rec.start();
            } catch(e) {
                stopAiVoiceEngineOnly();
                setGeminiVoiceBarMode(false);
                showToast('Microfono non disponibile su questo browser');
            }
        } else {
            stopAiVoiceEngineOnly();
            setGeminiVoiceBarMode(false);
            showToast('Riconoscimento vocale non supportato');
        }
    }

    function stopAiVoiceEngineOnly() {
        isAiListening = false;
        if (window._activeWebSpeechRec) {
            const r = window._activeWebSpeechRec;
            window._activeWebSpeechRec = null;
            try { r.stop(); } catch(e){}
        }
        const nativeBridge = window.AndroidNative || window.Android;
        if (usingContinuousFreeFlowMode && nativeBridge && typeof nativeBridge.stopContinuousAudioRecording === 'function') {
            try { nativeBridge.stopContinuousAudioRecording(); } catch(e){}
        } else if (nativeBridge && typeof nativeBridge.stopNativeSpeechRecognition === 'function') {
            try { nativeBridge.stopNativeSpeechRecognition(); } catch(e){}
        }
    }

    function stopAiVoiceRecordingToInput() {
        if (usingContinuousFreeFlowMode) {
            isAiListening = false;
            setGeminiVoiceBarMode(false);
            const inputEl = document.getElementById('ai-prompt-input');
            if (inputEl) {
                inputEl.placeholder = 'Trascrizione FreeFlow in corso...';
                inputEl.blur();
            }
            const nativeBridge = window.AndroidNative || window.Android;
            if (nativeBridge && typeof nativeBridge.stopContinuousAudioRecording === 'function') {
                try { nativeBridge.stopContinuousAudioRecording(); } catch(e){}
            }
            return;
        }

        const finalTranscript = applyLocalFreeFlowCleanup(getFullVoiceTranscript());
        stopAiVoiceEngineOnly();
        setGeminiVoiceBarMode(false);

        const inputEl = document.getElementById('ai-prompt-input');
        if (inputEl) {
            inputEl.value = finalTranscript;
            window.autoResizeAiPrompt(inputEl);
            // Explicitly avoid focus() so Android soft keyboard NEVER opens automatically after voice stops
            inputEl.blur();
        }
    }

    // FreeFlow Pipeline Callback: receives continuous recorded WAV Base64 & runs Whisper / Gemini cleanup
    window.onAndroidAudioReady = async function() {
        const inputEl = document.getElementById('ai-prompt-input');
        const restorePlaceholder = () => {
            if (inputEl) inputEl.placeholder = 'Scrivi qui o parla con Proxima...';
        };
        const nativeBridge = window.AndroidNative || window.Android;
        if (!nativeBridge || typeof nativeBridge.getLastRecordedAudioBase64 !== 'function') {
            restorePlaceholder();
            return;
        }
        const b64 = nativeBridge.getLastRecordedAudioBase64();
        if (!b64 || b64.length < 100) {
            restorePlaceholder();
            showToast('Nessun audio rilevato');
            return;
        }

        try {
            let cleanTranscript = '';
            if (groqApiKey && groqApiKey.trim().length > 10) {
                cleanTranscript = await transcribeWithGroqFreeFlow(b64);
            }
            if (!cleanTranscript && geminiApiKey && geminiApiKey.trim().length > 10) {
                cleanTranscript = await transcribeWithGeminiFreeFlow(b64);
            }
            restorePlaceholder();

            cleanTranscript = (cleanTranscript || '').trim();
            if (cleanTranscript === 'EMPTY') cleanTranscript = '';

            if (cleanTranscript) {
                const combined = existingPrefixBeforeVoice ? (existingPrefixBeforeVoice + ' ' + cleanTranscript) : cleanTranscript;
                if (pendingAutoSendAfterTranscription) {
                    pendingAutoSendAfterTranscription = false;
                    if (inputEl) {
                        inputEl.value = '';
                        window.autoResizeAiPrompt(inputEl);
                        inputEl.blur();
                    }
                    appendChatMessage('user', combined);
                    processStudyAiCommand(combined);
                } else if (inputEl) {
                    inputEl.value = combined;
                    window.autoResizeAiPrompt(inputEl);
                    inputEl.blur();
                }
            } else {
                showToast('Non ho sentito parole chiare, riprova.');
            }
        } catch (err) {
            console.warn('FreeFlow audio transcribe error:', err);
            restorePlaceholder();
            showToast('Errore trascrizione vocale');
        }
    };

    function getFreeFlowCleanupPrompt() {
        // Exact FreeFlow (zachlatta/freeflow) post-processing rules adapted for Italian school dictation
        return `Sei un motore di trascrizione e pulizia vocale ad alta precisione in italiano (stile FreeFlow / Wispr Flow).
Ascolta attentamente l'audio allegato dello studente e restituisci ESATTAMENTE ed UNICAMENTE il testo pulito e pronto da inviare.

Vocabolario materie dello studente (correggi la grafia di nomi/materie simili se pronunciati): ${userSubjects.join(', ')}.

Regole rigorose:
- Rimuovi esitazioni o intercalari inutili (ehm, uhm, allora cioè, cioè) se non cambiano il senso.
- Inserisci punteggiatura naturale, maiuscole corrette e numeri chiari (es. "23 novembre", "8 ottobre", "ho preso 8 in matematica").
- Non inventare né aggiungere MAI parole non pronunciate nell'audio.
- Non scrivere introduzioni come "Ecco la trascrizione:". Restituisci SOLO il testo trascritto (oppure EMPTY se l'audio è vuoto/solo rumore).`;
    }

    async function transcribeWithGroqFreeFlow(base64Wav) {
        try {
            const binaryStr = atob(base64Wav);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
            const wavBlob = new Blob([bytes], { type: 'audio/wav' });

            const form = new FormData();
            form.append('file', wavBlob, 'speech.wav');
            form.append('model', 'whisper-large-v3-turbo');
            form.append('language', 'it');
            form.append('temperature', '0');
            form.append('prompt', 'Dettatura scolastica in italiano. Materie: ' + userSubjects.join(', ') + '. Compiti, verifiche, voti, interrogazioni.');

            const resp = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + groqApiKey.trim() },
                body: form
            });
            if (!resp.ok) return '';
            const data = await resp.json();
            const rawText = (data.text || '').trim();
            if (!rawText) return '';

            // Optional FreeFlow Llama 3.3 70B post-processing cleanup on Groq
            try {
                const cleanResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + groqApiKey.trim(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        temperature: 0,
                        messages: [
                            { role: 'system', content: getFreeFlowCleanupPrompt() },
                            { role: 'user', content: 'RAW_TRANSCRIPTION: "' + rawText + '"' }
                        ]
                    })
                });
                if (cleanResp.ok) {
                    const cleanJson = await cleanResp.json();
                    const polished = (cleanJson.choices?.[0]?.message?.content || '').trim().replace(/^"|"$/g, '');
                    if (polished && polished !== 'EMPTY') return polished;
                }
            } catch (e) {}

            return rawText;
        } catch (err) {
            console.warn('Groq FreeFlow error:', err);
            return '';
        }
    }

    async function transcribeWithGeminiFreeFlow(base64Wav) {
        const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash'];
        const promptText = getFreeFlowCleanupPrompt();
        for (const modelName of modelsToTry) {
            try {
                const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey.trim()}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: promptText },
                                { inline_data: { mime_type: 'audio/wav', data: base64Wav } }
                            ]
                        }]
                    })
                });
                if (resp.ok) {
                    const data = await resp.json();
                    const textOut = (data.candidates?.[0]?.content?.parts?.[0]?.text || '').trim().replace(/^"|"$/g, '');
                    if (textOut) return textOut;
                }
            } catch (err) {
                console.warn('Gemini FreeFlow audio error (' + modelName + '):', err);
            }
        }
        return '';
    }

    window.cancelAiVoiceRecording = function() {
        accumulatedVoiceText = '';
        currentPartialVoiceText = '';
        pendingAutoSendAfterTranscription = false;
        const nativeBridge = window.AndroidNative || window.Android;
        if (usingContinuousFreeFlowMode && nativeBridge && typeof nativeBridge.cancelContinuousAudioRecording === 'function') {
            try { nativeBridge.cancelContinuousAudioRecording(); } catch(e){}
        }
        stopAiVoiceEngineOnly();
        setGeminiVoiceBarMode(false);
    };

    window.onAndroidSpeechStart = function() {
        if (!isAiListening) {
            isAiListening = true;
            setGeminiVoiceBarMode(true);
        }
    };

    window.onAndroidSpeechRms = function(rmsdB) {
        if (!isAiListening) return;
        const level = Math.max(0.15, Math.min(1, (parseFloat(rmsdB) + 2) / 10));
        currentVoiceRmsLevel = level;
    };

    // Called by MainActivity when a speech segment completes while continuous manual listening is active
    window.onAndroidSpeechSegment = function(segmentText) {
        const clean = (segmentText || '').trim();
        if (!clean) return;
        if (accumulatedVoiceText) {
            accumulatedVoiceText = accumulatedVoiceText.trim() + ' ' + clean;
        } else {
            accumulatedVoiceText = clean;
        }
        currentPartialVoiceText = '';
        const inputEl = document.getElementById('ai-prompt-input');
        if (inputEl) {
            inputEl.value = accumulatedVoiceText;
        }
    };

    // Called by MainActivity for live partial words (or final words after manual stop)
    window.onAndroidSpeechResult = function(transcript, isFinal) {
        const clean = (transcript || '').trim();
        if (!clean) return;

        if (isFinal) {
            if (accumulatedVoiceText) {
                if (!accumulatedVoiceText.toLowerCase().endsWith(clean.toLowerCase())) {
                    accumulatedVoiceText = accumulatedVoiceText.trim() + ' ' + clean;
                }
            } else {
                accumulatedVoiceText = clean;
            }
            currentPartialVoiceText = '';
        } else {
            currentPartialVoiceText = clean;
        }

        const inputEl = document.getElementById('ai-prompt-input');
        if (inputEl) {
            inputEl.value = getFullVoiceTranscript();
            if (!isAiListening) {
                window.autoResizeAiPrompt(inputEl);
            }
        }
    };

    window.onAndroidSpeechCancel = function() {
        if (!isAiListening) {
            setGeminiVoiceBarMode(false);
        }
    };

    window.onAndroidSpeechError = function(err) {
        // Only stop if it's a permission error; silence timeouts are automatically restarted in MainActivity
        if (err === 'permission_denied' || err === 'error_9') {
            stopAiVoiceEngineOnly();
            setGeminiVoiceBarMode(false);
            showToast('Permesso microfono necessario');
        }
    };

    window.speakAiVoice = function(text) {
        if (!('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const cleanText = text.replace(/<[^>]*>/g, '').replace(/[#*_]/g, '');
            const utter = new SpeechSynthesisUtterance(cleanText);
            utter.lang = 'it-IT';
            utter.rate = 1.05;
            utter.pitch = 1.0;
            window.speechSynthesis.speak(utter);
        } catch(e){}
    };

    // ==========================================================================
    // NATURAL LANGUAGE PARSING (Smart Concise Titles + Modify/Move Tasks + Multi-Task)
    // ==========================================================================
    const ITALIAN_NUM_WORDS = {
        'uno': 1, 'due': 2, 'tre': 3, 'quattro': 4,
        'cinque': 5, 'sei': 6, 'sette': 7, 'otto': 8, 'nove': 9, 'dieci': 10,
        'undici': 11, 'dodici': 12, 'tredici': 13, 'quattordici': 14, 'quindici': 15,
        'sedici': 16, 'diciassette': 17, 'diciotto': 18, 'diciannove': 19, 'venti': 20,
        'ventuno': 21, 'ventidue': 22, 'ventitre': 23, 'ventitré': 23, 'ventiquattro': 24,
        'venticinque': 25, 'trenta': 30, 'quaranta': 40, 'cinquanta': 50
    };

    function normalizeNumberWords(str) {
        let out = str;
        Object.keys(ITALIAN_NUM_WORDS).forEach(word => {
            const reg = new RegExp('\\b' + word + '\\b', 'gi');
            out = out.replace(reg, String(ITALIAN_NUM_WORDS[word]));
        });
        return out;
    }

    function findSubjectInSegment(segText) {
        const lower = segText.toLowerCase();
        const sortedSubs = [...userSubjects].sort((a, b) => b.length - a.length);
        for (const sub of sortedSubs) {
            if (lower.includes(sub.toLowerCase())) return sub;
        }
        const subjectStems = [
            ['mate', 'Matematica'], ['ita', 'Italiano'], ['ingl', 'Inglese'],
            ['filo', 'Filosofia'], ['biolog', 'Biologia'], ['fisic', 'Fisica'],
            ['stori', 'Storia'], ['chimi', 'Chimica'], ['scienz', 'Scienze'],
            ['latin', 'Latino'], ['greco', 'Greco'], ['art', 'Arte'],
            ['informatic', 'Informatica'], ['geograf', 'Geografia'],
            ['diritt', 'Diritto'], ['econom', 'Economia'], ['frances', 'Francese'],
            ['spagnol', 'Spagnolo'], ['tedesc', 'Tedesco'], ['religion', 'Religione'],
            ['motor', 'Educazione Fisica']
        ];
        for (const [stem, fallbackName] of subjectStems) {
            if (lower.includes(stem)) {
                return userSubjects.find(s => s.toLowerCase().includes(stem.slice(0, 4))) || fallbackName;
            }
        }
        return null;
    }

    function parseDateFromText(txt) {
        const lower = normalizeNumberWords(txt.toLowerCase());
        const now = new Date();

        if (lower.includes('dopodomani')) {
            let d = new Date(now);
            d.setDate(d.getDate() + 2);
            return formatDateStr(d);
        }
        if (lower.includes('domani')) {
            let d = new Date(now);
            d.setDate(d.getDate() + 1);
            return formatDateStr(d);
        }
        const traGiorni = lower.match(/\b(?:tra|fra)\s+(\d+)\s+giorn/);
        if (traGiorni) {
            let d = new Date(now);
            d.setDate(d.getDate() + Math.max(1, parseInt(traGiorni[1], 10)));
            return formatDateStr(d);
        }

        // Italian month names (e.g. "3 novembre", "l'11 novembre", "23 novembre")
        const monthsMap = {
            'gennaio': 1, 'febbraio': 2, 'marzo': 3, 'aprile': 4, 'maggio': 5, 'giugno': 6,
            'luglio': 7, 'agosto': 8, 'settembre': 9, 'ottobre': 10, 'novembre': 11, 'dicembre': 12
        };
        for (const [mName, mIdx] of Object.entries(monthsMap)) {
            const mReg = new RegExp("(?:l['’]?\\s*|quest[oi]\\s+)?(\\d{1,2}|primo)\\s+" + mName, 'i');
            const mMatch = lower.match(mReg);
            if (mMatch) {
                const day = mMatch[1].toLowerCase() === 'primo' ? 1 : parseInt(mMatch[1], 10);
                let year = now.getFullYear();
                let candidate = new Date(year, mIdx - 1, day);
                if (formatDateStr(candidate) <= todayDateStr && (now.getMonth() + 1) > mIdx) {
                    candidate = new Date(year + 1, mIdx - 1, day);
                }
                return formatDateStr(candidate);
            }
        }

        // Numeric DD/MM format (e.g. "10/11")
        const slashMatch = lower.match(/\b(\d{1,2})\/(\d{1,2})\b/);
        if (slashMatch) {
            const day = parseInt(slashMatch[1], 10);
            const mIdx = parseInt(slashMatch[2], 10);
            if (mIdx >= 1 && mIdx <= 12 && day >= 1 && day <= 31) {
                return formatDateStr(new Date(now.getFullYear(), mIdx - 1, day));
            }
        }

        // Italian weekdays ("per martedì", "per prossimo martedì", "venerdì prossimo")
        // Note: use (?=\s|$|[.,;!?]) because JS \b fails after accented characters like ì
        const weekdaysMap = {
            'domenica': 0, 'lunedi': 1, 'lunedì': 1, 'martedi': 2, 'martedì': 2,
            'mercoledi': 3, 'mercoledì': 3, 'giovedi': 4, 'giovedì': 4,
            'venerdi': 5, 'venerdì': 5, 'sabato': 6
        };
        for (const [wName, wIdx] of Object.entries(weekdaysMap)) {
            if (new RegExp('(?:^|\\s|[.,;!?])' + wName + '(?=\\s|$|[.,;!?])', 'i').test(lower)) {
                let diff = wIdx - now.getDay();
                if (diff <= 0) diff += 7;
                let d = new Date(now);
                d.setDate(d.getDate() + diff);
                return formatDateStr(d);
            }
        }

        return tomorrowStr;
    }

    function hasExplicitDateMention(txt) {
        const lower = normalizeNumberWords(txt.toLowerCase());
        if (/\b(domani|dopodomani|tra\s+\d+\s+giorn|fra\s+\d+\s+giorn)\b/i.test(lower)) return true;
        if (/\b(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\b/i.test(lower)) return true;
        if (/\b\d{1,2}\/\d{1,2}\b/.test(lower)) return true;
        if (/(?:^|\s)(domenica|luned[iì]|marted[iì]|mercoled[iì]|gioved[iì]|venerd[iì]|sabato)(?=\s|$|[.,;!?])/i.test(lower)) return true;
        return false;
    }

    function stripDatesAndPoliteness(text) {
        let s = text;
        const monthPattern = '(?:gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)';
        const weekdayPattern = '(?:domenica|luned[iì]|marted[iì]|mercoled[iì]|gioved[iì]|venerd[iì]|sabato)';
        // Remove date phrases like "per il 3 novembre", "per l'11 novembre", "al 10 novembre", "il 3 novembre"
        s = s.replace(new RegExp("\\b(?:per\\s+il|per\\s+l['’]?|al|all['’]?|entro\\s+il|entro\\s+l['’]?|il|l['’]?|del)\\s*(?:\\d{1,2}|primo)\\s+" + monthPattern + "(?=\\s|$|[.,;!?])", 'gi'), '');
        s = s.replace(new RegExp("\\b(?:\\d{1,2}|primo)\\s+" + monthPattern + "(?=\\s|$|[.,;!?])", 'gi'), '');
        s = s.replace(new RegExp("(?:^|\\s)(?:per\\s+(?:il\\s+)?)?(?:prossim[oa]\\s+)?" + weekdayPattern + "(?:\\s+prossim[oa])?(?=\\s|$|[.,;!?])", 'gi'), ' ');
        s = s.replace(/\b(?:per\s+|al\s+|il\s+)?\d{1,2}\/\d{1,2}\b/gi, '');
        s = s.replace(/\b(?:per\s+domani|per\s+dopodomani|domani|dopodomani|per\s+oggi|oggi)\b/gi, '');
        s = s.replace(/\b(?:tra|fra)\s+\d+\s+giorn[oi]\b/gi, '');
        // Remove politeness & conversational tail phrases
        s = s.replace(/\b(?:per\s+cortesia|per\s+favore|per\s+piacere|cortesemente|grazie\s+mille|grazie|mi\s+raccomando)\b/gi, '');
        return s.replace(/\s+/g, ' ').trim();
    }

    function extractCleanTaskDetails(segmentRaw, subjectName) {
        let norm = normalizeNumberWords(segmentRaw).replace(/[?!]+/g, ' ');
        const hadExercisesWord = /\b(?:esercizio|esercizi|es\.)\b/i.test(norm);
        const hadStudyWord = /\b(?:studiare|studio|ripassare|ripasso|leggere|lettura)\b/i.test(norm);

        // 1. Strip dates and politeness expressions first
        norm = stripDatesAndPoliteness(norm);

        // 2. Remove subject mentions ("di matematica", "in matematica", "matematica")
        if (subjectName) {
            const escapedSub = subjectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            norm = norm.replace(new RegExp('\\b(?:di|in|per|su)\\s+' + escapedSub + '\\b', 'gi'), '');
            norm = norm.replace(new RegExp('\\b' + escapedSub + '\\b', 'gi'), '');
        }
        norm = norm.replace(/\b(?:di|in|per)?\s*\b(?:mate|matematica|ita|italiano|ingl|inglese|scienze|storia|filo|filosofia|biologia|fisica|chimica|latino|greco|arte|informatica|geografia|diritto|economia)\b/gi, '');

        // 3. Remove spoken ASR filler words & conversational lead-ins
        norm = norm.replace(/\b(?:come\s+compito(?:\s+per\s+casa)?|compito\s+per\s+casa|compiti\s+per\s+casa|per\s+casa|e\s+invece|invece|dica|sempre|poi\s+ho|l['’])\b/gi, ' ');
        norm = norm.replace(/\s+/g, ' ').trim();

        const leadInPattern = /^(?:(?:allora|guarda|senti|ciao|ehi|proxima|ascolta|vorrei|dovrei|devo|avrò\s+da\s+fare|avrei\s+da\s+fare|dovrò\s+fare|avrò|dovrò|ho\s+da\s+fare|ho\s+da|ho|bisogna|c['’]è\s+da|ci\s+sono\s+da|puoi|potresti|mi\s+puoi|aggiungi|aggiungere|metti|mettere|metterli|mettili|inserisci|inserire|segna|segnare|modifica|modificare|sposta|spostare|cambia|cambiare|fare|svolgere|completare|studiare|ripassare|leggere|scrivere|che\s+devo|come|compito|compiti|da|degli|dei|delle|dello|della|di|gli|le|i|l['’]|un|uno|una|qualche|alcuni|alcune|quegli|quei|quelle|questi|queste)\s+)+/i;
        norm = norm.replace(leadInPattern, '').trim();

        // 4. Clean up connectors like "riguardanti / riguardante / relativi a" into clean diary labels
        if (/^(\d+)\s+(?:esercizi\s+)?(?:riguardant[ei]|relativ[oi]\s+a|su|sull['’]|sulle|sui|sugli|sul|sulla)\s+/i.test(norm)) {
            norm = norm.replace(/^(\d+)\s+(?:esercizi\s+)?(?:riguardant[ei]|relativ[oi]\s+a)\s+/i, '$1 esercizi: ');
            norm = norm.replace(/^(\d+)\s+(?:riguardant[ei]|su|sull['’]|sulle|sui|sugli|sul|sulla)\s+/i, '$1 esercizi su ');
        } else if (/^(?:esercizi|compiti)\s+(?:riguardant[ei]|relativ[oi]\s+a)\s+/i.test(norm)) {
            norm = norm.replace(/^(?:esercizi|compiti)\s+(?:riguardant[ei]|relativ[oi]\s+a)\s+/i, 'Esercizi: ');
        } else if (/^(?:riguardant[ei]|relativ[oi]\s+a|sull['’]argomento|sulle|sui|sugli|sull['’]|sul|sulla|su)\s+/i.test(norm)) {
            const prefix = hadExercisesWord ? 'Esercizi su ' : (hadStudyWord ? 'Studio su ' : '');
            if (/^riguardant/i.test(norm) || /^relativ/i.test(norm) || /^sull['’]argomento/i.test(norm)) {
                norm = norm.replace(/^(?:riguardant[ei]|relativ[oi]\s+a|sull['’]argomento)\s+/i, hadExercisesWord ? 'Esercizi: ' : (hadStudyWord ? 'Studio: ' : 'Argomento: '));
            } else if (prefix) {
                norm = norm.replace(/^(?:sulle|sui|sugli|sull['’]|sul|sulla|su)\s+/i, prefix);
            } else {
                norm = 'Studio ' + norm;
            }
        } else if (!/^(?:\d+|eserciz|compit|studi|ripass|pagin|version|capitol|paragraf)/i.test(norm) && norm.length > 1) {
            if (hadExercisesWord) {
                norm = 'Esercizi: ' + norm;
            } else if (hadStudyWord) {
                norm = 'Studio: ' + norm;
            }
        }

        // Remove trailing stray prepositions & punctuation
        norm = norm.replace(/[.,;!?]+$/g, '').replace(/\s+\b(?:per|di|in|a|da|con|su|e|il|la|lo|l['’])\s*$/i, '').replace(/\s+/g, ' ').trim();

        if (/^\d+$/.test(norm)) {
            norm = norm + ' esercizi';
        }

        if (!norm || norm.length < 2) {
            return hadExercisesWord ? 'Esercizi' : ('Studio di ' + (subjectName || 'materia'));
        }
        return norm.charAt(0).toUpperCase() + norm.slice(1);
    }

    function findLastDiscussedOrSavedTask(preferredSubject) {
        // 1. Check saved tasks in myTodos first
        if (myTodos.length > 0) {
            if (preferredSubject) {
                const match = [...myTodos].reverse().find(t => (t.subject || '').toLowerCase() === preferredSubject.toLowerCase());
                if (match) return { source: 'saved', todo: match, subject: match.subject, details: match.title };
            }
            const last = myTodos[myTodos.length - 1];
            return { source: 'saved', todo: last, subject: last.subject, details: last.title };
        }
        // 2. Check recent proposed actions in aiChatHistory (in case user hasn't clicked Confirm yet!)
        for (let i = aiChatHistory.length - 1; i >= 0; i--) {
            const turn = aiChatHistory[i];
            if (turn && turn.actionCard && turn.actionCard.action) {
                const acts = Array.isArray(turn.actionCard.action) ? turn.actionCard.action : [turn.actionCard.action];
                for (const a of acts) {
                    if (a.type === 'add_task' || a.type === 'modify_task') {
                        if (!preferredSubject || (a.subject && a.subject.toLowerCase() === preferredSubject.toLowerCase())) {
                            return { source: 'pending', todo: null, subject: a.subject || preferredSubject || 'Matematica', details: a.details || 'Esercizi' };
                        }
                    }
                }
            }
        }
        return null;
    }

    function splitMultiIntentClauses(rawText) {
        // Protect "e mezzo" inside grades before splitting on " e "
        let protectedStr = rawText.replace(/\be\s+mezzo\b/gi, '__EMEZZO__');
        const subjectHead = '(?:matematica|italiano|inglese|filosofia|biologia|fisica|storia|chimica|scienze|latino|greco|arte|informatica|geografia|diritto|economia)';
        const splitRegex = new RegExp(
            '\\s*[.;,!?]+\\s*' +
            '|\\s+(?:e\\s+(?:poi\\s+|inoltre\\s+|anche\\s+)?|poi\\s+|inoltre\\s+)(?=(?:io\\s+)?(?:ho\\s+|devo\\s+|avrò\\s+|dovrò\\s+|c[\'’]è\\s+|vorrei\\s+|abbiamo\\s+|una?\\s+(?:verifica|compito|voto)|un[\'’]?interrogazion|verific|interrogazion|compit|eserci|vot|preso|ricevut|studi|ripass|modific|spost|cambi|elimin|togl|(?:\\d+|cinque|sei|sette|otto|nove|dieci)\\s+(?:di\\s+' + subjectHead + '|eserci|pagin|compit)))' +
            '|\\s+(?=(?:io\\s+)?(?:ho\\s+(?:preso|ricevuto|avuto|preso\\s+un|un\\s+voto|una?\\s+verifica|un[\'’]?interrogazion|un\\s+compito|da\\s+fare)|avrò\\s+da\\s+fare|dovrò\\s+fare))' +
            '|\\s+(?=(?:oggi|domani|dopodomani)\\s+(?:la\\s+verifica|il\\s+compito|l[\'’]?interrogazion|ho\\s+))',
            'gi'
        );

        let rawParts = protectedStr.split(splitRegex)
            .map(p => (p || '').replace(/__EMEZZO__/g, 'e mezzo').trim())
            .filter(p => p.length > 1);

        // Merge trailing subject stubs ("Di filosofia") backward and leading bare date stubs ("L'otto ottobre") forward
        const merged = [];
        let pendingPrefix = '';
        for (const rawPart of rawParts) {
            const part = rawPart.replace(/^(?:e\s+invece|invece)\s+/i, '').trim();
            const lowerP = part.toLowerCase();
            // Discard pure filler stubs with no subject/action/date
            if (!part || /^(?:poi\s+ho|allora|e\s+invece|invece|poi|io|oggi|domani|dica)$/i.test(lowerP)) {
                continue;
            }
            // If fragment is ONLY a trailing prepositional subject tag ("Di filosofia", "in matematica"), attach to previous clause!
            if (merged.length > 0 && /^(?:di|in|per)\s+[a-zàèéìòù]+(?:\s+[a-zàèéìòù]+)?$/i.test(lowerP) && findSubjectInSegment(part) !== null && !/\b(compit|eserci|verific|voto|preso)\b/i.test(lowerP)) {
                merged[merged.length - 1] = merged[merged.length - 1] + ' ' + part;
                continue;
            }
            // If fragment is ONLY a date mention without subject/action verb, carry it forward into the next clause!
            if (hasExplicitDateMention(part) && findSubjectInSegment(part) === null && !/\b(compit|eserci|verific|interrogaz|voto|preso|studi|ripass|fare|avrò|ho|devo)\b/i.test(lowerP)) {
                pendingPrefix = pendingPrefix ? (pendingPrefix + ' ' + part) : part;
                continue;
            }
            const combined = pendingPrefix ? (pendingPrefix + ' ' + part) : part;
            pendingPrefix = '';
            merged.push(combined);
        }
        if (pendingPrefix && merged.length > 0) {
            merged[merged.length - 1] = merged[merged.length - 1] + ' ' + pendingPrefix;
        }

        return merged.length > 0 ? merged : [rawText.trim()];
    }

    function parseLocalStudyActions(rawText) {
        const clauses = splitMultiIntentClauses(rawText);
        const allActions = [];
        let lastSubjectContext = null;

        clauses.forEach(clauseRaw => {
            const normClause = normalizeNumberWords(clauseRaw.trim());
            const lower = normClause.toLowerCase();
            const explicitSub = findSubjectInSegment(normClause);
            if (explicitSub) lastSubjectContext = explicitSub;
            const clauseDate = hasExplicitDateMention(normClause) ? parseDateFromText(normClause) : tomorrowStr;

            // 0. Check MODIFY / MOVE / RESCHEDULE in this clause
            const isModifyIntent = /\b(modifica|modificare|sposta|spostare|cambia|cambiare|rimanda|rimandare|posticipa|posticipare|metterli|mettili|metti\s+quegli|metti\s+quei|aggiorna)\b/i.test(lower);
            if (isModifyIntent) {
                const isExamMod = /\b(verifica|verifiche|interrogazione|esame)\b/i.test(lower);
                if (isExamMod && myExams.length > 0) {
                    const targetExam = explicitSub
                        ? ([...myExams].reverse().find(e => e.subject.toLowerCase() === explicitSub.toLowerCase()) || myExams[myExams.length - 1])
                        : myExams[myExams.length - 1];
                    const pagMatch = normClause.match(/(\d+)\s*(pag|pagine|esercizi)/i);
                    allActions.push({
                        type: 'modify_exam',
                        examId: targetExam.id,
                        subject: targetExam.subject,
                        date: clauseDate,
                        pages: pagMatch ? parseInt(pagMatch[1], 10) : targetExam.pages
                    });
                    return;
                }

                const existingRef = findLastDiscussedOrSavedTask(explicitSub);
                const targetSub = explicitSub || (existingRef ? existingRef.subject : (lastSubjectContext || userSubjects[0] || 'Matematica'));
                const preservedDetails = existingRef ? existingRef.details : ('Esercizi di ' + targetSub);
                allActions.push({
                    type: 'modify_task',
                    todoId: existingRef && existingRef.todo ? existingRef.todo.id : null,
                    subject: targetSub,
                    date: clauseDate,
                    details: preservedDetails
                });
                return;
            }

            // 0b. Check DELETE / REMOVE in this clause
            const isDeleteIntent = /\b(elimina|eliminare|cancella|cancellare|togli|togliere|rimuovi|rimuovere)\b/i.test(lower);
            if (isDeleteIntent) {
                const existingRef = findLastDiscussedOrSavedTask(explicitSub);
                allActions.push({
                    type: 'remove_task',
                    todoId: existingRef && existingRef.todo ? existingRef.todo.id : null,
                    subject: explicitSub || (existingRef ? existingRef.subject : (lastSubjectContext || userSubjects[0] || 'Matematica')),
                    details: existingRef ? existingRef.details : 'Compito'
                });
                return;
            }

            // 1. Check Grade in this clause ("ho preso 8 in matematica", "ho un voto...")
            const isGradeIntent = /\b(voto|preso|ottenuto|registrare\s+voto|registra\s+\d)\b/i.test(lower);
            if (isGradeIntent) {
                const sub = explicitSub || lastSubjectContext || userSubjects[0] || 'Matematica';
                const gMatch = normClause.match(/\b(10|[2-9])(\.5|\,5|\+|\-|\s*e\s*mezzo)?\b/i);
                let gradeVal = gMatch ? gMatch[0].replace(',', '.').replace(/\s*e\s*mezzo/i, '.5') : '7';
                allActions.push({
                    type: 'add_grade',
                    subject: sub,
                    value: gradeVal,
                    date: formatDateStr(new Date())
                });
                return;
            }

            // 2. Check Exam / Interrogazione in this clause
            const isExamIntent = /\b(verifica|verifiche|interrogazione|interrogazioni|esame|compito\s+in\s+classe)\b/i.test(lower);
            if (isExamIntent) {
                const sub = explicitSub || lastSubjectContext || userSubjects[0] || 'Storia';
                const pagMatch = normClause.match(/(\d+)\s*(pag|pagine|esercizi)/i);
                const pages = pagMatch ? parseInt(pagMatch[1], 10) : 20;
                const exType = lower.includes('interrogazion') ? 'Interrogazione' : 'Verifica';
                allActions.push({
                    type: 'add_exam',
                    examType: exType,
                    subject: sub,
                    date: clauseDate,
                    pages: pages
                });
                return;
            }

            // 3. Check Homework / Exercises / Study task in this clause
            const cleanedForIntent = lower.replace(/\b(fare\s+in\s+modo|aver\s+a\s+che\s+fare|cosa\s+puoi\s+fare|cosa\s+sai\s+fare|come\s+si\s+fa|fare\s+una\s+domanda)\b/gi, '');
            const hasExplicitSchoolKeyword = /\b(compito|compiti|esercizio|esercizi|studiare|ripassare|pagine|pagina|capitolo|paragrafo|versione|ricerca|tema|riflessione|es\.)\b/i.test(cleanedForIntent);
            if (hasExplicitSchoolKeyword || explicitSub !== null) {
                const sub = explicitSub || lastSubjectContext || userSubjects[0] || 'Matematica';
                const details = extractCleanTaskDetails(normClause, sub);
                allActions.push({
                    type: 'add_task',
                    subject: sub,
                    date: clauseDate,
                    details: details
                });
            }
        });

        return allActions.length > 0 ? allActions : null;
    }

    function formatActionDescription(actionOrArray) {
        if (!actionOrArray) return 'Azione rilevata';
        const list = Array.isArray(actionOrArray) ? actionOrArray : [actionOrArray];
        return list.map(act => {
            if (act.type === 'add_task') {
                return '• Compito di ' + act.subject + ': "' + (act.details || 'Esercizi') + '" (scadenza ' + formatDateShort(act.date || tomorrowStr) + ')';
            }
            if (act.type === 'modify_task') {
                return '• Sposta/Modifica compito di ' + act.subject + ': "' + (act.details || 'Esercizi') + '" → nuova scadenza ' + formatDateShort(act.date || tomorrowStr);
            }
            if (act.type === 'remove_task') {
                return '• Rimuovi compito di ' + act.subject + ': "' + (act.details || 'Compito') + '"';
            }
            if (act.type === 'add_exam') {
                return '• ' + (act.examType || 'Verifica') + ' di ' + act.subject + ': ' + (act.pages || 20) + ' pag. per il ' + formatDateShort(act.date || tomorrowStr);
            }
            if (act.type === 'modify_exam') {
                return '• Sposta/Modifica verifica di ' + act.subject + ' → nuova data ' + formatDateShort(act.date || tomorrowStr) + ' (' + (act.pages || 20) + ' pag.)';
            }
            if (act.type === 'add_grade') {
                return '• Voto ' + act.value + ' in ' + act.subject + ' (' + getQuadrimestreForDate(formatDateStr(new Date())) + ')';
            }
            return '• Aggiornamento piano di studio';
        }).join('\n');
    }

    window.processStudyAiCommand = async function(rawText) {
        const text = rawText.toLowerCase().trim();

        const threadEl = document.getElementById('ai-chat-thread');
        const welcomeEl = document.getElementById('ai-welcome-container');
        if (welcomeEl) welcomeEl.style.display = 'none';

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'proxima-turn ai-turn';
        loadingDiv.id = 'ai-msg-loading';
        loadingDiv.innerHTML = `
            <div class="proxima-turn-header">
                <div class="proxima-ai-avatar">${PROXIMA_CUBE_SVG}</div>
                <span class="proxima-turn-name">Proxima</span>
            </div>
            <div class="proxima-turn-body"><i class="fa-solid fa-circle-notch fa-spin"></i> Elaborazione in corso...</div>
        `;
        if (threadEl) {
            threadEl.appendChild(loadingDiv);
            scrollAiViewportToBottom();
        }

        const removeLoading = () => {
            const el = document.getElementById('ai-msg-loading');
            if (el) el.remove();
        };

        // 1. If Gemini API Key is present, call Gemini 2.5 Flash (with fallback to 2.0 Flash)
        if (geminiApiKey && geminiApiKey.trim().length > 10) {
            const recentTurnsSummary = aiChatHistory.slice(-4).map(m => (m.sender === 'user' ? 'Studente: ' : 'Proxima: ') + m.text).join('\n');
            const systemPrompt = `Sei Proxima, l'assistente AI integrato in Study Planner.
Rispondi sempre in italiano in modo conciso, chiaro, naturale e senza MAI usare grassetto o asterischi (**).
Oggi è ${todayDateStr} e domani è ${tomorrowStr}.
Materie dello studente: ${userSubjects.join(', ')}.
Compiti attuali in agenda: ${myTodos.map(t => '[id:' + t.id + '] "' + t.title + '" (' + t.subject + ', scadenza ' + t.deadline + ')').join('; ') || 'Nessuno'}.
Verifiche attuali: ${myExams.map(e => '[id:' + e.id + '] ' + e.subject + ' il ' + e.date + ' (' + (e.pages || 20) + ' pag)').join('; ') || 'Nessuna'}.
Voti registrati: ${myGrades.map(g => g.subject + ': ' + g.displayValue).join('; ') || 'Nessuno'}.
Contesto recente della conversazione:
${recentTurnsSummary || 'Inizio conversazione'}

REGOLE FONDAMENTALI PER I TITOLI ("details"), MULTI-AZIONE E MODIFICHE:
1. Estrai TUTTE le azioni presenti nel messaggio dello studente (anche se nel testo ci sono insieme compiti, verifiche E voti nella stessa frase senza punteggiatura!). Metti OGNI azione rilevata come elemento dell'array JSON, senza saltarne nessuna.
2. Nel campo "details" NON copiare MAI la frase intera dello studente (es. NON scrivere "devo fare degli esercizi riguardanti le funzioni per il 3 novembre" e NON scrivere "puoi modificare quegli esercizi"). Scrivi SOLO un titolo sintetico da diario scolastico, ad esempio: "Esercizi: le funzioni", "5 esercizi sulle funzioni", "Dante: riflessione personale", "Studio cap. 4".
3. Se lo studente chiede di MODIFICARE o SPOSTARE di data un compito/esercizio già detto o presente (es. "modifica quegli esercizi per l'11 novembre"), usa "type": "modify_task" mantenendo il titolo originale pulito dell'esercizio e cambiando solo "date" con la nuova data YYYY-MM-DD!
4. Inserisci OBBLIGATORIAMENTE in fondo alla risposta il blocco JSON esatto con TUTTE le azioni trovate:
###JSON_ACTION: [{"type": "add_task", "subject": "NomeMateria", "date": "YYYY-MM-DD", "details": "Esercizi: argomento"}]###
Tipi supportati:
- Aggiungere compito: {"type": "add_task", "subject": "NomeMateria", "date": "YYYY-MM-DD", "details": "Titolo sintetico"}
- Modificare/Spostare compito: {"type": "modify_task", "subject": "NomeMateria", "date": "YYYY-MM-DD", "details": "Titolo sintetico originale"}
- Rimuovere compito: {"type": "remove_task", "subject": "NomeMateria", "details": "Titolo sintetico"}
- Aggiungere verifica: {"type": "add_exam", "subject": "NomeMateria", "date": "YYYY-MM-DD", "pages": 25}
- Modificare verifica: {"type": "modify_exam", "subject": "NomeMateria", "date": "YYYY-MM-DD", "pages": 25}
- Registrare voto: {"type": "add_grade", "subject": "NomeMateria", "value": "8"}

Messaggio dello studente: "${rawText}"`;

            const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash'];
            for (const modelName of modelsToTry) {
                try {
                    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey.trim()}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
                    });

                    if (resp.ok) {
                        const data = await resp.json();
                        let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        if (reply) {
                            removeLoading();
                            let actionCard = null;
                            if (reply.includes('###JSON_ACTION:')) {
                                const parts = reply.split('###JSON_ACTION:');
                                reply = parts[0].trim();
                                const jsonStr = parts[1].split('###')[0].trim();
                                try {
                                    let parsedActions = JSON.parse(jsonStr);
                                    const actList = Array.isArray(parsedActions) ? parsedActions : [parsedActions];
                                    const userAskedModify = /\b(modifica|modificare|sposta|spostare|cambia|cambiare|metterli|mettili)\b/i.test(rawText);
                                    actList.forEach(a => {
                                        if (userAskedModify && a.type === 'add_task') {
                                            a.type = 'modify_task';
                                        }
                                        if (a.type === 'modify_task') {
                                            const prevRef = findLastDiscussedOrSavedTask(a.subject);
                                            if (prevRef) {
                                                // Always preserve the original clean task description when modifying the date!
                                                a.details = prevRef.details;
                                                if (prevRef.todo) {
                                                    a.todoId = prevRef.todo.id;
                                                }
                                            }
                                        } else if (a.type === 'add_task' && a.details) {
                                            if (/\b(devo\s+fare|vorrei|puoi|riguardant|per\s+il|per\s+l['’])\b/i.test(a.details)) {
                                                a.details = extractCleanTaskDetails(a.details, a.subject);
                                            }
                                        }
                                    });
                                    actionCard = {
                                        desc: formatActionDescription(actList),
                                        action: actList
                                    };
                                } catch(e){}
                            }
                            reply = reply.replace(/\*\*/g, '').replace(/\*/g, '');
                            appendChatMessage('ai', reply, actionCard);
                            speakAiVoice(reply);
                            return;
                        }
                    }
                } catch (err) {
                    console.warn('Gemini model ' + modelName + ' error:', err);
                }
            }
        }

        // 2. Smart Local NLU Engine (Offline / No API Key needed for tasks, modifications, exams, grades)
        removeLoading();
        const detectedActions = parseLocalStudyActions(rawText);

        if (detectedActions && detectedActions.length > 0) {
            const descText = formatActionDescription(detectedActions);
            let reply = '';
            if (detectedActions.length > 1) {
                reply = `Ho rilevato ${detectedActions.length} attività separate. Puoi toccare il testo di ciascuna per modificarla e scegliere quale aggiungere:`;
            } else {
                const first = detectedActions[0];
                if (first.type === 'add_task') {
                    reply = `Ho preparato questo compito di ${first.subject}. Puoi toccare il titolo per modificarlo prima di aggiungerlo:`;
                } else if (first.type === 'modify_task') {
                    reply = `Ho preparato lo spostamento del compito di ${first.subject} al ${formatDateShort(first.date)}.`;
                } else if (first.type === 'remove_task') {
                    reply = `Vuoi rimuovere questo compito di ${first.subject}?`;
                } else if (first.type === 'add_exam') {
                    reply = `Ho preparato questa ${first.examType || 'verifica'} di ${first.subject} per il ${formatDateShort(first.date)}.`;
                } else if (first.type === 'modify_exam') {
                    reply = `Ho preparato lo spostamento della verifica di ${first.subject} al ${formatDateShort(first.date)}.`;
                } else if (first.type === 'add_grade') {
                    reply = `Ho preparato la registrazione di questo voto in ${first.subject}.`;
                }
            }

            appendChatMessage('ai', reply, { desc: descText, action: detectedActions });
            speakAiVoice(reply);
            return;
        }

        // 3. Conversational greeting or general message
        if (/^(ciao|ehi|buongiorno|buonasera|salve|hello|hey)\b/i.test(text)) {
            const greetReply = `Ciao ${getUserName()}! Sono Proxima. Dimmi pure quali esercizi o compiti hai da fare, quali verifiche devi preparare o se vuoi spostare un compito già inserito.`;
            appendChatMessage('ai', greetReply);
            speakAiVoice(greetReply);
            return;
        }

        const fallbackReply = `Puoi dirmi ad esempio: "Esercizi di matematica sulle funzioni per il 3 novembre", "Modifica quegli esercizi per l'11 novembre", "Verifica di storia il 20 novembre 30 pagine" oppure "Ho preso 8 in fisica".`;
        appendChatMessage('ai', fallbackReply);
        speakAiVoice(fallbackReply);
    };

    window.executePendingAiActionById = function(actionId, btnEl) {
        const actionPayload = window.pendingAiActionsStore[actionId];
        if (!actionPayload) return;
        if (btnEl) {
            btnEl.disabled = true;
            btnEl.innerHTML = '<i class="fa-solid fa-check-double"></i> Confermato';
            btnEl.style.opacity = '0.65';
        }
        window.executePendingAiAction(actionPayload);
    };

    window.executePendingAiAction = function(actionOrArray, silent = false) {
        if (!actionOrArray) return;
        const actions = Array.isArray(actionOrArray) ? actionOrArray : [actionOrArray];
        let changedTodos = false;
        let changedExams = false;
        let changedGrades = false;
        let xpGain = 0;

        actions.forEach(actionObj => {
            if (actionObj.type === 'add_task') {
                const deadline = actionObj.date || tomorrowStr;
                const assignedDate = calculateAssignedDate(deadline, 2, 2, todayDateStr, []);
                const cleanTitle = (actionObj.details && !/\b(devo fare|puoi modificare)\b/i.test(actionObj.details))
                    ? actionObj.details
                    : extractCleanTaskDetails(actionObj.details || '', actionObj.subject);
                const newTodo = {
                    id: 'td_' + generateId(),
                    subject: actionObj.subject || userSubjects[0] || 'Matematica',
                    title: cleanTitle,
                    priority: 2,
                    difficulty: 2,
                    deadline: deadline,
                    assignedDate: assignedDate,
                    repeat: false,
                    createdAt: todayDateStr,
                    excludedDays: []
                };
                myTodos.push(newTodo);
                changedTodos = true;
                xpGain += 25;
            } else if (actionObj.type === 'modify_task') {
                const newDeadline = actionObj.date || tomorrowStr;
                let targetTodo = null;
                if (actionObj.todoId) {
                    targetTodo = myTodos.find(t => t.id === actionObj.todoId);
                }
                if (!targetTodo && actionObj.subject) {
                    targetTodo = [...myTodos].reverse().find(t => (t.subject || '').toLowerCase() === actionObj.subject.toLowerCase());
                }
                if (!targetTodo && myTodos.length > 0) {
                    targetTodo = myTodos[myTodos.length - 1];
                }

                if (targetTodo) {
                    // Strictly update ONLY the date/deadline and keep targetTodo.title untouched!
                    targetTodo.deadline = newDeadline;
                    targetTodo.assignedDate = calculateAssignedDate(newDeadline, targetTodo.priority || 2, targetTodo.difficulty || 2, todayDateStr, targetTodo.excludedDays || []);
                    changedTodos = true;
                } else {
                    // Task wasn't confirmed yet previously; add it now with the clean title and updated date
                    const assignedDate = calculateAssignedDate(newDeadline, 2, 2, todayDateStr, []);
                    myTodos.push({
                        id: 'td_' + generateId(),
                        subject: actionObj.subject || userSubjects[0] || 'Matematica',
                        title: actionObj.details || ('Esercizi di ' + (actionObj.subject || 'Matematica')),
                        priority: 2,
                        difficulty: 2,
                        deadline: newDeadline,
                        assignedDate: assignedDate,
                        repeat: false,
                        createdAt: todayDateStr,
                        excludedDays: []
                    });
                    changedTodos = true;
                    xpGain += 25;
                }
            } else if (actionObj.type === 'remove_task') {
                let idxToRemove = -1;
                if (actionObj.todoId) {
                    idxToRemove = myTodos.findIndex(t => t.id === actionObj.todoId);
                }
                if (idxToRemove === -1 && actionObj.subject) {
                    for (let i = myTodos.length - 1; i >= 0; i--) {
                        if ((myTodos[i].subject || '').toLowerCase() === actionObj.subject.toLowerCase()) {
                            idxToRemove = i;
                            break;
                        }
                    }
                }
                if (idxToRemove === -1 && myTodos.length > 0) {
                    idxToRemove = myTodos.length - 1;
                }
                if (idxToRemove !== -1) {
                    myTodos.splice(idxToRemove, 1);
                    changedTodos = true;
                }
            } else if (actionObj.type === 'add_exam') {
                const examDate = actionObj.date || tomorrowStr;
                const newExam = {
                    id: 'ex_' + generateId(),
                    type: actionObj.examType || 'Verifica',
                    subject: actionObj.subject || userSubjects[0] || 'Storia',
                    date: examDate,
                    startDate: todayDateStr,
                    pages: parseInt(actionObj.pages, 10) || 20,
                    specificInterrogazioneDates: [],
                    progress: {},
                    excludedDays: [],
                    snoozedDays: []
                };
                myExams.push(newExam);
                changedExams = true;
                xpGain += 40;
            } else if (actionObj.type === 'modify_exam') {
                let targetExam = actionObj.examId ? myExams.find(e => e.id === actionObj.examId) : null;
                if (!targetExam && actionObj.subject) {
                    targetExam = [...myExams].reverse().find(e => (e.subject || '').toLowerCase() === actionObj.subject.toLowerCase());
                }
                if (!targetExam && myExams.length > 0) {
                    targetExam = myExams[myExams.length - 1];
                }
                if (targetExam) {
                    if (actionObj.date) targetExam.date = actionObj.date;
                    if (actionObj.pages) targetExam.pages = parseInt(actionObj.pages, 10) || targetExam.pages;
                    changedExams = true;
                }
            } else if (actionObj.type === 'add_grade') {
                const rawVal = String(actionObj.value || '7');
                const nowDateStr = formatDateStr(new Date());
                const newGrade = {
                    id: 'gr_' + generateId(),
                    subject: actionObj.subject || userSubjects[0] || 'Matematica',
                    displayValue: rawVal,
                    numericValue: parseGradeNumeric(rawVal) || 7.0,
                    quadrimestre: getQuadrimestreForDate(nowDateStr),
                    date: nowDateStr
                };
                myGrades.push(newGrade);
                changedGrades = true;
                xpGain += 20;
            }
        });

        if (changedTodos) {
            localStorage.setItem('studylog_todos', JSON.stringify(myTodos));
        }
        if (changedExams) {
            localStorage.setItem('studylog_exams', JSON.stringify(myExams));
        }
        if (changedGrades) {
            localStorage.setItem('studylog_grades', JSON.stringify(myGrades));
            try { renderGradesView(); } catch(e){}
        }
        if (xpGain > 0) {
            addXP(xpGain);
        }

        try { updateAllDots(); } catch(e){}
        try { if (selectedDateStr) generateTasksForDate(selectedDateStr); } catch(e){}
        try { updateWeeklyChart(); } catch(e){}
        try { renderMonthCalendar(); } catch(e){}
        try { renderSubjectDonutChart(); } catch(e){}
        try { updateDashboard(); } catch(e){}

        showToast(xpGain > 0 ? `Aggiunto al diario! +${xpGain} XP` : 'Diario aggiornato con successo!');
        if (!silent) {
            appendChatMessage('ai', 'Perfetto! Ho aggiornato il tuo diario di studio.');
            speakAiVoice('Perfetto! Ho aggiornato il tuo diario di studio.');
        }
    };

    function updateGeminiKeyStatusUI() {
        const statusEl = document.getElementById('gemini-key-status');
        const input = document.getElementById('settings-gemini-key-input');
        if (input && typeof geminiApiKey !== 'undefined' && geminiApiKey) input.value = geminiApiKey;
        if (statusEl) {
            if (typeof geminiApiKey !== 'undefined' && geminiApiKey) {
                statusEl.innerHTML = '<span style="color:#10B981;"><i class="fa-solid fa-check"></i> Chiave Gemini attiva (Chat Cloud + Audio FreeFlow)</span>';
            } else {
                statusEl.innerHTML = '<span>Motore locale Proxima attivo (inserisci una chiave per chat cloud e audio HD)</span>';
            }
        }
        updateGroqKeyStatusUI();
    }

    function updateGroqKeyStatusUI() {
        const gStatusEl = document.getElementById('groq-key-status');
        const gInput = document.getElementById('settings-groq-key-input');
        if (gInput && typeof groqApiKey !== 'undefined' && groqApiKey) gInput.value = groqApiKey;
        if (gStatusEl) {
            if (typeof groqApiKey !== 'undefined' && groqApiKey) {
                gStatusEl.innerHTML = '<span style="color:#10B981;"><i class="fa-solid fa-check"></i> Groq Whisper FreeFlow attivo</span>';
            } else {
                gStatusEl.innerHTML = '<span>Opzionale: con Groq usa Whisper V3 Turbo identico a FreeFlow</span>';
            }
        }
    }

    window.saveGeminiApiKeyFromSettings = function() {
        const input = document.getElementById('settings-gemini-key-input');
        if (!input) return;
        let val = input.value.trim();
        geminiApiKey = val;
        localStorage.setItem('studylog_gemini_key', val);
        updateGeminiKeyStatusUI();
        showToast(val ? 'Chiave Gemini salvata con successo!' : 'Chiave Gemini rimossa');
    };

    window.saveGroqApiKeyFromSettings = function() {
        const input = document.getElementById('settings-groq-key-input');
        if (!input) return;
        let val = input.value.trim();
        groqApiKey = val;
        localStorage.setItem('studylog_groq_key', val);
        updateGroqKeyStatusUI();
        showToast(val ? 'Chiave Groq FreeFlow salvata!' : 'Chiave Groq rimossa');
    };

    window.executeHardReset = function() { 
        localStorage.clear(); 
        localStorage.setItem('studylog_record_streak', '0'); 
        window.location.reload(true); 
    };

    init();
