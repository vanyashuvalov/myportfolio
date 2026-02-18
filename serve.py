#!/usr/bin/env python3
"""
Simple HTTP server for development
UPDATED COMMENTS: Local development server with proper MIME types
SCALED FOR: CORS handling and ES6 modules support
"""

import http.server
import socketserver
import os
import mimetypes
from urllib.parse import urlparse

# REUSED: Custom MIME types for modern web development
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('application/json', '.json')
mimetypes.add_type('image/svg+xml', '.svg')

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    HTTP Request Handler with CORS support
    UPDATED COMMENTS: Enables cross-origin requests for development
    CRITICAL: SPA routing - fallback to index.html for client-side routes
    """
    
    def do_GET(self):
        # CRITICAL: SPA routing fallback
        # UPDATED COMMENTS: If path doesn't exist and is not a file request, serve index.html
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # CRITICAL: Get basename and check for file extension
        basename = os.path.basename(path)
        has_extension = '.' in basename and not basename.startswith('.')
        
        # SCALED FOR: Check if file exists
        if path != '/' and not os.path.exists('.' + path):
            # CRITICAL: Only serve index.html for routes WITHOUT file extensions
            # UPDATED COMMENTS: If it has extension (.js, .css, .jpg, etc), let it 404
            if not has_extension:
                # REUSED: Serve index.html for SPA routes
                self.path = '/index.html'
        
        return super().do_GET()
    
    def end_headers(self):
        # CRITICAL: CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        
        # SCALED FOR: Caching control
        if self.path.endswith('.js'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        elif self.path.endswith('.css'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        elif self.path.endswith('.html') or self.path == '/':
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        
        super().end_headers()
    
    def do_OPTIONS(self):
        # REUSED: OPTIONS method for CORS preflight
        self.send_response(200)
        self.end_headers()
    
    def guess_type(self, path):
        # UPDATED COMMENTS: Enhanced MIME type detection
        mimetype, encoding = mimetypes.guess_type(path)
        
        # CRITICAL: Ensure JavaScript modules are served correctly
        if path.endswith('.js'):
            return 'application/javascript'
        elif path.endswith('.mjs'):
            return 'application/javascript'
        
        return mimetype

def main():
    PORT = 8080
    
    # UPDATED COMMENTS: Change to project directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}/")
        print(f"Debug page: http://localhost:{PORT}/debug.html")
        print("Press Ctrl+C to stop")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")

if __name__ == "__main__":
    main()