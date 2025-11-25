// API Configuration
const API_BASE_URL = 'https://www.eporner.com/api/v2';
const DEFAULT_PER_PAGE = 12; // Reduced for faster loading
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// DOM Elements
let creampieOrderSelect, creampieThumbsizeSelect, creampieGayContent;
let creampieLoading, creampieError, creampieErrorMessage;
let creampieResultsHeader, creampieResultsInfo, creampieVideoGrid;
let creampiePagination, creampiePrevPage, creampieNextPage;
let creampieCurrentPageSpan, creampieTotalPagesSpan;

// State Management
let creampieSearch = {
    query: 'creampie',
    page: 1,
    order: 'latest',
    thumbsize: 'medium',
    gay: 0,
    per_page: DEFAULT_PER_PAGE
};

let creampieResults = {
    videos: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('DOM Content Loaded - Initializing Creampie Page');

        // Initialize DOM elements after DOM is loaded
        creampieOrderSelect = document.getElementById('creampieOrderSelect');
        creampieThumbsizeSelect = document.getElementById('creampieThumbsizeSelect');
        creampieGayContent = document.getElementById('creampieGayContent');
        creampieLoading = document.getElementById('creampieLoading');
        creampieError = document.getElementById('creampieError');
        creampieErrorMessage = document.getElementById('creampieErrorMessage');
        creampieResultsHeader = document.getElementById('creampieResultsHeader');
        creampieResultsInfo = document.getElementById('creampieResultsInfo');
        creampieVideoGrid = document.getElementById('creampieVideoGrid');
        creampiePagination = document.getElementById('creampiePagination');
        creampiePrevPage = document.getElementById('creampiePrevPage');
        creampieNextPage = document.getElementById('creampieNextPage');
        creampieCurrentPageSpan = document.getElementById('creampieCurrentPage');
        creampieTotalPagesSpan = document.getElementById('creampieTotalPages');

        if (!creampieVideoGrid || !creampieLoading) {
            console.warn('Creampie page required elements not found — skipping initialization.');
            return;
        }

        initializeEventListeners();
        loadCreampieVideos();
    } catch (err) {
        console.error('Creampie page initialization failed:', err);
    }
});

// Event Listeners
function initializeEventListeners() {
    try {
        if (creampieOrderSelect) {
            creampieOrderSelect.addEventListener('change', function() {
                creampieSearch.order = this.value;
                creampieSearch.page = 1;
                loadCreampieVideos();
            });
        }

        if (creampieThumbsizeSelect) {
            creampieThumbsizeSelect.addEventListener('change', function() {
                creampieSearch.thumbsize = this.value;
                loadCreampieVideos();
            });
        }

        if (creampieGayContent) {
            creampieGayContent.addEventListener('change', function() {
                creampieSearch.gay = this.checked ? 1 : 0;
                creampieSearch.page = 1;
                loadCreampieVideos();
            });
        }

        if (creampiePrevPage) {
            creampiePrevPage.addEventListener('click', function() {
                if (creampieSearch.page > 1) {
                    creampieSearch.page--;
                    loadCreampieVideos();
                }
            });
        }

        if (creampieNextPage) {
            creampieNextPage.addEventListener('click', function() {
                if (creampieSearch.page < creampieResults.total_pages) {
                    creampieSearch.page++;
                    loadCreampieVideos();
                }
            });
        }
    } catch (err) {
        console.error('Creampie event listener setup failed:', err);
    }
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

// Load Creampie videos
async function loadCreampieVideos() {
    showCreampieLoading();

    try {
        const params = new URLSearchParams({
            query: creampieSearch.query,
            per_page: creampieSearch.per_page,
            page: creampieSearch.page,
            thumbsize: creampieSearch.thumbsize,
            order: creampieSearch.order,
            gay: creampieSearch.gay,
            format: 'json'
        });

        console.log('Fetching creampie videos with params:', params.toString());

        const data = await fetchWithRetry(`${API_BASE_URL}/video/search/?${params}`);

        creampieResults = {
            videos: data.videos || [],
            total_count: data.total_count || 0,
            total_pages: data.total_pages || 0,
            current_page: data.page || 1
        };

        console.log(`Loaded ${creampieResults.videos.length} creampie videos`);
        displayCreampieResults();
        updateCreampiePagination();

    } catch (error) {
        console.error('Creampie videos error:', error);
        showCreampieError(`Failed to fetch creampie videos: ${error.message}. Please try again later.`);
    }
}

// Display Creampie videos results
function displayCreampieResults() {
    hideCreampieLoading();
    hideCreampieError();
    showCreampieResultsHeader();

    if (creampieResults.videos.length === 0) {
        showCreampieError('No creampie videos found.');
        return;
    }

    creampieVideoGrid.innerHTML = '';

    creampieResults.videos.forEach(video => {
        const videoCard = createCreampieVideoCard(video);
        creampieVideoGrid.appendChild(videoCard);
    });
}

// Create a video card for Creampie videos
function createCreampieVideoCard(video) {
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
            thumbsize: creampieSearch.thumbsize,
            format: 'json'
        });

        const video = await fetchWithRetry(`${API_BASE_URL}/video/id/?${params}`);

        if (!video || video.length === 0) {
            showCreampieError('Video not found or has been removed.');
            return;
        }

        playVideoInline(video);
    } catch (error) {
        console.error('Video player error:', error);
        showCreampieError('Failed to load video player.');
    }
}

// Update Creampie videos pagination controls
function updateCreampiePagination() {
    creampieCurrentPageSpan.textContent = creampieResults.current_page;
    creampieTotalPagesSpan.textContent = creampieResults.total_pages;

    creampiePrevPage.disabled = creampieSearch.page <= 1;
    creampieNextPage.disabled = creampieSearch.page >= creampieResults.total_pages;

    creampiePagination.style.display = creampieResults.total_pages > 1 ? 'flex' : 'none';
}

// Creampie videos UI Helper Functions
function showCreampieLoading() {
    creampieLoading.style.display = 'block';
    creampieError.style.display = 'none';
    creampieResultsHeader.style.display = 'none';
    creampiePagination.style.display = 'none';
}

function hideCreampieLoading() {
    creampieLoading.style.display = 'none';
}

function showCreampieError(message) {
    hideCreampieLoading();
    creampieErrorMessage.textContent = message;
    creampieError.style.display = 'block';
    creampieResultsHeader.style.display = 'none';
    creampiePagination.style.display = 'none';
    creampieVideoGrid.innerHTML = '';
}

function hideCreampieError() {
    creampieError.style.display = 'none';
}

function showCreampieResultsHeader() {
    const orderText = getOrderText(creampieSearch.order);
    creampieResultsInfo.textContent = `Showing ${orderText} creampie videos - ${formatNumber(creampieResults.total_count)} total results`;
    creampieResultsHeader.style.display = 'block';
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
