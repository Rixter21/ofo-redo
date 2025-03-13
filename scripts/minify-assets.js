/**
 * Script to minify CSS and JavaScript files
 * This helps improve performance by:
 * 1. Reducing file sizes for faster downloads
 * 2. Combining CSS files where appropriate
 * 3. Creating source maps for debugging
 *
 * Usage: node minify-assets.js
 */

const fs = require("fs");
const path = require("path");
const { minify } = require("terser");
const csso = require("csso");
const glob = require("glob");

// Configuration
const PUBLIC_DIR = path.join(__dirname, "../public");
const CSS_DIR = path.join(PUBLIC_DIR, "assets/css");
const JS_DIR = path.join(PUBLIC_DIR, "assets/js");
const OUTPUT_DIR = {
  css: CSS_DIR,
  js: JS_DIR,
};
const CREATE_SOURCE_MAPS = true;
const DEBUG = true;

// Log function that only logs if DEBUG is true
const log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

// Function to ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`Created directory: ${dirPath}`);
  }
};

// Function to minify JavaScript files
const minifyJavaScript = async (filePath) => {
  log(`Processing JavaScript file: ${filePath}`);

  try {
    // Read the file
    const code = fs.readFileSync(filePath, "utf8");
    const fileName = path.basename(filePath);
    const outputPath = path.join(
      OUTPUT_DIR.js,
      fileName.replace(".js", ".min.js")
    );

    // Options for terser
    const options = {
      compress: {
        drop_console: false, // Keep console logs
        drop_debugger: true, // Remove debugger statements
      },
      mangle: true,
      sourceMap: CREATE_SOURCE_MAPS
        ? {
            filename: path.basename(outputPath),
            url: `${path.basename(outputPath)}.map`,
          }
        : false,
    };

    // Minify the JavaScript
    const result = await minify(code, options);

    // Write the minified file
    fs.writeFileSync(outputPath, result.code);
    log(`Minified JavaScript saved to: ${outputPath}`);

    // Write the source map if enabled
    if (CREATE_SOURCE_MAPS && result.map) {
      fs.writeFileSync(`${outputPath}.map`, result.map);
      log(`Source map saved to: ${outputPath}.map`);
    }

    // Calculate size reduction
    const originalSize = Buffer.byteLength(code, "utf8");
    const minifiedSize = Buffer.byteLength(result.code, "utf8");
    const reduction = (
      ((originalSize - minifiedSize) / originalSize) *
      100
    ).toFixed(2);

    log(`Original size: ${formatBytes(originalSize)}`);
    log(`Minified size: ${formatBytes(minifiedSize)}`);
    log(`Reduction: ${reduction}%`);

    return {
      originalPath: filePath,
      outputPath,
      originalSize,
      minifiedSize,
      reduction,
    };
  } catch (error) {
    console.error(`Error minifying JavaScript file ${filePath}:`, error);
    return null;
  }
};

// Function to minify CSS files
const minifyCss = (filePath) => {
  log(`Processing CSS file: ${filePath}`);

  try {
    // Read the file
    const css = fs.readFileSync(filePath, "utf8");
    const fileName = path.basename(filePath);
    const outputPath = path.join(
      OUTPUT_DIR.css,
      fileName.replace(".css", ".min.css")
    );

    // Options for csso
    const options = {
      sourceMap: CREATE_SOURCE_MAPS,
      filename: fileName,
    };

    // Minify the CSS
    const result = csso.minify(css, options);

    // Write the minified file
    fs.writeFileSync(outputPath, result.css);
    log(`Minified CSS saved to: ${outputPath}`);

    // Write the source map if enabled
    if (CREATE_SOURCE_MAPS && result.map) {
      fs.writeFileSync(`${outputPath}.map`, JSON.stringify(result.map));
      log(`Source map saved to: ${outputPath}.map`);
    }

    // Calculate size reduction
    const originalSize = Buffer.byteLength(css, "utf8");
    const minifiedSize = Buffer.byteLength(result.css, "utf8");
    const reduction = (
      ((originalSize - minifiedSize) / originalSize) *
      100
    ).toFixed(2);

    log(`Original size: ${formatBytes(originalSize)}`);
    log(`Minified size: ${formatBytes(minifiedSize)}`);
    log(`Reduction: ${reduction}%`);

    return {
      originalPath: filePath,
      outputPath,
      originalSize,
      minifiedSize,
      reduction,
    };
  } catch (error) {
    console.error(`Error minifying CSS file ${filePath}:`, error);
    return null;
  }
};

// Function to format bytes to a readable format
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Function to find all CSS files in a directory
const findCssFiles = () => {
  return glob
    .sync(`${CSS_DIR}/**/*.css`)
    .filter((file) => !file.includes(".min.css"));
};

// Function to find all JavaScript files in a directory
const findJsFiles = () => {
  return glob
    .sync(`${JS_DIR}/**/*.js`)
    .filter((file) => !file.includes(".min.js"));
};

// Function to update HTML files to reference minified assets
const updateHtmlReferences = () => {
  log("Updating HTML files to reference minified assets...");

  // Find all HTML files
  const htmlFiles = glob.sync(`${PUBLIC_DIR}/**/*.html`);
  let updatedCount = 0;

  htmlFiles.forEach((filePath) => {
    let html = fs.readFileSync(filePath, "utf8");
    let originalHtml = html;

    // Update CSS references
    html = html.replace(
      /(href=["'])assets\/css\/([^"']+)\.css(["'])/g,
      (match, start, fileName, end) => {
        // Skip if it's already referencing a .min.css file
        if (fileName.includes(".min")) return match;
        return `${start}assets/css/${fileName}.min.css${end}`;
      }
    );

    // Update JavaScript references
    html = html.replace(
      /(src=["'])assets\/js\/([^"']+)\.js(["'])/g,
      (match, start, fileName, end) => {
        // Skip if it's already referencing a .min.js file
        if (fileName.includes(".min")) return match;
        return `${start}assets/js/${fileName}.min.js${end}`;
      }
    );

    // Only write the file if changes were made
    if (html !== originalHtml) {
      fs.writeFileSync(filePath, html);
      updatedCount++;
      log(`Updated references in: ${filePath}`);
    }
  });

  log(`Updated references in ${updatedCount} HTML files`);
  return updatedCount;
};

// Main function
const main = async () => {
  console.log("Starting asset minification...");

  // Ensure output directories exist
  ensureDirectoryExists(OUTPUT_DIR.css);
  ensureDirectoryExists(OUTPUT_DIR.js);

  // Find all CSS and JavaScript files
  const cssFiles = findCssFiles();
  const jsFiles = findJsFiles();

  console.log(
    `Found ${cssFiles.length} CSS files and ${jsFiles.length} JavaScript files to minify`
  );

  // Process CSS files
  let cssResults = [];
  for (const file of cssFiles) {
    const result = minifyCss(file);
    if (result) cssResults.push(result);
  }

  // Process JavaScript files
  let jsResults = [];
  for (const file of jsFiles) {
    const result = await minifyJavaScript(file);
    if (result) jsResults.push(result);
  }

  // Update HTML files to reference minified assets
  const updatedHtmlCount = updateHtmlReferences();

  // Log summary
  console.log("\nMinification Summary:");
  console.log("--------------------");
  console.log(`CSS Files: ${cssResults.length} files processed`);

  let totalCssOriginal = 0;
  let totalCssMinified = 0;

  cssResults.forEach((result) => {
    totalCssOriginal += result.originalSize;
    totalCssMinified += result.minifiedSize;
    console.log(
      `  - ${path.basename(result.originalPath)}: ${
        result.reduction
      }% reduction`
    );
  });

  console.log(`JavaScript Files: ${jsResults.length} files processed`);

  let totalJsOriginal = 0;
  let totalJsMinified = 0;

  jsResults.forEach((result) => {
    totalJsOriginal += result.originalSize;
    totalJsMinified += result.minifiedSize;
    console.log(
      `  - ${path.basename(result.originalPath)}: ${
        result.reduction
      }% reduction`
    );
  });

  // Calculate totals
  const totalOriginal = totalCssOriginal + totalJsOriginal;
  const totalMinified = totalCssMinified + totalJsMinified;
  const totalReduction = (
    ((totalOriginal - totalMinified) / totalOriginal) *
    100
  ).toFixed(2);

  console.log("\nTotal Savings:");
  console.log(`  Original: ${formatBytes(totalOriginal)}`);
  console.log(`  Minified: ${formatBytes(totalMinified)}`);
  console.log(`  Reduction: ${totalReduction}%`);

  console.log(`\nUpdated references in ${updatedHtmlCount} HTML files`);

  console.log("\nAsset minification complete!");
};

// Run the script
main().catch(console.error);
