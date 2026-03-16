const CACHE_NAME = 'yacht-party-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './app-v5.js'
];

// Install event: Cache our game files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Fetch event: Serve from cache if offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});