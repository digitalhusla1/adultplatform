
# AI Coding Agent Instructions for HDpornlove.com

## Architecture Overview

**Stack:** Vanilla HTML/CSS/JS, serverless, zero-build deployment. All application logic lives in a single `scripts/main.js` entry point (~1500 lines). No frameworks, modules, npm, or build tools—files deploy directly to Netlify.

**Lifecycle:** On page load, `DOMContentLoaded` fires `initPage()`, which inspects `window.location.pathname` and calls the appropriate page-specific init (`initHomePage()`, `initSearchPage()`, `initVideoPage()`, etc.). All state persists in global variables (`let currentPageXxx`, `_removedIdsCache`) and localStorage.

**Architecture Decision:** Single-file approach prioritizes simplicity, zero configuration, and instant deployment. Trade-off: no module system means careful namespace management.

## Critical API Integration Pattern

The Eporner API v2 pattern is **canonical and mandatory**—all new API functions follow this template:

```javascript
async function getXxxVideos(page = 1) {
    try {
        const url = new URL(`${CONFIG.API_BASE}video/search/`);
        url.searchParams.append('query', 'all');
        url.searchParams.append('page', page);
        url.searchParams.append('per_page', CONFIG.VIDEOS_PER_PAGE);
        url.searchParams.append('thumbsize', CONFIG.THUMB_SIZE);
        url.searchParams.append('order', 'top-weekly'); // Vary by section
        url.searchParams.append('format', 'json');

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(url.toString(), { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) throw new Error(`API HTTP Error ${response.status}`);
        const data = await response.json();
        if (!data.videos?.length) return { videos: [], page: 1, total_pages: 0 };

        // CRITICAL: Filter removed videos in-memory (0ms performance)
        if (_removedIdsCache?.size > 0) {
            data.videos = data.videos.filter(v => v?.id && !_removedIdsCache.has(v.id));
        }
        return data;
    } catch (error) {
        if (error.name === 'AbortError') throw new Error('API timeout');
        throw error;
    }
}
```

**Key invariants:**
- 10-second AbortController timeout (non-negotiable)
- JSON parse validation (`if (!data.videos || !Array.isArray(...))`)
- Removed cache filtering against `_removedIdsCache` Set (live in-memory, not on every fetch)
- Cache pre-populated from localStorage at load time
- Order param varies: `top-weekly` (trending), `latest-views` (most viewed), `top-rated`, `newest`

## DOM Rendering & XSS Prevention

**Rendering:** All video grids use `renderVideos(videosArray, containerId)`, which populates `.innerHTML` with escaped, safe HTML.

**XSS Rules:**
1. **All user input → `escapeHtml(text)`** before inserting into DOM (e.g., search titles, video names)
2. **All URLs containing user data → `encodeURIComponent(value)`** in query strings (e.g., `?query=${encodeURIComponent(searchTerm)}`)
3. **Video IDs are 11-char alphanumeric; validate before API calls:** `if (!videoId || videoId.length !== 11) throw`

Example (safe):
```javascript
// ✅ CORRECT
window.location.href = `video.html?id=${encodeURIComponent(videoId)}`;
const title = escapeHtml(video.title); // "Safe & Sexy" → "Safe &amp; Sexy"

// ❌ WRONG
window.location.href = `video.html?id=${videoId}`; // Direct interpolation
document.innerHTML = `<h1>${video.title}</h1>`; // XSS vector
```

## Page-Specific Workflows

| Page | Init Function | State Var | Key Files |
|------|---------------|-----------|-----------|
| Home | `initHomePage()` | `currentPageXxx` (4 vars) | `index.html`, 4 API calls in `Promise.all()` |
| Video | `initVideoPage()` | Single video object + related videos | `video.html`, `getVideo(id)`, `searchVideos(query)` |
| Search | `initSearchPage()` | `currentPageSearch` | `search.html`, `searchVideos(query, page)`, pagination |
| Categories | `initCategoriesPage()` | Query param filtering | `categories.html`, dynamic rendering |

**Home page optimization:** 4 API sections load in parallel via `Promise.all()`, reducing load time from ~8s to ~2s. Each section has its own pagination state (`currentPageMostViewed`, `currentPageTopRated`, etc.).

## Adding a New Video Section

1. **State:** Add `let currentPageNewSection = 1;` at the top of `scripts/main.js`
2. **API function:** Copy `getMostViewedVideos()`, change the `order` param (see `API_DOCUMENTATION.md`)
3. **HTML:** Add `<div id="newSectionVideos" class="video-grid"></div>` + prev/next pagination buttons to `index.html`
4. **Init:** Add your API call to the `Promise.all()` array in `initHomePage()`
5. **Render:** Call `renderVideos(data.videos, 'newSectionVideos')`
6. **Pagination:** Call `setupTrendingPagination(data, 'newSection')` and add the case to the switch statement inside that function

## Configuration & Performance

**`CONFIG` object** (top of `scripts/main.js`):
- `API_BASE`, `THUMB_SIZE`, `VIDEOS_PER_PAGE` (20), `AGE_VERIFIED_EXPIRY` (30 days), `REMOVED_CACHE_EXPIRY` (24 hours)

**Removed Videos Cache:**
- Fetched once at startup via `getRemovedIds()` (blocks if needed, but cached)
- Stored in-memory as a `Set` for O(1) lookups
- Persisted to localStorage with timestamp; 24h expiry triggers refresh
- CORS fallback: if API fails, treat as empty set (graceful degradation)

**Video Hover Preview:**
- Cycles thumbnails every 600ms on mouseover (preloads images for smoothness)
- Event delegation on document for dynamic content support
- Resets to default thumbnail on mouseleave

## URL Conventions

- **Video:** `video.html?id=IsabYDAiqXa` (11-char ID, case-sensitive)
- **Search:** `search.html?query=teen` (encoded search term)
- **Category:** `categories.html?category=mature` (optional filtering)
- **Extraction:** `getUrlParam('query')` returns decoded value or null

## External Integrations

- **Eporner API v2:** Base `https://www.eporner.com/api/v2/`, endpoints: `/video/search/`, `/video/id/`, `/video/removed/` (see `API_DOCUMENTATION.md`)
- **Netlify Forms:** `<form method="POST" netlify>` auto-submits to Netlify backend
- **Ad Network:** JuicyAds (zone-based `<ins>` tags via `poweredby.jads.co`, plus a float ad and native interstitials) — non-blocking, async
- **Netlify Redirects:** Defined in `netlify.toml` (URL rewriting, cache headers, security headers)

## Key Files Reference

- `scripts/main.js`: All logic (1500+ lines)—API, rendering, pagination, age gate, menu toggle, video preview
- `styles/main.css`: CSS variables, responsive grid (mobile-first), sidebar, dark theme
- `index.html`, `video.html`, `search.html`: Minimal HTML templates; logic via JS
- `netlify.toml`: Build config, redirects (`/video/:id` → `video.html?id=:id`), cache headers
- `API_DOCUMENTATION.md`: Eporner API endpoint reference, response schema, sort orders

## Debugging & Testing

- **Test video:** `video.html?id=IsabYDAiqXa` (valid, use for smoke tests)
- **Clear age gate:** Run in console: `localStorage.clear(); location.reload()`
- **Inspect removed cache:** `localStorage.getItem('eporner_removed_ids')`
- **API monitor:** DevTools Network → filter `eporner.com`, check status/response
- **Mobile preview:** DevTools responsive mode at 375px, 768px, 1024px
- **Ad script errors:** Check console; ad containers still render empty if blocked (CSS handles layout)

## Known Limitations & Trade-Offs

1. **No module system** → single large `main.js`; namespace carefully to avoid collisions
2. **localStorage size** → removed IDs cache can grow large; 24h expiry helps but may not flush fast enough in high-volume scenarios
3. **CORS restrictions** → `/video/removed/` API may fail; fallback treats as empty set (no blocking)
4. **Mobile nav** → doesn't lock body scroll during open; user can scroll background
5. **Async ads** → ad script loading is async; if blocked, containers render empty (CSS margin-collapse handles spacing)
6. **No build step** → all files must be valid ES6+ vanilla JS; no transpilation, no tree-shaking
