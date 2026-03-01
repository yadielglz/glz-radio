// GLZ Radio - simple player
const RADIO_STATIONS = {
    "WKAQ 580": {
        logo: "https://i.iheart.com/v3/re/assets/images/77d5680e-688b-4488-8c56-9b4963cb0813.png",
        streamUrl: "https://tunein.cdnstream1.com/4851_128.mp3",
        frequency: "AM 580",
        callSign: "WKAQ AM",
        rdsText: ["WKAQ 580", "San Juan, PR"],
    },
    "NOTIUNO 630": {
        logo: "https://www.unoradio.com/logos/logos/notiuno/notiuno630.png",
        streamUrl: "https://server20.servistreaming.com:9022/stream",
        frequency: "AM 630",
        callSign: "WUNO AM",
        rdsText: ["NotiUno 630", "San Juan, PR"],
    },
    "Radio Once": {
        logo: "https://radioIsla.tv/wp-content/uploads/2019/06/Logo-Radio-Isla.png",
        streamUrl: "http://49.13.212.200:14167/stream?type=http&nocache=21",
        frequency: "AM 1120",
        callSign: "WMSW AM",
        rdsText: ["Radio Once", "Hatillo, PR"],
    },
    "Radio Isla": {
        logo: "https://radioIsla.tv/wp-content/uploads/2019/06/Logo-Radio-Isla.png",
        streamUrl: "https://server7.servistreaming.com/proxy/radioisla?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        frequency: "AM 1320",
        callSign: "WSKN AM",
        rdsText: ["Radio Isla", "San Juan, PR"],
    },
    "Radio Tiempo": {
        logo: "https://radiotiempo.net/wp-content/uploads/2022/08/tiempo-172x128.png",
        streamUrl: "https://server7.servistreaming.com/proxy/tiempo?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        frequency: "AM 1430",
        callSign: "WNLE AM",
        rdsText: ["Radio Tiempo", "Caguas, PR"],
    },
    "Radio Cumbre": {
        logo: "https://i.ibb.co/5g2402Cc/wkum-png.png",
        streamUrl: "https://sp.unoredcdn.net/8158/stream/1/",
        frequency: "AM 1470",
        callSign: "WKUM AM",
        rdsText: ["Radio Cumbre", "Orocovis, PR"],
    },
    "Radio Oro": {
        logo: "https://cdn-profiles.tunein.com/s21791/images/logod.png?t=637238626060000000",
        streamUrl: "https://us2.internet-radio.com/proxy/woro?mp=/stream",
        frequency: "FM 92.5",
        callSign: "WORO FM",
        rdsText: ["Radio Oro", "Corozal, PR"],
    },
    "Z 93": {
        logo: "https://i.ibb.co/23BMsKBY/wznt-png.png",
        streamUrl: "https://liveaudio.lamusica.com/PR_WZNT_icy",
        frequency: "FM 93.7",
        callSign: "WZNT FM",
        rdsText: ["Z 93", "La Emisora Nacional", "San Juan"],
    },
    "La Nueva 94": {
        logo: "https://i.ibb.co/sv1RBc08/wodalogo.png",
        streamUrl: "https://liveaudio.lamusica.com/PR_WODA_icy",
        frequency: "FM 94.7",
        callSign: "WODA FM",
        rdsText: ["La Nueva 94", "Los #1 En Joda", "San Juan"],
    },
    "Fidelity": {
        logo: "https://fidelitypr.com/wp-content/uploads/2022/01/cropped-Redisen%CC%83o-Logo-Fidelity-3-15-2048x677.png",
        streamUrl: "https://server7.servistreaming.com/proxy/fidelity?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        frequency: "FM 95.7",
        callSign: "WFID FM",
        rdsText: ["Fidelity", "Tu Vida En Música", "Rio Piedras"],
    },
    "Estereotempo": {
        logo: "https://i.ibb.co/F4GM0W81/wrxr.png",
        streamUrl: "https://liveaudio.lamusica.com/PR_WRXD_icy",
        frequency: "FM 96.5",
        callSign: "WRXD FM",
        rdsText: ["Estereotempo", "San Juan"],
    },
    "Magic 97.3": {
        logo: "https://i.ibb.co/Z6WqXPzV/woye.png",
        streamUrl: "https://stream.eleden.com:8210/magic.aac",
        frequency: "FM 97.3",
        callSign: "WOYE FM",
        rdsText: ["Magic 97.3", "Rio Grande"],
    },
    "SalSoul": {
        logo: "https://salsoul.com/wp-content/uploads/2020/12/cropped-salsoul-2.png",
        streamUrl: "https://server20.servistreaming.com:9023/stream?type=.mp3&_=1",
        frequency: "FM 99.1",
        callSign: "WPRM FM",
        rdsText: ["SalSoul", "San Juan"],
    },
    "La X": {
        logo: "https://i.ibb.co/zWDcRnBw/laxpng.png",
        streamUrl: "http://stream.eleden.com:8235/lax.ogg",
        frequency: "FM 100.7",
        callSign: "WXYX FM",
        rdsText: ["La X", "Bayamón"],
    },
    "Hot102": {
        logo: "https://hot102pr.com/wp-content/uploads/2023/10/Artboard-4.png",
        streamUrl: "https://server7.servistreaming.com/proxy/hot?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        frequency: "FM 102.5",
        callSign: "WTOK FM",
        rdsText: ["HOT 102", "San Juan"],
    },
    "KQ105": {
        logo: "https://upload.wikimedia.org/wikipedia/en/8/80/KQ_105_WKAQ-FM_2014_logo.png",
        streamUrl: "https://televicentro.streamguys1.com/wkaqfm-icy?key=e018260d508e5b04e91a4d9a30f7ceea9b71bd86e2bfdb6fcc3bbd4928525c00",
        frequency: "FM 104.7",
        callSign: "WKAQ FM",
        rdsText: ["KQ 105", "La Primera", "San Juan"],
    },
    "La Mega 106.9": {
        logo: "https://i.ibb.co/Xrp2nhpQ/WMEG-PNG.png",
        streamUrl: "https://liveaudio.lamusica.com/PR_WMEG_icy",
        frequency: "FM 106.9",
        callSign: "WMEG FM",
        rdsText: ["La Mega 106.9", "San Juan"],
    },
    "Latino 99": {
        logo: "https://mm.aiircdn.com/371/5928f28889f51.png",
        streamUrl: "https://lmmradiocast.com/latino99fm",
        frequency: "Satellite",
        callSign: null,
        rdsText: ["Latino 99", "¡Pura Salsa!", "Kissimmee, Florida"],
    },
    "Salseo": {
        logo: "https://static.wixstatic.com/media/8dfec0_3e265a2f0fb5417c90c55be4e4e7d3cf~mv2.png/v1/fill/w_276,h_120,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/LOGOSALSEORADIO_clipped_rev_2_v2%20(1).png",
        streamUrl: "https://listen.radioking.com/radio/399811/stream/452110",
        frequency: "Satellite",
        callSign: null,
        rdsText: ["Salseo Radio", "Quebradillas, Puerto Rico"],
    },
    "La Vieja Z": {
        logo: "https://i.ibb.co/d4VZVjj2/LVZ8-removebg-preview.png",
        streamUrl: "https://s1.free-shoutcast.com/stream/18150",
        frequency: "Satellite",
        callSign: null,
        rdsText: ["La Vieja Z", "Central Florida", "Salsa!"],
    }
};

const state = {
    currentStation: null,
    isPlaying: false,
    audio: null,
    rdsInterval: null
};

const el = {
    status: document.getElementById('status'),
    rdsText: document.getElementById('rds-text'),
    dropdownTrigger: document.getElementById('dropdown-trigger'),
    dropdownTriggerIcon: document.getElementById('dropdown-trigger-icon'),
    dropdownTriggerText: document.getElementById('dropdown-trigger-text'),
    dropdownList: document.getElementById('dropdown-list'),
    stationFrequency: document.getElementById('station-frequency'),
    playPauseBtn: document.getElementById('play-pause-btn'),
    stopBtn: document.getElementById('stop-btn'),
    audioPlayer: document.getElementById('audio-player'),
    clock: document.getElementById('clock'),
    clockDate: document.getElementById('clock-date'),
    weatherTemp: document.getElementById('weather-temp'),
    weatherDesc: document.getElementById('weather-desc'),
    weatherWind: document.getElementById('weather-wind'),
    weatherUpdated: document.getElementById('weather-updated'),
    weatherForecast: document.getElementById('weather-forecast')
};

function init() {
    state.audio = el.audioPlayer;
    setupAudioEvents();
    populateDropdown();
    bindControls();
    updateClock();
    setInterval(updateClock, 1000);
    fetchWeather();
    updateStatus('Ready');
}

function bindControls() {
    el.dropdownTrigger.addEventListener('click', toggleDropdown);
    document.addEventListener('click', (e) => {
        if (!el.dropdownTrigger.contains(e.target) && !el.dropdownList.contains(e.target)) {
            closeDropdown();
        }
    });
    el.playPauseBtn.addEventListener('click', togglePlayPause);
    el.stopBtn.addEventListener('click', stop);
}

function toggleDropdown() {
    const open = !el.dropdownList.hidden;
    el.dropdownList.hidden = open;
    el.dropdownTrigger.setAttribute('aria-expanded', !open);
}

function closeDropdown() {
    el.dropdownList.hidden = true;
    el.dropdownTrigger.setAttribute('aria-expanded', 'false');
}

function setupAudioEvents() {
    state.audio.addEventListener('loadstart', () => updateStatus('Loading...'));
    state.audio.addEventListener('canplay', () => updateStatus('Ready'));
    state.audio.addEventListener('playing', () => updateStatus('Playing'));
    state.audio.addEventListener('pause', () => updateStatus('Paused'));
    state.audio.addEventListener('error', () => {
        state.isPlaying = false;
        updatePlayPauseButton();
        setStreamErrorStatus();
    });
    state.audio.addEventListener('ended', () => {
        state.isPlaying = false;
        updatePlayPauseButton();
    });
}

// Not CORS: <audio src> is blocked as "mixed content" when page is HTTPS and stream is HTTP.
function setStreamErrorStatus() {
    const station = state.currentStation && RADIO_STATIONS[state.currentStation];
    const streamUrl = station ? station.streamUrl : '';
    const isHttpsPage = location.protocol === 'https:';
    const isHttpStream = streamUrl.startsWith('http://');
    if (isHttpsPage && isHttpStream) {
        updateStatus('Blocked: this stream is HTTP. Need HTTPS stream for mobile.');
    } else {
        updateStatus('Error loading stream');
    }
}

function populateDropdown() {
    el.dropdownList.innerHTML = '';
    Object.keys(RADIO_STATIONS).forEach((name) => {
        const station = RADIO_STATIONS[name];
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.className = 'dropdown-option';
        li.innerHTML = `<img class="dropdown-option-icon" src="${station.logo}" alt="">${name}`;
        li.addEventListener('click', () => {
            selectStation(name);
            closeDropdown();
        });
        el.dropdownList.appendChild(li);
    });
}

function startRdsTicker(texts) {
    if (state.rdsInterval) clearInterval(state.rdsInterval);
    if (!texts || !texts.length) {
        el.rdsText.textContent = '';
        return;
    }
    let i = 0;
    el.rdsText.textContent = texts[i];
    state.rdsInterval = setInterval(() => {
        i = (i + 1) % texts.length;
        el.rdsText.textContent = texts[i];
    }, 3000);
}

function selectStation(name) {
    const station = RADIO_STATIONS[name];
    state.currentStation = name;
    el.dropdownTriggerIcon.src = station.logo;
    el.dropdownTriggerIcon.hidden = false;
    el.dropdownTriggerText.textContent = name;
    el.dropdownTrigger.classList.add('has-selection');
    el.stationFrequency.textContent = station.frequency + (station.callSign ? ' · ' + station.callSign : '');
    startRdsTicker(station.rdsText || [name]);
    updateStatus('Loading...');
    play();
}

async function play() {
    if (!state.currentStation) {
        updateStatus('Pick a station');
        return;
    }
    const station = RADIO_STATIONS[state.currentStation];
    state.audio.src = station.streamUrl;
    state.audio.load();
    try {
        await state.audio.play();
        state.isPlaying = true;
        updatePlayPauseButton();
    } catch (err) {
        console.error('Play error', err);
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isBlocked = err.name === 'NotAllowedError' || err.name === 'NotSupportedError';
        const station = RADIO_STATIONS[state.currentStation];
        const isHttpStream = station && station.streamUrl.startsWith('http://');
        const isHttpsPage = location.protocol === 'https:';
        if (isHttpsPage && isHttpStream) {
            updateStatus('Blocked: HTTP stream on HTTPS page (need HTTPS stream)');
        } else if (isMobile && isBlocked) {
            updateStatus('Blocked: use Wi‑Fi or HTTPS stream');
        } else {
            updateStatus('Play blocked');
        }
    }
}

function pause() {
    state.audio.pause();
    state.isPlaying = false;
    updatePlayPauseButton();
}

function stop() {
    state.audio.pause();
    state.audio.removeAttribute('src');
    state.audio.load();
    state.isPlaying = false;
    updatePlayPauseButton();
    el.dropdownTriggerIcon.src = '';
    el.dropdownTriggerIcon.hidden = true;
    el.dropdownTriggerText.textContent = 'Choose a station';
    el.dropdownTrigger.classList.remove('has-selection');
    el.stationFrequency.textContent = '';
    state.currentStation = null;
    startRdsTicker([]);
    updateStatus('Stopped');
}

function togglePlayPause() {
    if (state.isPlaying) {
        pause();
    } else {
        play();
    }
}

function updatePlayPauseButton() {
    el.playPauseBtn.textContent = state.isPlaying ? 'Pause' : 'Play';
}

function updateStatus(text) {
    el.status.textContent = text;
}

function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const date = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    if (el.clock) el.clock.textContent = time;
    if (el.clockDate) el.clockDate.textContent = date;
}

function getCoordinates() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({ lat: 18.22, lon: -66.59 });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => resolve({ lat: 18.22, lon: -66.59 }),
            { timeout: 8000, enableHighAccuracy: false }
        );
    });
}

function weatherDescription(code) {
    const map = {
        0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Fog', 51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
        61: 'Rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain',
        71: 'Snow', 73: 'Snow', 75: 'Snow', 77: 'Snow grains',
        80: 'Showers', 81: 'Showers', 82: 'Heavy showers', 85: 'Snow showers', 86: 'Snow showers',
        95: 'Thunder', 96: 'Thunder', 99: 'Thunder'
    };
    return map[code] || '—';
}

async function fetchWeather() {
    if (!el.weatherTemp) return;
    el.weatherDesc.textContent = 'Loading…';
    const coords = await getCoordinates();
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&hourly=temperature_2m,weathercode&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto&forecast_days=1`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.current_weather) throw new Error('No weather data');
        const w = data.current_weather;
        const temp = Math.round(w.temperature);
        const desc = weatherDescription(w.weathercode);
        const wind = Math.round(w.windspeed);
        const updated = new Date(w.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        el.weatherTemp.textContent = `${temp}°F`;
        el.weatherDesc.textContent = desc;
        el.weatherWind.textContent = `Wind ${wind} mph`;
        el.weatherUpdated.textContent = `Updated ${updated}`;
        if (el.weatherForecast && data.hourly) buildForecast(data);
    } catch (err) {
        console.error('Weather error', err);
        el.weatherTemp.textContent = '--°F';
        el.weatherDesc.textContent = 'Unavailable';
        el.weatherWind.textContent = 'Wind -- mph';
        el.weatherUpdated.textContent = 'Updated --';
        if (el.weatherForecast) el.weatherForecast.innerHTML = '';
    }
}

function buildForecast(data) {
    const times = data?.hourly?.time || [];
    const temps = data?.hourly?.temperature_2m || [];
    const codes = data?.hourly?.weathercode || [];
    const now = Date.now();
    const items = [];
    for (let i = 0; i < times.length && items.length < 6; i++) {
        const t = new Date(times[i]);
        if (t.getTime() <= now) continue;
        const temp = Math.round(temps[i]);
        const desc = weatherDescription(codes[i]);
        items.push(`<div class="forecast-item"><span class="time">${t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> <span class="temp">${temp}°F ${desc}</span></div>`);
    }
    el.weatherForecast.innerHTML = items.length ? items.join('') : '';
}

init();
