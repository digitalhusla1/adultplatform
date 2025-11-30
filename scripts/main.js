/* ========================================
   HDpornlove.com - Main JavaScript
   API Integration, Age Verification, Forms
   ======================================== */

/* CUSTOMIZATION GUIDE:
   1. API_BASE: Change if using a different Eporner API endpoint
   2. VIDEOS_PER_PAGE: Adjust pagination size (1-1000)
   3. THUMB_SIZE: Change to 'small' or 'big' for different thumbnail sizes
   4. AGE_VERIFIED_EXPIRY: Change time in milliseconds for age verification duration
   5. REMOVED_CACHE_EXPIRY: Change how often to refresh removed videos list
*/

// ========== CONFIGURATION ==========
/* Central configuration object - EDIT THESE SETTINGS */
const CONFIG = {
    API_BASE: 'https://www.eporner.com/api/v2/',  // Eporner API endpoint
    THUMB_SIZE: 'medium',                           // Thumbnail size: small, medium, big
    REMOVED_CACHE_KEY: 'eporner_removed_ids',       // LocalStorage key for removed videos cache
    REMOVED_CACHE_EXPIRY: 24 * 60 * 60 * 1000,      // 24 hours - how often to refresh removed list
    AGE_VERIFIED_KEY: 'age_verified',               // LocalStorage key for age verification
    AGE_VERIFIED_EXPIRY: 30 * 24 * 60 * 60 * 1000,  // 30 days - how long verification lasts (was 24 hours)
    VIDEOS_PER_PAGE: 24,                            // Number of videos per page (1-1000) - increased for better UX
};

// ========== PAGE STATE ==========
/* Track pagination state for each section */
let currentPageSearch = 1;
let currentPageMostViewed = 1;
let currentPageTopRated = 1;
let currentPageNewest = 1;

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
            console.warn('Unexpected API response structure:', data);
            return { ...data, videos: [] };
        }

        // Filter out removed videos
        const removedIds = await getRemovedIds();
        data.videos = data.videos.filter(v => v && v.id && !removedIds.includes(v.id));

        console.log(`Search "${query}" page ${page}: ${data.videos.length} videos found`);
        return data;

    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('searchVideos Timeout: API request took too long');
            throw new Error('API request timeout. Please try again.');
        }
        console.error('searchVideos Error:', error.message);
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

        const removedIds = await getRemovedIds();
        data.videos = data.videos.filter(v => v && v.id && !removedIds.includes(v.id));

        console.log(`Most viewed page ${page}: ${data.videos.length} videos found`);
        return data;

    } catch (error) {
        console.error('getMostViewedVideos Error:', error.message);
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

        const removedIds = await getRemovedIds();
        data.videos = data.videos.filter(v => v && v.id && !removedIds.includes(v.id));

        console.log(`Top rated page ${page}: ${data.videos.length} videos found`);
        return data;

    } catch (error) {
        console.error('getTopRatedVideos Error:', error.message);
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

        const removedIds = await getRemovedIds();
        data.videos = data.videos.filter(v => v && v.id && !removedIds.includes(v.id));

        console.log(`Newest videos page ${page}: ${data.videos.length} videos found`);
        return data;

    } catch (error) {
        console.error('getNewestVideos Error:', error.message);
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
            console.warn(`Video ${videoId} not found or removed`);
            return null;
        }

        // Check if video is in removed list
        const removedIds = await getRemovedIds();
        if (data.id && removedIds.includes(data.id)) {
            console.warn(`Video ${videoId} is in removed list`);
            return null;
        }

        return data;

    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('getVideo Timeout: API request took too long');
            throw new Error('Video loading timeout. Please try again.');
        }
        console.error('getVideo Error:', error.message);
        throw error;
    }
}

/**
 * Get list of removed video IDs and cache them for 24 hours
 * @returns {Promise<Array>} - Array of removed video IDs
 * 
 * CACHING: Results stored in localStorage to avoid repeated API calls
 * EXPIRY: Cache refreshes after 24 hours
 * FALLBACK: Uses expired cache if API call fails
 */
async function getRemovedIds() {
    const cached = localStorage.getItem(CONFIG.REMOVED_CACHE_KEY);
    const cacheTime = localStorage.getItem(CONFIG.REMOVED_CACHE_KEY + '_time');

    // Return cached data if still valid (within 24 hours)
    if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        if (age < CONFIG.REMOVED_CACHE_EXPIRY) {
            console.log(`Using cached removed IDs (${Math.round(age / 60000)} minutes old)`);
            return JSON.parse(cached);
        }
    }

    try {
        console.log('Fetching fresh removed video IDs from API...');
        const url = `${CONFIG.API_BASE}video/removed/?format=json`;
        
        // Fetch with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`API HTTP Error ${response.status}`);
        }

        const data = await response.json();
        
        // Validate response
        if (!Array.isArray(data)) {
            throw new Error('Invalid API response format');
        }

        const ids = data.map(item => item.id).filter(id => id); // Filter out null/undefined
        
        // Cache the results
        localStorage.setItem(CONFIG.REMOVED_CACHE_KEY, JSON.stringify(ids));
        localStorage.setItem(CONFIG.REMOVED_CACHE_KEY + '_time', Date.now().toString());

        console.log(`Cached ${ids.length} removed video IDs`);
        return ids;

    } catch (error) {
        console.warn('getRemovedIds Error, using fallback cache:', error.message);
        
        // Fallback to expired cache if available
        if (cached) {
            console.log('Using expired cache as fallback');
            return JSON.parse(cached);
        }
        
        // If no cache available, return empty array (don't filter any videos)
        console.warn('No cache available, returning empty removed list');
        return [];
    }
}

// ========== AGE VERIFICATION ==========
/* Age verification modal - shows on first visit, remembers for 24 hours */

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
            console.log('Age verification expired');
            localStorage.removeItem(CONFIG.AGE_VERIFIED_KEY);
            localStorage.removeItem(CONFIG.AGE_VERIFIED_KEY + '_time');
        }
    }

    return false;
}

/**
 * Mark user as age verified for 24 hours
 */
function setAgeVerified() {
    localStorage.setItem(CONFIG.AGE_VERIFIED_KEY, 'true');
    localStorage.setItem(CONFIG.AGE_VERIFIED_KEY + '_time', Date.now().toString());
    console.log('Age verification set - valid for 24 hours');
}

/**
 * Show age verification modal overlay
 */
function showAgeModal() {
    const modal = document.getElementById('ageModal');
    if (!modal) {
        console.error('Age modal element not found');
        return;
    }
    modal.classList.add('show');
    console.log('Age verification modal shown');
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
 * - Shows modal if user hasn't verified age in past 24 hours
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
            console.log('User verified age');
        });
    } else {
        console.warn('Age "Yes" button not found');
    }

    // Setup "No" button handler
    if (ageNoBtn) {
        ageNoBtn.addEventListener('click', () => {
            console.log('User declined age verification - redirecting');
            window.location.href = 'https://www.google.com';
        });
    } else {
        console.warn('Age "No" button not found');
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
            console.warn('Invalid video object:', video);
            return '';
        }

        // Safely extract and format video data
        const views = video.views ? video.views.toLocaleString() : '0';
        const title = escapeHtml(video.title || 'Untitled');
        const thumbnail = video.default_thumb?.src || '';
        const duration = video.length_min || '0:00';
        const videoId = escapeHtml(video.id);

        // Return HTML template
        return `
            <div class="video-card" onclick="goToVideo('${videoId}')" role="button" tabindex="0" aria-label="Watch ${title}">
                <div class="video-thumbnail">
                    <img src="${escapeHtml(thumbnail)}" alt="${title}" loading="lazy">
                    <div class="video-overlay">
                        <button>Watch Now</button>
                    </div>
                    <div class="video-duration">${duration}</div>
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
        console.error('Error creating video card:', error);
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
        console.error(`Container "${containerId}" not found`);
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
        console.log(`Rendered ${videos.length} videos`);

    } catch (error) {
        console.error('renderVideos Error:', error);
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
            console.error('Invalid video ID');
            return;
        }
        window.location.href = `video.html?id=${encodeURIComponent(videoId)}`;
    } catch (error) {
        console.error('goToVideo Error:', error);
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
        console.error('formatViews Error:', error);
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
        console.error('escapeHtml Error:', error);
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
        console.warn('Search form not found on this page');
        return;
    }

    searchForm.addEventListener('submit', (e) => {
        try {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            
            if (!searchInput) {
                console.error('Search input not found');
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
            console.error('Search form error:', error);
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
        return value ? decodeURIComponent(value) : null;
    } catch (error) {
        console.error('getUrlParam Error:', error);
        return null;
    }
}

// ========== HOME PAGE ==========
/* Home page initialization and featured videos */

/**
 * Initialize home page with featured videos
 */
async function initHomePage() {
    const container = document.getElementById('featuredVideos');
    if (!container) {
        console.log('Not on home page');
        return;
    }

    try {
        // Show loading state
        container.innerHTML = '<div class="loading">Loading featured videos...</div>';

        // Fetch top-weekly videos
        const data = await searchVideos('all', 1);
        
        // Render videos
        renderVideos(data.videos, 'featuredVideos');

        // Setup pagination
        setupPagination(data, 'all');

        console.log('Home page initialized successfully');

    } catch (error) {
        container.innerHTML = '<div class="no-results"><p>⚠️ Error loading videos. Please refresh the page.</p></div>';
        console.error('Home page error:', error);
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
        console.warn('No search query provided');
        window.location.href = 'index.html';
        return;
    }

    const container = document.getElementById('searchVideos');
    if (!container) {
        console.log('Not on search page');
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
        const data = await searchVideos(query, 1);
        
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

        console.log(`Search page initialized for query: ${query}`);

    } catch (error) {
        container.innerHTML = '<div class="no-results"><p>⚠️ Error loading search results. Please try again.</p></div>';
        console.error('Search page error:', error);
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
        console.warn('No video ID provided');
        window.location.href = 'index.html';
        return;
    }

    const container = document.getElementById('videoContainer');
    if (!container) {
        console.log('Not on video page');
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
            console.warn(`Video ${videoId} not found or removed`);
            return;
        }

        // Render embed iframe
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
                            return `<span class="tag" onclick="searchTag('${escapedTag}')" role="button" tabindex="0">${escapedTag}</span>`;
                        })
                        .join('');
                }
            } catch (error) {
                console.error('Error processing tags:', error);
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
                        }).catch(err => console.log('Share cancelled:', err));
                    } else {
                        alert('Share this link: ' + url);
                    }
                } catch (error) {
                    console.error('Share error:', error);
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
                    console.error('Report error:', error);
                }
            });
        }

        // Load related videos
        await loadRelatedVideos(video.keywords);

        console.log(`Video page loaded: ${videoId}`);

    } catch (error) {
        document.getElementById('noVideo').style.display = 'block';
        container.style.display = 'none';
        console.error('Video page error:', error);
    }
}

/**
 * Load related videos based on keywords
 * @param {string} keywords - Comma-separated keywords from video
 */
async function loadRelatedVideos(keywords) {
    if (!keywords) {
        console.log('No keywords for related videos');
        return;
    }

    try {
        // Use first keyword as search term
        const firstKeyword = keywords.split(',')[0].trim();
        if (!firstKeyword) return;

        const data = await searchVideos(firstKeyword, 1);

        if (data.videos && data.videos.length > 0) {
            const relatedSection = document.getElementById('relatedSection');
            if (relatedSection) {
                relatedSection.style.display = 'block';
            }

            // Show first 8 related videos
            renderVideos(data.videos.slice(0, 8), 'relatedVideos');
            console.log('Related videos loaded');
        }
    } catch (error) {
        console.error('Related videos error:', error);
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
        console.error('Tag search error:', error);
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

        console.log(`Pagination set: page ${currentPage}`);

    } catch (error) {
        console.error('setupPagination Error:', error);
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
            console.error('Video container not found');
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

        console.log(`Navigated to page ${page}`);

    } catch (error) {
        const container = document.getElementById('featuredVideos') || document.getElementById('searchVideos');
        if (container) {
            container.innerHTML = '<div class="no-results"><p>⚠️ Error loading page. Please try again.</p></div>';
        }
        console.error('Pagination error:', error);
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
        console.log(`Initialized ${forms.length} form(s)`);

        forms.forEach(form => {
            // Add form submit logging (optional)
            form.addEventListener('submit', (e) => {
                console.log(`Form submitted: ${form.name || form.id || 'unnamed'}`);
            });

            // Setup form validation if needed
            form.addEventListener('invalid', (e) => {
                e.preventDefault();
                console.warn('Form validation failed:', e.target);
            }, true);
        });

    } catch (error) {
        console.error('Form initialization error:', error);
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
        // Initialize on all pages
        initMenuToggle();
        initAgeVerification();
        initSearchForm();
        initForms();

        // Get current page path
        const path = window.location.pathname.toLowerCase();

        // Initialize page-specific functionality
        if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
            initHomePage();
        } else if (path.includes('search.html')) {
            initSearchPage();
        } else if (path.includes('video.html')) {
            initVideoPage();
        }

        console.log('Page initialization complete');

    } catch (error) {
        console.error('Fatal initialization error:', error);
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

/**
 * Debounce function - delays function call until user stops triggering it
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} - Debounced function
 * 
   * USAGE: const debouncedSearch = debounce(searchVideos, 300);
 * Useful for search input to avoid too many API calls
 */
function debounce(func, wait) {
    try {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    } catch (error) {
        console.error('Debounce error:', error);
        return func;
    }
}

/**
 * Check if element is currently visible in viewport
 * @param {Element} element - DOM element to check
 * @returns {boolean} - True if element is in viewport
 * 
 * USAGE: Useful for lazy loading and infinite scroll
 */
function isInViewport(element) {
    try {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    } catch (error) {
        console.error('isInViewport error:', error);
        return false;
    }
}

// ========== PERFORMANCE OPTIMIZATIONS ==========
/* Lazy load images for better performance */

/**
 * IntersectionObserver for lazy loading images
 * Images only load when they come into viewport
 * Improves page load performance and reduces bandwidth
 */
let observer;

try {
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When image enters viewport
            if (entry.isIntersecting && entry.target.tagName === 'IMG') {
                const img = entry.target;
                
                // Load actual image from data-src
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    }, {
        // Start loading slightly before image reaches viewport
        rootMargin: '50px'
    });

    // Observe all images with data-src attribute
    document.addEventListener('DOMContentLoaded', () => {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            observer.observe(img);
        });
    });

} catch (error) {
    console.warn('IntersectionObserver not supported, lazy loading disabled:', error);
}

// ========== ERROR LOGGING ==========
/* Catch global errors and log them */

window.addEventListener('error', (event) => {
    console.error('Global JavaScript error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

console.log('HDpornlove.com scripts loaded and ready');

/**
 * Get single video details
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>} - Video details
 */
async function getVideo(videoId) {
    try {
        const url = new URL(`${CONFIG.API_BASE}video/id/`);
        url.searchParams.append('id', videoId);
        url.searchParams.append('thumbsize', CONFIG.THUMB_SIZE);
        url.searchParams.append('format', 'json');

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        
        // Check if video is removed
        const removedIds = await getRemovedIds();
        if (Array.isArray(data) && data.length === 0 || (data.id && removedIds.includes(data.id))) {
            return null;
        }

        return data;
    } catch (error) {
        console.error('getVideo Error:', error);
        throw error;
    }
}

/**
 * Get list of removed video IDs and cache them
 * @returns {Promise<Array>} - Array of removed IDs
 */
async function getRemovedIds() {
    const cached = localStorage.getItem(CONFIG.REMOVED_CACHE_KEY);
    const cacheTime = localStorage.getItem(CONFIG.REMOVED_CACHE_KEY + '_time');

    // Return cached if still valid
    if (cached && cacheTime && Date.now() - parseInt(cacheTime) < CONFIG.REMOVED_CACHE_EXPIRY) {
        return JSON.parse(cached);
    }

    try {
        const url = `${CONFIG.API_BASE}video/removed/?format=json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        const ids = data.map(item => item.id);

        // Cache the results
        localStorage.setItem(CONFIG.REMOVED_CACHE_KEY, JSON.stringify(ids));
        localStorage.setItem(CONFIG.REMOVED_CACHE_KEY + '_time', Date.now().toString());

        return ids;
    } catch (error) {
        console.error('getRemovedIds Error:', error);
        // Return cached data if available, even if expired
        if (cached) {
            return JSON.parse(cached);
        }
        return [];
    }
}

// Video rendering functions moved earlier in file */
function createVideoCard(video) {
    const views = video.views.toLocaleString();
    const title = escapeHtml(video.title);
    const thumbnail = video.default_thumb?.src || '';
    const duration = video.length_min || '0:00';

    return `
        <div class="video-card" onclick="goToVideo('${video.id}')">
            <div class="video-thumbnail">
                <img src="${thumbnail}" alt="${title}" loading="lazy">
                <div class="video-overlay">
                    <button>Watch Now</button>
                </div>
                <div class="video-duration">${duration}</div>
            </div>
            <div class="video-info">
                <div class="video-title">${title}</div>
                <div class="video-stats">
                    <span class="video-stat">👁 ${views} views</span>
                    <span class="video-stat">⭐ ${video.rate}/5</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render video grid
 * @param {Array} videos - Array of video objects
 * @param {string} containerId - Container element ID
 */
function renderVideos(videos, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!videos || videos.length === 0) {
        container.innerHTML = '<div class="no-results"><p>No videos found.</p></div>';
        return;
    }

    container.innerHTML = videos.map(video => createVideoCard(video)).join('');
}

/**
 * Navigate to video page
 * @param {string} videoId
 */
function goToVideo(videoId) {
    window.location.href = `video.html?id=${encodeURIComponent(videoId)}`;
}

/**
 * Format view count
 * @param {number} views
 * @returns {string}
 */
function formatViews(views) {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views.toString();
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== SEARCH FUNCTIONALITY ==========

/**
 * Handle search form submission
 */
function initSearchForm() {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('searchInput').value.trim();
            if (query) {
                window.location.href = `search.html?query=${encodeURIComponent(query)}`;
            }
        });
    }
}

/**
 * Get URL parameter
 * @param {string} name
 * @returns {string|null}
 */
function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// ========== HOME PAGE ==========

/**
 * Initialize home page
 */
async function initHomePage() {
    const container = document.getElementById('featuredVideos');
    if (!container) return;

    try {
        const data = await searchVideos('all', 1);
        renderVideos(data.videos, 'featuredVideos');

        // Setup pagination
        setupPagination(data, 'all');
    } catch (error) {
        container.innerHTML = '<div class="no-results"><p>Error loading videos. Please try again.</p></div>';
        console.error('Home page error:', error);
    }

    // Load trending sections
    await loadTrendingMostViewed(1);
    await loadTrendingTopRated(1);
    await loadTrendingNewest(1);
}

/**
 * Load and render most viewed videos
 * @param {number} page - Page number to load
 */
async function loadTrendingMostViewed(page = 1) {
    const container = document.getElementById('mostViewedVideos');
    if (!container) return;

    try {
        currentPageMostViewed = page;
        const data = await getMostViewedVideos(page);
        
        renderVideos(data.videos, 'mostViewedVideos');

        // Update pagination info
        const pageInfo = document.getElementById('pageViewedInfo');
        if (pageInfo) {
            pageInfo.textContent = `Page ${page}`;
        }

        // Setup pagination buttons
        const prevBtn = document.getElementById('prevViewedBtn');
        const nextBtn = document.getElementById('nextViewedBtn');

        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.preventDefault();
                if (currentPageMostViewed > 1) {
                    loadTrendingMostViewed(currentPageMostViewed - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            };
            prevBtn.disabled = page === 1;
        }

        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.preventDefault();
                loadTrendingMostViewed(currentPageMostViewed + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            nextBtn.disabled = !data.videos || data.videos.length < CONFIG.VIDEOS_PER_PAGE;
        }
    } catch (error) {
        container.innerHTML = '<div class="no-results"><p>Error loading most viewed videos. Please try again.</p></div>';
        console.error('Most viewed error:', error);
    }
}

/**
 * Load and render top rated videos
 * @param {number} page - Page number to load
 */
async function loadTrendingTopRated(page = 1) {
    const container = document.getElementById('topRatedVideos');
    if (!container) return;

    try {
        currentPageTopRated = page;
        const data = await getTopRatedVideos(page);
        
        renderVideos(data.videos, 'topRatedVideos');

        // Update pagination info
        const pageInfo = document.getElementById('pageRatedInfo');
        if (pageInfo) {
            pageInfo.textContent = `Page ${page}`;
        }

        // Setup pagination buttons
        const prevBtn = document.getElementById('prevRatedBtn');
        const nextBtn = document.getElementById('nextRatedBtn');

        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.preventDefault();
                if (currentPageTopRated > 1) {
                    loadTrendingTopRated(currentPageTopRated - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            };
            prevBtn.disabled = page === 1;
        }

        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.preventDefault();
                loadTrendingTopRated(currentPageTopRated + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            nextBtn.disabled = !data.videos || data.videos.length < CONFIG.VIDEOS_PER_PAGE;
        }
    } catch (error) {
        container.innerHTML = '<div class="no-results"><p>Error loading top rated videos. Please try again.</p></div>';
        console.error('Top rated error:', error);
    }
}

/**
 * Load and render newest videos
 * @param {number} page - Page number to load
 */
async function loadTrendingNewest(page = 1) {
    const container = document.getElementById('newestVideos');
    if (!container) return;

    try {
        currentPageNewest = page;
        const data = await getNewestVideos(page);
        
        renderVideos(data.videos, 'newestVideos');

        // Update pagination info
        const pageInfo = document.getElementById('pageNewestInfo');
        if (pageInfo) {
            pageInfo.textContent = `Page ${page}`;
        }

        // Setup pagination buttons
        const prevBtn = document.getElementById('prevNewestBtn');
        const nextBtn = document.getElementById('nextNewestBtn');

        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.preventDefault();
                if (currentPageNewest > 1) {
                    loadTrendingNewest(currentPageNewest - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            };
            prevBtn.disabled = page === 1;
        }

        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.preventDefault();
                loadTrendingNewest(currentPageNewest + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            nextBtn.disabled = !data.videos || data.videos.length < CONFIG.VIDEOS_PER_PAGE;
        }
    } catch (error) {
        container.innerHTML = '<div class="no-results"><p>Error loading newest videos. Please try again.</p></div>';
        console.error('Newest error:', error);
    }
}

/**
 * Search from tag click
 * @param {string} tag
 */

