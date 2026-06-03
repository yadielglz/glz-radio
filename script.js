// Glz Radio - simple player
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
        streamUrl: "https://s2.free-shoutcast.com/stream/18006",
        frequency: "Satellite",
        callSign: null,
        rdsText: ["La Vieja Z", "Central Florida", "Salsa!"],
    }
};

/*
const state = {
    currentStation: null,
    isPlaying: false,
    audio: null,
    rdsInterval: null,
    streamTimerStart: null,
    streamTimerInterval: null,
    mediaHandlersBound: false
};

const el = {
    status: document.getElementById('status'),
    stationType: document.getElementById('station-type'),
    rdsText: document.getElementById('rds-text'),
    streamTimer: document.getElementById('stream-timer'),
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
    weatherForecast: document.getElementById('weather-forecast'),
    nowPlayingArtwork: document.getElementById('now-playing-artwork'),
    nowPlayingTitle: document.getElementById('now-playing-title'),
    nowPlayingSubtitle: document.getElementById('now-playing-subtitle'),
    nowPlayingMeta: document.getElementById('now-playing-meta'),
    nowPlayingTypeChip: document.getElementById('now-playing-type-chip'),
    nowPlayingFrequencyChip: document.getElementById('now-playing-frequency-chip'),
    settingsToggleBtn: document.getElementById('settings-toggle-btn'),
    settingsPanel: document.getElementById('settings-panel'),
    setting24h: document.getElementById('setting-24h'),
    settingShowWeather: document.getElementById('setting-show-weather'),
    weatherBlock: document.getElementById('weather-block'),
    stationSearchInput: null
};

function init() {
    state.audio = el.audioPlayer;
    if (el.nowPlayingFrequencyChip) el.nowPlayingFrequencyChip.classList.add('hidden');
    setupAudioEvents();
    setupMediaSession();
    populateDropdown();
    bindControls();
    setupPreferences();
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

function setupPreferences() {
    const saved24h = localStorage.getItem('glz_pref_24h');
    const savedShowWeather = localStorage.getItem('glz_pref_show_weather');
    if (saved24h === 'true' && el.setting24h) {
        el.setting24h.checked = true;
    }
    if (savedShowWeather === 'false' && el.settingShowWeather && el.weatherBlock) {
        el.settingShowWeather.checked = false;
        el.weatherBlock.classList.add('hidden');
    }
    if (el.settingsToggleBtn && el.settingsPanel) {
        el.settingsToggleBtn.addEventListener('click', () => {
            const isOpen = el.settingsPanel.style.display === 'block';
            el.settingsPanel.style.display = isOpen ? 'none' : 'block';
            el.settingsToggleBtn.textContent = isOpen ? 'Open' : 'Close';
        });
    }
    if (el.setting24h) {
        el.setting24h.addEventListener('change', () => {
            localStorage.setItem('glz_pref_24h', el.setting24h.checked ? 'true' : 'false');
            updateClock();
        });
    }
    if (el.settingShowWeather && el.weatherBlock) {
        el.settingShowWeather.addEventListener('change', () => {
            const show = el.settingShowWeather.checked;
            localStorage.setItem('glz_pref_show_weather', show ? 'true' : 'false');
            el.weatherBlock.classList.toggle('hidden', !show);
        });
    }
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
    state.audio.addEventListener('canplay', () => {
        updateStatus('Ready');
        updateMediaSessionPlaybackState();
    });
    state.audio.addEventListener('playing', () => {
        updateStatus('Playing');
        startStreamTimer();
        updateMediaSessionPlaybackState();
    });
    state.audio.addEventListener('pause', () => {
        updateStatus('Paused');
        stopStreamTimer();
        updateMediaSessionPlaybackState();
    });
    state.audio.addEventListener('error', () => {
        state.isPlaying = false;
        updatePlayPauseButton();
        stopStreamTimer();
        setStreamErrorStatus();
        updateMediaSessionPlaybackState();
    });
    state.audio.addEventListener('ended', () => {
        state.isPlaying = false;
        updatePlayPauseButton();
        stopStreamTimer();
        updateMediaSessionPlaybackState();
    });
}

function setupMediaSession() {
    if (!('mediaSession' in navigator) || state.mediaHandlersBound) return;
    state.mediaHandlersBound = true;
    const bind = (action, handler) => {
        try {
            navigator.mediaSession.setActionHandler(action, handler);
        } catch (_err) {
            // Some browsers do not support every action.
        }
    };
    bind('play', () => {
        if (!state.currentStation) {
            const first = Object.keys(RADIO_STATIONS)[0];
            if (first) selectStation(first);
            return;
        }
        play();
    });
    bind('pause', () => pause());
    bind('stop', () => stop());
    bind('nexttrack', () => tuneRelativeStation(1));
    bind('previoustrack', () => tuneRelativeStation(-1));
    bind('seekforward', null);
    bind('seekbackward', null);
    bind('seekto', null);
    updateMediaSessionMetadata();
    updateMediaSessionPlaybackState();
}

function tuneRelativeStation(direction) {
    const names = Object.keys(RADIO_STATIONS);
    if (!names.length) return;
    const currentIdx = state.currentStation ? names.indexOf(state.currentStation) : -1;
    const baseIdx = currentIdx >= 0 ? currentIdx : 0;
    const nextIdx = (baseIdx + direction + names.length) % names.length;
    selectStation(names[nextIdx]);
}

function buildMediaArtwork(station) {
    const artwork = [
        { src: 'images/app-icon.png', sizes: '96x96', type: 'image/png' },
        { src: 'images/app-icon.png', sizes: '192x192', type: 'image/png' },
        { src: 'images/app-icon.png', sizes: '512x512', type: 'image/png' }
    ];
    if (station && station.logo) {
        artwork.unshift({ src: station.logo, sizes: '512x512', type: 'image/png' });
    }
    return artwork;
}

function updateMediaSessionMetadata() {
    const stationName = state.currentStation || 'Glz Radio';
    const station = state.currentStation ? RADIO_STATIONS[state.currentStation] : null;
    const album = station?.frequency
        ? station.frequency + (station.callSign ? ' · ' + station.callSign : '')
        : 'Live Radio';
    if ('mediaSession' in navigator && typeof window.MediaMetadata !== 'undefined') {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: 'Glz Radio',
            artist: stationName,
            album,
            artwork: buildMediaArtwork(station)
        });
    }
    document.title = state.currentStation ? `Glz Radio · ${stationName}` : 'Glz Radio';
}

function updateMediaSessionPlaybackState() {
    if (!('mediaSession' in navigator)) return;
    const hasStation = Boolean(state.currentStation);
    if (!hasStation) {
        navigator.mediaSession.playbackState = 'none';
        return;
    }
    navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';
}

function startStreamTimer() {
    stopStreamTimer();
    state.streamTimerStart = Date.now();
    function tick() {
        if (!state.streamTimerStart || !el.streamTimer) return;
        const sec = Math.floor((Date.now() - state.streamTimerStart) / 1000);
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        el.streamTimer.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }
    tick();
    state.streamTimerInterval = setInterval(tick, 1000);
}

function stopStreamTimer() {
    if (state.streamTimerInterval) {
        clearInterval(state.streamTimerInterval);
        state.streamTimerInterval = null;
    }
    state.streamTimerStart = null;
    if (el.streamTimer) el.streamTimer.textContent = '--:--';
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
    const searchWrapper = document.createElement('li');
    searchWrapper.className = 'dropdown-search';
    searchWrapper.innerHTML = '<input type="search" id="station-search" placeholder="Search stations…">';
    el.dropdownList.appendChild(searchWrapper);
    el.stationSearchInput = searchWrapper.querySelector('input');
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
    if (el.stationSearchInput) {
        el.stationSearchInput.addEventListener('input', () => {
            const term = el.stationSearchInput.value.trim().toLowerCase();
            const options = el.dropdownList.querySelectorAll('.dropdown-option');
            options.forEach((opt) => {
                const text = opt.textContent.toLowerCase();
                opt.parentElement.style.display = !term || text.includes(term) ? '' : 'none';
            });
        });
    }
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
    const type = getStationType(station.frequency);
    el.stationFrequency.textContent = type === 'Satellite'
        ? ''
        : station.frequency + (station.callSign ? ' · ' + station.callSign : '');
    if (el.stationType) el.stationType.textContent = type;
    if (el.nowPlayingArtwork) el.nowPlayingArtwork.src = station.logo;
    if (el.nowPlayingTitle) el.nowPlayingTitle.textContent = name;
    if (el.nowPlayingSubtitle) {
        const subtitle = station.rdsText?.[1] || station.callSign || station.rdsText?.[0] || 'Live broadcast';
        el.nowPlayingSubtitle.textContent = subtitle;
    }
    if (el.nowPlayingMeta) {
        const frequencyLabel = station.frequency && station.callSign
            ? station.frequency + ' · ' + station.callSign
            : station.frequency || station.callSign || '';
        el.nowPlayingMeta.textContent = frequencyLabel;
    }
    if (el.nowPlayingTypeChip) el.nowPlayingTypeChip.textContent = type;
    if (el.nowPlayingFrequencyChip) {
        const secondaryChip = station.callSign || (station.frequency && station.frequency !== type ? station.frequency : '');
        el.nowPlayingFrequencyChip.textContent = secondaryChip;
        el.nowPlayingFrequencyChip.classList.toggle('hidden', !secondaryChip);
    }
    updateMediaSessionMetadata();
    updateMediaSessionPlaybackState();
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
        updateMediaSessionPlaybackState();
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
    updateMediaSessionPlaybackState();
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
    if (el.stationType) el.stationType.textContent = '—';
    if (el.nowPlayingArtwork) {
        el.nowPlayingArtwork.src = 'https://i.ibb.co/svTmnHKh/Chat-GPT-Image-Feb-28-2026-09-46-35-PM.png';
    }
    if (el.nowPlayingTitle) el.nowPlayingTitle.textContent = 'Not playing';
    if (el.nowPlayingSubtitle) el.nowPlayingSubtitle.textContent = 'Choose a station to start listening.';
    if (el.nowPlayingMeta) el.nowPlayingMeta.textContent = '';
    if (el.nowPlayingTypeChip) el.nowPlayingTypeChip.textContent = '—';
    if (el.nowPlayingFrequencyChip) {
        el.nowPlayingFrequencyChip.textContent = '';
        el.nowPlayingFrequencyChip.classList.add('hidden');
    }
    updateMediaSessionMetadata();
    updateMediaSessionPlaybackState();
    startRdsTicker([]);
    stopStreamTimer();
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
    el.playPauseBtn.setAttribute('aria-pressed', state.isPlaying ? 'true' : 'false');
    updateFrequencyVisibility();
    updateSelectorVisibility();
}

function updateFrequencyVisibility() {
    if (!el.stationFrequency) return;
    el.stationFrequency.classList.toggle('hidden', state.isPlaying);
}

function updateSelectorVisibility() {
    if (!el.dropdownTrigger || !el.dropdownList) return;
    const dropdownContainer = document.getElementById('station-dropdown');
    if (!dropdownContainer) return;
    if (state.isPlaying) closeDropdown();
    dropdownContainer.classList.toggle('hidden', state.isPlaying);
}

function updateStatus(text) {
    el.status.textContent = text;
}

function getStationType(frequency) {
    if (!frequency) return '—';
    if (frequency.startsWith('AM ')) return 'AM';
    if (frequency.startsWith('FM ')) return 'FM';
    if (frequency === 'Satellite' || frequency.toLowerCase().includes('satellite')) return 'Satellite';
    return frequency;
}

function updateClock() {
    const now = new Date();
    const use24h = el.setting24h && el.setting24h.checked;
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: !use24h });
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
*/

const APP_ICON = 'images/glz-radio-logo-new.png';
const STORAGE_KEYS = {
    favorites: 'glz_radio_favorites_v2',
    recents: 'glz_radio_recents_v2',
    theme: 'glz_radio_theme_v2',
    settings: 'glz_radio_settings_v2',
    stationOverrides: 'glz_radio_station_overrides_v2',
    hiddenStations: 'glz_radio_hidden_stations_v2',
    editorUnlocked: 'glz_radio_editor_unlocked_v2'
};

let stations = buildStationList();

const app = {
    audio: null,
    currentName: null,
    isPlaying: false,
    filter: 'all',
    query: '',
    settings: readStoredObject(STORAGE_KEYS.settings, {
        weatherEnabled: true,
        weatherMode: 'auto',
        theme: 'system',
        keepStationOnFilter: true
    }),
    stationOverrides: readStoredObject(STORAGE_KEYS.stationOverrides, {}),
    hiddenStations: new Set(readStoredArray(STORAGE_KEYS.hiddenStations)),
    editorUnlocked: localStorage.getItem(STORAGE_KEYS.editorUnlocked) === 'true',
    favorites: new Set(readStoredArray(STORAGE_KEYS.favorites)),
    recents: readStoredArray(STORAGE_KEYS.recents),
    rdsTimer: null,
    timer: null,
    timerStartedAt: null,
    deferredInstallPrompt: null
};

const ui = {
    status: document.getElementById('status'),
    streamTimer: document.getElementById('stream-timer'),
    nowArt: document.getElementById('now-art'),
    nowKicker: document.getElementById('now-kicker'),
    nowTitle: document.getElementById('now-title'),
    nowSubtitle: document.getElementById('now-subtitle'),
    rdsText: document.getElementById('rds-text'),
    playButton: document.getElementById('play-button'),
    stopButton: document.getElementById('stop-button'),
    prevButton: document.getElementById('prev-button'),
    nextButton: document.getElementById('next-button'),
    stationGrid: document.getElementById('station-grid'),
    stationSearch: document.getElementById('station-search'),
    clearSearch: document.getElementById('clear-search'),
    segments: Array.from(document.querySelectorAll('.segment')),
    stationCount: document.getElementById('station-count'),
    emptyState: document.getElementById('empty-state'),
    favoritesList: document.getElementById('favorites-list'),
    favoriteCount: document.getElementById('favorite-count'),
    recentList: document.getElementById('recent-list'),
    recentCount: document.getElementById('recent-count'),
    clock: document.getElementById('clock'),
    clockDate: document.getElementById('clock-date'),
    weatherTemp: document.getElementById('weather-temp'),
    weatherDesc: document.getElementById('weather-desc'),
    themeToggle: document.getElementById('theme-toggle'),
    studioButton: document.getElementById('studio-button'),
    studioClose: document.getElementById('studio-close'),
    stationStudio: document.getElementById('station-studio'),
    studioOverlay: document.getElementById('studio-overlay'),
    settingsButton: document.getElementById('settings-button'),
    settingsClose: document.getElementById('settings-close'),
    settingsDrawer: document.getElementById('settings-drawer'),
    settingsOverlay: document.getElementById('settings-overlay'),
    settingWeatherEnabled: document.getElementById('setting-weather-enabled'),
    settingWeatherMode: document.getElementById('setting-weather-mode'),
    settingAutoplayNext: document.getElementById('setting-autoplay-next'),
    themeChoices: Array.from(document.querySelectorAll('#theme-choice .choice')),
    resetListeningData: document.getElementById('reset-listening-data'),
    editorLockState: document.getElementById('editor-lock-state'),
    editorUnlockRow: document.getElementById('editor-unlock-row'),
    editorCode: document.getElementById('editor-code'),
    editorUnlock: document.getElementById('editor-unlock'),
    editorPanel: document.getElementById('editor-panel'),
    editorSearch: document.getElementById('editor-search'),
    editorStationList: document.getElementById('editor-station-list'),
    editorStationSelect: document.getElementById('editor-station-select'),
    editorNew: document.getElementById('editor-new'),
    editorAddRds: document.getElementById('editor-add-rds'),
    stationForm: document.getElementById('station-form'),
    editorName: document.getElementById('editor-name'),
    editorLogo: document.getElementById('editor-logo'),
    editorStream: document.getElementById('editor-stream'),
    editorFrequency: document.getElementById('editor-frequency'),
    editorCallsign: document.getElementById('editor-callsign'),
    editorRds: document.getElementById('editor-rds'),
    editorRdsPreview: document.getElementById('editor-rds-preview'),
    editorRemove: document.getElementById('editor-remove'),
    editorRestore: document.getElementById('editor-restore'),
    installButton: document.getElementById('install-button'),
    audioPlayer: document.getElementById('audio-player')
};

function initModernApp() {
    app.audio = ui.audioPlayer;
    applyStoredTheme();
    applySettingsToForm();
    registerServiceWorker();
    bindModernEvents();
    setupAudioEventsModern();
    setupMediaSessionModern();
    renderStations();
    renderQuickLists();
    updateClockModern();
    setInterval(updateClockModern, 1000);
    refreshWeatherVisibility();
    updateNowPlaying(null);
    setStatus('Ready');
}

function bindModernEvents() {
    ui.playButton.addEventListener('click', () => {
        if (app.isPlaying) {
            pauseStation();
            return;
        }
        if (!app.currentName) {
            selectStationModern(stations[0].name, { autoplay: true });
            return;
        }
        playStation();
    });
    ui.stopButton.addEventListener('click', stopStation);
    ui.prevButton.addEventListener('click', () => tuneRelative(-1));
    ui.nextButton.addEventListener('click', () => tuneRelative(1));
    ui.stationSearch.addEventListener('input', () => {
        app.query = ui.stationSearch.value.trim().toLowerCase();
        renderStations();
    });
    ui.clearSearch.addEventListener('click', () => {
        ui.stationSearch.value = '';
        app.query = '';
        renderStations();
        ui.stationSearch.focus();
    });
    ui.segments.forEach((button) => {
        button.addEventListener('click', () => {
            app.filter = button.dataset.filter;
            ui.segments.forEach((segment) => segment.classList.toggle('active', segment === button));
            renderStations();
            if (!app.settings.keepStationOnFilter && app.currentName && !getVisibleStations().some((station) => station.name === app.currentName)) {
                stopStation();
            }
        });
    });
    ui.themeToggle.addEventListener('click', toggleTheme);
    ui.studioButton.addEventListener('click', openStudio);
    ui.studioClose.addEventListener('click', closeStudio);
    ui.studioOverlay.addEventListener('click', closeStudio);
    ui.settingsButton.addEventListener('click', openSettings);
    ui.settingsClose.addEventListener('click', closeSettings);
    ui.settingsOverlay.addEventListener('click', closeSettings);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeSettings();
            closeStudio();
        }
    });
    ui.settingWeatherEnabled.addEventListener('change', () => {
        app.settings.weatherEnabled = ui.settingWeatherEnabled.checked;
        saveSettings();
        refreshWeatherVisibility();
    });
    ui.settingWeatherMode.addEventListener('change', () => {
        app.settings.weatherMode = ui.settingWeatherMode.value;
        saveSettings();
        refreshWeatherVisibility();
    });
    ui.settingAutoplayNext.addEventListener('change', () => {
        app.settings.keepStationOnFilter = ui.settingAutoplayNext.checked;
        saveSettings();
    });
    ui.themeChoices.forEach((button) => {
        button.addEventListener('click', () => setThemePreference(button.dataset.theme));
    });
    ui.resetListeningData.addEventListener('click', resetListeningData);
    ui.editorUnlock.addEventListener('click', unlockEditor);
    ui.editorCode.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') unlockEditor();
    });
    ui.editorSearch.addEventListener('input', renderEditorStationList);
    ui.editorStationSelect.addEventListener('change', () => loadStationIntoEditor(ui.editorStationSelect.value));
    ui.editorNew.addEventListener('click', () => loadStationIntoEditor(''));
    ui.editorAddRds.addEventListener('click', addRdsLine);
    ui.editorRds.addEventListener('input', updateRdsPreview);
    ui.stationForm.addEventListener('submit', saveStationFromEditor);
    ui.editorRemove.addEventListener('click', removeStationFromEditor);
    ui.editorRestore.addEventListener('click', restoreStationFromEditor);
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        app.deferredInstallPrompt = event;
        ui.installButton.hidden = false;
    });
    ui.installButton.addEventListener('click', async () => {
        if (!app.deferredInstallPrompt) return;
        app.deferredInstallPrompt.prompt();
        await app.deferredInstallPrompt.userChoice;
        app.deferredInstallPrompt = null;
        ui.installButton.hidden = true;
    });
}

function setupAudioEventsModern() {
    app.audio.addEventListener('loadstart', () => setStatus('Loading'));
    app.audio.addEventListener('canplay', () => setStatus(app.isPlaying ? 'Playing' : 'Ready'));
    app.audio.addEventListener('playing', () => {
        app.isPlaying = true;
        document.body.classList.add('is-playing');
        ui.playButton.textContent = 'Pause';
        ui.playButton.setAttribute('aria-pressed', 'true');
        setStatus('Playing');
        startTimer();
        updateMediaSessionPlaybackModern();
    });
    app.audio.addEventListener('pause', () => {
        app.isPlaying = false;
        document.body.classList.remove('is-playing');
        ui.playButton.textContent = 'Play';
        ui.playButton.setAttribute('aria-pressed', 'false');
        stopTimer(false);
        updateMediaSessionPlaybackModern();
    });
    app.audio.addEventListener('error', () => {
        app.isPlaying = false;
        document.body.classList.remove('is-playing');
        ui.playButton.textContent = 'Play';
        stopTimer(false);
        setStreamError();
        updateMediaSessionPlaybackModern();
    });
}

function renderStations() {
    const visibleStations = getVisibleStations();
    ui.stationGrid.innerHTML = visibleStations.map(renderStationCard).join('');
    ui.stationGrid.querySelectorAll('.station-card').forEach((card) => {
        card.addEventListener('click', () => selectStationModern(card.dataset.station, { autoplay: true }));
        card.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            selectStationModern(card.dataset.station, { autoplay: true });
        });
    });
    ui.stationGrid.querySelectorAll('.favorite-button').forEach((button) => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleFavorite(button.dataset.station);
        });
    });
    ui.stationCount.textContent = `${visibleStations.length} of ${stations.length} stations`;
    ui.emptyState.hidden = visibleStations.length !== 0;
}

function renderStationCard(station) {
    const active = station.name === app.currentName ? ' active' : '';
    const favorite = app.favorites.has(station.name);
    const call = station.callSign || station.frequency;
    return `
        <article class="station-card${active}" data-station="${escapeAttr(station.name)}" tabindex="0" role="button" aria-label="Play ${escapeAttr(station.name)}">
            <div class="station-card-top">
                <img class="station-logo" src="${escapeAttr(station.logo)}" alt="">
                <button class="favorite-button${favorite ? ' active' : ''}" type="button" data-station="${escapeAttr(station.name)}" aria-label="Favorite ${escapeAttr(station.name)}">${favorite ? 'Saved' : 'Save'}</button>
            </div>
            <div>
                <h3 class="station-name">${escapeHtml(station.name)}</h3>
                <p class="station-detail">${escapeHtml(station.city || station.location)}</p>
            </div>
            <div class="station-card-bottom">
                <span class="band-pill">${escapeHtml(station.frequency)}</span>
                <span class="call-pill">${escapeHtml(call || 'Live')}</span>
            </div>
        </article>
    `;
}

function getVisibleStations() {
    return stations.filter((station) => {
        const matchesFilter =
            app.filter === 'all' ||
            station.band === app.filter ||
            (app.filter === 'favorites' && app.favorites.has(station.name));
        const haystack = [
            station.name,
            station.frequency,
            station.callSign,
            station.location,
            ...(station.rdsText || [])
        ].filter(Boolean).join(' ').toLowerCase();
        return matchesFilter && (!app.query || haystack.includes(app.query));
    });
}

function selectStationModern(name, options = {}) {
    const station = getStation(name);
    if (!station) return;
    app.currentName = name;
    updateNowPlaying(station);
    addRecent(name);
    renderStations();
    renderQuickLists();
    updateMediaSessionMetadataModern();
    updateMediaSessionPlaybackModern();
    startRds(station.rdsText || [name]);
    if (options.autoplay) playStation();
}

async function playStation() {
    if (!app.currentName) return;
    const station = getStation(app.currentName);
    if (!station) return;
    if (app.audio.src !== station.streamUrl) {
        app.audio.src = station.streamUrl;
        app.audio.load();
    }
    try {
        await app.audio.play();
    } catch (error) {
        console.error('Playback error', error);
        setStreamError();
    }
}

function pauseStation() {
    app.audio.pause();
    setStatus('Paused');
}

function stopStation() {
    app.audio.pause();
    app.audio.removeAttribute('src');
    app.audio.load();
    app.currentName = null;
    app.isPlaying = false;
    document.body.classList.remove('is-playing');
    ui.playButton.textContent = 'Play';
    ui.playButton.setAttribute('aria-pressed', 'false');
    stopTimer(true);
    startRds([]);
    updateNowPlaying(null);
    renderStations();
    setStatus('Stopped');
    updateMediaSessionMetadataModern();
    updateMediaSessionPlaybackModern();
}

function tuneRelative(direction) {
    const list = getVisibleStations().length ? getVisibleStations() : stations;
    const currentIndex = list.findIndex((station) => station.name === app.currentName);
    const base = currentIndex >= 0 ? currentIndex : 0;
    const next = list[(base + direction + list.length) % list.length];
    selectStationModern(next.name, { autoplay: true });
}

function updateNowPlaying(station) {
    if (!station) {
        ui.nowArt.src = APP_ICON;
        ui.nowKicker.textContent = 'Standby';
        ui.nowTitle.textContent = 'Choose a station';
        ui.nowSubtitle.textContent = 'Live AM, FM, and satellite streams curated for Puerto Rico.';
        ui.rdsText.textContent = '';
        document.title = 'Glz Radio';
        return;
    }
    ui.nowArt.src = station.logo;
    ui.nowKicker.textContent = `${station.band} live`;
    ui.nowTitle.textContent = station.name;
    ui.nowSubtitle.textContent = station.city || station.location;
    document.title = `Glz Radio · ${station.name}`;
}

function toggleFavorite(name) {
    if (app.favorites.has(name)) {
        app.favorites.delete(name);
    } else {
        app.favorites.add(name);
    }
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify([...app.favorites]));
    renderStations();
    renderQuickLists();
}

function renderQuickLists() {
    const favoriteNames = [...app.favorites].filter((name) => getStation(name));
    const recentNames = app.recents.filter((name) => getStation(name));
    ui.favoriteCount.textContent = favoriteNames.length;
    ui.recentCount.textContent = recentNames.length;
    ui.favoritesList.innerHTML = favoriteNames.length
        ? favoriteNames.map((name) => renderChip(name)).join('')
        : '<span class="chip muted">No favorites yet</span>';
    ui.recentList.innerHTML = recentNames.length
        ? recentNames.map((name) => renderChip(name)).join('')
        : '<span class="chip muted">No recent stations</span>';
    document.querySelectorAll('.chip[data-station]').forEach((chip) => {
        chip.addEventListener('click', () => selectStationModern(chip.dataset.station, { autoplay: true }));
    });
}

function renderChip(name) {
    return `<button class="chip" type="button" data-station="${escapeAttr(name)}">${escapeHtml(name)}</button>`;
}

function addRecent(name) {
    app.recents = [name, ...app.recents.filter((item) => item !== name)].slice(0, 6);
    localStorage.setItem(STORAGE_KEYS.recents, JSON.stringify(app.recents));
}

function startRds(texts) {
    if (app.rdsTimer) clearInterval(app.rdsTimer);
    if (!texts.length) {
        ui.rdsText.textContent = '';
        return;
    }
    let index = 0;
    ui.rdsText.textContent = texts[index];
    app.rdsTimer = setInterval(() => {
        index = (index + 1) % texts.length;
        ui.rdsText.textContent = texts[index];
    }, 3000);
}

function startTimer() {
    if (!app.timerStartedAt) app.timerStartedAt = Date.now();
    if (app.timer) return;
    const tick = () => {
        const elapsed = Math.floor((Date.now() - app.timerStartedAt) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        ui.streamTimer.textContent = `${minutes}:${seconds}`;
    };
    tick();
    app.timer = setInterval(tick, 1000);
}

function stopTimer(reset) {
    if (app.timer) {
        clearInterval(app.timer);
        app.timer = null;
    }
    if (reset) {
        app.timerStartedAt = null;
        ui.streamTimer.textContent = '00:00';
    }
}

function setStreamError() {
    const station = getStation(app.currentName);
    if (location.protocol === 'https:' && station?.streamUrl.startsWith('http://')) {
        setStatus('HTTP stream blocked');
    } else {
        setStatus('Stream unavailable');
    }
}

function setupMediaSessionModern() {
    if (!('mediaSession' in navigator)) return;
    const bind = (action, handler) => {
        try {
            navigator.mediaSession.setActionHandler(action, handler);
        } catch (_error) {}
    };
    bind('play', () => playStation());
    bind('pause', () => pauseStation());
    bind('stop', () => stopStation());
    bind('nexttrack', () => tuneRelative(1));
    bind('previoustrack', () => tuneRelative(-1));
    updateMediaSessionMetadataModern();
    updateMediaSessionPlaybackModern();
}

function updateMediaSessionMetadataModern() {
    if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
    const station = getStation(app.currentName);
    navigator.mediaSession.metadata = new MediaMetadata({
        title: station ? station.name : 'Glz Radio',
        artist: station ? station.location : 'Puerto Rico live radio',
        album: station ? `${station.frequency}${station.callSign ? ' · ' + station.callSign : ''}` : 'Live radio',
        artwork: [
            { src: station?.logo || APP_ICON, sizes: '512x512', type: 'image/png' },
            { src: APP_ICON, sizes: '192x192', type: 'image/png' }
        ]
    });
}

function updateMediaSessionPlaybackModern() {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = app.currentName ? (app.isPlaying ? 'playing' : 'paused') : 'none';
}

function updateClockModern() {
    const now = new Date();
    ui.clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    ui.clockDate.textContent = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

async function fetchWeatherModern() {
    if (!app.settings.weatherEnabled) return;
    try {
        const coords = await getCoordinatesModern();
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto&forecast_days=1`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const current = data.current_weather;
        ui.weatherTemp.textContent = `${Math.round(current.temperature)} F`;
        ui.weatherDesc.textContent = weatherDescriptionModern(current.weathercode);
    } catch (error) {
        console.error('Weather error', error);
        ui.weatherTemp.textContent = '-- F';
        ui.weatherDesc.textContent = 'Unavailable';
    }
}

function getCoordinatesModern() {
    if (app.settings.weatherMode === 'puerto-rico') {
        return Promise.resolve({ lat: 18.22, lon: -66.59 });
    }
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({ lat: 18.22, lon: -66.59 });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
            () => resolve({ lat: 18.22, lon: -66.59 }),
            { timeout: 6000, enableHighAccuracy: false }
        );
    });
}

function weatherDescriptionModern(code) {
    const map = {
        0: 'Clear',
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
        80: 'Showers',
        81: 'Showers',
        82: 'Heavy showers',
        95: 'Thunder'
    };
    return map[code] || 'Live';
}

function refreshWeatherVisibility() {
    const weatherCard = ui.weatherTemp.closest('.utility-item');
    weatherCard.classList.toggle('hidden', !app.settings.weatherEnabled);
    if (!app.settings.weatherEnabled) return;
    ui.weatherTemp.textContent = '-- F';
    ui.weatherDesc.textContent = 'Loading';
    fetchWeatherModern();
}

function applyStoredTheme() {
    const saved = app.settings.theme || localStorage.getItem(STORAGE_KEYS.theme) || 'system';
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark', saved === 'system' ? prefersDark : saved === 'dark');
    ui.themeChoices?.forEach((button) => button.classList.toggle('active', button.dataset.theme === saved));
}

function toggleTheme() {
    const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    setThemePreference(nextTheme);
}

function setThemePreference(theme) {
    app.settings.theme = theme;
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    saveSettings();
    applyStoredTheme();
}

function applySettingsToForm() {
    ui.settingWeatherEnabled.checked = app.settings.weatherEnabled;
    ui.settingWeatherMode.value = app.settings.weatherMode;
    ui.settingAutoplayNext.checked = app.settings.keepStationOnFilter;
    updateEditorLockState();
    renderEditorStationOptions();
}

function saveSettings() {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(app.settings));
}

function openSettings() {
    ui.settingsDrawer.classList.add('open');
    ui.settingsDrawer.setAttribute('aria-hidden', 'false');
    ui.settingsOverlay.hidden = false;
}

function closeSettings() {
    ui.settingsDrawer.classList.remove('open');
    ui.settingsDrawer.setAttribute('aria-hidden', 'true');
    ui.settingsOverlay.hidden = true;
}

function resetListeningData() {
    app.favorites.clear();
    app.recents = [];
    localStorage.removeItem(STORAGE_KEYS.favorites);
    localStorage.removeItem(STORAGE_KEYS.recents);
    renderStations();
    renderQuickLists();
}

function openStudio() {
    ui.stationStudio.classList.add('open');
    ui.stationStudio.setAttribute('aria-hidden', 'false');
    ui.studioOverlay.hidden = false;
    updateEditorLockState();
}

function closeStudio() {
    ui.stationStudio.classList.remove('open');
    ui.stationStudio.setAttribute('aria-hidden', 'true');
    ui.studioOverlay.hidden = true;
}

function unlockEditor() {
    const code = ui.editorCode.value.trim().toLowerCase();
    if (code !== 'glz' && code !== 'admin') {
        ui.editorCode.value = '';
        ui.editorCode.placeholder = 'Try GLZ';
        return;
    }
    app.editorUnlocked = true;
    localStorage.setItem(STORAGE_KEYS.editorUnlocked, 'true');
    updateEditorLockState();
}

function updateEditorLockState() {
    ui.editorPanel.hidden = !app.editorUnlocked;
    ui.editorUnlockRow.classList.toggle('hidden', app.editorUnlocked);
    ui.editorLockState.textContent = app.editorUnlocked ? 'Unlocked' : 'Locked';
    ui.editorLockState.classList.toggle('unlocked', app.editorUnlocked);
    if (app.editorUnlocked) {
        renderEditorStationOptions();
        renderEditorStationList();
        loadStationIntoEditor(ui.editorStationSelect.value || stations[0]?.name || '');
    }
}

function renderEditorStationOptions() {
    if (!ui.editorStationSelect) return;
    const selected = ui.editorStationSelect.value;
    ui.editorStationSelect.innerHTML = getEditorStations().map((station) => (
        `<option value="${escapeAttr(station.name)}">${escapeHtml(station.name)}${station.hidden ? ' (deleted)' : ''}</option>`
    )).join('');
    if (selected && getEditorStation(selected)) ui.editorStationSelect.value = selected;
}

function renderEditorStationList() {
    const term = ui.editorSearch.value.trim().toLowerCase();
    const filtered = getEditorStations().filter((station) => {
        const haystack = [station.name, station.frequency, station.callSign, station.location].filter(Boolean).join(' ').toLowerCase();
        return !term || haystack.includes(term);
    });
    ui.editorStationList.innerHTML = filtered.map((station) => {
        const active = station.name === ui.editorStationSelect.value ? ' active' : '';
        const source = station.hidden ? 'Deleted' : app.stationOverrides[station.name] ? 'Edited' : 'Curated';
        return `
            <button class="editor-station-item${active}" type="button" data-station="${escapeAttr(station.name)}">
                <img src="${escapeAttr(station.logo)}" alt="">
                <span><strong>${escapeHtml(station.name)}</strong><span>${escapeHtml(station.frequency)} · ${escapeHtml(station.callSign || source)}</span></span>
                <span>${source}</span>
            </button>
        `;
    }).join('');
    ui.editorStationList.querySelectorAll('.editor-station-item').forEach((button) => {
        button.addEventListener('click', () => loadStationIntoEditor(button.dataset.station));
    });
}

function loadStationIntoEditor(name) {
    const station = getEditorStation(name);
    ui.editorStationSelect.value = station?.name || '';
    ui.editorName.value = station?.name || '';
    ui.editorLogo.value = station?.logo || '';
    ui.editorStream.value = station?.streamUrl || '';
    ui.editorFrequency.value = station?.frequency || '';
    ui.editorCallsign.value = station?.callSign || '';
    ui.editorRds.value = station?.rdsText?.join('\n') || '';
    ui.editorRemove.disabled = !station;
    ui.editorRestore.disabled = !station || (!app.stationOverrides[station.name] && !app.hiddenStations.has(station.name));
    renderEditorStationList();
    updateRdsPreview();
}

function saveStationFromEditor(event) {
    event.preventDefault();
    const originalName = ui.editorStationSelect.value;
    const nextName = ui.editorName.value.trim();
    if (!nextName) return;
    if (originalName && originalName !== nextName) {
        delete app.stationOverrides[originalName];
        app.hiddenStations.add(originalName);
    }
    app.stationOverrides[nextName] = {
        logo: ui.editorLogo.value.trim(),
        streamUrl: ui.editorStream.value.trim(),
        frequency: ui.editorFrequency.value.trim(),
        callSign: ui.editorCallsign.value.trim() || null,
        rdsText: ui.editorRds.value.split('\n').map((item) => item.trim()).filter(Boolean)
    };
    app.hiddenStations.delete(nextName);
    persistStationEdits();
    rebuildStationViews(nextName);
}

function removeStationFromEditor() {
    const name = ui.editorStationSelect.value;
    if (!name) return;
    app.hiddenStations.add(name);
    if (!RADIO_STATIONS[name]) delete app.stationOverrides[name];
    persistStationEdits();
    if (app.currentName === name) stopStation();
    rebuildStationViews();
}

function restoreStationFromEditor() {
    const name = ui.editorStationSelect.value;
    if (!name) return;
    delete app.stationOverrides[name];
    app.hiddenStations.delete(name);
    persistStationEdits();
    rebuildStationViews(name);
}

function addRdsLine() {
    const lines = ui.editorRds.value.trim() ? `${ui.editorRds.value.trim()}\n` : '';
    ui.editorRds.value = `${lines}${ui.editorName.value.trim() || 'Station update'}`;
    ui.editorRds.focus();
    updateRdsPreview();
}

function updateRdsPreview() {
    const lines = ui.editorRds.value.split('\n').map((item) => item.trim()).filter(Boolean);
    ui.editorRdsPreview.textContent = lines.length ? lines.join('  ·  ') : 'No RDS messages configured.';
}

function persistStationEdits() {
    localStorage.setItem(STORAGE_KEYS.stationOverrides, JSON.stringify(app.stationOverrides));
    localStorage.setItem(STORAGE_KEYS.hiddenStations, JSON.stringify([...app.hiddenStations]));
}

function rebuildStationViews(selectedName) {
    stations = buildStationList(app.stationOverrides, app.hiddenStations);
    app.favorites = new Set([...app.favorites].filter((name) => getStation(name)));
    app.recents = app.recents.filter((name) => getStation(name));
    renderStations();
    renderQuickLists();
    renderEditorStationOptions();
    renderEditorStationList();
    loadStationIntoEditor(selectedName || getEditorStations()[0]?.name || '');
}

function buildStationList(overrides = readStoredObject(STORAGE_KEYS.stationOverrides, {}), hidden = new Set(readStoredArray(STORAGE_KEYS.hiddenStations))) {
    const merged = { ...RADIO_STATIONS, ...overrides };
    return Object.entries(merged)
        .filter(([name]) => !hidden.has(name))
        .map(([name, station], index) => ({
            name,
            index,
            ...station,
            band: getStationBand(station.frequency),
            city: getStationCity(station),
            location: station.rdsText?.slice(1).join(' · ') || station.callSign || 'Live broadcast'
        }));
}

function getEditorStations() {
    const merged = { ...RADIO_STATIONS, ...app.stationOverrides };
    return Object.entries(merged).map(([name, station], index) => ({
        name,
        index,
        ...station,
        hidden: app.hiddenStations.has(name),
        band: getStationBand(station.frequency),
        city: getStationCity(station),
        location: station.rdsText?.slice(1).join(' · ') || station.callSign || 'Live broadcast'
    }));
}

function getEditorStation(name) {
    return getEditorStations().find((station) => station.name === name);
}

function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((error) => {
            console.warn('Service worker registration failed', error);
        });
    });
}

function getStation(name) {
    return stations.find((station) => station.name === name);
}

function getStationBand(frequency) {
    if (!frequency) return 'Live';
    if (frequency.startsWith('AM ')) return 'AM';
    if (frequency.startsWith('FM ')) return 'FM';
    if (frequency === 'Satellite' || frequency.toLowerCase().includes('satellite')) return 'Satellite';
    return frequency;
}

function getStationCity(station) {
    const candidates = (station.rdsText || []).slice(1).reverse();
    const city = candidates.find((item) => item && !item.includes('!')) || candidates[0] || station.callSign || 'Live';
    return city
        .replace(/,\s*PR$/i, '')
        .replace(/,\s*Puerto Rico$/i, '')
        .trim();
}

function readStoredArray(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(value) ? value : [];
    } catch (_error) {
        return [];
    }
}

function readStoredObject(key, fallback = {}) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || 'null');
        return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
    } catch (_error) {
        return fallback;
    }
}

function setStatus(text) {
    ui.status.textContent = text;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}

function escapeAttr(value) {
    return escapeHtml(value);
}

initModernApp();
