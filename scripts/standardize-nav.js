const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

// Read the standard navigation from index.html
const indexHtml = fs.readFileSync(
  path.join(__dirname, "../public/index.html"),
  "utf8"
);
const $index = cheerio.load(indexHtml);
const standardNav = $index("nav").parent().html(); // Get the nav element and its container

// Get all HTML files
const publicDir = path.join(__dirname, "../public");
const caseStudiesDir = path.join(__dirname, "../case-studies");

// Function to process HTML files in a directory
function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    if (path.extname(file) === ".html" && file !== "index.html") {
      const filePath = path.join(directory, file);
      console.log(`Processing: ${filePath}`);

      try {
        const html = fs.readFileSync(filePath, "utf8");
        const $ = cheerio.load(html);

        // Replace the navigation
        $("nav").parent().html(standardNav);

        // Write the updated HTML back to the file
        fs.writeFileSync(filePath, $.html());
        console.log(`Updated navigation in: ${file}`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
  });
}

// Process both directories
processDirectory(publicDir);
processDirectory(caseStudiesDir);

console.log("Navigation standardization complete!");
