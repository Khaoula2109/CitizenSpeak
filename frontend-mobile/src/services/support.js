import API from './api';
import ErrorService from './error';

class SupportService {
    async submitContactForm(contactData) {
        try {
            const response = await API.post('/support/contact', contactData);
            return response.data;
        } catch (error) {
            throw ErrorService.parseApiError(error);
        }
    }
}

export default new SupportService();