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

    // Update big clock (AM/PM format as requested)
    const bigClockAmpm = hours >= 12 ? 'PM' : 'AM';
    const bigClockDisplayHours = ((hours + 11) % 12 + 1); // Converts 24h to 12h, 0 to 12
    if(dom.bigClock) {
      // Force AM/PM format and ensure it's not being overridden
      const timeString = `${bigClockDisplayHours}:${minutes} ${bigClockAmpm}`;
      dom.bigClock.textContent = timeString;
      console.log('Big clock updated to:', timeString); // Debug log
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
    const buttonText = isPlaying ? 'Pause' : 'Play';
    
    // Update main play button
    dom.playBtn.innerHTML = `<i data-lucide="${iconName}" class="w-6 h-6 text-white"></i><span id="play-btn-text" class="font-medium ml-2">${buttonText}</span>`;
    
    // Update desktop play button in now-playing section
    const desktopPlayBtn = document.getElementById('desktop-play-btn');
    if (desktopPlayBtn) {
        desktopPlayBtn.innerHTML = `<i data-lucide="${iconName}" class="w-6 h-6 text-white"></i><span class="font-medium">${buttonText}</span>`;
    }
    
    // Smooth transitions for station selection elements
    if (dom.stationSelect) {
        if (isPlaying) {
            dom.stationSelect.classList.add('hidden');
        } else {
            dom.stationSelect.classList.remove('hidden');
        }
    }
    
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

    // Play status removed - indicator handles the playing state

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
    // Function removed - playerDisplay element doesn't exist
    // This function was used for dynamic glow effects on the player display
} 