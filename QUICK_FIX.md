# 🎯 Quick Video Loading Fix Checklist

## 5-Minute Quick Fix

### ✓ Step 1: Clear Browser Cache
- **Windows:** Ctrl + Shift + Delete
- **Mac:** Cmd + Shift + Delete
- Select "All time"
- Click "Clear data"

### ✓ Step 2: Hard Refresh
- **Windows:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R

### ✓ Step 3: Open Console (F12)
Check for these messages:
```
✓ Detected: Home page        ← If on home page
✓ Page initialization complete
✓ Video data retrieved successfully    ← If on video page
```

## If Videos Load on Home Page But Not on Detail Page

### Check 1: URL Format
Your URL should look like:
```
http://localhost/AdultPlatform/video.html?id=12345678901
                                          ^^^^^^^^^^^^^^^
                                          11-character ID
```

❌ Wrong: `video.html` (no ID)  
✅ Right: `video.html?id=12345678901`

### Check 2: Console Messages When Clicking Video
You should see:
```
🎬 goToVideo called with ID: 12345678901
🔗 Navigating to: video.html?id=12345678901
```

If you don't see these, the click handler isn't working.

### Check 3: Video Page Console
When video.html loads, check for:
```
=== VIDEO PAGE INIT ===
URL: http://localhost/AdultPlatform/video.html?id=12345678901
Video ID from URL: 12345678901
📺 Loading video details for ID: 12345678901
🌐 Making API request...
```

## If You See These Errors

### ❌ "No video ID provided in URL"
```bash
# Fix: Make sure URL has ?id=
http://localhost/AdultPlatform/video.html?id=12345678901
```

### ❌ "Invalid video ID format"
```bash
# Fix: Video ID must be exactly 11 characters
# Wrong: id=123456789     (9 chars)
# Right: id=12345678901   (11 chars)
```

### ❌ "API HTTP Error 404"
```bash
# The video doesn't exist or was removed
# Solution: Try a different video
```

### ❌ "Failed to fetch" or Network Error
```bash
# On localhost, API might be blocked
# Solution: Test on deployed server (Netlify)
# Or: Open Network tab to see actual error
```

## Using Network Tab (F12 → Network)

### To see API requests:
1. Open F12 → Network tab
2. Reload page
3. Click a video
4. Look for request to: `eporner.com/api/v2/video/id/`
5. Click it → Response tab shows video data

### Expected API Response:
```json
{
  "id": "12345678901",
  "title": "Video Title Here",
  "views": 5000,
  "rate": 4.5,
  "embed": "https://www.eporner.com/embed/12345678901/",
  "default_thumb": { "src": "..." }
}
```

## File Structure Check

Make sure these files exist:
```
AdultPlatform/
├── index.html           ✓ Home page
├── video.html           ✓ Video detail page
├── styles/
│   └── main.css         ✓ Styling
├── scripts/
│   └── main.js          ✓ JavaScript (enhanced with logging)
├── TROUBLESHOOTING_GUIDE.md    ✓ Detailed guide
└── VIDEO_LOADING_DIAGNOSTICS.md ✓ This file
```

## Emergency Fix

If nothing works:
1. **Close browser completely**
2. **Clear XAMPP cache** (restart XAMPP)
3. **Open fresh browser window**
4. **Go to:** `http://localhost/AdultPlatform/`
5. **Check Console (F12)** for errors

## One-Line Console Test

Paste this in Console to test everything:

```javascript
console.log('Page:', window.location.pathname);
console.log('ID:', new URLSearchParams(window.location.search).get('id'));
console.log('getVideo exists:', typeof getVideo);
console.log('API Base:', CONFIG.API_BASE);
```

Expected output:
```
Page: /AdultPlatform/video.html
ID: 12345678901
getVideo exists: function
API Base: https://www.eporner.com/api/v2/
```

## Still Stuck?

Take a screenshot of:
1. **URL bar** (showing the video.html?id=...)
2. **Console tab** (showing error messages)
3. **Network tab** (showing API response)

Share these 3 screenshots for targeted help!

## Key Files Modified

- ✅ `scripts/main.js` - Enhanced with detailed console logging
- ✅ `styles/main.css` - Added share button and modal styling
- ✅ Added `DIAGNOSTIC_SCRIPT.js` - Run in console to diagnose
- ✅ Added this file - Quick reference

---
**Last Updated:** December 1, 2025  
**What's New:** Enhanced logging for video loading issues + Share buttons
