
// ===============================================
// MARK: - 1. محرك التيتانيوم لحظر الإعلانات (Titanium Engine) - أداء محسن
// ===============================================
const TitaniumRules = {
  // كلمات قوية للحظر
  textFilters: [
    'skip ad', 'تخطي الاعلان', 'advertisement', 'sponsored',
    'bc.game', 'bet', 'casino', 'bonus', 'deposit', 'spin', 'win', 'تحميل التطبيق'
  ],
  whitelist: [
    'google', 'youtube', 'cloudflare', 'recaptcha', 'gstatic', 'googleapis', 'lek-manga'
  ],
  // محددات CSS قوية للإخفاء الفوري
  cssKillList: [
    '.ad', '.ads', '.banner', '[id^="ad-"]', '[class^="ad-"]',
    '.overlay', '#overlay', '.popup', '#popup',
    '[class*="floating"]',
    '[style*="position: fixed"][style*="bottom"]',
    '[style*="z-index: 99999"]', 'iframe[src*="ads"]', 'iframe[src*="doubleclick"]'
  ]
};

const AdBlockManager = {
  getTitaniumInjection: (userScripts = [], customBlockRules = []) => {
    
    const customCss = customBlockRules.map(rule => `${rule} { display: none !important; visibility: hidden !important; }`).join(' ');
    const generalCss = TitaniumRules.cssKillList.join(', ') + ' { display: none !important; visibility: hidden !important; }';
    const combinedCss = generalCss + ' ' + customCss;
    
    const scriptsStr = JSON.stringify(userScripts);
    const textFilters = JSON.stringify(TitaniumRules.textFilters);

    return `
      (function() {
        
        // --- 0. POPUP KILLER (Aggressive) ---
        // ✅ FIX #6: Override window.open to stop popups completely
        try {
            window.open = function() { 
                console.log('⛔️ Popup Blocked by ZEUS Browser'); 
                return null; 
            };
        } catch(e) {}

        // --- 1. CSS Injection (Fast & Passive) ---
        const style = document.createElement('style');
        style.id = 'titanium-style-blocker';
        style.textContent = \`${combinedCss}\`; 
        (document.head || document.documentElement).appendChild(style);

        window.addCustomRule = function(selector) {
            try {
                const s = document.getElementById('titanium-style-blocker');
                if (s) s.textContent += \` \${selector} { display: none !important; }\`;
            } catch(e) {}
        };

        // --- 2. The "Aggressive" Hunter (Active JS - Optimized) ---
        
        const badWords = ${textFilters};
        let cleanupTimeout = null;
        
        function aggressiveClean() {
            try {
                // 1. تنظيف الروابط السيئة ومنع الفتح في تبويب جديد
                // ✅ Enhanced: Remove target="_blank" from ALL links to prevent popups
                const links = document.querySelectorAll('a');
                for (let i = 0; i < links.length; i++) {
                    const el = links[i];
                    
                    // منع فتح نوافذ جديدة
                    if (el.target === '_blank') {
                        el.removeAttribute('target');
                    }

                    const href = el.href.toLowerCase();
                    if (href.includes('bc.game') || href.includes('bet') || href.includes('pop')) {
                        el.href = 'javascript:void(0)';
                        el.onclick = function(e) { e.preventDefault(); e.stopPropagation(); };
                    }
                }

                // 2. صيد النوافذ المنبثقة (Popups) والعناصر العائمة
                const candidates = document.querySelectorAll('div, iframe, section');
                for (let i = 0; i < candidates.length; i++) {
                    const el = candidates[i];
                    if (el.offsetParent === null) continue;

                    const style = window.getComputedStyle(el);
                    
                    if (style.position === 'fixed' || style.position === 'absolute') {
                        const z = parseInt(style.zIndex);
                        if (!isNaN(z) && z > 900) {
                             const rect = el.getBoundingClientRect();
                             if (rect.height > 100 && rect.top > 50) {
                                 el.remove();
                                 continue;
                             }
                        }
                    }

                    if (el.tagName === 'DIV' && el.innerText.length < 100 && el.innerText.length > 3) {
                        const txt = el.innerText.toLowerCase();
                        if (badWords.some(w => txt.includes(w))) {
                            el.remove();
                        }
                    }
                }
            } catch(e) {}
        }

        // Global Click Interceptor to stop popups
        window.addEventListener('click', function(e) {
            let target = e.target;
            while(target && target.tagName !== 'A') {
                target = target.parentNode;
            }
            if (target && target.target === '_blank') {
                target.removeAttribute('target');
            }
        }, true);

        const observer = new MutationObserver((mutations) => {
            if (cleanupTimeout) clearTimeout(cleanupTimeout);
            cleanupTimeout = setTimeout(aggressiveClean, 500);
        });

        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
            aggressiveClean(); 
        } else {
            window.addEventListener('DOMContentLoaded', () => {
                 observer.observe(document.body, { childList: true, subtree: true });
                 aggressiveClean();
            });
        }

        // --- 3. User Scripts ---
        try {
            const scripts = ${scriptsStr};
            scripts.forEach(script => {
                if (script.active && (script.domain === '*' || window.location.href.includes(script.domain))) {
                     try { eval('(function() { ' + script.code + ' })();'); } catch(e){}
                }
            });
        } catch(e) {}

      })();
      true;
    `;
  },

  shouldBlockRequest: (url, currentUrl, userBlockedDomains = []) => {
    const lowerUrl = url.toLowerCase();
    
    // 1. Check User Blocked Domains (Strict Blocking)
    if (userBlockedDomains && userBlockedDomains.length > 0) {
        // Strip http/www for loose matching
        const cleanUrl = lowerUrl.replace(/^https?:\/\/(www\.)?/, '');
        const isUserBlocked = userBlockedDomains.some(domain => {
            const cleanDomain = domain.toLowerCase().replace(/^https?:\/\/(www\.)?/, '');
            return cleanUrl.includes(cleanDomain);
        });
        if (isUserBlocked) return true;
    }

    // 2. Whitelist check
    if (lowerUrl.includes('cloudflare') || lowerUrl.includes('challenge')) return false;
    
    // 3. Built-in Blacklist
    const blacklist = [
        'doubleclick.net', 'googlesyndication', 'facebook.com/tr', 'google-analytics', 
        'adnxs', 'popcash', 'popads', 'mc.yandex.ru', 'gemini', 'exoclick', 'propellerads',
        'juicyads', 'adsterra', 'trafficjunky'
    ];
    
    if (blacklist.some(w => lowerUrl.includes(w))) return true;
    return false;
  }
};

export default AdBlockManager;
