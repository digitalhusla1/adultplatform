# HDpornlove.com

A serverless adult video streaming platform built with vanilla HTML, CSS, and JavaScript, integrating with the Eporner API v2.

## Features

- 🔐 18+ age verification with localStorage
- 📱 Responsive dark theme (mobile-first design)
- 🔍 Search functionality with pagination
- 🎬 Video categorization and browsing
- 🖼️ HD picture galleries with lightbox viewer (Pics page)
- ⭐ Pornstars page with live API-fetched thumbnail cards
- 📊 SEO optimized with meta tags and JSON-LD
- ✅ GDPR/DMCA/2257 compliant
- ⚡ Zero build step - pure vanilla stack
- 🚀 Netlify deployment ready

## Quick Start

1. Clone the repository
2. Open `index.html` in a web browser
3. No build process needed - fully functional immediately

## Project Structure

```
AdultPlatform/
├── index.html              # Home page
├── search.html             # Search results
├── video.html              # Video player page
├── categories.html         # Category browsing
├── pornstars.html          # Pornstar browsing (image cards)
├── pics.html               # HD picture galleries grid
├── gallery.html            # Single gallery + lightbox (gallery.html?id=VIDEO_ID)
├── about.html              # About page
├── contact.html            # Contact form
├── terms.html              # Terms of service
├── privacy.html            # Privacy policy
├── dmca.html               # DMCA procedure
├── 2257.html               # 2257 compliance
├── 404.html                # Not-found page
├── scripts/
│   ├── main.js             # Core app logic (API, age gate, search, video)
│   └── pics.js             # Pics grid, gallery + lightbox, pornstar cards
├── styles/
│   └── main.css            # Responsive styling (incl. pics/gallery/pornstar sections)
├── sitemap.xml             # Search engine sitemap
├── robots.txt              # Crawler rules
├── netlify.toml            # Netlify config
└── _redirects              # Clean-URL redirect rules
```


## Configuration

Customize behavior in `scripts/main.js`:

```javascript
const CONFIG = {
    API_BASE: 'https://www.eporner.com/api/v2/',
    THUMB_SIZE: 'medium',
    VIDEOS_PER_PAGE: 20,
    AGE_VERIFIED_EXPIRY: 30 * 24 * 60 * 60 * 1000,
    REMOVED_CACHE_EXPIRY: 24 * 60 * 60 * 1000,
};
```

Customize the Pics & Pornstars features in `scripts/pics.js`:

```javascript
const PORNSTARS = [ ... ];           // Performer list shown on pornstars.html
const PICS_PER_PAGE = 20;            // Pics grid page size
const PORNSTAR_FETCH_CONCURRENCY = 6; // Parallel API calls for thumbnails
```

## Navigation (site-wide)

The header menu appears on every page in this order:

`Home · About · Categories · Pornstars · Pics · Live Sex (external, new tab) · Contact`

The horizontal categories bar shows 10 quick links; the full category list
lives on `categories.html`.


## API Integration

Uses **Eporner API v2** (no authentication required):
- Search videos with filtering and sorting
- Browse by popularity, rating, date
- Fetch video details with metadata
- 24-hour caching of removed video IDs

## Deployment

**Live Site:** https://hdpornlove.netlify.app/

Hosted on Netlify with automatic deployment from git.

## Browser Support

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ IE11+ (with polyfills)

## Development

No build step required. All files are vanilla HTML/CSS/JavaScript.

### Running Locally

1. Open `index.html` in a modern browser
2. Or use a local server: `python -m http.server 8000`
3. Navigate to `http://localhost:8000`

### API Reference

**Base URL:** `https://www.eporner.com/api/v2/`

- **Search:** `/video/search/?query=[string]&per_page=[1-1000]&page=[int]&order=[latest|top-weekly|...]`
- **Details:** `/video/id/?id=[videoID]`
- **Removed:** `/video/removed/?format=[json|xml|txt]`

See `scripts/main.js` for usage examples.

## Deployment

### Netlify

1. Push to GitHub (or connect repository)
2. Create new site on [Netlify](https://netlify.com)
3. Set build command: (leave empty, no build needed)
4. Set publish directory: `/` (root)
5. Deploy

### Environment Variables

No environment variables required for basic operation.

## Compliance

- **18+ Only:** Age gate displayed on first load, remembers for 24 hours
- **GDPR Compliant:** Privacy policy, no data selling, cookie disclaimers
- **2257 Compliance:** All models verified 18+
- **DMCA Ready:** DMCA takedown procedures documented

## Privacy

- No user data collection beyond optional lead form submission
- Email addresses only collected with explicit 18+ consent
- No third-party tracking (no Google Analytics, etc.)
- All API calls are read-only (no user data stored on Eporner)

## License

© 2025 HDpornlove.com. All rights reserved. 18+ Only.

## Support

For issues, contact: support@hdpornlove.com (or add contact form)
