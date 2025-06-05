import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ThemeContext } from '../../themes/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { isRTL, changeLanguage, getCurrentLanguage } from '../../localization/i18n';

import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

const AVAILABLE_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇲🇦' },
];

const RegisterScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();
    const { register } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());

    const schema = yup.object().shape({
        name: yup.string().required(t('name_required')),
        email: yup.string().email(t('invalid_email')).required(t('email_required')),
        phone: yup.string().required(t('phone_required')),
        password: yup
            .string()
            .min(6, t('password_min_length'))
            .required(t('password_required')),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref('password'), null], t('passwords_must_match'))
            .required(t('confirm_password_required')),
    });

    const getFlexDirection = () => {
        return isRTL() ? 'row-reverse' : 'row';
    };

    const getTextAlign = () => {
        return isRTL() ? 'right' : 'left';
    };

    const getMarginDirection = (leftValue, rightValue) => {
        return isRTL()
            ? { marginRight: leftValue, marginLeft: rightValue }
            : { marginLeft: leftValue, marginRight: rightValue };
    };

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        },
    });

    const handleLanguageChange = async (languageCode) => {
        try {
            await changeLanguage(languageCode);
            setCurrentLanguage(languageCode);
            setShowLanguageModal(false);

            Alert.alert(
                t('language_changed'),
                t('language_changed_message'),
                [{ text: t('ok') }]
            );
        } catch (error) {
            console.error('Error changing language:', error);
            Alert.alert(t('error'), t('language_change_error'));
        }
    };

    const getCurrentLanguageInfo = () => {
        return AVAILABLE_LANGUAGES.find(lang => lang.code === currentLanguage) || AVAILABLE_LANGUAGES[0];
    };

    const renderLanguageModal = () => (
        <Modal
            visible={showLanguageModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowLanguageModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.languageModalContainer, { backgroundColor: theme.colors.background }]}>
                    <View style={[styles.languageModalHeader, { flexDirection: getFlexDirection() }]}>
                        <Text style={[styles.languageModalTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                            {t('select_language')}
                        </Text>
                        <TouchableOpacity
                            style={styles.closeModalButton}
                            onPress={() => setShowLanguageModal(false)}
                        >
                            <MaterialCommunityIcons
                                name="close"
                                size={24}
                                color={theme.colors.secondary_text}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.languagesList}>
                        {AVAILABLE_LANGUAGES.map((language) => (
                            <TouchableOpacity
                                key={language.code}
                                style={[
                                    styles.languageOption,
                                    {
                                        backgroundColor: currentLanguage === language.code
                                            ? theme.colors.primary + '20'
                                            : 'transparent',
                                        flexDirection: getFlexDirection(),
                                    }
                                ]}
                                onPress={() => handleLanguageChange(language.code)}
                            >
                                <View style={[styles.languageInfo, { flexDirection: getFlexDirection() }]}>
                                    <Text style={styles.languageFlag}>{language.flag}</Text>
                                    <View style={[styles.languageTexts, getMarginDirection(12, 0)]}>
                                        <Text style={[styles.languageName, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                                            {language.nativeName}
                                        </Text>
                                        <Text style={[styles.languageSubname, { color: theme.colors.secondary_text, textAlign: getTextAlign() }]}>
                                            {language.name}
                                        </Text>
                                    </View>
                                </View>
                                {currentLanguage === language.code && (
                                    <MaterialCommunityIcons
                                        name="check"
                                        size={20}
                                        color={theme.colors.primary}
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const result = await register(
                data.name,
                data.email,
                data.phone,
                data.password
            );

            if (result.success) {
                Alert.alert(
                    t('registration_success'),
                    t('registration_success_message'),
                    [
                        {
                            text: t('login'),
                            onPress: () => navigation.navigate('Login'),
                        },
                    ]
                );
            } else {
                Alert.alert(t('registration_error'), result.error);
            }
        } catch (error) {
            Alert.alert(t('registration_error'), error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.headerContainer, { flexDirection: getFlexDirection() }]}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialCommunityIcons
                            name={isRTL() ? "arrow-right" : "arrow-left"}
                            size={24}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>
                    <Text
                        style={[
                            styles.headerTitle,
                            {
                                color: theme.colors.text,
                                textAlign: getTextAlign(),
                            },
                            getMarginDirection(16, 16),
                        ]}
                    >
                        {t('create_account')}
                    </Text>
                    <TouchableOpacity
                        style={styles.languageButton}
                        onPress={() => setShowLanguageModal(true)}
                    >
                        <Text style={styles.languageFlag}>{getCurrentLanguageInfo().flag}</Text>
                        <MaterialCommunityIcons
                            name="chevron-down"
                            size={16}
                            color={theme.colors.primary}
                            style={getMarginDirection(4, 0)}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.formContainer}>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value, onBlur } }) => (
                            <Input
                                label={t('name')}
                                placeholder={t('name_placeholder')}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.name?.message}
                                leftIcon="account"
                                autoCapitalize="words"
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value, onBlur } }) => (
                            <Input
                                label={t('email')}
                                placeholder={t('email_placeholder_example')}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.email?.message}
                                leftIcon="email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="phone"
                        render={({ field: { onChange, value, onBlur } }) => (
                            <Input
                                label={t('phone')}
                                placeholder={t('phone_placeholder_example')}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.phone?.message}
                                leftIcon="phone"
                                keyboardType="phone-pad"
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, value, onBlur } }) => (
                            <Input
                                label={t('password')}
                                placeholder={t('password_placeholder')}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.password?.message}
                                leftIcon="lock"
                                secureTextEntry
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, value, onBlur } }) => (
                            <Input
                                label={t('confirm_password')}
                                placeholder={t('password_placeholder')}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.confirmPassword?.message}
                                leftIcon="lock-check"
                                secureTextEntry
                            />
                        )}
                    />

                    <Button
                        title={t('register')}
                        onPress={handleSubmit(onSubmit)}
                        loading={loading}
                        variant="primary"
                        style={styles.registerButton}
                    />

                    <View style={[styles.loginContainer, { flexDirection: getFlexDirection() }]}>
                        <Text
                            style={[
                                styles.loginText,
                                {
                                    color: theme.colors.text,
                                    textAlign: getTextAlign(),
                                },
                                getMarginDirection(0, 5),
                            ]}
                        >
                            {t('already_account')}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text
                                style={[
                                    styles.loginLink,
                                    {
                                        color: theme.colors.primary,
                                        textAlign: getTextAlign(),
                                    },
                                ]}
                            >
                                {t('login')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {renderLanguageModal()}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 24,
    },
    headerContainer: {
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        flex: 1,
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    languageFlag: {
        fontSize: 20,
    },
    formContainer: {
        width: '100%',
    },
    registerButton: {
        marginTop: 16,
        marginBottom: 24,
    },
    loginContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
    },
    loginLink: {
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    languageModalContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34,
        maxHeight: '50%',
    },
    languageModalHeader: {
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    languageModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
    },
    closeModalButton: {
        padding: 4,
    },
    languagesList: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    languageOption: {
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    languageInfo: {
        alignItems: 'center',
        flex: 1,
    },
    languageTexts: {
        flex: 1,
    },
    languageName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    languageSubname: {
        fontSize: 14,
    },
});

export default RegisterScreen;