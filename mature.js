// API Configuration - Edit this section to change the API endpoint or parameters
const API_BASE_URL = 'https://www.eporner.com/api/v2';
const DEFAULT_PER_PAGE = 20; // Change this value to modify default results per page

// DOM Elements (will be initialized after DOM loads)
let matureOrderSelect, matureThumbsizeSelect, matureGayContent;
let matureLoading, matureError, matureErrorMessage;
let matureResultsHeader, matureResultsInfo, matureVideoGrid;
let maturePagination, maturePrevPage, matureNextPage;
let matureCurrentPageSpan, matureTotalPagesSpan;

// State Management
let matureSearch = {
    query: 'mature',
    page: 1,
    order: 'latest',
    thumbsize: 'medium',
    gay: 0,
    per_page: DEFAULT_PER_PAGE
};

let matureResults = {
    videos: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('DOM Content Loaded - Initializing Mature Page');

        // Initialize DOM elements after DOM is loaded
        matureOrderSelect = document.getElementById('matureOrderSelect');
        matureThumbsizeSelect = document.getElementById('matureThumbsizeSelect');
        matureGayContent = document.getElementById('matureGayContent');
        matureLoading = document.getElementById('matureLoading');
        matureError = document.getElementById('matureError');
        matureErrorMessage = document.getElementById('matureErrorMessage');
        matureResultsHeader = document.getElementById('matureResultsHeader');
        matureResultsInfo = document.getElementById('matureResultsInfo');
        matureVideoGrid = document.getElementById('matureVideoGrid');
        maturePagination = document.getElementById('maturePagination');
        maturePrevPage = document.getElementById('maturePrevPage');
        matureNextPage = document.getElementById('matureNextPage');
        matureCurrentPageSpan = document.getElementById('matureCurrentPage');
        matureTotalPagesSpan = document.getElementById('matureTotalPages');

        if (!matureVideoGrid || !matureLoading) {
            console.warn('Mature page required elements not found — skipping initialization.');
            return;
        }

        initializeEventListeners();
        loadMatureVideos();
    } catch (err) {
        console.error('Mature page initialization failed:', err);
    }
});

// Event Listeners
function initializeEventListeners() {
    try {
        if (matureOrderSelect) {
            matureOrderSelect.addEventListener('change', function() {
                matureSearch.order = this.value;
                matureSearch.page = 1;
                loadMatureVideos();
            });
        }

        if (matureThumbsizeSelect) {
            matureThumbsizeSelect.addEventListener('change', function() {
                matureSearch.thumbsize = this.value;
                loadMatureVideos();
            });
        }

        if (matureGayContent) {
            matureGayContent.addEventListener('change', function() {
                matureSearch.gay = this.checked ? 1 : 0;
                matureSearch.page = 1;
                loadMatureVideos();
            });
        }

        if (maturePrevPage) {
            maturePrevPage.addEventListener('click', function() {
                if (matureSearch.page > 1) {
                    matureSearch.page--;
                    loadMatureVideos();
                }
            });
        }

        if (matureNextPage) {
            matureNextPage.addEventListener('click', function() {
                if (matureSearch.page < matureResults.total_pages) {
                    matureSearch.page++;
                    loadMatureVideos();
                }
            });
        }
    } catch (err) {
        console.error('Mature event listener setup failed:', err);
    }
}

// Load Mature videos
async function loadMatureVideos() {
    showMatureLoading();

    try {
        const params = new URLSearchParams({
            query: matureSearch.query,
            per_page: matureSearch.per_page,
            page: matureSearch.page,
            thumbsize: matureSearch.thumbsize,
            order: matureSearch.order,
            gay: matureSearch.gay,
            format: 'json'
        });

        const response = await fetch(`${API_BASE_URL}/video/search/?${params}`);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        matureResults = {
            videos: data.videos || [],
            total_count: data.total_count || 0,
            total_pages: data.total_pages || 0,
            current_page: data.page || 1
        };

        displayMatureResults();
        updateMaturePagination();

    } catch (error) {
        console.error('Mature videos error:', error);
        showMatureError('Failed to fetch mature videos. Please try again later.');
    }
}

// Display Mature videos results
function displayMatureResults() {
    hideMatureLoading();
    hideMatureError();
    showMatureResultsHeader();

    if (matureResults.videos.length === 0) {
        showMatureError('No mature videos found.');
        return;
    }

    matureVideoGrid.innerHTML = '';

    matureResults.videos.forEach(video => {
        const videoCard = createMatureVideoCard(video);
        matureVideoGrid.appendChild(videoCard);
    });
}

// Create a video card for Mature videos
function createMatureVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.addEventListener('click', () => showVideoDetails(video.id));

    const defaultThumb = video.default_thumb;
    const thumbUrl = defaultThumb ? defaultThumb.src : 'https://via.placeholder.com/640x360?text=No+Image';

    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${thumbUrl}" alt="${video.title}" loading="lazy">
            <div class="video-overlay">
                <i class="fas fa-play play-icon"></i>
            </div>
            <div class="video-duration">${formatDuration(video.length_min)}</div>
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

// Show video player in modal (shared function)
async function showVideoDetails(videoId) {
    try {
        const params = new URLSearchParams({
            id: videoId,
            thumbsize: matureSearch.thumbsize,
            format: 'json'
        });

        const video = await fetchWithRetry(`${API_BASE_URL}/video/id/?${params}`);

        if (!video || video.length === 0) {
            showMatureError('Video not found or has been removed.');
            return;
        }

        playVideoInline(video);
    } catch (error) {
        console.error('Video player error:', error);
        showMatureError('Failed to load video player.');
    }
}

// Update Mature videos pagination controls
function updateMaturePagination() {
    matureCurrentPageSpan.textContent = matureResults.current_page;
    matureTotalPagesSpan.textContent = matureResults.total_pages;

    maturePrevPage.disabled = matureSearch.page <= 1;
    matureNextPage.disabled = matureSearch.page >= matureResults.total_pages;

    maturePagination.style.display = matureResults.total_pages > 1 ? 'flex' : 'none';
}

// Mature videos UI Helper Functions
function showMatureLoading() {
    matureLoading.style.display = 'block';
    matureError.style.display = 'none';
    matureResultsHeader.style.display = 'none';
    maturePagination.style.display = 'none';
}

function hideMatureLoading() {
    matureLoading.style.display = 'none';
}

function showMatureError(message) {
    hideMatureLoading();
    matureErrorMessage.textContent = message;
    matureError.style.display = 'block';
    matureResultsHeader.style.display = 'none';
    maturePagination.style.display = 'none';
    matureVideoGrid.innerHTML = '';
}

function hideMatureError() {
    matureError.style.display = 'none';
}

function showMatureResultsHeader() {
    const orderText = getOrderText(matureSearch.order);
    matureResultsInfo.textContent = `Showing ${orderText} mature videos - ${formatNumber(matureResults.total_count)} total results`;
    matureResultsHeader.style.display = 'block';
}

// Get order description text
function getOrderText(order) {
    const orderMap = {
        'latest': 'latest',
        'top-rated': 'top rated',
        'most-popular': 'most popular',
        'top-weekly': 'top weekly',
        'top-monthly': 'top monthly'
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
