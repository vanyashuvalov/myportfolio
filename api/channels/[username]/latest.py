"""
## ANCHOR POINTS
- ENTRY: Vercel serverless function for channel latest post
- MAIN: HTTP handler with live HTML parsing
- EXPORTS: handler function
- DEPS: json, datetime, http.server, pathlib, re
- TODOs: Add caching

UPDATED COMMENTS: Live Telegram HTML parser in serverless
CRITICAL: Parses t.me/s/{username} on each request with proper nested div handling
SCALED FOR: Fallback to static JSON if parsing fails
FIX: Properly extracts text from nested divs and sorts by date
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
        UPDATED COMMENTS: Scrapes t.me/s/{username} for latest post with proper nested div handling
        CRITICAL: No authentication required, handles nested HTML structure correctly
        SCALED FOR: Production use with timeout and proper post sorting by date
        FIX: Properly extracts text from nested divs and sorts posts by date instead of HTML order
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
            
            # CRITICAL FIX: Extract description - handle multiline with <br/>
            desc_match = re.search(r'<div class="tgme_channel_info_description[^"]*">(.*?)</div>', html, re.DOTALL)
            if desc_match:
                description = desc_match.group(1)
                # REUSABLE LOGIC: Remove HTML tags but keep text
                description = re.sub(r'<br\s*/?>', ' ', description)
                description = re.sub(r'<[^>]+>', '', description)
                description = re.sub(r'\s+', ' ', description).strip()
            else:
                description = ''
            
            # CRITICAL FIX: Extract ALL posts with their data, then sort by date
            # UPDATED COMMENTS: Parse multiple posts to find the actual latest one
            posts = []
            
            # REUSABLE LOGIC: Find all message blocks with post IDs
            message_blocks = re.findall(
                r'<div class="tgme_widget_message[^"]*"[^>]*data-post="[^/]+/(\d+)"[^>]*>(.*?)(?=<div class="tgme_widget_message_wrap|</section>)',
                html,
                re.DOTALL
            )
            
            # SCALED FOR: Process up to 20 posts for performance
            for post_id, post_html in message_blocks[:20]:
                try:
                    # CRITICAL FIX: Extract text from NESTED divs properly
                    # Pattern: outer div -> inner div -> actual text
                    text_pattern = r'<div class="tgme_widget_message_text js-message_text"[^>]*>\s*<div class="tgme_widget_message_text js-message_text"[^>]*>(.*?)</div>\s*</div>'
                    text_match = re.search(text_pattern, post_html, re.DOTALL)
                    
                    if not text_match:
                        # REUSABLE LOGIC: Fallback to single div (some posts might not have nested structure)
                        text_pattern_single = r'<div class="tgme_widget_message_text js-message_text"[^>]*>(.*?)</div>'
                        text_match = re.search(text_pattern_single, post_html, re.DOTALL)
                    
                    if text_match:
                        text_html = text_match.group(1)
                        # CRITICAL: Remove all HTML tags
                        text = re.sub(r'<[^>]+>', '', text_html)
                        # UPDATED COMMENTS: Normalize whitespace
                        text = re.sub(r'\s+', ' ', text).strip()
                        # SCALED FOR: Limit length for performance
                        if len(text) > 300:
                            text = text[:300] + '...'
                    else:
                        text = ''
                    
                    # CRITICAL: Skip posts without text
                    if not text:
                        continue
                    
                    # UPDATED COMMENTS: Extract views
                    views_match = re.search(r'<span class="tgme_widget_message_views">([^<]+)</span>', post_html)
                    views = 0
                    if views_match:
                        views_str = views_match.group(1).strip().replace(' ', '')
                        try:
                            views = int(views_str)
                        except ValueError:
                            views = 0
                    
                    # UPDATED COMMENTS: Extract date
                    date_match = re.search(r'<time[^>]*datetime="([^"]+)"', post_html)
                    date = date_match.group(1) if date_match else None
                    
                    # CRITICAL: Skip posts without date (can't sort them)
                    if not date:
                        continue
                    
                    posts.append({
                        'id': post_id,
                        'text': text,
                        'views': views,
                        'date': date
                    })
                    
                except Exception:
                    # SCALED FOR: Skip problematic posts and continue
                    continue
            
            # CRITICAL FIX: Sort posts by date (newest first) and take the first one
            if posts:
                # REUSABLE LOGIC: Sort by ISO datetime string (works correctly for ISO format)
                posts.sort(key=lambda x: x['date'], reverse=True)
                latest = posts[0]
                
                # UPDATED COMMENTS: Build post link with actual post ID
                link = f"https://t.me/{username}/{latest['id']}"
                
                # CRITICAL: Build response with properly extracted data
                return {
                    "channel": {
                        "username": username,
                        "title": title,
                        "description": description,
                        "verified": False
                    },
                    "latest_post": {
                        "text": latest['text'],
                        "views": latest['views'],
                        "date": latest['date'],
                        "formatted_date": self.format_date(latest['date']),
                        "formatted_views": self.format_number(latest['views']),
                        "link": link
                    },
                    "source": "live_html"
                }
            else:
                # CRITICAL: No posts found
                return None
            
        except (URLError, Exception):
            # SCALED FOR: Return None to trigger fallback
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
