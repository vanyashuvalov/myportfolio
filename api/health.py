# UPDATED COMMENTS: Test endpoint to verify Vercel Python execution
# CRITICAL: Simple endpoint to check if Python is executing

from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        response = {
            "status": "healthy",
            "message": "Python is executing correctly on Vercel!"
        }
        
        self.wfile.write(json.dumps(response).encode())
        return
