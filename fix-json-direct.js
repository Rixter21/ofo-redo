#!/usr/bin/env node

/**
 * Direct JSON Writer
 *
 * This script writes a valid JSON file directly using a string template.
 */

const fs = require("fs");
const path = require("path");

// Path to the server-status.json file
const statusFilePath = path.join(__dirname, "public", "server-status.json");

// Create a valid JSON string directly
const timestamp = new Date().toISOString();
const jsonString = `{
  "status": "online",
  "timestamp": "${timestamp}"
}`;

// Write the file
try {
  fs.writeFileSync(statusFilePath, jsonString);
  console.log(`Created valid server-status.json file at ${statusFilePath}`);

  // Verify the file was written correctly
  const content = fs.readFileSync(statusFilePath, "utf8");
  console.log("File content:");
  console.log(content);

  try {
    JSON.parse(content);
    console.log("Verified server-status.json contains valid JSON");
  } catch (jsonError) {
    console.error(
      "Error: server-status.json contains invalid JSON:",
      jsonError
    );
  }
} catch (error) {
  console.error("Error creating server-status.json:", error);
}
