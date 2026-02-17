# AI Coding Agent Instructions for HDpornlove.com

## Project Overview

Serverless adult video streaming platform — **pure vanilla HTML/CSS/JS** (no Node.js, no npm, no bundler). Integrates with **Eporner API v2** for video content. Deployed on **Netlify** with auto-deploy from git push. Ad-supported via highperformanceformat.com/effectivegatecpm ad scripts.

## Architecture (Single-File JS)

All application logic lives in `scripts/main.js`. There is no framework, no modules, no build step.

**Initialization flow:** `DOMContentLoaded` → `initPage()` → detects page by `window.location.pathname` → calls page-specific init (`initHomePage`, `initSearchPage`, `initVideoPage`). Every page also runs `initMenuToggle()`, `initAgeVerification()`, `initSearchForm()`, `initForms()`.

**Data flow:** API fetch → validate response → filter removed IDs (in-memory `Set`) → `createVideoCard()` builds HTML string → `renderVideos()` sets `.innerHTML` → `setupPagination()` / `setupTrendingPagination()` wires prev/next buttons.

**State management:** Global `let` variables per section (`currentPageSearch`, `currentPageMostViewed`, `currentPageTopRated`, `currentPageNewest`, `currentPage`, `currentQuery`). No framework state — pagination buttons mutate these directly. localStorage stores `age_verified`, `age_verified_time`, and `eporner_removed_ids` + `_time`.

## Critical Patterns — Follow These Exactly

### API Functions
Every API function follows this template (copy `getMostViewedVideos()` for new sections):
1. Build URL with `new URL()` + `url.searchParams.append()`
2. Create `AbortController` with **10s timeout** (`setTimeout(() => controller.abort(), 10000)`)
3. `fetch()` with `{ signal: controller.signal }`, then `clearTimeout()`
4. Validate `response.ok`, then `response.json()`
5. Check `data.videos` is Array; filter against `_removedIdsCache` Set

Valid `order` values: `latest`, `longest`, `shortest`, `top-rated`, `most-popular`, `top-weekly`, `top-monthly`, `latest-views`, `newest`

### XSS Prevention — Mandatory
- **All** user-sourced text → `escapeHtml(text)` before `.innerHTML` (uses `div.textContent`/`div.innerHTML` pattern)
- **All** user input in URLs → `encodeURIComponent()`
- Video IDs are 11-char case-sensitive alphanumeric — still escape in HTML context

### Adding a New Video Section to Home Page
1. Add `let currentPageXxx = 1;` to page state
2. Copy an existing API function, change `order` param
3. Add HTML in `index.html`: `<div id="xxxVideos" class="video-grid"></div>` + pagination buttons (`prevXxxBtn`, `nextXxxBtn`, `pageXxxInfo`)
4. Add to `Promise.all()` in `initHomePage()`
5. Call `renderVideos(data.videos, 'xxxVideos')` + `setupTrendingPagination(data, 'xxx')`
6. Add the new `sectionType` case in `setupTrendingPagination()` switch

### URL Parameter Convention
- `video.html?id=[11-char-videoId]` — Video detail
- `search.html?query=[encoded-string]` — Search results
- Extract via `getUrlParam(name)` (wraps `URLSearchParams`)

## CSS Architecture

**Theming:** All colors in `:root` variables in `styles/main.css` — `--primary-bg`, `--secondary-bg`, `--accent-color`, `--border-color`, etc. Change one variable to update entire site.

**Responsive breakpoints (mobile-first):**
- `<480px`: 1 column, compact padding
- `480-767px`: 1 column, sidebar hidden
- `768-1023px`: 2-column grid, sidebar hidden, hamburger menu
- `1024-1199px`: 3-column grid, 300px sidebar visible
- `≥1200px`: 4-column grid, max-width 1400px

**Layout pattern:** `.main-wrapper` = flex container; `.main-content` = `flex: 1`; `.sidebar` = 300px sticky. Home page (`index.html`) uses full-width `<main>` without sidebar.

## External Integrations

- **Eporner API v2** (`https://www.eporner.com/api/v2/`) — No auth needed. `/video/search/`, `/video/id/`, `/video/removed/`. The removed endpoint has CORS issues; code gracefully falls back to empty Set.
- **Netlify Forms** — `<form method="POST" netlify>` attribute on contact + newsletter forms. No backend code needed.
- **Ad networks** — Inline `<script>` tags from highperformanceformat.com and effectivegatecpm.com. Ad blockers won't break the page.
- **Netlify deployment** — Config in `netlify.toml`. URL redirects: `/video/:id` → `/video.html?id=:id`, `/search/:query` → `/search.html?query=:query`.

## Key Files

| File | Role |
|------|------|
| `scripts/main.js` | ALL app logic: API, rendering, pagination, age gate, navigation |
| `styles/main.css` | Dark theme, responsive grid, sidebar, all component styles |
| `index.html` | Home with 4 sections (trending/viewed/rated/newest) + ads |
| `video.html` | Video embed + info + related videos + sidebar |
| `search.html` | Search results + pagination + sidebar |
| `netlify.toml` | Deploy config, URL redirects, cache/security headers |
| `API_DOCUMENTATION.md` | Full Eporner API reference |

## Debugging

- **Test video page:** `video.html?id=IsabYDAiqXa`
- **Clear age gate:** `localStorage.removeItem('age_verified'); localStorage.removeItem('age_verified_time'); location.reload()`
- **Inspect removed cache:** `localStorage.getItem('eporner_removed_ids')`
- **API monitoring:** DevTools Network tab → filter `eporner.com`
- **Mobile test:** DevTools responsive mode at 375px, 768px, 1024px

## Known Limitations

- `/video/removed/` API has CORS restrictions — code catches errors and falls back to empty Set
- Removed IDs cache in localStorage can grow large; 24h expiry mitigates this
- Mobile nav doesn't lock body scroll when open
- Ad scripts load async; blocked ads leave empty containers (non-breaking)
