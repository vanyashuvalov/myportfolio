#!/usr/bin/env python3
"""
Quick test script for HTML parser
UPDATED COMMENTS: Simple test to verify HTML parser works
"""

import asyncio
import sys
from telegram_html_parser import TelegramHTMLParser, HTMLParserConfig

async def test_single_channel(channel_username: str):
    """Test HTML parser on a single channel"""
    print(f"\n=== Testing HTML Parser for: {channel_username} ===\n")
    
    config = HTMLParserConfig()
    config.channels = [channel_username]
    
    async with TelegramHTMLParser(config) as parser:
        result = await parser.scrape_channel(channel_username)
        
        if result.get('success'):
            info = result.get('channel_info', {})
            posts = result.get('posts', [])
            
            print(f"✓ Channel: {info.get('title', 'N/A')}")
            print(f"✓ Username: @{info.get('username', 'N/A')}")
            print(f"✓ Subscribers: {info.get('subscribers_count', 0):,}")
            print(f"✓ Description: {info.get('description', 'N/A')[:100]}...")
            print(f"✓ Verified: {info.get('verified', False)}")
            print(f"✓ Posts fetched: {len(posts)}")
            
            if posts:
                print(f"\nLatest post:")
                latest = posts[0]
                print(f"  Text: {latest.get('text', 'N/A')[:100]}...")
                print(f"  Views: {latest.get('views', 0):,}")
                print(f"  Link: {latest.get('link', 'N/A')}")
            
            print(f"\n✓ SUCCESS!")
        else:
            print(f"✗ FAILED: {result.get('error', 'Unknown error')}")

if __name__ == "__main__":
    channel = sys.argv[1] if len(sys.argv) > 1 else 'vanya_knopochkin'
    asyncio.run(test_single_channel(channel))
