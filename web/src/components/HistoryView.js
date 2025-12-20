import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import styles from '../styles/AppStyles';

const HistoryView = ({ history, onClose, onSelect, onDelete, onClearAll }) => {
  const groupedHistory = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);
    const monthAgo = new Date(today.getTime() - 30 * 86400000);

    const groups = {
      اليوم: [],
      الأمس: [],
      'هذا الأسبوع': [],
      'هذا الشهر': [],
      أقدم: [],
    };

    history.forEach((item) => {
      const date = new Date(item.date);
      if (date >= today) groups['اليوم'].push(item);
      else if (date >= yesterday) groups['الأمس'].push(item);
      else if (date >= weekAgo) groups['هذا الأسبوع'].push(item);
      else if (date >= monthAgo) groups['هذا الشهر'].push(item);
      else groups['أقدم'].push(item);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [history]);

  return (
    <View style={styles.historyView}>
      <View style={styles.historyHeader}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
        <Text style={styles.historyTitle}>سجل التاريخ</Text>
        <TouchableOpacity onPress={onClearAll}>
          <Text style={styles.deleteAllIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
      {history.length === 0 ? (
        <View style={styles.emptyHistory}>
          <Text style={styles.emptyHistoryIcon}>🕐</Text>
          <Text style={styles.emptyHistoryText}>السجل فارغ تماماً</Text>
        </View>
      ) : (
        <ScrollView>
          {groupedHistory.map(([section, items]) => (
            <View key={section}>
              <View style={styles.historySectionHeader}>
                <Text style={styles.historySectionTitle}>{section}</Text>
              </View>
              {items.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  onPress={() => onSelect(item.url)}
                  onDelete={() => onDelete(item.id)}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const HistoryItem = ({ item, onPress, onDelete }) => {
  return (
    <TouchableOpacity style={styles.historyItem} onPress={onPress}>
      <Image
        source={{
          uri: `https://www.google.com/s2/favicons?domain=${item.url}&sz=64`,
        }}
        style={styles.historyIcon}
      />
      <View style={styles.historyInfo}>
        <Text style={styles.historyItemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.historyItemUrl} numberOfLines={1}>
          {item.url}
        </Text>
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.historyDeleteButton}>
        <Text style={styles.historyDeleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default HistoryView;