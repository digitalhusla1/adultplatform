// API Configuration
const API_BASE_URL = 'https://www.eporner.com/api/v2';
const DEFAULT_PER_PAGE = 12; // Reduced for faster loading
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// DOM Elements
let analOrderSelect, analThumbsizeSelect, analGayContent;
let analLoading, analError, analErrorMessage;
let analResultsHeader, analResultsInfo, analVideoGrid;
let analPagination, analPrevPage, analNextPage;
let analCurrentPageSpan, analTotalPagesSpan;

// State Management
let analSearch = {
    query: 'anal',
    page: 1,
    order: 'latest',
    thumbsize: 'medium',
    gay: 0,
    per_page: DEFAULT_PER_PAGE
};

let analResults = {
    videos: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing Anal Page');

    // Initialize DOM elements after DOM is loaded
    analOrderSelect = document.getElementById('analOrderSelect');
    analThumbsizeSelect = document.getElementById('analThumbsizeSelect');
    analGayContent = document.getElementById('analGayContent');
    analLoading = document.getElementById('analLoading');
    analError = document.getElementById('analError');
    analErrorMessage = document.getElementById('analErrorMessage');
    analResultsHeader = document.getElementById('analResultsHeader');
    analResultsInfo = document.getElementById('analResultsInfo');
    analVideoGrid = document.getElementById('analVideoGrid');
    analPagination = document.getElementById('analPagination');
    analPrevPage = document.getElementById('analPrevPage');
    analNextPage = document.getElementById('analNextPage');
    analCurrentPageSpan = document.getElementById('analCurrentPage');
    analTotalPagesSpan = document.getElementById('analTotalPages');

    initializeEventListeners();
    loadAnalVideos();
});

// Event Listeners
function initializeEventListeners() {
    analOrderSelect.addEventListener('change', function() {
        analSearch.order = this.value;
        analSearch.page = 1;
        loadAnalVideos();
    });

    analThumbsizeSelect.addEventListener('change', function() {
        analSearch.thumbsize = this.value;
        loadAnalVideos();
    });

    analGayContent.addEventListener('change', function() {
        analSearch.gay = this.checked ? 1 : 0;
        analSearch.page = 1;
        loadAnalVideos();
    });

    analPrevPage.addEventListener('click', function() {
        if (analSearch.page > 1) {
            analSearch.page--;
            loadAnalVideos();
        }
    });

    analNextPage.addEventListener('click', function() {
        if (analSearch.page < analResults.total_pages) {
            analSearch.page++;
            loadAnalVideos();
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

// Load Anal videos
async function loadAnalVideos() {
    showAnalLoading();

    try {
        const params = new URLSearchParams({
            query: analSearch.query,
            per_page: analSearch.per_page,
            page: analSearch.page,
            thumbsize: analSearch.thumbsize,
            order: analSearch.order,
            gay: analSearch.gay,
            format: 'json'
        });

        console.log('Fetching anal videos with params:', params.toString());

        const data = await fetchWithRetry(`${API_BASE_URL}/video/search/?${params}`);

        analResults = {
            videos: data.videos || [],
            total_count: data.total_count || 0,
            total_pages: data.total_pages || 0,
            current_page: data.page || 1
        };

        console.log(`Loaded ${analResults.videos.length} anal videos`);
        displayAnalResults();
        updateAnalPagination();

    } catch (error) {
        console.error('Anal videos error:', error);
        showAnalError(`Failed to fetch anal videos: ${error.message}. Please try again later.`);
    }
}

// Display Anal videos results
function displayAnalResults() {
    hideAnalLoading();
    hideAnalError();
    showAnalResultsHeader();

    if (analResults.videos.length === 0) {
        showAnalError('No anal videos found.');
        return;
    }

    analVideoGrid.innerHTML = '';

    analResults.videos.forEach(video => {
        const videoCard = createAnalVideoCard(video);
        analVideoGrid.appendChild(videoCard);
    });
}

// Create a video card for Anal videos
function createAnalVideoCard(video) {
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
        window.location.href = `index.html?video=${videoId}&category=Anal`;

    } catch (error) {
        console.error('Video player error:', error);
        showAnalError('Failed to load video player.');
    }
}

// Update Anal videos pagination controls
function updateAnalPagination() {
    analCurrentPageSpan.textContent = analResults.current_page;
    analTotalPagesSpan.textContent = analResults.total_pages;

    analPrevPage.disabled = analSearch.page <= 1;
    analNextPage.disabled = analSearch.page >= analResults.total_pages;

    analPagination.style.display = analResults.total_pages > 1 ? 'flex' : 'none';
}

// Anal videos UI Helper Functions
function showAnalLoading() {
    analLoading.style.display = 'block';
    analError.style.display = 'none';
    analResultsHeader.style.display = 'none';
    analPagination.style.display = 'none';
}

function hideAnalLoading() {
    analLoading.style.display = 'none';
}

function showAnalError(message) {
    hideAnalLoading();
    analErrorMessage.textContent = message;
    analError.style.display = 'block';
    analResultsHeader.style.display = 'none';
    analPagination.style.display = 'none';
    analVideoGrid.innerHTML = '';
}

function hideAnalError() {
    analError.style.display = 'none';
}

function showAnalResultsHeader() {
    const orderText = getOrderText(analSearch.order);
    analResultsInfo.textContent = `Showing ${orderText} anal videos - ${formatNumber(analResults.total_count)} total results`;
    analResultsHeader.style.display = 'block';
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
