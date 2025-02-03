// public/sw.js
const CACHE_NAME = 'my-app-cache-v1';
const staticUrlsToCache = [
    '/',
    '/index.html',
    '/pwa-192x192.png',
    '/pwa-512x512.png',
];

async function getManifestAssets() {
    const assets = [];
    try {
        const response = await fetch('manifest.webmanifest');
        const manifest = await response.json();

        if (manifest.start_url) {
            assets.push(manifest.start_url);
        }

        if (Array.isArray(manifest.icons)) {
            manifest.icons.forEach((icon) => {
                if (icon.src) {
                    assets.push(icon.src);
                }
            });
        }
    } catch (error) {
        console.error('Error fetching manifest:', error);
    }
    return assets;
}

const urlsToCachePromise = (async () => {
    const manifestAssets = await getManifestAssets();
    return staticUrlsToCache.concat(manifestAssets);
})();

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
