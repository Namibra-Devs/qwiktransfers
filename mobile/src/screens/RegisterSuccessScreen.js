import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/Button';
import Ionicons from '@expo/vector-icons/Ionicons';

const RegisterSuccessScreen = ({ navigation, route }) => {
    const theme = useTheme();
    const email = route.params?.email || 'your email address';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                    <Ionicons name="party-popper" size={80} color={theme.primary} />
                </View>

                <Text style={[styles.title, { color: theme.text }]}>Congratulations!</Text>

                <Text style={[styles.message, { color: theme.textMuted }]}>
                    Your account has been created successfully. We've sent a verification email to:
                </Text>

                <Text style={[styles.email, { color: theme.primary }]}>{email}</Text>

                <View style={[styles.infoCard, { backgroundColor: theme.isDark ? '#1f2937' : '#f8fafc', borderColor: theme.border }]}>
                    <Text style={[styles.infoText, { color: theme.textMuted }]}>
                        <Text style={{ color: '#ef4444', fontFamily: 'Outfit_700Bold' }}>Note:</Text> The verification link will expire in <Text style={{ fontFamily: 'Outfit_700Bold', color: theme.text }}>24 hours</Text>. Please verify your account soon to enjoy all Qwiktransfers benefits.
                    </Text>
                </View>

                <Button
                    label="Go to Login"
                    onPress={() => navigation.navigate('Login')}
                    style={{ width: '100%', marginTop: 20 }}
                />

                <Text style={[styles.footerText, { color: theme.textMuted }]}>
                    Didn't receive an email? Check your spam folder or contact support.
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    iconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontFamily: 'Outfit_700Bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 10,
    },
    email: {
        fontSize: 18,
        fontFamily: 'Outfit_700Bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    infoCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 30,
    },
    infoText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        textAlign: 'center',
        lineHeight: 20,
    },
    footerText: {
        fontSize: 13,
        fontFamily: 'Outfit_400Regular',
        marginTop: 24,
        textAlign: 'center',
    }
});

export default RegisterSuccessScreen;
