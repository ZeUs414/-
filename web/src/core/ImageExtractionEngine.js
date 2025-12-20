// src/core/ImageExtractionEngine.js

const ImageExtractionEngine = {
  getExtractionScript: () => {
    return `
      (function() {
        try {
          // دالة لفلترة الصور الصغيرة جداً (الأيقونات)
          const isValidImage = (img) => {
             return img.naturalWidth > 150 || img.naturalHeight > 150;
          };

          let images = [];
          
          // 1. البحث في وسوم img
          document.querySelectorAll('img').forEach(img => {
            if (img.src && isValidImage(img)) {
                images.push(img.src);
            }
          });

          // 2. البحث في الخلفيات (background-image) للعناصر الكبيرة
          document.querySelectorAll('div, section, article, span').forEach(el => {
             const style = window.getComputedStyle(el);
             const bg = style.backgroundImage;
             if (bg && bg !== 'none' && bg.startsWith('url(')) {
                 let url = bg.slice(4, -1).replace(/["']/g, "");
                 images.push(url);
             }
          });

          // 3. إزالة التكرار
          const uniqueImages = [...new Set(images)];

          if (uniqueImages.length > 0) {
             window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'IMAGES_EXTRACTED',
                payload: uniqueImages
             }));
          } else {
             window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'CONSOLE_LOG',
                level: 'warn',
                payload: 'لم يتم العثور على صور مناسبة في هذه الصفحة'
             }));
          }

        } catch(e) {
           window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CONSOLE_LOG', level: 'error', payload: e.message }));
        }
      })();
      true;
    `;
  }
};

export default ImageExtractionEngine;
