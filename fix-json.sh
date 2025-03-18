#!/bin/bash

# Create a valid JSON file with explicit comma
echo '{
  "status": "online",
  "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
}' > public/server-status.json

echo "Updated server-status.json with valid JSON"
