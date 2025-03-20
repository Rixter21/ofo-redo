/**
 * Accessibility Checker Script for OFO Development Website
 * This script checks HTML files for common accessibility issues
 */

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const glob = require("glob");
const { parse } = require("node-html-parser");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const globPromise = promisify(glob);

// Root directory
const rootDir = path.join(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const reportDir = path.join(rootDir, "accessibility-reports");

// Accessibility checks
const accessibilityChecks = [
  {
    name: "Missing alt attributes on images",
    check: (root) => {
      const images = root.querySelectorAll("img:not([alt])");
      return {
        pass: images.length === 0,
        elements: images.map((img) => ({
          tag: "img",
          src: img.getAttribute("src"),
          fix: "Add alt attribute to describe the image",
        })),
      };
    },
  },
  {
    name: "Empty alt attributes on non-decorative images",
    check: (root) => {
      const images = root.querySelectorAll('img[alt=""]');
      return {
        pass: images.length === 0,
        elements: images.map((img) => ({
          tag: "img",
          src: img.getAttribute("src"),
          fix: "Add descriptive alt text if the image is not decorative",
        })),
      };
    },
  },
  {
    name: "Missing form labels",
    check: (root) => {
      const formElements = root.querySelectorAll("input, textarea, select");
      const elementsWithoutLabels = formElements.filter((el) => {
        const id = el.getAttribute("id");
        if (!id) return true;
        const label = root.querySelector(`label[for="${id}"]`);
        return !label;
      });

      return {
        pass: elementsWithoutLabels.length === 0,
        elements: elementsWithoutLabels.map((el) => ({
          tag: el.tagName,
          id: el.getAttribute("id"),
          type: el.getAttribute("type"),
          fix: "Add a label element with a for attribute matching the input id",
        })),
      };
    },
  },
  {
    name: "Missing document language",
    check: (root) => {
      const html = root.querySelector("html");
      const hasLang = html && html.hasAttribute("lang");

      return {
        pass: hasLang,
        elements: hasLang
          ? []
          : [
              {
                tag: "html",
                fix: 'Add lang attribute to the html element (e.g., lang="en")',
              },
            ],
      };
    },
  },
  {
    name: "Missing heading hierarchy",
    check: (root) => {
      const headings = root.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const headingLevels = headings.map((h) =>
        parseInt(h.tagName.substring(1))
      );

      // Check if there's an h1
      const hasH1 = headingLevels.includes(1);

      // Check for skipped levels
      let skippedLevels = false;
      let maxLevel = 0;

      for (const level of headingLevels) {
        if (level > maxLevel + 1) {
          skippedLevels = true;
          break;
        }
        maxLevel = Math.max(maxLevel, level);
      }

      return {
        pass: hasH1 && !skippedLevels,
        elements: !hasH1
          ? [
              {
                tag: "heading",
                fix: "Add an h1 element as the main heading of the page",
              },
            ]
          : skippedLevels
          ? [
              {
                tag: "heading",
                fix: "Fix heading hierarchy to avoid skipping levels",
              },
            ]
          : [],
      };
    },
  },
  {
    name: "Low contrast text",
    check: (root) => {
      // This is a simplified check - a real check would analyze CSS
      const elements = root.querySelectorAll('[style*="color"]');
      const potentialLowContrast = elements.filter((el) => {
        const style = el.getAttribute("style");
        return (
          style.includes("color: #ccc") ||
          style.includes("color: #ddd") ||
          style.includes("color: #eee") ||
          (style.includes("color: #fff") && !style.includes("background"))
        );
      });

      return {
        pass: potentialLowContrast.length === 0,
        elements: potentialLowContrast.map((el) => ({
          tag: el.tagName,
          text: el.text.substring(0, 30) + (el.text.length > 30 ? "..." : ""),
          style: el.getAttribute("style"),
          fix: "Ensure text has sufficient contrast with its background",
        })),
      };
    },
  },
  {
    name: "Missing ARIA attributes on interactive elements",
    check: (root) => {
      const interactiveElements = root.querySelectorAll(
        'button, a[role], [role="button"]'
      );
      const elementsWithoutARIA = interactiveElements.filter((el) => {
        return (
          !el.hasAttribute("aria-label") &&
          !el.hasAttribute("aria-labelledby") &&
          el.text.trim() === ""
        );
      });

      return {
        pass: elementsWithoutARIA.length === 0,
        elements: elementsWithoutARIA.map((el) => ({
          tag: el.tagName,
          role: el.getAttribute("role"),
          fix: "Add aria-label or aria-labelledby attribute",
        })),
      };
    },
  },
];

// Function to check a single HTML file
async function checkHtmlFile(filePath) {
  try {
    const content = await readFile(filePath, "utf8");
    const root = parse(content);

    const results = {};

    for (const check of accessibilityChecks) {
      const result = check.check(root);
      results[check.name] = result;
    }

    return {
      filePath,
      results,
    };
  } catch (err) {
    console.error(`Error checking ${filePath}: ${err.message}`);
    return {
      filePath,
      error: err.message,
    };
  }
}

// Function to check all HTML files
async function checkAllHtmlFiles() {
  console.log("Checking HTML files for accessibility issues...");

  try {
    // Create report directory if it doesn't exist
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Find all HTML files
    const htmlFiles = await globPromise("**/*.html", { cwd: publicDir });
    console.log(`Found ${htmlFiles.length} HTML files to check`);

    const results = [];

    for (const file of htmlFiles) {
      const filePath = path.join(publicDir, file);
      console.log(`Checking ${file}...`);
      const result = await checkHtmlFile(filePath);
      results.push(result);
    }

    // Generate summary
    const summary = {
      totalFiles: results.length,
      filesWithIssues: results.filter(
        (r) => !r.error && Object.values(r.results).some((check) => !check.pass)
      ).length,
      filesWithErrors: results.filter((r) => r.error).length,
      checkResults: {},
    };

    // Count issues by check
    for (const check of accessibilityChecks) {
      summary.checkResults[check.name] = {
        totalIssues: 0,
        filesWithIssues: 0,
      };
    }

    for (const result of results) {
      if (result.error) continue;

      for (const [checkName, checkResult] of Object.entries(result.results)) {
        if (!checkResult.pass) {
          summary.checkResults[checkName].totalIssues +=
            checkResult.elements.length;
          summary.checkResults[checkName].filesWithIssues++;
        }
      }
    }

    // Write detailed report
    const reportPath = path.join(
      reportDir,
      `accessibility-report-${new Date().toISOString().slice(0, 10)}.json`
    );
    await writeFile(reportPath, JSON.stringify({ summary, results }, null, 2));
    console.log(`\nDetailed report saved to: ${reportPath}`);

    // Write summary report
    const summaryReportPath = path.join(
      reportDir,
      "accessibility-summary.json"
    );
    await writeFile(summaryReportPath, JSON.stringify(summary, null, 2));
    console.log(`Summary report saved to: ${summaryReportPath}`);

    return { summary, results };
  } catch (err) {
    console.error("Error checking HTML files:", err);
    throw err;
  }
}

// Function to generate HTML report
async function generateHtmlReport(data) {
  const { summary, results } = data;

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report - OFO Development</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #333; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
    .file { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
    .file h3 { margin-top: 0; }
    .check { margin-bottom: 15px; }
    .check h4 { margin-bottom: 5px; }
    .pass { color: green; }
    .fail { color: red; }
    .element { margin-left: 20px; background: #f9f9f9; padding: 10px; border-left: 3px solid #ddd; margin-bottom: 5px; }
    .fix { font-style: italic; color: #666; }
  </style>
</head>
<body>
  <h1>Accessibility Report - OFO Development</h1>
  <p>Generated on ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <p>Total files checked: ${summary.totalFiles}</p>
    <p>Files with issues: ${summary.filesWithIssues}</p>
    <p>Files with errors: ${summary.filesWithErrors}</p>
    
    <h3>Issues by Check</h3>
    <ul>
  `;

  for (const [checkName, checkSummary] of Object.entries(
    summary.checkResults
  )) {
    html += `
      <li>
        <strong>${checkName}</strong>: 
        ${checkSummary.totalIssues} issues in ${checkSummary.filesWithIssues} files
      </li>
    `;
  }

  html += `
    </ul>
  </div>
  
  <h2>Detailed Results</h2>
  `;

  for (const result of results) {
    if (result.error) {
      html += `
        <div class="file">
          <h3>${result.filePath.replace(publicDir, "")}</h3>
          <p class="fail">Error: ${result.error}</p>
        </div>
      `;
      continue;
    }

    const hasIssues = Object.values(result.results).some(
      (check) => !check.pass
    );

    html += `
      <div class="file">
        <h3>${result.filePath.replace(publicDir, "")}</h3>
        <p>${
          hasIssues
            ? '<span class="fail">Has issues</span>'
            : '<span class="pass">No issues</span>'
        }</p>
    `;

    for (const [checkName, checkResult] of Object.entries(result.results)) {
      html += `
        <div class="check">
          <h4>${checkName}: ${
        checkResult.pass
          ? '<span class="pass">Pass</span>'
          : '<span class="fail">Fail</span>'
      }</h4>
      `;

      if (!checkResult.pass) {
        for (const element of checkResult.elements) {
          html += `
            <div class="element">
              <p><strong>Element:</strong> ${element.tag}</p>
          `;

          for (const [key, value] of Object.entries(element)) {
            if (key !== "tag" && key !== "fix") {
              html += `<p><strong>${key}:</strong> ${value}</p>`;
            }
          }

          html += `<p class="fix"><strong>Fix:</strong> ${element.fix}</p></div>`;
        }
      }

      html += `</div>`;
    }

    html += `</div>`;
  }

  html += `
  </body>
  </html>
  `;

  const htmlReportPath = path.join(
    reportDir,
    `accessibility-report-${new Date().toISOString().slice(0, 10)}.html`
  );
  await writeFile(htmlReportPath, html);
  console.log(`HTML report saved to: ${htmlReportPath}`);

  return htmlReportPath;
}

// Main function
async function main() {
  console.log("Starting accessibility check...\n");

  try {
    const data = await checkAllHtmlFiles();
    const htmlReportPath = await generateHtmlReport(data);

    console.log("\nAccessibility Check Summary:");
    console.log(`Total files checked: ${data.summary.totalFiles}`);
    console.log(`Files with issues: ${data.summary.filesWithIssues}`);
    console.log(`Files with errors: ${data.summary.filesWithErrors}`);

    console.log("\nTop issues:");
    const sortedChecks = Object.entries(data.summary.checkResults)
      .sort((a, b) => b[1].totalIssues - a[1].totalIssues)
      .slice(0, 3);

    for (const [checkName, checkSummary] of sortedChecks) {
      if (checkSummary.totalIssues > 0) {
        console.log(
          `- ${checkName}: ${checkSummary.totalIssues} issues in ${checkSummary.filesWithIssues} files`
        );
      }
    }

    console.log(
      `\n✨ Accessibility check completed. View the HTML report at: ${htmlReportPath}`
    );
  } catch (err) {
    console.error("Error running accessibility check:", err);
    process.exit(1);
  }
}

// Run the script
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
