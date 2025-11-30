# HDpornlove.com - Adult Tube Website

A mobile-friendly adult video streaming platform built with vanilla HTML, CSS, and JavaScript using the Eporner API v2.

## Features

- **Mobile-Responsive Design** - Optimized for all devices (mobile, tablet, desktop)
- **Eporner API Integration** - Dynamic video fetching and display
- **Age Verification** - 18+ gate with localStorage-based bypass (24-hour)
- **Content Categories** - 25+ predefined adult categories with searchable results
- **Video Details Page** - Individual video pages with embed, stats, and related videos
- **Contact & Newsletter Forms** - Netlify Forms integration with GDPR compliance
- **Legal Compliance** - Terms of Use, Privacy Policy, 2257 Statement, DMCA procedures
- **SEO Optimized** - Meta tags, sitemap.xml, robots.txt, lazy-loading
- **Zero Backend Required** - Pure static site, deployable on Netlify, Vercel, GitHub Pages

## File Structure

```
AdultPlatform/
├── index.html              # Home page with featured videos
├── about.html              # About us page
├── categories.html         # Browse categories
├── contact.html            # Contact form (Netlify Forms)
├── search.html             # Search results page
├── video.html              # Video detail page (dynamic)
├── terms.html              # Terms of Use
├── privacy.html            # Privacy Policy
├── 2257.html               # 2257 Compliance Statement
├── dmca.html               # DMCA Takedown Information
├── styles/
│   └── main.css            # Main stylesheet (responsive, dark theme)
├── scripts/
│   └── main.js             # API integration, modals, forms
├── assets/
│   └── images/             # Logo and assets
├── _redirects              # Netlify redirect rules
├── robots.txt              # SEO robots file
└── sitemap.xml             # XML sitemap for SEO
```

## Development

No build step required. All files are vanilla HTML/CSS/JavaScript.

### Running Locally

1. Open `index.html` in a modern browser
2. Or use a local server (e.g., `python -m http.server 8000`)
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
