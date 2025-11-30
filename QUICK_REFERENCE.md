# Quick Reference Card - HDpornlove.com

## 🎨 Quick Color Changes

**File**: `styles/main.css` (Line 18-25)

```css
--primary-bg: #0a0a0a;      /* Dark background - change this */
--accent-color: #e63946;    /* Red buttons/links - change this */
--primary-text: #ffffff;    /* White text */
--secondary-text: #cccccc;  /* Gray text */
```

**Example**: Change red to blue
```css
--accent-color: #0066ff;    /* Now all accents are blue */
```

---

## ⚙️ JavaScript Configuration

**File**: `scripts/main.js` (Line 13-21)

```javascript
VIDEOS_PER_PAGE: 20,        // Show 20 videos per page (max 1000)
THUMB_SIZE: 'medium',       // Options: 'small', 'medium', 'big'
AGE_VERIFIED_EXPIRY: 24 * 60 * 60 * 1000,     // 24 hours
```

---

## 🔗 Key File Locations

| Task | File | Line |
|------|------|------|
| Change colors | `styles/main.css` | 18-25 |
| Change videos per page | `scripts/main.js` | 19 |
| Change thumbnail size | `scripts/main.js` | 18 |
| Edit navigation menu | `index.html` | 30-37 |
| Edit footer disclaimer | `index.html` | 105-110 |
| Add new page | Create `.html` file | Use `index.html` as template |

---

## 🚀 Deployment (2 Steps)

### Option 1: Drag & Drop
```
1. Go to https://app.netlify.com
2. Drag AdultPlatform folder onto screen
3. Done - site is live
```

### Option 2: GitHub
```
1. Push to GitHub
2. Connect repo to Netlify
3. Auto-deploys on every push
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Videos not showing | Check F12 → Console for red errors |
| Layout broken on mobile | Clear cache (Ctrl+Shift+R) |
| Age modal not showing | Check localStorage in DevTools |
| Search doesn't work | Try different search term |
| Page loads slow | Wait 30 seconds (API might be busy) |

---

## 📱 Test on Mobile

1. Open site in Chrome
2. Press `F12` (Developer Tools)
3. Click device icon (top left)
4. Select any phone model
5. Refresh page

---

## 📊 What's Automated

✅ **No Code Needed For**:
- Age verification (automatic)
- Video filtering (automatic)
- Form submission (Netlify Forms)
- API caching (automatic)
- Mobile responsiveness (automatic)
- Search functionality (automatic)

---

## 🔐 Security Features

✅ **Built In**:
- XSS prevention (script injection blocked)
- API timeout protection (no hanging requests)
- Age verification modal (24 hour remember)
- Input validation (prevents errors)
- Error logging (debugging info)

---

## 📝 File Structure

```
AdultPlatform/
├── HTML Pages (11 files)
│   ├── index.html (home)
│   ├── search.html (results)
│   ├── video.html (player)
│   └── legal pages (5 files)
├── CSS
│   └── styles/main.css (all styling)
├── JavaScript
│   └── scripts/main.js (all functionality)
├── Config
│   ├── _redirects (Netlify routing)
│   ├── robots.txt (SEO)
│   └── sitemap.xml (SEO)
└── Guides
    ├── EDITING_GUIDE.md (how to edit)
    └── CODE_QUALITY_REPORT.md (details)
```

---

## 🔄 Git Commands

```bash
# View changes
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your message here"

# Push to GitHub
git push origin master

# View history
git log --oneline

# Revert changes
git revert <commit-hash>
```

---

## 🌐 Important APIs & Services

| Service | Usage | Status |
|---------|-------|--------|
| Eporner API | Video data | Production |
| Netlify Forms | Form submissions | Production |
| Netlify Hosting | Static hosting | Production |
| localStorage | Data storage | Production |

---

## ⏱️ Timing References

| Action | Time |
|--------|------|
| Age verification expires | 24 hours |
| Removed videos cache expires | 24 hours |
| API request timeout | 10 seconds |
| Lazy load margin | 50px before viewport |

---

## 💡 Pro Tips

**Tip 1**: Always test changes on mobile
```
Press F12 → Click device icon → Select phone → Refresh
```

**Tip 2**: Check console for hidden errors
```
Press F12 → Click Console tab → look for red X
```

**Tip 3**: Clear cache when styles don't update
```
Ctrl + Shift + R (hard refresh with cache clear)
```

**Tip 4**: Test API with curl
```bash
curl "https://www.eporner.com/api/v2/video/search/?query=amateur"
```

**Tip 5**: Use browser's Network tab to debug slow loads
```
F12 → Network → Refresh → Look for slow requests
```

---

## ❓ Frequently Asked Questions

**Q: Can I change the site name?**
A: Yes, edit "HDpornlove" in `index.html` logo section

**Q: How do I add more pages?**
A: Copy `index.html`, rename it, keep same structure with header/footer

**Q: Can I use different videos source?**
A: Yes, change `API_BASE` in `scripts/main.js` to another API

**Q: How do I track visitors?**
A: Add Google Analytics code to `<head>` section (GDPR compliant)

**Q: Can I add custom domain?**
A: Yes, in Netlify dashboard under Settings → Domain

**Q: How do I password-protect pages?**
A: Use Netlify Password Protection or `.htaccess`

---

## 📞 Error Reference

**"API Error 502"** = API server down  
**"API Error 403"** = Access denied (rate limit?)  
**"Cannot redeclare"** = Duplicate variable name  
**"Timeout error"** = API too slow  
**"Parse error"** = Invalid JSON response  

---

## 🎯 Development Workflow

```
1. Make changes to CSS/JS/HTML files
2. Save files
3. Refresh browser (F5)
4. Check F12 Console for errors
5. Test on mobile
6. Git commit when working
7. Push to GitHub
8. Netlify auto-deploys
```

---

## ✅ Pre-Launch Checklist

Before going live:

- [ ] Test on 3+ browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile phone
- [ ] Click all navigation links
- [ ] Try a search
- [ ] View a video
- [ ] Check age modal appears
- [ ] Check footer disclaimer visible
- [ ] No errors in F12 Console
- [ ] All forms submit
- [ ] Clear cache and test again

---

**Last Updated**: November 30, 2025  
**Version**: 1.0  
**For**: HDpornlove.com Project
