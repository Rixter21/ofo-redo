# OFO Development Website File Cleanup

This document identifies files that can be removed or consolidated to ensure a clean, maintainable codebase before production deployment.

## Files to Remove

### Duplicate Server Files

- `server.js.bak` - Backup of server.js, no longer needed
- `server.js.fixed` - Fixed version, changes should be merged into main server.js
- `server.js.new` - New version, changes should be merged into main server.js

### Temporary JSON Fix Scripts

- `fix-json-direct.js` - Temporary fix script, no longer needed
- `fix-json-final.js` - Temporary fix script, no longer needed
- `fix-json-python.py` - Temporary fix script, no longer needed
- `fix-json-python2.py` - Temporary fix script, no longer needed
- `fix-json-python3.py` - Temporary fix script, no longer needed
- `fix-json-python4.py` - Temporary fix script, no longer needed
- `fix-json.py` - Temporary fix script, no longer needed
- `fix-json.sh` - Temporary fix script, no longer needed
- `check-json-chars.js` - Temporary check script, no longer needed
- `check-json.py` - Temporary check script, no longer needed

### Debug and Audit Logs

- `debug.log` - Debug log, should be removed before production
- `audit.log` - Audit log, should be consolidated into a proper logging system
- `audit-progress.log` - Progress log, should be consolidated
- `masterpiece.log` - Log file, purpose unclear, should be removed
- `automation_debug.log` - Debug log for automation, should be removed
- `optimization-log.txt` - Optimization log, should be consolidated into documentation

### Draft HTML Files

- `web-development-draft.html` - Draft file, should be removed
- `web-development-draft-part2.html` - Draft file, should be removed
- `web-development-draft-part3.html` - Draft file, should be removed

### Server Status Scripts

- `fix-server-status-cron.js` - Should be consolidated into a proper monitoring system
- `fix-server-status.js` - Should be consolidated into a proper monitoring system

## Files to Consolidate

### Todo Files

- `todo.md` and `updated_todo.md` - Should be merged into a single todo file
- `todo_updated.md` - Should be merged into the main todo file

### Audit Files

- `audit.md`, `full_audit.md`, `html-files-audit.md`, `navbar_audit.md`, `public_audit.md`, `public-folder-audit.md`, `service-pages-audit.md` - Should be consolidated into a single comprehensive audit document

### Documentation Files

- `design.md` and various component plan files - Consider organizing into a docs/ directory with a clear structure
- `services-component-plan.md`, `services-improvements.md`, `standardization_plan.md` - Should be consolidated into the main design documentation

## CSS Organization

The CSS files in `public/assets/css/` should be organized into a more structured hierarchy:

```
public/assets/css/
├── base/
│   ├── typography.css
│   ├── colors.css
│   └── layout.css
├── components/
│   ├── buttons.css
│   ├── cards.css
│   ├── forms.css
│   └── navigation.css
├── pages/
│   ├── home.css
│   ├── about.css
│   ├── services.css
│   └── contact.css
├── utilities/
│   ├── animations.css
│   ├── helpers.css
│   └── responsive.css
└── styles.css (main import file)
```

## Recommended Approach

1. **Backup**: Before removing any files, create a backup of the entire project
2. **Consolidate**: Merge related files first (todos, documentation, etc.)
3. **Remove**: Delete unnecessary files after confirming they're no longer needed
4. **Organize**: Restructure CSS and other assets into a more logical hierarchy
5. **Test**: Thoroughly test the website after cleanup to ensure nothing was broken

## Production-Ready File Structure

After cleanup, the project structure should be simplified to:

```
/
├── docs/                     # Documentation
│   ├── design.md             # Main design document
│   ├── audit.md              # Consolidated audit document
│   └── deployment.md         # Deployment instructions
├── public/                   # Public assets
│   ├── assets/               # Static assets
│   │   ├── css/              # Organized CSS files
│   │   ├── js/               # JavaScript files
│   │   ├── images/           # Optimized images
│   │   └── media/            # Other media files
│   ├── components/           # Component files
│   ├── *.html                # HTML pages
│   └── service-worker.js     # Service worker
├── scripts/                  # Build and utility scripts
├── .env.example              # Example environment variables (no secrets)
├── .gitignore                # Git ignore file
├── package.json              # Project dependencies
├── server.js                 # Main server file
├── todo.md                   # Consolidated todo list
└── README.md                 # Project readme
```
