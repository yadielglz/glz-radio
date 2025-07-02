// Player functionality

const runPlayerStartupAnimation = async (station) => {
    const playerContent = dom.playerContent;
    playerContent.innerHTML = '';
    
    const stationHTML = `
        <div class="flex items-center w-full h-full p-6 space-x-6">
            <img src="${station.logo}" alt="${state.currentStationName} Logo" 
                 class="w-28 h-28 object-contain bg-white/10 backdrop-blur-sm p-3 rounded-2xl border-2 border-indigo-500/30 flex-shrink-0 opacity-0 shadow-xl" 
                 style="animation: fadeIn 0.5s 0.2s ease-out forwards;"
                 onerror="this.onerror=null; this.src='https://placehold.co/112x112/1e293b/ffffff?text=Logo'; this.style.backgroundColor='transparent';">
            <div class="flex flex-col justify-center h-full flex-grow truncate text-left">
                <div id="rds-text-display" class="font-mono text-[10px] text-indigo-300 leading-tight mb-1 truncate w-full opacity-0" 
                     style="animation: fadeIn 0.5s 1.2s ease-out forwards;"></div>
                <p id="station-name-display" class="font-sans font-bold text-xl text-white italic truncate w-full opacity-0" 
                   style="animation: fadeIn 0.5s 0.8s ease-out forwards;">${state.currentStationName}</p>
                <p id="station-callsign-display" class="font-sans text-sm text-gray-300 font-semibold truncate w-full opacity-0" 
                   style="animation: fadeIn 0.5s 0.6s ease-out forwards;">${station.callSign || station.name || state.currentStationName}</p>
                <p id="station-frequency-display" class="font-sans text-xs text-gray-400 truncate w-full opacity-0" 
                   style="animation: fadeIn 0.5s 0.4s ease-out forwards;">${station.frequency}</p>
            </div>
        </div>
    `;
    
    playerContent.innerHTML = stationHTML;
    await delay(1500);
    if (window.ui && window.ui.startRdsRotation) {
        window.ui.startRdsRotation();
    }
};

const runPlayerShutdownAnimation = (callback) => {
    return new Promise(resolve => {
        const playerContent = dom.playerContent;
        playerContent.style.transition = 'opacity 0.3s ease-out';
        playerContent.style.opacity = 0;
        
        setTimeout(() => {
            playerContent.innerHTML = `<p class="text-white font-semibold text-xl w-full text-center">Select a Station</p>`;
            playerContent.style.opacity = 1;
            if (callback) callback();
            resolve();
        }, 300);
    });
};

const selectStation = (stationName) => {
    if (state.isPlaying && state.currentStationName === stationName) return;
    
    if (state.isPlaying) {
        stopPlayer(false).then(() => {
            playStation(stationName);
        });
    } else {
        playStation(stationName);
    }
};

const selectRandomStation = () => {
    const randomIndex = Math.floor(Math.random() * STATIONS_ORDER.length);
    const randomStationName = STATIONS_ORDER[randomIndex];
    selectStation(randomStationName);
};

const playStation = (stationName) => {
    state.currentStationName = stationName;
    state.lastPlayedStation = stationName;
    
    // Update UI
    document.querySelectorAll('.station-item').forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.stationName === stationName) {
            item.classList.add('selected');
        }
    });
    
    const station = RADIO_STATIONS[stationName];
    
    // Update ambient background
    const ambientBg = document.getElementById('ambient-bg');
    if (station.logo) {
        ambientBg.style.backgroundImage = `url(${station.logo})`;
        ambientBg.style.opacity = 1;
    }
    
    // Set up audio
    dom.audioPlayer.src = station.streamUrl;
    dom.audioPlayer.load();
    
    // Play audio
    dom.audioPlayer.play().catch(e => {
        console.error("Play error:", e);
        stopPlayer(true);
    });
    
    // Add to play history
    playHistory.add(stationName);
    
    // Close options if open
    if (window.ui && window.ui.closeOptions) {
        window.ui.closeOptions();
    }
};

const togglePlay = () => {
    if (!state.currentStationName) {
        if (window.ui && window.ui.openOptions) {
            window.ui.openOptions();
            const list = dom.stationListInOptions;
            if (!list.classList.contains('expanded')) {
                list.classList.add('expanded');
                const icon = dom.toggleStationListButton.querySelector('i[data-lucide="chevron-down"]');
                if (icon) icon.classList.add('rotate-180');
            }
        }
        return;
    }
    
    if (!state.isPrimed) {
        // Try primer audio first, but don't let it block playback
        if (dom.primerAudio) {
            dom.primerAudio.play().then(() => {
                state.isPrimed = true;
                dom.audioPlayer.play();
            }).catch(e => {
                console.warn("Primer audio failed, attempting main play anyway.", e);
                state.isPrimed = true; // Mark as primed to avoid future attempts
                dom.audioPlayer.play();
            });
        } else {
            console.warn("Primer audio element not found, proceeding with main audio");
            state.isPrimed = true;
            dom.audioPlayer.play();
        }
    } else {
        state.isPlaying ? dom.audioPlayer.pause() : dom.audioPlayer.play();
    }
};

const stopPlayer = async (withAnimation = true) => {
    document.getElementById('ambient-bg').style.opacity = 0;
    
    if (!state.currentStationName) return;
    
    dom.audioPlayer.pause();
    dom.audioPlayer.removeAttribute('src');
    dom.audioPlayer.load();
    
    state.isPlaying = false;
    state.currentStationName = null;
    state.isFirstPlay = true;
    
    if (withAnimation) {
        await runPlayerShutdownAnimation();
    }
    
    if (window.tuner && window.tuner.setTunerToPowerOff) {
        window.tuner.setTunerToPowerOff();
    }
    if (window.ui && window.ui.updateControlButtons) {
        window.ui.updateControlButtons();
    }
    
    if (!withAnimation) {
        dom.playerContent.innerHTML = `<p class="text-white font-semibold text-xl w-full text-center">Select a Station</p>`;
    }
    
    if (window.ui) {
        if (window.ui.stopRdsRotation) window.ui.stopRdsRotation();
        if (window.ui.stopFlicker) window.ui.stopFlicker();
    }
    
    if(dom.optionsRdsDisplay) dom.optionsRdsDisplay.textContent = '';
    
    clearInterval(state.stopwatchInterval);
    clearInterval(state.networkSpeedInterval);
    state.networkSpeedInterval = null;
    
    if (window.ui) {
        if (window.ui.updateNetworkSpeed) window.ui.updateNetworkSpeed();
        state.elapsedTime = 0;
        if (window.ui.updateStopwatch) window.ui.updateStopwatch();
        if (window.ui.updateStatusBar) window.ui.updateStatusBar();
    }
    
    dom.bottomBarStationName.textContent = "Standby";
    
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = "none";
        navigator.mediaSession.metadata = null;
    }
    
    document.querySelectorAll('.station-item').forEach(item => item.classList.remove('selected'));
};

const updateMediaSession = () => {
    if ('mediaSession' in navigator && state.currentStationName) {
        const station = RADIO_STATIONS[state.currentStationName];
        navigator.mediaSession.metadata = new MediaMetadata({
            title: state.currentStationName,
            artist: 'Glz Radio',
            album: station.frequency,
            artwork: [{ src: station.logo, sizes: '512x512', type: 'image/png' }]
        });
    }
};

const setupMediaSessionHandlers = () => {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', togglePlay);
        navigator.mediaSession.setActionHandler('pause', togglePlay);
        navigator.mediaSession.setActionHandler('stop', () => stopPlayer(true));
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            const currentIndex = STATIONS_ORDER.indexOf(state.currentStationName);
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : STATIONS_ORDER.length - 1;
            selectStation(STATIONS_ORDER[prevIndex]);
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            const currentIndex = STATIONS_ORDER.indexOf(state.currentStationName);
            const nextIndex = currentIndex < STATIONS_ORDER.length - 1 ? currentIndex + 1 : 0;
            selectStation(STATIONS_ORDER[nextIndex]);
        });
    }
};

// Audio event handlers
dom.audioPlayer.onplay = () => {
    state.isPlaying = true;
    
    if(state.isFirstPlay) {
        runPlayerStartupAnimation(RADIO_STATIONS[state.currentStationName]);
    }
    
    if (window.ui) {
        if (window.ui.updateControlButtons) window.ui.updateControlButtons();
        if (window.ui.updateStatusBar) window.ui.updateStatusBar();
    }
    if (window.tuner && window.tuner.updateTunerDisplay) {
        window.tuner.updateTunerDisplay(RADIO_STATIONS[state.currentStationName], state.isFirstPlay);
    }
    
    state.isFirstPlay = false;
    if (window.ui && window.ui.startFlicker) {
        window.ui.startFlicker();
    }
    
    clearInterval(state.stopwatchInterval);
    clearInterval(state.networkSpeedInterval);
    state.elapsedTime = 0;
    if (window.ui) {
        if (window.ui.updateStopwatch) window.ui.updateStopwatch();
        if (window.ui.updateNetworkSpeed) window.ui.updateNetworkSpeed();
    }
    
    state.stopwatchInterval = setInterval(() => {
        state.elapsedTime++;
        if (window.ui && window.ui.updateStopwatch) {
            window.ui.updateStopwatch();
        }
    }, 1000);
    
    if (window.ui && window.ui.updateNetworkSpeed) {
        state.networkSpeedInterval = setInterval(window.ui.updateNetworkSpeed, 2000);
    }
    
    updateMediaSession();
    
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = "playing";
    }
    
    dom.bottomBar.classList.remove('hidden');
    dom.bottomBarStationName.textContent = "Now Playing: " + state.currentStationName;
};

dom.audioPlayer.onpause = () => {
    if (!state.currentStationName) return;
    
    state.isPlaying = false;
    if (window.ui) {
        if (window.ui.stopRdsRotation) window.ui.stopRdsRotation();
        if (window.ui.updateStatusBar) window.ui.updateStatusBar();
        if (window.ui.updateControlButtons) window.ui.updateControlButtons();
        if (window.ui.stopFlicker) window.ui.stopFlicker();
    }
    if (window.tuner && window.tuner.updateTunerDisplay) {
        window.tuner.updateTunerDisplay();
    }
    
    clearInterval(state.stopwatchInterval);
    clearInterval(state.networkSpeedInterval);
    state.networkSpeedInterval = null;
    if (window.ui && window.ui.updateNetworkSpeed) {
        window.ui.updateNetworkSpeed();
    }
    
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = "paused";
    }
    
    dom.bottomBarStationName.textContent = "Paused";
};

dom.audioPlayer.onerror = (e) => {
    console.error('Audio player error:', e);
    state.lastError = e;
    state.errorCount++;
    
    // Show error notification
    if (window.pwa && window.pwa.showNotification) {
        window.pwa.showNotification('Playback Error', {
            body: 'Failed to play station. Please try again.',
            tag: 'playback-error'
        });
    }
    
    stopPlayer(true);
};

// Export functions
window.player = {
    selectStation,
    selectRandomStation,
    playStation,
    togglePlay,
    stopPlayer,
    updateMediaSession,
    setupMediaSessionHandlers
};
