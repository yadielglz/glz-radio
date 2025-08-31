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

    // Station Controls
    bandButtons: document.querySelectorAll('.band-btn'),
    playBtn: document.getElementById('play-btn'),
    desktopPlayBtn: document.getElementById('desktop-play-btn'),

    // Station Selector
    desktopCurrentStation: document.getElementById('desktop-current-station'),
    desktopStationLogo: document.getElementById('desktop-station-logo'),
    desktopStationName: document.getElementById('desktop-station-name'),
    desktopStationFrequency: document.getElementById('desktop-station-frequency'),

    // Modal
    stationModal: document.getElementById('station-modal'),
    closeModal: document.getElementById('close-modal'),
    stationSearch: document.getElementById('station-search'),
    stationList: document.getElementById('station-list'),

    // Footer
    buildTimestamp: document.getElementById('build-timestamp'),

    // Audio
    audioPlayer: document.getElementById('audio-player'),
};