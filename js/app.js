import { dom } from './dom.js';
import { state, loadStations } from './state.js';
import * as player from './player.js';
import * as ui from './ui.js';
import './pwa.js';

function init() {
    console.log('🚀 Initializing GLZ Radio...');
    console.log('📱 User Agent:', navigator.userAgent);
    console.log('📏 Screen size:', window.innerWidth, 'x', window.innerHeight);
    
    // Safari iOS specific fixes
    if (/Safari/.test(navigator.userAgent) && /iPhone|iPad/.test(navigator.userAgent)) {
        console.log('🛠️ Applying Safari iOS fixes...');
        
        // Force viewport recalculation
        setTimeout(() => {
            window.scrollTo(0, 1);
            window.scrollTo(0, 0);
        }, 100);
        
        // Add Safari-specific CSS class
        document.body.classList.add('safari-ios');
    }
    
    // Load stations
    loadStations().then(() => {
        console.log('✅ Stations loaded successfully');
        console.log('📊 Total stations:', state.stations.length);
        
        // Set app footer
        ui.setAppFooter();
        
        // Update network status
        ui.updateNetworkStatus();
        
        // Start clocks
        ui.updateClock(new Date()); // Initial call
        setInterval(() => ui.updateClock(new Date()), 1000); // Update every second

        // Create lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }).catch(error => {
        console.error("❌ Failed to initialize application:", error);
    });
}

function setupEventListeners() {
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

// Initialize the app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Setup event listeners after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
    setupEventListeners();
}