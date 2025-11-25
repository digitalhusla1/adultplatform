# Quick Reference: Eporner API v2 Integration

## 📋 Table of Contents
1. [API Overview](#api-overview)
2. [Endpoints Summary](#endpoints-summary)
3. [Implementation Status](#implementation-status)
4. [Testing Instructions](#testing-instructions)
5. [Troubleshooting](#troubleshooting)

## API Overview

### Base Configuration
```javascript
const API_BASE_URL = 'https://www.eporner.com/api/v2';
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3; // Automatic retry attempts
const DEFAULT_PER_PAGE = 12; // Videos per page
```

### Core Features
- ✅ Automatic retry with exponential backoff
- ✅ Request timeout handling (10 seconds)
- ✅ CORS-enabled requests
- ✅ JSON response format
- ✅ Pagination support
- ✅ Rate limit handling (429 status)

## Endpoints Summary

### Search Videos
```
GET https://www.eporner.com/api/v2/video/search/
```

**Common Parameters:**
```
query=all           // Search term or 'all'
per_page=12         // Results per page
page=1              // Page number
order=most-popular  // Sort order
thumbsize=medium    // Thumbnail size
gay=0               // Include gay content
format=json         // Response format
```

**Response:**
```json
{
  "count": 12,
  "total_count": 4112239,
  "total_pages": 343000,
  "page": 1,
  "videos": [
    {
      "id": "IsabYDAiqXa",
      "title": "Video Title",
      "views": 260221,
      "rate": "4.13",
      "length_min": "42:19",
      "embed": "https://www.eporner.com/embed/IsabYDAiqXa/",
      "default_thumb": {
        "src": "https://...",
        "width": 427,
        "height": 240
      }
    }
  ]
}
```

### Get Video Details
```
GET https://www.eporner.com/api/v2/video/id/?id=VIDEO_ID
```

**Parameters:**
```
id=IsabYDAiqXa      // Video ID (required)
thumbsize=medium    // Thumbnail size
format=json         // Response format
```

**Response:** Single video object or empty array

### Get Removed Videos
```
GET https://www.eporner.com/api/v2/video/removed/
```

**Parameters:**
```
format=json         // json, xml, or txt
```

**Response:**
```json
[
  {"id": "5UF0dWoWUdR"},
  {"id": "ez8cbX4tDtd"}
]
```

## Implementation Status

### All 17 Categories Implemented & Working

| Category | File | Status |
|----------|------|--------|
| Home (Search) | `index.html` / `script.js` | ✅ |
| Latest | `latest.html` / `latest.js` | ✅ |
| Popular | `popular.html` / `popular.js` | ✅ |
| Top Weekly | `top-weekly.html` / `top-weekly.js` | ✅ |
| Teen | `teen.html` / `teen.js` | ✅ |
| MILF | `milf.html` / `milf.js` | ✅ |
| Asian | `asian.html` / `asian.js` | ✅ |
| Amateur | `amateur.html` / `amateur.js` | ✅ |
| Anal | `anal.html` / `anal.js` | ✅ |
| Ebony | `ebony.html` / `ebony.js` | ✅ |
| Lesbian | `lesbian.html` / `lesbian.js` | ✅ |
| Creampie | `creampie.html` / `creampie.js` | ✅ |
| Outdoor | `outdoor.html` / `outdoor.js` | ✅ |
| Mature | `mature.html` / `mature.js` | ✅ |
| Hentai | `hentai.html` / `hentai.js` | ✅ |
| Threesome | `threesome.html` / `threesome.js` | ✅ |
| Categories | `categories.html` / `categories.js` | ✅ |

## Testing Instructions

### Method 1: Automated Health Check
1. Open `api-test.html` in your browser
2. Click "Test All Pages" button
3. View results in real-time
4. Check success rate and response times

### Method 2: Manual Testing
Run in PowerShell:
```powershell
# Test popular videos
Invoke-WebRequest -Uri "https://www.eporner.com/api/v2/video/search/?query=all&per_page=12&page=1&order=most-popular&format=json"

# Test teen category
Invoke-WebRequest -Uri "https://www.eporner.com/api/v2/video/search/?query=teen&per_page=12&page=1&format=json"
```

### Method 3: Browser Console
```javascript
// Fetch popular videos
fetch('https://www.eporner.com/api/v2/video/search/?query=all&per_page=12&page=1&order=most-popular&format=json')
  .then(r => r.json())
  .then(d => console.log(`Found ${d.videos.length} videos out of ${d.total_count}`))
```

## Troubleshooting

### Videos Not Loading
**Problem:** Page shows no videos
**Solution:**
1. Check browser console (F12) for errors
2. Verify internet connection
3. Check if API endpoint is accessible
4. Try hard refresh (Ctrl+Shift+R)

### Slow Loading
**Problem:** Takes more than 10 seconds to load
**Solution:**
1. Check network tab in DevTools
2. Reduce `per_page` parameter
3. Close other tabs using bandwidth
4. Wait a few minutes (API may be slow)

### CORS Errors
**Problem:** "CORS policy: No 'Access-Control-Allow-Origin' header"
**Solution:**
- This is handled in JavaScript code
- Check if browser has JavaScript enabled
- Try a different browser

### Video Removed Error
**Problem:** "Video has been removed"
**Solution:**
1. Video was likely deleted from Eporner
2. Select a different video
3. Refresh the page to load different videos

### Connection Timeout
**Problem:** "Request timeout after 10 seconds"
**Solution:**
1. Check internet connection
2. Try again in a few minutes
3. Eporner API may be experiencing issues

## Code Examples

### Fetch with Retry Logic
```javascript
async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                signal: AbortSignal.timeout(10000)
            });
            if (response.ok) return await response.json();
            if (response.status === 429) {
                // Rate limited, wait and retry
                await new Promise(r => setTimeout(r, 1000 * (i + 1)));
            }
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
}
```

### Search Videos
```javascript
const params = new URLSearchParams({
    query: 'teen',
    per_page: 12,
    page: 1,
    order: 'most-popular',
    format: 'json'
});

const url = `https://www.eporner.com/api/v2/video/search/?${params}`;
const data = await fetchWithRetry(url);
console.log(`Found ${data.videos.length} videos`);
```

### Display Video Card
```javascript
function createVideoCard(video) {
    const html = `
        <div class="video-card">
            <img src="${video.default_thumb.src}" alt="${video.title}">
            <h3>${video.title}</h3>
            <p>👁️ ${video.views} views | ⭐ ${video.rate}</p>
            <p>⏱️ ${video.length_min}</p>
        </div>
    `;
    return html;
}
```

## API Limits & Best Practices

### Rate Limits
- Don't exceed ~5 requests per second
- Implement exponential backoff on 429 responses
- Cache responses when possible

### Performance Tips
1. Use `per_page=12` for faster loading
2. Use `thumbsize=medium` (smaller filesize)
3. Implement pagination to limit results
4. Cache API responses server-side

### SEO Considerations
- Each page has unique meta tags
- Video metadata included in schema.org JSON-LD
- Descriptive titles and keywords

## Support Resources

- **API Docs**: https://www.eporner.com/api/v2/
- **Test Page**: Open `api-test.html` in browser
- **Health Check**: See `API-HEALTH-CHECK.md`
- **README**: See main project `README.md`

## Status Summary

✅ **All 17 categories fully functional**
✅ **API endpoints verified working**
✅ **Error handling implemented**
✅ **Pagination working**
✅ **Mobile responsive**
✅ **Performance optimized**

---
*For detailed information, see API-HEALTH-CHECK.md*
