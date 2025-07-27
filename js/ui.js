import { dom } from './dom.js';
import { state } from './state.js';
import { setPlayState as weatherSetPlayState } from './weather.js';

export function updateClock(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    // Update top bar clock (12-hour format)
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = ((hours + 11) % 12 + 1); // Converts 24h to 12h, 0 to 12
    if(dom.clock) {
      dom.clock.textContent = `${displayHours}:${minutes} ${ampm}`;
      console.log('Header clock updated to:', `${displayHours}:${minutes} ${ampm}`);
    } else {
      console.warn('Header clock element not found');
    }

    // Update big clock (AM/PM format as requested)
    const bigClockAmpm = hours >= 12 ? 'PM' : 'AM';
    const bigClockDisplayHours = ((hours + 11) % 12 + 1); // Converts 24h to 12h, 0 to 12
    if(dom.bigClock) {
      // Force AM/PM format and ensure it's not being overridden
      const timeString = `${bigClockDisplayHours}:${minutes} ${bigClockAmpm}`;
      dom.bigClock.textContent = timeString;
      console.log('Big clock updated to:', timeString);
    } else {
      console.warn('Big clock element not found');
    }
}

// Function to ensure initial UI state is correct
export function initializeUIState() {
    console.log('Initializing UI state...');
    
    // Ensure idle display is visible initially
    if (dom.idleDisplay) {
        dom.idleDisplay.classList.remove('hidden');
        console.log('Idle display made visible');
    } else {
        console.warn('Idle display element not found');
    }
    
    // Ensure now playing is hidden initially
    if (dom.nowPlaying) {
        dom.nowPlaying.classList.add('hidden');
        console.log('Now playing hidden');
    } else {
        console.warn('Now playing element not found');
    }
    
    // Ensure station controls are visible initially
    const stationControls = document.getElementById('station-controls');
    if (stationControls) {
        stationControls.classList.remove('hidden');
        console.log('Station controls made visible');
    } else {
        console.warn('Station controls element not found');
    }
    
    // Ensure header weather is hidden initially
    if (dom.headerWeather) {
        dom.headerWeather.classList.add('hidden');
        console.log('Header weather hidden');
    }
}

export function updateTuner(index) {
    if (dom.tuner) {
        dom.tuner.value = index;
            // Note: We no longer use the old select element, using new dropdowns instead
    }
}

export function updatePlayerUI(station, isPlaying) {
    const iconName = isPlaying ? 'pause' : 'play';
    const buttonText = isPlaying ? 'Pause' : 'Play';
    
    // Update main play button
    dom.playBtn.innerHTML = `<i data-lucide="${iconName}" class="w-6 h-6 text-white"></i><span id="play-btn-text" class="font-medium ml-2">${buttonText}</span>`;
    
    // Update desktop play button in now-playing section
    const desktopPlayBtn = document.getElementById('desktop-play-btn');
    if (desktopPlayBtn) {
        desktopPlayBtn.innerHTML = `<i data-lucide="${iconName}" class="w-6 h-6 text-white"></i><span class="font-medium">${buttonText}</span>`;
    }
    
    // Smooth transitions for station selection elements
    // Note: We no longer use the old select element, using new dropdowns instead
    
    if (dom.tunerContainer) {
        if (isPlaying) {
            dom.tunerContainer.classList.add('hidden');
        } else {
            // Smooth transition back to visible state
            setTimeout(() => {
                dom.tunerContainer.classList.remove('hidden');
                dom.tunerContainer.classList.add('visible');
            }, 300); // Delay to allow other transitions to complete
        }
    }

    if (dom.playStatus) {
        dom.playStatus.textContent = isPlaying ? 'Playing' : 'Paused';
    }

    if (isPlaying && station) {
        // State: Playing
        // Upper card (clock + weather) stays visible
        // Lower card shows now-playing display
        dom.nowPlaying.classList.remove('hidden');
        
        // Hide station controls when playing
        const stationControls = document.getElementById('station-controls');
        if (stationControls) {
            stationControls.classList.add('hidden');
        }
        
        if (dom.clock) {
            dom.clock.classList.remove('invisible');
        }
        
        // Smooth play button transition
        setTimeout(() => {
            dom.playBtn.classList.add('playing');
            if (desktopPlayBtn) {
                desktopPlayBtn.classList.add('playing');
            }
        }, 200);

        dom.stationLogo.src = station.logo;
        dom.stationName.textContent = station.name;
        dom.stationFrequency.textContent = station.frequency;
        dom.stationCallsign.textContent = station.callSign;

        // Update desktop frequency indicator
        const desktopFreqIndicator = document.getElementById('desktop-frequency-indicator');
        const desktopFreqText = document.getElementById('desktop-frequency-text');
        if (desktopFreqIndicator && desktopFreqText) {
            desktopFreqIndicator.classList.add('active');
            
            // Extract clean frequency for display
            let displayText = state.currentBand;
            if (state.currentBand === 'AM' || state.currentBand === 'FM') {
                const cleanFreq = station.frequency
                    .replace('AM:', '')
                    .replace('FM:', '')
                    .trim();
                displayText = cleanFreq;
            }
            desktopFreqText.textContent = displayText;
        }
        
        // Update mobile station playing state
        const currentStationIndex = state.filteredStations.findIndex(s => s.name === station.name);
        updateMobileStationPlayingState(currentStationIndex);

        // Trigger logo bounce, remove class after animation to allow re-trigger
        dom.stationLogo.classList.add('logo-bounce');
        setTimeout(() => dom.stationLogo.classList.remove('logo-bounce'), 700);

        // Activate blurred background
        if (dom.bgBlur) {
            dom.bgBlur.style.backgroundImage = `url('${station.logo}')`;
            dom.bgBlur.classList.add('active');
        }
    } else {
        // State: Idle
        // Upper card (clock + weather) stays visible
        // Lower card shows station controls
        dom.nowPlaying.classList.add('hidden');
        
        // Ensure idle display is visible
        if (dom.idleDisplay) {
            dom.idleDisplay.classList.remove('hidden');
        }
        
        // Show station controls when idle
        const stationControls = document.getElementById('station-controls');
        if (stationControls) {
            stationControls.classList.remove('hidden');
        }
        
        if (dom.clock) {
            dom.clock.classList.add('invisible');
        }
        
        if (dom.playBtn) {
            dom.playBtn.classList.remove('playing');
        }
        if (desktopPlayBtn) {
            desktopPlayBtn.classList.remove('playing');
        }
        if (dom.header) {
            dom.header.style.removeProperty('--glow-color');
        }

        // Hide desktop frequency indicator
        const desktopFreqIndicator = document.getElementById('desktop-frequency-indicator');
        if (desktopFreqIndicator) {
            desktopFreqIndicator.classList.remove('active');
        }
        
        // Clear mobile station playing state
        updateMobileStationPlayingState(null);

        // Deactivate blurred background
        if (dom.bgBlur) {
            dom.bgBlur.classList.remove('active');
            dom.bgBlur.style.backgroundImage = '';
        }
    }
    
    if (window.lucide) {
        lucide.createIcons();
    }
    
    updateRds(station, isPlaying);

    // Update band button playing state
    updateBandButton(state.currentBand, isPlaying);

    // Update playing mode indicator
    updatePlayingModeIndicator(isPlaying);

    // Sync weather placements
    weatherSetPlayState(isPlaying);
}

export function updateRds(station, isPlaying) {
    // Clear any existing timers
    if (state.rdsInterval) {
        clearInterval(state.rdsInterval);
        state.rdsInterval = null;
    }

    // Remove marquee class by default
    dom.rdsText.classList.remove('marquee');

    if (isPlaying && station && station.rdsText && station.rdsText.length > 0) {
        state.rdsTextIndex = 0;
        dom.rdsText.textContent = station.rdsText[state.rdsTextIndex];

        if (station.rdsText.length > 1) {
            state.rdsInterval = setInterval(() => {
                state.rdsTextIndex = (state.rdsTextIndex + 1) % station.rdsText.length;
                dom.rdsText.textContent = station.rdsText[state.rdsTextIndex];
            }, 4000);
        }
    } else {
        // When not playing, reflect selected band
        dom.rdsText.textContent = state.currentBand;
    }
}

export function updateNetworkStatus() {
    const isOnline = navigator.onLine;
    if (dom.networkIcon) {
        dom.networkIcon.setAttribute('data-lucide', isOnline ? 'wifi' : 'wifi-off');
        dom.networkIcon.classList.toggle('text-green-400', isOnline);
        dom.networkIcon.classList.toggle('text-red-400', !isOnline);
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

export function createTunerMarkers(markerCount = 10) {
    if (!dom.tunerLabels) return;
    dom.tunerLabels.innerHTML = '';
    
    for (let i = 0; i <= markerCount; i++) {
        const marker = document.createElement('span');
        marker.textContent = '|';
        dom.tunerLabels.appendChild(marker);
    }
}

export function createBandLabels(stations) {
    if (!dom.bandLabels) return;

    dom.bandLabels.innerHTML = ''; // Clear existing labels

    const bands = stations.reduce((acc, station) => {
        let band = 'SAT'; // Default to SAT
        if (station.frequency.includes('AM')) {
            band = 'AM';
        } else if (station.frequency.includes('FM')) {
            band = 'FM';
        }
        acc[band] = (acc[band] || 0) + 1;
        return acc;
    }, {});

    const totalStations = stations.length;
    const bandOrder = ['AM', 'FM', 'SAT'];

    for (const bandName of bandOrder) {
        if (bands[bandName]) {
            const count = bands[bandName];
            const percentage = (count / totalStations) * 100;
            const label = document.createElement('span');
            label.textContent = bandName;
            label.style.width = `${percentage}%`;
            label.classList.add('text-center');
            dom.bandLabels.appendChild(label);
        }
    }
}

export function setAppFooter() {
    if (dom.buildTimestamp) {
        const now = new Date();
        const year = String(now.getFullYear()).slice(-2);
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        dom.buildTimestamp.textContent = `${year}.${month}.${day}-${hours}${minutes}`;
    }
}

// Build the scale above and below the slider
export function createTunerScale(stations, band) {
    if (!dom.tunerLabels || !dom.tunerMarkers) return;

    // Clear previous content
    dom.tunerLabels.innerHTML = '';
    dom.tunerMarkers.innerHTML = '';

    const showNumbers = band !== 'SAT';

    stations.forEach((station, idx) => {
        // Bottom marker (visual tick)
        const marker = document.createElement('span');
        dom.tunerMarkers.appendChild(marker);

        // Top label
        const label = document.createElement('span');

        if (band === 'SAT') {
            label.textContent = `SAT${idx + 1}`;
        } else {
            // Extract numeric component of AM/FM frequency
            const freq = station.frequency
                .replace('AM:', '')
                .replace('FM:', '')
                .replace('Khz', '')
                .replace('Mhz', '')
                .trim();
            label.textContent = freq;
        }

        // If numbers are hidden (SAT but we override) or showNumbers is true, append
        if (showNumbers || band === 'SAT') {
            dom.tunerLabels.appendChild(label);
        } else {
            dom.tunerLabels.appendChild(document.createElement('span'));
        }
    });

    // Also refresh dropdown options (for md+ screens)
    updateStationDropdown(stations);
}

export function updateBandButton(band, isPlaying = false) {
    if (dom.bandButtons && dom.bandButtons.length) {
        dom.bandButtons.forEach(btn => {
            const isActive = btn.dataset.band === band;
            const isPlayingBand = isActive && isPlaying;
            
            // Remove all state classes
            btn.classList.remove('bg-white/20', 'bg-white/10', 'playing');
            
            if (isPlayingBand) {
                // Playing state - green glow and animation
                btn.classList.add('playing');
            } else if (isActive) {
                // Active but not playing
                btn.classList.add('bg-white/20');
            } else {
                // Inactive
                btn.classList.add('bg-white/10');
            }
        });
    }
}

export function updatePlayingModeIndicator(isPlaying) {
    if (!dom.playingModeIndicator || !dom.playingModeText) return;
    
    if (isPlaying && state.currentStation) {
        // Show the playing mode indicator with smooth transition
        let displayText = state.currentBand;
        
        // For AM/FM modes, show frequency instead of mode name
        if (state.currentBand === 'AM' || state.currentBand === 'FM') {
            // Extract frequency from station data
            const frequency = state.currentStation.frequency;
            if (frequency) {
                // Clean up frequency display (remove "AM:" or "FM:" prefix)
                const cleanFreq = frequency
                    .replace('AM:', '')
                    .replace('FM:', '')
                    .trim();
                displayText = cleanFreq;
            }
        }
        
        dom.playingModeText.textContent = displayText;
        dom.playingModeIndicator.classList.add('active');
        
        // Ensure lucide icons are created
        if (window.lucide) {
            lucide.createIcons();
        }
    } else {
        // Hide the playing mode indicator with smooth transition
        setTimeout(() => {
            dom.playingModeIndicator.classList.remove('active');
        }, 100); // Small delay to ensure smooth transition
    }
}

export function updateStationDropdown(stations) {
    console.log('updateStationDropdown called with', stations.length, 'stations');
    console.log('Window width:', window.innerWidth);
    
    // Check if desktop dropdown elements exist
    const desktopSelector = document.getElementById('desktop-station-selector');
    const desktopCurrentStation = document.getElementById('desktop-current-station');
    const desktopStationsList = document.getElementById('desktop-stations-list');
    
    console.log('Desktop dropdown elements check:', {
        desktopSelector: !!desktopSelector,
        desktopCurrentStation: !!desktopCurrentStation,
        desktopStationsList: !!desktopStationsList
    });
    
    if (desktopSelector) {
        console.log('Desktop selector computed styles:', {
            display: window.getComputedStyle(desktopSelector).display,
            visibility: window.getComputedStyle(desktopSelector).visibility,
            opacity: window.getComputedStyle(desktopSelector).opacity,
            position: window.getComputedStyle(desktopSelector).position,
            width: window.getComputedStyle(desktopSelector).width,
            height: window.getComputedStyle(desktopSelector).height
        });
        
        // Force make it visible for testing
        desktopSelector.style.display = 'block';
        desktopSelector.style.visibility = 'visible';
        desktopSelector.style.opacity = '1';
        console.log('Forced desktop selector to be visible');
    } else {
        console.error('DESKTOP SELECTOR NOT FOUND!');
    }
    
    // Update mobile station grid
    updateMobileStationGrid(stations);
    
    // Update desktop station grid
    updateDesktopStationGrid(stations);
    
    // Ensure dropdowns are set up after stations are loaded
    setTimeout(() => {
        if (window.innerWidth <= 1024) {
            setupMobileDropdown();
        } else {
            setupDesktopDropdown();
        }
    }, 100);
}

function updateMobileStationGrid(stations) {
    const mobileStationsList = document.getElementById('mobile-stations-list');
    const mobileCurrentStation = document.getElementById('mobile-current-station');
    const mobileStationLogo = document.getElementById('mobile-station-logo');
    const mobileStationName = document.getElementById('mobile-station-name');
    const mobileStationFrequency = document.getElementById('mobile-station-frequency');
    
    if (!mobileStationsList || !mobileCurrentStation) return;
    
    // Clear existing list
    mobileStationsList.innerHTML = '';
    
    // Create station options
    stations.forEach((station, index) => {
        const option = createStationOption(station, index, 'mobile');
        mobileStationsList.appendChild(option);
    });
}

function updateDesktopStationGrid(stations) {
    const desktopStationsList = document.getElementById('desktop-stations-list');
    const desktopCurrentStation = document.getElementById('desktop-current-station');
    const desktopStationLogo = document.getElementById('desktop-station-logo');
    const desktopStationName = document.getElementById('desktop-station-name');
    const desktopStationFrequency = document.getElementById('desktop-station-frequency');
    
    console.log('updateDesktopStationGrid called with', stations.length, 'stations');
    console.log('Desktop elements found:', {
        desktopStationsList: !!desktopStationsList,
        desktopCurrentStation: !!desktopCurrentStation,
        desktopStationLogo: !!desktopStationLogo,
        desktopStationName: !!desktopStationName,
        desktopStationFrequency: !!desktopStationFrequency
    });
    
    if (!desktopStationsList || !desktopCurrentStation) {
        console.warn('Desktop dropdown elements not found, cannot update grid');
        return;
    }
    
    // Clear existing list
    desktopStationsList.innerHTML = '';
    
    // Create station options
    stations.forEach((station, index) => {
        const option = createStationOption(station, index, 'desktop');
        desktopStationsList.appendChild(option);
    });
}

function createStationOption(station, index, type) {
    const option = document.createElement('div');
    option.className = `${type}-station-option`;
    option.dataset.stationIndex = index;
    
    // Create logo
    const logo = document.createElement('img');
    logo.className = `${type}-station-option-logo`;
    logo.src = station.logo;
    logo.alt = `${station.name} logo`;
    logo.onerror = () => {
        logo.src = './images/generic-station-logo.svg';
    };
    
    // Create info container
    const info = document.createElement('div');
    info.className = `${type}-station-option-info`;
    
    // Create station name
    const name = document.createElement('div');
    name.className = `${type}-station-option-name`;
    name.textContent = station.name;
    
    // Create frequency
    const frequency = document.createElement('div');
    frequency.className = `${type}-station-option-frequency`;
    frequency.textContent = station.frequency
        .replace('AM:', 'AM ')
        .replace('FM:', 'FM ')
        .replace('Satellite Radio', 'SAT');
    
    // Create playing indicator
    const playingIndicator = document.createElement('div');
    playingIndicator.className = `${type}-station-option-playing`;
    playingIndicator.style.display = 'none';
    
    // Assemble option
    info.appendChild(name);
    info.appendChild(frequency);
    option.appendChild(logo);
    option.appendChild(info);
    option.appendChild(playingIndicator);
    
    // Add click handler
    option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Dispatch custom event for station selection
        const event = new CustomEvent(`${type}StationSelected`, {
            detail: { station, index }
        });
        document.dispatchEvent(event);
        
        // Update current station display
        if (type === 'mobile') {
            updateMobileCurrentStation(station);
            hideMobileStationPicker();
        } else {
            updateDesktopCurrentStation(station);
            hideDesktopStationPicker();
        }
    });
    
    return option;
}

function updateMobileCurrentStation(station) {
    const mobileStationLogo = document.getElementById('mobile-station-logo');
    const mobileStationName = document.getElementById('mobile-station-name');
    const mobileStationFrequency = document.getElementById('mobile-station-frequency');
    const mobileCurrentStation = document.getElementById('mobile-current-station');
    
    if (station && mobileStationLogo && mobileStationName && mobileStationFrequency) {
        mobileStationLogo.src = station.logo;
        mobileStationLogo.onerror = () => {
            mobileStationLogo.src = './images/generic-station-logo.svg';
        };
        mobileStationName.textContent = station.name;
        mobileStationFrequency.textContent = station.frequency
            .replace('AM:', 'AM ')
            .replace('FM:', 'FM ')
            .replace('Satellite Radio', 'SAT');
        
        if (mobileCurrentStation) {
            mobileCurrentStation.classList.add('playing');
        }
    } else {
        // Reset to default state
        if (mobileStationLogo) mobileStationLogo.src = './images/generic-station-logo.svg';
        if (mobileStationName) mobileStationName.textContent = 'Select a station';
        if (mobileStationFrequency) mobileStationFrequency.textContent = 'Tap to change';
        if (mobileCurrentStation) mobileCurrentStation.classList.remove('playing');
    }
}

// Export function to update mobile station from external calls
export function updateMobileStation(station) {
    updateMobileCurrentStation(station);
}

function updateDesktopCurrentStation(station) {
    const desktopStationLogo = document.getElementById('desktop-station-logo');
    const desktopStationName = document.getElementById('desktop-station-name');
    const desktopStationFrequency = document.getElementById('desktop-station-frequency');
    const desktopCurrentStation = document.getElementById('desktop-current-station');
    
    if (station && desktopStationLogo && desktopStationName && desktopStationFrequency) {
        desktopStationLogo.src = station.logo;
        desktopStationLogo.onerror = () => {
            desktopStationLogo.src = './images/generic-station-logo.svg';
        };
        desktopStationName.textContent = station.name;
        desktopStationFrequency.textContent = station.frequency
            .replace('AM:', 'AM ')
            .replace('FM:', 'FM ')
            .replace('Satellite Radio', 'SAT');
        
        if (desktopCurrentStation) {
            desktopCurrentStation.classList.add('playing');
        }
    } else {
        // Reset to default state
        if (desktopStationLogo) desktopStationLogo.src = './images/generic-station-logo.svg';
        if (desktopStationName) desktopStationName.textContent = 'Select a station';
        if (desktopStationFrequency) desktopStationFrequency.textContent = 'Click to change';
        if (desktopCurrentStation) desktopCurrentStation.classList.remove('playing');
    }
}

// Export function to update desktop station from external calls
export function updateDesktopStation(station) {
    updateDesktopCurrentStation(station);
}

export function setupMobileDropdown() {
    const mobileCurrentStation = document.getElementById('mobile-current-station');
    const mobileDropdownOverlay = document.getElementById('mobile-dropdown-overlay');
    const mobileDropdown = document.getElementById('mobile-station-picker');
    const mobileDropdownClose = document.getElementById('mobile-dropdown-close');
    const mobileStationSearch = document.getElementById('mobile-station-search');
    
    if (!mobileCurrentStation || !mobileDropdownOverlay || !mobileDropdown) return;
    
    // Remove any existing event listeners to prevent duplicates
    const newMobileCurrentStation = mobileCurrentStation.cloneNode(true);
    mobileCurrentStation.parentNode.replaceChild(newMobileCurrentStation, mobileCurrentStation);
    
    // Toggle dropdown on trigger click
    newMobileCurrentStation.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showMobileStationPicker();
    });
    
    // Close dropdown on overlay click (but not on dropdown content)
    mobileDropdownOverlay.addEventListener('click', (e) => {
        if (e.target === mobileDropdownOverlay) {
            hideMobileStationPicker();
        }
    });
    
    // Close dropdown on close button click
    if (mobileDropdownClose) {
        mobileDropdownClose.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            hideMobileStationPicker();
        });
    }
    
    // Search functionality
    if (mobileStationSearch) {
        mobileStationSearch.addEventListener('input', (e) => {
            e.stopPropagation();
            const searchTerm = e.target.value.toLowerCase();
            const stationOptions = document.querySelectorAll('.mobile-station-option');
            
            stationOptions.forEach((option, index) => {
                const stationName = option.querySelector('.mobile-station-option-name').textContent.toLowerCase();
                const stationFrequency = option.querySelector('.mobile-station-option-frequency').textContent.toLowerCase();
                
                if (stationName.includes(searchTerm) || stationFrequency.includes(searchTerm)) {
                    option.style.display = 'flex';
                } else {
                    option.style.display = 'none';
                }
            });
        });
        
        // Prevent search input from closing dropdown
        mobileStationSearch.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileDropdownOverlay.classList.contains('show')) {
            hideMobileStationPicker();
        }
    });
}

export function setupDesktopDropdown() {
    const desktopCurrentStation = document.getElementById('desktop-current-station');
    const desktopDropdownOverlay = document.getElementById('desktop-dropdown-overlay');
    const desktopDropdown = document.getElementById('desktop-station-picker');
    const desktopDropdownClose = document.getElementById('desktop-dropdown-close');
    const desktopStationSearch = document.getElementById('desktop-station-search');
    
    console.log('Setting up desktop dropdown:', {
        desktopCurrentStation: !!desktopCurrentStation,
        desktopDropdownOverlay: !!desktopDropdownOverlay,
        desktopDropdown: !!desktopDropdown,
        desktopDropdownClose: !!desktopDropdownClose,
        desktopStationSearch: !!desktopStationSearch
    });
    
    if (!desktopCurrentStation || !desktopDropdownOverlay || !desktopDropdown) {
        console.warn('Desktop dropdown elements not found');
        return;
    }
    
    // Remove any existing event listeners to prevent duplicates
    const newDesktopCurrentStation = desktopCurrentStation.cloneNode(true);
    desktopCurrentStation.parentNode.replaceChild(newDesktopCurrentStation, desktopCurrentStation);
    
    // Toggle dropdown on trigger click
    newDesktopCurrentStation.addEventListener('click', (e) => {
        console.log('Desktop dropdown trigger clicked!');
        e.preventDefault();
        e.stopPropagation();
        showDesktopStationPicker();
    });
    
    // Close dropdown on overlay click (but not on dropdown content)
    desktopDropdownOverlay.addEventListener('click', (e) => {
        if (e.target === desktopDropdownOverlay) {
            hideDesktopStationPicker();
        }
    });
    
    // Close dropdown on close button click
    if (desktopDropdownClose) {
        desktopDropdownClose.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            hideDesktopStationPicker();
        });
    }
    
    // Search functionality
    if (desktopStationSearch) {
        desktopStationSearch.addEventListener('input', (e) => {
            e.stopPropagation();
            const searchTerm = e.target.value.toLowerCase();
            const stationOptions = document.querySelectorAll('.desktop-station-option');
            
            stationOptions.forEach((option, index) => {
                const stationName = option.querySelector('.desktop-station-option-name').textContent.toLowerCase();
                const stationFrequency = option.querySelector('.desktop-station-option-frequency').textContent.toLowerCase();
                
                if (stationName.includes(searchTerm) || stationFrequency.includes(searchTerm)) {
                    option.style.display = 'flex';
                } else {
                    option.style.display = 'none';
                }
            });
        });
        
        // Prevent search input from closing dropdown
        desktopStationSearch.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && desktopDropdownOverlay.classList.contains('show')) {
            hideDesktopStationPicker();
        }
    });
}

function toggleMobileStationPicker() {
    const overlay = document.getElementById('mobile-dropdown-overlay');
    if (overlay && overlay.classList.contains('show')) {
        hideMobileStationPicker();
    } else {
        showMobileStationPicker();
    }
}

function showMobileStationPicker() {
    const overlay = document.getElementById('mobile-dropdown-overlay');
    const dropdown = document.getElementById('mobile-station-picker');
    const trigger = document.getElementById('mobile-current-station');
    
    if (overlay && dropdown && trigger) {
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Show overlay
        overlay.classList.remove('hidden');
        overlay.classList.add('show');
        
        // Show dropdown with animation
        setTimeout(() => {
            dropdown.classList.add('show');
        }, 50);
        
        // Update trigger state
        trigger.classList.add('active');
        
        // Focus search input if available
        const searchInput = document.getElementById('mobile-station-search');
        if (searchInput) {
            setTimeout(() => {
                searchInput.focus();
            }, 300);
        }
    }
}

function hideMobileStationPicker() {
    const overlay = document.getElementById('mobile-dropdown-overlay');
    const dropdown = document.getElementById('mobile-station-picker');
    const trigger = document.getElementById('mobile-current-station');
    
    if (overlay && dropdown && trigger) {
        // Allow body scroll
        document.body.style.overflow = '';
        
        // Hide dropdown with animation
        dropdown.classList.remove('show');
        
        // Hide overlay after animation
        setTimeout(() => {
            overlay.classList.remove('show');
            overlay.classList.add('hidden');
        }, 300);
        
        // Update trigger state
        trigger.classList.remove('active');
        
        // Clear search input
        const searchInput = document.getElementById('mobile-station-search');
        if (searchInput) {
            searchInput.value = '';
            // Trigger search to show all stations
            searchInput.dispatchEvent(new Event('input'));
        }
    }
}

function showDesktopStationPicker() {
    console.log('showDesktopStationPicker called');
    const overlay = document.getElementById('desktop-dropdown-overlay');
    const dropdown = document.getElementById('desktop-station-picker');
    const trigger = document.getElementById('desktop-current-station');
    
    console.log('Desktop dropdown elements:', {
        overlay: !!overlay,
        dropdown: !!dropdown,
        trigger: !!trigger
    });
    
    if (overlay && dropdown && trigger) {
        // Show overlay
        overlay.classList.remove('hidden');
        overlay.classList.add('show');
        
        // Show dropdown with animation
        setTimeout(() => {
            dropdown.classList.add('show');
        }, 50);
        
        // Update trigger state
        trigger.classList.add('active');
        
        // Focus search input if available
        const searchInput = document.getElementById('desktop-station-search');
        if (searchInput) {
            setTimeout(() => {
                searchInput.focus();
            }, 300);
        }
    }
}

function hideDesktopStationPicker() {
    const overlay = document.getElementById('desktop-dropdown-overlay');
    const dropdown = document.getElementById('desktop-station-picker');
    const trigger = document.getElementById('desktop-current-station');
    
    if (overlay && dropdown && trigger) {
        // Hide dropdown with animation
        dropdown.classList.remove('show');
        
        // Hide overlay after animation
        setTimeout(() => {
            overlay.classList.remove('show');
            overlay.classList.add('hidden');
        }, 300);
        
        // Update trigger state
        trigger.classList.remove('active');
        
        // Clear search input
        const searchInput = document.getElementById('desktop-station-search');
        if (searchInput) {
            searchInput.value = '';
            // Trigger search to show all stations
            searchInput.dispatchEvent(new Event('input'));
        }
    }
}

export function updateMobileStationPlayingState(stationIndex) {
    // Update current station display if playing
    if (stationIndex !== null && stationIndex >= 0) {
        const currentStation = state.filteredStations[stationIndex];
        if (currentStation) {
            updateMobileCurrentStation(currentStation);
        }
    } else {
        updateMobileCurrentStation(null);
    }
    
    // Update picker options
    const options = document.querySelectorAll('.mobile-station-option');
    options.forEach((option, index) => {
        const playingIndicator = option.querySelector('.mobile-station-option-playing');
        if (playingIndicator) {
            if (index === stationIndex) {
                option.classList.add('playing');
                playingIndicator.style.display = 'block';
            } else {
                option.classList.remove('playing');
                playingIndicator.style.display = 'none';
            }
        }
    });
}

// Function to update mobile station display when band changes
export function updateMobileStationDisplay(station) {
    updateMobileCurrentStation(station);
}

function computeAverageColor(img) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const sampleSize = 16;
        canvas.width = sampleSize;
        canvas.height = sampleSize;

        // try anonymous CORS
        const proxyImg = new Image();
        proxyImg.crossOrigin = 'anonymous';
        proxyImg.src = img.src;

        proxyImg.onload = () => {
            try {
                ctx.drawImage(proxyImg, 0, 0, sampleSize, sampleSize);
                const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
                let r = 0, g = 0, b = 0, count = 0;
                for (let i = 0; i < data.length; i += 4) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    count++;
                }
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);
                resolve({ r, g, b });
            } catch (e) {
                resolve(null);
            }
        };

        proxyImg.onerror = () => resolve(null);
    });
}

async function applyGlowFromLogo(logoSrc) {
    // Function removed - playerDisplay element doesn't exist
    // This function was used for dynamic glow effects on the player display
} 