import { useState, useCallback } from 'react';
import ErrorService from '../services/error';

const useLoadingState = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (asyncFunction, options = {}) => {
        const {
            showError = true,
            errorTitle = 'Error',
            resetErrorOnStart = true,
            onSuccess = null,
            onError = null,
        } = options;

        try {
            setLoading(true);
            if (resetErrorOnStart) {
                setError(null);
            }

            const result = await asyncFunction();

            if (onSuccess) {
                onSuccess(result);
            }

            return result;
        } catch (err) {
            const parsedError = ErrorService.parseApiError(err);
            setError(parsedError);

            if (showError) {
                ErrorService.showError(parsedError, errorTitle);
            }

            if (onError) {
                onError(parsedError);
            }

            ErrorService.logError(parsedError);
            throw parsedError;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        execute,
        setLoading,
        setError,
    };
};

export default useLoadingState;