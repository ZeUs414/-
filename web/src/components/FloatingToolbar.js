
import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, Animated, Modal, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import styles from '../styles/AppStyles';

const { height } = Dimensions.get('window');

const FloatingToolbar = ({
  isHidden,
  onToggle,
  // Navigation
  onGoBack,
  onGoForward,
  onReload,
  canGoBack,
  canGoForward,
  onGoHome, 
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
  onToggleIncognito, 
  isIncognito, 

  // DevTools
  onShowConsole,
  onShowScripts,
  onShowNetwork,
  onShowStorage,
  onToggleInspector,
  isInspectorActive,
  onShowBlockedManager,
  
  // Settings
  onShowSettings
}) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const [activeMenu, setActiveMenu] = useState(null); 

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isHidden ? 100 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [isHidden, slideAnim]);

  const toggleMenu = (menu) => {
    setActiveMenu(prev => prev === menu ? null : menu);
  };

  // Helper to calculate estimated top position for the arrow based on the button group
  // Assuming toolbar is centered vertically.
  // Group 1: View (~40% from bottom), Group 2: Data, etc.
  // We use specific style classes for positioning.

  return (
    <>
      <View style={styles.floatingToolbarContainer} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.floatingToolbar,
              { transform: [{ translateX: slideAnim }] },
              isIncognito && { borderColor: '#9C27B0', borderWidth: 2 } 
            ]}>
            
            <Pressable style={StyleSheet.absoluteFill} onPress={onToggle} />

            <View pointerEvents="box-none">
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

                <TouchableOpacity style={styles.toolbarButton} onPress={onGoHome}>
                  <Icon name="home" size={22} color="#fff" />
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

                {/* Group 3: Categorized Menus */}
                
                <TouchableOpacity style={styles.toolbarButton} onPress={() => toggleMenu('view')}>
                  <Icon name="eye" size={24} color={activeMenu === 'view' ? "#FFC107" : "#fff"} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolbarButton} onPress={() => toggleMenu('data')}>
                  <Icon name="list" size={24} color={activeMenu === 'data' ? "#4CAF50" : "#fff"} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolbarButton} onPress={() => toggleMenu('tools')}>
                  <Icon name="tool" size={24} color={activeMenu === 'tools' ? "#2196F3" : "#fff"} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolbarButton} onPress={() => toggleMenu('dev')}>
                     <Icon name="terminal" size={24} color={isInspectorActive || activeMenu === 'dev' ? "#f44336" : "#00BCD4"} />
                </TouchableOpacity>

                <View style={styles.toolbarDivider} />

                <TouchableOpacity style={styles.toolbarButton} onPress={onShowSettings}>
                     <Icon name="settings" size={24} color="#9E9E9E" />
                </TouchableOpacity>

            </View>

          </Animated.View>
      </View>
      
      {/* Hitbox to bring toolbar back if hidden */}
      {isHidden && (
        <TouchableOpacity style={styles.toolbarShowArea} onPress={onToggle} />
      )}

      {/* --- MENU MODALS --- */}
      {/* Position logic: We align menus using bottom offsets approximate to button locations */}
      
      {/* 1. View Menu */}
      <Modal visible={activeMenu === 'view'} transparent animationType="fade" onRequestClose={() => setActiveMenu(null)}>
         <TouchableOpacity style={styles.modalOverlay} onPress={() => setActiveMenu(null)} activeOpacity={1}>
             <View style={[localStyles.menuWrapper, { bottom: height * 0.35 }]}>
                 <View style={localStyles.menuContainer}>
                     <Text style={localStyles.menuHeader}>العرض والمظهر</Text>
                     <View style={localStyles.gridContainer}>
                         <MenuItem icon="book-open" label="القارئ" color="#FFEB3B" onPress={() => { setActiveMenu(null); onReaderMode(); }} />
                         <MenuItem icon="image" label="الصور" color="#9C27B0" onPress={() => { setActiveMenu(null); onShowGallery(); }} />
                         <MenuItem icon={isDarkMode ? "sun" : "moon"} label={isDarkMode ? "نهاري" : "ليلي"} color="#607D8B" onPress={() => { setActiveMenu(null); onToggleDarkMode(); }} />
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
                     </View>
                 </View>
                 <View style={localStyles.arrowRight} />
             </View>
         </TouchableOpacity>
      </Modal>

      {/* 2. Data Menu */}
      <Modal visible={activeMenu === 'data'} transparent animationType="fade" onRequestClose={() => setActiveMenu(null)}>
         <TouchableOpacity style={styles.modalOverlay} onPress={() => setActiveMenu(null)} activeOpacity={1}>
             <View style={[localStyles.menuWrapper, { bottom: height * 0.30 }]}>
                 <View style={localStyles.menuContainer}>
                     <Text style={localStyles.menuHeader}>البيانات والسجل</Text>
                     <View style={localStyles.gridContainer}>
                         <MenuItem icon="clock" label="السجل" color="#FF9800" onPress={() => { setActiveMenu(null); onShowHistory(); }} />
                         <MenuItem icon="bookmark" label="المواقع" color="#2196F3" onPress={() => { setActiveMenu(null); onShowWebsites(); }} />
                         <MenuItem icon="trash" label="مسح" color="#f44336" onPress={() => { setActiveMenu(null); onClearData(); }} />
                     </View>
                 </View>
                 <View style={localStyles.arrowRight} />
             </View>
         </TouchableOpacity>
      </Modal>

      {/* 3. Tools Menu */}
      <Modal visible={activeMenu === 'tools'} transparent animationType="fade" onRequestClose={() => setActiveMenu(null)}>
         <TouchableOpacity style={styles.modalOverlay} onPress={() => setActiveMenu(null)} activeOpacity={1}>
             <View style={[localStyles.menuWrapper, { bottom: height * 0.25 }]}>
                 <View style={localStyles.menuContainer}>
                     <Text style={localStyles.menuHeader}>أدوات الصفحة</Text>
                     <View style={localStyles.gridContainer}>
                         <MenuItem icon="search" label="بحث" color="#E91E63" onPress={() => { setActiveMenu(null); onFindInPage(); }} />
                         <MenuItem icon="copy" label="فرض نسخ" color="#795548" onPress={() => { setActiveMenu(null); onEnableCopy(); }} />
                         <MenuItem icon="eye-off" label={isIncognito ? "عادي" : "تخفي"} color={isIncognito ? "#E040FB" : "#ccc"} onPress={() => { setActiveMenu(null); onToggleIncognito(); }} />
                     </View>
                 </View>
                 <View style={localStyles.arrowRight} />
             </View>
         </TouchableOpacity>
      </Modal>

      {/* 4. Developer Tools Menu */}
      <Modal visible={activeMenu === 'dev'} transparent animationType="fade" onRequestClose={() => setActiveMenu(null)}>
         <TouchableOpacity style={styles.modalOverlay} onPress={() => setActiveMenu(null)} activeOpacity={1}>
             <View style={[localStyles.menuWrapper, { bottom: height * 0.20 }]}>
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
                         <Text style={localStyles.menuText}>إدارة الحظر</Text>
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
                 <View style={localStyles.arrowRight} />
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
    menuWrapper: {
        position: 'absolute',
        right: 80, // Next to toolbar
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuContainer: {
        backgroundColor: '#222',
        borderRadius: 20,
        padding: 15,
        width: 280,
        borderWidth: 1,
        borderColor: '#444',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10
    },
    arrowRight: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 0,
        borderBottomWidth: 10,
        borderTopWidth: 10,
        borderLeftColor: '#444', 
        borderRightColor: 'transparent',
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
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
        justifyContent: 'flex-start',
    },
    gridItem: {
        width: '33%', // 3 items per row
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
    listMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    menuIcon: { marginRight: 15 },
    menuText: { color: '#fff', fontSize: 15 },
    divider: { height: 1, backgroundColor: '#444', marginVertical: 10 },
    
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
