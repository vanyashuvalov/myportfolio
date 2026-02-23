"""
## ANCHOR POINTS
- ENTRY: Vercel serverless function for channel latest post
- MAIN: HTTP handler for /api/channels/{username}/latest
- EXPORTS: handler function
- DEPS: json, pathlib, datetime
- TODOs: None

UPDATED COMMENTS: Vercel serverless function for Telegram channel latest post
CRITICAL: Dynamic route using [username] folder structure
SCALED FOR: Stateless serverless architecture
"""

import json
from datetime import datetime
from http.server import BaseHTTPRequestHandler
from pathlib import Path

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # CRITICAL: Extract username from path
        path_parts = self.path.split('/')
        username = path_parts[3] if len(path_parts) > 3 else 'unknown'
        username = username.split('?')[0]
        
        # UPDATED COMMENTS: Load channel data from JSON
        base_dir = Path(__file__).parent.parent.parent
        data_file = base_dir / 'data' / 'telegram' / 'channels_data.json'
        
        try:
            if data_file.exists():
                with open(data_file, 'r', encoding='utf-8') as f:
                    all_data = json.load(f)
                    channel_data = all_data.get(username)
                    
                    if channel_data and channel_data.get('success'):
                        posts = channel_data.get('posts', [])
                        if posts:
                            latest_post = posts[0]
                            channel_info = channel_data.get('channel_info', {})
                            
                            response = {
                                "channel": {
                                    "username": username,
                                    "title": channel_info.get('title', username),
                                    "description": channel_info.get('description', ''),
                                    "verified": channel_info.get('verified', False)
                                },
                                "latest_post": {
                                    "text": latest_post.get('text', ''),
                                    "views": latest_post.get('views', 0),
                                    "date": latest_post.get('date'),
                                    "formatted_date": self.format_date(latest_post.get('date')),
                                    "formatted_views": self.format_number(latest_post.get('views', 0)),
                                    "link": latest_post.get('link')
                                }
                            }
                            
                            self.send_json(response)
                            return
        except Exception:
            pass
        
        # CRITICAL: Fallback to mock data
        response = {
            "channel": {
                "username": username,
                "title": "Ваня Кнопочкин" if username == "vanyashuvalov" else username.title(),
                "description": "Product Designer & Creative",
                "verified": False
            },
            "latest_post": {
                "text": "москва газ соревнования по счету в уме",
                "views": 43,
                "date": datetime.now().isoformat(),
                "formatted_date": "2h ago",
                "formatted_views": "43",
                "link": f"https://t.me/{username}/123"
            },
            "mock_data": True
        }
        
        self.send_json(response)
    
    def send_json(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def format_date(self, date_str):
        if not date_str:
            return "Unknown"
        try:
            post_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            now = datetime.now(post_date.tzinfo)
            diff = now - post_date
            if diff.days > 0:
                return f"{diff.days}d ago"
            elif diff.seconds > 3600:
                return f"{diff.seconds // 3600}h ago"
            elif diff.seconds > 60:
                return f"{diff.seconds // 60}m ago"
            else:
                return "Just now"
        except Exception:
            return "Unknown"
    
    def format_number(self, num):
        if num >= 1000000:
            return f"{num / 1000000:.1f}M"
        elif num >= 1000:
            return f"{num / 1000:.1f}K"
        else:
            return str(num)
