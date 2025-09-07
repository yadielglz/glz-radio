// PWA (Progressive Web App) Functionality

class PWA {
    constructor() {
        this.deferredPrompt = null;
        this.isOnline = navigator.onLine;
        this.updateAvailable = false;
        this.registration = null;
        this.notificationPermission = 'default';
        
        this.init();
    }

    async init() {
        await this.registerServiceWorker();
        this.setupEventListeners();
        this.checkInstallability();
        this.updateOnlineStatus();
        this.requestNotificationPermission();
        this.setupMediaSession();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully:', this.registration);

                // Check for updates
                this.registration.addEventListener('updatefound', () => {
                    const newWorker = this.registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdatePrompt();
                        }
                    });
                });

                // Handle service worker messages
                navigator.serviceWorker.addEventListener('message', (event) => {
                    if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
                        this.showUpdatePrompt();
                    }
                });

            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    setupEventListeners() {
        // Install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        // Online/offline status
        window.addEventListener('online', () => this.updateOnlineStatus());
        window.addEventListener('offline', () => this.updateOnlineStatus());

        // Install button
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.addEventListener('click', () => this.installApp());
        }

        // Dismiss install prompt
        const dismissBtn = document.getElementById('pwa-dismiss-btn');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => this.hideInstallPrompt());
        }

        // Update indicator
        const updateIndicator = document.getElementById('update-indicator');
        if (updateIndicator) {
            updateIndicator.addEventListener('click', () => this.updateApp());
        }

        // Handle app shortcuts
        this.handleAppShortcuts();

        // Handle visibility changes for background behavior
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Handle page unload
        window.addEventListener('beforeunload', () => {
            this.handlePageUnload();
        });
    }

    checkInstallability() {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            console.log('App is already installed');
            return;
        }

        // Check if install prompt is available
        if (this.deferredPrompt) {
            this.showInstallPrompt();
        }
    }

    showInstallPrompt() {
        const prompt = document.getElementById('pwa-install-prompt');
        if (prompt && this.deferredPrompt) {
            prompt.classList.remove('hidden');
            prompt.style.animation = 'slideInDown 0.3s ease-out';
        }
    }

    hideInstallPrompt() {
        const prompt = document.getElementById('pwa-install-prompt');
        if (prompt) {
            prompt.style.animation = 'slideOutUp 0.3s ease-out';
            setTimeout(() => {
                prompt.classList.add('hidden');
            }, 300);
        }
    }

    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
                this.hideInstallPrompt();
                this.showNotification('App Installed!', {
                    body: 'GLZ Radio has been added to your home screen.',
                    icon: '/images/generic-station-logo.svg'
                });
            } else {
                console.log('User dismissed the install prompt');
            }
            
            this.deferredPrompt = null;
        }
    }

    showUpdatePrompt() {
        this.updateAvailable = true;
        const indicator = document.getElementById('update-indicator');
        if (indicator) {
            indicator.classList.remove('hidden');
            indicator.style.animation = 'slideInDown 0.3s ease-out';
        }
    }

    async updateApp() {
        if (this.registration && this.registration.waiting) {
            // Send message to service worker to skip waiting
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            
            // Reload the page when the new service worker takes over
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    }

    updateOnlineStatus() {
        this.isOnline = navigator.onLine;
        const indicator = document.getElementById('offline-indicator');
        
        if (indicator) {
            if (!this.isOnline) {
                indicator.classList.remove('hidden');
                indicator.style.animation = 'slideInDown 0.3s ease-out';
                this.showNotification('You\'re Offline', {
                    body: 'Some features may be limited while offline.',
                    icon: '/images/generic-station-logo.svg'
                });
            } else {
                indicator.style.animation = 'slideOutUp 0.3s ease-out';
                setTimeout(() => {
                    indicator.classList.add('hidden');
                }, 300);
            }
        }

        // Update status bar
        if (window.ui && window.ui.updateStatusBar) {
            window.ui.updateStatusBar();
        }
    }

    handleAppShortcuts() {
        // Handle URL parameters for app shortcuts
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        
        if (action) {
            switch (action) {
                case 'random':
                    // Play random station
                    setTimeout(() => {
                        if (window.player && window.player.selectRandomStation) {
                            window.player.selectRandomStation();
                        }
                    }, 1000);
                    break;
                case 'favorites':
                    // Show favorites (if implemented)
                    setTimeout(() => {
                        if (typeof showFavorites === 'function') {
                            showFavorites();
                        }
                    }, 1000);
                    break;
            }
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            console.log('App is now in background');
            // Pause any non-essential operations
        } else {
            console.log('App is now in foreground');
            // Resume operations
            this.checkForUpdates();
        }
    }

    handlePageUnload() {
        // Save any pending data
        if (window.state && window.state.currentStation) {
            localStorage.setItem('glz-radio-last-station', JSON.stringify(window.state.currentStation));
        }
    }

    // Request notification permission
    async requestNotificationPermission() {
        if ('Notification' in window) {
            this.notificationPermission = await Notification.requestPermission();
            console.log('Notification permission:', this.notificationPermission);
            return this.notificationPermission === 'granted';
        }
        return false;
    }

    // Show notification
    showNotification(title, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/images/generic-station-logo.svg',
                badge: '/images/generic-station-logo.svg',
                vibrate: [100, 50, 100],
                requireInteraction: false,
                ...options
            });

            notification.addEventListener('click', () => {
                window.focus();
                notification.close();
            });

            // Auto-close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);

            return notification;
        }
    }

    // Setup Media Session API
    setupMediaSession() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => {
                if (window.player && window.player.play) {
                    window.player.play();
                }
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                if (window.player && window.player.pause) {
                    window.player.pause();
                }
            });

            navigator.mediaSession.setActionHandler('stop', () => {
                if (window.player && window.player.stop) {
                    window.player.stop();
                }
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                if (window.player && window.player.previousStation) {
                    window.player.previousStation();
                }
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                if (window.player && window.player.nextStation) {
                    window.player.nextStation();
                }
            });
        }
    }

    // Update Media Session metadata
    updateMediaSession(station) {
        if ('mediaSession' in navigator && station) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: station.name,
                artist: station.callSign || 'Puerto Rican Radio',
                album: station.frequency,
                artwork: [
                    { src: station.logo, sizes: '96x96', type: 'image/png' },
                    { src: station.logo, sizes: '128x128', type: 'image/png' },
                    { src: station.logo, sizes: '192x192', type: 'image/png' },
                    { src: station.logo, sizes: '256x256', type: 'image/png' },
                    { src: station.logo, sizes: '384x384', type: 'image/png' },
                    { src: station.logo, sizes: '512x512', type: 'image/png' }
                ]
            });
        }
    }

    // Get app version
    async getAppVersion() {
        if (this.registration && this.registration.active) {
            return new Promise((resolve) => {
                const channel = new MessageChannel();
                channel.port1.onmessage = (event) => {
                    resolve(event.data.version);
                };
                this.registration.active.postMessage(
                    { type: 'GET_VERSION' },
                    [channel.port2]
                );
            });
        }
        return 'unknown';
    }

    // Check for app updates
    async checkForUpdates() {
        if (this.registration && this.registration.updateViaCache) {
            try {
                await this.registration.update();
            } catch (error) {
                console.error('Error checking for updates:', error);
            }
        }
    }

    // Register background sync
    async registerBackgroundSync(tag = 'background-sync') {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register(tag);
                console.log('Background sync registered:', tag);
            } catch (error) {
                console.error('Background sync registration failed:', error);
            }
        }
    }

    // Share API integration
    async shareContent(station) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Listening to ${station.name}`,
                    text: `Check out ${station.name} on GLZ Radio!`,
                    url: window.location.href
                });
            } catch (error) {
                console.log('Share cancelled or failed:', error);
            }
        } else {
            // Fallback to clipboard
            const shareText = `Listening to ${station.name} on GLZ Radio! ${window.location.href}`;
            await navigator.clipboard.writeText(shareText);
            this.showNotification('Link Copied!', {
                body: 'Station link copied to clipboard'
            });
        }
    }

    // Periodic sync for background updates
    async registerPeriodicSync() {
        if ('serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.periodicSync.register('weather-update', {
                    minInterval: 15 * 60 * 1000 // 15 minutes
                });
                console.log('Periodic sync registered for weather updates');
            } catch (error) {
                console.error('Periodic sync registration failed:', error);
            }
        }
    }
}

// Initialize PWA and make it globally available
window.pwa = new PWA();

// Export for use in other modules
window.PWA = PWA;