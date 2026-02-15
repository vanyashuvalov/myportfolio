# Telegram Parsers Documentation

## Overview

This project includes three Telegram scraping solutions with automatic fallback:

1. **MTProto Scraper** (`telegram_scraper.py`) - Primary method using official Telegram API
2. **HTML Parser** (`telegram_html_parser.py`) - Fallback method parsing public pages
3. **Unified Scraper** (`unified_scraper.py`) - Intelligent wrapper with automatic fallback

## Quick Start

### Option 1: HTML Parser (No API Keys Required)

```bash
# Install dependencies
pip install -r requirements.txt

# Test single channel
python test_html_parser.py vanya_knopochkin

# Run full scraper
python telegram_html_parser.py
```

### Option 2: MTProto API (Requires Credentials)

```bash
# 1. Get API credentials from https://my.telegram.org/apps
# 2. Configure backend/.env:
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
TELEGRAM_PHONE=+1234567890

# 3. Run scraper
python telegram_scraper.py --run-now
```

### Option 3: Unified Scraper (Recommended)

```bash
# Tries MTProto first, falls back to HTML automatically
python unified_scraper.py
```

## Comparison

| Feature | MTProto | HTML Parser |
|---------|---------|-------------|
| API Keys Required | ✓ Yes | ✗ No |
| Authentication | Phone + Code | None |
| Data Accuracy | High | Medium |
| View Counts | ✓ Accurate | ✓ Accurate |
| Subscriber Count | ✓ Accurate | ✓ Accurate |
| Post History | Deep | Limited (recent) |
| Rate Limits | Strict | Moderate |
| Reliability | High (if configured) | High |
| Setup Complexity | Medium | Low |

## Configuration

### Channels Configuration

Edit channel lists in:
- `telegram_scraper.py` → `Config.channels`
- `telegram_html_parser.py` → `HTMLParserConfig.channels`

```python
self.channels = [
    'vanyashuvalov',
    'vanya_knopochkin',
    # Add more channels
]
```

### Environment Variables

**Root `.env`:**
```env
TELEGRAM_CHANNEL_MAIN=https://t.me/vanyashuvalov
TELEGRAM_CHANNEL_KNOPOCHKIN=https://t.me/vanya_knopochkin
API_BASE_URL=http://localhost:8000
```

**Backend `backend/.env`:**
```env
# MTProto credentials (optional)
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
TELEGRAM_PHONE=+1234567890

# Server config
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true
```

## Output Format

Both scrapers produce compatible JSON output:

```json
{
  "vanya_knopochkin": {
    "channel_info": {
      "id": 123456789,
      "title": "Ваня Кнопочкин",
      "username": "vanya_knopochkin",
      "description": "Channel description",
      "subscribers_count": 1250,
      "verified": false,
      "avatar_url": "https://...",
      "last_updated": "2026-02-14T12:00:00Z"
    },
    "posts": [
      {
        "id": 123,
        "text": "Post content",
        "date": "2026-02-14T10:00:00Z",
        "views": 543,
        "forwards": 12,
        "replies": 5,
        "media_type": "photo",
        "link": "https://t.me/vanya_knopochkin/123"
      }
    ],
    "scraped_at": "2026-02-14T12:00:00Z",
    "success": true,
    "parser": "html"
  }
}
```

## API Server Integration

The API server (`api_server.py`) automatically works with both formats:

```bash
# Start API server
python api_server.py

# Test endpoints
curl http://localhost:8000/api/channels/vanya_knopochkin/latest
```

## Troubleshooting

### HTML Parser Issues

**Problem:** Channel not found (404)
- Verify channel username is correct
- Check if channel is public (private channels won't work)

**Problem:** No posts returned
- Channel might be empty
- Check if channel has recent posts

### MTProto Issues

**Problem:** Authentication failed
- Verify API credentials in `.env`
- Check phone number format (+country_code)
- Run interactive auth: `python telegram_scraper.py --run-now`

**Problem:** Rate limit errors
- Increase delay between channels in code
- Use HTML parser as fallback

## Development

### Testing HTML Parser

```bash
# Test specific channel
python test_html_parser.py vanya_knopochkin

# Test with custom channel
python test_html_parser.py designchannel
```

### Adding New Channels

1. Add to channel list in scraper config
2. Add to `js/shared/config/telegram-channels.js`
3. Run scraper to fetch data
4. Verify in API: `/api/channels/{username}`

## Production Deployment

### Recommended Setup

1. Use **Unified Scraper** for automatic fallback
2. Schedule with cron/systemd timer
3. Monitor logs for failures
4. Set up alerts for data staleness

### Cron Example

```bash
# Run unified scraper daily at 2 AM
0 2 * * * cd /path/to/backend && python unified_scraper.py >> scraper.log 2>&1
```

### Docker Deployment

See `backend/docker-compose.yml` for containerized setup.

## Architecture

```
┌─────────────────────────────────────┐
│     Unified Scraper                 │
│  (unified_scraper.py)               │
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────┐  ┌──────────────┐
│ MTProto │  │ HTML Parser  │
│ Scraper │  │ (Fallback)   │
└────┬────┘  └──────┬───────┘
     │              │
     └──────┬───────┘
            ▼
    ┌───────────────┐
    │ channels_data │
    │    .json      │
    └───────┬───────┘
            ▼
    ┌───────────────┐
    │  API Server   │
    │ (FastAPI)     │
    └───────┬───────┘
            ▼
    ┌───────────────┐
    │   Frontend    │
    │   Widgets     │
    └───────────────┘
```

## License & Credits

- MTProto implementation uses [Telethon](https://github.com/LonamiWebs/Telethon)
- HTML parsing uses [BeautifulSoup4](https://www.crummy.com/software/BeautifulSoup/)
- API server built with [FastAPI](https://fastapi.tiangolo.com/)
