// API Configuration
const API_BASE_URL = 'https://www.eporner.com/api/v2';
const DEFAULT_PER_PAGE = 20;
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// DOM Elements (will be initialized after DOM loads)
let teenOrderSelect, teenThumbsizeSelect, teenGayContent;
let teenLoading, teenError, teenErrorMessage;
let teenResultsHeader, teenResultsInfo, teenVideoGrid;
let teenPagination, teenPrevPage, teenNextPage;
let teenCurrentPageSpan, teenTotalPagesSpan;

// State Management
let teenSearch = {
    query: 'teen',
    page: 1,
    order: 'latest',
    thumbsize: 'medium',
    gay: 0,
    per_page: DEFAULT_PER_PAGE
};

let teenResults = {
    videos: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing Teen Page');

    // Initialize DOM elements after DOM is loaded
    teenOrderSelect = document.getElementById('teenOrderSelect');
    teenThumbsizeSelect = document.getElementById('teenThumbsizeSelect');
    teenGayContent = document.getElementById('teenGayContent');
    teenLoading = document.getElementById('teenLoading');
    teenError = document.getElementById('teenError');
    teenErrorMessage = document.getElementById('teenErrorMessage');
    teenResultsHeader = document.getElementById('teenResultsHeader');
    teenResultsInfo = document.getElementById('teenResultsInfo');
    teenVideoGrid = document.getElementById('teenVideoGrid');
    teenPagination = document.getElementById('teenPagination');
    teenPrevPage = document.getElementById('teenPrevPage');
    teenNextPage = document.getElementById('teenNextPage');
    teenCurrentPageSpan = document.getElementById('teenCurrentPage');
    teenTotalPagesSpan = document.getElementById('teenTotalPages');

    initializeEventListeners();
    loadTeenVideos();
});

// Event Listeners
function initializeEventListeners() {
    teenOrderSelect.addEventListener('change', function() {
        teenSearch.order = this.value;
        teenSearch.page = 1;
        loadTeenVideos();
    });

    teenThumbsizeSelect.addEventListener('change', function() {
        teenSearch.thumbsize = this.value;
        loadTeenVideos();
    });

    teenGayContent.addEventListener('change', function() {
        teenSearch.gay = this.checked ? 1 : 0;
        teenSearch.page = 1;
        loadTeenVideos();
    });

    teenPrevPage.addEventListener('click', function() {
        if (teenSearch.page > 1) {
            teenSearch.page--;
            loadTeenVideos();
        }
    });

    teenNextPage.addEventListener('click', function() {
        if (teenSearch.page < teenResults.total_pages) {
            teenSearch.page++;
            loadTeenVideos();
        }
    });
}

// Enhanced API call with retry logic and timeout
async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                return await response.json();
            } else if (response.status === 429) {
                // Rate limited, wait longer before retry
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
                continue;
            } else if (response.status >= 500) {
                // Server error, retry
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
                continue;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn(`Request timeout (attempt ${i + 1}/${retries})`);
            } else {
                console.warn(`Request failed (attempt ${i + 1}/${retries}):`, error.message);
            }

            if (i === retries - 1) {
                throw error;
            }

            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
        }
    }
}

// Load teen videos with enhanced error handling
async function loadTeenVideos() {
    showTeenLoading();

    try {
        const params = new URLSearchParams({
            query: teenSearch.query,
            per_page: teenSearch.per_page,
            page: teenSearch.page,
            thumbsize: teenSearch.thumbsize,
            order: teenSearch.order,
            gay: teenSearch.gay,
            format: 'json'
        });

        console.log('Fetching teen videos with params:', params.toString());

        const data = await fetchWithRetry(`${API_BASE_URL}/video/search/?${params}`);

        teenResults = {
            videos: data.videos || [],
            total_count: data.total_count || 0,
            total_pages: data.total_pages || 0,
            current_page: data.page || 1
        };

        console.log(`Loaded ${teenResults.videos.length} teen videos`);
        displayTeenResults();
        updateTeenPagination();

    } catch (error) {
        console.error('Teen videos error:', error);
        showTeenError(`Failed to fetch teen videos: ${error.message}. Please try again later.`);
    }
}

// Display teen videos results
function displayTeenResults() {
    hideTeenLoading();
    hideTeenError();
    showTeenResultsHeader();

    if (teenResults.videos.length === 0) {
        showTeenError('No teen videos found.');
        return;
    }

    teenVideoGrid.innerHTML = '';

    teenResults.videos.forEach(video => {
        const videoCard = createTeenVideoCard(video);
        teenVideoGrid.appendChild(videoCard);
    });
}

// Create a video card for teen videos
function createTeenVideoCard(video) {
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
        console.log('Loading video details for ID:', videoId);

        // Redirect to main page with video ID
        window.location.href = `index.html?video=${videoId}&category=Teen`;

    } catch (error) {
        console.error('Video player error:', error);
        showTeenError('Failed to load video player.');
    }
}

// Update teen videos pagination controls
function updateTeenPagination() {
    teenCurrentPageSpan.textContent = teenResults.current_page;
    teenTotalPagesSpan.textContent = teenResults.total_pages;

    teenPrevPage.disabled = teenSearch.page <= 1;
    teenNextPage.disabled = teenSearch.page >= teenResults.total_pages;

    teenPagination.style.display = teenResults.total_pages > 1 ? 'flex' : 'none';
}

// Teen videos UI Helper Functions
function showTeenLoading() {
    teenLoading.style.display = 'block';
    teenError.style.display = 'none';
    teenResultsHeader.style.display = 'none';
    teenPagination.style.display = 'none';
}

function hideTeenLoading() {
    teenLoading.style.display = 'none';
}

function showTeenError(message) {
    hideTeenLoading();
    teenErrorMessage.textContent = message;
    teenError.style.display = 'block';
    teenResultsHeader.style.display = 'none';
    teenPagination.style.display = 'none';
    teenVideoGrid.innerHTML = '';
}

function hideTeenError() {
    teenError.style.display = 'none';
}

function showTeenResultsHeader() {
    const orderText = getOrderText(teenSearch.order);
    teenResultsInfo.textContent = `Showing ${orderText} teen videos - ${formatNumber(teenResults.total_count)} total results`;
    teenResultsHeader.style.display = 'block';
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
