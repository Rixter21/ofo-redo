/**
 * Service Worker Update Script for OFO Development Website
 * This script updates the service worker cache configuration for production
 */

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const glob = require("glob");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const globPromise = promisify(glob);

// Root directory
const rootDir = path.join(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const serviceWorkerPath = path.join(publicDir, "service-worker.js");

// Function to find critical assets
async function findCriticalAssets() {
  console.log("Finding critical assets...");

  // HTML files
  const htmlFiles = await globPromise("**/*.html", { cwd: publicDir });
  console.log(`Found ${htmlFiles.length} HTML files`);

  // CSS files (only minified)
  const cssFiles = await globPromise("assets/css/**/*.min.css", {
    cwd: publicDir,
  });
  console.log(`Found ${cssFiles.length} CSS files`);

  // JavaScript files (only minified)
  const jsFiles = await globPromise("assets/js/**/*.min.js", {
    cwd: publicDir,
  });
  console.log(`Found ${jsFiles.length} JavaScript files`);

  // Logo and favicon
  const logoFiles = await globPromise(
    "assets/images/logos/**/*.{webp,png,svg}",
    { cwd: publicDir }
  );
  console.log(`Found ${logoFiles.length} logo files`);

  // Critical images
  const criticalImages = [
    // Add specific critical images here
    "assets/images/logos/Color logo - no background.webp",
    "assets/images/logos/White logo - no background.webp",
  ];

  // Combine all critical assets
  const criticalAssets = [
    "/",
    ...htmlFiles.map((file) => `/${file}`),
    ...cssFiles.map((file) => `/${file}`),
    ...jsFiles.map((file) => `/${file}`),
    ...logoFiles.map((file) => `/${file}`),
    ...criticalImages.map((file) => `/${file}`),
  ];

  // Remove duplicates
  const uniqueAssets = [...new Set(criticalAssets)];
  console.log(`Total critical assets: ${uniqueAssets.length}`);

  return uniqueAssets;
}

// Function to update service worker
async function updateServiceWorker() {
  console.log(`\nUpdating service worker at: ${serviceWorkerPath}`);

  try {
    // Read service worker file
    const serviceWorkerContent = await readFile(serviceWorkerPath, "utf8");

    // Find current cache name
    const cacheNameMatch = serviceWorkerContent.match(
      /const CACHE_NAME = ["']([^"']+)["']/
    );
    if (!cacheNameMatch) {
      throw new Error("Could not find CACHE_NAME in service worker");
    }

    const currentCacheName = cacheNameMatch[1];
    console.log(`Current cache name: ${currentCacheName}`);

    // Generate new cache name with timestamp
    const newCacheName = `ofo-cache-v${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, ".")}`;
    console.log(`New cache name: ${newCacheName}`);

    // Find critical assets
    const criticalAssets = await findCriticalAssets();

    // Find PRECACHE_RESOURCES array
    const precacheMatch = serviceWorkerContent.match(
      /const PRECACHE_RESOURCES = \[([\s\S]*?)\];/
    );
    if (!precacheMatch) {
      throw new Error("Could not find PRECACHE_RESOURCES in service worker");
    }

    // Format critical assets as array items
    const formattedAssets = criticalAssets
      .map((asset) => `  "${asset}"`)
      .join(",\n");

    // Replace cache name
    let updatedContent = serviceWorkerContent.replace(
      /const CACHE_NAME = ["'][^"']+["']/,
      `const CACHE_NAME = "${newCacheName}"`
    );

    // Replace precache resources
    updatedContent = updatedContent.replace(
      /const PRECACHE_RESOURCES = \[([\s\S]*?)\];/,
      `const PRECACHE_RESOURCES = [\n${formattedAssets}\n];`
    );

    // Write updated service worker
    await writeFile(serviceWorkerPath, updatedContent);
    console.log(`\n✅ Service worker updated successfully!`);

    // Create backup
    const backupPath = `${serviceWorkerPath}.bak`;
    await writeFile(backupPath, serviceWorkerContent);
    console.log(`Backup created at: ${backupPath}`);

    return {
      oldCacheName: currentCacheName,
      newCacheName: newCacheName,
      assetCount: criticalAssets.length,
    };
  } catch (err) {
    console.error(`Error updating service worker: ${err.message}`);
    throw err;
  }
}

// Main function
async function main() {
  console.log("Starting service worker update...\n");

  try {
    const result = await updateServiceWorker();

    console.log("\nService Worker Update Summary:");
    console.log(`Old cache name: ${result.oldCacheName}`);
    console.log(`New cache name: ${result.newCacheName}`);
    console.log(`Total assets in precache: ${result.assetCount}`);
    console.log("\n✨ Service worker update completed successfully!");
    console.log(
      "\nRemember to test the updated service worker in different browsers."
    );
  } catch (err) {
    console.error("\n❌ Service worker update failed:", err);
    process.exit(1);
  }
}

// Run the script
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
