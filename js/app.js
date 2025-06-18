// Main application initialization

const init = () => {
    console.log('Initializing Glz Radio PWA...');
    
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Run splash animation
    runSplashAnimation();
    
    // Hide splash screen after delay
    setTimeout(() => {
        hideSplashScreen();
    }, 2500);
    
    // Initialize state
    restoreState();
    setupStatePersistence();
    validateState();
    
    // Initialize UI
    updateClocks();
    setInterval(updateClocks, 10000);
    setInterval(updateStatusBar, 1000);
    updateControlButtons();
    setupEventListeners();
    setupTheming();
    setupMediaSessionHandlers();
    
    // Initialize tuner
    setTunerToPowerOff();
    
    // Set bottom bar
    dom.bottomBarStationName.textContent = "Standby";
    
    // Set version footer
    dom.versionFooter.innerHTML = `<p>® ©Glz Technical Services | Ver: ${APP_VERSION} | Build: ${APP_BUILD_DATE.replace(/-/g,'.')}</p>`;
    
    // Initialize weather
    state.isCelsius = storage.get('glz-radio-temp-unit') === 'C';
    getIPLocationAndWeather();
    setInterval(getIPLocationAndWeather, 1000 * 60 * 15); // 15 minutes
    
    // Initialize station list
    initializeStationList();
    
    // Mark as initialized
    state.isInitialized = true;
    
    console.log('Glz Radio PWA initialized successfully');
};

const initializeStationList = () => {
    dom.stationListInOptions.innerHTML = STATIONS_ORDER.map(name => {
        const station = RADIO_STATIONS[name];
        const isFavorite = favorites.has(name);
        
        return `
            <div data-station-name="${name}" class="station-item flex items-center p-3 space-x-4 cursor-pointer hover:bg-[var(--zune-light-gray)] rounded-xl transition-all duration-300 border border-[var(--zune-border)] shadow-md">
                <img src="${station.logo}" class="w-10 h-10 object-contain bg-[var(--surface-color)] p-1 rounded-lg border border-[var(--zune-orange)]" 
                     onerror="this.onerror=null; this.src='https://placehold.co/40x40/1a1a1a/ffffff?text=Logo';">
                <div class="flex-grow truncate">
                    <p class="font-bold text-[var(--text-color)]">${name}</p>
                    <p class="text-xs text-[var(--text-muted-color)]">${station.frequency}</p>
                </div>
                <button class="favorite-btn p-1 rounded-full transition-colors ${isFavorite ? 'text-[var(--zune-orange)]' : 'text-[var(--text-muted-color)]'}" 
                        onclick="toggleFavorite('${name}', event)">
                    <i data-lucide="${isFavorite ? 'heart' : 'heart'}" class="w-4 h-4 ${isFavorite ? 'fill-current' : ''}"></i>
                </button>
            </div>
        `;
    }).join('');
    
    // Add click handlers to station items
    dom.stationListInOptions.querySelectorAll('.station-item').forEach(item => {
        item.onclick = (e) => {
            // Don't trigger if clicking favorite button
            if (e.target.closest('.favorite-btn')) return;
            selectStation(item.dataset.stationName);
        };
    });
    
    // Update Lucide icons
    lucide.createIcons();
};

const toggleFavorite = (stationName, event) => {
    event.stopPropagation();
    
    if (favorites.has(stationName)) {
        favorites.remove(stationName);
    } else {
        favorites.add(stationName);
    }
    
    // Update UI
    const stationItem = document.querySelector(`[data-station-name="${stationName}"]`);
    const favoriteBtn = stationItem.querySelector('.favorite-btn');
    const icon = favoriteBtn.querySelector('i');
    
    if (favorites.has(stationName)) {
        favoriteBtn.classList.add('text-[var(--zune-orange)]');
        favoriteBtn.classList.remove('text-[var(--text-muted-color)]');
        icon.classList.add('fill-current');
    } else {
        favoriteBtn.classList.remove('text-[var(--zune-orange)]');
        favoriteBtn.classList.add('text-[var(--text-muted-color)]');
        icon.classList.remove('fill-current');
    }
    
    // Show notification
    if (window.pwa && window.pwa.showNotification) {
        const action = favorites.has(stationName) ? 'added to' : 'removed from';
        window.pwa.showNotification('Favorites', {
            body: `${stationName} ${action} favorites`,
            tag: 'favorites-update'
        });
    }
};

const showFavorites = () => {
    const favoriteStations = favorites.get();
    if (favoriteStations.length === 0) {
        alert('No favorite stations yet. Add some stations to your favorites!');
        return;
    }
    
    // Filter station list to show only favorites
    const allStationItems = dom.stationListInOptions.querySelectorAll('.station-item');
    allStationItems.forEach(item => {
        const stationName = item.dataset.stationName;
        if (favoriteStations.includes(stationName)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
    
    // Expand station list
    const list = dom.stationListInOptions;
    if (!list.classList.contains('expanded')) {
        list.classList.add('expanded');
        const icon = dom.toggleStationListButton.querySelector('i[data-lucide="chevron-down"]');
        if (icon) icon.classList.add('rotate-180');
    }
    
    openOptions();
};

// Handle app shortcuts
const handleAppShortcuts = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action) {
        setTimeout(() => {
            switch (action) {
                case 'random':
                    selectRandomStation();
                    break;
                case 'favorites':
                    showFavorites();
                    break;
            }
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 1000);
    }
};

// Handle visibility change (app switching)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // App is in background
        console.log('App went to background');
    } else {
        // App is in foreground
        console.log('App came to foreground');
        
        // Update clocks and status
        updateClocks();
        updateStatusBar();
        
        // Check for updates
        if (window.pwa && window.pwa.checkForUpdates) {
            window.pwa.checkForUpdates();
        }
    }
});

// Handle beforeunload (app closing)
window.addEventListener('beforeunload', () => {
    // Persist state before closing
    persistState();
});

// Handle online/offline events
window.addEventListener('online', () => {
    console.log('Connection restored');
    state.isOnline = true;
    
    // Refresh weather data
    getIPLocationAndWeather();
    
    // Show notification
    if (window.pwa && window.pwa.showNotification) {
        window.pwa.showNotification('Connection Restored', {
            body: 'You\'re back online!',
            tag: 'connection-restored'
        });
    }
});

window.addEventListener('offline', () => {
    console.log('Connection lost');
    state.isOnline = false;
    
    // Show notification
    if (window.pwa && window.pwa.showNotification) {
        window.pwa.showNotification('Connection Lost', {
            body: 'You\'re offline. Some features may be limited.',
            tag: 'connection-lost'
        });
    }
});

// Handle errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    state.lastError = event.error;
    state.errorCount++;
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    state.lastError = event.reason;
    state.errorCount++;
});

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        handleAppShortcuts();
        init();
    });
} else {
    handleAppShortcuts();
    init();
}

// Export global functions
window.app = {
    init,
    initializeStationList,
    toggleFavorite,
    showFavorites,
    handleAppShortcuts
};
