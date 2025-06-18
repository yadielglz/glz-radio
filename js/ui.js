// UI functionality

const updateControlButtons = () => {
    if (state.isPlaying) {
        dom.playButton.classList.add('hidden');
        dom.stopButton.classList.remove('hidden');
    } else {
        dom.playButton.classList.remove('hidden');
        dom.stopButton.classList.add('hidden');
    }
    lucide.createIcons();
};

const updateStopwatch = () => {
    const timeString = formatTime(state.elapsedTime);
    dom.stopwatchDisplay.textContent = timeString;
};

const updateClocks = () => {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    
    if(dom.optionsClock) {
        dom.optionsClock.textContent = now.toLocaleTimeString([], timeOptions);
    }
    
    if(dom.optionsDate) {
        dom.optionsDate.textContent = getFormattedDate();
    }
};

const updateStatusBar = () => {
    const timeString = getFormattedTime();
    
    if (state.isPlaying) {
        dom.statusLeft.innerHTML = `<span class="font-bold text-sm">${timeString}</span>`;
        
        if (state.weatherData) {
            const temp = state.isCelsius ? state.weatherData.temperature : celsiusToFahrenheit(state.weatherData.temperature);
            const icon = getWeatherIcon(state.weatherData.weathercode);
            dom.statusCenter.innerHTML = `<div class="flex items-center justify-center space-x-1"><i data-lucide="${icon}" class="w-5 h-5"></i><span>${Math.round(temp)}°</span></div>`;
        } else {
            dom.statusCenter.innerHTML = ``;
        }
        
        dom.statusRight.innerHTML = `<div id="stream-status-icon"><i data-lucide="radio-tower" class="w-5 h-5"></i></div>`;
    } else {
        dom.statusLeft.innerHTML = `<span id="carrier-text" class="font-bold text-sm">GLZ RADIO</span>`;
        dom.statusCenter.innerHTML = timeString;
        dom.statusRight.innerHTML = `<div id="stream-status-icon"><i data-lucide="${navigator.onLine ? 'wifi' : 'wifi-off'}" class="w-5 h-5 ${!navigator.onLine ? 'text-red-500' : ''}"></i></div>`;
    }
    
    lucide.createIcons();
};

const startFlicker = () => {
    stopFlicker();
    state.flickerInterval = setInterval(() => {
        const iconEl = document.querySelector('#status-right #stream-status-icon');
        if (state.isPlaying && iconEl) {
            iconEl.style.opacity = (Math.random() * 0.5 + 0.5).toFixed(2);
        }
    }, 300);
};

const stopFlicker = () => {
    clearInterval(state.flickerInterval);
    const iconEl = document.querySelector('#status-right #stream-status-icon');
    if (iconEl) iconEl.style.opacity = 1;
};

const startRdsRotation = () => {
    clearInterval(state.rdsInterval);
    clearInterval(state.rdsObserverInterval);
    
    if (!state.currentStationName) return;
    
    const rdsTexts = RADIO_STATIONS[state.currentStationName].rdsText;
    const rdsElement = document.getElementById('rds-text-display');
    
    if (!rdsTexts || rdsTexts.length === 0 || !rdsElement) {
        if(rdsElement) rdsElement.textContent = '';
        if(dom.optionsRdsDisplay) dom.optionsRdsDisplay.textContent = '';
        return;
    }
    
    let rdsIndex = 0;
    rdsElement.textContent = rdsTexts[rdsIndex];
    
    state.rdsInterval = setInterval(() => {
        rdsIndex = (rdsIndex + 1) % rdsTexts.length;
        rdsElement.textContent = rdsTexts[rdsIndex];
    }, 4000);
    
    state.rdsObserverInterval = setInterval(() => {
        if(dom.optionsRdsDisplay && rdsElement) {
            dom.optionsRdsDisplay.textContent = rdsElement.textContent;
        }
    }, 500);
};

const stopRdsRotation = () => {
    clearInterval(state.rdsInterval);
    clearInterval(state.rdsObserverInterval);
    
    const rdsElement = document.getElementById('rds-text-display');
    if (rdsElement) rdsElement.textContent = "";
    if(dom.optionsRdsDisplay) dom.optionsRdsDisplay.textContent = "";
};

const updateNetworkSpeed = () => {
    if (state.isPlaying) {
        const speed = generateNetworkSpeed();
        dom.networkSpeedContainer.innerHTML = `<i data-lucide="arrow-down-up" class="w-3 h-3"></i><span>${speed} kb/s</span>`;
        lucide.createIcons();
    } else {
        dom.networkSpeedContainer.innerHTML = '';
    }
};

const openOptions = () => {
    state.isOptionsOpen = true;
    dom.appContainer.classList.add('options-open');
    dom.optionsModal.classList.remove('hidden');
    
    requestAnimationFrame(() => {
        dom.optionsModal.classList.add('is-open');
    });
};

const closeOptions = () => {
    state.isOptionsOpen = false;
    dom.appContainer.classList.remove('options-open');
    dom.optionsModal.classList.remove('is-open');
    
    const list = dom.stationListInOptions;
    if (list.classList.contains('expanded')) {
        list.classList.remove('expanded');
        const icon = dom.toggleStationListButton.querySelector('i[data-lucide="chevron-down"]');
        if (icon) icon.classList.remove('rotate-180');
    }
};

const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
};

const updateFullscreenIcon = () => {
    const iconContainer = dom.fullscreenIconContainer;
    if (document.fullscreenElement) {
        iconContainer.innerHTML = `<i data-lucide="minimize" class="w-5 h-5"></i>`;
    } else {
        iconContainer.innerHTML = `<i data-lucide="maximize" class="w-5 h-5"></i>`;
    }
    lucide.createIcons();
};

const setupTheming = () => {
    const themes = ['dark', 'light', 'oled'];
    let currentThemeIndex = 0;
    
    const savedTheme = storage.get('glz-radio-theme', 'dark');
    if (savedTheme && themes.includes(savedTheme)) {
        currentThemeIndex = themes.indexOf(savedTheme);
    }
    
    const applyTheme = (themeName) => {
        dom.body.classList.remove('theme-light', 'theme-dark', 'theme-oled');
        if (themeName !== 'dark') {
            dom.body.classList.add(`theme-${themeName}`);
        }
        
        dom.themeIconContainer.innerHTML = `<i data-lucide="${themeName === 'light' ? 'moon' : 'sun'}" class="w-5 h-5"></i>`;
        lucide.createIcons();
        
        storage.set('glz-radio-theme', themeName);
        state.currentTheme = themeName;
        
        const themeAccentColor = getComputedStyle(dom.body).getPropertyValue('--zune-orange').trim();
        dom.appContainer.style.setProperty('--accent-color', themeAccentColor);
    };
    
    applyTheme(themes[currentThemeIndex]);
    
    dom.themeToggleButton.onclick = () => {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        applyTheme(themes[currentThemeIndex]);
    };
};

const setupEventListeners = () => {
    // Options
    dom.optionsButton.onclick = openOptions;
    dom.closeOptionsButton.onclick = closeOptions;
    dom.optionsBackdrop.onclick = closeOptions;
    
    dom.optionsPanel.addEventListener('transitionend', () => {
        if (!dom.optionsModal.classList.contains('is-open')) {
            dom.optionsModal.classList.add('hidden');
        }
    });
    
    // Player controls
    dom.stopButton.onclick = () => stopPlayer(true);
    dom.playButton.onclick = togglePlay;
    dom.playerDisplay.onclick = () => {
        if (!state.currentStationName) {
            togglePlay();
        }
    };
    
    // Station list
    dom.toggleStationListButton.onclick = () => {
        const list = dom.stationListInOptions;
        const icon = dom.toggleStationListButton.querySelector('i[data-lucide="chevron-down"]');
        list.classList.toggle('expanded');
        if (icon) {
            icon.classList.toggle('rotate-180');
        }
    };
    
    dom.randomStationButton.onclick = selectRandomStation;
    
    // Temperature toggle
    dom.tempToggle.onclick = toggleTemperatureUnit;
    
    // Fullscreen
    dom.fullscreenToggleButton.onclick = toggleFullScreen;
    document.addEventListener('fullscreenchange', updateFullscreenIcon);
    
    // Handle mobile browser viewport changes
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange);
    
    // Initial setup
    handleViewportChange();
};

const runSplashAnimation = () => {
    const progressBar = dom.splashProgress.querySelector('div');
    let progress = 0;
    
    const animate = () => {
        progress += 2;
        progressBar.style.width = `${progress}%`;
        
        if (progress < 100) {
            requestAnimationFrame(animate);
        }
    };
    
    animate();
};

const hideSplashScreen = () => {
    const splash = dom.splashScreen;
    splash.style.opacity = 0;
    splash.style.visibility = 'hidden';
};

// Export functions
window.ui = {
    updateControlButtons,
    updateStopwatch,
    updateClocks,
    updateStatusBar,
    startFlicker,
    stopFlicker,
    startRdsRotation,
    stopRdsRotation,
    updateNetworkSpeed,
    openOptions,
    closeOptions,
    toggleFullScreen,
    updateFullscreenIcon,
    setupTheming,
    setupEventListeners,
    runSplashAnimation,
    hideSplashScreen
};
