import { dom } from './dom.js';
import { state,  loadStations } from './state.js';
import * as player from './player.js';
import * as ui from './ui.js';

function init() {
    console.log('Initializing GLZ Radio...');

    // This is a critical check. If dom elements are missing, we can't proceed.
    if (!dom.app || !dom.splash || !dom.tuner) {
        console.error('Fatal Error: Essential DOM elements are missing. App cannot start.');
        return;
    }

    loadStations().then(() => {
        // Setup UI components that depend on station data
        dom.tuner.max = state.stations.length - 1;
        ui.createTunerLabels(state.stations);
        
        // Set initial state
        const initialStation = state.stations[0];
        player.setStation(initialStation);
        
        // Initial UI update for the idle state
        ui.updatePlayerUI(initialStation, false);

        // Setup the rest of the UI
        ui.setAppFooter();
        setupEventListeners();
        ui.updateNetworkStatus();
        
        // Start clocks
        ui.updateClock(new Date()); // Initial call
        setInterval(() => ui.updateClock(new Date()), 1000); // Update every second

        // All ready, hide splash screen
        setTimeout(() => {
            dom.splash.style.opacity = '0';
            // The 'app' container is already visible, we just hide the splash over it.
            setTimeout(() => {
                dom.splash.style.display = 'none';
            }, 500); // Wait for fade out to complete
        }, 500); // Give a moment for initial render

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }).catch(error => {
        console.error("Failed to initialize application:", error);
    });
}

function setupEventListeners() {
    // Tuner control
    dom.tuner.addEventListener('input', (e) => {
        const stationIndex = parseInt(e.target.value, 10);
        const station = state.stations[stationIndex];
        player.setStation(station);
    });

    // Unified Play/Pause button
    dom.playBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling if needed
        player.togglePlay();
    });

    // Optional: Clicking the whole display could also toggle play/pause
    dom.playerDisplay.addEventListener('click', player.togglePlay);
    
    // Listen to the audio element's state changes to keep the UI in sync
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