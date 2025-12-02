# Video Loading Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: Video not loading on localhost
**Symptoms:** Video page shows "Loading video..." or blank container

**Solution:**
1. Open **Browser Developer Tools** (F12 or Right-click → Inspect)
2. Go to **Console** tab
3. Check for error messages
4. Look for these specific errors:

#### Error: "Invalid video ID format"
- **Cause:** Video ID not being passed correctly in the URL
- **Fix:** 
  - Make sure you're accessing: `http://localhost/AdultPlatform/video.html?id=11digitID`
  - The ID must be exactly 11 characters
  - Check that the ID is in the URL: `?id=...`

#### Error: "API HTTP Error 404"
- **Cause:** Video ID is invalid or video doesn't exist
- **Fix:**
  - Verify the video ID is correct
  - Try with a different video ID from the homepage
  - Check that videos are loading on the home page first

#### Error: CORS or "Failed to fetch"
- **Cause:** Browser blocking API calls from localhost
- **Fix:**
  - This is normal on localhost - the Eporner API may block local requests
  - Solution: Test on a deployed version or add a proxy server

### Issue 2: "Video not found or has been removed"
**Symptoms:** The page loads but shows "Video not found" message

**Solutions:**
1. The video may have been removed from Eporner
2. Try clicking on a different video from the home page
3. Check the Network tab in Dev Tools to see the API response

### Issue 3: Videos load on home page but not on video detail page
**Symptoms:** Homepage shows videos fine, but clicking a video doesn't work

**Solutions:**
1. Check that `goToVideo()` function is being called:
   - Open Console in Dev Tools
   - Click a video
   - Look for console messages
   - Check if the URL includes the video ID

2. The video ID might contain invalid characters:
   - Check that the ID in the URL is exactly 11 alphanumeric characters
   - Example valid URL: `http://localhost/AdultPlatform/video.html?id=12345678901`

### Issue 4: Sharing buttons not working
**Symptoms:** "Share This Video" button does not open share dialog

**Solutions:**
1. Check Console for JavaScript errors
2. Make sure `shareVideo()` function is defined
3. Verify the button has correct onclick handler:
   ```html
   onclick="shareVideo('videoId', 'videoTitle'); return false;"
   ```

## Debugging Steps

### Step 1: Check Console Logs
```javascript
// When you click a video, you should see:
// "Detected: Video page"
// "Page initialization complete"
// "Share modal opened for video: [title]"
```

### Step 2: Check Network Requests
1. Open Dev Tools → Network tab
2. Click a video
3. Look for API call to: `https://www.eporner.com/api/v2/video/id/`
4. Check the response - should contain video data

### Step 3: Test URL Parameters
Copy this into your browser console:
```javascript
// Check if ID is being read correctly
const videoId = new URLSearchParams(window.location.search).get('id');
console.log('Video ID:', videoId);
```

## Localhost-Specific Issues

### Issue: Videos load but embed doesn't show
**Cause:** Mixed content warning (HTTP vs HTTPS)

**Solution:**
1. Make sure all URLs use the same protocol
2. Check the `video.embed` field contains an HTTPS URL
3. Look for warnings in Console about "mixed content"

### Issue: API blocked on localhost
**Cause:** CORS policy prevents localhost from accessing external APIs

**Solutions:**
1. Use Firefox for testing (more lenient)
2. Disable CORS in Chrome (dev mode only):
   - Close Chrome completely
   - Open with flag: `chrome --disable-web-security`
3. Test on a deployed server instead

## Quick Test

To verify everything is working:

1. **Go to home page:** `http://localhost/AdultPlatform/`
2. **Check Console:** Should show "Detected: Home page"
3. **Wait for videos:** Should load within 5 seconds
4. **Click a video:** Check URL changes to `video.html?id=xxxxx`
5. **Open Console:** Check for "Detected: Video page" message
6. **Check Network tab:** API call should return video data
7. **Click Share button:** Modal should appear with 3 share options

## Still Having Issues?

1. **Clear browser cache:** Ctrl+Shift+Delete → Clear all
2. **Hard refresh:** Ctrl+Shift+R or Cmd+Shift+R
3. **Check file paths:** Make sure all files are in correct directories:
   - `scripts/main.js` - JavaScript file
   - `styles/main.css` - CSS stylesheet
   - `video.html` - Video detail page
   - `index.html` - Home page

4. **Check browser console for specific error messages** and search this guide

## API Configuration

The API endpoint is configured in `scripts/main.js`:
```javascript
const CONFIG = {
    API_BASE: 'https://www.eporner.com/api/v2/',
    // ... other config
};
```

If you want to use a different API, update this URL.

## Need More Help?

Check the browser console for exact error messages - they will guide you to the specific issue. Screenshot the error message and share it for detailed help.
