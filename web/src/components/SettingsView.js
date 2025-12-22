
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated, ScrollView, Image } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';

const SEARCH_ENGINES = [
    { name: 'Google', icon: require('../../assets/google.png'), color: '#4285F4' }, // Placeholder icons
    { name: 'DuckDuckGo', icon: require('../../assets/duckduckgo.png'), color: '#DE5833' },
    { name: 'Bing', icon: require('../../assets/bing.png'), color: '#008373' },
];

const SettingsView = ({ visible, onClose, currentEngine, onSelectEngine }) => {
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                friction: 8
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: true
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
                
                <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
                    {/* Handle Bar */}
                    <View style={styles.handle} />
                    
                    <View style={styles.header}>
                        <Text style={styles.title}>الإعدادات</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Icon name="x" size={24} color="#ccc" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>محرك البحث المفضل</Text>
                            <View style={styles.engineList}>
                                {SEARCH_ENGINES.map((engine) => (
                                    <TouchableOpacity 
                                        key={engine.name} 
                                        style={[
                                            styles.engineOption, 
                                            currentEngine === engine.name && styles.engineSelected
                                        ]}
                                        onPress={() => onSelectEngine(engine.name)}
                                    >
                                        <View style={[styles.radioCircle, currentEngine === engine.name && { borderColor: engine.color }]}>
                                            {currentEngine === engine.name && <View style={[styles.radioDot, { backgroundColor: engine.color }]} />}
                                        </View>
                                        <Text style={[styles.engineName, currentEngine === engine.name && { color: engine.color }]}>
                                            {engine.name}
                                        </Text>
                                        {/* You can add actual Image logos here if available */}
                                        {currentEngine === engine.name && <Icon name="check" size={18} color={engine.color} style={{marginLeft: 'auto'}} />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>عام</Text>
                            <View style={styles.settingRow}>
                                <View style={styles.iconBox}><Icon name="info" size={20} color="#fff" /></View>
                                <Text style={styles.settingText}>عن المتصفح</Text>
                                <Text style={styles.versionText}>v1.0.0</Text>
                            </View>
                        </View>

                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        height: '60%',
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#444',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 15
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    title: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    closeBtn: {
        padding: 5,
        backgroundColor: '#333',
        borderRadius: 20
    },
    content: {
        flex: 1
    },
    section: {
        marginBottom: 30
    },
    sectionTitle: {
        color: '#888',
        fontSize: 14,
        marginBottom: 15,
        fontWeight: '600'
    },
    engineList: {
        backgroundColor: '#2C2C2C',
        borderRadius: 15,
        overflow: 'hidden'
    },
    engineOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#383838'
    },
    engineSelected: {
        backgroundColor: 'rgba(255,255,255,0.05)'
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#666',
        marginRight: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    engineName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500'
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2C2C',
        padding: 15,
        borderRadius: 15
    },
    iconBox: {
        width: 35,
        height: 35,
        borderRadius: 10,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15
    },
    settingText: {
        color: '#fff',
        fontSize: 16,
        flex: 1
    },
    versionText: {
        color: '#666'
    }
});

export default SettingsView;
