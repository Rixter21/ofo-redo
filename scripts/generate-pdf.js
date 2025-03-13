/**
 * PDF Generator Script for OFO Development Website
 * Generates downloadable PDFs for key solution pages
 */

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Configuration
const config = {
  outputDir: path.join(__dirname, "..", "public", "assets", "pdf"),
  baseUrl: "http://localhost:3000",
  pagesToConvert: [
    {
      url: "/ArtificialIntelligence.html",
      filename: "OFO-AI-Solutions.pdf",
      title: "OFO Artificial Intelligence Solutions",
    },
    {
      url: "/BlockchainDevelopment.html",
      filename: "OFO-Blockchain-Solutions.pdf",
      title: "OFO Blockchain Development Solutions",
    },
    {
      url: "/CloudComputing.html",
      filename: "OFO-Cloud-Solutions.pdf",
      title: "OFO Cloud Computing Solutions",
    },
    {
      url: "/CyberSecurity.html",
      filename: "OFO-Cybersecurity-Solutions.pdf",
      title: "OFO Cybersecurity Solutions",
    },
    {
      url: "/WebDevelopment.html",
      filename: "OFO-Web-Development.pdf",
      title: "OFO Web Development Solutions",
    },
    {
      url: "/MobileDevelopment.html",
      filename: "OFO-Mobile-Development.pdf",
      title: "OFO Mobile Development Solutions",
    },
    {
      url: "/CustomSoftwareDevelopment.html",
      filename: "OFO-Custom-Software.pdf",
      title: "OFO Custom Software Development",
    },
    {
      url: "/EnterpriseSolutions.html",
      filename: "OFO-Enterprise-Solutions.pdf",
      title: "OFO Enterprise Solutions",
    },
  ],
  pdfOptions: {
    format: "A4",
    margin: {
      top: "40px",
      right: "40px",
      bottom: "40px",
      left: "40px",
    },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="width: 100%; font-size: 10px; padding: 5px 5px 0; color: #666; position: relative;">
        <div style="position: absolute; left: 40px; top: 15px;">
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAABMUlEQVR4nO3csQ0CQQAEwSuCt14kQP8hIgPTEihAeKSarSBw8mjWAAAAAAAAAAAAAAAAAAAA3vIs1jfvYn0jArIIyCIgi4AsArIIyCIgi4AsArIIyCIgi4AsArIIyCIgi4AsArIIyCIgi4AsArIIyCIgi4AsArIIyCIgi4AsArIIyCIgi4AsO4CxWJ+cxvoXIwiyLAHHYn0yArJsAMZifTICsggAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIA/9wVhvRuI3l3iEwAAAABJRU5ErkJggg==" width="100px">
        </div>
        <div style="position: absolute; right: 40px; top: 15px;">
          <span><%= title %></span>
        </div>
      </div>
    `,
    footerTemplate: `
      <div style="width: 100%; font-size: 10px; padding: 0 5px 5px; color: #666; text-align: center;">
        <div>
          <span>© ${new Date().getFullYear()} OFO Development LLC. All rights reserved.</span>
        </div>
        <div>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      </div>
    `,
  },
};

/**
 * Ensure output directory exists
 */
async function ensureOutputDir() {
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
}

/**
 * Generate PDF from a service page
 * @param {Browser} browser - Puppeteer browser instance
 * @param {Object} pageConfig - Page configuration
 * @returns {Promise<string>} - Path to the generated PDF
 */
async function generatePDF(browser, pageConfig) {
  console.log(`Generating PDF for ${pageConfig.url}...`);

  // Create a new page
  const page = await browser.newPage();

  try {
    // Navigate to the service page
    await page.goto(`${config.baseUrl}${pageConfig.url}`, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Prepare page for PDF generation
    await page.addStyleTag({
      content: `
        /* PDF-specific styles */
        .reading-progress, .dark-mode-toggle, button[onclick*="scrollTo"] {
          display: none !important;
        }
        nav {
          position: relative !important;
          background: #111827 !important;
        }
        footer {
          margin-top: 20px;
          padding-top: 20px;
        }
        /* Print optimization */
        @page {
          size: A4;
          margin: 40px;
        }
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        /* Ensure all sections are visible */
        .animate-on-scroll {
          opacity: 1 !important;
          transform: none !important;
          visibility: visible !important;
        }
        /* Set counters to their final values */
        .counter-value {
          opacity: 1 !important;
        }
      `,
    });

    // Set counter values
    await page.evaluate(() => {
      document.querySelectorAll(".counter-value").forEach((counter) => {
        const targetValue = counter.getAttribute("data-count");
        const prefix = counter.getAttribute("data-prefix") || "";
        const suffix = counter.getAttribute("data-suffix") || "";
        counter.textContent = `${prefix}${targetValue}${suffix}`;
      });
    });

    // Generate the PDF
    const pdfOptions = {
      ...config.pdfOptions,
      path: path.join(config.outputDir, pageConfig.filename),
    };

    // Replace title in header template
    pdfOptions.headerTemplate = pdfOptions.headerTemplate.replace(
      "<%= title %>",
      pageConfig.title
    );

    await page.pdf(pdfOptions);

    console.log(`✅ PDF generated: ${pageConfig.filename}`);
    return pdfOptions.path;
  } catch (error) {
    console.error(`❌ Error generating PDF for ${pageConfig.url}:`, error);
    throw error;
  } finally {
    await page.close();
  }
}

/**
 * Create download links in service pages
 * @param {Browser} browser - Puppeteer browser instance
 * @param {Array} generatedPDFs - List of generated PDFs
 */
async function createDownloadLinks(browser, generatedPDFs) {
  for (const pageConfig of config.pagesToConvert) {
    const pdfPath = path.join(config.outputDir, pageConfig.filename);
    if (!fs.existsSync(pdfPath)) continue;

    console.log(`Adding download link to ${pageConfig.url}...`);

    const page = await browser.newPage();

    try {
      await page.goto(`${config.baseUrl}${pageConfig.url}`, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Add download button below the hero section
      await page.evaluate(
        (pdfFilename, title) => {
          const heroSection = document.querySelector("section");
          if (!heroSection) return;

          // Create download button element
          const downloadButton = document.createElement("div");
          downloadButton.className = "container mx-auto px-6 py-4 text-center";
          downloadButton.innerHTML = `
          <a 
            href="assets/pdf/${pdfFilename}" 
            class="inline-flex items-center px-5 py-3 rounded-lg bg-yellow-500 text-black font-medium hover:bg-yellow-600 transition-colors" 
            download="${title}"
            onclick="if(window.OFOAnalytics) OFOAnalytics.trackAction('Resources', 'Download', '${title}')"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Download PDF Version
          </a>
        `;

          // Insert after hero section
          heroSection.parentNode.insertBefore(
            downloadButton,
            heroSection.nextSibling
          );
        },
        pageConfig.filename,
        pageConfig.title
      );

      // Save the page with the new download button
      const html = await page.content();
      const pagePath = path.join(__dirname, "..", "public", pageConfig.url);

      fs.writeFileSync(pagePath, html, "utf8");
      console.log(`✅ Download link added to ${pageConfig.url}`);
    } catch (error) {
      console.error(
        `❌ Error adding download link to ${pageConfig.url}:`,
        error
      );
    } finally {
      await page.close();
    }
  }
}

/**
 * Main function to generate PDFs for all service pages
 */
async function main() {
  await ensureOutputDir();

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const generatedPDFs = [];

  try {
    // Generate PDFs for all service pages
    for (const pageConfig of config.pagesToConvert) {
      try {
        const pdfPath = await generatePDF(browser, pageConfig);
        generatedPDFs.push(pdfPath);
      } catch (error) {
        console.error(`Error generating PDF for ${pageConfig.url}:`, error);
      }
    }

    // Add download links to service pages
    await createDownloadLinks(browser, generatedPDFs);
  } catch (error) {
    console.error("Error generating PDFs:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }

  console.log("✅ PDF generation complete");
}

// Run script if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
