import { dom } from './dom.js';
import { state, loadStations, setBand } from './state.js';
import * as player from './player.js';
import * as ui from './ui.js';
import { initWeather } from './weather.js';

const BANDS = ['AM', 'FM', 'SAT'];

function applyBand(band) {
    // Update global state
    setBand(band);
    
    // Update band button UI
    ui.updateBandButton(band, state.isPlaying);
    
    // Update station dropdown with new stations
    const firstStation = state.filteredStations[0];
    if (firstStation) {
        ui.updateDesktopStation(firstStation);
    }
}

function init() {
    console.log('Initializing GLZ Radio...');
    
    // Load stations
    loadStations().then(() => {
        // Apply default (initial) band
        applyBand(state.currentBand);
        
        // Set initial station
        const initialStation = state.filteredStations[0];
        if (initialStation) {
            player.setStation(initialStation);
            ui.updateDesktopStation(initialStation);
        }
        
        // Set app footer
        ui.setAppFooter();
        
        // Setup event listeners
        setupEventListeners();
        
        // Update network status
        ui.updateNetworkStatus();
        
        // Start clocks
        ui.updateClock(new Date()); // Initial call
        setInterval(() => ui.updateClock(new Date()), 1000); // Update every second

        // Initialize weather
        initWeather();
        
        // Create lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }).catch(error => {
        console.error("Failed to initialize application:", error);
    });
}

function setupEventListeners() {
    // Unified Play/Pause button
    if (dom.playBtn) {
        dom.playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            player.togglePlay();
        });
    }
    
    // Desktop play button event listener
    if (dom.desktopPlayBtn) {
        dom.desktopPlayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            player.togglePlay();
        });
    }
    
    // Band selection buttons
    if (dom.bandButtons && dom.bandButtons.length) {
        dom.bandButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const band = btn.dataset.band;
                if (band && band !== state.currentBand) {
                    applyBand(band);
                }
            });
        });
    }
    
    // Desktop station selector
    if (dom.desktopCurrentStation) {
        dom.desktopCurrentStation.addEventListener('click', () => {
            // For now, just select the first station in the list
            // In a full implementation, this would open a station picker
            const firstStation = state.filteredStations[0];
            if (firstStation) {
                player.setStation(firstStation);
                ui.updateDesktopStation(firstStation);
            }
        });
    }

    // Listen to the audio element's state changes to keep the UI in sync
    if (dom.audioPlayer) {
        dom.audioPlayer.addEventListener('playing', () => {
            state.isPlaying = true;
            ui.updatePlayerUI(state.currentStation, true);
        });

        dom.audioPlayer.addEventListener('pause', () => {
            state.isPlaying = false;
            ui.updatePlayerUI(state.currentStation, false);
        });

        dom.audioPlayer.addEventListener('error', () => {
            console.error('Audio playback error.');
            state.isPlaying = false;
            ui.updatePlayerUI(state.currentStation, false);
        });
    }

    // Listen for network status changes
    window.addEventListener('online', ui.updateNetworkStatus);
    window.addEventListener('offline', ui.updateNetworkStatus);
}

// The 'module' type script in HTML will run when it's parsed.
// We just need to make sure the DOM is loaded.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}