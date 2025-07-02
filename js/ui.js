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
        if (dom.stationSelect && dom.stationSelect.options[index]) {
            dom.stationSelect.value = index;
        }
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

        dom.playerDisplay.classList.add('playing');
        dom.playBtn.classList.add('playing');

        dom.stationLogo.src = station.logo;
        dom.stationName.textContent = station.name;
        dom.stationFrequency.textContent = station.frequency;
        dom.stationCallsign.textContent = station.callSign;

        // Trigger logo bounce, remove class after animation to allow re-trigger
        dom.stationLogo.classList.add('logo-bounce');
        setTimeout(() => dom.stationLogo.classList.remove('logo-bounce'), 700);

        // Apply dynamic glow color
        applyGlowFromLogo(station.logo);
    } else {
        // State: Idle
        dom.idleDisplay.classList.remove('hidden');
        dom.nowPlaying.classList.add('hidden');
        dom.clock.classList.add('invisible');
        
        dom.playerDisplay.classList.remove('playing');
        dom.playBtn.classList.remove('playing');
        
        dom.idleStationInfo.textContent = '';

        // Reset glow color to default (CSS handles default)
        if (dom.playerDisplay) {
            dom.playerDisplay.style.removeProperty('--glow-color');
        }
    }
    
    if (window.lucide) {
        lucide.createIcons();
    }
    
    updateRds(station, isPlaying);

    // Sync weather placements
    weatherSetPlayState(isPlaying);
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
    } else {
        // When not playing, reflect the selected band (AM, FM, SAT)
        dom.rdsText.textContent = state.currentBand;
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

export function updateBandButton(band) {
    if (dom.bandButtons && dom.bandButtons.length) {
        dom.bandButtons.forEach(btn => {
            const isActive = btn.dataset.band === band;
            if (isActive) {
                btn.classList.add('bg-white/20');
                btn.classList.remove('bg-white/10');
            } else {
                btn.classList.add('bg-white/10');
                btn.classList.remove('bg-white/20');
            }
        });
    }
}

export function updateStationDropdown(stations) {
    if (!dom.stationSelect) return;

    // Preserve current selection
    const currentVal = dom.stationSelect.value;

    dom.stationSelect.innerHTML = '';

    stations.forEach((station, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;

        const cleanedFreq = station.frequency
            .replace('AM:', '')
            .replace('FM:', '')
            .replace('Khz', '')
            .replace('Mhz', '')
            .trim();

        opt.textContent = station.frequency.startsWith('Satellite') ? station.name : `${cleanedFreq} · ${station.name}`;
        dom.stationSelect.appendChild(opt);
    });

    // Restore selection if possible
    if (currentVal && dom.stationSelect.options[currentVal]) {
        dom.stationSelect.value = currentVal;
    }
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
    if (!dom.playerDisplay) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = logoSrc;

    const color = await computeAverageColor(img);
    if (color) {
        const glow = `rgba(${color.r},${color.g},${color.b},0.45)`;
        dom.playerDisplay.style.setProperty('--glow-color', glow);
    } else {
        dom.playerDisplay.style.removeProperty('--glow-color');
    }
} 