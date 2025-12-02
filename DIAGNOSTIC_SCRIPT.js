// ========================================
// QUICK DIAGNOSTIC SCRIPT FOR VIDEO LOADING ISSUES
// ========================================
// HOW TO USE:
// 1. Open your website in Chrome/Firefox
// 2. Press F12 to open Developer Tools
// 3. Click on the "Console" tab
// 4. Copy & paste this entire script and press Enter
// 5. Read the output to identify the issue
// ========================================

console.clear();
console.log('%c🔍 DIAGNOSTICS - Video Loading Issues', 'font-size: 18px; font-weight: bold; color: #e63946;');
console.log('='.repeat(60));

// Test 1: Check if we're on video page
console.log('\n📍 PAGE DETECTION');
const path = window.location.pathname.toLowerCase();
const href = window.location.href.toLowerCase();
console.log('Current URL:', window.location.href);
console.log('Path contains "video":', path.includes('video'));
console.log('Is video page:', path.includes('video.html') || href.includes('video.html'));

// Test 2: Check video ID in URL
console.log('\n🔑 VIDEO ID CHECK');
const videoId = new URLSearchParams(window.location.search).get('id');
console.log('Video ID from URL:', videoId);
console.log('Video ID length:', videoId ? videoId.length : 'N/A');
console.log('Valid length (should be 11):', videoId && videoId.length === 11);

// Test 3: Check if key elements exist
console.log('\n📋 REQUIRED HTML ELEMENTS');
const videoContainer = document.getElementById('videoContainer');
const videoInfo = document.getElementById('videoInfo');
const videoTitle = document.getElementById('videoTitle');
const noVideo = document.getElementById('noVideo');
console.log('✓ videoContainer exists:', !!videoContainer);
console.log('✓ videoInfo exists:', !!videoInfo);
console.log('✓ videoTitle exists:', !!videoTitle);
console.log('✓ noVideo exists:', !!noVideo);

// Test 4: Check if functions exist
console.log('\n⚙️  JAVASCRIPT FUNCTIONS');
console.log('✓ getVideo function exists:', typeof getVideo === 'function');
console.log('✓ goToVideo function exists:', typeof goToVideo === 'function');
console.log('✓ shareVideo function exists:', typeof shareVideo === 'function');
console.log('✓ getUrlParam function exists:', typeof getUrlParam === 'function');

// Test 5: Check API configuration
console.log('\n🌐 API CONFIGURATION');
console.log('API Base URL:', CONFIG.API_BASE);
console.log('Thumb size:', CONFIG.THUMB_SIZE);
console.log('Videos per page:', CONFIG.VIDEOS_PER_PAGE);

// Test 6: Check localStorage
console.log('\n💾 BROWSER STORAGE');
const ageVerified = localStorage.getItem(CONFIG.AGE_VERIFIED_KEY);
console.log('Age verified:', ageVerified);
console.log('Cached removed IDs:', localStorage.getItem(CONFIG.REMOVED_CACHE_KEY) ? 'Yes' : 'No');

// Test 7: Manual video fetch test
console.log('\n🧪 TEST API CALL');
if (videoId && videoId.length === 11) {
    console.log('Starting API test...');
    console.log('Attempting to fetch video:', videoId);
    console.log('Check Network tab in DevTools for the API response');
} else {
    console.warn('⚠️  Cannot test API - invalid or missing video ID');
}

// Test 8: Summary
console.log('\n' + '='.repeat(60));
console.log('%c📊 DIAGNOSTIC SUMMARY', 'font-size: 14px; font-weight: bold;');
console.log('='.repeat(60));

const isVideoPage = path.includes('video.html') || href.includes('video.html');
const hasVideoId = videoId && videoId.length === 11;
const hasElements = videoContainer && videoInfo && videoTitle;
const hasFunctions = typeof getVideo === 'function' && typeof goToVideo === 'function';

if (isVideoPage && hasVideoId && hasElements && hasFunctions) {
    console.log('✅ All checks passed! The issue may be:');
    console.log('  1. API is returning an error (check Network tab)');
    console.log('  2. Video has been removed from Eporner');
    console.log('  3. Network connectivity issue');
    console.log('\nNext step: Open Network tab and try to load a video again');
} else {
    console.log('❌ Found issues:');
    if (!isVideoPage) console.log('  - Not on video page');
    if (!hasVideoId) console.log('  - Missing or invalid video ID in URL');
    if (!hasElements) console.log('  - Missing HTML elements');
    if (!hasFunctions) console.log('  - Missing JavaScript functions');
}

console.log('\n💡 TIP: Open the Network tab (F12 → Network)');
console.log('Then reload the page and watch the API requests to see responses');
console.log('='.repeat(60));
