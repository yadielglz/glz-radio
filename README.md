# Glz Radio PWA

A modern, responsive Progressive Web App (PWA) for streaming Puerto Rican radio stations with a Zune-inspired design.

## 🌟 Features

### Core Features
- **Radio Streaming**: Stream 20+ Puerto Rican radio stations
- **Tuner Panel**: Visual AM/FM/Satellite tuner with realistic animations
- **Weather Integration**: Real-time weather with location detection
- **Clock & Time**: Live clock display with date
- **Multiple Themes**: Dark, Light, and OLED themes

### PWA Features
- **Offline Support**: Works offline with cached content
- **Installable**: Add to home screen on mobile and desktop
- **Push Notifications**: Weather updates and app notifications
- **Background Sync**: Syncs data when connection is restored
- **App Shortcuts**: Quick actions from home screen
- **Media Session**: Control playback from system media controls

### Enhanced Features
- **Favorites System**: Save and manage favorite stations
- **Play History**: Track recently played stations
- **Random Station**: Discover new stations
- **Fullscreen Mode**: Immersive listening experience
- **Responsive Design**: Works on all devices
- **State Persistence**: Remembers your preferences

## 📱 Installation

### Mobile (iOS/Android)
1. Open the app in your browser
2. Tap the "Install" button when prompted
3. Or manually add to home screen:
   - **iOS**: Tap Share → Add to Home Screen
   - **Android**: Tap Menu → Add to Home Screen

### Desktop
1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Or use the install prompt

## 🎵 Radio Stations

The app includes popular Puerto Rican stations:

### AM Stations
- WKAQ 580 - News/Talk
- NOTIUNO 630 - News
- Radio Once 1120 - Music
- Radio Isla 1320 - News
- Radio Tiempo 1430 - News
- Radio Cumbre 1470 - Music

### FM Stations
- Radio Oro 92.5 - Music
- Z 93 (93.7) - Salsa
- La Nueva 94 (94.7) - Reggaeton
- Fidelity 95.7 - Christian
- Estereotempo 96.5 - Music
- Magic 97.3 - Music
- SalSoul 99.1 - Salsa
- La X 100.7 - Music
- Hot102 (102.5) - Pop
- KQ105 (104.7) - Pop
- La Mega 106.9 - Reggaeton

### Satellite/Online
- Latino 99 - Salsa
- Salseo Radio - Salsa
- La Vieja Z - Salsa

## 🛠️ Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Tailwind CSS with custom Zune theme
- **Icons**: Lucide Icons
- **PWA**: Service Worker, Web App Manifest
- **Caching**: Cache-first strategy with network fallback

### File Structure
```
glz-radio/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── sw.js                  # Service Worker
├── css/
│   └── styles.css         # All styles and animations
├── js/
│   ├── config.js          # App configuration
│   ├── utils.js           # Utility functions
│   ├── dom.js             # DOM element references
│   ├── state.js           # State management
│   ├── player.js          # Audio player logic
│   ├── tuner.js           # Tuner display logic
│   ├── weather.js         # Weather API integration
│   ├── ui.js              # UI interactions
│   ├── pwa.js             # PWA functionality
│   └── app.js             # Main app initialization
└── README.md              # This file
```

### APIs Used
- **Weather**: Open-Meteo API
- **Location**: IP Geolocation API
- **Media Session**: Browser Media Session API
- **Notifications**: Web Push API
- **Storage**: LocalStorage API

## 🎨 Design

### Zune-Inspired Theme
- **Color Palette**: Orange (#f7931e) and dark grays
- **Typography**: Inter font family
- **Animations**: Smooth transitions and micro-interactions
- **Layout**: Card-based design with rounded corners
- **Effects**: Glow effects and ambient backgrounds

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Desktop**: Centered card layout
- **Tablet**: Adaptive layout
- **Safe Areas**: iOS notch and Android gesture areas

## 🔧 Configuration

### Environment Variables
The app uses the following configuration:

```javascript
// Weather API
WEATHER_API_BASE = "https://api.open-meteo.com/v1/forecast"
IP_LOCATION_API = "https://ipapi.co/json/"

// Default location (San Juan, Puerto Rico)
DEFAULT_LAT = 18.22
DEFAULT_LON = -66.59

// Update intervals
WEATHER_UPDATE_INTERVAL = 15 minutes
RDS_ROTATION_INTERVAL = 4 seconds
```

### Adding New Stations
To add a new radio station, edit `js/config.js`:

```javascript
const RADIO_STATIONS = {
    "Station Name": {
        "logo": "https://station-logo-url.png",
        "streamUrl": "https://stream-url.mp3",
        "frequency": "FM: 101.1 Mhz",
        "callSign": "WXXX FM",
        "rdsText": ["Station Name", "Tagline", "Location"]
    }
};
```

## 🚀 Performance

### Optimization Features
- **Lazy Loading**: Images and resources loaded on demand
- **Caching**: Service Worker caches static assets
- **Compression**: Optimized images and assets
- **Minification**: Production-ready code
- **CDN**: External resources from CDNs

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔒 Privacy & Security

### Data Collection
- **Location**: Only for weather (IP-based)
- **Usage**: Stored locally (favorites, history)
- **Analytics**: None collected
- **Third-party**: No tracking

### Security
- **HTTPS**: Required for PWA features
- **CSP**: Content Security Policy enabled
- **Sanitization**: Input sanitization
- **Validation**: Data validation

## 📋 Browser Support

### Supported Browsers
- **Chrome**: 88+
- **Firefox**: 85+
- **Safari**: 14+
- **Edge**: 88+

### PWA Features by Browser
- **Install**: Chrome, Edge, Firefox
- **Notifications**: Chrome, Firefox, Edge
- **Background Sync**: Chrome, Edge
- **Media Session**: Chrome, Edge, Firefox

## 🐛 Troubleshooting

### Common Issues

**App won't install**
- Ensure HTTPS is enabled
- Check browser compatibility
- Clear browser cache

**Audio won't play**
- Check internet connection
- Verify station stream URL
- Try refreshing the page

**Weather not showing**
- Check location permissions
- Verify internet connection
- Wait for API response

**Offline mode not working**
- Ensure service worker is registered
- Check browser console for errors
- Clear and reinstall the app

### Debug Mode
Enable debug mode by adding `?debug=true` to the URL:

```javascript
// Access debug functions
window.stateManager.debugState();
window.app.debug();
```

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Serve files with a local server (HTTPS required for PWA)
3. Open in browser
4. Use browser dev tools for debugging

### Local Development Server
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

### Testing
- Test on multiple devices
- Verify PWA installation
- Check offline functionality
- Test all radio stations

## 📄 License

© Glz Technical Services

This project is proprietary software. All rights reserved.

## 📞 Support

For support or questions:
- **Email**: support@glztech.com
- **Website**: https://glztech.com
- **Version**: 9.2
- **Build**: 2025.06.11

---

**Glz Radio PWA** - Bringing Puerto Rican radio to the modern web! 🇵🇷📻 