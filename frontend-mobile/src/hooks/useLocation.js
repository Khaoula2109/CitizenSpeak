import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

const useLocation = (options = {}) => {
    const { t } = useTranslation();
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const {
        autoRequest = true,
        showErrorAlert = true,
        highAccuracy = true,
    } = options;

    const requestPermission = async () => {
        try {
            setLoading(true);
            setError(null);

            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                const error = new Error('Permission to access location was denied');
                setError(error);

                if (showErrorAlert) {
                    Alert.alert(
                        t('Permission required'),
                        t('Location permission message'),
                        [{ text: t('Ok') }]
                    );
                }

                return false;
            }

            return true;
        } catch (error) {
            setError(error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getCurrentPosition = async () => {
        try {
            setLoading(true);
            setError(null);

            const hasPermission = await requestPermission();

            if (!hasPermission) {
                return null;
            }

            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: highAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
            });

            const locationObj = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            };

            setLocation(locationObj);
            return locationObj;
        } catch (error) {
            setError(error);

            if (showErrorAlert) {
                Alert.alert(
                    t('Error'),
                    t('Could not get location'),
                    [{ text: t('Ok') }]
                );
            }

            return null;
        } finally {
            setLoading(false);
        }
    };

    const getAddressFromCoordinates = async (latitude, longitude) => {
        try {
            const result = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            if (result && result.length > 0) {
                const { street, name, city, region, country, postalCode } = result[0];
                return `${street || name || ''}, ${city || ''}, ${region || ''}, ${postalCode || ''}, ${country || ''}`;
            }

            return '';
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return '';
        }
    };

    useEffect(() => {
        if (autoRequest) {
            getCurrentPosition();
        }
    }, [autoRequest]);

    return {
        location,
        loading,
        error,
        requestPermission,
        getCurrentPosition,
        getAddressFromCoordinates,
    };
};

export default useLocation;