"""
## ANCHOR POINTS
- ENTRY: Vercel serverless function for projects API
- MAIN: HTTP handler for /api/projects endpoint
- EXPORTS: handler function
- DEPS: json, pathlib
- TODOs: None

UPDATED COMMENTS: Vercel serverless function for projects endpoint
CRITICAL: Separate file per endpoint for Vercel routing
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
        category = query_params.get('category', ['all'])[0]
        
        # UPDATED COMMENTS: Load projects from markdown files
        base_dir = Path(__file__).parent
        projects_dir = base_dir / 'data' / 'projects'
        
        projects = []
        categories = ['work', 'fun'] if category == 'all' else [category] if category in ['work', 'fun'] else []
        
        for cat in categories:
            cat_dir = projects_dir / cat
            if not cat_dir.exists():
                continue
            
            for md_file in cat_dir.glob('*.md'):
                try:
                    with open(md_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # CRITICAL: Parse frontmatter
                    if content.startswith('---'):
                        parts = content.split('---', 2)
                        if len(parts) >= 3:
                            frontmatter = parts[1].strip()
                            metadata = {}
                            for line in frontmatter.split('\n'):
                                if ':' in line:
                                    key, value = line.split(':', 1)
                                    key = key.strip()
                                    value = value.strip().strip('"\'')
                                    if value.startswith('[') and value.endswith(']'):
                                        value = [v.strip().strip('"\'') for v in value[1:-1].split(',')]
                                    metadata[key] = value
                            
                            projects.append({
                                "id": md_file.stem,
                                "category": cat,
                                "title": metadata.get('title', md_file.stem),
                                "thumbnail": metadata.get('thumbnail', '/assets/images/bg-mountains.jpg'),
                                "description": metadata.get('description', ''),
                                "tags": metadata.get('tags', []),
                                "year": metadata.get('year'),
                                "client": metadata.get('client'),
                                "role": metadata.get('role')
                            })
                except Exception:
                    continue
        
        # CRITICAL: Send JSON response
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "projects": projects,
            "total": len(projects),
            "category": category
        }
        
        self.wfile.write(json.dumps(response).encode())
