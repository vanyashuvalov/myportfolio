# Quick Start: Telegram Parsers

## Fastest Way to Get Started (No API Keys!)

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Test HTML Parser (Works Immediately!)

```bash
# Test the new channel
python test_html_parser.py vanya_knopochkin

# Test another channel
python test_html_parser.py vanyashuvalov
```

Expected output:
```
=== Testing HTML Parser for: vanya_knopochkin ===

✓ Channel: Ваня Кнопочкин
✓ Username: @vanya_knopochkin
✓ Subscribers: 1,250
✓ Description: Channel description...
✓ Verified: False
✓ Posts fetched: 10

Latest post:
  Text: новый пост в канале...
  Views: 125
  Link: https://t.me/vanya_knopochkin/123

✓ SUCCESS!
```

### 3. Run Full Scraper

```bash
# HTML parser only (no API keys needed)
python telegram_html_parser.py

# Unified scraper (tries MTProto, falls back to HTML)
python unified_scraper.py
```

### 4. Start API Server

```bash
python api_server.py
```

Then test in browser:
- http://localhost:8000/health
- http://localhost:8000/api/channels
- http://localhost:8000/api/channels/vanya_knopochkin/latest

## Configuration

### Add New Channel

**1. Edit `telegram_html_parser.py`:**
```python
self.channels = [
    'vanyashuvalov',
    'vanya_knopochkin',
    'your_new_channel',  # Add here
]
```

**2. Edit `js/shared/config/telegram-channels.js`:**
```javascript
export const TELEGRAM_CHANNELS = {
  // ... existing channels
  your_new_channel: {
    username: 'your_new_channel',
    displayName: 'Channel Name',
    description: 'Description',
    url: 'https://t.me/your_new_channel',
    // ...
  }
};
```

**3. Test:**
```bash
python test_html_parser.py your_new_channel
```

## Optional: MTProto Setup

If you want to use the primary MTProto scraper:

### 1. Get API Credentials
Visit: https://my.telegram.org/apps

### 2. Configure `.env`
```bash
cd backend
cp .env.example .env
nano .env
```

Add your credentials:
```env
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890
TELEGRAM_PHONE=+1234567890
```

### 3. Run MTProto Scraper
```bash
python telegram_scraper.py --run-now
```

First run will ask for verification code from Telegram.

## Troubleshooting

### HTML Parser

**Error: Channel not found (404)**
- Check channel username (without @)
- Verify channel is public
- Try opening https://t.me/s/channel_username in browser

**Error: No posts returned**
- Channel might be empty
- Check if channel has recent posts
- Verify HTML structure hasn't changed

### MTProto

**Error: Invalid API credentials**
- Double-check API_ID and API_HASH
- Verify phone number format (+country_code)

**Error: Phone code required**
- Check Telegram app for verification code
- Enter code when prompted

## Production Deployment

### Schedule Daily Scraping

**Linux (cron):**
```bash
# Edit crontab
crontab -e

# Add line (runs at 2 AM daily)
0 2 * * * cd /path/to/backend && python unified_scraper.py >> /var/log/telegram_scraper.log 2>&1
```

**Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at 2:00 AM
4. Action: Start Program
5. Program: `python`
6. Arguments: `C:\path\to\backend\unified_scraper.py`

### Monitor Data Freshness

Check API health endpoint:
```bash
curl http://localhost:8000/health
```

Response includes `last_data_update` timestamp.

## API Endpoints

### Get All Channels
```bash
GET /api/channels
```

### Get Channel Info
```bash
GET /api/channels/{username}
```

### Get Channel Posts
```bash
GET /api/channels/{username}/posts?limit=10
```

### Get Latest Post (for widgets)
```bash
GET /api/channels/{username}/latest
```

## Files Overview

```
backend/
├── telegram_scraper.py          # MTProto scraper (primary)
├── telegram_html_parser.py      # HTML parser (fallback)
├── unified_scraper.py           # Intelligent wrapper
├── test_html_parser.py          # Quick testing tool
├── api_server.py                # FastAPI server
├── requirements.txt             # Python dependencies
├── .env                         # Configuration (create from .env.example)
└── data/telegram/               # Output directory
    └── channels_data.json       # Scraped data
```

## Next Steps

1. ✅ Test HTML parser with your channels
2. ✅ Run unified scraper
3. ✅ Start API server
4. ✅ Test API endpoints
5. ⏳ Schedule daily scraping
6. ⏳ Set up monitoring
7. ⏳ Deploy to production

## Support

For issues or questions:
- Check `backend/README_PARSERS.md` for detailed documentation
- Review logs in `telegram_html_parser.log`
- Test individual channels with `test_html_parser.py`

---

**Remember**: HTML parser works immediately without any API keys! 🎉
