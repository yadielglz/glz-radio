// GLZ Radio - simple player
const RADIO_STATIONS = {
    "WKAQ 580": {
        logo: "https://i.iheart.com/v3/re/assets/images/77d5680e-688b-4488-8c56-9b4963cb0813.png",
        streamUrl: "https://tunein.cdnstream1.com/4851_128.mp3",
        frequency: "AM 580",
        callSign: "WKAQ AM",
    },
    "NOTIUNO 630": {
        logo: "https://www.unoradio.com/logos/logos/notiuno/notiuno630.png",
        streamUrl: "https://server20.servistreaming.com:9022/stream",
        frequency: "AM 630",
        callSign: "WUNO AM",
    },
    "Radio Once": {
        logo: "https://radioIsla.tv/wp-content/uploads/2019/06/Logo-Radio-Isla.png",
        streamUrl: "http://49.13.212.200:14167/stream?type=http&nocache=21",
        frequency: "AM 1120",
        callSign: "WMSW AM",
    },
    "Radio Isla": {
        logo: "https://radioIsla.tv/wp-content/uploads/2019/06/Logo-Radio-Isla.png",
        streamUrl: "https://server7.servistreaming.com/proxy/radioisla?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        frequency: "AM 1320",
        callSign: "WSKN AM",
    },
    "Radio Tiempo": {
        logo: "https://radiotiempo.net/wp-content/uploads/2022/08/tiempo-172x128.png",
        streamUrl: "https://server7.servistreaming.com/proxy/tiempo?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        frequency: "AM 1430",
        callSign: "WNLE AM",
    },
    "Radio Cumbre": {
        logo: "https://i.ibb.co/5g2402Cc/wkum-png.png",
        streamUrl: "https://sp.unoredcdn.net/8158/stream/1/",
        frequency: "AM 1470",
        callSign: "WKUM AM",
    },
    "Radio Oro": {
        logo: "https://cdn-profiles.tunein.com/s21791/images/logod.png?t=637238626060000000",
        streamUrl: "https://us2.internet-radio.com/proxy/woro?mp=/stream",
        frequency: "FM 92.5",
        callSign: "WORO FM",
    },
    "Z 93": {
        logo: "https://i.ibb.co/23BMsKBY/wznt-png.png",
        streamUrl: "https://liveaudio.lamusica.com/PR_WZNT_icy",
        frequency: "FM 93.7",
        callSign: "WZNT FM",
    },
    "La Nueva 94": {
        logo: "https://i.ibb.co/sv1RBc08/wodalogo.png",
        streamUrl: "https://liveaudio.lamusica.com/PR_WODA_icy",
        frequency: "FM 94.7",
        callSign: "WODA FM",
    },
    "Fidelity": {
        logo: "https://fidelitypr.com/wp-content/uploads/2022/01/cropped-Redisen%CC%83o-Logo-Fidelity-3-15-2048x677.png",
        streamUrl: "https://server7.servistreaming.com/proxy/fidelity?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        frequency: "FM 95.7",
        callSign: "WFID FM",
    },
    "Estereotempo": {
        logo: "https://i.ibb.co/F4GM0W81/wrxr.png",
        streamUrl: "https://liveaudio.lamusica.com/PR_WRXD_icy",
        frequency: "FM 96.5",
        callSign: "WRXD FM",
    },
    "Magic 97.3": {
        logo: "https://i.ibb.co/Z6WqXPzV/woye.png",
        streamUrl: "https://stream.eleden.com:8210/magic.aac",
        frequency: "FM 97.3",
        callSign: "WOYE FM",
    },
    "SalSoul": {
        logo: "https://salsoul.com/wp-content/uploads/2020/12/cropped-salsoul-2.png",
        streamUrl: "https://server20.servistreaming.com:9023/stream?type=.mp3&_=1",
        frequency: "FM 99.1",
        callSign: "WPRM FM",
    },
    "La X": {
        logo: "https://i.ibb.co/zWDcRnBw/laxpng.png",
        streamUrl: "http://stream.eleden.com:8235/lax.ogg",
        frequency: "FM 100.7",
        callSign: "WXYX FM",
    },
    "Hot102": {
        logo: "https://hot102pr.com/wp-content/uploads/2023/10/Artboard-4.png",
        streamUrl: "https://server7.servistreaming.com/proxy/hot?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        frequency: "FM 102.5",
        callSign: "WTOK FM",
    },
    "KQ105": {
        logo: "https://upload.wikimedia.org/wikipedia/en/8/80/KQ_105_WKAQ-FM_2014_logo.png",
        streamUrl: "https://televicentro.streamguys1.com/wkaqfm-icy?key=e018260d508e5b04e91a4d9a30f7ceea9b71bd86e2bfdb6fcc3bbd4928525c00",
        frequency: "FM 104.7",
        callSign: "WKAQ FM",
    },
    "La Mega 106.9": {
        logo: "https://i.ibb.co/Xrp2nhpQ/WMEG-PNG.png",
        streamUrl: "https://liveaudio.lamusica.com/PR_WMEG_icy",
        frequency: "FM 106.9",
        callSign: "WMEG FM",
    },
    "Latino 99": {
        logo: "https://mm.aiircdn.com/371/5928f28889f51.png",
        streamUrl: "https://lmmradiocast.com/latino99fm",
        frequency: "Satellite",
        callSign: null,
    },
    "Salseo": {
        logo: "https://static.wixstatic.com/media/8dfec0_3e265a2f0fb5417c90c55be4e4e7d3cf~mv2.png/v1/fill/w_276,h_120,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/LOGOSALSEORADIO_clipped_rev_2_v2%20(1).png",
        streamUrl: "https://listen.radioking.com/radio/399811/stream/452110",
        frequency: "Satellite",
        callSign: null,
    },
    "La Vieja Z": {
        logo: "https://i.ibb.co/d4VZVjj2/LVZ8-removebg-preview.png",
        streamUrl: "http://178.32.146.184:2716/stream",
        frequency: "Satellite",
        callSign: null,
    }
};

const state = {
    currentStation: null,
    isPlaying: false,
    audio: null
};

const el = {
    status: document.getElementById('status'),
    stationName: document.getElementById('station-name'),
    stationFrequency: document.getElementById('station-frequency'),
    playPauseBtn: document.getElementById('play-pause-btn'),
    stopBtn: document.getElementById('stop-btn'),
    stationList: document.getElementById('station-list'),
    audioPlayer: document.getElementById('audio-player')
};

function init() {
    state.audio = el.audioPlayer;
    setupAudioEvents();
    renderStations();
    bindControls();
    updateStatus('Ready');
}

function bindControls() {
    el.playPauseBtn.addEventListener('click', togglePlayPause);
    el.stopBtn.addEventListener('click', stop);
}

function setupAudioEvents() {
    state.audio.addEventListener('loadstart', () => updateStatus('Loading...'));
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
    el.stationList.innerHTML = '';
    Object.keys(RADIO_STATIONS).forEach((name) => {
        const station = RADIO_STATIONS[name];
        const item = document.createElement('button');
        item.className = 'station-item';
        item.type = 'button';
        item.innerHTML = `
            <img class="logo" src="${station.logo}" alt="">
            <div class="meta">
                <div class="name">${name}</div>
                <div class="sub">${station.frequency}${station.callSign ? ' · ' + station.callSign : ''}</div>
            </div>
        `;
        item.addEventListener('click', () => selectStation(name));
        el.stationList.appendChild(item);
    });
}

function selectStation(name) {
    const station = RADIO_STATIONS[name];
    state.currentStation = name;
    el.stationName.textContent = name;
    el.stationFrequency.textContent = station.frequency + (station.callSign ? ' · ' + station.callSign : '');
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
        if (isMobile && isBlocked) {
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
    el.stationName.textContent = 'Choose a station';
    el.stationFrequency.textContent = '';
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

init();
