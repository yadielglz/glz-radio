// Utility Functions

const delay = ms => new Promise(res => setTimeout(res, ms));

const getWeatherIcon = (code) => {
    switch (code) {
        case 0: return 'sun';
        case 1: case 2: case 3: return 'cloud-sun';
        case 45: case 48: return 'cloud-fog';
        case 51: case 53: case 55: return 'cloud-drizzle';
        case 61: case 63: case 65: return 'cloud-rain';
        case 66: case 67: return 'cloud-snow';
        case 71: case 73: case 75: return 'snowflake';
        case 80: case 81: case 82: return 'cloud-rain';
        case 85: case 86: return 'cloud-snow';
        case 95: case 96: case 99: return 'cloud-lightning';
        default: return 'cloud';
    }
};

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (num) => String(num).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

const celsiusToFahrenheit = (celsius) => {
    return (celsius * 9/5) + 32;
};

const generateNetworkSpeed = (min = 48, max = 128) => {
    return (Math.random() * (max - min) + min).toFixed(1);
};

const getFormattedDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
};

const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const handleViewportChange = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
};

const isMobile = () => {
    return window.innerWidth <= 639;
};

const isPWA = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true;
};

const storage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('Error writing to localStorage:', error);
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Error removing from localStorage:', error);
        }
    }
};

const favorites = {
    get: () => {
        return storage.get('glz-radio-favorites', []);
    },
    
    add: (stationName) => {
        const favorites = storage.get('glz-radio-favorites', []);
        if (!favorites.includes(stationName)) {
            favorites.push(stationName);
            storage.set('glz-radio-favorites', favorites);
        }
    },
    
    remove: (stationName) => {
        const favorites = storage.get('glz-radio-favorites', []);
        const index = favorites.indexOf(stationName);
        if (index > -1) {
            favorites.splice(index, 1);
            storage.set('glz-radio-favorites', favorites);
        }
    },
    
    has: (stationName) => {
        const favorites = storage.get('glz-radio-favorites', []);
        return favorites.includes(stationName);
    }
};

const playHistory = {
    get: () => {
        return storage.get('glz-radio-history', []);
    },
    
    add: (stationName) => {
        const history = storage.get('glz-radio-history', []);
        const timestamp = Date.now();
        
        // Remove if already exists
        const index = history.findIndex(item => item.station === stationName);
        if (index > -1) {
            history.splice(index, 1);
        }
        
        // Add to beginning
        history.unshift({
            station: stationName,
            timestamp: timestamp,
            date: new Date(timestamp).toISOString()
        });
        
        // Keep only last 50 entries
        if (history.length > 50) {
            history.splice(50);
        }
        
        storage.set('glz-radio-history', history);
    },
    
    clear: () => {
        storage.remove('glz-radio-history');
    }
};

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

const withErrorHandling = (fn, context = 'Unknown') => {
    return (...args) => {
        try {
            return fn(...args);
        } catch (error) {
            console.error(`Error in ${context}:`, error);
            return null;
        }
    };
};

const withAsyncErrorHandling = (fn, context = 'Unknown') => {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            console.error(`Error in ${context}:`, error);
            return null;
        }
    };
};

// Export functions
window.utils = {
    delay,
    getWeatherIcon,
    formatTime,
    celsiusToFahrenheit,
    generateNetworkSpeed,
    getFormattedDate,
    getFormattedTime,
    handleViewportChange,
    isMobile,
    isPWA,
    storage,
    favorites,
    playHistory,
    debounce,
    throttle,
    withErrorHandling,
    withAsyncErrorHandling
};
