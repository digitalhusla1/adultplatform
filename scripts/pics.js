/* ========================================
   HDpornlove.com - Pics & Pornstars JavaScript
   Uses the shared Eporner API helpers from main.js:
     - searchVideos(query, page)  -> video search
     - getVideo(videoId)          -> single video details
   Handles:
     1. Pornstars page  (pornstars.html) - image cards
     2. Pics page       (pics.html)      - thumbnail grid + pagination
     3. Gallery page    (gallery.html)   - image grid + lightbox
   ======================================== */

'use strict';

// ========== CONFIGURATION ==========
// Pornstar list used on pornstars.html. Add/remove names here - the
// thumbnail images are fetched live from the Eporner API for each name.
const PORNSTARS = [
    'Angela White', 'Abella Danger', 'Adriana Chechik', 'Autumn Falls',
    'Ava Addams', 'Brandi Love', 'Cherie DeVille', 'Cory Chase',
    'Eliza Ibarra', 'Eva Elfie', 'Emily Willis', 'Julia Ann',
    'Kazumi', 'Kendra Lust', 'Kendra Sunderland', 'Lana Rhoades',
    'Lisa Ann', 'Luna Star', 'Mia Malkova', 'Nicole Aniston',
    'Nicolette Shea', 'Riley Reid', 'Savannah Bond', 'Violet Myers'
];

const PICS_PER_PAGE = 20;              // Pics grid uses the same page size as the rest of the site
const PORNSTAR_FETCH_CONCURRENCY = 6;  // Parallel API calls when loading pornstar thumbnails

// Inline SVG placeholder shown while a thumbnail loads / if the API has no image
const PLACEHOLDER_IMG =
    'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">' +
        '<rect width="100%" height="100%" fill="#2a2a2a"/>' +
        '<text x="50%" y="50%" fill="#666" font-family="sans-serif" font-size="16" ' +
        'text-anchor="middle" dominant-baseline="middle">No Image</text></svg>'
    );

// ========== PORNSTARS PAGE ==========
/**
 * Render one pornstar card.
 * The name links to the existing search results page (kept from old design).
 * @param {string} name - Pornstar display name
 * @param {string|null} thumbUrl - Thumbnail image URL (null until loaded)
 * @returns {string} HTML for the card
 */
function createPornstarCard(name, thumbUrl) {
    const encoded = encodeURIComponent(name);
    const safeName = escapeHtml(name);
    const img = thumbUrl
        ? `<img src="${escapeHtml(thumbUrl)}" alt="${safeName} - pornstar HD videos free" loading="lazy" decoding="async"
               onerror="this.src='${PLACEHOLDER_IMG}'">`
        : `<img src="${PLACEHOLDER_IMG}" alt="${safeName} - pornstar HD videos free" loading="lazy">`;

    // SEO: keyword-rich link text & title for the pornstar card
    return `
        <a href="search.html?query=${encoded}" class="pornstar-card" aria-label="Watch ${safeName} pornstar HD videos free" title="Watch ${safeName} pornstar HD videos free">
            <div class="pornstar-thumb">
                ${img}
                <div class="pornstar-overlay"><span>Watch Videos</span></div>
            </div>
            <div class="pornstar-name">${safeName} HD Videos</div>
        </a>
    `;
}

/**
 * Fetch ONE video for a pornstar (top weekly result) and return its
 * default thumbnail URL - used as the pornstar profile image.
 * @param {string} name - Pornstar name to search for
 * @returns {Promise<string|null>} Thumbnail URL or null on failure
 */
async function fetchPornstarThumb(name) {
    try {
        const data = await searchVideos(name, 1);
        const video = data && data.videos && data.videos[0];
        return (video && video.default_thumb && video.default_thumb.src) || null;
    } catch (error) {
        return null; // Card falls back to placeholder image
    }
}

/**
 * Initialize the Pornstars page.
 * Fetches thumbnails in small parallel batches so we don't flood the API,
 * and paints each card as soon as its image is ready.
 */
async function initPornstarsPage() {
    const grid = document.getElementById('pornstarsGrid');
    if (!grid) return;

    // Paint all cards immediately with placeholders (fast perceived loading)
    grid.innerHTML = PORNSTARS.map(name => createPornstarCard(name, null)).join('');

    // Simple concurrency-limited runner
    let index = 0;
    async function worker() {
        while (index < PORNSTARS.length) {
            const i = index++;
            const name = PORNSTARS[i];
            const thumb = await fetchPornstarThumb(name);
            // Update only this card's <img> (cards keep their original DOM order)
            const card = grid.children[i];
            if (card && thumb) {
                const img = card.querySelector('img');
                if (img) {
                    img.src = thumb;
                    img.alt = `${escapeHtml(name)} - pornstar HD videos free`;
                }
            }
        }
    }
    const workers = [];
    for (let w = 0; w < PORNSTAR_FETCH_CONCURRENCY; w++) workers.push(worker());
    await Promise.all(workers);
}

// ========== PICS PAGE ==========
/**
 * Create HTML for one thumbnail "picture" card on the Pics page.
 * Clicking it opens the gallery page for that video.
 * @param {Object} video - Video object from the Eporner API
 * @returns {string} HTML for the pic card
 */
function createPicCard(video) {
    try {
        if (!video || !video.id) return '';
        const thumb = (video.default_thumb && video.default_thumb.src) || PLACEHOLDER_IMG;
        const title = escapeHtml(video.title || 'Gallery');
        const videoId = escapeHtml(video.id);
        return `
            <a href="gallery.html?id=${videoId}" class="pic-card" aria-label="Open picture gallery: ${title}">
                <div class="pic-thumb">
                    <img src="${escapeHtml(thumb)}" alt="${title} - free HD porn pictures" loading="lazy" decoding="async" onerror="this.src='${PLACEHOLDER_IMG}'">
                </div>
                <div class="pic-title">${title}</div>
            </a>
        `;
    } catch (error) {
        return '';
    }
}

/**
 * Initialize the Pics page: fetch trending videos and show their
 * thumbnails as a picture grid, with pagination.
 */
async function initPicsPage() {
    const grid = document.getElementById('picsGrid');
    if (!grid) return;

    // Read page number from URL (?page=2). Defaults to 1.
    let page = parseInt(getUrlParam('page'), 10);
    if (isNaN(page) || page < 1) page = 1;

    grid.innerHTML = '<div class="loading">Loading pictures...</div>';

    try {
        const data = await searchVideos('all', page);

        if (!data.videos || data.videos.length === 0) {
            grid.innerHTML = '<div class="no-results"><p>No pictures found. Try again later.</p></div>';
            return;
        }

        grid.innerHTML = data.videos.map(createPicCard).filter(html => html).join('');

        // Results info (e.g. "Page 2 of 412")
        const totalCount = parseInt(data.total_count, 10);
        const totalPages = !isNaN(totalCount) ? Math.max(1, Math.ceil(totalCount / PICS_PER_PAGE)) : null;
        const info = document.getElementById('picsInfo');
        if (info) {
            info.textContent = totalPages
                ? `Page ${page} of ${totalPages}`
                : `Page ${page}`;
        }

        // Pagination buttons
        const prevBtn = document.getElementById('picsPrev');
        const nextBtn = document.getElementById('picsNext');
        if (prevBtn) {
            prevBtn.style.display = page > 1 ? 'inline-flex' : 'none';
            prevBtn.onclick = () => { window.location.href = `pics.html?page=${page - 1}`; };
        }
        if (nextBtn) {
            nextBtn.style.display = totalPages && page >= totalPages ? 'none' : 'inline-flex';
            nextBtn.onclick = () => { window.location.href = `pics.html?page=${page + 1}`; };
        }

        // Scroll back to top when navigating between pages
        if (page > 1) window.scrollTo({ top: 0 });
    } catch (error) {
        grid.innerHTML = '<div class="no-results"><p>⚠️ Error loading pictures. Please refresh the page.</p></div>';
    }
}
// ========== GALLERY PAGE ==========
// Current gallery state used by the lightbox
let _galleryImages = [];
let _galleryIndex = 0;
let _galleryVideoId = null;

/**
 * Collect every available thumbnail image from a video object.
 * The API returns several thumbnail frames per video - we gather all
 * unique image URLs and use them as the gallery pictures.
 * @param {Object} video - Video object from getVideo()
 * @returns {string[]} Array of unique image URLs
 */
function extractGalleryImages(video) {
    const urls = [];
    const seen = new Set();
    const addUrl = (url) => {
        if (url && typeof url === 'string' && /^https?:\/\//.test(url) && !seen.has(url)) {
            seen.add(url);
            urls.push(url);
        }
    };

    if (video.default_thumb && video.default_thumb.src) addUrl(video.default_thumb.src);

    if (Array.isArray(video.thumbs)) {
        video.thumbs.forEach(t => {
            if (typeof t === 'string') {
                addUrl(t);
            } else if (t && typeof t === 'object') {
                // Thumb entries may include several size variants - grab them all
                addUrl(t.src);
                addUrl(t.big);
                addUrl(t.medium);
                addUrl(t.small);
            }
        });
    }
    return urls;
}

/**
 * Open the lightbox on a specific image index.
 * @param {number} index - Zero-based index into _galleryImages
 */
function openLightbox(index) {
    if (!_galleryImages.length) return;
    _galleryIndex = Math.max(0, Math.min(index, _galleryImages.length - 1));

    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const counter = document.getElementById('lightboxCounter');
    if (!lightbox || !img) return;

    img.src = _galleryImages[_galleryIndex];
    img.alt = `Gallery image ${_galleryIndex + 1} of ${_galleryImages.length}`;
    if (counter) counter.textContent = `${_galleryIndex + 1} / ${_galleryImages.length}`;

    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

/** Close the lightbox and restore scrolling */
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) lightbox.classList.remove('show');
    document.body.style.overflow = '';
}

/** Show previous / next image in the lightbox */
function lightboxPrev() { openLightbox(_galleryIndex - 1); }
function lightboxNext() { openLightbox(_galleryIndex + 1); }

/**
 * Set up lightbox events: buttons, backdrop click, keyboard navigation
 * (Escape to close, arrow keys to move).
 */
function setupLightboxEvents() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); lightboxPrev(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); lightboxNext(); });

    // Clicking the dark backdrop (not the image) closes the lightbox
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('show')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') lightboxPrev();
        else if (e.key === 'ArrowRight') lightboxNext();
    });
}

/**
 * Initialize the Gallery page (gallery.html?id=VIDEO_ID).
 * Loads the video, renders all its thumbnails in a grid, and wires
 * up the lightbox.
 */
async function initGalleryPage() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    const videoId = getUrlParam('id');
    if (!videoId) {
        grid.innerHTML = '<div class="no-results"><p>No gallery selected. <a href="pics.html">Browse all pictures</a></p></div>';
        return;
    }
    _galleryVideoId = videoId;

    grid.innerHTML = '<div class="loading">Loading gallery...</div>';

    try {
        const video = await getVideo(videoId);
        if (!video) {
            grid.innerHTML = '<div class="no-results"><p>This gallery is no longer available. <a href="pics.html">Browse all pictures</a></p></div>';
            return;
        }

        // Update page title & video info
        const title = video.title || 'Gallery';
        document.title = `${title} - HD Picture Gallery - HDPornLove`;
        const titleEl = document.getElementById('galleryTitle');
        if (titleEl) titleEl.textContent = title;
        const infoEl = document.getElementById('galleryInfo');
        if (infoEl) {
            infoEl.textContent = `${formatViews(video.views)} views • ${video.length_min || ''} • Click any picture to enlarge`;
        }

        // "Watch Full Video" button
        const watchBtn = document.getElementById('galleryWatch');
        if (watchBtn) watchBtn.href = `video.html?id=${encodeURIComponent(videoId)}`;

        // Build the image list and render the grid
        _galleryImages = extractGalleryImages(video);
        if (!_galleryImages.length) {
            grid.innerHTML = '<div class="no-results"><p>No pictures available for this video.</p></div>';
            return;
        }

        grid.innerHTML = _galleryImages.map((url, i) => `
            <div class="gallery-item" onclick="openLightbox(${i})" role="button" tabindex="0"
                 aria-label="View image ${i + 1}" onkeydown="if(event.key==='Enter')openLightbox(${i})">
                <img src="${escapeHtml(url)}" alt="Gallery image ${i + 1} - ${escapeHtml(title)}"
                     loading="lazy" decoding="async" onerror="this.closest('.gallery-item').style.display='none'">
            </div>
        `).join('');

        setupLightboxEvents();
    } catch (error) {
        grid.innerHTML = '<div class="no-results"><p>⚠️ Error loading gallery.</p></div>';
    }
}

// ========== PAGE ROUTING ==========
/**
 * Detect which page we're on and run the right initializer.
 * (Runs in addition to main.js - this file is loaded after main.js)
 */
function initPicsFeatures() {
    const path = window.location.pathname.toLowerCase();
    try {
        if (path.includes('pornstars')) {
            initPornstarsPage();
        } else if (path.includes('gallery')) {
            initGalleryPage();
        } else if (path.includes('pics')) {
            initPicsPage();
        }
    } catch (error) {
        // Never block the rest of the site if something fails here
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPicsFeatures);
} else {
    initPicsFeatures();
}

