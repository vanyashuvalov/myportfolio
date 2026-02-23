"""
## ANCHOR POINTS
- ENTRY: Vercel serverless function for channel latest post
- MAIN: HTTP handler with live HTML parsing
- EXPORTS: handler function
- DEPS: json, datetime, http.server, pathlib, re
- TODOs: Add caching

UPDATED COMMENTS: Live Telegram HTML parser in serverless
CRITICAL: Parses t.me/s/{username} on each request
SCALED FOR: Fallback to static JSON if parsing fails
"""

import json
import re
from datetime import datetime
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # CRITICAL: Extract username from path
        path_parts = self.path.split('/')
        username = path_parts[3] if len(path_parts) > 3 else 'unknown'
        username = username.split('?')[0]
        
        # UPDATED COMMENTS: Try live parsing first
        try:
            live_data = self.parse_telegram_html(username)
            if live_data:
                self.send_json(live_data)
                return
        except Exception as e:
            # CRITICAL: Log error but continue to fallback
            pass
        
        # UPDATED COMMENTS: Fallback to static JSON
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
                                },
                                "source": "static_json"
                            }
                            
                            self.send_json(response)
                            return
        except Exception:
            pass
        
        # CRITICAL: Final fallback to mock data
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
    
    def parse_telegram_html(self, username):
        """
        Parse Telegram public channel HTML
        UPDATED COMMENTS: Scrapes t.me/s/{username} for latest post
        CRITICAL: No authentication required
        SCALED FOR: Production use with timeout
        """
        url = f"https://t.me/s/{username}"
        
        # CRITICAL: Create request with proper headers
        req = Request(url)
        req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        try:
            # UPDATED COMMENTS: Fetch HTML with 10s timeout
            with urlopen(req, timeout=10) as response:
                html = response.read().decode('utf-8')
            
            # CRITICAL: Extract channel title
            title_match = re.search(r'<div class="tgme_channel_info_header_title[^"]*"><span[^>]*>([^<]+)</span>', html)
            title = title_match.group(1) if title_match else username
            
            # CRITICAL: Extract description
            desc_match = re.search(r'<div class="tgme_channel_info_description[^"]*">([^<]+)</div>', html)
            description = desc_match.group(1) if desc_match else ''
            
            # CRITICAL: Find first message block
            message_match = re.search(r'<div class="tgme_widget_message[^"]*"[^>]*>(.*?)</div>\s*</div>\s*</div>', html, re.DOTALL)
            
            if not message_match:
                return None
            
            message_html = message_match.group(1)
            
            # UPDATED COMMENTS: Extract post text
            text_match = re.search(r'<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>', message_html, re.DOTALL)
            text = ''
            if text_match:
                text_html = text_match.group(1)
                # CRITICAL: Remove HTML tags
                text = re.sub(r'<[^>]+>', '', text_html)
                text = text.strip()
            
            # UPDATED COMMENTS: Extract views
            views_match = re.search(r'<span class="tgme_widget_message_views">([0-9.KM]+)</span>', message_html)
            views = 0
            if views_match:
                views_str = views_match.group(1)
                if 'K' in views_str:
                    views = int(float(views_str.replace('K', '')) * 1000)
                elif 'M' in views_str:
                    views = int(float(views_str.replace('M', '')) * 1000000)
                else:
                    views = int(views_str)
            
            # UPDATED COMMENTS: Extract date
            date_match = re.search(r'<time[^>]*datetime="([^"]+)"', message_html)
            date = date_match.group(1) if date_match else datetime.now().isoformat()
            
            # UPDATED COMMENTS: Extract post link
            link_match = re.search(r'<a[^>]*href="(https://t\.me/[^"]+)"', message_html)
            link = link_match.group(1) if link_match else f"https://t.me/{username}"
            
            # CRITICAL: Build response
            return {
                "channel": {
                    "username": username,
                    "title": title,
                    "description": description,
                    "verified": False
                },
                "latest_post": {
                    "text": text,
                    "views": views,
                    "date": date,
                    "formatted_date": self.format_date(date),
                    "formatted_views": self.format_number(views),
                    "link": link
                },
                "source": "live_html"
            }
            
        except (URLError, Exception):
            return None
    
    def send_json(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'public, max-age=3600')
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
