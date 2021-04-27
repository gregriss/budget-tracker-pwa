// console.log("This is your service worker speaking!");

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/styles.css",
  "/manifest.webmanifest",
  "/assets/icons/icon-192x192.png",
  "/assets/icons/icon-512x512.png"
]

const STATIC_CACHE = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
// const TRANSACTION_CACHE = "transaction-cache-v1";

// installs service worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});
// runs when serviceWorker is first started...
// removes old cache version keys
// (this can stay the same for this assignment)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    // caches.keys() returns all keys for cache versions
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== STATIC_CACHE && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// fetch
self.addEventListener("fetch", (event) => {
  // successful API requests are cached
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              // we are online
              cache.put(event.request.url, response.clone());
            }
            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            console.log(err, "Offline");
            // // console.log(evt.request.url);
            // console.log(event.request);
            // // storing a clone of the request in the cache
            // cache.put(event.request.url, event.request.clone());
            return cache.match(event.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }
  // if the request is not for the API, serve static assets using "offline-first" approach.
  // if file not added to cache upon installation, files can be added to cache in this function
  // see https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook#cache-falling-back-to-network
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

