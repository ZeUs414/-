import React, { useMemo, forwardRef } from 'react';
import { WebView } from 'react-native-webview';
import { View, Linking, ActivityIndicator, Platform } from 'react-native';
import styles from '../styles/AppStyles';

// Logic Engines
import AdBlockManager from '../core/AdBlockEngine';
import DevToolsEngine from '../core/DevToolsEngine';
import TranslationEngine from '../core/TranslationEngine';

const desktopUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const mobileUA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

const BrowserWebView = forwardRef(({ 
    tab, 
    isDesktopMode, 
    isIncognito, 
    isTranslatorActive,
    isDarkMode,
    userScripts, 
    customBlockRules,
    onLoadStart,
    onLoadEnd,
    onNavigationStateChange,
    onMessage,
    onShouldBlock
}, ref) => {

    const combinedInjection = useMemo(() => {
        return `
            ${AdBlockManager.getTitaniumInjection(userScripts, customBlockRules)}
            ${DevToolsEngine.getNetworkInterceptorScript()}
            ${DevToolsEngine.getConsoleInterceptorScript()}
            ${isTranslatorActive ? TranslationEngine.getInjectionScript() : ''}
        `;
      }, [userScripts, customBlockRules, isTranslatorActive]);

    const applyDarkMode = (webViewRef) => {
        if (!webViewRef) return;
        const css = 'html { filter: invert(100%) hue-rotate(180deg) !important; } img, video, iframe, canvas, :not(object):not(body)>embed, [style*="background-image"] { filter: invert(100%) hue-rotate(180deg) !important; }';
        const js = isDarkMode
          ? `if (!document.getElementById('forced-dark-mode-style')) {
              var style = document.createElement('style');
              style.id = 'forced-dark-mode-style';
              style.innerHTML = '${css}';
              document.head.appendChild(style);
            }`
          : `if (document.getElementById('forced-dark-mode-style')) {
              document.getElementById('forced-dark-mode-style').remove();
            }`;
        webViewRef.injectJavaScript(js);
    };

    return (
        <View style={styles.webViewContainer}>
            {/* ✅ FIX #4: Visible Loading Indicator over Black Background */}
            {tab.isLoading && (
              <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#007AFF" />
              </View>
            )}
            
            {/* ProgressBar is kept for visual progress tracking */}
            {tab.isLoading && (
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
            )}
            
            <WebView
              ref={ref}
              key={tab.id}
              source={{ uri: tab.url }}
              userAgent={isDesktopMode ? desktopUA : mobileUA}
              
              // ✅ CRITICAL FIX: Changed "normal" to number to fix Android Crash
              decelerationRate={0.998}
              
              overScrollMode="content"
              renderToHardwareTextureAndroid={true} // ✅ Performance
              
              incognito={isIncognito}
              
              onLoadStart={onLoadStart}
              onLoad={() => {
                  if (isDarkMode) applyDarkMode(ref.current);
              }}
              onLoadEnd={onLoadEnd}
              
              onNavigationStateChange={onNavigationStateChange}
              
              onMessage={onMessage}
              
              // ✅ Blocks requests based on AdBlock engine logic
              onShouldStartLoadWithRequest={(request) => {
                if (onShouldBlock(request.url)) return false;
                return true;
              }}

              // ✅ Prevent New Windows (Popups) - Fix for "White Screen" popups
              onOpenWindow={(syntheticEvent) => {
                  // If standard link, maybe open in current webview or system browser
                  // But for ads, we usually want to block.
                  const { targetUrl } = syntheticEvent.nativeEvent;
                  console.log("Blocked Popup:", targetUrl);
                  return false; // Prevent opening
              }}

              onFileDownload={({ nativeEvent }) => {
                 if (nativeEvent.downloadUrl) Linking.openURL(nativeEvent.downloadUrl);
              }}
              onDownloadStart={(event) => {
                  if (event.nativeEvent.url) Linking.openURL(event.nativeEvent.url);
              }}

              javaScriptEnabled={true}
              domStorageEnabled={true}
              // ✅ MODIFIED: Must be true on Android to catch the event in onOpenWindow instead of redirecting main view
              javaScriptCanOpenWindowsAutomatically={true} 
              injectedJavaScriptBeforeContentLoaded={combinedInjection}
              
              // ✅ MODIFIED: Must be true on Android to prevent it from loading popup in current view
              setSupportMultipleWindows={true} 
              sharedCookiesEnabled={!isIncognito}
              thirdPartyCookiesEnabled={!isIncognito}
              
              // ✅ Black background to hide white flash
              style={[styles.webView, { backgroundColor: '#000000' }]} 
              containerStyle={{ backgroundColor: '#000000' }}
            />
        </View>
    );
});

export default BrowserWebView;