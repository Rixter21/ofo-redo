# OFO Development Website Deployment Checklist

This checklist outlines the steps required to deploy the OFO Development website to Hostinger production environment.

## Pre-Deployment Preparation

### Code Cleanup

- [ ] Consolidate todo files into a single todo.md
- [ ] Remove unnecessary files (see file_cleanup.md)
- [ ] Organize CSS files into a more structured hierarchy
- [ ] Ensure all HTML files use consistent components
- [ ] Remove any development-specific code or comments

### Build Process

- [ ] Run `npm run build:css` to minify CSS
- [ ] Run `npm run build:js` to minify JavaScript (if available)
- [ ] Verify all assets are optimized (images, fonts, etc.)
- [ ] Check for any unused assets that can be removed

### Testing

- [ ] Test all pages in multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify mobile responsiveness on different screen sizes
- [ ] Test all forms and interactive elements
- [ ] Verify all links work correctly
- [ ] Check for console errors
- [ ] Validate HTML and CSS
- [ ] Run accessibility checks
- [ ] Test service worker functionality

## Hostinger Setup

### Domain Configuration

- [ ] Log in to Hostinger control panel
- [ ] Verify domain settings for ofodevelopment.com
- [ ] Set up proper DNS records
- [ ] Configure www to non-www redirection (or vice versa)
- [ ] Set up domain email accounts if needed

### SSL Certificate

- [ ] Navigate to SSL/TLS section in Hostinger
- [ ] Enable Let's Encrypt free SSL certificate
- [ ] Ensure both www and non-www domains are covered
- [ ] Set up auto-renewal for certificates
- [ ] Test HTTPS functionality

### Node.js Environment

- [ ] Set up Node.js hosting environment in Hostinger
- [ ] Configure Node.js version (match development environment)
- [ ] Set up process management with PM2
  ```
  npm install pm2 -g
  pm2 start server.js --name "ofo-website"
  pm2 save
  pm2 startup
  ```
- [ ] Configure automatic restarts

### Environment Variables

- [ ] Set up environment variables in Hostinger
  - [ ] NODE_ENV=production
  - [ ] PORT=3000 (or as required by Hostinger)
  - [ ] MAIL_HOST=smtp.hostinger.com
  - [ ] MAIL_USER=info@ofodevelopment.com
  - [ ] MAIL_PASS=(secure password)
  - [ ] MAIL_PORT=587
  - [ ] MAIL_FROM=info@ofodevelopment.com
  - [ ] MAIL_SECURE=false
- [ ] Verify environment variables are loaded correctly

## Deployment

### File Upload

- [ ] Create a production-ready ZIP of the project
- [ ] Upload ZIP to Hostinger via FTP or control panel
- [ ] Extract files to the appropriate directory
- [ ] Verify file permissions (755 for directories, 644 for files)
- [ ] Ensure node_modules is not included (will be installed separately)

### Dependencies Installation

- [ ] SSH into the server (if available)
- [ ] Run `npm install --production` to install dependencies
- [ ] Verify all dependencies are installed correctly

### Server Configuration

- [ ] Configure server to start Node.js application
- [ ] Set up proper error pages
- [ ] Configure proper GZIP compression
- [ ] Set up proper caching headers
- [ ] Enable Hostinger's LiteSpeed Cache if available

### Final Verification

- [ ] Start the Node.js application
- [ ] Verify the website is accessible via HTTPS
- [ ] Test all functionality in production environment
- [ ] Check server logs for any errors
- [ ] Verify email functionality works in production

## Post-Deployment

### Monitoring Setup

- [ ] Set up Uptime Robot for basic uptime monitoring
- [ ] Configure email alerts for downtime
- [ ] Set up application performance monitoring (if available)
- [ ] Verify logging is working correctly

### Backup Configuration

- [ ] Set up regular backups of website files
- [ ] Configure database backups if applicable
- [ ] Test backup restoration process
- [ ] Document backup and restoration procedures

### Documentation

- [ ] Update deployment documentation with any issues encountered
- [ ] Document server configuration details
- [ ] Create maintenance procedures document
- [ ] Document monitoring and alerting setup

### Security Verification

- [ ] Run security scan on the production website
- [ ] Verify security headers are properly configured
- [ ] Check for exposed sensitive files or information
- [ ] Verify rate limiting is working correctly

## Hostinger-Specific Notes

### Hosting Plan Requirements

- Ensure your Hostinger plan supports Node.js hosting
- Premium or Business plan recommended for production websites
- Check bandwidth and storage limitations

### Performance Optimization

- Enable Hostinger's LiteSpeed Cache for static assets
- Configure proper GZIP compression in Hostinger
- Use Hostinger's CDN if available for improved performance

### Support Resources

- Hostinger Knowledge Base: https://support.hostinger.com/
- Hostinger Live Chat Support: Available 24/7 through control panel
- Node.js Hosting Guide: https://www.hostinger.com/tutorials/how-to-host-node-js-application
