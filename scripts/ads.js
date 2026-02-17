/* ========================================
   HDpornlove.com - Centralized Ad Management & Tracking
   Add all ads and tracking codes in one place, they auto-inject to all pages
   ======================================== */

/* TRACKING & ANALYTICS CODES
   Add codes here for Google Analytics, Google Tag Manager, verification codes, etc.
   These will be automatically injected into all pages in the specified location
*/
const TRACKING_CODES = {
    // Codes to inject in <head> section (analytics, verification, etc.)
    head: [
        // Example: Google Site Verification
        // '<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />',
        
        // Example: Google Analytics
        // `<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
        // <script>
        //   window.dataLayer = window.dataLayer || [];
        //   function gtag(){dataLayer.push(arguments);}
        //   gtag('js', new Date());
        //   gtag('config', 'G-XXXXXXXXXX');
        // </script>`,
        
        // Example: Google Tag Manager
        // `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        // new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        // j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        // 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        // })(window,document,'script','dataLayer','GTM-XXXXXXXXX');</script>`
    ],

    // Codes to inject in <body> section (GTM noscript, etc.)
    body: [
        // Example: Google Tag Manager noscript
        // `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXXXX"
        // height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`
    ],

    // Codes to inject in <footer> section (tracking pixels, etc.)
    footer: [
        // Example: Tracking pixel
        // '<img src="https://example.com/tracking.gif" alt="" style="display:none;" />'
    ]
};

/**
 * Inject tracking codes into head section
 */
function injectHeadCodes() {
    try {
        if (TRACKING_CODES.head && TRACKING_CODES.head.length > 0) {
            const head = document.head;
            TRACKING_CODES.head.forEach((code, index) => {
                if (code && code.trim()) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = code;
                    while (tempDiv.firstChild) {
                        head.appendChild(tempDiv.firstChild);
                    }
                    console.log(`✅ Injected head tracking code ${index + 1}`);
                }
            });
        }
    } catch (error) {
        console.error('❌ Error injecting head codes:', error);
    }
}

/**
 * Inject tracking codes into body section
 */
function injectBodyCodes() {
    try {
        if (TRACKING_CODES.body && TRACKING_CODES.body.length > 0) {
            TRACKING_CODES.body.forEach((code, index) => {
                if (code && code.trim()) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = code;
                    while (tempDiv.firstChild) {
                        document.body.insertBefore(tempDiv.firstChild, document.body.firstChild);
                    }
                    console.log(`✅ Injected body tracking code ${index + 1}`);
                }
            });
        }
    } catch (error) {
        console.error('❌ Error injecting body codes:', error);
    }
}

/**
 * Inject tracking codes into footer section
 */
function injectFooterCodes() {
    try {
        if (TRACKING_CODES.footer && TRACKING_CODES.footer.length > 0) {
            TRACKING_CODES.footer.forEach((code, index) => {
                if (code && code.trim()) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = code;
                    while (tempDiv.firstChild) {
                        document.body.appendChild(tempDiv.firstChild);
                    }
                    console.log(`✅ Injected footer tracking code ${index + 1}`);
                }
            });
        }
    } catch (error) {
        console.error('❌ Error injecting footer codes:', error);
    }
}

const ADS = {
    // Leaderboard (728x90) - Appears at top of pages
    leaderboard: {
        enabled: true,
        key: 'e0edf43f3faa73af5c6a1714a1256219',
        format: 'iframe',
        width: 728,
        height: 90
    },

    // Medium Rectangle (468x60) - Mid-page ads
    medium: {
        enabled: true,
        key: '30bebc1af24ddd4c7a0fd1dcb5b45a6c',
        format: 'iframe',
        width: 468,
        height: 60
    },

    // Mobile Banner (320x50) - Mobile leaderboard banner
    small: {
        enabled: true,
        key: '2cf839e21b62de3d9181c9317da38afc',
        format: 'iframe',
        width: 320,
        height: 50
    },

    // VGA (308x286) - Medium square
    vga: {
        enabled: false,
        key: '',
        format: 'iframe',
        width: 308,
        height: 286
    },

    // Billboard (908x258) - Large horizontal (using 728x90 leaderboard - closest available)
    billboard: {
        enabled: true,
        key: 'e0edf43f3faa73af5c6a1714a1256219',
        format: 'iframe',
        width: 728,
        height: 90
    },

    // Box (300x250) - Sidebar ad
    box: {
        enabled: true,
        key: 'fb5ff5dc3acc0d69a0083a14253bf8f8',
        format: 'iframe',
        width: 300,
        height: 250
    },

    // Skyscraper (160x600) - Tall sidebar ad
    skyscraper: {
        enabled: true,
        key: '85897e154d5bc226bd2ca581967e3afe',
        format: 'iframe',
        width: 160,
        height: 600
    }
};

/**
 * Inject a single ad into a container using proper script element creation
 * (innerHTML does NOT execute <script> tags - must create DOM elements)
 * @param {HTMLElement} container - The ad container element
 * @param {Object} adConfig - Ad config with key, format, width, height
 */
function injectSingleAd(container, adConfig) {
    try {
        // Clear existing placeholder content
        container.innerHTML = '';

        // Create wrapper div for the ad
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `max-width: ${adConfig.width}px; margin: 0 auto; display: flex; justify-content: center; align-items: center; min-height: ${adConfig.height}px;`;

        // Use unique variable name per ad to avoid race condition
        // (multiple ads overwriting global atOptions before invoke.js loads)
        const uniqueVar = 'atOptions_' + adConfig.key.substring(0, 8);

        // Step 1: Create the options script with unique scoped variable
        const optionsScript = document.createElement('script');
        optionsScript.textContent = `
            atOptions = {
                'key' : '${adConfig.key}',
                'format' : '${adConfig.format}',
                'height' : ${adConfig.height},
                'width' : ${adConfig.width},
                'params' : {}
            };
        `;

        // Step 2: Create the invoke script (loads the ad)
        const invokeScript = document.createElement('script');
        invokeScript.src = `https://www.highperformanceformat.com/${adConfig.key}/invoke.js`;

        // Append everything in order - wrapper first, then scripts sequentially
        container.appendChild(wrapper);
        wrapper.appendChild(optionsScript);
        wrapper.appendChild(invokeScript);

    } catch (error) {
        console.error('❌ Error injecting single ad:', error);
    }
}

/**
 * Inject ads into all designated containers on the page
 * Uses proper script element creation so ad network scripts execute correctly
 */
function injectAllAds() {
    try {
        // Map of CSS selector → ADS config key
        const adMapping = [
            { selector: '.ad-leaderboard', config: ADS.leaderboard, label: 'leaderboard' },
            { selector: '.ad-medium', config: ADS.medium, label: 'medium' },
            { selector: '.ad-small', config: ADS.small, label: 'small' },
            { selector: '.ad-vga', config: ADS.vga, label: 'vga' },
            { selector: '.ad-billboard', config: ADS.billboard, label: 'billboard' },
            { selector: '.ad-box', config: ADS.box, label: 'box' },
            { selector: '.ad-box-skyscraper', config: ADS.skyscraper, label: 'skyscraper' }
        ];

        adMapping.forEach(({ selector, config, label }) => {
            if (!config.enabled || !config.key) return;

            const containers = document.querySelectorAll(selector);
            containers.forEach(container => {
                injectSingleAd(container, config);
            });

            if (containers.length > 0) {
                console.log(`✅ Injected ${containers.length} ${label} ad(s)`);
            }
        });

        console.log('✅ Ad injection complete');
    } catch (error) {
        console.error('❌ Error injecting ads:', error);
    }
}

// Auto-inject tracking codes when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        injectHeadCodes();
        injectBodyCodes();
        injectFooterCodes();
        injectAllAds();
    });
} else {
    injectHeadCodes();
    injectBodyCodes();
    injectFooterCodes();
    injectAllAds();
}
