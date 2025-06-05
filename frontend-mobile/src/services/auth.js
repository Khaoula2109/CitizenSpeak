import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorService from './error';

class AuthService {
    async register(name, email, phone, password) {
        try {
            console.log('🔐 Attempting registration for:', email);

            const response = await API.post('/auth/signup', {
                name,
                email,
                phone,
                password,
                role: "citizen",
            });

            console.log('✅ Registration successful');
            return response.data;
        } catch (error) {
            console.error('❌ Registration failed:', error);
            ErrorService.logError(error, { action: 'register', email });
            throw ErrorService.parseApiError(error);
        }
    }

    async login(email, password) {
        try {
            console.log('🔐 Attempting login for:', email);

            const response = await API.post('/auth/mobile-login', {
                email,
                password
            });

            if (response.data.token) {
                await AsyncStorage.setItem('auth_token', response.data.token);

                const userData = {
                    id: response.data.user.id,
                    name: response.data.user.name,
                    email: response.data.user.email,
                    phone: response.data.user.phone,
                    role: response.data.user.role
                };

                await AsyncStorage.setItem('user_data', JSON.stringify(userData));
                console.log('✅ Login successful, tokens stored');
            }

            return response.data;
        } catch (error) {
            console.error('❌ Login failed:', error);
            ErrorService.logError(error, { action: 'login', email });

            if (error.response?.status === 401) {
                const message = error.response.data?.message || 'Identifiants invalides';
                throw new Error(message);
            }

            throw ErrorService.parseApiError(error);
        }
    }

    async logout() {
        try {
            console.log('🔐 Logging out user');
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('user_data');
            console.log('✅ Logout successful');
            return { success: true };
        } catch (error) {
            console.error('❌ Logout failed:', error);
            throw new Error('Erreur lors de la déconnexion');
        }
    }

    async isAuthenticated() {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            return !!token;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    }

    async getCurrentUser() {
        try {
            const userData = await AsyncStorage.getItem('user_data');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    async forgotPassword(email) {
        try {
            console.log('🔐 Requesting password reset for:', email);

            const response = await API.post('/password/forgot', { email });

            console.log('✅ Password reset email sent');
            return response.data;
        } catch (error) {
            console.error('❌ Password reset request failed:', error);
            ErrorService.logError(error, { action: 'forgotPassword', email });
            throw ErrorService.parseApiError(error);
        }
    }

    async resetPassword(token, newPassword) {
        try {
            console.log('🔐 Resetting password with token');

            const response = await API.post('/password/reset', {
                token,
                newPassword
            });

            console.log('✅ Password reset successful');
            return response.data;
        } catch (error) {
            console.error('❌ Password reset failed:', error);
            ErrorService.logError(error, { action: 'resetPassword' });
            throw ErrorService.parseApiError(error);
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            console.log('🔐 Changing password for authenticated user');

            const response = await API.post('/password/change', {
                currentPassword,
                newPassword
            });

            console.log('✅ Password changed successfully');
            return response.data;
        } catch (error) {
            console.error('❌ Password change failed:', error);
            ErrorService.logError(error, { action: 'changePassword' });

            if (error.response?.status === 401) {
                throw new Error('Mot de passe actuel incorrect');
            }

            throw ErrorService.parseApiError(error);
        }
    }
}

export default new AuthService();