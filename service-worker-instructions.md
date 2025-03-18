# Service Worker Management Instructions

## Current Issue

The service worker is still serving cached content even after the server has been shut down. This happens because:

1. The service worker is registered in these HTML files:

   - WebDevelopment.html
   - resources.html
   - blog.html

2. Once registered, the service worker continues to intercept network requests and serve cached content even when the server is offline.

3. Pages like contact.html that are excluded from caching in the service worker configuration will fail to load when the server is offline.

## How to Fix the Current Issue

### Method 1: Using Browser Developer Tools (Recommended)

Since the server is shut down, the most reliable way to unregister the service worker is using your browser's developer tools:

1. Open your browser and navigate to any page where you previously accessed the website (e.g., http://localhost:3000)
2. Open the browser's developer tools:
   - Chrome/Edge: Press F12 or right-click and select "Inspect"
   - Firefox: Press F12 or right-click and select "Inspect Element"
   - Safari: Enable Developer Tools in Preferences > Advanced, then press Command+Option+I
3. Go to the "Application" tab (Chrome/Edge) or "Storage" tab (Firefox)
4. In the sidebar, select "Service Workers"
5. You should see the service worker for your site listed
6. Click the "Unregister" button next to the service worker
7. Next, clear the cache:
   - In the same sidebar, select "Clear Storage" (Chrome/Edge) or "Clear Data" (Firefox)
   - Check all options, especially "Cache Storage" and "Application Cache"
   - Click "Clear site data" button

### Method 2: Using the Provided Utility (Requires Server)

The unregister-sw.html utility we created cannot be used directly from the file system because browsers restrict service worker operations in this context for security reasons. If you restart your server, you can use this utility:

1. Start your server again temporarily
2. Navigate to http://localhost:3000/unregister-sw.html
3. The page will automatically check for registered service workers
4. Click the "Unregister Service Worker" button to unregister any active service workers
5. Click the "Clear Cache" button to clear any cached content
6. You can then shut down the server again

## Preventing This Issue in the Future

When you restart your server, consider implementing one of these solutions:

### Option 1: Add a Service Worker Lifecycle Management UI

Add a small UI component to your website that allows users to:

- Check the status of the service worker
- Update the service worker when a new version is available
- Unregister the service worker when needed

### Option 2: Modify the register-sw.js Script

Update the register-sw.js script to include a check for server availability:

```javascript
/**
 * Service Worker Registration Script with Server Check
 */

// Function to check if the server is available
async function isServerAvailable() {
  try {
    // Try to fetch a small file from the server
    const response = await fetch("/server-status.json", {
      method: "HEAD",
      cache: "no-store",
    });
    return response.ok;
  } catch (error) {
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

  // Rest of the existing code...
}
```

### Option 3: Create a server-status.json File

Create a small server-status.json file that is only served when the server is running:

```json
{
  "status": "online",
  "timestamp": "auto-generated-timestamp"
}
```

Then modify your service worker to check this file periodically and unregister itself if the server is not available.

### Option 4: Remove Service Worker from Development Environment

If you're only using the service worker for production, consider not including it in your development environment. You can do this by:

1. Moving the register-sw.js script to a separate directory
2. Only including it in production builds
3. Using environment variables to conditionally include the script

## Files That Include the Service Worker Registration

The following files include the service worker registration script:

- public/WebDevelopment.html
- public/resources.html
- public/blog.html

When you restart your server, you may want to remove the service worker registration from these files if you don't need offline functionality during development.
