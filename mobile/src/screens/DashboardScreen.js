import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DashboardScreen = () => {
    const { user, logout } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions');
            setTransactions(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTransactions();
        setRefreshing(false);
    };

    const handleSend = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        setLoading(true);
        try {
            await api.post('/transactions', {
                amount_sent: amount,
                type: 'GHS-CAD',
                recipient_details: { name: 'Recipient', account: '123456' },
            });
            setAmount('');
            await fetchTransactions();
            Alert.alert('Success', 'Transaction request sent!');
        } catch (error) {
            Alert.alert('Error', 'Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'sent':
                return '#28a745';
            case 'processing':
                return '#ffc107';
            default:
                return '#6c757d';
        }
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>QwikTransfers</Text>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.welcomeCard}>
                <Text style={styles.welcomeText}>Welcome, {user?.email}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Send Money (GHS to CAD)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Amount (GHS)"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                />
                <Text style={styles.rateText}>Exchange Rate: 1 GHS ≈ 0.10 CAD</Text>
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSend}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Send Request'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Recent Transactions</Text>
                {transactions.length === 0 ? (
                    <Text style={styles.emptyText}>No transactions found</Text>
                ) : (
                    transactions.map((tx) => (
                        <View key={tx.id} style={styles.transactionItem}>
                            <View style={styles.transactionRow}>
                                <Text style={styles.transactionLabel}>ID:</Text>
                                <Text style={styles.transactionValue}>{tx.id}</Text>
                            </View>
                            <View style={styles.transactionRow}>
                                <Text style={styles.transactionLabel}>Sent:</Text>
                                <Text style={styles.transactionValue}>{tx.amount_sent} GHS</Text>
                            </View>
                            <View style={styles.transactionRow}>
                                <Text style={styles.transactionLabel}>Received:</Text>
                                <Text style={styles.transactionValue}>{tx.amount_received} CAD</Text>
                            </View>
                            <View style={styles.transactionRow}>
                                <Text style={styles.transactionLabel}>Status:</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tx.status) }]}>
                                    <Text style={styles.statusText}>{tx.status}</Text>
                                </View>
                            </View>
                            <Text style={styles.dateText}>
                                {new Date(tx.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        backgroundColor: '#007bff',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    logoutButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
    },
    logoutText: {
        color: 'white',
        fontWeight: '600',
    },
    welcomeCard: {
        backgroundColor: 'white',
        padding: 15,
        margin: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    welcomeText: {
        fontSize: 16,
        color: '#343a40',
    },
    card: {
        backgroundColor: 'white',
        padding: 20,
        margin: 15,
        marginTop: 0,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#343a40',
    },
    input: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 5,
        marginBottom: 10,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    rateText: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: '#6c757d',
        padding: 20,
    },
    transactionItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 15,
    },
    transactionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    transactionLabel: {
        fontSize: 14,
        color: '#6c757d',
        fontWeight: '600',
    },
    transactionValue: {
        fontSize: 14,
        color: '#343a40',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    dateText: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 5,
    },
});

export default DashboardScreen;
