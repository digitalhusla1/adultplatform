# AI Coding Agent Instructions for HDpornlove.com

## Project Overview

**HDpornlove.com** is a serverless adult video streaming platform built with vanilla HTML, CSS, and JavaScript. It integrates with the **Eporner API v2** to dynamically fetch and display adult video content. The site is fully static (no backend) and deployable to Netlify, Vercel, or GitHub Pages.

**Key Characteristics:**
- No build step required - pure vanilla stack (no Node.js, npm, bundler)
- Age-gated (18+ only) with localStorage-based 30-day verification
- Responsive dark theme (mobile-first CSS with 4 breakpoints: 480px, 768px, 1024px, 1200px)
- SEO-optimized with meta tags, sitemap, robots.txt, JSON-LD VideoObject schema
- GDPR/DMCA/2257 compliant with legal pages
- Ad-supported (JuicyAds integration with 7 ad zones: leaderboard 728x90, box 300x250, medium 632x190, small 474x190, vga 308x286, billboard 908x258, skyscraper 160x600)
- Deployed via Netlify with automatic builds from git push
- **Critical:** All changes to `.js` files are auto-deployed; CSS changes visible in browser immediately

**Quick Start for New Tasks:**
1. **Verify changes immediately:** `.js` files auto-deploy; CSS changes instant in browser
2. **Console debugging:** Open DevTools (F12) to inspect API responses, pagination state, localStorage
3. **Clear age gate for testing:** `localStorage.removeItem('age_verified')` in console
4. **Test mobile:** DevTools responsive mode at 375px (iPhone), 768px (tablet), 1024px (desktop)
5. **Check removed videos cache:** `localStorage.getItem('eporner_removed_ids')` shows cached IDs
6. **Monitor API calls:** Network tab shows Eporner API requests; watch for timeout errors (10s limit)

## Architecture Patterns

### 1. API Integration Pattern (Eporner v2)
All video fetching follows a consistent pattern in [scripts/main.js](../scripts/main.js) (lines 216-518):

```javascript
// ALL functions use: fetch URL → AbortController timeout (10s) → response.json() validation → async removed ID filtering
```

**Key Functions (lines visible in order):**
- `searchVideos(query, page)` (216) - Search with `order='top-weekly'`
- `getMostViewedVideos(page)` (284) - `order='latest-views'`
- `getTopRatedVideos(page)` (336) - `order='top-rated'`
- `getNewestVideos(page)` (388) - `order='newest'`
- `getVideo(videoId)` (440) - Single video detail (11-char ID, case-sensitive)
- `getRemovedIds()` (505) - Cached 24-hour list of removed video IDs

**CRITICAL PATTERN:** Every API function:
1. Validates inputs (`query`, `page`)
2. Builds URL with `url.searchParams.append()`
3. Creates `AbortController` with 10s timeout
4. **Fetch:** API call (async, 10s timeout, removed IDs filtered in background)
2. **Create cards:** `createVideoCard(video)` (line 704) returns HTML string with `escapeHtml()` for XSS
3. **Render:** `renderVideos(videos, containerId)` (line 750) joins HTML and sets `.innerHTML`
4. **Paginate:** `setupPagination(data, query)` (line 1478) shows/hides prev/next buttons
5. **Click handler:** `goToVideo(videoId)` redirects to `video.html?id=encodedId`

Global variables (lines 198-202) track pagination per section:
```javascript
let currentPageSearch = 1;      // Search results page
let currentPageMostViewed = 1;  // Most viewed section
let currentPageTopRated = 1;    // Top rated section
let currentPageNewest = 1;      // Newest section
let currentPage = 1;            // Featured/trending
let currentQuery = 'all';       // Current search term
```
- **Home page:** 4 independent pagination states (one per trending section)
- **Storage:** Two keys set by `setAgeVerified()` (line 568):
  - `age_verified` = 'true'
  - `age_verified_time` = `Date.now()`
- **Check:** `isAgeVerified()` (line 552) verifies both exist AND age < CONFIG.AGE_VERIFIED_EXPIRY (30 days)
- **Modal:** `showAgeModal()` (line 578) adds `.show` class (z-index 10000, fixed position)
- **Flow:** Page load → `initAgeVerification()` → if not verified, show modal → "Yes" sets verification, "No" redirects to google.com
Pattern: `getUrlParam(name)` (line 958) uses URLSearchParams to extract decoded values
- `video.html?id=IsabYDAiqXa` → `getUrlParam('id')` returns "IsabYDAiqXa"
- `search.html?query=amateur` → `getUrlParam('query')` returns "amateur"
- `contact.html?subject=dmca&video=abc123` → can chain multiple params
- **Encoding:** Use `encodeURIComponent()` when creating URLs with user input in `goToVideo()`
- **Decoding:** `getUrlParam()` auto-decodes with `decodeURIComponent()`
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

| File | Purpose | When to Edit | Lines |
|------|---------|--------------|-------|
| [scripts/main.js](../scripts/main.js) | API calls, page initialization, video rendering, pagination | Logic changes, new features | 1874 lines |
| [styles/main.css](../styles/main.css) | Dark theme, responsive grid, animations, sidebar layout | UI/UX changes, layout tweaks | 1400+ lines |
| [index.html](../index.html) | Home page with 4 featured sections (trending, most viewed, top rated, newest) | Navigation, ad zones, featured sections | 140 lines |
| [video.html](../video.html) | Video detail page with embed, info panel, sidebar, related videos | Video page structure | 165 lines |
| [search.html](../search.html) | Search results with pagination and sidebar categories | Search layout | 160 lines |
| [categories.html](../categories.html) | 28 category cards (grid layout) | Category list updates | 140 lines |
| [contact.html](../contact.html) | Netlify form with subject selector (6 categories) | Form fields, subjects | 135 lines |
| [netlify.toml](../netlify.toml) | Netlify build config (critical for deployment) | Build settings, redirects | ~20 lines |

## Copy `getMostViewedVideos()` pattern (line 284) with new `order` param
2. Add state var: `let currentPageXxx = 1;`
3. Add HTML: `<div id="xxxVideos" class="video-grid"></div>` + pagination buttons
4. In `initHomePage()` (line 1007): Add to `Promise.all()` array
5. Call `renderVideos(data.videos, 'xxxVideos')` + `setupTrendingPagination(data, 'xxx')`
6. Pagination button IDs must follow pattern: `prevXxxBtn`, `nextXxxBtn`, `pageXxxInfo`

### Modifying Search Behavior
- `searchVideos()` hard-coded to `order='top-weekly'` (line 230)
- Different sort? Edit line 230 to change `'top-weekly'` to other value
- Valid values: `'latest'`, `'longest'`, `'shortest'`, `'top-rated'`, `'most-popular'`, `'top-monthly'`
- Query validation: Lines 219-223 (checks empty, converts to 'all')

### Styling Changes - CSS Variable System
- **Colors in `:root` (line 20-30):** `--primary-bg`, `--accent-color`, `--border-color`, etc.
- **Change theme:** Edit `:root` variables → affects entire site
- **Responsive:** Mobile-first; media queries at 480px, 768px, 1024px, 1200px
- **Grid:** Video grid `escapeHtml()` (line 954) converts all user text to safe HTML before `.innerHTML`
   - Used in: `createVideoCard()` title, tags, share modals
   - Pattern: `div.textContent = text; return div.innerHTML;`
2. **URL Encoding:** Always use `encodeURIComponent()` when putting user input in URLs
   - Example: `goToVideo(id)` line 917: `video.html?id=${encodeURIComponent(videoId)}`
3. **API Validation:** Every fetch validates `response.ok` before `.json()`, checks `data.videos` is Array
4. **Timeout Protection:** All fetch calls use `AbortController` with 10s timeout (line 272)
   - Throws `AbortError` if timeout → caught, returns "API request timeout"
5. **Removed Video Filtering:** `getRemovedIds()` cached for 24h; filtering done async (non-blocking)
  - ≥ 1200px: 4 columns
- **Sidebar:** 300px fixed width, sticky top, hidden on mobile (display: none at 799px) // Cache refresh interval for removed videos
};
```

## Common Workflows
Parallel API Loading:** `initHomePage()` (line 1007) uses `Promise.all()` for 4 API calls simultaneously
   - Sequential would take ~8 seconds; parallel takes ~2 seconds (75% faster)
2. **Lazy Loading Images:** HTML uses `loading="lazy"` on `<img>` tags (native browser optimization)
3. **Caching Strategy:**
   - Removed IDs: 24h localStorage cache ([getRemovedIds](../scripts/main.js#L505), lines 520-560)
   - Age verification: 30d localStorage cache
4. **Async Filtering (Non-blocking):** After rendering videos, `getRemovedIds().then()` filters in background (line 277)
   - Videos display immediately; filtering happens asynchronously
5. **Pagination Optimization:** 20 videos/page (line 181) balances UX with loading time
6. **Prefetch on Page Load:** `initPage()` calls `getRemovedIds()` immediately (line 1667) before rendering
7. **IntersectionObserver:** Exists but commented out in code (line 1813)
### Mo**Clear localStorage before testing:** `localStorage.clear()` or remove specific keys
- [ ] **Mobile test:** Devtools → Toggle Device Toolbar (Ctrl+Shift+M) → Test at 375px, 768px, 1024px
- [ ] **API debugging:** Network tab → filter "eporner.com" → check request URL and response
- [ ] **Console validation:** Check for console.log() output showing fetch success/error
- [ ] **XSS prevention:** Verify all user input goes through `escapeHtml()` before `.innerHTML`
- [ ] **Pagination:** After adding section, test prev/next buttons hide/show correctly
- [ ] **Age modal:** Fresh test: `localStorage.clear()` → reload → modal should show
- [ ] **Removed video filtering:** `localStorage.getItem('eporner_removed_ids')` should have JSON array
- [ ] **Form submission:** Contact form should POST to Netlify (check Network tab for 200 responseolor, etc.)
- Responsive breakpoints: mobile-first, grid changes at 768px and 1024px
- Sidebar width: 300px, main content uses flex: 1

## Security Patterns

1. **XSS Prevention:** All user input escaped via `escapeHtml()` before DOM insertion
2. **URL Encoding:** Video IDs encoded with `encodeURIComponent()` when in URLs
3. **API Validation:** Response structure validated before rendering (check `data.videos` exists)
4. **Timeout Protection:** All fetch calls wrapped with 10-second timeout
5. **Removed Video Filtering:** All results checked against `getRemovedIds()` cache

## Performance Patterns
216-518): Prefixed with `get` or `search` for fetch operations
  - `searchVideos()`, `getMostViewedVideos()`, `getTopRatedVideos()`, `getNewestVideos()`, `getVideo()`, `getRemovedIds()`
- **Initialization functions**: Suffix with `init` to show they set up listeners/state
  - `initPage()` (1653), `initHomePage()` (1007), `initSearchPage()` (1055), `initVideoPage()` (1133), `initAgeVerification()` (609)
- **Utility functions**: Generic, single responsibility
  - `escapeHtml()` (954), `formatViews()` (936), `getUrlParam()` (958), `isInViewport()` (1821), `debounce()` (1799)
- **Render functions**: Prefix with `render` or `create`
  - `renderVideos()` (750), `createVideoCard()` (704)

### Page Initialization Flow (lines 1653-1690)
1. Check `document.readyState`: if 'loading', wait for DOMContentLoaded; else call `initPage()`
2. `initPage()` runs ALL pages: `initMenuToggle()`, `initAgeVerification()`, `initSearchForm()`, `initForms()`
3. Detect page type via pathname: 
   - Home: includes 'index.html' or path is '/'
   - Search: includes 'search'
   - Video: includes 'video'
4. Call page-specific init: `initHomePage()`, `initSearchPage()`, `initVideoPage()`
5. Log completion to console

### State Management Pattern
- **Global page states** (lines 198-202): `currentPageSearch`, `currentPageMostViewed`, `currentPageTopRated`, `currentPageNewest`, `currentPage`, `currentQuery`
- **URL parameters**: Extracted once at page load via `getUrlParam('name')` (line 958)
- **localStorage scoped by CONFIG key**: `age_verified`, `eporner_removed_ids` (line 177-179)
- **DOM state**: Pagination buttons show/hide via `.style.display = 'inline-block'` or `'none'`
- **NO React/Vue sta (lines 195-209)
```javascript
const isMobileDevice = () => /Android|webOS|iPhone|iPad|BlackBerry/.test(navigator.userAgent);
const isTabletDevice = () => isMobileDevice() && window.innerWidth >= 768;
const getOptimalVideosPerPage = () => isMobileDevice() && !isTabletDevice() ? 12 : 20;
```
- Not currently used in rendering (videos always load 20 per page)
- Could be integrated into `getMostViewedVideos()` to load fewer on mobile

### Responsive Breakpoints (Mobile-First, lines 1190+)
- **< 480px**: Extra small phones - 1 column, 10px padding, 1.5rem h1
- **480-767px**: Small phones - 1 column, 12px padding
- **768-1023px**: Tablets - 2-column grid, sidebar hidden (display: none), responsive nav
- **1024-1199px**: Desktop - 3-column grid, sidebar shown (width: 300px)
- **≥ 1200px**: Large desktop - 4-column grid, 40px padding, max-width 1400px

### CSS Variables for Theming (lines 20-30)
All colors controlled via `:root` variables:
```css
--primary-bg: #0a0a0a;        /* Dark background */
--secondary-bg: #1a1a1a;      /* Slightly lighter */
--accent-color: #e63946;      /* Red for buttons/links */
--accent-hover: #d62828;      /* Darker red on hover */
--border-color: #333333;      /* Subtle borders */
--# Console Debugging (F12 → Console tab)
```javascript
// Check API response format
const data = await searchVideos('teen', 1);
console.log(data); // Should show { videos: [], page: 1, total_pages: X, ... }

// Check pagination state
console.log('Current page:', currentPageSearch);
console.log('Current query:', currentQuery);

// Check localStorage
localStorage.getItem('age_verified');           // 'true' or null
localStorage.getItem('eporner_removed_ids');    // JSON array of IDs
console.log(JSON.parse(localStorage.getItem('eporner_removed_ids')).length); // Count of removed IDs

// Clear age gate and reload
localStorage.removeItem('age_verified'); 
localStorage.removeItem('age_verified_time'); 
location.reload();
```

### Testing Video Pages
- **Test with working video ID:** `video.html?id=IsabYDAiqXa` (test ID in code, known to work)
- **Check console logs:** Lines 461-486 in `getVideo()` show detailed fetch debugging
- **Network tab:** Filter by "eporner.com" → verify request URL includes `id=IsabYDAiqXa`
- **Removed videos (https://www.eporner.com/api/v2/)
- **Response format:** `{ count, start, per_page, page, total_count, total_pages, time_ms, videos: [...] }`
- **Video object:** id (11 chars, case-sensitive), title, keywords, views, rate (0-5), url, added (date), length_sec, length_min, embed, default_thumb, thumbs[]
- **Removed videos API:** `/video/removed/` returns array of `{ id: "xxxx" }` objects
- **Cached for 24h** to minimize API calls (see `getRemovedIds()` line 505)
- **CORS limitation:** `/video/removed/` has restrictions; code gracefully falls back
- **Request example:** 
  ```
  https://www.eporner.com/api/v2/video/search/?query=teen&page=1&per_page=20&thumbsize=medium&order=top-weekly&format=json
  ```
- **Timeout:** All requests have 10s abort timeout (line 272)

### Netlify Forms (No backend needed)
- **Contact form:** [contact.html](../contact.html) (line 60) has `name="contact" method="POST" netlify`
- **Newsletter form:** [index.html](../index.html) (line 100) has `name="newsletter" method="POST" netlify`
- **Submission flow:** Form POST → Netlify captures → Email notification (configure in Netlify dashboard)
- **No client-side code needed:** Netlify intercepts form submission automatically
- **Testing:** Network tab → submit form → should see POST with 200 response to `/.netlify/functions/...`

### JuicyAds Integration
- **7 ad zones:** Leaderboard (728×90), Box (300×250), Medium (632×190), Small (474×190), VGA (308×286), Billboard (908×258), Skyscraper (160×600)
- **Placement:** Each page has `<ins id="ZONE_ID">` placeholders where ads render
- **Script load:** [scripts/ads.js](../scripts/ads.js) loads JuicyAds script once
- **No fallback needed:** Empty divs if ad block is active (won't break page)
- **Revenue:** JuicyAds tracks impressions and clicks automaticallyrid, max-width containers

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
have CORS restrictions
- **Workaround:** Code catches errors, logs warning, falls back to empty array (line 551)
- Videos still load normally, just without extra removed ID filtering
- **Status:** This is an Eporner API limitation, not our bug

### Mobile Header Navigation (Fixed/Sticky Positioning)
- Fixed header takes 60px height (must account in positioning)
- Mobile nav is `position: fixed` and overlays content (z-index: 999)
- Menu closes on nav link click via `initMenuToggle()` (line 1839)
- **Issue:** Body scroll doesn't lock while menu open (consider adding `overflow: hidden`)
- **Testing:** DevTools 375px width → toggle hamburger → nav should appear/disappear

### localStorage Size Limits (~5-10MB)
- Removed IDs cache can grow large (potentially 5MB+ for 50k+ IDs)
- Current strategy: 24h expiry auto-refreshes
- **If cache exceeds limit:** Browser will throw QuotaExceededError
- **Fix:** Implement LRU (least recently used) clearing or reduce cache age

### AD Block Interference
- JuicyAds and other ad networks may be blocked by browser extensions
- Ad placeholders (divs) won't fill; won't break page
- Revenue impact but no functional issue

### Eporner API Response Variations
- API inconsistently returns `[]` vs error object for removed videos
- Our code handles both (line 481-482 checks for empty array)
- Some videos missing `keywords` field (defensive code checks existence)
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
