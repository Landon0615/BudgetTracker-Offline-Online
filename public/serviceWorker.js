const FILES_TO_CACHE = [
    '/',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/db.js',
    '/index.html',
    '/index.js',
    '/manifest.json',
    '/serviceWorker.js',
    '/styles.css',
];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

self.addEventListener('install', function (evt) {
    evt.waitUntil(caches.open(CACHE_NAME).then(cache => {
            console.log('Your files pre-cached successfully');
            return cache.addAll(FILES_TO_CACHE);
    }));
});

self.addEventListener('activate', function (evt) {
    evt.waitUntil(caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Delete past cache', key);
                        return caches.delete(key);
                    }
            }))
    }));
    self.clients.claim();
});
self.addEventListener('fetch', function (evt) {
    if (evt.request.url.includes('/api')) {
        evt.respondWith(caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request).then(response => {
                    if (response.status === 200) {
                        cache.put(evt.request.url, response.clone());
                    }
                    return response;
                }).catch(evt => {
                    return cache.match(evt.request);
                });
            }).catch((e) => console.log(e))
        );
        return;
    }
    evt.respondWith(caches.open(CACHE_NAME).then(cache => {
        return cache.match(evt.request).then(response => {
            return response || fetch(evt.request);
        });
    }));
});