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
    """
    
    def end_headers(self):
        # CRITICAL: CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        
        # SCALED FOR: Caching control
        if self.path.endswith('.js'):
            self.send_header('Cache-Control', 'no-cache')
        elif self.path.endswith('.css'):
            self.send_header('Cache-Control', 'no-cache')
        
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