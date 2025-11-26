// API Configuration - shared from script.js
// const API_BASE_URL = 'https://www.eporner.com/api/v2';
// const DEFAULT_PER_PAGE = 12;
// const API_TIMEOUT = 10000;
// const MAX_RETRIES = 3;
// const RETRY_DELAY = 1000;

// Use values from script.js for latest page
const LATEST_DEFAULT_PER_PAGE = 12;
const LATEST_API_TIMEOUT = 10000;
const LATEST_MAX_RETRIES = 3;
const LATEST_RETRY_DELAY = 1000;
const API_BASE_URL = 'https://www.eporner.com/api/v2'; // Define for this page

// DOM Elements
const latestThumbsizeSelect = document.getElementById('latestThumbsizeSelect');
const latestGayContent = document.getElementById('latestGayContent');
const latestLoading = document.getElementById('latestLoading');
const latestError = document.getElementById('latestError');
const latestErrorMessage = document.getElementById('latestErrorMessage');
const latestResultsHeader = document.getElementById('latestResultsHeader');
const latestResultsInfo = document.getElementById('latestResultsInfo');
const latestVideoGrid = document.getElementById('latestVideoGrid');
const latestPagination = document.getElementById('latestPagination');
const latestPrevPage = document.getElementById('latestPrevPage');
const latestNextPage = document.getElementById('latestNextPage');
const latestCurrentPageSpan = document.getElementById('latestCurrentPage');
const latestTotalPagesSpan = document.getElementById('latestTotalPages');

// State Management
let latestSearch = {
    query: 'all',
    page: 1,
    order: 'latest',
    thumbsize: 'medium',
    gay: 0,
    per_page: LATEST_DEFAULT_PER_PAGE
};

let latestResults = {
    videos: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Ensure main elements exist before initializing
        if (!latestVideoGrid || !latestLoading) {
            console.warn('Latest page required elements not found — skipping initialization.');
            return;
        }

        initializeEventListeners();
        loadLatestVideos();
    } catch (err) {
        console.error('Latest page initialization failed:', err);
    }
});

// Event Listeners
function initializeEventListeners() {
    try {
        if (latestThumbsizeSelect) {
            latestThumbsizeSelect.addEventListener('change', function() {
                latestSearch.thumbsize = this.value;
                loadLatestVideos();
            });
        }

        if (latestGayContent) {
            latestGayContent.addEventListener('change', function() {
                latestSearch.gay = this.checked ? 1 : 0;
                latestSearch.page = 1;
                loadLatestVideos();
            });
        }

        if (latestPrevPage) {
            latestPrevPage.addEventListener('click', function() {
                if (latestSearch.page > 1) {
                    latestSearch.page--;
                    loadLatestVideos();
                }
            });
        }

        if (latestNextPage) {
            latestNextPage.addEventListener('click', function() {
                if (latestSearch.page < latestResults.total_pages) {
                    latestSearch.page++;
                    loadLatestVideos();
                }
            });
        }
    } catch (err) {
        console.error('Latest event listener setup failed:', err);
    }
}

// Load latest videos
async function loadLatestVideos() {
    showLatestLoading();

    try {
        const params = new URLSearchParams({
            query: latestSearch.query,
            per_page: latestSearch.per_page,
            page: latestSearch.page,
            thumbsize: latestSearch.thumbsize,
            order: latestSearch.order,
            gay: latestSearch.gay,
            format: 'json'
        });

        const response = await fetch(`${API_BASE_URL}/video/search/?${params}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        latestResults = {
            videos: data.videos || [],
            total_count: data.total_count || 0,
            total_pages: data.total_pages || 0,
            current_page: data.page || 1
        };

        displayLatestResults();
        updateLatestPagination();

    } catch (error) {
        console.error('Latest videos error:', error);
        showLatestError('Failed to fetch latest videos. Please try again later.');
    }
}

// Display latest videos results
function displayLatestResults() {
    hideLatestLoading();
    hideLatestError();
    showLatestResultsHeader();

    if (latestResults.videos.length === 0) {
        showLatestError('No latest videos found.');
        return;
    }

    latestVideoGrid.innerHTML = '';

    latestResults.videos.forEach(video => {
        const videoCard = createLatestVideoCard(video);
        latestVideoGrid.appendChild(videoCard);
    });
}

// Create a video card for latest videos
function createLatestVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.addEventListener('click', () => showVideoDetails(video.id));

    const defaultThumb = video.default_thumb;
    const thumbUrl = defaultThumb ? defaultThumb.src : 'https://via.placeholder.com/640x360?text=No+Image';

    // Add "NEW" badge for recently added videos
    const addedDate = new Date(video.added);
    const now = new Date();
    const daysDiff = Math.floor((now - addedDate) / (1000 * 60 * 60 * 24));
    const isNew = daysDiff <= 7;

    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${thumbUrl}" alt="${video.title}" loading="lazy">
            <div class="video-overlay">
                <i class="fas fa-play play-icon"></i>
            </div>
            <div class="video-duration">${formatDuration(video.length_min)}</div>
            ${isNew ? '<div class="new-badge">NEW</div>' : ''}
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
            <div class="video-added">
                <i class="fas fa-calendar"></i>
                Added: ${formatDate(video.added)}
            </div>
        </div>
    `;

    return card;
}

// Show video player in modal (shared function)
async function showVideoDetails(videoId) {
    try {
        const params = new URLSearchParams({
            id: videoId,
            thumbsize: latestSearch.thumbsize,
            format: 'json'
        });

        const response = await fetch(`${API_BASE_URL}/video/id/?${params}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const video = await response.json();

        if (!video || video.length === 0) {
            showLatestError('Video not found or has been removed.');
            return;
        }

        // Use the main page's video player modal
        playVideoInline(video);

    } catch (error) {
        console.error('Video player error:', error);
        showLatestError('Failed to load video player.');
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
        showLatestError('Video embed not available.');
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

    console.log('Playing video (latest fallback):', video.title);
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

// Update latest videos pagination controls
function updateLatestPagination() {
    latestCurrentPageSpan.textContent = latestResults.current_page;
    latestTotalPagesSpan.textContent = latestResults.total_pages;

    latestPrevPage.disabled = latestSearch.page <= 1;
    latestNextPage.disabled = latestSearch.page >= latestResults.total_pages;

    latestPagination.style.display = latestResults.total_pages > 1 ? 'flex' : 'none';
}

// Latest videos UI Helper Functions
function showLatestLoading() {
    latestLoading.style.display = 'block';
    latestError.style.display = 'none';
    latestResultsHeader.style.display = 'none';
    latestPagination.style.display = 'none';
}

function hideLatestLoading() {
    latestLoading.style.display = 'none';
}

function showLatestError(message) {
    hideLatestLoading();
    latestErrorMessage.textContent = message;
    latestError.style.display = 'block';
    latestResultsHeader.style.display = 'none';
    latestPagination.style.display = 'none';
    latestVideoGrid.innerHTML = '';
}

function hideLatestError() {
    latestError.style.display = 'none';
}

function showLatestResultsHeader() {
    latestResultsInfo.textContent = `Showing latest videos - ${formatNumber(latestResults.total_count)} total results`;
    latestResultsHeader.style.display = 'block';
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

function formatDate(dateString) {
    if (!dateString || dateString === '1970-01-01 01:00:00') {
        return 'Unknown';
    }

    try {
        const date = new Date(dateString);
        const now = new Date();
        const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
            return 'Today';
        } else if (daysDiff === 1) {
            return 'Yesterday';
        } else if (daysDiff < 7) {
            return `${daysDiff} days ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    } catch (e) {
        return dateString;
    }
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
