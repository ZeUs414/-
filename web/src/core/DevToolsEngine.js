
// ===============================================
// MARK: - محرك أدوات المطورين (DevTools Engine)
// ===============================================

const DevToolsEngine = {
  // 1. اعتراض الكونسول (Console Interceptor)
  getConsoleInterceptorScript: () => {
    return `
      (function() {
        if (window.consoleIntercepted) return;
        window.consoleIntercepted = true;

        function sendToApp(level, args) {
            try {
                const message = args.map(arg => {
                    if (arg === null) return 'null';
                    if (arg === undefined) return 'undefined';
                    if (typeof arg === 'object') {
                        try { return JSON.stringify(arg); } catch(e) { return '[Circular Object]'; }
                    }
                    return String(arg);
                }).join(' ');

                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'CONSOLE_LOG',
                    level: level,
                    payload: message
                }));
            } catch (e) {}
        }

        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;

        console.log = function(...args) { sendToApp('log', args); originalLog.apply(console, args); };
        console.error = function(...args) { sendToApp('error', args); originalError.apply(console, args); };
        console.warn = function(...args) { sendToApp('warn', args); originalWarn.apply(console, args); };
        console.info = function(...args) { sendToApp('info', args); originalInfo.apply(console, args); };

        window.addEventListener('error', function(e) {
            sendToApp('error', ['[Uncaught Exception]', e.message, 'at', e.filename, ':', e.lineno]);
        });
      })();
      true;
    `;
  },

  // 2. اعتراض طلبات الشبكة (Fetch & XHR) - (FIXED)
  getNetworkInterceptorScript: () => {
    return `
      (function() {
        if (window.networkInterceptorInjected) return;
        window.networkInterceptorInjected = true;
        // Default to true to ensure capture if enabled from UI immediately, 
        // controlled by subsequent toggle commands.
        window.__NETWORK_INSPECTOR_ENABLED__ = false; 

        function sendNetworkLog(type, method, url, status, data) {
           if (!window.__NETWORK_INSPECTOR_ENABLED__) return;
           try {
               window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'NETWORK_LOG',
                  payload: {
                     id: Math.random().toString(36).substr(2, 9),
                     timestamp: new Date().toLocaleTimeString(),
                     requestType: type,
                     method: method,
                     url: url,
                     status: status,
                     data: data ? String(data).substring(0, 1000) : '' 
                  }
               }));
           } catch(e) {}
        }

        // --- Fetch Interceptor ---
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
           let [resource, config] = args;
           let method = 'GET';
           let url = '';

           if (resource instanceof Request) {
               method = resource.method;
               url = resource.url;
           } else {
               url = resource;
               if (config && config.method) method = config.method;
           }

           try {
              const response = await originalFetch(...args);
              
              if (window.__NETWORK_INSPECTOR_ENABLED__) {
                  try {
                      const clone = response.clone();
                      clone.text().then(text => {
                         sendNetworkLog('FETCH', method, url, response.status, text);
                      }).catch(err => {
                         sendNetworkLog('FETCH', method, url, response.status, '[Binary or Opaque Data]');
                      });
                  } catch (e) {
                      sendNetworkLog('FETCH', method, url, response.status, '[Response Read Error]');
                  }
              }
              return response;
           } catch(err) {
              if (window.__NETWORK_INSPECTOR_ENABLED__) sendNetworkLog('FETCH', method, url, 'ERR', err.message);
              throw err;
           }
        };

        // --- XHR Interceptor ---
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url) {
           this._method = method;
           this._url = url;
           return originalOpen.apply(this, arguments);
        };
        
        XMLHttpRequest.prototype.send = function(body) {
           this.addEventListener('load', function() {
              if (window.__NETWORK_INSPECTOR_ENABLED__) {
                  let responseData = '[No Content]';
                  try {
                      if (this.responseType === '' || this.responseType === 'text') {
                          responseData = this.responseText;
                      } else if (this.responseType === 'json') {
                          responseData = JSON.stringify(this.response);
                      } else {
                          responseData = '[' + this.responseType + ' data]';
                      }
                  } catch (e) { responseData = '[Read Error]'; }
                  
                  sendNetworkLog('XHR', this._method, this._url, this.status, responseData);
              }
           });
           this.addEventListener('error', function() {
               if (window.__NETWORK_INSPECTOR_ENABLED__) sendNetworkLog('XHR', this._method, this._url, 'ERR', 'Network Error');
           });
           return originalSend.apply(this, arguments);
        };
      })();
      true;
    `;
  },
  
  getToggleNetworkScript: (isEnabled) => {
      return `window.__NETWORK_INSPECTOR_ENABLED__ = ${isEnabled}; true;`;
  },

  // 3. فاحص العناصر
  getDomInspectorScript: (active) => {
    if (!active) return `if(window.removeInspector) window.removeInspector(); true;`;
    return `
      (function() {
        if (window.inspectorActive) return;
        window.inspectorActive = true;
        const style = document.createElement('style');
        style.id = 'inspector-style';
        style.textContent = '.inspector-highlight { outline: 3px solid #ff0000 !important; background: rgba(255,0,0,0.1) !important; cursor: crosshair !important; z-index: 999999 !important; }';
        document.head.appendChild(style);

        let hoveredElement = null;

        function getCssPath(el) {
            if (!(el instanceof Element)) return;
            const path = [];
            while (el.nodeType === Node.ELEMENT_NODE) {
                let selector = el.nodeName.toLowerCase();
                if (el.id) {
                    selector += '#' + el.id;
                    path.unshift(selector);
                    break;
                } else {
                    let sib = el, nth = 1;
                    while (sib = sib.previousElementSibling) {
                        if (sib.nodeName.toLowerCase() == selector) nth++;
                    }
                    if (nth != 1) selector += ":nth-of-type("+nth+")";
                }
                path.unshift(selector);
                el = el.parentNode;
            }
            return path.join(" > ");
        }

        function onMouseOver(e) {
            if (hoveredElement) hoveredElement.classList.remove('inspector-highlight');
            hoveredElement = e.target;
            hoveredElement.classList.add('inspector-highlight');
            e.stopPropagation();
        }

        function onClick(e) {
            e.preventDefault();
            e.stopPropagation();
            const el = e.target;
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ELEMENT_INSPECTED',
                payload: {
                    tagName: el.tagName,
                    id: el.id,
                    className: el.className,
                    cssSelector: getCssPath(el),
                    html: el.outerHTML ? el.outerHTML.substring(0, 300) : ''
                }
            }));
        }

        window.removeInspector = function() {
            document.removeEventListener('mouseover', onMouseOver);
            document.removeEventListener('click', onClick, true);
            if (document.getElementById('inspector-style')) document.getElementById('inspector-style').remove();
            if (hoveredElement) hoveredElement.classList.remove('inspector-highlight');
            window.inspectorActive = false;
        };
        document.addEventListener('mouseover', onMouseOver);
        document.addEventListener('click', onClick, true);
      })();
      true;
    `;
  },

  // 4. مدير التخزين
  getStorageReaderScript: () => {
    return `
      (function() {
        const payload = {
            localStorage: JSON.stringify(localStorage),
            sessionStorage: JSON.stringify(sessionStorage),
            cookies: document.cookie
        };
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'STORAGE_DATA', payload: payload }));
      })();
      true;
    `;
  },

  getStorageUpdaterScript: (type, key, value, action) => {
    const safeValue = value ? value.replace(/\\/g, '\\\\').replace(/'/g, "\\'") : '';
    return `
      (function() {
        try {
            if ('${type}' === 'localStorage') {
                if ('${action}' === 'DELETE') localStorage.removeItem('${key}');
                else if ('${action}' === 'CLEAR') localStorage.clear();
                else localStorage.setItem('${key}', '${safeValue}');
            } else if ('${type}' === 'sessionStorage') {
                if ('${action}' === 'DELETE') sessionStorage.removeItem('${key}');
                else if ('${action}' === 'CLEAR') sessionStorage.clear();
                else sessionStorage.setItem('${key}', '${safeValue}');
            } else if ('${type}' === 'cookies') {
                if ('${action}' === 'DELETE') {
                    document.cookie = '${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                } else {
                     document.cookie = '${key}=${safeValue}; path=/;';
                }
            }
            const payload = {
                localStorage: JSON.stringify(localStorage),
                sessionStorage: JSON.stringify(sessionStorage),
                cookies: document.cookie
            };
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'STORAGE_DATA', payload: payload }));
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CONSOLE_LOG', level: 'info', payload: 'Storage updated successfully' }));
        } catch(e) {
             window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CONSOLE_LOG', level: 'error', payload: 'Storage update failed: ' + e.message }));
        }
      })();
      true;
    `;
  }
};

export default DevToolsEngine;
