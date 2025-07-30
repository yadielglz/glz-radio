import { dom } from './dom.js';
import { state } from './state.js';
import * as player from './player.js';

let isDropdownOpen = false;

export function updateClock(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    // Update top bar clock (12-hour format)
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = ((hours + 11) % 12 + 1); // Converts 24h to 12h, 0 to 12
    if(dom.clock) {
        dom.clock.textContent = `${displayHours}:${minutes} ${ampm}`;
    }

    // Update big clock (AM/PM format as requested)
    const bigClockAmpm = hours >= 12 ? 'PM' : 'AM';
    const bigClockDisplayHours = ((hours + 11) % 12 + 1); // Converts 24h to 12h, 0 to 12
    if(dom.bigClock) {
        const timeString = `${bigClockDisplayHours}:${minutes} ${bigClockAmpm}`;
        dom.bigClock.textContent = timeString;
    }
}

export function updatePlayerUI(station, isPlaying) {
    const iconName = isPlaying ? 'pause' : 'play';
    const buttonText = isPlaying ? 'Pause' : 'Play';
    
    // Update main play button
    if (dom.playBtn) {
        dom.playBtn.innerHTML = `<i data-lucide="${iconName}" class="w-6 h-6"></i><span id="play-btn-text" class="font-medium ml-2">${buttonText}</span>`;
    }
    
    // Update desktop play button in now-playing section
    if (dom.desktopPlayBtn) {
        dom.desktopPlayBtn.innerHTML = `<i data-lucide="${iconName}" class="w-5 h-5"></i><span class="font-medium">${buttonText}</span>`;
    }
    
    if (isPlaying && station) {
        // State: Playing
        // Show now playing display
        if (dom.nowPlaying) {
            dom.nowPlaying.classList.remove('hidden');
        }
        
        // Hide station controls when playing
        const stationControls = document.getElementById('station-controls');
        if (stationControls) {
            stationControls.classList.add('hidden');
        }
        
        if (dom.clock) {
            dom.clock.classList.remove('invisible');
        }
        
        // Add playing class to play buttons
        setTimeout(() => {
            if (dom.playBtn) dom.playBtn.classList.add('playing');
            if (dom.desktopPlayBtn) dom.desktopPlayBtn.classList.add('playing');
        }, 200);

        if (dom.stationLogo) dom.stationLogo.src = station.logo;
        if (dom.stationName) dom.stationName.textContent = station.name;
        if (dom.stationFrequency) dom.stationFrequency.textContent = station.frequency;
        if (dom.stationCallsign) dom.stationCallsign.textContent = station.callSign;

        // Trigger logo bounce animation
        if (dom.stationLogo) {
            dom.stationLogo.classList.add('logo-bounce');
            setTimeout(() => dom.stationLogo.classList.remove('logo-bounce'), 700);
        }

        // Activate blurred background
        if (dom.bgBlur) {
            dom.bgBlur.style.backgroundImage = `url('${station.logo}')`;
            dom.bgBlur.classList.add('active');
        }
    } else {
        // State: Idle
        // Hide now playing display
        if (dom.nowPlaying) {
            dom.nowPlaying.classList.add('hidden');
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
        if (dom.desktopPlayBtn) {
            dom.desktopPlayBtn.classList.remove('playing');
        }

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
    updateBandButton(state.currentBand, isPlaying);
}

export function updateRds(station, isPlaying) {
    // Clear any existing timers
    if (state.rdsInterval) {
        clearInterval(state.rdsInterval);
        state.rdsInterval = null;
    }

    if (isPlaying && station && station.rdsText && station.rdsText.length > 0) {
        state.rdsTextIndex = 0;
        if (dom.rdsText) dom.rdsText.textContent = station.rdsText[state.rdsTextIndex];

        if (station.rdsText.length > 1) {
            state.rdsInterval = setInterval(() => {
                state.rdsTextIndex = (state.rdsTextIndex + 1) % station.rdsText.length;
                if (dom.rdsText) dom.rdsText.textContent = station.rdsText[state.rdsTextIndex];
            }, 4000);
        }
    } else {
        // When not playing, reflect selected band
        if (dom.rdsText) dom.rdsText.textContent = state.currentBand;
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

export function updateBandButton(band, isPlaying = false) {
    if (dom.bandButtons && dom.bandButtons.length) {
        dom.bandButtons.forEach(btn => {
            const isActive = btn.dataset.band === band;
            const isPlayingBand = isActive && isPlaying;
            
            // Remove all state classes
            btn.classList.remove('playing');
            
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

export function updateDesktopStation(station) {
    if (station && dom.desktopStationLogo && dom.desktopStationName && dom.desktopStationFrequency) {
        dom.desktopStationLogo.src = station.logo;
        dom.desktopStationLogo.onerror = () => {
            dom.desktopStationLogo.src = './images/generic-station-logo.svg';
        };
        dom.desktopStationName.textContent = station.name;
        dom.desktopStationFrequency.textContent = station.frequency
            .replace('AM:', 'AM ')
            .replace('FM:', 'FM ')
            .replace('Satellite Radio', 'SAT');
        
        if (dom.desktopCurrentStation) {
            dom.desktopCurrentStation.classList.add('playing');
        }
    } else {
        // Reset to default state
        if (dom.desktopStationLogo) dom.desktopStationLogo.src = './images/generic-station-logo.svg';
        if (dom.desktopStationName) dom.desktopStationName.textContent = 'Select a station';
        if (dom.desktopStationFrequency) dom.desktopStationFrequency.textContent = 'Click to change';
        if (dom.desktopCurrentStation) dom.desktopCurrentStation.classList.remove('playing');
    }
}

export function setupStationDropdown() {
    const dropdownTrigger = document.getElementById('desktop-current-station');
    const dropdownContainer = document.createElement('div');
    
    // Create dropdown container
    dropdownContainer.id = 'station-dropdown';
    dropdownContainer.className = 'station-dropdown glass-effect rounded-2xl p-4 absolute top-full mt-2 w-full hidden z-20';
    dropdownContainer.style.maxHeight = '300px';
    dropdownContainer.style.overflowY = 'auto';
    
    // Add to DOM
    if (dropdownTrigger) {
        dropdownTrigger.parentNode.appendChild(dropdownContainer);
        
        // Add click event to trigger
        dropdownTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdownContainer.contains(e.target) && !dropdownTrigger.contains(e.target)) {
                closeDropdown();
            }
        });
    }
}

function toggleDropdown() {
    const dropdown = document.getElementById('station-dropdown');
    if (dropdown) {
        if (isDropdownOpen) {
            closeDropdown();
        } else {
            openDropdown();
        }
    }
}

function openDropdown() {
    const dropdown = document.getElementById('station-dropdown');
    if (dropdown) {
        dropdown.classList.remove('hidden');
        renderStationList();
        isDropdownOpen = true;
    }
}

function closeDropdown() {
    const dropdown = document.getElementById('station-dropdown');
    if (dropdown) {
        dropdown.classList.add('hidden');
        isDropdownOpen = false;
    }
}

function renderStationList() {
    const dropdown = document.getElementById('station-dropdown');
    if (!dropdown) return;
    
    // Clear existing content
    dropdown.innerHTML = '';
    
    // Create search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search stations...';
    searchInput.className = 'w-full p-2 mb-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60';
    searchInput.addEventListener('input', (e) => {
        filterStations(e.target.value);
    });
    
    dropdown.appendChild(searchInput);
    
    // Create station list container
    const listContainer = document.createElement('div');
    listContainer.id = 'station-list-container';
    listContainer.className = 'space-y-2 max-h-64 overflow-y-auto';
    
    // Add stations
    state.filteredStations.forEach((station, index) => {
        const stationElement = createStationElement(station, index);
        listContainer.appendChild(stationElement);
    });
    
    dropdown.appendChild(listContainer);
}

function createStationElement(station, index) {
    const element = document.createElement('div');
    element.className = 'station-item glass-effect rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors';
    element.dataset.stationIndex = index;
    
    // Station logo
    const logo = document.createElement('img');
    logo.src = station.logo;
    logo.alt = station.name;
    logo.className = 'w-10 h-10 object-contain rounded';
    logo.onerror = () => {
        logo.src = './images/generic-station-logo.svg';
    };
    
    // Station info
    const info = document.createElement('div');
    info.className = 'flex-1';
    
    const name = document.createElement('div');
    name.className = 'font-bold text-sm';
    name.textContent = station.name;
    
    const frequency = document.createElement('div');
    frequency.className = 'text-xs text-green-400';
    frequency.textContent = station.frequency
        .replace('AM:', 'AM ')
        .replace('FM:', 'FM ')
        .replace('Satellite Radio', 'SAT');
    
    info.appendChild(name);
    info.appendChild(frequency);
    
    element.appendChild(logo);
    element.appendChild(info);
    
    // Add click event
    element.addEventListener('click', (e) => {
        e.stopPropagation();
        selectStation(index);
        closeDropdown();
    });
    
    return element;
}

function filterStations(searchTerm) {
    const stationItems = document.querySelectorAll('.station-item');
    stationItems.forEach((item, index) => {
        const stationName = state.filteredStations[index].name.toLowerCase();
        const stationFrequency = state.filteredStations[index].frequency.toLowerCase();
        const matches = stationName.includes(searchTerm.toLowerCase()) || 
                       stationFrequency.includes(searchTerm.toLowerCase());
        item.style.display = matches ? 'flex' : 'none';
    });
}

function selectStation(index) {
    const station = state.filteredStations[index];
    if (station) {
        player.setStation(station);
        updateDesktopStation(station);
    }
}

// Initialize dropdown when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupStationDropdown();
});