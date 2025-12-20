
import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, Animated, PanResponder, Modal, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import styles from '../styles/AppStyles';

const FloatingToolbar = ({
  isHidden,
  onToggle,
  // Navigation
  onGoBack,
  onGoForward,
  onReload,
  canGoBack,
  canGoForward,
  // Tabs
  onAddTab,
  onShowTabsTray,
  // Main Menu Actions
  onShowWebsites,
  onShowHistory,
  onToggleDarkMode,
  isDarkMode,
  onReaderMode,
  onShowGallery,
  isDesktopMode,
  onToggleDesktopMode,
  adsBlocked,
  // New Features
  onTranslate,
  isTranslatorActive, 
  onFindInPage,
  onEnableCopy,
  onViewSource, 
  onClearData,
  // Feature Set 2
  // onShowDownloads, // REMOVED
  onPrintPdf, 
  onToggleIncognito, 
  isIncognito, 
  onSpeak, 

  // DevTools
  onShowConsole,
  onShowScripts,
  onShowNetwork,
  onShowStorage,
  onToggleInspector,
  isInspectorActive,
  onShowBlockedManager
}) => {
  const slideAnim = useRef(new Animated.Value(80)).current;
  const [activeMenu, setActiveMenu] = useState(null); // 'tools' or 'dev'

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dx > 10 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50 && !isHidden) {
          onToggle();
        }
      },
    })
  ).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isHidden ? 80 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [isHidden, slideAnim]);

  const toggleMenu = (menu) => {
    if (activeMenu === menu) setActiveMenu(null);
    else setActiveMenu(menu);
  };

  return (
    <>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.floatingToolbar,
          { transform: [{ translateX: slideAnim }] },
          isIncognito && { borderColor: '#9C27B0', borderWidth: 2 } // Visual cue for Incognito
        ]}>
        
        {/* Group 1: Navigation */}
        <TouchableOpacity style={styles.toolbarButton} onPress={onGoBack} disabled={!canGoBack}>
          <Icon name="chevron-left" size={24} color="#fff" style={!canGoBack ? styles.disabledIcon : null} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolbarButton} onPress={onGoForward} disabled={!canGoForward}>
          <Icon name="chevron-right" size={24} color="#fff" style={!canGoForward ? styles.disabledIcon : null} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={onReload}>
          <Icon name="refresh-cw" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.toolbarDivider} />

        {/* Group 2: Tabs */}
        <TouchableOpacity style={styles.toolbarButton} onPress={onShowTabsTray}>
          <View style={localStyles.tabCountBadge}>
             <Text style={localStyles.tabCountText}>T</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={onAddTab}>
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.toolbarDivider} />

        {/* Group 3: Browser Tools (The Main Menu) */}
        <TouchableOpacity style={styles.toolbarButton} onPress={() => toggleMenu('tools')}>
          <Icon name="grid" size={24} color={activeMenu === 'tools' ? "#FFC107" : "#fff"} />
          {adsBlocked > 0 && <View style={styles.notificationDot} />}
        </TouchableOpacity>

        {/* Group 4: DevTools */}
        <TouchableOpacity style={styles.toolbarButton} onPress={() => toggleMenu('dev')}>
             <Icon name="terminal" size={24} color={isInspectorActive || activeMenu === 'dev' ? "#f44336" : "#00BCD4"} />
        </TouchableOpacity>

      </Animated.View>
      
      {isHidden && (
        <TouchableOpacity style={styles.toolbarShowArea} onPress={onToggle} />
      )}

      {/* --- MENU MODALS --- */}

      {/* 1. Browser Tools Menu (General User Features) */}
      <Modal visible={activeMenu === 'tools'} transparent animationType="fade" onRequestClose={() => setActiveMenu(null)}>
         <TouchableOpacity style={styles.modalOverlay} onPress={() => setActiveMenu(null)}>
             <View style={localStyles.menuContainer}>
                 <Text style={localStyles.menuHeader}>أدوات المتصفح</Text>
                 
                 <View style={localStyles.gridContainer}>
                     <MenuItem icon="clock" label="السجل" color="#FF9800" onPress={() => { setActiveMenu(null); onShowHistory(); }} />
                     <MenuItem icon="bookmark" label="المواقع" color="#2196F3" onPress={() => { setActiveMenu(null); onShowWebsites(); }} />
                     
                     <MenuItem icon="search" label="بحث" color="#E91E63" onPress={() => { setActiveMenu(null); onFindInPage(); }} />
                     
                     {/* Toggle Buttons: Show Active State */}
                     <MenuItem 
                        icon="globe" 
                        label={isTranslatorActive ? "إيقاف" : "ترجمة"} 
                        color={isTranslatorActive ? "#f44336" : "#4CAF50"} 
                        onPress={() => { setActiveMenu(null); onTranslate(); }} 
                     />
                     <MenuItem 
                        icon={isDesktopMode ? "smartphone" : "monitor"} 
                        label={isDesktopMode ? "جوال" : "كمبيوتر"} 
                        color={isDesktopMode ? "#f44336" : "#00BCD4"} 
                        onPress={() => { setActiveMenu(null); onToggleDesktopMode(); }} 
                     />

                     <MenuItem icon="book-open" label="القارئ" color="#FFEB3B" onPress={() => { setActiveMenu(null); onReaderMode(); }} />
                     <MenuItem icon="image" label="الصور" color="#9C27B0" onPress={() => { setActiveMenu(null); onShowGallery(); }} />
                     <MenuItem icon={isDarkMode ? "sun" : "moon"} label={isDarkMode ? "نهاري" : "ليلي"} color="#607D8B" onPress={() => { setActiveMenu(null); onToggleDarkMode(); }} />
                     
                     {/* New Features */}
                     <MenuItem icon="printer" label="PDF" color="#795548" onPress={() => { setActiveMenu(null); onPrintPdf(); }} />
                     <MenuItem icon="eye-off" label={isIncognito ? "عادي" : "تخفي"} color={isIncognito ? "#E040FB" : "#ccc"} onPress={() => { setActiveMenu(null); onToggleIncognito(); }} />
                     <MenuItem icon="volume-2" label="نطق" color="#00BCD4" onPress={() => { setActiveMenu(null); onSpeak(); }} />

                     <MenuItem icon="copy" label="فرض نسخ" color="#795548" onPress={() => { setActiveMenu(null); onEnableCopy(); }} />
                     <MenuItem icon="trash" label="مسح" color="#f44336" onPress={() => { setActiveMenu(null); onClearData(); }} />
                 </View>
             </View>
         </TouchableOpacity>
      </Modal>

      {/* 2. Developer Tools Menu (Advanced) */}
      <Modal visible={activeMenu === 'dev'} transparent animationType="fade" onRequestClose={() => setActiveMenu(null)}>
         <TouchableOpacity style={styles.modalOverlay} onPress={() => setActiveMenu(null)}>
             <View style={[localStyles.menuContainer, { borderColor: '#00BCD4' }]}>
                 <Text style={localStyles.menuHeader}>أدوات المطورين</Text>
                 
                 <TouchableOpacity style={localStyles.listMenuItem} onPress={() => { setActiveMenu(null); onToggleInspector(); }}>
                     <Icon name="crosshair" size={20} color={isInspectorActive ? "#f44336" : "#2196F3"} style={localStyles.menuIcon} />
                     <Text style={localStyles.menuText}>{isInspectorActive ? 'إيقاف الفاحص' : 'فاحص العناصر'}</Text>
                 </TouchableOpacity>

                 <TouchableOpacity style={localStyles.listMenuItem} onPress={() => { setActiveMenu(null); onViewSource(); }}>
                     <Icon name="code" size={20} color="#9E9E9E" style={localStyles.menuIcon} />
                     <Text style={localStyles.menuText}>عرض المصدر (View Source)</Text>
                 </TouchableOpacity>

                 <TouchableOpacity style={localStyles.listMenuItem} onPress={() => { setActiveMenu(null); onShowBlockedManager(); }}>
                     <Icon name="shield" size={20} color="#f44336" style={localStyles.menuIcon} />
                     <Text style={localStyles.menuText}>العناصر المحظورة</Text>
                 </TouchableOpacity>

                 <View style={localStyles.divider} />

                 <TouchableOpacity style={localStyles.listMenuItem} onPress={() => { setActiveMenu(null); onShowConsole(); }}>
                     <Icon name="terminal" size={20} color="#FF9800" style={localStyles.menuIcon} />
                     <Text style={localStyles.menuText}>Console</Text>
                 </TouchableOpacity>

                 <TouchableOpacity style={localStyles.listMenuItem} onPress={() => { setActiveMenu(null); onShowNetwork(); }}>
                     <Icon name="activity" size={20} color="#4CAF50" style={localStyles.menuIcon} />
                     <Text style={localStyles.menuText}>Network Sniffer</Text>
                 </TouchableOpacity>

                 <TouchableOpacity style={localStyles.listMenuItem} onPress={() => { setActiveMenu(null); onShowStorage(); }}>
                     <Icon name="database" size={20} color="#9C27B0" style={localStyles.menuIcon} />
                     <Text style={localStyles.menuText}>Storage Editor</Text>
                 </TouchableOpacity>

                 <TouchableOpacity style={localStyles.listMenuItem} onPress={() => { setActiveMenu(null); onShowScripts(); }}>
                     <Icon name="file-text" size={20} color="#607D8B" style={localStyles.menuIcon} />
                     <Text style={localStyles.menuText}>User Scripts</Text>
                 </TouchableOpacity>
             </View>
         </TouchableOpacity>
      </Modal>
    </>
  );
};

// Helper Component for Grid Menu
const MenuItem = ({ icon, label, color, onPress }) => (
    <TouchableOpacity style={localStyles.gridItem} onPress={onPress}>
        <View style={[localStyles.iconCircle, { backgroundColor: color + '20' }]}>
            <Icon name={icon} size={22} color={color} />
        </View>
        <Text style={localStyles.gridLabel}>{label}</Text>
    </TouchableOpacity>
);

const localStyles = StyleSheet.create({
    menuContainer: {
        backgroundColor: '#222',
        borderRadius: 20,
        padding: 15,
        width: 300, // Wider for more icons
        position: 'absolute',
        bottom: 50,
        right: 80,
        borderWidth: 1,
        borderColor: '#444',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10
    },
    menuHeader: {
        color: '#888',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center'
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start', // Start from left
    },
    gridItem: {
        width: '25%', // 4 items per row
        alignItems: 'center',
        marginBottom: 15,
    },
    iconCircle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
    },
    gridLabel: {
        color: '#ccc',
        fontSize: 10,
        textAlign: 'center'
    },
    // List Menu Styles
    listMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    menuIcon: { marginRight: 15 },
    menuText: { color: '#fff', fontSize: 15 },
    divider: { height: 1, backgroundColor: '#444', marginVertical: 10 },
    
    // Tab Badge
    tabCountBadge: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabCountText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold'
    }
});

export default FloatingToolbar;
