// Application State Management
let state = {
    // Player state
    currentStationName: null,
    isPlaying: false,
    isFirstPlay: true,
    isStopping: false,
    isPrimed: false,
    
    // Timing state
    elapsedTime: 0,
    rdsInterval: null,
    rdsObserverInterval: null,
    stopwatchInterval: null,
    flickerInterval: null,
    networkSpeedInterval: null,
    
    // Weather state
    isCelsius: false,
    weatherData: null,
    
    // UI state
    isOptionsOpen: false,
    isStationListExpanded: false,
    isFullscreen: false,
    
    // PWA state
    isOnline: navigator.onLine,
    isInstalled: false,
    updateAvailable: false,
    
    // App state
    isInitialized: false,
    currentTheme: 'dark',
    lastPlayedStation: null,
    
    // Performance state
    lastNetworkSpeed: 0,
    connectionQuality: 'good', // good, fair, poor
    
    // Error state
    lastError: null,
    errorCount: 0
};

// State getters
const getState = (key) => {
    return state[key];
};

// State setters
const setState = (key, value) => {
    state[key] = value;
    
    // Trigger state change events
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('stateChange', {
            detail: { key, value, state }
        }));
    }
};

// State watchers
const stateWatchers = new Map();

const watchState = (key, callback) => {
    if (!stateWatchers.has(key)) {
        stateWatchers.set(key, []);
    }
    stateWatchers.get(key).push(callback);
};

const unwatchState = (key, callback) => {
    if (stateWatchers.has(key)) {
        const watchers = stateWatchers.get(key);
        const index = watchers.indexOf(callback);
        if (index > -1) {
            watchers.splice(index, 1);
        }
    }
};

// Enhanced state setter with watchers
const setStateWithWatchers = (key, value) => {
    const oldValue = state[key];
    state[key] = value;
    
    // Notify watchers
    if (stateWatchers.has(key)) {
        stateWatchers.get(key).forEach(callback => {
            try {
                callback(value, oldValue, state);
            } catch (error) {
                console.error('State watcher error:', error);
            }
        });
    }
    
    // Trigger state change events
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('stateChange', {
            detail: { key, value, oldValue, state }
        }));
    }
};

// State persistence
const persistState = () => {
    const stateToPersist = {
        currentStationName: state.currentStationName,
        isCelsius: state.isCelsius,
        currentTheme: state.currentTheme,
        lastPlayedStation: state.lastPlayedStation,
        elapsedTime: state.elapsedTime
    };
    
    if (window.utils && window.utils.storage) {
        window.utils.storage.set('glz-radio-state', stateToPersist);
    }
};

const restoreState = () => {
    const persistedState = window.utils && window.utils.storage ? 
        window.utils.storage.get('glz-radio-state', {}) : {};
    
    if (persistedState.currentStationName) {
        state.currentStationName = persistedState.currentStationName;
    }
    
    if (persistedState.isCelsius !== undefined) {
        state.isCelsius = persistedState.isCelsius;
    }
    
    if (persistedState.currentTheme) {
        state.currentTheme = persistedState.currentTheme;
    }
    
    if (persistedState.lastPlayedStation) {
        state.lastPlayedStation = persistedState.lastPlayedStation;
    }
    
    if (persistedState.elapsedTime) {
        state.elapsedTime = persistedState.elapsedTime;
    }
};

// Auto-persist state changes
const setupStatePersistence = () => {
    const keysToPersist = ['currentStationName', 'isCelsius', 'currentTheme', 'lastPlayedStation'];
    
    keysToPersist.forEach(key => {
        watchState(key, () => {
            persistState();
        });
    });
};

// State validation
const validateState = () => {
    const errors = [];
    
    if (state.elapsedTime < 0) {
        errors.push('Elapsed time cannot be negative');
        state.elapsedTime = 0;
    }
    
    if (state.errorCount < 0) {
        errors.push('Error count cannot be negative');
        state.errorCount = 0;
    }
    
    if (errors.length > 0) {
        console.warn('State validation errors:', errors);
    }
    
    return errors.length === 0;
};

// State reset
const resetState = () => {
    state = {
        currentStationName: null,
        isPlaying: false,
        isFirstPlay: true,
        isStopping: false,
        isPrimed: false,
        elapsedTime: 0,
        rdsInterval: null,
        rdsObserverInterval: null,
        stopwatchInterval: null,
        flickerInterval: null,
        networkSpeedInterval: null,
        isCelsius: false,
        weatherData: null,
        isOptionsOpen: false,
        isStationListExpanded: false,
        isFullscreen: false,
        isOnline: navigator.onLine,
        isInstalled: false,
        updateAvailable: false,
        isInitialized: false,
        currentTheme: 'dark',
        lastPlayedStation: null,
        lastNetworkSpeed: 0,
        connectionQuality: 'good',
        lastError: null,
        errorCount: 0
    };
    
    // Trigger state change event
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('stateReset', {
            detail: { state }
        }));
    }
};

// State debugging
const debugState = () => {
    console.log('Current State:', JSON.stringify(state, null, 2));
};

// Export state management functions and state object
window.state = Object.assign(state, {
    getState,
    setState: setStateWithWatchers,
    watchState,
    unwatchState,
    persistState,
    restoreState,
    setupStatePersistence,
    validateState,
    resetState,
    debugState
});
