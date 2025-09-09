import { dom } from './dom.js';
import { state } from './state.js';
import * as player from './player.js';

let currentStations = [];
let selectedStationIndex = null;
let showingAllStations = false;
const STATIONS_PER_PAGE = 6;

export function updateClock(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // Update top bar clock (12-hour format)
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = ((hours + 11) % 12 + 1);
    const timeString = `${displayHours}:${minutes} ${ampm}`;
    
    if(dom.clock) {
        dom.clock.textContent = timeString;
    }

    // Update big clock
    if(dom.bigClock) {
        dom.bigClock.textContent = timeString;
    }
}

export function updatePlayerUI(station, isPlaying) {
    const iconName = isPlaying ? 'pause' : 'play';
    const buttonText = isPlaying ? 'Pause' : 'Play';

    // Update play/pause button
    if (dom.playPauseBtn) {
        const icon = dom.playPauseBtn.querySelector('i');
        const text = dom.playPauseBtn.querySelector('span');
        if (icon) icon.setAttribute('data-lucide', iconName);
        if (text) text.textContent = buttonText;
    }

    if (isPlaying && station) {
        // Show now playing display
        if (dom.nowPlaying) {
            dom.nowPlaying.classList.remove('hidden');
        }

        // Hide welcome screen and station browser
        if (dom.welcomeScreen) {
            dom.welcomeScreen.classList.add('hidden');
        }
        if (dom.stationBrowser) {
            dom.stationBrowser.classList.add('hidden');
        }

        // Update station info
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
        // Station selected but paused - show station browser
        if (dom.nowPlaying) {
            dom.nowPlaying.classList.add('hidden');
        }
        if (dom.welcomeScreen) {
            dom.welcomeScreen.classList.add('hidden');
        }
        if (dom.stationBrowser) {
            dom.stationBrowser.classList.remove('hidden');
        }
    } else {
        // No station selected - show welcome screen
        if (dom.nowPlaying) {
            dom.nowPlaying.classList.add('hidden');
        }
        if (dom.stationBrowser) {
            dom.stationBrowser.classList.add('hidden');
        }
        if (dom.welcomeScreen) {
            dom.welcomeScreen.classList.remove('hidden');
        }
    }

    if (window.lucide) {
        lucide.createIcons();
    }

    updateRds(station, isPlaying);
}

export function updateRds(station, isPlaying) {
    // Clear any existing timers
    if (state.rdsInterval) {
        clearInterval(state.rdsInterval);
        state.rdsInterval = null;
    }

    if (isPlaying && station && station.rdsText && station.rdsText.length > 0) {
        state.rdsTextIndex = 0;
        if (station.rdsText.length > 1) {
            state.rdsInterval = setInterval(() => {
                state.rdsTextIndex = (state.rdsTextIndex + 1) % station.rdsText.length;
            }, 4000);
        }
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

export function updateBandSelectors(selectedBand) {
    if (dom.bandSelectors && dom.bandSelectors.length) {
        dom.bandSelectors.forEach(btn => {
            const isActive = btn.dataset.band === selectedBand;
            const glassPanel = btn.querySelector('div');

            // Remove active class
            btn.classList.remove('active');

            if (isActive) {
                // Add active styling
                btn.classList.add('active');
                if (glassPanel) {
                    glassPanel.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))';
                    glassPanel.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                    glassPanel.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.3)';
                }
            } else {
                // Reset styling
                if (glassPanel) {
                    glassPanel.style.background = '';
                    glassPanel.style.borderColor = '';
                    glassPanel.style.boxShadow = '';
                }
            }
        });
    }
}

export function showStationBrowser(band) {
    currentStations = [...state.filteredStations];
    console.log('🎛️ Showing station browser for', band, 'with', currentStations.length, 'stations');
    console.log('📻 Filtered stations:', state.filteredStations);
    console.log('📻 Current stations:', currentStations);
    
    // Update band display
    if (dom.currentBandDisplay) {
        dom.currentBandDisplay.textContent = band;
    }
    
    // Show station browser
    if (dom.stationBrowser) {
        dom.stationBrowser.classList.remove('hidden');
        console.log('✅ Station browser shown');
    } else {
        console.error('❌ Station browser element not found!');
    }
    
    // Hide welcome screen
    if (dom.welcomeScreen) {
        dom.welcomeScreen.classList.add('hidden');
    }
    
    // Render stations
    console.log('🎯 About to render stations...');
    renderStations();
}

export function hideStationBrowser() {
    if (dom.stationBrowser) {
        dom.stationBrowser.classList.add('hidden');
    }
    if (dom.welcomeScreen) {
        dom.welcomeScreen.classList.remove('hidden');
    }
}

function renderStations() {
    const isMobile = window.innerWidth < 1024;
    console.log('📱 Rendering stations - isMobile:', isMobile, 'width:', window.innerWidth);
    console.log('📻 Current stations:', currentStations.length);
    console.log('📻 Station browser element:', dom.stationBrowser);
    console.log('📻 Mobile list element:', dom.mobileStationList);
    console.log('📻 Desktop grid element:', dom.desktopStationGrid);
    
    // Always render both mobile and desktop, but show/hide based on screen size
    console.log('📱 Rendering mobile stations');
    renderMobileStations();
    
    console.log('🖥️ Rendering desktop stations');
    renderDesktopStations();
    
    // Show/hide based on screen size
    if (isMobile) {
        if (dom.mobileStationList) {
            dom.mobileStationList.classList.remove('hidden');
        }
        if (dom.desktopStationGrid) {
            dom.desktopStationGrid.classList.add('hidden');
        }
    } else {
        if (dom.mobileStationList) {
            dom.mobileStationList.classList.add('hidden');
        }
        if (dom.desktopStationGrid) {
            dom.desktopStationGrid.classList.remove('hidden');
        }
    }
}

function renderMobileStations() {
    const mobileList = dom.mobileStationList;
    console.log('📱 Mobile list element:', mobileList);
    console.log('📱 Current stations array:', currentStations);
    console.log('📱 Stations per page:', STATIONS_PER_PAGE);
    console.log('📱 Showing all stations:', showingAllStations);
    
    if (!mobileList) {
        console.error('❌ Mobile station list element not found!');
        return;
    }

    // Clear existing stations
    mobileList.innerHTML = '';
    console.log('📱 Cleared mobile list');
    
    // Determine how many stations to show
    const stationsToShow = !showingAllStations 
        ? currentStations.slice(0, STATIONS_PER_PAGE)
        : currentStations;
    
    console.log('📱 Stations to show:', stationsToShow.length, 'showingAll:', showingAllStations);
    console.log('📱 Stations to show array:', stationsToShow);
    
    if (stationsToShow.length === 0) {
        console.warn('⚠️ No stations to show!');
        return;
    }
    
    // Add station items
    stationsToShow.forEach((station, index) => {
        console.log('📱 Creating mobile item for:', station.name, 'at index:', index);
        const stationItem = createMobileStationItem(station, index);
        if (stationItem) {
            mobileList.appendChild(stationItem);
            console.log('📱 Successfully added station item for:', station.name);
        } else {
            console.error('❌ Failed to create station item for:', station.name);
        }
    });
    
    console.log('📱 Added', stationsToShow.length, 'mobile station items');
    console.log('📱 Mobile list now has', mobileList.children.length, 'children');
    
    // Update load more button
    updateLoadMoreButton();
    
    // Create icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

function renderDesktopStations() {
    const desktopGrid = dom.desktopStationGrid;
    if (!desktopGrid) return;

    // Clear existing stations
    desktopGrid.innerHTML = '';
    
    // Determine how many stations to show
    const stationsToShow = !showingAllStations 
        ? currentStations.slice(0, STATIONS_PER_PAGE)
        : currentStations;
    
    // Add station cards
    stationsToShow.forEach((station, index) => {
        const stationCard = createDesktopStationCard(station, index);
        desktopGrid.appendChild(stationCard);
    });
    
    // Update load more button
    updateLoadMoreButton();
    
    // Create icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

function createMobileStationItem(station, index) {
    const item = document.createElement('div');
    item.className = `mobile-station-item bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/20 ${
        selectedStationIndex === index ? 'ring-2 ring-blue-400 bg-blue-500/10' : ''
    }`;
    item.dataset.index = index;

    item.innerHTML = `
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
    item.addEventListener('click', () => selectStation(index));
    
    return item;
}

function createDesktopStationCard(station, index) {
    const card = document.createElement('div');
    card.className = `desktop-station-card bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105 ${
        selectedStationIndex === index ? 'ring-2 ring-blue-400 bg-blue-500/10' : ''
    }`;
    card.dataset.index = index;

    card.innerHTML = `
        <div class="text-center">
            <div class="relative mb-4 mx-auto w-16 h-16">
                <img src="${station.logo}" alt="${station.name}" 
                     class="w-full h-full object-contain rounded-lg shadow-md transition-transform duration-200 hover:scale-110"
                     onerror="this.src='./images/generic-station-logo.svg'">
                ${selectedStationIndex === index ? `
                    <div class="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <i data-lucide="check" class="w-3 h-3 text-white"></i>
                    </div>
                ` : ''}
            </div>
            <h4 class="font-bold text-white text-sm mb-2 truncate">${station.name}</h4>
            <p class="text-xs text-blue-400 font-medium font-mono truncate mb-1">
                ${station.frequency.replace('AM:', 'AM ').replace('FM:', 'FM ').replace('Satellite Radio', 'SAT')}
            </p>
            ${station.callSign ? `
                <p class="text-xs text-white/50 truncate">${station.callSign}</p>
            ` : ''}
        </div>
    `;

    // Add click handler
    card.addEventListener('click', () => selectStation(index));
    
    return card;
}

function selectStation(index) {
    const station = currentStations[index];
    if (station) {
        selectedStationIndex = index;
        player.setStation(station);
        
        // Re-render to show selection
        renderStations();
        
        // Auto-play the selected station
        setTimeout(() => {
            player.togglePlay();
        }, 300);
    }
}

function updateLoadMoreButton() {
    if (!dom.loadMoreContainer) return;
    
    if (currentStations.length > STATIONS_PER_PAGE) {
        dom.loadMoreContainer.classList.remove('hidden');
        
        if (dom.loadMoreText && dom.loadMoreIcon) {
            dom.loadMoreText.textContent = showingAllStations ? 'Show Less' : 'Load More Stations';
            dom.loadMoreIcon.setAttribute('data-lucide', showingAllStations ? 'chevron-up' : 'chevron-down');
        }
    } else {
        dom.loadMoreContainer.classList.add('hidden');
    }
}

function toggleLoadMore() {
    showingAllStations = !showingAllStations;
    renderStations();
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load more button
    if (dom.loadMoreBtn) {
        dom.loadMoreBtn.addEventListener('click', toggleLoadMore);
    }

    // Back to bands button
    if (dom.backToBandsBtn) {
        dom.backToBandsBtn.addEventListener('click', hideStationBrowser);
    }

    // Band selectors
    if (dom.bandSelectors && dom.bandSelectors.length) {
        dom.bandSelectors.forEach(btn => {
            btn.addEventListener('click', () => {
                const band = btn.dataset.band;
                if (band && band !== state.currentBand) {
                    // Update state
                    state.currentBand = band;
                    state.filteredStations = filterByBand(band);
                    
                    // Update UI
                    updateBandSelectors(band);
                    showStationBrowser(band);
                }
            });
        });
    }

    // Play/Pause button
    if (dom.playPauseBtn) {
        dom.playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            player.togglePlay();
        });
    }

    // Stop button
    if (dom.stopBtn) {
        dom.stopBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            player.stop();
        });
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        if (currentStations.length > 0) {
            renderStations();
        }
    });
});

// Helper function to filter stations by band
function filterByBand(band) {
    switch (band) {
        case 'AM':
            return state.stations.filter(s => s.frequency.startsWith('AM'));
        case 'FM':
            return state.stations.filter(s => s.frequency.startsWith('FM'));
        case 'SAT':
        default:
            return state.stations.filter(s => s.frequency.startsWith('Satellite') || s.frequency.includes('Satellite'));
    }
}

// Debug functions
window.debugMobileStations = () => {
    const mobileGrid = dom.mobileStationList;
    console.log('📱 Mobile station cards debug:', {
        element: mobileGrid,
        cards: mobileGrid?.children?.length || 0,
        currentBand: state.currentBand,
        filteredStations: state.filteredStations.length,
        currentStations: currentStations.length,
        windowWidth: window.innerWidth,
        isMobile: window.innerWidth < 1024
    });
};

window.testMobileRendering = () => {
    console.log('🧪 Testing mobile rendering...');
    showStationBrowser('FM');
};