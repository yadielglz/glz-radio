export const dom = {
    // App containers
    app: document.getElementById('app'),

    // Header
    header: document.querySelector('header'),
    clock: document.getElementById('clock'),
    networkIcon: document.getElementById('network-icon'),

    // Main Display
    welcomeScreen: document.getElementById('welcome-screen'),
    bigClock: document.getElementById('big-clock'),
    nowPlaying: document.getElementById('now-playing'),
    stationLogo: document.getElementById('station-logo'),
    stationName: document.getElementById('station-name'),
    stationFrequency: document.getElementById('station-frequency'),
    stationCallsign: document.getElementById('station-callsign'),

    // Control Buttons
    playPauseBtn: document.getElementById('play-pause-btn'),
    stopBtn: document.getElementById('stop-btn'),

    // Band Selection
    bandSelectors: document.querySelectorAll('.band-selector'),

    // Station Browser
    stationBrowser: document.getElementById('station-browser'),
    currentBandDisplay: document.getElementById('current-band-display'),
    backToBandsBtn: document.getElementById('back-to-bands'),
    desktopStationGrid: document.getElementById('desktop-station-grid'),
    mobileStationList: document.getElementById('mobile-station-list'),
    loadMoreContainer: document.getElementById('load-more-container'),
    loadMoreBtn: document.getElementById('load-more-btn'),
    loadMoreText: document.getElementById('load-more-text'),
    loadMoreIcon: document.getElementById('load-more-icon'),

    // Footer
    buildTimestamp: document.getElementById('build-timestamp'),

    // Audio
    audioPlayer: document.getElementById('audio-player'),
};