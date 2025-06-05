import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import SettingsService from '../services/settings';
import { lightTheme, darkTheme } from '../themes/themes';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const deviceTheme = useColorScheme();
    const [isDark, setIsDark] = useState(false);
    const [theme, setTheme] = useState(lightTheme);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            setIsLoading(true);

            const isDarkMode = await SettingsService.getThemePreference();

            if (isDarkMode === null) {
                const systemDark = deviceTheme === 'dark';
                setIsDark(systemDark);
                setTheme(systemDark ? darkTheme : lightTheme);
            } else {
                setIsDark(isDarkMode);
                setTheme(isDarkMode ? darkTheme : lightTheme);
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
            setIsDark(false);
            setTheme(lightTheme);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTheme = async () => {
        try {
            const newIsDark = !isDark;
            setIsDark(newIsDark);
            setTheme(newIsDark ? darkTheme : lightTheme);

            await SettingsService.saveThemePreference(newIsDark);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                isDark,
                isLoading,
                toggleTheme
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};