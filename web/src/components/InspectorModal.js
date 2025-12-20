
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import styles from '../styles/AppStyles';

const InspectorModal = ({ visible, data, onClose, onBlock }) => {
    if (!visible || !data) return null;

    return (
        <View style={localStyles.overlay}>
             {/* Header */}
            <View style={localStyles.header}>
                <Text style={localStyles.headerTitle}>🔍 Element Inspector</Text>
                <TouchableOpacity onPress={onClose} style={localStyles.closeBtn}>
                    <Icon name="x" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView style={localStyles.content}>
                <View style={localStyles.section}>
                    <Text style={localStyles.label}>Tag Name</Text>
                    <Text style={localStyles.value}>{data.tagName}</Text>
                </View>

                <View style={localStyles.section}>
                    <Text style={localStyles.label}>CSS Path (Selector)</Text>
                    <Text style={[localStyles.value, {color: '#feca57'}]}>{data.cssSelector}</Text>
                </View>

                {data.id ? (
                    <View style={localStyles.section}>
                        <Text style={localStyles.label}>ID</Text>
                        <Text style={localStyles.value}>{data.id}</Text>
                    </View>
                ) : null}

                {data.className ? (
                    <View style={localStyles.section}>
                        <Text style={localStyles.label}>Classes</Text>
                        <Text style={localStyles.value}>{data.className}</Text>
                    </View>
                ) : null}

                <View style={localStyles.section}>
                     <Text style={localStyles.label}>HTML Preview</Text>
                     <View style={localStyles.codeBox}>
                        <Text style={localStyles.code}>{data.html}</Text>
                     </View>
                </View>
            </ScrollView>

            <View style={localStyles.footer}>
                <TouchableOpacity 
                    style={localStyles.blockBtn} 
                    onPress={() => onBlock(data.cssSelector)}
                >
                    <Icon name="slash" size={18} color="#fff" style={{marginRight: 8}} />
                    <Text style={localStyles.blockBtnText}>Block Element (AdBlock)</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const localStyles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
        zIndex: 100,
        elevation: 20,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        borderTopWidth: 1,
        borderColor: '#333'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    closeBtn: { padding: 5 },
    content: { padding: 20 },
    section: { marginBottom: 15 },
    label: { color: '#888', fontSize: 12, marginBottom: 4 },
    value: { color: '#fff', fontSize: 14, fontWeight: '500' },
    codeBox: { backgroundColor: '#000', padding: 10, borderRadius: 6 },
    code: { color: '#a6e22e', fontFamily: 'monospace', fontSize: 11 },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#333' },
    blockBtn: {
        backgroundColor: '#d32f2f',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10
    },
    blockBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default InspectorModal;
