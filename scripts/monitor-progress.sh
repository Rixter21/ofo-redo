#!/bin/bash
# ANSI progress display with colors
clear
echo -e "\033[1;36mMasterpiece Creation Monitor\033[0m"
echo -e "===============================\n"

while true; do
  # Security phase progress
  SEC_PROG=$(grep -c "✅" masterpiece.log)
  SEC_TOTAL=5
  SEC_PERC=$((SEC_PROG*100/SEC_TOTAL))
  
  # Image conversion progress
  IMG_CONV=$(find public/assets/images -name "*.webp" | wc -l)
  IMG_TOTAL=214
  IMG_PERC=$((IMG_CONV*100/IMG_TOTAL))
  
  # Calculate ETAs
  # Calculate precise ETAs with weighted rolling average
  IMG_TIMES=($(grep "Converted" masterpiece.log | awk '{print $1}' | tail -n 10))
  if [[ ${#IMG_TIMES[@]} -gt 1 ]]; then
    TOTAL_DIFF=$(( $(date +%s -d "${IMG_TIMES[-1]}") - $(date +%s -d "${IMG_TIMES[0]}") ))
    AVG_TIME=$(( TOTAL_DIFF / (${#IMG_TIMES[@]} - 1) ))
    IMG_ETA=$(( (IMG_TOTAL - IMG_CONV) * AVG_TIME ))
  else
    IMG_ETA=$(( (IMG_TOTAL - IMG_CONV) * 7 )) # Default 7s/item
  fi

  # Security ETA with progress awareness
  SEC_ETA=$(( (SEC_TOTAL - SEC_PROG) * 150 )) # 2.5m/check based on observed pace
  [[ $SEC_PROG -gt 0 ]] && SEC_ETA=$(( SEC_ETA * 80 / 100 )) # Accelerate if any progress
  
  # Calculate total ETA with confidence factor
  TOTAL_ETA=$(( (SEC_ETA * 3 + IMG_ETA * 2) / 5 )) # Weighted average
  
  # Display progress bars with ETAs
  echo -e "\033[1;32mSecurity Hardening: [$(printf '%*s' $SEC_PERC | tr ' ' '#')$(printf '%*s' $((100-SEC_PERC)) | tr ' ' '-')] ${SEC_PERC}% | ETA: $(date -d "+$SEC_ETA seconds" +%H:%M:%S)\033[0m"
  echo -e "\033[1;33mImage Optimization: [$(printf '%*s' $IMG_PERC | tr ' ' '#')$(printf '%*s' $((100-IMG_PERC)) | tr ' ' '-')] ${IMG_PERC}% (${IMG_CONV}/${IMG_TOTAL}) | ETA: $(date -d "+$IMG_ETA seconds" +%H:%M:%S)\033[0m"
  echo -e "\n\033[2mUpdated: $(date +%H:%M:%S) | Press Ctrl+C to exit\033[0m"
  sleep 5
  clear
done
