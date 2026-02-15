#!/usr/bin/env python3
"""
## ANCHOR POINTS
- ENTRY: FastAPI server for Telegram channel data
- MAIN: REST API endpoints for frontend consumption
- EXPORTS: JSON API with channel info and posts
- DEPS: fastapi, uvicorn, json, pathlib
- TODOs: Authentication, rate limiting, caching

Telegram Data API Server
UPDATED COMMENTS: FastAPI server serving scraped Telegram channel data
Provides REST endpoints for frontend widget consumption
SCALED FOR: Multiple channels, caching, error handling
"""

import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

# REUSED: Configuration management
class APIConfig:
    """API server configuration"""
    
    def __init__(self):
        self.data_dir = Path('data/telegram')
        self.data_file = self.data_dir / 'channels_data.json'
        self.static_dir = self.data_dir
        
        # SCALED FOR: Cache configuration
        self.cache_ttl = 3600  # 1 hour cache
        self.max_posts_per_channel = 10

# FSD: shared/api/telegram → API server implementation
app = FastAPI(
    title="Telegram Channel Data API",
    description="API for serving scraped Telegram channel information",
    version="1.0.0"
)

# UPDATED COMMENTS: CORS configuration for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["GET"],
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
        "service": "Telegram Channel Data API",
        "version": "1.0.0",
        "endpoints": {
            "channels": "/api/channels",
            "channel": "/api/channels/{username}",
            "posts": "/api/channels/{username}/posts",
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
    last_update = None
    
    if data_exists:
        try:
            stat = config.data_file.stat()
            last_update = datetime.fromtimestamp(stat.st_mtime).isoformat()
        except Exception:
            pass
    
    return {
        "status": "healthy" if data_exists else "degraded",
        "data_file_exists": data_exists,
        "last_data_update": last_update,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/channels")
async def get_all_channels():
    """
    Get list of all available channels
    UPDATED COMMENTS: Returns channel list with basic metadata
    """
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
    """
    Get detailed channel information
    REUSED: Channel data retrieval with error handling
    
    Args:
        username: Channel username without @
    """
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
    """
    Get latest posts from channel
    UPDATED COMMENTS: Paginated posts with view counts and metadata
    SCALED FOR: Efficient data transfer with configurable limits
    
    Args:
        username: Channel username without @
        limit: Maximum number of posts to return (1-20)
    """
    channel_data = get_channel_data(username)
    
    if not channel_data:
        raise HTTPException(status_code=404, detail=f"Channel {username} not found")
    
    if not channel_data.get('success'):
        raise HTTPException(
            status_code=503,
            detail=f"Channel {username} posts unavailable: {channel_data.get('error', 'Unknown error')}"
        )
    
    posts = channel_data.get('posts', [])[:limit]
    
    # UPDATED COMMENTS: Format posts for frontend consumption
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
    """
    Get the latest post from channel (for widget display)
    REUSED: Single post retrieval optimized for widgets
    UPDATED COMMENTS: Works with both MTProto and HTML parser data
    """
    channel_data = get_channel_data(username)
    
    if not channel_data or not channel_data.get('success'):
        # UPDATED COMMENTS: Return mock data for development
        return get_mock_latest_post(username)
    
    posts = channel_data.get('posts', [])
    if not posts:
        return get_mock_latest_post(username)
    
    latest_post = posts[0]  # Posts are ordered by date desc
    channel_info = channel_data.get('channel_info', {})
    
    # UPDATED COMMENTS: Avatar removed - frontend uses static file
    
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
    """
    Mock data for development/fallback
    SCALED FOR: Graceful degradation when real data unavailable
    """
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
    
    # SCALED FOR: Production deployment configuration
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Disable in production
        log_level="info"
    )