# JuicyAds Backup - All Original Ad Codes

This file contains all original JuicyAds placements from the website. Use this to restore ads or switch to a different ad network.

## Ad Placement Summary

| Size | ID | Location | Zone |
|------|-----|----------|------|
| 728x90 | 1106339 | Leaderboard (Header & Pages) | Top banner |
| 632x190 | 1106474 | Medium Rectangle (Content) | Middle content |
| 474x190 | 1106411 | Small Rectangle (Content) | Content area |
| 308x286 | 1106579 | VGA (Content) | Content area |
| 908x258 | 1106410 | Billboard (Content) | Large content |
| 300x250 | 1106334 | Medium Rectangle (Sidebar) | Right sidebar |
| 160x600 | 1106335 | Skyscraper (Sidebar) | Right sidebar |

---

## Full JuicyAds Script Template

```javascript
<!-- JuicyAds Script (Include once per page) -->
<script type="text/javascript" data-cfasync="false" async src="https://poweredby.jads.co/js/jads.js"></script>
```

---

## Ad Code Templates by Size

### 728x90 Leaderboard (ID: 1106339)
```html
<!-- JuicyAds Leaderboard 728x90 -->
<section class="ad-section ad-leaderboard">
    <script type="text/javascript" data-cfasync="false" async src="https://poweredby.jads.co/js/jads.js"></script>
    <ins id="1106339" data-width="728" data-height="90"></ins>
    <script type="text/javascript" data-cfasync="false" async>(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':1106339});</script>
</section>
```

### 632x190 Medium Rectangle (ID: 1106474)
```html
<!-- JuicyAds 632x190 -->
<section class="ad-section ad-medium">
    <script type="text/javascript" data-cfasync="false" async src="https://poweredby.jads.co/js/jads.js"></script>
    <ins id="1106474" data-width="632" data-height="190"></ins>
    <script type="text/javascript" data-cfasync="false" async>(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':1106474});</script>
</section>
```

### 474x190 Small Rectangle (ID: 1106411)
```html
<!-- JuicyAds 474x190 -->
<section class="ad-section ad-small">
    <script type="text/javascript" data-cfasync="false" async src="https://poweredby.jads.co/js/jads.js"></script>
    <ins id="1106411" data-width="474" data-height="190"></ins>
    <script type="text/javascript" data-cfasync="false" async>(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':1106411});</script>
</section>
```

### 308x286 VGA (ID: 1106579)
```html
<!-- JuicyAds 308x286 -->
<section class="ad-section ad-vga">
    <script type="text/javascript" data-cfasync="false" async src="https://poweredby.jads.co/js/jads.js"></script>
    <ins id="1106579" data-width="308" data-height="286"></ins>
    <script type="text/javascript" data-cfasync="false" async>(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':1106579});</script>
</section>
```

### 908x258 Billboard (ID: 1106410)
```html
<!-- JuicyAds v3.0 - 908x258 Medium Rect Ad -->
<section class="ad-section ad-billboard">
    <script type="text/javascript" data-cfasync="false" async src="https://poweredby.jads.co/js/jads.js"></script>
    <ins id="1106410" data-width="908" data-height="258"></ins>
    <script type="text/javascript" data-cfasync="false" async>(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':1106410});</script>
</section>
```

### 300x250 Sidebar Medium (ID: 1106334)
```html
<!-- JuicyAds 300x250 Banner -->
<div class="sidebar-box ad-box">
    <script type="text/javascript" data-cfasync="false" async src="https://poweredby.jads.co/js/jads.js"></script>
    <ins id="1106334" data-width="300" data-height="250"></ins>
    <script type="text/javascript" data-cfasync="false" async>(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':1106334});</script>
</div>
```

### 160x600 Sidebar Skyscraper (ID: 1106335)
```html
<!-- JuicyAds 160x600 Skyscraper Banner -->
<div class="sidebar-box ad-box-skyscraper">
    <script type="text/javascript" data-cfasync="false" async src="https://poweredby.jads.co/js/jads.js"></script>
    <ins id="1106335" data-width="160" data-height="600"></ins>
    <script type="text/javascript" data-cfasync="false" async>(adsbyjuicy = window.adsbyjuicy || []).push({'adzone':1106335});</script>
</div>
```

---

## Ad Locations in HTML Files

### index.html (7 ads)
- Line 72-77: 728x90 Leaderboard (header)
- Line 91-96: 632x190 Medium (content)
- Line 110-115: 474x190 Small (content)
- Line 129-134: 308x286 VGA (content)
- Line 148-153: 908x258 Billboard (content)
- Line 177-185: 300x250 Sidebar box
- Line 197-202: 160x600 Skyscraper sidebar

### video.html (7 ads)
- Leaderboard at top
- Medium rectangle in content
- Billboard in related videos
- Sidebar 300x250 and skyscraper

### search.html (7 ads)
- Same layout as index.html

### categories.html (7 ads)
- Same layout as index.html

### contact.html (7 ads)
- Same layout as index.html

### about.html (7 ads)
- Same layout as index.html

### 2257.html (3 ads)
- Leaderboard at top
- 300x250 sidebar
- 160x600 skyscraper

### privacy.html, terms.html, dmca.html
- Similar layouts with leaderboard and sidebar ads

---

## How to Restore

1. Copy the desired ad code template from above
2. Replace the placeholder div in the HTML file
3. Update the ad zone ID if using a different network
4. Keep the same CSS classes (`ad-leaderboard`, `ad-medium`, etc.) for proper sizing

## Switching Ad Networks

To use a different ad network (Google AdSense, PropellerAds, etc.):

1. Replace the `<ins>` tag with your network's ad code
2. Keep the outer section/div structure for CSS styling
3. Keep the same dimensions for responsive layout
4. Ensure your new ad network supports async loading for performance

---

**Date Backed Up:** February 16, 2026
**Total Placements:** 52 ad zones across 9 HTML files
**Ad Network:** JuicyAds (Original)
