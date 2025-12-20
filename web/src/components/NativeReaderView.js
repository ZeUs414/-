import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  Platform,
  SafeAreaView // سنستخدمها كحاوية ولكن سنضيف شرط للأندرويد
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons'; // ✅ استخدام مكتبة إكسبو

const NativeReaderView = ({ visible, data, onClose }) => {
  if (!data) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide" 
      presentationStyle="fullScreen" // في أندرويد هذا يغطي الشاشة بالكامل
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        
        {/* رأس الصفحة مع مراعاة النوتش في أندرويد */}
        <View style={styles.headerContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Icon name="x" size={24} color="#0A84FF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>المحرر الذكي</Text>
                <TouchableOpacity style={styles.saveBtn}>
                     <Text style={styles.saveText}>حفظ</Text>
                </TouchableOpacity>
            </View>
        </View>

        <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
        >
            <Text style={styles.title} selectable={true}>{data.title}</Text>
            <View style={styles.separator} />
            {data.content.map((paragraph, index) => (
                <Text key={index} style={styles.paragraph} selectable={true}>
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
    backgroundColor: '#000000',
    // ✅ إصلاح الأندرويد: إضافة مساحة علوية لشريط الحالة
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
  },
  closeBtn: {
    padding: 5,
  },
  saveBtn: {
    padding: 5,
  },
  saveText: {
    color: '#0A84FF',
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20, 
    paddingTop: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'right', 
    marginBottom: 15,
    fontfamily:'Cairo-Bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    width: '100%',
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 18,
    color: '#E0E0E0', 
    lineHeight: 30, 
    textAlign: 'right', 
    marginBottom: 20, 
    writingDirection: 'rtl',
    fontfamily:'Cairo-Regular',
  }
});

export default NativeReaderView;