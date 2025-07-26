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
            <div class="weather-condition">${condition}</div>
        </div>
    `;
    
    // Simple header weather (compact)
    const headerHtml = `<i data-lucide="${icon}" class="w-4 h-4 inline-block"></i><span>${temp}°F</span>`;

    if (dom.idleWeather) {
        dom.idleWeather.innerHTML = idleHtml;
    }
    if (dom.headerWeather) dom.headerWeather.innerHTML = headerHtml;

    // Keep weather visible at all times (both idle and playing states)
    if (dom.idleWeather) dom.idleWeather.classList.remove('hidden');
    if (dom.headerWeather) dom.headerWeather.classList.add('hidden'); // Always hide header weather

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
    if (!navigator.geolocation) {
        return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit&timezone=auto`;
            const res = await fetch(url);
            const json = await res.json();
            if (json && json.current_weather) {
                weatherState.data = json.current_weather;
                render();
            }
        } catch (e) {
            console.error('Weather fetch failed', e);
        }
    }, (err) => {
        console.warn('Geolocation error:', err);
    });
}
