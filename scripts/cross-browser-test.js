/**
 * Cross-Browser Testing Script for OFO Development Website
 * This script launches multiple browsers to test the website
 */

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { execSync } = require("child_process");

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

// Root directory
const rootDir = path.join(__dirname, "..");
const screenshotsDir = path.join(rootDir, "browser-test-screenshots");

// Pages to test
const pagesToTest = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about.html" },
  { name: "Services", path: "/services.html" },
  { name: "Contact", path: "/contact.html" },
  { name: "Case Studies", path: "/CaseStudies.html" },
  { name: "Web Development", path: "/WebDevelopment.html" },
  { name: "Mobile Development", path: "/MobileDevelopment.html" },
  { name: "AI", path: "/ArtificialIntelligence.html" },
];

// Browser configurations
const browserConfigs = [
  {
    name: "Chrome Desktop",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
  },
  {
    name: "Firefox Desktop",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    viewport: { width: 1920, height: 1080 },
  },
  {
    name: "Safari Desktop",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    viewport: { width: 1920, height: 1080 },
  },
  {
    name: "iPhone",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    viewport: { width: 375, height: 812, isMobile: true, hasTouch: true },
  },
  {
    name: "iPad",
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    viewport: { width: 768, height: 1024, isMobile: true, hasTouch: true },
  },
  {
    name: "Android",
    userAgent:
      "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36",
    viewport: { width: 393, height: 851, isMobile: true, hasTouch: true },
  },
];

// Function to test a page in a specific browser configuration
async function testPage(page, pageConfig, browserConfig, baseUrl) {
  console.log(`Testing ${pageConfig.name} in ${browserConfig.name}...`);

  // Set user agent and viewport
  await page.setUserAgent(browserConfig.userAgent);
  await page.setViewport(browserConfig.viewport);

  // Navigate to the page
  const url = `${baseUrl}${pageConfig.path}`;
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  } catch (err) {
    console.error(`Error loading ${url}: ${err.message}`);
    return {
      success: false,
      error: err.message,
    };
  }

  // Take a screenshot
  const screenshotPath = path.join(
    screenshotsDir,
    `${browserConfig.name.replace(/\s+/g, "-")}_${pageConfig.name.replace(
      /\s+/g,
      "-"
    )}.png`
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // Check for console errors
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  // Check for broken images
  const brokenImages = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll("img"));
    return images
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.src);
  });

  // Check for responsive layout issues (simple check)
  let responsiveIssues = [];
  if (browserConfig.viewport.width < 768) {
    // Check for horizontal overflow on mobile
    const horizontalOverflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );
    });

    if (horizontalOverflow) {
      responsiveIssues.push("Horizontal scrollbar detected on mobile viewport");
    }

    // Check for tiny text
    const tinyText = await page.evaluate(() => {
      const textElements = Array.from(
        document.querySelectorAll("p, span, h1, h2, h3, h4, h5, h6, a, button")
      );
      return textElements
        .filter((el) => {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          return fontSize < 12 && el.textContent.trim().length > 0;
        })
        .map((el) => el.textContent.substring(0, 20) + "...");
    });

    if (tinyText.length > 0) {
      responsiveIssues.push(
        `Found ${tinyText.length} elements with font size less than 12px`
      );
    }
  }

  return {
    success:
      consoleErrors.length === 0 &&
      brokenImages.length === 0 &&
      responsiveIssues.length === 0,
    screenshot: screenshotPath,
    consoleErrors,
    brokenImages,
    responsiveIssues,
  };
}

// Function to test all pages in all browser configurations
async function runTests(baseUrl) {
  console.log(`Starting cross-browser tests for ${baseUrl}...\n`);

  // Create screenshots directory if it doesn't exist
  try {
    await mkdir(screenshotsDir, { recursive: true });
    console.log(`Created screenshots directory: ${screenshotsDir}`);
  } catch (err) {
    if (err.code !== "EEXIST") {
      console.error(`Error creating screenshots directory: ${err.message}`);
      throw err;
    }
  }

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const results = [];

  try {
    for (const browserConfig of browserConfigs) {
      console.log(`\nTesting in ${browserConfig.name}...`);

      const page = await browser.newPage();

      for (const pageConfig of pagesToTest) {
        const result = await testPage(page, pageConfig, browserConfig, baseUrl);

        results.push({
          browser: browserConfig.name,
          page: pageConfig.name,
          url: `${baseUrl}${pageConfig.path}`,
          ...result,
        });

        // Log result
        if (result.success) {
          console.log(`✅ ${pageConfig.name} in ${browserConfig.name}: Passed`);
        } else {
          console.log(`❌ ${pageConfig.name} in ${browserConfig.name}: Failed`);

          if (result.consoleErrors.length > 0) {
            console.log(`  Console errors: ${result.consoleErrors.length}`);
          }

          if (result.brokenImages.length > 0) {
            console.log(`  Broken images: ${result.brokenImages.length}`);
          }

          if (result.responsiveIssues.length > 0) {
            console.log(
              `  Responsive issues: ${result.responsiveIssues.length}`
            );
          }
        }
      }

      await page.close();
    }
  } finally {
    await browser.close();
  }

  return results;
}

// Function to generate HTML report
async function generateReport(results) {
  const reportPath = path.join(screenshotsDir, "cross-browser-report.html");

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cross-Browser Test Report - OFO Development</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #333; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
    .browser-section { margin-bottom: 30px; }
    .page-result { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
    .page-result h3 { margin-top: 0; }
    .pass { color: green; }
    .fail { color: red; }
    .issues { margin-left: 20px; }
    .screenshot { max-width: 100%; height: auto; border: 1px solid #ddd; margin-top: 10px; }
    .issue-list { background: #f9f9f9; padding: 10px; border-left: 3px solid #ddd; }
  </style>
</head>
<body>
  <h1>Cross-Browser Test Report - OFO Development</h1>
  <p>Generated on ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <p>Total tests: ${results.length}</p>
    <p>Passed: ${results.filter((r) => r.success).length}</p>
    <p>Failed: ${results.filter((r) => !r.success).length}</p>
  </div>
  `;

  // Group results by browser
  const browserGroups = {};
  for (const result of results) {
    if (!browserGroups[result.browser]) {
      browserGroups[result.browser] = [];
    }
    browserGroups[result.browser].push(result);
  }

  // Generate report for each browser
  for (const [browser, browserResults] of Object.entries(browserGroups)) {
    html += `
    <div class="browser-section">
      <h2>${browser}</h2>
      <p>Tests: ${browserResults.length}, Passed: ${
      browserResults.filter((r) => r.success).length
    }, Failed: ${browserResults.filter((r) => !r.success).length}</p>
    `;

    for (const result of browserResults) {
      html += `
      <div class="page-result">
        <h3>${result.page} - ${
        result.success
          ? '<span class="pass">Pass</span>'
          : '<span class="fail">Fail</span>'
      }</h3>
        <p>URL: <a href="${result.url}" target="_blank">${result.url}</a></p>
      `;

      if (!result.success) {
        html += '<div class="issues">';

        if (result.consoleErrors.length > 0) {
          html += `
          <h4>Console Errors (${result.consoleErrors.length})</h4>
          <div class="issue-list">
            <ul>
          `;

          for (const error of result.consoleErrors) {
            html += `<li>${error}</li>`;
          }

          html += `
            </ul>
          </div>
          `;
        }

        if (result.brokenImages.length > 0) {
          html += `
          <h4>Broken Images (${result.brokenImages.length})</h4>
          <div class="issue-list">
            <ul>
          `;

          for (const image of result.brokenImages) {
            html += `<li>${image}</li>`;
          }

          html += `
            </ul>
          </div>
          `;
        }

        if (result.responsiveIssues.length > 0) {
          html += `
          <h4>Responsive Issues (${result.responsiveIssues.length})</h4>
          <div class="issue-list">
            <ul>
          `;

          for (const issue of result.responsiveIssues) {
            html += `<li>${issue}</li>`;
          }

          html += `
            </ul>
          </div>
          `;
        }

        html += "</div>";
      }

      // Add screenshot
      if (result.screenshot) {
        const screenshotRelativePath = path.relative(
          screenshotsDir,
          result.screenshot
        );
        html += `
        <h4>Screenshot</h4>
        <img class="screenshot" src="${screenshotRelativePath}" alt="Screenshot of ${result.page} in ${result.browser}">
        `;
      }

      html += `
      </div>
      `;
    }

    html += `
    </div>
    `;
  }

  html += `
  </body>
  </html>
  `;

  await writeFile(reportPath, html);
  console.log(`\nReport generated at: ${reportPath}`);

  return reportPath;
}

// Main function
async function main() {
  // Check if server is running
  let baseUrl = "http://localhost:3000";
  let serverRunning = false;

  try {
    execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000');
    serverRunning = true;
    console.log("Server is already running on http://localhost:3000");
  } catch (err) {
    console.log("Server is not running. Starting server...");

    // Start server in background
    const { spawn } = require("child_process");
    const server = spawn("node", ["server.js"], {
      cwd: rootDir,
      detached: true,
      stdio: "ignore",
    });

    server.unref();

    // Wait for server to start
    console.log("Waiting for server to start...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  try {
    const results = await runTests(baseUrl);
    const reportPath = await generateReport(results);

    // Summary
    const passedTests = results.filter((r) => r.success).length;
    const totalTests = results.length;
    const passRate = ((passedTests / totalTests) * 100).toFixed(2);

    console.log("\nCross-Browser Test Summary:");
    console.log(`Total tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} (${passRate}%)`);
    console.log(`Failed: ${totalTests - passedTests}`);

    console.log(
      `\n✨ Cross-browser testing completed. View the report at: ${reportPath}`
    );

    // If all tests passed, exit with success
    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error("Error running tests:", err);
    process.exit(1);
  }
}

// Run the script
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
