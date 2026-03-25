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
    Dimensions,
    ImageBackground,
    StatusBar
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authenticateAsync } from '../services/biometrics';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Resilient Glassmorphism fallback
const GlassContainer = ({ intensity, tint, style, children }) => {
    return (
        <View style={[
            style, 
            { 
                backgroundColor: tint === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.1)',
                overflow: 'hidden' 
            }
        ]}>
            <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
            {children}
        </View>
    );
};

const AppLock = () => {
    const { user, isAppLocked, setIsAppLocked, verifyAppPin, isPickingFile } = useAuth();
    const theme = useTheme();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const appState = useRef(AppState.currentState);
    const isAuthenticating = useRef(false);
    const pickingRef = useRef(isPickingFile);

    // Sync ref with state
    useEffect(() => {
        pickingRef.current = isPickingFile;
    }, [isPickingFile]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/active/) &&
                nextAppState.match(/inactive|background/)
            ) {
                console.log(`[AppLock] Transition to ${nextAppState}. Picking: ${pickingRef.current}`);
                if (user && !isAuthenticating.current && !pickingRef.current) {
                    console.log('[AppLock] Locking App');
                    setIsAppLocked(true);
                }
            }
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                if (user && isAppLocked && !isAuthenticating.current) {
                   attemptBiometricUnlock();
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [user, isAppLocked, setIsAppLocked]);

    useEffect(() => {
        if (isAppLocked && user && !isAuthenticating.current) {
            attemptBiometricUnlock();
        }
    }, [isAppLocked, user]);

    const attemptBiometricUnlock = async () => {
        if (isAuthenticating.current) return;
        
        const bioEnabled = await AsyncStorage.getItem('biometricEnabled');
        if (bioEnabled === 'true') {
            isAuthenticating.current = true;
            try {
                const result = await authenticateAsync('Unlock QwikTransfers');
                if (result.success) {
                    setIsAppLocked(false);
                    setPin('');
                    setError('');
                }
            } finally {
                // Wait briefly before resetting to allow AppState to settle back to 'active'
                setTimeout(() => {
                    isAuthenticating.current = false;
                }, 500);
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
            <ImageBackground
                source={require('../../assets/images/login_bg_premium.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <StatusBar barStyle="light-content" />
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <Ionicons name="lock-closed" size={48} color="#fff" />
                            <Text style={styles.title}>Welcome Back</Text>
                            <Text style={styles.subtitle}>Enter PIN to unlock your vault</Text>
                        </View>

                        <GlassContainer intensity={Platform.OS === 'ios' ? 40 : 80} tint="dark" style={styles.glassCard}>
                            <View style={styles.pinContainer}>
                                {[1, 2, 3, 4].map((i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.pinDot,
                                            pin.length >= i && { backgroundColor: '#fff', borderColor: '#fff' }
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
                                        style={styles.key}
                                        onPress={() => handlePress(num.toString())}
                                    >
                                        <Text style={styles.keyText}>{num}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={styles.key}
                                    onPress={attemptBiometricUnlock}
                                >
                                    <Ionicons name="finger-print" size={32} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.key}
                                    onPress={() => handlePress('0')}
                                >
                                    <Text style={styles.keyText}>0</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.key}
                                    onPress={handleDelete}
                                >
                                    <Ionicons name="backspace-outline" size={28} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </GlassContainer>

                        {loading && (
                            <View style={styles.loadingOverlay}>
                                <Text style={styles.loadingText}>Verifying secure vault...</Text>
                            </View>
                        )}
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontFamily: 'Outfit_700Bold',
        color: '#fff',
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: 'rgba(255,255,255,0.6)',
    },
    glassCard: {
        width: '100%',
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    pinContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 24,
    },
    pinDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    errorContainer: {
        height: 24,
        marginBottom: 20,
    },
    errorText: {
        color: '#ff4b4b',
        fontFamily: 'Outfit_500Medium',
        fontSize: 14,
    },
    keypad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        justifyContent: 'center',
        gap: 20,
    },
    key: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    keyText: {
        fontSize: 28,
        fontFamily: 'Outfit_600SemiBold',
        color: '#fff',
    },
    loadingOverlay: {
        marginTop: 40,
    },
    loadingText: {
        color: 'rgba(255,255,255,0.6)',
        fontFamily: 'Outfit_500Medium',
        fontSize: 14,
    }
});

export default AppLock;
