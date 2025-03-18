/**
 * Service Worker Registration Script with Server Check
 * Adds offline support and better caching to the website
 * Includes server availability check to prevent issues when server is offline
 */

// Function to check if the server is available with improved retry mechanism
async function isServerAvailable(retries = 5, delay = 2000) {
  console.log(`Starting server availability check with ${retries} retries...`);

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // If this isn't the first attempt, wait before retrying with exponential backoff
      if (attempt > 0) {
        const backoffDelay = delay * Math.pow(1.5, attempt - 1); // Exponential backoff
        console.log(
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
              // If we're within the first 30 seconds of page load, be very lenient
              const pageLoadTime =
                window.performance.timing.navigationStart || Date.now() - 30000;
              const isRecentPageLoad = Date.now() - pageLoadTime < 30000;

              if (isRecentPageLoad) {
                console.log(
                  "Recent page load detected, being lenient with server check"
                );
                return true;
              }

              // Otherwise do a more thorough check
              if (data.status === "online" && data.timestamp) {
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

// Only register if service workers are supported
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    // Add a longer delay before checking server availability to give the server more time to start up
    console.log(
      "Waiting for server to initialize before checking availability..."
    );
    await new Promise((resolve) => setTimeout(resolve, 8000)); // 8 second delay (increased from 3s)

    // Check if server is available before registering service worker (with retries)
    const serverAvailable = await isServerAvailable(5, 2000); // 5 retries, 2 second delay between retries

    if (!serverAvailable) {
      console.log("Server is not available, unregistering service worker...");

      // Unregister any existing service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log("Service worker unregistered due to server unavailability");
      }

      return;
    }

    // Server is available, proceed with registration
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );

        // Check for updates to the service worker
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available - show update notification
              if (
                confirm(
                  "New version of this site is available. Reload to update?"
                )
              ) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });

  // Listen for controlling service worker updates
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  // Handle offline status changes
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);

  function updateOnlineStatus() {
    const offlineNotification = document.getElementById("offline-notification");

    if (!navigator.onLine) {
      // User is offline - display notification if element exists
      if (!offlineNotification) {
        const notification = document.createElement("div");
        notification.id = "offline-notification";
        notification.innerHTML = `
          <div class="fixed bottom-4 left-4 bg-red-600 text-white py-2 px-4 rounded-lg shadow-lg z-50 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span>You're offline. Some features may be unavailable.</span>
          </div>
        `;
        document.body.appendChild(notification);
      }
    } else if (offlineNotification) {
      // User is back online - remove notification
      offlineNotification.remove();
    }
  }

  // Check initial status
  updateOnlineStatus();
}
