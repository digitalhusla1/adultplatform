// API Configuration
const API_BASE_URL = 'https://www.eporner.com/api/v2';
const DEFAULT_PER_PAGE = 12; // Reduced for faster loading
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// DOM Elements
let lesbianOrderSelect, lesbianThumbsizeSelect, lesbianGayContent;
let lesbianLoading, lesbianError, lesbianErrorMessage;
let lesbianResultsHeader, lesbianResultsInfo, lesbianVideoGrid;
let lesbianPagination, lesbianPrevPage, lesbianNextPage;
let lesbianCurrentPageSpan, lesbianTotalPagesSpan;

// State Management
let lesbianSearch = {
    query: 'lesbian',
    page: 1,
    order: 'latest',
    thumbsize: 'medium',
    gay: 0,
    per_page: DEFAULT_PER_PAGE
};

let lesbianResults = {
    videos: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('DOM Content Loaded - Initializing Lesbian Page');

        // Initialize DOM elements after DOM is loaded
        lesbianOrderSelect = document.getElementById('lesbianOrderSelect');
        lesbianThumbsizeSelect = document.getElementById('lesbianThumbsizeSelect');
        lesbianGayContent = document.getElementById('lesbianGayContent');
        lesbianLoading = document.getElementById('lesbianLoading');
        lesbianError = document.getElementById('lesbianError');
        lesbianErrorMessage = document.getElementById('lesbianErrorMessage');
        lesbianResultsHeader = document.getElementById('lesbianResultsHeader');
        lesbianResultsInfo = document.getElementById('lesbianResultsInfo');
        lesbianVideoGrid = document.getElementById('lesbianVideoGrid');
        lesbianPagination = document.getElementById('lesbianPagination');
        lesbianPrevPage = document.getElementById('lesbianPrevPage');
        lesbianNextPage = document.getElementById('lesbianNextPage');
        lesbianCurrentPageSpan = document.getElementById('lesbianCurrentPage');
        lesbianTotalPagesSpan = document.getElementById('lesbianTotalPages');

        if (!lesbianVideoGrid || !lesbianLoading) {
            console.warn('Lesbian page required elements not found — skipping initialization.');
            return;
        }

        initializeEventListeners();
        loadLesbianVideos();
    } catch (err) {
        console.error('Lesbian page initialization failed:', err);
    }
});

// Event Listeners
function initializeEventListeners() {
    try {
        if (lesbianOrderSelect) {
            lesbianOrderSelect.addEventListener('change', function() {
                lesbianSearch.order = this.value;
                lesbianSearch.page = 1;
                loadLesbianVideos();
            });
        }

        if (lesbianThumbsizeSelect) {
            lesbianThumbsizeSelect.addEventListener('change', function() {
                lesbianSearch.thumbsize = this.value;
                loadLesbianVideos();
            });
        }

        if (lesbianGayContent) {
            lesbianGayContent.addEventListener('change', function() {
                lesbianSearch.gay = this.checked ? 1 : 0;
                lesbianSearch.page = 1;
                loadLesbianVideos();
            });
        }

        if (lesbianPrevPage) {
            lesbianPrevPage.addEventListener('click', function() {
                if (lesbianSearch.page > 1) {
                    lesbianSearch.page--;
                    loadLesbianVideos();
                }
            });
        }

        if (lesbianNextPage) {
            lesbianNextPage.addEventListener('click', function() {
                if (lesbianSearch.page < lesbianResults.total_pages) {
                    lesbianSearch.page++;
                    loadLesbianVideos();
                }
            });
        }
    } catch (err) {
        console.error('Lesbian event listener setup failed:', err);
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

// Load Lesbian videos
async function loadLesbianVideos() {
    showLesbianLoading();

    try {
        const params = new URLSearchParams({
            query: lesbianSearch.query,
            per_page: lesbianSearch.per_page,
            page: lesbianSearch.page,
            thumbsize: lesbianSearch.thumbsize,
            order: lesbianSearch.order,
            gay: lesbianSearch.gay,
            format: 'json'
        });

        console.log('Fetching lesbian videos with params:', params.toString());

        const data = await fetchWithRetry(`${API_BASE_URL}/video/search/?${params}`);

        lesbianResults = {
            videos: data.videos || [],
            total_count: data.total_count || 0,
            total_pages: data.total_pages || 0,
            current_page: data.page || 1
        };

        console.log(`Loaded ${lesbianResults.videos.length} lesbian videos`);
        displayLesbianResults();
        updateLesbianPagination();

    } catch (error) {
        console.error('Lesbian videos error:', error);
        showLesbianError(`Failed to fetch lesbian videos: ${error.message}. Please try again later.`);
    }
}

// Display Lesbian videos results
function displayLesbianResults() {
    hideLesbianLoading();
    hideLesbianError();
    showLesbianResultsHeader();

    if (lesbianResults.videos.length === 0) {
        showLesbianError('No lesbian videos found.');
        return;
    }

    lesbianVideoGrid.innerHTML = '';

    lesbianResults.videos.forEach(video => {
        const videoCard = createLesbianVideoCard(video);
        lesbianVideoGrid.appendChild(videoCard);
    });
}

// Create a video card for Lesbian videos
function createLesbianVideoCard(video) {
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
            thumbsize: lesbianSearch.thumbsize,
            format: 'json'
        });

        const video = await fetchWithRetry(`${API_BASE_URL}/video/id/?${params}`);

        if (!video || video.length === 0) {
            showLesbianError('Video not found or has been removed.');
            return;
        }

        playVideoInline(video);
    } catch (error) {
        console.error('Video player error:', error);
        showLesbianError('Failed to load video player.');
    }
}

// Update Lesbian videos pagination controls
function updateLesbianPagination() {
    lesbianCurrentPageSpan.textContent = lesbianResults.current_page;
    lesbianTotalPagesSpan.textContent = lesbianResults.total_pages;

    lesbianPrevPage.disabled = lesbianSearch.page <= 1;
    lesbianNextPage.disabled = lesbianSearch.page >= lesbianResults.total_pages;

    lesbianPagination.style.display = lesbianResults.total_pages > 1 ? 'flex' : 'none';
}

// Lesbian videos UI Helper Functions
function showLesbianLoading() {
    lesbianLoading.style.display = 'block';
    lesbianError.style.display = 'none';
    lesbianResultsHeader.style.display = 'none';
    lesbianPagination.style.display = 'none';
}

function hideLesbianLoading() {
    lesbianLoading.style.display = 'none';
}

function showLesbianError(message) {
    hideLesbianLoading();
    lesbianErrorMessage.textContent = message;
    lesbianError.style.display = 'block';
    lesbianResultsHeader.style.display = 'none';
    lesbianPagination.style.display = 'none';
    lesbianVideoGrid.innerHTML = '';
}

function hideLesbianError() {
    lesbianError.style.display = 'none';
}

function showLesbianResultsHeader() {
    const orderText = getOrderText(lesbianSearch.order);
    lesbianResultsInfo.textContent = `Showing ${orderText} lesbian videos - ${formatNumber(lesbianResults.total_count)} total results`;
    lesbianResultsHeader.style.display = 'block';
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
