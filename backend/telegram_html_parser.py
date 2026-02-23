#!/usr/bin/env python3
"""
## ANCHOR POINTS
- ENTRY: Simple HTML parser for Telegram public channels
- MAIN: Fallback scraper when MTProto API unavailable
- EXPORTS: JSON data compatible with main scraper format
- DEPS: aiohttp, beautifulsoup4, lxml, asyncio
- TODOs: Error handling, rate limiting, proxy support

Telegram HTML Parser (Fallback)
UPDATED COMMENTS: Simple HTML scraper for public Telegram channel preview
Works without API keys by parsing public t.me pages
SCALED FOR: Multiple channels, error recovery, production use
REUSABLE LOGIC: Drop-in replacement for MTProto scraper
"""

import asyncio
import json
import logging
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urljoin

import aiohttp
from bs4 import BeautifulSoup

# REUSED: Configuration management
class HTMLParserConfig:
    """Configuration for HTML parser"""
    
    def __init__(self):
        # UPDATED COMMENTS: No API keys needed for HTML parsing
        self.channels = [
            'vanyashuvalov',
            'vanya_knopochkin',  # New channel
        ]
        
        # REUSABLE LOGIC: Output paths (same as MTProto scraper)
        self.output_dir = Path('data/telegram')
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # SCALED FOR: HTTP client configuration
        self.timeout = aiohttp.ClientTimeout(total=30)
        self.user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        self.posts_limit = 50  # UPDATED: Increased to get more posts for proper sorting

# FSD: shared/lib/telegram → HTML parser implementation
class TelegramHTMLParser:
    """
    HTML-based Telegram channel parser
    UPDATED COMMENTS: Parses public t.me preview pages without authentication
    SCALED FOR: Production use with proper error handling
    REUSED: Compatible output format with MTProto scraper
    """
    
    def __init__(self, config: HTMLParserConfig):
        self.config = config
        self.session = None
        
        # REUSED: Logging setup
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('telegram_html_parser.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    async def __aenter__(self):
        """Async context manager entry"""
        await self.initialize_session()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close_session()

    async def initialize_session(self):
        """
        Initialize aiohttp session
        UPDATED COMMENTS: Creates HTTP client with proper headers
        SCALED FOR: Connection pooling and timeout handling
        """
        headers = {
            'User-Agent': self.config.user_agent,
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        }
        
        self.session = aiohttp.ClientSession(
            timeout=self.config.timeout,
            headers=headers
        )
        self.logger.info("HTTP session initialized")

    async def close_session(self):
        """Close aiohttp session"""
        if self.session:
            await self.session.close()
            self.logger.info("HTTP session closed")

    async def fetch_channel_html(self, channel_username: str) -> Optional[str]:
        """
        Fetch channel HTML from public t.me page
        UPDATED COMMENTS: Gets public preview without authentication
        
        Args:
            channel_username: Channel username without @
            
        Returns:
            HTML content or None if failed
        """
        url = f"https://t.me/s/{channel_username}"
        
        try:
            self.logger.info(f"Fetching HTML for {channel_username} from {url}")
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    html = await response.text()
                    self.logger.info(f"Successfully fetched HTML for {channel_username}")
                    return html
                elif response.status == 404:
                    self.logger.error(f"Channel {channel_username} not found (404)")
                    return None
                else:
                    self.logger.error(f"HTTP {response.status} for {channel_username}")
                    return None
                    
        except asyncio.TimeoutError:
            self.logger.error(f"Timeout fetching {channel_username}")
            return None
        except Exception as e:
            self.logger.error(f"Error fetching {channel_username}: {e}")
            return None

    def parse_channel_info(self, html: str, channel_username: str) -> Optional[Dict]:
        """
        Parse channel information from HTML
        UPDATED COMMENTS: Extracts channel metadata from page structure
        REUSED: Output format compatible with MTProto scraper
        
        Args:
            html: HTML content from t.me page
            channel_username: Channel username
            
        Returns:
            Channel info dictionary or None
        """
        try:
            soup = BeautifulSoup(html, 'lxml')
            
            # UPDATED COMMENTS: Extract channel title
            title_elem = soup.find('div', class_='tgme_channel_info_header_title')
            title = title_elem.get_text(strip=True) if title_elem else channel_username
            
            # UPDATED COMMENTS: Extract description
            desc_elem = soup.find('div', class_='tgme_channel_info_description')
            description = desc_elem.get_text(strip=True) if desc_elem else ''
            
            # UPDATED COMMENTS: Extract subscriber count
            subscribers = 0
            counter_elem = soup.find('div', class_='tgme_channel_info_counter')
            if counter_elem:
                counter_text = counter_elem.get_text(strip=True)
                subscribers = self._parse_subscriber_count(counter_text)
            
            # UPDATED COMMENTS: Check for verified badge
            verified = soup.find('i', class_='verified-icon') is not None
            
            # UPDATED COMMENTS: Extract avatar URL
            avatar_url = None
            avatar_elem = soup.find('img', class_='tgme_page_photo_image')
            if avatar_elem and avatar_elem.get('src'):
                avatar_url = avatar_elem['src']
            
            channel_info = {
                'id': hash(channel_username),  # Fake ID for compatibility
                'title': title,
                'username': channel_username,
                'description': description,
                'subscribers_count': subscribers,
                'verified': verified,
                'scam': False,
                'restricted': False,
                'avatar_url': avatar_url,
                'last_updated': datetime.now(timezone.utc).isoformat(),
                'source': 'html_parser'  # Mark as HTML-parsed data
            }
            
            self.logger.info(f"Parsed channel info for {channel_username}: {title}")
            return channel_info
            
        except Exception as e:
            self.logger.error(f"Error parsing channel info: {e}")
            return None

    def parse_channel_posts(self, html: str, channel_username: str) -> List[Dict]:
        """
        Parse posts from channel HTML
        UPDATED COMMENTS: Extracts post data from message widgets
        SCALED FOR: Efficient parsing with proper error handling
        
        Args:
            html: HTML content from t.me page
            channel_username: Channel username
            
        Returns:
            List of post dictionaries
        """
        try:
            soup = BeautifulSoup(html, 'lxml')
            
            # UPDATED COMMENTS: Find ALL message widgets first (no limit)
            # CRITICAL: Parse all posts, then sort, then limit for accurate results
            message_widgets = soup.find_all('div', class_='tgme_widget_message')
            
            self.logger.info(f"Found {len(message_widgets)} total posts on page")
            
            posts = []
            # UPDATED: Parse ALL widgets, not just first N
            for widget in message_widgets:
                try:
                    post = self._parse_single_post(widget, channel_username)
                    if post:
                        posts.append(post)
                except Exception as e:
                    self.logger.warning(f"Error parsing post: {e}")
                    continue
            
            self.logger.info(f"Parsed {len(posts)} posts from {channel_username}")
            
            # UPDATED COMMENTS: Sort posts by date (newest first) for correct ordering
            # CRITICAL: Filter out posts without dates and sort remaining by timestamp
            posts_with_dates = [p for p in posts if p.get('date')]
            posts_without_dates = [p for p in posts if not p.get('date')]
            
            # REUSABLE LOGIC: Sort by ISO date string (descending = newest first)
            posts_with_dates.sort(key=lambda x: x['date'], reverse=True)
            
            # SCALED FOR: Return sorted posts with dated posts first, limited to config
            sorted_posts = posts_with_dates + posts_without_dates
            limited_posts = sorted_posts[:self.config.posts_limit]
            
            self.logger.info(f"Sorted posts by date - latest: {limited_posts[0].get('date') if limited_posts else 'none'}")
            self.logger.info(f"Returning top {len(limited_posts)} posts out of {len(sorted_posts)} total")
            return limited_posts
            
        except Exception as e:
            self.logger.error(f"Error parsing posts: {e}")
            return []

    def _parse_single_post(self, widget, channel_username: str) -> Optional[Dict]:
        """
        Parse single post widget
        REUSABLE LOGIC: Post data extraction with proper nested div handling
        FIX: Handles nested tgme_widget_message_text divs correctly
        """
        # UPDATED COMMENTS: Extract post ID from data attribute
        post_id = widget.get('data-post', '').split('/')[-1]
        if not post_id:
            return None
        
        # CRITICAL FIX: Extract post text from nested divs properly
        # UPDATED COMMENTS: Telegram uses nested divs with same class
        text_elem = widget.find('div', class_='tgme_widget_message_text')
        if text_elem:
            # REUSABLE LOGIC: Check if there's a nested div with same class
            nested_text_elem = text_elem.find('div', class_='tgme_widget_message_text')
            if nested_text_elem:
                # CRITICAL: Use inner div for text extraction
                text = nested_text_elem.get_text(strip=True)
            else:
                # REUSABLE LOGIC: Fallback to outer div if no nesting
                text = text_elem.get_text(strip=True)
        else:
            text = ''
        
        # UPDATED COMMENTS: Extract view count
        views = 0
        views_elem = widget.find('span', class_='tgme_widget_message_views')
        if views_elem:
            views_text = views_elem.get_text(strip=True)
            views = self._parse_view_count(views_text)
        
        # UPDATED COMMENTS: Extract date
        date_elem = widget.find('time')
        date_str = date_elem.get('datetime') if date_elem else None
        
        # UPDATED COMMENTS: Check for media
        media_type = None
        if widget.find('a', class_='tgme_widget_message_photo_wrap'):
            media_type = 'photo'
        elif widget.find('video', class_='tgme_widget_message_video'):
            media_type = 'video'
        elif widget.find('div', class_='tgme_widget_message_document'):
            media_type = 'document'
        
        post_data = {
            'id': int(post_id) if post_id.isdigit() else hash(post_id),
            'text': text,
            'date': date_str,
            'views': views,
            'forwards': 0,  # Not available in HTML
            'replies': 0,  # Not available in HTML
            'edit_date': None,
            'media_type': media_type,
            'link': f"https://t.me/{channel_username}/{post_id}"
        }
        
        return post_data

    def _parse_subscriber_count(self, text: str) -> int:
        """
        Parse subscriber count from text
        REUSABLE LOGIC: Number parsing with K/M suffixes
        """
        try:
            text = text.lower().replace(' ', '').replace(',', '')
            
            # UPDATED COMMENTS: Handle K/M suffixes
            if 'k' in text:
                number = float(text.replace('k', '').replace('subscribers', ''))
                return int(number * 1000)
            elif 'm' in text:
                number = float(text.replace('m', '').replace('subscribers', ''))
                return int(number * 1000000)
            else:
                # Extract first number found
                match = re.search(r'\d+', text)
                return int(match.group()) if match else 0
        except Exception:
            return 0

    def _parse_view_count(self, text: str) -> int:
        """
        Parse view count from text
        REUSABLE LOGIC: View count parsing
        """
        try:
            text = text.lower().replace(' ', '').replace(',', '')
            
            if 'k' in text:
                number = float(text.replace('k', ''))
                return int(number * 1000)
            elif 'm' in text:
                number = float(text.replace('m', ''))
                return int(number * 1000000)
            else:
                match = re.search(r'\d+', text)
                return int(match.group()) if match else 0
        except Exception:
            return 0

    async def scrape_channel(self, channel_username: str) -> Dict:
        """
        Complete channel scraping: info + posts
        REUSED: Same interface as MTProto scraper
        
        Args:
            channel_username: Channel username without @
            
        Returns:
            Complete channel data dictionary
        """
        self.logger.info(f"Scraping channel via HTML: {channel_username}")
        
        # UPDATED COMMENTS: Fetch HTML content
        html = await self.fetch_channel_html(channel_username)
        
        if not html:
            return {
                'channel_info': None,
                'posts': [],
                'scraped_at': datetime.now(timezone.utc).isoformat(),
                'success': False,
                'error': 'Failed to fetch channel HTML'
            }
        
        # UPDATED COMMENTS: Parse channel data
        channel_info = self.parse_channel_info(html, channel_username)
        posts = self.parse_channel_posts(html, channel_username)
        
        return {
            'channel_info': channel_info,
            'posts': posts,
            'scraped_at': datetime.now(timezone.utc).isoformat(),
            'success': channel_info is not None,
            'parser': 'html'  # Mark as HTML-parsed
        }

    async def scrape_all_channels(self) -> Dict:
        """
        Scrape all configured channels
        SCALED FOR: Multiple channels with rate limiting
        """
        self.logger.info("Starting HTML-based channel scraping")
        
        results = {}
        
        # UPDATED COMMENTS: Sequential processing to avoid rate limits
        for channel_username in self.config.channels:
            try:
                result = await self.scrape_channel(channel_username)
                results[channel_username] = result
                
                # SCALED FOR: Rate limiting between requests
                await asyncio.sleep(2)
                
            except Exception as e:
                self.logger.error(f"Error scraping {channel_username}: {e}")
                results[channel_username] = {
                    'error': str(e),
                    'success': False,
                    'scraped_at': datetime.now(timezone.utc).isoformat()
                }
        
        # REUSED: Save results to JSON (same format as MTProto scraper)
        output_file = self.config.output_dir / 'channels_data_html.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f"HTML scraping completed. Results saved to {output_file}")
        return results

# ANCHOR: main_execution
async def main():
    """
    Main execution function
    UPDATED COMMENTS: Async entry point for HTML parser
    """
    config = HTMLParserConfig()
    
    async with TelegramHTMLParser(config) as parser:
        results = await parser.scrape_all_channels()
        
        print("\n=== HTML Parser Results ===")
        for channel, data in results.items():
            if data.get('success'):
                info = data.get('channel_info', {})
                posts_count = len(data.get('posts', []))
                print(f"\n{channel}:")
                print(f"  Title: {info.get('title', 'N/A')}")
                print(f"  Subscribers: {info.get('subscribers_count', 0)}")
                print(f"  Posts fetched: {posts_count}")
            else:
                print(f"\n{channel}: FAILED - {data.get('error', 'Unknown error')}")

if __name__ == "__main__":
    # REUSED: Asyncio execution
    asyncio.run(main())
