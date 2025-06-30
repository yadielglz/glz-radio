// Enhanced Player functionality with Firebase integration

// Firebase stream handling with fallback support
const getStreamUrl = (stationName) => {
    const station = RADIO_STATIONS[stationName];
    if (!station) return null;
    
    // Use Firebase proxy if enabled and available
    if (APP_CONFIG.useFirebaseProxy && station.firebaseProxyUrl) {
        return station.firebaseProxyUrl;
    }
    
    // Fallback to direct URL
    return station.streamUrl;
};

// Enhanced playStation with Firebase integration
const playStation = async (stationName) => {
    state.currentStationName = stationName;
    state.lastPlayedStation = stationName;
    
    // Update UI
    document.querySelectorAll('.station-item').forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.stationName === stationName) {
            item.classList.add('selected');
        }
    });
    
    const station = RADIO_STATIONS[stationName];
    
    // Update ambient background
    const ambientBg = document.getElementById('ambient-bg');
    if (station.logo) {
        ambientBg.style.backgroundImage = `url(${station.logo})`;
        ambientBg.style.opacity = 1;
    }
    
    // Get stream URL with Firebase proxy support
    const streamUrl = getStreamUrl(stationName);
    if (!streamUrl) {
        console.error('No stream URL available for station:', stationName);
        return;
    }
    
    // Set up audio with enhanced error handling
    dom.audioPlayer.src = streamUrl;
    dom.audioPlayer.load();
    
    // Enhanced error handling with fallback
    const handlePlayError = async (error) => {
        console.error("Play error:", error);
        
        // If using Firebase proxy, try direct URL as fallback
        if (APP_CONFIG.useFirebaseProxy && APP_CONFIG.fallbackToDirect) {
            console.log("Trying direct URL fallback...");
            dom.audioPlayer.src = station.streamUrl;
            dom.audioPlayer.load();
            
            try {
                await dom.audioPlayer.play();
                console.log("Direct URL fallback successful");
                return;
            } catch (fallbackError) {
                console.error("Direct URL fallback also failed:", fallbackError);
            }
        }
        
        // If all else fails, try fallback URLs
        if (station.fallbackUrls && station.fallbackUrls.length > 0) {
            for (let i = 0; i < station.fallbackUrls.length; i++) {
                try {
                    console.log(`Trying fallback URL ${i + 1}:`, station.fallbackUrls[i]);
                    dom.audioPlayer.src = station.fallbackUrls[i];
                    dom.audioPlayer.load();
                    await dom.audioPlayer.play();
                    console.log(`Fallback URL ${i + 1} successful`);
                    return;
                } catch (fallbackError) {
                    console.error(`Fallback URL ${i + 1} failed:`, fallbackError);
                }
            }
        }
        
        // All attempts failed
        stopPlayer(true);
        showErrorMessage(`Failed to play ${stationName}. Please try again later.`);
    };
    
    // Play audio with enhanced error handling
    try {
        await dom.audioPlayer.play();
    } catch (error) {
        await handlePlayError(error);
    }
    
    // Add to play history
    playHistory.add(stationName);
    
    // Log analytics if enabled
    if (APP_CONFIG.enableAnalytics) {
        logAnalytics('station_play', stationName);
    }
    
    // Close options if open
    closeOptions();
};

// Enhanced weather fetching with Firebase
const fetchWeatherWithFirebase = async (lat, lon) => {
    try {
        let weatherData;
        
        if (WEATHER_CONFIG.useFirebaseWeather) {
            // Use Firebase weather proxy
            const response = await fetch(`${WEATHER_CONFIG.firebaseWeatherUrl}?lat=${lat}&lon=${lon}`);
            if (!response.ok) throw new Error(`Weather proxy responded with ${response.status}`);
            weatherData = await response.json();
        } else {
            // Use direct API
            const response = await fetch(`${WEATHER_CONFIG.fallbackWeatherApi}?latitude=${lat}&longitude=${lon}&current_weather=true`);
            if (!response.ok) throw new Error(`Weather API responded with ${response.status}`);
            weatherData = await response.json();
        }
        
        state.weatherData = weatherData.current_weather;
        updateWeatherDisplay();
        
        // Cache weather data
        if ('caches' in window) {
            const cache = await caches.open('glz-radio-weather');
            await cache.put(
                `weather-${lat}-${lon}`,
                new Response(JSON.stringify(weatherData), {
                    headers: { 'Content-Type': 'application/json' }
                })
            );
        }
        
    } catch (error) {
        console.error("Failed to fetch weather:", error);
        
        // Try to get cached weather data
        if ('caches' in window) {
            try {
                const cache = await caches.open('glz-radio-weather');
                const cachedResponse = await cache.match(`weather-${lat}-${lon}`);
                if (cachedResponse) {
                    const cachedData = await cachedResponse.json();
                    state.weatherData = cachedData.current_weather;
                    updateWeatherDisplay();
                    return;
                }
            } catch (cacheError) {
                console.error("Cache retrieval failed:", cacheError);
            }
        }
        
        dom.weatherDisplaySettings.innerHTML = `<span>Weather N/A</span>`;
    }
};

// Enhanced location fetching with Firebase
const getIPLocationAndWeatherWithFirebase = async () => {
    try {
        let locationData;
        
        if (WEATHER_CONFIG.useFirebaseWeather) {
            // Use Firebase location proxy
            const response = await fetch(WEATHER_CONFIG.firebaseLocationUrl);
            if (!response.ok) throw new Error('Firebase location proxy failed');
            locationData = await response.json();
        } else {
            // Use direct API
            const response = await fetch(WEATHER_CONFIG.fallbackLocationApi);
            if (!response.ok) throw new Error('IP Geolocation failed');
            locationData = await response.json();
        }
        
        fetchWeatherWithFirebase(locationData.latitude, locationData.longitude);
        
    } catch (error) {
        console.error("IP Geolocation failed:", error);
        // Fallback to San Juan, Puerto Rico
        fetchWeatherWithFirebase(18.22, -66.59);
    }
};

// Analytics logging function
const logAnalytics = async (event, station = null, data = {}) => {
    if (!APP_CONFIG.enableAnalytics) return;
    
    try {
        const analyticsData = {
            event,
            station,
            data,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            appVersion: APP_VERSION
        };
        
        // Send to Firebase analytics function
        await fetch(FIREBASE_ENDPOINTS.analytics, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(analyticsData)
        });
        
    } catch (error) {
        console.error('Analytics logging failed:', error);
    }
};

// Error message display
const showErrorMessage = (message) => {
    // Create or update error message element
    let errorElement = document.getElementById('error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'error-message';
        errorElement.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
        document.body.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
};

// Health check function
const checkFirebaseHealth = async () => {
    try {
        const response = await fetch(FIREBASE_ENDPOINTS.health);
        const healthData = await response.json();
        console.log('Firebase health check:', healthData);
        return healthData.status === 'healthy';
    } catch (error) {
        console.error('Firebase health check failed:', error);
        return false;
    }
};

// Enhanced initialization with Firebase
const initializeWithFirebase = async () => {
    // Check Firebase health
    const isHealthy = await checkFirebaseHealth();
    if (!isHealthy) {
        console.warn('Firebase services unavailable, falling back to direct URLs');
        APP_CONFIG.useFirebaseProxy = false;
    }
    
    // Initialize weather with Firebase
    getIPLocationAndWeatherWithFirebase();
    
    // Log app initialization
    logAnalytics('app_init', null, { 
        firebaseEnabled: APP_CONFIG.useFirebaseProxy,
        firebaseHealthy: isHealthy,
        appVersion: APP_VERSION
    });
};

// Export enhanced functions
window.playerFirebase = {
    playStation,
    fetchWeatherWithFirebase,
    getIPLocationAndWeatherWithFirebase,
    logAnalytics,
    showErrorMessage,
    checkFirebaseHealth,
    initializeWithFirebase
}; 