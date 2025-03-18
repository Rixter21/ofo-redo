/**
 * Service Worker for OFO Development Website
 * Provides offline support and caching for better performance
 * Includes server availability check to prevent issues when server is offline
 * @version 1.1.0
 */

// Cache name - update version when deploying new changes
const CACHE_NAME = "ofo-cache-v1";

// Function to check if the server is available
async function isServerAvailable() {
  try {
    // Try to fetch the server-status.json file
    const response = await fetch("/server-status.json", {
      method: "HEAD",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
    return response.ok;
  } catch (error) {
    console.warn("Server availability check failed:", error);
    return false;
  }
}

// Periodically check if the server is available
// If not, unregister the service worker
// Increased interval to reduce server load
const SERVER_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes
let checkServerTimeout;

// Function to schedule the next check
function scheduleServerCheck() {
  // Clear any existing timeout
  if (checkServerTimeout) {
    clearTimeout(checkServerTimeout);
  }

  // Set a new timeout
  checkServerTimeout = setTimeout(async () => {
    try {
      const serverAvailable = await isServerAvailable();
      if (!serverAvailable) {
        console.log("Server is not available, unregistering service worker...");
        await self.registration.unregister();
        console.log("Service worker unregistered due to server unavailability");
      } else {
        // Schedule the next check only if the server is available
        scheduleServerCheck();
      }
    } catch (error) {
      console.error("Error checking server availability:", error);
      // Still schedule the next check even if there was an error
      scheduleServerCheck();
    }
  }, SERVER_CHECK_INTERVAL);
}

// Start the server check schedule
scheduleServerCheck();

// Resources to cache on install
const PRECACHE_RESOURCES = [
  "/",
  "/index.html",
  "/assets/css/output.min.css",
  "/assets/css/styles.css",
  "/assets/js/main.js",
  "/assets/images/logos/Color logo - no background.webp",
  "/assets/images/logos/White logo - no background.webp",
  // Add other critical resources here
];

// Resources to cache when accessed
const RUNTIME_CACHE_PATTERNS = [
  /\.(?:html)$/, // All HTML files
  /\.(?:css|js)$/, // All CSS and JS files
  /\.(?:webp|png|jpg|jpeg|svg|gif)$/, // All image files
  /\.(?:woff|woff2|ttf|otf)$/, // All font files
];

// Resources to exclude from caching
const EXCLUDE_PATTERNS = [
  /\/contact.html$/, // Don't cache form submissions
  /\/api\//, // Don't cache API requests
];

// Install event - cache core resources
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Pre-caching resources");
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .catch((error) => {
        console.error("Pre-caching failed:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName.startsWith("ofo-cache-") && cacheName !== CACHE_NAME
              );
            })
            .map((cacheName) => {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log("Service Worker active, cache version:", CACHE_NAME);
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network with caching
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip excluded patterns
  if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(event.request.url))) {
    return;
  }

  // For HTML navigation requests - network-first with cache fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the response
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse);
            });
          }
          return response;
        })
        .catch((error) => {
          console.log("Navigation fetch failed, falling back to cache", error);
          return caches.match(event.request);
        })
    );
    return;
  }

  // Standard resources - cache-first with network fallback
  if (
    RUNTIME_CACHE_PATTERNS.some((pattern) => pattern.test(event.request.url))
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached response
          return cachedResponse;
        }

        // Fetch from network
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response.ok) {
            return response;
          }

          // Cache the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
    );
    return;
  }

  // For other requests, just fetch from network
  event.respondWith(fetch(event.request));
});

// Message event - handle client messages
self.addEventListener("message", (event) => {
  if (event.data && event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
