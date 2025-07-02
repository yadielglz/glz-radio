import { dom } from './dom.js';
import { state } from './state.js';
import * as ui from './ui.js';

export function setStation(station) {
    if (!station) return;
    state.currentStation = station;
    
    // If playing, start the new station immediately. Otherwise, just update the UI.
    if (state.isPlaying) {
        play();
    } else {
        const stationIndex = state.stations.indexOf(station);
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
    dom.audioPlayer.play().catch(e => {
        console.error("Error playing audio:", e);
        state.isPlaying = false;
        ui.updatePlayerUI(state.currentStation, false);
    });
}

export function pause() {
    dom.audioPlayer.pause();
}

export function stop() {
    dom.audioPlayer.pause();
    dom.audioPlayer.src = '';
    state.isPlaying = false;
    ui.updatePlayerUI(state.currentStation, false);
}

export function togglePlay() {
    if (state.isPlaying) {
        pause();
    } else {
        play();
    }
} 