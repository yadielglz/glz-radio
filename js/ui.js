import { dom } from './dom.js';
import { state } from './state.js';

export function updateClock(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    // Update top bar clock (12-hour format)
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = ((hours + 11) % 12 + 1); // Converts 24h to 12h, 0 to 12
    if(dom.clock) {
      dom.clock.textContent = `${displayHours}:${minutes} ${ampm}`;
    }

    // Update big clock (24-hour format)
    const bigClockHours = hours.toString().padStart(2, '0');
    if(dom.bigClock) {
      dom.bigClock.textContent = `${bigClockHours}:${minutes}`;
    }
}

export function updateTuner(index) {
    if (dom.tuner) {
        dom.tuner.value = index;
    }
}

export function updatePlayerUI(station, isPlaying) {
    const iconName = isPlaying ? 'pause' : 'play';
    dom.playBtn.innerHTML = `<i data-lucide="${iconName}" class="w-8 h-8 text-white"></i>`;
    
    if (isPlaying && station) {
        // State: Playing
        dom.idleDisplay.classList.add('hidden');
        dom.nowPlaying.classList.remove('hidden');
        dom.clock.classList.remove('invisible');

        dom.stationLogo.src = station.logo;
        dom.stationName.textContent = station.name;
        dom.stationFrequency.textContent = station.frequency;
        dom.stationCallsign.textContent = station.callSign;
    } else {
        // State: Idle
        dom.idleDisplay.classList.remove('hidden');
        dom.nowPlaying.classList.add('hidden');
        dom.clock.classList.add('invisible');
        
        if (station) {
            dom.idleStationInfo.textContent = station.name;
        } else {
            dom.idleStationInfo.textContent = '---';
        }
    }
    
    if (window.lucide) {
        lucide.createIcons();
    }
    
    updateRds(station, isPlaying);
}

export function updateRds(station, isPlaying) {
    if (state.rdsInterval) {
        clearInterval(state.rdsInterval);
        state.rdsInterval = null;
    }

    if (isPlaying && station && station.rdsText && station.rdsText.length > 0) {
        state.rdsTextIndex = 0;
        dom.rdsText.textContent = station.rdsText[state.rdsTextIndex];
        
        if (station.rdsText.length > 1) {
            state.rdsInterval = setInterval(() => {
                state.rdsTextIndex = (state.rdsTextIndex + 1) % station.rdsText.length;
                dom.rdsText.textContent = station.rdsText[state.rdsTextIndex];
            }, 4000);
        }
    } else if (station) {
        dom.rdsText.textContent = station.frequency;
    } else {
        dom.rdsText.textContent = 'GLZ Radio';
    }
}

export function updateNetworkStatus() {
    const isOnline = navigator.onLine;
    if (dom.connectionStatus) {
        if (isOnline) {
            dom.connectionStatus.innerHTML = '<i data-lucide="wifi" class="w-4 h-4 text-green-400 inline-block"></i>';
        } else {
            dom.connectionStatus.innerHTML = '<i data-lucide="wifi-off" class="w-4 h-4 text-red-400 inline-block"></i>';
        }
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

export function createTunerLabels(stations) {
    if (!dom.tunerLabels) return;

    dom.tunerLabels.innerHTML = ''; // Clear existing labels

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
            dom.tunerLabels.appendChild(label);
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