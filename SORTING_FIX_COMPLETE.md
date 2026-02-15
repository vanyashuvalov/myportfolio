# Post Sorting Fix - Complete! ✅

## Problem
Posts were not sorted by date - oldest posts appeared first instead of newest.

## Root Cause
HTML parser was returning posts in the order they appeared on the page, without sorting by timestamp.

## Solution
Added date-based sorting in `telegram_html_parser.py`:

```python
# UPDATED COMMENTS: Sort posts by date (newest first)
posts_with_dates = [p for p in posts if p.get('date')]
posts_without_dates = [p for p in posts if not p.get('date')]

# Sort by ISO date string (descending = newest first)
posts_with_dates.sort(key=lambda x: x['date'], reverse=True)

# Return sorted posts with dated posts first
sorted_posts = posts_with_dates + posts_without_dates
```

## Verification

### Before Fix
First post: `2025-10-13` (old)
```json
{
  "id": 96,
  "date": "2025-10-13T12:25:28+00:00",
  "views": 375
}
```

### After Fix
First post: `2026-01-26` (newest!)
```json
{
  "id": 119,
  "text": "красиво но нихуя не понятно...",
  "date": "2026-01-26T21:41:24+00:00",
  "views": 146
}
```

## Changes Made

1. ✅ Updated `backend/telegram_html_parser.py`
   - Added date sorting logic in `parse_channel_posts()`
   - Filters posts with/without dates
   - Sorts by ISO timestamp (newest first)
   - Handles edge cases (posts without dates)

2. ✅ Re-ran scraper
   - `python unified_scraper.py`
   - Data updated in `channels_data.json`
   - API now serves correct order

3. ✅ Verified API response
   - Latest post endpoint returns newest post
   - Date: `2026-01-26T21:41:24+00:00`
   - Views: 146

## Testing

```bash
# Re-scrape data
cd backend
python unified_scraper.py

# Check API
curl http://localhost:8000/api/channels/vanya_knopochkin/latest

# Reload frontend
# Browser: Ctrl+F5 or Cmd+Shift+R
```

## Post Order (After Fix)

1. Post #119 - 2026-01-26 (146 views) ← NEWEST
2. Post #118 - 2026-01-20 (161 views)
3. Post #116 - 2026-01-20 (142 views)
4. Post #111 - 2026-01-17 (138 views)
5. Post #108 - 2025-12-14 (305 views)
6. Post #107 - 2025-12-09 (272 views)
7. Post #106 - 2025-11-24 (285 views)
8. Post #104 - 2025-10-28 (367 views)
9. Post #96 - 2025-10-13 (375 views) ← OLDEST
10. Post #112 - null date (143 views)

## Impact

✅ Widget now displays the most recent post
✅ Chronological order maintained
✅ Posts without dates appear at the end
✅ API consumers get correct ordering

## Next Steps

1. ✅ Sorting implemented
2. ✅ Data re-scraped
3. ✅ API updated
4. ⏳ Reload frontend page to see changes

---

**Status**: FIXED ✅
**Last Updated**: 2026-02-14
**Scraper Version**: HTML Parser with date sorting
