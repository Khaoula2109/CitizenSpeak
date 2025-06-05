import API from './api';

class CategoryService {
    async getAllCategories() {
        try {
            const response = await API.get('/categories');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    handleError(error) {
        if (error.response && error.response.data) {
            return new Error(error.response.data.message || 'An error occurred');
        }
        return new Error('Network error. Please check your connection.');
    }
}

export default new CategoryService();