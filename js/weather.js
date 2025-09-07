// Weather Integration Module
import { dom } from './dom.js';
import { state } from './state.js';

class WeatherService {
    constructor() {
        this.apiKey = null; // Using free API without key
        this.baseUrl = 'https://api.open-meteo.com/v1/forecast';
        this.location = null;
        this.currentWeather = null;
        this.updateInterval = null;
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        try {
            await this.getUserLocation();
            await this.fetchWeather();
            this.startPeriodicUpdates();
        } catch (error) {
            console.warn('Weather initialization failed:', error);
            this.setDefaultLocation();
        }
    }

    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.location = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        };
                        resolve(this.location);
                    },
                    (error) => {
                        console.warn('Geolocation failed:', error);
                        this.setDefaultLocation();
                        resolve(this.location);
                    },
                    { timeout: 10000, enableHighAccuracy: false }
                );
            } else {
                this.setDefaultLocation();
                resolve(this.location);
            }
        });
    }

    setDefaultLocation() {
        // Default to San Juan, Puerto Rico
        this.location = {
            latitude: 18.22,
            longitude: -66.59
        };
    }

    async fetchWeather() {
        if (!this.location || this.isLoading) return;
        
        this.isLoading = true;
        this.updateWeatherUI('loading');

        try {
            const url = `${this.baseUrl}?latitude=${this.location.latitude}&longitude=${this.location.longitude}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.currentWeather = data.current_weather;
            
            this.updateWeatherUI('success');
        } catch (error) {
            console.error('Weather fetch failed:', error);
            this.updateWeatherUI('error');
        } finally {
            this.isLoading = false;
        }
    }

    updateWeatherUI(status) {
        const weatherContainer = document.getElementById('weather-display');
        if (!weatherContainer) return;

        switch (status) {
            case 'loading':
                weatherContainer.innerHTML = `
                    <div class="flex items-center space-x-2 animate-pulse">
                        <div class="w-6 h-6 bg-white/20 rounded-full"></div>
                        <div class="w-12 h-4 bg-white/20 rounded"></div>
                    </div>
                `;
                break;
                
            case 'success':
                if (this.currentWeather) {
                    const temp = Math.round(this.currentWeather.temperature);
                    const icon = this.getWeatherIcon(this.currentWeather.weathercode);
                    
                    weatherContainer.innerHTML = `
                        <div class="flex items-center space-x-2 animate-fadeIn">
                            <i data-lucide="${icon}" class="w-6 h-6 text-yellow-400"></i>
                            <span class="text-lg font-semibold text-white">${temp}°F</span>
                        </div>
                    `;
                    
                    // Recreate icons
                    if (window.lucide) {
                        lucide.createIcons();
                    }
                }
                break;
                
            case 'error':
                weatherContainer.innerHTML = `
                    <div class="flex items-center space-x-2">
                        <i data-lucide="cloud-off" class="w-6 h-6 text-gray-400"></i>
                        <span class="text-sm text-gray-400">Weather unavailable</span>
                    </div>
                `;
                if (window.lucide) {
                    lucide.createIcons();
                }
                break;
        }
    }

    getWeatherIcon(code) {
        // WMO Weather interpretation codes
        switch (code) {
            case 0: return 'sun'; // Clear sky
            case 1: case 2: case 3: return 'cloud-sun'; // Mainly clear, partly cloudy, overcast
            case 45: case 48: return 'cloud-fog'; // Fog and depositing rime fog
            case 51: case 53: case 55: return 'cloud-drizzle'; // Drizzle
            case 61: case 63: case 65: return 'cloud-rain'; // Rain
            case 66: case 67: return 'cloud-snow'; // Freezing rain
            case 71: case 73: case 75: return 'snowflake'; // Snow fall
            case 80: case 81: case 82: return 'cloud-rain'; // Rain showers
            case 85: case 86: return 'cloud-snow'; // Snow showers
            case 95: case 96: case 99: return 'cloud-lightning'; // Thunderstorm
            default: return 'cloud';
        }
    }

    startPeriodicUpdates() {
        // Update weather every 15 minutes
        this.updateInterval = setInterval(() => {
            this.fetchWeather();
        }, 15 * 60 * 1000);
    }

    stopPeriodicUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // Public methods
    async refresh() {
        await this.fetchWeather();
    }

    getCurrentWeather() {
        return this.currentWeather;
    }

    getLocation() {
        return this.location;
    }
}

// Initialize weather service
const weatherService = new WeatherService();

// Export for use in other modules
export { weatherService };
export default weatherService;

