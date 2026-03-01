import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Input = ({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, error, ...props }) => {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: theme.input || (theme.isDark ? '#1f2937' : '#f3f4f6'),
                        borderColor: error ? '#ef4444' : theme.border || (theme.isDark ? '#374151' : '#e5e7eb'),
                        color: theme.text
                    }
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
    input: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1.5,
        fontFamily: 'Outfit_400Regular',
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
