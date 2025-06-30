// Firebase Functions Example for CORS Proxy
const functions = require('firebase-functions');
const fetch = require('node-fetch');

// CORS proxy for radio streams
exports.radioStreamProxy = functions.https.onRequest(async (req, res) => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).send('');
        return;
    }
    
    const { station } = req.query;
    
    if (!station) {
        res.status(400).json({ error: 'Station parameter required' });
        return;
    }
    
    try {
        // Get the original stream URL from your config
        const streamUrls = {
            'WKAQ 580': 'https://tunein.cdnstream1.com/4851_128.mp3',
            'NOTIUNO 630': 'https://server20.servistreaming.com:9022/stream',
            'Radio Once': 'http://49.13.212.200:14167/stream?type=http&nocache=21',
            // Add all your stations here
        };
        
        const originalUrl = streamUrls[station];
        if (!originalUrl) {
            res.status(404).json({ error: 'Station not found' });
            return;
        }
        
        // Fetch the stream and pipe it through
        const streamResponse = await fetch(originalUrl);
        
        // Forward the content type and other headers
        res.set('Content-Type', streamResponse.headers.get('content-type') || 'audio/mpeg');
        res.set('Cache-Control', 'no-cache');
        
        // Pipe the stream
        streamResponse.body.pipe(res);
        
    } catch (error) {
        console.error('Stream proxy error:', error);
        res.status(500).json({ error: 'Failed to proxy stream' });
    }
});

// Enhanced version with caching and fallbacks
exports.enhancedRadioProxy = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).send('');
        return;
    }
    
    const { station } = req.query;
    
    if (!station) {
        res.status(400).json({ error: 'Station parameter required' });
        return;
    }
    
    try {
        // Get station config with fallback URLs
        const stationConfig = {
            'WKAQ 580': {
                primary: 'https://tunein.cdnstream1.com/4851_128.mp3',
                fallback: 'https://tunein.cdnstream1.com/4851_64.mp3'
            },
            'NOTIUNO 630': {
                primary: 'https://server20.servistreaming.com:9022/stream',
                fallback: 'https://server20.servistreaming.com:9022/stream?quality=low'
            }
            // Add all stations with fallbacks
        };
        
        const config = stationConfig[station];
        if (!config) {
            res.status(404).json({ error: 'Station not found' });
            return;
        }
        
        // Try primary URL first, then fallback
        let streamResponse;
        try {
            streamResponse = await fetch(config.primary, { timeout: 5000 });
        } catch (error) {
            console.log(`Primary stream failed for ${station}, trying fallback`);
            streamResponse = await fetch(config.fallback, { timeout: 5000 });
        }
        
        if (!streamResponse.ok) {
            throw new Error(`Stream responded with ${streamResponse.status}`);
        }
        
        // Set appropriate headers
        res.set('Content-Type', streamResponse.headers.get('content-type') || 'audio/mpeg');
        res.set('Cache-Control', 'no-cache');
        res.set('X-Station', station);
        
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