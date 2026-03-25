import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator,
    Alert,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../services/api';
import * as DocumentPicker from 'expo-document-picker';
import Button from '../components/Button';

const ComplaintsScreen = ({ navigation }) => {
    const theme = useTheme();
    const { user } = useAuth();
    
    const [complaints, setComplaints] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    // New States
    const [editId, setEditId] = useState(null);
    const [viewAttachmentUrl, setViewAttachmentUrl] = useState(null);

    useEffect(() => {
        fetchComplaints();
        fetchTransactions();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/complaints');
            setComplaints(res.data.complaints);
        } catch (error) {
            Alert.alert('Error', 'Failed to load complaints');
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions?limit=50');
            setTransactions(res.data.transactions || []);
        } catch (error) {
            console.error('Failed to load transactions for dropdown', error);
        }
    };

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });
            
            if (result.canceled === false && result.assets && result.assets.length > 0) {
                setAttachment(result.assets[0]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick a document');
        }
    };

    const handleSubmit = async () => {
        if (!subject || !description) {
            return Alert.alert('Error', 'Subject and description are required');
        }

        setSubmitting(true);
        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('description', description);
        if (transactionId) formData.append('transaction_id', transactionId);
        
        if (attachment) {
            const localUri = attachment.uri;
            const filename = attachment.name || localUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;
            formData.append('attachment', { uri: localUri, name: filename, type: attachment.mimeType || type });
        }

        try {
            if (editId) {
                await api.patch(`/complaints/${editId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                Alert.alert('Success', 'Complaint updated successfully');
            } else {
                await api.post('/complaints', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                Alert.alert('Success', 'Complaint submitted successfully');
            }
            closeModal();
            fetchComplaints();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to submit complaint');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (complaint) => {
        setEditId(complaint.id);
        setSubject(complaint.subject);
        setDescription(complaint.description);
        setTransactionId(complaint.transaction_id ? complaint.transaction_id.toString() : '');
        setAttachment(null);
        setShowModal(true);
    };

    const handleCancelComplaint = (id) => {
        Alert.alert(
            'Cancel Complaint',
            'Are you sure you want to cancel this complaint?',
            [
                { text: 'No', style: 'cancel' },
                { 
                    text: 'Yes, Cancel', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/complaints/${id}`);
                            Alert.alert('Success', 'Complaint cancelled');
                            fetchComplaints();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cancel complaint');
                        }
                    }
                }
            ]
        );
    };

    const closeModal = () => {
        setShowModal(false);
        setEditId(null);
        setSubject('');
        setDescription('');
        setTransactionId('');
        setAttachment(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return '#10b981'; // green
            case 'closed': return '#6b7280'; // gray
            case 'open':
            default: return '#f59e0b'; // orange
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.subject, { color: theme.text }]}>{item.subject}</Text>
                    <Text style={[styles.date, { color: theme.textMuted }]}>
                        {new Date(item.createdAt).toLocaleDateString()}
                        {item.transaction ? ` • TX: ${item.transaction.transaction_id}` : ''}
                    </Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(item.status)}20`, borderColor: `${getStatusColor(item.status)}40` }
                ]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>
            
            <View style={[styles.descriptionContainer, { backgroundColor: theme.isDark ? '#2A2A2A' : '#f9fafb' }]}>
                <Text style={[styles.description, { color: theme.text }]}>{item.description}</Text>
            </View>

            {item.attachment_url && (
                <TouchableOpacity style={styles.attachmentContainer} onPress={() => setViewAttachmentUrl(item.attachment_url)}>
                    <Ionicons name="document-attach-outline" size={16} color={theme.primary} />
                    <Text style={[styles.attachmentText, { color: theme.primary }]}>View Attached File</Text>
                </TouchableOpacity>
            )}

            {item.admin_response ? (
                <View style={[styles.adminResponseContainer, { borderLeftColor: theme.primary }]}>
                    <Text style={[styles.adminResponseLabel, { color: theme.textMuted }]}>Admin Response</Text>
                    <Text style={[styles.adminResponse, { color: theme.text }]}>{item.admin_response}</Text>
                </View>
            ) : item.status === 'open' ? (
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12, gap: 10 }}>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={[styles.actionButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.actionButtonText, { color: theme.text }]}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleCancelComplaint(item.id)} style={[styles.actionButton, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}>
                        <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Support & Complaints</Text>
                <TouchableOpacity onPress={() => setShowModal(true)}>
                    <Ionicons name="add-circle" size={28} color={theme.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={[styles.center, { flex: 1 }]}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={complaints}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={[styles.center, { marginTop: 100 }]}>
                            <Ionicons name="chatbubbles-outline" size={64} color={theme.textMuted} style={{ opacity: 0.5 }} />
                            <Text style={[styles.emptyText, { color: theme.textMuted, marginTop: 16 }]}>No complaints found.</Text>
                            <Button 
                                label="Submit a Complaint" 
                                style={{ marginTop: 20, width: 200 }} 
                                onPress={() => setShowModal(true)} 
                            />
                        </View>
                    }
                />
            )}

            {/* New Complaint Modal */}
            <Modal
                visible={showModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={closeModal}
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={closeModal}>
                            <Text style={[styles.modalCancel, { color: theme.textMuted }]}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>{editId ? 'Edit Complaint' : 'New Complaint'}</Text>
                        <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
                            {submitting ? (
                                <ActivityIndicator size="small" color={theme.primary} />
                            ) : (
                                <Text style={[styles.modalSubmit, { color: theme.primary }]}>Submit</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={[styles.label, { color: theme.textMuted }]}>Subject</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
                            placeholder="Brief summary of the issue"
                            placeholderTextColor={theme.textMuted}
                            value={subject}
                            onChangeText={setSubject}
                        />

                        <Text style={[styles.label, { color: theme.textMuted }]}>Related Transaction (Optional)</Text>
                        {/* Currently we just use a numeric input or simple picker. A full Picker is imported separately but for simplicity using TextInput or basic UI. Let's use a native picker or custom UI. For now, assuming user types ID or we map it if we use @react-native-picker/picker. We'll use a simple text input for Transaction ID here since Expo Picker is external. */}
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
                            placeholder="Enter Transaction ID (Optional)"
                            placeholderTextColor={theme.textMuted}
                            value={transactionId}
                            onChangeText={setTransactionId}
                            keyboardType="numeric"
                        />

                        <Text style={[styles.label, { color: theme.textMuted }]}>Description</Text>
                        <TextInput
                            style={[styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
                            placeholder="Provide detailed information..."
                            placeholderTextColor={theme.textMuted}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                        />

                        <Text style={[styles.label, { color: theme.textMuted }]}>Attachment (Optional)</Text>
                        <TouchableOpacity 
                            style={[styles.uploadButton, { borderColor: theme.border, backgroundColor: theme.card }]} 
                            onPress={handlePickDocument}
                        >
                            <Ionicons name="cloud-upload-outline" size={24} color={theme.primary} />
                            <Text style={[styles.uploadText, { color: theme.text }]}>
                                {attachment ? attachment.name : 'Tap to upload a file/screenshot'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
            
            {/* ImageViewer Wrapper */}
            <Modal visible={!!viewAttachmentUrl} transparent={true} animationType="fade" onRequestClose={() => setViewAttachmentUrl(null)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }} onPress={() => setViewAttachmentUrl(null)}>
                        <Ionicons name="close-circle" size={36} color="#ffffff" />
                    </TouchableOpacity>
                    {viewAttachmentUrl && (
                        <Image 
                            source={{ uri: getImageUrl(viewAttachmentUrl) }} 
                            style={{ width: '90%', height: '70%', resizeMode: 'contain' }} 
                        />
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backButton: { paddingRight: 15 },
    headerTitle: { fontSize: 18, fontFamily: 'Outfit_600SemiBold' },
    listContainer: { padding: 16, gap: 16, paddingBottom: 40 },
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    subject: { fontSize: 16, fontFamily: 'Outfit_700Bold', marginBottom: 4 },
    date: { fontSize: 13, fontFamily: 'Outfit_400Regular' },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusText: { fontSize: 11, fontFamily: 'Outfit_700Bold', textTransform: 'uppercase' },
    descriptionContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    description: { fontSize: 14, fontFamily: 'Outfit_400Regular', lineHeight: 20 },
    attachmentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    attachmentText: { fontSize: 13, fontFamily: 'Outfit_600SemiBold' },
    adminResponseContainer: {
        marginTop: 8,
        borderLeftWidth: 3,
        paddingLeft: 12,
    },
    adminResponseLabel: { fontSize: 11, fontFamily: 'Outfit_700Bold', textTransform: 'uppercase', marginBottom: 4 },
    adminResponse: { fontSize: 14, fontFamily: 'Outfit_400Regular', lineHeight: 20 },
    emptyText: { fontSize: 16, fontFamily: 'Outfit_500Medium' },
    
    // Modal Styles
    modalContainer: { flex: 1 },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    modalCancel: { fontSize: 16, fontFamily: 'Outfit_500Medium' },
    modalTitle: { fontSize: 18, fontFamily: 'Outfit_700Bold' },
    modalSubmit: { fontSize: 16, fontFamily: 'Outfit_700Bold' },
    formContainer: { padding: 20, gap: 16 },
    label: { fontSize: 14, fontFamily: 'Outfit_600SemiBold', marginBottom: 8 },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        fontFamily: 'Outfit_400Regular',
    },
    textArea: {
        height: 120,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingTop: 16,
        fontSize: 15,
        fontFamily: 'Outfit_400Regular',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        borderWidth: 1,
        borderRadius: 12,
        borderStyle: 'dashed',
        gap: 12,
    },
    uploadText: { fontSize: 14, fontFamily: 'Outfit_500Medium' },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
    },
    actionButtonText: {
        fontSize: 12,
        fontFamily: 'Outfit_700Bold',
    },
});

export default ComplaintsScreen;
