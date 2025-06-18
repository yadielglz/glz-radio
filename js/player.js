// Player functionality

const runPlayerStartupAnimation = async (station) => {
    const playerContent = dom.playerContent;
    playerContent.innerHTML = '';
    
    const stationHTML = `
        <div class="flex items-center w-full h-full p-4 space-x-4">
            <img src="${station.logo}" alt="${state.currentStationName} Logo" 
                 class="w-24 h-24 object-contain bg-black/10 p-1 rounded-md flex-shrink-0 opacity-0" 
                 style="animation: fadeIn 0.5s 0.2s ease-out forwards;"
                 onerror="this.onerror=null; this.src='https://placehold.co/96x96/1a1a1a/ffffff?text=Logo'; this.style.backgroundColor='transparent';">
            <div class="flex flex-col justify-center h-full flex-grow truncate text-left">
                <div id="rds-text-display" class="font-mono text-xl text-[var(--text-color)] h-8 truncate w-full opacity-0" 
                     style="animation: fadeIn 0.5s 1.2s ease-out forwards;"></div>
                <p id="station-name-display" class="font-sans font-bold text-lg text-[var(--text-color)] truncate w-full mt-1 opacity-0" 
                   style="animation: fadeIn 0.5s 0.8s ease-out forwards;">${state.currentStationName}</p>
                <div id="station-info-display" class="flex items-center mt-1 opacity-0" 
                     style="animation: fadeIn 0.5s 0.5s ease-out forwards;">
                    ${station.callSign ? `<span class="font-sans text-xs text-[var(--text-muted-color)]">${station.callSign}</span><span class="font-sans text-xs text-[var(--text-muted-color)] mx-1">|</span>` : ''}
                    <span class="font-sans text-xs text-[var(--text-muted-color)]">${station.frequency}</span>
                </div>
            </div>
        </div>
    `;
    
    playerContent.innerHTML = stationHTML;
    await delay(1500);
    startRdsRotation();
};

const runPlayerShutdownAnimation = (callback) => {
    return new Promise(resolve => {
        const playerContent = dom.playerContent;
        playerContent.style.transition = 'opacity 0.3s ease-out';
        playerContent.style.opacity = 0;
        
        setTimeout(() => {
            playerContent.innerHTML = `<p class="text-[var(--text-color)] font-bold text-xl w-full text-center">Select a Station</p>`;
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
    closeOptions();
};

const togglePlay = () => {
    if (!state.currentStationName) {
        openOptions();
        const list = dom.stationListInOptions;
        if (!list.classList.contains('expanded')) {
            list.classList.add('expanded');
            const icon = dom.toggleStationListButton.querySelector('i[data-lucide="chevron-down"]');
            if (icon) icon.classList.add('rotate-180');
        }
        return;
    }
    
    if (!state.isPrimed) {
        dom.primerAudio.play().then(() => {
            state.isPrimed = true;
            dom.audioPlayer.play();
        }).catch(e => {
            console.warn("Primer audio failed, attempting main play anyway.", e);
            dom.audioPlayer.play();
        });
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
    
    setTunerToPowerOff();
    updateControlButtons();
    
    if (!withAnimation) {
        dom.playerContent.innerHTML = `<p class="text-[var(--text-color)] font-bold text-xl w-full text-center">Select a Station</p>`;
    }
    
    stopRdsRotation();
    stopFlicker();
    
    if(dom.optionsRdsDisplay) dom.optionsRdsDisplay.textContent = '';
    
    clearInterval(state.stopwatchInterval);
    clearInterval(state.networkSpeedInterval);
    state.networkSpeedInterval = null;
    
    updateNetworkSpeed();
    state.elapsedTime = 0;
    updateStopwatch();
    updateStatusBar();
    
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
    
    updateControlButtons();
    updateStatusBar();
    updateTunerDisplay(RADIO_STATIONS[state.currentStationName], state.isFirstPlay);
    
    state.isFirstPlay = false;
    startFlicker();
    
    clearInterval(state.stopwatchInterval);
    clearInterval(state.networkSpeedInterval);
    state.elapsedTime = 0;
    updateStopwatch();
    updateNetworkSpeed();
    
    state.stopwatchInterval = setInterval(() => {
        state.elapsedTime++;
        updateStopwatch();
    }, 1000);
    
    state.networkSpeedInterval = setInterval(updateNetworkSpeed, 2000);
    
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
    stopRdsRotation();
    updateStatusBar();
    updateControlButtons();
    updateTunerDisplay();
    stopFlicker();
    
    clearInterval(state.stopwatchInterval);
    clearInterval(state.networkSpeedInterval);
    state.networkSpeedInterval = null;
    updateNetworkSpeed();
    
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
