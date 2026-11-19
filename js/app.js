    // ==========================================================================
    // FLOATING FAB EXPANDABLE ACTION MENU (Pinterest Spring Animation Specification)
    // ==========================================================================
    window.toggleFabMenu = function() {
        const menu = document.getElementById('dock-fab-menu');
        const backdrop = document.getElementById('dock-fab-backdrop');
        const btn = document.getElementById('dock-fab-btn');
        if (!menu || !btn) return;
        const isOpen = menu.classList.contains('is-open');
        if (isOpen) {
            window.closeFabMenu();
        } else {
            menu.classList.add('is-open');
            if (backdrop) backdrop.classList.add('is-open');
            btn.classList.add('is-active');
        }
    };

    window.closeFabMenu = function() {
        const menu = document.getElementById('dock-fab-menu');
        const backdrop = document.getElementById('dock-fab-backdrop');
        const btn = document.getElementById('dock-fab-btn');
        if (menu) menu.classList.remove('is-open');
        if (backdrop) backdrop.classList.remove('is-open');
        if (btn) btn.classList.remove('is-active');
    };

    window.selectFabAction = function(actionType) {
        window.closeFabMenu();
        if (actionType === 'todo') {
            window.openTodoModal();
        } else if (actionType === 'exam') {
            window.openExamModal();
        }
    };

    window.executeHardReset = function() { 
        localStorage.clear(); 
        localStorage.setItem('studylog_record_streak', '0'); 
        window.location.reload(true); 
    };

    init();
