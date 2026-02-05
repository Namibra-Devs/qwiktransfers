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
    Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DashboardScreen = () => {
    const { user, logout, refreshProfile } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState('');
    const [recipientType, setRecipientType] = useState('momo');
    const [recipientName, setRecipientName] = useState('');
    const [recipientAccount, setRecipientAccount] = useState('');
    const [rate, setRate] = useState(0.09);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchTransactions();
        fetchRate();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions');
            setTransactions(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchRate = async () => {
        try {
            const res = await api.get('/rates');
            setRate(res.data.rate);
        } catch (error) {
            console.error('Rate Error:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchTransactions(), fetchRate(), refreshProfile?.()]);
        setRefreshing(false);
    };

    const handleSend = async () => {
        if (!amount || !recipientName || !recipientAccount) {
            Alert.alert('Error', 'Please fill all recipient details');
            return;
        }

        setLoading(true);
        try {
            await api.post('/transactions', {
                amount_sent: amount,
                type: 'GHS-CAD',
                recipient_details: {
                    type: recipientType,
                    name: recipientName,
                    account: recipientAccount
                }
            });
            setAmount('');
            setRecipientName('');
            setRecipientAccount('');
            await fetchTransactions();
            Alert.alert('Success', 'Transfer request initiated! Please upload proof of payment.');
        } catch (error) {
            Alert.alert('Error', 'Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadProof = async (txId) => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'You need to allow access to photos to upload proof.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const localUri = result.assets[0].uri;
            const filename = localUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            const formData = new FormData();
            formData.append('proof', { uri: localUri, name: filename, type });

            setLoading(true);
            try {
                await api.post(`/transactions/${txId}/upload-proof`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                Alert.alert('Success', 'Proof uploaded successfully!');
                fetchTransactions();
            } catch (error) {
                Alert.alert('Error', 'Failed to upload proof');
            } finally {
                setLoading(false);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'sent': return '#10b981';
            case 'processing': return '#f59e0b';
            case 'pending': return '#6366f1';
            default: return '#6b7280';
        }
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>QwikTransfers</Text>
                    <Text style={styles.verificationText}>
                        Status: <Text style={{ color: user?.kyc_status === 'verified' ? '#10b981' : '#f59e0b' }}>
                            {user?.kyc_status?.toUpperCase() || 'NOT VERIFIED'}
                        </Text>
                    </Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>New Transfer</Text>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Amount (GHS)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Recipient Method</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={recipientType}
                            onValueChange={(itemValue) => setRecipientType(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Momo (MTN/Vodafone)" value="momo" />
                            <Picker.Item label="Bank Transfer" value="bank" />
                            <Picker.Item label="PayPal" value="paypal" />
                        </Picker>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Recipient Name"
                        value={recipientName}
                        onChangeText={setRecipientName}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Account Number / ID</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 0244000000"
                        value={recipientAccount}
                        onChangeText={setRecipientAccount}
                    />
                </View>

                <View style={styles.estimateBox}>
                    <Text style={styles.estimateLabel}>Estimated Received</Text>
                    <Text style={styles.estimateValue}>
                        {amount ? (parseFloat(amount) * rate).toFixed(2) : '0.00'} CAD
                    </Text>
                    <Text style={styles.rateDetail}>Rate: 1 GHS = {rate} CAD</Text>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSend}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Send Request'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Transaction History</Text>
                {transactions.length === 0 ? (
                    <Text style={styles.emptyText}>No activity found</Text>
                ) : (
                    transactions.map((tx) => (
                        <View key={tx.id} style={styles.transactionItem}>
                            <View style={styles.txMain}>
                                <View>
                                    <Text style={styles.txRecipient}>{tx.recipient_details?.name}</Text>
                                    <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.txAmount}>{tx.amount_received} CAD</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tx.status) }]}>
                                        <Text style={styles.statusText}>{tx.status}</Text>
                                    </View>
                                </View>
                            </View>

                            {tx.status === 'pending' && !tx.proof_url && (
                                <TouchableOpacity
                                    style={styles.uploadBtn}
                                    onPress={() => handleUploadProof(tx.id)}
                                >
                                    <Text style={styles.uploadBtnText}>Upload Proof</Text>
                                </TouchableOpacity>
                            )}
                            {tx.proof_url && (
                                <Text style={styles.proofNote}>✓ Receipt Uploaded</Text>
                            )}
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#1e293b',
    },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#818cf8' },
    verificationText: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
    logoutButton: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 6 },
    logoutText: { color: '#f8fafc', fontSize: 14 },
    card: {
        backgroundColor: '#1e293b',
        padding: 20,
        margin: 15,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginBottom: 20 },
    formGroup: { marginBottom: 15 },
    label: { color: '#94a3b8', fontSize: 14, marginBottom: 8 },
    input: {
        backgroundColor: '#0f172a',
        padding: 12,
        borderRadius: 8,
        color: '#f8fafc',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    pickerContainer: {
        backgroundColor: '#0f172a',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#334155',
        overflow: 'hidden'
    },
    picker: { color: '#f8fafc' },
    estimateBox: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
    },
    estimateLabel: { color: '#818cf8', fontWeight: '600', fontSize: 13 },
    estimateValue: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginVertical: 5 },
    rateDetail: { color: '#94a3b8', fontSize: 12 },
    button: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center' },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', color: '#64748b', padding: 20 },
    transactionItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
        paddingVertical: 15,
    },
    txMain: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    txRecipient: { color: '#f8fafc', fontWeight: '600', fontSize: 15 },
    txDate: { color: '#64748b', fontSize: 12, marginTop: 2 },
    txAmount: { color: '#10b981', fontWeight: 'bold', fontSize: 16 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 5 },
    statusText: { color: 'white', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
    uploadBtn: {
        borderWidth: 1,
        borderColor: '#6366f1',
        padding: 8,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 5,
    },
    uploadBtnText: { color: '#6366f1', fontWeight: 'bold', fontSize: 13 },
    proofNote: { color: '#10b981', fontSize: 12, textAlign: 'right', fontStyle: 'italic' }
});

export default DashboardScreen;
