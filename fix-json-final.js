#!/usr/bin/env node

/**
 * Final JSON Writer
 *
 * This script writes a valid JSON file directly using a string template.
 */

const fs = require("fs");
const path = require("path");

// Path to the server-status.json file
const statusFilePath = path.join(__dirname, "public", "server-status.json");

// Create a valid JSON string directly with explicit comma
const jsonString =
  '{\n  "status": "online",\n  "timestamp": "' +
  new Date().toISOString() +
  '"\n}';

// Write the file
try {
  // Write to a temporary file first
  const tempFilePath = `${statusFilePath}.tmp`;
  fs.writeFileSync(tempFilePath, jsonString);

  // Rename the temp file to the actual file
  if (fs.existsSync(statusFilePath)) {
    fs.unlinkSync(statusFilePath);
  }
  fs.renameSync(tempFilePath, statusFilePath);

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
