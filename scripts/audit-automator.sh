#!/bin/bash
set -e

LOG_FILE="audit-progress.log"
AUDIT_REPORT="docs/audit-log.md"

# Phase 1: Complete link audit
echo "Starting link audit..." | tee -a $LOG_FILE
npx linkinator ./public --reporter markdown >> $AUDIT_REPORT 2>> $LOG_FILE

# Phase 2: Redundancy checks
echo "Analyzing asset usage..." | tee -a $LOG_FILE
find public/assets -type f | xargs -P 4 -I {} sh -c '
  if ! grep -qr $(basename "{}") ./public; then
    echo "UNUSED: {}" >> $AUDIT_REPORT
  fi
'

# Phase 3: Premium enhancements
echo "Optimizing CSS..." | tee -a $LOG_FILE
for css in public/assets/css/*.css; do
  cleancss $css -o $css.opt
  mv $css.opt $css
done

echo "Audit complete at $(date)" | tee -a $LOG_FILE
