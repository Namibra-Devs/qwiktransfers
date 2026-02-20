import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme !== null) {
            setIsDark(savedTheme === 'dark');
        }
    };

    const toggleTheme = async () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };

    const theme = {
        background: isDark ? '#1C1917' : '#FDFBF7', // Cream-ish for light, Warm Black for dark
        card: isDark ? '#292524' : '#FFFFFF',
        text: isDark ? '#F5F5F4' : '#1C1917', // Stone-900 / Stone-100
        textMuted: isDark ? '#A8A29E' : '#78716C', // Stone-400 / Stone-500
        primary: '#DC2626', // Red-600 (Vibrant Red)
        border: isDark ? '#44403C' : '#E7E5E4', // Stone-700 / Stone-200
        input: isDark ? '#1C1917' : '#F5F5F4', // Match background/card logic
        isDark,
        toggleTheme
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
