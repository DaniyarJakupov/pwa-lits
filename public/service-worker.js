/* CACHE Setup */
const CACHE_VERSION = 1;
const CACHE_PREFIX = `CACHE-v${CACHE_VERSION}`;
const ALL_CACHES = {
  static: cacheName("STATIC"), // [STATIC_ASSETS]
  dynamic: cacheName("DYNAMIC"), // [Data from API calls]
  images: cacheName("IMAGES") // [FETCHED IMAGES]
};
const ALL_CACHES_LIST = Object.keys(ALL_CACHES).map(k => ALL_CACHES[k]);
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/fallback.html",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/material.min.js",
  "/src/css/app.css",
  "/src/css/feed.css",
  "/src/images/main-image.jpg",
  "/src/images/sf-boat.jpg",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
  "https://fonts.googleapis.com/icon?family=Material+Icons"
];
const INDEX_HTML_PATH = "/index.html";
const INDEX_HTML_URL = new URL(INDEX_HTML_PATH, self.location).toString();

function cacheName(name) {
  return `${CACHE_PREFIX}-${name}`;
}
/* ===================================================== */
/* 1. 'INSTALL' EVENT LISTENER */
self.addEventListener("install", event => {
  event.waitUntil(
    Promise.all([
      // Fetch STATIC_ASSETS, then populate the static cache
      precacheStaticAssets(STATIC_ASSETS)
    ])
  );
});
/* ===================================================== */
/* 2. 'ACTIVATE' EVENT LISTENER */
self.addEventListener("activate", event => {
  // Delete all caches other than those whose names are provided in a list
  event.waitUntil(removeUnusedCaches(ALL_CACHES_LIST));
});
/* ===================================================== */
/* 3. FETCH EVENT LISTENER */
self.addEventListener("fetch", event => {
  let acceptHeader = event.request.headers.get("accept");
  let requestUrl = new URL(event.request.url);
  //  Check if the client makes an API call to 3rd parties
  let isAPI = requestUrl.origin.indexOf("localhost:8080") == -1;
  // Check if client requests html page
  let isHTMLRequest =
    event.request.headers.get("accept").indexOf("text/html") !== -1;
  let isLocal = new URL(event.request.url).origin === location.origin;
  // Check if the client requests image
  let isImage = acceptHeader.indexOf("image") >= 0;

  /* Implementation of diff cache strategies depending on a client request */
  event.respondWith(
    // Firstly, check static cache [Cache With Network Fallback]
    caches
      .match(event.request, { cacheName: ALL_CACHES.static })
      .then(response => {
        // If assets are found, return them from the cache
        if (response) return response;
        // If client makes API calls to 3rd parties, cache responses (json, etc)
        if (isAPI && event.request.method === "GET" && !isImage) {
          return fetchDynamicData(event);
        } else if (isImage && isAPI) {
          // If client requests image
          return fetchImageOrFallback(event);
        } else {
          return fetch(event.request).catch(() => {
            // If html not found, serve fallback.html
            if (isHTMLRequest && isLocal) {
              return caches.open(ALL_CACHES.static).then(cache => {
                return cache.match("/fallback.html");
              });
            }
          });
        }
      })
  );
});

/* ==================================================================================== */
/* ============================================ HELPER FUNCTIONS ====================== */
function precacheStaticAssets(assets) {
  return caches.open(ALL_CACHES.static).then(cache => {
    cache.addAll(assets);
  });
}

// Cache Then Network Technique
function fetchDynamicData(fetchEvent) {
  // Open dynamic cache, then fetch
  return caches.open(ALL_CACHES.dynamic).then(cache => {
    return fetch(fetchEvent.request)
      .then(response => {
        // Clone the response and put its copy to the cache
        let clonedResponse = response.clone();
        // cache.put() is not fetching again, more efficient than cache.add
        if (response.ok) {
          cache.put(fetchEvent.request, clonedResponse);
        }
        // Resolve Promise with the original response
        return response;
      })
      .catch(() => {
        // IF network fails, serve from the cache
        return cache.match(fetchEvent.request);
      });
  });
}

function fetchImageOrFallback(fetchEvent) {
  // Fetch images
  return fetch(fetchEvent.request, {
    mode: "cors",
    credentials: "omit" // in case CORS wildcard headers are present
  })
    .then(response => {
      // Clone the response
      let clonedResponse = response.clone();
      // IF response without image, get image from static cache
      if (!response.ok) {
        return fetchFallbackImg();
      }
      // Else, cache and resolve promise with the original response
      caches.open(ALL_CACHES.images).then(cache => {
        if (response.ok) {
          cache.put(fetchEvent.request, clonedResponse);
        }
      });
      return response;
    })
    .catch(() => {
      // IF network fails, go to images cache
      return caches
        .match(fetchEvent.request, {
          cacheName: ALL_CACHES.images
        })
        .then(response => {
          return response || fetchFallbackImg(fetchEvent.request);
        });
    });
}

function fetchFallbackImg() {
  return caches.open(ALL_CACHES.static).then(cache => {
    return cache.match("/src/images/sf-boat.jpg");
  });
}

/**
 * Delete all caches other than those whose names are
 * provided in a list
 *
 * @public
 * @param {string[]} cacheNamesToKeep names of caches to keep
 * @return {Promise}
 */
function removeUnusedCaches(cacheNamesToKeep) {
  return caches.keys().then(cacheNames => {
    let toDelete = cacheNames.reduce((list, thisCache) => {
      if (cacheNamesToKeep.indexOf(thisCache) === -1)
        return list.concat(thisCache);
      return list;
    }, []);
    if (toDelete.length > 0) {
      console.log("SW: Deleting old caches", toDelete);
      return Promise.all(toDelete.map(c => caches.delete(c)));
    } else {
      return Promise.resolve();
    }
  });
}
