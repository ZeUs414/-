
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/AppStyles';

const BlockedElementsView = ({ rules, userBlockedDomains, onClose, onDelete, onAddDomain, onRemoveDomain }) => {
    const [activeTab, setActiveTab] = useState('rules'); // 'rules' | 'sites'
    const [newDomain, setNewDomain] = useState('');

    useEffect(() => {
        AsyncStorage.getItem('blocked_view_last_tab').then(val => {
            if (val) setActiveTab(val);
        });
    }, []);

    const changeTab = (tab) => {
        setActiveTab(tab);
        AsyncStorage.setItem('blocked_view_last_tab', tab);
    };

    const confirmDeleteRule = (rule) => {
        Alert.alert(
            'إلغاء الحظر',
            `هل تريد إزالة الحظر عن هذا العنصر؟\n${rule}`,
            [
                { text: 'إلغاء', style: 'cancel' },
                { text: 'نعم، أزل الحظر', onPress: () => onDelete(rule), style: 'destructive' }
            ]
        );
    };

    const confirmDeleteDomain = (domain) => {
        Alert.alert(
            'إلغاء الحظر',
            `هل تريد السماح لهذا الموقع؟\n${domain}`,
            [
                { text: 'إلغاء', style: 'cancel' },
                { text: 'نعم', onPress: () => onRemoveDomain(domain), style: 'destructive' }
            ]
        );
    };

    const handleAddDomain = () => {
        if (newDomain.trim().length > 3) {
            onAddDomain(newDomain);
            setNewDomain('');
        }
    };

    return (
        <View style={localStyles.container}>
            <View style={localStyles.header}>
                <Text style={localStyles.title}>🛡️ إدارة الحظر</Text>
                <TouchableOpacity onPress={onClose} style={localStyles.iconBtn}>
                    <Icon name="x" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={localStyles.tabs}>
                <TouchableOpacity 
                    style={[localStyles.tab, activeTab === 'rules' && localStyles.activeTab]} 
                    onPress={() => changeTab('rules')}
                >
                    <Text style={[localStyles.tabText, activeTab === 'rules' && localStyles.activeTabText]}>العناصر (CSS)</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[localStyles.tab, activeTab === 'sites' && localStyles.activeTab]} 
                    onPress={() => changeTab('sites')}
                >
                    <Text style={[localStyles.tabText, activeTab === 'sites' && localStyles.activeTabText]}>المواقع المحظورة</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'rules' ? (
                <>
                    <View style={localStyles.infoBox}>
                        <Text style={localStyles.infoText}>
                            هذه القائمة تحتوي على العناصر (الإعلانات) التي قمت بحظرها يدوياً باستخدام "فاحص العناصر".
                        </Text>
                    </View>
                    <FlatList
                        data={rules}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{padding: 15}}
                        ListEmptyComponent={() => (
                            <View style={localStyles.empty}>
                                <Icon name="shield" size={50} color="#444" />
                                <Text style={localStyles.emptyText}>لم تقم بحظر أي عناصر يدوياً بعد.</Text>
                            </View>
                        )}
                        renderItem={({ item }) => (
                            <View style={localStyles.row}>
                                <View style={{flex: 1}}>
                                    <Text style={localStyles.selector} numberOfLines={2}>{item}</Text>
                                </View>
                                <TouchableOpacity onPress={() => confirmDeleteRule(item)} style={localStyles.deleteBtn}>
                                    <Icon name="trash-2" size={20} color="#ff4444" />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </>
            ) : (
                <>
                    <View style={localStyles.addBox}>
                        <TextInput 
                            style={localStyles.input} 
                            placeholder="أدخل رابط الموقع (example.com)" 
                            placeholderTextColor="#666"
                            value={newDomain}
                            onChangeText={setNewDomain}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity style={localStyles.addBtn} onPress={handleAddDomain}>
                            <Icon name="plus" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={userBlockedDomains}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{padding: 15}}
                        ListEmptyComponent={() => (
                            <View style={localStyles.empty}>
                                <Icon name="slash" size={50} color="#444" />
                                <Text style={localStyles.emptyText}>لا توجد مواقع محظورة كلياً.</Text>
                            </View>
                        )}
                        renderItem={({ item }) => (
                            <View style={localStyles.row}>
                                <View style={{flex: 1}}>
                                    <Text style={localStyles.selector} numberOfLines={1}>{item}</Text>
                                    <Text style={{color: '#666', fontSize: 10}}>محظور تماماً</Text>
                                </View>
                                <TouchableOpacity onPress={() => confirmDeleteDomain(item)} style={localStyles.deleteBtn}>
                                    <Icon name="trash-2" size={20} color="#ff4444" />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </>
            )}
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: '#121212',
        zIndex: 70, 
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
    title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    iconBtn: { padding: 5 },
    tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#333' },
    tab: { flex: 1, padding: 15, alignItems: 'center' },
    activeTab: { borderBottomWidth: 2, borderBottomColor: '#d32f2f' },
    tabText: { color: '#888', fontWeight: 'bold' },
    activeTabText: { color: '#fff' },
    
    infoBox: {
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(33, 150, 243, 0.2)'
    },
    infoText: { color: '#aaa', fontSize: 13, textAlign: 'center' },
    
    addBox: {
        flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#333'
    },
    input: {
        flex: 1, backgroundColor: '#222', borderRadius: 8, padding: 10,
        color: '#fff', marginRight: 10
    },
    addBtn: {
        backgroundColor: '#d32f2f', borderRadius: 8, width: 44,
        alignItems: 'center', justifyContent: 'center'
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#d32f2f'
    },
    selector: { color: '#fff', fontWeight: '500', fontSize: 14 },
    deleteBtn: { padding: 10, marginLeft: 10 },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#666', marginTop: 15 }
});

export default BlockedElementsView;
