
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
  Text,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
  Linking, 
  Clipboard as RNClipboard 
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather as Icon } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print'; 
import * as Speech from 'expo-speech'; 

// Import Logic
import useBrowserLogic from '../hooks/useBrowserLogic';
import AdBlockManager from '../core/AdBlockEngine';
import Storage from '../core/Storage';
import { generateUUID } from '../core/Helpers';
import ReaderModeEngine from '../core/ReaderModeEngine'; 
import ImageExtractionEngine from '../core/ImageExtractionEngine'; 
import DevToolsEngine from '../core/DevToolsEngine'; 
import FeatureScripts from '../core/FeatureScripts'; 
import PageMods from '../core/PageMods'; 

// Import Styles
import styles from '../styles/AppStyles';

// Import Components
import BrowserWebView from '../components/BrowserWebView'; 
import ImageGalleryView from '../components/ImageGalleryView'; 
import ConsoleView from '../components/ConsoleView';
import ScriptManagerView from '../components/ScriptManagerView';
import TabsTray from '../components/TabsTray';
import WebsitesBar from '../components/WebsitesBar';
import HistoryView from '../components/HistoryView';
import FloatingToolbar from '../components/FloatingToolbar';
import AddWebsiteModal from '../components/AddWebsiteModal';
import NativeReaderView from '../components/NativeReaderView';
import NetworkInspectorView from '../components/NetworkInspectorView';
import StorageManagerView from '../components/StorageManagerView';
import InspectorModal from '../components/InspectorModal';
import BlockedElementsView from '../components/BlockedElementsView'; 
import SettingsView from '../components/SettingsView';
import HomePage from '../components/HomePage';

const SmartBrowser = () => {
  const { state, setters, actions, refs } = useBrowserLogic();
  
  // UI States (Local View State)
  const [showWebsitesBar, setShowWebsitesBar] = useState(false);
  const [showTabsTray, setShowTabsTray] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isToolbarHidden, setIsToolbarHidden] = useState(true);
  const [showAddWebsite, setShowAddWebsite] = useState(false);
  const [tabToFavorite, setTabToFavorite] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Tools UI States
  const [showConsole, setShowConsole] = useState(false);
  const [showScriptManager, setShowScriptManager] = useState(false);
  const [showBlockedManager, setShowBlockedManager] = useState(false);
  const [showNetworkInspector, setShowNetworkInspector] = useState(false);
  const [showStorageManager, setShowStorageManager] = useState(false);
  
  // Feature UI States
  const [readerVisible, setReaderVisible] = useState(false);
  const [readerData, setReaderData] = useState(null);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [showFindBar, setShowFindBar] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [findResultCount, setFindResultCount] = useState(0);
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [sourceCodeText, setSourceCodeText] = useState('');
  
  const currentTab = state.tabs.find(t => t.id === state.currentTabID);

  useEffect(() => {
    StatusBar.setHidden(true, 'fade');
  }, []);

  // --- Search Logic ---
  const performSearch = (text) => {
      // Add to search history
      actions.addSearchQuery(text);

      let url = text;
      // Simple regex to check if it looks like a URL
      const isUrl = /^(http:\/\/|https:\/\/|www\.|[a-zA-Z0-9-]+\.[a-z]{2,})/.test(text);
      
      if (isUrl) {
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
              url = 'https://' + url;
          }
      } else {
          // Search Engine Logic
          const query = encodeURIComponent(text);
          switch (state.searchEngine) {
              case 'DuckDuckGo':
                  url = `https://duckduckgo.com/?q=${query}`;
                  break;
              case 'Bing':
                  url = `https://www.bing.com/search?q=${query}`;
                  break;
              case 'Google':
              default:
                  url = `https://www.google.com/search?q=${query}`;
                  break;
          }
      }
      
      // Navigate
      if (refs.current[state.currentTabID]) {
          // If we are on the home page (no WebView yet), update tab state to force render
          if (currentTab.url === 'zeus://home') {
              actions.updateTab(currentTab.id, { url: url });
          } else {
              refs.current[state.currentTabID].injectJavaScript(`window.location.href = '${url}'; true;`);
          }
      } else {
          // Fallback if ref is missing (rare)
          actions.updateTab(currentTab.id, { url: url });
      }
  };

  // --- Handlers ---

  const handleWebViewMessage = (event) => {
    try {
        const data = JSON.parse(event.nativeEvent.data);
        switch(data.type) {
            case 'CONSOLE_LOG':
                setters.setConsoleLogs(prev => [...prev, {
                    id: Math.random().toString(36).substr(2,9),
                    level: data.level,
                    message: data.payload,
                    timestamp: new Date().toLocaleTimeString()
                }].slice(-200)); 
                break;
            case 'NETWORK_LOG': 
                if (showNetworkInspector) setters.setNetworkLogs(prev => [data.payload, ...prev].slice(0, 50));
                break;
            case 'ELEMENT_INSPECTED': 
                setters.setInspectedElement(data.payload);
                setters.setIsInspectorActive(false); 
                break;
            case 'STORAGE_DATA': 
                setters.setStorageData(data.payload);
                break;
            case 'READER_EXTRACTED':
                setReaderData(data.payload); 
                setReaderVisible(true);      
                break;
            case 'IMAGES_EXTRACTED':
                setGalleryImages(data.payload);
                setGalleryVisible(true);
                break;
            case 'FIND_RESULT':
                setFindResultCount(data.payload);
                break;
            case 'VIEW_SOURCE':
                setSourceCodeText(data.payload);
                setShowSourceCode(true);
                break;
            case 'SPEAK_TEXT':
                Speech.speak(data.payload, { language: 'ar' });
                break;
            case 'ACTION_COMPLETE':
                Alert.alert('تم', data.payload);
                break;
        }
    } catch (e) {}
  };

  const executeFeature = (scriptGen, args = []) => {
      if (refs.current[state.currentTabID]) {
          refs.current[state.currentTabID].injectJavaScript(scriptGen(...args));
      }
  };

  const toggleDomInspector = () => {
      const newState = !state.isInspectorActive;
      setters.setIsInspectorActive(newState);
      executeFeature(DevToolsEngine.getDomInspectorScript, [newState]);
      if (newState) Alert.alert('وضع الفحص', 'اضغط على أي عنصر في الصفحة لفحصه.');
  };

  // --- Render ---
  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      <View style={styles.webViewContainer}>
        {currentTab && (
            currentTab.url === 'zeus://home' ? (
                // Custom Home Page
                <HomePage 
                    currentEngine={state.searchEngine}
                    websites={state.websites}
                    searchHistory={state.searchHistory}
                    onSearch={performSearch}
                    onAddFavorite={() => setShowAddWebsite(true)}
                    onOpenSite={(url) => actions.updateTab(currentTab.id, { url: url })}
                    onRemoveHistoryItem={actions.removeSearchQuery}
                />
            ) : (
                // Actual Browser
                <BrowserWebView
                    ref={(r) => (refs.current[state.currentTabID] = r)}
                    tab={currentTab}
                    isDesktopMode={state.isDesktopMode}
                    isIncognito={state.isIncognito}
                    isTranslatorActive={state.isTranslatorActive}
                    isDarkMode={state.isForcedDarkMode}
                    userScripts={state.userScripts}
                    customBlockRules={state.customBlockRules}
                    
                    onLoadStart={() => {
                        StatusBar.setHidden(true);
                        actions.updateTab(currentTab.id, { isLoading: true });
                    }}
                    onLoadEnd={() => {
                        StatusBar.setHidden(true);
                        actions.updateTab(currentTab.id, { isLoading: false });
                    }}
                    onNavigationStateChange={(navState) => {
                        StatusBar.setHidden(true);
                        actions.updateTab(currentTab.id, {
                            url: navState.url,
                            title: navState.title || 'موقع',
                            canGoBack: navState.canGoBack,
                            canGoForward: navState.canGoForward,
                            isLoading: navState.loading,
                        });
                        if (!navState.loading && navState.title && navState.url) {
                            actions.addToHistory(navState.title, navState.url);
                            actions.saveTabsState(state.tabs, currentTab.id); 
                        }
                    }}
                    onMessage={handleWebViewMessage}
                    onShouldBlock={(url) => {
                        // Pass user blocked domains here
                        const blocked = AdBlockManager.shouldBlockRequest(url, currentTab.url, state.userBlockedDomains);
                        if (blocked) setters.setAdsBlocked(p => p + 1);
                        return blocked;
                    }}
                />
            )
        )}
      </View>

      {/* --- Find Bar --- */}
      {showFindBar && (
          <View style={localStyles.findBar}>
              <TextInput 
                  style={localStyles.findInput}
                  placeholder="بحث في الصفحة..."
                  placeholderTextColor="#888"
                  value={findQuery}
                  onChangeText={setFindQuery}
                  onSubmitEditing={() => executeFeature(FeatureScripts.getFindInPageScript, [findQuery])}
              />
              <Text style={{color: '#fff', marginHorizontal: 10}}>{findResultCount > 0 ? `${findResultCount} نتائج` : ''}</Text>
              <TouchableOpacity onPress={() => executeFeature(FeatureScripts.getFindInPageScript, [findQuery])} style={{marginRight: 10}}>
                  <Icon name="search" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowFindBar(false); setFindResultCount(0); executeFeature(FeatureScripts.getFindInPageScript, ['']); }}>
                  <Icon name="x" size={20} color="#fff" />
              </TouchableOpacity>
          </View>
      )}

      {/* --- Source Code Modal --- */}
      <Modal visible={showSourceCode} animationType="slide" onRequestClose={() => setShowSourceCode(false)}>
          <View style={{flex: 1, backgroundColor: '#1e1e1e'}}>
              <View style={localStyles.sourceHeader}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>HTML Source (Preview)</Text>
                  <View style={{flexDirection: 'row'}}>
                      <TouchableOpacity onPress={async () => { await Clipboard.setStringAsync(sourceCodeText); Alert.alert('تم النسخ'); }} style={{marginRight: 15}}>
                          <Icon name="copy" size={24} color="#007AFF" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setShowSourceCode(false)}>
                          <Icon name="x" size={24} color="#fff" />
                      </TouchableOpacity>
                  </View>
              </View>
              <ScrollView style={{padding: 10}}>
                  <Text style={{color: '#a6e22e', fontFamily: 'monospace'}} selectable>{sourceCodeText}</Text>
              </ScrollView>
          </View>
      </Modal>

      {/* --- Toolbars & Overlays --- */}
      <FloatingToolbar
        isHidden={isToolbarHidden}
        onToggle={() => setIsToolbarHidden(!isToolbarHidden)}
        // Nav
        onGoBack={() => refs.current[state.currentTabID]?.goBack()}
        onGoForward={() => refs.current[state.currentTabID]?.goForward()}
        onReload={() => refs.current[state.currentTabID]?.reload()}
        onGoHome={() => actions.updateTab(currentTab.id, { url: 'zeus://home' })}
        canGoBack={currentTab?.canGoBack || false}
        canGoForward={currentTab?.canGoForward || false}
        // Tabs
        onAddTab={() => actions.addNewTab()}
        onShowTabsTray={() => setShowTabsTray(true)}
        // Menus
        onShowWebsites={() => { setShowWebsitesBar(true); setIsToolbarHidden(true); }}
        onShowHistory={() => { setShowHistory(true); setIsToolbarHidden(true); }}
        onReaderMode={() => executeFeature(ReaderModeEngine.getExtractionScript)}
        onShowGallery={() => executeFeature(ImageExtractionEngine.getExtractionScript)}
        onToggleDarkMode={actions.toggleDarkMode}
        isDarkMode={state.isForcedDarkMode}
        onToggleDesktopMode={actions.toggleDesktopMode}
        isDesktopMode={state.isDesktopMode}
        adsBlocked={state.adsBlocked}
        // Features
        onTranslate={actions.toggleTranslator}
        isTranslatorActive={state.isTranslatorActive}
        onFindInPage={() => { setShowFindBar(true); setIsToolbarHidden(true); }}
        onEnableCopy={() => executeFeature(PageMods.getEnableCopyScript)}
        onViewSource={() => executeFeature(FeatureScripts.getViewSourceScript)}
        onClearData={() => executeFeature(FeatureScripts.getClearDataScript)}
        onPrintPdf={async () => { try { await Print.printAsync(); } catch(e){} }}
        onToggleIncognito={actions.toggleIncognito}
        isIncognito={state.isIncognito}
        onSpeak={() => refs.current[state.currentTabID]?.injectJavaScript(`(function(){ window.ReactNativeWebView.postMessage(JSON.stringify({type:'SPEAK_TEXT', payload: document.body.innerText.substring(0,1000)})); })(); true;`)}
        // DevTools
        onShowConsole={() => { setShowConsole(true); setIsToolbarHidden(true); }}
        onShowScripts={() => { setShowScriptManager(true); setIsToolbarHidden(true); }}
        onShowNetwork={() => { setShowNetworkInspector(true); executeFeature(DevToolsEngine.getToggleNetworkScript, [true]); setIsToolbarHidden(true); }}
        onShowStorage={() => { setShowStorageManager(true); executeFeature(DevToolsEngine.getStorageReaderScript); setIsToolbarHidden(true); }}
        onToggleInspector={() => { toggleDomInspector(); setIsToolbarHidden(true); }}
        isInspectorActive={state.isInspectorActive}
        onShowBlockedManager={() => { setShowBlockedManager(true); setIsToolbarHidden(true); }}
        // Settings
        onShowSettings={() => { setShowSettings(true); setIsToolbarHidden(true); }}
      />

      {!showTabsTray && (
        <TouchableOpacity
          style={styles.topDragArea}
          activeOpacity={1}
          onPress={() => setShowTabsTray(true)}
        />
      )}

      {/* --- Views --- */}
      {showWebsitesBar && (
        <>
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowWebsitesBar(false)} />
          <WebsitesBar
            websites={state.websites}
            currentURL={currentTab?.url || ''}
            adsBlocked={state.adsBlocked}
            onClose={() => setShowWebsitesBar(false)}
            onAdd={() => setShowAddWebsite(true)}
            onSelect={(url) => {
              // If on Home Page, update URL state directly, else inject JS
              if (currentTab.url === 'zeus://home') {
                  actions.updateTab(currentTab.id, { url: url });
              } else if (refs.current[state.currentTabID]) {
                  refs.current[state.currentTabID].injectJavaScript(`window.location.href = '${url}'; true;`);
              }
              setShowWebsitesBar(false);
            }}
            onDelete={actions.deleteWebsite}
          />
        </>
      )}

      {showHistory && (
        <HistoryView
          history={state.history}
          onClose={() => setShowHistory(false)}
          onSelect={(url) => {
            if (currentTab.url === 'zeus://home') {
                actions.updateTab(currentTab.id, { url: url });
            } else if (refs.current[state.currentTabID]) {
                refs.current[state.currentTabID].injectJavaScript(`window.location.href = '${url}'; true;`);
            }
            setShowHistory(false);
          }}
          onDelete={actions.deleteHistoryItem}
          onClearAll={actions.clearAllHistory}
        />
      )}

      {showTabsTray && (
        <>
          <TouchableOpacity style={styles.tabsOverlay} activeOpacity={1} onPress={() => setShowTabsTray(false)} />
          <TabsTray
            tabs={state.tabs}
            currentTabID={state.currentTabID}
            onClose={() => setShowTabsTray(false)}
            onSelectTab={(id) => { actions.selectTab(id); setShowTabsTray(false); }}
            onCloseTab={actions.closeTab}
            onAddTab={() => { actions.addNewTab(); setShowTabsTray(false); }}
            onFavorite={(tab) => { setTabToFavorite(tab); setShowAddWebsite(true); }}
          />
        </>
      )}

      {showAddWebsite && (
        <AddWebsiteModal
          visible={showAddWebsite}
          onClose={() => { setShowAddWebsite(false); setTabToFavorite(null); }}
          onAdd={actions.addWebsite}
          initialName={tabToFavorite?.title || ''}
          initialUrl={tabToFavorite?.url || ''}
        />
      )}

      {showSettings && (
          <SettingsView 
              visible={showSettings}
              onClose={() => setShowSettings(false)}
              currentEngine={state.searchEngine}
              onSelectEngine={actions.changeSearchEngine}
          />
      )}

      {/* --- DevTools --- */}
      {showConsole && (
          <ConsoleView 
              logs={state.consoleLogs} 
              onClose={() => setShowConsole(false)}
              onExecute={(cmd) => refs.current[state.currentTabID]?.injectJavaScript(`try{console.log(eval(${JSON.stringify(cmd)}))}catch(e){console.error(e)} true;`)}
              onClear={() => setters.setConsoleLogs([])}
          />
      )}

      {showNetworkInspector && (
          <NetworkInspectorView
              logs={state.networkLogs}
              onClose={() => { setShowNetworkInspector(false); executeFeature(DevToolsEngine.getToggleNetworkScript, [false]); }}
              onClear={() => setters.setNetworkLogs([])}
          />
      )}

      {showStorageManager && (
          <StorageManagerView
              data={state.storageData}
              onClose={() => setShowStorageManager(false)}
              onUpdate={(type, k, v, op) => executeFeature(DevToolsEngine.getStorageUpdaterScript, [type, k, v, op])}
          />
      )}

      <InspectorModal
          visible={!!state.inspectedElement}
          data={state.inspectedElement}
          onClose={() => setters.setInspectedElement(null)}
          onBlock={actions.addBlockRule}
      />
      
      {showBlockedManager && (
          <BlockedElementsView 
              rules={state.customBlockRules}
              userBlockedDomains={state.userBlockedDomains}
              onClose={() => setShowBlockedManager(false)}
              onDelete={actions.removeBlockRule}
              onAddDomain={actions.addBlockedDomain}
              onRemoveDomain={actions.removeBlockedDomain}
          />
      )}

      {showScriptManager && (
          <ScriptManagerView
              scripts={state.userScripts}
              onClose={() => setShowScriptManager(false)}
              onSave={actions.saveUserScripts}
          />
      )}

      {/* --- Reader & Gallery --- */}
      <ImageGalleryView 
        visible={galleryVisible}
        images={galleryImages}
        onClose={() => setGalleryVisible(false)}
      />

      <NativeReaderView 
        visible={readerVisible}
        data={readerData}
        onClose={() => setReaderVisible(false)}
      />

    </View>
  );
};

const localStyles = StyleSheet.create({
    findBar: {
        position: 'absolute', top: 0, left: 0, right: 0,
        backgroundColor: '#222', flexDirection: 'row', alignItems: 'center',
        padding: 10, zIndex: 100, borderBottomWidth: 1, borderColor: '#444'
    },
    findInput: {
        flex: 1, backgroundColor: '#333', color: '#fff',
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, marginRight: 10
    },
    sourceHeader: {
        flexDirection: 'row', justifyContent: 'space-between', padding: 15,
        backgroundColor: '#1a1a1a', borderBottomWidth: 1, borderColor: '#333'
    }
});

export default SmartBrowser;
