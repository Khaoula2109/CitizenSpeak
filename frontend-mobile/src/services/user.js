import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorService from './error';
import { Platform } from 'react-native';

class UserService {
    async getProfile() {
        try {
            const userData = await AsyncStorage.getItem('user_data');
            if (!userData) {
                throw new Error('No user data found');
            }
            const { email } = JSON.parse(userData);

            const response = await API.get(`/user/profile?email=${encodeURIComponent(email)}`);
            return response.data;
        } catch (error) {
            console.error('Error in getProfile:', error);
            throw ErrorService.parseApiError(error);
        }
    }

    async updateProfile(userData) {
        try {
            const response = await API.put('/user/update-name', {
                email: userData.email,
                name: userData.name,
                phone: userData.phone,
            });

            if (response.data) {
                const currentUserData = await AsyncStorage.getItem('user_data');
                if (currentUserData) {
                    const parsedData = JSON.parse(currentUserData);
                    const updatedData = { ...parsedData, ...userData };
                    await AsyncStorage.setItem('user_data', JSON.stringify(updatedData));
                }
            }

            return response.data;
        } catch (error) {
            console.error('Error in updateProfile:', error);
            throw ErrorService.parseApiError(error);
        }
    }

    async updateProfilePhoto(imageFile) {
        try {
            const formData = new FormData();

            const fileUri = Platform.OS === 'ios' ? imageFile.uri.replace('file://', '') : imageFile.uri;
            const fileType = imageFile.type || 'image/jpeg';
            const fileName = imageFile.name || `profile_${Date.now()}.jpg`;

            formData.append('photo', {
                uri: fileUri,
                type: fileType,
                name: fileName,
            });

            const userData = await AsyncStorage.getItem('user_data');
            if (!userData) {
                throw new Error('No user data found');
            }
            const { email } = JSON.parse(userData);
            formData.append('email', email);

            console.log('Uploading photo for user email:', email);

            const response = await API.post('/user/update-photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Photo upload response:', response.data);

            if (response.data && response.data.photo) {
                const currentUserData = await AsyncStorage.getItem('user_data');
                if (currentUserData) {
                    const parsedData = JSON.parse(currentUserData);
                    const updatedData = { ...parsedData, photo: response.data.photo };
                    await AsyncStorage.setItem('user_data', JSON.stringify(updatedData));
                }
            }

            return response.data;
        } catch (error) {
            console.error('Error in updateProfilePhoto:', error.response ? error.response.data : error);
            throw ErrorService.parseApiError(error);
        }
    }
}

export default new UserService();