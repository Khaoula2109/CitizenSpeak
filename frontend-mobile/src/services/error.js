import { i18n } from '../localization/i18n';

class ErrorService {
    constructor() {
        this.showError = null;
        this.showSuccess = null;
    }

    setDisplayCallbacks(showError, showSuccess) {
        this.showError = showError;
        this.showSuccess = showSuccess;
    }

    t(key, options = {}) {
        return i18n.t(key, options);
    }

    parseApiError(error) {
        console.log('🔍 Parsing API error:', error);

        let parsedError = {
            message: this.t('errors.unknown_error'),
            userMessage: this.t('errors.unknown_error_user_message'),
            status: null,
            code: 'UNKNOWN_ERROR'
        };

        if (error.response) {
            const { status, data } = error.response;
            console.log('📊 Error response data:', data);
            console.log('📈 Error status:', status);

            parsedError.status = status;

            switch (status) {
                case 400:
                    parsedError.code = 'BAD_REQUEST';
                    parsedError.message = data?.message || this.t('errors.bad_request');
                    parsedError.userMessage = this.t('errors.bad_request_user_message');
                    break;

                case 401:
                    parsedError.code = 'UNAUTHORIZED';
                    parsedError.message = this.t('errors.unauthorized');
                    parsedError.userMessage = this.t('errors.unauthorized_user_message');
                    break;

                case 403:
                    parsedError.code = 'FORBIDDEN';
                    parsedError.message = this.t('errors.forbidden');
                    parsedError.userMessage = this.t('errors.forbidden_user_message');
                    break;

                case 404:
                    parsedError.code = 'NOT_FOUND';
                    parsedError.message = data?.message || this.t('errors.not_found');

                    if (data?.message?.includes('Plainte non trouvée') ||
                        data?.message?.includes('Complaint not found') ||
                        data?.message?.includes('لم يتم العثور على الشكوى')) {
                        const idMatch = data.message.match(/#\d{4}-\d{3}/);
                        const complaintId = idMatch ? idMatch[0] : this.t('errors.specified_id');
                        parsedError.userMessage = this.t('errors.complaint_not_found_user_message', { complaintId });
                    } else {
                        parsedError.userMessage = this.t('errors.not_found_user_message');
                    }
                    break;

                case 409:
                    parsedError.code = 'CONFLICT';
                    parsedError.message = data?.message || this.t('errors.conflict');
                    parsedError.userMessage = this.t('errors.conflict_user_message');
                    break;

                case 413:
                    parsedError.code = 'PAYLOAD_TOO_LARGE';
                    parsedError.message = this.t('errors.payload_too_large');
                    parsedError.userMessage = this.t('errors.payload_too_large_user_message');
                    break;

                case 422:
                    parsedError.code = 'VALIDATION_ERROR';
                    parsedError.message = data?.message || this.t('errors.validation_error');
                    parsedError.userMessage = this.t('errors.validation_error_user_message');
                    break;

                case 429:
                    parsedError.code = 'TOO_MANY_REQUESTS';
                    parsedError.message = this.t('errors.too_many_requests');
                    parsedError.userMessage = this.t('errors.too_many_requests_user_message');
                    break;

                case 500:
                    parsedError.code = 'INTERNAL_SERVER_ERROR';
                    parsedError.message = this.t('errors.internal_server_error');

                    if ((data?.message?.includes('Plainte non trouvée') ||
                            data?.message?.includes('Complaint not found') ||
                            data?.message?.includes('لم يتم العثور على الشكوى')) ||
                        error.config?.url?.includes('/search/') ||
                        error.config?.url?.includes('/complaints/')) {

                        const idMatch = error.config?.url?.match(/%23\d{4}-\d{3}/) ||
                            data?.message?.match(/#\d{4}-\d{3}/);
                        const complaintId = idMatch ?
                            (idMatch[0].replace('%23', '#') || idMatch[0]) :
                            this.t('errors.specified_id');

                        parsedError.code = 'NOT_FOUND';
                        parsedError.userMessage = this.t('errors.complaint_not_found_user_message', { complaintId });
                    } else {
                        parsedError.userMessage = this.t('errors.internal_server_error_user_message');
                    }
                    break;

                case 502:
                case 503:
                case 504:
                    parsedError.code = 'SERVICE_UNAVAILABLE';
                    parsedError.message = this.t('errors.service_unavailable');
                    parsedError.userMessage = this.t('errors.service_unavailable_user_message');
                    break;

                default:
                    parsedError.code = `HTTP_${status}`;
                    parsedError.message = data?.message || this.t('errors.http_error', { status });
                    parsedError.userMessage = this.t('errors.unknown_error_user_message');
            }

            if (data?.userMessage) {
                parsedError.userMessage = data.userMessage;
            }

        } else if (error.request) {
            parsedError.code = 'NETWORK_ERROR';
            parsedError.message = this.t('errors.network_error');
            parsedError.userMessage = this.t('errors.network_error_user_message');
        } else {
            parsedError.message = error.message || this.t('errors.unknown_error');
            parsedError.userMessage = this.t('errors.unknown_error_user_message');
        }

        console.log('✅ Parsed error:', parsedError);
        return parsedError;
    }
}

export default new ErrorService();