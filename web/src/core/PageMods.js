
// ===============================================
// MARK: - تعديلات الصفحة (Translation & Copy)
// ===============================================

const PageMods = {
  // 1. المترجم الفوري (مع تحويل الاتجاه لليمين)
  getTranslateScript: () => {
    return `
      (function() {
        try {
            // Check if already injected
            if (document.getElementById('google_translate_element')) {
                 return; // Already there
            }
            
            // 1. Force RTL Direction for Body
            document.body.style.direction = 'rtl';
            document.body.style.textAlign = 'right';

            // 2. Inject Google Translate
            const script = document.createElement('script');
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);

            // 3. Callback
            window.googleTranslateElementInit = function() {
                new google.translate.TranslateElement({
                    pageLanguage: 'auto', 
                    includedLanguages: 'ar', 
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: true
                }, 'google_translate_element');
            };

            // 4. Create Container (Top Bar)
            const div = document.createElement('div');
            div.id = 'google_translate_element';
            div.style.position = 'fixed';
            div.style.top = '0';
            div.style.left = '0';
            div.style.width = '100%';
            div.style.zIndex = '2147483647'; // Max Z-Index
            div.style.backgroundColor = '#fff';
            div.style.padding = '10px';
            div.style.borderBottom = '2px solid #007AFF';
            div.style.textAlign = 'center';
            
            document.body.insertBefore(div, document.body.firstChild);
            
            // Push content down slightly
            document.body.style.marginTop = '50px';

            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ACTION_COMPLETE',
                payload: 'تم تفعيل شريط الترجمة. اختر "العربية".'
            }));

        } catch (e) {
             window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CONSOLE_LOG', level: 'error', payload: e.message }));
        }
      })();
      true;
    `;
  },

  // 2. فرض النسخ (Enable Copy/Paste)
  getEnableCopyScript: () => {
    return `
      (function() {
        try {
            const css = '* { -webkit-user-select: text !important; user-select: text !important; pointer-events: auto !important; }';
            const style = document.createElement('style');
            style.innerText = css;
            document.head.appendChild(style);

            const docEvents = ['oncontextmenu', 'onselectstart', 'ondragstart', 'onmousedown'];
            docEvents.forEach(evt => {
                document[evt] = null;
                document.body[evt] = null;
            });

            const events = ['contextmenu', 'selectstart', 'copy', 'cut', 'paste', 'mousedown', 'mouseup', 'keydown', 'keyup'];
            events.forEach(evt => {
                window.addEventListener(evt, (e) => { e.stopPropagation(); }, true);
            });

            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ACTION_COMPLETE',
                payload: '✅ تم فك حماية النسخ. يمكنك الآن تحديد النصوص.'
            }));

        } catch (e) {
             window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CONSOLE_LOG', level: 'error', payload: e.message }));
        }
      })();
      true;
    `;
  }
};

export default PageMods;
