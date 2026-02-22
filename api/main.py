"""
## ANCHOR POINTS
- ENTRY: Vercel serverless FastAPI function
- MAIN: All API endpoints in single file
- EXPORTS: ASGI app for Vercel
- DEPS: fastapi, httpx, python-dotenv
- TODOs: None

UPDATED COMMENTS: Standalone FastAPI for Vercel serverless
CRITICAL: Self-contained, no imports from backend/
CRITICAL: No shebang - Vercel handles Python execution
SCALED FOR: Production deployment with stateless architecture
"""

import json
import logging
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

# CRITICAL: Configuration for Vercel serverless environment
# UPDATED COMMENTS: Stateless configuration - no persistent storage
class APIConfig:
    def __init__(self):
        # UPDATED COMMENTS: Use api/data paths for Vercel deployment
        # CRITICAL: Files are read-only in serverless, included in deployment bundle
        base_dir = Path(__file__).parent
        self.data_dir = base_dir / 'data' / 'telegram'
        self.data_file = self.data_dir / 'channels_data.json'
        self.projects_dir = base_dir / 'data' / 'projects'
        
        # UPDATED COMMENTS: Telegram bot credentials from environment variables
        # CRITICAL: Set these in Vercel dashboard → Project Settings → Environment Variables
        self.telegram_bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.telegram_chat_id = os.getenv('TELEGRAM_CHAT_ID')

class ContactMessage(BaseModel):
    message: str
    contact: Optional[str] = None

# CRITICAL: FastAPI app instance
app = FastAPI(title="Portfolio API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

config = APIConfig()

# UPDATED COMMENTS: Removed in-memory cache - ineffective in serverless
# CRITICAL: Each function invocation is stateless, cache doesn't persist
# SCALED FOR: Use Vercel KV (Redis) or Edge Config for persistent caching if needed

def load_channels_data() -> Dict:
    try:
        if not config.data_file.exists():
            return {}
        with open(config.data_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logging.error(f"Error loading channels data: {e}")
        return {}

def get_channel_data(channel_username: str) -> Optional[Dict]:
    """
    Get specific channel data from JSON file
    UPDATED COMMENTS: Direct file read - no caching in serverless
    CRITICAL: File system is read-only, data updated via Git deployment
    
    Args:
        channel_username: Telegram channel username
    
    Returns:
        Channel data dict or None if not found
    """
    all_data = load_channels_data()
    return all_data.get(channel_username)

@app.get("/")
async def root():
    return {
        "service": "Portfolio API",
        "version": "2.0.0",
        "endpoints": {
            "channels": "/api/channels",
            "channel": "/api/channels/{username}",
            "posts": "/api/channels/{username}/posts",
            "projects": "/api/projects",
            "project_detail": "/api/projects/{category}/{id}",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "data_file_exists": config.data_file.exists(),
        "projects_dir_exists": config.projects_dir.exists(),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/channels")
async def get_all_channels():
    all_data = load_channels_data()
    channels = []
    for username, data in all_data.items():
        if data.get('success') and data.get('channel_info'):
            channel_info = data['channel_info']
            channels.append({
                'username': username,
                'title': channel_info.get('title', ''),
                'description': channel_info.get('description', ''),
                'subscribers_count': channel_info.get('subscribers_count', 0),
                'verified': channel_info.get('verified', False),
                'last_updated': data.get('scraped_at'),
                'posts_count': len(data.get('posts', []))
            })
    return {"channels": channels, "total": len(channels)}

@app.get("/channels/{username}")
async def get_channel_info(username: str):
    channel_data = get_channel_data(username)
    if not channel_data:
        raise HTTPException(status_code=404, detail=f"Channel {username} not found")
    if not channel_data.get('success'):
        raise HTTPException(status_code=503, detail=f"Channel {username} data unavailable")
    return {
        "channel": channel_data['channel_info'],
        "last_updated": channel_data.get('scraped_at'),
        "posts_available": len(channel_data.get('posts', []))
    }

@app.get("/channels/{username}/posts")
async def get_channel_posts(username: str, limit: int = Query(default=5, ge=1, le=20)):
    channel_data = get_channel_data(username)
    if not channel_data:
        raise HTTPException(status_code=404, detail=f"Channel {username} not found")
    if not channel_data.get('success'):
        raise HTTPException(status_code=503, detail=f"Channel {username} posts unavailable")
    
    posts = channel_data.get('posts', [])[:limit]
    formatted_posts = []
    for post in posts:
        formatted_posts.append({
            'id': post.get('id'),
            'text': post.get('text', ''),
            'date': post.get('date'),
            'views': post.get('views', 0),
            'forwards': post.get('forwards', 0),
            'replies': post.get('replies', 0),
            'media_type': post.get('media_type'),
            'link': post.get('link'),
            'formatted_date': format_post_date(post.get('date')),
            'formatted_views': format_number(post.get('views', 0))
        })
    return {"posts": formatted_posts, "channel": username, "total_returned": len(formatted_posts)}

@app.get("/channels/{username}/latest")
async def get_channel_latest_post(username: str):
    channel_data = get_channel_data(username)
    if not channel_data or not channel_data.get('success'):
        return get_mock_latest_post(username)
    
    posts = channel_data.get('posts', [])
    if not posts:
        return get_mock_latest_post(username)
    
    latest_post = posts[0]
    channel_info = channel_data.get('channel_info', {})
    
    return {
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
            "formatted_date": format_post_date(latest_post.get('date')),
            "formatted_views": format_number(latest_post.get('views', 0)),
            "link": latest_post.get('link')
        }
    }

@app.get("/projects")
async def get_projects(category: str = Query(default='all')):
    try:
        projects = []
        categories = ['work', 'fun'] if category == 'all' else [category] if category in ['work', 'fun'] else []
        
        if not categories:
            raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
        
        for cat in categories:
            cat_dir = config.projects_dir / cat
            if not cat_dir.exists():
                continue
            
            for md_file in cat_dir.glob('*.md'):
                try:
                    project_data = parse_project_metadata(md_file, cat)
                    if project_data:
                        projects.append(project_data)
                except Exception as e:
                    logging.error(f"Error parsing project {md_file}: {e}")
        
        return {"projects": projects, "total": len(projects), "category": category}
    except Exception as e:
        logging.error(f"Error loading projects: {e}")
        raise HTTPException(status_code=500, detail="Failed to load projects")

@app.get("/projects/{category}/{project_id}")
async def get_project_detail(category: str, project_id: str):
    if category not in ['work', 'fun']:
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
    
    project_file = config.projects_dir / category / f"{project_id}.md"
    
    if not project_file.exists():
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found in {category}")
    
    try:
        with open(project_file, 'r', encoding='utf-8') as f:
            content = f.read()
        return PlainTextResponse(content=content, media_type='text/markdown')
    except Exception as e:
        logging.error(f"Error reading project file: {e}")
        raise HTTPException(status_code=500, detail="Failed to read project content")

@app.post("/contact/send")
async def send_contact_message(message: ContactMessage):
    if not message.message or len(message.message.strip()) < 10:
        raise HTTPException(status_code=400, detail="Message must be at least 10 characters long")
    if len(message.message) > 2000:
        raise HTTPException(status_code=400, detail="Message must be less than 2000 characters")
    
    if not config.telegram_bot_token or not config.telegram_chat_id:
        logging.info(f"Contact message (dev mode): {message.message}")
        return {"success": True, "message": "Message logged (dev mode)", "dev_mode": True}
    
    telegram_text = f"📬 New Contact Message\n\nMessage:\n{message.message}\n\n"
    if message.contact:
        telegram_text += f"Contact: {message.contact}\n"
    else:
        telegram_text += "Contact: Anonymous\n"
    telegram_text += f"\nReceived: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://api.telegram.org/bot{config.telegram_bot_token}/sendMessage",
                json={"chat_id": config.telegram_chat_id, "text": telegram_text, "parse_mode": "HTML"},
                timeout=10.0
            )
            if response.status_code != 200:
                raise HTTPException(status_code=503, detail="Failed to send message to Telegram")
            return {"success": True, "message": "Message sent successfully"}
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Telegram API timeout")
    except Exception as e:
        logging.error(f"Error sending to Telegram: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

def parse_project_metadata(md_file: Path, category: str) -> Optional[Dict]:
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if not content.startswith('---'):
            return None
        
        parts = content.split('---', 2)
        if len(parts) < 3:
            return None
        
        frontmatter = parts[1].strip()
        metadata = {}
        for line in frontmatter.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip()
                if value.startswith('[') and value.endswith(']'):
                    value = [v.strip().strip('"\'') for v in value[1:-1].split(',')]
                else:
                    value = value.strip('"\'')
                metadata[key] = value
        
        return {
            "id": md_file.stem,
            "category": category,
            "title": metadata.get('title', md_file.stem),
            "thumbnail": metadata.get('thumbnail', '/assets/images/bg-mountains.jpg'),
            "description": metadata.get('description', ''),
            "tags": metadata.get('tags', []),
            "year": metadata.get('year'),
            "client": metadata.get('client'),
            "role": metadata.get('role')
        }
    except Exception as e:
        logging.error(f"Error parsing project metadata: {e}")
        return None

def format_post_date(date_str: Optional[str]) -> str:
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

def format_number(num: int) -> str:
    if num >= 1000000:
        return f"{num / 1000000:.1f}M"
    elif num >= 1000:
        return f"{num / 1000:.1f}K"
    else:
        return str(num)

def get_mock_latest_post(username: str) -> Dict:
    return {
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
