// API Configuration - shared from script.js
// const API_BASE_URL = 'https://www.eporner.com/api/v2';
// const DEFAULT_PER_PAGE = 12;
// const API_TIMEOUT = 10000;
// const MAX_RETRIES = 3;
// const RETRY_DELAY = 1000;

// Use values from script.js for popular page
const POPULAR_DEFAULT_PER_PAGE = 12;
const POPULAR_API_TIMEOUT = 10000;
const POPULAR_MAX_RETRIES = 3;
const POPULAR_RETRY_DELAY = 1000;
const API_BASE_URL = 'https://www.eporner.com/api/v2'; // Define for this page

// DOM Elements
const popularOrderSelect = document.getElementById('popularOrderSelect');
const popularThumbsizeSelect = document.getElementById('popularThumbsizeSelect');
const popularGayContent = document.getElementById('popularGayContent');
const popularLoading = document.getElementById('popularLoading');
const popularError = document.getElementById('popularError');
const popularErrorMessage = document.getElementById('popularErrorMessage');
const popularResultsHeader = document.getElementById('popularResultsHeader');
const popularResultsInfo = document.getElementById('popularResultsInfo');
const popularVideoGrid = document.getElementById('popularVideoGrid');
const popularPagination = document.getElementById('popularPagination');
const popularPrevPage = document.getElementById('popularPrevPage');
const popularNextPage = document.getElementById('popularNextPage');
const popularCurrentPageSpan = document.getElementById('popularCurrentPage');
const popularTotalPagesSpan = document.getElementById('popularTotalPages');

// State Management
let popularSearch = {
    query: 'all',
    page: 1,
    order: 'most-popular',
    thumbsize: 'medium',
    gay: 0,
    per_page: POPULAR_DEFAULT_PER_PAGE
};

let popularResults = {
    videos: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Guard - ensure required DOM elements exist on this page
    if (!popularVideoGrid || !popularLoading) {
        console.warn('Popular page elements not found; skipping initialization.');
        return;
    }

    initializeEventListeners();
    loadPopularVideos();
});

// Event Listeners
function initializeEventListeners() {
    if (popularOrderSelect) {
        popularOrderSelect.addEventListener('change', function() {
            popularSearch.order = this.value;
            popularSearch.page = 1;
            loadPopularVideos();
        });
    }

    if (popularThumbsizeSelect) {
        popularThumbsizeSelect.addEventListener('change', function() {
            popularSearch.thumbsize = this.value;
            loadPopularVideos();
        });
    }

    if (popularGayContent) {
        popularGayContent.addEventListener('change', function() {
            popularSearch.gay = this.checked ? 1 : 0;
            popularSearch.page = 1;
            loadPopularVideos();
        });
    }

    if (popularPrevPage) {
        popularPrevPage.addEventListener('click', function() {
            if (popularSearch.page > 1) {
                popularSearch.page--;
                loadPopularVideos();
            }
        });
    }

    if (popularNextPage) {
        popularNextPage.addEventListener('click', function() {
            if (popularSearch.page < popularResults.total_pages) {
                popularSearch.page++;
                loadPopularVideos();
            }
        });
    }
}

// Enhanced API call with retry logic and timeout (using script.js shared function)
async function fetchWithRetry(url, options = {}, retries = POPULAR_MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), POPULAR_API_TIMEOUT);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                return data;
            } else if (response.status === 429) {
                // Rate limited, wait longer before retry
                console.warn(`Popular API rate limited (429), retrying...`);
                await new Promise(resolve => setTimeout(resolve, POPULAR_RETRY_DELAY * (i + 1)));
                continue;
            } else if (response.status >= 500) {
                // Server error, retry
                console.warn(`Popular API server error (${response.status}), retrying...`);
                await new Promise(resolve => setTimeout(resolve, POPULAR_RETRY_DELAY * (i + 1)));
                continue;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn(`Popular request timeout (attempt ${i + 1}/${retries})`);
            } else {
                console.warn(`Popular request failed (attempt ${i + 1}/${retries}):`, error.message);
            }

            if (i === retries - 1) {
                throw error;
            }

            await new Promise(resolve => setTimeout(resolve, POPULAR_RETRY_DELAY * (i + 1)));
        }
    }
}

// Load popular videos
async function loadPopularVideos() {
    showPopularLoading();

    try {
        const params = new URLSearchParams({
            query: popularSearch.query,
            per_page: popularSearch.per_page,
            page: popularSearch.page,
            thumbsize: popularSearch.thumbsize,
            order: popularSearch.order,
            gay: popularSearch.gay,
            format: 'json'
        });

        console.log('Fetching popular videos with params:', params.toString());

        const data = await fetchWithRetry(`${API_BASE_URL}/video/search/?${params}`);

        popularResults = {
            videos: data.videos || [],
            total_count: data.total_count || 0,
            total_pages: data.total_pages || 0,
            current_page: data.page || 1
        };

        console.log(`Loaded ${popularResults.videos.length} popular videos`);
        displayPopularResults();
        updatePopularPagination();

    } catch (error) {
        console.error('Popular videos error:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        showPopularError(`Failed to fetch popular videos: ${error.message}. Please try again later.`);
    }
}

// Display popular videos results
function displayPopularResults() {
    hidePopularLoading();
    hidePopularError();
    showPopularResultsHeader();

    if (popularResults.videos.length === 0) {
        showPopularError('No popular videos found.');
        return;
    }

    popularVideoGrid.innerHTML = '';

    popularResults.videos.forEach(video => {
        const videoCard = createPopularVideoCard(video);
        popularVideoGrid.appendChild(videoCard);
    });
}

// Create a video card for popular videos
function createPopularVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.addEventListener('click', () => showVideoDetails(video.id));

    const defaultThumb = video.default_thumb;
    const thumbUrl = defaultThumb ? defaultThumb.src : 'https://via.placeholder.com/640x360?text=No+Image';

    // Add popularity indicator
    const popularityBadge = getPopularityBadge(video);

    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${thumbUrl}" alt="${video.title}" loading="lazy">
            <div class="video-overlay">
                <i class="fas fa-play play-icon"></i>
            </div>
            <div class="video-duration">${formatDuration(video.length_min)}</div>
            ${popularityBadge}
        </div>
        <div class="video-info">
            <h3 class="video-title">${video.title}</h3>
            <div class="video-meta">
                <div class="video-views">
                    <i class="fas fa-eye"></i>
                    ${formatNumber(video.views)}
                </div>
                <div class="video-rating">
                    <i class="fas fa-star"></i>
                    ${video.rate || 'N/A'}
                </div>
            </div>
        </div>
    `;

    return card;
}

// Get popularity badge based on views
function getPopularityBadge(video) {
    const views = parseInt(video.views);
    if (views >= 1000000) {
        return '<div class="popularity-badge popular">🔥 Million+ Views</div>';
    } else if (views >= 100000) {
        return '<div class="popularity-badge trending">⭐ Trending</div>';
    } else if (views >= 50000) {
        return '<div class="popularity-badge hot">🔥 Hot</div>';
    }
    return '';
}

// Show video player in modal (shared function)
async function showVideoDetails(videoId) {
    try {
        const params = new URLSearchParams({
            id: videoId,
            thumbsize: popularSearch.thumbsize,
            format: 'json'
        });

        const video = await fetchWithRetry(`${API_BASE_URL}/video/id/?${params}`);

        if (!video || video.length === 0) {
            showPopularError('Video not found or has been removed.');
            return;
        }

        // Use the main page's video player modal
        playVideoInline(video);

    } catch (error) {
        console.error('Video player error:', error);
        showPopularError(`Failed to load video player: ${error.message}`);
    }
}

// Play video inline in modal (shared function)
function playVideoInline(video) {
    // Prefer canonical site player if available
    if (window.sitePlayVideoInline && typeof window.sitePlayVideoInline === 'function') {
        try {
            window.sitePlayVideoInline(video);
            return;
        } catch (err) {
            console.warn('sitePlayVideoInline failed; falling back to local logic:', err);
        }
    }

    // Local fallback: keep a compatible inline player if canonical helper isn't available
    if (!video.embed) {
        showPopularError('Video embed not available.');
        return;
    }

    // Use local DOM elements (no window.parent access) when available
    const mainModal = document.getElementById('videoModal');
    const mainPlayerContainer = document.getElementById('videoPlayerContainer');
    const mainPlayer = document.getElementById('videoPlayer');
    const mainInfoPanel = document.getElementById('videoInfoPanel');

    if (!mainModal || !mainPlayerContainer || !mainPlayer || !mainInfoPanel) {
        // Fallback: redirect to main page
        window.location.href = `index.html?video=${video.id}`;
        return;
    }

    // Show video player container, hide details
    mainPlayerContainer.style.display = 'flex';

    // Set video player source
    mainPlayer.src = video.embed;

    // Update video info panel (use canonical if present)
    if (window.siteUpdateVideoInfoPanel && typeof window.siteUpdateVideoInfoPanel === 'function') {
        window.siteUpdateVideoInfoPanel(video, mainInfoPanel);
    } else {
        updateVideoInfoPanel(video, mainInfoPanel);
    }

    // Show modal
    mainModal.style.display = 'block';

    console.log('Playing video (popular fallback):', video.title);
}

// Update video info panel (shared function)
function updateVideoInfoPanel(video, infoPanel = null) {
    // Prefer canonical info panel updater if available
    if (window.siteUpdateVideoInfoPanel && typeof window.siteUpdateVideoInfoPanel === 'function') {
        try {
            window.siteUpdateVideoInfoPanel(video, infoPanel);
            return;
        } catch (err) {
            console.warn('siteUpdateVideoInfoPanel failed; falling back to local update:', err);
        }
    }

    const panel = infoPanel || document.getElementById('videoInfoPanel');
    if (!panel) return;

    panel.innerHTML = `
        <div class="video-info-title">${video.title}</div>
        <div class="video-info-stats">
            <div class="video-info-stat">
                <div class="video-info-label">Views</div>
                <div class="video-info-value">${formatNumber(video.views)}</div>
            </div>
            <div class="video-info-stat">
                <div class="video-info-label">Rating</div>
                <div class="video-info-value">${video.rate || 'N/A'}</div>
            </div>
            <div class="video-info-stat">
                <div class="video-info-label">Duration</div>
                <div class="video-info-value">${video.length_min}</div>
            </div>
            <div class="video-info-stat">
                <div class="video-info-label">Added</div>
                <div class="video-info-value">${formatDate(video.added)}</div>
            </div>
        </div>
        ${video.keywords ? `
        <div class="video-info-description">
            <strong>Tags:</strong> ${video.keywords}
        </div>
        ` : ''}
    `;
}

// Update popular videos pagination controls
function updatePopularPagination() {
    popularCurrentPageSpan.textContent = popularResults.current_page;
    popularTotalPagesSpan.textContent = popularResults.total_pages;

    popularPrevPage.disabled = popularSearch.page <= 1;
    popularNextPage.disabled = popularSearch.page >= popularResults.total_pages;

    popularPagination.style.display = popularResults.total_pages > 1 ? 'flex' : 'none';
}

// Popular videos UI Helper Functions
function showPopularLoading() {
    popularLoading.style.display = 'block';
    popularError.style.display = 'none';
    popularResultsHeader.style.display = 'none';
    popularPagination.style.display = 'none';
}

function hidePopularLoading() {
    popularLoading.style.display = 'none';
}

function showPopularError(message) {
    hidePopularLoading();
    popularErrorMessage.textContent = message;
    popularError.style.display = 'block';
    popularResultsHeader.style.display = 'none';
    popularPagination.style.display = 'none';
    popularVideoGrid.innerHTML = '';
}

function hidePopularError() {
    popularError.style.display = 'none';
}

function showPopularResultsHeader() {
    const orderText = getOrderText(popularSearch.order);
    popularResultsInfo.textContent = `Showing ${orderText} videos - ${formatNumber(popularResults.total_count)} total results`;
    popularResultsHeader.style.display = 'block';
}

// Get order description text
function getOrderText(order) {
    const orderMap = {
        'most-popular': 'most popular all time',
        'top-weekly': 'top weekly',
        'top-monthly': 'top monthly',
        'top-rated': 'top rated'
    };
    return orderMap[order] || order;
}

// Utility Functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatDuration(duration) {
    if (!duration) return '';

    if (duration.includes(':')) {
        const parts = duration.split(':');
        if (parts.length === 2) {
            return `${parts[0]}:${parts[1].padStart(2, '0')}`;
        } else if (parts.length === 3) {
            return `${parts[0]}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
        }
    }

    return duration;
}

// Mobile navigation toggle (shared function)
function toggleNav() {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.getElementById('navToggle');

    if (navMenu && navToggle) {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');

        // Update toggle icon
        const icon = navToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    }
}
