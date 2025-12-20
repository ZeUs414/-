import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import styles from '../styles/AppStyles';
import { extractDomain } from '../core/Helpers';

const WebsitesBar = ({
  websites,
  currentURL,
  adsBlocked,
  onClose,
  onAdd,
  onSelect,
  onDelete,
}) => {
  return (
    <View style={styles.websitesBar}>
      <View style={styles.websitesHeader}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onAdd}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
        <View style={styles.websitesHeaderText}>
          <Text style={styles.websitesTitle}>مواقعي</Text>
          {adsBlocked > 0 && (
            <Text style={styles.adsBlockedText}>تم حظر {adsBlocked} إعلان</Text>
          )}
        </View>
      </View>
      <View style={styles.divider} />
      {websites.length === 0 ? (
        <View style={styles.emptyWebsites}>
          <Text style={styles.emptyIcon}>🌐</Text>
          <Text style={styles.emptyText}>لا توجد مواقع</Text>
        </View>
      ) : (
        <ScrollView>
          {websites.map((website) => (
            <WebsiteRow
              key={website.id}
              website={website}
              isActive={currentURL.includes(extractDomain(website.url))}
              onPress={() => onSelect(website.url)}
              onDelete={() => onDelete(website.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const WebsiteRow = ({ website, isActive, onPress, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.websiteRow, isActive && styles.websiteRowActive]}
      onPress={onPress}
      onLongPress={() => setShowMenu(true)}>
      <View style={styles.websiteIcon}>
        <Image
          source={{
            uri: `https://www.google.com/s2/favicons?domain=${website.url}&sz=128`,
          }}
          style={styles.favicon}
        />
      </View>
      <View style={styles.websiteInfo}>
        <Text style={styles.websiteName} numberOfLines={1}>
          {website.name}
        </Text>
        <Text style={styles.websiteDomain} numberOfLines={1}>
          {extractDomain(website.url)}
        </Text>
      </View>
      {isActive && <View style={styles.activeIndicator} />}

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
                  onDelete();
                  setShowMenu(false);
                }}>
                <Text style={[styles.menuText, { color: '#ff4444' }]}>
                  🗑️ حذف
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </TouchableOpacity>
  );
};

export default WebsitesBar;