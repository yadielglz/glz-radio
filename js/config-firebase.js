// Firebase Configuration for GLZ Radio App
// Updated with actual Firebase project configuration

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCAITVOQyXyQ4AMrSuE2SrkNw_YHla4OEM",
    authDomain: "glz-radio.firebaseapp.com",
    projectId: "glz-radio",
    storageBucket: "glz-radio.firebasestorage.app",
    messagingSenderId: "1050172072593",
    appId: "1:1050172072593:web:ef47a5578958f47fe59530",
    measurementId: "G-R4LXL61NJ6"
};

// Firebase Functions endpoints (updated with actual project ID)
const FIREBASE_ENDPOINTS = {
    streamProxy: "https://us-central1-glz-radio.cloudfunctions.net/radioStreamProxy",
    weatherProxy: "https://us-central1-glz-radio.cloudfunctions.net/weatherProxy",
    locationProxy: "https://us-central1-glz-radio.cloudfunctions.net/locationProxy",
    analytics: "https://us-central1-glz-radio.cloudfunctions.net/analytics",
    health: "https://us-central1-glz-radio.cloudfunctions.net/health"
};

// Enhanced Radio Stations with Firebase proxy support
const RADIO_STATIONS = {
    "WKAQ 580": {
        "logo": "https://i.iheart.com/v3/re/assets/images/77d5680e-688b-4488-8c56-9b4963cb0813.png",
        "streamUrl": "https://tunein.cdnstream1.com/4851_128.mp3",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=WKAQ 580`,
        "frequency": "AM: 580 Khz",
        "callSign": "WKAQ AM",
        "rdsText": ["WKAQ 580", "WKAQ AM", "580 AM", "San Juan, PR"],
        "fallbackUrls": [
            "https://tunein.cdnstream1.com/4851_64.mp3",
            "https://tunein.cdnstream1.com/4851_32.mp3"
        ]
    },
    "NOTIUNO 630": {
        "logo": "https://www.unoradio.com/logos/logos/notiuno/notiuno630.png",
        "streamUrl": "https://server20.servistreaming.com:9022/stream",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=NOTIUNO 630`,
        "frequency": "AM: 630 Khz",
        "callSign": "WUNO AM",
        "rdsText": ["NotiUno 630", "WUNO AM", "630 AM", "San Juan, PR"],
        "fallbackUrls": [
            "https://server20.servistreaming.com:9022/stream?quality=low",
            "https://server20.servistreaming.com:9022/stream?quality=very-low"
        ]
    },
    "Radio Once": {
        "logo": "https://www.radioonce.com/templates/rt_galatea/custom/images/demo/home/header/logo-radio11.png",
        "streamUrl": "http://49.13.212.200:14167/stream?type=http&nocache=21",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=Radio Once`,
        "frequency": "AM: 1120 Khz",
        "callSign": "WMSW AM",
        "rdsText": ["Radio Once", "WMSW AM", "1120 AM", "Hatillo, PR"],
        "fallbackUrls": [
            "http://49.13.212.200:14167/stream?type=http&nocache=21&quality=low"
        ]
    },
    "Radio Isla": {
        "logo": "https://radioIsla.tv/wp-content/uploads/2019/06/Logo-Radio-Isla.png",
        "streamUrl": "https://server7.servistreaming.com/proxy/radioisla?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=Radio Isla`,
        "frequency": "AM: 1320 Khz",
        "callSign": "WSKN AM",
        "rdsText": ["Radio Isla", "WSKN AM", "1320 AM", "San Juan, PR"],
        "fallbackUrls": [
            "https://server7.servistreaming.com/proxy/radioisla?mp=%2Fstream%3Ftype%3D.mp3&_=1&quality=low"
        ]
    },
    "Radio Tiempo": {
        "logo": "https://radiotiempo.net/wp-content/uploads/2022/08/tiempo-172x128.png",
        "streamUrl": "https://server7.servistreaming.com/proxy/tiempo?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=Radio Tiempo`,
        "frequency": "AM: 1430 Khz",
        "callSign": "WNLE AM",
        "rdsText": ["Radio Tiempo", "WNLE AM", "1430 AM", "Caguas, PR"],
        "fallbackUrls": [
            "https://server7.servistreaming.com/proxy/tiempo?mp=%2Fstream%3Ftype%3D.mp3&_=1&quality=low"
        ]
    },
    "Radio Cumbre": {
        "logo": "https://i.ibb.co/5g2402Cc/wkum-png.png",
        "streamUrl": "https://sp.unoredcdn.net/8158/stream/1/",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=Radio Cumbre`,
        "frequency": "AM: 1470 Khz",
        "callSign": "WKUM AM",
        "rdsText": ["Radio Cumbre", "WKUM AM", "1470 AM", "Orocovis, PR"],
        "fallbackUrls": [
            "https://sp.unoredcdn.net/8158/stream/1/?quality=low"
        ]
    },
    "Radio Oro": {
        "logo": "https://cdn-profiles.tunein.com/s21791/images/logod.png?t=637238626060000000",
        "streamUrl": "https://us2.internet-radio.com/proxy/woro?mp=/stream",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=Radio Oro`,
        "frequency": "FM: 92.5 Mhz",
        "callSign": "WORO FM",
        "rdsText": ["Radio Oro", "WORO FM", "92.5 FM", "Corozal, PR"],
        "fallbackUrls": [
            "https://us2.internet-radio.com/proxy/woro?mp=/stream&quality=low"
        ]
    },
    "Z 93": {
        "logo": "https://i.ibb.co/23BMsKBY/wznt-png.png",
        "streamUrl": "https://liveaudio.lamusica.com/PR_WZNT_icy",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=Z 93`,
        "frequency": "FM: 93.7 Mhz",
        "callSign": "WZNT FM",
        "rdsText": ["Z 93", "La Emisora", "Nacional", "De La Salsa", "WZNT FM", "93.7 FM", "San Juan", "Puerto Rico"],
        "fallbackUrls": [
            "https://liveaudio.lamusica.com/PR_WZNT_icy?quality=low"
        ]
    },
    "La Nueva 94": {
        "logo": "https://i.ibb.co/sv1RBc08/wodalogo.png",
        "streamUrl": "https://liveaudio.lamusica.com/PR_WODA_icy",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=La Nueva 94`,
        "frequency": "FM: 94.7 Mhz",
        "callSign": "WODA FM",
        "rdsText": ["La Nueva 94", "Los #1", "En Joda", "WODA FM", "94.7 FM", "San Juan", "Puerto Rico"],
        "fallbackUrls": [
            "https://liveaudio.lamusica.com/PR_WODA_icy?quality=low"
        ]
    },
    "Fidelity": {
        "logo": "https://fidelitypr.com/wp-content/uploads/2022/01/cropped-Redisen%CC%83o-Logo-Fidelity-3-15-2048x677.png",
        "streamUrl": "https://server7.servistreaming.com/proxy/fidelity?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=Fidelity`,
        "frequency": "FM: 95.7 Mhz",
        "callSign": "WFID FM",
        "rdsText": ["Fidelity", "Tu Vida", "En Música", "WFID FM", "95.7 FM", "Rio Piedras", "Puerto Rico"],
        "fallbackUrls": [
            "https://server7.servistreaming.com/proxy/fidelity?mp=%2Fstream%3Ftype%3D.mp3&_=1&quality=low"
        ]
    },
    "Estereotempo": {
        "logo": "https://i.ibb.co/F4GM0W81/wrxr.png",
        "streamUrl": "https://liveaudio.lamusica.com/PR_WRXD_icy",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=Estereotempo`,
        "frequency": "FM: 96.5 Mhz",
        "callSign": "WRXD FM",
        "rdsText": ["Estereotempo", "WRXD FM", "96.5 FM", "San Juan", "Puerto Rico"],
        "fallbackUrls": [
            "https://liveaudio.lamusica.com/PR_WRXD_icy?quality=low"
        ]
    },
    "Magic 97.3": {
        "logo": "https://i.ibb.co/Z6WqXPzV/woye.png",
        "streamUrl": "https://stream.eleden.com:8210/magic.aac",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=Magic 97.3`,
        "frequency": "FM: 97.3 Mhz",
        "callSign": "WOYE FM",
        "rdsText": ["Magic 97.3", "WOYE FM", "97.3 FM", "Rio Grande", "Puerto Rico"],
        "fallbackUrls": [
            "https://stream.eleden.com:8210/magic.aac?quality=low"
        ]
    },
    "SalSoul": {
        "logo": "https://salsoul.com/wp-content/uploads/2020/12/cropped-salsoul-2.png",
        "streamUrl": "https://server20.servistreaming.com:9023/stream?type=.mp3&_=1",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=SalSoul`,
        "frequency": "FM: 99.1 Mhz",
        "callSign": "WPRM FM",
        "rdsText": ["SalSoul", "WPRM FM", "99.1 FM", "San Juan", "Puerto Rico"],
        "fallbackUrls": [
            "https://server20.servistreaming.com:9023/stream?type=.mp3&_=1&quality=low"
        ]
    },
    "La X": {
        "logo": "https://i.ibb.co/zWDcRnBw/laxpng.png",
        "streamUrl": "http://stream.eleden.com:8235/lax.ogg",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=La X`,
        "frequency": "FM: 100.7 Mhz",
        "callSign": "WXYX FM",
        "rdsText": ["La X", "Para", "Los Que Llevan", "La Musica", "Por Dentro", "WXYX FM", "100.7 FM", "Bayamón", "Puerto Rico"],
        "fallbackUrls": [
            "http://stream.eleden.com:8235/lax.ogg?quality=low"
        ]
    },
    "Hot102": {
        "logo": "https://hot102pr.com/wp-content/uploads/2023/10/Artboard-4.png",
        "streamUrl": "https://server7.servistreaming.com/proxy/hot?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=Hot102`,
        "frequency": "FM: 102.5 Mhz",
        "callSign": "WTOK FM",
        "rdsText": ["HOT 102", "WTOK FM", "102.5 FM", "San Juan", "Puerto Rico"],
        "fallbackUrls": [
            "https://server7.servistreaming.com/proxy/hot?mp=%2Fstream%3Ftype%3D.mp3&_=1&quality=low"
        ]
    },
    "KQ105": {
        "logo": "https://upload.wikimedia.org/wikipedia/en/8/80/KQ_105_WKAQ-FM_2014_logo.png",
        "streamUrl": "https://televicentro.streamguys1.com/wkaqfm-icy?key=e018260d508e5b04e91a4d9a30f7ceea9b71bd86e2bfdb6fcc3bbd4928525c00",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=KQ105`,
        "frequency": "FM: 104.7 Mhz",
        "callSign": "WKAQ FM",
        "rdsText": ["KQ 105", "La Primera", "WKAQ FM", "104.7 FM", "San Juan", "Puerto Rico"],
        "fallbackUrls": [
            "https://televicentro.streamguys1.com/wkaqfm-icy?key=e018260d508e5b04e91a4d9a30f7ceea9b71bd86e2bfdb6fcc3bbd4928525c00&quality=low"
        ]
    },
    "La Mega 106.9": {
        "logo": "https://i.ibb.co/Xrp2nhpQ/WMEG-PNG.png",
        "streamUrl": "https://liveaudio.lamusica.com/PR_WMEG_icy",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=La Mega 106.9`,
        "frequency": "FM: 106.9 Mhz",
        "callSign": "WMEG FM",
        "rdsText": ["La Mega 106.9", "WMEG FM", "106.9 FM", "San Juan", "Puerto Rico"],
        "fallbackUrls": [
            "https://liveaudio.lamusica.com/PR_WMEG_icy?quality=low"
        ]
    },
    "Latino 99": {
        "logo": "https://mm.aiircdn.com/371/5928f28889f51.png",
        "streamUrl": "https://lmmradiocast.com/latino99fm",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=Latino 99`,
        "frequency": "Satellite Radio",
        "callSign": null,
        "rdsText": ["Latino 99", "¡Pura", "Salsa!", "Kissimmee,", "Florida"],
        "fallbackUrls": [
            "https://lmmradiocast.com/latino99fm?quality=low"
        ]
    },
    "Salseo": {
        "logo": "https://static.wixstatic.com/media/8dfec0_3e265a2f0fb5417c90c55be4e4e7d3cf~mv2.png/v1/fill/w_276,h_120,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/LOGOSALSEORADIO_clipped_rev_2_v2%20(1).png",
        "streamUrl": "https://listen.radioking.com/radio/399811/stream/452110",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=Salseo`,
        "frequency": "Satellite Radio",
        "callSign": null,
        "rdsText": ["Salseo Radio", "Ponte Al", "Día En", "La Salsa!", "Quebradillas", "Puerto Rico"],
        "fallbackUrls": [
            "https://listen.radioking.com/radio/399811/stream/452110?quality=low"
        ]
    },
    "La Vieja Z": {
        "logo": "https://i.ibb.co/d4VZVjj2/LVZ8-removebg-preview.png",
        "streamUrl": "https://s3.free-shoutcast.com/stream/18094",
        "firebaseProxyUrl": `${FIREBASE_ENDPOINTS.streamProxy}?station=La Vieja Z`,
        "frequency": "Satellite Radio",
        "callSign": null,
        "rdsText": ["La Vieja Z", "Central Florida", "Salsa!"],
        "fallbackUrls": [
            "https://s3.free-shoutcast.com/stream/18094?quality=low"
        ]
    }
};

// App configuration with Firebase features
const APP_CONFIG = {
    // Use Firebase proxy by default
    useFirebaseProxy: true,
    
    // Fallback to direct URLs if Firebase fails
    fallbackToDirect: true,
    
    // Analytics and monitoring
    enableAnalytics: true,
    enableErrorReporting: true,
    
    // Caching strategy
    cacheStrategy: 'network-first', // 'cache-first', 'network-first', 'stale-while-revalidate'
    
    // Retry configuration
    maxRetries: 3,
    retryDelay: 1000,
    
    // Quality preferences
    preferredQuality: 'high', // 'high', 'medium', 'low'
    autoQualitySwitch: true
};

// Enhanced weather configuration with Firebase
const WEATHER_CONFIG = {
    // Use Firebase weather function instead of direct API calls
    useFirebaseWeather: true,
    firebaseWeatherUrl: FIREBASE_ENDPOINTS.weatherProxy,
    firebaseLocationUrl: FIREBASE_ENDPOINTS.locationProxy,
    
    // Fallback to direct API
    fallbackWeatherApi: "https://api.open-meteo.com/v1/forecast",
    fallbackLocationApi: "https://ipapi.co/json/",
    
    // Caching
    weatherCacheDuration: 15 * 60 * 1000, // 15 minutes
    locationCacheDuration: 60 * 60 * 1000 // 1 hour
};

// App Constants
const STATIONS_ORDER = Object.keys(RADIO_STATIONS);
const APP_VERSION = "10.0";
const APP_BUILD_DATE = "2025-01-27";

// Export configurations
window.FIREBASE_CONFIG = FIREBASE_CONFIG;
window.FIREBASE_ENDPOINTS = FIREBASE_ENDPOINTS;
window.RADIO_STATIONS = RADIO_STATIONS;
window.APP_CONFIG = APP_CONFIG;
window.WEATHER_CONFIG = WEATHER_CONFIG;
window.STATIONS_ORDER = STATIONS_ORDER;
window.APP_VERSION = APP_VERSION;
window.APP_BUILD_DATE = APP_BUILD_DATE; 