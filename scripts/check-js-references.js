const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

// Function to check JS references in HTML files
function checkJsReferences(directory) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    if (path.extname(file) === ".html") {
      const filePath = path.join(directory, file);
      const html = fs.readFileSync(filePath, "utf8");
      const $ = cheerio.load(html);

      // Get all script tags
      const scripts = [];
      $("script").each((i, el) => {
        const src = $(el).attr("src");
        if (src) scripts.push(src);
      });

      console.log(`${file}: ${scripts.join(", ")}`);

      // Check if main.js and components.js are included
      const hasMainJs = scripts.some((src) => src.includes("main.js"));
      const hasComponentsJs = scripts.some((src) =>
        src.includes("components.js")
      );

      if (!hasMainJs) {
        console.warn(`WARNING: ${file} is missing main.js reference`);
      }

      if (!hasComponentsJs) {
        console.warn(`WARNING: ${file} is missing components.js reference`);
      }
    }
  });
}

// Check both directories
checkJsReferences(path.join(__dirname, "../public"));
checkJsReferences(path.join(__dirname, "../case-studies"));
