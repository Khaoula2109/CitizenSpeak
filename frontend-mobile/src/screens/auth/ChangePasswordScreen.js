import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { ThemeContext } from '../../themes/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthService from '../../services/auth';
import { isRTL } from '../../localization/i18n';

const ChangePasswordScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const validatePassword = () => {
        if (!currentPassword) {
            Alert.alert(
                t('validation_error'),
                t('current_password_required'),
                [{ text: t('ok') }]
            );
            return false;
        }

        if (!newPassword) {
            Alert.alert(
                t('validation_error'),
                t('new_password_required'),
                [{ text: t('ok') }]
            );
            return false;
        }

        if (newPassword.length < 8) {
            Alert.alert(
                t('validation_error'),
                t('password_too_short'),
                [{ text: t('ok') }]
            );
            return false;
        }

        if (newPassword === currentPassword) {
            Alert.alert(
                t('validation_error'),
                t('new_password_same_as_current'),
                [{ text: t('ok') }]
            );
            return false;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert(
                t('validation_error'),
                t('passwords_must_match'),
                [{ text: t('ok') }]
            );
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validatePassword()) {
            return;
        }

        try {
            setLoading(true);
            await AuthService.changePassword(currentPassword, newPassword);
            setLoading(false);

            Alert.alert(
                t('success'),
                t('password_changed_successfully'),
                [
                    {
                        text: t('ok'),
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            console.error('Failed to change password:', error);
            setLoading(false);
            Alert.alert(
                t('error'),
                t('password_change_failed'),
                [{ text: t('ok') }]
            );
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerSection}>
                    <MaterialCommunityIcons
                        name="shield-lock"
                        size={60}
                        color={theme.colors.primary}
                    />
                    <Text style={[styles.headerTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                        {t('change_password')}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: theme.colors.secondary_text, textAlign: getTextAlign() }]}>
                        {t('password_requirements')}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                            {t('current_password')}
                        </Text>
                        <View
                            style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: theme.colors.card,
                                    borderColor: theme.colors.border,
                                    flexDirection: getFlexDirection(),
                                },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="lock"
                                size={20}
                                color={theme.colors.secondary_text}
                                style={[styles.inputIcon, getMarginDirection(0, 12)]}
                            />
                            <TextInput
                                style={[styles.input, { color: theme.colors.text, textAlign: getTextAlign() }]}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder={t('enter_current_password')}
                                placeholderTextColor={theme.colors.placeholder}
                                secureTextEntry={!showCurrentPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                style={styles.eyeIcon}
                            >
                                <MaterialCommunityIcons
                                    name={showCurrentPassword ? 'eye-off' : 'eye'}
                                    size={20}
                                    color={theme.colors.secondary_text}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                            {t('new_password')}
                        </Text>
                        <View
                            style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: theme.colors.card,
                                    borderColor: theme.colors.border,
                                    flexDirection: getFlexDirection(),
                                },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="lock-plus"
                                size={20}
                                color={theme.colors.secondary_text}
                                style={[styles.inputIcon, getMarginDirection(0, 12)]}
                            />
                            <TextInput
                                style={[styles.input, { color: theme.colors.text, textAlign: getTextAlign() }]}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder={t('enter_new_password')}
                                placeholderTextColor={theme.colors.placeholder}
                                secureTextEntry={!showNewPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowNewPassword(!showNewPassword)}
                                style={styles.eyeIcon}
                            >
                                <MaterialCommunityIcons
                                    name={showNewPassword ? 'eye-off' : 'eye'}
                                    size={20}
                                    color={theme.colors.secondary_text}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                            {t('confirm_password')}
                        </Text>
                        <View
                            style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: theme.colors.card,
                                    borderColor: theme.colors.border,
                                    flexDirection: getFlexDirection(),
                                },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="lock-check"
                                size={20}
                                color={theme.colors.secondary_text}
                                style={[styles.inputIcon, getMarginDirection(0, 12)]}
                            />
                            <TextInput
                                style={[styles.input, { color: theme.colors.text, textAlign: getTextAlign() }]}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder={t('confirm_new_password')}
                                placeholderTextColor={theme.colors.placeholder}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeIcon}
                            >
                                <MaterialCommunityIcons
                                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                                    size={20}
                                    color={theme.colors.secondary_text}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.requirementsContainer}>
                        <Text style={[styles.requirementsTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                            {t('password_must')}:
                        </Text>
                        <View style={[styles.requirementItem, { flexDirection: getFlexDirection() }]}>
                            <MaterialCommunityIcons
                                name={newPassword.length >= 8 ? 'check-circle' : 'circle-outline'}
                                size={16}
                                color={
                                    newPassword.length >= 8
                                        ? theme.colors.statusResolved
                                        : theme.colors.secondary_text
                                }
                                style={[styles.requirementIcon, getMarginDirection(0, 8)]}
                            />
                            <Text
                                style={[
                                    styles.requirementText,
                                    {
                                        color:
                                            newPassword.length >= 8
                                                ? theme.colors.statusResolved
                                                : theme.colors.secondary_text,
                                        textAlign: getTextAlign(),
                                    },
                                ]}
                            >
                                {t('min_8_characters')}
                            </Text>
                        </View>
                        <View style={[styles.requirementItem, { flexDirection: getFlexDirection() }]}>
                            <MaterialCommunityIcons
                                name={/[A-Z]/.test(newPassword) ? 'check-circle' : 'circle-outline'}
                                size={16}
                                color={
                                    /[A-Z]/.test(newPassword)
                                        ? theme.colors.statusResolved
                                        : theme.colors.secondary_text
                                }
                                style={[styles.requirementIcon, getMarginDirection(0, 8)]}
                            />
                            <Text
                                style={[
                                    styles.requirementText,
                                    {
                                        color: /[A-Z]/.test(newPassword)
                                            ? theme.colors.statusResolved
                                            : theme.colors.secondary_text,
                                        textAlign: getTextAlign(),
                                    },
                                ]}
                            >
                                {t('at_least_one_uppercase')}
                            </Text>
                        </View>
                        <View style={[styles.requirementItem, { flexDirection: getFlexDirection() }]}>
                            <MaterialCommunityIcons
                                name={/[0-9]/.test(newPassword) ? 'check-circle' : 'circle-outline'}
                                size={16}
                                color={
                                    /[0-9]/.test(newPassword)
                                        ? theme.colors.statusResolved
                                        : theme.colors.secondary_text
                                }
                                style={[styles.requirementIcon, getMarginDirection(0, 8)]}
                            />
                            <Text
                                style={[
                                    styles.requirementText,
                                    {
                                        color: /[0-9]/.test(newPassword)
                                            ? theme.colors.statusResolved
                                            : theme.colors.secondary_text,
                                        textAlign: getTextAlign(),
                                    },
                                ]}
                            >
                                {t('at_least_one_number')}
                            </Text>
                        </View>
                        <View style={[styles.requirementItem, { flexDirection: getFlexDirection() }]}>
                            <MaterialCommunityIcons
                                name={
                                    newPassword !== currentPassword && newPassword.length > 0
                                        ? 'check-circle'
                                        : 'circle-outline'
                                }
                                size={16}
                                color={
                                    newPassword !== currentPassword && newPassword.length > 0
                                        ? theme.colors.statusResolved
                                        : theme.colors.secondary_text
                                }
                                style={[styles.requirementIcon, getMarginDirection(0, 8)]}
                            />
                            <Text
                                style={[
                                    styles.requirementText,
                                    {
                                        color:
                                            newPassword !== currentPassword && newPassword.length > 0
                                                ? theme.colors.statusResolved
                                                : theme.colors.secondary_text,
                                        textAlign: getTextAlign(),
                                    },
                                ]}
                            >
                                {t('different_from_current')}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.actionButtonsContainer, { flexDirection: getFlexDirection() }]}>
                    <TouchableOpacity
                        style={[
                            styles.cancelButton,
                            {
                                backgroundColor: theme.colors.card,
                                borderColor: theme.colors.border,
                            },
                            getMarginDirection(0, 8),
                        ]}
                        onPress={handleCancel}
                        disabled={loading}
                    >
                        <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                            {t('cancel')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            { backgroundColor: theme.colors.primary },
                            loading && { opacity: 0.7 },
                            getMarginDirection(8, 0),
                        ]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={styles.saveButtonText}>{t('change_password')}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    headerSection: {
        alignItems: 'center',
        marginVertical: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginHorizontal: 24,
    },
    formContainer: {
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    eyeIcon: {
        padding: 4,
    },
    requirementsContainer: {
        marginTop: 16,
        marginBottom: 8,
    },
    requirementsTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    requirementIcon: {
        marginRight: 8,
    },
    requirementText: {
        fontSize: 13,
        flex: 1,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    cancelButton: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        marginRight: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    saveButton: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginLeft: 8,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ChangePasswordScreen;