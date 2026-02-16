# AI Coding Agent Instructions for HDpornlove.com

## Project Overview

**HDpornlove.com** is a serverless adult video streaming platform built with vanilla HTML, CSS, and JavaScript. It integrates with the **Eporner API v2** to dynamically fetch and display adult video content. The site is fully static (no backend) and deployable to Netlify, Vercel, or GitHub Pages.

**Key Characteristics:**
- No build step required - pure vanilla stack
- Age-gated (18+ only) with localStorage-based 24-hour bypass
- Responsive dark theme (mobile-first CSS)
- SEO-optimized with meta tags, sitemap, robots.txt
- GDPR/DMCA/2257 compliant
- Ad-supported (JuicyAds integration)
- Deployed via Netlify with automatic builds from git

**Quick Start for New Tasks:**
1. All changes made to `.js` files are auto-deployed
2. CSS changes reflect immediately in browser
3. Use browser DevTools console to debug API calls and state
4. Test mobile responsiveness at breakpoints: 480px, 768px, 1024px, 1200px
5. Age verification can be cleared via localStorage for testing

## Architecture Patterns

### 1. API Integration Pattern (Eporner v2)
All video fetching follows a consistent pattern in [scripts/main.js](../scripts/main.js):

```javascript
// Pattern: searchVideos(), getMostViewedVideos(), getTopRatedVideos(), getNewestVideos(), getVideo()
// All use CONFIG.API_BASE, handle timeouts (10s), filter removed videos, and manage pagination
```

**Key Functions:**
- `searchVideos(query, page)` - Search with order='top-weekly'
- `getMostViewedVideos(page)` - order='latest-views'
- `getTopRatedVideos(page)` - order='top-rated'
- `getNewestVideos(page)` - order='newest'
- `getVideo(videoId)` - Single video detail (11-char ID required)
- `getRemovedIds()` - Cached 24-hour list of removed videos

**Error Handling:** All API functions include timeout handling, response validation, and graceful fallback caching.

### 2. Video Rendering Pipeline
1. Fetch videos from API with removed-ID filtering
2. Create cards via `createVideoCard(video)` - includes HTML escaping for XSS prevention
3. Render to DOM via `renderVideos(videos, containerId)`
4. Setup pagination controls via `setupPagination()`

### 3. Page State Management
Each page maintains separate pagination state:
```javascript
let currentPageSearch = 1;
let currentPageMostViewed = 1;
let currentPageTopRated = 1;
let currentPageNewest = 1;
```
Pagination is controlled via `setupPagination()` which manages prev/next buttons.

### 4. Age Verification (localStorage)
- Verified status stored as: `age_verified=true` + `age_verified_time=timestamp`
- Default expiry: 30 days (configurable via `CONFIG.AGE_VERIFIED_EXPIRY`)
- On first load: `initAgeVerification()` shows modal if not verified
- "No" button redirects to google.com for privacy

### 5. URL Parameter Handling
Single-parameter pattern for page navigation:
- `video.html?id=[11-char-videoId]` - Video detail page
- `search.html?query=[encoded-string]` - Search results
- Uses `getUrlParam(name)` helper to extract and decode

## Key Files & Responsibilities

| File | Purpose | When to Edit |
|------|---------|--------------|
| [scripts/main.js](../scripts/main.js) | API calls, page initialization, video rendering | Logic changes, new features |
| [styles/main.css](../styles/main.css) | Dark theme, responsive grid, animations | UI/UX changes, layout tweaks |
| [index.html](../index.html) | Home page, featured videos, pagination | Navigation, ad placement |
| [video.html](../video.html) | Video detail page template | Video page structure |
| [search.html](../search.html) | Search results template | Search layout |
| [categories.html](../categories.html) | Category browsing | Category features |

## Critical Configuration

All settings in `CONFIG` object ([scripts/main.js](../scripts/main.js) line ~15):

```javascript
const CONFIG = {
    API_BASE: 'https://www.eporner.com/api/v2/',  // Change if API endpoint changes
    THUMB_SIZE: 'medium',                          // Thumbnail resolution: small/medium/big
    VIDEOS_PER_PAGE: 24,                           // Results per page (1-1000)
    AGE_VERIFIED_EXPIRY: 30 * 24 * 60 * 60 * 1000, // Age gate validity period
    REMOVED_CACHE_EXPIRY: 24 * 60 * 60 * 1000,    // Cache refresh interval for removed videos
};
```

## Common Workflows

### Adding a New Video Listing Section
1. Create fetch function: `async function getXxxVideos(page = 1)` following existing pattern
2. Add page state: `let currentPageXxx = 1;`
3. Call from page init: `setupPagination(data, 'xxx');`
4. HTML container required: `id="xxxVideos"` with pagination buttons

### Modifying Search Behavior
- Search uses `order='top-weekly'` (not 'latest')
- Change `searchVideos()` parameter if different sort needed
- Query validation happens before API call

### Styling Changes
- All colors via CSS variables in `:root` (primary-bg, accent-color, etc.)
- Responsive breakpoints: mobile-first, grid changes at 768px and 1024px
- Sidebar width: 300px, main content uses flex: 1

## Security Patterns

1. **XSS Prevention:** All user input escaped via `escapeHtml()` before DOM insertion
2. **URL Encoding:** Video IDs encoded with `encodeURIComponent()` when in URLs
3. **API Validation:** Response structure validated before rendering (check `data.videos` exists)
4. **Timeout Protection:** All fetch calls wrapped with 10-second timeout
5. **Removed Video Filtering:** All results checked against `getRemovedIds()` cache

## Performance Patterns

1. **Lazy Loading:** `loading="lazy"` on video thumbnails
2. **Caching:** Removed video IDs cached in localStorage for 24 hours
3. **Pagination:** 24 videos per page to balance UX/performance
4. **Async/Await:** All API calls async with proper error propagation
5. **Parallel Keyword Search:** Related videos use Promise.all() to try 3-5 keywords simultaneously (60-70% faster)
6. **Async Filtering:** Removed ID filtering happens in background after videos render (non-blocking)
7. **Prefetch Removed IDs:** Video cache preloaded at page start to avoid blocking first API call

## Development Checklist

When making changes:
- [ ] Test on mobile (use DevTools responsive mode)
- [ ] Verify API response handling (check console for validation logs)
- [ ] Escape all user-controlled content with `escapeHtml()`
- [ ] Update `CONFIG` if changing API behavior
- [ ] Test pagination state when adding new sections
- [ ] Verify age modal displays on first visit
- [ ] Check removed video filtering works (inspect console logs)

## External Dependencies

- **Eporner API v2:** `https://www.eporner.com/api/v2/` (no auth required, CORS-enabled)
- **JuicyAds:** Ad network integration (script tags in HTML)
- **Netlify Forms:** Contact form backend
- **localStorage:** Browser storage for age verification & cache

## Code Organization Patterns

### Function Naming & Organization
- **API functions** (lines 40-250): All prefixed with `get` or `search` - `getVideo()`, `searchVideos()`, `getRemovedIds()`
- **Event handlers**: Suffixed with action - `initAgeVerification()`, `initSearchForm()`, `initPage()`
- **Utility functions**: Generic names - `escapeHtml()`, `formatViews()`, `debounce()`, `isInViewport()`
- **Render functions**: Start with `render` - `renderVideos()`, `createVideoCard()`

### Page Initialization Flow
1. DOM loads → `initPage()` called (line ~600)
2. Detect page type via pathname matching
3. Run page-specific init: `initHomePage()`, `initSearchPage()`, `initVideoPage()`
4. All pages run: `initMenuToggle()`, `initAgeVerification()`, `initSearchForm()`, `initForms()`

### State Management Pattern
- **Global page states**: `currentPage`, `currentQuery`, `currentPageMostViewed`, etc.
- **URL parameters**: Extracted once at page load via `getUrlParam('name')`
- **localStorage scoped by key**: `age_verified`, `eporner_removed_ids` (see CONFIG)
- **DOM state**: Pagination buttons show/hide via `.style.display`

## Mobile & Device Optimization

### Device Detection
```javascript
const isMobileDevice = () => /Android|webOS|iPhone|iPad|etc/.test(navigator.userAgent);
const isTabletDevice = () => isMobileDevice() && window.innerWidth >= 768;
const getOptimalVideosPerPage = () => isMobileDevice() && !isTabletDevice() ? 12 : 20;
```

### Responsive Breakpoints (Mobile-First)
- **< 480px**: Extra small phones - single column, minimal padding
- **480-767px**: Small phones - single column, adjusted spacing
- **768-1023px**: Tablets - 2-column grid, hide sidebar
- **1024-1199px**: Small desktop - 3-column grid, show sidebar
- **≥ 1200px**: Large desktop - 4-column grid, max-width containers

### CSS Variables for Theming
All colors/spacing controlled via `:root` variables:
```css
--primary-bg: #0a0a0a;
--accent-color: #e63946;
--spacing: 16px;
--transition: 0.3s ease;
```
Change one variable to ripple across entire site (see [styles/main.css](../styles/main.css) line 1-30).

## Debugging & Testing Patterns

### Console Debugging
- **API calls**: Log request URL before fetch, log response data, log errors with context
- **Pagination**: Log page numbers, total_pages, videos array length
- **Storage**: Check `localStorage.getItem('age_verified')` and `localStorage.getItem('eporner_removed_ids')`
- **Age gate**: Clear with `localStorage.removeItem('age_verified')` to re-test

### Testing Video Pages
- Test with working video ID: `video.html?id=IsabYDAiqXa`
- Check console logs at lines 200-220 for video fetch details
- Use network tab to verify API request format
- Removed videos return empty array `[]` - expected behavior

### Mobile Testing
- Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
- Test at 375px (iPhone SE), 768px (iPad), 1024px (desktop)
- Check hamburger menu toggle works and nav closes on link click
- Verify search bar stays sticky in header

## Integration Points & External APIs

### Eporner API v2
- **Endpoint**: `https://www.eporner.com/api/v2/`
- **Key functions** return `{ videos: [], page, total_pages, total_count }`
- **Video IDs**: Always 11 characters, case-sensitive
- **Removed videos**: Cached for 24h to minimize API calls (critical for performance)
- **Error handling**: All functions catch timeouts & invalid responses gracefully

### Netlify Forms
- Form elements have `netlify` attribute or `name` + `data-netlify="true"`
- Contact form in [contact.html](../contact.html), newsletter in [index.html](../index.html)
- No backend setup needed - Netlify automatically collects submissions
- File uploads supported via form integration

### JuicyAds Integration
- Ad zones placed in HTML via `<ins id="ZONE_ID">` tags
- Multiple ad sizes: 728x90 (leaderboard), 300x250 (rectangle), 160x600 (skyscraper), 908x258 (billboard)
- Load ad script once: `<script src="https://poweredby.jads.co/js/jads.js"></script>`
- Ads auto-render in designated containers

## Common Modification Patterns

### Adding a New Video Section (Home Page)
1. Create fetch function: `async function getXxxVideos(page = 1)` (copy `getMostViewedVideos()` pattern)
2. Add state variable: `let currentPageXxx = 1;`
3. In `initHomePage()`, add: `const xxxData = await getXxxVideos(1);` to parallel Promise.all()
4. Add HTML container: `<div id="xxxVideos" class="video-grid"></div>` + pagination buttons
5. Call render: `renderVideos(xxxData.videos, 'xxxVideos');` + `setupTrendingPagination(xxxData, 'xxx');`

### Modifying Pagination Behavior
- Pagination state stored in `currentPage` / `currentPageXxx` variables
- Button event handlers in `goToPage()` and `goToTrendingPage()` - modify these to change behavior
- Page info updates via `setupPagination()` - shows current/total pages
- Fetch new data before rendering to DOM

### Changing API Sort Order or Filters
- Search order parameter in function: `url.searchParams.append('order', 'top-weekly')`
- Supported orders: `latest`, `longest`, `shortest`, `top-rated`, `most-popular`, `top-weekly`, `top-monthly`
- Removed video filtering happens in: `data.videos = data.videos.filter(v => !removedIds.includes(v.id));`

### XSS Prevention Pattern (Always Use)
- All user input must be escaped: `const title = escapeHtml(video.title);`
- Before inserting to DOM via `.innerHTML` or as attribute
- URLs must use `encodeURIComponent()` when in query params: `encodeURIComponent(query)`
- Video IDs already 11-char alphanumeric, but escape in HTML context anyway

## Known Limitations & Workarounds

### Removed Videos API CORS Issue
- Direct browser calls to `/video/removed/` endpoint fail due to CORS restrictions
- Workaround: Gracefully fall back to empty removed list if API fails (line ~280)
- Videos still load normally, just without extra removed ID filtering

### Mobile Header Navigation
- Fixed header with sticky positioning takes 60px height
- Mobile nav is positioned `fixed` and overlays content (z-index: 999)
- Menu closes on nav link click (event handler in `initMenuToggle()`)
- Body doesn't scroll while menu is open (consider `overflow: hidden` if needed)

### localStorage Size Limits
- Removed IDs cache can grow large (megabytes over time)
- Current strategy: 24h expiry refreshes the cache
- If cache gets too large, consider pagination or clearing older entries

## References

- Full API examples: [scripts/main.js](../scripts/main.js) lines 40-250
- CSS customization guide: [styles/main.css](../styles/main.css) lines 1-60
- HTML structure: [index.html](../index.html) has detailed inline comments
- API documentation: [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)
- Codacy/code quality rules: [.github/instructions/codacy.instructions.md](./instructions/codacy.instructions.md)
