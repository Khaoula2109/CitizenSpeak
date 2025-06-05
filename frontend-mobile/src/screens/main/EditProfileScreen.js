import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { ThemeContext } from '../../themes/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../contexts/AuthContext';
import UserService from '../../services/user';
import { isRTL } from '../../localization/i18n';
import { API_URL } from '@env';

const EditProfileScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { user: authUser, updateUser, refreshUserData } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [avatar, setAvatar] = useState('');

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://randomuser.me/api/portraits/men/32.jpg';

        if (imagePath.startsWith('http')) {
            return imagePath;
        }

        const baseUrl = API_URL.replace('/api', '');
        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `${baseUrl}${cleanPath}`;
    };

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

    const getPositionDirection = (leftValue, rightValue) => {
        return isRTL()
            ? { right: leftValue, left: rightValue }
            : { left: leftValue, right: rightValue };
    };

    useEffect(() => {
        const loadUserData = async () => {
            try {
                setLoading(true);

                if (authUser) {
                    setName(authUser.name || '');
                    setEmail(authUser.email || '');
                    setPhone(authUser.phone || '');
                    setAvatar(authUser.photo || 'https://randomuser.me/api/portraits/men/32.jpg');
                }

                try {
                    const userData = await UserService.getProfile();

                    if (userData) {
                        setName(userData.name || authUser?.name || '');
                        setEmail(userData.email || authUser?.email || '');
                        setPhone(userData.phone || authUser?.phone || '');
                        setAvatar(userData.photo || authUser?.photo || 'https://randomuser.me/api/portraits/men/32.jpg');
                    }
                } catch (profileError) {
                    console.warn('Could not load detailed profile, using auth data:', profileError);
                }

                setLoading(false);
            } catch (error) {
                console.error('Failed to load user data:', error);
                setLoading(false);
                Alert.alert(
                    t('error'),
                    t('failed_to_load_profile'),
                    [{ text: t('ok') }]
                );
            }
        };

        loadUserData();
    }, []);

    const pickImage = async () => {
        try {
            setImageLoading(true);

            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert(
                    t('permission_denied'),
                    t('gallery_permission_message'),
                    [{ text: t('ok') }]
                );
                setImageLoading(false);
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaType.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setAvatar(result.assets[0].uri);
                await handleImageUpload(result.assets[0]);
            }

            setImageLoading(false);
        } catch (error) {
            console.error('Error picking image:', error);
            setImageLoading(false);
            Alert.alert(
                t('error'),
                t('image_selection_failed'),
                [{ text: t('ok') }]
            );
        }
    };

    const takePhoto = async () => {
        try {
            setImageLoading(true);

            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert(
                    t('permission_denied'),
                    t('camera_permission_required'),
                    [{ text: t('ok') }]
                );
                setImageLoading(false);
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setAvatar(result.assets[0].uri);
                await handleImageUpload(result.assets[0]);
            }

            setImageLoading(false);
        } catch (error) {
            console.error('Error taking photo:', error);
            setImageLoading(false);
            Alert.alert(
                t('error'),
                t('camera_error'),
                [{ text: t('ok') }]
            );
        }
    };

    const handleImageUpload = async (imageAsset) => {
        try {
            setImageLoading(true);

            const imageFile = {
                uri: imageAsset.uri,
                type: imageAsset.type || 'image/jpeg',
                name: imageAsset.fileName || `profile_${Date.now()}.jpg`,
            };

            const response = await UserService.updateProfilePhoto(imageFile);

            if (response && response.photo) {
                setAvatar(response.photo);
            }

            await refreshUserData();

            Alert.alert(t('success'), t('photo_updated_successfully'));

        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert(t('error'), t('photo_upload_error'));
        } finally {
            setImageLoading(false);
        }
    };

    const handleChangeAvatar = () => {
        Alert.alert(
            t('change_profile_photo'),
            t('choose_photo_option'),
            [
                {
                    text: t('take_photo'),
                    onPress: takePhoto,
                },
                {
                    text: t('choose_from_gallery'),
                    onPress: pickImage,
                },
                {
                    text: t('cancel'),
                    style: 'cancel',
                },
            ]
        );
    };

    const validateForm = () => {
        if (!name.trim()) {
            Alert.alert(
                t('validation_error'),
                t('name_required'),
                [{ text: t('ok') }]
            );
            return false;
        }

        if (!email.trim() || !email.includes('@')) {
            Alert.alert(
                t('validation_error'),
                t('valid_email_required'),
                [{ text: t('ok') }]
            );
            return false;
        }

        if (!phone.trim()) {
            Alert.alert(
                t('validation_error'),
                t('phone_required'),
                [{ text: t('ok') }]
            );
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            const userData = {
                name,
                email,
                phone
            };

            await UserService.updateProfile(userData);

            await refreshUserData();

            setSaving(false);

            Alert.alert(
                t('success'),
                t('profile_updated_successfully'),
                [
                    {
                        text: t('ok'),
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            console.error('Failed to update profile:', error);
            setSaving(false);
            Alert.alert(
                t('error'),
                t('profile_update_failed'),
                [{ text: t('ok') }]
            );
        }
    };

    const handleCancel = () => {
        Alert.alert(
            t('discard_changes'),
            t('unsaved_changes_message'),
            [
                {
                    text: t('discard'),
                    onPress: () => navigation.goBack(),
                    style: 'destructive',
                },
                {
                    text: t('continue_editing'),
                    style: 'cancel',
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.text, textAlign: 'center' }]}>
                    {t('loading_profile')}
                </Text>
            </View>
        );
    }

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
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        {imageLoading ? (
                            <View style={[styles.avatarLoading, { backgroundColor: theme.colors.card }]}>
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                            </View>
                        ) : (
                            <Image
                                source={{ uri: getImageUrl(avatar) }}
                                style={styles.avatar}
                                resizeMode="cover"
                                onError={(e) => {
                                    console.warn('Error loading image:', e.nativeEvent.error);
                                    setAvatar('https://randomuser.me/api/portraits/men/32.jpg');
                                }}
                            />
                        )}
                        <TouchableOpacity
                            style={[
                                styles.changeAvatarButton,
                                { backgroundColor: theme.colors.primary },
                                getPositionDirection(undefined, 0),
                            ]}
                            onPress={handleChangeAvatar}
                            disabled={imageLoading}
                        >
                            <MaterialCommunityIcons name="camera" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.changePhotoText, { color: theme.colors.primary, textAlign: 'center' }]}>
                        {t('change_profile_photo')}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                            {t('full_name')}
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
                                name="account"
                                size={20}
                                color={theme.colors.secondary_text}
                                style={[styles.inputIcon, getMarginDirection(0, 12)]}
                            />
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        color: theme.colors.text,
                                        textAlign: getTextAlign(),
                                    }
                                ]}
                                value={name}
                                onChangeText={setName}
                                placeholder={t('enter_full_name')}
                                placeholderTextColor={theme.colors.placeholder}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                            {t('email_address')}
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
                                name="email"
                                size={20}
                                color={theme.colors.secondary_text}
                                style={[styles.inputIcon, getMarginDirection(0, 12)]}
                            />
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        color: theme.colors.text,
                                        textAlign: getTextAlign(),
                                    }
                                ]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder={t('email_placeholder')}
                                placeholderTextColor={theme.colors.placeholder}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={false}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                            {t('phone_number')}
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
                                name="phone"
                                size={20}
                                color={theme.colors.secondary_text}
                                style={[styles.inputIcon, getMarginDirection(0, 12)]}
                            />
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        color: theme.colors.text,
                                        textAlign: getTextAlign(),
                                    }
                                ]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder={t('phone_placeholder')}
                                placeholderTextColor={theme.colors.placeholder}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.passwordSection}>
                        <Text
                            style={[styles.passwordSectionTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}
                        >
                            {t('security')}
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.passwordButton,
                                {
                                    borderColor: theme.colors.border,
                                    flexDirection: getFlexDirection(),
                                }
                            ]}
                            onPress={() => navigation.navigate('ChangePassword')}
                        >
                            <MaterialCommunityIcons
                                name="lock"
                                size={20}
                                color={theme.colors.primary}
                                style={[styles.passwordButtonIcon, getMarginDirection(0, 12)]}
                            />
                            <Text style={[
                                styles.passwordButtonText,
                                {
                                    color: theme.colors.text,
                                    textAlign: getTextAlign(),
                                }
                            ]}>
                                {t('change_password')}
                            </Text>
                            <MaterialCommunityIcons
                                name={isRTL() ? "chevron-left" : "chevron-right"}
                                size={20}
                                color={theme.colors.secondary_text}
                            />
                        </TouchableOpacity>
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
                            getMarginDirection(8, 0),
                        ]}
                        onPress={handleCancel}
                        disabled={saving}
                    >
                        <Text style={[styles.cancelButtonText, { color: theme.colors.text, textAlign: 'center' }]}>
                            {t('cancel')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            { backgroundColor: theme.colors.primary },
                            saving && { opacity: 0.7 },
                            getMarginDirection(0, 8),
                        ]}
                        onPress={handleSubmit}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={[styles.saveButtonText, { textAlign: 'center' }]}>{t('save_changes')}</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 8,
        position: 'relative',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    avatarLoading: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeAvatarButton: {
        position: 'absolute',
        bottom: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    changePhotoText: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 8,
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
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    inputIcon: {
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    passwordSection: {
        marginTop: 12,
    },
    passwordSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    passwordButton: {
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    passwordButtonIcon: {
    },
    passwordButtonText: {
        flex: 1,
        fontSize: 16,
    },
    actionButtonsContainer: {
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
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EditProfileScreen;