
import React, { useState, useEffect, useRef } from 'react';
import { 
    View, Text, TextInput, TouchableOpacity, Image, StyleSheet, 
    ScrollView, Dimensions, Animated, Keyboard, Platform 
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const HomePage = ({ 
    currentEngine, 
    websites, 
    searchHistory = [],
    onSearch, 
    onAddFavorite, 
    onOpenSite,
    onRemoveHistoryItem 
}) => {
    const [searchText, setSearchText] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    
    // Animation for Search History Dropdown
    const historyHeight = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start();
    }, []);

    const toggleHistory = (show) => {
        setShowHistory(show);
        Animated.timing(historyHeight, {
            toValue: show ? Math.min(searchHistory.length * 45, 200) : 0,
            duration: 250,
            useNativeDriver: false
        }).start();
    };

    const handleSubmit = () => {
        if (searchText.trim().length > 0) {
            toggleHistory(false);
            onSearch(searchText);
        }
    };

    const getEngineIcon = () => {
        switch (currentEngine) {
            case 'Google': return 'chrome'; 
            case 'DuckDuckGo': return 'target';
            case 'Bing': return 'globe';
            default: return 'search';
        }
    };

    const getEngineColor = () => {
        switch (currentEngine) {
            case 'Google': return '#4285F4';
            case 'DuckDuckGo': return '#DE5833';
            case 'Bing': return '#008373';
            default: return '#888';
        }
    };

    // Responsive Grid Item Width
    // Mobile: 25% (4 items), Tablet: 20% (5 items)
    const itemWidth = width > 768 ? '20%' : '25%';

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                
                {/* Logo Area */}
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('../../assets/logo.png')} 
                        style={styles.logoImage}
                        resizeMode="contain"
                        fadeDuration={0} 
                    />
                    <Text style={styles.appName}>ZEUS Browser</Text>
                </View>

                {/* Search Bar Area */}
                <View style={{ width: '100%', alignItems: 'center', zIndex: 100 }}>
                    <View style={styles.searchBarContainer}>
                        <View style={styles.searchIconWrapper}>
                            <Icon name={getEngineIcon()} size={20} color={getEngineColor()} />
                        </View>
                        <TextInput 
                            style={styles.searchInput}
                            placeholder={`البحث في ${currentEngine} أو أدخل رابطاً`}
                            placeholderTextColor="#666"
                            value={searchText}
                            onChangeText={setSearchText}
                            onSubmitEditing={handleSubmit}
                            onFocus={() => {
                                if (searchHistory.length > 0) toggleHistory(true);
                            }}
                            onBlur={() => {
                                // Small delay to allow clicking on items
                                setTimeout(() => toggleHistory(false), 200);
                            }}
                            returnKeyType="search"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearBtn}>
                                <Icon name="x" size={18} color="#888" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Search History Dropdown */}
                    {searchHistory.length > 0 && (
                        <Animated.View style={[styles.historyDropdown, { height: historyHeight }]}>
                            <ScrollView keyboardShouldPersistTaps="always">
                                {searchHistory.slice(0, 10).map((item, index) => (
                                    <View key={index} style={styles.historyItemRow}>
                                        <TouchableOpacity 
                                            style={styles.historyItemContent}
                                            onPress={() => onSearch(item)}
                                        >
                                            <Icon name="clock" size={14} color="#888" style={{marginRight: 8}} />
                                            <Text style={styles.historyText} numberOfLines={1}>{item}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={styles.removeHistoryBtn}
                                            onPress={() => onRemoveHistoryItem(item)}
                                        >
                                            <Icon name="x" size={14} color="#666" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </Animated.View>
                    )}
                </View>

                {/* Quick Links Grid */}
                <ScrollView contentContainerStyle={styles.gridContainer}>
                    {websites.map((site) => (
                        <View key={site.id} style={[styles.gridItemWrapper, { width: itemWidth }]}>
                            <TouchableOpacity style={styles.gridItem} onPress={() => onOpenSite(site.url)}>
                                <View style={styles.iconCircle}>
                                    <Image
                                        source={{ uri: `https://www.google.com/s2/favicons?domain=${site.url}&sz=128` }}
                                        style={styles.favicon}
                                    />
                                </View>
                                <Text style={styles.siteName} numberOfLines={1}>{site.name}</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    
                    {/* Add Button */}
                    <View style={[styles.gridItemWrapper, { width: itemWidth }]}>
                        <TouchableOpacity style={styles.gridItem} onPress={onAddFavorite}>
                            <View style={[styles.iconCircle, styles.addCircle]}>
                                <Icon name="plus" size={24} color="#fff" />
                            </View>
                            <Text style={styles.siteName}>إضافة</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: '15%',
        paddingHorizontal: 20
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30
    },
    logoImage: {
        width: 100, 
        height: 100,
        marginBottom: 10,
    },
    appName: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        width: '100%',
        height: 55,
        borderRadius: 30,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#333',
        zIndex: 10
    },
    searchIconWrapper: {
        marginRight: 10
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        textAlign: 'right',
        height: '100%'
    },
    clearBtn: {
        padding: 5
    },
    
    // History Dropdown
    historyDropdown: {
        width: '90%',
        backgroundColor: '#1a1a1a',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        overflow: 'hidden',
        marginTop: -10, // Overlap slightly to look connected
        paddingTop: 10,
        zIndex: 5,
    },
    historyItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 45,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    historyItemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    historyText: {
        color: '#ccc',
        fontSize: 14
    },
    removeHistoryBtn: {
        padding: 10
    },

    // Grid
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start', // Align start to allow clean rows
        width: '100%',
        paddingTop: 30
    },
    gridItemWrapper: {
        // Width set dynamically in component
        alignItems: 'center',
        marginBottom: 20,
    },
    gridItem: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        backgroundColor: '#2C2C2C',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        overflow: 'hidden'
    },
    addCircle: {
        backgroundColor: '#333',
        borderWidth: 1,
        borderColor: '#555',
        borderStyle: 'dashed'
    },
    favicon: {
        width: 30,
        height: 30,
        resizeMode: 'contain'
    },
    siteName: {
        color: '#ccc',
        fontSize: 12,
        textAlign: 'center'
    }
});

export default HomePage;
