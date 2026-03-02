import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

const Input = ({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, error, rightIcon, onRightIconPress, ...props }) => {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>}
            <View style={[
                styles.inputWrapper,
                {
                    backgroundColor: theme.input || (theme.isDark ? '#1f2937' : '#f3f4f6'),
                    borderColor: error ? '#ef4444' : theme.border || (theme.isDark ? '#374151' : '#e5e7eb'),
                }
            ]}>
                <TextInput
                    style={[
                        styles.input,
                        { color: theme.text }
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={theme.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize || 'none'}
                    {...props}
                />
                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
                        <Ionicons name={rightIcon} size={22} color={theme.textMuted} />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        height: 56,
        borderRadius: 16,
        borderWidth: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
    },
    rightIcon: {
        paddingHorizontal: 12,
        height: '100%',
        justifyContent: 'center',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        fontFamily: 'Outfit_400Regular',
        marginTop: 4,
        marginLeft: 4,
    },
});

export default Input;
