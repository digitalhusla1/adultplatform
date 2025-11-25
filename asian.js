// API Configuration
const API_BASE_URL = 'https://www.eporner.com/api/v2';
const DEFAULT_PER_PAGE = 12; // Reduced for faster loading
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// DOM Elements
let asianOrderSelect, asianThumbsizeSelect, asianGayContent;
let asianLoading, asianError, asianErrorMessage;
let asianResultsHeader, asianResultsInfo, asianVideoGrid;
let asianPagination, asianPrevPage, asianNextPage;
let asianCurrentPageSpan, asianTotalPagesSpan;

// State Management
let asianSearch = {
    query: 'asian',
    page: 1,
    order: 'latest',
    thumbsize: 'medium',
    gay: 0,
    per_page: DEFAULT_PER_PAGE
};

let asianResults = {
    videos: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('DOM Content Loaded - Initializing Asian Page');

        // Initialize DOM elements after DOM is loaded
        asianOrderSelect = document.getElementById('asianOrderSelect');
        asianThumbsizeSelect = document.getElementById('asianThumbsizeSelect');
        asianGayContent = document.getElementById('asianGayContent');
        asianLoading = document.getElementById('asianLoading');
        asianError = document.getElementById('asianError');
        asianErrorMessage = document.getElementById('asianErrorMessage');
        asianResultsHeader = document.getElementById('asianResultsHeader');
        asianResultsInfo = document.getElementById('asianResultsInfo');
        asianVideoGrid = document.getElementById('asianVideoGrid');
        asianPagination = document.getElementById('asianPagination');
        asianPrevPage = document.getElementById('asianPrevPage');
        asianNextPage = document.getElementById('asianNextPage');
        asianCurrentPageSpan = document.getElementById('asianCurrentPage');
        asianTotalPagesSpan = document.getElementById('asianTotalPages');

        if (!asianVideoGrid || !asianLoading) {
            console.warn('Asian page required elements not found — skipping initialization.');
            return;
        }

        initializeEventListeners();
        loadAsianVideos();
    } catch (err) {
        console.error('Asian page initialization failed:', err);
    }
});

// Event Listeners
function initializeEventListeners() {
    try {
        if (asianOrderSelect) {
            asianOrderSelect.addEventListener('change', function() {
                asianSearch.order = this.value;
                asianSearch.page = 1;
                loadAsianVideos();
            });
        }

        if (asianThumbsizeSelect) {
            asianThumbsizeSelect.addEventListener('change', function() {
                asianSearch.thumbsize = this.value;
                loadAsianVideos();
            });
        }

        if (asianGayContent) {
            asianGayContent.addEventListener('change', function() {
                asianSearch.gay = this.checked ? 1 : 0;
                asianSearch.page = 1;
                loadAsianVideos();
            });
        }

        if (asianPrevPage) {
            asianPrevPage.addEventListener('click', function() {
                if (asianSearch.page > 1) {
                    asianSearch.page--;
                    loadAsianVideos();
                }
            });
        }

        if (asianNextPage) {
            asianNextPage.addEventListener('click', function() {
                if (asianSearch.page < asianResults.total_pages) {
                    asianSearch.page++;
                    loadAsianVideos();
                }
            });
        }
    } catch (err) {
        console.error('Asian event listener setup failed:', err);
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

// Load Asian videos
async function loadAsianVideos() {
    showAsianLoading();

    try {
        const params = new URLSearchParams({
            query: asianSearch.query,
            per_page: asianSearch.per_page,
            page: asianSearch.page,
            thumbsize: asianSearch.thumbsize,
            order: asianSearch.order,
            gay: asianSearch.gay,
            format: 'json'
        });

        console.log('Fetching Asian videos with params:', params.toString());

        const data = await fetchWithRetry(`${API_BASE_URL}/video/search/?${params}`);

        asianResults = {
            videos: data.videos || [],
            total_count: data.total_count || 0,
            total_pages: data.total_pages || 0,
            current_page: data.page || 1
        };

        console.log(`Loaded ${asianResults.videos.length} Asian videos`);
        displayAsianResults();
        updateAsianPagination();

    } catch (error) {
        console.error('Asian videos error:', error);
        showAsianError(`Failed to fetch Asian videos: ${error.message}. Please try again later.`);
    }
}

// Display Asian videos results
function displayAsianResults() {
    hideAsianLoading();
    hideAsianError();
    showAsianResultsHeader();

    if (asianResults.videos.length === 0) {
        showAsianError('No Asian videos found.');
        return;
    }

    asianVideoGrid.innerHTML = '';

    asianResults.videos.forEach(video => {
        const videoCard = createAsianVideoCard(video);
        asianVideoGrid.appendChild(videoCard);
    });
}

// Create a video card for Asian videos
function createAsianVideoCard(video) {
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
            thumbsize: asianSearch.thumbsize,
            format: 'json'
        });

        const video = await fetchWithRetry(`${API_BASE_URL}/video/id/?${params}`);

        if (!video || video.length === 0) {
            showAsianError('Video not found or has been removed.');
            return;
        }

        playVideoInline(video);
    } catch (error) {
        console.error('Video player error:', error);
        showAsianError('Failed to load video player.');
    }
}

// Update Asian videos pagination controls
function updateAsianPagination() {
    asianCurrentPageSpan.textContent = asianResults.current_page;
    asianTotalPagesSpan.textContent = asianResults.total_pages;

    asianPrevPage.disabled = asianSearch.page <= 1;
    asianNextPage.disabled = asianSearch.page >= asianResults.total_pages;

    asianPagination.style.display = asianResults.total_pages > 1 ? 'flex' : 'none';
}

// Asian videos UI Helper Functions
function showAsianLoading() {
    asianLoading.style.display = 'block';
    asianError.style.display = 'none';
    asianResultsHeader.style.display = 'none';
    asianPagination.style.display = 'none';
}

function hideAsianLoading() {
    asianLoading.style.display = 'none';
}

function showAsianError(message) {
    hideAsianLoading();
    asianErrorMessage.textContent = message;
    asianError.style.display = 'block';
    asianResultsHeader.style.display = 'none';
    asianPagination.style.display = 'none';
    asianVideoGrid.innerHTML = '';
}

function hideAsianError() {
    asianError.style.display = 'none';
}

function showAsianResultsHeader() {
    const orderText = getOrderText(asianSearch.order);
    asianResultsInfo.textContent = `Showing ${orderText} Asian videos - ${formatNumber(asianResults.total_count)} total results`;
    asianResultsHeader.style.display = 'block';
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
