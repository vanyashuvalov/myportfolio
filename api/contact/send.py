"""
## ANCHOR POINTS
- ENTRY: Vercel serverless function for contact form
- MAIN: HTTP POST handler for /api/contact/send endpoint
- EXPORTS: handler function
- DEPS: json, http.server, os, urllib
- TODOs: Rate limiting

UPDATED COMMENTS: Vercel serverless function for contact message submission
CRITICAL: Sends messages to Telegram bot via Bot API
SCALED FOR: Stateless serverless architecture with environment variables
"""

import json
import os
from http.server import BaseHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.error import URLError
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    """
    Handler for contact form submissions
    CRITICAL: POST endpoint that sends messages to Telegram bot
    UPDATED COMMENTS: Validates input and forwards to Telegram API
    SCALED FOR: Production use with proper error handling
    """
    
    def do_POST(self):
        """
        Handle POST request with contact message
        REUSED: Standard HTTP handler pattern
        """
        # CRITICAL: Parse request body
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
        except Exception as e:
            self.send_error_response(400, "Invalid JSON body")
            return
        
        # UPDATED COMMENTS: Extract and validate message
        message = data.get('message', '').strip()
        contact = data.get('contact', '').strip() or None
        
        # CRITICAL: Validate message length
        if not message or len(message) < 10:
            self.send_error_response(400, "Message must be at least 10 characters long")
            return
        
        if len(message) > 2000:
            self.send_error_response(400, "Message must be less than 2000 characters")
            return
        
        # UPDATED COMMENTS: Get Telegram credentials from environment
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        chat_id = os.environ.get('TELEGRAM_CHAT_ID')
        
        # CRITICAL: Check if Telegram is configured
        if not bot_token or not chat_id:
            # SCALED FOR: Development mode - log to console
            self.log_message_dev(message, contact)
            self.send_json_response({
                "success": True,
                "message": "Message logged (Telegram bot not configured)",
                "dev_mode": True
            })
            return
        
        # UPDATED COMMENTS: Send to Telegram
        try:
            self.send_to_telegram(bot_token, chat_id, message, contact)
            self.send_json_response({
                "success": True,
                "message": "Message sent successfully"
            })
        except Exception as e:
            self.send_error_response(503, f"Failed to send message: {str(e)}")
    
    def do_OPTIONS(self):
        """
        Handle CORS preflight
        CRITICAL: Required for browser POST requests
        """
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_to_telegram(self, bot_token, chat_id, message, contact):
        """
        Send message to Telegram bot
        REUSED: Telegram Bot API integration
        SCALED FOR: Timeout and error handling
        """
        # UPDATED COMMENTS: Format message for Telegram
        telegram_text = "📬 New Contact Message\n\n"
        telegram_text += f"Message:\n{message}\n\n"
        
        if contact:
            telegram_text += f"Contact: {contact}\n"
        else:
            telegram_text += "Contact: Anonymous\n"
        
        telegram_text += f"\nReceived: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        # CRITICAL: Prepare Telegram API request
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = json.dumps({
            "chat_id": chat_id,
            "text": telegram_text,
            "parse_mode": "HTML"
        }).encode('utf-8')
        
        # UPDATED COMMENTS: Send HTTP request
        req = Request(url, data=payload, method='POST')
        req.add_header('Content-Type', 'application/json')
        
        try:
            with urlopen(req, timeout=10) as response:
                if response.status != 200:
                    raise Exception(f"Telegram API returned {response.status}")
        except URLError as e:
            raise Exception(f"Telegram API error: {str(e)}")
    
    def log_message_dev(self, message, contact):
        """
        Log message in development mode
        SCALED FOR: Local testing without Telegram
        """
        print("=" * 60)
        print("📬 New Contact Message (Development Mode)")
        print("=" * 60)
        print(f"Message: {message}")
        print(f"Contact: {contact or 'Anonymous'}")
        print(f"Received: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
    
    def send_json_response(self, data, status=200):
        """
        Send JSON response with CORS headers
        REUSED: Standard JSON response pattern
        """
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def send_error_response(self, status, message):
        """
        Send error response
        SCALED FOR: Consistent error format
        """
        self.send_json_response({
            "success": False,
            "error": message
        }, status)
    
    def send_cors_headers(self):
        """
        Send CORS headers
        CRITICAL: Allow frontend to call API
        """
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
