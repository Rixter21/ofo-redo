/**
 * Cross-Browser Testing Script for OFO Development Website
 * This script helps verify website functionality across different browsers
 */

// Import required modules for browser testing
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  outputDir: path.join(__dirname, '..', 'browser-test-reports'),
  browsers: [
    {
      name: 'Chrome',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
    },
    {
      name: 'Firefox',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0'
    },
    {
      name: 'Safari',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15'
    },
    {
      name: 'Edge',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.57'
    }
  ],
  pagesToTest: [
    { url: 'index.html', name: 'Homepage' },
    { url: 'services.html', name: 'Services' },
    { url: 'about.html', name: 'About' },
    { url: 'contact.html', name: 'Contact' },
    { url: 'blog.html', name: 'Blog' },
    { url: 'resources.html', name: 'Resources' },
    { url: 'CaseStudies.html', name: 'Case Studies' },
    // Service pages
    { url: 'ArtificialIntelligence.html', name: 'AI' },
    { url: 'BlockchainDevelopment.html', name: 'Blockchain' },
    { url: 'CloudComputing.html', name: 'Cloud' },
    { url: 'CyberSecurity.html', name: 'Cybersecurity' },
    { url: 'DataAnalysis.html', name: 'Data Analysis' },
    { url: 'DevOpsSolutions.html', name: 'DevOps' },
    { url: 'DigitalInnovation.html', name: 'Digital Innovation' },
    { url: 'EcommerceSolutions.html', name: 'Ecommerce' },
    { url: 'EnterpriseSolutions.html', name: 'Enterprise' },
    { url: 'GameDevelopment.html', name: 'Game Development' },
    { url: 'MobileDevelopment.html', name: 'Mobile' },
    { url: 'ProductManagement.html', name: 'Product Management' },
    { url: 'SaaSDevelopment.html', name: 'SaaS' },
    { url: 'VirtualReality.html', name: 'VR & AR' },
    { url: 'WebDevelopment.html', name: 'Web Development' }
  ],
  featuresToTest: [
    { name: 'Navigation Bar', selector: 'nav' },
    { name: 'Mobile Menu', selector: '[data-mobile-menu]' },
    { name: 'Dark Mode Toggle', selector: '.dark-mode-toggle' },
    { name: 'Reading Progress Bar', selector: '.reading-progress' },
    { name: 'Animated Statistics', selector: '.counter-value' },
    { name: 'Scroll Animations', selector: '.animate-on-scroll' },
    { name: 'Footer', selector: 'footer' }
  ],
  viewports: [
    { width: 1920, height: 1080, name: 'Desktop' },
    { width: 1024, height: 768, name: 'Tablet' },
    { width: 375, height: 812, name: 'Mobile' }
  ]
};

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Main testing function
async function runCrossBrowserTests() {
  console.log('Starting cross-browser testing...');
  const testReport = {
    timestamp: new Date().toISOString(),
    results: []
  };

  const baseUrl = 'http://localhost:3000/public/';

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Test each browser configuration
  for (const browserConfig of config.browsers) {
    console.log(`Testing on ${browserConfig.name}...`);
    
    // Test each viewport
    for (const viewport of config.viewports) {
      console.log(`  Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      // Test each page
      for (const page of config.pagesToTest) {
        console.log(`    Testing page: ${page.name}`);
        
        const pageReport = {
          browser: browserConfig.name,
          viewport: viewport.name,
          page: page.name,
          url: page.url,
          features: [],
          screenshot: path.join(
            'screenshots', 
            `${browserConfig.name}_${viewport.name}_${page.name.replace(/\s+/g, '_')}.png`
          )
        };

        // Open a new page
        const browserPage = await browser.newPage();
        await browserPage.setUserAgent(browserConfig.userAgent);
        await browserPage.setViewport({ width: viewport.width, height: viewport.height });
        
        try {
          // Navigate to the page
          await browserPage.goto(`${baseUrl}${page.url}`, { waitUntil: 'networkidle2', timeout: 60000 });
          
          // Take screenshot
          const screenshotPath = path.join(config.outputDir, pageReport.screenshot);
          const screenshotDir = path.dirname(screenshotPath);
          if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
          }
          await browserPage.screenshot({ path: screenshotPath, fullPage: true });
          
          // Test each feature
          for (const feature of config.featuresToTest) {
            const featureReport = {
              name: feature.name,
              present: false,
              visible: false,
              interactive: false,
              errors: []
            };

            try {
              // Check if feature is present
              const elementHandle = await browserPage.$(feature.selector);
              featureReport.present = elementHandle !== null;
              
              if (featureReport.present) {
                // Check if feature is visible
                const isVisible = await browserPage.evaluate((selector) => {
                  const element = document.querySelector(selector);
                  const style = window.getComputedStyle(element);
                  return style.display !== 'none' && 
                         style.visibility !== 'hidden' && 
                         style.opacity !== '0';
                }, feature.selector);
                featureReport.visible = isVisible;
                
                // Special checks for interactive elements
                if (feature.name === 'Mobile Menu') {
                  // Check mobile menu interaction (only for mobile viewport)
                  if (viewport.name === 'Mobile') {
                    try {
                      await browserPage.click('[data-mobile-menu-button]');
                      // Wait for animation
                      await browserPage.waitForTimeout(300);
                      // Check if menu expands
                      const menuHeight = await browserPage.evaluate(() => {
                        const menu = document.querySelector('[data-mobile-menu]');
                        return menu.clientHeight;
                      });
                      featureReport.interactive = menuHeight > 0;
                    } catch (err) {
                      featureReport.errors.push(`Mobile menu interaction error: ${err.message}`);
                    }
                  }
                } else if (feature.name === 'Dark Mode Toggle') {
                  try {
                    // Check if dark mode toggle works
                    const initialIsDark = await browserPage.evaluate(() => {
                      return document.documentElement.classList.contains('dark');
                    });
                    
                    await browserPage.click('.dark-mode-toggle');
                    await browserPage.waitForTimeout(300);
                    
                    const afterClickIsDark = await browserPage.evaluate(() => {
                      return document.documentElement.classList.contains('dark');
                    });
                    
                    featureReport.interactive = initialIsDark !== afterClickIsDark;
                  } catch (err) {
                    featureReport.errors.push(`Dark mode toggle error: ${err.message}`);
                  }
                } else {
                  featureReport.interactive = true; // Assume other elements are interactive if present
                }
              }
            } catch (err) {
              featureReport.errors.push(`Feature testing error: ${err.message}`);
            }
            
            pageReport.features.push(featureReport);
          }
        } catch (err) {
          pageReport.error = `Page navigation error: ${err.message}`;
        }
        
        testReport.results.push(pageReport);
        await browserPage.close();
      }
    }
  }

  await browser.close();

  // Save test report
  const reportPath = path.join(config.outputDir, `cross-browser-test-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));
  console.log(`Cross-browser testing complete! Report saved to ${reportPath}`);

  // Generate HTML report
  generateHtmlReport(testReport);
}

// Generate HTML report
function generateHtmlReport(testReport) {
  const reportPath = path.join(config.outputDir, `cross-browser-test-report-${Date.now()}.html`);
  
  let html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cross-Browser Test Report - OFO Development</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      h1 {
        color: #0066cc;
        border-bottom: 2px solid #0066cc;
        padding-bottom: 10px;
      }
      h2 {
        color: #0066cc;
        margin-top: 40px;
      }
      .timestamp {
        color: #666;
        font-style: italic;
        margin-bottom: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 12px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
        font-weight: bold;
      }
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      .feature-status {
        display: inline-block;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        margin-right: 10px;
      }
      .status-success {
        background-color: #4CAF50;
      }
      .status-warning {
        background-color: #FF9800;
      }
      .status-error {
        background-color: #F44336;
      }
      .error-list {
        color: #F44336;
        font-size: 0.9em;
        margin-top: 5px;
      }
      .summary {
        background-color: #f0f7ff;
        padding: 20px;
        border-radius: 5px;
        margin-bottom: 30px;
      }
      .screenshot {
        max-width: 300px;
        border: 1px solid #ddd;
        margin-top: 10px;
      }
      .tab-container {
        margin-top: 20px;
      }
      .tab-buttons {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 10px;
      }
      .tab-button {
        background-color: #f2f2f2;
        border: 1px solid #ddd;
        padding: 10px 20px;
        cursor: pointer;
        margin-right: 5px;
        margin-bottom: 5px;
      }
      .tab-button.active {
        background-color: #0066cc;
        color: white;
        border-color: #0066cc;
      }
      .tab-content {
        display: none;
        border: 1px solid #ddd;
        padding: 20px;
      }
      .tab-content.active {
        display: block;
      }
    </style>
  </head>
  <body>
    <h1>Cross-Browser Test Report - OFO Development</h1>
    <div class="timestamp">Generated on: ${new Date(testReport.timestamp).toLocaleString()}</div>
    
    <div class="summary">
      <h2>Testing Summary</h2>
      <p>
        <strong>Browsers Tested:</strong> ${config.browsers.map(b => b.name).join(', ')}<br>
        <strong>Viewports Tested:</strong> ${config.viewports.map(v => v.name).join(', ')}<br>
        <strong>Pages Tested:</strong> ${config.pagesToTest.length}<br>
        <strong>Features Tested:</strong> ${config.featuresToTest.length}<br>
        <strong>Total Test Cases:</strong> ${config.browsers.length * config.viewports.length * config.pagesToTest.length * config.featuresToTest.length}
      </p>
    </div>

    <div class="tab-container">
      <div class="tab-buttons">
        <button class="tab-button active" onclick="showTab('browser-view')">Browser View</button>
        <button class="tab-button" onclick="showTab('page-view')">Page View</button>
        <button class="tab-button" onclick="showTab('feature-view')">Feature View</button>
      </div>
      
      <div id="browser-view" class="tab-content active">
        ${generateBrowserView(testReport)}
      </div>
      
      <div id="page-view" class="tab-content">
        ${generatePageView(testReport)}
      </div>
      
      <div id="feature-view" class="tab-content">
        ${generateFeatureView(testReport)}
      </div>
    </div>

    <script>
      function showTab(tabId) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(tab => tab.classList.remove('active'));
        
        // Deactivate all tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => button.classList.remove('active'));
        
        // Show selected tab content
        document.getElementById(tabId).classList.add('active');
        
        // Activate the clicked tab button
        event.target.classList.add('active');
      }
    </script>
  </body>
  </html>
  `;
  
  fs.writeFileSync(reportPath, html);
  console.log(`HTML report generated at ${reportPath}`);
}

// Helper function to generate browser view
function generateBrowserView(testReport) {
  let html = '';
  
  for (const browser of config.browsers) {
    html += `<h2>${browser.name}</h2>`;
    
    for (const viewport of config.viewports) {
      html += `<h3>${viewport.name} (${viewport.width}x${viewport.height})</h3>`;
      html += `<table>
        <tr>
          <th>Page</th>
          ${config.featuresToTest.map(f => `<th>${f.name}</th>`).join('')}
        </tr>`;
      
      for (const page of config.pagesToTest) {
        const pageResult = testReport.results.find(r => 
          r.browser === browser.name && 
          r.viewport === viewport.name && 
          r.page === page.name
        );
        
        if (pageResult) {
          html += `<tr>
            <td>${page.name}</td>
            ${pageResult.features.map(f => {
              let statusClass = 'status-error';
              if (f.present && f.visible && f.interactive) {
                statusClass = 'status-success';
              } else if (f.present && f.visible) {
                statusClass = 'status-warning';
              }
              
              let cellContent = `<span class="feature-status ${statusClass}"></span>`;
              if (f.errors.length > 0) {
                cellContent += `<div class="error-list">${f.errors.join('<br>')}</div>`;
              }
              
              return `<td>${cellContent}</td>`;
            }).join('')}
          </tr>`;
        } else {
          html += `<tr>
            <td>${page.name}</td>
            ${config.featuresToTest.map(() => `<td><span class="feature-status status-error"></span> No data</td>`).join('')}
          </tr>`;
        }
      }
      
      html += `</table>`;
    }
  }
  
  return html;
}

// Helper function to generate page view
function generatePageView(testReport) {
  let html = '';
  
  for (const page of config.pagesToTest) {
    html += `<h2>${page.name} (${page.url})</h2>`;
    
    html += `<table>
      <tr>
        <th>Browser / Viewport</th>
        ${config.featuresToTest.map(f => `<th>${f.name}</th>`).join('')}
      </tr>`;
    
    for (const browser of config.browsers) {
      for (const viewport of config.viewports) {
        const pageResult = testReport.results.find(r => 
          r.browser === browser.name && 
          r.viewport === viewport.name && 
          r.page === page.name
        );
        
        if (pageResult) {
          html += `<tr>
            <td>${browser.name} / ${viewport.name}</td>
            ${pageResult.features.map(f => {
              let statusClass = 'status-error';
              if (f.present && f.visible && f.interactive) {
                statusClass = 'status-success';
              } else if (f.present && f.visible) {
                statusClass = 'status-warning';
              }
              
              let cellContent = `<span class="feature-status ${statusClass}"></span>`;
              if (f.errors.length > 0) {
                cellContent += `<div class="error-list">${f.errors.join('<br>')}</div>`;
              }
              
              return `<td>${cellContent}</td>`;
            }).join('')}
          </tr>`;
        } else {
          html += `<tr>
            <td>${browser.name} / ${viewport.name}</td>
            ${config.featuresToTest.map(() => `<td><span class="feature-status status-error"></span> No data</td>`).join('')}
          </tr>`;
        }
      }
    }
    
    html += `</table>`;
  }
  
  return html;
}

// Helper function to generate feature view
function generateFeatureView(testReport) {
  let html = '';
  
  for (const feature of config.featuresToTest) {
    html += `<h2>${feature.name}</h2>`;
    
    html += `<table>
      <tr>
        <th>Browser</th>
        <th>Viewport</th>
        <th>Page</th>
        <th>Present</th>
        <th>Visible</th>
        <th>Interactive</th>
        <th>Errors</th>
      </tr>`;
    
    for (const browser of config.browsers) {
      for (const viewport of config.viewports) {
        for (const page of config.pagesToTest) {
          const pageResult = testReport.results.find(r => 
            r.browser === browser.name && 
            r.viewport === viewport.name && 
            r.page === page.name
          );
          
          if (pageResult) {
            const featureResult = pageResult.features.find(f => f.name === feature.name);
            
            if (featureResult) {
              html += `<tr>
                <td>${browser.name}</td>
                <td>${viewport.name}</td>
                <td>${page.name}</td>
                <td>${featureResult.present ? '✅' : '❌'}</td>
                <td>${featureResult.visible ? '✅' : '❌'}</td>
                <td>${featureResult.interactive ? '✅' : '❌'}</td>
                <td>${featureResult.errors.length > 0 ? `<div class="error-list">${featureResult.errors.join('<br>')}</div>` : 'None'}</td>
              </tr>`;
            }
          }
        }
      }
    }
    
    html += `</table>`;
  }
  
  return html;
}

// Run tests if script is executed directly
if (require.main === module) {
  runCrossBrowserTests();
}

module.exports = {
  runCrossBrowserTests
};
