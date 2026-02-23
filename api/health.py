"""
## ANCHOR POINTS
- ENTRY: Vercel serverless health check
- MAIN: HTTP handler for /api/health
- EXPORTS: handler function
- DEPS: json, http.server, pathlib, datetime
- TODOs: None

UPDATED COMMENTS: Health check with data file verification
CRITICAL: Vercel serverless function format
SCALED FOR: Production monitoring
"""

import json
from datetime import datetime
from http.server import BaseHTTPRequestHandler
from pathlib import Path

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # CRITICAL: Check if data files exist
        base_dir = Path(__file__).parent
        data_file = base_dir / 'data' / 'telegram' / 'channels_data.json'
        projects_dir = base_dir / 'data' / 'projects'
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "status": "healthy",
            "data_file_exists": data_file.exists(),
            "projects_dir_exists": projects_dir.exists(),
            "timestamp": datetime.now().isoformat()
        }
        
        self.wfile.write(json.dumps(response).encode())
