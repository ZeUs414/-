
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, ScrollView, StyleSheet } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import styles from '../styles/AppStyles';

const NetworkInspectorView = ({ logs, onClose, onClear }) => {
    const [selectedRequest, setSelectedRequest] = useState(null);

    const getMethodColor = (method) => {
        switch(method) {
            case 'GET': return '#61affe';
            case 'POST': return '#49cc90';
            case 'PUT': return '#fca130';
            case 'DELETE': return '#f93e3e';
            default: return '#ccc';
        }
    };

    return (
        <View style={localStyles.container}>
            <View style={localStyles.header}>
                <Text style={localStyles.title}>Network Sniffer</Text>
                <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity onPress={onClear} style={localStyles.iconBtn}>
                        <Icon name="trash-2" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose} style={localStyles.iconBtn}>
                        <Icon name="x" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={logs}
                keyExtractor={item => item.id}
                contentContainerStyle={{paddingBottom: 20}}
                renderItem={({ item }) => (
                    <TouchableOpacity style={localStyles.row} onPress={() => setSelectedRequest(item)}>
                        <View style={localStyles.methodCol}>
                            <Text style={[localStyles.method, {color: getMethodColor(item.method)}]}>{item.method}</Text>
                            <Text style={localStyles.status}>{item.status}</Text>
                        </View>
                        <View style={localStyles.urlCol}>
                            <Text style={localStyles.url} numberOfLines={2}>{item.url}</Text>
                            <Text style={localStyles.type}>{item.requestType} • {item.timestamp}</Text>
                        </View>
                        <Icon name="chevron-right" size={16} color="#666" />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View style={localStyles.empty}>
                        <Text style={{color: '#666'}}>No requests captured yet.</Text>
                    </View>
                )}
            />

            {selectedRequest && (
                <Modal visible={true} transparent animationType="slide" onRequestClose={() => setSelectedRequest(null)}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, {height: '80%'}]}>
                            <View style={localStyles.header}>
                                <Text style={localStyles.title}>Request Details</Text>
                                <TouchableOpacity onPress={() => setSelectedRequest(null)}>
                                    <Icon name="x" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={{flex: 1}}>
                                <View style={localStyles.detailSection}>
                                    <Text style={localStyles.label}>URL</Text>
                                    <Text style={localStyles.value} selectable>{selectedRequest.url}</Text>
                                </View>
                                <View style={localStyles.detailSection}>
                                    <Text style={localStyles.label}>Method</Text>
                                    <Text style={[localStyles.value, {color: getMethodColor(selectedRequest.method)}]}>{selectedRequest.method}</Text>
                                </View>
                                <View style={localStyles.detailSection}>
                                    <Text style={localStyles.label}>Status</Text>
                                    <Text style={localStyles.value}>{selectedRequest.status}</Text>
                                </View>
                                <View style={localStyles.detailSection}>
                                    <Text style={localStyles.label}>Response / Body Preview</Text>
                                    <View style={localStyles.codeBlock}>
                                        <Text style={localStyles.code} selectable>{selectedRequest.data}</Text>
                                    </View>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: '#121212',
        zIndex: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        backgroundColor: '#1a1a1a'
    },
    title: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    iconBtn: { padding: 5, marginLeft: 15 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#222'
    },
    methodCol: { width: 50, alignItems: 'center' },
    method: { fontWeight: 'bold', fontSize: 12, marginBottom: 4 },
    status: { color: '#888', fontSize: 10 },
    urlCol: { flex: 1, marginHorizontal: 10 },
    url: { color: '#eee', fontSize: 12 },
    type: { color: '#666', fontSize: 10, marginTop: 4 },
    empty: { alignItems: 'center', marginTop: 50 },
    detailSection: { marginBottom: 15 },
    label: { color: '#888', fontSize: 12, marginBottom: 5 },
    value: { color: '#fff', fontSize: 14 },
    codeBlock: { backgroundColor: '#000', padding: 10, borderRadius: 5 },
    code: { color: '#a6e22e', fontFamily: 'monospace', fontSize: 12 }
});

export default NetworkInspectorView;
