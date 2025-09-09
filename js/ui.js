import { dom } from './dom.js';
import { state } from './state.js';
import * as player from './player.js';

let currentGridStations = [];
let selectedStationIndex = null;
let showingAllStations = false;
const MOBILE_STATION_LIMIT = 6; // Show 6 stations initially on mobile

export function updateClock(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // Update top bar clock (12-hour format)
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = ((hours + 11) % 12 + 1); // Converts 24h to 12h, 0 to 12
    const timeString = `${displayHours}:${minutes} ${ampm}`;
    
    if(dom.clock) {
        dom.clock.textContent = timeString;
    }

    // Update mobile clock (same format)
    const mobileClockElement = document.getElementById('mobile-clock');
    if(mobileClockElement) {
        mobileClockElement.textContent = timeString;
    }

    // Update big clock (AM/PM format as requested)
    const bigClockAmpm = hours >= 12 ? 'PM' : 'AM';
    const bigClockDisplayHours = ((hours + 11) % 12 + 1); // Converts 24h to 12h, 0 to 12
    if(dom.bigClock) {
        const bigTimeString = `${bigClockDisplayHours}:${minutes} ${bigClockAmpm}`;
        dom.bigClock.textContent = bigTimeString;
    }
}

export function updatePlayerUI(station, isPlaying) {
    const iconName = isPlaying ? 'pause' : 'play';
    const buttonText = isPlaying ? 'Pause' : 'Resume';

    // Handle play button visibility and content
    if (station) {
        // Station is selected - show play button
        if (dom.playBtnContainer) {
            dom.playBtnContainer.classList.remove('hidden');
        }
        
        // Update main play button with new structure
        if (dom.playBtn) {
            const playBtnInner = dom.playBtn.querySelector('.bg-gradient-to-r');
            if (playBtnInner) {
                playBtnInner.innerHTML = `
                    <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <i data-lucide="${iconName}" class="w-5 h-5 text-white ${iconName === 'play' ? 'ml-0.5' : ''}"></i>
                    </div>
                    <span id="play-btn-text" class="font-bold text-xl text-white">${buttonText}</span>
                `;
            }
        }
    } else {
        // No station selected - hide play button
        if (dom.playBtnContainer) {
            dom.playBtnContainer.classList.add('hidden');
        }
    }

    // Update desktop play button in now-playing section
    if (dom.desktopPlayBtn) {
        dom.desktopPlayBtn.innerHTML = `<i data-lucide="${iconName}" class="w-6 h-6"></i><span>${buttonText}</span>`;
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
    } else if (station && !isPlaying) {
        // State: Station selected but paused
        // Hide now playing display
        if (dom.nowPlaying) {
            dom.nowPlaying.classList.add('hidden');
        }

        // Show station controls but keep idle display hidden
        if (dom.idleDisplay) {
            dom.idleDisplay.classList.add('hidden');
        }
        const stationControls = document.getElementById('station-controls');
        if (stationControls) {
            stationControls.classList.remove('hidden');
        }
    } else {
        // State: No station selected (true idle)
        // Hide now playing display
        if (dom.nowPlaying) {
            dom.nowPlaying.classList.add('hidden');
        }

        // Show idle display and station controls
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
            const glassPanel = btn.querySelector('.glass-panel');

            // Remove all state classes
            btn.classList.remove('active');

            if (isActive) {
                // Active band
                btn.classList.add('active');
                
                // Add active styling to the glass panel
                if (glassPanel) {
                    glassPanel.style.background = 'linear-gradient(135deg, rgb(59, 130, 246), rgb(139, 92, 246))';
                    glassPanel.style.borderColor = 'rgb(59, 130, 246)';
                    glassPanel.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.5), 0 8px 32px rgba(0, 0, 0, 0.3)';
                    glassPanel.style.transform = 'scale(1.05)';
                }
            } else {
                // Reset inactive band styling
                if (glassPanel) {
                    glassPanel.style.background = '';
                    glassPanel.style.borderColor = '';
                    glassPanel.style.boxShadow = '';
                    glassPanel.style.transform = '';
                }
            }
        });
    }
}

export function updateStationGrid() {
    currentGridStations = [...state.filteredStations];
    console.log('🔄 Updating station grid with', currentGridStations.length, 'stations');
    console.log('📻 Filtered stations:', state.filteredStations);
    console.log('🎛️ Current band:', state.currentBand);
    
    // Update both mobile cards and desktop grid
    renderStationGrid();
    
    // Force re-render if we're on mobile
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
        console.log('📱 Mobile detected, ensuring station cards are populated');
        setTimeout(() => renderMobileStationCards(), 100);
    }
}

// Debug function to test if grid is working
export function addTestCard() {
    if (!dom.stationGrid) {
        console.error('Station grid not found for test');
        return;
    }
    
    const testCard = document.createElement('div');
    testCard.className = 'station-card glass-panel p-4 rounded-xl bg-red-500';
    testCard.innerHTML = '<div class="text-center text-white">TEST CARD</div>';
    testCard.style.minHeight = '120px';
    testCard.style.border = '2px solid red';
    dom.stationGrid.appendChild(testCard);
    console.log('Test card added to grid');
}

// Expose debug functions globally for console testing
window.debugStationGrid = {
    addTestCard,
    updateStationGrid,
    renderStationGrid,
    getCurrentStations: () => currentGridStations,
    getGridElement: () => dom.stationGrid
};

function renderStationGrid() {
    const isMobile = window.innerWidth < 640;
    
    if (isMobile) {
        // Render mobile station cards
        renderMobileStationCards();
    } else {
        // Render desktop grid
        renderDesktopGrid();
    }
}

function renderMobileStationCards() {
    const mobileGrid = dom.mobileStationGrid;
    if (!mobileGrid) {
        console.error('Mobile station grid not found');
        return;
    }

    console.log('📱 Rendering mobile station cards with stations:', currentGridStations.length);
    console.log('🎛️ Current band:', state.currentBand);
    console.log('📻 Filtered stations:', state.filteredStations);

    // Clear existing cards
    mobileGrid.innerHTML = '';
    
    // Add station cards from current band only
    if (currentGridStations && currentGridStations.length > 0) {
        currentGridStations.forEach((station, index) => {
            const stationCard = createMobileStationCard(station, index);
            mobileGrid.appendChild(stationCard);
        });
        console.log(`✅ Added ${currentGridStations.length} ${state.currentBand} station cards to mobile grid`);
    } else {
        console.warn('⚠️ No stations available for mobile cards');
        // Show a placeholder message
        mobileGrid.innerHTML = `
            <div class="text-center py-8 text-slate-400">
                <i data-lucide="radio" class="w-12 h-12 mx-auto mb-4 opacity-50"></i>
                <p class="text-lg font-medium">No ${state.currentBand} stations available</p>
                <p class="text-sm">Try selecting a different band</p>
            </div>
        `;
    }

    // Create icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

function renderDesktopGrid() {
    if (!dom.stationGrid) {
        console.error('Station grid element not found');
        return;
    }

    // Determine how many stations to show
    const stationsToShow = !showingAllStations 
        ? currentGridStations.slice(0, 12) // Show 12 initially on desktop
        : currentGridStations;
    
    console.log(`Rendering desktop grid: showingAll=${showingAllStations}, totalStations=${currentGridStations.length}, stationsToShow=${stationsToShow.length}`);
    
    // Clear the grid
    dom.stationGrid.innerHTML = '';
    
    // Add station cards
    stationsToShow.forEach((station, index) => {
        const actualIndex = currentGridStations.indexOf(station);
        const stationCard = createStationCard(station, actualIndex);
        dom.stationGrid.appendChild(stationCard);
    });
    
    // Show/hide the "show more" button
    if (currentGridStations.length > 12) {
        if (dom.showMoreContainer) {
            dom.showMoreContainer.classList.remove('hidden');
        }
    } else {
        if (dom.showMoreContainer) {
            dom.showMoreContainer.classList.add('hidden');
        }
    }

    console.log(`Added ${stationsToShow.length} station cards to desktop grid`);

    // Create icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

function createMobileStationCard(station, index) {
    const card = document.createElement('div');
    card.className = `mobile-station-card bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105 ${
        selectedStationIndex === index ? 'ring-2 ring-blue-400 bg-blue-500/10 border-blue-400/50' : ''
    }`;
    card.dataset.index = index;

    card.innerHTML = `
        <div class="flex items-center space-x-4">
            <div class="relative flex-shrink-0">
                <img src="${station.logo}" alt="${station.name}" 
                     class="w-12 h-12 object-contain rounded-lg shadow-md"
                     onerror="this.src='./images/generic-station-logo.svg'">
                ${selectedStationIndex === index ? `
                    <div class="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <i data-lucide="check" class="w-2.5 h-2.5 text-white"></i>
                    </div>
                ` : ''}
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="font-bold text-white text-sm mb-1 truncate">${station.name}</h4>
                <p class="text-xs text-blue-400 font-medium font-mono truncate">
                    ${station.frequency.replace('AM:', 'AM ').replace('FM:', 'FM ').replace('Satellite Radio', 'SAT')}
                </p>
                ${station.callSign ? `
                    <p class="text-xs text-white/50 mt-1 truncate">${station.callSign}</p>
                ` : ''}
            </div>
            <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <i data-lucide="play" class="w-4 h-4 text-white"></i>
                </div>
            </div>
        </div>
    `;

    // Add click handler
    card.addEventListener('click', () => selectStationFromGrid(index));
    
    // Add hover effects
    card.addEventListener('mouseenter', () => {
        if (selectedStationIndex !== index) {
            card.style.transform = 'scale(1.02)';
        }
    });
    
    card.addEventListener('mouseleave', () => {
        if (selectedStationIndex !== index) {
            card.style.transform = '';
        }
    });

    return card;
}

function createStationCard(station, index) {
    const card = document.createElement('div');
    card.className = `station-card glass-panel p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
        selectedStationIndex === index ? 'selected ring-2 ring-blue-400 ring-opacity-75' : ''
    }`;
    card.dataset.index = index;

    card.innerHTML = `
        <div class="text-center">
            <div class="relative mb-2 lg:mb-3 mx-auto w-12 h-12 lg:w-16 lg:h-16">
                <img src="${station.logo}" alt="${station.name}" 
                     class="w-full h-full object-contain rounded-lg shadow-md transition-transform duration-200 hover:scale-110"
                     onerror="this.src='./images/generic-station-logo.svg'">
                ${selectedStationIndex === index ? `
                    <div class="absolute -top-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <i data-lucide="check" class="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white"></i>
                    </div>
                ` : ''}
            </div>
            <h4 class="font-bold text-white/90 text-xs lg:text-sm mb-1 truncate">${station.name}</h4>
            <p class="text-xs lg:text-sm text-blue-400 font-medium truncate font-mono">
                ${station.frequency.replace('AM:', 'AM ').replace('FM:', 'FM ').replace('Satellite Radio', 'SAT')}
            </p>
            ${station.callSign ? `
                <p class="text-xs text-white/50 mt-1 truncate">${station.callSign}</p>
            ` : ''}
        </div>
    `;

    // Add click handler
    card.addEventListener('click', () => selectStationFromGrid(index));
    
    // Add hover effects
    card.addEventListener('mouseenter', () => {
        if (selectedStationIndex !== index) {
            card.style.transform = 'translateY(-2px) scale(1.02)';
        }
    });
    
    card.addEventListener('mouseleave', () => {
        if (selectedStationIndex !== index) {
            card.style.transform = '';
        }
    });

    return card;
}

function selectStationFromGrid(index) {
    const station = currentGridStations[index];
    if (station) {
        selectedStationIndex = index;
        player.setStation(station);
        
        // Re-render grid to show selection
        renderStationGrid();
        
        // Auto-play the selected station
        setTimeout(() => {
            player.togglePlay();
        }, 300); // Small delay to allow UI to update
    }
}

function toggleShowMore() {
    showingAllStations = !showingAllStations;
    
    if (dom.showMoreText && dom.showMoreIcon) {
        dom.showMoreText.textContent = showingAllStations ? 'Show Less' : 'Show All Stations';
        dom.showMoreIcon.setAttribute('data-lucide', showingAllStations ? 'chevron-up' : 'chevron-down');
    }
    
    renderStationGrid();
}

// Initialize grid event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Show more/less button
    if (dom.showMoreBtn) {
        dom.showMoreBtn.addEventListener('click', toggleShowMore);
    }

    // Handle window resize to adjust mobile/desktop view
    window.addEventListener('resize', () => {
        // Only re-render if we have stations loaded
        if (currentGridStations.length > 0) {
            console.log('📱 Window resized, re-rendering station grid');
            renderStationGrid();
        }
    });
    
    // Debug function for mobile station cards
    window.debugMobileStations = () => {
        const mobileGrid = dom.mobileStationGrid;
        console.log('📱 Mobile station cards debug:', {
            element: mobileGrid,
            cards: mobileGrid?.children?.length || 0,
            currentBand: state.currentBand,
            filteredStations: state.filteredStations.length,
            currentGridStations: currentGridStations.length
        });
    };
    
    // Note: Station grid initialization is handled by app.js after stations are loaded
});