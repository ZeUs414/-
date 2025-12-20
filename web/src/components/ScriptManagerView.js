
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, SafeAreaView, FlatList, Switch, Modal } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import styles from '../styles/AppStyles';
import { generateUUID } from '../core/Helpers';

// 2. مكون مدير السكربتات (جديد - صفحة كاملة)
const ScriptManagerView = ({ scripts, onClose, onSave }) => {
    const [editingScript, setEditingScript] = useState(null);
    const [isEditorVisible, setIsEditorVisible] = useState(false);
    
    // Editor States
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('*');
    const [code, setCode] = useState('');

    const openEditor = (script = null) => {
        if (script) {
            setEditingScript(script);
            setName(script.name);
            setDomain(script.domain);
            setCode(script.code);
        } else {
            setEditingScript(null);
            setName('');
            setDomain('*');
            setCode('// اكتب كود جافا سكربت هنا\nconsole.log("Hello from UserScript");');
        }
        setIsEditorVisible(true);
    };

    const saveScript = () => {
        if (!name || !code) return alert('الاسم والكود مطلوبان');
        
        let newScripts = [...scripts];
        if (editingScript) {
            newScripts = newScripts.map(s => s.id === editingScript.id ? { ...s, name, domain, code } : s);
        } else {
            newScripts.push({
                id: generateUUID(),
                name,
                domain,
                code,
                active: true,
                date: new Date().toISOString()
            });
        }
        onSave(newScripts);
        setIsEditorVisible(false);
    };

    const deleteScript = (id) => {
        const newScripts = scripts.filter(s => s.id !== id);
        onSave(newScripts);
    };

    const toggleScript = (id) => {
        const newScripts = scripts.map(s => s.id === id ? { ...s, active: !s.active } : s);
        onSave(newScripts);
    };

    return (
        <SafeAreaView style={styles.scriptManagerContainer}>
            {/* Header */}
            <View style={styles.scriptHeader}>
                <TouchableOpacity onPress={onClose} style={styles.scriptHeaderBtn}>
                    <Icon name="x" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.scriptTitle}>مدير السكربتات</Text>
                <TouchableOpacity onPress={() => openEditor()} style={styles.scriptHeaderBtn}>
                    <Icon name="plus" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={scripts}
                keyExtractor={item => item.id}
                contentContainerStyle={{padding: 15}}
                ListEmptyComponent={() => (
                    <View style={styles.emptyScripts}>
                        <Icon name="code" size={50} color="#444" />
                        <Text style={{color: '#888', marginTop: 10}}>لا توجد سكربتات مضافة</Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View style={styles.scriptItem}>
                        <View style={{flex: 1}}>
                            <Text style={styles.scriptName}>{item.name}</Text>
                            <Text style={styles.scriptDomain}>{item.domain}</Text>
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Switch 
                                value={item.active} 
                                onValueChange={() => toggleScript(item.id)} 
                                trackColor={{false: "#444", true: "#007AFF"}}
                                thumbColor={"#fff"}
                            />
                            <TouchableOpacity onPress={() => openEditor(item)} style={{marginLeft: 15}}>
                                <Icon name="edit-2" size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => deleteScript(item.id)} style={{marginLeft: 15}}>
                                <Icon name="trash" size={20} color="#ff4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            {/* FULL SCREEN EDITOR MODAL */}
            <Modal visible={isEditorVisible} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setIsEditorVisible(false)}>
                <SafeAreaView style={styles.scriptEditorContainer}>
                    <View style={styles.scriptHeader}>
                        <TouchableOpacity onPress={() => setIsEditorVisible(false)} style={styles.scriptHeaderBtn}>
                            <Icon name="x" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.scriptTitle}>{editingScript ? 'تعديل سكربت' : 'سكربت جديد'}</Text>
                        <TouchableOpacity onPress={saveScript} style={styles.scriptHeaderBtn}>
                            <Icon name="check" size={24} color="#4CAF50" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.scriptForm}>
                        <Text style={styles.label}>اسم السكربت</Text>
                        <TextInput style={styles.scriptInput} value={name} onChangeText={setName} placeholder="مثال: الوضع الليلي المخصص" placeholderTextColor="#666" />
                        
                        <Text style={styles.label}>النطاق (Domain)</Text>
                        <Text style={styles.hint}>ضع * ليعمل في كل المواقع، أو google.com لموقع محدد</Text>
                        <TextInput style={styles.scriptInput} value={domain} onChangeText={setDomain} placeholder="example.com" placeholderTextColor="#666" autoCapitalize="none" />
                        
                        <Text style={styles.label}>كود JavaScript</Text>
                        <TextInput 
                            style={[styles.scriptInput, styles.codeArea]} 
                            value={code} 
                            onChangeText={setCode} 
                            multiline 
                            textAlignVertical="top" 
                            autoCapitalize="none" 
                            autoCorrect={false} 
                            placeholder="alert('Hi');"
                            placeholderTextColor="#666"
                        />
                        <View style={{height: 50}} />
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

export default ScriptManagerView;
