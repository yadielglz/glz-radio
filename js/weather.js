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
    if (!weatherState.data) return;
    const temp = Math.round(weatherState.data.temperature);
    const icon = mapCodeToIcon(weatherState.data.weathercode);
    const html = `<i data-lucide="${icon}" class="w-4 h-4 inline-block"></i><span>${temp}°F</span>`;

    if (dom.idleWeather) dom.idleWeather.innerHTML = html;
    if (dom.headerWeather) dom.headerWeather.innerHTML = html;

    // Toggle visibility based on play state
    if (dom.idleWeather) dom.idleWeather.classList.toggle('hidden', weatherState.isPlaying);
    if (dom.headerWeather) dom.headerWeather.classList.toggle('hidden', !weatherState.isPlaying);

    if (window.lucide) {
        lucide.createIcons();
    }
}

export function setPlayState(isPlaying) {
    weatherState.isPlaying = isPlaying;
    render();
}

export async function initWeather() {
    if (!navigator.geolocation) {
        console.warn('Geolocation not available; weather disabled');
        return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit`;
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
