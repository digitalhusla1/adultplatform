# HDpornlove.com - Editing Guide

This guide helps you manually edit the website without breaking functionality.

## 📁 File Structure Overview

```
AdultPlatform/
├── index.html              # Home page with featured videos
├── about.html              # About us page
├── categories.html         # Browse categories
├── contact.html            # Contact form (Netlify Forms)
├── search.html             # Search results page
├── video.html              # Single video detail page
├── terms.html              # Terms of Service
├── privacy.html            # Privacy Policy (GDPR)
├── 2257.html               # Model verification statement
├── dmca.html               # DMCA reporting
├── styles/
│   └── main.css            # All CSS styling and responsive design
├── scripts/
│   └── main.js             # All JavaScript - API, forms, age verification
├── assets/                 # Images and media files
├── _redirects              # Netlify URL routing
├── robots.txt              # Search engine crawling rules
├── sitemap.xml             # Search engine sitemap
└── EDITING_GUIDE.md        # This file
```

---

## 🎨 CSS Customization (styles/main.css)

### Colors
Located at top of file in `:root` section:

```css
:root {
    --primary-bg: #0a0a0a;      /* Dark background */
    --accent-color: #e63946;    /* Red accent (buttons, links) */
    --primary-text: #ffffff;    /* White text */
    --secondary-text: #cccccc;  /* Light gray text */
}
```

**To change colors:**
1. Open `styles/main.css`
2. Find `:root { }` section at top
3. Change color hex codes
4. Save - changes apply site-wide

### Spacing & Padding
```css
--spacing: 16px;   /* Changes all margins/padding globally */
```

### Video Grid Layout
Search for `.video-grid` in CSS:
```css
grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
```
- `minmax(180px, 1fr)` = minimum card width is 180px
- Change first number to make cards wider/narrower
- Affects how many columns show per screen size

### Responsive Breakpoints
Media queries at bottom of CSS file:
```css
@media (max-width: 768px) { }   /* Tablets */
@media (max-width: 1024px) { }  /* Desktops */
```

Customize these breakpoints for different screen sizes.

---

## 💻 JavaScript Configuration (scripts/main.js)

### API Settings
At top of `main.js`, in `CONFIG` object:

```javascript
const CONFIG = {
    API_BASE: 'https://www.eporner.com/api/v2/',  // Don't change - official API
    VIDEOS_PER_PAGE: 20,        // Videos per page (1-1000)
    THUMB_SIZE: 'medium',       // Options: 'small', 'medium', 'big'
    AGE_VERIFIED_EXPIRY: 24 * 60 * 60 * 1000,     // 24 hours in milliseconds
};
```

**To change pagination:**
- Edit `VIDEOS_PER_PAGE: 20` to show more/fewer videos per page

**To change thumbnail size:**
- Change `THUMB_SIZE: 'medium'` to `'small'` or `'big'`

**To change age verification duration:**
- Edit `AGE_VERIFIED_EXPIRY` milliseconds value

### Error Handling
All functions have try-catch blocks with detailed console logging.

**View errors in browser:**
1. Press `F12` to open Developer Tools
2. Go to "Console" tab
3. All errors logged with descriptions

### API Rate Limiting
If getting "API Error" messages:
1. Eporner API has rate limits
2. Try adding delays between requests
3. Check Eporner API documentation for limits

---

## 📄 HTML Pages - Key Elements

### All Pages Include:
- **Header** with logo, nav menu, search bar
- **Footer** with legal links and 18+ disclaimer
- **Age Verification Modal** (on first load)

### Home Page (index.html)
```html
<div id="featuredVideos"></div>
```
- `id="featuredVideos"` - Where videos render
- Loads top-weekly videos automatically

### Search Results (search.html)
```html
<div id="searchVideos"></div>
```
- Dynamic container for search results
- Takes query from URL: `?query=teen`

### Video Detail (video.html)
```html
<div id="videoContainer"></div>
<div id="videoInfo"></div>
<div id="relatedVideos"></div>
```
- Embeds video iframe from Eporner
- Shows video details and related videos
- Takes video ID from URL: `?id=IsabYDAiqXa`

### Contact Form (contact.html)
```html
<form name="contact" method="POST" netlify>
```
- `netlify` attribute enables Netlify Forms
- Submissions stored automatically
- No backend code needed

---

## 🔒 Security & Compliance

### Age Verification Modal
Located in each HTML page:
```html
<div id="ageModal" class="modal show">
    <button id="ageYes">Yes (18+)</button>
    <button id="ageNo">No</button>
</div>
```
- Shows on first visit, remembers for 24 hours
- "No" redirects to google.com
- Handled by JavaScript in `main.js`

### 18+ Disclaimers
Required on every page in footer:
```html
<p>⚠️ This site is 18+ only. All models verified per 2257.</p>
```

### Removed Videos Filtering
Automatic - happens in background:
- API checks for removed videos every 24 hours
- Cached in browser localStorage
- No user action needed

---

## 📱 Mobile Responsiveness

### Media Queries in CSS
```css
@media (max-width: 768px) {
    /* Mobile/tablet styles */
}
```

**To test on mobile:**
1. Open site in Chrome
2. Press `F12` for DevTools
3. Click device icon (top left)
4. Select mobile device
5. Refresh page

### Common Mobile Issues:
- Text too small? Increase `font-size` in CSS
- Videos too narrow? Decrease `minmax(180px, 1fr)` first value
- Header crowded? Increase `--spacing` variable

---

## 🔍 SEO Optimization

### Meta Tags (on each page's `<head>`)
```html
<title>Page Title - Appears in search results</title>
<meta name="description" content="Short description...">
<meta name="keywords" content="keyword1, keyword2, keyword3">
```

### Sitemap
`sitemap.xml` - Lists all pages for search engines
- Auto-generated, don't edit manually

### Robots.txt
`robots.txt` - Controls search engine crawling
```
User-agent: *
Allow: /
```

### Alt Text for Images
```html
<img src="image.jpg" alt="Descriptive text for SEO">
```
- Required for accessibility and SEO

---

## 🚀 Deployment to Netlify

### Option 1: Drag & Drop
1. Go to https://app.netlify.com
2. Drag entire `AdultPlatform` folder
3. Site goes live immediately

### Option 2: GitHub Auto-Deploy
1. Push code to GitHub
2. Connect repo to Netlify
3. Auto-deploys on every push

### Using _redirects File
```
# Redirects for Netlify routing
/video/:id  /video.html?id=:id  200
```
- Already included in project
- Handles URL rewrites

---

## 🐛 Common Issues & Fixes

### "No videos found" error
- **Cause**: Eporner API might be down
- **Fix**: Wait 15 minutes, refresh page
- **Check**: Press F12 → Console → look for API errors

### Age modal keeps showing
- **Cause**: Browser not saving localStorage
- **Fix**: Clear browser cache, try different browser
- **Check**: Disable browser extensions

### Videos not loading on search
- **Cause**: Search query might be empty/invalid
- **Fix**: Try different search terms
- **Check**: URL has `?query=` parameter

### Styling looks broken on mobile
- **Cause**: Responsive CSS not loading
- **Fix**: Clear cache, hard refresh (Ctrl+Shift+R)
- **Check**: Open DevTools, check Styles tab

### Forms not submitting
- **Cause**: Netlify Forms attribute missing
- **Fix**: Ensure `<form netlify>` on form tag
- **Check**: Check Netlify dashboard for submissions

---

## ✏️ Editing Checklist

Before deploying changes:

- [ ] Test on mobile (F12 → Device mode)
- [ ] Press F12 → Console → no red errors
- [ ] All links work (test clicking navigation)
- [ ] Search bar works (try a search)
- [ ] Age verification shows on first visit
- [ ] Videos display with thumbnails
- [ ] Forms submit without errors
- [ ] Page titles appear in browser tab

---

## 📞 Support & Resources

### Eporner API Documentation
- **Base URL**: https://www.eporner.com/api/v2/
- **Endpoints**: `/video/search/`, `/video/id/`, `/video/removed/`
- **Format**: JSON or XML

### Netlify Resources
- **Forms**: https://www.netlify.com/products/forms/
- **Redirects**: https://docs.netlify.com/routing/redirects/
- **Deployment**: https://docs.netlify.com/site-deploys/overview/

### Browser DevTools
- **Chrome**: Press `F12`
- **Firefox**: Press `F12`
- **Safari**: Cmd+Option+I

---

## 🔄 Version Control (Git)

### Commit Changes
```bash
git add .
git commit -m "Updated video grid styling"
git push origin master
```

### View Change History
```bash
git log --oneline
```

### Revert Changes
```bash
git revert <commit-hash>
```

---

**Last Updated**: November 30, 2025
**Version**: 1.0
**Site**: HDpornlove.com
