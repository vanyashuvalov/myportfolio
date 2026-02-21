---
title: Telegram Channel Scraper
slug: telegram-scraper
category: fun
year: 2024
tags: [Python, Web Scraping, API]
description: A tool to scrape and display Telegram channel content without API keys
thumbnail: /assets/icons/icon-park-outline_telegram.svg
hero_image: /assets/icons/icon-park-outline_telegram.svg
role: Solo Developer
---

## Project Overview

A Python-based scraper that extracts public Telegram channel data and serves it via REST API. Built to showcase channel content on personal websites without requiring Telegram API credentials.

::: callout note
This project demonstrates web scraping techniques and API design patterns.
:::

## The Challenge

Telegram's official API requires phone verification and API keys, which isn't ideal for simple content display. I needed a way to show my Telegram posts on my portfolio without complex authentication.

## Solution

Built a two-part system:
1. **Scraper**: Python script using BeautifulSoup to parse public channel HTML
2. **API Server**: FastAPI backend serving scraped data as JSON

::: stats
- **FastAPI** for REST endpoints
- **BeautifulSoup** for HTML parsing
- **JSON** file-based storage
- **CORS** enabled for frontend
:::

## Technical Details

### Scraping Strategy

```python
# Parse channel HTML structure
channel_info = parse_channel_metadata(html)
posts = parse_posts_from_html(html)

# Store with timestamps
data = {
    'channel_info': channel_info,
    'posts': posts,
    'scraped_at': datetime.now().isoformat()
}
```

### API Endpoints

- `GET /api/channels` - List all channels
- `GET /api/channels/{username}` - Channel info
- `GET /api/channels/{username}/posts` - Latest posts
- `GET /api/channels/{username}/latest` - Single latest post

## Results

Successfully integrated Telegram content into portfolio with:
- Real-time post updates
- View counts and engagement metrics
- Formatted dates and numbers
- Responsive widget display

## Lessons Learned

- Web scraping best practices and ethics
- API design for frontend consumption
- Caching strategies for performance
- Error handling for unreliable data sources

## Future Improvements

- Add webhook support for real-time updates
- Implement rate limiting
- Add more social platforms (Twitter, Instagram)
- Create admin dashboard for monitoring
