import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    TextInput,
    StatusBar
} from 'react-native';
import { errorToast, successToast } from '../utils/toast';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import DocTypePicker from '../components/DocTypePicker';
import Ionicons from '@expo/vector-icons/Ionicons';

const KYCScreen = ({ navigation }) => {
    const { user, refreshProfile, setIsPickingFile } = useAuth();
    const theme = useTheme();
    const [docType, setDocType] = useState('passport'); // Default to passport as it is universal
    const [docId, setDocId] = useState('');
    const [frontImage, setFrontImage] = useState(null);
    const [backImage, setBackImage] = useState(null);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.country === 'Ghana') {
            setDocType('ghana_card');
        } else if (user?.country === 'Canada') {
            setDocType('government_id');
        }
    }, [user?.country]);

    const pickImage = async (side) => {
        try {
            setIsPickingFile(true);
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                errorToast('Permission Denied', 'We need access to your gallery to upload documents.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.7,
            });

            if (!result.canceled) {
                if (side === 'front') setFrontImage(result.assets[0].uri);
                else setBackImage(result.assets[0].uri);
            }
        } finally {
            setTimeout(() => {
                setIsPickingFile(false);
            }, 1000);
        }
    };

    const handleSubmit = async () => {
        if (!docId || !frontImage || !backImage) {
            errorToast('Missing Information', 'Please provide your ID number and both front and back photos.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('documentType', docType);
            formData.append('documentId', docId);

            const appendFile = (uri, field) => {
                const filename = uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                formData.append(field, {
                    uri,
                    name: filename,
                    type
                });
            };

            appendFile(frontImage, 'front');
            appendFile(backImage, 'back');

            await api.post('/auth/kyc', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            successToast('Success', 'KYC documents submitted for verification!');
            if (refreshProfile) await refreshProfile();
        } catch (error) {
            console.error(error);
            errorToast('Upload Failed', error.response?.data?.error || 'Something went wrong. Please check your network connection.');
        } finally {
            setLoading(false);
        }
    };

    if (user?.kyc_status === 'pending') {
        return (
            <SafeAreaView style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <Ionicons name="time-outline" size={80} color={theme.primary} />
                <Text style={[styles.statusTitle, { color: theme.text }]}>Verification Pending</Text>
                <Text style={[styles.statusDesc, { color: theme.textMuted }]}>
                    Our team is currently reviewing your documents. You'll receive a notification once approved.
                </Text>
            </SafeAreaView>
        );
    }

    if (user?.kyc_status === 'verified') {
        return (
            <SafeAreaView style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <Ionicons name="checkmark-circle" size={80} color="#10b981" />
                <Text style={[styles.statusTitle, { color: theme.text }]}>Account Verified</Text>
                <Text style={[styles.statusDesc, { color: theme.textMuted }]}>
                    Your identity has been verified. You can now enjoy higher transaction limits.
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
            
            {/* Standardized Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>ID Verification</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.introSection}>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                        Increase your sending limits and secure your account by verifying your identity.
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.label, { color: theme.textMuted }]}>Document Type</Text>
                    <TouchableOpacity
                        style={[styles.pickerTrigger, { backgroundColor: theme.background, borderColor: theme.border }]}
                        onPress={() => setPickerVisible(true)}
                    >
                        <Text style={[styles.pickerText, { color: theme.text }]}>
                            {docType === 'ghana_card' ? 'Ghana Card / Voter ID' : 
                             docType === 'passport' ? 'Passport' : 
                             docType === 'drivers_license' ? "Driver's License" : 
                             docType === 'government_id' ? 'Government Issued ID' : 'Select Document'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={theme.textMuted} />
                    </TouchableOpacity>

                    <DocTypePicker
                        visible={pickerVisible}
                        onClose={() => setPickerVisible(false)}
                        onSelect={(v) => setDocType(v)}
                        selectedValue={docType}
                        country={user?.country}
                    />

                    <Text style={[styles.label, { color: theme.textMuted }]}>ID Number</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                        placeholder="Enter ID Number"
                        placeholderTextColor={theme.textMuted}
                        value={docId}
                        onChangeText={setDocId}
                    />

                    <Text style={[styles.label, { color: theme.textMuted, marginBottom: 16 }]}>Document Photos</Text>
                    <View style={styles.uploadRow}>
                        <TouchableOpacity
                            style={[styles.uploadBox, { backgroundColor: theme.background, borderColor: theme.border }]}
                            onPress={() => pickImage('front')}
                            activeOpacity={0.7}
                        >
                            {frontImage ? (
                                <Image source={{ uri: frontImage }} style={styles.preview} />
                            ) : (
                                <View style={styles.uploadPlaceholder}>
                                    <Ionicons name="camera-outline" size={24} color={theme.textMuted} />
                                    <Text style={[styles.uploadText, { color: theme.textMuted }]}>Front Side</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.uploadBox, { backgroundColor: theme.background, borderColor: theme.border }]}
                            onPress={() => pickImage('back')}
                            activeOpacity={0.7}
                        >
                            {backImage ? (
                                <Image source={{ uri: backImage }} style={styles.preview} />
                            ) : (
                                <View style={styles.uploadPlaceholder}>
                                    <Ionicons name="camera-outline" size={24} color={theme.textMuted} />
                                    <Text style={[styles.uploadText, { color: theme.textMuted }]}>Back Side</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: theme.primary }, loading ? styles.disabledButton : null]}
                        onPress={handleSubmit}
                        disabled={loading === true}
                    >
                        {loading === true ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitText}>Submit for Verification</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={theme.textMuted} style={{ marginRight: 10 }} />
                    <Text style={[styles.infoText, { color: theme.textMuted }]}>
                        Make sure the photos are clear, well-lit, and all details are readable.
                    </Text>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        height: 60,
    },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 18, fontFamily: 'Outfit_700Bold' },
    introSection: { paddingHorizontal: 20, marginBottom: 20 },
    subtitle: {
        fontSize: 15,
        fontFamily: 'Outfit_400Regular',
        lineHeight: 22
    },
    card: {
        marginHorizontal: 20,
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
    },
    label: {
        fontSize: 13,
        fontFamily: 'Outfit_600SemiBold',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    pickerTrigger: {
        height: 55,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    pickerText: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
    },
    input: {
        height: 55,
        paddingHorizontal: 16,
        borderRadius: 12,
        fontSize: 16,
        marginBottom: 20,
        borderWidth: 1,
        fontFamily: 'Outfit_400Regular',
    },
    uploadRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
    uploadBox: {
        flex: 1,
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        overflow: 'hidden'
    },
    uploadPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    uploadText: { fontSize: 12, fontFamily: 'Outfit_600SemiBold', marginTop: 4 },
    preview: { width: '100%', height: '100%' },
    submitButton: {
        height: 58,
        borderRadius: 29,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    disabledButton: { opacity: 0.6 },
    submitText: { color: '#fff', fontSize: 16, fontFamily: 'Outfit_700Bold' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    statusTitle: {
        fontSize: 24,
        fontFamily: 'Outfit_700Bold',
        textAlign: 'center',
        marginTop: 20
    },
    statusDesc: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 24
    },
    infoBox: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginTop: 20,
        alignItems: 'center'
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        fontFamily: 'Outfit_400Regular',
    }
});

export default KYCScreen;
