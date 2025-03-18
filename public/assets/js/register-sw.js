/**
 * Service Worker Registration Script with Server Check
 * Adds offline support and better caching to the website
 * Includes server availability check to prevent issues when server is offline
 */

// Function to check if the server is available
async function isServerAvailable() {
  try {
    // Try to fetch the server-status.json file with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

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
      // Add a random query parameter to prevent caching issues
      const fullResponse = await fetch(`/server-status.json?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (fullResponse.ok) {
        const data = await fullResponse.json();
        // Check if the timestamp is recent (within the last hour)
        const timestamp = new Date(data.timestamp);
        const now = new Date();
        const diffMinutes = (now - timestamp) / (1000 * 60);

        return diffMinutes < 60; // Server is available if timestamp is less than 60 minutes old
      }
    }

    return false;
  } catch (error) {
    console.warn("Server availability check failed:", error);
    return false;
  }
}

// Only register if service workers are supported
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    // Check if server is available before registering service worker
    const serverAvailable = await isServerAvailable();

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
