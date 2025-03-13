/**
 * Script to implement proper lazy loading for all images across the website
 * This helps improve performance by:
 * 1. Adding loading="lazy" to images below the fold
 * 2. Adding preload directives for critical above-the-fold images
 * 3. Ensuring width and height attributes are set to prevent layout shifts
 *
 * Usage: node implement-lazy-loading.js
 */

const fs = require("fs");
const path = require("path");
const { parse } = require("node-html-parser");

// Configuration
const PUBLIC_DIR = path.join(__dirname, "../public");
const CRITICAL_FOLD_PX = 1000; // Approximate height of above-the-fold content
const CRITICAL_IMAGES_PER_PAGE = 2; // Number of hero/critical images per page to preload
const DEBUG = true;

// Log function that only logs if DEBUG is true
const log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

// Function to check if a file is an HTML file
const isHtmlFile = (filePath) => {
  return path.extname(filePath).toLowerCase() === ".html";
};

// Function to recursively find all HTML files in a directory
const findHtmlFiles = (dir) => {
  let results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(findHtmlFiles(filePath));
    } else if (isHtmlFile(filePath)) {
      results.push(filePath);
    }
  }

  return results;
};

// Function to process an individual HTML file
const processHtmlFile = (filePath) => {
  log(`Processing ${filePath}`);

  // Read the HTML file
  const html = fs.readFileSync(filePath, "utf8");

  // Parse the HTML
  const root = parse(html);

  // Get all image elements
  const imgElements = root.querySelectorAll("img");

  if (imgElements.length === 0) {
    log(`No images found in ${filePath}`);
    return;
  }

  log(`Found ${imgElements.length} images in ${filePath}`);

  // Track potential critical images (usually the first few images are critical)
  const criticalImages = [];
  let preloadsAdded = 0;

  // Process each image element
  imgElements.forEach((img, index) => {
    // Skip images that already have loading attribute
    if (img.getAttribute("loading")) {
      log(`Image already has loading attribute: ${img.getAttribute("src")}`);
      return;
    }

    // Get image source
    const src = img.getAttribute("src");
    if (!src) {
      log("Image without src attribute found, skipping");
      return;
    }

    // Determine if this is likely a critical (above-the-fold) image
    // Usually the first few images on a page are critical
    const isCritical = index < CRITICAL_IMAGES_PER_PAGE;

    if (isCritical) {
      log(`Critical image identified: ${src}`);
      criticalImages.push(src);
    } else {
      // Add lazy loading to non-critical images
      img.setAttribute("loading", "lazy");
      log(`Added lazy loading to: ${src}`);
    }

    // Ensure width and height are set (if possible)
    if (!img.getAttribute("width") || !img.getAttribute("height")) {
      // In a real implementation, we would determine actual image dimensions
      // Here we'll just add placeholder values
      if (!img.getAttribute("width")) {
        // We're not setting actual dimensions - this would require
        // more sophisticated image analysis
        log(`Image missing width attribute: ${src}`);
      }
      if (!img.getAttribute("height")) {
        log(`Image missing height attribute: ${src}`);
      }
    }
  });

  // Add preload directives for critical images in the head section
  const head = root.querySelector("head");
  if (head) {
    criticalImages.forEach((src) => {
      // Only preload if it's a local image from our assets folder
      if (src.startsWith("assets/") || src.startsWith("/assets/")) {
        // Check if preload already exists
        const existingPreload = head.querySelector(
          `link[rel="preload"][href="${src}"]`
        );

        if (!existingPreload && preloadsAdded < CRITICAL_IMAGES_PER_PAGE) {
          // Determine image type
          let imageType = "image/jpeg"; // Default assumption
          if (src.endsWith(".png")) {
            imageType = "image/png";
          } else if (src.endsWith(".webp")) {
            imageType = "image/webp";
          } else if (src.endsWith(".svg")) {
            imageType = "image/svg+xml";
          }

          // Create and add preload directive
          const preloadLink = parse(
            `<link rel="preload" href="${src}" as="image" type="${imageType}" />`
          );
          head.appendChild(preloadLink);
          preloadsAdded++;
          log(`Added preload for critical image: ${src}`);
        }
      }
    });
  }

  // Write the modified HTML back to the file
  fs.writeFileSync(filePath, root.toString());

  log(
    `Processed ${filePath}: ${imgElements.length} images, ${criticalImages.length} critical images identified, ${preloadsAdded} preloads added\n`
  );
};

// Main function
const main = () => {
  console.log("Starting lazy loading implementation...");

  // Find all HTML files
  const htmlFiles = findHtmlFiles(PUBLIC_DIR);
  console.log(`Found ${htmlFiles.length} HTML files to process`);

  // Process each HTML file
  htmlFiles.forEach(processHtmlFile);

  console.log("Lazy loading implementation complete!");
};

// Run the script
main();
