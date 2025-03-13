#!/bin/bash

# Script to convert and optimize JPG and PNG images to WebP format
# This helps with performance optimization by reducing image sizes
# and using a more efficient format

LOG_FILE="optimization-log.txt"
ORIGINAL_SIZE_TOTAL=0
NEW_SIZE_TOTAL=0
QUALITY=80  # Adjust quality setting for WebP conversion (0-100)
PROCESSED_COUNT=0

# Create log header
echo "Image Optimization Log - $(date)" > $LOG_FILE
echo "=================================================" >> $LOG_FILE
echo "Original Image | Original Size | WebP Size | Reduction %" >> $LOG_FILE
echo "------------------------------------------------" >> $LOG_FILE

# Function to convert a single image to WebP
convert_image() {
    local input_file="$1"
    
    # Skip macOS metadata files
    if [[ "$input_file" == *"/._"* ]]; then
        echo "Skipping metadata file: $input_file"
        return
    fi
    
    local original_size=$(stat -c%s "$input_file")
    local dirname=$(dirname "$input_file")
    local filename=$(basename -- "$input_file")
    local name="${filename%.*}"
    local output_file="${dirname}/${name}.webp"
    
    # Skip if WebP already exists and is newer than source
    if [ -f "$output_file" ] && [ "$output_file" -nt "$input_file" ]; then
        echo "Skipping $input_file (WebP already exists and is up to date)"
        return
    fi
    
    # Convert to WebP
    convert "$input_file" -quality $QUALITY "$output_file"
    
    # Check if conversion was successful
    if [ $? -eq 0 ] && [ -f "$output_file" ]; then
        local new_size=$(stat -c%s "$output_file")
        local reduction=$((100 - (new_size * 100 / original_size)))
        
        # Update totals
        ORIGINAL_SIZE_TOTAL=$((ORIGINAL_SIZE_TOTAL + original_size))
        NEW_SIZE_TOTAL=$((NEW_SIZE_TOTAL + new_size))
        PROCESSED_COUNT=$((PROCESSED_COUNT + 1))
        
        # Log result
        echo "$input_file | $(numfmt --to=iec --format="%.2f" $original_size) | $(numfmt --to=iec --format="%.2f" $new_size) | ${reduction}%" >> $LOG_FILE
        echo "Converted $input_file to WebP (${reduction}% smaller)"
    else
        echo "Failed to convert $input_file to WebP" >> $LOG_FILE
        echo "Failed to convert $input_file to WebP"
    fi
}

# Process JPG images
echo "Converting JPG images to WebP..."
find public/assets/images -type f -name "*.jpg" | while read -r img; do
    convert_image "$img"
done

# Process PNG images
echo "Converting PNG images to WebP..."
find public/assets/images -type f -name "*.png" | while read -r img; do
    convert_image "$img"
done

# Calculate final statistics - store to temporary file to preserve variables across subshells
echo $PROCESSED_COUNT > /tmp/processed_count.tmp
echo $ORIGINAL_SIZE_TOTAL > /tmp/original_size.tmp
echo $NEW_SIZE_TOTAL > /tmp/new_size.tmp

# Read values back
PROCESSED_COUNT=$(cat /tmp/processed_count.tmp)
ORIGINAL_SIZE_TOTAL=$(cat /tmp/original_size.tmp)
NEW_SIZE_TOTAL=$(cat /tmp/new_size.tmp)

# Report final statistics
if [ $PROCESSED_COUNT -gt 0 ]; then
    if [ $ORIGINAL_SIZE_TOTAL -gt 0 ]; then
        TOTAL_REDUCTION=$((100 - (NEW_SIZE_TOTAL * 100 / ORIGINAL_SIZE_TOTAL)))
        
        echo "=================================================" >> $LOG_FILE
        echo "Total original size: $(numfmt --to=iec --format="%.2f" $ORIGINAL_SIZE_TOTAL)" >> $LOG_FILE
        echo "Total WebP size: $(numfmt --to=iec --format="%.2f" $NEW_SIZE_TOTAL)" >> $LOG_FILE
        echo "Total reduction: ${TOTAL_REDUCTION}%" >> $LOG_FILE
        
        echo "Image optimization complete!"
        echo "Processed $PROCESSED_COUNT images"
        echo "Total space saved: $(numfmt --to=iec --format="%.2f" $((ORIGINAL_SIZE_TOTAL - NEW_SIZE_TOTAL))) (${TOTAL_REDUCTION}%)"
        echo "See $LOG_FILE for details"
    fi
else
    echo "No new images were processed. All images may already be optimized."
fi

# Clean up temporary files
rm -f /tmp/processed_count.tmp /tmp/original_size.tmp /tmp/new_size.tmp
