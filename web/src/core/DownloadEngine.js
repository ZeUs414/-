
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import Storage from './Storage';
import { generateUUID } from './Helpers';

// ===============================================
// MARK: - محرك التحميلات (Download Engine)
// ===============================================

const DownloadEngine = {
  
  // تحميل ملف من رابط
  downloadFile: async (url, mimetype, contentDisposition) => {
    try {
      // 1. استنتاج اسم الملف
      let fileName = 'download_' + Date.now();
      
      // محاولة استخراج الاسم من الرابط
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      if (lastPart && lastPart.includes('.')) {
          fileName = lastPart.split('?')[0]; // إزالة المعاملات
      }

      // محاولة استخراج الاسم من الهيدر (Content-Disposition) - تحسين مستقبلي
      if (contentDisposition && contentDisposition.includes('filename=')) {
          const match = contentDisposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) fileName = match[1];
      }
      
      // تنظيف اسم الملف
      fileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

      // 2. مسار الحفظ (داخل مجلد المستندات للتطبيق)
      const downloadDir = FileSystem.documentDirectory + 'downloads/';
      const fileUri = downloadDir + fileName;

      // التأكد من وجود المجلد
      const dirInfo = await FileSystem.getInfoAsync(downloadDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
      }

      // 3. إشعار البدء
      Alert.alert('جاري التحميل', `بدأ تحميل: ${fileName}`);

      // 4. بدء التحميل
      const downloadRes = await FileSystem.downloadAsync(url, fileUri);

      if (downloadRes.status === 200) {
        // 5. حفظ البيانات في السجل
        const newDownload = {
            id: generateUUID(),
            name: fileName,
            uri: downloadRes.uri,
            date: new Date().toISOString(),
            size: downloadRes.headers['Content-Length'] || 'Unknown',
            mimeType: mimetype || 'application/octet-stream'
        };
        
        await DownloadEngine.saveToHistory(newDownload);
        
        Alert.alert(
            'تم التحميل ✅', 
            `تم حفظ الملف: ${fileName}`,
            [
                { text: 'حسناً' },
                { text: 'فتح', onPress: () => DownloadEngine.openFile(downloadRes.uri) }
            ]
        );
        return true;
      } else {
          throw new Error('فشل التحميل، كود الحالة: ' + downloadRes.status);
      }

    } catch (e) {
      console.error(e);
      Alert.alert('خطأ في التحميل', e.message);
      return false;
    }
  },

  // حفظ في سجل التحميلات (AsyncStorage)
  saveToHistory: async (item) => {
      const current = await Storage.getItem('downloads_history') || [];
      const updated = [item, ...current];
      await Storage.setItem('downloads_history', updated);
  },

  // جلب السجل
  getHistory: async () => {
      return await Storage.getItem('downloads_history') || [];
  },

  // فتح الملف
  openFile: async (uri) => {
      const canOpen = await Sharing.isAvailableAsync();
      if (canOpen) {
          await Sharing.shareAsync(uri);
      } else {
          Alert.alert('عذراً', 'لا يمكن فتح الملفات مباشرة على هذا الجهاز.');
      }
  },

  // حذف ملف
  deleteFile: async (id, uri) => {
      try {
          // حذف من النظام
          await FileSystem.deleteAsync(uri, { idempotent: true });
          
          // تحديث السجل
          const current = await Storage.getItem('downloads_history') || [];
          const updated = current.filter(i => i.id !== id);
          await Storage.setItem('downloads_history', updated);
          
          return updated;
      } catch (e) {
          console.log(e);
          return null;
      }
  }
};

export default DownloadEngine;
