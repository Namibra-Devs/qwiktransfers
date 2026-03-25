import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const ConfirmationModal = ({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger', // 'danger', 'info', 'success'
    icon = 'alert-circle'
}) => {
    const theme = useTheme();

    const handleConfirm = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onConfirm();
    };

    const handleClose = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onClose();
    };

    const getTypeColor = () => {
        switch (type) {
            case 'danger': return '#ef4444';
            case 'success': return '#10b981';
            case 'info': return theme.primary;
            default: return theme.primary;
        }
    };

    const typeColor = getTypeColor();

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                
                <View style={[styles.content, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={[styles.iconContainer, { backgroundColor: `${typeColor}15` }]}>
                        <Ionicons name={icon} size={40} color={typeColor} />
                    </View>

                    <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                    <Text style={[styles.message, { color: theme.textMuted }]}>{message}</Text>

                    <View style={styles.actions}>
                        <TouchableOpacity 
                            style={[styles.button, styles.cancelButton, { borderColor: theme.border }]} 
                            onPress={handleClose}
                        >
                            <Text style={[styles.buttonText, { color: theme.textMuted }]}>{cancelText}</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.button, { backgroundColor: typeColor }]} 
                            onPress={handleConfirm}
                        >
                            <Text style={[styles.buttonText, { color: '#fff' }]}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontFamily: 'Outfit_700Bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontSize: 15,
        fontFamily: 'Outfit_400Regular',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    buttonText: {
        fontSize: 16,
        fontFamily: 'Outfit_700Bold',
    },
});

export default ConfirmationModal;
