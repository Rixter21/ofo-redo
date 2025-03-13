/**
 * Analytics Integration Script for OFO Development Website
 * Adds analytics tracking to all HTML pages
 */

const fs = require("fs");
const path = require("path");

// Configuration
const config = {
  publicDir: path.join(__dirname, "..", "public"),
  analyticsScript: '<script src="assets/js/analytics.js"></script>',
  mainScript: '<script src="assets/js/main.js"></script>',
};

/**
 * Find all HTML files in a directory recursively
 * @param {string} dir - Directory to search
 * @param {Array} fileList - Array to collect file paths
 * @returns {Array} - Array of HTML file paths
 */
function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else if (file.endsWith(".html")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Add analytics script to HTML file
 * @param {string} filePath - Path to HTML file
 * @returns {boolean} - True if successful, false otherwise
 */
function addAnalyticsToFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");

    // Check if analytics script is already added
    if (content.includes(config.analyticsScript)) {
      console.log(
        `Analytics already added to ${path.relative(
          config.publicDir,
          filePath
        )}`
      );
      return true;
    }

    // Add analytics script after main.js
    if (content.includes(config.mainScript)) {
      content = content.replace(
        config.mainScript,
        `${config.mainScript}\n    ${config.analyticsScript}`
      );

      fs.writeFileSync(filePath, content, "utf8");
      console.log(
        `✅ Added analytics to ${path.relative(config.publicDir, filePath)}`
      );
      return true;
    }
    // If main.js is not found, add before closing body tag
    else {
      const bodyCloseIndex = content.lastIndexOf("</body>");

      if (bodyCloseIndex !== -1) {
        content =
          content.slice(0, bodyCloseIndex) +
          `    ${config.analyticsScript}\n  ` +
          content.slice(bodyCloseIndex);

        fs.writeFileSync(filePath, content, "utf8");
        console.log(
          `✅ Added analytics to ${path.relative(
            config.publicDir,
            filePath
          )} (before </body>)`
        );
        return true;
      }
    }

    console.log(
      `❌ Could not add analytics to ${path.relative(
        config.publicDir,
        filePath
      )} (no suitable insertion point found)`
    );
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

/**
 * Main function to add analytics to all HTML files
 */
function main() {
  console.log("Adding analytics tracking to all HTML pages...");

  // Find all HTML files
  const htmlFiles = findHtmlFiles(config.publicDir);
  console.log(`Found ${htmlFiles.length} HTML files`);

  // Add analytics to each file
  let successCount = 0;
  let failCount = 0;

  htmlFiles.forEach((filePath) => {
    const success = addAnalyticsToFile(filePath);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  });

  console.log(`\nAnalytics integration complete:`);
  console.log(`- ${successCount} files processed successfully`);
  console.log(`- ${failCount} files failed`);
}

// Run script if executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
