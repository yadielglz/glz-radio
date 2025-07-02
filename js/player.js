import { dom } from './dom.js';
import { state } from './state.js';
import * as ui from './ui.js';

// --- Media Session Helpers ---
function updateMediaSessionMetadata() {
    if (!('mediaSession' in navigator) || !state.currentStation) return;

    const s = state.currentStation;
    navigator.mediaSession.metadata = new MediaMetadata({
        title: s.name,
        artist: s.callSign || '',
        album: s.frequency,
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
    navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';
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
if ('mediaSession' in navigator) {
    try {
        navigator.mediaSession.setActionHandler('play', play);
        navigator.mediaSession.setActionHandler('pause', pause);
        navigator.mediaSession.setActionHandler('stop', stop);
        navigator.mediaSession.setActionHandler('previoustrack', previousStation);
        navigator.mediaSession.setActionHandler('nexttrack', nextStation);
    } catch (e) {
        console.warn('Media Session API handlers could not be set:', e);
    }
}

export function setStation(station) {
    if (!station) return;
    state.currentStation = station;
    
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

    // Update media metadata when station changes
    updateMediaSessionMetadata();
}

export function play() {
    if (!state.currentStation) {
        console.warn("No station selected, cannot play.");
        return;
    }
    
    dom.audioPlayer.src = state.currentStation.streamUrl;
    dom.audioPlayer.play().catch(e => {
        console.error("Error playing audio:", e);
        state.isPlaying = false;
        ui.updatePlayerUI(state.currentStation, false);
        updateMediaSessionPlaybackState();
    });

    // Update playback state for Media Session
    updateMediaSessionPlaybackState();
}

export function pause() {
    dom.audioPlayer.pause();
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