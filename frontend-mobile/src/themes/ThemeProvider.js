import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './themes';

export const ThemeContext = createContext({
    theme: lightTheme,
    isDark: false,
    toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
    const deviceColorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme_preference');

            if (savedTheme !== null) {
                setIsDark(savedTheme === 'dark');
            } else {
                setIsDark(deviceColorScheme === 'dark');
            }
        } catch (error) {
            console.error('Failed to load theme preference', error);
            setIsDark(deviceColorScheme === 'dark');
        }
    };

    const saveThemePreference = async (isDarkMode) => {
        try {
            await AsyncStorage.setItem('theme_preference', isDarkMode ? 'dark' : 'light');
        } catch (error) {
            console.error('Failed to save theme preference', error);
        }
    };

    const toggleTheme = () => {
        setIsDark((prevIsDark) => {
            const newValue = !prevIsDark;
            saveThemePreference(newValue);
            return newValue;
        });
    };

    const setTheme = (darkMode) => {
        setIsDark(darkMode);
        saveThemePreference(darkMode);
    };

    const theme = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};