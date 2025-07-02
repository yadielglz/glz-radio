// App will handle splash screen properly

// Main application initialization

const init = () => {
    console.log('Initializing Glz Radio PWA...');
    
    // Wait for DOM to be fully loaded
    if (document.readyState !== 'complete') {
        console.log('DOM not ready, waiting...');
        window.addEventListener('load', init);
        return;
    }
    
    // Check if required modules are loaded
    const requiredModules = ['dom', 'state', 'utils', 'ui', 'player', 'tuner', 'weather', 'pwa'];
    const loadedModules = requiredModules.filter(module => window[module]);
    const missingModules = requiredModules.filter(module => !window[module]);
    
    console.log('Loaded modules:', loadedModules);
    console.log('Missing modules:', missingModules);
    
    if (missingModules.length > 0) {
        console.warn('Retrying initialization in 100ms...');
        setTimeout(init, 100); // Retry in 100ms
        return;
    }
    
    console.log('All modules loaded, initializing...');
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
        console.log('Lucide icons initialized');
    } else {
        console.warn('Lucide not available');
    }
    
    // Run splash animation
    const runSplash = () => {
        if (window.ui && window.ui.runSplashAnimation) {
            window.ui.runSplashAnimation();
        } else {
            // Fallback animation
            const progressBar = document.getElementById('splash-progress');
            if (progressBar) {
                let progress = 0;
                const animate = () => {
                    progress += 2;
                    progressBar.style.width = `${progress}%`;
                    if (progress < 100) {
                        requestAnimationFrame(animate);
                    }
                };
                animate();
            }
        }
    };
    
    const hideSplash = () => {
        if (window.ui && window.ui.hideSplashScreen) {
            window.ui.hideSplashScreen();
        } else {
            // Fallback hiding
            const splash = document.getElementById('splash-screen');
            if (splash) {
                splash.style.opacity = '0';
                splash.style.visibility = 'hidden';
                splash.style.pointerEvents = 'none';
                setTimeout(() => {
                    if (splash.parentNode) {
                        splash.parentNode.removeChild(splash);
                    }
                }, 1000);
            }
        }
    };
    
    // Run splash animation
    runSplash();
    
    // Hide splash screen after delay
    setTimeout(hideSplash, 1500);
    
    // Initialize state
    if (window.state) {
        if (window.state.restoreState) window.state.restoreState();
        if (window.state.setupStatePersistence) window.state.setupStatePersistence();
        if (window.state.validateState) window.state.validateState();
    }
    
    // Initialize UI
    if (window.ui) {
        window.ui.updateClocks();
        setInterval(window.ui.updateClocks, 10000);
        setInterval(window.ui.updateStatusBar, 1000);
        window.ui.updateControlButtons();
        window.ui.setupEventListeners();
        window.ui.setupTheming();
    } else {
        // Fallback event listeners if UI module fails
        console.warn('UI module not loaded, setting up basic event listeners');
        const optionsBtn = document.getElementById('options-button');
        const playBtn = document.getElementById('play-button');
        
        if (optionsBtn) {
            optionsBtn.onclick = () => alert('Options clicked - UI module not loaded');
        }
        if (playBtn) {
            playBtn.onclick = () => alert('Play clicked - Player module not loaded');
        }
    }
    if (window.player && window.player.setupMediaSessionHandlers) {
        window.player.setupMediaSessionHandlers();
    }
    
    // Initialize tuner
    if (window.tuner && window.tuner.setTunerToPowerOff) {
        window.tuner.setTunerToPowerOff();
    }
    
    // Set bottom bar
    if (dom.bottomBarStationName) {
        dom.bottomBarStationName.textContent = "Standby";
    }
    
    // Set version footer
    if (dom.versionFooter) {
        dom.versionFooter.innerHTML = `<p>® ©Glz Technical Services | Ver: ${APP_VERSION} | Build: ${APP_BUILD_DATE.replace(/-/g,'.')}</p>`;
    }
    
    // Initialize weather
    if (window.utils && window.utils.storage) {
        state.isCelsius = window.utils.storage.get('glz-radio-temp-unit') === 'C';
    }
    if (window.weather && window.weather.getIPLocationAndWeather) {
        window.weather.getIPLocationAndWeather();
        setInterval(window.weather.getIPLocationAndWeather, 1000 * 60 * 15); // 15 minutes
    }
    
    // Initialize station list
    try {
        initializeStationList();
    } catch (error) {
        console.error('Failed to initialize station list:', error);
        // Fallback: add basic station list
        const stationList = document.getElementById('station-list-in-options');
        if (stationList && typeof STATIONS_ORDER !== 'undefined') {
            stationList.innerHTML = STATIONS_ORDER.map(name => 
                `<div class="p-4 bg-white/5 rounded-2xl cursor-pointer" onclick="alert('Station: ${name}')">${name}</div>`
            ).join('');
        }
    }
    
    // Mark as initialized
    state.isInitialized = true;
    
    console.log('Glz Radio PWA initialized successfully');
};

// Start initialization immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Emergency splash screen fallback - hide after 5 seconds no matter what
setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash && splash.style.opacity !== '0') {
        console.log('Emergency splash screen hide - taking too long to initialize');
        splash.style.opacity = '0';
        splash.style.visibility = 'hidden';
        splash.style.pointerEvents = 'none';
        setTimeout(() => {
            if (splash.parentNode) {
                splash.parentNode.removeChild(splash);
            }
        }, 1000);
    }
}, 5000);

const initializeStationList = () => {
    dom.stationListInOptions.innerHTML = STATIONS_ORDER.map(name => {
        const station = RADIO_STATIONS[name];
        const isFavorite = window.utils && window.utils.favorites ? window.utils.favorites.has(name) : false;
        
        return `
            <div data-station-name="${name}" class="station-item flex items-center p-4 space-x-4 cursor-pointer rounded-2xl transition-all duration-300 glass hover-lift">
                <img src="${station.logo}" class="w-12 h-12 object-contain bg-white/10 backdrop-blur-sm p-2 rounded-xl border-2 border-indigo-500/30" 
                     onerror="this.onerror=null; this.src='https://placehold.co/48x48/1e293b/ffffff?text=Logo';">
                <div class="flex-grow truncate">
                    <p class="font-semibold text-white text-base">${name}</p>
                    <p class="text-sm text-gray-300">${station.frequency}</p>
                </div>
                <button class="favorite-btn p-2 rounded-xl transition-all duration-300 ${isFavorite ? 'text-indigo-400 bg-indigo-500/20' : 'text-gray-400 hover:text-indigo-400'}" 
                        onclick="toggleFavorite('${name}', event)">
                    <i data-lucide="${isFavorite ? 'heart' : 'heart'}" class="w-5 h-5 ${isFavorite ? 'fill-current' : ''}"></i>
                </button>
            </div>
        `;
    }).join('');
    
    // Add click handlers to station items
    dom.stationListInOptions.querySelectorAll('.station-item').forEach(item => {
        item.onclick = (e) => {
            // Don't trigger if clicking favorite button
            if (e.target.closest('.favorite-btn')) return;
            if (window.player && window.player.selectStation) {
                window.player.selectStation(item.dataset.stationName);
            }
        };
    });
    
    // Update Lucide icons
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
};

const toggleFavorite = (stationName, event) => {
    event.stopPropagation();
    
    if (!window.utils || !window.utils.favorites) return;
    
    if (window.utils.favorites.has(stationName)) {
        window.utils.favorites.remove(stationName);
    } else {
        window.utils.favorites.add(stationName);
    }
    
    // Update UI
    const stationItem = document.querySelector(`[data-station-name="${stationName}"]`);
    const favoriteBtn = stationItem.querySelector('.favorite-btn');
    const icon = favoriteBtn.querySelector('i');
    
    if (window.utils && window.utils.favorites && window.utils.favorites.has(stationName)) {
        favoriteBtn.classList.add('text-indigo-400', 'bg-indigo-500/20');
        favoriteBtn.classList.remove('text-gray-400');
        icon.classList.add('fill-current');
    } else {
        favoriteBtn.classList.remove('text-indigo-400', 'bg-indigo-500/20');
        favoriteBtn.classList.add('text-gray-400');
        icon.classList.remove('fill-current');
    }
    
    // Show notification
    if (window.pwa && window.pwa.showNotification) {
        const action = (window.utils && window.utils.favorites && window.utils.favorites.has(stationName)) ? 'added to' : 'removed from';
        window.pwa.showNotification('Favorites', {
            body: `${stationName} ${action} favorites`,
            tag: 'favorites-update'
        });
    }
};

const showFavorites = () => {
    const favoriteStations = window.utils && window.utils.favorites ? window.utils.favorites.get() : [];
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
    
    if (window.ui && window.ui.openOptions) {
        window.ui.openOptions();
    }
};

// Handle app shortcuts
const handleAppShortcuts = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action) {
        setTimeout(() => {
            switch (action) {
                case 'random':
                    if (window.player && window.player.selectRandomStation) {
                        window.player.selectRandomStation();
                    }
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
        if (window.ui) {
            window.ui.updateClocks();
            window.ui.updateStatusBar();
        }
        
        // Check for updates
        if (window.pwa && window.pwa.checkForUpdates) {
            window.pwa.checkForUpdates();
        }
    }
});

// Handle beforeunload (app closing)
window.addEventListener('beforeunload', () => {
    // Persist state before closing
    if (window.state && window.state.persistState) {
        window.state.persistState();
    }
});

// Handle online/offline events
window.addEventListener('online', () => {
    console.log('Connection restored');
    state.isOnline = true;
    
            // Refresh weather data
        if (window.weather && window.weather.getIPLocationAndWeather) {
            window.weather.getIPLocationAndWeather();
        }
    
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

// Handle app shortcuts when ready
handleAppShortcuts();

// Export global functions
window.app = {
    init,
    initializeStationList,
    toggleFavorite,
    showFavorites,
    handleAppShortcuts
};
