// Weather functionality

import { dom } from './dom.js';

const weatherState = {
    data: null,
    isPlaying: false,
};

function mapCodeToIcon(code) {
    // Map weathercode to lucide icon names (approximate)
    if (code === 0) return 'sun'; // Clear sky
    if ([1, 2].includes(code)) return 'cloud-sun'; // Mainly clear / partly cloudy
    if (code === 3) return 'cloud'; // Overcast
    if ([45, 48].includes(code)) return 'cloud-fog'; // Fog
    if ([51, 53, 55, 56, 57].includes(code)) return 'cloud-drizzle'; // Drizzle
    if ([61, 63, 65, 80, 81, 82].includes(code)) return 'cloud-rain'; // Rain
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'cloud-snow'; // Snow
    if ([95, 96, 99].includes(code)) return 'cloud-lightning'; // Thunderstorm
    return 'cloud';
}

function render() {
    if (!weatherState.data) {
        return;
    }
    
    const temp = Math.round(weatherState.data.temperature);
    const icon = mapCodeToIcon(weatherState.data.weathercode);
    const condition = getWeatherCondition(weatherState.data.weathercode);
    
    // Enhanced idle weather widget
    const idleHtml = `
        <i data-lucide="${icon}" class="weather-icon"></i>
        <div class="weather-details">
            <div class="weather-temp">${temp}°F</div>
        </div>
    `;
    
    if (dom.idleWeather) {
        dom.idleWeather.innerHTML = idleHtml;
    }
    
    if (window.lucide) {
        lucide.createIcons();
    }
}

function getWeatherCondition(code) {
    const conditions = {
        0: 'Clear Sky',
        1: 'Mainly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing Rime Fog',
        51: 'Light Drizzle',
        53: 'Moderate Drizzle',
        55: 'Dense Drizzle',
        56: 'Light Freezing Drizzle',
        57: 'Dense Freezing Drizzle',
        61: 'Slight Rain',
        63: 'Moderate Rain',
        65: 'Heavy Rain',
        71: 'Slight Snow',
        73: 'Moderate Snow',
        75: 'Heavy Snow',
        77: 'Snow Grains',
        80: 'Slight Rain Showers',
        81: 'Moderate Rain Showers',
        82: 'Violent Rain Showers',
        85: 'Slight Snow Showers',
        86: 'Heavy Snow Showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with Slight Hail',
        99: 'Thunderstorm with Heavy Hail'
    };
    return conditions[code] || 'Unknown';
}

export function setPlayState(isPlaying) {
    weatherState.isPlaying = isPlaying;
    render();
}

export async function initWeather() {
    // Default location (San Juan, PR) as fallback
    const defaultLat = 18.22;
    const defaultLon = -66.59;
    
    const fetchWeather = async (lat, lon) => {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&timezone=auto`;
            const res = await fetch(url);
            const json = await res.json();
            if (json && json.current_weather) {
                weatherState.data = json.current_weather;
                render();
            }
        } catch (e) {
            console.error('Weather fetch failed', e);
        }
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            await fetchWeather(latitude, longitude);
        }, async (err) => {
            console.warn('Geolocation error, using default location:', err);
            await fetchWeather(defaultLat, defaultLon);
        });
    } else {
        console.warn('Geolocation not available, using default location');
        await fetchWeather(defaultLat, defaultLon);
    }
}
