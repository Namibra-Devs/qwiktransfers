import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const SelectionPicker = ({ visible, onClose, onSelect, selectedValue, title, data, placeholder = 'Search...' }) => {
    const theme = useTheme();
    const [search, setSearch] = useState('');

    const filteredData = search 
        ? data.filter(item => {
            const label = typeof item === 'string' ? item : (item.name || item.label);
            return label.toLowerCase().includes(search.toLowerCase());
          })
        : data;

    const renderItem = ({ item }) => {
        const value = typeof item === 'string' ? item : (item.id || item.value || item.name);
        const label = typeof item === 'string' ? item : (item.name || item.label);
        const isSelected = selectedValue === value || selectedValue === label;

        return (
            <TouchableOpacity
                style={[
                    styles.item,
                    { borderBottomColor: theme.border },
                    isSelected && { backgroundColor: theme.primary + '10' }
                ]}
                onPress={() => {
                    onSelect(item);
                    setSearch('');
                    onClose();
                }}
            >
                {item.color && (
                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                )}
                <Text style={[styles.itemName, { color: theme.text }]}>{label}</Text>
                {isSelected && (
                    <Ionicons name="checkmark-sharp" size={20} color={theme.primary} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                        <TouchableOpacity onPress={() => { setSearch(''); onClose(); }} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {data.length > 8 && (
                        <View style={[styles.searchContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Ionicons name="search-outline" size={20} color={theme.textMuted} />
                            <TextInput
                                style={[styles.searchInput, { color: theme.text }]}
                                placeholder={placeholder}
                                placeholderTextColor={theme.textMuted}
                                value={search}
                                onChangeText={setSearch}
                                autoCorrect={false}
                            />
                            {search.length > 0 && (
                                <TouchableOpacity onPress={() => setSearch('')}>
                                    <Ionicons name="close-circle" size={18} color={theme.textMuted} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    <FlatList
                        data={filteredData}
                        keyExtractor={(item, index) => (typeof item === 'string' ? item : (item.id || item.value || index.toString()))}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 24,
        paddingHorizontal: 20,
        maxHeight: '80%',
        paddingBottom: 40
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 10
    },
    closeBtn: {
        padding: 4
    },
    title: {
        fontSize: 20,
        fontFamily: 'Outfit_700Bold'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
        marginHorizontal: 10
    },
    searchInput: {
        flex: 1,
        height: '100%',
        marginLeft: 8,
        fontSize: 15,
        fontFamily: 'Outfit_400Regular'
    },
    listContent: {
        paddingBottom: 20,
        paddingHorizontal: 10
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 12,
        marginBottom: 2
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 16
    },
    itemName: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Outfit_500Medium'
    }
});

export default SelectionPicker;
