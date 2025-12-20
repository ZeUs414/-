
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, Image, StyleSheet } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import DownloadEngine from '../core/DownloadEngine';
import styles from '../styles/AppStyles';

const DownloadsView = ({ visible, onClose }) => {
    const [downloads, setDownloads] = useState([]);
    const [filter, setFilter] = useState('all'); // all, image, doc

    useEffect(() => {
        if (visible) loadDownloads();
    }, [visible]);

    const loadDownloads = async () => {
        const history = await DownloadEngine.getHistory();
        setDownloads(history);
    };

    const handleDelete = async (id, uri) => {
        const updated = await DownloadEngine.deleteFile(id, uri);
        if (updated) setDownloads(updated);
    };

    const handleOpen = (uri) => {
        DownloadEngine.openFile(uri);
    };

    const getIcon = (mimeType) => {
        if (mimeType.includes('image')) return 'image';
        if (mimeType.includes('pdf')) return 'file-text';
        if (mimeType.includes('video')) return 'video';
        return 'file';
    };

    const filteredDownloads = downloads.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'image') return item.mimeType.includes('image');
        if (filter === 'doc') return item.mimeType.includes('pdf') || item.mimeType.includes('text');
        return true;
    });

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={localStyles.container}>
                <View style={localStyles.header}>
                    <Text style={localStyles.title}>تنزيلاتي</Text>
                    <TouchableOpacity onPress={onClose} style={localStyles.closeBtn}>
                        <Icon name="x" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={localStyles.tabs}>
                    <TouchableOpacity style={[localStyles.tab, filter === 'all' && localStyles.activeTab]} onPress={() => setFilter('all')}>
                        <Text style={[localStyles.tabText, filter === 'all' && localStyles.activeTabText]}>الكل</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[localStyles.tab, filter === 'image' && localStyles.activeTab]} onPress={() => setFilter('image')}>
                        <Text style={[localStyles.tabText, filter === 'image' && localStyles.activeTabText]}>الصور</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[localStyles.tab, filter === 'doc' && localStyles.activeTab]} onPress={() => setFilter('doc')}>
                        <Text style={[localStyles.tabText, filter === 'doc' && localStyles.activeTabText]}>مستندات</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={filteredDownloads}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{padding: 15}}
                    ListEmptyComponent={() => (
                        <View style={localStyles.empty}>
                            <Icon name="download-cloud" size={60} color="#333" />
                            <Text style={localStyles.emptyText}>لا توجد تنزيلات حتى الآن</Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={localStyles.item} onPress={() => handleOpen(item.uri)}>
                            <View style={localStyles.iconBox}>
                                <Icon name={getIcon(item.mimeType)} size={24} color="#fff" />
                            </View>
                            <View style={{flex: 1, marginHorizontal: 10}}>
                                <Text style={localStyles.itemName} numberOfLines={1}>{item.name}</Text>
                                <Text style={localStyles.itemDate}>{new Date(item.date).toLocaleDateString()}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(item.id, item.uri)} style={localStyles.deleteBtn}>
                                <Icon name="trash-2" size={20} color="#ff4444" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Modal>
    );
};

const localStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, backgroundColor: '#1a1a1a', borderBottomWidth: 1, borderBottomColor: '#333'
    },
    title: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
    closeBtn: { padding: 5 },
    tabs: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
    tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10, backgroundColor: '#222' },
    activeTab: { backgroundColor: '#007AFF' },
    tabText: { color: '#888' },
    activeTabText: { color: '#fff', fontWeight: 'bold' },
    item: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#222',
        padding: 15, borderRadius: 12, marginBottom: 10
    },
    iconBox: {
        width: 45, height: 45, borderRadius: 10, backgroundColor: '#333',
        alignItems: 'center', justifyContent: 'center'
    },
    itemName: { color: '#fff', fontSize: 16, marginBottom: 4 },
    itemDate: { color: '#666', fontSize: 12 },
    deleteBtn: { padding: 10 },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#666', marginTop: 15, fontSize: 16 }
});

export default DownloadsView;
