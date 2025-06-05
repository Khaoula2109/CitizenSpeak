import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { ThemeContext } from '../../themes/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import ComplaintService from '../../services/complaints';
import * as ImagePicker from 'expo-image-picker';
import UserService from '../../services/user';
import Avatar from '../../components/AvatarComponent';

const ProfileScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const { t, i18n } = useTranslation();
    const { user, logout, refreshUserData } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [avatar, setAvatar] = useState(user?.photo || null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        loadComplaints();
    }, []);

    useEffect(() => {
        if (user?.photo) {
            setAvatar(user.photo);
            setImageError(false);
        }
    }, [user]);

    const loadComplaints = async () => {
        try {
            setIsLoading(true);
            const data = await ComplaintService.getMyComplaints();
            setComplaints(data);
        } catch (error) {
            console.error('Failed to load complaints:', error);
            Alert.alert(t('error'), t('failed_to_load_complaints'));
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const locale = i18n.language === 'ar' ? 'ar-MA' :
            i18n.language === 'en' ? 'en-US' : 'fr-FR';

        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getAvatarSource = () => {
        if (!avatar || imageError) return null;

        if (avatar.startsWith('http')) {
            return { uri: avatar };
        }

        const baseUrl = process.env.API_URL;
        const fullUrl = avatar.startsWith('/')
            ? `${baseUrl}${avatar}`
            : `${baseUrl}/${avatar}`;

        return { uri: fullUrl };
    };

    const handleImageError = (error) => {
        console.warn('Error loading avatar image:', error);
        setImageError(true);
    };

    const resetImageError = () => {
        setImageError(false);
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(t('permission_denied'), t('camera_permission_required'));
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert(t('error'), t('photo_pick_error'));
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(t('permission_denied'), t('camera_permission_required'));
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert(t('error'), t('photo_capture_error'));
        }
    };

    const uploadImage = async (uri) => {
        try {
            setUploading(true);
            setImageError(false);

            setAvatar(uri);

            const imageFile = {
                uri: uri,
                type: 'image/jpeg',
                name: `profile_${Date.now()}.jpg`,
            };

            const response = await UserService.updateProfilePhoto(imageFile);

            await refreshUserData();

            if (response && response.photo) {
                setAvatar(response.photo);
            }

            Alert.alert(t('success'), t('photo_updated_successfully'));
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert(t('error'), t('photo_upload_error'));
            setAvatar(user?.photo || null);
            setImageError(true);
        } finally {
            setUploading(false);
        }
    };

    const showPhotoOptions = () => {
        Alert.alert(
            t('update_profile_photo'),
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

    const handleLogout = () => {
        Alert.alert(
            t('logout'),
            t('logout_confirmation'),
            [
                {
                    text: t('cancel'),
                    style: 'cancel',
                },
                {
                    text: t('logout'),
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            Alert.alert(t('error'), t('failed_to_logout'));
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    const menuItems = [
        {
            id: 'change_password',
            icon: 'lock-reset',
            title: t('change_password'),
            onPress: () => navigation.navigate('ChangePassword'),
            color: theme.colors.primary,
        },
        {
            id: 'my_reports',
            icon: 'history',
            title: t('my_reports'),
            onPress: () => navigation.navigate('ComplaintHistory'),
            color: theme.colors.primary,
        },
        {
            id: 'notifications',
            icon: 'bell-outline',
            title: t('notifications'),
            onPress: () => navigation.navigate('Notifications'),
            color: theme.colors.primary,
        },
        {
            id: 'help_support',
            icon: 'help-circle-outline',
            title: t('help_support'),
            onPress: () => navigation.navigate('Support'),
            color: theme.colors.primary,
        },
        {
            id: 'logout',
            icon: 'logout',
            title: t('logout'),
            onPress: handleLogout,
            color: '#e74c3c',
            isDestructive: true,
        },
    ];

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <View style={[styles.profileHeader, { backgroundColor: theme.colors.primary }]}>
                <TouchableOpacity onPress={showPhotoOptions} style={styles.avatarContainer}>
                    {uploading ? (
                        <View style={[styles.loadingAvatar, { backgroundColor: theme.colors.primary + '40' }]}>
                            <ActivityIndicator size="small" color="white" />
                        </View>
                    ) : (
                        <>
                            {avatar && !imageError ? (
                                <Image
                                    source={getAvatarSource()}
                                    style={styles.avatar}
                                    onError={handleImageError}
                                    onLoad={resetImageError}
                                />
                            ) : (
                                <Avatar
                                    source={null}
                                    name={user?.name || user?.email || 'User'}
                                    size="large"
                                    variant="circle"
                                    style={styles.avatar}
                                />
                            )}
                        </>
                    )}
                    <View style={styles.editPhotoButton}>
                        <MaterialCommunityIcons name="camera" size={18} color="white" />
                    </View>
                </TouchableOpacity>

                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <Text style={styles.userInfo}>{user?.email || 'user@example.com'}</Text>
                <Text style={styles.userInfo}>{user?.phone || '+212 612 345 678'}</Text>
                <Text style={styles.memberSince}>
                    {t('member_since')} {formatDate(user?.createdAt || new Date())}
                </Text>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.moutarde }]}
                    onPress={() => navigation.navigate('EditProfile')}
                >
                    <MaterialCommunityIcons name="account-edit" size={20} color={theme.colors.white} />
                    <Text style={styles.actionButtonText}>{t('edit_profile')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <MaterialCommunityIcons name="cog" size={20} color={theme.colors.white} />
                    <Text style={styles.actionButtonText}>{t('settings')}</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.menuContainer, { backgroundColor: theme.colors.card }]}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.menuItem,
                            {
                                borderBottomColor: theme.colors.border,
                                borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                            }
                        ]}
                        onPress={item.onPress}
                    >
                        <MaterialCommunityIcons
                            name={item.icon}
                            size={24}
                            color={item.color}
                        />
                        <Text
                            style={[
                                styles.menuItemText,
                                {
                                    color: item.isDestructive ? item.color : theme.colors.text
                                }
                            ]}
                        >
                            {item.title}
                        </Text>
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={24}
                            color={theme.colors.secondary_text}
                        />
                    </TouchableOpacity>
                ))}
            </View>

            <View style={[styles.statsContainer, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
                    {t('my_reports')}
                </Text>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={[styles.loadingText, { color: theme.colors.secondary_text }]}>
                            {t('loading')}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                                {complaints.length}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.secondary_text }]}>
                                {t('total_reports')}
                            </Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: theme.colors.statusResolved }]}>
                                {complaints.filter(c => c.status === 'resolved').length}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.secondary_text }]}>
                                {t('resolved')}
                            </Text>
                        </View>

                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, { color: theme.colors.statusPending }]}>
                                {complaints.filter(c => c.status === 'in_progress').length}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.colors.secondary_text }]}>
                                {t('in_progress')}
                            </Text>
                        </View>
                    </View>
                )}

                {!isLoading && complaints.length === 0 && (
                    <Text style={[styles.noComplaintsText, { color: theme.colors.secondary_text }]}>
                        {t('no_complaints_yet')}
                    </Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 24,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    avatarContainer: {
        width: 104,
        height: 104,
        borderRadius: 52,
        borderWidth: 3,
        borderColor: 'white',
        marginBottom: 16,
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
    },
    loadingAvatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editPhotoButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    userInfo: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 2,
    },
    memberSince: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: -24,
        marginHorizontal: 16,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginHorizontal: 4,
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    actionButtonText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 8,
    },
    menuContainer: {
        marginHorizontal: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 12,
    },
    statsContainer: {
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginTop: 8,
        fontSize: 14,
    },
    noComplaintsText: {
        textAlign: 'center',
        fontSize: 14,
        fontStyle: 'italic',
        paddingVertical: 20,
    },
});

export default ProfileScreen;