import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const DocTypePicker = ({ visible, onClose, onSelect, selectedValue, country }) => {
    const theme = useTheme();

    const getDocTypes = () => {
        const baseTypes = [
            { label: 'Passport', value: 'passport', icon: 'journal-outline' },
            { label: "Driver's License", value: 'drivers_license', icon: 'car-outline' },
        ];

        if (country === 'Ghana') {
            return [
                { label: 'Ghana Card / Voter ID', value: 'ghana_card', icon: 'card-outline' },
                ...baseTypes
            ];
        }

        return [
            { label: 'Government Issued ID', value: 'government_id', icon: 'card-outline' },
            ...baseTypes
        ];
    };

    const docTypes = getDocTypes();

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>Select Document Type</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={docTypes}
                        keyExtractor={(item) => item.value}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.item,
                                    { borderBottomColor: theme.border },
                                    selectedValue === item.value && { backgroundColor: theme.primary + '10' }
                                ]}
                                onPress={() => {
                                    onSelect(item.value);
                                    onClose();
                                }}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
                                    <Ionicons name={item.icon} size={22} color={theme.primary} />
                                </View>
                                <Text style={[styles.itemName, { color: theme.text }]}>{item.label}</Text>
                                {selectedValue === item.value && (
                                    <Ionicons name="checkmark-sharp" size={20} color={theme.primary} />
                                )}
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.listContent}
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
        maxHeight: '60%',
        paddingBottom: 40
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 10
    },
    closeBtn: {
        padding: 4
    },
    title: {
        fontSize: 20,
        fontFamily: 'Outfit_700Bold'
    },
    listContent: {
        paddingBottom: 20
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 4
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    itemName: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Outfit_500Medium'
    }
});

export default DocTypePicker;
