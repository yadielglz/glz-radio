// GLZ Radio - rebuilt UI logic
const RADIO_STATIONS = {
    "WKAQ 580": {
        logo: "https://i.iheart.com/v3/re/assets/images/77d5680e-688b-4488-8c56-9b4963cb0813.png",
        streamUrl: "https://tunein.cdnstream1.com/4851_128.mp3",
        frequency: "AM: 580 Khz",
        callSign: "WKAQ AM",
        rdsText: ["WKAQ 580", "WKAQ AM", "580 AM", "San Juan, PR"]
    },
    "NOTIUNO 630": {
        logo: "https://www.unoradio.com/logos/logos/notiuno/notiuno630.png",
        streamUrl: "https://server20.servistreaming.com:9022/stream",
        frequency: "AM: 630 Khz",
        callSign: "WUNO AM",
        rdsText: ["NotiUno 630", "WUNO AM", "630 AM", "San Juan, PR"]
    },
    "Radio Once": {
        logo: "https://radioIsla.tv/wp-content/uploads/2019/06/Logo-Radio-Isla.png",
        streamUrl: "http://49.13.212.200:14167/stream?type=http&nocache=21",
        frequency: "AM: 1120 Khz",
        callSign: "WMSW AM",
        rdsText: ["Radio Once", "WMSW AM", "1120 AM", "Hatillo, PR"]
    },
    "Radio Isla": {
        logo: "https://radioIsla.tv/wp-content/uploads/2019/06/Logo-Radio-Isla.png",
        streamUrl: "https://server7.servistreaming.com/proxy/radioisla?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        frequency: "AM: 1320 Khz",
        callSign: "WSKN AM",
        rdsText: ["Radio Isla", "WSKN AM", "1320 AM", "San Juan, PR"]
    },
    "Radio Tiempo": {
        logo: "https://radiotiempo.net/wp-content/uploads/2022/08/tiempo-172x128.png",
        streamUrl: "https://server7.servistreaming.com/proxy/tiempo?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        frequency: "AM: 1430 Khz",
        callSign: "WNLE AM",
        rdsText: ["Radio Tiempo", "WNLE AM", "1430 AM", "Caguas, PR"]
    },
    "Radio Cumbre": {
        logo: "https://i.ibb.co/5g2402Cc/wkum-png.png",
        streamUrl: "https://sp.unoredcdn.net/8158/stream/1/",
        frequency: "AM: 1470 Khz",
        callSign: "WKUM AM",
        rdsText: ["Radio Cumbre", "WKUM AM", "1470 AM", "Orocovis, PR"]
    },
    "Radio Oro": {
        logo: "https://cdn-profiles.tunein.com/s21791/images/logod.png?t=637238626060000000",
        streamUrl: "https://us2.internet-radio.com/proxy/woro?mp=/stream",
        frequency: "FM: 92.5 Mhz",
        callSign: "WORO FM",
        rdsText: ["Radio Oro", "WORO FM", "92.5 FM", "Corozal, PR"]
    },
    "Z 93": {
        logo: "https://i.ibb.co/23BMsKBY/wznt-png.png",
        streamUrl: "https://liveaudio.lamusica.com/PR_WZNT_icy",
        frequency: "FM: 93.7 Mhz",
        callSign: "WZNT FM",
        rdsText: ["Z 93", "La Emisora", "Nacional", "De La Salsa", "WZNT FM", "93.7 FM", "San Juan", "Puerto Rico"]
    },
    "La Nueva 94": {
        logo: "https://i.ibb.co/sv1RBc08/wodalogo.png",
        streamUrl: "https://liveaudio.lamusica.com/PR_WODA_icy",
        frequency: "FM: 94.7 Mhz",
        callSign: "WODA FM",
        rdsText: ["La Nueva 94", "Los #1", "En Joda", "WODA FM", "94.7 FM", "San Juan", "Puerto Rico"]
    },
    "Fidelity": {
        logo: "https://fidelitypr.com/wp-content/uploads/2022/01/cropped-Redisen%CC%83o-Logo-Fidelity-3-15-2048x677.png",
        streamUrl: "https://server7.servistreaming.com/proxy/fidelity?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        frequency: "FM: 95.7 Mhz",
        callSign: "WFID FM",
        rdsText: ["Fidelity", "Tu Vida", "En Música", "WFID FM", "95.7 FM", "Rio Piedras", "Puerto Rico"]
    },
    "Estereotempo": {
        logo: "https://i.ibb.co/F4GM0W81/wrxr.png",
        streamUrl: "https://liveaudio.lamusica.com/PR_WRXD_icy",
        frequency: "FM: 96.5 Mhz",
        callSign: "WRXD FM",
        rdsText: ["Estereotempo", "WRXD FM", "96.5 FM", "San Juan", "Puerto Rico"]
    },
    "Magic 97.3": {
        logo: "https://i.ibb.co/Z6WqXPzV/woye.png",
        streamUrl: "https://stream.eleden.com:8210/magic.aac",
        frequency: "FM: 97.3 Mhz",
        callSign: "WOYE FM",
        rdsText: ["Magic 97.3", "WOYE FM", "97.3 FM", "Rio Grande", "Puerto Rico"]
    },
    "SalSoul": {
        logo: "https://salsoul.com/wp-content/uploads/2020/12/cropped-salsoul-2.png",
        streamUrl: "https://server20.servistreaming.com:9023/stream?type=.mp3&_=1",
        frequency: "FM: 99.1 Mhz",
        callSign: "WPRM FM",
        rdsText: ["SalSoul", "WPRM FM", "99.1 FM", "San Juan", "Puerto Rico"]
    },
    "La X": {
        logo: "https://i.ibb.co/zWDcRnBw/laxpng.png",
        streamUrl: "http://stream.eleden.com:8235/lax.ogg",
        frequency: "FM: 100.7 Mhz",
        callSign: "WXYX FM",
        rdsText: ["La X", "Para", "Los Que Llevan", "La Musica", "Por Dentro", "WXYX FM", "100.7 FM", "Bayamón", "Puerto Rico"]
    },
    "Hot102": {
        logo: "https://hot102pr.com/wp-content/uploads/2023/10/Artboard-4.png",
        streamUrl: "https://server7.servistreaming.com/proxy/hot?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        frequency: "FM: 102.5 Mhz",
        callSign: "WTOK FM",
        rdsText: ["HOT 102", "WTOK FM", "102.5 FM", "San Juan", "Puerto Rico"]
    },
    "KQ105": {
        logo: "https://upload.wikimedia.org/wikipedia/en/8/80/KQ_105_WKAQ-FM_2014_logo.png",
        streamUrl: "https://televicentro.streamguys1.com/wkaqfm-icy?key=e018260d508e5b04e91a4d9a30f7ceea9b71bd86e2bfdb6fcc3bbd4928525c00",
        frequency: "FM: 104.7 Mhz",
        callSign: "WKAQ FM",
        rdsText: ["KQ 105", "La Primera", "WKAQ FM", "104.7 FM", "San Juan", "Puerto Rico"]
    },
    "La Mega 106.9": {
        logo: "https://i.ibb.co/Xrp2nhpQ/WMEG-PNG.png",
        streamUrl: "https://liveaudio.lamusica.com/PR_WMEG_icy",
        frequency: "FM: 106.9 Mhz",
        callSign: "WMEG FM",
        rdsText: ["La Mega 106.9", "WMEG FM", "106.9 FM", "San Juan", "Puerto Rico"]
    },
    "Latino 99": {
        logo: "https://mm.aiircdn.com/371/5928f28889f51.png",
        streamUrl: "https://lmmradiocast.com/latino99fm",
        frequency: "Satellite Radio",
        callSign: null,
        rdsText: ["Latino 99", "¡Pura", "Salsa!", "Kissimmee,", "Florida"]
    },
    "Salseo": {
        logo: "https://static.wixstatic.com/media/8dfec0_3e265a2f0fb5417c90c55be4e4e7d3cf~mv2.png/v1/fill/w_276,h_120,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/LOGOSALSEORADIO_clipped_rev_2_v2%20(1).png",
        streamUrl: "https://listen.radioking.com/radio/399811/stream/452110",
        frequency: "Satellite Radio",
        callSign: null,
        rdsText: ["Salseo Radio", "Ponte Al", "Día En", "La Salsa!", "Quebradillas", "Puerto Rico"]
    },
    "La Vieja Z": {
        logo: "https://i.ibb.co/d4VZVjj2/LVZ8-removebg-preview.png",
        streamUrl: "https://s3.free-shoutcast.com/stream/18050",
        frequency: "Satellite Radio",
        callSign: null,
        rdsText: ["La Vieja Z", "Central Florida", "Salsa!"]
    }
};

const state = {
    currentStation: null,
    isPlaying: false,
    audio: null,
    weather: null,
    rdsInterval: null,
    rdsCurrentText: ''
};

const el = {
    status: document.getElementById('status'),
    nowPlaying: document.getElementById('home'),
    stationLogo: document.getElementById('station-logo'),
    stationName: document.getElementById('station-name'),
    stationFrequency: document.getElementById('station-frequency'),
    stationCallsign: document.getElementById('station-callsign'),
    playPauseBtn: document.getElementById('play-pause-btn'),
    playPauseText: document.getElementById('play-pause-text'),
    playIcon: document.getElementById('play-icon'),
    pauseIcon: document.getElementById('pause-icon'),
    stopBtn: document.getElementById('stop-btn'),
    openStationsBtn: document.getElementById('open-stations-btn'),
    rdsText: document.getElementById('rds-text'),
    stationList: document.getElementById('station-list'),
    stationCount: document.getElementById('station-count'),
    weatherTemp: document.getElementById('weather-temp'),
    weatherDesc: document.getElementById('weather-desc'),
    weatherTempBig: document.getElementById('weather-temp-big'),
    weatherDescText: document.getElementById('weather-desc-text'),
    weatherWind: document.getElementById('weather-wind'),
    weatherUpdated: document.getElementById('weather-updated'),
    weatherForecast: document.getElementById('weather-forecast'),
    weatherLocationLabel: document.getElementById('weather-location-label'),
    clock: document.getElementById('clock'),
    audioPlayer: document.getElementById('audio-player'),
    viewSections: {
        home: document.getElementById('home'),
        stations: document.getElementById('stations'),
        weather: document.getElementById('weather-view')
    },
    navButtons: Array.from(document.querySelectorAll('.nav-btn'))
};

function init() {
    state.audio = el.audioPlayer;
    setupAudioEvents();
    renderStations();
    bindControls();
    setupNavigation();
    switchView('home');
    updateClock();
    setInterval(updateClock, 1000);
    fetchWeather();
    updateStatus('Ready');
}

function bindControls() {
    el.playPauseBtn.addEventListener('click', togglePlayPause);
    el.stopBtn.addEventListener('click', stop);
    if (el.openStationsBtn) {
        el.openStationsBtn.addEventListener('click', () => switchView('stations'));
    }
}

function setupNavigation() {
    el.navButtons.forEach((btn) => {
        btn.addEventListener('click', () => switchView(btn.dataset.target));
    });
}

function switchView(target) {
    Object.entries(el.viewSections).forEach(([key, section]) => {
        if (!section) return;
        if (key === target) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });
    el.navButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.target === target);
    });
}

function setupAudioEvents() {
    state.audio.addEventListener('loadstart', () => updateStatus('Loading stream...'));
    state.audio.addEventListener('canplay', () => updateStatus('Ready'));
    state.audio.addEventListener('playing', () => updateStatus('Playing'));
    state.audio.addEventListener('pause', () => updateStatus('Paused'));
    state.audio.addEventListener('error', () => {
        updateStatus('Error loading stream');
        state.isPlaying = false;
        updatePlayPauseButton();
    });
    state.audio.addEventListener('ended', () => {
        state.isPlaying = false;
        updatePlayPauseButton();
    });
}

function renderStations() {
    const names = Object.keys(RADIO_STATIONS);
    el.stationCount.textContent = names.length;
    el.stationList.innerHTML = '';

    names.forEach((name) => {
        const station = RADIO_STATIONS[name];
        const item = document.createElement('button');
        item.className = 'station-item';
        item.setAttribute('type', 'button');
        item.innerHTML = `
            <img class="logo" src="${station.logo}" alt="${name}">
            <div class="meta">
                <div class="name">${name}</div>
                <div class="sub">${station.frequency}${station.callSign ? ' • ' + station.callSign : ''}</div>
            </div>
            <div class="chevron">›</div>
        `;
        item.addEventListener('click', () => selectStation(name));
        el.stationList.appendChild(item);
    });
}

function selectStation(name) {
    const station = RADIO_STATIONS[name];
    state.currentStation = name;

    el.stationLogo.src = station.logo;
    el.stationName.textContent = name;
    el.stationFrequency.textContent = station.frequency;
    el.stationCallsign.textContent = station.callSign || '—';
    startRdsTicker(station.rdsText || [name]);
    el.nowPlaying.classList.remove('hidden');
    switchView('home');

    updateStatus(`Selected ${name}`);
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
        updateStatus('Play blocked');
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
    updateStatus('Stopped');
}

function startRdsTicker(list) {
    if (state.rdsInterval) {
        clearInterval(state.rdsInterval);
    }
    if (!list || !list.length) {
        el.rdsText.textContent = '';
        return;
    }
    let idx = 0;
    el.rdsText.textContent = list[idx];
    state.rdsCurrentText = list[idx];
    state.rdsInterval = setInterval(() => {
        idx = (idx + 1) % list.length;
        el.rdsText.textContent = list[idx];
        state.rdsCurrentText = list[idx];
    }, 2500);
}

function togglePlayPause() {
    if (state.isPlaying) {
        pause();
    } else {
        play();
    }
}

function updatePlayPauseButton() {
    if (state.isPlaying) {
        el.playPauseText.textContent = 'Pause';
        el.playIcon.style.display = 'none';
        el.pauseIcon.style.display = 'block';
    } else {
        el.playPauseText.textContent = 'Play';
        el.playIcon.style.display = 'block';
        el.pauseIcon.style.display = 'none';
    }
}

function updateStatus(text) {
    el.status.textContent = text;
}

function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    el.clock.textContent = time;
}

async function fetchWeather() {
    updateWeatherUI('Loading...', 'Loading');
    const coords = await getCoordinates();
    el.weatherLocationLabel.textContent = `Local • ${coords.lat.toFixed(2)}, ${coords.lon.toFixed(2)}`;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&hourly=temperature_2m,weathercode&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto&forecast_days=1`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.current_weather) throw new Error('No weather data');
        const w = data.current_weather;
        state.weather = w;
        const temp = Math.round(w.temperature);
        const desc = weatherDescription(w.weathercode);
        const wind = Math.round(w.windspeed);
        const updated = new Date(w.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        updateWeatherUI(`${temp}°F`, desc, wind, updated);
        buildForecast(data);
    } catch (err) {
        console.error('Weather error', err);
        updateWeatherUI('--°F', 'Unavailable');
    }
}

function updateWeatherUI(temp, desc, wind, updated) {
    const loading = temp === 'Loading...';
    el.weatherTemp.textContent = loading ? '--°F' : temp;
    el.weatherDesc.textContent = loading ? 'Loading' : (desc || '—');
    el.weatherTempBig.textContent = loading ? '--°F' : temp;
    el.weatherDescText.textContent = loading ? 'Loading' : (desc || '—');
    el.weatherWind.textContent = wind ? `Wind ${wind} mph` : 'Wind -- mph';
    el.weatherUpdated.textContent = updated || '--';
}

function weatherDescription(code) {
    const map = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Fog',
        51: 'Drizzle',
        53: 'Drizzle',
        55: 'Drizzle',
        61: 'Rain',
        63: 'Rain',
        65: 'Heavy rain',
        66: 'Freezing rain',
        67: 'Freezing rain',
        71: 'Snow',
        73: 'Snow',
        75: 'Snow',
        77: 'Snow grains',
        80: 'Showers',
        81: 'Showers',
        82: 'Heavy showers',
        85: 'Snow showers',
        86: 'Snow showers',
        95: 'Thunder',
        96: 'Thunder',
        99: 'Thunder'
    };
    return map[code] || 'Weather';
}

function buildForecast(data) {
    const times = data?.hourly?.time || [];
    const temps = data?.hourly?.temperature_2m || [];
    const codes = data?.hourly?.weathercode || [];
    if (!times.length) {
        el.weatherForecast.innerHTML = '';
        return;
    }

    const now = Date.now();
    const rows = [];
    for (let i = 0; i < times.length && rows.length < 6; i++) {
        const t = new Date(times[i]);
        if (t.getTime() <= now) continue;
        const temp = Math.round(temps[i]);
        const desc = weatherDescription(codes[i]);
        rows.push(`
            <div class="forecast-row">
                <div class="label">${t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div class="meta">
                    <span>${desc}</span>
                    <strong>${temp}°F</strong>
                </div>
            </div>
        `);
    }

    if (!rows.length) {
        el.weatherForecast.innerHTML = '<div class="muted">Forecast unavailable</div>';
        return;
    }

    el.weatherForecast.innerHTML = rows.join('');
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

init();
