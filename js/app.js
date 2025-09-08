import { dom } from './dom.js';
import { state, loadStations, setBand } from './state.js';
import * as player from './player.js';
import * as ui from './ui.js';
import { weatherService } from './weather.js';
import './pwa.js';

const BANDS = ['AM', 'FM', 'SAT'];

function applyBand(band) {
    // Update global state
    setBand(band);
    
    // Update band button UI
    ui.updateBandButton(band, state.isPlaying);
    
    // Update station grid with new stations
    ui.updateStationGrid();
}

function init() {
    console.log('🚀 Initializing GLZ Radio...');
    console.log('📱 User Agent:', navigator.userAgent);
    console.log('📏 Screen size:', window.innerWidth, 'x', window.innerHeight);
    console.log('🔍 Is Mobile?', window.innerWidth < 640);
    
    // Load stations
    loadStations().then(() => {
        console.log('✅ Stations loaded successfully');
        console.log('📊 Total stations:', state.stations.length);
        
        // Apply default (initial) band
        applyBand(state.currentBand);
        console.log('🎵 Applied band:', state.currentBand);
        console.log('🎛️ Filtered stations:', state.filteredStations.length);
        
        // Initialize station grid
        console.log('🎯 About to call updateStationGrid...');
        ui.updateStationGrid();
        console.log('✅ updateStationGrid called');
        
        // Add manual test after a delay
        setTimeout(() => {
            console.log('🧪 Adding manual test cards...');
            const grid = document.getElementById('station-grid');
            if (grid) {
                console.log('✅ Found station grid element');
                const testCard = document.createElement('div');
                testCard.style.cssText = 'background: red; color: white; padding: 20px; margin: 10px; border: 3px solid yellow; min-height: 100px; text-align: center; font-weight: bold;';
                testCard.innerHTML = 'MANUAL TEST CARD - IF YOU SEE THIS, JS IS WORKING';
                grid.appendChild(testCard);
                console.log('✅ Manual test card added');
            } else {
                console.error('❌ Could not find station-grid element');
            }
        }, 2000);
        
        // Set app footer
        ui.setAppFooter();
        
        // Setup event listeners
        setupEventListeners();
        
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
    
    // Desktop station selector - handled in ui.js to avoid duplicates

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