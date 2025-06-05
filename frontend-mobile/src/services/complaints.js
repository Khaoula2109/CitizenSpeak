import API from './api';
import { Platform } from 'react-native';
import ErrorService from './error';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n } from '../localization/i18n';

const API_BASE_URL = process.env.API_URL;

class ComplaintService {

    t(key, options = {}) {
        return i18n.t(key, options);
    }

    async searchComplaintById(complaintId) {
        try {
            console.log('🔍 Searching for complaint with ID:', complaintId);

            const token = await AsyncStorage.getItem('auth_token');
            if (!token) {
                throw new Error(this.t('complaints.authentication_required'));
            }

            if (!this.validateComplaintIdFormat(complaintId)) {
                throw {
                    response: {
                        status: 400,
                        data: {
                            message: this.t('complaints.invalid_id_format', { id: complaintId }),
                            userMessage: this.t('complaints.invalid_id_format_user_message', { id: complaintId })
                        }
                    }
                };
            }

            const encodedComplaintId = encodeURIComponent(complaintId);
            console.log('📤 Encoded search ID:', encodedComplaintId);

            const response = await API.get(`/complaints/search/${encodedComplaintId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 10000 // 10 secondes de timeout
            });

            console.log('✅ Complaint found:', response.data.title);
            return response.data;

        } catch (error) {
            console.error('❌ Error searching complaint:', error);

            const parsedError = ErrorService.parseApiError(error);

            const enhancedError = new Error(parsedError.userMessage);
            enhancedError.code = parsedError.code;
            enhancedError.status = parsedError.status;
            enhancedError.originalError = error;

            throw enhancedError;
        }
    }

    async getComplaintDetails(complaintId) {
        try {
            console.log('📋 Fetching complaint details for ID:', complaintId);

            const token = await AsyncStorage.getItem('auth_token');
            if (!token) {
                throw new Error(this.t('complaints.authentication_required'));
            }

            if (!this.validateComplaintIdFormat(complaintId)) {
                throw {
                    response: {
                        status: 400,
                        data: {
                            message: this.t('complaints.invalid_id_format', { id: complaintId }),
                            userMessage: this.t('complaints.invalid_id_format_user_message', { id: complaintId })
                        }
                    }
                };
            }

            const encodedComplaintId = encodeURIComponent(complaintId);
            console.log('📤 Encoded ID:', encodedComplaintId);

            const response = await API.get(`/complaints/${encodedComplaintId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 10000
            });

            console.log('✅ Complaint details retrieved successfully');
            return response.data;

        } catch (error) {
            console.error('❌ Error fetching complaint details:', error);
            const parsedError = ErrorService.parseApiError(error);

            const enhancedError = new Error(parsedError.userMessage);
            enhancedError.code = parsedError.code;
            enhancedError.status = parsedError.status;

            throw enhancedError;
        }
    }

    validateComplaintIdFormat(complaintId) {
        if (!complaintId || typeof complaintId !== 'string') {
            return false;
        }

        const regex = /^#\d{4}-\d{3}$/;
        const isValid = regex.test(complaintId.trim());

        console.log(`🔍 Validating ID "${complaintId}": ${isValid ? '✅' : '❌'}`);
        return isValid;
    }

    async getAllComplaints() {
        try {
            console.log('📋 Attempting to get all complaints');

            const token = await AsyncStorage.getItem('auth_token');
            if (!token) {
                throw new Error(this.t('complaints.authentication_required'));
            }

            try {
                console.log('🔍 Trying /complaints/all endpoint');
                const response = await API.get('/complaints/all', {
                    headers: { 'Authorization': `Bearer ${token}` },
                    timeout: 10000
                });
                console.log(`✅ Retrieved ${response.data.length} public complaints`);
                return response.data;
            } catch (allError) {
                console.warn('⚠️ Failed to get all complaints, trying fallback');

                try {
                    const response = await API.get('/complaints', {
                        headers: { 'Authorization': `Bearer ${token}` },
                        timeout: 10000
                    });
                    console.log(`✅ Retrieved ${response.data.length} user complaints as fallback`);
                    return response.data;
                } catch (myComplaintsError) {
                    throw allError;
                }
            }
        } catch (error) {
            console.error('❌ Error in getAllComplaints:', error);
            const parsedError = ErrorService.parseApiError(error);

            const enhancedError = new Error(parsedError.userMessage);
            enhancedError.code = parsedError.code;
            enhancedError.status = parsedError.status;

            throw enhancedError;
        }
    }

    async getMyComplaints() {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            if (!token) {
                throw new Error(this.t('complaints.authentication_required'));
            }

            const response = await API.get('/complaints', {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 10000
            });

            console.log(`✅ Retrieved ${response.data.length} user complaints`);
            return response.data;
        } catch (error) {
            console.error('❌ Error getting user complaints:', error);
            const parsedError = ErrorService.parseApiError(error);

            const enhancedError = new Error(parsedError.userMessage);
            enhancedError.code = parsedError.code;
            enhancedError.status = parsedError.status;

            throw enhancedError;
        }
    }

    async createComplaint(complaint, mediaFiles) {
        try {
            console.log('📝 Creating complaint with data:', complaint);

            const token = await AsyncStorage.getItem('auth_token');
            if (!token) {
                throw new Error(this.t('complaints.authentication_required'));
            }

            const formData = new FormData();
            formData.append('complaint', JSON.stringify(complaint));

            if (mediaFiles && mediaFiles.length > 0) {
                console.log(`📎 Adding ${mediaFiles.length} media files`);

                mediaFiles.forEach((file, index) => {
                    const fileUri = Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri;
                    const uriParts = fileUri.split('.');
                    const fileExtension = uriParts[uriParts.length - 1];

                    let fileType = 'image/jpeg';
                    if (fileExtension === 'png') fileType = 'image/png';
                    if (fileExtension === 'gif') fileType = 'image/gif';

                    const fileName = `image_${Date.now()}_${index}.${fileExtension}`;

                    formData.append('media', {
                        uri: fileUri,
                        type: fileType,
                        name: fileName,
                    });
                });
            }

            const response = await API.post('/complaints', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
                timeout: 60000, // 60 secondes pour les uploads
            });

            console.log('✅ Complaint created successfully:', response.data);
            return response.data;

        } catch (error) {
            console.error('❌ Error creating complaint:', error);
            const parsedError = ErrorService.parseApiError(error);

            const enhancedError = new Error(parsedError.userMessage);
            enhancedError.code = parsedError.code;
            enhancedError.status = parsedError.status;

            throw enhancedError;
        }
    }
    async updateComplaintStatus(complaintId, status, notes = '') {
        try {
            console.log(`📊 Updating status of complaint ${complaintId} to "${status}"`);

            const token = await AsyncStorage.getItem('auth_token');
            if (!token) {
                throw new Error(this.t('complaints.authentication_required'));
            }

            if (!this.validateComplaintIdFormat(complaintId)) {
                throw {
                    response: {
                        status: 400,
                        data: {
                            message: this.t('complaints.invalid_complaint_id', { id: complaintId }),
                            userMessage: this.t('complaints.invalid_complaint_id_user_message', { id: complaintId })
                        }
                    }
                };
            }

            const encodedComplaintId = encodeURIComponent(complaintId);

            const response = await API.post(`/complaints/${encodedComplaintId}/status`, {
                status: status,
                notes: notes
            }, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 10000
            });

            console.log('✅ Status updated successfully');
            return response.data;

        } catch (error) {
            console.error('❌ Error updating status:', error);
            const parsedError = ErrorService.parseApiError(error);

            const enhancedError = new Error(parsedError.userMessage);
            enhancedError.code = parsedError.code;
            enhancedError.status = parsedError.status;

            throw enhancedError;
        }
    }

    async getNearbyComplaints(latitude, longitude, radius = 5) {
        try {
            console.log(`🗺️ Fetching complaints near ${latitude}, ${longitude} within ${radius}km`);

            const token = await AsyncStorage.getItem('auth_token');
            if (!token) {
                throw new Error(this.t('complaints.authentication_required'));
            }

            const response = await API.get('/complaints/nearby', {
                params: { latitude, longitude, radius },
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 10000
            });

            console.log(`✅ Retrieved ${response.data.length} nearby complaints`);
            return response.data;

        } catch (error) {
            console.error('❌ Error getting nearby complaints:', error);
            const parsedError = ErrorService.parseApiError(error);

            const enhancedError = new Error(parsedError.userMessage);
            enhancedError.code = parsedError.code;
            enhancedError.status = parsedError.status;

            throw enhancedError;
        }
    }
}

export default new ComplaintService();