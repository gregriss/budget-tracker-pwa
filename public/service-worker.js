// console.log("This is your service worker speaking!");

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/styles.css",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
]

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
// const TRANSACTION_CACHE = "transaction-cache-v1";

// install
self.addEventListener("install", (evt) => {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)));

  // return cache.addAll(FILES_TO_CACHE);
  self.skipWaiting();
});
// runs when serviceWorker is first started...
// removes old cache version keys
// (this can stay the same for this assignment)
self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    // caches.keys() returns all keys for cache versions
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
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
self.addEventListener("fetch", (evt) => {
  // cache successful requests to the API
  // console.log(`[Service Worker] Fetched resource ${evt.request.url}`);
  
  // if (evt.request.url.includes("/api/transaction")) {
  //   evt.respondWith(
  //     caches.open(DATA_CACHE_NAME).then(cache => {
  //       return Promise.all(
  //         //fetch each thing inside the cache,
  //         fetch(evt.request)
  //         // then clear it if we are online
  //       )
  //       .then(response => {
  //           // If the response was good, clone it and store it in the cache.
  //           if (response.status === 200) {
  //             // we are online, so clear cache
  //             console.log("We're online; clearing cache now");
  //             caches.delete();
  //             // cache.put(evt.request.url, response.clone());
  //           }
  //           return response;
  //       })
  //       .catch(err => {
  //           // Network request failed, try to get it from the cache.
  //           console.log(err, "Offline");
  //           // we are offline
  //           console.log(evt.request.url);
  //           console.log(evt.request);
  //           // storing a clone of the request in the cache
  //           cache.put(evt.request.url, evt.request.clone());
  //           return cache.match(evt.request);
  //       });
  //     });
  //   )
  // }
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              // we are online
              cache.put(evt.request.url, response.clone());
            }
            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            console.log(err, "Offline");
            // console.log(evt.request.url);
            console.log(evt.request);
            // storing a clone of the request in the cache
            cache.put(evt.request.url, evt.request.clone());
            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }
  // if the request is not for the API, serve static assets using "offline-first" approach.
  // if file not added to cache upon installation, files can be added to cache in this function
  // see https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook#cache-falling-back-to-network
  evt.respondWith(
    caches.match(evt.request).then(response => {
      return response || fetch(evt.request);
    })
  );
});

// // fetch 
// self.addEventListener("fetch", function(evt) {
//     // cache successful requests to the API
//     if (evt.request.url.includes("/api/posts")) {
//       evt.respondWith(
//         caches.open(TRANSACTION_NAME).then(cache => {
//           // return fetch(evt.request)
//           return Promise.all(
//             // fetch each thing inside the cache
//             // thenclear it if we are online
//           );
//             .then(response => {

//               // If the response was good, clone it and store it in the cache.
//               if (response.status === 200) {
//                 // we're online in this case
//                 cache.put(evt.request.url, response.clone());
//               }
//               return response;
//             })
//             .catch(err => {
//               // Network request failed, try to get it from the cache.
//               // we are offline
//               console.log(evt.request.url);
//               console.log(evt.request);
//               cache.put(evt.request.url, evt.request.clone());
//               return cache.match(evt.request);
//             });
//         }).catch(err => console.log(err))
//       );

//       return;
//     }

//     // if the request is not for the API, serve static assets using "offline-first" approach.
//     // if file not added to cache upon installation, files can be added to cache in this function
//     // see https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook#cache-falling-back-to-network
//     evt.respondWith(
//       caches.match(evt.request).then(function(response) {
//         return response || fetch(evt.request);
//       })
//     );
//   });
