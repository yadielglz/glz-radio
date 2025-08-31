import { dom } from './dom.js';
import { state } from './state.js';
import * as player from './player.js';

let currentModalStations = [];

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
        dom.playBtn.innerHTML = `<i data-lucide="${iconName}" class="w-6 h-6"></i><span id="play-btn-text" class="ml-2">${buttonText}</span>`;
    }

    // Update desktop play button in now-playing section
    if (dom.desktopPlayBtn) {
        dom.desktopPlayBtn.innerHTML = `<i data-lucide="${iconName}" class="w-5 h-5"></i><span>${buttonText}</span>`;
    }

    if (isPlaying && station) {
        // State: Playing
        // Show now playing display
        if (dom.nowPlaying) {
            dom.nowPlaying.classList.remove('hidden');
        }

        // Hide idle display and station controls when playing
        if (dom.idleDisplay) {
            dom.idleDisplay.classList.add('hidden');
        }
        const stationControls = document.getElementById('station-controls');
        if (stationControls) {
            stationControls.classList.add('hidden');
        }

        if (dom.stationLogo) dom.stationLogo.src = station.logo;
        if (dom.stationName) dom.stationName.textContent = station.name;
        if (dom.stationFrequency) dom.stationFrequency.textContent = station.frequency;
        if (dom.stationCallsign) dom.stationCallsign.textContent = station.callSign;

        // Trigger logo bounce animation
        if (dom.stationLogo) {
            dom.stationLogo.classList.add('logo-bounce');
            setTimeout(() => dom.stationLogo.classList.remove('logo-bounce'), 700);
        }
    } else {
        // State: Idle
        // Hide now playing display
        if (dom.nowPlaying) {
            dom.nowPlaying.classList.add('hidden');
        }

        // Show idle display and station controls when idle
        if (dom.idleDisplay) {
            dom.idleDisplay.classList.remove('hidden');
        }
        const stationControls = document.getElementById('station-controls');
        if (stationControls) {
            stationControls.classList.remove('hidden');
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

            // Remove all state classes
            btn.classList.remove('active');

            if (isActive) {
                // Active band
                btn.classList.add('active');
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
    } else {
        // Reset to default state
        if (dom.desktopStationLogo) dom.desktopStationLogo.src = './images/generic-station-logo.svg';
        if (dom.desktopStationName) dom.desktopStationName.textContent = 'Select a station';
        if (dom.desktopStationFrequency) dom.desktopStationFrequency.textContent = 'Click to browse';
    }
}

export function openStationModal() {
    if (dom.stationModal && dom.stationList) {
        currentModalStations = [...state.filteredStations];
        renderStationList();
        dom.stationModal.classList.remove('hidden');
        if (dom.stationSearch) {
            dom.stationSearch.focus();
        }
    }
}

export function closeStationModal() {
    if (dom.stationModal) {
        dom.stationModal.classList.add('hidden');
        if (dom.stationSearch) {
            dom.stationSearch.value = '';
        }
    }
}

function renderStationList(searchTerm = '') {
    if (!dom.stationList) return;

    const filteredStations = currentModalStations.filter(station =>
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.frequency.toLowerCase().includes(searchTerm.toLowerCase())
    );

    dom.stationList.innerHTML = '';

    filteredStations.forEach((station, index) => {
        const stationElement = document.createElement('div');
        stationElement.className = 'station-item p-4 flex items-center space-x-3 cursor-pointer hover:bg-white/10 transition-colors';
        stationElement.dataset.index = index;

        const logo = document.createElement('img');
        logo.src = station.logo;
        logo.alt = station.name;
        logo.className = 'w-12 h-12 object-contain rounded-lg';
        logo.onerror = () => {
            logo.src = './images/generic-station-logo.svg';
        };

        const info = document.createElement('div');
        info.className = 'flex-1';

        const name = document.createElement('div');
        name.className = 'font-semibold text-white';
        name.textContent = station.name;

        const frequency = document.createElement('div');
        frequency.className = 'text-sm text-blue-400';
        frequency.textContent = station.frequency
            .replace('AM:', 'AM ')
            .replace('FM:', 'FM ')
            .replace('Satellite Radio', 'SAT');

        info.appendChild(name);
        info.appendChild(frequency);

        stationElement.appendChild(logo);
        stationElement.appendChild(info);

        stationElement.addEventListener('click', () => selectStationFromModal(index));

        dom.stationList.appendChild(stationElement);
    });
}

function selectStationFromModal(index) {
    const station = currentModalStations[index];
    if (station) {
        player.setStation(station);
        updateDesktopStation(station);
        closeStationModal();
    }
}

// Initialize modal event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Station selector button
    if (dom.desktopCurrentStation) {
        dom.desktopCurrentStation.addEventListener('click', openStationModal);
    }

    // Close modal button
    if (dom.closeModal) {
        dom.closeModal.addEventListener('click', closeStationModal);
    }

    // Close modal on outside click
    if (dom.stationModal) {
        dom.stationModal.addEventListener('click', (e) => {
            if (e.target === dom.stationModal) {
                closeStationModal();
            }
        });
    }

    // Search functionality
    if (dom.stationSearch) {
        dom.stationSearch.addEventListener('input', (e) => {
            renderStationList(e.target.value);
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dom.stationModal && !dom.stationModal.classList.contains('hidden')) {
            closeStationModal();
        }
    });
});