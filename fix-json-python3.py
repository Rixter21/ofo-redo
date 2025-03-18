#!/usr/bin/env python3

"""
Python JSON Writer (Third Approach)

This script writes a valid JSON file using Python's json module with a different approach.
"""

import json
import datetime
import os

# Path to the server-status.json file
status_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public', 'server-status.json')

# Create a valid JSON string directly with explicit comma
json_string = '''
{
  "status": "online",
  "timestamp": "''' + datetime.datetime.now().isoformat() + '''"
}
'''

# Write the file
try:
    # Write directly to the file
    with open(status_file_path, 'w') as f:
        f.write(json_string)
    
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
        
        # Try to fix the file with a different approach
        print("Trying to fix the file with a different approach...")
        status_data = {
            "status": "online",
            "timestamp": datetime.datetime.now().isoformat()
        }
        with open(status_file_path, 'w') as f:
            json.dump(status_data, f, indent=2)
        
        # Verify the file was written correctly
        with open(status_file_path, 'r') as f:
            content = f.read()
        print("File content after fix:")
        print(content)
        
        try:
            json.loads(content)
            print("Verified server-status.json contains valid JSON after fix")
        except json.JSONDecodeError as jsonError:
            print(f"Error: server-status.json still contains invalid JSON after fix: {jsonError}")
except Exception as error:
    print(f"Error creating server-status.json: {error}")
