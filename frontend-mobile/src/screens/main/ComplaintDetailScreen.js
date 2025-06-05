import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
    ActivityIndicator, Dimensions, Platform, Linking, Alert,
    KeyboardAvoidingView, Animated, RefreshControl,
} from 'react-native';

import { ThemeContext } from '../../themes/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Carousel from 'react-native-reanimated-carousel';
import ComplaintService from '../../services/complaints';
import CommentForm from '../../components/complaints/CommentForm';
import CommentsList from '../../components/complaints/CommentsList';
import StatusTimeline from '../../components/complaints/StatusTimeline';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isRTL, getCurrentLanguage } from '../../localization/i18n';

const { width } = Dimensions.get('window');
const API_BASE_URL = process.env.API_URL;

const ComplaintDetailScreen = ({ route, navigation }) => {
    const { complaintId } = route?.params || {};
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();
    const currentLanguage = getCurrentLanguage();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [complaint, setComplaint] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [authToken, setAuthToken] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const scrollViewRef = useRef(null);

    const getCurrentUser = async () => {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            if (!token) {
                console.log('No auth token found');
                return;
            }

            console.log('Making request to /api/auth/me with token');

            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const userData = await response.json();
                setCurrentUser(userData);
                console.log('Current user loaded:', userData.name, '(Role:', userData.role + ')');
            } else {
                const errorText = await response.text();
                console.error('Failed to get current user:', response.status, errorText);

                if (response.status === 401) {
                    await AsyncStorage.removeItem('auth_token');
                }
            }
        } catch (error) {
            console.error('Error getting current user:', error);
        }
    };

    useEffect(() => {
        getCurrentUser();
    }, []);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        ]).start();
    }, [complaint]);

    const getFlexDirection = () => (isRTL() ? 'row-reverse' : 'row');
    const getTextAlign = () => (isRTL() ? 'right' : 'left');
    const getMarginDirection = (l, r) =>
        isRTL() ? { marginRight: l, marginLeft: r } : { marginLeft: l, marginRight: r };
    const getPositionDirection = (l, r) =>
        isRTL() ? { right: l, left: r } : { left: l, right: r };

    useEffect(() => {
        (async () => {
            try {
                const token = await AsyncStorage.getItem('auth_token');
                setAuthToken(token);
            } catch (e) {
                console.error('Failed to get auth token:', e);
            }
        })();
    }, []);

    const fetchComplaintDetails = async () => {
        try {
            setLoading(true);
            const data = await ComplaintService.getComplaintDetails(complaintId);
            setComplaint(data);
        } catch (error) {
            console.error('Failed to load complaint details:', error);
            Alert.alert(t('error'), t('failed_to_load_complaint_details'), [
                { text: t('retry'), onPress: fetchComplaintDetails },
            ]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (complaintId) fetchComplaintDetails();
    }, [complaintId]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchComplaintDetails();
    };

    const renderSimpleMediaCarousel = () => {
        if (!complaint?.media?.length) return null;

        return (
            <View style={styles.mediaSection}>
                <Carousel
                    width={width}
                    height={280}
                    data={complaint.media}
                    renderItem={({ item, index }) => {
                        const imageUrl = API_BASE_URL + item.url;

                        return (
                            <View style={styles.simpleImageContainer}>
                                <View style={styles.simpleImageWrapper}>
                                    <Image
                                        source={{
                                            uri: imageUrl,
                                            ...(authToken
                                                ? { headers: { Authorization: `Bearer ${authToken}` } }
                                                : {}),
                                        }}
                                        style={styles.simpleImage}
                                        resizeMode="cover"
                                    />

                                    {complaint.media.length > 1 && (
                                        <View style={[styles.simpleMediaCounter, getPositionDirection(undefined, 15)]}>
                                            <Text style={styles.simpleMediaCounterText}>
                                                {index + 1}/{complaint.media.length}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    }}
                />
            </View>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        let locale = 'en-US';
        if (currentLanguage === 'fr') locale = 'fr-FR';
        else if (currentLanguage === 'ar') locale = 'ar-MA';

        return date.toLocaleDateString(locale, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTranslatedStatus = (status) => {
        switch (status?.toLowerCase()) {
            case 'new':
            case 'submitted':
                return t('submitted');
            case 'in progress':
                return t('in_progress');
            case 'resolved':
                return t('resolved');
            default:
                return status;
        }
    };

    const renderStatusBadge = (status) => {
        let color, icon;
        switch (status) {
            case 'New':
                color = '#007AFF';
                icon = 'clock-outline';
                break;
            case 'In Progress':
                color = '#FF9500';
                icon = 'progress-clock';
                break;
            case 'Resolved':
                color = '#34C759';
                icon = 'check-circle';
                break;
            default:
                color = theme.colors.secondary_text;
                icon = 'help-circle';
        }

        return (
            <Animated.View
                style={[
                    styles.statusBadge,
                    {
                        backgroundColor: `${color}20`,
                        borderColor: color,
                        transform: [{ scale: scaleAnim }],
                    },
                    getMarginDirection(0, 8),
                ]}
            >
                <MaterialCommunityIcons
                    name={icon}
                    size={14}
                    color={color}
                    style={getMarginDirection(0, 4)}
                />
                <Text style={[styles.statusText, { color }]}>{getTranslatedStatus(status)}</Text>
            </Animated.View>
        );
    };

    const renderCategoryIcon = (category) => {
        if (!category || !category.label)
            return { name: 'alert-circle', color: theme.colors.primary };

        const label = category.label.toLowerCase();
        let iconName, iconColor;

        switch (label) {
            case 'waste':
            case 'déchets':
                iconName = 'trash-can';
                iconColor = '#FF6B6B';
                break;
            case 'roads':
            case 'routes':
                iconName = 'road';
                iconColor = '#4ECDC4';
                break;
            case 'lighting':
            case 'éclairage':
                iconName = 'lightbulb';
                iconColor = '#FFD93D';
                break;
            case 'vandalism':
            case 'vandalisme':
                iconName = 'spray';
                iconColor = '#A8EDEA';
                break;
            case 'water':
            case 'eau':
                iconName = 'water';
                iconColor = '#667eea';
                break;
            case 'vegetation':
            case 'végétation':
                iconName = 'tree';
                iconColor = '#2ECC71';
                break;
            case 'noise':
            case 'bruit':
                iconName = 'volume-high';
                iconColor = '#E74C3C';
                break;
            default:
                iconName = 'alert-circle';
                iconColor = theme.colors.primary;
        }

        return { name: iconName, color: iconColor };
    };

    const renderFluidMap = () => {
        if (!complaint?.latitude || !complaint?.longitude) return null;

        const region = {
            latitude: complaint.latitude,
            longitude: complaint.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        };

        return (
            <View style={styles.locationSection}>
                <View style={[styles.sectionHeaderFluid, { flexDirection: getFlexDirection() }]}>
                    <MaterialCommunityIcons
                        name="map-marker-outline"
                        size={24}
                        color={theme.colors.primary}
                        style={getMarginDirection(0, 8)}
                    />
                    <Text
                        style={[
                            styles.sectionTitleFluid,
                            { color: theme.colors.text, textAlign: getTextAlign() },
                        ]}
                    >
                        {t('location')}
                    </Text>
                </View>
                <View style={styles.fluidMapContainer}>
                    <MapView
                        style={styles.fluidMap}
                        initialRegion={region}
                        region={region}
                        zoomEnabled
                        scrollEnabled={false}
                    >
                        <Marker coordinate={{ latitude: complaint.latitude, longitude: complaint.longitude }} />
                    </MapView>
                    <TouchableOpacity
                        style={[
                            styles.fluidMapButton,
                            { backgroundColor: theme.colors.primary },
                            getPositionDirection(undefined, 20),
                        ]}
                        onPress={() => {
                            const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
                            const latLng = `${complaint.latitude},${complaint.longitude}`;
                            const url = Platform.select({
                                ios: `${scheme}?ll=${latLng}`,
                                android: `${scheme}${latLng}`,
                            });
                            Linking.openURL(url);
                        }}
                    >
                        <MaterialCommunityIcons
                            name="open-in-app"
                            size={16}
                            color="#fff"
                            style={getMarginDirection(0, 6)}
                        />
                        <Text style={styles.fluidMapButtonText}>{t('open_in_maps')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const handleStatusUpdate = async (newStatus, notes = '') => {
        if (!complaint || updatingStatus) return;
        try {
            setUpdatingStatus(true);
            const result = await ComplaintService.updateComplaintStatus(
                complaint.complaintId,
                newStatus,
                notes
            );
            setComplaint((prev) => {
                const history = [result, ...(prev.statusHistory || [])];
                return {
                    ...prev,
                    status: newStatus,
                    statusHistory: history,
                    closureDate: newStatus === 'Resolved' ? new Date() : prev.closureDate,
                };
            });
            Alert.alert(t('success'), t('status_updated_successfully'));
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert(t('error'), error.message || t('status_update_error'));
        } finally {
            setUpdatingStatus(false);
        }
    };

    const renderFluidAdminActions = () => {
        const isAdmin = currentUser?.role === 'Admin';
        if (!isAdmin) return null;

        const buttons = [
            { status: 'New', color: '#007AFF', key: 'set_new' },
            { status: 'In Progress', color: '#FF9500', key: 'set_in_progress' },
            { status: 'Resolved', color: '#34C759', key: 'set_resolved' },
        ];

        return (
            <View style={styles.adminSection}>
                <View
                    style={[styles.sectionHeaderFluid, { flexDirection: getFlexDirection() }]}
                >
                    <MaterialCommunityIcons
                        name="shield-account-outline"
                        size={24}
                        color={theme.colors.primary}
                        style={getMarginDirection(0, 8)}
                    />
                    <Text
                        style={[
                            styles.sectionTitleFluid,
                            { color: theme.colors.text, textAlign: getTextAlign() },
                        ]}
                    >
                        {t('admin_actions')}
                    </Text>
                </View>
                <View style={[styles.fluidStatusButtons, { flexDirection: getFlexDirection() }]}>
                    {buttons.map((b, idx) => (
                        <TouchableOpacity
                            key={b.status}
                            style={[
                                styles.fluidStatusButton,
                                {
                                    backgroundColor: `${b.color}15`,
                                    borderColor: `${b.color}40`,
                                },
                                complaint.status === b.status && styles.disabledButton,
                                updatingStatus && styles.disabledButton,
                                idx === 1 && { marginHorizontal: 8 },
                            ]}
                            disabled={complaint.status === b.status || updatingStatus}
                            onPress={() => {
                                if (b.status === 'New') {
                                    handleStatusUpdate('New');
                                } else {
                                    Alert.prompt(
                                        t('enter_notes'),
                                        t('optional_notes_status_change'),
                                        [
                                            { text: t('cancel'), style: 'cancel' },
                                            {
                                                text: t('update'),
                                                onPress: (notes) => handleStatusUpdate(b.status, notes),
                                            },
                                        ]
                                    );
                                }
                            }}
                        >
                            <Text style={[styles.fluidStatusButtonText, { color: b.color }]}>
                                {t(b.key)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {updatingStatus && (
                    <View style={[styles.fluidLoadingStatus, { flexDirection: getFlexDirection() }]}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                        <Text
                            style={[
                                styles.fluidLoadingText,
                                { color: theme.colors.text, textAlign: getTextAlign() },
                                getMarginDirection(8, 0),
                            ]}
                        >
                            {t('updating_status')}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const renderFluidStatusHistory = () => {
        if (!complaint?.statusHistory) return null;

        return (
            <View style={styles.timelineSection}>
                <View style={[styles.sectionHeaderFluid, { flexDirection: getFlexDirection() }]}>
                    <MaterialCommunityIcons
                        name="timeline-clock-outline"
                        size={24}
                        color={theme.colors.primary}
                        style={getMarginDirection(0, 8)}
                    />
                    <Text
                        style={[
                            styles.sectionTitleFluid,
                            { color: theme.colors.text, textAlign: getTextAlign() },
                        ]}
                    >
                        {t('status_history')}
                    </Text>
                </View>
                <StatusTimeline statusHistory={complaint.statusHistory} theme={theme} />
            </View>
        );
    };

    const handleCommentAdded = () => {
        fetchComplaintDetails();
    };

    const handleCommentUpdated = (updatedComment) => {
        setComplaint(prevComplaint => {
            if (!prevComplaint || !prevComplaint.comments) return prevComplaint;

            const updatedComments = prevComplaint.comments.map(comment =>
                comment.id === updatedComment.id ? updatedComment : comment
            );

            return {
                ...prevComplaint,
                comments: updatedComments
            };
        });
    };

    const handleCommentDeleted = (deletedCommentId) => {
        setComplaint(prevComplaint => {
            if (!prevComplaint || !prevComplaint.comments) return prevComplaint;

            const updatedComments = prevComplaint.comments.filter(
                comment => comment.id !== deletedCommentId
            );

            return {
                ...prevComplaint,
                comments: updatedComments
            };
        });
    };

    const renderFluidComments = () => (
        <View style={styles.commentsSection}>
            <View style={[styles.sectionHeaderFluid, { flexDirection: getFlexDirection() }]}>
                <MaterialCommunityIcons
                    name="comment-multiple-outline"
                    size={24}
                    color={theme.colors.primary}
                    style={getMarginDirection(0, 8)}
                />
                <Text
                    style={[
                        styles.sectionTitleFluid,
                        { color: theme.colors.text, textAlign: getTextAlign() },
                    ]}
                >
                    {t('comments')} ({complaint.comments?.length || 0})
                </Text>
            </View>

            <CommentForm
                complaintId={complaint.complaintId}
                theme={theme}
                onCommentAdded={handleCommentAdded}
                apiBaseUrl={API_BASE_URL}
            />

            <CommentsList
                comments={complaint.comments || []}
                theme={theme}
                currentUserId={currentUser?.id || currentUser?.userId}
                currentUserEmail={currentUser?.email}
                onCommentUpdated={handleCommentUpdated}
                onCommentDeleted={handleCommentDeleted}
                apiBaseUrl={API_BASE_URL}
            />
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                    {t('loading_complaint')}…
                </Text>
            </View>
        );
    }

    if (!complaint) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
                <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={80}
                    color={theme.colors.secondary_text}
                />
                <Text style={[styles.errorText, { color: theme.colors.text }]}>
                    {t('complaint_not_found')}
                </Text>
                <TouchableOpacity
                    style={[styles.goBackButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.goBackButtonText}>{t('go_back')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const categoryInfo = renderCategoryIcon(complaint.category);

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={insets.bottom + 64}
        >
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
            >
                <Animated.View
                    style={[
                        styles.fluidContainer,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <View style={styles.titleSection}>
                        <Text
                            style={[styles.mainTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}
                        >
                            {complaint.title}
                        </Text>
                        <View style={[styles.statusRow, { flexDirection: getFlexDirection() }]}>
                            {renderStatusBadge(complaint.status)}
                            <Text
                                style={[
                                    styles.dateText,
                                    { color: theme.colors.secondary_text, textAlign: getTextAlign() },
                                ]}
                            >
                                {formatDate(complaint.creationDate)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.categorySection}>
                        <View
                            style={[
                                styles.categoryDisplay,
                                { flexDirection: getFlexDirection(), alignSelf: isRTL() ? 'flex-end' : 'flex-start' },
                            ]}
                        >
                            <View
                                style={[
                                    styles.categoryIconSmall,
                                    { backgroundColor: `${categoryInfo.color}20` },
                                    getMarginDirection(0, 12),
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name={categoryInfo.name}
                                    size={20}
                                    color={categoryInfo.color}
                                />
                            </View>
                            <Text
                                style={[
                                    styles.categoryText,
                                    { color: categoryInfo.color, textAlign: getTextAlign() },
                                ]}
                            >
                                {complaint.category?.label || t('unknown_category')}
                            </Text>
                        </View>
                    </View>

                    {renderSimpleMediaCarousel()}

                    <View style={styles.descriptionSection}>
                        <View style={[styles.sectionHeaderFluid, { flexDirection: getFlexDirection() }]}>
                            <MaterialCommunityIcons
                                name="text-box-outline"
                                size={24}
                                color={theme.colors.primary}
                                style={getMarginDirection(0, 8)}
                            />
                            <Text
                                style={[
                                    styles.sectionTitleFluid,
                                    { color: theme.colors.text, textAlign: getTextAlign() },
                                ]}
                            >
                                {t('description')}
                            </Text>
                        </View>
                        <Text
                            style={[
                                styles.descriptionTextFluid,
                                {
                                    color: theme.colors.text,
                                    textAlign: getTextAlign(),
                                    writingDirection: isRTL() ? 'rtl' : 'ltr',
                                },
                            ]}
                        >
                            {complaint.description}
                        </Text>
                    </View>

                    {renderFluidMap()}

                    {renderFluidAdminActions()}

                    {renderFluidStatusHistory()}

                    {renderFluidComments()}
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1 },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 16 },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { marginTop: 20, fontSize: 18, marginBottom: 30, textAlign: 'center' },
    goBackButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    goBackButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },

    fluidContainer: { paddingHorizontal: 20 },
    titleSection: { paddingTop: 20, paddingBottom: 16 },
    mainTitle: { fontSize: 28, fontWeight: 'bold', lineHeight: 36, marginBottom: 12 },
    statusRow: { alignItems: 'center', marginTop: 8 },
    categorySection: { paddingVertical: 16 },
    categoryDisplay: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 25,
    },
    categoryIconSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryText: { fontSize: 16, fontWeight: '600' },

    mediaSection: {
        marginVertical: 20,
        alignItems: 'center',
    },
    simpleImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    simpleImageWrapper: {
        width: width - 40,
        height: 250,
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        elevation: 5,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        position: 'relative',
        alignSelf: 'center',
    },
    simpleImage: {
        width: '100%',
        height: '100%',
    },
    simpleMediaCounter: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: 'rgba(0,0,0,0.75)',
        borderRadius: 15,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    simpleMediaCounterText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },

    sectionHeaderFluid: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 24 },
    sectionTitleFluid: { fontSize: 20, fontWeight: 'bold' },
    descriptionSection: { paddingVertical: 8 },
    descriptionTextFluid: { fontSize: 16, lineHeight: 26, opacity: 0.9 },
    locationSection: { paddingVertical: 8 },
    fluidMapContainer: { height: 220, borderRadius: 16, overflow: 'hidden', position: 'relative', marginBottom: 8 },
    fluidMap: { ...StyleSheet.absoluteFillObject },
    fluidMapButton: {
        position: 'absolute',
        bottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        elevation: 2,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    fluidMapButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    adminSection: { paddingVertical: 8 },
    fluidStatusButtons: { justifyContent: 'space-between', marginTop: 12 },
    fluidStatusButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        flex: 1,
        alignItems: 'center',
        borderWidth: 1,
    },
    fluidStatusButtonText: { fontWeight: '600', fontSize: 13 },
    fluidLoadingStatus: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
    },
    fluidLoadingText: { fontSize: 14, fontWeight: '500' },
    timelineSection: { paddingVertical: 8 },
    commentsSection: { paddingVertical: 8, paddingBottom: 40 },

    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
    },
    statusText: { fontSize: 12, fontWeight: '600' },
    dateText: { fontSize: 14, fontWeight: '500', opacity: 0.8 },
    disabledButton: { opacity: 0.5 },
});

export default ComplaintDetailScreen;