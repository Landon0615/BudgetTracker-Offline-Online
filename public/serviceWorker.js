const FILES_TO_CACHE = [
    '/',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/db.js',
    '/index.html',
    '/index.js',
    '/manifest.json',
    '/serviceWorker.js',
];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

self.addEventListener('install', function (event) {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
            console.log('Files pre-cached successfully');
            return cache.addAll(FILES_TO_CACHE);
    }));
});
self.addEventListener('activate', function (event) {
    event.waitUntil(caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Removing old cache', key);
                        return caches.delete(key);
                    }
            }))
    }));
    self.clients.claim();
});
self.addEventListener('fetch', function (event) {
    if (event.request.url.includes('/api')) {
        event.respondWith(caches.open(DATA_CACHE_NAME).then((cache) => {
                return fetch(event.request).then((response) => {
                    if (response.status === 200) {
                        cache.put(event.request.url, response.clone());
                    }
                    return response;
                }).catch((e) => {
                    returncache.match(event.request);
                });
            }).catch((e) => console.log(e))
        );
        return;
    }
    event.respondWith(caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then(response => {
            return response || fetch(event.request);
        });
    }));
});