const functions = require('firebase-functions');
const fetch = require('node-fetch');
const cors = require('cors')({ origin: true });

// Radio station configurations
const RADIO_STATIONS = {
    "WKAQ 580": {
        primary: "https://tunein.cdnstream1.com/4851_128.mp3",
        fallback: "https://tunein.cdnstream1.com/4851_64.mp3"
    },
    "NOTIUNO 630": {
        primary: "https://server20.servistreaming.com:9022/stream",
        fallback: "https://server20.servistreaming.com:9022/stream?quality=low"
    },
    "Radio Once": {
        primary: "http://49.13.212.200:14167/stream?type=http&nocache=21",
        fallback: "http://49.13.212.200:14167/stream?type=http&nocache=21&quality=low"
    },
    "Radio Isla": {
        primary: "https://server7.servistreaming.com/proxy/radioisla?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        fallback: "https://server7.servistreaming.com/proxy/radioisla?mp=%2Fstream%3Ftype%3D.mp3&_=1&quality=low"
    },
    "Radio Tiempo": {
        primary: "https://server7.servistreaming.com/proxy/tiempo?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        fallback: "https://server7.servistreaming.com/proxy/tiempo?mp=%2Fstream%3Ftype%3D.mp3&_=1&quality=low"
    },
    "Radio Cumbre": {
        primary: "https://sp.unoredcdn.net/8158/stream/1/",
        fallback: "https://sp.unoredcdn.net/8158/stream/1/?quality=low"
    },
    "Radio Oro": {
        primary: "https://us2.internet-radio.com/proxy/woro?mp=/stream",
        fallback: "https://us2.internet-radio.com/proxy/woro?mp=/stream&quality=low"
    },
    "Z 93": {
        primary: "https://liveaudio.lamusica.com/PR_WZNT_icy",
        fallback: "https://liveaudio.lamusica.com/PR_WZNT_icy?quality=low"
    },
    "La Nueva 94": {
        primary: "https://liveaudio.lamusica.com/PR_WODA_icy",
        fallback: "https://liveaudio.lamusica.com/PR_WODA_icy?quality=low"
    },
    "Fidelity": {
        primary: "https://server7.servistreaming.com/proxy/fidelity?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        fallback: "https://server7.servistreaming.com/proxy/fidelity?mp=%2Fstream%3Ftype%3D.mp3&_=1&quality=low"
    },
    "Estereotempo": {
        primary: "https://liveaudio.lamusica.com/PR_WRXD_icy",
        fallback: "https://liveaudio.lamusica.com/PR_WRXD_icy?quality=low"
    },
    "Magic 97.3": {
        primary: "https://stream.eleden.com:8210/magic.aac",
        fallback: "https://stream.eleden.com:8210/magic.aac?quality=low"
    },
    "SalSoul": {
        primary: "https://server20.servistreaming.com:9023/stream?type=.mp3&_=1",
        fallback: "https://server20.servistreaming.com:9023/stream?type=.mp3&_=1&quality=low"
    },
    "La X": {
        primary: "http://stream.eleden.com:8235/lax.ogg",
        fallback: "http://stream.eleden.com:8235/lax.ogg?quality=low"
    },
    "Hot102": {
        primary: "https://server7.servistreaming.com/proxy/hot?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        fallback: "https://server7.servistreaming.com/proxy/hot?mp=%2Fstream%3Ftype%3D.mp3&_=1&quality=low"
    },
    "KQ105": {
        primary: "https://televicentro.streamguys1.com/wkaqfm-icy?key=e018260d508e5b04e91a4d9a30f7ceea9b71bd86e2bfdb6fcc3bbd4928525c00",
        fallback: "https://televicentro.streamguys1.com/wkaqfm-icy?key=e018260d508e5b04e91a4d9a30f7ceea9b71bd86e2bfdb6fcc3bbd4928525c00&quality=low"
    },
    "La Mega 106.9": {
        primary: "https://liveaudio.lamusica.com/PR_WMEG_icy",
        fallback: "https://liveaudio.lamusica.com/PR_WMEG_icy?quality=low"
    },
    "Latino 99": {
        primary: "https://lmmradiocast.com/latino99fm",
        fallback: "https://lmmradiocast.com/latino99fm?quality=low"
    },
    "Salseo": {
        primary: "https://listen.radioking.com/radio/399811/stream/452110",
        fallback: "https://listen.radioking.com/radio/399811/stream/452110?quality=low"
    },
    "La Vieja Z": {
        primary: "https://s3.free-shoutcast.com/stream/18094",
        fallback: "https://s3.free-shoutcast.com/stream/18094?quality=low"
    }
};

// Enhanced radio stream proxy with fallback support
exports.radioStreamProxy = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        const { station } = req.query;
        
        if (!station) {
            res.status(400).json({ error: 'Station parameter required' });
            return;
        }
        
        const stationConfig = RADIO_STATIONS[station];
        if (!stationConfig) {
            res.status(404).json({ error: 'Station not found' });
            return;
        }
        
        try {
            // Try primary URL first
            let streamResponse;
            try {
                streamResponse = await fetch(stationConfig.primary, { 
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'GLZ-Radio/1.0'
                    }
                });
            } catch (error) {
                console.log(`Primary stream failed for ${station}, trying fallback`);
                streamResponse = await fetch(stationConfig.fallback, { 
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'GLZ-Radio/1.0'
                    }
                });
            }
            
            if (!streamResponse.ok) {
                throw new Error(`Stream responded with ${streamResponse.status}`);
            }
            
            // Set appropriate headers
            res.set('Content-Type', streamResponse.headers.get('content-type') || 'audio/mpeg');
            res.set('Cache-Control', 'no-cache');
            res.set('X-Station', station);
            res.set('X-Proxy-Source', 'firebase-functions');
            
            // Pipe the stream
            streamResponse.body.pipe(res);
            
        } catch (error) {
            console.error(`Stream proxy error for ${station}:`, error);
            res.status(500).json({ 
                error: 'Failed to proxy stream',
                station: station,
                timestamp: new Date().toISOString()
            });
        }
    });
});

// Weather proxy function
exports.weatherProxy = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        const { lat, lon } = req.query;
        
        if (!lat || !lon) {
            res.status(400).json({ error: 'Latitude and longitude required' });
            return;
        }
        
        try {
            const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
            );
            
            if (!weatherResponse.ok) {
                throw new Error(`Weather API responded with ${weatherResponse.status}`);
            }
            
            const weatherData = await weatherResponse.json();
            
            res.set('Cache-Control', 'public, max-age=900'); // Cache for 15 minutes
            res.json(weatherData);
            
        } catch (error) {
            console.error('Weather proxy error:', error);
            res.status(500).json({ 
                error: 'Failed to fetch weather',
                timestamp: new Date().toISOString()
            });
        }
    });
});

// IP location proxy function
exports.locationProxy = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        try {
            const locationResponse = await fetch('https://ipapi.co/json/');
            
            if (!locationResponse.ok) {
                throw new Error(`Location API responded with ${locationResponse.status}`);
            }
            
            const locationData = await locationResponse.json();
            
            res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
            res.json(locationData);
            
        } catch (error) {
            console.error('Location proxy error:', error);
            res.status(500).json({ 
                error: 'Failed to fetch location',
                timestamp: new Date().toISOString()
            });
        }
    });
});

// Analytics function for tracking usage
exports.analytics = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        const { event, station, data } = req.body;
        
        if (!event) {
            res.status(400).json({ error: 'Event type required' });
            return;
        }
        
        try {
            // Log analytics data (you can extend this to store in Firestore)
            console.log('Analytics Event:', {
                event,
                station,
                data,
                timestamp: new Date().toISOString(),
                userAgent: req.headers['user-agent'],
                ip: req.ip
            });
            
            res.json({ success: true, timestamp: new Date().toISOString() });
            
        } catch (error) {
            console.error('Analytics error:', error);
            res.status(500).json({ error: 'Failed to log analytics' });
        }
    });
});

// Health check function
exports.health = functions.https.onRequest(async (req, res) => {
    return cors(req, res, async () => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            functions: Object.keys(RADIO_STATIONS),
            version: '1.0.0'
        });
    });
}); 