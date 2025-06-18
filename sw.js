const CACHE_NAME = 'glz-radio-v1.0.0';
const STATIC_CACHE = 'glz-radio-static-v1.0.0';
const DYNAMIC_CACHE = 'glz-radio-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/config.js',
    '/js/utils.js',
    '/js/dom.js',
    '/js/state.js',
    '/js/player.js',
    '/js/tuner.js',
    '/js/weather.js',
    '/js/ui.js',
    '/js/app.js',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Segoe+UI+Mono&display=swap',
    'https://unpkg.com/lucide@latest'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Error caching static files', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle different types of requests
    if (url.origin === location.origin) {
        // Same-origin requests
        event.respondWith(handleSameOriginRequest(request));
    } else if (url.origin.includes('api.open-meteo.com')) {
        // Weather API requests
        event.respondWith(handleWeatherRequest(request));
    } else if (url.origin.includes('ipapi.co')) {
        // IP location API requests
        event.respondWith(handleIPLocationRequest(request));
    } else {
        // External requests (CDNs, etc.)
        event.respondWith(handleExternalRequest(request));
    }
});

// Handle same-origin requests
async function handleSameOriginRequest(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Try network
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Service Worker: Error handling same-origin request', error);
        // Return offline page or fallback
        return new Response('Offline - Please check your connection', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Handle weather API requests with caching
async function handleWeatherRequest(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            // Return cached response but update in background
            fetch(request).then(response => {
                if (response.ok) {
                    caches.open(DYNAMIC_CACHE).then(cache => {
                        cache.put(request, response);
                    });
                }
            }).catch(() => {
                // Ignore background update errors
            });
            return cachedResponse;
        }

        // Try network
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Service Worker: Error handling weather request', error);
        return new Response(JSON.stringify({
            current_weather: {
                temperature: 25,
                weathercode: 0
            }
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle IP location API requests
async function handleIPLocationRequest(request) {
    try {
        // Try cache first (IP location doesn't change often)
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Try network
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Service Worker: Error handling IP location request', error);
        // Return default location (San Juan, PR)
        return new Response(JSON.stringify({
            latitude: 18.22,
            longitude: -66.59
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle external requests (CDNs, etc.)
async function handleExternalRequest(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Try network
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Service Worker: Error handling external request', error);
        // For external resources, we can't provide fallbacks
        throw error;
    }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Handle background sync
async function doBackgroundSync() {
    try {
        // Sync any pending data when connection is restored
        console.log('Service Worker: Performing background sync');
        
        // You can add specific sync logic here
        // For example, syncing favorite stations, play history, etc.
        
    } catch (error) {
        console.error('Service Worker: Background sync failed', error);
    }
}

// Handle push notifications
self.addEventListener('push', event => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New content available!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Open App',
                icon: '/icons/icon-96x96.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icons/icon-96x96.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Glz Radio', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Handle message events from main thread
self.addEventListener('message', event => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
}); 