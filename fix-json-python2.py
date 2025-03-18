#!/usr/bin/env python3

"""
Python JSON Writer (Alternative Approach)

This script writes a valid JSON file using Python's json module with a different approach.
"""

import json
import datetime
import os

# Path to the server-status.json file
status_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public', 'server-status.json')

# Create a valid JSON string directly
json_string = '''
{
  "status": "online",
  "timestamp": "''' + datetime.datetime.now().isoformat() + '''"
}
'''

# Write the file
try:
    # Write to a temporary file first
    temp_file_path = f"{status_file_path}.tmp"
    with open(temp_file_path, 'w') as f:
        f.write(json_string)
    
    # Rename the temp file to the actual file
    if os.path.exists(status_file_path):
        os.unlink(status_file_path)
    os.rename(temp_file_path, status_file_path)
    
    print(f"Created valid server-status.json file at {status_file_path}")
    
    # Verify the file was written correctly
    with open(status_file_path, 'r') as f:
        content = f.read()
    print("File content:")
    print(content)
    
    try:
        json.loads(content)
        print("Verified server-status.json contains valid JSON")
    except json.JSONDecodeError as jsonError:
        print(f"Error: server-status.json contains invalid JSON: {jsonError}")
except Exception as error:
    print(f"Error creating server-status.json: {error}")
