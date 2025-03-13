/**
 * Script to optimize JavaScript loading by deferring non-critical scripts
 * This helps improve performance by:
 * 1. Adding defer attribute to non-critical scripts
 * 2. Adding preconnect directives for third-party resources
 * 3. Moving scripts to the end of the body where possible
 *
 * Usage: node defer-javascript.js
 */

const fs = require("fs");
const path = require("path");
const { parse } = require("node-html-parser");

// Configuration
const PUBLIC_DIR = path.join(__dirname, "../public");
const DEBUG = true;

// Critical script sources that should not be deferred
const CRITICAL_SCRIPTS = [
  "main.js", // Main site functionality
];

// Third-party domains to preconnect to
const PRECONNECT_DOMAINS = ["https://cdnjs.cloudflare.com"];

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

// Function to check if a script is critical (shouldn't be deferred)
const isCriticalScript = (src) => {
  if (!src) return true; // Inline scripts are considered critical

  return CRITICAL_SCRIPTS.some((criticalSrc) => src.includes(criticalSrc));
};

// Function to process an individual HTML file
const processHtmlFile = (filePath) => {
  log(`Processing ${filePath}`);

  // Read the HTML file
  const html = fs.readFileSync(filePath, "utf8");

  // Parse the HTML
  const root = parse(html);

  // Add preconnect links for third-party resources
  addPreconnects(root);

  // Process script tags
  optimizeScripts(root);

  // Write the modified HTML back to the file
  fs.writeFileSync(filePath, root.toString());

  log(`Processed ${filePath}\n`);
};

// Function to add preconnect directives for third-party resources
const addPreconnects = (root) => {
  const head = root.querySelector("head");
  if (!head) return;

  let preconnectsAdded = 0;

  // Add preconnect for each domain
  PRECONNECT_DOMAINS.forEach((domain) => {
    // Check if preconnect already exists
    const existingPreconnect = head.querySelector(
      `link[rel="preconnect"][href="${domain}"]`
    );

    if (!existingPreconnect) {
      const preconnectLink = parse(
        `<link rel="preconnect" href="${domain}" crossorigin>`
      );
      // Add after title or as first element if no title
      const title = head.querySelector("title");
      if (title) {
        title.insertAdjacentHTML("afterend", preconnectLink.toString());
      } else {
        head.insertAdjacentHTML("afterbegin", preconnectLink.toString());
      }

      preconnectsAdded++;
      log(`Added preconnect for: ${domain}`);
    }
  });

  return preconnectsAdded;
};

// Function to optimize script tags
const optimizeScripts = (root) => {
  // Get all script elements
  const scriptElements = root.querySelectorAll("script");

  if (scriptElements.length === 0) {
    log("No script elements found");
    return;
  }

  log(`Found ${scriptElements.length} script elements`);

  let deferredCount = 0;
  let movedToBottomCount = 0;

  scriptElements.forEach((script) => {
    const src = script.getAttribute("src");

    // Skip if already has defer or async
    if (script.getAttribute("defer") || script.getAttribute("async")) {
      log(`Script already has defer or async: ${src || "inline script"}`);
      return;
    }

    // Handle external scripts
    if (src) {
      if (!isCriticalScript(src)) {
        script.setAttribute("defer", "");
        deferredCount++;
        log(`Added defer to script: ${src}`);
      } else {
        log(`Keeping critical script as is: ${src}`);
      }
    }
  });

  // Move non-deferred scripts to end of body where possible
  const body = root.querySelector("body");
  if (body) {
    const nonDeferredExternalScripts = root.querySelectorAll(
      "head > script[src]:not([defer]):not([async])"
    );

    nonDeferredExternalScripts.forEach((script) => {
      // For scripts that need to be executed immediately but are not critical
      // to the initial render, we can move them to the end of the body
      if (!isCriticalScript(script.getAttribute("src"))) {
        const clonedScript = script.clone();
        body.appendChild(clonedScript);
        script.remove();
        movedToBottomCount++;
        log(`Moved script to end of body: ${script.getAttribute("src")}`);
      }
    });
  }

  log(
    `Deferred ${deferredCount} scripts, moved ${movedToBottomCount} scripts to end of body`
  );
};

// Main function
const main = () => {
  console.log("Starting JavaScript optimization...");

  // Find all HTML files
  const htmlFiles = findHtmlFiles(PUBLIC_DIR);
  console.log(`Found ${htmlFiles.length} HTML files to process`);

  // Process each HTML file
  htmlFiles.forEach(processHtmlFile);

  console.log("JavaScript optimization complete!");
};

// Run the script
main();
