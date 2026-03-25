import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ImageBackground,
    Image,
    Animated,
    Dimensions,
    TouchableOpacity
} from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticateAsync } from '../services/biometrics';
import Button from '../components/Button';
import Input from '../components/Input';

const { width, height } = Dimensions.get('window');

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

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loginWithBiometrics } = useAuth();
    const [loading, setLoading] = useState(false);
    const [rate, setRate] = useState(null);
    const [canUseBiometrics, setCanUseBiometrics] = useState(false);
    const theme = useTheme();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        fetchRate();
        checkBiometricAvailability();

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const checkBiometricAvailability = async () => {
        const bioEnabled = await AsyncStorage.getItem('biometricEnabled');
        const bioToken = await AsyncStorage.getItem('biometricToken');
        if (bioEnabled === 'true' && bioToken) {
            setCanUseBiometrics(true);
        }
    };

    const handleBiometricLogin = async () => {
        const result = await authenticateAsync('Sign in to QwikTransfers');
        if (result.success) {
            setLoading(true);
            const loggedIn = await loginWithBiometrics();
            setLoading(false);
            if (!loggedIn) {
                Alert.alert('Session Expired', 'Your session has expired. Please log in with your password again.');
            }
        }
    };

    const fetchRate = async () => {
        try {
            const response = await api.get('/rates');
            const rawRate = response.data.rate;
            const displayRate = rawRate < 1 ? (1 / rawRate) : rawRate;
            setRate(displayRate.toFixed(2));
        } catch (error) {
            console.log('Failed to fetch rate', error);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }
        setLoading(true);
        try {
            await login(email, password);
        } catch (error) {
            Alert.alert(
                'Access Denied',
                `Login failed. ${error.response?.data?.error || error.message}`
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../../assets/images/login_bg_premium.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <StatusBar barStyle="light-content" />
                <SafeAreaView style={styles.safeArea}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.flex}
                    >
                        <Animated.View 
                            style={[
                                styles.content, 
                                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                            ]}
                        >
                            {/* Floating Rate Badge */}
                            {rate && (
                                <GlassContainer intensity={30} tint="light" style={styles.rateBadge}>
                                    <View style={styles.rateInner}>
                                        <Ionicons name="trending-up" size={14} color="#fff" style={styles.rateIcon} />
                                        <Text style={styles.rateText}>
                                            1 CAD = <Text style={styles.rateHighlight}>{rate} GHS</Text>
                                        </Text>
                                    </View>
                                </GlassContainer>
                            )}

                            {/* Logo Section */}
                            <View style={styles.logoContainer}>
                                <Image 
                                    source={require('../../assets/logo-white.png')} 
                                    style={styles.logo} 
                                    resizeMode="contain"
                                />
                                <Text style={styles.brandSubtitle}>Fast. Secure. Worldwide.</Text>
                            </View>

                            {/* Login Card */}
                            <GlassContainer intensity={Platform.OS === 'ios' ? 40 : 80} tint="dark" style={styles.glassCard}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>Welcome Back</Text>
                                    <Text style={styles.cardSubtitle}>Sign in to your account</Text>
                                </View>

                                <View style={styles.form}>
                                    <View style={styles.inputContainer}>
                                        <Input
                                            placeholder="Email Address"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            containerStyle={styles.glassInput}
                                            placeholderTextColor="rgba(255,255,255,0.5)"
                                            style={{ color: '#fff' }}
                                        />
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Input
                                            placeholder="Password"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={true}
                                            containerStyle={styles.glassInput}
                                            placeholderTextColor="rgba(255,255,255,0.5)"
                                            style={{ color: '#fff' }}
                                        />
                                        <TouchableOpacity style={styles.forgotBtn}>
                                            <Text style={styles.forgotText}>Forgot?</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Button
                                        label="Login"
                                        onPress={handleLogin}
                                        loading={loading}
                                        style={styles.loginBtn}
                                        textStyle={styles.loginBtnText}
                                    />

                                    {canUseBiometrics && (
                                        <TouchableOpacity 
                                            style={styles.bioBtn} 
                                            onPress={handleBiometricLogin}
                                            disabled={loading}
                                        >
                                            <GlassContainer intensity={20} tint="light" style={styles.bioBlur}>
                                                <Ionicons name="finger-print" size={32} color="#fff" />
                                            </GlassContainer>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </GlassContainer>

                            {/* Footer */}
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Don't have an account?</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                    <Text style={styles.linkText}>Create Account</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    safeArea: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        alignItems: 'center',
    },
    rateBadge: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 30,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    rateInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rateIcon: {
        marginRight: 8,
    },
    rateText: {
        fontSize: 14,
        color: '#fff',
        fontFamily: 'Outfit_500Medium',
    },
    rateHighlight: {
        color: '#4ade80', // Soft green for the rate
        fontFamily: 'Outfit_700Bold',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 220,
        height: 60,
    },
    brandSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        marginTop: 8,
        letterSpacing: 2,
    },
    glassCard: {
        width: '100%',
        borderRadius: 32,
        padding: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    cardHeader: {
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 32,
        color: '#fff',
        fontFamily: 'Outfit_700Bold',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        fontFamily: 'Outfit_400Regular',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    glassInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 0,
    },
    forgotBtn: {
        position: 'absolute',
        right: 16,
        top: 18,
    },
    forgotText: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'Outfit_600SemiBold',
        opacity: 0.7,
    },
    loginBtn: {
        backgroundColor: '#fff',
        height: 60,
        borderRadius: 20,
        marginTop: 10,
    },
    loginBtnText: {
        color: '#1a1a1a',
        fontSize: 18,
        fontFamily: 'Outfit_700Bold',
    },
    bioBtn: {
        alignSelf: 'center',
        marginTop: 20,
    },
    bioBlur: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    footer: {
        flexDirection: 'row',
        marginTop: 40,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
    },
    linkText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Outfit_700Bold',
        marginLeft: 8,
    },
});

export default LoginScreen;
