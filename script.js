// API Configuration
const API_BASE_URL = 'https://www.eporner.com/api/v2';
const DEFAULT_PER_PAGE = 12; // Reduced for faster loading
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

// State Management
let searchQuery = {
    query: 'all',
    page: 1,
    order: 'most-popular',
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
    console.log('DOM Content Loaded - Initializing Search Page');

    // Check URL parameters for video
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('video');
    const category = urlParams.get('category');

    if (videoId) {
        // Show video player for selected video
        loadVideoById(videoId);
        return;
    }

    // Only initialize global search if search elements exist on the page
    if (searchBtn && searchInput) {
        initializeEventListeners();

        // Load initial search if no query
        const query = urlParams.get('q');
        if (query) {
            searchInput.value = query;
            searchQuery.query = query;
            performSearch();
        } else {
            // Load default videos (popular ones)
            searchQuery.query = 'all';
            performSearch();
        }
    } else {
        console.log('Search elements not found on this page; skipping global search initialization.');
    }
});

// Event Listeners
function initializeEventListeners() {
    // Guard: ensure required elements exist
    if (!searchBtn || !searchInput) return;

    searchBtn.addEventListener('click', performSearchFromInput);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearchFromInput();
        }
    });

    if (orderSelect) {
        orderSelect.addEventListener('change', function() {
            searchQuery.order = this.value;
            searchQuery.page = 1;
            performSearch();
        });
    }

    if (thumbsizeSelect) {
        thumbsizeSelect.addEventListener('change', function() {
            searchQuery.thumbsize = this.value;
            performSearch();
        });
    }

    if (gayContent) {
        gayContent.addEventListener('change', function() {
            searchQuery.gay = this.checked ? 1 : 0;
            searchQuery.page = 1;
            performSearch();
        });
    }

    if (prevPage) {
        prevPage.addEventListener('click', function() {
            if (searchQuery.page > 1) {
                searchQuery.page--;
                performSearch();
            }
        });
    }

    if (nextPage) {
        nextPage.addEventListener('click', function() {
            if (searchQuery.page < searchResults.total_pages) {
                searchQuery.page++;
                performSearch();
            }
        });
    }
}

// Get search query from input
function performSearchFromInput() {
    const query = searchInput.value.trim();
    if (query) {
        searchQuery.query = query;
        searchQuery.page = 1;
        performSearch();
    }
}

// Perform search
async function performSearch() {
    showLoading();

    try {
        const params = new URLSearchParams({
            query: searchQuery.query,
            per_page: searchQuery.per_page,
            page: searchQuery.page,
            thumbsize: searchQuery.thumbsize,
            order: searchQuery.order,
            gay: searchQuery.gay,
            format: 'json'
        });

        console.log('Performing search with params:', params.toString());

        const data = await fetchWithRetry(`${API_BASE_URL}/video/search/?${params}`);

        searchResults = {
            videos: data.videos || [],
            total_count: data.total_count || 0,
            total_pages: data.total_pages || 0,
            current_page: data.page || 1
        };

        console.log(`Loaded ${searchResults.videos.length} search results`);
        displaySearchResults();
        updatePagination();

    } catch (err) {
        console.error('Search error:', err);
        showError(`Failed to fetch videos: ${err.message}. Please try again later.`);
    }
}

// Load video by ID (for direct video links)
async function loadVideoById(videoId) {
    showLoading();

    try {
        const params = new URLSearchParams({
            id: videoId,
            thumbsize: searchQuery.thumbsize,
            format: 'json'
        });

        const data = await fetchWithRetry(`${API_BASE_URL}/video/id/?${params}`);

        if (!data || data.length === 0) {
            showError('Video not found or has been removed.');
            return;
        }

        playVideoInline(data);

    } catch (err) {
        console.error('Video load error:', err);
        showError(`Failed to load video: ${err.message}`);
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

// Display search results
function displaySearchResults() {
    hideLoading();
    hideError();
    showResultsHeader();

    if (searchResults.videos.length === 0) {
        showError('No videos found for your search term.');
        return;
    }

    videoGrid.innerHTML = '';

    searchResults.videos.forEach(video => {
        const videoCard = createVideoCard(video);
        videoGrid.appendChild(videoCard);
    });
}

// Create a video card
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
    // Navigate to video URL
    window.location.href = `index.html?video=${videoId}`;
}

function playVideoInline(video) {
    const modal = document.getElementById('videoModal');
    const playerContainer = document.getElementById('videoPlayerContainer');
    const player = document.getElementById('videoPlayer');
    const infoPanel = document.getElementById('videoInfoPanel');

    if (!modal || !playerContainer || !player || !infoPanel) {
        console.error('Video modal elements not found');
        return;
    }

    // Show video player container, hide details
    playerContainer.style.display = 'flex';

    // Set video player source
    player.src = video.embed;

    // Update video info panel
    updateVideoInfoPanel(video, infoPanel);

    // Show modal
    modal.style.display = 'block';

    console.log('Playing video:', video.title);
}

// Update video info panel
function updateVideoInfoPanel(video, panel = null) {
    const infoPanel = panel || document.getElementById('videoInfoPanel');
    if (!infoPanel) return;

    infoPanel.innerHTML = `
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

// Expose canonical helpers for other page scripts to use
// These are attached to the window to avoid load-order issues.
window.sitePlayVideoInline = playVideoInline;
window.siteUpdateVideoInfoPanel = updateVideoInfoPanel;
window.siteFetchWithRetry = fetchWithRetry;
window.siteFormatNumber = formatNumber;
window.siteFormatDuration = formatDuration;
window.siteFormatDate = formatDate;

// Update pagination controls
function updatePagination() {
    currentPageSpan.textContent = searchResults.current_page;
    totalPagesSpan.textContent = searchResults.total_pages;

    prevPage.disabled = searchQuery.page <= 1;
    nextPage.disabled = searchQuery.page >= searchResults.total_pages;

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
    const orderText = getOrderText(searchQuery.order);
    resultsInfo.textContent = `Showing ${orderText} videos for "${searchQuery.query}" - ${formatNumber(searchResults.total_count)} total results`;
    resultsHeader.style.display = 'block';
}

// Get order description text
function getOrderText(order) {
    const orderMap = {
        'latest': 'latest',
        'top-rated': 'top rated',
        'most-popular': 'most popular',
        'top-weekly': 'top weekly',
        'top-monthly': 'top monthly',
        'longest': 'longest',
        'shortest': 'shortest'
    };
    return orderMap[order] || order;
}

// Modal close functionality
document.addEventListener('DOMContentLoaded', function() {
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');

    if (modalClose) {
        modalClose.addEventListener('click', closeVideoModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeVideoModal);
    }
});

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('videoPlayer');
    const playerContainer = document.getElementById('videoPlayerContainer');

    if (modal) {
        modal.style.display = 'none';
    }

    if (player) {
        player.src = '';
    }

    if (playerContainer) {
        playerContainer.style.display = 'none';
    }
}

// Age verification
document.addEventListener('DOMContentLoaded', function() {
    const confirmAgeBtn = document.getElementById('confirmAgeBtn');
    const denyAgeBtn = document.getElementById('denyAgeBtn');
    const ageModal = document.getElementById('ageVerificationModal');

    if (confirmAgeBtn) {
        confirmAgeBtn.addEventListener('click', function() {
            localStorage.setItem('ageVerified', 'true');
            ageModal.style.display = 'none';
        });
    }

    if (denyAgeBtn) {
        denyAgeBtn.addEventListener('click', function() {
            window.location.href = 'https://www.google.com';
        });
    }

    // Check if user is already verified
    if (localStorage.getItem('ageVerified') === 'true') {
        ageModal.style.display = 'none';
    }
});

// Email capture form handling
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('subscriberEmail');
    const emailConsent = document.getElementById('emailConsent');
    const subscribeBtn = document.getElementById('subscribeForm');
    const subscribeMessage = document.getElementById('subscribeMessage');
    const closeEmailForm = document.getElementById('closeEmailForm');
    const emailCaptureForm = document.getElementById('emailCaptureForm');

    if (subscribeBtn) {
        subscribeBtn.addEventListener('submit', function(e) {
            e.preventDefault();
            handleEmailSubscription();
        });
    }

    if (closeEmailForm) {
        closeEmailForm.addEventListener('click', function() {
            emailCaptureForm.style.display = 'none';
        });
    }

    // Show email capture form on page load or after some time
    setTimeout(function() {
        if (!localStorage.getItem('emailSubscribed')) {
            emailCaptureForm.style.display = 'block';
        }
    }, 30000); // Show after 30 seconds
});

function handleEmailSubscription() {
    const email = document.getElementById('subscriberEmail').value;
    const consent = document.getElementById('emailConsent').checked;
    const subscribeMessage = document.getElementById('subscribeMessage');

    if (!email || !consent) {
        subscribeMessage.textContent = 'Please provide your email and consent to subscription.';
        subscribeMessage.style.color = 'red';
        subscribeMessage.style.display = 'block';
        return;
    }

    // Here you would typically send the email to your backend
    // For now, we'll just simulate success
    localStorage.setItem('emailSubscribed', 'true');
    document.getElementById('emailCaptureForm').style.display = 'none';

    // You could redirect or show a success message
    alert('Thank you for subscribing! We will send weekly HD updates to ' + email);
}

// Utility Functions
function formatNumber(num) {
    num = parseInt(num);
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
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

function formatDate(dateString) {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString();
    } catch {
        return dateString;
    }
}

// Mobile navigation toggle
function toggleNav() {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.getElementById('navToggle');

    if (navMenu && navToggle) {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');

        const icon = navToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    }
}
