// Weather functionality

const updateWeatherDisplay = () => {
    if (!state.weatherData) return;
    
    const { temperature, weathercode } = state.weatherData;
    const temp = state.isCelsius ? temperature : celsiusToFahrenheit(temperature);
    const icon = getWeatherIcon(weathercode);
    
    const weatherHTML = `<i data-lucide="${icon}" class="w-5 h-5"></i><span>${Math.round(temp)}°${state.isCelsius ? 'C' : 'F'}</span>`;
    dom.weatherDisplaySettings.innerHTML = weatherHTML;
    
    lucide.createIcons();
    updateStatusBar();
    
    dom.tempC.classList.toggle('font-bold', state.isCelsius);
    dom.tempC.classList.toggle('opacity-50', !state.isCelsius);
    dom.tempF.classList.toggle('font-bold', !state.isCelsius);
    dom.tempF.classList.toggle('opacity-50', state.isCelsius);
};

const getIPLocationAndWeather = async () => {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('IP Geolocation failed');
        
        const locationData = await response.json();
        fetchWeather(locationData.latitude, locationData.longitude);
    } catch (error) {
        console.error("IP Geolocation failed:", error);
        // Fallback to San Juan, Puerto Rico
        fetchWeather(18.22, -66.59);
    }
};

const fetchWeather = async (lat, lon) => {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await response.json();
        
        state.weatherData = data.current_weather;
        updateWeatherDisplay();
        
        // Show weather notification on first load
        if (window.pwa && window.pwa.showNotification && !state.weatherData) {
            const temp = state.isCelsius ? data.current_weather.temperature : celsiusToFahrenheit(data.current_weather.temperature);
            const icon = getWeatherIcon(data.current_weather.weathercode);
            
            window.pwa.showNotification('Weather Update', {
                body: `${Math.round(temp)}°${state.isCelsius ? 'C' : 'F'} - ${getWeatherDescription(data.current_weather.weathercode)}`,
                icon: `/icons/weather/${icon}.png`,
                tag: 'weather-update'
            });
        }
        
    } catch (error) {
        console.error("Failed to fetch weather:", error);
        dom.weatherDisplaySettings.innerHTML = `<span>Weather N/A</span>`;
    }
};

const getWeatherDescription = (code) => {
    switch (code) {
        case 0: return 'Clear sky';
        case 1: case 2: case 3: return 'Partly cloudy';
        case 45: case 48: return 'Foggy';
        case 51: case 53: case 55: return 'Drizzle';
        case 61: case 63: case 65: return 'Rain';
        case 66: case 67: return 'Sleet';
        case 71: case 73: case 75: return 'Snow';
        case 80: case 81: case 82: return 'Rain showers';
        case 85: case 86: return 'Snow showers';
        case 95: case 96: case 99: return 'Thunderstorm';
        default: return 'Cloudy';
    }
};

const toggleTemperatureUnit = () => {
    state.isCelsius = !state.isCelsius;
    storage.set('glz-radio-temp-unit', state.isCelsius ? 'C' : 'F');
    updateWeatherDisplay();
};

// Export functions
window.weather = {
    updateWeatherDisplay,
    getIPLocationAndWeather,
    fetchWeather,
    toggleTemperatureUnit
};
