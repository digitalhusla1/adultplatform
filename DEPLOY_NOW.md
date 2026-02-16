# Deploy to Netlify - Step-by-Step Instructions

## Choose Your Deployment Method

---

## ⚡ METHOD 1: Drag & Drop (Fastest - 2 Minutes)

### Steps:
1. Go to **https://netlify.com**
2. Sign up or log in with GitHub
3. Drag entire project folder onto the page
4. Wait 30 seconds for deployment
5. ✅ Your site is LIVE!

**Your site URL:** Will be given automatically (like `admiring-hare-123.netlify.app`)

---

## 📱 METHOD 2: GitHub Integration (Recommended - 5 Minutes)

### Prerequisites:
- GitHub account
- Project pushed to GitHub repository

### Steps:

1. **Ensure all files are in GitHub**
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Go to Netlify.com**
   - Click **"New site from Git"**

3. **Connect GitHub**
   - Select **GitHub** as your Git provider
   - Click **Authorize Netlify**
   - Login to GitHub if prompted

4. **Select Repository**
   - Find and select your AdultPlatform repository
   - Click **"Deploy site"**

5. **Configure Build Settings** (Already done in netlify.toml)
   - Branch: `main`
   - Build command: `echo 'Static site'`
   - Publish directory: `.`
   - Click **"Deploy site"**

6. **Wait for Build** (~30 seconds)
   - See "Site is live" confirmation
   - Click link to view site

### Automatic Deploys:
Every time you `git push`, Netlify automatically redeploys! 🔄

---

## 💻 METHOD 3: Netlify CLI (Command Line - 3 Minutes)

### Prerequisites:
- Node.js installed
- Terminal/Command Prompt access

### Steps:

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```
   - Browser opens to authenticate
   - Click "Authorize"

3. **Deploy Production**
   ```bash
   netlify deploy --prod --dir .
   ```
   - Wait for upload to complete
   - You'll see your live site URL

4. ✅ **Done!** Your site is live!

---

## 🎯 POST-DEPLOYMENT VERIFICATION

After deployment, verify everything works:

### 1. **Test Homepage**
- [ ] Visit your Netlify site URL
- [ ] All 4 video sections load (Trending, Most Viewed, Top Rated, Newest)
- [ ] No console errors (F12 → Console tab)

### 2. **Test Age Verification**
- [ ] Open in private/incognito window
- [ ] Age verification modal appears
- [ ] Click "Yes, I'm 18+" to proceed
- [ ] Click "No" redirects to Google

### 3. **Test Video Watching**
- [ ] Click any video to watch
- [ ] Video plays in embedded player
- [ ] Related videos show below
- [ ] Pagination works (Next/Previous buttons)

### 4. **Test Search**
- [ ] Search for a keyword (e.g., "amateur")
- [ ] Results display with pagination
- [ ] URLs show `?query=keyword`

### 5. **Test Categories**
- [ ] Visit /categories.html
- [ ] Click category links
- [ ] Search results load

### 6. **Test Forms** (If not age-gated)
- [ ] Go to Contact page
- [ ] Submit test form
- [ ] Check Netlify Dashboard → Forms for submission

### 7. **Mobile Responsiveness**
- [ ] Open on phone or tablet
- [ ] All content visible without horizontal scrolling
- [ ] Hamburger menu works
- [ ] Touch targets are large enough

### 8. **Browser Compatibility**
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge

---

## 🌐 CONNECT CUSTOM DOMAIN (Optional)

After site is live, add your own domain:

### If you own hdpornlove.com:

1. **In Netlify Dashboard:**
   - Go to Site Settings → Domain Management
   - Click "Add domain"
   - Enter `hdpornlove.com`

2. **Update DNS Settings:**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add CNAME record pointing to your Netlify site
   - Or update nameservers to Netlify's

3. **Wait for DNS Propagation** (5-48 hours)
   - Netlify shows status
   - Automatic HTTPS certificate generated

---

## 📊 MONITOR YOUR SITE

### Netlify Dashboard Access:
1. Go to **netlify.com/app**
2. Select your site
3. View:
   - ✅ Build logs
   - ✅ Deploy history
   - ✅ Form submissions
   - ✅ Analytics (if enabled)
   - ✅ Site performance

### Set Up Notifications:
1. Site Settings → Build & Deploy
2. Add notifications for:
   - Successful deploys
   - Failed deploys
   - Form submissions

---

## 🚀 DEPLOYMENT CHECKLIST

Before clicking deploy:

- [ ] All HTML files are present (index.html, video.html, etc.)
- [ ] netlify.toml is configured correctly
- [ ] _redirects file exists
- [ ] robots.txt exists
- [ ] sitemap.xml exists
- [ ] scripts/main.js no errors
- [ ] styles/main.css no errors
- [ ] No console errors when testing locally
- [ ] Age gate works properly
- [ ] Search functionality works
- [ ] Video pages work
- [ ] Related videos load

---

## ⚠️ TROUBLESHOOTING

### Site won't deploy
**Solution:** Check build logs in Netlify Dashboard → Deploys
- Look for error messages
- Verify netlify.toml syntax

### 404 errors on video/search pages
**Solution:** Check _redirects file
- Ensure it's in root directory
- Verify redirect rules are correct

### Age modal not showing
**Solution:** Check browser console
- Test in private/incognito window
- Clear localStorage
- Check main.js for errors

### Forms not working
**Solution:** Verify form configuration
- Add `netlify` attribute to form tags
- Add `name` attribute to forms
- Check Netlify Forms settings

### Slow loading
**Solution:** 
- Check Netlify Analytics
- Verify API timeouts (10 seconds)
- Check if ads are loading slowly

---

## 🔐 SECURITY SETTINGS

### Enable Additional Security:

1. **Access Control (Optional)**
   - Site Settings → General
   - Add password protection if needed

2. **Environment Variables (if needed)**
   - Site Settings → Build & Deploy → Environment
   - Add any API keys or secrets

3. **HTTPS Redirects (Already configured)**
   - All traffic automatically redirected to HTTPS

---

## 📱 MONITORING AFTER DEPLOYMENT

### Daily:
- Check for form submissions (contact, newsletter)
- Monitor analytics
- Check for error reports

### Weekly:
- Review Netlify build logs
- Check site performance metrics
- Test critical features

### Monthly:
- Update content
- Review analytics
- Check for any issues

---

## 🎉 DEPLOYMENT COMPLETE!

Once deployed, your site is:
- ✅ Live on the internet
- ✅ Protected with HTTPS
- ✅ Served from global CDN
- ✅ Available 24/7
- ✅ Automatically cached
- ✅ Easy to update (just push to GitHub)

---

## Support Resources

- **Netlify Docs:** https://docs.netlify.com
- **Netlify Support:** https://support.netlify.com
- **Form Handling:** https://docs.netlify.com/forms/setup
- **Redirects Guide:** https://docs.netlify.com/routing/redirects

---

**Ready?** Choose a deployment method above and your site will be live in minutes! 🚀

