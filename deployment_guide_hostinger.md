# Deployment Guide for OFO Development Website on Hostinger

This guide provides step-by-step instructions for deploying the OFO Development website to Hostinger hosting.

## Prerequisites

Before starting the deployment process, ensure you have:

1. A Hostinger account with an active hosting plan
2. Domain name configured in Hostinger (e.g., ofodevelopment.com)
3. FTP credentials for your Hostinger account
4. Node.js and npm installed on your local machine
5. Git repository with the latest version of the website

## Step 1: Prepare Your Website for Production

Before deploying, run the following scripts to prepare your website for production:

```bash
# Clean up unnecessary files
node scripts/cleanup.js

# Optimize and minify assets
node scripts/optimize-assets.js

# Update service worker cache configuration
node scripts/update-service-worker.js

# Run accessibility checks
node scripts/accessibility-checker.js

# Run cross-browser tests
node scripts/cross-browser-test.js
```

## Step 2: Set Up Environment Variables

1. Log in to your Hostinger account and navigate to your hosting dashboard
2. Go to "Advanced" > "Environment Variables"
3. Add the following environment variables:

```
NODE_ENV=production
PORT=3000
MAIL_HOST=your-smtp-server.com
MAIL_USER=your-email@example.com
MAIL_PASS=your-email-password
MAIL_PORT=587
MAIL_FROM=your-email@example.com
MAIL_SECURE=false
```

## Step 3: Upload Files to Hostinger

### Option 1: Using FTP

1. Connect to your Hostinger account using an FTP client (e.g., FileZilla)
2. Navigate to the public_html directory
3. Upload the following files and directories:
   - public/ (all contents)
   - server.js
   - package.json
   - package-lock.json
   - .env (with production settings)
   - 404.html
   - email.html

### Option 2: Using Git (if supported by your Hostinger plan)

1. Log in to your Hostinger account via SSH
2. Navigate to the public_html directory
3. Clone your repository:
   ```bash
   git clone https://github.com/yourusername/ofo-development.git .
   ```
4. Install dependencies:
   ```bash
   npm install --production
   ```

## Step 4: Configure Node.js Application

1. Log in to your Hostinger account and navigate to your hosting dashboard
2. Go to "Website" > "Node.js"
3. Enable Node.js support
4. Set the following configuration:
   - Entry point: server.js
   - Node.js version: 16.x (or latest LTS)
   - Start command: `node server.js`
   - Application URL: your domain (e.g., ofodevelopment.com)

## Step 5: Set Up SSL Certificate

1. In your Hostinger dashboard, go to "SSL/TLS"
2. Click "Install" next to "Let's Encrypt"
3. Select your domain and click "Install"
4. Wait for the SSL certificate to be issued and installed

## Step 6: Configure Domain and DNS

1. In your Hostinger dashboard, go to "Domains"
2. Click on your domain
3. Ensure the DNS records are correctly configured:
   - A record pointing to your Hostinger server IP
   - CNAME record for www pointing to your domain

## Step 7: Set Up Redirects

1. In your Hostinger dashboard, go to "Website" > "Redirects"
2. Add the following redirects:
   - HTTP to HTTPS redirect (if not automatically configured)
   - www to non-www redirect (or vice versa, depending on your preference)

## Step 8: Configure Cron Jobs for Monitoring

1. In your Hostinger dashboard, go to "Advanced" > "Cron Jobs"
2. Add a new cron job to run the monitoring script:
   - Command: `node /home/username/public_html/scripts/setup-monitoring.js --cron`
   - Frequency: Every hour (0 \* \* \* \*)

## Step 9: Test Your Deployment

1. Visit your website at https://yourdomain.com
2. Test all major functionality:
   - Navigation
   - Contact form
   - Service pages
   - Case studies
3. Check for any console errors or broken links

## Step 10: Set Up Monitoring and Analytics

1. Set up Uptime Robot or a similar service to monitor your website
2. Configure Google Analytics or your preferred analytics solution
3. Set up email notifications for server errors

## Troubleshooting

### Common Issues and Solutions

1. **Node.js application not starting**

   - Check the application logs in Hostinger dashboard
   - Ensure all dependencies are installed
   - Verify environment variables are set correctly

2. **Missing assets or broken links**

   - Check if all files were uploaded correctly
   - Verify file permissions (should be 644 for files, 755 for directories)

3. **Contact form not working**

   - Verify SMTP settings in environment variables
   - Check server logs for email sending errors

4. **SSL certificate issues**
   - Ensure domain DNS is correctly configured
   - Wait for DNS propagation (can take up to 24-48 hours)
   - Verify SSL certificate installation in Hostinger dashboard

### Getting Help

If you encounter issues not covered in this guide:

1. Check Hostinger's knowledge base: https://support.hostinger.com/
2. Contact Hostinger support through your dashboard
3. Review Node.js application logs for specific error messages

## Maintenance

### Regular Maintenance Tasks

1. **Weekly**

   - Check monitoring reports
   - Review server logs for errors

2. **Monthly**

   - Update Node.js dependencies
   - Run security audits: `npm audit`
   - Back up website files and database

3. **Quarterly**
   - Review and update content
   - Check for broken links
   - Run performance tests

## Conclusion

Your OFO Development website should now be successfully deployed to Hostinger. This guide covers the basic deployment process, but you may need to adjust some steps based on your specific Hostinger plan and requirements.

Remember to keep your Node.js application and dependencies updated to ensure security and performance.
