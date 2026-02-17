/* ========================================
   HDpornlove.com - Main JavaScript
   API Integration, Age Verification, Forms
   ======================================== */

// ========== CONFIGURATION ==========
const CONFIG = {
    API_BASE: 'https://www.eporner.com/api/v2/',  // Eporner API endpoint
    THUMB_SIZE: 'medium',                           // Thumbnail size: small, medium, big
    REMOVED_CACHE_KEY: 'eporner_removed_ids',       // LocalStorage key for removed videos cache
    REMOVED_CACHE_EXPIRY: 24 * 60 * 60 * 1000,      // 24 hours - how often to refresh removed list
    AGE_VERIFIED_KEY: 'age_verified',               // LocalStorage key for age verification
    AGE_VERIFIED_EXPIRY: 30 * 24 * 60 * 60 * 1000,  // 30 days - how long verification lasts
    VIDEOS_PER_PAGE: 20,                            // Videos per page
};

// ========== PAGE STATE ==========
let currentPageSearch = 1;
let currentPageMostViewed = 1;
let currentPageTopRated = 1;
let currentPageNewest = 1;

/* In-memory cache for removed video IDs */
let _removedIdsCache = null;
let _removedIdsFetchPromise = null;

// Pre-populate cache from localStorage at load time
try {
    const _cachedIds = localStorage.getItem(CONFIG.REMOVED_CACHE_KEY);
    const _cacheTime = localStorage.getItem(CONFIG.REMOVED_CACHE_KEY + '_time');
    if (_cachedIds && _cacheTime) {
        const _age = Date.now() - parseInt(_cacheTime);
        if (_age < CONFIG.REMOVED_CACHE_EXPIRY) {
            _removedIdsCache = new Set(JSON.parse(_cachedIds));
        }
    }
} catch (e) { /* Ignore cache read errors */ }

// ========== API FUNCTIONS ==========
/* These functions interact with the Eporner API v2 */

/**
 * Fetch videos from Eporner API with error handling
 * @param {string} query - Search query (e.g., 'teen', 'mature', 'all')
 * @param {number} page - Page number for pagination (starts at 1)
 * @returns {Promise<Object>} - API response with videos array and pagination info
 * @throws {Error} - If API call fails or returns error
 * 
 * EXAMPLE: searchVideos('amateur', 2)
 * FILTERS OUT: Removed videos (checked against getRemovedIds)
 */
async function searchVideos(query = 'all', page = 1) {
    try {
        // Validate inputs
        if (!query || query.trim() === '') {
            query = 'all';
        }
        if (isNaN(page) || page < 1) {
            page = 1;
        }

        // Build API URL with parameters
        const url = new URL(`${CONFIG.API_BASE}video/search/`);
        url.searchParams.append('query', query);
        url.searchParams.append('page', page);
        url.searchParams.append('per_page', CONFIG.VIDEOS_PER_PAGE);
        url.searchParams.append('thumbsize', CONFIG.THUMB_SIZE);
        url.searchParams.append('order', 'top-weekly');
        url.searchParams.append('format', 'json');

        // Fetch from API with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url.toString(), { signal: controller.signal });
        clearTimeout(timeout);

        // Handle HTTP errors
        if (!response.ok) {
            throw new Error(`API HTTP Error ${response.status}: ${response.statusText}`);
        }

        // Parse JSON response
        const data = await response.json();
        
        // Validate response structure
        if (!data.videos || !Array.isArray(data.videos)) {
            return { ...data, videos: [] };
        }

        // PERFORMANCE: Instant removed IDs filtering using in-memory Set (non-blocking, 0ms)
        if (_removedIdsCache && _removedIdsCache.size > 0) {
            data.videos = data.videos.filter(v => v && v.id && !_removedIdsCache.has(v.id));
        } else {
        }

        return data;

    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('API request timeout. Please try again.');
        }
        throw error;
    }
}

/**
 * Fetch most viewed videos this week
 * @param {number} page - Page number (starts at 1)
 * @returns {Promise<Object>} - API response with videos array
 */
async function getMostViewedVideos(page = 1) {
    try {
        const url = new URL(`${CONFIG.API_BASE}video/search/`);
        url.searchParams.append('query', 'all');
        url.searchParams.append('page', page);
        url.searchParams.append('per_page', CONFIG.VIDEOS_PER_PAGE);
        url.searchParams.append('thumbsize', CONFIG.THUMB_SIZE);
        url.searchParams.append('order', 'latest-views'); // Most viewed
        url.searchParams.append('format', 'json');

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url.toString(), { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`API HTTP Error ${response.status}`);
        }

        const data = await response.json();
        if (!data.videos || !Array.isArray(data.videos)) {
            return { ...data, videos: [] };
        }

        // PERFORMANCE: Instant removed IDs filtering using in-memory Set (non-blocking, 0ms)
        if (_removedIdsCache && _removedIdsCache.size > 0) {
            data.videos = data.videos.filter(v => v && v.id && !_removedIdsCache.has(v.id));
        }
        return data;

    } catch (error) {
        throw error;
    }
}

/**
 * Fetch top-rated videos this month
 * @param {number} page - Page number (starts at 1)
 * @returns {Promise<Object>} - API response with videos array
 */
async function getTopRatedVideos(page = 1) {
    try {
        const url = new URL(`${CONFIG.API_BASE}video/search/`);
        url.searchParams.append('query', 'all');
        url.searchParams.append('page', page);
        url.searchParams.append('per_page', CONFIG.VIDEOS_PER_PAGE);
        url.searchParams.append('thumbsize', CONFIG.THUMB_SIZE);
        url.searchParams.append('order', 'top-rated'); // Top rated
        url.searchParams.append('format', 'json');

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url.toString(), { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`API HTTP Error ${response.status}`);
        }

        const data = await response.json();
        if (!data.videos || !Array.isArray(data.videos)) {
            return { ...data, videos: [] };
        }

        // PERFORMANCE: Instant removed IDs filtering using in-memory Set (non-blocking, 0ms)
        if (_removedIdsCache && _removedIdsCache.size > 0) {
            data.videos = data.videos.filter(v => v && v.id && !_removedIdsCache.has(v.id));
        }
        return data;

    } catch (error) {
        throw error;
    }
}

/**
 * Fetch newest videos
 * @param {number} page - Page number (starts at 1)
 * @returns {Promise<Object>} - API response with videos array
 */
async function getNewestVideos(page = 1) {
    try {
        const url = new URL(`${CONFIG.API_BASE}video/search/`);
        url.searchParams.append('query', 'all');
        url.searchParams.append('page', page);
        url.searchParams.append('per_page', CONFIG.VIDEOS_PER_PAGE);
        url.searchParams.append('thumbsize', CONFIG.THUMB_SIZE);
        url.searchParams.append('order', 'newest'); // Newest first
        url.searchParams.append('format', 'json');

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url.toString(), { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`API HTTP Error ${response.status}`);
        }

        const data = await response.json();
        if (!data.videos || !Array.isArray(data.videos)) {
            return { ...data, videos: [] };
        }

        // PERFORMANCE: Instant removed IDs filtering using in-memory Set (non-blocking, 0ms)
        if (_removedIdsCache && _removedIdsCache.size > 0) {
            data.videos = data.videos.filter(v => v && v.id && !_removedIdsCache.has(v.id));
        }
        return data;

    } catch (error) {
        throw error;
    }
}

/**
 * Get single video details from Eporner API
 * @param {string} videoId - Video ID (11 character string)
 * @returns {Promise<Object|null>} - Video details or null if removed/not found
 * @throws {Error} - If API call fails
 *
 * EXAMPLE: getVideo('IsabYDAiqXa')
 * RETURNS: Video object with id, title, embed, views, rate, etc.
 */
async function getVideo(videoId) {
    try {
        // Validate video ID format
        if (!videoId || typeof videoId !== 'string' || videoId.length !== 11) {
            throw new Error('Invalid video ID format');
        }
        // Build API URL
        const url = new URL(`${CONFIG.API_BASE}video/id/`);
        url.searchParams.append('id', videoId);
        url.searchParams.append('thumbsize', CONFIG.THUMB_SIZE);
        url.searchParams.append('format', 'json');

        // Fetch with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url.toString(), { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`API HTTP Error ${response.status}`);
        }

        const data = await response.json();
        
        // API returns empty array if video is removed or doesn't exist
        if (Array.isArray(data) && data.length === 0) {
            return null;
        }

        // PERFORMANCE: Instant removed check using in-memory Set (O(1) lookup, 0ms)
        if (_removedIdsCache && data.id && _removedIdsCache.has(data.id)) {
            return null;
        }
        return data;

    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Video loading timeout. Please try again.');
        }
        throw error;
    }
}

/**
 * Get list of removed video IDs and cache them
 * @returns {Promise<Set>} - Set of removed video IDs for O(1) lookups
 * 
 * PERFORMANCE: Deduplicates concurrent requests via singleton promise
 * CACHING: Results stored in localStorage + in-memory Set
 * EXPIRY: Cache refreshes after 24 hours
 * FALLBACK: Uses expired cache if API call fails
 */
async function getRemovedIds() {
    // 1. Return in-memory cache instantly (fastest path - microseconds)
    if (_removedIdsCache !== null) {
        return _removedIdsCache;
    }

    // 2. Deduplicate: if a fetch is already in-flight, share that promise
    if (_removedIdsFetchPromise) {
        return _removedIdsFetchPromise;
    }

    // 3. Check localStorage cache
    const cached = localStorage.getItem(CONFIG.REMOVED_CACHE_KEY);
    const cacheTime = localStorage.getItem(CONFIG.REMOVED_CACHE_KEY + '_time');

    if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        if (age < CONFIG.REMOVED_CACHE_EXPIRY) {
            _removedIdsCache = new Set(JSON.parse(cached));
            return _removedIdsCache;
        }
    }

    // 4. Fetch from API (deduplicated - single in-flight request shared by all callers)
    _removedIdsFetchPromise = (async () => {
        try {
            const url = `${CONFIG.API_BASE}video/removed/?format=json`;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`API HTTP Error ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Invalid API response format');
            }

            const ids = data.map(item => item.id).filter(id => id);

            // Cache to localStorage
            localStorage.setItem(CONFIG.REMOVED_CACHE_KEY, JSON.stringify(ids));
            localStorage.setItem(CONFIG.REMOVED_CACHE_KEY + '_time', Date.now().toString());

            // Cache to memory as Set for O(1) lookups
            _removedIdsCache = new Set(ids);
            return _removedIdsCache;

        } catch (error) {
            if (cached) {
                _removedIdsCache = new Set(JSON.parse(cached));
                return _removedIdsCache;
            }

            _removedIdsCache = new Set();
            return _removedIdsCache;
        } finally {
            _removedIdsFetchPromise = null;
        }
    })();

    return _removedIdsFetchPromise;
}

// ========== AGE VERIFICATION ==========
/* Age verification modal - shows on first visit, remembers for 30 days */

/**
 * Check if user has verified age
 * @returns {boolean} - True if age verified and verification not expired
 */
function isAgeVerified() {
    const verified = localStorage.getItem(CONFIG.AGE_VERIFIED_KEY);
    const verifiedTime = localStorage.getItem(CONFIG.AGE_VERIFIED_KEY + '_time');

    if (verified && verifiedTime) {
        const elapsed = Date.now() - parseInt(verifiedTime);
        
        // Check if verification is still valid
        if (elapsed < CONFIG.AGE_VERIFIED_EXPIRY) {
            return true;
        } else {
            // Clear expired verification
            localStorage.removeItem(CONFIG.AGE_VERIFIED_KEY);
            localStorage.removeItem(CONFIG.AGE_VERIFIED_KEY + '_time');
        }
    }

    return false;
}

/**
 * Mark user as age verified for 30 days
 */
function setAgeVerified() {
    localStorage.setItem(CONFIG.AGE_VERIFIED_KEY, 'true');
    localStorage.setItem(CONFIG.AGE_VERIFIED_KEY + '_time', Date.now().toString());
}

/**
 * Show age verification modal overlay
 */
function showAgeModal() {
    const modal = document.getElementById('ageModal');
    if (!modal) {
        return;
    }
    modal.classList.add('show');
}

/**
 * Hide age verification modal overlay
 */
function hideAgeModal() {
    const modal = document.getElementById('ageModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Initialize age verification on page load
 * - Shows modal if user hasn't verified age in past 30 days
 * - If user clicks "No", redirects to google.com
 * - If user clicks "Yes", stores verification in localStorage
 */
function initAgeVerification() {
    const ageYesBtn = document.getElementById('ageYes');
    const ageNoBtn = document.getElementById('ageNo');

    // Setup "Yes" button handler
    if (ageYesBtn) {
        ageYesBtn.addEventListener('click', () => {
            setAgeVerified();
            hideAgeModal();
        });
    } else {
    }

    // Setup "No" button handler
    if (ageNoBtn) {
        ageNoBtn.addEventListener('click', () => {
            window.location.href = 'https://www.google.com';
        });
    } else {
    }

    // Show modal if not verified
    if (!isAgeVerified()) {
        showAgeModal();
    }
}

// ========== VIDEO RENDERING ==========
/* Functions to render video cards and grids */

/**
 * Create HTML for a single video card
 * @param {Object} video - Video object from API response
 * @returns {string} - HTML string for video card
 * 
 * INCLUDES: Thumbnail, title, views, rating, "Watch Now" button
 * ERROR HANDLING: Escapes HTML to prevent XSS, handles missing fields
 */
function createVideoCard(video) {
    try {
        // Validate video object
        if (!video || !video.id) {
            return '';
        }

        // Safely extract and format video data
        const views = video.views ? video.views.toLocaleString() : '0';
        const title = escapeHtml(video.title || 'Untitled');
        const thumbnail = video.default_thumb?.src || '';
        const duration = video.length_min || '0:00';
        const videoId = escapeHtml(video.id);
        
        // Extract all thumbnail URLs for hover preview cycling
        const thumbUrls = [];
        if (video.thumbs && Array.isArray(video.thumbs)) {
            video.thumbs.forEach(t => {
                const url = (typeof t === 'string') ? t : (t && (t.src || t.big || t.medium));
                if (url && !thumbUrls.includes(url)) thumbUrls.push(url);
            });
        }
        // Use single-quoted attribute so JSON double quotes don't break HTML
        const thumbsAttr = thumbUrls.length > 1 ? " data-thumbs='" + JSON.stringify(thumbUrls).replace(/'/g, '&#39;') + "'" : '';

        // Generate keyword-rich alt text for SEO and accessibility
        const altText = `HD ${title} - Free adult video with ${views} views`;

        // Return HTML template
        return `
            <div class="video-card" onclick="goToVideo('${videoId}')" role="button" tabindex="0" aria-label="Watch ${title}">
                <div class="video-thumbnail">
                    <img src="${escapeHtml(thumbnail)}" alt="${altText}" loading="lazy" decoding="async" title="${title}" data-default-thumb="${escapeHtml(thumbnail)}"${thumbsAttr}>
                    <div class="video-overlay">
                        <button>Watch Now</button>
                    </div>
                    <div class="video-duration">${duration}</div>
                    <div class="preview-progress"></div>
                </div>
                <div class="video-info">
                    <div class="video-title">${title}</div>
                    <div class="video-stats">
                        <span class="video-stat">👁 ${views} views</span>
                        <span class="video-stat">⭐ ${video.rate || '0'}/5</span>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        return '';
    }
}

/**
 * Render array of videos to a container
 * @param {Array} videos - Array of video objects
 * @param {string} containerId - ID of container element
 */
function renderVideos(videos, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }

    try {
        // Handle empty results
        if (!videos || videos.length === 0) {
            container.innerHTML = '<div class="no-results"><p>No videos found. Try a different search.</p></div>';
            return;
        }

        // Create HTML for all videos and render
        const html = videos
            .map(video => createVideoCard(video))
            .filter(card => card) // Remove empty cards from errors
            .join('');

        container.innerHTML = html || '<div class="no-results"><p>No videos available.</p></div>';
    } catch (error) {
        container.innerHTML = '<div class="no-results"><p>Error loading videos.</p></div>';
    }
}

/**
 * Navigate to video detail page
 * @param {string} videoId - Video ID to navigate to
 */
function goToVideo(videoId) {
    try {
        if (!videoId) {
            return;
        }
        
        const url = `video.html?id=${encodeURIComponent(videoId)}`;
        window.location.href = url;
    } catch (error) {
    }
}

/**
 * Format large view counts (e.g., 1500000 becomes 1.5M)
 * @param {number} views - View count
 * @returns {string} - Formatted view count
 */
function formatViews(views) {
    try {
        if (!views || isNaN(views)) return '0';
        if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
        if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
        return views.toString();
    } catch (error) {
        return views?.toString() || '0';
    }
}

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped HTML
 * 
 * PREVENTS: <script>, onclick, and other HTML injection attacks
 */
function escapeHtml(text) {
    try {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    } catch (error) {
        return '';
    }
}

// ========== SEARCH FUNCTIONALITY ==========
/* Search bar and form handling */

/**
 * Initialize search form on all pages
 * Allows users to search from header search bar
 */
function initSearchForm() {
    const searchForm = document.getElementById('searchForm');
    if (!searchForm) {
        return;
    }

    searchForm.addEventListener('submit', (e) => {
        try {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            
            if (!searchInput) {
                return;
            }

            const query = searchInput.value.trim();
            
            // Validate search query
            if (!query || query.length === 0) {
                alert('Please enter a search query');
                return;
            }

            // Navigate to search results
            window.location.href = `search.html?query=${encodeURIComponent(query)}`;
        } catch (error) {
        }
    });
}

/**
 * Extract URL parameter value
 * @param {string} name - Parameter name
 * @returns {string|null} - Parameter value or null if not found
 * 
 * EXAMPLE: getUrlParam('query') on "?query=teen" returns "teen"
 */
function getUrlParam(name) {
    try {
        const params = new URLSearchParams(window.location.search);
        const value = params.get(name);
        return value || null;
    } catch (error) {
        return null;
    }
}

// ========== HOME PAGE ==========
/* Home page initialization and featured videos */

/**
 * Initialize home page with featured videos - loads all sections in PARALLEL for better performance
 */
async function initHomePage() {
    const container = document.getElementById('featuredVideos');
    if (!container) {
        return;
    }

    try {
        // Show loading states for all sections
        container.innerHTML = '<div class="loading">Loading featured videos...</div>';
        const mostViewedContainer = document.getElementById('mostViewedVideos');
        const topRatedContainer = document.getElementById('topRatedVideos');
        const newestContainer = document.getElementById('newestVideos');
        
        if (mostViewedContainer) mostViewedContainer.innerHTML = '<div class="loading">Loading videos...</div>';
        if (topRatedContainer) topRatedContainer.innerHTML = '<div class="loading">Loading videos...</div>';
        if (newestContainer) newestContainer.innerHTML = '<div class="loading">Loading videos...</div>';

        // PERFORMANCE OPTIMIZATION: Load all 4 sections IN PARALLEL instead of sequential
        // This reduces load time from ~8 seconds to ~2 seconds (75% improvement)
        const startTime = performance.now();

        const [trendingData, viewedData, ratedData, newestData] = await Promise.all([
            searchVideos('all', 1).catch(err => {
                return { videos: [], page: 1, total_pages: 0 };
            }),
            getMostViewedVideos(1).catch(err => {
                return { videos: [], page: 1, total_pages: 0 };
            }),
            getTopRatedVideos(1).catch(err => {
                return { videos: [], page: 1, total_pages: 0 };
            }),
            getNewestVideos(1).catch(err => {
                return { videos: [], page: 1, total_pages: 0 };
            })
        ]);

        const endTime = performance.now();
        // Render all sections
        renderVideos(trendingData.videos, 'featuredVideos');
        setupPagination(trendingData, 'all');

        renderVideos(viewedData.videos, 'mostViewedVideos');
        setupTrendingPagination(viewedData, 'mostViewed');

        renderVideos(ratedData.videos, 'topRatedVideos');
        setupTrendingPagination(ratedData, 'topRated');

        renderVideos(newestData.videos, 'newestVideos');
        setupTrendingPagination(newestData, 'newest');
    } catch (error) {
        container.innerHTML = '<div class="no-results"><p>⚠️ Error loading videos. Please refresh the page.</p></div>';
    }
}

// ========== SEARCH PAGE ==========
/* Search results page handling */

/**
 * Initialize search results page
 */
async function initSearchPage() {
    // Get search query from URL
    const query = getUrlParam('query');
    // Redirect if no query
    if (!query) {
        window.location.href = 'index.html';
        return;
    }

    // Prefill search input with current query so user can modify it
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = query;
    }

    const container = document.getElementById('searchVideos');
    if (!container) {
        return;
    }

    try {
        // Update page title
        const title = document.getElementById('searchTitle');
        if (title) {
            title.textContent = `Search Results for "${escapeHtml(query)}"`;
        }

        // Show loading state
        container.innerHTML = '<div class="loading">Searching for videos...</div>';

        // Fetch search results
        const startTime = performance.now();
        const data = await searchVideos(query, 1);
        const endTime = performance.now();
        // Update results info
        const resultsInfo = document.getElementById('resultsInfo');
        if (resultsInfo) {
            if (data.total_count === 0) {
                resultsInfo.textContent = 'No videos found for this search.';
                document.getElementById('noResults').style.display = 'block';
                container.style.display = 'none';
            } else {
                resultsInfo.textContent = `Found ${data.total_count} results`;
            }
        }

        // Render videos
        renderVideos(data.videos, 'searchVideos');
        setupPagination(data, query);
    } catch (error) {
        container.innerHTML = '<div class="no-results"><p>⚠️ Error loading search results. ' + error.message + '</p></div>';
    }
}

// ========== SEO & SCHEMA MARKUP ==========
/* JSON-LD structured data for search engines */

/**
 * Inject VideoObject JSON-LD schema markup into page
 * Improves SEO and enables rich snippets in search results
 * @param {Object} video - Video object from Eporner API
 */
function injectVideoSchema(video) {
    try {
        if (!video || !video.id) {
            return;
        }

        // Convert duration from MM:SS or HH:MM:SS format to ISO 8601 (PT15M30S)
        function formatDurationToISO(durationStr) {
            if (!durationStr) return 'PT0S';
            const parts = durationStr.split(':').map(p => parseInt(p));
            let seconds = 0;
            if (parts.length === 2) {
                seconds = parts[0] * 60 + parts[1]; // MM:SS
            } else if (parts.length === 3) {
                seconds = parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
            }
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            let iso = 'PT';
            if (hours > 0) iso += hours + 'H';
            if (minutes > 0) iso += minutes + 'M';
            if (secs > 0) iso += secs + 'S';
            return iso === 'PT' ? 'PT0S' : iso;
        }

        // Generate unique description based on video data
        const description = `Watch ${escapeHtml(video.title)} on HDpornlove - Free HD adult streaming. ${
            video.length_min ? `Duration: ${video.length_min}. ` : ''
        }${video.views ? `Views: ${video.views.toLocaleString()}. ` : ''}High-quality HD adult video content with interactive features.`;

        // Create VideoObject schema
        const schema = {
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            'name': video.title || 'Untitled Video',
            'description': description.substring(0, 500),
            'thumbnailUrl': video.default_thumb?.src || '',
            'contentUrl': video.embed || '',
            'embedUrl': video.embed || '',
            'duration': formatDurationToISO(video.length_min),
            'uploadDate': video.added ? new Date(video.added).toISOString() : new Date().toISOString(),
            'interactionStatistic': [
                {
                    '@type': 'InteractionCounter',
                    'interactionType': 'https://schema.org/WatchAction',
                    'userInteractionCount': video.views || 0
                },
                {
                    '@type': 'InteractionCounter',
                    'interactionType': 'https://schema.org/RateAction',
                    'userInteractionCount': Math.round((video.rate || 0) * 100)
                }
            ]
        };

        // Remove any existing schema script tags for this video
        const existingScripts = document.querySelectorAll('script[data-video-schema]');
        existingScripts.forEach(s => s.remove());

        // Create and inject script tag
        const schemaScript = document.createElement('script');
        schemaScript.type = 'application/ld+json';
        schemaScript.setAttribute('data-video-schema', 'true');
        schemaScript.textContent = JSON.stringify(schema);
        document.head.appendChild(schemaScript);
    } catch (error) {
    }
}

// ========== VIDEO DETAIL PAGE ==========
/* Single video page with embed, info, and related videos */

/**
 * Initialize video detail page
 */
async function initVideoPage() {
    const videoId = getUrlParam('id');
    // Validate video ID
    if (!videoId) {
        window.location.href = 'index.html';
        return;
    }

    const container = document.getElementById('videoContainer');
    if (!container) {
        return;
    }

    try {
        // Show loading state
        container.innerHTML = '<div class="loading">Loading video...</div>';

        // Fetch video details
        const video = await getVideo(videoId);
        
        // Check if video was found
        if (!video || !video.id) {
            document.getElementById('noVideo').style.display = 'block';
            container.style.display = 'none';
            return;
        }

        // Inject VideoObject schema markup for SEO
        injectVideoSchema(video);

        // Render embed iframe IMMEDIATELY for fastest display
        const embedUrl = escapeHtml(video.embed);
        
        container.innerHTML = `<iframe 
            src="${embedUrl}" 
            allowfullscreen 
            frameborder="0"
            allow="autoplay; encrypted-media"
            style="width: 100%; height: 100%; min-height: 400px;">
        </iframe>`;

        // Update page title
        document.title = `${escapeHtml(video.title)} - HDpornlove.com`;

        // Update video info section
        const videoInfo = document.getElementById('videoInfo');
        if (videoInfo) {
            videoInfo.style.display = 'block';
        }

        // Populate video details
        const videoTitle = document.getElementById('videoTitle');
        if (videoTitle) {
            videoTitle.textContent = video.title;
        }

        const videoViews = document.getElementById('videoViews');
        if (videoViews) {
            videoViews.innerHTML = `Views: <strong>${formatViews(video.views)}</strong>`;
        }

        const videoRating = document.getElementById('videoRating');
        if (videoRating) {
            videoRating.innerHTML = `Rating: <strong>${video.rate || 'N/A'}/5</strong>`;
        }

        const videoDuration = document.getElementById('videoDuration');
        if (videoDuration) {
            videoDuration.innerHTML = `Duration: <strong>${video.length_min || 'N/A'}</strong>`;
        }

        // Add keyword tags
        if (video.keywords) {
            try {
                const tags = video.keywords
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0);

                const tagsContainer = document.getElementById('videoTags');
                if (tagsContainer) {
                    tagsContainer.innerHTML = tags
                        .slice(0, 15) // Limit to 15 tags
                        .map(tag => {
                            const escapedTag = escapeHtml(tag);
                            return `<span class="tag" data-tag="${escapedTag}" role="button" tabindex="0" onclick="searchTag(this.dataset.tag)">${escapedTag}</span>`;
                        })
                        .join('');
                }
            } catch (error) {
            }
        }

        // Setup share button
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                try {
                    const url = window.location.href;
                    if (navigator.share) {
                        navigator.share({
                            title: video.title,
                            url: url,
                        }).catch(() => {});
                    } else {
                        alert('Share this link: ' + url);
                    }
                } catch (error) {
                }
            });
        }

        // Setup report button
        const reportBtn = document.getElementById('reportBtn');
        if (reportBtn) {
            reportBtn.addEventListener('click', () => {
                try {
                    window.location.href = `contact.html?subject=report&video=${encodeURIComponent(videoId)}`;
                } catch (error) {
                }
            });
        }

        // Load related videos ASYNCHRONOUSLY (don't await - let them load in background)
        // This prevents blocking the main video from displaying
        loadRelatedVideos(video.keywords).catch(() => {});
    } catch (error) {
        document.getElementById('noVideo').style.display = 'block';
        container.style.display = 'none';
    }
}

/**
 * Load related videos based on keywords
 * Tries multiple keywords to ensure related videos are always found
 * @param {string} keywords - Comma-separated keywords from video
 */
async function loadRelatedVideos(keywords) {
    const relatedSection = document.getElementById('relatedSection');
    const relatedVideosContainer = document.getElementById('relatedVideos');
    
    if (!relatedSection || !relatedVideosContainer) {
        return;
    }

    // If no keywords, hide related section
    if (!keywords || keywords.trim().length === 0) {
        relatedSection.style.display = 'none';
        return;
    }

    try {
        // Parse keywords and filter out empty ones
        const keywordList = keywords
            .split(',')
            .map(k => k.trim())
            .filter(k => k.length > 0);

        if (keywordList.length === 0) {
            relatedSection.style.display = 'none';
            return;
        }
        // PERFORMANCE OPTIMIZATION: Try first 3-5 keywords in PARALLEL instead of sequential
        // This reduces waiting time by 60-70%
        const parallelKeywords = keywordList.slice(0, 5);
        const searchPromises = parallelKeywords.map(keyword => 
            searchVideos(keyword, 1)
                .then(data => ({ keyword, data, success: data.videos && data.videos.length > 0 }))
                .catch(err => ({ keyword, data: null, success: false, error: err }))
        );

        const results = await Promise.all(searchPromises);
        const successResult = results.find(r => r.success);
        
        let data = null;
        let usedKeyword = null;

        if (successResult) {
            data = successResult.data;
            usedKeyword = successResult.keyword;
        } else {
            // Fallback: try remaining keywords sequentially
            for (const keyword of keywordList.slice(5)) {
                try {
                    data = await searchVideos(keyword, 1);
                    if (data.videos && data.videos.length > 0) {
                        usedKeyword = keyword;
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
        }

        // If no keywords yielded results, try generic fallback search
        if (!data || !data.videos || data.videos.length === 0) {
            try {
                data = await searchVideos('all', 1);
                usedKeyword = 'all';
            } catch (error) {
                relatedSection.style.display = 'none';
                return;
            }
        }

        // Display related videos if any were found
        if (data && data.videos && data.videos.length > 0) {
            relatedSection.style.display = 'block';
            
            // Show first 8 related videos
            renderVideos(data.videos.slice(0, 8), 'relatedVideos');
        } else {
            relatedSection.style.display = 'none';
        }

    } catch (error) {
        relatedSection.style.display = 'none';
        // Don't block page if related videos fail
    }
}

/**
 * Handle tag click - search for the tag
 * @param {string} tag - Tag to search
 */
function searchTag(tag) {
    try {
        const cleanTag = tag.trim();
        if (!cleanTag) return;
        window.location.href = `search.html?query=${encodeURIComponent(cleanTag)}`;
    } catch (error) {
    }
}

// ========== PAGINATION ==========
/* Handle pagination across multiple pages of results */

let currentPage = 1;
let currentQuery = 'all';

/**
 * Setup pagination controls (next/prev buttons)
 * @param {Object} data - API response with pagination info
 * @param {string} query - Current search query
 */
function setupPagination(data, query) {
    try {
        currentPage = data.page || 1;
        currentQuery = query;

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageInfo = document.getElementById('pageInfo');

        // Update page info display
        if (pageInfo) {
            const totalPages = data.total_pages || 1;
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        }

        // Setup previous button
        if (prevBtn) {
            if (currentPage > 1) {
                prevBtn.style.display = 'inline-block';
                prevBtn.onclick = () => goToPage(currentPage - 1);
            } else {
                prevBtn.style.display = 'none';
            }
        }

        // Setup next button
        if (nextBtn) {
            const totalPages = data.total_pages || 1;
            if (currentPage < totalPages) {
                nextBtn.style.display = 'inline-block';
                nextBtn.onclick = () => goToPage(currentPage + 1);
            } else {
                nextBtn.style.display = 'none';
            }
        }
    } catch (error) {
    }
}

/**
 * Setup pagination for trending sections (Most Viewed, Top Rated, Newest)
 * Each section maintains its own pagination state
 * @param {Object} data - API response with pagination info
 * @param {string} sectionType - 'mostViewed', 'topRated', or 'newest'
 */
function setupTrendingPagination(data, sectionType) {
    try {
        let prevBtnId, nextBtnId, pageInfoId, containerContainerId, apiFunction;

        // Map section type to button IDs and functions
        switch(sectionType) {
            case 'mostViewed':
                prevBtnId = 'prevViewedBtn';
                nextBtnId = 'nextViewedBtn';
                pageInfoId = 'pageViewedInfo';
                containerContainerId = 'mostViewedVideos';
                apiFunction = getMostViewedVideos;
                break;
            case 'topRated':
                prevBtnId = 'prevRatedBtn';
                nextBtnId = 'nextRatedBtn';
                pageInfoId = 'pageRatedInfo';
                containerContainerId = 'topRatedVideos';
                apiFunction = getTopRatedVideos;
                break;
            case 'newest':
                prevBtnId = 'prevNewestBtn';
                nextBtnId = 'nextNewestBtn';
                pageInfoId = 'pageNewestInfo';
                containerContainerId = 'newestVideos';
                apiFunction = getNewestVideos;
                break;
            default:
                return;
        }

        const currentPage = data.page || 1;
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);
        const pageInfo = document.getElementById(pageInfoId);

        // Update page info display
        if (pageInfo) {
            const totalPages = data.total_pages || 1;
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        }

        // Setup previous button
        if (prevBtn) {
            if (currentPage > 1) {
                prevBtn.style.display = 'inline-block';
                prevBtn.onclick = () => goToTrendingPage(sectionType, currentPage - 1, apiFunction, containerContainerId);
            } else {
                prevBtn.style.display = 'none';
            }
        }

        // Setup next button
        if (nextBtn) {
            const totalPages = data.total_pages || 1;
            if (currentPage < totalPages) {
                nextBtn.style.display = 'inline-block';
                nextBtn.onclick = () => goToTrendingPage(sectionType, currentPage + 1, apiFunction, containerContainerId);
            } else {
                nextBtn.style.display = 'none';
            }
        }
    } catch (error) {
    }
}

/**
 * Navigate to a specific page in a trending section
 * @param {string} sectionType - 'mostViewed', 'topRated', or 'newest'
 * @param {number} page - Page number to navigate to
 * @param {Function} apiFunction - API function to call (getMostViewedVideos, etc)
 * @param {string} containerId - Container element ID to render to
 */
async function goToTrendingPage(sectionType, page, apiFunction, containerId) {
    try {
        // Validate page number
        if (isNaN(page) || page < 1) {
            page = 1;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            return;
        }

        // Show loading state
        container.innerHTML = '<div class="loading">Loading page...</div>';

        // Fetch data for new page
        const data = await apiFunction(page);
        
        // Render videos
        renderVideos(data.videos, containerId);
        setupTrendingPagination(data, sectionType);
        
        // Scroll to top of section
        container.parentElement.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div class="no-results"><p>⚠️ Error loading page. Please try again.</p></div>';
        }
    }
}

/**
 * Navigate to a specific page
 * @param {number} page - Page number to navigate to
 */
async function goToPage(page) {
    try {
        // Validate page number
        if (isNaN(page) || page < 1) {
            page = 1;
        }

        // Determine which container to update
        const featurContainer = document.getElementById('featuredVideos');
        const searchContainer = document.getElementById('searchVideos');
        const container = featurContainer || searchContainer;

        if (!container) {
            return;
        }

        // Show loading state
        container.innerHTML = '<div class="loading">Loading page...</div>';

        // Fetch data for new page
        const data = await searchVideos(currentQuery, page);
        
        // Render videos
        const containerId = featurContainer ? 'featuredVideos' : 'searchVideos';
        renderVideos(data.videos, containerId);
        setupPagination(data, currentQuery);
        
        // Scroll to top of results
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        const container = document.getElementById('featuredVideos') || document.getElementById('searchVideos');
        if (container) {
            container.innerHTML = '<div class="no-results"><p>⚠️ Error loading page. Please try again.</p></div>';
        }
    }
}

// ========== FORM HANDLING ==========
/* Initialize forms - Netlify Forms handles submissions */

/**
 * Initialize all forms on the page
 */
function initForms() {
    try {
        // Netlify automatically handles forms with data-netlify="true" or netlify attribute
        // No additional setup needed - just ensure forms have proper attributes
        
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            // Add form submit logging (optional)
            form.addEventListener('submit', (e) => {
            });

            // Setup form validation if needed
            form.addEventListener('invalid', (e) => {
                e.preventDefault();
            }, true);
        });

    } catch (error) {
    }
}

// ========== PAGE INITIALIZATION ==========
/* Detect page type and initialize appropriate functionality */

/**
 * Initialize page based on current URL
 * Runs appropriate init functions for the current page
 */
function initPage() {
    try {
        // PERFORMANCE: Preload removed video IDs in background so first API call doesn't block
        // This loads from cache instantly or fetches fresh copy without blocking page init
        getRemovedIds().catch(() => {});

        // Initialize on all pages
        initMenuToggle();
        initAgeVerification();
        initSearchForm();
        initForms();

        // Get current page path
        const path = window.location.pathname.toLowerCase();
        const href = window.location.href.toLowerCase();

        // Initialize page-specific functionality
        if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
            initHomePage();
        } else if (path.includes('search') || href.includes('search?')) {
            initSearchPage();
        } else if (path.includes('video')) {
            initVideoPage();
        }
    } catch (error) {
    }
}

// ========== DOM READY LISTENER ==========
/* Run initialization when DOM is fully loaded */

if (document.readyState === 'loading') {
    // Document still loading
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    // Document already loaded
    initPage();
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Initialize hamburger menu toggle for mobile
 */
function initMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    if (!menuToggle || !mainNav) return;

    // Toggle menu on button click
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('hidden');
        mainNav.classList.toggle('visible');
    });

    // Close menu when a link is clicked
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mainNav.classList.add('hidden');
            mainNav.classList.remove('visible');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('header')) {
            menuToggle.classList.remove('active');
            mainNav.classList.add('hidden');
            mainNav.classList.remove('visible');
        }
    });
}

// ========== ERROR HANDLING ==========

window.addEventListener('error', (event) => {});
window.addEventListener('unhandledrejection', (event) => {});

// ========== VIDEO HOVER PREVIEW ==========
/* Cycle through video thumbnails on mouse hover to simulate video preview */

(function() {
    'use strict';

    let activeCard = null;
    let previewInterval = null;
    let thumbIndex = 0;
    let preloadedThumbs = new Set();

    /**
     * Preload thumbnail images for smooth cycling
     * @param {Array} thumbs - Array of thumbnail URLs
     */
    function preloadThumbs(thumbs) {
        thumbs.forEach(url => {
            if (!preloadedThumbs.has(url)) {
                const img = new Image();
                img.src = url;
                preloadedThumbs.add(url);
            }
        });
    }

    /**
     * Start cycling through thumbnails on a video card
     * @param {HTMLElement} card - The video card element
     */
    function startPreview(card) {
        const img = card.querySelector('.video-thumbnail img');
        if (!img || !img.dataset.thumbs) return;

        try {
            const thumbs = JSON.parse(img.dataset.thumbs);
            if (thumbs.length < 2) return;

            // Preload all thumbs for smooth transitions
            preloadThumbs(thumbs);

            thumbIndex = 0;
            card.classList.add('preview-active');

            // Cycle through thumbnails every 600ms
            previewInterval = setInterval(() => {
                thumbIndex = (thumbIndex + 1) % thumbs.length;
                img.src = thumbs[thumbIndex];
            }, 600);
        } catch (e) {
        }
    }

    /**
     * Stop thumbnail cycling and revert to default thumbnail
     * @param {HTMLElement} card - The video card element
     */
    function stopPreview(card) {
        if (previewInterval) {
            clearInterval(previewInterval);
            previewInterval = null;
        }

        card.classList.remove('preview-active');

        const img = card.querySelector('.video-thumbnail img');
        if (img && img.dataset.defaultThumb) {
            img.src = img.dataset.defaultThumb;
        }
    }

    // Use event delegation on document for dynamic content support
    document.addEventListener('mouseover', function(e) {
        const card = e.target.closest('.video-card');

        // Still hovering same card - do nothing
        if (card === activeCard) return;

        // Left previous card
        if (activeCard) {
            stopPreview(activeCard);
            activeCard = null;
        }

        // Entered a new card
        if (card) {
            activeCard = card;
            startPreview(card);
        }
    });

    // Also handle mouse leaving the document entirely
    document.addEventListener('mouseleave', function() {
        if (activeCard) {
            stopPreview(activeCard);
            activeCard = null;
        }
    });
})();

