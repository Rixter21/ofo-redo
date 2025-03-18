#!/usr/bin/env node

/**
 * JSON Character Checker
 *
 * This script checks the characters in a JSON file.
 */

const fs = require("fs");
const path = require("path");

// Path to the JSON file
const jsonFilePath = path.join(__dirname, "public", "server-status.json");

// Read the file
try {
  const content = fs.readFileSync(jsonFilePath, "utf8");
  console.log("File content:");
  console.log(content);

  console.log("\nFile content as characters:");
  for (let i = 0; i < content.length; i++) {
    console.log(`${i}: '${content[i]}' (${content.charCodeAt(i)})`);
  }

  try {
    const data = JSON.parse(content);
    console.log("\nJSON is valid. Parsed data:");
    console.log(data);
  } catch (error) {
    console.error("\nError parsing JSON:", error);
  }
} catch (error) {
  console.error("Error reading file:", error);
}
