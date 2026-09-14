# HDpornlove.com

A serverless adult video streaming platform built with vanilla HTML, CSS, and JavaScript, integrating with the Eporner API v2. Zero build step — push to git and Netlify deploys instantly.

**Live Site:** https://hdpornlove.netlify.app/ · **Custom Domain:** https://hdpornlove.com/

## Features

- 🔐 **18+ age verification** with localStorage (remembers for 30 days)
- 📱 **Responsive dark theme** (mobile-first, sticky header, hamburger menu)
- 🔍 **Search** with pagination and dynamic, keyword-rich SEO titles per query
- 🎬 **Home page** with 4 parallel-loaded sections: Trending, Most Viewed, Top Rated, Newest (each with independent pagination)
- 📺 **Video player page** with Eporner embed, metadata, tag links, share/report & related videos
- 🗂️ **Categories page** — 27 category hub cards + horizontal quick-bar (10 links) on every page
- ⭐ **Pornstars page** — 24 performer cards with live API-fetched thumbnails (24h cached, concurrency-limited)
- 🖼️ **Pics page** — HD picture grid from trending videos with pagination
- 🖼️ **Gallery page** — full lightbox viewer (keyboard nav: ←/→/Esc) for a video's thumbnail frames
- 🖱️ **Video hover preview** — cycles through thumbnails on mouseover (event-delegated, preloaded)
- 📊 **SEO optimized** — per-page meta tags, Open Graph, Twitter Cards, JSON-LD (WebSite, Organization, VideoObject, BreadcrumbList, ItemList, CollectionPage), XML sitemap, robots.txt
- ✅ **GDPR / DMCA / 2257 compliant** legal pages
- ⚡ **Zero build step** — pure vanilla stack, no frameworks/modules/npm
- 🚀 **Netlify deployment ready** — `netlify.toml` + `_redirects` for clean URLs
- 🛡️ **XSS-safe** — all dynamic API output is HTML-escaped before injection
- 📦 **Resilient** — 10s API timeouts, removed-video filtering, graceful error/loading states everywhere

## Quick Start

1. Clone the repository
2. Open `index.html` directly in a web browser, **or** serve locally:
   - `python -m http.server 8000` → visit `http://localhost:8000`
   - (Opening as a `file://` URL works, but a local server avoids any CORS quirks)
3. No build process or dependencies needed — fully functional immediately

## Project Structure

```
AdultPlatform/
├── index.html              # Home — 4 video sections (Trending/Most Viewed/Top Rated/Newest)
├── search.html             # Search results (search.html?query=…)
├── video.html              # Video player (video.html?id=VIDEO_ID)
├── categories.html         # 27 category hub cards
├── pornstars.html          # 24 pornstar cards (API thumbnails)
├── pics.html               # HD picture grid + pagination (pics.html?page=N)
├── gallery.html            # Single gallery + lightbox (gallery.html?id=VIDEO_ID)
├── about.html              # About page
├── contact.html            # Contact form (Netlify Forms)
├── terms.html              # Terms of service
├── privacy.html            # Privacy policy
├── dmca.html               # DMCA procedure
├── 2257.html               # 2257 compliance statement
├── 404.html                # Not-found page
├── favicon.svg             # Site favicon
├── scripts/
│   ├── main.js             # Core app logic (~1470 lines): API, age gate, search, video, pagination, SEO, menu, hover preview
│   └── pics.js             # Pics grid, gallery + lightbox, pornstar cards (~370 lines)
├── styles/
│   └── main.css            # Responsive dark theme (~1830 lines)
├── assets/
│   └── images/             # (Reserved for static image assets)
├── sitemap.xml             # Search engine sitemap (home, categories, pornstars, pics, 27 search hubs, legal pages)
├── robots.txt              # Crawler rules
├── netlify.toml            # Netlify config (no build, redirects, cache + security headers)
└── _redirects              # Clean-URL redirect rules (video/search/pics/gallery + 404 catch-all)
```

## Navigation (site-wide)

The header menu appears on every page in this order:

`Home · About · Categories · Pornstars · Pics · Live Sex (external, new tab) · AI Girlfriend (external, new tab) · Contact`

- **Live Sex** → Chaturbate affiliate link (opens in a new tab)
- **AI Girlfriend** → Fanvue referral link (`https://www.fanvue.com/signup?referral=FV-MYV1N3`, opens in a new tab)

The horizontal categories bar shows 10 quick links (Amateur, Anal, Big Tits, Blowjob, Hardcore, Lesbian, Mature, MILF, Teen, Threesome); the full 27-category list lives on `categories.html`.

A header search bar lets users search from any page.


## Configuration

### Core behavior — `scripts/main.js`

```javascript
const CONFIG = {
    API_BASE: 'https://www.eporner.com/api/v2/',
    THUMB_SIZE: 'medium',            // small | medium | big
    VIDEOS_PER_PAGE: 20,
    AGE_VERIFIED_EXPIRY: 30 * 24 * 60 * 60 * 1000,   // 30 days
    REMOVED_CACHE_EXPIRY: 24 * 60 * 60 * 1000,        // 24 hours
};
```

### Pics & Pornstars — `scripts/pics.js`

```javascript
const PORNSTARS = [ /* 24 performer names — thumbnails fetched live from the API */ ];
const PICS_PER_PAGE = 20;
const PORNSTAR_FETCH_CONCURRENCY = 6;   // parallel API calls for thumbnails
const PORNSTAR_THUMB_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24h localStorage cache
```

## API Integration

Uses **Eporner API v2** (no authentication required):

| Endpoint | URL | Purpose |
|----------|-----|---------|
| Search | `/video/search/?query=…&per_page=…&page=…&order=…` | Search/filter/sort videos |
| Details | `/video/id/?id=VIDEO_ID` | Single video metadata + embed |
| Removed | `/video/removed/?format=json` | List of removed video IDs |

**Order values used:** `top-weekly` (trending), `top-monthly` (most viewed), `top-rated`, `latest` (newest).

**Removed-video handling:** The removed-IDs list is fetched once at startup (in the background, non-blocking), cached in memory as a `Set` (O(1) lookups) and persisted to localStorage with a 24h expiry. All search/detail responses filter out removed IDs instantly.

## Deployment

### Netlify (current setup)

The site is connected to GitHub and auto-deploys on every push to `master`.

1. Push to GitHub (or connect repository on Netlify)
2. **Build command:** *(leave empty — no build needed)*
3. **Publish directory:** `.` (repository root)
4. Netlify reads `netlify.toml` for redirects, cache headers, and security headers

**Clean URLs** (from `netlify.toml` + `_redirects`):
- `/video/:id` → `/video.html?id=:id` (200)
- `/search/:query` → `/search.html?query=:query` (200)
- `/pics` → `/pics.html` (200)
- `/gallery/:id` → `/gallery.html?id=:id` (200)
- `/*` → `/404.html` (404) — catch-all returns a real 404 (prevents soft-404 SEO issues)

### Environment Variables

None required for basic operation.

## Browser Support

- ✅ Chrome / Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Compliance

- **18+ Only:** Age gate on first load, remembered for 30 days; "No" redirects away from the site
- **GDPR:** Privacy policy, no data selling, no third-party tracking (no Analytics), cookie/consent disclaimers
- **2257:** All models verified 18+, compliance statement page
- **DMCA:** Takedown procedure documented on `dmca.html`

## Privacy

- No user data collection beyond optional contact/newsletter form submission (Netlify Forms)
- Email addresses only collected with explicit 18+ consent
- No third-party analytics or tracking
- All Eporner API calls are read-only (no user data sent to Eporner)

## License

© 2025-2026 HDpornlove.com. All rights reserved. 18+ Only.

## Support

Contact: support@hdpornlove.com (or use the contact form at `contact.html`)

