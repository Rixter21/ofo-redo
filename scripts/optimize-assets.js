/**
 * Asset Optimization Script for OFO Development Website
 * This script minifies CSS and JavaScript files for production
 */

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const glob = require("glob");
const csso = require("csso");
const { minify } = require("terser");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const globPromise = promisify(glob);

// Root directory
const rootDir = path.join(__dirname, "..");
const publicDir = path.join(rootDir, "public");

// Function to minify CSS files
async function minifyCssFiles() {
  console.log("Minifying CSS files...");

  try {
    // Find all CSS files
    const cssFiles = await globPromise("assets/css/**/*.css", {
      cwd: publicDir,
    });

    let successCount = 0;
    let errorCount = 0;

    for (const file of cssFiles) {
      // Skip already minified files
      if (file.includes(".min.css")) {
        console.log(`⏭️ Skipping already minified file: ${file}`);
        continue;
      }

      try {
        const filePath = path.join(publicDir, file);
        const css = await readFile(filePath, "utf8");

        // Minify CSS
        const minified = csso.minify(css).css;

        // Create output path
        const outputPath = filePath.replace(".css", ".min.css");

        // Write minified file
        await writeFile(outputPath, minified);

        // Calculate size reduction
        const originalSize = Buffer.byteLength(css, "utf8");
        const minifiedSize = Buffer.byteLength(minified, "utf8");
        const reduction = (
          ((originalSize - minifiedSize) / originalSize) *
          100
        ).toFixed(2);

        console.log(`✅ Minified: ${file} (${reduction}% reduction)`);
        successCount++;
      } catch (err) {
        console.error(`❌ Error minifying ${file}: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\nCSS Minification Summary:`);
    console.log(`Total CSS files: ${cssFiles.length}`);
    console.log(`Successfully minified: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    return { successCount, errorCount };
  } catch (err) {
    console.error("Error finding CSS files:", err);
    return { successCount: 0, errorCount: 0 };
  }
}

// Function to minify JavaScript files
async function minifyJsFiles() {
  console.log("\nMinifying JavaScript files...");

  try {
    // Find all JS files
    const jsFiles = await globPromise("assets/js/**/*.js", { cwd: publicDir });

    let successCount = 0;
    let errorCount = 0;

    for (const file of jsFiles) {
      // Skip already minified files
      if (file.includes(".min.js")) {
        console.log(`⏭️ Skipping already minified file: ${file}`);
        continue;
      }

      try {
        const filePath = path.join(publicDir, file);
        const js = await readFile(filePath, "utf8");

        // Minify JS
        const minified = await minify(js, {
          compress: true,
          mangle: true,
        });

        // Create output path
        const outputPath = filePath.replace(".js", ".min.js");

        // Write minified file
        await writeFile(outputPath, minified.code);

        // Calculate size reduction
        const originalSize = Buffer.byteLength(js, "utf8");
        const minifiedSize = Buffer.byteLength(minified.code, "utf8");
        const reduction = (
          ((originalSize - minifiedSize) / originalSize) *
          100
        ).toFixed(2);

        console.log(`✅ Minified: ${file} (${reduction}% reduction)`);
        successCount++;
      } catch (err) {
        console.error(`❌ Error minifying ${file}: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\nJavaScript Minification Summary:`);
    console.log(`Total JS files: ${jsFiles.length}`);
    console.log(`Successfully minified: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    return { successCount, errorCount };
  } catch (err) {
    console.error("Error finding JavaScript files:", err);
    return { successCount: 0, errorCount: 0 };
  }
}

// Run the optimization
async function optimizeAssets() {
  console.log("Starting asset optimization...\n");

  const cssResults = await minifyCssFiles();
  const jsResults = await minifyJsFiles();

  console.log("\nOptimization Complete!");
  console.log(
    `Total files processed: ${cssResults.successCount + jsResults.successCount}`
  );
  console.log(`Total errors: ${cssResults.errorCount + jsResults.errorCount}`);

  if (cssResults.errorCount + jsResults.errorCount > 0) {
    console.log("\n⚠️ Optimization completed with errors.");
    process.exit(1);
  } else {
    console.log("\n✨ Optimization completed successfully!");
  }
}

optimizeAssets().catch((err) => {
  console.error("Fatal error during optimization:", err);
  process.exit(1);
});
