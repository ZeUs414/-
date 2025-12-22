
// ===============================================
// MARK: - محرك الترجمة الذكي (Smart Translation Engine)
// ===============================================

const TranslationEngine = {
  /**
   * 1. تفعيل الترجمة:
   * يقوم بوضع كوكيز خاصة بجوجل تجبر المتصفح على الترجمة،
   * ثم يقوم بإعادة تحميل الصفحة لتطبيق الترجمة فوراً.
   * هذا يحافظ على الجلسة (Session) لأننا لا نغادر النطاق (Domain).
   */
  getEnableTranslationScript: () => {
    return `
      (function() {
        // 1. وضع كوكيز جوجل للترجمة (تجبره على الترجمة للعربية)
        document.cookie = "googtrans=/auto/ar; path=/; domain=" + document.domain;
        document.cookie = "googtrans=/auto/ar; path=/;";
        
        // 2. إعادة تحميل الصفحة لتفعيل الكوكيز والترجمة
        location.reload();
      })();
      true;
    `;
  },

  /**
   * 2. تعطيل الترجمة:
   * يقوم بحذف الكوكيز وإعادة التحميل.
   */
  getDisableTranslationScript: () => {
    return `
      (function() {
        // 1. تصفير الكوكيز
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + document.domain;
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // 2. إعادة تحميل للوضع الطبيعي
        location.reload();
      })();
      true;
    `;
  },

  /**
   * 3. حقن السكربت (يتم استدعاؤه عند تحميل كل صفحة إذا كانت الترجمة مفعلة):
   * هذا يضمن ظهور شريط الترجمة أو تطبيقها تلقائياً.
   */
  getInjectionScript: () => {
    return `
      (function() {
        // التأكد من عدم التكرار
        if (window.googleTranslateScriptInjected) return;
        window.googleTranslateScriptInjected = true;

        // إنشاء عنصر السكربت
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.head.appendChild(script);

        // دالة التهيئة
        window.googleTranslateElementInit = function() {
            new google.translate.TranslateElement({
                pageLanguage: 'auto', 
                includedLanguages: 'ar', 
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: true, // عرض تلقائي
                multilanguagePage: true
            }, 'google_translate_element');
        };

        // إنشاء حاوية مخفية (نعتمد على الكوكيز للترجمة الفعلية)
        // ولكن وجود هذا العنصر ضروري لعمل السكربت
        if (!document.getElementById('google_translate_element')) {
            const div = document.createElement('div');
            div.id = 'google_translate_element';
            div.style.display = 'none'; // نخفيه للحفاظ على التصميم
            document.body.insertBefore(div, document.body.firstChild);
        }
      })();
      true;
    `;
  }
};

export default TranslationEngine;
