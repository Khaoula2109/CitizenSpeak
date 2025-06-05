import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView,
    Alert,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { ThemeContext } from '../../themes/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { changeLanguage, getCurrentLanguage, isRTL } from '../../localization/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { I18nManager } from 'react-native';

const getLanguages = (t) => [
    { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
    { code: 'ar', name: 'العربية', flag: '🇲🇦', nativeName: 'العربية' },
];

const SettingsScreen = ({ navigation }) => {
    const { theme, isDark, toggleTheme } = useContext(ThemeContext);
    const { t, i18n } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    const languages = getLanguages(t);

    useEffect(() => {
        checkNotificationPermission();
    }, []);

    const checkNotificationPermission = async () => {
        try {
            const { status } = await Notifications.getPermissionsAsync();
            setNotificationsEnabled(status === 'granted');
        } catch (error) {
            console.error('Failed to check notification permission:', error);
        }
    };

    const toggleNotifications = async () => {
        try {
            if (notificationsEnabled) {
                Alert.alert(
                    t('notifications'),
                    t('notifications_disable_message'),
                    [
                        { text: t('cancel'), style: 'cancel' },
                        { text: t('go_to_settings'), onPress: () => {} },
                    ]
                );
            } else {
                const { status } = await Notifications.requestPermissionsAsync();
                setNotificationsEnabled(status === 'granted');

                if (status !== 'granted') {
                    Alert.alert(
                        t('permissions_required'),
                        t('notifications_permission_message')
                    );
                }
            }
        } catch (error) {
            console.error('Failed to toggle notifications:', error);
        }
    };

    const handleLanguageChange = async (langCode) => {
        try {
            setIsLoading(true);

            await changeLanguage(langCode);
            setCurrentLanguage(langCode);
            setShowLanguageModal(false);

            const isRtl = langCode === 'ar';

            if (isRtl !== I18nManager.isRTL) {
                I18nManager.forceRTL(isRtl);

                setTimeout(() => {
                    Alert.alert(
                        t('restart_required'),
                        t('language_restart_message'),
                        [
                            { text: t('restart_now'), onPress: () => {
                                    console.log('Would restart the app here');
                                }},
                        ]
                    );
                }, 500);
            }
        } catch (error) {
            console.error('Failed to change language:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            Alert.alert(
                t('logout'),
                t('logout_confirm'),
                [
                    { text: t('cancel'), style: 'cancel' },
                    {
                        text: t('logout'),
                        onPress: async () => {
                            setIsLoading(true);

                            await AsyncStorage.removeItem('auth_token');
                            await AsyncStorage.removeItem('user_data');

                            setTimeout(() => {
                                setIsLoading(false);
                                Alert.alert(t('logged_out'), t('logged_out_message'));
                            }, 1000);
                        },
                        style: 'destructive',
                    },
                ]
            );
        } catch (error) {
            console.error('Failed to logout:', error);
            setIsLoading(false);
        }
    };

    const renderSection = (title, children) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {title}
            </Text>
            <View
                style={[
                    styles.sectionContent,
                    {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                    },
                ]}
            >
                {children}
            </View>
        </View>
    );

    const renderToggleItem = (icon, title, value, onToggle, color = theme.colors.primary) => (
        <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
                <View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor: color + '20',
                        },
                    ]}
                >
                    <MaterialCommunityIcons
                        name={icon}
                        size={20}
                        color={color}
                    />
                </View>
                <Text style={[styles.settingText, { color: theme.colors.text }]}>
                    {title}
                </Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{
                    false: theme.colors.switchTrack,
                    true: theme.colors.switchTrackActive,
                }}
                thumbColor={
                    value
                        ? theme.colors.switchThumbActive
                        : theme.colors.switchThumb
                }
            />
        </View>
    );

    const renderPressableItem = (icon, title, onPress, color = theme.colors.primary, rightContent = null) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.settingInfo}>
                <View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor: color + '20',
                        },
                    ]}
                >
                    <MaterialCommunityIcons
                        name={icon}
                        size={20}
                        color={color}
                    />
                </View>
                <Text style={[styles.settingText, { color: theme.colors.text }]}>
                    {title}
                </Text>
            </View>
            {rightContent ? (
                rightContent
            ) : (
                <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={theme.colors.secondary_text}
                />
            )}
        </TouchableOpacity>
    );

    const renderLanguageModal = () => (
        <Modal
            visible={showLanguageModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowLanguageModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View
                    style={[
                        styles.modalContainer,
                        {
                            backgroundColor: theme.colors.card,
                            borderColor: theme.colors.border,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.modalTitle,
                            { color: theme.colors.text },
                        ]}
                    >
                        {t('select_language')}
                    </Text>

                    {languages.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            style={[
                                styles.languageItem,
                                {
                                    backgroundColor:
                                        currentLanguage === lang.code
                                            ? theme.colors.primary + '20'
                                            : 'transparent',
                                },
                            ]}
                            onPress={() => handleLanguageChange(lang.code)}
                        >
                            <Text style={styles.languageFlag}>{lang.flag}</Text>
                            <Text
                                style={[
                                    styles.languageName,
                                    { color: theme.colors.text },
                                ]}
                            >
                                {lang.nativeName}
                            </Text>
                            {currentLanguage === lang.code && (
                                <MaterialCommunityIcons
                                    name="check"
                                    size={20}
                                    color={theme.colors.primary}
                                />
                            )}
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={[
                            styles.closeButton,
                            { backgroundColor: theme.colors.buttonPrimary },
                        ]}
                        onPress={() => setShowLanguageModal(false)}
                    >
                        <Text style={styles.closeButtonText}>{t('close')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const renderLoadingOverlay = () => (
        isLoading && (
            <View style={styles.loadingOverlay}>
                <View
                    style={[
                        styles.loadingContainer,
                        { backgroundColor: theme.colors.card },
                    ]}
                >
                    <ActivityIndicator
                        size="large"
                        color={theme.colors.primary}
                    />
                    <Text
                        style={[
                            styles.loadingText,
                            { color: theme.colors.text },
                        ]}
                    >
                        {t('please_wait')}
                    </Text>
                </View>
            </View>
        )
    );

    const getCurrentLanguageDisplay = () => {
        const currentLang = languages.find(l => l.code === currentLanguage);
        return currentLang ? currentLang.nativeName : currentLanguage;
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {renderSection(t('app_settings'), (
                    <>
                        {renderToggleItem(
                            'bell-outline',
                            t('enable_notifications'),
                            notificationsEnabled,
                            toggleNotifications
                        )}

                        {renderPressableItem(
                            'translate',
                            t('language'),
                            () => setShowLanguageModal(true),
                            theme.colors.primary,
                            <View style={styles.languageIndicator}>
                                <Text style={styles.languageCode}>
                                    {languages.find(l => l.code === currentLanguage)?.flag || '🌐'}
                                </Text>
                                <Text
                                    style={[
                                        styles.languageValue,
                                        { color: theme.colors.secondary_text },
                                    ]}
                                >
                                    {getCurrentLanguageDisplay()}
                                </Text>
                            </View>
                        )}

                        {renderToggleItem(
                            'theme-light-dark',
                            t('dark_mode'),
                            isDark,
                            toggleTheme
                        )}
                    </>
                ))}

                {renderSection(t('help_support'), (
                    <>
                        {renderPressableItem(
                            'frequently-asked-questions',
                            t('frequently_asked_questions'),
                            () => navigation.navigate('Support', { screen: 'FAQ' })
                        )}

                        {renderPressableItem(
                            'email-outline',
                            t('contact_us'),
                            () => navigation.navigate('Support', { screen: 'Contact' })
                        )}

                        {renderPressableItem(
                            'shield-account-outline',
                            t('privacy_policy'),
                            () => navigation.navigate('Support', { screen: 'Privacy' })
                        )}

                        {renderPressableItem(
                            'file-document-outline',
                            t('terms_of_service'),
                            () => navigation.navigate('Support', { screen: 'Terms' })
                        )}
                    </>
                ))}

                {renderSection(t('account'), (
                    <>
                        {renderPressableItem(
                            'account-edit-outline',
                            t('edit_profile'),
                            () => navigation.navigate('EditProfile'),
                            theme.colors.moutarde
                        )}

                        {renderPressableItem(
                            'logout',
                            t('logout'),
                            handleLogout,
                            '#e74c3c'
                        )}
                    </>
                ))}
            </ScrollView>

            {renderLanguageModal()}

            {renderLoadingOverlay()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionContent: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e0e0e0',
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingText: {
        fontSize: 16,
    },
    languageIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageCode: {
        fontSize: 16,
        marginRight: 8,
    },
    languageValue: {
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '90%',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    languageFlag: {
        fontSize: 20,
        marginRight: 12,
    },
    languageName: {
        fontSize: 16,
        flex: 1,
    },
    closeButton: {
        marginTop: 16,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingContainer: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
});

export default SettingsScreen;