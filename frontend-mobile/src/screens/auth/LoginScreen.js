import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
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

const logoImage = require('../../../assets/logo.png');

const AVAILABLE_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇲🇦' },
];

const LoginScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();
    const { login } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());

    const schema = yup.object().shape({
        email: yup
            .string()
            .email(t('invalid_email'))
            .required(t('email_required')),
        password: yup
            .string()
            .min(6, t('password_min_length'))
            .required(t('password_required')),
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
            email: '',
            password: '',
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

    const toggleSecureEntry = () => {
        setSecureTextEntry(!secureTextEntry);
    };

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            const result = await login(data.email, data.password);

            if (result.success) {
            } else {
                Alert.alert(t('error'), result.error);
            }
        } catch (error) {
            Alert.alert(t('error'), error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.headerContainer, { flexDirection: getFlexDirection() }]}>
                    <View style={{ flex: 1 }} />
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

                <View style={styles.logoContainer}>
                    <Image
                        source={logoImage}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={[styles.appName, { color: theme.colors.primary }]}>
                        CitizenSpeak
                    </Text>
                    <Text style={[styles.slogan, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                        {t('slogan')}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value, onBlur } }) => (
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                                    {t('email')}
                                </Text>
                                <View
                                    style={[
                                        styles.inputContainer,
                                        {
                                            backgroundColor: theme.colors.inputBackground,
                                            borderColor: errors.email
                                                ? 'red'
                                                : theme.colors.border,
                                            flexDirection: getFlexDirection(),
                                        },
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name="email"
                                        size={20}
                                        color={theme.colors.secondary_text}
                                        style={[styles.inputIcon, getMarginDirection(0, 10)]}
                                    />
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                color: theme.colors.text,
                                                textAlign: getTextAlign(),
                                            },
                                        ]}
                                        placeholder={t('email_placeholder_example')}
                                        placeholderTextColor={theme.colors.placeholder}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                </View>
                                {errors.email && (
                                    <Text style={[styles.errorText, { textAlign: getTextAlign() }]}>
                                        {errors.email.message}
                                    </Text>
                                )}
                            </View>
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, value, onBlur } }) => (
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                                    {t('password')}
                                </Text>
                                <View
                                    style={[
                                        styles.inputContainer,
                                        {
                                            backgroundColor: theme.colors.inputBackground,
                                            borderColor: errors.password
                                                ? 'red'
                                                : theme.colors.border,
                                            flexDirection: getFlexDirection(),
                                        },
                                    ]}
                                >
                                    <MaterialCommunityIcons
                                        name="lock"
                                        size={20}
                                        color={theme.colors.secondary_text}
                                        style={[styles.inputIcon, getMarginDirection(0, 10)]}
                                    />
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                color: theme.colors.text,
                                                textAlign: getTextAlign(),
                                            },
                                        ]}
                                        placeholder={t('password_placeholder')}
                                        placeholderTextColor={theme.colors.placeholder}
                                        secureTextEntry={secureTextEntry}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                    <TouchableOpacity onPress={toggleSecureEntry}>
                                        <MaterialCommunityIcons
                                            name={secureTextEntry ? 'eye' : 'eye-off'}
                                            size={20}
                                            color={theme.colors.secondary_text}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {errors.password && (
                                    <Text style={[styles.errorText, { textAlign: getTextAlign() }]}>
                                        {errors.password.message}
                                    </Text>
                                )}
                            </View>
                        )}
                    />

                    <TouchableOpacity
                        style={[styles.forgotPasswordContainer, { alignItems: isRTL() ? 'flex-start' : 'flex-end' }]}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text
                            style={[
                                styles.forgotPasswordText,
                                {
                                    color: theme.colors.secondary,
                                    textAlign: getTextAlign(),
                                },
                            ]}
                        >
                            {t('forgot_password')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.loginButton,
                            { backgroundColor: theme.colors.buttonPrimary },
                        ]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={theme.colors.white} />
                        ) : (
                            <Text style={styles.loginButtonText}>{t('login')}</Text>
                        )}
                    </TouchableOpacity>

                    <View style={[styles.registerContainer, { flexDirection: getFlexDirection() }]}>
                        <Text
                            style={[
                                styles.registerText,
                                {
                                    color: theme.colors.text,
                                    textAlign: getTextAlign(),
                                },
                                getMarginDirection(0, 5),
                            ]}
                        >
                            {t('no_account')}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Register')}
                        >
                            <Text
                                style={[
                                    styles.registerLink,
                                    {
                                        color: theme.colors.buttonPrimary,
                                        textAlign: getTextAlign(),
                                    },
                                ]}
                            >
                                {t('register')}
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
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    headerContainer: {
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingTop: 20,
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
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 16,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    slogan: {
        fontSize: 16,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 14,
    },
    loginButton: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
    },
    registerLink: {
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

export default LoginScreen;