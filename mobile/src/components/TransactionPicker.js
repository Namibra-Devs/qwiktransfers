import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const TransactionPicker = ({ visible, onClose, onSelect, selectedId, transactions }) => {
    const theme = useTheme();

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>Select Transaction</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {transactions.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: theme.textMuted }}>No available transactions.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={transactions}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.itemRow,
                                        { borderBottomColor: theme.border },
                                        selectedId === item.id.toString() && { backgroundColor: theme.isDark ? '#374151' : '#f3f4f6' }
                                    ]}
                                    onPress={() => {
                                        onSelect(item.id.toString());
                                        onClose();
                                    }}
                                >
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="swap-horizontal" size={20} color={theme.primary} />
                                    </View>
                                    <View style={styles.details}>
                                        <Text style={[styles.transactionId, { color: theme.text }]}>{item.transaction_id}</Text>
                                        <Text style={[styles.amount, { color: theme.primary }]}>{item.amount_sent} GHS</Text>
                                        <Text style={[styles.date, { color: theme.textMuted }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                    {selectedId === item.id.toString() && (
                                        <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    )}
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingHorizontal: 20,
        maxHeight: '60%',
        paddingBottom: 40
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    title: {
        fontSize: 18,
        fontFamily: 'Outfit_700Bold'
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 8
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(216, 59, 1, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
    },
    details: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8
    },
    transactionId: {
        fontSize: 15,
        fontFamily: 'Outfit_700Bold',
        width: '100%'
    },
    amount: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold'
    },
    date: {
        fontSize: 12,
        fontFamily: 'Outfit_400Regular'
    }
});

export default TransactionPicker;
