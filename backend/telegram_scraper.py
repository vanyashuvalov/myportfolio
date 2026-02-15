#!/usr/bin/env python3
"""
## ANCHOR POINTS
- ENTRY: Daily Telegram channel data scraper using MTProto
- MAIN: Telethon client for channel information and posts
- EXPORTS: JSON files with channel data for frontend consumption
- DEPS: telethon, asyncio, json, schedule
- TODOs: Error handling, rate limiting, multiple channels

Telegram MTProto Scraper
UPDATED COMMENTS: Daily scraper for channel data using Telethon MTProto API
Runs once per day at night to fetch fresh channel information and latest posts
SCALED FOR: Multiple channels, error recovery, data persistence
"""

import asyncio
import json
import logging
import os
import schedule
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

from telethon import TelegramClient
from telethon.errors import ChannelPrivateError, UsernameNotOccupiedError
from telethon.tl.types import Channel, Chat, User

# REUSED: Configuration management
class Config:
    """Configuration for Telegram scraper"""
    
    def __init__(self):
        # UPDATED COMMENTS: Telegram API credentials from environment
        self.api_id = os.getenv('TELEGRAM_API_ID')
        self.api_hash = os.getenv('TELEGRAM_API_HASH')
        self.phone = os.getenv('TELEGRAM_PHONE')
        
        # SCALED FOR: Multiple channels configuration
        self.channels = [
            'vanyashuvalov',  # Main portfolio channel
            'vanya_knopochkin',  # Vanya Knopochkin channel
            # Add more channels as needed
        ]
        
        # REUSABLE LOGIC: Output paths
        self.output_dir = Path('data/telegram')
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # UPDATED COMMENTS: Scraping configuration
        self.posts_limit = 5  # Latest N posts per channel
        self.schedule_time = "02:00"  # 2 AM daily run

# FSD: shared/lib/telegram → MTProto client wrapper
class TelegramScraper:
    """
    MTProto-based Telegram channel scraper
    UPDATED COMMENTS: Handles authentication, channel data fetching, error recovery
    SCALED FOR: Production use with proper error handling and logging
    """
    
    def __init__(self, config: Config):
        self.config = config
        self.client = None
        
        # REUSED: Logging setup
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('telegram_scraper.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    async def initialize_client(self) -> bool:
        """
        Initialize Telethon client with authentication
        UPDATED COMMENTS: Handles session management and authentication flow
        Returns: True if successful, False otherwise
        """
        try:
            # SCALED FOR: Session persistence
            self.client = TelegramClient(
                'telegram_scraper_session',
                self.config.api_id,
                self.config.api_hash
            )
            
            await self.client.start(phone=self.config.phone)
            
            # UPDATED COMMENTS: Verify authentication
            me = await self.client.get_me()
            self.logger.info(f"Authenticated as: {me.first_name} (@{me.username})")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize client: {e}")
            return False

    async def get_channel_info(self, channel_username: str) -> Optional[Dict]:
        """
        Get channel information using MTProto API
        UPDATED COMMENTS: Fetches channel metadata, avatar, description
        
        Args:
            channel_username: Channel username without @
            
        Returns:
            Dict with channel info or None if failed
        """
        try:
            # REUSED: Entity resolution
            entity = await self.client.get_entity(channel_username)
            
            if not isinstance(entity, Channel):
                self.logger.warning(f"{channel_username} is not a channel")
                return None
            
            # UPDATED COMMENTS: Extract channel metadata
            channel_info = {
                'id': entity.id,
                'title': entity.title,
                'username': entity.username,
                'description': entity.about or '',
                'subscribers_count': getattr(entity, 'participants_count', 0),
                'verified': getattr(entity, 'verified', False),
                'scam': getattr(entity, 'scam', False),
                'restricted': getattr(entity, 'restricted', False),
                'last_updated': datetime.now(timezone.utc).isoformat()
            }
            
            # SCALED FOR: Avatar handling with file download
            if entity.photo:
                try:
                    # UPDATED COMMENTS: Download channel avatar
                    avatar_path = self.config.output_dir / f"{channel_username}_avatar.jpg"
                    await self.client.download_profile_photo(
                        entity,
                        file=str(avatar_path)
                    )
                    channel_info['avatar_path'] = str(avatar_path)
                    self.logger.info(f"Downloaded avatar for {channel_username}")
                except Exception as e:
                    self.logger.warning(f"Failed to download avatar for {channel_username}: {e}")
                    channel_info['avatar_path'] = None
            else:
                channel_info['avatar_path'] = None
            
            return channel_info
            
        except (ChannelPrivateError, UsernameNotOccupiedError) as e:
            self.logger.error(f"Channel {channel_username} not accessible: {e}")
            return None
        except Exception as e:
            self.logger.error(f"Error getting channel info for {channel_username}: {e}")
            return None

    async def get_channel_posts(self, channel_username: str, limit: int = 5) -> List[Dict]:
        """
        Get latest posts from channel with view counts
        UPDATED COMMENTS: Fetches posts with full metadata including views
        SCALED FOR: Efficient message fetching with proper error handling
        
        Args:
            channel_username: Channel username without @
            limit: Number of latest posts to fetch
            
        Returns:
            List of post dictionaries
        """
        try:
            entity = await self.client.get_entity(channel_username)
            
            # REUSED: Message fetching with limit
            messages = await self.client.get_messages(entity, limit=limit)
            
            posts = []
            for msg in messages:
                if msg.text or msg.media:  # Only posts with content
                    post_data = {
                        'id': msg.id,
                        'text': msg.text or '',
                        'date': msg.date.isoformat() if msg.date else None,
                        'views': getattr(msg, 'views', 0),  # CRITICAL: View count!
                        'forwards': getattr(msg, 'forwards', 0),
                        'replies': getattr(msg.replies, 'replies', 0) if msg.replies else 0,
                        'edit_date': msg.edit_date.isoformat() if msg.edit_date else None,
                        'media_type': None,
                        'link': f"https://t.me/{channel_username}/{msg.id}"
                    }
                    
                    # UPDATED COMMENTS: Media type detection
                    if msg.media:
                        if hasattr(msg.media, 'photo'):
                            post_data['media_type'] = 'photo'
                        elif hasattr(msg.media, 'document'):
                            post_data['media_type'] = 'document'
                        elif hasattr(msg.media, 'webpage'):
                            post_data['media_type'] = 'webpage'
                    
                    posts.append(post_data)
            
            self.logger.info(f"Fetched {len(posts)} posts from {channel_username}")
            return posts
            
        except Exception as e:
            self.logger.error(f"Error getting posts for {channel_username}: {e}")
            return []

    async def scrape_channel(self, channel_username: str) -> Dict:
        """
        Complete channel scraping: info + posts
        REUSABLE LOGIC: Combines channel info and posts fetching
        
        Args:
            channel_username: Channel username without @
            
        Returns:
            Complete channel data dictionary
        """
        self.logger.info(f"Scraping channel: {channel_username}")
        
        # UPDATED COMMENTS: Parallel fetching for efficiency
        channel_info_task = self.get_channel_info(channel_username)
        posts_task = self.get_channel_posts(channel_username, self.config.posts_limit)
        
        channel_info, posts = await asyncio.gather(
            channel_info_task,
            posts_task,
            return_exceptions=True
        )
        
        # SCALED FOR: Error handling in parallel execution
        if isinstance(channel_info, Exception):
            self.logger.error(f"Channel info error: {channel_info}")
            channel_info = None
            
        if isinstance(posts, Exception):
            self.logger.error(f"Posts error: {posts}")
            posts = []
        
        return {
            'channel_info': channel_info,
            'posts': posts,
            'scraped_at': datetime.now(timezone.utc).isoformat(),
            'success': channel_info is not None
        }

    async def scrape_all_channels(self) -> Dict:
        """
        Scrape all configured channels
        SCALED FOR: Multiple channels with concurrent processing
        """
        self.logger.info("Starting daily channel scraping")
        
        if not await self.initialize_client():
            return {'error': 'Failed to initialize Telegram client'}
        
        try:
            results = {}
            
            # UPDATED COMMENTS: Sequential processing to avoid rate limits
            for channel_username in self.config.channels:
                try:
                    result = await self.scrape_channel(channel_username)
                    results[channel_username] = result
                    
                    # SCALED FOR: Rate limiting between channels
                    await asyncio.sleep(2)
                    
                except Exception as e:
                    self.logger.error(f"Error scraping {channel_username}: {e}")
                    results[channel_username] = {
                        'error': str(e),
                        'success': False,
                        'scraped_at': datetime.now(timezone.utc).isoformat()
                    }
            
            # REUSED: Save results to JSON
            output_file = self.config.output_dir / 'channels_data.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            
            self.logger.info(f"Scraping completed. Results saved to {output_file}")
            return results
            
        finally:
            if self.client:
                await self.client.disconnect()

# ANCHOR: scheduler
def run_daily_scraping():
    """
    Daily scraping job runner
    UPDATED COMMENTS: Asyncio wrapper for scheduled execution
    """
    config = Config()
    scraper = TelegramScraper(config)
    
    try:
        # REUSED: Asyncio event loop handling
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        results = loop.run_until_complete(scraper.scrape_all_channels())
        
        print(f"Daily scraping completed at {datetime.now()}")
        print(f"Results: {json.dumps(results, indent=2)}")
        
    except Exception as e:
        logging.error(f"Daily scraping failed: {e}")
    finally:
        loop.close()

def main():
    """
    Main scheduler entry point
    SCALED FOR: Production deployment with proper scheduling
    """
    config = Config()
    
    # UPDATED COMMENTS: Schedule daily execution
    schedule.every().day.at(config.schedule_time).do(run_daily_scraping)
    
    print(f"Telegram scraper scheduled to run daily at {config.schedule_time}")
    print("Press Ctrl+C to stop")
    
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        print("\nScheduler stopped")

if __name__ == "__main__":
    # REUSED: Direct execution for testing
    if len(os.sys.argv) > 1 and os.sys.argv[1] == "--run-now":
        print("Running scraper immediately...")
        run_daily_scraping()
    else:
        main()