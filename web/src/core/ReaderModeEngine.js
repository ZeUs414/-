// src/core/ReaderModeEngine.js

const ReaderModeEngine = {
  getExtractionScript: () => {
    return `
      (function() {
        try {
          const cleanText = (text) => text ? text.replace(/\\s+/g, ' ').trim() : '';

          // الكلمات المفتاحية التي تستخدم في رسائل الحقوق المزعجة
          const FORBIDDEN_WORDS = ['kolnovel', 'kol-novel', 'ملوك الروايات', 'إقرأ رواياتنا', 'م*وقع', 'رواياتنا'];

          function isElementHidden(el) {
            const style = window.getComputedStyle(el);
            
            // فحص الشفافية وحجم الخط
            if (style.opacity === '0' || style.fontSize === '0px' || style.display === 'none' || style.visibility === 'hidden') 
                return true;

            // فحص لون الخط (إذا كان شفافاً تماماً)
            if (style.color.includes('rgba') && style.color.endsWith(', 0)')) 
                return true;

            // فحص المواقع (بعض النصوص توضع خارج الشاشة)
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) 
                return true;

            return false;
          }

          function findContent() {
             const candidates = document.querySelectorAll('div, article, section, main');
             let bestContainer = null;
             let maxScore = 0;

             candidates.forEach(node => {
                if (node.matches('header, footer, nav, aside, .sidebar, .menu, .ads')) return;
                const text = node.innerText || "";
                const arabCharCount = (text.match(/[\\u0600-\\u06FF]/g) || []).length; 
                if (arabCharCount < 50) return;

                let score = arabCharCount; 
                if (score > maxScore) {
                   maxScore = score;
                   bestContainer = node;
                }
             });

             if (!bestContainer) bestContainer = document.body;

             let extractedLines = [];
             // جلب كل العناصر التي قد تحتوي نصاً
             const allElements = bestContainer.querySelectorAll('p, div, span, h2, h3, h4, b, i');
             
             allElements.forEach(node => {
                 // 1. استبعاد العناصر المخفية برمجياً أو بالـ CSS
                 if (isElementHidden(node)) return;

                 // 2. التحقق من وجود نص مباشر لمنع التكرار (مثلاً div داخله p)
                 let directText = "";
                 for (let child of node.childNodes) {
                    if (child.nodeType === 3) { // Text node
                        directText += child.textContent;
                    }
                 }
                 
                 let text = cleanText(node.innerText);
                 if (text.length === 0) return;

                 // 3. الفلترة القوية (القضاء على روابط المواقع)
                 const lowerText = text.toLowerCase();
                 const hasForbiddenWord = FORBIDDEN_WORDS.some(word => lowerText.includes(word));
                 const hasLink = /www\\.|http|\\.com|\\.net|\\.org/.test(lowerText);

                 if (hasForbiddenWord || hasLink) return;

                 // 4. معالجة النصوص القصيرة جداً والمؤثرات
                 // نأخذ النص فقط إذا كان العنصر هو الأصغر (لا يوجد أبناء نصيين آخرين)
                 // أو إذا كان فقرة P صريحة
                 if (node.tagName === 'P' || (directText.trim().length > 0 && node.children.length === 0)) {
                     
                     // منع تكرار نفس السطر
                     if (extractedLines.length > 0 && extractedLines[extractedLines.length - 1] === text) return;

                     extractedLines.push(text);
                 }
             });
             
             return extractedLines;
          }

          const title = (document.querySelector('h1') ? cleanText(document.querySelector('h1').innerText) : document.title);
          const content = findContent();

          if (content.length > 0) {
             window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'READER_EXTRACTED',
                payload: { title: title, content: content }
             }));
          } else {
             window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READER_ERROR' }));
          }

        } catch(e) {
           window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CONSOLE_LOG', level: 'error', payload: e.message }));
        }
      })();
      true;
    `;
  }
};

export default ReaderModeEngine;