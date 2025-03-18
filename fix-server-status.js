const fs = require("fs");
const path = require("path");

const statusData = {
  status: "online",
  timestamp: new Date().toISOString(),
};

const statusFilePath = path.join(__dirname, "public", "server-status.json");
fs.writeFileSync(statusFilePath, JSON.stringify(statusData, null, 2));

console.log("Updated server-status.json with valid JSON");
