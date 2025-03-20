# OFO Development Website Production Readiness Guide

## Overview

This document outlines the necessary steps and best practices to prepare the OFO Development website for production deployment. It covers security, performance, monitoring, and maintenance considerations.

## Security Implementation

### HTTPS Setup with Hostinger

1. **SSL Certificate Installation**

   - Log in to Hostinger control panel
   - Navigate to SSL/TLS section
   - Enable Let's Encrypt free SSL certificate for ofodevelopment.com
   - Ensure both www and non-www domains are covered
   - Set up auto-renewal for certificates

2. **Security Headers Implementation**

   ```javascript
   // Add to server.js
   const helmet = require("helmet");

   // Basic security headers
   app.use(helmet());

   // Custom CSP policy
   app.use(
     helmet.contentSecurityPolicy({
       directives: {
         defaultSrc: ["'self'"],
         scriptSrc: [
           "'self'",
           "'unsafe-inline'",
           "cdn.tailwindcss.com",
           "unpkg.com",
         ],
         styleSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com"],
         imgSrc: ["'self'", "data:", "*.webp"],
         connectSrc: ["'self'"],
         fontSrc: ["'self'"],
         objectSrc: ["'none'"],
         mediaSrc: ["'self'"],
         frameSrc: ["'none'"],
       },
     })
   );

   // HSTS header
   app.use(
     helmet.hsts({
       maxAge: 15552000, // 180 days in seconds
       includeSubDomains: true,
       preload: true,
     })
   );
   ```

3. **Environment Variables & Secrets**

   - Move email credentials to environment variables on Hostinger
   - Update .env file to use placeholders for sensitive information
   - Consider using Hostinger's environment variables feature

4. **API Protection**

   ```javascript
   // Add to server.js
   const rateLimit = require("express-rate-limit");

   // Rate limiting for email endpoint
   const emailLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5, // 5 requests per windowMs
     message: { message: "Too many requests, please try again later" },
   });

   // Apply rate limiting to email endpoint
   app.post("/send-email", emailLimiter, async (req, res) => {
     // Existing email handling code
   });
   ```

## Performance Optimization

1. **Asset Optimization**

   ```javascript
   // Add to package.json scripts
   "scripts": {
     "build": "npm run build:css && npm run build:js",
     "build:css": "postcss public/assets/css/styles.css -o public/assets/css/styles.css --minify",
     "build:js": "terser public/assets/js/main.js -o public/assets/js/main.min.js",
     "prebuild": "rm -rf public/assets/css/output.min.css public/assets/js/main.min.js",
     "postbuild": "echo 'Build completed successfully'"
   }
   ```

2. **Service Worker Updates**

   - Update CACHE_NAME in service-worker.js to reflect production version
   - Ensure all critical assets are included in the precache list
   - Implement proper update flow for service worker changes

3. **Image Optimization**
   - Verify all images are in WebP format
   - Implement responsive images with srcset
   - Ensure proper lazy loading for below-fold images

## Monitoring & Reliability

1. **Logging System Implementation**

   ```javascript
   // Add to server.js
   const winston = require("winston");

   // Create logger
   const logger = winston.createLogger({
     level: "info",
     format: winston.format.json(),
     defaultMeta: { service: "ofo-website" },
     transports: [
       new winston.transports.File({ filename: "error.log", level: "error" }),
       new winston.transports.File({ filename: "combined.log" }),
     ],
   });

   // If not in production, log to console
   if (process.env.NODE_ENV !== "production") {
     logger.add(
       new winston.transports.Console({
         format: winston.format.simple(),
       })
     );
   }

   // Use in request handling
   app.use((req, res, next) => {
     logger.info(`${req.method} ${req.url}`);
     next();
   });

   // Error handling middleware
   app.use((err, req, res, next) => {
     logger.error(
       `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
         req.method
       } - ${req.ip}`
     );
     res.status(err.status || 500).send("Server Error");
   });
   ```

2. **Monitoring & Alerting**
   - Set up Uptime Robot for basic uptime monitoring
   - Configure email alerts for downtime
   - Consider implementing application performance monitoring

## SEO & Analytics

1. **Analytics Implementation**

   ```html
   <!-- Add to head section of all pages -->
   <script
     async
     src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
   ></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag() {
       dataLayer.push(arguments);
     }
     gtag("js", new Date());
     gtag("config", "G-XXXXXXXXXX");
   </script>
   ```

2. **SEO Verification**
   - Verify all pages have proper meta tags
   - Check structured data implementation
   - Submit sitemap to Google Search Console

## User Experience Enhancements

1. **Accessibility Improvements**

   - Implement proper ARIA attributes
   - Ensure sufficient color contrast
   - Add keyboard navigation support

2. **Cookie Consent Implementation**

   ```html
   <!-- Add to all pages -->
   <div
     id="cookie-consent"
     class="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 hidden"
   >
     <div
       class="container mx-auto flex flex-col md:flex-row items-center justify-between"
     >
       <p class="mb-4 md:mb-0">
         We use cookies to enhance your experience. By continuing to visit this
         site you agree to our use of cookies.
       </p>
       <div class="flex space-x-4">
         <button id="accept-cookies" class="px-4 py-2 bg-amber-500 text-white">
           Accept
         </button>
         <a
           href="/privacy-policy.html"
           class="px-4 py-2 border border-white text-white"
           >Learn More</a
         >
       </div>
     </div>
   </div>

   <script>
     document.addEventListener("DOMContentLoaded", function () {
       const cookieConsent = document.getElementById("cookie-consent");
       const acceptButton = document.getElementById("accept-cookies");

       // Check if user has already accepted cookies
       if (!localStorage.getItem("cookiesAccepted")) {
         cookieConsent.classList.remove("hidden");
       }

       // Handle accept button click
       acceptButton.addEventListener("click", function () {
         localStorage.setItem("cookiesAccepted", "true");
         cookieConsent.classList.add("hidden");
       });
     });
   </script>
   ```

## DevOps & Deployment

1. **Deployment Checklist**

   - Run build process for CSS and JS minification
   - Verify all environment variables are set
   - Test all forms and interactive elements
   - Check mobile responsiveness
   - Verify SSL certificate installation

2. **Backup Strategy**
   - Set up regular backups of website files
   - Configure database backups if applicable
   - Test backup restoration process

## File Cleanup and Consolidation

1. **Files to Remove**

   - Duplicate server.js files (server.js.bak, server.js.fixed, server.js.new)
   - Temporary JSON fix scripts (fix-json-direct.js, fix-json-final.js, etc.)
   - Debug and audit logs (debug.log, audit.log, etc.)
   - Draft HTML files (web-development-draft.html, etc.)

2. **File Consolidation**
   - Merge todo.md and updated_todo.md
   - Consolidate audit files into a single comprehensive audit document
   - Organize CSS files into a more structured hierarchy

## Hostinger-Specific Configuration

1. **Domain Configuration**

   - Verify DNS settings in Hostinger control panel
   - Set up proper redirects from www to non-www (or vice versa)
   - Configure domain email accounts

2. **Server Configuration**

   - Set up Node.js environment in Hostinger
   - Configure proper process management (PM2)
   - Set up proper error pages

3. **Performance Settings**
   - Enable Hostinger's LiteSpeed Cache if available
   - Configure proper GZIP compression
   - Set up proper caching headers
