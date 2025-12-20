
import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import styles from '../styles/AppStyles';

const BlockedElementsView = ({ rules, onClose, onDelete }) => {
    
    const confirmDelete = (rule) => {
        Alert.alert(
            'إلغاء الحظر',
            `هل تريد إزالة الحظر عن هذا العنصر؟\n${rule}`,
            [
                { text: 'إلغاء', style: 'cancel' },
                { text: 'نعم، أزل الحظر', onPress: () => onDelete(rule), style: 'destructive' }
            ]
        );
    };

    return (
        <View style={localStyles.container}>
            <View style={localStyles.header}>
                <Text style={localStyles.title}>🛡️ العناصر المحظورة يدوياً</Text>
                <TouchableOpacity onPress={onClose} style={localStyles.iconBtn}>
                    <Icon name="x" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

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
                        <TouchableOpacity onPress={() => confirmDelete(item)} style={localStyles.deleteBtn}>
                            <Icon name="trash-2" size={20} color="#ff4444" />
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: '#121212',
        zIndex: 70, // Higher than others
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
    infoBox: {
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(33, 150, 243, 0.2)'
    },
    infoText: { color: '#aaa', fontSize: 13, textAlign: 'center' },
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
    selector: { color: '#feca57', fontFamily: 'monospace', fontSize: 12 },
    deleteBtn: { padding: 10, marginLeft: 10 },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#666', marginTop: 15 }
});

export default BlockedElementsView;
