import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';

const { width, height: screenHeight } = Dimensions.get('window');
const ITEM_SIZE = Math.floor(width / 3); // مربعات الشبكة
const FALLBACK_RATIO = 1.5; // نسبة افتراضية إن تعذر الحصول على الأبعاد

const ImageGalleryView = ({ visible, images = [], onClose }) => {
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [viewingIndex, setViewingIndex] = useState(null); // index للقارئ العمودي
  const [imageMeta, setImageMeta] = useState([]); // [{w,h,ratio}, ...]
  const [offsets, setOffsets] = useState([]); // إزاحات تراكمية للقارئ
  const readerRef = useRef(null);

  // ✳️ اجبار إخفاء شريط الحالة عند فتح المعرض
  useEffect(() => {
    if (visible) {
      try {
        StatusBar.setHidden(true, 'fade');
      } catch (e) {
        // تجاهل أي خطأ بسيط
      }
    }
  }, [visible]);

  /* --- الحصول على أبعاد الصور لحساب ارتفاع كل صورة في قارئ العمود الواحد --- */
  useEffect(() => {
    if (!images || images.length === 0) {
      setImageMeta([]);
      setOffsets([]);
      return;
    }

    // تهيئة
    setImageMeta(new Array(images.length).fill(null));
    images.forEach((uri, idx) => {
      Image.getSize(
        uri,
        (w, h) => {
          setImageMeta((prev) => {
            const copy = [...prev];
            copy[idx] = { w, h, ratio: h / w };
            return copy;
          });
        },
        () => {
          // فشل جلب الأبعاد -> نسبة افتراضية
          setImageMeta((prev) => {
            const copy = [...prev];
            copy[idx] = { w: width, h: width * FALLBACK_RATIO, ratio: FALLBACK_RATIO };
            return copy;
          });
        }
      );
    });
  }, [images]);

  /* --- حساب offsets تراكمية بمجرد توفر نسب الصور --- */
  useEffect(() => {
    if (!imageMeta || imageMeta.length === 0) {
      setOffsets([]);
      return;
    }
    const heights = imageMeta.map((m) => (m ? Math.round(width * m.ratio) : Math.round(screenHeight * 0.7)));
    const offs = [];
    let acc = 0;
    for (let i = 0; i < heights.length; i++) {
      offs.push(acc);
      acc += heights[i];
    }
    setOffsets(offs);
  }, [imageMeta]);

  const toggleSelection = (uri) => {
    const s = new Set(selectedImages);
    s.has(uri) ? s.delete(uri) : s.add(uri);
    setSelectedImages(s);
  };

  const showSelectionStatus = () => {
    if (selectedImages.size === 0) return;
    Alert.alert('التحديد', `تم تحديد ${selectedImages.size} صورة`);
  };

  /* --- فتح القارئ: نعيّن index ثم نمرر إلى الإزاحة المحسوبة بعد تأخير بسيط --- */
  const openReaderAt = (index) => {
    setViewingIndex(index);
    try {
      StatusBar.setHidden(true, 'fade');
    } catch (e) {
      // تجاهل
    }

    // تمرير دقيق بعد فتح الـ Modal وانتظار القياس
    setTimeout(() => {
      if (readerRef.current && offsets && offsets[index] != null) {
        try {
          readerRef.current.scrollToOffset({ offset: offsets[index], animated: false });
        } catch (e) {
          // لا نكسر التطبيق إن فشل
        }
      }
    }, 60);
  };

  const closeReader = () => {
    setViewingIndex(null);
    // لا نُظهر شريط الحالة عند إغلاق القارئ — نبقيه مخفياً للتطبيق بأكمله
    try {
      StatusBar.setHidden(true, 'fade');
    } catch (e) {
      // تجاهل
    }
  };

  const allMetaReady = imageMeta.length === images.length && imageMeta.every((m) => m != null);

  /* --- Renderer للقارئ (عمود واحد، صور تلتصق بدون فراغات) --- */
  const renderReaderItem = ({ item, index }) => {
    const meta = imageMeta[index];
    const imgHeight = meta ? Math.round(width * meta.ratio) : Math.round(screenHeight * 0.7);
    return (
      <View style={{ width, backgroundColor: '#000' }}>
        <Image source={{ uri: item }} style={{ width, height: imgHeight, backgroundColor: '#000' }} resizeMode="contain" />
      </View>
    );
  };

  const getItemLayout = (_data, index) => {
    const len = imageMeta[index] ? Math.round(width * imageMeta[index].ratio) : Math.round(screenHeight * 0.7);
    const off = offsets[index] != null ? offsets[index] : index * Math.round(screenHeight * 0.7);
    return { length: len, offset: off, index };
  };

  /* --- Renderer للشبكة الرئيسية (3 أعمدة مربعة، بدون فواصل) --- */
  const renderGridItem = ({ item, index }) => {
    const isSelected = selectedImages.has(item);
    return (
      <View style={styles.gridCell}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.gridTouchable}
          onPress={() => openReaderAt(index)}
          onLongPress={() => toggleSelection(item)}
        >
          <Image source={{ uri: item }} style={styles.thumb} resizeMode="cover" />
          <TouchableOpacity style={styles.selectionCircle} onPress={() => toggleSelection(item)}>
            {isSelected ? <Icon name="check-circle" size={20} color="#1DA1F2" /> : <Icon name="circle" size={20} color="#fff" />}
          </TouchableOpacity>
          {isSelected && <View style={styles.overlay} />}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* تم تغيير هذا السطر ليبقي شريط الحالة مخفياً */}
        <StatusBar hidden />

        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Icon name="x" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>معرض الصور ({images.length})</Text>

          <TouchableOpacity onPress={showSelectionStatus} style={styles.saveBtn}>
            <Text style={styles.saveText}>تحديد ({selectedImages.size})</Text>
          </TouchableOpacity>
        </View>

        {/* الشبكة: 3 أعمدة مربعة وملتصقة */}
        <FlatList
          data={images}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderGridItem}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
          removeClippedSubviews={true}
          initialNumToRender={15}
          maxToRenderPerBatch={30}
          windowSize={11}
        />

        {/* القارئ العمودي كـ Modal منفصل فوق الواجهة */}
        <Modal visible={viewingIndex !== null} animationType="fade" transparent={false} onRequestClose={closeReader}>
          <View style={styles.readerContainer}>
            <StatusBar hidden />
            <FlatList
              ref={readerRef}
              data={images}
              keyExtractor={(_, i) => `r-${i}`}
              renderItem={renderReaderItem}
              getItemLayout={getItemLayout}
              initialNumToRender={3}
              windowSize={5}
              contentContainerStyle={{ backgroundColor: '#000' }}
              removeClippedSubviews={true}
            />

            <TouchableOpacity style={styles.readerCloseBtn} onPress={closeReader}>
              <Icon name="x" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>

        {/* مؤشر التحضير إذا لم تكن بيانات الأبعاد جاهزة */}
        {!allMetaReady && (
          <View style={styles.loadingBar}>
            <ActivityIndicator size="small" color="#1DA1F2" />
            <Text style={styles.loadingText}>جارٍ تجهيز الصور...</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 18) + 8 : 16,
    paddingBottom: 10,
    backgroundColor: '#000',
  },

  iconBtn: { padding: 6 },

  title: { color: '#fff', fontSize: 16, fontWeight: '600' },

  saveBtn: { padding: 6 },
  saveText: { color: '#1DA1F2', fontSize: 14 },

  /* الشبكة */
  gridContainer: { padding: 0, backgroundColor: '#000' },
  gridCell: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
  },
  gridTouchable: { flex: 1 },
  thumb: { width: '100%', height: '100%' },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(29,161,242,0.28)' },
  selectionCircle: { position: 'absolute', top: 8, right: 8, zIndex: 10 },

  /* القارئ */
  readerContainer: { flex: 1, backgroundColor: '#000' },
  readerCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 18) + 12 : 44,
    right: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
    zIndex: 100,
  },

  /* التحميل */
  loadingBar: { position: 'absolute', bottom: 16, left: 0, right: 0, alignItems: 'center' },
  loadingText: { color: '#888', marginTop: 6, fontSize: 12 },
});

export default ImageGalleryView;
