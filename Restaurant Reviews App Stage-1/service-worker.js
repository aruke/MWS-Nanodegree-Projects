const _CacheName = "v1";
const _CachedURLs = [
    '/index.html',
    '/css/',
    '/data/',
    '/ico/',
    '/img/',
    '/js/'
];


self.addEventListener('install', event => {
    console.log("SW Installed.");
    event.waitUntil(
        caches.open('v1').then(function (cache) {
            return cache.addAll(_CachedURLs);
        })
    );
});

self.addEventListener('fetch', function (event) {
    console.log(event.request);
    event.respondWith(
        caches.match(event.request)
            .then(function (resp) {
                return resp || fetch(event.request).then(function (response) {
                    let responseClone = response.clone();
                    caches.open(_CacheName).then(function (cache) {
                        cache.put(event.request, responseClone);
                    });

                    return response;
                });
            })
            .catch(function () {
                return caches.match('404.jpg');
            })
    );
});