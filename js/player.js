import { dom } from './dom.js';
import { state } from './state.js';
import * as ui from './ui.js';

export function setStation(station) {
    if (!station) return;
    state.currentStation = station;
    
    // Update Media Session metadata
    if (window.pwa && window.pwa.updateMediaSession) {
        window.pwa.updateMediaSession(station);
    }
    
    // If playing, start the new station immediately. Otherwise, just update the UI.
    if (state.isPlaying) {
        play();
    } else {
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
        
        // Update Media Session playback state
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
        }
        
        // Show notification for background playback
        if (window.pwa && window.pwa.showNotification) {
            window.pwa.showNotification(`Now Playing: ${state.currentStation.name}`, {
                body: state.currentStation.frequency,
                icon: state.currentStation.logo
            });
        }
    }).catch(e => {
        console.error("Error playing audio:", e);
        state.isPlaying = false;
        ui.updatePlayerUI(state.currentStation, false);
        
        // Update Media Session playback state
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
        }
    });
}

export function pause() {
    dom.audioPlayer.pause();
    state.isPlaying = false;
    ui.updatePlayerUI(state.currentStation, false);
    
    // Update Media Session playback state
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
    }
}

export function stop() {
    dom.audioPlayer.pause();
    dom.audioPlayer.src = '';
    state.isPlaying = false;
    ui.updatePlayerUI(state.currentStation, false);
    
    // Update Media Session playback state
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
    }
}

export function togglePlay() {
    if (state.isPlaying) {
        pause();
    } else {
        play();
    }
}