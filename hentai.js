// API Configuration
const API_BASE_URL = 'https://www.eporner.com/api/v2';
const DEFAULT_PER_PAGE = 12; // Reduced for faster loading
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// DOM Elements
let hentaiOrderSelect, hentaiThumbsizeSelect, hentaiGayContent;
let hentaiLoading, hentaiError, hentaiErrorMessage;
let hentaiResultsHeader, hentaiResultsInfo, hentaiVideoGrid;
let hentaiPagination, hentaiPrevPage, hentaiNextPage;
let hentaiCurrentPageSpan, hentaiTotalPagesSpan;

// State Management
let hentaiSearch = {
    query: 'hentai',
    page: 1,
    order: 'latest',
    thumbsize: 'medium',
    gay: 0,
    per_page: DEFAULT_PER_PAGE
};

let hentaiResults = {
    videos: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('DOM Content Loaded - Initializing Hentai Page');

        // Initialize DOM elements after DOM is loaded
        hentaiOrderSelect = document.getElementById('hentaiOrderSelect');
        hentaiThumbsizeSelect = document.getElementById('hentaiThumbsizeSelect');
        hentaiGayContent = document.getElementById('hentaiGayContent');
        hentaiLoading = document.getElementById('hentaiLoading');
        hentaiError = document.getElementById('hentaiError');
        hentaiErrorMessage = document.getElementById('hentaiErrorMessage');
        hentaiResultsHeader = document.getElementById('hentaiResultsHeader');
        hentaiResultsInfo = document.getElementById('hentaiResultsInfo');
        hentaiVideoGrid = document.getElementById('hentaiVideoGrid');
        hentaiPagination = document.getElementById('hentaiPagination');
        hentaiPrevPage = document.getElementById('hentaiPrevPage');
        hentaiNextPage = document.getElementById('hentaiNextPage');
        hentaiCurrentPageSpan = document.getElementById('hentaiCurrentPage');
        hentaiTotalPagesSpan = document.getElementById('hentaiTotalPages');

        if (!hentaiVideoGrid || !hentaiLoading) {
            console.warn('Hentai page required elements not found — skipping initialization.');
            return;
        }

        initializeEventListeners();
        loadHentaiVideos();
    } catch (err) {
        console.error('Hentai page initialization failed:', err);
    }
});

// Event Listeners
function initializeEventListeners() {
    try {
        if (hentaiOrderSelect) {
            hentaiOrderSelect.addEventListener('change', function() {
                hentaiSearch.order = this.value;
                hentaiSearch.page = 1;
                loadHentaiVideos();
            });
        }

        if (hentaiThumbsizeSelect) {
            hentaiThumbsizeSelect.addEventListener('change', function() {
                hentaiSearch.thumbsize = this.value;
                loadHentaiVideos();
            });
        }

        if (hentaiGayContent) {
            hentaiGayContent.addEventListener('change', function() {
                hentaiSearch.gay = this.checked ? 1 : 0;
                hentaiSearch.page = 1;
                loadHentaiVideos();
            });
        }

        if (hentaiPrevPage) {
            hentaiPrevPage.addEventListener('click', function() {
                if (hentaiSearch.page > 1) {
                    hentaiSearch.page--;
                    loadHentaiVideos();
                }
            });
        }

        if (hentaiNextPage) {
            hentaiNextPage.addEventListener('click', function() {
                if (hentaiSearch.page < hentaiResults.total_pages) {
                    hentaiSearch.page++;
                    loadHentaiVideos();
                }
            });
        }
    } catch (err) {
        console.error('Hentai event listener setup failed:', err);
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

// Load Hentai videos
async function loadHentaiVideos() {
    showHentaiLoading();

    try {
        const params = new URLSearchParams({
            query: hentaiSearch.query,
            per_page: hentaiSearch.per_page,
            page: hentaiSearch.page,
            thumbsize: hentaiSearch.thumbsize,
            order: hentaiSearch.order,
            gay: hentaiSearch.gay,
            format: 'json'
        });

        console.log('Fetching hentai videos with params:', params.toString());

        const data = await fetchWithRetry(`${API_BASE_URL}/video/search/?${params}`);

        hentaiResults = {
            videos: data.videos || [],
            total_count: data.total_count || 0,
            total_pages: data.total_pages || 0,
            current_page: data.page || 1
        };

        console.log(`Loaded ${hentaiResults.videos.length} hentai videos`);
        displayHentaiResults();
        updateHentaiPagination();

    } catch (error) {
        console.error('Hentai videos error:', error);
        showHentaiError(`Failed to fetch hentai videos: ${error.message}. Please try again later.`);
    }
}

// Display Hentai videos results
function displayHentaiResults() {
    hideHentaiLoading();
    hideHentaiError();
    showHentaiResultsHeader();

    if (hentaiResults.videos.length === 0) {
        showHentaiError('No hentai videos found.');
        return;
    }

    hentaiVideoGrid.innerHTML = '';

    hentaiResults.videos.forEach(video => {
        const videoCard = createHentaiVideoCard(video);
        hentaiVideoGrid.appendChild(videoCard);
    });
}

// Create a video card for Hentai videos
function createHentaiVideoCard(video) {
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
            thumbsize: hentaiSearch.thumbsize,
            format: 'json'
        });

        const video = await fetchWithRetry(`${API_BASE_URL}/video/id/?${params}`);

        if (!video || video.length === 0) {
            showHentaiError('Video not found or has been removed.');
            return;
        }

        playVideoInline(video);
    } catch (error) {
        console.error('Video player error:', error);
        showHentaiError('Failed to load video player.');
    }
}

// Update Hentai videos pagination controls
function updateHentaiPagination() {
    hentaiCurrentPageSpan.textContent = hentaiResults.current_page;
    hentaiTotalPagesSpan.textContent = hentaiResults.total_pages;

    hentaiPrevPage.disabled = hentaiSearch.page <= 1;
    hentaiNextPage.disabled = hentaiSearch.page >= hentaiResults.total_pages;

    hentaiPagination.style.display = hentaiResults.total_pages > 1 ? 'flex' : 'none';
}

// Hentai videos UI Helper Functions
function showHentaiLoading() {
    hentaiLoading.style.display = 'block';
    hentaiError.style.display = 'none';
    hentaiResultsHeader.style.display = 'none';
    hentaiPagination.style.display = 'none';
}

function hideHentaiLoading() {
    hentaiLoading.style.display = 'none';
}

function showHentaiError(message) {
    hideHentaiLoading();
    hentaiErrorMessage.textContent = message;
    hentaiError.style.display = 'block';
    hentaiResultsHeader.style.display = 'none';
    hentaiPagination.style.display = 'none';
    hentaiVideoGrid.innerHTML = '';
}

function hideHentaiError() {
    hentaiError.style.display = 'none';
}

function showHentaiResultsHeader() {
    const orderText = getOrderText(hentaiSearch.order);
    hentaiResultsInfo.textContent = `Showing ${orderText} hentai videos - ${formatNumber(hentaiResults.total_count)} total results`;
    hentaiResultsHeader.style.display = 'block';
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
