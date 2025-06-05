import { useState, useCallback } from 'react';

export const useToast = () => {
    const [toastConfig, setToastConfig] = useState({
        visible: false,
        message: '',
        type: 'error',
        duration: 4000,
        position: 'top',
    });

    const showToast = useCallback((message, type = 'error', duration = 4000, position = 'top') => {
        setToastConfig({
            visible: true,
            message,
            type,
            duration,
            position,
        });
    }, []);

    const showError = useCallback((message, duration = 4000) => {
        showToast(message, 'error', duration);
    }, [showToast]);

    const showSuccess = useCallback((message, duration = 3000) => {
        showToast(message, 'success', duration);
    }, [showToast]);

    const showWarning = useCallback((message, duration = 3500) => {
        showToast(message, 'warning', duration);
    }, [showToast]);

    const showInfo = useCallback((message, duration = 3000) => {
        showToast(message, 'info', duration);
    }, [showToast]);

    const hideToast = useCallback(() => {
        setToastConfig(prev => ({
            ...prev,
            visible: false,
        }));
    }, []);

    return {
        toastConfig,
        showToast,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        hideToast,
    };
};