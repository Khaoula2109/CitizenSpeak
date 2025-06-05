import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import translationEN from './translations/en.json';
import translationFR from './translations/fr.json';
import translationAR from './translations/ar.json';

const resources = {
    en: {
        translation: translationEN,
    },
    fr: {
        translation: translationFR,
    },
    ar: {
        translation: translationAR,
    },
};
const initializeI18n = async () => {
    let savedLanguage = null;
    try {
        savedLanguage = await AsyncStorage.getItem('language');
    } catch (error) {
        console.error('Failed to get language from storage:', error);
    }

    await i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: savedLanguage || Localization.locale.split('-')[0] || 'fr',
            fallbackLng: 'fr',
            compatibilityJSON: 'v3',
            interpolation: {
                escapeValue: false,
            },
            react: {
                useSuspense: false,
            },
        });

    return i18n;
};

export const changeLanguage = async (language) => {
    try {
        await AsyncStorage.setItem('language', language);
        await i18n.changeLanguage(language);
    } catch (error) {
        console.error('Failed to set language:', error);
    }
};

export const getCurrentLanguage = () => i18n.language;

export const isRTL = () => {
    const language = i18n.language;
    return language === 'ar';
};

export { i18n, initializeI18n };