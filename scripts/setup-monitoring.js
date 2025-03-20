/**
 * Monitoring Setup Script for OFO Development Website
 * This script sets up basic monitoring for the website
 */

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const http = require("http");
const https = require("https");

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Root directory
const rootDir = path.join(__dirname, "..");
const monitoringDir = path.join(rootDir, "monitoring");

// URLs to monitor
const urlsToMonitor = [
  { url: "http://localhost:3000", name: "Local Development" },
  { url: "https://ofodevelopment.com", name: "Production Website" },
  { url: "https://ofodevelopment.com/contact.html", name: "Contact Page" },
  { url: "https://ofodevelopment.com/services.html", name: "Services Page" },
  { url: "https://ofodevelopment.com/about.html", name: "About Page" },
  {
    url: "https://ofodevelopment.com/server-status.json",
    name: "Server Status",
  },
];

// Function to check URL status
async function checkUrlStatus(urlObj) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const protocol = urlObj.url.startsWith("https") ? https : http;

    const req = protocol.get(urlObj.url, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      resolve({
        url: urlObj.url,
        name: urlObj.name,
        status: res.statusCode,
        responseTime,
        timestamp: new Date().toISOString(),
        success: res.statusCode >= 200 && res.statusCode < 400,
      });
    });

    req.on("error", (err) => {
      resolve({
        url: urlObj.url,
        name: urlObj.name,
        status: 0,
        responseTime: 0,
        timestamp: new Date().toISOString(),
        success: false,
        error: err.message,
      });
    });

    // Set timeout to 10 seconds
    req.setTimeout(10000, () => {
      req.abort();
      resolve({
        url: urlObj.url,
        name: urlObj.name,
        status: 0,
        responseTime: 10000,
        timestamp: new Date().toISOString(),
        success: false,
        error: "Request timed out",
      });
    });
  });
}

// Function to create monitoring report
async function createMonitoringReport() {
  console.log("Checking website status...");

  // Create monitoring directory if it doesn't exist
  try {
    await mkdir(monitoringDir, { recursive: true });
    console.log(`Created monitoring directory: ${monitoringDir}`);
  } catch (err) {
    if (err.code !== "EEXIST") {
      console.error(`Error creating monitoring directory: ${err.message}`);
    }
  }

  // Check all URLs
  const results = [];
  for (const urlObj of urlsToMonitor) {
    console.log(`Checking ${urlObj.name} (${urlObj.url})...`);
    const result = await checkUrlStatus(urlObj);
    results.push(result);

    // Log result
    if (result.success) {
      console.log(
        `✅ ${result.name}: ${result.status} (${result.responseTime}ms)`
      );
    } else {
      console.error(
        `❌ ${result.name}: ${result.error || `Status ${result.status}`}`
      );
    }
  }

  // Create report
  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      success: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      averageResponseTime:
        results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
    },
  };

  // Write report to file
  const reportPath = path.join(
    monitoringDir,
    `report-${new Date().toISOString().replace(/:/g, "-")}.json`
  );
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nMonitoring report saved to: ${reportPath}`);

  // Write latest report
  const latestReportPath = path.join(monitoringDir, "latest-report.json");
  await writeFile(latestReportPath, JSON.stringify(report, null, 2));
  console.log(`Latest report saved to: ${latestReportPath}`);

  // Summary
  console.log("\nMonitoring Summary:");
  console.log(`Total URLs checked: ${report.summary.total}`);
  console.log(`Successful: ${report.summary.success}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(
    `Average response time: ${report.summary.averageResponseTime.toFixed(2)}ms`
  );

  return report;
}

// Function to set up cron job
function setupCronJob() {
  const cronScript = `#!/bin/bash
# Cron job for monitoring OFO Development website
# Run this script every hour

cd ${rootDir}
node ${path.join(__dirname, "setup-monitoring.js")} --cron

# Send email alert if there are failures
if [ $? -ne 0 ]; then
  echo "Website monitoring detected failures. Check the latest report." | mail -s "OFO Website Alert" admin@ofodevelopment.com
fi
`;

  const cronPath = path.join(monitoringDir, "monitor-cron.sh");

  try {
    fs.writeFileSync(cronPath, cronScript);
    fs.chmodSync(cronPath, "755");
    console.log(`\nCron script created at: ${cronPath}`);
    console.log("To set up hourly monitoring, run:");
    console.log(`crontab -e`);
    console.log("And add the following line:");
    console.log(`0 * * * * ${cronPath}`);
  } catch (err) {
    console.error(`Error creating cron script: ${err.message}`);
  }
}

// Main function
async function main() {
  console.log("Setting up website monitoring...\n");

  try {
    const report = await createMonitoringReport();

    // Set up cron job
    setupCronJob();

    // Exit with error if any checks failed
    if (report.summary.failed > 0) {
      console.error("\n⚠️ Some checks failed. See the report for details.");
      process.exit(1);
    } else {
      console.log("\n✨ All checks passed!");
    }
  } catch (err) {
    console.error("Error setting up monitoring:", err);
    process.exit(1);
  }
}

// Run the script
if (process.argv.includes("--cron")) {
  // When run from cron, just create the report
  createMonitoringReport().catch((err) => {
    console.error("Error creating monitoring report:", err);
    process.exit(1);
  });
} else {
  // Interactive mode
  main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
