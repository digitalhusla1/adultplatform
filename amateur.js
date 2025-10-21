// API Configuration
const API_BASE_URL = 'https://www.eporner.com/api/v2';
const DEFAULT_PER_PAGE = 12; // Reduced for faster loading
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// DOM Elements
let amateurOrderSelect, amateurThumbsizeSelect, amateurGayContent;
let amateurLoading, amateurError, amateurErrorMessage;
let amateurResultsHeader, amateurResultsInfo, amateurVideoGrid;
let amateurPagination, amateurPrevPage, amateurNextPage;
let amateurCurrentPageSpan, amateurTotalPagesSpan;

// State Management
let amateurSearch = {
    query: 'amateur',
    page: 1,
    order: 'latest',
    thumbsize: 'medium',
    gay: 0,
    per_page: DEFAULT_PER_PAGE
};

let amateurResults = {
    videos: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing Amateur Page');

    // Initialize DOM elements after DOM is loaded
    amateurOrderSelect = document.getElementById('amateurOrderSelect');
    amateurThumbsizeSelect = document.getElementById('amateurThumbsizeSelect');
    amateurGayContent = document.getElementById('amateurGayContent');
    amateurLoading = document.getElementById('amateurLoading');
    amateurError = document.getElementById('amateurError');
    amateurErrorMessage = document.getElementById('amateurErrorMessage');
    amateurResultsHeader = document.getElementById('amateurResultsHeader');
    amateurResultsInfo = document.getElementById('amateurResultsInfo');
    amateurVideoGrid = document.getElementById('amateurVideoGrid');
    amateurPagination = document.getElementById('amateurPagination');
    amateurPrevPage = document.getElementById('amateurPrevPage');
    amateurNextPage = document.getElementById('amateurNextPage');
    amateurCurrentPageSpan = document.getElementById('amateurCurrentPage');
    amateurTotalPagesSpan = document.getElementById('amateurTotalPages');

    initializeEventListeners();
    loadAmateurVideos();
});

// Event Listeners
function initializeEventListeners() {
    amateurOrderSelect.addEventListener('change', function() {
        amateurSearch.order = this.value;
        amateurSearch.page = 1;
        loadAmateurVideos();
    });

    amateurThumbsizeSelect.addEventListener('change', function() {
        amateurSearch.thumbsize = this.value;
        loadAmateurVideos();
    });

    amateurGayContent.addEventListener('change', function() {
        amateurSearch.gay = this.checked ? 1 : 0;
        amateurSearch.page = 1;
        loadAmateurVideos();
    });

    amateurPrevPage.addEventListener('click', function() {
        if (amateurSearch.page > 1) {
            amateurSearch.page--;
            loadAmateurVideos();
        }
    });

    amateurNextPage.addEventListener('click', function() {
        if (amateurSearch.page < amateurResults.total_pages) {
            amateurSearch.page++;
            loadAmateurVideos();
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

// Load Amateur videos
async function loadAmateurVideos() {
    showAmateurLoading();

    try {
        const params = new URLSearchParams({
            query: amateurSearch.query,
            per_page: amateurSearch.per_page,
            page: amateurSearch.page,
            thumbsize: amateurSearch.thumbsize,
            order: amateurSearch.order,
            gay: amateurSearch.gay,
            format: 'json'
        });

        console.log('Fetching amateur videos with params:', params.toString());

        const data = await fetchWithRetry(`${API_BASE_URL}/video/search/?${params}`);

        amateurResults = {
            videos: data.videos || [],
            total_count: data.total_count || 0,
            total_pages: data.total_pages || 0,
            current_page: data.page || 1
        };

        console.log(`Loaded ${amateurResults.videos.length} amateur videos`);
        displayAmateurResults();
        updateAmateurPagination();

    } catch (error) {
        console.error('Amateur videos error:', error);
        showAmateurError(`Failed to fetch amateur videos: ${error.message}. Please try again later.`);
    }
}

// Display Amateur videos results
function displayAmateurResults() {
    hideAmateurLoading();
    hideAmateurError();
    showAmateurResultsHeader();

    if (amateurResults.videos.length === 0) {
        showAmateurError('No amateur videos found.');
        return;
    }

    amateurVideoGrid.innerHTML = '';

    amateurResults.videos.forEach(video => {
        const videoCard = createAmateurVideoCard(video);
        amateurVideoGrid.appendChild(videoCard);
    });
}

// Create a video card for Amateur videos
function createAmateurVideoCard(video) {
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
        window.location.href = `index.html?video=${videoId}&category=Amateur`;
    } catch (error) {
        console.error('Video player error:', error);
        showAmateurError('Failed to load video player.');
    }
}

// Update Amateur videos pagination controls
function updateAmateurPagination() {
    amateurCurrentPageSpan.textContent = amateurResults.current_page;
    amateurTotalPagesSpan.textContent = amateurResults.total_pages;

    amateurPrevPage.disabled = amateurSearch.page <= 1;
    amateurNextPage.disabled = amateurSearch.page >= amateurResults.total_pages;

    amateurPagination.style.display = amateurResults.total_pages > 1 ? 'flex' : 'none';
}

// Amateur videos UI Helper Functions
function showAmateurLoading() {
    amateurLoading.style.display = 'block';
    amateurError.style.display = 'none';
    amateurResultsHeader.style.display = 'none';
    amateurPagination.style.display = 'none';
}

function hideAmateurLoading() {
    amateurLoading.style.display = 'none';
}

function showAmateurError(message) {
    hideAmateurLoading();
    amateurErrorMessage.textContent = message;
    amateurError.style.display = 'block';
    amateurResultsHeader.style.display = 'none';
    amateurPagination.style.display = 'none';
    amateurVideoGrid.innerHTML = '';
}

function hideAmateurError() {
    amateurError.style.display = 'none';
}

function showAmateurResultsHeader() {
    const orderText = getOrderText(amateurSearch.order);
    amateurResultsInfo.textContent = `Showing ${orderText} amateur videos - ${formatNumber(amateurResults.total_count)} total results`;
    amateurResultsHeader.style.display = 'block';
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
