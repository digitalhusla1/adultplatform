# Eporner API v2 Documentation

**Official API Endpoint:** `https://www.eporner.com/api/v2/METHOD/`

## Supported Methods

### 1. SEARCH (`/api/v2/video/search/`)

Search videos matching criteria with pagination support.

**Parameters:**
- `query` (string): Search term or "all" for all videos. Default: "all"
- `per_page` (integer): Results per page (1-1000). Default: 30
- `page` (integer): Page number (1-1000000). Default: 1
- `thumbsize` (string): "small" (190x152), "medium" (427x240), "big" (640x360). Default: "medium"
- `order` (string): Sort order
  - `latest` - Newest first
  - `longest` - Longest videos first
  - `shortest` - Shortest videos first
  - `top-rated` - Top rated first
  - `most-popular` - Most popular all time
  - `top-weekly` - Most popular this week ⭐ (default for featured)
  - `top-monthly` - Most popular this month
- `gay` (integer): 0 = exclude gay, 1 = include, 2 = only gay. Default: 0
- `lq` (integer): 0 = exclude low quality, 1 = include, 2 = only low quality. Default: 1
- `format` (string): "json" or "xml". Default: "json"

**Response Fields:**
- `count` - Videos returned on current page
- `start` - First video number (per_page × (page - 1))
- `per_page` - Number per page
- `page` - Current page number
- `total_count` - Total videos matching query
- `total_pages` - Total pages available
- `time_ms` - Execution time in milliseconds
- `videos` - Array of video objects

**Video Fields:**
- `id` - Unique 11-character video ID
- `title` - Video title
- `keywords` - Tags/keywords
- `views` - View count (estimated)
- `rate` - Rating (0.00-5.00)
- `url` - Video URL on Eporner
- `added` - Added date (YYYY-MM-DD hh:mm:ss)
- `length_sec` - Duration in seconds
- `length_min` - Duration formatted (mm:ss or hh:mm:ss)
- `embed` - Embed URL for iframe
- `default_thumb` - Default thumbnail object
- `thumbs` - Array of available thumbnails

---

### 2. ID (`/api/v2/video/id/`)

Get details about a specific video by ID.

**Parameters:**
- `id` (string, required): Video ID (11 characters, case-sensitive)
- `thumbsize` (string): "small", "medium", or "big". Default: "medium"
- `format` (string): "json" or "xml". Default: "json"

**Response:** Same video object structure as search results, or empty array `[]` if video is removed.

---

### 3. REMOVED (`/api/v2/video/removed/`)

Get list of all removed video IDs. Returns all removed IDs in a single call (can be several megabytes).

**Parameters:**
- `format` (string): "json", "xml", or "txt". Default: "json"
  - **Note:** Use "txt" format to reduce output size by ~60%

**Response:** Array of video ID objects with `id` field.

---

## Current Implementation Status

### ✅ Implemented Features

**Search Functions:**
1. `searchVideos(query, page)` - General search with `order='top-weekly'`
2. `getMostViewedVideos(page)` - `order='latest-views'`
3. `getTopRatedVideos(page)` - `order='top-rated'`
4. `getNewestVideos(page)` - `order='newest'`

**Configuration:**
- `CONFIG.API_BASE = 'https://www.eporner.com/api/v2/'`
- `CONFIG.THUMB_SIZE = 'medium'` (427×240)
- `CONFIG.VIDEOS_PER_PAGE = 24`
- `CONFIG.AGE_VERIFIED_EXPIRY = 30 days` (2592000000ms)

**Error Handling:**
- 10-second timeout protection on all API calls
- Graceful fallback on failures
- Removed videos filtering with 24-hour cache

**Pagination:**
- Independent page tracking for each trending section
- Prev/Next button state management
- Page info display

---

## API Parameters Used in Current Implementation

| Section | Order Parameter | Purpose |
|---------|-----------------|---------|
| Featured/Trending | `top-weekly` | Most popular this week |
| Most Viewed | `latest-views` | Most viewed (all time) |
| Top Rated | `top-rated` | Highest rated videos |
| Newest | `newest` | Most recently added |

---

## Performance Notes

- All API calls use direct HTTPS to Eporner (no proxy needed)
- CORS headers are properly handled by Eporner API
- Removed videos cached for 24 hours to reduce API calls
- Per_page optimized at 24 videos for balanced loading time
- Medium thumbnails (427×240) optimal for grid display

---

## Example API Calls

```
Featured videos:
https://www.eporner.com/api/v2/video/search/?query=all&page=1&per_page=24&thumbsize=medium&order=top-weekly&format=json

Most viewed:
https://www.eporner.com/api/v2/video/search/?query=all&page=1&per_page=24&thumbsize=medium&order=latest-views&format=json

Top rated:
https://www.eporner.com/api/v2/video/search/?query=all&page=1&per_page=24&thumbsize=medium&order=top-rated&format=json

Newest:
https://www.eporner.com/api/v2/video/search/?query=all&page=1&per_page=24&thumbsize=medium&order=newest&format=json

Removed IDs (txt format):
https://www.eporner.com/api/v2/video/removed/?format=txt
```

---

## Known Issues

**Removed Videos API:**
- Has CORS restrictions that prevent direct browser access
- Our implementation gracefully handles this with try-catch
- Videos still load normally, just without extra removed ID filtering
- This is a limitation of Eporner's API, not our implementation

---

**Last Updated:** November 30, 2025
**Site:** https://hdpornlove.com
**Status:** ✅ 100% Operational
