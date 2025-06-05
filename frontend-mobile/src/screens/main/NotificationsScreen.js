import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Switch,
    Alert,
    RefreshControl,
    Platform,
    Animated,
    Modal,
    ScrollView,
} from 'react-native';
import { ThemeContext } from '../../themes/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import NotificationService from '../../services/notification';
import { isRTL } from '../../localization/i18n';

const showErrorAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }]);
};

const showSuccessToast = (message) => {
    Alert.alert('Succes', message, [{ text: 'OK' }]);
};

const DEFAULT_NOTIFICATION_SETTINGS = {
    status_updates: true,
    comments: true,
    general_announcements: true,
    push_notifications: true,
    email_notifications: false,
};

const NotificationsScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('notifications');
    const [settings, setSettings] = useState(DEFAULT_NOTIFICATION_SETTINGS);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

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

    const loadNotifications = async (showLoader = true) => {
        try {
            if (showLoader) setIsLoading(true);

            const notificationsData = await NotificationService.getNotifications();

            const formattedNotifications = notificationsData.map(notification =>
                NotificationService.formatNotificationForDisplay(notification)
            );

            setNotifications(formattedNotifications);

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

        } catch (error) {
            console.error('Failed to load notifications:', error);
            showErrorAlert(
                t('error'),
                t('failed_to_load_notifications') || t('Failed to load notifications')
            );
        } finally {
            if (showLoader) setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadNotifications();

        NotificationService.initialize();

        return () => {
            NotificationService.cleanup();
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadNotifications(false);
        }, [])
    );

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        loadNotifications(false);
    }, []);

    const markAsRead = async (notificationId) => {
        try {
            await NotificationService.markAsRead(notificationId);

            setNotifications(prevNotifications =>
                prevNotifications.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, read: true }
                        : notification
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
            showErrorAlert(
                t('error'),
                t('failed_to_mark_read')
            );
        }
    };

    const handleNotificationPress = async (notification) => {
        try {
            if (!notification.read) {
                await markAsRead(notification.id);
            }

            if (notification.complaintId) {
                navigation.navigate('ComplaintDetail', {
                    complaintId: notification.complaintId
                });
            } else {
                setSelectedNotification(notification);
                setIsModalVisible(true);
            }
        } catch (error) {
            console.error('Error handling notification press:', error);
        }
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setSelectedNotification(null);
    };

    const renderNotificationModal = () => {
        if (!selectedNotification) return null;

        return (
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.modalHeader, { flexDirection: getFlexDirection() }]}>
                            <View style={styles.modalIconContainer}>
                                {renderNotificationIcon(selectedNotification.type)}
                            </View>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={closeModal}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons
                                    name="close"
                                    size={24}
                                    color={theme.colors.text}
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.modalScrollView}
                            showsVerticalScrollIndicator={false}
                        >
                            <Text
                                style={[
                                    styles.modalTitle,
                                    {
                                        color: theme.colors.text,
                                        textAlign: getTextAlign()
                                    }
                                ]}
                            >
                                {selectedNotification.title}
                            </Text>

                            <Text
                                style={[
                                    styles.modalDate,
                                    {
                                        color: theme.colors.secondary_text,
                                        textAlign: getTextAlign()
                                    }
                                ]}
                            >
                                {selectedNotification.timeAgo || formatDate(selectedNotification.date)}
                            </Text>

                            <View style={styles.modalDivider} />

                            <Text
                                style={[
                                    styles.modalDescription,
                                    {
                                        color: theme.colors.text,
                                        textAlign: getTextAlign()
                                    }
                                ]}
                            >
                                {selectedNotification.description}
                            </Text>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                                onPress={closeModal}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.modalButtonText}>
                                    {t('close') || 'Fermer'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    const markAllAsRead = async () => {
        try {
            await NotificationService.markAllAsRead();

            setNotifications(prevNotifications =>
                prevNotifications.map(notification => ({
                    ...notification,
                    read: true
                }))
            );

            showSuccessToast(
                t('all_notifications_marked_read')
            );
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            showErrorAlert(
                t('error'),
                t('failed_to_mark_all_read')
            );
        }
    };

    const deleteNotification = async (notificationId) => {
        Alert.alert(
            t('confirm_delete'),
            t('confirm_delete_notification'),
            [
                {
                    text: t('cancel'),
                    style: 'cancel',
                },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await NotificationService.deleteNotification(notificationId);

                            setNotifications(prevNotifications =>
                                prevNotifications.filter(notification => notification.id !== notificationId)
                            );

                            showSuccessToast(t('notification_deleted'));
                        } catch (error) {
                            console.error('Error deleting notification:', error);
                            showErrorAlert(
                                t('error'),
                                t('failed_to_delete_notification')
                            );
                        }
                    },
                },
            ]
        );
    };

    const toggleSetting = (setting) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            [setting]: !prevSettings[setting],
        }));
    };

    const saveSettings = async () => {
        try {
            Alert.alert(
                t('success'),
                t('notification_settings_saved'),
                [{ text: t('ok') || 'OK' }]
            );
        } catch (error) {
            console.error('Error saving settings:', error);
            showErrorAlert(
                t('error'),
                t('failed_to_save_settings')
            );
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));

        if (diffMinutes < 60) {
            return `${t('ago_prefix', 'Il y a')} ${diffMinutes} ${t('minutes_short', 'min')}`;
        } else if (diffHours < 24) {
            return `${t('ago_prefix', 'Il y a')} ${diffHours}${t('hours_short', 'h')}`;
        } else if (diffDays === 0) {
            return date.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
            });
        } else if (diffDays === 1) {
            return t('yesterday');
        } else if (diffDays < 7) {
            return date.toLocaleDateString(undefined, { weekday: 'long' });
        } else {
            return date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'STATUS_UPDATE':
            case 'COMPLAINT_RESOLVED':
            case 'COMPLAINT_IN_PROGRESS':
                return 'clipboard-check';
            case 'NEW_COMMENT':
                return 'comment-text';
            case 'GENERAL':
                return 'bell';
            default:
                return 'bell';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'STATUS_UPDATE':
            case 'COMPLAINT_IN_PROGRESS':
                return theme.colors.statusInProgress || '#FF9500';
            case 'COMPLAINT_RESOLVED':
                return theme.colors.statusResolved || '#34C759';
            case 'NEW_COMMENT':
                return theme.colors.primary;
            case 'GENERAL':
                return theme.colors.moutarde || '#FF9500';
            default:
                return theme.colors.secondary_text;
        }
    };

    const renderNotificationIcon = (type) => {
        const iconName = getNotificationIcon(type);
        const iconColor = getNotificationColor(type);

        return (
            <View
                style={[
                    styles.notificationIcon,
                    { backgroundColor: iconColor + '20' },
                    getMarginDirection(0, 12),
                ]}
            >
                <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
            </View>
        );
    };

    const renderNotificationItem = ({ item, index }) => (
        <Animated.View
            style={[
                {
                    opacity: fadeAnim,
                    transform: [{
                        translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
                        }),
                    }],
                },
            ]}
        >
            <TouchableOpacity
                style={[
                    styles.notificationItem,
                    {
                        backgroundColor: item.read
                            ? theme.colors.card
                            : theme.colors.primary + '08',
                        flexDirection: getFlexDirection(),
                        borderLeftColor: isRTL() ? 'transparent' : getNotificationColor(item.type),
                        borderRightColor: isRTL() ? getNotificationColor(item.type) : 'transparent',
                        borderLeftWidth: isRTL() ? 0 : 4,
                        borderRightWidth: isRTL() ? 4 : 0,
                    },
                ]}
                onPress={() => handleNotificationPress(item)}
                onLongPress={() => deleteNotification(item.id)}
                activeOpacity={0.7}
            >
                {renderNotificationIcon(item.type)}

                <View style={styles.notificationContent}>
                    <View style={[styles.notificationHeader, { flexDirection: getFlexDirection() }]}>
                        <Text
                            style={[
                                styles.notificationTitle,
                                {
                                    color: theme.colors.text,
                                    fontWeight: item.read ? '500' : '700',
                                    textAlign: getTextAlign(),
                                    flex: 1,
                                    ...getMarginDirection(0, 8),
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {item.title}
                        </Text>
                        <Text style={[
                            styles.notificationDate,
                            {
                                color: theme.colors.secondary_text,
                                textAlign: getTextAlign(),
                            }
                        ]}>
                            {item.timeAgo || formatDate(item.date)}
                        </Text>
                    </View>

                    <Text
                        style={[
                            styles.notificationDescription,
                            {
                                color: theme.colors.text,
                                opacity: item.read ? 0.8 : 1,
                                textAlign: getTextAlign(),
                            },
                        ]}
                        numberOfLines={2}
                    >
                        {item.description}
                    </Text>

                    {item.complaintId && (
                        <View style={[styles.notificationFooter, { flexDirection: getFlexDirection() }]}>
                            <MaterialCommunityIcons
                                name={isRTL() ? "arrow-left" : "arrow-right"}
                                size={16}
                                color={theme.colors.primary}
                            />
                            <Text style={[
                                styles.notificationAction,
                                {
                                    color: theme.colors.primary,
                                    ...getMarginDirection(4, 0),
                                }
                            ]}>
                                {t('view_complaint')}
                            </Text>
                        </View>
                    )}
                </View>

                {!item.read && (
                    <View
                        style={[
                            styles.unreadIndicator,
                            {
                                backgroundColor: theme.colors.primary,
                                right: isRTL() ? undefined : 16,
                                left: isRTL() ? 16 : undefined,
                            }
                        ]}
                    />
                )}
            </TouchableOpacity>
        </Animated.View>
    );

    const renderEmptyNotifications = () => (
        <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
                name="bell-off"
                size={80}
                color={theme.colors.secondary_text}
            />
            <Text style={[styles.emptyText, { color: theme.colors.text, textAlign: 'center' }]}>
                {t('no_notifications')}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.secondary_text, textAlign: 'center' }]}>
                {t('notifications_will_appear_here')}
            </Text>
        </View>
    );

    const renderNotificationSettings = () => (
        <View style={styles.settingsContainer}>
            <View style={styles.settingsSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                    {t('notification_types')}
                </Text>

                <View style={[styles.settingItem, { borderBottomColor: theme.colors.border, flexDirection: getFlexDirection() }]}>
                    <View style={[styles.settingTextContainer, getMarginDirection(0, 16)]}>
                        <Text style={[styles.settingTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                            {t('status_updates')}
                        </Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.secondary_text, textAlign: getTextAlign() }]}>
                            {t('status_updates_description')}
                        </Text>
                    </View>
                    <Switch
                        value={settings.status_updates}
                        onValueChange={() => toggleSetting('status_updates')}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        thumbColor={Platform.OS === 'ios' ? 'white' : theme.colors.primary}
                    />
                </View>

                <View style={[styles.settingItem, { borderBottomColor: theme.colors.border, flexDirection: getFlexDirection() }]}>
                    <View style={[styles.settingTextContainer, getMarginDirection(0, 16)]}>
                        <Text style={[styles.settingTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                            {t('comments')}
                        </Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.secondary_text, textAlign: getTextAlign() }]}>
                            {t('comments_description')}
                        </Text>
                    </View>
                    <Switch
                        value={settings.comments}
                        onValueChange={() => toggleSetting('comments')}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        thumbColor={Platform.OS === 'ios' ? 'white' : theme.colors.primary}
                    />
                </View>

                <View style={[styles.settingItem, { borderBottomColor: theme.colors.border, flexDirection: getFlexDirection() }]}>
                    <View style={[styles.settingTextContainer, getMarginDirection(0, 16)]}>
                        <Text style={[styles.settingTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                            {t('general_announcements')}
                        </Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.secondary_text, textAlign: getTextAlign() }]}>
                            {t('general_announcements_description')}
                        </Text>
                    </View>
                    <Switch
                        value={settings.general_announcements}
                        onValueChange={() => toggleSetting('general_announcements')}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        thumbColor={Platform.OS === 'ios' ? 'white' : theme.colors.primary}
                    />
                </View>
            </View>

            <View style={styles.settingsSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                    {t('delivery_methods')}
                </Text>

                <View style={[styles.settingItem, { borderBottomColor: theme.colors.border, flexDirection: getFlexDirection() }]}>
                    <View style={[styles.settingTextContainer, getMarginDirection(0, 16)]}>
                        <Text style={[styles.settingTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                            {t('push_notifications')}
                        </Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.secondary_text, textAlign: getTextAlign() }]}>
                            {t('push_notifications_description')}
                        </Text>
                    </View>
                    <Switch
                        value={settings.push_notifications}
                        onValueChange={() => toggleSetting('push_notifications')}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        thumbColor={Platform.OS === 'ios' ? 'white' : theme.colors.primary}
                    />
                </View>

                <View style={[styles.settingItem, { borderBottomColor: theme.colors.border, flexDirection: getFlexDirection() }]}>
                    <View style={[styles.settingTextContainer, getMarginDirection(0, 16)]}>
                        <Text style={[styles.settingTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                            {t('email_notifications')}
                        </Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.secondary_text, textAlign: getTextAlign() }]}>
                            {t('email_notifications_description')}
                        </Text>
                    </View>
                    <Switch
                        value={settings.email_notifications}
                        onValueChange={() => toggleSetting('email_notifications')}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        thumbColor={Platform.OS === 'ios' ? 'white' : theme.colors.primary}
                    />
                </View>
            </View>

            <TouchableOpacity
                style={[styles.saveSettingsButton, { backgroundColor: theme.colors.primary }]}
                onPress={saveSettings}
                activeOpacity={0.8}
            >
                <Text style={[styles.saveSettingsButtonText, { textAlign: 'center' }]}>
                    {t('save_settings')}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderHeader = () => {
        const unreadCount = notifications.filter(n => !n.read).length;

        return (
            <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
                <View style={[styles.headerTop, { flexDirection: getFlexDirection() }]}>
                    <Text style={[styles.screenTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                        {t('notifications')}
                    </Text>
                    {activeTab === 'notifications' && unreadCount > 0 && (
                        <TouchableOpacity
                            style={[styles.markAllButton, { borderColor: theme.colors.primary }]}
                            onPress={markAllAsRead}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.markAllButtonText, { color: theme.colors.primary, textAlign: 'center' }]}>
                                {t('mark_all_read')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={[styles.tabs, { flexDirection: getFlexDirection() }]}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === 'notifications' && [
                                styles.activeTab,
                                { borderBottomColor: theme.colors.primary },
                            ],
                        ]}
                        onPress={() => setActiveTab('notifications')}
                        activeOpacity={0.7}
                    >
                        <View style={{ flexDirection: getFlexDirection(), alignItems: 'center' }}>
                            <Text
                                style={[
                                    styles.tabText,
                                    {
                                        color: activeTab === 'notifications'
                                            ? theme.colors.primary
                                            : theme.colors.secondary_text,
                                        fontWeight: activeTab === 'notifications' ? '600' : '400',
                                        textAlign: 'center',
                                    },
                                ]}
                            >
                                {t('notifications')}
                            </Text>
                            {unreadCount > 0 && (
                                <View style={[
                                    styles.unreadBadge,
                                    {
                                        backgroundColor: theme.colors.primary,
                                        ...getMarginDirection(8, 0),
                                    }
                                ]}>
                                    <Text style={styles.unreadBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === 'settings' && [
                                styles.activeTab,
                                { borderBottomColor: theme.colors.primary },
                            ],
                        ]}
                        onPress={() => setActiveTab('settings')}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                {
                                    color: activeTab === 'settings'
                                        ? theme.colors.primary
                                        : theme.colors.secondary_text,
                                    fontWeight: activeTab === 'settings' ? '600' : '400',
                                    textAlign: 'center',
                                },
                            ]}
                        >
                            {t('settings')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.text, textAlign: 'center' }]}>
                    {t('loading_notifications')}
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {renderHeader()}

            {activeTab === 'notifications' ? (
                <FlatList
                    data={notifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[
                        styles.listContent,
                        notifications.length === 0 && styles.emptyListContent,
                    ]}
                    ListEmptyComponent={renderEmptyNotifications}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            colors={[theme.colors.primary]}
                            tintColor={theme.colors.primary}
                        />
                    }
                    ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                />
            ) : (
                renderNotificationSettings()
            )}

            {renderNotificationModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    headerTop: {
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    markAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
    },
    markAllButtonText: {
        fontSize: 12,
        fontWeight: '500',
    },
    tabs: {
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        position: 'relative',
    },
    activeTab: {
        borderBottomWidth: 2,
    },
    tabText: {
        fontSize: 16,
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
    },
    emptyListContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    notificationItem: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    notificationIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    notificationTitle: {
        fontSize: 16,
    },
    notificationDate: {
        fontSize: 12,
        marginTop: 2,
    },
    notificationDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    notificationFooter: {
        alignItems: 'center',
        marginTop: 4,
    },
    notificationAction: {
        fontSize: 12,
        fontWeight: '500',
    },
    unreadIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        position: 'absolute',
        top: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 12,
    },
    emptySubtext: {
        fontSize: 16,
        lineHeight: 24,
    },
    settingsContainer: {
        padding: 16,
    },
    settingsSection: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    settingItem: {
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    saveSettingsButton: {
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    saveSettingsButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '80%',
        borderRadius: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    modalHeader: {
        padding: 20,
        paddingBottom: 0,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    modalIconContainer: {
        flex: 1,
    },
    closeButton: {
        padding: 4,
    },
    modalScrollView: {
        paddingHorizontal: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    modalDate: {
        fontSize: 14,
        marginBottom: 16,
    },
    modalDivider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginBottom: 16,
    },
    modalDescription: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
    },
    modalFooter: {
        padding: 20,
        paddingTop: 0,
    },
    modalButton: {
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default NotificationsScreen;