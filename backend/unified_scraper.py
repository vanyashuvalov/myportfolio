#!/usr/bin/env python3
"""
## ANCHOR POINTS
- ENTRY: Unified scraper with MTProto + HTML fallback
- MAIN: Tries MTProto first, falls back to HTML parser
- EXPORTS: Unified JSON output for API consumption
- DEPS: telegram_scraper, telegram_html_parser
- TODOs: Smart fallback logic, health monitoring

Unified Telegram Scraper
UPDATED COMMENTS: Intelligent scraper with automatic fallback
Tries MTProto API first, uses HTML parser as fallback
SCALED FOR: Production reliability with multiple data sources
REUSABLE LOGIC: Transparent fallback for API consumers
"""

import asyncio
import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Optional

# REUSED: Import both scrapers
try:
    from telegram_scraper import TelegramScraper, Config as MTProtoConfig
    MTPROTO_AVAILABLE = True
except ImportError:
    MTPROTO_AVAILABLE = False
    logging.warning("MTProto scraper not available")

try:
    from telegram_html_parser import TelegramHTMLParser, HTMLParserConfig
    HTML_PARSER_AVAILABLE = True
except ImportError:
    HTML_PARSER_AVAILABLE = False
    logging.warning("HTML parser not available")

# FSD: shared/lib/telegram → Unified scraper
class UnifiedTelegramScraper:
    """
    Unified scraper with intelligent fallback
    UPDATED COMMENTS: Tries MTProto first, HTML parser as fallback
    SCALED FOR: Maximum reliability in production
    """
    
    def __init__(self):
        self.output_dir = Path('data/telegram')
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # REUSED: Logging setup
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('unified_scraper.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # UPDATED COMMENTS: Check which scrapers are available
        self.mtproto_enabled = self._check_mtproto_config()
        self.html_enabled = HTML_PARSER_AVAILABLE

    def _check_mtproto_config(self) -> bool:
        """
        Check if MTProto credentials are configured
        REUSABLE LOGIC: Configuration validation
        """
        if not MTPROTO_AVAILABLE:
            return False
        
        api_id = os.getenv('TELEGRAM_API_ID')
        api_hash = os.getenv('TELEGRAM_API_HASH')
        
        if not api_id or not api_hash or api_id == 'your_api_id_here':
            self.logger.warning("MTProto credentials not configured")
            return False
        
        return True

    async def scrape_with_mtproto(self) -> Optional[Dict]:
        """
        Try scraping with MTProto API
        UPDATED COMMENTS: Primary scraping method
        """
        if not self.mtproto_enabled:
            self.logger.info("MTProto scraper not available, skipping")
            return None
        
        try:
            self.logger.info("Attempting MTProto scraping...")
            
            config = MTProtoConfig()
            scraper = TelegramScraper(config)
            
            results = await scraper.scrape_all_channels()
            
            # UPDATED COMMENTS: Check if scraping was successful
            success_count = sum(1 for data in results.values() if data.get('success'))
            
            if success_count > 0:
                self.logger.info(f"MTProto scraping successful: {success_count} channels")
                return results
            else:
                self.logger.warning("MTProto scraping failed for all channels")
                return None
                
        except Exception as e:
            self.logger.error(f"MTProto scraping error: {e}")
            return None

    async def scrape_with_html(self) -> Optional[Dict]:
        """
        Scrape using HTML parser (fallback)
        UPDATED COMMENTS: Fallback scraping method
        """
        if not self.html_enabled:
            self.logger.error("HTML parser not available")
            return None
        
        try:
            self.logger.info("Using HTML parser (fallback)...")
            
            config = HTMLParserConfig()
            
            async with TelegramHTMLParser(config) as parser:
                results = await parser.scrape_all_channels()
            
            # UPDATED COMMENTS: Check success
            success_count = sum(1 for data in results.values() if data.get('success'))
            
            if success_count > 0:
                self.logger.info(f"HTML scraping successful: {success_count} channels")
                return results
            else:
                self.logger.warning("HTML scraping failed for all channels")
                return None
                
        except Exception as e:
            self.logger.error(f"HTML scraping error: {e}")
            return None

    async def scrape_all(self) -> Dict:
        """
        Unified scraping with intelligent fallback
        SCALED FOR: Maximum reliability
        REUSABLE LOGIC: Transparent fallback for consumers
        """
        self.logger.info("=== Starting Unified Scraping ===")
        
        # UPDATED COMMENTS: Try MTProto first
        results = await self.scrape_with_mtproto()
        
        # UPDATED COMMENTS: Fallback to HTML if MTProto failed
        if not results:
            self.logger.info("Falling back to HTML parser...")
            results = await self.scrape_with_html()
        
        # UPDATED COMMENTS: Handle complete failure
        if not results:
            self.logger.error("All scraping methods failed!")
            return {
                'error': 'All scraping methods failed',
                'scraped_at': datetime.now(timezone.utc).isoformat(),
                'success': False
            }
        
        # REUSED: Save unified results
        output_file = self.output_dir / 'channels_data.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f"Unified scraping completed. Results saved to {output_file}")
        
        # UPDATED COMMENTS: Add metadata
        results['_metadata'] = {
            'scraped_at': datetime.now(timezone.utc).isoformat(),
            'scraper_type': 'unified',
            'mtproto_available': self.mtproto_enabled,
            'html_available': self.html_enabled
        }
        
        return results

# ANCHOR: main_execution
async def main():
    """
    Main execution function
    UPDATED COMMENTS: Entry point for unified scraper
    """
    scraper = UnifiedTelegramScraper()
    results = await scraper.scrape_all()
    
    print("\n=== Unified Scraper Results ===")
    
    if results.get('error'):
        print(f"ERROR: {results['error']}")
        return
    
    for channel, data in results.items():
        if channel.startswith('_'):  # Skip metadata
            continue
            
        if data.get('success'):
            info = data.get('channel_info', {})
            posts_count = len(data.get('posts', []))
            parser_type = data.get('parser', data.get('source', 'unknown'))
            
            print(f"\n{channel} [{parser_type}]:")
            print(f"  Title: {info.get('title', 'N/A')}")
            print(f"  Subscribers: {info.get('subscribers_count', 0):,}")
            print(f"  Posts fetched: {posts_count}")
            
            if posts_count > 0:
                latest = data['posts'][0]
                print(f"  Latest post views: {latest.get('views', 0):,}")
        else:
            print(f"\n{channel}: FAILED - {data.get('error', 'Unknown error')}")

if __name__ == "__main__":
    # REUSED: Asyncio execution
    asyncio.run(main())
