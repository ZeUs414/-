import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import styles from '../styles/AppStyles';

const TabsTray = ({
  tabs,
  currentTabID,
  onClose,
  onSelectTab,
  onCloseTab,
  onAddTab,
  onFavorite,
}) => {
  return (
    <View style={styles.tabsTray}>
      <View style={styles.tabsTrayHandle} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TabCard
              key={tab.id}
              tab={tab}
              isSelected={tab.id === currentTabID}
              onSelect={() => onSelectTab(tab.id)}
              onClose={() => onCloseTab(tab.id)}
              onFavorite={() => onFavorite(tab)}
            />
          ))}
          <TouchableOpacity style={styles.addTabButton} onPress={onAddTab}>
            <Text style={styles.addTabIcon}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const TabCard = ({ tab, isSelected, onSelect, onClose, onFavorite }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.tabCard, isSelected && styles.tabCardSelected]}
      onPress={onSelect}
      onLongPress={() => setShowMenu(true)}>
      <Image
        source={{
          uri: `https://www.google.com/s2/favicons?domain=${tab.url}&sz=128`,
        }}
        style={styles.tabIcon}
      />
      <Text
        style={[styles.tabTitle, isSelected && styles.tabTitleSelected]}
        numberOfLines={2}>
        {tab.title}
      </Text>
      <TouchableOpacity style={styles.tabCloseButton} onPress={onClose}>
        <Text
          style={[
            styles.tabCloseIcon,
            isSelected && styles.tabCloseIconSelected,
          ]}>
          ×
        </Text>
      </TouchableOpacity>

      {showMenu && (
        <Modal
          transparent
          visible={showMenu}
          onRequestClose={() => setShowMenu(false)}>
          <TouchableOpacity
            style={styles.menuOverlay}
            onPress={() => setShowMenu(false)}>
            <View style={styles.contextMenu}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onFavorite();
                  setShowMenu(false);
                }}>
                <Text style={styles.menuText}>⭐ إضافة للمفضلة</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </TouchableOpacity>
  );
};

export default TabsTray;