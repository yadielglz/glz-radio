# Glz Radio PWA

A modern, responsive Progressive Web App (PWA) for streaming Puerto Rican radio stations with a sleek glassmorphism design.

## 🌟 Current Features (v7.0)

* **Live Streaming** – 20+ Puerto-Rican AM/FM/Satellite stations.
* **One-Tap Band Select** – AM · FM · SAT buttons directly above the tuner dropdown.
* **Dropdown Tuner** – "frequency · name" list synced to the current band.
* **Dynamic Play-Box** – Idle (24-h clock) vs. Now-Playing (logo, name, freq, call-sign) with adaptive glow sampled from the logo.
* **Weather** – Local temperature °F + icon (idle: under clock, playing: in header).
* **Live Clock & RDS** – 12-h clock in header; RDS scrolls while playing and shows selected band when idle.
* **Media Session API** – System-level play/pause and metadata.
* **PWA** – Installable, offline cache of static assets, service-worker powered.
* **Modern Dark Glass UI** – Tailwind + custom CSS, Manrope font, radial gradient background.

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
- **Styling**: Tailwind CSS with modern glassmorphism theme
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

### Modern Glassmorphism Theme
- **Color Palette**: Indigo (#6366f1), Purple (#8b5cf6), Pink (#ec4899)
- **Typography**: Inter font family with JetBrains Mono for code
- **Animations**: Smooth transitions and micro-interactions
- **Layout**: Glassmorphism cards with backdrop blur effects
- **Effects**: Gradient backgrounds, glow effects, and ambient lighting

### Design Features
- **Glassmorphism**: Translucent glass-like elements
- **Backdrop Blur**: Modern blur effects for depth
- **Gradient Animations**: Dynamic color transitions
- **Hover Effects**: Interactive feedback and animations
- **Responsive**: Adaptive design for all screen sizes

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Desktop**: Centered card layout with glassmorphism
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
- **Backdrop Filter**: Chrome, Safari, Edge (partial)
- **Service Worker**: All modern browsers

## 🎯 Key Features

### Modern UI/UX
- **Glassmorphism Design**: Translucent glass-like interface
- **Smooth Animations**: 60fps animations and transitions
- **Gradient Backgrounds**: Dynamic color schemes
- **Interactive Elements**: Hover effects and feedback
- **Accessibility**: WCAG compliant design

### Audio Experience
- **High-Quality Streaming**: Optimized audio streams
- **Background Playback**: Continue playing when app is minimized
- **Media Controls**: System-level media controls
- **Audio Visualization**: Visual feedback during playback

### Smart Features
- **Auto-Detection**: Automatic location and weather
- **Smart Caching**: Intelligent resource management
- **Offline Mode**: Core functionality without internet
- **State Management**: Persistent user preferences

## 🔄 Updates

### Version 9.2 (Latest)
- **Complete UI Overhaul**: Modern glassmorphism design
- **Enhanced Animations**: Smooth transitions and effects
- **Improved Performance**: Optimized rendering and caching
- **Better Accessibility**: Enhanced keyboard navigation
- **Updated Icons**: Modern Lucide icon set

### Previous Versions
- **Version 9.1**: Bug fixes and performance improvements
- **Version 9.0**: Major feature additions and PWA enhancements
- **Version 8.x**: Core functionality and station additions

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Open `index.html` in a modern browser
3. Use a local server for PWA features
4. Test on multiple devices and browsers

### Code Style
- **JavaScript**: ES6+ with modern syntax
- **CSS**: Tailwind CSS with custom properties
- **HTML**: Semantic markup with accessibility
- **Comments**: Clear documentation and explanations

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Radio Stations**: All Puerto Rican radio stations for their streams
- **Weather API**: Open-Meteo for weather data
- **Icons**: Lucide for the beautiful icon set
- **Fonts**: Inter and JetBrains Mono font families
- **Community**: All contributors and users

---

**Glz Radio** - Puerto Rico's Premier Radio Streaming App with Modern Design 