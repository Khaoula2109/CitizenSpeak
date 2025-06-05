import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
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
import AuthService from '../../services/auth';
import { isRTL, changeLanguage, getCurrentLanguage } from '../../localization/i18n';

import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

const AVAILABLE_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇲🇦' },
];

const ForgotPasswordScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());

    const schema = yup.object().shape({
        email: yup
            .string()
            .email(t('invalid_email'))
            .required(t('email_required')),
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
        getValues,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            email: '',
        },
    });

    const handleLanguageChange = async (languageCode) => {
        try {
            await changeLanguage(languageCode);
            setCurrentLanguage(languageCode);
            setShowLanguageModal(false);

            // Show confirmation message
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
            await AuthService.forgotPassword(data.email);
            setLoading(false);
            setEmailSent(true);
        } catch (error) {
            setLoading(false);
            Alert.alert(t('error'), error.message);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
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
                        {t('reset_password')}
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

                <Card variant="elevated" style={styles.card}>
                    {!emailSent ? (
                        <>
                            <Text
                                style={[
                                    styles.instructionText,
                                    {
                                        color: theme.colors.text,
                                        textAlign: getTextAlign(),
                                    },
                                ]}
                            >
                                {t('reset_instructions')}
                            </Text>

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

                            <Button
                                title={t('send_reset_link')}
                                onPress={handleSubmit(onSubmit)}
                                loading={loading}
                                variant="primary"
                                style={styles.resetButton}
                            />
                        </>
                    ) : (
                        <View style={styles.successContainer}>
                            <View
                                style={[
                                    styles.successIconContainer,
                                    { backgroundColor: theme.colors.statusResolved + '20' },
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name="email-check"
                                    size={40}
                                    color={theme.colors.statusResolved}
                                />
                            </View>
                            <Text
                                style={[
                                    styles.successTitle,
                                    {
                                        color: theme.colors.text,
                                        textAlign: getTextAlign(),
                                    },
                                ]}
                            >
                                {t('reset_link_sent')}
                            </Text>
                            <Text
                                style={[
                                    styles.successMessage,
                                    {
                                        color: theme.colors.secondary_text,
                                        textAlign: getTextAlign(),
                                    },
                                ]}
                            >
                                {t('reset_link_sent_message', { email: getValues('email') })}
                            </Text>
                            <Button
                                title={t('back_to_login')}
                                onPress={() => navigation.navigate('Login')}
                                variant="primary"
                                style={styles.backToLoginButton}
                            />
                        </View>
                    )}
                </Card>
            </View>

            {renderLanguageModal()}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    card: {
        padding: 24,
    },
    instructionText: {
        fontSize: 16,
        marginBottom: 24,
        lineHeight: 22,
    },
    resetButton: {
        marginTop: 8,
    },
    successContainer: {
        alignItems: 'center',
        padding: 16,
    },
    successIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    successMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    backToLoginButton: {
        marginTop: 16,
        width: '100%',
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

export default ForgotPasswordScreen;