/**
 * Cleanup Script for OFO Development Website
 * This script helps clean up unnecessary files before production deployment
 */

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

// Root directory
const rootDir = path.join(__dirname, "..");

// Files to remove
const filesToRemove = [
  // Duplicate server files
  "server.js.bak",
  "server.js.fixed",
  "server.js.new",

  // Temporary JSON fix scripts
  "fix-json-direct.js",
  "fix-json-final.js",
  "fix-json-python.py",
  "fix-json-python2.py",
  "fix-json-python3.py",
  "fix-json-python4.py",
  "fix-json.py",
  "fix-json.sh",
  "check-json-chars.js",
  "check-json.py",

  // Debug and audit logs
  "debug.log",
  "audit.log",
  "audit-progress.log",
  "masterpiece.log",
  "automation_debug.log",
  "optimization-log.txt",

  // Draft HTML files
  "web-development-draft.html",
  "web-development-draft-part2.html",
  "web-development-draft-part3.html",
];

// Function to remove files
async function removeFiles() {
  console.log("Starting cleanup process...");

  let removedCount = 0;
  let notFoundCount = 0;

  for (const file of filesToRemove) {
    const filePath = path.join(rootDir, file);

    try {
      // Check if file exists
      await stat(filePath);

      // Remove file
      await unlink(filePath);
      console.log(`✅ Removed: ${file}`);
      removedCount++;
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log(`⚠️ Not found: ${file}`);
        notFoundCount++;
      } else {
        console.error(`❌ Error removing ${file}: ${err.message}`);
      }
    }
  }

  console.log("\nCleanup Summary:");
  console.log(`Total files to remove: ${filesToRemove.length}`);
  console.log(`Files removed: ${removedCount}`);
  console.log(`Files not found: ${notFoundCount}`);
  console.log(`Errors: ${filesToRemove.length - removedCount - notFoundCount}`);

  if (removedCount > 0) {
    console.log("\n✨ Cleanup completed successfully!");
  } else {
    console.log("\n⚠️ No files were removed.");
  }
}

// Run the cleanup
removeFiles().catch((err) => {
  console.error("Fatal error during cleanup:", err);
  process.exit(1);
});
