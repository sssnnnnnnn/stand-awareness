// ========== Application State Management ==========
class JournalApp {
    constructor() {
        this.currentView = 'today';
        this.currentEntry = null;
        this.currentDate = null;
        this.isEditing = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadInitialData();
    }

    initializeElements() {
        // Navigation elements
        this.sidebar = document.getElementById('sidebar');
        this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
        this.navItems = document.querySelectorAll('.nav-item');
        
        // Calendar elements
        this.calendarWidget = document.getElementById('calendarWidget');
        this.calendarTitle = document.getElementById('calendarTitle');
        this.calendarDays = document.getElementById('calendarDays');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.currentCalendarDate = new Date();
        
        // View elements
        this.views = document.querySelectorAll('.view');
        this.todayView = document.getElementById('todayView');
        this.historyView = document.getElementById('historyView');
        this.entryDetailView = document.getElementById('entryDetailView');
        this.editView = document.getElementById('editView');
        
        // Form elements
        this.diaryForm = document.getElementById('diaryForm');
        this.editDiaryForm = document.getElementById('editDiaryForm');
        this.textareas = {
            goodNew: document.getElementById('goodNew'),
            events: document.getElementById('events'),
            growth: document.getElementById('growth'),
            tasks: document.getElementById('tasks')
        };
        this.editTextareas = {
            goodNew: document.getElementById('editGoodNew'),
            events: document.getElementById('editEvents'),
            growth: document.getElementById('editGrowth'),
            tasks: document.getElementById('editTasks')
        };
        
        // Action elements
        this.syncBtn = document.getElementById('syncBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.datePicker = document.getElementById('datePicker');
        this.diaryList = document.getElementById('diaryList');
        
        // Sync modal elements
        this.syncModal = document.getElementById('syncModal');
        this.closeSyncModal = document.getElementById('closeSyncModal');
        this.githubToken = document.getElementById('githubToken');
        this.saveTokenBtn = document.getElementById('saveTokenBtn');
        this.testSyncBtn = document.getElementById('testSyncBtn');
        this.fullSyncBtn = document.getElementById('fullSyncBtn');
        this.statusDot = document.getElementById('statusDot');
        this.statusText = document.getElementById('statusText');
        
        // Entry detail elements
        this.entryContent = document.getElementById('entryContent');
        this.entryDate = document.getElementById('entryDate');
        this.editEntryBtn = document.getElementById('editEntryBtn');
        this.copyEntryBtn = document.getElementById('copyEntryBtn');
        this.backToHistoryBtn = document.getElementById('backToHistoryBtn');
        
        // Edit view elements
        this.editDate = document.getElementById('editDate');
        this.deleteEntryBtn = document.getElementById('deleteEntryBtn');
        this.backFromEditBtn = document.getElementById('backFromEditBtn');
        
        // UI elements
        this.pageTitle = document.getElementById('pageTitle');
        this.currentDateEl = document.getElementById('currentDate');
        this.toast = document.getElementById('toast');
        this.recentEntries = document.getElementById('recentEntries');
        this.totalEntries = document.getElementById('totalEntries');
        this.currentStreak = document.getElementById('currentStreak');
    }

    bindEvents() {
        // Navigation events
        this.mobileMenuToggle?.addEventListener('click', () => this.toggleSidebar());
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });
        
        // Form events
        this.diaryForm?.addEventListener('submit', (e) => this.handleSave(e));
        this.editDiaryForm?.addEventListener('submit', (e) => this.handleUpdate(e));
        this.clearBtn?.addEventListener('click', () => this.handleClear());
        
        // Action events
        this.syncBtn?.addEventListener('click', () => this.openSyncModal());
        this.copyBtn?.addEventListener('click', () => this.handleCopy());
        this.copyEntryBtn?.addEventListener('click', () => this.handleCopyEntry());
        this.datePicker?.addEventListener('change', (e) => this.handleDateSearch(e));
        
        // Sync modal events
        this.closeSyncModal?.addEventListener('click', () => this.closeSyncModalHandler());
        this.saveTokenBtn?.addEventListener('click', () => this.saveToken());
        this.testSyncBtn?.addEventListener('click', () => this.testSync());
        this.fullSyncBtn?.addEventListener('click', () => this.fullSync());
        this.syncModal?.addEventListener('click', (e) => {
            if (e.target === this.syncModal) this.closeSyncModalHandler();
        });
        
        // Calendar events
        this.prevMonthBtn?.addEventListener('click', () => this.previousMonth());
        this.nextMonthBtn?.addEventListener('click', () => this.nextMonth());
        
        // Entry detail events
        this.editEntryBtn?.addEventListener('click', () => this.showEditView());
        this.backToHistoryBtn?.addEventListener('click', () => this.showHistoryView());
        this.backFromEditBtn?.addEventListener('click', () => this.showEntryDetail());
        this.deleteEntryBtn?.addEventListener('click', () => this.handleDelete());
        
        // Auto-save for today's entry
        Object.values(this.textareas).forEach(textarea => {
            textarea?.addEventListener('input', () => this.autoSave());
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Responsive sidebar
        window.addEventListener('resize', () => this.handleResize());
        
        // Close sidebar on outside click (mobile)
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    loadInitialData() {
        this.displayCurrentDate();
        this.loadTodayEntry();
        this.updateStats();
        this.loadRecentEntries();
        this.renderCalendar();
        this.showView('today');
        this.initializeSync();
    }

    // ========== View Management ==========
    showView(viewName) {
        this.currentView = viewName;
        
        // Update active nav item
        this.navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });
        
        // Show corresponding view
        this.views.forEach(view => {
            view.classList.toggle('active', view.id === `${viewName}View`);
        });
        
        // Update page title
        const titles = {
            today: '今日の日記',
            history: '履歴',
            entryDetail: '日記詳細',
            edit: '日記を編集'
        };
        this.pageTitle.textContent = titles[viewName] || titles.today;
        
        // Load view-specific data
        switch (viewName) {
            case 'today':
                this.loadTodayEntry();
                break;
            case 'history':
                this.loadDiaryHistory();
                break;
        }
    }

    showEntryDetail(dateStr = this.currentDate) {
        this.currentDate = dateStr;
        const data = this.getEntry(dateStr);
        
        if (!data) {
            this.showToast('日記が見つかりませんでした', 'error');
            return;
        }
        
        this.currentEntry = data;
        this.entryDate.textContent = this.formatDateForDisplay(dateStr);
        this.renderEntryContent(data);
        this.showView('entryDetail');
    }

    showEditView() {
        if (!this.currentEntry || !this.currentDate) return;
        
        this.editDate.textContent = this.formatDateForDisplay(this.currentDate);
        this.populateEditForm(this.currentEntry);
        this.showView('edit');
    }

    showHistoryView() {
        this.showView('history');
    }

    // ========== Navigation Handlers ==========
    handleNavigation(e) {
        const viewName = e.currentTarget.dataset.view;
        if (viewName) {
            this.showView(viewName);
        }
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('open');
    }

    handleResize() {
        if (window.innerWidth > 1024) {
            this.sidebar.classList.remove('open');
        }
    }

    handleOutsideClick(e) {
        if (window.innerWidth <= 1024 && 
            this.sidebar.classList.contains('open') && 
            !this.sidebar.contains(e.target) && 
            !this.mobileMenuToggle.contains(e.target)) {
            this.sidebar.classList.remove('open');
        }
    }

    // ========== Data Management ==========
    getStorageKey(date = new Date()) {
        const dateStr = date instanceof Date ? 
            date.toISOString().split('T')[0] : date;
        return `diary-${dateStr}`;
    }

    getEntry(dateStr) {
        try {
            const key = this.getStorageKey(dateStr);
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading entry:', error);
            return null;
        }
    }

    saveEntry(dateStr, data) {
        try {
            const key = this.getStorageKey(dateStr);
            const entryData = {
                ...data,
                timestamp: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };
            localStorage.setItem(key, JSON.stringify(entryData));
            return true;
        } catch (error) {
            console.error('Error saving entry:', error);
            return false;
        }
    }

    deleteEntry(dateStr) {
        try {
            const key = this.getStorageKey(dateStr);
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error deleting entry:', error);
            return false;
        }
    }

    getAllEntries() {
        const entries = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('diary-')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    const dateMatch = key.match(/diary-(.+)/);
                    if (dateMatch) {
                        entries.push({
                            date: dateMatch[1],
                            data: data
                        });
                    }
                } catch (error) {
                    console.error('Error parsing entry:', error);
                }
            }
        }
        return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // ========== Form Handlers ==========

    handleUpdate(e) {
        e.preventDefault();
        
        if (!this.currentDate) return;
        
        const data = this.getFormData(this.editTextareas);
        
        if (this.saveEntry(this.currentDate, data)) {
            this.currentEntry = { ...this.currentEntry, ...data };
            this.showToast('日記を更新しました！', 'success');
            this.updateStats();
            this.loadRecentEntries();
            this.updateCalendar();
            this.showEntryDetail(this.currentDate);
        } else {
            this.showToast('更新に失敗しました', 'error');
        }
    }

    handleClear() {
        if (confirm('本当に日記をクリアしますか？')) {
            Object.values(this.textareas).forEach(textarea => {
                if (textarea) textarea.value = '';
            });
            
            const today = new Date().toISOString().split('T')[0];
            this.deleteEntry(today);
            this.showToast('日記をクリアしました', 'success');
            this.updateStats();
            this.loadRecentEntries();
            this.updateCalendar();
        }
    }

    handleDelete() {
        if (!this.currentDate) return;
        
        if (confirm('本当にこの日記を削除しますか？この操作は元に戻せません。')) {
            if (this.deleteEntry(this.currentDate)) {
                this.showToast('日記を削除しました', 'success');
                this.updateStats();
                this.loadRecentEntries();
                this.updateCalendar();
                this.showHistoryView();
            } else {
                this.showToast('削除に失敗しました', 'error');
            }
        }
    }

    autoSave() {
        const data = this.getFormData(this.textareas);
        const today = new Date().toISOString().split('T')[0];
        this.saveEntry(today, data);
    }

    // ========== Copy Functionality ==========
    handleCopy() {
        const data = this.getFormData(this.textareas);
        const isEmpty = this.isFormEmpty(data);
        
        if (isEmpty) {
            this.showToast('コピーする内容がありません', 'error');
            return;
        }
        
        this.copyToClipboard(this.formatDataForCopy(data));
    }

    handleCopyEntry() {
        if (!this.currentEntry) {
            this.showToast('コピーする日記が選択されていません', 'error');
            return;
        }
        
        this.copyToClipboard(this.formatDataForCopy(this.currentEntry));
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('クリップボードにコピーしました！', 'success');
        } catch (error) {
            console.error('Copy failed:', error);
            this.showToast('コピーに失敗しました', 'error');
        }
    }

    formatDataForCopy(data) {
        const sections = [
            { key: 'goodNew', title: 'GOOD & NEW' },
            { key: 'events', title: '何があって何を感じたか' },
            { key: 'growth', title: '自分の成長のために抽象化すると' },
            { key: 'tasks', title: '今日やりきること' }
        ];
        
        return sections
            .filter(section => data[section.key] && data[section.key].trim())
            .map(section => `・${section.title}\n　${data[section.key].trim()}`)
            .join('\n\n');
    }

    // ========== History Management ==========
    loadDiaryHistory() {
        const entries = this.getAllEntries();
        this.renderEntryGrid(entries);
    }

    renderEntryGrid(entries) {
        if (entries.length === 0) {
            this.diaryList.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <h3>まだ日記が記録されていません</h3>
                    <p>「今日の日記」から最初の記録を始めましょう</p>
                </div>
            `;
            return;
        }
        
        this.diaryList.innerHTML = entries.map(entry => {
            const preview = this.createPreview(entry.data);
            return `
                <div class="entry-card" data-date="${entry.date}">
                    <div class="entry-card-date">${this.formatDateForDisplay(entry.date)}</div>
                    <div class="entry-card-preview">${preview}</div>
                </div>
            `;
        }).join('');
        
        // Add click handlers
        this.diaryList.querySelectorAll('.entry-card').forEach(card => {
            card.addEventListener('click', () => {
                const date = card.dataset.date;
                this.showEntryDetail(date);
            });
        });
    }

    createPreview(data) {
        const sections = [data.goodNew, data.events, data.growth, data.tasks];
        return sections
            .filter(text => text && text.trim())
            .join(' ')
            .substring(0, 150) + '...';
    }

    handleDateSearch(e) {
        const selectedDate = e.target.value;
        if (selectedDate) {
            const data = this.getEntry(selectedDate);
            if (data) {
                this.showEntryDetail(selectedDate);
            } else {
                this.showToast('その日の日記は見つかりませんでした', 'error');
            }
        }
    }

    // ========== UI Updates ==========
    loadTodayEntry() {
        const today = new Date().toISOString().split('T')[0];
        const data = this.getEntry(today);
        
        if (data) {
            this.populateForm(this.textareas, data);
        } else {
            this.clearForm(this.textareas);
        }
    }

    renderEntryContent(data) {
        const sections = [
            { key: 'goodNew', title: 'GOOD & NEW', emoji: '✨' },
            { key: 'events', title: '何があって何を感じたか', emoji: '💭' },
            { key: 'growth', title: '自分の成長のために抽象化すると', emoji: '🌱' },
            { key: 'tasks', title: '今日やりきること', emoji: '🎯' }
        ];
        
        this.entryContent.innerHTML = sections.map(section => `
            <div class="entry-section">
                <div class="entry-section-title">
                    <span>${section.emoji}</span>
                    <span>${section.title}</span>
                </div>
                <div class="entry-section-content">
                    ${data[section.key] || '記録なし'}
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const entries = this.getAllEntries();
        this.totalEntries.textContent = entries.length;
        this.currentStreak.textContent = this.calculateStreak(entries);
    }

    calculateStreak(entries) {
        if (entries.length === 0) return 0;
        
        const today = new Date();
        let streak = 0;
        let currentDate = new Date(today);
        
        for (let i = 0; i < 365; i++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const hasEntry = entries.some(entry => entry.date === dateStr);
            
            if (hasEntry) {
                streak++;
            } else if (dateStr !== today.toISOString().split('T')[0]) {
                break;
            }
            
            currentDate.setDate(currentDate.getDate() - 1);
        }
        
        return streak;
    }

    loadRecentEntries() {
        const entries = this.getAllEntries().slice(0, 5);
        
        if (entries.length === 0) {
            this.recentEntries.innerHTML = '<p class="text-gray-500 text-sm">最近の記録はありません</p>';
            return;
        }
        
        this.recentEntries.innerHTML = entries.map(entry => `
            <div class="recent-entry" data-date="${entry.date}">
                <div class="recent-entry-date">${this.formatDateForDisplay(entry.date)}</div>
                <div class="recent-entry-preview">${this.createPreview(entry.data)}</div>
            </div>
        `).join('');
        
        // Add click handlers
        this.recentEntries.querySelectorAll('.recent-entry').forEach(item => {
            item.addEventListener('click', () => {
                const date = item.dataset.date;
                this.showEntryDetail(date);
            });
        });
    }

    displayCurrentDate() {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            weekday: 'long' 
        };
        this.currentDateEl.textContent = now.toLocaleDateString('ja-JP', options);
    }

    // ========== Utility Functions ==========
    formatDateForDisplay(dateStr) {
        const date = new Date(dateStr);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            weekday: 'long' 
        };
        return date.toLocaleDateString('ja-JP', options);
    }

    // ========== Calendar Functions ==========
    renderCalendar() {
        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();
        
        // Update calendar title
        this.calendarTitle.textContent = `${year}年${month + 1}月`;
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Get previous month's last days
        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();
        
        let calendarHTML = '';
        
        // Previous month's trailing days
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            calendarHTML += `<div class="calendar-day other-month" data-date="${dateStr}">${day}</div>`;
        }
        
        // Current month's days
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const entries = this.getAllEntries();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            let classes = 'calendar-day';
            
            // Check if it's today
            if (dateStr === todayStr) {
                classes += ' today';
            }
            
            // Check if entry exists for this date
            const hasEntry = entries.some(entry => entry.date === dateStr);
            if (hasEntry) {
                classes += ' has-entry';
            }
            
            calendarHTML += `<div class="${classes}" data-date="${dateStr}">${day}</div>`;
        }
        
        // Next month's leading days
        const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;
        const remainingCells = totalCells - (startingDayOfWeek + daysInMonth);
        
        for (let day = 1; day <= remainingCells; day++) {
            const nextMonth = month + 2;
            const nextYear = nextMonth > 12 ? year + 1 : year;
            const actualMonth = nextMonth > 12 ? 1 : nextMonth;
            const dateStr = `${nextYear}-${String(actualMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            calendarHTML += `<div class="calendar-day other-month" data-date="${dateStr}">${day}</div>`;
        }
        
        this.calendarDays.innerHTML = calendarHTML;
        
        // Add click events to calendar days
        this.calendarDays.querySelectorAll('.calendar-day').forEach(dayEl => {
            dayEl.addEventListener('click', () => {
                const dateStr = dayEl.dataset.date;
                this.handleCalendarDayClick(dateStr);
            });
        });
    }
    
    previousMonth() {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
        this.renderCalendar();
    }
    
    nextMonth() {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
        this.renderCalendar();
    }
    
    handleCalendarDayClick(dateStr) {
        // Remove previous selection
        this.calendarDays.querySelectorAll('.calendar-day.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selection to clicked day
        const clickedDay = this.calendarDays.querySelector(`[data-date="${dateStr}"]`);
        if (clickedDay) {
            clickedDay.classList.add('selected');
        }
        
        // Check if entry exists for this date
        const entry = this.getEntry(dateStr);
        if (entry) {
            // Show the entry detail directly
            this.showEntryDetail(dateStr);
        } else {
            // If no entry exists, navigate to today view for today's date, or show info for other dates
            const today = new Date().toISOString().split('T')[0];
            if (dateStr === today) {
                this.showView('today');
            } else {
                // For past or future dates, just show a toast message
                const formattedDate = this.formatDateForDisplay(dateStr);
                this.showToast(`${formattedDate}の日記はまだ作成されていません`, 'info');
            }
        }
    }
    
    updateCalendar() {
        this.renderCalendar();
    }

    getFormData(textareas) {
        return {
            goodNew: textareas.goodNew?.value || '',
            events: textareas.events?.value || '',
            growth: textareas.growth?.value || '',
            tasks: textareas.tasks?.value || ''
        };
    }

    isFormEmpty(data) {
        return Object.values(data).every(value => !value || !value.trim());
    }

    populateForm(textareas, data) {
        Object.keys(textareas).forEach(key => {
            if (textareas[key]) {
                textareas[key].value = data[key] || '';
            }
        });
    }

    populateEditForm(data) {
        this.populateForm(this.editTextareas, data);
    }

    clearForm(textareas) {
        Object.values(textareas).forEach(textarea => {
            if (textarea) textarea.value = '';
        });
    }

    showToast(message, type = 'success') {
        const toastContent = this.toast.querySelector('.toast-content');
        const toastMessage = this.toast.querySelector('.toast-message');
        const toastIcon = this.toast.querySelector('.toast-icon');
        
        // Update message
        toastMessage.textContent = message;
        
        // Update icon based on type
        let iconSvg = '';
        switch (type) {
            case 'success':
                iconSvg = '<polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
                break;
            case 'error':
                iconSvg = '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>';
                break;
            case 'warning':
                iconSvg = '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2"/>';
                break;
            case 'info':
                iconSvg = '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2"/><line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" stroke-width="2"/>';
                break;
        }
        toastIcon.innerHTML = iconSvg;
        
        // Update classes
        this.toast.className = `toast ${type}`;
        
        // Show toast
        this.toast.classList.add('show');
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (this.currentView === 'today') {
                this.handleSave(e);
            } else if (this.currentView === 'edit') {
                this.handleUpdate(e);
            }
        }
        
        // Ctrl/Cmd + C to copy (when not in input)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && 
            !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
            e.preventDefault();
            if (this.currentView === 'today') {
                this.handleCopy();
            } else if (this.currentView === 'entryDetail') {
                this.handleCopyEntry();
            }
        }
        
        // Escape to go back
        if (e.key === 'Escape') {
            if (this.currentView === 'entryDetail') {
                this.showHistoryView();
            } else if (this.currentView === 'edit') {
                this.showEntryDetail();
            }
        }
    }

    // ========== Sync Management ==========
    initializeSync() {
        if (window.githubSync && window.githubSync.hasToken()) {
            this.updateSyncStatus(true, '設定済み');
        } else {
            this.updateSyncStatus(false, '未設定');
        }
    }

    openSyncModal() {
        this.syncModal.classList.add('active');
        if (window.githubSync && window.githubSync.hasToken()) {
            this.githubToken.value = ''; // Don't show the actual token
            this.testSync();
        }
    }

    closeSyncModalHandler() {
        this.syncModal.classList.remove('active');
        this.githubToken.value = '';
    }

    async saveToken() {
        const token = this.githubToken.value.trim();
        if (!token) {
            this.showToast('トークンを入力してください', 'error');
            return;
        }

        if (!window.githubSync) {
            this.showToast('同期機能が利用できません', 'error');
            return;
        }

        try {
            window.githubSync.setToken(token);
            this.showToast('トークンを保存しました', 'success');
            this.testSync();
        } catch (error) {
            this.showToast('トークンの保存に失敗しました', 'error');
            console.error('Failed to save token:', error);
        }
    }

    async testSync() {
        if (!window.githubSync) {
            this.updateSyncStatus(false, 'エラー: 同期機能が利用できません');
            return;
        }

        try {
            this.updateSyncStatus(null, '接続テスト中...');
            const status = await window.githubSync.checkSyncStatus();
            
            if (status.canSync) {
                this.updateSyncStatus(true, '接続成功');
                this.fullSyncBtn.style.display = 'inline-flex';
                this.showToast('GitHub接続に成功しました', 'success');
            } else {
                this.updateSyncStatus(false, `接続失敗: ${status.error}`);
                this.fullSyncBtn.style.display = 'none';
                this.showToast('GitHub接続に失敗しました', 'error');
            }
        } catch (error) {
            this.updateSyncStatus(false, `エラー: ${error.message}`);
            this.fullSyncBtn.style.display = 'none';
            this.showToast('接続テストに失敗しました', 'error');
            console.error('Sync test failed:', error);
        }
    }

    async fullSync() {
        if (!window.githubSync) {
            this.showToast('同期機能が利用できません', 'error');
            return;
        }

        try {
            this.showToast('同期中...', 'info');
            
            // Get all local entries
            const localEntries = this.getAllEntries();
            let syncedCount = 0;
            let errorCount = 0;

            // Sync each entry to GitHub
            for (const entry of localEntries) {
                try {
                    await window.githubSync.saveEntry(entry.date, entry.data);
                    syncedCount++;
                } catch (error) {
                    console.error(`Failed to sync entry ${entry.date}:`, error);
                    errorCount++;
                }
            }

            // Get entries from GitHub and update local storage
            const cloudEntries = await window.githubSync.getAllEntries();
            for (const cloudEntry of cloudEntries) {
                const localEntry = this.getEntry(cloudEntry.date);
                if (!localEntry || new Date(cloudEntry.data.lastModified) > new Date(localEntry.lastModified)) {
                    this.saveEntry(cloudEntry.date, cloudEntry.data);
                }
            }

            // Update UI
            this.loadHistoryView();
            this.updateStats();
            this.loadRecentEntries();

            if (errorCount === 0) {
                this.showToast(`${syncedCount}件の日記を同期しました`, 'success');
            } else {
                this.showToast(`${syncedCount}件同期、${errorCount}件失敗`, 'warning');
            }
        } catch (error) {
            this.showToast('同期に失敗しました', 'error');
            console.error('Full sync failed:', error);
        }
    }

    updateSyncStatus(connected, message) {
        if (connected === true) {
            this.statusDot.className = 'status-dot connected';
        } else if (connected === false) {
            this.statusDot.className = 'status-dot error';
        } else {
            this.statusDot.className = 'status-dot';
        }
        this.statusText.textContent = message;
    }

    // Enhanced save method with sync
    async handleSave(e) {
        e.preventDefault();
        const data = this.getFormData(this.textareas);
        
        if (this.isFormEmpty(data)) {
            this.showToast('少なくとも一つの項目を入力してください', 'warning');
            return;
        }
        
        const today = this.getTodayDateString();
        const entry = {
            ...data,
            timestamp: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        
        // Save locally
        this.saveEntry(today, entry);
        
        // Try to sync to cloud
        if (window.githubSync && window.githubSync.hasToken()) {
            try {
                await window.githubSync.saveEntry(today, entry);
                this.showToast('日記を保存し、クラウドに同期しました', 'success');
            } catch (error) {
                console.error('Cloud sync failed:', error);
                this.showToast('日記を保存しました（同期は失敗）', 'warning');
            }
        } else {
            this.showToast('日記を保存しました', 'success');
        }
        
        this.updateStats();
        this.loadRecentEntries();
        this.renderCalendar();
    }
}

// ========== Electron Integration ==========
class ElectronIntegration {
    constructor(app) {
        this.app = app;
        this.initializeElectronFeatures();
    }
    
    initializeElectronFeatures() {
        if (window.electronAPI) {
            this.setupMenuHandlers();
            this.adjustUIForDesktop();
        }
    }
    
    setupMenuHandlers() {
        window.electronAPI.onMenuAction((event, action) => {
            switch (event) {
                case 'menu-new-entry':
                    this.app.showView('today');
                    this.app.clearForm(this.app.textareas);
                    break;
                case 'menu-save-entry':
                    if (this.app.currentView === 'today') {
                        this.app.handleSave(new Event('submit'));
                    } else if (this.app.currentView === 'edit') {
                        this.app.handleUpdate(new Event('submit'));
                    }
                    break;
                case 'menu-export':
                    this.handleExport();
                    break;
                case 'menu-view-today':
                    this.app.showView('today');
                    break;
                case 'menu-view-history':
                    this.app.showView('history');
                    break;
            }
        });
    }
    
    adjustUIForDesktop() {
        // Hide mobile menu toggle since we don't need it on desktop
        const mobileToggle = document.getElementById('mobileMenuToggle');
        if (mobileToggle) {
            mobileToggle.style.display = 'none';
        }
        
        // Adjust sidebar behavior for desktop
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('open'); // Ensure it starts open on desktop
        }
        
        // Add desktop-specific class to body
        document.body.classList.add('electron-app');
    }
    
    handleExport() {
        const entries = this.app.getAllEntries();
        if (entries.length === 0) {
            this.app.showToast('エクスポートする日記がありません', 'warning');
            return;
        }
        
        let exportText = '# 日記エクスポート\n\n';
        entries.forEach(entry => {
            exportText += `## ${this.app.formatDateForDisplay(entry.date)}\n\n`;
            exportText += this.app.formatDataForCopy(entry.data);
            exportText += '\n\n---\n\n';
        });
        
        // Create and download file
        const blob = new Blob([exportText], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `journal-export-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.app.showToast('日記をエクスポートしました', 'success');
    }
}

// ========== Initialize Application ==========
document.addEventListener('DOMContentLoaded', () => {
    const app = new JournalApp();
    
    // Initialize Electron integration if running in Electron
    if (window.electronAPI) {
        new ElectronIntegration(app);
    }
});