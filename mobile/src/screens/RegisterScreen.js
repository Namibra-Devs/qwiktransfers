import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import Button from '../components/Button';
import Input from '../components/Input';

const RegisterScreen = ({ navigation }) => {
    const theme = useTheme();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleNext = () => {
        if (step === 1 && (!firstName.trim() || !lastName.trim())) {
            Alert.alert('Required', 'Please enter your first and last name.');
            return;
        }
        if (step === 2 && !email.trim().includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            navigation.goBack();
        }
    };

    const handleRegister = async () => {
        if (password.length < 8) {
            Alert.alert('Weak Password', 'Password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        try {
            await register({
                email,
                password,
                full_name: `${firstName} ${lastName}`,
                // phone: '' // Phone can be added in a future step or optional
            });
        } catch (error) {
            Alert.alert('Registration Failed', error.message || 'Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <View style={styles.stepContainer}>
                        <Input
                            label="First Name"
                            placeholder="First Name"
                            value={firstName}
                            onChangeText={setFirstName}
                            autoFocus
                        />
                        <Input
                            label="Last Name"
                            placeholder="Last Name"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>
                );
            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <Input
                            label="Email"
                            placeholder="Email address"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoFocus
                        />
                    </View>
                );
            case 3:
                return (
                    <View style={styles.stepContainer}>
                        <Input
                            label="Password"
                            placeholder="Minimum 8 characters"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoFocus
                        // This part handles the eye icon - we could also update Input to support right icon
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: 16, top: 44 }}
                        >
                            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color={theme.textMuted} />
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null;
        }
    };

    const getHeaderTitle = () => {
        if (step === 1) return "Could you tell us your name?";
        if (step === 2) return "What is your email?";
        if (step === 3) return "Create a password";
        return "Create Account";
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                {/* Progress Bar (Optional) */}
                <View style={[styles.progressBarInfo]}>
                    <View style={[styles.progressValues, { width: `${(step / 3) * 100}%`, backgroundColor: theme.primary }]} />
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={[styles.title, { color: theme.text }]}>
                        {getHeaderTitle()}
                    </Text>

                    {renderStep()}

                    <Button
                        title={step === 3 ? 'Create Account' : 'Continue'}
                        onPress={step === 3 ? handleRegister : handleNext}
                        loading={loading}
                        style={{ marginTop: 20 }}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
        height: 50,
    },
    backBtn: {
        padding: 5,
        marginRight: 20
    },
    progressBarInfo: {
        flex: 1,
        height: 4,
        backgroundColor: '#e2e8f0', // Light grey background for bar
        borderRadius: 2,
        overflow: 'hidden',
        marginRight: 20
    },
    progressValues: {
        height: '100%',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 30,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Outfit_700Bold',
        marginBottom: 30,
    },
    stepContainer: {
        marginBottom: 30,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
        marginBottom: 8,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        height: '100%',
    },
    button: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Outfit_700Bold',
    }
});

export default RegisterScreen;
