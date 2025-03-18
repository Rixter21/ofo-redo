/**
 * Service Worker for OFO Development Website
 * Provides offline support and caching for better performance
 * Includes server availability check to prevent issues when server is offline
 * @version 1.1.0
 */

// Cache name - update version when deploying new changes
const CACHE_NAME = "ofo-cache-v1";

// Function to check if the server is available with improved retry mechanism
async function isServerAvailable(retries = 5, delay = 2000) {
  console.log(`Starting server availability check with ${retries} retries...`);

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // If this isn't the first attempt, wait before retrying with exponential backoff
      if (attempt > 0) {
        const backoffDelay = delay * Math.pow(1.5, attempt - 1); // Exponential backoff
        console.warn(
          `Retrying server availability check (attempt ${
            attempt + 1
          }/${retries}) after ${backoffDelay}ms delay...`
        );
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }

      // Try to fetch the server-status.json file with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout (increased from 5s)

      console.log(`Fetching server-status.json (attempt ${attempt + 1})...`);

      // First try a HEAD request to check if the file exists
      const response = await fetch("/server-status.json", {
        method: "HEAD",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`HEAD request successful, fetching full response...`);

        // Add a random query parameter to prevent caching issues
        const fullResponse = await fetch(
          `/server-status.json?t=${Date.now()}`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        );

        if (fullResponse.ok) {
          try {
            const data = await fullResponse.json();
            console.log(`Server status data:`, data);

            // During server startup, we'll be more lenient with our checks
            // Just check if the file exists and has basic structure
            if (data && typeof data === "object") {
              // If we have any kind of status, consider it valid during service worker checks
              if (data.status) {
                console.log("Server availability check passed");
                return true;
              }
            }
          } catch (jsonError) {
            console.warn(`Error parsing server-status.json:`, jsonError);
          }
        }
      }
    } catch (error) {
      console.warn(
        `Server availability check failed (attempt ${attempt + 1}/${retries}):`,
        error
      );
    }
  }

  console.error(`Server availability check failed after ${retries} attempts`);
  return false;
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
      // Use the improved isServerAvailable function with retries
      const serverAvailable = await isServerAvailable(5, 2000); // 5 retries, 2 second delay

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

// Delay the initial server check to give the server more time to start up
setTimeout(() => {
  console.log("Starting server availability check schedule...");
  scheduleServerCheck();
}, 10000); // 10 second delay before first check (increased from 5s)

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
