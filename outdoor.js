// API Configuration
const API_BASE_URL = 'https://www.eporner.com/api/v2';
const DEFAULT_PER_PAGE = 12; // Reduced for faster loading
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// DOM Elements
let outdoorOrderSelect, outdoorThumbsizeSelect, outdoorGayContent;
let outdoorLoading, outdoorError, outdoorErrorMessage;
let outdoorResultsHeader, outdoorResultsInfo, outdoorVideoGrid;
let outdoorPagination, outdoorPrevPage, outdoorNextPage;
let outdoorCurrentPageSpan, outdoorTotalPagesSpan;

// State Management
let outdoorSearch = {
    query: 'outdoor',
    page: 1,
    order: 'latest',
    thumbsize: 'medium',
    gay: 0,
    per_page: DEFAULT_PER_PAGE
};

let outdoorResults = {
    videos: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing Outdoor Page');

    // Initialize DOM elements after DOM is loaded
    outdoorOrderSelect = document.getElementById('outdoorOrderSelect');
    outdoorThumbsizeSelect = document.getElementById('outdoorThumbsizeSelect');
    outdoorGayContent = document.getElementById('outdoorGayContent');
    outdoorLoading = document.getElementById('outdoorLoading');
    outdoorError = document.getElementById('outdoorError');
    outdoorErrorMessage = document.getElementById('outdoorErrorMessage');
    outdoorResultsHeader = document.getElementById('outdoorResultsHeader');
    outdoorResultsInfo = document.getElementById('outdoorResultsInfo');
    outdoorVideoGrid = document.getElementById('outdoorVideoGrid');
    outdoorPagination = document.getElementById('outdoorPagination');
    outdoorPrevPage = document.getElementById('outdoorPrevPage');
    outdoorNextPage = document.getElementById('outdoorNextPage');
    outdoorCurrentPageSpan = document.getElementById('outdoorCurrentPage');
    outdoorTotalPagesSpan = document.getElementById('outdoorTotalPages');

    initializeEventListeners();
    loadOutdoorVideos();
});

// Event Listeners
function initializeEventListeners() {
    outdoorOrderSelect.addEventListener('change', function() {
        outdoorSearch.order = this.value;
        outdoorSearch.page = 1;
        loadOutdoorVideos();
    });

    outdoorThumbsizeSelect.addEventListener('change', function() {
        outdoorSearch.thumbsize = this.value;
        loadOutdoorVideos();
    });

    outdoorGayContent.addEventListener('change', function() {
        outdoorSearch.gay = this.checked ? 1 : 0;
        outdoorSearch.page = 1;
        loadOutdoorVideos();
    });

    outdoorPrevPage.addEventListener('click', function() {
        if (outdoorSearch.page > 1) {
            outdoorSearch.page--;
            loadOutdoorVideos();
        }
    });

    outdoorNextPage.addEventListener('click', function() {
        if (outdoorSearch.page < outdoorResults.total_pages) {
            outdoorSearch.page++;
            loadOutdoorVideos();
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

// Load Outdoor videos
async function loadOutdoorVideos() {
    showOutdoorLoading();

    try {
        const params = new URLSearchParams({
            query: outdoorSearch.query,
            per_page: outdoorSearch.per_page,
            page: outdoorSearch.page,
            thumbsize: outdoorSearch.thumbsize,
            order: outdoorSearch.order,
            gay: outdoorSearch.gay,
            format: 'json'
        });

        console.log('Fetching outdoor videos with params:', params.toString());

        const data = await fetchWithRetry(`${API_BASE_URL}/video/search/?${params}`);

        outdoorResults = {
            videos: data.videos || [],
            total_count: data.total_count || 0,
            total_pages: data.total_pages || 0,
            current_page: data.page || 1
        };

        console.log(`Loaded ${outdoorResults.videos.length} outdoor videos`);
        displayOutdoorResults();
        updateOutdoorPagination();

    } catch (error) {
        console.error('Outdoor videos error:', error);
        showOutdoorError(`Failed to fetch outdoor videos: ${error.message}. Please try again later.`);
    }
}

// Display Outdoor videos results
function displayOutdoorResults() {
    hideOutdoorLoading();
    hideOutdoorError();
    showOutdoorResultsHeader();

    if (outdoorResults.videos.length === 0) {
        showOutdoorError('No outdoor videos found.');
        return;
    }

    outdoorVideoGrid.innerHTML = '';

    outdoorResults.videos.forEach(video => {
        const videoCard = createOutdoorVideoCard(video);
        outdoorVideoGrid.appendChild(videoCard);
    });
}

// Create a video card for Outdoor videos
function createOutdoorVideoCard(video) {
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
        window.location.href = `index.html?video=${videoId}&category=Outdoor`;
    } catch (error) {
        console.error('Video player error:', error);
        showOutdoorError('Failed to load video player.');
    }
}

// Update Outdoor videos pagination controls
function updateOutdoorPagination() {
    outdoorCurrentPageSpan.textContent = outdoorResults.current_page;
    outdoorTotalPagesSpan.textContent = outdoorResults.total_pages;

    outdoorPrevPage.disabled = outdoorSearch.page <= 1;
    outdoorNextPage.disabled = outdoorSearch.page >= outdoorResults.total_pages;

    outdoorPagination.style.display = outdoorResults.total_pages > 1 ? 'flex' : 'none';
}

// Outdoor videos UI Helper Functions
function showOutdoorLoading() {
    outdoorLoading.style.display = 'block';
    outdoorError.style.display = 'none';
    outdoorResultsHeader.style.display = 'none';
    outdoorPagination.style.display = 'none';
}

function hideOutdoorLoading() {
    outdoorLoading.style.display = 'none';
}

function showOutdoorError(message) {
    hideOutdoorLoading();
    outdoorErrorMessage.textContent = message;
    outdoorError.style.display = 'block';
    outdoorResultsHeader.style.display = 'none';
    outdoorPagination.style.display = 'none';
    outdoorVideoGrid.innerHTML = '';
}

function hideOutdoorError() {
    outdoorError.style.display = 'none';
}

function showOutdoorResultsHeader() {
    const orderText = getOrderText(outdoorSearch.order);
    outdoorResultsInfo.textContent = `Showing ${orderText} outdoor videos - ${formatNumber(outdoorResults.total_count)} total results`;
    outdoorResultsHeader.style.display = 'block';
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
