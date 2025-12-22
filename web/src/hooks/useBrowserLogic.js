
import { useState, useRef, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import Storage from '../core/Storage';
import { generateUUID } from '../core/Helpers';
import TranslationEngine from '../core/TranslationEngine';
import PageMods from '../core/PageMods';

// هذا الملف يحتوي على "عقل" المتصفح
// تم فصل المنطق عن الواجهة (UI)

const useBrowserLogic = () => {
  // --- States ---
  const [tabs, setTabs] = useState([]);
  const [currentTabID, setCurrentTabID] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [history, setHistory] = useState([]);
  const [adsBlocked, setAdsBlocked] = useState(0);
  
  // Settings State
  const [searchEngine, setSearchEngine] = useState('Google'); // Google, DuckDuckGo, Bing
  const [searchHistory, setSearchHistory] = useState([]);

  // Feature Flags
  const [isForcedDarkMode, setIsForcedDarkMode] = useState(false);
  const [isDesktopMode, setIsDesktopMode] = useState(false);
  const [isTranslatorActive, setIsTranslatorActive] = useState(false); 
  const [isIncognito, setIsIncognito] = useState(false); 

  // DevTools Data
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [networkLogs, setNetworkLogs] = useState([]);
  const [storageData, setStorageData] = useState(null);
  const [customBlockRules, setCustomBlockRules] = useState([]);
  const [userBlockedDomains, setUserBlockedDomains] = useState([]); // New: Blocked Domains
  const [userScripts, setUserScripts] = useState([]);
  
  // Inspector State
  const [inspectedElement, setInspectedElement] = useState(null);
  const [isInspectorActive, setIsInspectorActive] = useState(false);

  const webViewRefs = useRef({});

  // --- Initial Load ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const savedWebsites = await Storage.getItem('saved_websites');
    if (savedWebsites) setWebsites(savedWebsites);

    const savedHistory = await Storage.getItem('browser_history_data');
    if (savedHistory) setHistory(savedHistory.sort((a, b) => new Date(b.date) - new Date(a.date)));

    const savedDarkMode = await Storage.getItem('browser_forced_dark_mode_key');
    if (savedDarkMode) setIsForcedDarkMode(savedDarkMode);

    const savedDesktopMode = await Storage.getItem('browser_desktop_mode');
    if (savedDesktopMode) setIsDesktopMode(savedDesktopMode);

    const savedEngine = await Storage.getItem('browser_search_engine');
    if (savedEngine) setSearchEngine(savedEngine);

    const savedScripts = await Storage.getItem('user_custom_scripts');
    if (savedScripts) setUserScripts(savedScripts);

    const savedRules = await Storage.getItem('user_custom_block_rules');
    if (savedRules) setCustomBlockRules(savedRules);

    const savedDomains = await Storage.getItem('user_blocked_domains');
    if (savedDomains) setUserBlockedDomains(savedDomains);

    const savedSearchHistory = await Storage.getItem('user_search_history');
    if (savedSearchHistory) setSearchHistory(savedSearchHistory);

    const savedTabs = await Storage.getItem('browser_saved_tabs_list');
    const lastActiveTab = await Storage.getItem('browser_last_active_tab_id');

    if (savedTabs && savedTabs.length > 0) {
      setTabs(savedTabs);
      setCurrentTabID(lastActiveTab || savedTabs[0].id);
    } else {
      addNewTab();
    }
  };

  // --- Tab Management ---
  const saveTabsState = async (newTabs, newCurrentID) => {
    if (isIncognito) return;
    const tabsData = newTabs.map((t) => ({ id: t.id, title: t.title, url: t.url }));
    await Storage.setItem('browser_saved_tabs_list', tabsData);
    await Storage.setItem('browser_last_active_tab_id', newCurrentID);
  };

  // تغيير صفحة البداية لتكون الصفحة الرئيسية للتطبيق بدلاً من محرك البحث مباشرة
  const addNewTab = (url = 'zeus://home') => {
    const newTab = {
      id: generateUUID(),
      title: 'صفحة رئيسية',
      url: url,
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
    };
    const newTabs = [...tabs, newTab];
    setTabs(newTabs);
    setCurrentTabID(newTab.id);
    saveTabsState(newTabs, newTab.id);
  };

  const closeTab = (id) => {
    if (tabs.length === 1) return;
    const index = tabs.findIndex((t) => t.id === id);
    if (index === -1) return;

    const newTabs = tabs.filter((t) => t.id !== id);
    if (currentTabID === id) {
      const newIndex = index === 0 ? 0 : index - 1;
      setCurrentTabID(newTabs[newIndex].id);
      saveTabsState(newTabs, newTabs[newIndex].id);
    } else {
      saveTabsState(newTabs, currentTabID);
    }
    setTabs(newTabs);
  };

  const selectTab = (id) => {
    setCurrentTabID(id);
    saveTabsState(tabs, id);
    // تصفير الحالات المؤقتة عند تغيير التبويب
    setConsoleLogs([]); 
    setNetworkLogs([]); 
    setInspectedElement(null); 
    setIsInspectorActive(false); 
    setIsTranslatorActive(false);
  };

  const updateTab = (id, updates) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  // --- Features Logic ---
  
  const changeSearchEngine = async (engineName) => {
      setSearchEngine(engineName);
      await Storage.setItem('browser_search_engine', engineName);
  };

  const addSearchQuery = async (query) => {
      if (isIncognito || !query.trim()) return;
      const newHistory = [query, ...searchHistory.filter(q => q !== query)].slice(0, 20); // Keep last 20 unique
      setSearchHistory(newHistory);
      await Storage.setItem('user_search_history', newHistory);
  };

  const removeSearchQuery = async (query) => {
      const newHistory = searchHistory.filter(q => q !== query);
      setSearchHistory(newHistory);
      await Storage.setItem('user_search_history', newHistory);
  };

  const toggleTranslator = () => {
      const ref = webViewRefs.current[currentTabID];
      if (!ref) return;

      if (isTranslatorActive) {
          setIsTranslatorActive(false);
          ref.injectJavaScript(TranslationEngine.getDisableTranslationScript());
          Alert.alert('المترجم', 'تم إيقاف المترجم.');
      } else {
          setIsTranslatorActive(true);
          ref.injectJavaScript(TranslationEngine.getEnableTranslationScript());
          Alert.alert('المترجم', 'جاري تفعيل الترجمة الفورية...');
      }
  };

  const toggleDesktopMode = () => {
      const newState = !isDesktopMode;
      setIsDesktopMode(newState);
      Storage.setItem('browser_desktop_mode', newState);
      if (webViewRefs.current[currentTabID]) {
          webViewRefs.current[currentTabID].reload();
      }
  };

  const toggleDarkMode = () => {
    const newMode = !isForcedDarkMode;
    setIsForcedDarkMode(newMode);
    Storage.setItem('browser_forced_dark_mode_key', newMode);
  };

  const toggleIncognito = () => {
      const newState = !isIncognito;
      setIsIncognito(newState);
      if (newState) {
          Alert.alert('وضع التخفي 🕵️', 'لن يتم حفظ سجل التاريخ أو الكوكيز.');
      } else {
          Alert.alert('الوضع العادي', 'تم العودة للوضع الطبيعي.');
      }
  };

  // --- Scripts & Blocking ---
  const saveUserScripts = async (scripts) => {
    setUserScripts(scripts);
    await Storage.setItem('user_custom_scripts', scripts);
    if (webViewRefs.current[currentTabID]) {
        webViewRefs.current[currentTabID].reload();
    }
  };

  const addBlockRule = async (selector) => {
      const newRules = [...customBlockRules, selector];
      setCustomBlockRules(newRules);
      await Storage.setItem('user_custom_block_rules', newRules);
      // Instant apply
      if (webViewRefs.current[currentTabID]) {
          webViewRefs.current[currentTabID].injectJavaScript(`if(window.addCustomRule) window.addCustomRule('${selector}'); true;`);
      }
  };

  const removeBlockRule = async (rule) => {
      const newRules = customBlockRules.filter(r => r !== rule);
      setCustomBlockRules(newRules);
      await Storage.setItem('user_custom_block_rules', newRules);
      Alert.alert('تنبيه', 'قم بتحديث الصفحة لتطبيق التغييرات.');
  };

  const addBlockedDomain = async (domain) => {
      const clean = domain.trim().toLowerCase();
      if (!clean) return;
      const newDomains = [...userBlockedDomains, clean];
      setUserBlockedDomains(newDomains);
      await Storage.setItem('user_blocked_domains', newDomains);
  };

  const removeBlockedDomain = async (domain) => {
      const newDomains = userBlockedDomains.filter(d => d !== domain);
      setUserBlockedDomains(newDomains);
      await Storage.setItem('user_blocked_domains', newDomains);
  };

  // --- History & Bookmarks ---
  const addToHistory = async (title, url) => {
    if (isIncognito) return;
    if (!title || !url || url === 'about:blank' || url === 'zeus://home') return;
    
    // منع التكرار اللحظي
    const first = history[0];
    if (first && first.url === url && Date.now() - new Date(first.date) < 60000) return;

    const newItem = { id: generateUUID(), title, url, date: new Date().toISOString() };
    const newHistory = [newItem, ...history].slice(0, 1000);
    setHistory(newHistory);
    await Storage.setItem('browser_history_data', newHistory);
  };

  const addWebsite = async (name, url) => {
    const finalUrl = url.toLowerCase().startsWith('http') ? url : `https://${url}`;
    const newWebsite = { id: generateUUID(), name, url: finalUrl, dateAdded: new Date().toISOString() };
    const newWebsites = [newWebsite, ...websites];
    setWebsites(newWebsites);
    await Storage.setItem('saved_websites', newWebsites);
  };

  const deleteWebsite = async (id) => {
    const newWebsites = websites.filter((w) => w.id !== id);
    setWebsites(newWebsites);
    await Storage.setItem('saved_websites', newWebsites);
  };

  const deleteHistoryItem = async (id) => {
    const newHistory = history.filter((h) => h.id !== id);
    setHistory(newHistory);
    await Storage.setItem('browser_history_data', newHistory);
  };

  const clearAllHistory = async () => {
    setHistory([]);
    await Storage.setItem('browser_history_data', []);
  };

  // --- Return Everything ---
  return {
    state: {
        tabs, currentTabID, websites, history, adsBlocked, searchEngine, searchHistory,
        isForcedDarkMode, isDesktopMode, isTranslatorActive, isIncognito,
        consoleLogs, networkLogs, storageData, customBlockRules, userBlockedDomains, userScripts,
        inspectedElement, isInspectorActive
    },
    setters: {
        setConsoleLogs, setNetworkLogs, setStorageData, setInspectedElement, 
        setIsInspectorActive, setAdsBlocked, setCustomBlockRules, setUserBlockedDomains, setUserScripts
    },
    actions: {
        addNewTab, closeTab, selectTab, updateTab, changeSearchEngine, addSearchQuery, removeSearchQuery,
        addWebsite, deleteWebsite, addToHistory, deleteHistoryItem, clearAllHistory,
        saveTabsState, toggleTranslator, toggleDesktopMode, toggleDarkMode, toggleIncognito,
        saveUserScripts,
        addBlockRule, removeBlockRule,
        addBlockedDomain, removeBlockedDomain
    },
    refs: webViewRefs
  };
};

export default useBrowserLogic;
