import { STATIONS } from './config.js';

export const state = {
    stations: [],
    currentStation: null,
    isPlaying: false
};

export async function loadStations() {
    state.stations = STATIONS;
    return Promise.resolve();
} 