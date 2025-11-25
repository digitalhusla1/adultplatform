// API Configuration
const API_BASE_URL = 'https://www.eporner.com/api/v2';
const DEFAULT_PER_PAGE = 12; // Reduced for faster loading
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// DOM Elements
let threesomeOrderSelect, threesomeThumbsizeSelect, threesomeGayContent;
let threesomeLoading, threesomeError, threesomeErrorMessage;
let threesomeResultsHeader, threesomeResultsInfo, threesomeVideoGrid;
let threesomePagination, threesomePrevPage, threesomeNextPage;
let threesomeCurrentPageSpan, threesomeTotalPagesSpan;

// State Management
let threesomeSearch = {
    query: 'threesome',
    page: 1,
    order: 'latest',
    thumbsize: 'medium',
    gay: 0,
    per_page: DEFAULT_PER_PAGE
};

let threesomeResults = {
    videos: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('DOM Content Loaded - Initializing Threesome Page');

        // Initialize DOM elements after DOM is loaded
        threesomeOrderSelect = document.getElementById('threesomeOrderSelect');
        threesomeThumbsizeSelect = document.getElementById('threesomeThumbsizeSelect');
        threesomeGayContent = document.getElementById('threesomeGayContent');
        threesomeLoading = document.getElementById('threesomeLoading');
        threesomeError = document.getElementById('threesomeError');
        threesomeErrorMessage = document.getElementById('threesomeErrorMessage');
        threesomeResultsHeader = document.getElementById('threesomeResultsHeader');
        threesomeResultsInfo = document.getElementById('threesomeResultsInfo');
        threesomeVideoGrid = document.getElementById('threesomeVideoGrid');
        threesomePagination = document.getElementById('threesomePagination');
        threesomePrevPage = document.getElementById('threesomePrevPage');
        threesomeNextPage = document.getElementById('threesomeNextPage');
        threesomeCurrentPageSpan = document.getElementById('threesomeCurrentPage');
        threesomeTotalPagesSpan = document.getElementById('threesomeTotalPages');

        if (!threesomeVideoGrid || !threesomeLoading) {
            console.warn('Threesome page required elements not found — skipping initialization.');
            return;
        }

        initializeEventListeners();
        loadThreesomeVideos();
    } catch (err) {
        console.error('Threesome page initialization failed:', err);
    }
});

// Event Listeners
function initializeEventListeners() {
    try {
        if (threesomeOrderSelect) {
            threesomeOrderSelect.addEventListener('change', function() {
                threesomeSearch.order = this.value;
                threesomeSearch.page = 1;
                loadThreesomeVideos();
            });
        }

        if (threesomeThumbsizeSelect) {
            threesomeThumbsizeSelect.addEventListener('change', function() {
                threesomeSearch.thumbsize = this.value;
                loadThreesomeVideos();
            });
        }

        if (threesomeGayContent) {
            threesomeGayContent.addEventListener('change', function() {
                threesomeSearch.gay = this.checked ? 1 : 0;
                threesomeSearch.page = 1;
                loadThreesomeVideos();
            });
        }

        if (threesomePrevPage) {
            threesomePrevPage.addEventListener('click', function() {
                if (threesomeSearch.page > 1) {
                    threesomeSearch.page--;
                    loadThreesomeVideos();
                }
            });
        }

        if (threesomeNextPage) {
            threesomeNextPage.addEventListener('click', function() {
                if (threesomeSearch.page < threesomeResults.total_pages) {
                    threesomeSearch.page++;
                    loadThreesomeVideos();
                }
            });
        }
    } catch (err) {
        console.error('Threesome event listener setup failed:', err);
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

// Load Threesome videos
async function loadThreesomeVideos() {
    showThreesomeLoading();

    try {
        const params = new URLSearchParams({
            query: threesomeSearch.query,
            per_page: threesomeSearch.per_page,
            page: threesomeSearch.page,
            thumbsize: threesomeSearch.thumbsize,
            order: threesomeSearch.order,
            gay: threesomeSearch.gay,
            format: 'json'
        });

        console.log('Fetching threesome videos with params:', params.toString());

        const data = await fetchWithRetry(`${API_BASE_URL}/video/search/?${params}`);

        threesomeResults = {
            videos: data.videos || [],
            total_count: data.total_count || 0,
            total_pages: data.total_pages || 0,
            current_page: data.page || 1
        };

        console.log(`Loaded ${threesomeResults.videos.length} threesome videos`);
        displayThreesomeResults();
        updateThreesomePagination();

    } catch (error) {
        console.error('Threesome videos error:', error);
        showThreesomeError(`Failed to fetch threesome videos: ${error.message}. Please try again later.`);
    }
}

// Display Threesome videos results
function displayThreesomeResults() {
    hideThreesomeLoading();
    hideThreesomeError();
    showThreesomeResultsHeader();

    if (threesomeResults.videos.length === 0) {
        showThreesomeError('No threesome videos found.');
        return;
    }

    threesomeVideoGrid.innerHTML = '';

    threesomeResults.videos.forEach(video => {
        const videoCard = createThreesomeVideoCard(video);
        threesomeVideoGrid.appendChild(videoCard);
    });
}

// Create a video card for Threesome videos
function createThreesomeVideoCard(video) {
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
            thumbsize: threesomeSearch.thumbsize,
            format: 'json'
        });

        const video = await fetchWithRetry(`${API_BASE_URL}/video/id/?${params}`);

        if (!video || video.length === 0) {
            showThreesomeError('Video not found or has been removed.');
            return;
        }

        playVideoInline(video);
    } catch (error) {
        console.error('Video player error:', error);
        showThreesomeError('Failed to load video player.');
    }
}

// Update Threesome videos pagination controls
function updateThreesomePagination() {
    threesomeCurrentPageSpan.textContent = threesomeResults.current_page;
    threesomeTotalPagesSpan.textContent = threesomeResults.total_pages;

    threesomePrevPage.disabled = threesomeSearch.page <= 1;
    threesomeNextPage.disabled = threesomeSearch.page >= threesomeResults.total_pages;

    threesomePagination.style.display = threesomeResults.total_pages > 1 ? 'flex' : 'none';
}

// Threesome videos UI Helper Functions
function showThreesomeLoading() {
    threesomeLoading.style.display = 'block';
    threesomeError.style.display = 'none';
    threesomeResultsHeader.style.display = 'none';
    threesomePagination.style.display = 'none';
}

function hideThreesomeLoading() {
    threesomeLoading.style.display = 'none';
}

function showThreesomeError(message) {
    hideThreesomeLoading();
    threesomeErrorMessage.textContent = message;
    threesomeError.style.display = 'block';
    threesomeResultsHeader.style.display = 'none';
    threesomePagination.style.display = 'none';
    threesomeVideoGrid.innerHTML = '';
}

function hideThreesomeError() {
    threesomeError.style.display = 'none';
}

function showThreesomeResultsHeader() {
    const orderText = getOrderText(threesomeSearch.order);
    threesomeResultsInfo.textContent = `Showing ${orderText} threesome videos - ${formatNumber(threesomeResults.total_count)} total results`;
    threesomeResultsHeader.style.display = 'block';
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
