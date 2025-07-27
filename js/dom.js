export const dom = {
    // App containers
    app: document.getElementById('app'),

    // Header
    header: document.querySelector('header'),
    clock: document.getElementById('clock'),
    rdsText: document.getElementById('rds-text'),
    connectionStatus: document.getElementById('connection-status'),
    networkIcon: document.getElementById('network-icon'),

    // Main Display
    idleDisplay: document.getElementById('idle-display'),
    bigClock: document.getElementById('big-clock'),
    nowPlaying: document.getElementById('now-playing'),
    stationLogo: document.getElementById('station-logo'),
    stationName: document.getElementById('station-name'),
    stationFrequency: document.getElementById('station-frequency'),
    stationCallsign: document.getElementById('station-callsign'),

    // Tuner
    tuner: document.getElementById('tuner'),
    tunerLabels: document.getElementById('tuner-labels'),
    tunerMarkers: document.getElementById('tuner-markers'),
    tunerContainer: document.getElementById('tuner-container'),
    bandButtons: document.querySelectorAll('.band-btn'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),

    // Controls
    playBtn: document.getElementById('play-btn'),
    controlsContainer: document.getElementById('controls-container'),
    controlsRow: document.getElementById('controls-row'),
    playingModeIndicator: document.getElementById('playing-mode-indicator'),
    playingModeText: document.getElementById('playing-mode-text'),

    // Footer
    buildTimestamp: document.getElementById('build-timestamp'),

    // Audio
    audioPlayer: document.getElementById('audio-player'),

    // New additions
    idleWeather: document.getElementById('idle-weather'),
    headerWeather: document.getElementById('header-weather'),

    // Background
    bgBlur: document.getElementById('bg-blur'),
}; 