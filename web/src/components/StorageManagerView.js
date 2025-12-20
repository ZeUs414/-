
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, StyleSheet, Alert } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import styles from '../styles/AppStyles';

const StorageManagerView = ({ data, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('localStorage'); // localStorage, sessionStorage, cookies
    const [parsedData, setParsedData] = useState([]);
    const [editingItem, setEditingItem] = useState(null); // { key, value }
    const [isAdding, setIsAdding] = useState(false);
    const [editKey, setEditKey] = useState('');
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        if (!data) return;
        let raw = {};
        try {
            if (activeTab === 'cookies') {
                // Parse Cookies string: "key=value; key2=value2"
                const parts = data.cookies.split(';');
                parts.forEach(part => {
                    const [k, v] = part.split('=');
                    if (k) raw[k.trim()] = v;
                });
            } else {
                raw = JSON.parse(data[activeTab] || '{}');
            }
        } catch(e) { raw = {} }

        const items = Object.entries(raw).map(([k, v]) => ({ key: k, value: String(v) }));
        setParsedData(items);
    }, [data, activeTab]);

    const handleSave = () => {
        if (!editKey) return;
        onUpdate(activeTab, editKey, editValue, 'SET');
        setEditingItem(null);
        setIsAdding(false);
    };

    const handleDelete = (key) => {
        Alert.alert('Delete Item', `Are you sure you want to delete "${key}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => onUpdate(activeTab, key, null, 'DELETE') }
        ]);
    };

    const openEditor = (item) => {
        setIsAdding(false);
        setEditingItem(item);
        setEditKey(item.key);
        setEditValue(item.value);
    };

    const openAdd = () => {
        setIsAdding(true);
        setEditingItem(true);
        setEditKey('');
        setEditValue('');
    };

    return (
        <View style={localStyles.container}>
            <View style={localStyles.header}>
                <Text style={localStyles.title}>Storage Editor</Text>
                <TouchableOpacity onPress={onClose} style={localStyles.iconBtn}>
                    <Icon name="x" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={localStyles.tabs}>
                {['localStorage', 'sessionStorage', 'cookies'].map(tab => (
                    <TouchableOpacity 
                        key={tab} 
                        style={[localStyles.tab, activeTab === tab && localStyles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[localStyles.tabText, activeTab === tab && localStyles.activeTabText]}>
                            {tab === 'localStorage' ? 'Local' : tab === 'sessionStorage' ? 'Session' : 'Cookies'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={localStyles.actionsBar}>
                <Text style={{color: '#888'}}>{parsedData.length} items</Text>
                <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity onPress={() => onUpdate(activeTab, null, null, 'CLEAR')} style={[localStyles.actionBtn, {backgroundColor: '#d32f2f'}]}>
                        <Text style={localStyles.actionText}>Clear All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openAdd} style={[localStyles.actionBtn, {backgroundColor: '#388e3c'}]}>
                        <Text style={localStyles.actionText}>+ Add New</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={parsedData}
                keyExtractor={item => item.key}
                contentContainerStyle={{padding: 10}}
                renderItem={({ item }) => (
                    <View style={localStyles.row}>
                        <View style={{flex: 1}}>
                            <Text style={localStyles.key}>{item.key}</Text>
                            <Text style={localStyles.val} numberOfLines={1}>{item.value}</Text>
                        </View>
                        <TouchableOpacity onPress={() => openEditor(item)} style={{padding: 8}}>
                             <Icon name="edit-2" size={18} color="#2196F3" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.key)} style={{padding: 8}}>
                             <Icon name="trash-2" size={18} color="#f44336" />
                        </TouchableOpacity>
                    </View>
                )}
            />

            {editingItem && (
                <Modal visible={true} transparent animationType="fade" onRequestClose={() => setEditingItem(null)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>{isAdding ? 'Add Item' : 'Edit Item'}</Text>
                            
                            <Text style={localStyles.label}>Key</Text>
                            <TextInput 
                                style={[styles.input, !isAdding && {opacity: 0.5}]} 
                                value={editKey} 
                                onChangeText={setEditKey}
                                editable={isAdding}
                                placeholder="Key"
                            />
                            
                            <Text style={localStyles.label}>Value</Text>
                            <TextInput 
                                style={[styles.input, {height: 100, textAlignVertical: 'top'}]} 
                                value={editValue} 
                                onChangeText={setEditValue}
                                multiline
                                placeholder="Value"
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.modalButton} onPress={() => setEditingItem(null)}>
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleSave}>
                                    <Text style={styles.modalButtonTextPrimary}>Save</Text>
                                </TouchableOpacity>
                            </View>
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
    iconBtn: { padding: 5 },
    tabs: { flexDirection: 'row', backgroundColor: '#000' },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: '#2196F3' },
    tabText: { color: '#888', fontWeight: 'bold' },
    activeTabText: { color: '#2196F3' },
    actionsBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#1e1e1e' },
    actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, marginLeft: 10 },
    actionText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2a2a2a', padding: 12, borderRadius: 8, marginBottom: 8 },
    key: { color: '#ff9800', fontWeight: 'bold', fontSize: 14, marginBottom: 2 },
    val: { color: '#ccc', fontSize: 12 },
    label: { color: '#aaa', marginBottom: 5, fontSize: 12 }
});

export default StorageManagerView;
