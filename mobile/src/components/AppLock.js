import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    AppState,
    Modal,
    SafeAreaView,
    Platform,
    Dimensions
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authenticateAsync } from '../services/biometrics';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const AppLock = () => {
    const { user, isAppLocked, setIsAppLocked, verifyAppPin } = useAuth();
    const theme = useTheme();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/active/) &&
                nextAppState.match(/inactive|background/)
            ) {
                // App went to background
                if (user) {
                    setIsAppLocked(true);
                }
            }
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App came to foreground
                if (user) {
                   attemptBiometricUnlock();
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [user, setIsAppLocked]);

    useEffect(() => {
        if (isAppLocked && user) {
            attemptBiometricUnlock();
        }
    }, [isAppLocked, user]);

    const attemptBiometricUnlock = async () => {
        const bioEnabled = await AsyncStorage.getItem('biometricEnabled');
        if (bioEnabled === 'true') {
            const result = await authenticateAsync('Unlock QwikTransfers');
            if (result.success) {
                setIsAppLocked(false);
                setPin('');
                setError('');
            }
        }
    };

    const handlePress = (num) => {
        if (loading) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (pin.length < 4) {
            const newPin = pin + num;
            setPin(newPin);
            if (newPin.length === 4) {
                handleVerify(newPin);
            }
        }
    };

    const handleDelete = () => {
        if (loading) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPin(pin.slice(0, -1));
        setError('');
    };

    const handleVerify = async (fullPin) => {
        setLoading(true);
        const result = await verifyAppPin(fullPin);
        if (result.success) {
            setIsAppLocked(false);
            setPin('');
            setError('');
        } else {
            setPin('');
            setError(result.error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        setLoading(false);
    };

    if (!isAppLocked || !user) return null;

    return (
        <Modal visible={true} animationType="fade" transparent={false}>
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <Ionicons name="lock-closed" size={50} color={theme.primary} />
                    <Text style={[styles.title, { color: theme.text }]}>App Locked</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                        Enter your PIN to continue
                    </Text>
                </View>

                <View style={styles.pinContainer}>
                    {[1, 2, 3, 4].map((i) => (
                        <View
                            key={i}
                            style={[
                                styles.pinDot,
                                { borderColor: theme.border },
                                pin.length >= i && { backgroundColor: theme.primary, borderColor: theme.primary }
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.errorContainer}>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>

                <View style={styles.keypad}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <TouchableOpacity
                            key={num}
                            style={[styles.key, { backgroundColor: theme.isDark ? '#2a2a2a' : '#f3f4f6' }]}
                            onPress={() => handlePress(num.toString())}
                        >
                            <Text style={[styles.keyText, { color: theme.text }]}>{num}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={[styles.key, { backgroundColor: 'transparent' }]}
                        onPress={attemptBiometricUnlock}
                    >
                        <Ionicons name="finger-print" size={36} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.key, { backgroundColor: theme.isDark ? '#2a2a2a' : '#f3f4f6' }]}
                        onPress={() => handlePress('0')}
                    >
                        <Text style={[styles.keyText, { color: theme.text }]}>0</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.key, { backgroundColor: 'transparent' }]}
                        onPress={handleDelete}
                    >
                        <Ionicons name="backspace-outline" size={32} color={theme.text} />
                    </TouchableOpacity>
                </View>

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <Text style={{ color: theme.textMuted, fontFamily: 'Outfit_500Medium' }}>Verifying...</Text>
                    </View>
                )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Outfit_700Bold',
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
    },
    pinContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        gap: 20,
    },
    pinDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
    },
    errorContainer: {
        height: 40,
        justifyContent: 'center',
    },
    errorText: {
        color: '#ef4444',
        fontFamily: 'Outfit_500Medium',
        fontSize: 14,
    },
    keypad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: width * 0.85,
        justifyContent: 'center',
        gap: 20,
        marginTop: 20,
    },
    key: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyText: {
        fontSize: 32,
        fontFamily: 'Outfit_600SemiBold',
    },
    loadingOverlay: {
        marginTop: 20,
    }
});

export default AppLock;
