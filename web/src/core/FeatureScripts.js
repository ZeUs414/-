
// ===============================================
// MARK: - محرك المميزات الإضافية (Feature Engine)
// ===============================================

const FeatureScripts = {
  // 1. البحث في الصفحة (Find in Page)
  getFindInPageScript: (query) => {
    return `
      (function() {
        try {
            // إزالة التحديدات السابقة
            const marks = document.querySelectorAll('mark.smart-browser-highlight');
            marks.forEach(m => {
                const parent = m.parentNode;
                parent.replaceChild(document.createTextNode(m.textContent), m);
                parent.normalize();
            });

            if (!"${query}") return 0;

            let count = 0;
            const regex = new RegExp("(${query})", "gi");
            
            function traverse(node) {
                if (node.nodeType === 3) { // Text Node
                    const text = node.nodeValue;
                    if (text.match(regex)) {
                        const span = document.createElement('span');
                        span.innerHTML = text.replace(regex, '<mark class="smart-browser-highlight" style="background: yellow; color: black; font-weight: bold;">$1</mark>');
                        node.parentNode.replaceChild(span, node);
                        count += (text.match(regex) || []).length;
                    }
                } else if (node.nodeType === 1 && node.childNodes && !/(script|style|textarea)/i.test(node.tagName)) {
                    [...node.childNodes].forEach(traverse);
                }
            }

            traverse(document.body);
            
            const first = document.querySelector('mark.smart-browser-highlight');
            if (first) first.scrollIntoView({behavior: "smooth", block: "center"});

            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'FIND_RESULT',
                payload: count
            }));
        } catch(e) {}
      })();
      true;
    `;
  },

  // 2. عرض المصدر (View Source)
  getViewSourceScript: () => {
    return `
      (function() {
        try {
            const html = document.documentElement.outerHTML;
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'VIEW_SOURCE',
                payload: html.substring(0, 20000) // Increased limit slightly
            }));
        } catch(e) {}
      })();
      true;
    `;
  },
  
  // 3. مسح البيانات (Safe Clear)
  getClearDataScript: () => {
      return `
        (function() {
            try {
                localStorage.clear();
                sessionStorage.clear();
                document.cookie.split(";").forEach(function(c) { 
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                });
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ACTION_COMPLETE',
                    payload: 'تم مسح البيانات بنجاح. سيتم تحديث الصفحة.'
                }));
                setTimeout(function(){ location.reload(); }, 500);
            } catch(e) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CONSOLE_LOG', level: 'error', payload: e.message }));
            }
        })();
        true;
      `;
  }
};

export default FeatureScripts;
