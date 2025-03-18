#!/usr/bin/env python3

"""
JSON Validator

This script checks if a JSON file is valid.
"""

import json
import sys

# Path to the JSON file
json_file_path = 'public/server-status.json'

# Read the file
try:
    with open(json_file_path, 'r') as f:
        content = f.read()
    print("File content:")
    print(content)
    
    # Try to parse the JSON
    data = json.loads(content)
    print("JSON is valid. Parsed data:")
    print(data)
except Exception as error:
    print(f"Error: {error}")
