// API Configuration
const API_BASE_URL = 'https://www.eporner.com/api/v2';
const DEFAULT_PER_PAGE = 20;
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const orderSelect = document.getElementById('orderSelect');
const thumbsizeSelect = document.getElementById('thumbsizeSelect');
const gayContent = document.getElementById('gayContent');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const resultsHeader = document.getElementById('resultsHeader');
const resultsInfo = document.getElementById('resultsInfo');
const videoGrid = document.getElementById('videoGrid');
const pagination = document.getElementById('pagination');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');
const totalPagesSpan = document.getElementById('totalPages');
const videoModal = document.getElementById('videoModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const videoDetails = document.getElementById('videoDetails');
const videoPlayerContainer = document.getElementById('videoPlayerContainer');
const videoPlayer = document.getElementById('videoPlayer');
const videoInfoPanel = document.getElementById('videoInfoPanel');

// State Management
let currentSearch = {
    query: '',
    page: 1,
    order: 'latest',
    thumbsize: 'medium',
    gay: 0,
    per_page: DEFAULT_PER_PAGE
};

let searchResults = {
    videos: [],
    total_count: 0,
    total_pages: 0,
    current_page: 1
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();

    // Check if video ID is provided in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('video');
    const categoryName = urlParams.get('category');

    if (videoId) {
        // If video ID is provided, play the video directly
        console.log('Video ID found in URL:', videoId, 'Category:', categoryName);
        showVideoDetails(videoId);
    } else {
        // Otherwise, perform initial search
        performInitialSearch();
    }
});

// Event Listeners
function initializeEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    orderSelect.addEventListener('change', function() {
        currentSearch.order = this.value;
        if (currentSearch.query) {
            searchVideos();
        }
    });

    thumbsizeSelect.addEventListener('change', function() {
        currentSearch.thumbsize = this.value;
        if (currentSearch.query) {
            searchVideos();
        }
    });

    gayContent.addEventListener('change', function() {
        currentSearch.gay = this.checked ? 1 : 0;
        if (currentSearch.query) {
            searchVideos();
        }
    });

    prevPage.addEventListener('click', function() {
        if (currentSearch.page > 1) {
            currentSearch.page--;
            searchVideos();
        }
    });

    nextPage.addEventListener('click', function() {
        if (currentSearch.page < searchResults.total_pages) {
            currentSearch.page++;
            searchVideos();
        }
    });

    modalClose.addEventListener('click', closeVideoModal);
    modalOverlay.addEventListener('click', closeVideoModal);

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && videoModal.style.display !== 'none') {
            closeVideoModal();
        }
    });
}

// Handle search button click
function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        currentSearch.query = query;
        currentSearch.page = 1;
        searchVideos();
    } else {
        showError('Please enter a search term');
    }
}

// Perform initial search with default query
function performInitialSearch() {
    currentSearch.query = 'all'; // Use 'all' to get all videos as per API docs
    searchVideos();
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

// Search videos using the API with enhanced error handling
async function searchVideos() {
    showLoading();

    try {
        const params = new URLSearchParams({
            query: currentSearch.query,
            per_page: currentSearch.per_page,
            page: currentSearch.page,
            thumbsize: currentSearch.thumbsize,
            order: currentSearch.order,
            gay: currentSearch.gay,
            format: 'json'
        });

        console.log('Fetching videos with params:', params.toString());

        const data = await fetchWithRetry(`${API_BASE_URL}/video/search/?${params}`);

        searchResults = {
            videos: data.videos || [],
            total_count: data.total_count || 0,
            total_pages: data.total_pages || 0,
            current_page: data.page || 1
        };

        console.log(`Loaded ${searchResults.videos.length} videos`);
        displaySearchResults();
        updatePagination();

    } catch (error) {
        console.error('Search error:', error);
        showError(`Failed to fetch videos: ${error.message}. Please try again later.`);
    }
}

// Display search results
function displaySearchResults() {
    hideLoading();
    hideError();
    showResultsHeader();

    if (searchResults.videos.length === 0) {
        showError('No videos found for your search.');
        return;
    }

    videoGrid.innerHTML = '';

    searchResults.videos.forEach(video => {
        const videoCard = createVideoCard(video);
        videoGrid.appendChild(videoCard);
    });
}

// Create a video card element
function createVideoCard(video) {
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

// Show video player in modal
async function showVideoDetails(videoId) {
    try {
        const params = new URLSearchParams({
            id: videoId,
            thumbsize: currentSearch.thumbsize,
            format: 'json'
        });

        const response = await fetch(`${API_BASE_URL}/video/id/?${params}`);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const video = await response.json();

        if (!video || video.length === 0) {
            showError('Video not found or has been removed.');
            return;
        }

        playVideoInline(video);
        videoModal.style.display = 'block';

    } catch (error) {
        console.error('Video player error:', error);
        showError('Failed to load video player.');
    }
}

// Play video inline in modal
function playVideoInline(video) {
    if (!video.embed) {
        showError('Video embed not available.');
        return;
    }

    // Show video player container, hide details
    videoPlayerContainer.style.display = 'flex';
    videoDetails.style.display = 'none';

    // Set video player source
    videoPlayer.src = video.embed;

    // Update video info panel
    updateVideoInfoPanel(video);

    // Track video play
    console.log('Playing video:', video.title);
}

// Update video info panel
function updateVideoInfoPanel(video) {
    const defaultThumb = video.default_thumb;
    const thumbUrl = defaultThumb ? defaultThumb.src : 'https://via.placeholder.com/640x360?text=No+Image';

    videoInfoPanel.innerHTML = `
        <div class="video-info-title">${video.title}</div>
        <div class="video-info-stats">
            <div class="video-info-stat">
                <div class="video-info-label">Views</div>
                <div class="video-info-value">${formatNumber(video.views)}</div>
            </div>
            <div class="video-info-stat">
                <div class="video-info-label">Rating</div>
                <div class="video-info-value">${video.rate || 'N/A'}</div>
            </div>
            <div class="video-info-stat">
                <div class="video-info-label">Duration</div>
                <div class="video-info-value">${video.length_min}</div>
            </div>
            <div class="video-info-stat">
                <div class="video-info-label">Added</div>
                <div class="video-info-value">${formatDate(video.added)}</div>
            </div>
        </div>
        ${video.keywords ? `
        <div class="video-info-description">
            <strong>Tags:</strong> ${video.keywords}
        </div>
        ` : ''}
    `;
}

// Show video details (for info only)
function showVideoInfoOnly(video) {
    const defaultThumb = video.default_thumb;
    const thumbUrl = defaultThumb ? defaultThumb.src : 'https://via.placeholder.com/640x360?text=No+Image';

    videoDetails.innerHTML = `
        <div style="text-align: center; margin-bottom: 1rem;">
            <img src="${thumbUrl}" alt="${video.title}" style="max-width: 100%; border-radius: 8px;">
        </div>
        <h3>${video.title}</h3>

        <div class="video-detail-row">
            <span class="video-detail-label">Views:</span>
            <span class="video-detail-value">${formatNumber(video.views)}</span>
        </div>

        <div class="video-detail-row">
            <span class="video-detail-label">Rating:</span>
            <span class="video-detail-value">${video.rate || 'N/A'}</span>
        </div>

        <div class="video-detail-row">
            <span class="video-detail-label">Duration:</span>
            <span class="video-detail-value">${video.length_min}</span>
        </div>

        <div class="video-detail-row">
            <span class="video-detail-label">Added:</span>
            <span class="video-detail-value">${formatDate(video.added)}</span>
        </div>

        ${video.keywords ? `
        <div class="video-detail-row">
            <span class="video-detail-label">Keywords:</span>
            <span class="video-detail-value">${video.keywords}</span>
        </div>
        ` : ''}

        ${video.thumbs && video.thumbs.length > 0 ? `
        <div class="video-detail-row">
            <span class="video-detail-label">Thumbnails:</span>
            <span class="video-detail-value">
                <div class="video-thumbnails">
                    ${video.thumbs.map(thumb => `
                        <img src="${thumb.src}" alt="Thumbnail" class="video-thumb" loading="lazy">
                    `).join('')}
                </div>
            </span>
        </div>
        ` : ''}
    `;
}

// Update pagination controls
function updatePagination() {
    currentPageSpan.textContent = searchResults.current_page;
    totalPagesSpan.textContent = searchResults.total_pages;

    prevPage.disabled = currentSearch.page <= 1;
    nextPage.disabled = currentSearch.page >= searchResults.total_pages;

    pagination.style.display = searchResults.total_pages > 1 ? 'flex' : 'none';
}

// UI Helper Functions
function showLoading() {
    loading.style.display = 'block';
    error.style.display = 'none';
    resultsHeader.style.display = 'none';
    pagination.style.display = 'none';
}

function hideLoading() {
    loading.style.display = 'none';
}

function showError(message) {
    hideLoading();
    errorMessage.textContent = message;
    error.style.display = 'block';
    resultsHeader.style.display = 'none';
    pagination.style.display = 'none';
    videoGrid.innerHTML = '';
}

function hideError() {
    error.style.display = 'none';
}

function showResultsHeader() {
    const query = currentSearch.query === 'all' ? 'all videos' : `"${currentSearch.query}"`;
    resultsInfo.textContent = `Found ${formatNumber(searchResults.total_count)} results for ${query}`;
    resultsHeader.style.display = 'block';
}

function closeVideoModal() {
    videoModal.style.display = 'none';

    // Stop video playback by clearing the iframe src
    videoPlayer.src = '';

    // Reset modal state
    videoPlayerContainer.style.display = 'none';
    videoDetails.style.display = 'none';
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

    // Handle different duration formats
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

function formatDate(dateString) {
    if (!dateString || dateString === '1970-01-01 01:00:00') {
        return 'Unknown';
    }

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

// Handle responsive navigation
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

// Add some CSS animations and interactions
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add search input focus effects
    searchInput.addEventListener('focus', function() {
        this.parentElement.style.boxShadow = '0 0 0 3px rgba(255, 107, 107, 0.3)';
    });

    searchInput.addEventListener('blur', function() {
        this.parentElement.style.boxShadow = 'none';
    });
});
