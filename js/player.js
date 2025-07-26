import { dom } from './dom.js';
import { state } from './state.js';
import * as ui from './ui.js';

// --- Media Session Helpers ---
function updateMediaSessionMetadata() {
    if (!('mediaSession' in navigator) || !state.currentStation) return;

    const s = state.currentStation;
    
    // Extract mode and frequency for album field
    let albumText = '';
    if (s.frequency.startsWith('AM:')) {
        albumText = `AM ${s.frequency.replace('AM: ', '').replace(' Khz', ' kHz')}`;
    } else if (s.frequency.startsWith('FM:')) {
        albumText = `FM ${s.frequency.replace('FM: ', '').replace(' Mhz', ' MHz')}`;
    } else if (s.frequency.includes('Satellite')) {
        albumText = 'SAT Satellite Radio';
    } else {
        albumText = s.frequency;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Station',
        artist: 'GLZ Radio',
        album: albumText,
        artwork: [
            { src: s.logo,   sizes: '96x96',  type: 'image/png' },
            { src: s.logo,   sizes: '128x128',  type: 'image/png' },
            { src: s.logo,   sizes: '192x192', type: 'image/png' },
            { src: s.logo,   sizes: '256x256', type: 'image/png' },
            { src: s.logo,   sizes: '512x512', type: 'image/png' }
        ]
    });
}

export function updateMediaSessionPlaybackState() {
    if (!('mediaSession' in navigator)) return;
    
    try {
        navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';
        
        // Set position state for better mobile integration
        if (state.isPlaying) {
            navigator.mediaSession.setPositionState({
                duration: Infinity, // Radio streams are continuous
                position: 0,
                playbackRate: 1.0
            });
        }
    } catch (e) {
        console.warn('Error updating Media Session playback state:', e);
    }
}

// Navigation helpers for Media Session actions
export function nextStation() {
    if (!state.filteredStations || state.filteredStations.length === 0) return;
    const idx = state.filteredStations.indexOf(state.currentStation);
    const nextIdx = (idx + 1) % state.filteredStations.length;
    setStation(state.filteredStations[nextIdx]);
    play();
}

export function previousStation() {
    if (!state.filteredStations || state.filteredStations.length === 0) return;
    const idx = state.filteredStations.indexOf(state.currentStation);
    const prevIdx = (idx - 1 + state.filteredStations.length) % state.filteredStations.length;
    setStation(state.filteredStations[prevIdx]);
    play();
}

// Register media session action handlers once
function setupMediaSessionHandlers() {
    if (!('mediaSession' in navigator)) return;
    
    try {
        // Clear existing handlers first
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('stop', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        
        // Set new handlers
        navigator.mediaSession.setActionHandler('play', () => {
            console.log('Media Session: Play action triggered');
            play();
        });
        
        navigator.mediaSession.setActionHandler('pause', () => {
            console.log('Media Session: Pause action triggered');
            pause();
        });
        
        navigator.mediaSession.setActionHandler('stop', () => {
            console.log('Media Session: Stop action triggered');
            stop();
        });
        
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            console.log('Media Session: Previous track action triggered');
            previousStation();
        });
        
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            console.log('Media Session: Next track action triggered');
            nextStation();
        });
        
        // Handle seek action for mobile compatibility
        navigator.mediaSession.setActionHandler('seekto', (details) => {
            console.log('Media Session: Seek action triggered', details);
            // For radio streams, we don't seek but this helps with mobile compatibility
        });
        
        // Handle seekbackward/seekforward for mobile compatibility
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
            console.log('Media Session: Seek backward action triggered', details);
            // Could be used for previous station
            previousStation();
        });
        
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
            console.log('Media Session: Seek forward action triggered', details);
            // Could be used for next station
            nextStation();
        });
        
        console.log('Media Session handlers registered successfully');
    } catch (e) {
        console.warn('Media Session API handlers could not be set:', e);
    }
}

// Initialize Media Session handlers
setupMediaSessionHandlers();

export function setStation(station) {
    if (!station) return;
    state.currentStation = station;
    
    // Update media metadata when station changes
    updateMediaSessionMetadata();
    
    // If playing, start the new station immediately. Otherwise, just update the UI.
    if (state.isPlaying) {
        play();
    } else {
        const stationIndex = state.filteredStations.indexOf(station);
        if (stationIndex !== -1) {
            ui.updateTuner(stationIndex);
        }
        ui.updatePlayerUI(station, false);
    }
}

export function play() {
    if (!state.currentStation) {
        console.warn("No station selected, cannot play.");
        return;
    }
    
    dom.audioPlayer.src = state.currentStation.streamUrl;
    dom.audioPlayer.play().then(() => {
        state.isPlaying = true;
        ui.updatePlayerUI(state.currentStation, true);
        updateMediaSessionPlaybackState();
        updateMediaSessionMetadata();
    }).catch(e => {
        console.error("Error playing audio:", e);
        state.isPlaying = false;
        ui.updatePlayerUI(state.currentStation, false);
        updateMediaSessionPlaybackState();
    });
}

export function pause() {
    dom.audioPlayer.pause();
    state.isPlaying = false;
    ui.updatePlayerUI(state.currentStation, false);
    updateMediaSessionPlaybackState();
}

export function stop() {
    dom.audioPlayer.pause();
    dom.audioPlayer.src = '';
    state.isPlaying = false;
    ui.updatePlayerUI(state.currentStation, false);
    updateMediaSessionPlaybackState();
}

export function togglePlay() {
    if (state.isPlaying) {
        pause();
    } else {
        play();
    }
}

// Audio event listeners for Media Session synchronization
function setupAudioEventListeners() {
    if (!dom.audioPlayer) return;
    
    dom.audioPlayer.addEventListener('play', () => {
        state.isPlaying = true;
        updateMediaSessionPlaybackState();
    });
    
    dom.audioPlayer.addEventListener('pause', () => {
        state.isPlaying = false;
        updateMediaSessionPlaybackState();
    });
    
    dom.audioPlayer.addEventListener('ended', () => {
        state.isPlaying = false;
        updateMediaSessionPlaybackState();
    });
    
    dom.audioPlayer.addEventListener('error', (e) => {
        console.error('Audio player error:', e);
        state.isPlaying = false;
        updateMediaSessionPlaybackState();
    });
    
    dom.audioPlayer.addEventListener('loadstart', () => {
        console.log('Audio stream loading started');
    });
    
    dom.audioPlayer.addEventListener('canplay', () => {
        console.log('Audio stream can play');
        // Update position state when audio can play
        if (state.isPlaying && 'mediaSession' in navigator) {
            try {
                navigator.mediaSession.setPositionState({
                    duration: Infinity,
                    position: 0,
                    playbackRate: 1.0
                });
            } catch (e) {
                console.warn('Error setting Media Session position state:', e);
            }
        }
    });
}

// Initialize audio event listeners
setupAudioEventListeners(); 