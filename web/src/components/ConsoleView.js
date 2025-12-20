import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import styles from '../styles/AppStyles';

// 1. مكون عرض الكونسول (جديد)
const ConsoleView = ({ logs, onClose, onExecute, onClear }) => {
    const [command, setCommand] = useState('');
    const flatListRef = useRef();

    return (
        <View style={styles.consoleContainer}>
            <View style={styles.consoleHeader}>
                <Text style={styles.consoleTitle}>Console (DevTools)</Text>
                <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity onPress={onClear} style={[styles.consoleBtn, {marginRight: 10}]}>
                        <Icon name="trash-2" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose} style={styles.consoleBtn}>
                        <Icon name="x" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
            <FlatList
                ref={flatListRef}
                data={logs}
                keyExtractor={item => item.id}
                style={styles.consoleList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                renderItem={({ item }) => (
                    <View style={[styles.consoleRow, styles[`consoleRow_${item.level}`]]}>
                        <Text style={styles.consoleTime}>{item.timestamp}</Text>
                        <Text style={[styles.consoleText, styles[`consoleText_${item.level}`]]}>
                            {item.message}
                        </Text>
                    </View>
                )}
            />
            <View style={styles.consoleInputArea}>
                <Text style={styles.consolePrompt}>{'>'}</Text>
                <TextInput
                    style={styles.consoleInput}
                    placeholder="Run JavaScript..."
                    placeholderTextColor="#666"
                    value={command}
                    onChangeText={setCommand}
                    onSubmitEditing={() => {
                        if(command.trim()) {
                            onExecute(command);
                            setCommand('');
                        }
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <TouchableOpacity onPress={() => {
                      if(command.trim()) {
                        onExecute(command);
                        setCommand('');
                    }
                }} style={styles.consoleSendBtn}>
                    <Icon name="play" size={16} color="#007AFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ConsoleView;