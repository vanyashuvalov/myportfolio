"""
## ANCHOR POINTS
- ENTRY: Vercel serverless function for fun gallery API
- MAIN: HTTP handler for /api/fun endpoint
- EXPORTS: handler function
- DEPS: json, pathlib
- TODOs: None

UPDATED COMMENTS: Vercel serverless function for fun gallery endpoint
CRITICAL: Returns simple image + description items for gallery view
SCALED FOR: Stateless serverless architecture
"""

import json
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # CRITICAL: Parse query parameters
        parsed_url = urlparse(self.path)
        query_params = parse_qs(parsed_url.query)
        
        # UPDATED COMMENTS: Load fun items from assets/images/fun
        base_dir = Path(__file__).parent
        fun_dir = base_dir.parent.parent / 'assets' / 'images' / 'fun'
        
        if not fun_dir.exists():
            response = {
                "items": [],
                "total": 0
            }
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            return
        
        items = []
        
        for json_file in fun_dir.glob('*.json'):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                items.append({
                    "id": json_file.stem,
                    "image": data.get('image', ''),
                    "description": data.get('description', ''),
                    "title": data.get('title', json_file.stem)
                })
            except Exception:
                continue
        
        # CRITICAL: Sort by order if available
        items.sort(key=lambda x: int(x.get('order', 0)) if x.get('order') else 0)
        
        # CRITICAL: Send JSON response
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "items": items,
            "total": len(items)
        }
        
        self.wfile.write(json.dumps(response).encode())