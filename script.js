// Radio Stations Configuration
const RADIO_STATIONS = {
    "WKAQ 580": {
        "logo": "https://i.iheart.com/v3/re/assets/images/77d5680e-688b-4488-8c56-9b4963cb0813.png",
        "streamUrl": "https://tunein.cdnstream1.com/4851_128.mp3",
        "frequency": "AM: 580 Khz",
        "callSign": "WKAQ AM",
        "rdsText": ["WKAQ 580", "WKAQ AM", "580 AM", "San Juan, PR"]
    },
    "NOTIUNO 630": {
        "logo": "https://www.unoradio.com/logos/logos/notiuno/notiuno630.png",
        "streamUrl": "https://server20.servistreaming.com:9022/stream",
        "frequency": "AM: 630 Khz",
        "callSign": "WUNO AM",
        "rdsText": ["NotiUno 630", "WUNO AM", "630 AM", "San Juan, PR"]
    },
    "Radio Once": {
        "logo": "https://radioIsla.tv/wp-content/uploads/2019/06/Logo-Radio-Isla.png",
        "streamUrl": "http://49.13.212.200:14167/stream?type=http&nocache=21",
        "frequency": "AM: 1120 Khz",
        "callSign": "WMSW AM",
        "rdsText": ["Radio Once", "WMSW AM", "1120 AM", "Hatillo, PR"]
    },
    "Radio Isla": {
        "logo": "https://radioIsla.tv/wp-content/uploads/2019/06/Logo-Radio-Isla.png",
        "streamUrl": "https://server7.servistreaming.com/proxy/radioisla?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        "frequency": "AM: 1320 Khz",
        "callSign": "WSKN AM",
        "rdsText": ["Radio Isla", "WSKN AM", "1320 AM", "San Juan, PR"]
    },
    "Radio Tiempo": {
        "logo": "https://radiotiempo.net/wp-content/uploads/2022/08/tiempo-172x128.png",
        "streamUrl": "https://server7.servistreaming.com/proxy/tiempo?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        "frequency": "AM: 1430 Khz",
        "callSign": "WNLE AM",
        "rdsText": ["Radio Tiempo", "WNLE AM", "1430 AM", "Caguas, PR"]
    },
    "Radio Cumbre": {
        "logo": "https://i.ibb.co/5g2402Cc/wkum-png.png",
        "streamUrl": "https://sp.unoredcdn.net/8158/stream/1/",
        "frequency": "AM: 1470 Khz",
        "callSign": "WKUM AM",
        "rdsText": ["Radio Cumbre", "WKUM AM", "1470 AM", "Orocovis, PR"]
    },
    "Radio Oro": {
        "logo": "https://cdn-profiles.tunein.com/s21791/images/logod.png?t=637238626060000000",
        "streamUrl": "https://us2.internet-radio.com/proxy/woro?mp=/stream",
        "frequency": "FM: 92.5 Mhz",
        "callSign": "WORO FM",
        "rdsText": ["Radio Oro", "WORO FM", "92.5 FM", "Corozal, PR"]
    },
    "Z 93": {
        "logo": "https://i.ibb.co/23BMsKBY/wznt-png.png",
        "streamUrl": "https://liveaudio.lamusica.com/PR_WZNT_icy",
        "frequency": "FM: 93.7 Mhz",
        "callSign": "WZNT FM",
        "rdsText": ["Z 93", "La Emisora", "Nacional", "De La Salsa", "WZNT FM", "93.7 FM", "San Juan", "Puerto Rico"]
    },
    "La Nueva 94": {
        "logo": "https://i.ibb.co/sv1RBc08/wodalogo.png",
        "streamUrl": "https://liveaudio.lamusica.com/PR_WODA_icy",
        "frequency": "FM: 94.7 Mhz",
        "callSign": "WODA FM",
        "rdsText": ["La Nueva 94", "Los #1", "En Joda", "WODA FM", "94.7 FM", "San Juan", "Puerto Rico"]
    },
    "Fidelity": {
        "logo": "https://fidelitypr.com/wp-content/uploads/2022/01/cropped-Redisen%CC%83o-Logo-Fidelity-3-15-2048x677.png",
        "streamUrl": "https://server7.servistreaming.com/proxy/fidelity?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        "frequency": "FM: 95.7 Mhz",
        "callSign": "WFID FM",
        "rdsText": ["Fidelity", "Tu Vida", "En Música", "WFID FM", "95.7 FM", "Rio Piedras", "Puerto Rico"]
    },
    "Estereotempo": {
        "logo": "https://i.ibb.co/F4GM0W81/wrxr.png",
        "streamUrl": "https://liveaudio.lamusica.com/PR_WRXD_icy",
        "frequency": "FM: 96.5 Mhz",
        "callSign": "WRXD FM",
        "rdsText": ["Estereotempo", "WRXD FM", "96.5 FM", "San Juan", "Puerto Rico"]
    },
    "Magic 97.3": {
        "logo": "https://i.ibb.co/Z6WqXPzV/woye.png",
        "streamUrl": "https://stream.eleden.com:8210/magic.aac",
        "frequency": "FM: 97.3 Mhz",
        "callSign": "WOYE FM",
        "rdsText": ["Magic 97.3", "WOYE FM", "97.3 FM", "Rio Grande", "Puerto Rico"]
    },
    "SalSoul": {
        "logo": "https://salsoul.com/wp-content/uploads/2020/12/cropped-salsoul-2.png",
        "streamUrl": "https://server20.servistreaming.com:9023/stream?type=.mp3&_=1",
        "frequency": "FM: 99.1 Mhz",
        "callSign": "WPRM FM",
        "rdsText": ["SalSoul", "WPRM FM", "99.1 FM", "San Juan", "Puerto Rico"]
    },
    "La X": {
        "logo": "https://i.ibb.co/zWDcRnBw/laxpng.png",
        "streamUrl": "http://stream.eleden.com:8235/lax.ogg",
        "frequency": "FM: 100.7 Mhz",
        "callSign": "WXYX FM",
        "rdsText": ["La X", "Para", "Los Que Llevan", "La Musica", "Por Dentro", "WXYX FM", "100.7 FM", "Bayamón", "Puerto Rico"]
    },
    "Hot102": {
        "logo": "https://hot102pr.com/wp-content/uploads/2023/10/Artboard-4.png",
        "streamUrl": "https://server7.servistreaming.com/proxy/hot?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        "frequency": "FM: 102.5 Mhz",
        "callSign": "WTOK FM",
        "rdsText": ["HOT 102", "WTOK FM", "102.5 FM", "San Juan", "Puerto Rico"]
    },
    "KQ105": {
        "logo": "https://upload.wikimedia.org/wikipedia/en/8/80/KQ_105_WKAQ-FM_2014_logo.png",
        "streamUrl": "https://televicentro.streamguys1.com/wkaqfm-icy?key=e018260d508e5b04e91a4d9a30f7ceea9b71bd86e2bfdb6fcc3bbd4928525c00",
        "frequency": "FM: 104.7 Mhz",
        "callSign": "WKAQ FM",
        "rdsText": ["KQ 105", "La Primera", "WKAQ FM", "104.7 FM", "San Juan", "Puerto Rico"]
    },
    "La Mega 106.9": {
        "logo": "https://i.ibb.co/Xrp2nhpQ/WMEG-PNG.png",
        "streamUrl": "https://liveaudio.lamusica.com/PR_WMEG_icy",
        "frequency": "FM: 106.9 Mhz",
        "callSign": "WMEG FM",
        "rdsText": ["La Mega 106.9", "WMEG FM", "106.9 FM", "San Juan", "Puerto Rico"]
    },
    "Latino 99": {
        "logo": "https://mm.aiircdn.com/371/5928f28889f51.png",
        "streamUrl": "https://lmmradiocast.com/latino99fm",
        "frequency": "Satellite Radio",
        "callSign": null,
        "rdsText": ["Latino 99", "¡Pura", "Salsa!", "Kissimmee,", "Florida"]
    },
    "Salseo": {
        "logo": "https://static.wixstatic.com/media/8dfec0_3e265a2f0fb5417c90c55be4e4e7d3cf~mv2.png/v1/fill/w_276,h_120,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/LOGOSALSEORADIO_clipped_rev_2_v2%20(1).png",
        "streamUrl": "https://listen.radioking.com/radio/399811/stream/452110",
        "frequency": "Satellite Radio",
        "callSign": null,
        "rdsText": ["Salseo Radio", "Ponte Al", "Día En", "La Salsa!", "Quebradillas", "Puerto Rico"]
    },
    "La Vieja Z": {
        "logo": "https://i.ibb.co/d4VZVjj2/LVZ8-removebg-preview.png",
        "streamUrl": "https://s3.free-shoutcast.com/stream/18094",
        "frequency": "Satellite Radio",
        "callSign": null,
        "rdsText": ["La Vieja Z", "Central Florida", "Salsa!"]
    }
};

// App State
let currentStation = null;
let isPlaying = false;
let audio = null;

// DOM Elements
const elements = {
    status: document.getElementById('status'),
    nowPlaying: document.getElementById('now-playing'),
    stationLogo: document.getElementById('station-logo'),
    stationName: document.getElementById('station-name'),
    stationFrequency: document.getElementById('station-frequency'),
    stationCallsign: document.getElementById('station-callsign'),
    playPauseBtn: document.getElementById('play-pause-btn'),
    playPauseText: document.getElementById('play-pause-text'),
    stopBtn: document.getElementById('stop-btn'),
    stationDropdown: document.getElementById('station-dropdown'),
    audioPlayer: document.getElementById('audio-player'),
    weatherIcon: document.getElementById('weather-icon'),
    weatherTemp: document.getElementById('weather-temp'),
    rdsText: document.getElementById('rds-text')
};

// Initialize the app
function init() {
    console.log('🚀 Initializing GLZ Radio...');
    
    // Create audio element
    audio = elements.audioPlayer;
    
    // Setup event listeners
    setupEventListeners();
    
    // Load stations
    loadStations();
    
    // Initialize weather
    initWeather();
    
    // Initialize RDS
    initRDS();
    
    // Update status
    updateStatus('Ready');
}

// Setup event listeners
function setupEventListeners() {
    // Play/Pause button
    elements.playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Stop button
    elements.stopBtn.addEventListener('click', stop);
    
    // Station dropdown
    elements.stationDropdown.addEventListener('change', handleStationChange);
    
    // Audio events
    audio.addEventListener('loadstart', () => updateStatus('Loading...'));
    audio.addEventListener('canplay', () => updateStatus('Ready'));
    audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        updateStatus('Error loading stream');
        isPlaying = false;
        updatePlayPauseButton();
    });
    audio.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayPauseButton();
    });
    
    // Handle page visibility changes (mobile optimization)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isPlaying) {
            // Keep playing in background
            console.log('App hidden, continuing playback');
        }
    });
}

// Load stations into the dropdown
function loadStations() {
    const stationNames = Object.keys(RADIO_STATIONS);
    
    stationNames.forEach(stationName => {
        const station = RADIO_STATIONS[stationName];
        const option = document.createElement('option');
        option.value = stationName;
        option.textContent = `${stationName} - ${station.frequency}`;
        elements.stationDropdown.appendChild(option);
    });
}

// Handle station dropdown change
function handleStationChange(event) {
    const selectedStationName = event.target.value;
    if (!selectedStationName) return;
    
    const station = RADIO_STATIONS[selectedStationName];
    selectStation(selectedStationName, station);
}

// Select a station
function selectStation(name, station) {
    console.log('Selecting station:', name);
    
    // Update current station
    currentStation = { name, ...station };
    
    // Update UI
    updateNowPlaying();
    showNowPlaying();
    
    // Update dropdown selection
    elements.stationDropdown.value = name;
    
    // Update RDS for the station
    updateRDSForStation(station);
    
    // Update status
    updateStatus(`Selected: ${name}`);
}

// Update the now playing section
function updateNowPlaying() {
    if (!currentStation) return;
    
    elements.stationLogo.src = currentStation.logo;
    elements.stationLogo.alt = currentStation.name;
    elements.stationName.textContent = currentStation.name;
    elements.stationFrequency.textContent = currentStation.frequency;
    elements.stationCallsign.textContent = currentStation.callSign || 'Online Radio';
}

// Show the now playing section
function showNowPlaying() {
    elements.nowPlaying.classList.remove('hidden');
}

// Hide the now playing section
function hideNowPlaying() {
    elements.nowPlaying.classList.add('hidden');
}

// Update station cards to show active state
function updateStationCards(activeStationName) {
    // No longer needed with dropdown
}

// Toggle play/pause
function togglePlayPause() {
    if (!currentStation) {
        updateStatus('Please select a station first');
        return;
    }
    
    if (isPlaying) {
        pause();
    } else {
        play();
    }
}

// Play the current station
function play() {
    if (!currentStation) return;
    
    try {
        console.log('Playing:', currentStation.name);
        console.log('Stream URL:', currentStation.streamUrl);
        
        // Set audio source
        audio.src = currentStation.streamUrl;
        
        // Play
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                updatePlayPauseButton();
                updateStatus(`Playing: ${currentStation.name}`);
            }).catch(error => {
                console.error('Play failed:', error);
                updateStatus('Failed to play stream');
                isPlaying = false;
                updatePlayPauseButton();
            });
        }
    } catch (error) {
        console.error('Play error:', error);
        updateStatus('Error playing stream');
        isPlaying = false;
        updatePlayPauseButton();
    }
}

// Pause the current station
function pause() {
    if (!audio) return;
    
    try {
        audio.pause();
        isPlaying = false;
        updatePlayPauseButton();
        updateStatus(`Paused: ${currentStation ? currentStation.name : 'Unknown'}`);
    } catch (error) {
        console.error('Pause error:', error);
        updateStatus('Error pausing stream');
    }
}

// Stop the current station
function stop() {
    if (!audio) return;
    
    try {
        audio.pause();
        audio.src = '';
        isPlaying = false;
        updatePlayPauseButton();
        updateStatus('Stopped');
        
        // Clear current station
        currentStation = null;
        hideNowPlaying();
        
        // Reset dropdown
        elements.stationDropdown.value = '';
    } catch (error) {
        console.error('Stop error:', error);
        updateStatus('Error stopping stream');
    }
}

// Update play/pause button
function updatePlayPauseButton() {
    if (isPlaying) {
        elements.playPauseText.textContent = 'Pause';
        elements.playPauseBtn.classList.add('playing');
    } else {
        elements.playPauseText.textContent = 'Play';
        elements.playPauseBtn.classList.remove('playing');
    }
}

// Update status
function updateStatus(message) {
    elements.status.textContent = message;
    console.log('Status:', message);
}

// Weather functionality
async function initWeather() {
    try {
        // Get user's location
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        // Get weather data
        await fetchWeatherData(latitude, longitude);
        
        // Update weather every 10 minutes
        setInterval(() => {
            fetchWeatherData(latitude, longitude);
        }, 600000); // 10 minutes
        
    } catch (error) {
        console.error('Weather initialization failed:', error);
        elements.weatherIcon.textContent = '🌤️';
        elements.weatherTemp.textContent = '--°F';
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    });
}

async function fetchWeatherData(lat, lon) {
    try {
        // Using OpenWeatherMap API (free tier)
        const API_KEY = '342e0cb173ba66694bbe37a9012e5ed5';
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;
        
        console.log('Fetching weather from:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            mode: 'cors'
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
            }
            throw new Error(`Weather API request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Weather data received:', data);
        
        // Update weather display
        elements.weatherIcon.textContent = getWeatherIcon(data.weather[0].icon);
        elements.weatherTemp.textContent = `${Math.round(data.main.temp)}°F`;
        
    } catch (error) {
        console.error('Weather fetch failed:', error);
        // Fallback to demo data for development
        elements.weatherIcon.textContent = '🌤️';
        elements.weatherTemp.textContent = '72°F';
        
        // Show error in console for debugging
        console.log('Using fallback weather data. This is normal when running from file:// protocol.');
        console.log('Weather error details:', error.message);
    }
}

function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '🌤️';
}

// RDS functionality
let rdsInterval = null;
let rdsTexts = ['GLZ Radio', 'Puerto Rican Stations', 'AM • FM • Satellite'];
let currentRdsIndex = 0;

function initRDS() {
    // Start RDS text rotation
    rdsInterval = setInterval(updateRDS, 4000); // Change every 4 seconds
    updateRDS();
}

function updateRDS() {
    if (currentStation && currentStation.rdsText) {
        // Use station RDS text if available
        elements.rdsText.textContent = currentStation.rdsText[currentRdsIndex % currentStation.rdsText.length];
        currentRdsIndex++;
    } else {
        // Use default RDS text
        elements.rdsText.textContent = rdsTexts[currentRdsIndex % rdsTexts.length];
        currentRdsIndex++;
    }
}

function updateRDSForStation(station) {
    if (station && station.rdsText) {
        currentRdsIndex = 0;
        // Start showing station RDS text
        elements.rdsText.textContent = station.rdsText[0];
        currentRdsIndex = 1;
    } else {
        // Reset to default RDS
        currentRdsIndex = 0;
        elements.rdsText.textContent = rdsTexts[0];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (audio && isPlaying) {
        audio.pause();
    }
});
