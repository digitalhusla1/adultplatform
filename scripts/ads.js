/* ========================================
   HDpornlove.com - Centralized Ad Management
   Add all ads in one place, they auto-inject to all pages
   ======================================== */

const ADS = {
    // Leaderboard (728x90) - Appears at top of pages
    leaderboard: {
        enabled: true,
        // Replace with your ad code or set to empty string to disable
        code: `<!-- LEADERBOARD 728x90 AD CODE HERE -->
<ins class="adsbygoogle" style="display:inline-block;width:728px;height:90px" data-ad-client="ca-pub-XXXXXX" data-ad-slot="XXXXXX"></ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>`
    },

    // Medium Rectangle (632x190) - Mid-page ads
    medium: {
        enabled: true,
        code: `<!-- MEDIUM 632x190 AD CODE HERE -->
<ins class="adsbygoogle" style="display:inline-block;width:632px;height:190px" data-ad-client="ca-pub-XXXXXX" data-ad-slot="XXXXXX"></ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>`
    },

    // Small Rectangle (474x190) - Mobile-friendly
    small: {
        enabled: true,
        code: `<!-- SMALL 474x190 AD CODE HERE -->
<ins class="adsbygoogle" style="display:inline-block;width:474px;height:190px" data-ad-client="ca-pub-XXXXXX" data-ad-slot="XXXXXX"></ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>`
    },

    // VGA (308x286) - Medium square
    vga: {
        enabled: true,
        code: `<!-- VGA 308x286 AD CODE HERE -->
<ins class="adsbygoogle" style="display:inline-block;width:308px;height:286px" data-ad-client="ca-pub-XXXXXX" data-ad-slot="XXXXXX"></ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>`
    },

    // Billboard (908x258) - Large horizontal
    billboard: {
        enabled: true,
        code: `<!-- BILLBOARD 908x258 AD CODE HERE -->
<ins class="adsbygoogle" style="display:inline-block;width:908px;height:258px" data-ad-client="ca-pub-XXXXXX" data-ad-slot="XXXXXX"></ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>`
    },

    // Box (300x250) - Sidebar ad
    box: {
        enabled: true,
        code: `<!-- BOX 300x250 AD CODE HERE -->
<ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px" data-ad-client="ca-pub-XXXXXX" data-ad-slot="XXXXXX"></ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>`
    },

    // Skyscraper (160x600) - Tall sidebar ad
    skyscraper: {
        enabled: true,
        code: `<!-- SKYSCRAPER 160x600 AD CODE HERE -->
<ins class="adsbygoogle" style="display:inline-block;width:160px;height:600px" data-ad-client="ca-pub-XXXXXX" data-ad-slot="XXXXXX"></ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>`
    }
};

/**
 * Inject ads into all designated containers on the page
 * Call this function after page loads to populate ads
 */
function injectAllAds() {
    try {
        // Leaderboard ads (728x90)
        const leaderboardAds = document.querySelectorAll('.ad-leaderboard');
        if (ADS.leaderboard.enabled && ADS.leaderboard.code) {
            leaderboardAds.forEach(container => {
                container.innerHTML = ADS.leaderboard.code;
            });
            console.log(`✅ Injected ${leaderboardAds.length} leaderboard ad(s)`);
        }

        // Medium rectangle ads (632x190)
        const mediumAds = document.querySelectorAll('.ad-medium');
        if (ADS.medium.enabled && ADS.medium.code) {
            mediumAds.forEach(container => {
                container.innerHTML = ADS.medium.code;
            });
            console.log(`✅ Injected ${mediumAds.length} medium ad(s)`);
        }

        // Small rectangle ads (474x190)
        const smallAds = document.querySelectorAll('.ad-small');
        if (ADS.small.enabled && ADS.small.code) {
            smallAds.forEach(container => {
                container.innerHTML = ADS.small.code;
            });
            console.log(`✅ Injected ${smallAds.length} small ad(s)`);
        }

        // VGA ads (308x286)
        const vgaAds = document.querySelectorAll('.ad-vga');
        if (ADS.vga.enabled && ADS.vga.code) {
            vgaAds.forEach(container => {
                container.innerHTML = ADS.vga.code;
            });
            console.log(`✅ Injected ${vgaAds.length} VGA ad(s)`);
        }

        // Billboard ads (908x258)
        const billboardAds = document.querySelectorAll('.ad-billboard');
        if (ADS.billboard.enabled && ADS.billboard.code) {
            billboardAds.forEach(container => {
                container.innerHTML = ADS.billboard.code;
            });
            console.log(`✅ Injected ${billboardAds.length} billboard ad(s)`);
        }

        // Box ads (300x250)
        const boxAds = document.querySelectorAll('.ad-box');
        if (ADS.box.enabled && ADS.box.code) {
            boxAds.forEach(container => {
                container.innerHTML = ADS.box.code;
            });
            console.log(`✅ Injected ${boxAds.length} box ad(s)`);
        }

        // Skyscraper ads (160x600)
        const skyscraperAds = document.querySelectorAll('.ad-box-skyscraper');
        if (ADS.skyscraper.enabled && ADS.skyscraper.code) {
            skyscraperAds.forEach(container => {
                container.innerHTML = ADS.skyscraper.code;
            });
            console.log(`✅ Injected ${skyscraperAds.length} skyscraper ad(s)`);
        }

        console.log('✅ All ads injected successfully');
    } catch (error) {
        console.error('❌ Error injecting ads:', error);
    }
}

// Auto-inject ads when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectAllAds);
} else {
    injectAllAds();
}
