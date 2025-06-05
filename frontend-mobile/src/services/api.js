import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const API_BASE_URL = process.env.API_URL;

console.log('✅ API configured with working server:', API_BASE_URL);

const API = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

API.testConnection = async () => {
    try {
        console.log('🔍 Testing server connection...');
        const response = await API.get('/test');
        console.log('✅ Server connection confirmed:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        return { success: false, error: error.message };
    }
};

API.interceptors.request.use(
    async (config) => {
        console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

API.interceptors.response.use(
    (response) => {
        console.log(`✅ ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        const { response, request, config } = error;

        console.log('❌ Response interceptor - Error details:', {
            hasResponse: !!response,
            hasRequest: !!request,
            url: config?.url,
            method: config?.method
        });

        if (response) {
            const { status, data } = response;

            console.log(`❌ ${status} ${config?.url}:`, data);

            switch (status) {
                case 401:
                    console.warn('🔑 Authentication failed - clearing tokens');
                    await AsyncStorage.removeItem('auth_token');
                    await AsyncStorage.removeItem('user_data');

                    const authMessage = data?.message || 'Identifiants invalides';
                    Alert.alert('Erreur d\'authentification', authMessage, [
                        { text: 'OK', style: 'default' }
                    ]);
                    break;

                case 403:
                    const forbiddenMessage = data?.message || 'Accès refusé';
                    Alert.alert('Accès refusé', forbiddenMessage, [
                        { text: 'OK', style: 'default' }
                    ]);
                    break;

                case 404:
                    const notFoundMessage = data?.message || 'Ressource non trouvée';
                    console.warn('🔍 Resource not found:', notFoundMessage);
                    break;

                case 409:
                    const conflictMessage = data?.message || 'Conflit de données';
                    Alert.alert('Erreur', conflictMessage, [
                        { text: 'OK', style: 'default' }
                    ]);
                    break;

                case 500:
                    const serverMessage = data?.message || 'Erreur serveur interne';
                    Alert.alert('Erreur serveur', serverMessage, [
                        { text: 'OK', style: 'default' }
                    ]);
                    break;

                default:
                    const genericMessage = data?.message || `Erreur ${status}`;
                    console.error(`Unhandled error ${status}:`, genericMessage);
                    break;
            }

            error.response.data = {
                ...data,
                userMessage: data?.message || `Erreur ${status}`
            };

        } else if (request) {
            console.error('❌ Network error - no response received');
            Alert.alert(
                'Erreur réseau',
                'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
                [{ text: 'OK', style: 'default' }]
            );
        } else {
            console.error('❌ Request setup error:', error.message);
            Alert.alert(
                'Erreur application',
                'Une erreur inattendue s\'est produite.',
                [{ text: 'OK', style: 'default' }]
            );
        }

        return Promise.reject(error);
    }
);

export default API;