import { STATIONS } from './config.js';

export const state = {
    stations: [],
    filteredStations: [],
    currentBand: 'FM',
    currentStation: null,
    isPlaying: false,
    rdsInterval: null,
    rdsTextIndex: 0
};

// Helper to filter stations based on the active band
function filterByBand(band) {
    switch (band) {
        case 'AM':
            return STATIONS.filter(s => s.frequency.startsWith('AM'));
        case 'FM':
            return STATIONS.filter(s => s.frequency.startsWith('FM'));
        case 'SAT':
        default:
            return STATIONS.filter(s => s.frequency.startsWith('Satellite') || s.frequency.includes('Satellite'));
    }
}

export function setBand(band) {
    state.currentBand = band;
    state.filteredStations = filterByBand(band);
}

export async function loadStations() {
    state.stations = STATIONS;
    // Default band to FM on load
    setBand(state.currentBand);
    return Promise.resolve();
}