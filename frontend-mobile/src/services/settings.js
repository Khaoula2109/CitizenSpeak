import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SettingsService {
    async saveThemePreference(isDarkMode) {
        try {
            await AsyncStorage.setItem('user_theme', isDarkMode ? 'dark' : 'light');

            const token = await AsyncStorage.getItem('auth_token');
            if (token) {
                await API.put('/settings/theme', { darkMode: isDarkMode });
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to save theme preference:', error);
            throw error;
        }
    }

    async getThemePreference() {
        try {
            const theme = await AsyncStorage.getItem('user_theme');
            return theme === 'dark';
        } catch (error) {
            console.error('Failed to get theme preference:', error);
            return false;
        }
    }
}

export default new SettingsService();