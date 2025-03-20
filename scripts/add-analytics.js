/**
 * Analytics Implementation Script for OFO Development Website
 * This script adds Google Analytics tracking to all HTML files
 */

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const glob = require("glob");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const globPromise = promisify(glob);

// Root directory
const rootDir = path.join(__dirname, "..");
const publicDir = path.join(rootDir, "public");

// Google Analytics tracking code template
const analyticsScript = `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=ANALYTICS_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'ANALYTICS_ID', {
    'anonymize_ip': true,
    'cookie_flags': 'SameSite=None;Secure',
    'cookie_expires': 365 * 24 * 60 * 60 // 1 year in seconds
  });
  
  // Custom event tracking for important user interactions
  document.addEventListener('DOMContentLoaded', function() {
    // Track contact form submissions
    const contactForm = document.querySelector('form[action*="send-email"]');
    if (contactForm) {
      contactForm.addEventListener('submit', function() {
        gtag('event', 'form_submission', {
          'event_category': 'Contact',
          'event_label': 'Contact Form'
        });
      });
    }
    
    // Track service card clicks
    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length > 0) {
      serviceCards.forEach(card => {
        card.addEventListener('click', function() {
          const serviceName = this.querySelector('h3')?.textContent || 'Unknown Service';
          gtag('event', 'service_click', {
            'event_category': 'Engagement',
            'event_label': serviceName
          });
        });
      });
    }
    
    // Track CTA button clicks
    const ctaButtons = document.querySelectorAll('.cta-button');
    if (ctaButtons.length > 0) {
      ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
          const buttonText = this.textContent || 'Unknown CTA';
          gtag('event', 'cta_click', {
            'event_category': 'Conversion',
            'event_label': buttonText
          });
        });
      });
    }
  });
</script>
<!-- End Google Analytics -->
`;

// Function to add analytics to HTML files
async function addAnalyticsToHtmlFiles(analyticsId) {
  console.log("Adding Google Analytics tracking to HTML files...");

  // Replace placeholder with actual analytics ID
  const analyticsCode = analyticsScript.replace(/ANALYTICS_ID/g, analyticsId);

  try {
    // Find all HTML files
    const htmlFiles = await globPromise("**/*.html", { cwd: publicDir });
    console.log(`Found ${htmlFiles.length} HTML files`);

    let successCount = 0;
    let skippedCount = 0;

    for (const file of htmlFiles) {
      const filePath = path.join(publicDir, file);
      console.log(`Processing ${file}...`);

      try {
        // Read file content
        const content = await readFile(filePath, "utf8");

        // Check if analytics is already added
        if (content.includes("googletagmanager.com")) {
          console.log(`⏭️ Analytics already present in ${file}, skipping`);
          skippedCount++;
          continue;
        }

        // Find </head> tag
        const headCloseIndex = content.indexOf("</head>");
        if (headCloseIndex === -1) {
          console.log(`⚠️ Could not find </head> tag in ${file}, skipping`);
          skippedCount++;
          continue;
        }

        // Insert analytics code before </head>
        const updatedContent =
          content.slice(0, headCloseIndex) +
          analyticsCode +
          content.slice(headCloseIndex);

        // Write updated content
        await writeFile(filePath, updatedContent);
        console.log(`✅ Added analytics to ${file}`);
        successCount++;
      } catch (err) {
        console.error(`❌ Error processing ${file}: ${err.message}`);
      }
    }

    console.log("\nAnalytics Implementation Summary:");
    console.log(`Total HTML files: ${htmlFiles.length}`);
    console.log(`Successfully added analytics: ${successCount}`);
    console.log(`Skipped files: ${skippedCount}`);

    return { successCount, skippedCount };
  } catch (err) {
    console.error("Error finding HTML files:", err);
    throw err;
  }
}

// Function to create analytics component
async function createAnalyticsComponent(analyticsId) {
  console.log("\nCreating analytics component...");

  const componentDir = path.join(publicDir, "components", "head");
  const componentPath = path.join(componentDir, "analytics.html");

  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true });
    }

    // Replace placeholder with actual analytics ID
    const analyticsCode = analyticsScript.replace(/ANALYTICS_ID/g, analyticsId);

    // Write component file
    await writeFile(componentPath, analyticsCode);
    console.log(`✅ Created analytics component at: ${componentPath}`);

    return componentPath;
  } catch (err) {
    console.error(`Error creating analytics component: ${err.message}`);
    throw err;
  }
}

// Function to update component loader
async function updateComponentLoader() {
  console.log("\nChecking for component loader...");

  const componentLoaderPath = path.join(
    publicDir,
    "assets",
    "js",
    "components.js"
  );

  if (!fs.existsSync(componentLoaderPath)) {
    console.log("⚠️ Component loader not found, skipping update");
    return false;
  }

  try {
    // Read component loader
    const content = await readFile(componentLoaderPath, "utf8");

    // Check if analytics component is already included
    if (content.includes("analytics.html")) {
      console.log(
        "⏭️ Analytics component already included in loader, skipping"
      );
      return false;
    }

    // Find head components section
    const headComponentsMatch = content.match(
      /const headComponents\s*=\s*\[([\s\S]*?)\]/
    );
    if (!headComponentsMatch) {
      console.log("⚠️ Could not find head components section, skipping");
      return false;
    }

    // Add analytics component to head components
    const headComponents = headComponentsMatch[1];
    const updatedHeadComponents = headComponents.trim()
      ? headComponents + ',\n  "components/head/analytics.html"'
      : '"components/head/analytics.html"';

    const updatedContent = content.replace(
      /const headComponents\s*=\s*\[([\s\S]*?)\]/,
      `const headComponents = [${updatedHeadComponents}]`
    );

    // Write updated content
    await writeFile(componentLoaderPath, updatedContent);
    console.log(`✅ Updated component loader to include analytics component`);

    return true;
  } catch (err) {
    console.error(`Error updating component loader: ${err.message}`);
    return false;
  }
}

// Main function
async function main() {
  // Get analytics ID from environment variable or command line argument
  const analyticsId =
    process.env.ANALYTICS_ID ||
    process.argv.find((arg) => arg.startsWith("--id="))?.split("=")[1] ||
    "UA-XXXXXXXXX-X";

  if (analyticsId === "UA-XXXXXXXXX-X") {
    console.log(
      "\n⚠️ Using placeholder analytics ID. For production, provide a real ID:"
    );
    console.log("  Option 1: Set ANALYTICS_ID environment variable");
    console.log(
      "  Option 2: Run with --id parameter: node scripts/add-analytics.js --id=UA-XXXXXXXX-X"
    );
  }

  console.log(`\nUsing Google Analytics ID: ${analyticsId}`);

  try {
    // Create analytics component
    await createAnalyticsComponent(analyticsId);

    // Update component loader if it exists
    const loaderUpdated = await updateComponentLoader();

    // Add analytics directly to HTML files
    const { successCount, skippedCount } = await addAnalyticsToHtmlFiles(
      analyticsId
    );

    console.log("\n✨ Analytics implementation completed!");
    console.log("\nNext steps:");
    console.log(
      "1. Replace the placeholder analytics ID with your actual Google Analytics ID"
    );
    console.log(
      "2. Test the analytics implementation using Google Analytics Debugger extension"
    );
    console.log("3. Verify that events are being tracked correctly");

    if (analyticsId === "UA-XXXXXXXXX-X") {
      console.log(
        "\n⚠️ Remember to update the analytics ID before deploying to production!"
      );
    }
  } catch (err) {
    console.error("\n❌ Error implementing analytics:", err);
    process.exit(1);
  }
}

// Run the script
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
