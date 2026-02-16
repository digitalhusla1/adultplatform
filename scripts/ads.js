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
        enabled: false,
        code: '' // Add your ad code here
    },

    // Medium Rectangle (632x190) - Mid-page ads
    medium: {
        enabled: false,
        code: '' // Add your ad code here
    },

    // Small Rectangle (474x190) - Mobile-friendly
    small: {
        enabled: false,
        code: '' // Add your ad code here
    },

    // VGA (308x286) - Medium square
    vga: {
        enabled: false,
        code: '' // Add your ad code here
    },

    // Billboard (908x258) - Large horizontal
    billboard: {
        enabled: false,
        code: '' // Add your ad code here
    },

    // Box (300x250) - Sidebar ad
    box: {
        enabled: false,
        code: '' // Add your ad code here
    },

    // Skyscraper (160x600) - Tall sidebar ad
    skyscraper: {
        enabled: false,
        code: '' // Add your ad code here
    }
};

/**
 * Inject ads into all designated containers on the page
 * Wraps entire ad container with border matching ad size
 */
function injectAllAds() {
    try {
        // Leaderboard ads (728x90)
        const leaderboardAds = document.querySelectorAll('.ad-leaderboard');
        if (ADS.leaderboard.enabled && ADS.leaderboard.code) {
            leaderboardAds.forEach(container => {
                container.innerHTML = `<div style="width: 728px; border: 2px dashed #e63946; padding: 0; margin: 0 auto; display: flex; flex-direction: column;"><div style="flex: 1; display: flex; align-items: center; justify-content: center;">${ADS.leaderboard.code}</div><div style="padding: 8px 4px; font-size: 11px; color: #999; text-align: center; background-color: rgba(230, 57, 70, 0.05); border-top: 1px solid rgba(230, 57, 70, 0.2); display: flex; align-items: center; justify-content: center;">728x90 Leaderboard</div></div>`;
            });
            console.log(`✅ Injected ${leaderboardAds.length} leaderboard ad(s)`);
        }

        // Medium rectangle ads (632x190)
        const mediumAds = document.querySelectorAll('.ad-medium');
        if (ADS.medium.enabled && ADS.medium.code) {
            mediumAds.forEach(container => {
                container.innerHTML = `<div style="width: 632px; height: 190px; border: 2px dashed #e63946; padding: 0; margin: 0 auto; display: flex; flex-direction: column;"><div style="flex: 1; display: flex; align-items: center; justify-content: center;">${ADS.medium.code}</div><div style="padding: 8px 4px; font-size: 11px; color: #999; text-align: center; background-color: rgba(230, 57, 70, 0.05); border-top: 1px solid rgba(230, 57, 70, 0.2); display: flex; align-items: center; justify-content: center;">632x190 Medium</div></div>`;
            });
            console.log(`✅ Injected ${mediumAds.length} medium ad(s)`);
        }

        // Small rectangle ads (474x190)
        const smallAds = document.querySelectorAll('.ad-small');
        if (ADS.small.enabled && ADS.small.code) {
            smallAds.forEach(container => {
                container.innerHTML = `<div style="width: 474px; height: 190px; border: 2px dashed #e63946; padding: 0; margin: 0 auto; display: flex; flex-direction: column;"><div style="flex: 1; display: flex; align-items: center; justify-content: center;">${ADS.small.code}</div><div style="padding: 8px 4px; font-size: 11px; color: #999; text-align: center; background-color: rgba(230, 57, 70, 0.05); border-top: 1px solid rgba(230, 57, 70, 0.2); display: flex; align-items: center; justify-content: center;">474x190 Small</div></div>`;
            });
            console.log(`✅ Injected ${smallAds.length} small ad(s)`);
        }

        // VGA ads (308x286)
        const vgaAds = document.querySelectorAll('.ad-vga');
        if (ADS.vga.enabled && ADS.vga.code) {
            vgaAds.forEach(container => {
                container.innerHTML = `<div style="width: 308px; height: 286px; border: 2px dashed #e63946; padding: 0; margin: 0 auto; display: flex; flex-direction: column;"><div style="flex: 1; display: flex; align-items: center; justify-content: center;">${ADS.vga.code}</div><div style="padding: 8px 4px; font-size: 11px; color: #999; text-align: center; background-color: rgba(230, 57, 70, 0.05); border-top: 1px solid rgba(230, 57, 70, 0.2); display: flex; align-items: center; justify-content: center;">308x286 VGA</div></div>`;
            });
            console.log(`✅ Injected ${vgaAds.length} VGA ad(s)`);
        }

        // Billboard ads (908x258)
        const billboardAds = document.querySelectorAll('.ad-billboard');
        if (ADS.billboard.enabled && ADS.billboard.code) {
            billboardAds.forEach(container => {
                container.innerHTML = `<div style="width: 908px; height: 258px; border: 2px dashed #e63946; padding: 0; margin: 0 auto; display: flex; flex-direction: column;"><div style="flex: 1; display: flex; align-items: center; justify-content: center;">${ADS.billboard.code}</div><div style="padding: 8px 4px; font-size: 11px; color: #999; text-align: center; background-color: rgba(230, 57, 70, 0.05); border-top: 1px solid rgba(230, 57, 70, 0.2); display: flex; align-items: center; justify-content: center;">908x258 Billboard</div></div>`;
            });
            console.log(`✅ Injected ${billboardAds.length} billboard ad(s)`);
        }

        // Box ads (300x250)
        const boxAds = document.querySelectorAll('.ad-box');
        if (ADS.box.enabled && ADS.box.code) {
            boxAds.forEach(container => {
                container.innerHTML = `<div style="width: 300px; height: 250px; border: 2px dashed #e63946; padding: 0; margin: 0 auto; display: flex; flex-direction: column;"><div style="flex: 1; display: flex; align-items: center; justify-content: center;">${ADS.box.code}</div><div style="padding: 8px 4px; font-size: 11px; color: #999; text-align: center; background-color: rgba(230, 57, 70, 0.05); border-top: 1px solid rgba(230, 57, 70, 0.2); display: flex; align-items: center; justify-content: center;">300x250 Box</div></div>`;
            });
            console.log(`✅ Injected ${boxAds.length} box ad(s)`);
        }

        // Skyscraper ads (160x600)
        const skyscraperAds = document.querySelectorAll('.ad-box-skyscraper');
        if (ADS.skyscraper.enabled && ADS.skyscraper.code) {
            skyscraperAds.forEach(container => {
                container.innerHTML = `<div style="width: 160px; height: 600px; border: 2px dashed #e63946; padding: 0; margin: 0 auto; display: flex; flex-direction: column;"><div style="flex: 1; display: flex; align-items: center; justify-content: center;">${ADS.skyscraper.code}</div><div style="padding: 8px 4px; font-size: 11px; color: #999; text-align: center; background-color: rgba(230, 57, 70, 0.05); border-top: 1px solid rgba(230, 57, 70, 0.2); display: flex; align-items: center; justify-content: center;">160x600 Skyscraper</div></div>`;
            });
            console.log(`✅ Injected ${skyscraperAds.length} skyscraper ad(s)`);
        }

        console.log('✅ All ads injected successfully with sized borders');
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
