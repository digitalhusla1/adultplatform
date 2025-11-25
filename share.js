// Minimal share bar: injects X/Twitter and Reddit share buttons near the footer
(function(){
  try{
    var title = (document.querySelector('meta[property="og:title"]')||{}).content || document.title || 'HDpornlove.com';
    var canonical = (document.querySelector('link[rel="canonical"]')||{}).href || location.href;

    function e(s){ return encodeURIComponent(s); }

    var bar = document.createElement('div');
    bar.id = 'hdpl-share-bar';
    bar.innerHTML = '\n      <div style="display:flex;gap:10px;align-items:center;justify-content:center;padding:10px 0;">\n        <a href="https://twitter.com/intent/tweet?text='+e(title)+'&url='+e(canonical)+'" target="_blank" rel="noopener" aria-label="Share on X/Twitter" style="text-decoration:none;color:inherit">\n          <i class="fab fa-twitter" style="font-size:1.1rem;color:#1DA1F2"></i> Share\n        </a>\n        <a href="https://www.reddit.com/submit?url='+e(canonical)+'&title='+e(title)+'" target="_blank" rel="noopener" aria-label="Share on Reddit" style="text-decoration:none;color:inherit">\n          <i class="fab fa-reddit" style="font-size:1.1rem;color:#FF4500"></i> Reddit\n        </a>\n      </div>';

    var footer = document.querySelector('footer') || document.querySelector('.footer') || document.body;
    if(footer && footer.parentNode){
      footer.parentNode.insertBefore(bar, footer);
    } else {
      document.body.appendChild(bar);
    }

    var style = document.createElement('style');
    style.innerHTML = '#hdpl-share-bar{background:linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01));margin-top:8px;border-top:1px solid rgba(0,0,0,0.06);} #hdpl-share-bar a{padding:6px 10px;border-radius:4px;background:rgba(255,255,255,0.02);}';
    document.head.appendChild(style);
  }catch(e){console.error('share.js error',e)}
})();
