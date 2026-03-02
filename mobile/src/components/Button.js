import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const Button = ({ onPress, style, textStyle, label, loading, disabled, variant = 'primary', icon, ...props }) => {
    const theme = useTheme();

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onPress) onPress();
    };

    const getVariantStyle = () => {
        switch (variant) {
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderColor: theme.primary,
                };
            case 'danger':
                return {
                    backgroundColor: '#fee2e2',
                    borderWidth: 0,
                };
            case 'primary':
            default:
                return {
                    backgroundColor: theme.primary,
                    borderWidth: 0,
                };
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'outline':
                return { color: theme.primary };
            case 'danger':
                return { color: '#dc2626' };
            case 'primary':
            default:
                return { color: '#fff' };
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getVariantStyle(),
                style,
                (disabled || loading) && styles.disabled
            ]}
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={getTextStyle().color} />
            ) : (
                <>
                    {icon && <Ionicons name={icon} size={20} color={getTextStyle().color} style={{ marginRight: 8 }} />}
                    <Text style={[styles.text, getTextStyle(), textStyle]}>{label}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    disabled: {
        opacity: 0.7,
    },
    text: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Outfit_700Bold',
        color: '#fff',
    }
});

export default Button;
