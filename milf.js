// API Configuration
const API_BASE_URL = 'https://www.eporner.com/api/v2';
const DEFAULT_PER_PAGE = 12; // Reduced for faster loading
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// DOM Elements
let milfOrderSelect, milfThumbsizeSelect, milfGayContent;
let milfLoading, milfError, milfErrorMessage;
let milfResultsHeader, milfResultsInfo, milfVideoGrid;
let milfPagination, milfPrevPage, milfNextPage;
let milfCurrentPageSpan, milfTotalPagesSpan;

// State Management
let milfSearch = {
    query: 'milf',
    page: 1,
    order: 'latest',
    thumbsize: 'medium',
    gay: 0,
    per_page: DEFAULT_PER_PAGE
};

let milfResults = {
    videos: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('DOM Content Loaded - Initializing MILF Page');

        // Initialize DOM elements after DOM is loaded
        milfOrderSelect = document.getElementById('milfOrderSelect');
        milfThumbsizeSelect = document.getElementById('milfThumbsizeSelect');
        milfGayContent = document.getElementById('milfGayContent');
        milfLoading = document.getElementById('milfLoading');
        milfError = document.getElementById('milfError');
        milfErrorMessage = document.getElementById('milfErrorMessage');
        milfResultsHeader = document.getElementById('milfResultsHeader');
        milfResultsInfo = document.getElementById('milfResultsInfo');
        milfVideoGrid = document.getElementById('milfVideoGrid');
        milfPagination = document.getElementById('milfPagination');
        milfPrevPage = document.getElementById('milfPrevPage');
        milfNextPage = document.getElementById('milfNextPage');
        milfCurrentPageSpan = document.getElementById('milfCurrentPage');
        milfTotalPagesSpan = document.getElementById('milfTotalPages');

        if (!milfVideoGrid || !milfLoading) {
            console.warn('MILF page required elements not found — skipping initialization.');
            return;
        }

        initializeEventListeners();
        loadMilfVideos();
    } catch (err) {
        console.error('MILF page initialization failed:', err);
    }
});

// Event Listeners
function initializeEventListeners() {
    try {
        if (milfOrderSelect) {
            milfOrderSelect.addEventListener('change', function() {
                milfSearch.order = this.value;
                milfSearch.page = 1;
                loadMilfVideos();
            });
        }

        if (milfThumbsizeSelect) {
            milfThumbsizeSelect.addEventListener('change', function() {
                milfSearch.thumbsize = this.value;
                loadMilfVideos();
            });
        }

        if (milfGayContent) {
            milfGayContent.addEventListener('change', function() {
                milfSearch.gay = this.checked ? 1 : 0;
                milfSearch.page = 1;
                loadMilfVideos();
            });
        }

        if (milfPrevPage) {
            milfPrevPage.addEventListener('click', function() {
                if (milfSearch.page > 1) {
                    milfSearch.page--;
                    loadMilfVideos();
                }
            });
        }

        if (milfNextPage) {
            milfNextPage.addEventListener('click', function() {
                if (milfSearch.page < milfResults.total_pages) {
                    milfSearch.page++;
                    loadMilfVideos();
                }
            });
        }
    } catch (err) {
        console.error('MILF event listener setup failed:', err);
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

// Load MILF videos with enhanced error handling
async function loadMilfVideos() {
    showMilfLoading();

    try {
        const params = new URLSearchParams({
            query: milfSearch.query,
            per_page: milfSearch.per_page,
            page: milfSearch.page,
            thumbsize: milfSearch.thumbsize,
            order: milfSearch.order,
            gay: milfSearch.gay,
            format: 'json'
        });

        console.log('Fetching MILF videos with params:', params.toString());

        const data = await fetchWithRetry(`${API_BASE_URL}/video/search/?${params}`);

        milfResults = {
            videos: data.videos || [],
            total_count: data.total_count || 0,
            total_pages: data.total_pages || 0,
            current_page: data.page || 1
        };

        console.log(`Loaded ${milfResults.videos.length} MILF videos`);
        displayMilfResults();
        updateMilfPagination();

    } catch (error) {
        console.error('MILF videos error:', error);
        showMilfError(`Failed to fetch MILF videos: ${error.message}. Please try again later.`);
    }
}

// Display MILF videos results
function displayMilfResults() {
    hideMilfLoading();
    hideMilfError();
    showMilfResultsHeader();

    if (milfResults.videos.length === 0) {
        showMilfError('No MILF videos found.');
        return;
    }

    milfVideoGrid.innerHTML = '';

    milfResults.videos.forEach(video => {
        const videoCard = createMilfVideoCard(video);
        milfVideoGrid.appendChild(videoCard);
    });
}

// Create a video card for MILF videos
function createMilfVideoCard(video) {
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
            thumbsize: milfSearch.thumbsize,
            format: 'json'
        });

        const video = await fetchWithRetry(`${API_BASE_URL}/video/id/?${params}`);

        if (!video || video.length === 0) {
            showMilfError('Video not found or has been removed.');
            return;
        }

        playVideoInline(video);
    } catch (error) {
        console.error('Video player error:', error);
        showMilfError('Failed to load video player.');
    }
}

// Update MILF videos pagination controls
function updateMilfPagination() {
    milfCurrentPageSpan.textContent = milfResults.current_page;
    milfTotalPagesSpan.textContent = milfResults.total_pages;

    milfPrevPage.disabled = milfSearch.page <= 1;
    milfNextPage.disabled = milfSearch.page >= milfResults.total_pages;

    milfPagination.style.display = milfResults.total_pages > 1 ? 'flex' : 'none';
}

// MILF videos UI Helper Functions
function showMilfLoading() {
    milfLoading.style.display = 'block';
    milfError.style.display = 'none';
    milfResultsHeader.style.display = 'none';
    milfPagination.style.display = 'none';
}

function hideMilfLoading() {
    milfLoading.style.display = 'none';
}

function showMilfError(message) {
    hideMilfLoading();
    milfErrorMessage.textContent = message;
    milfError.style.display = 'block';
    milfResultsHeader.style.display = 'none';
    milfPagination.style.display = 'none';
    milfVideoGrid.innerHTML = '';
}

function hideMilfError() {
    milfError.style.display = 'none';
}

function showMilfResultsHeader() {
    const orderText = getOrderText(milfSearch.order);
    milfResultsInfo.textContent = `Showing ${orderText} MILF videos - ${formatNumber(milfResults.total_count)} total results`;
    milfResultsHeader.style.display = 'block';
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
