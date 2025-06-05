import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert,
    RefreshControl,
} from 'react-native';
import { ThemeContext } from '../themes/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ComplaintService from '../services/complaints';
import useLoadingState from '../hooks/useLoadingState';
import useLocation from '../hooks/useLocation';
import { isRTL, getCurrentLanguage } from '../localization/i18n';

const NearbyComplaintsScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();
    const currentLanguage = getCurrentLanguage();
    const { loading, error, execute } = useLoadingState();
    const { location, loading: locationLoading } = useLocation({ autoRequest: true });

    const [complaints, setComplaints] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const getFlexDirection = () => isRTL() ? 'row-reverse' : 'row';
    const getTextAlign = () => isRTL() ? 'right' : 'left';
    const getMarginDirection = (leftValue, rightValue) => {
        return isRTL()
            ? { marginRight: leftValue, marginLeft: rightValue }
            : { marginLeft: leftValue, marginRight: rightValue };
    };

    useEffect(() => {
        if (location) {
            loadNearbyComplaints();
        }
    }, [location]);

    const loadNearbyComplaints = async () => {
        if (!location) return;

        execute(async () => {
            console.log('Loading nearby complaints for location:', location);
            const result = await ComplaintService.getNearbyComplaints(
                location.latitude,
                location.longitude,
                5
            );
            console.log(`Found ${result.length} nearby complaints`);
            setComplaints(result);
            return result;
        }, {
            errorTitle: t('error_loading_complaints'),
            onError: (error) => {
                console.error('Error loading nearby complaints:', error);
                Alert.alert(
                    t('error'),
                    error.message || t('failed_to_load_complaints')
                );
            }
        });
    };

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadNearbyComplaints();
        setRefreshing(false);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        let locale = 'en-US';
        if (currentLanguage === 'fr') locale = 'fr-FR';
        else if (currentLanguage === 'ar') locale = 'ar-MA';

        return date.toLocaleDateString(locale, {
            month: 'short',
            day: 'numeric',
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
        let color;
        switch (status?.toLowerCase()) {
            case 'new':
            case 'submitted':
                color = '#3498db';
                break;
            case 'in progress':
                color = '#f39c12';
                break;
            case 'resolved':
                color = '#2ecc71';
                break;
            default:
                color = theme.colors.secondary_text;
        }

        return (
            <View style={[styles.statusBadge, { backgroundColor: color }]}>
                <Text style={styles.statusText}>
                    {getTranslatedStatus(status)}
                </Text>
            </View>
        );
    };

    const renderCategoryIcon = (category) => {
        const categoryLabel = category?.label?.toLowerCase() || '';
        let iconName, iconColor;

        switch (categoryLabel) {
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

        return (
            <View
                style={[
                    styles.categoryIcon,
                    { backgroundColor: `${iconColor}20` },
                    getMarginDirection(0, 12)
                ]}
            >
                <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
            </View>
        );
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const renderComplaintCard = ({ item }) => {
        const distance = location ? calculateDistance(
            location.latitude,
            location.longitude,
            item.latitude,
            item.longitude
        ) : 0;

        const handlePress = () => {
            navigation.navigate('ComplaintDetail', {
                complaintId: item.complaintId
            });
        };

        return (
            <TouchableOpacity
                style={[
                    styles.complaintCard,
                    {
                        backgroundColor: theme.colors.card,
                        shadowColor: theme.colors.shadow,
                    },
                ]}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <View style={[styles.complaintHeader, { flexDirection: getFlexDirection() }]}>
                    {renderCategoryIcon(item.category)}
                    <View style={styles.complaintHeaderText}>
                        <View style={[styles.complaintTitleRow, { flexDirection: getFlexDirection() }]}>
                            <Text
                                style={[
                                    styles.complaintTitle,
                                    { color: theme.colors.text, textAlign: getTextAlign() }
                                ]}
                                numberOfLines={1}
                            >
                                {item.title}
                            </Text>
                            <Text
                                style={[
                                    styles.complaintId,
                                    { color: theme.colors.primary, textAlign: getTextAlign() }
                                ]}
                            >
                                {item.complaintId}
                            </Text>
                        </View>
                        <View style={[styles.complaintMeta, { flexDirection: getFlexDirection() }]}>
                            <Text
                                style={[
                                    styles.complaintDate,
                                    {
                                        color: theme.colors.secondary_text,
                                        textAlign: getTextAlign(),
                                    },
                                    getMarginDirection(0, 8),
                                ]}
                            >
                                {formatDate(item.creationDate)}
                            </Text>
                            {renderStatusBadge(item.status)}
                        </View>
                    </View>
                </View>

                <View style={[styles.complaintContent, { flexDirection: getFlexDirection() }]}>
                    <View style={[styles.complaintTextContainer, getMarginDirection(0, 12)]}>
                        <Text
                            style={[
                                styles.complaintDescription,
                                {
                                    color: theme.colors.text,
                                    textAlign: getTextAlign(),
                                    writingDirection: isRTL() ? 'rtl' : 'ltr',
                                }
                            ]}
                            numberOfLines={2}
                        >
                            {item.description}
                        </Text>

                        <View style={[styles.distanceContainer, { flexDirection: getFlexDirection() }]}>
                            <MaterialCommunityIcons
                                name="map-marker-distance"
                                size={14}
                                color={theme.colors.secondary_text}
                                style={getMarginDirection(0, 4)}
                            />
                            <Text
                                style={[
                                    styles.distanceText,
                                    { color: theme.colors.secondary_text, textAlign: getTextAlign() }
                                ]}
                            >
                                {distance < 1
                                    ? `${Math.round(distance * 1000)}m`
                                    : `${distance.toFixed(1)}km`
                                } {t('away')}
                            </Text>
                        </View>
                    </View>

                    {item.media && item.media.length > 0 && (
                        <Image
                            source={{ uri: item.media[0].url }}
                            style={styles.complaintImage}
                            resizeMode="cover"
                        />
                    )}
                </View>

                <View style={styles.cardFooter}>
                    <TouchableOpacity
                        style={[
                            styles.viewDetailsButton,
                            { backgroundColor: theme.colors.primary + '15' }
                        ]}
                        onPress={handlePress}
                    >
                        <Text style={[styles.viewDetailsText, { color: theme.colors.primary }]}>
                            {t('view_details')}
                        </Text>
                        <MaterialCommunityIcons
                            name={isRTL() ? "arrow-left" : "arrow-right"}
                            size={16}
                            color={theme.colors.primary}
                            style={getMarginDirection(4, 0)}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
                name="map-marker-off-outline"
                size={80}
                color={theme.colors.secondary_text}
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                {t('no_nearby_complaints')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.secondary_text, textAlign: getTextAlign() }]}>
                {t('no_complaints_in_area')}
            </Text>
            <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('Report')}
            >
                <MaterialCommunityIcons name="plus" size={20} color="white" style={getMarginDirection(0, 8)} />
                <Text style={styles.emptyButtonText}>{t('report_issue')}</Text>
            </TouchableOpacity>
        </View>
    );

    if (locationLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                    {t('getting_location')}...
                </Text>
            </View>
        );
    }

    if (loading && !refreshing) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                    {t('loading_complaints')}...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
                <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={80}
                    color={theme.colors.secondary_text}
                />
                <Text style={[styles.errorTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                    {t('error_loading_data')}
                </Text>
                <Text style={[styles.errorMessage, { color: theme.colors.secondary_text, textAlign: getTextAlign() }]}>
                    {error.message}
                </Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                    onPress={loadNearbyComplaints}
                >
                    <MaterialCommunityIcons name="refresh" size={20} color="white" style={getMarginDirection(0, 8)} />
                    <Text style={styles.retryButtonText}>{t('retry')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                    {t('nearby_complaints')}
                </Text>
                {location && (
                    <Text style={[styles.headerSubtitle, { color: theme.colors.secondary_text, textAlign: getTextAlign() }]}>
                        {t('within_5km_radius')}
                    </Text>
                )}
            </View>

            <FlatList
                data={complaints}
                renderItem={renderComplaintCard}
                keyExtractor={(item) => item.complaintId}
                contentContainerStyle={[
                    styles.listContent,
                    complaints.length === 0 && { flex: 1 }
                ]}
                ListEmptyComponent={renderEmptyComponent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                    />
                }
            />
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 14,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 20,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    header: {
        padding: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        opacity: 0.8,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    complaintCard: {
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 5,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
    },
    complaintHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    categoryIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    complaintHeaderText: {
        flex: 1,
    },
    complaintTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    complaintTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    complaintId: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'monospace',
    },
    complaintMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    complaintDate: {
        fontSize: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '500',
    },
    complaintContent: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    complaintTextContainer: {
        flex: 1,
    },
    complaintDescription: {
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.8,
        marginBottom: 8,
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    distanceText: {
        fontSize: 12,
        fontWeight: '500',
    },
    complaintImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
    },
    cardFooter: {
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    viewDetailsText: {
        fontSize: 12,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 20,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    emptyButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default NearbyComplaintsScreen;