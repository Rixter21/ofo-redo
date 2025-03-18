import json
import datetime

data = {
    "status": "online",
    "timestamp": datetime.datetime.now().isoformat()
}

with open("public/server-status.json", "w") as f:
    json.dump(data, f, indent=2)

print("Updated server-status.json with valid JSON")
