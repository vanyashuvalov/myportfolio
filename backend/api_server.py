#!/usr/bin/env python3
"""
## ANCHOR POINTS
- ENTRY: FastAPI server for Telegram channel data and contact messages
- MAIN: REST API endpoints for frontend consumption
- EXPORTS: JSON API with channel info, posts, contact submission, and projects
- DEPS: fastapi, uvicorn, json, pathlib, httpx, python-dotenv
- TODOs: Authentication, rate limiting, caching

Telegram Data API Server
UPDATED COMMENTS: FastAPI server serving scraped Telegram channel data and project content
Provides REST endpoints for frontend widget consumption, contact messages, and markdown projects
SCALED FOR: Multiple channels, caching, error handling, Telegram bot integration, project pages
"""

import json
import logging
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# CRITICAL: Load environment variables from backend/.env
load_dotenv(Path(__file__).parent / '.env')

# REUSED: Configuration management
class APIConfig:
    """API server configuration"""
    
    def __init__(self):
        # CRITICAL: Use backend/data paths for correct file location
        self.data_dir = Path(__file__).parent / 'data' / 'telegram'
        self.data_file = self.data_dir / 'channels_data.json'
        self.static_dir = self.data_dir
        
        # UPDATED COMMENTS: Projects directory for markdown files
        self.projects_dir = Path(__file__).parent / 'data' / 'projects'
        
        # SCALED FOR: Cache configuration
        self.cache_ttl = 3600  # 1 hour cache
        self.max_posts_per_channel = 10
        
        # CRITICAL: Telegram bot configuration
        self.telegram_bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.telegram_chat_id = os.getenv('TELEGRAM_CHAT_ID')

# ANCHOR: request_models
class ContactMessage(BaseModel):
    """Contact message request model"""
    message: str
    contact: Optional[str] = None

# FSD: shared/api/telegram → API server implementation
app = FastAPI(
    title="Portfolio API",
    description="API for Telegram channel data and project content",
    version="2.0.0"
)

# UPDATED COMMENTS: CORS configuration for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],  # CRITICAL: Allow all methods including POST
    allow_headers=["*"],
)

# REUSED: Global configuration
config = APIConfig()

# SCALED FOR: In-memory cache with TTL
class DataCache:
    """Simple in-memory cache with TTL"""
    
    def __init__(self):
        self._cache = {}
        self._timestamps = {}
    
    def get(self, key: str) -> Optional[Dict]:
        """Get cached data if not expired"""
        if key in self._cache:
            if datetime.now() - self._timestamps[key] < timedelta(seconds=config.cache_ttl):
                return self._cache[key]
            else:
                # UPDATED COMMENTS: Clean expired cache entries
                del self._cache[key]
                del self._timestamps[key]
        return None
    
    def set(self, key: str, data: Dict):
        """Set cache data with timestamp"""
        self._cache[key] = data
        self._timestamps[key] = datetime.now()

# REUSABLE LOGIC: Global cache instance
cache = DataCache()

def load_channels_data() -> Dict:
    """
    Load channels data from JSON file
    UPDATED COMMENTS: File-based data loading with error handling
    SCALED FOR: Large data files with memory efficiency
    """
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
    Get specific channel data with caching
    REUSED: Cache-first data retrieval pattern
    """
    # UPDATED COMMENTS: Check cache first
    cache_key = f"channel_{channel_username}"
    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data
    
    # SCALED FOR: File-based data loading
    all_data = load_channels_data()
    channel_data = all_data.get(channel_username)
    
    if channel_data:
        cache.set(cache_key, channel_data)
    
    return channel_data

# ANCHOR: api_endpoints
@app.get("/")
async def root():
    """API root endpoint with basic info"""
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
    """
    Health check endpoint
    SCALED FOR: Monitoring and load balancer integration
    """
    data_exists = config.data_file.exists()
    projects_exist = config.projects_dir.exists()
    last_update = None
    
    if data_exists:
        try:
            stat = config.data_file.stat()
            last_update = datetime.fromtimestamp(stat.st_mtime).isoformat()
        except Exception:
            pass
    
    return {
        "status": "healthy" if (data_exists and projects_exist) else "degraded",
        "data_file_exists": data_exists,
        "projects_dir_exists": projects_exist,
        "last_data_update": last_update,
        "timestamp": datetime.now().isoformat()
    }

# ANCHOR: telegram_endpoints (existing code continues...)
@app.get("/api/channels")
async def get_all_channels():
    """Get list of all available channels"""
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
    
    return {
        "channels": channels,
        "total": len(channels),
        "last_updated": max([ch.get('last_updated', '') for ch in channels], default=None)
    }

@app.get("/api/channels/{username}")
async def get_channel_info(username: str):
    """Get detailed channel information"""
    channel_data = get_channel_data(username)
    
    if not channel_data:
        raise HTTPException(status_code=404, detail=f"Channel {username} not found")
    
    if not channel_data.get('success'):
        raise HTTPException(
            status_code=503, 
            detail=f"Channel {username} data unavailable: {channel_data.get('error', 'Unknown error')}"
        )
    
    return {
        "channel": channel_data['channel_info'],
        "last_updated": channel_data.get('scraped_at'),
        "posts_available": len(channel_data.get('posts', []))
    }

@app.get("/api/channels/{username}/posts")
async def get_channel_posts(
    username: str,
    limit: int = Query(default=5, ge=1, le=20, description="Number of posts to return")
):
    """Get latest posts from channel"""
    channel_data = get_channel_data(username)
    
    if not channel_data:
        raise HTTPException(status_code=404, detail=f"Channel {username} not found")
    
    if not channel_data.get('success'):
        raise HTTPException(
            status_code=503,
            detail=f"Channel {username} posts unavailable: {channel_data.get('error', 'Unknown error')}"
        )
    
    posts = channel_data.get('posts', [])[:limit]
    
    formatted_posts = []
    for post in posts:
        formatted_post = {
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
        }
        formatted_posts.append(formatted_post)
    
    return {
        "posts": formatted_posts,
        "channel": username,
        "total_returned": len(formatted_posts),
        "last_updated": channel_data.get('scraped_at')
    }

@app.get("/api/channels/{username}/latest")
async def get_channel_latest_post(username: str):
    """Get the latest post from channel (for widget display)"""
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
            "verified": channel_info.get('verified', False),
            "source": channel_data.get('parser', channel_data.get('source', 'unknown'))
        },
        "latest_post": {
            "text": latest_post.get('text', ''),
            "views": latest_post.get('views', 0),
            "date": latest_post.get('date'),
            "formatted_date": format_post_date(latest_post.get('date')),
            "formatted_views": format_number(latest_post.get('views', 0)),
            "link": latest_post.get('link')
        },
        "last_updated": channel_data.get('scraped_at')
    }

# ANCHOR: projects_endpoints
@app.get("/api/projects")
async def get_projects(category: str = Query(default='all', description="Project category: work, fun, or all")):
    """
    Get list of projects by category
    UPDATED COMMENTS: Returns project metadata from markdown frontmatter
    SCALED FOR: Multiple categories with filtering
    """
    try:
        projects = []
        
        # CRITICAL: Determine which categories to scan
        categories = []
        if category == 'all':
            categories = ['work', 'fun']
        elif category in ['work', 'fun']:
            categories = [category]
        else:
            raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
        
        # UPDATED COMMENTS: Scan project directories
        for cat in categories:
            cat_dir = config.projects_dir / cat
            if not cat_dir.exists():
                continue
            
            # SCALED FOR: Read all .md files in category
            for md_file in cat_dir.glob('*.md'):
                try:
                    project_data = parse_project_metadata(md_file, cat)
                    if project_data:
                        projects.append(project_data)
                except Exception as e:
                    logging.error(f"Error parsing project {md_file}: {e}")
                    continue
        
        return {
            "projects": projects,
            "total": len(projects),
            "category": category
        }
        
    except Exception as e:
        logging.error(f"Error loading projects: {e}")
        raise HTTPException(status_code=500, detail="Failed to load projects")

@app.get("/api/projects/{category}/{project_id}")
async def get_project_detail(category: str, project_id: str):
    """
    Get project markdown content
    UPDATED COMMENTS: Returns raw markdown for frontend parsing
    SCALED FOR: Category-based project organization
    """
    if category not in ['work', 'fun']:
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
    
    # CRITICAL: Construct file path
    project_file = config.projects_dir / category / f"{project_id}.md"
    
    if not project_file.exists():
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found in {category}")
    
    try:
        # UPDATED COMMENTS: Return raw markdown content
        with open(project_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return PlainTextResponse(content=content, media_type='text/markdown')
        
    except Exception as e:
        logging.error(f"Error reading project file: {e}")
        raise HTTPException(status_code=500, detail="Failed to read project content")

def parse_project_metadata(md_file: Path, category: str) -> Optional[Dict]:
    """
    Parse project metadata from markdown frontmatter
    REUSED: Frontmatter parsing for project list
    """
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # CRITICAL: Extract frontmatter
        if not content.startswith('---'):
            return None
        
        parts = content.split('---', 2)
        if len(parts) < 3:
            return None
        
        frontmatter = parts[1].strip()
        
        # UPDATED COMMENTS: Parse YAML-like frontmatter
        metadata = {}
        for line in frontmatter.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip()
                
                # SCALED FOR: Parse arrays
                if value.startswith('[') and value.endswith(']'):
                    value = [v.strip().strip('"\'') for v in value[1:-1].split(',')]
                else:
                    value = value.strip('"\'')
                
                metadata[key] = value
        
        # REUSED: Project ID from filename
        project_id = md_file.stem
        
        return {
            "id": project_id,
            "category": category,
            "title": metadata.get('title', project_id),
            "thumbnail": metadata.get('thumbnail', '/assets/images/bg-mountains.jpg'),  # UPDATED: Use existing image as fallback
            "description": metadata.get('description', ''),
            "tags": metadata.get('tags', []),
            "year": metadata.get('year'),
            "client": metadata.get('client'),
            "role": metadata.get('role')
        }
        
    except Exception as e:
        logging.error(f"Error parsing project metadata: {e}")
        return None

# ANCHOR: contact_message_endpoint
@app.post("/api/contact/send")
async def send_contact_message(message: ContactMessage):
    """Send contact message to Telegram bot"""
    if not message.message or len(message.message.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Message must be at least 10 characters long"
        )
    
    if len(message.message) > 2000:
        raise HTTPException(
            status_code=400,
            detail="Message must be less than 2000 characters"
        )
    
    if not config.telegram_bot_token or not config.telegram_chat_id:
        logging.info("=" * 60)
        logging.info("📬 New Contact Message (Development Mode)")
        logging.info("=" * 60)
        logging.info(f"Message: {message.message}")
        logging.info(f"Contact: {message.contact or 'Anonymous'}")
        logging.info(f"Received: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logging.info("=" * 60)
        
        return {
            "success": True,
            "message": "Message logged (Telegram bot not configured)",
            "dev_mode": True
        }
    
    telegram_text = f"📬 New Contact Message\n\n"
    telegram_text += f"Message:\n{message.message}\n\n"
    
    if message.contact:
        telegram_text += f"Contact: {message.contact}\n"
    else:
        telegram_text += "Contact: Anonymous\n"
    
    telegram_text += f"\nReceived: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://api.telegram.org/bot{config.telegram_bot_token}/sendMessage",
                json={
                    "chat_id": config.telegram_chat_id,
                    "text": telegram_text,
                    "parse_mode": "HTML"
                },
                timeout=10.0
            )
            
            if response.status_code != 200:
                logging.error(f"Telegram API error: {response.text}")
                raise HTTPException(
                    status_code=503,
                    detail="Failed to send message to Telegram"
                )
            
            return {
                "success": True,
                "message": "Message sent successfully"
            }
    
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Telegram API timeout"
        )
    except Exception as e:
        logging.error(f"Error sending to Telegram: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

# REUSABLE LOGIC: Utility functions
def format_post_date(date_str: Optional[str]) -> str:
    """Format post date for display"""
    if not date_str:
        return "Unknown"
    
    try:
        post_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        now = datetime.now(post_date.tzinfo)
        
        diff = now - post_date
        
        if diff.days > 0:
            return f"{diff.days}d ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours}h ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes}m ago"
        else:
            return "Just now"
    except Exception:
        return "Unknown"

def format_number(num: int) -> str:
    """Format large numbers for display"""
    if num >= 1000000:
        return f"{num / 1000000:.1f}M"
    elif num >= 1000:
        return f"{num / 1000:.1f}K"
    else:
        return str(num)

def get_mock_latest_post(username: str) -> Dict:
    """Mock data for development/fallback"""
    return {
        "channel": {
            "username": username,
            "title": "Ваня Кнопочкин" if username == "vanyashuvalov" else username.title(),
            "avatar_url": None,
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
        "last_updated": datetime.now().isoformat(),
        "mock_data": True
    }

# UPDATED COMMENTS: Static file serving for avatars
app.mount("/static", StaticFiles(directory=str(config.static_dir)), name="static")

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
