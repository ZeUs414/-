
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

// قائمة الخطوط المتاحة
const FONTS = [
  { label: 'Cairo', value: 'Cairo-Regular' },
  { label: 'تجوال', value: 'Tajawal' }, 
  { label: 'نظام (عريض)', value: 'System-Bold' },
  { label: 'نظام (عادي)', value: 'System' },
  { label: 'Monospace', value: 'monospace' },
];

const NativeReaderView = ({ visible, data, onClose }) => {
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState('Cairo-Regular');
  const [showSettings, setShowSettings] = useState(false);

  // تحميل الإعدادات المحفوظة عند الفتح
  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      const savedSize = await AsyncStorage.getItem('reader_font_size');
      const savedFont = await AsyncStorage.getItem('reader_font_family');
      if (savedSize) setFontSize(parseInt(savedSize, 10));
      if (savedFont) setFontFamily(savedFont);
    } catch (e) {
      console.error(e);
    }
  };

  const saveSettings = async (newSize, newFont) => {
    try {
      if (newSize) {
        setFontSize(newSize);
        await AsyncStorage.setItem('reader_font_size', newSize.toString());
      }
      if (newFont) {
        setFontFamily(newFont);
        await AsyncStorage.setItem('reader_font_family', newFont);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyContent = async () => {
    if (!data) return;
    try {
        const fullText = `${data.title}\n\n${data.content.join('\n\n')}`;
        await Clipboard.setStringAsync(fullText);
        Alert.alert('تم النسخ', 'تم نسخ نص المقال بالكامل إلى الحافظة.');
    } catch (e) {
        Alert.alert('خطأ', 'حدث خطأ أثناء النسخ.');
    }
  };

  if (!data) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide" 
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#111" />
        
        {/* Header */}
        <View style={styles.headerContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                    <Icon name="x" size={24} color="#0A84FF" />
                </TouchableOpacity>
                
                <Text style={styles.headerTitle}>قارئ النصوص</Text>
                
                <View style={{flexDirection: 'row'}}>
                    {/* زر النسخ الجديد */}
                    <TouchableOpacity 
                        style={[styles.iconBtn, {marginRight: 10}]} 
                        onPress={handleCopyContent}
                    >
                        <Icon name="copy" size={22} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.iconBtn} 
                        onPress={() => setShowSettings(!showSettings)}
                    >
                        <Icon name="type" size={24} color={showSettings ? "#0A84FF" : "#fff"} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* إعدادات الخط */}
            {showSettings && (
              <View style={styles.settingsPanel}>
                
                {/* التحكم بالحجم */}
                <View style={styles.settingRow}>
                  <TouchableOpacity onPress={() => saveSettings(Math.max(14, fontSize - 2), null)} style={styles.controlBtn}>
                    <Icon name="minus" size={20} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.settingLabel}>حجم الخط: {fontSize}</Text>
                  <TouchableOpacity onPress={() => saveSettings(Math.min(40, fontSize + 2), null)} style={styles.controlBtn}>
                    <Icon name="plus" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* التحكم بالنوع */}
                <Text style={styles.sectionLabel}>نوع الخط:</Text>
                <View style={styles.fontsGrid}>
                  {FONTS.map((font) => (
                    <TouchableOpacity 
                      key={font.value}
                      style={[styles.fontBtn, fontFamily === font.value && styles.fontBtnActive]}
                      onPress={() => saveSettings(null, font.value)}
                    >
                      <Text style={[
                        styles.fontBtnText, 
                        fontFamily === font.value && styles.fontBtnTextActive,
                        { fontFamily: font.value.includes('System') ? undefined : font.value }
                      ]}>
                        {font.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

              </View>
            )}
        </View>

        <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
        >
            <Text 
              style={[
                styles.title, 
                { fontSize: fontSize + 8, fontFamily: fontFamily.includes('System') ? undefined : fontFamily }
              ]} 
              selectable={true} 
            >
              {data.title}
            </Text>
            
            <View style={styles.separator} />
            
            {data.content.map((paragraph, index) => (
                <Text 
                  key={index} 
                  style={[
                    styles.paragraph, 
                    { fontSize: fontSize, fontFamily: fontFamily.includes('System') ? undefined : fontFamily }
                  ]} 
                  selectable={true}
                >
                    {paragraph}
                </Text>
            ))}
            <View style={{height: 100}} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerContainer: {
    backgroundColor: '#111',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
    height: 60,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconBtn: {
    padding: 8,
  },
  settingsPanel: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlBtn: {
    backgroundColor: '#333',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  sectionLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'right',
    marginRight: 5
  },
  fontsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  fontBtn: {
    backgroundColor: '#222',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  fontBtnActive: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  fontBtnText: {
    color: '#ccc',
    fontSize: 14,
  },
  fontBtnTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20, 
    paddingTop: 20,
    paddingBottom: 80,
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'right', 
    marginBottom: 20,
    lineHeight: 40,
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    width: '100%',
    marginBottom: 25,
  },
  paragraph: {
    color: '#E0E0E0', 
    lineHeight: 38, 
    textAlign: 'right', 
    marginBottom: 25, 
    writingDirection: 'rtl',
  }
});

export default NativeReaderView;
