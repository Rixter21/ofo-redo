#!/usr/bin/env node

/**
 * Server Status Validator
 *
 * This script checks and fixes the server-status.json file to ensure it has valid JSON syntax.
 * It can be run periodically via cron to maintain a valid server-status.json file.
 */

const fs = require("fs");
const path = require("path");

// Path to the server-status.json file
const statusFilePath = path.join(__dirname, "public", "server-status.json");

// Function to create a valid server-status.json file
function createValidStatusFile() {
  const statusData = {
    status: "online",
    timestamp: new Date().toISOString(),
  };

  try {
    // Write the file directly with proper JSON syntax
    fs.writeFileSync(statusFilePath, JSON.stringify(statusData, null, 2));
    console.log(`Created valid server-status.json file at ${statusFilePath}`);

    // Verify the file was written correctly
    const content = fs.readFileSync(statusFilePath, "utf8");
    try {
      JSON.parse(content);
      console.log("Verified server-status.json contains valid JSON");
    } catch (jsonError) {
      console.error(
        "Error: server-status.json contains invalid JSON:",
        jsonError
      );
      // Try again with a different approach
      fs.writeFileSync(
        statusFilePath,
        `{\n  "status": "online",\n  "timestamp": "${new Date().toISOString()}"\n}`
      );
      console.log(
        "Attempted to fix server-status.json with direct string writing"
      );
    }
  } catch (error) {
    console.error("Error creating server-status.json:", error);
  }
}

// Function to check if the server-status.json file exists and has valid JSON
function checkAndFixStatusFile() {
  try {
    if (fs.existsSync(statusFilePath)) {
      const content = fs.readFileSync(statusFilePath, "utf8");
      try {
        // Try to parse the JSON
        JSON.parse(content);
        console.log("server-status.json exists and contains valid JSON");
      } catch (jsonError) {
        console.error(
          "Error: server-status.json contains invalid JSON:",
          jsonError
        );
        console.log("Fixing server-status.json...");
        createValidStatusFile();
      }
    } else {
      console.log("server-status.json does not exist, creating it...");
      createValidStatusFile();
    }
  } catch (error) {
    console.error("Error checking server-status.json:", error);
  }
}

// Run the check and fix function
checkAndFixStatusFile();

console.log("Server status validation complete");
