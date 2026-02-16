# Mobile Header & Menu Quick Reference

## CSS Key Values (Mobile - < 768px)

### Header
- **Height:** Variable (content-based)
- **Background:** `var(--secondary-bg)` (#1a1a1a)
- **Border:** 2px solid `var(--accent-color)` (#e63946)
- **Display:** `flex`
- **Direction:** `column`
- **Padding:** `var(--spacing)` (16px) all sides

### Logo Section
- **Flex:** 1 (takes available space)
- **Text Align:** left
- **Padding:** none

### Hamburger Button (.menu-toggle)
- **Display:** `flex` ✅ VISIBLE on mobile
- **Order:** 2 (appears after logo)
- **Width:** 24px × 3 spans
- **Z-Index:** 1001 (above menu)
- **Position:** relative

### Search Bar
- **Order:** 3 (below logo and button)
- **Width:** 100%
- **Flex Basis:** 100% (new row)
- **Padding:** 8px on all sides
- **Margin:** 8px top spacing

### Navigation Menu (nav)
- **Position:** `fixed` (overlays page)
- **Top:** `60px` ✅ BELOW HEADER
- **Width:** 100% full screen
- **Max Height:** `calc(100vh - 60px)` ✅ SCROLLABLE
- **Z-Index:** 999 (below hamburger)
- **Display:** `flex` (column)
- **Background:** `var(--secondary-bg)`
- **Border Top:** 2px solid `var(--accent-color)`
- **Box Shadow:** `0 4px 6px rgba(0,0,0,0.3)`

### Navigation Links (nav a)
- **Display:** `flex` (center items vertically)
- **Min Height:** `50px` ✅ TOUCH TARGET
- **Padding:** `15px 16px`
- **Width:** `100%`
- **Border Bottom:** 1px solid `var(--border-color)`

---

## Visual Diagram

```
┌─────────────────────────────────────────┐
│ HEADER (60px height minimum)            │
├─────────────────────────────────────────┤
│ Logo (flex:1)  │ Hamburger (order:2) ☰ │  
├─────────────────────────────────────────┤
│ [Search Input] [Search Button] (order:3)│
├─────────────────────────────────────────┤ ← Header ends
│ NAVIGATION (position:fixed; top:60px)   │
│ ├─ Home (50px height)                   │
│ ├─ About (50px height)                  │
│ ├─ Categories (50px height)             │
│ └─ Contact (50px height)                │
└─────────────────────────────────────────┘
│ PAGE CONTENT (behind nav overlay)       │
└─────────────────────────────────────────┘
```

---

## Menu States

### Closed State
- `nav.hidden` = `display: none !important`
- `nav.visible` = not applied
- Page content fully accessible

### Open State
- `nav.visible` = `display: flex !important`
- `nav.hidden` = removed
- Menu overlays content with `z-index: 999`

---

## JavaScript Toggle (main.js)

```javascript
function initMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    // Click hamburger button
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('hidden');
        mainNav.classList.toggle('visible');
    });

    // Click menu link - close menu
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mainNav.classList.add('hidden');
            mainNav.classList.remove('visible');
        });
    });

    // Click outside - close menu
    document.addEventListener('click', (e) => {
        if (!e.target.closest('header')) {
            menuToggle.classList.remove('active');
            mainNav.classList.add('hidden');
            mainNav.classList.remove('visible');
        }
    });
}
```

---

## Color Scheme

| Element | Color | CSS Variable |
|---------|-------|-------------|
| Background | #0a0a0a | `--primary-bg` |
| Secondary BG | #1a1a1a | `--secondary-bg` |
| Accent (Red) | #e63946 | `--accent-color` |
| Text (White) | #ffffff | `--primary-text` |
| Borders | #333333 | `--border-color` |

---

## Responsive Breakpoints

```
Mobile (< 768px)
├─ Hamburger visible
├─ Logo full width
├─ Search bar full width
└─ Nav overlays page

Tablet (768px - 1024px)
├─ Hamburger hidden
├─ Logo left side
├─ Search bar right side
└─ Nav inline in header

Desktop (≥ 1024px)
├─ Hamburger hidden
├─ Full horizontal layout
├─ Sidebar visible
└─ 4-column video grid
```

---

## CSS Media Query

```css
@media (max-width: 767px) {
    /* Mobile styles applied */
}

@media (min-width: 768px) {
    /* Desktop nav always visible */
    .menu-toggle {
        display: none !important;
    }
    nav {
        position: static !important;
        background-color: transparent !important;
    }
}
```

---

## Testing Mobile Menu

### Quick Test
1. Open DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Set viewport to 375×667
4. Check hamburger button appears
5. Click hamburger - menu should appear below header
6. Click menu link - menu should close
7. Click outside menu - menu should close

### Real Device Test
1. Visit https://hdpornlove.com on phone
2. Should see hamburger button
3. Tap hamburger
4. Menu should slide down from top (below header)
5. Tap menu item
6. Should navigate and menu closes

---

## Troubleshooting

### Menu appears at bottom instead of below header
**Issue:** CSS not applied  
**Solution:** Clear browser cache (Ctrl+Shift+Delete)  
**Check:** `nav { top: 60px; }` in DevTools

### Menu doesn't scroll
**Issue:** Max-height too small  
**Solution:** Verify `max-height: calc(100vh - 60px);`

### Menu items not clickable
**Issue:** Z-index conflict  
**Solution:** Check `nav { z-index: 999; }` is set

### Hamburger button covered by menu
**Issue:** Z-index ordering  
**Solution:** Hamburger has `z-index: 1001` (above nav's 999)

---

**Last Updated:** January 9, 2025  
**Status:** ✅ Deployed & Live
