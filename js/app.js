import { dom } from './dom.js';
import { state,  loadStations, setBand } from './state.js';
import * as player from './player.js';
import * as ui from './ui.js';
import { initWeather, setPlayState as weatherSetPlayState } from './weather.js';

const BANDS = ['AM', 'FM', 'SAT'];

function applyBand(band) {
    // Update global state
    setBand(band);

    // Update UI elements
    dom.tuner.max = state.filteredStations.length - 1;
    ui.createTunerScale(state.filteredStations, band);
    ui.updateBandButton(band, state.isPlaying);

    // Update station dropdowns with new stations
    ui.updateStationDropdown(state.filteredStations);

    // Select first station of the new band if current station is not in filtered list
    let targetStation = state.currentStation;
    if (!state.filteredStations.includes(targetStation)) {
        targetStation = state.filteredStations[0];
    }

    // Position slider correctly
    const idx = state.filteredStations.indexOf(targetStation);
    if (idx !== -1) {
        ui.updateTuner(idx);
    }

    // Update audio state/UI without interrupting playback if station remains the same
    if (targetStation !== state.currentStation) {
        player.setStation(targetStation);
    }

    // Ensure RDS reflects current band when not playing
    ui.updateRds(state.currentStation, state.isPlaying);
    
    // Update mobile station display
    if (window.innerWidth <= 1024) {
        ui.updateMobileStationDisplay(targetStation);
    }
}

function init() {
    console.log('Initializing GLZ Radio...');
    
    // Debug DOM elements
    console.log('DOM Elements Check:', {
        app: !!dom.app,
        tuner: !!dom.tuner,
        bigClock: !!dom.bigClock,
        idleWeather: !!dom.idleWeather,
        clock: !!dom.clock,
        stationSelect: !!dom.stationSelect
    });
    
    // This is a critical check. If dom elements are missing, we can't proceed.
    if (!dom.app || !dom.tuner) {
        console.error('Fatal Error: Essential DOM elements are missing. App cannot start.');
        return;
    }
    
    loadStations().then(() => {
        // Apply default (initial) band
        applyBand(state.currentBand);

        // Set initial state
        const initialStation = state.filteredStations[0];
        player.setStation(initialStation);
        
        // Initialize UI state
        ui.initializeUIState();
        
        // Initial UI update for the idle state
        ui.updatePlayerUI(initialStation, false);

        // Setup the rest of the UI
        ui.setAppFooter();
        setupEventListeners();
        ui.updateNetworkStatus();
        
        // Ensure station dropdowns are populated
        ui.updateStationDropdown(state.filteredStations);
        
        // Initialize dropdown functionality based on screen size
        console.log('Screen width:', window.innerWidth, 'Setting up dropdown for:', window.innerWidth <= 1024 ? 'mobile' : 'desktop');
        if (window.innerWidth <= 1024) {
            ui.setupMobileDropdown();
        } else {
            ui.setupDesktopDropdown();
        }
        
        // Start clocks
        ui.updateClock(new Date()); // Initial call
        setInterval(() => ui.updateClock(new Date()), 1000); // Update every second

        // Initialize weather (geolocation)
        initWeather().then(() => {
            console.log('Weather initialized successfully');
        }).catch(error => {
            console.error('Weather initialization failed:', error);
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Handle window resize for mobile/desktop switching
        window.addEventListener('resize', () => {
            const isMobile = window.innerWidth <= 1024;
            
            if (isMobile) {
                ui.setupMobileDropdown();
            } else {
                ui.setupDesktopDropdown();
            }
        });
    }).catch(error => {
        console.error("Failed to initialize application:", error);
    });
}

function setupEventListeners() {
    // Tuner control (uses filteredStations)
    dom.tuner.addEventListener('input', (e) => {
        const stationIndex = parseInt(e.target.value, 10);
        const station = state.filteredStations[stationIndex];
        player.setStation(station);
    });

    // Unified Play/Pause button
    dom.playBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling if needed
        player.togglePlay();
    });
    
    // Desktop play button event listener (in now-playing section)
    setTimeout(() => {
        const desktopPlayBtn = document.getElementById('desktop-play-btn');
        if (desktopPlayBtn) {
            desktopPlayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                player.togglePlay();
            });
        }
    }, 100);
    
    // Mobile station selection handler
    document.addEventListener('mobileStationSelected', (e) => {
        const { station, index } = e.detail;
        if (station && index !== undefined) {
            // Update tuner position
            ui.updateTuner(index);
            // Set the station
            player.setStation(station);
        }
    });
    
    // Desktop station selection handler
    document.addEventListener('desktopStationSelected', (e) => {
        const { station, index } = e.detail;
        if (station && index !== undefined) {
            // Update tuner position
            ui.updateTuner(index);
            // Set the station
            player.setStation(station);
        }
    });

    // Optional: Clicking the whole display could also toggle play/pause
    // dom.playerDisplay.addEventListener('click', player.togglePlay); // Removed - element doesn't exist
    
    // Listen to the audio element's state changes to keep the UI in sync
    dom.audioPlayer.addEventListener('playing', () => {
        state.isPlaying = true;
        ui.updatePlayerUI(state.currentStation, true);
        weatherSetPlayState(true);
        player.updateMediaSessionPlaybackState();
    });

    dom.audioPlayer.addEventListener('pause', () => {
        state.isPlaying = false;
        ui.updatePlayerUI(state.currentStation, false);
        weatherSetPlayState(false);
        player.updateMediaSessionPlaybackState();
    });

    dom.audioPlayer.addEventListener('error', () => {
        console.error('Audio playback error.');
        state.isPlaying = false;
        ui.updatePlayerUI(state.currentStation, false);
        player.updateMediaSessionPlaybackState();
    });

    // Listen for network status changes
    window.addEventListener('online', ui.updateNetworkStatus);
    window.addEventListener('offline', ui.updateNetworkStatus);

    // Band selection buttons (AM / FM / SAT)
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

    // Prev / Next buttons
    if (dom.prevBtn) {
        dom.prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            player.previousStation();
        });
    }

    if (dom.nextBtn) {
        dom.nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            player.nextStation();
        });
    }

    // Refresh lucide icons (in case prev/next inserted late)
    if (window.lucide) {
        lucide.createIcons();
    }

    if (dom.stationSelect) {
        dom.stationSelect.addEventListener('change', (e) => {
            const idx = parseInt(e.target.value, 10);
            const station = state.filteredStations[idx];
            player.setStation(station);
        });
    }
}
    
// The 'module' type script in HTML will run when it's parsed.
// We just need to make sure the DOM is loaded.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}