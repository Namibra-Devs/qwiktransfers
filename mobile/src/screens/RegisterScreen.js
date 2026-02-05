import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await register(email, password);
        } catch (error) {
            Alert.alert('Error', 'Registration failed. Try a different email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.title}>QWIK<Text style={{ color: '#fff' }}>TRANSFERS</Text></Text>
                <Text style={styles.subtitle}>Get started with your first transfer.</Text>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="name@example.com"
                            placeholderTextColor="#64748b"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Minimum 6 characters"
                            placeholderTextColor="#64748b"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && { opacity: 0.7 }]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Login instead</Text></Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#818cf8',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        color: '#94a3b8',
        marginBottom: 40,
    },
    form: {
        backgroundColor: '#1e293b',
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#94a3b8',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#0f172a',
        padding: 14,
        borderRadius: 10,
        color: '#f8fafc',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    button: {
        backgroundColor: '#6366f1',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    link: {
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 30,
        fontSize: 14,
    },
    linkBold: {
        color: '#818cf8',
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
