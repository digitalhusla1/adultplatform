// API Configuration
const API_BASE_URL = 'https://www.eporner.com/api/v2';
const DEFAULT_PER_PAGE = 12; // Reduced for faster loading
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// DOM Elements
let ebonyOrderSelect, ebonyThumbsizeSelect, ebonyGayContent;
let ebonyLoading, ebonyError, ebonyErrorMessage;
let ebonyResultsHeader, ebonyResultsInfo, ebonyVideoGrid;
let ebonyPagination, ebonyPrevPage, ebonyNextPage;
let ebonyCurrentPageSpan, ebonyTotalPagesSpan;

// State Management
let ebonySearch = {
    query: 'ebony',
    page: 1,
    order: 'latest',
    thumbsize: 'medium',
    gay: 0,
    per_page: DEFAULT_PER_PAGE
};

let ebonyResults = {
    videos: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing Ebony Page');

    // Initialize DOM elements after DOM is loaded
    ebonyOrderSelect = document.getElementById('ebonyOrderSelect');
    ebonyThumbsizeSelect = document.getElementById('ebonyThumbsizeSelect');
    ebonyGayContent = document.getElementById('ebonyGayContent');
    ebonyLoading = document.getElementById('ebonyLoading');
    ebonyError = document.getElementById('ebonyError');
    ebonyErrorMessage = document.getElementById('ebonyErrorMessage');
    ebonyResultsHeader = document.getElementById('ebonyResultsHeader');
    ebonyResultsInfo = document.getElementById('ebonyResultsInfo');
    ebonyVideoGrid = document.getElementById('ebonyVideoGrid');
    ebonyPagination = document.getElementById('ebonyPagination');
    ebonyPrevPage = document.getElementById('ebonyPrevPage');
    ebonyNextPage = document.getElementById('ebonyNextPage');
    ebonyCurrentPageSpan = document.getElementById('ebonyCurrentPage');
    ebonyTotalPagesSpan = document.getElementById('ebonyTotalPages');

    initializeEventListeners();
    loadEbonyVideos();
});

// Event Listeners
function initializeEventListeners() {
    ebonyOrderSelect.addEventListener('change', function() {
        ebonySearch.order = this.value;
        ebonySearch.page = 1;
        loadEbonyVideos();
    });

    ebonyThumbsizeSelect.addEventListener('change', function() {
        ebonySearch.thumbsize = this.value;
        loadEbonyVideos();
    });

    ebonyGayContent.addEventListener('change', function() {
        ebonySearch.gay = this.checked ? 1 : 0;
        ebonySearch.page = 1;
        loadEbonyVideos();
    });

    ebonyPrevPage.addEventListener('click', function() {
        if (ebonySearch.page > 1) {
            ebonySearch.page--;
            loadEbonyVideos();
        }
    });

    ebonyNextPage.addEventListener('click', function() {
        if (ebonySearch.page < ebonyResults.total_pages) {
            ebonySearch.page++;
            loadEbonyVideos();
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

// Load Ebony videos
async function loadEbonyVideos() {
    showEbonyLoading();

    try {
        const params = new URLSearchParams({
            query: ebonySearch.query,
            per_page: ebonySearch.per_page,
            page: ebonySearch.page,
            thumbsize: ebonySearch.thumbsize,
            order: ebonySearch.order,
            gay: ebonySearch.gay,
            format: 'json'
        });

        console.log('Fetching ebony videos with params:', params.toString());

        const data = await fetchWithRetry(`${API_BASE_URL}/video/search/?${params}`);

        ebonyResults = {
            videos: data.videos || [],
            total_count: data.total_count || 0,
            total_pages: data.total_pages || 0,
            current_page: data.page || 1
        };

        console.log(`Loaded ${ebonyResults.videos.length} ebony videos`);
        displayEbonyResults();
        updateEbonyPagination();

    } catch (error) {
        console.error('Ebony videos error:', error);
        showEbonyError(`Failed to fetch ebony videos: ${error.message}. Please try again later.`);
    }
}

// Display Ebony videos results
function displayEbonyResults() {
    hideEbonyLoading();
    hideEbonyError();
    showEbonyResultsHeader();

    if (ebonyResults.videos.length === 0) {
        showEbonyError('No ebony videos found.');
        return;
    }

    ebonyVideoGrid.innerHTML = '';

    ebonyResults.videos.forEach(video => {
        const videoCard = createEbonyVideoCard(video);
        ebonyVideoGrid.appendChild(videoCard);
    });
}

// Create a video card for Ebony videos
function createEbonyVideoCard(video) {
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
        window.location.href = `index.html?video=${videoId}&category=Ebony`;
    } catch (error) {
        console.error('Video player error:', error);
        showEbonyError('Failed to load video player.');
    }
}

// Update Ebony videos pagination controls
function updateEbonyPagination() {
    ebonyCurrentPageSpan.textContent = ebonyResults.current_page;
    ebonyTotalPagesSpan.textContent = ebonyResults.total_pages;

    ebonyPrevPage.disabled = ebonySearch.page <= 1;
    ebonyNextPage.disabled = ebonySearch.page >= ebonyResults.total_pages;

    ebonyPagination.style.display = ebonyResults.total_pages > 1 ? 'flex' : 'none';
}

// Ebony videos UI Helper Functions
function showEbonyLoading() {
    ebonyLoading.style.display = 'block';
    ebonyError.style.display = 'none';
    ebonyResultsHeader.style.display = 'none';
    ebonyPagination.style.display = 'none';
}

function hideEbonyLoading() {
    ebonyLoading.style.display = 'none';
}

function showEbonyError(message) {
    hideEbonyLoading();
    ebonyErrorMessage.textContent = message;
    ebonyError.style.display = 'block';
    ebonyResultsHeader.style.display = 'none';
    ebonyPagination.style.display = 'none';
    ebonyVideoGrid.innerHTML = '';
}

function hideEbonyError() {
    ebonyError.style.display = 'none';
}

function showEbonyResultsHeader() {
    const orderText = getOrderText(ebonySearch.order);
    ebonyResultsInfo.textContent = `Showing ${orderText} ebony videos - ${formatNumber(ebonyResults.total_count)} total results`;
    ebonyResultsHeader.style.display = 'block';
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
