"""
## ANCHOR POINTS
- ENTRY: Vercel serverless function for individual project markdown
- MAIN: HTTP handler for /api/projects/{category}/{id} endpoint
- EXPORTS: handler function
- DEPS: pathlib, http.server
- TODOs: None

UPDATED COMMENTS: Vercel serverless function for individual project endpoint
CRITICAL: Dynamic route handler for project markdown files
SCALED FOR: Stateless serverless architecture with path parameters
"""

from http.server import BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote

class handler(BaseHTTPRequestHandler):
    """
    Handler for individual project markdown files
    CRITICAL: Serves markdown content from /api/data/projects/{category}/{id}.md
    UPDATED COMMENTS: Extracts category and id from URL path
    """
    
    def do_GET(self):
        # CRITICAL: Extract category and id from path
        # Path format: /api/projects/{category}/{id}
        path_parts = self.path.strip('/').split('/')
        
        # UPDATED COMMENTS: Validate path structure
        if len(path_parts) < 4 or path_parts[0] != 'api' or path_parts[1] != 'projects':
            self.send_error(400, "Invalid path format")
            return
        
        category = unquote(path_parts[2])
        project_id = unquote(path_parts[3])
        
        # CRITICAL: Validate category
        if category not in ['work', 'fun']:
            self.send_error(400, f"Invalid category: {category}")
            return
        
        # UPDATED COMMENTS: Construct file path
        base_dir = Path(__file__).parent.parent.parent
        md_file = base_dir / 'data' / 'projects' / category / f'{project_id}.md'
        
        # CRITICAL: Check if file exists
        if not md_file.exists():
            self.send_error(404, f"Project not found: {category}/{project_id}")
            return
        
        try:
            # UPDATED COMMENTS: Read markdown file
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # CRITICAL: Send markdown response
            self.send_response(200)
            self.send_header('Content-Type', 'text/markdown; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'public, max-age=3600')
            self.end_headers()
            
            self.wfile.write(content.encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f"Error reading file: {str(e)}")
