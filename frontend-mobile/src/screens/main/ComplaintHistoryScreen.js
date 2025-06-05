import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    TextInput,
    Platform,
    Alert,
} from 'react-native';
import { ThemeContext } from '../../themes/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ComplaintService from '../../services/complaints';
import { isRTL } from '../../localization/i18n';
import { API_URL } from '../../services/api';

const FILTER_OPTIONS = [
    { id: 'all', label: 'all' },
    { id: 'New', label: 'submitted', color: '#3498db' },
    { id: 'In Progress', label: 'in_progress', color: '#f39c12' },
    { id: 'Resolved', label: 'resolved', color: '#2ecc71' },
];

const ComplaintHistoryScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

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

    const getWritingDirection = () => {
        return isRTL() ? 'rtl' : 'ltr';
    };

    const loadComplaints = async () => {
        try {
            setIsLoading(true);
            console.log('Fetching complaints from backend...');

            // Call the API to get complaints
            const data = await ComplaintService.getMyComplaints();
            console.log(`Received ${data.length} complaints from server`);

            setComplaints(data);
            setFilteredComplaints(data);
        } catch (error) {
            console.error('Failed to load complaints:', error);
            Alert.alert(
                t('error'),
                t('failed_to_load_complaints_detailed')
            );
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadComplaints();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadComplaints();
    };

    useEffect(() => {
        filterComplaints();
    }, [filterStatus, searchQuery, complaints]);

    const filterComplaints = () => {
        let filtered = complaints;

        if (filterStatus !== 'all') {
            filtered = filtered.filter(
                (complaint) => complaint.status === filterStatus
            );
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (complaint) =>
                    complaint.description.toLowerCase().includes(query) ||
                    (complaint.category?.label && complaint.category.label.toLowerCase().includes(query))
            );
        }

        setFilteredComplaints(filtered);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTranslatedStatus = (status) => {
        switch (status?.toLowerCase()) {
            case 'new':
                return t('new');
            case 'submitted':
                return t('submitted');
            case 'in progress':
                return t('in_progress');
            case 'assigned':
                return t('assigned');
            case 'intervention scheduled':
                return t('intervention_scheduled');
            case 'resolved':
                return t('resolved');
            default:
                return status;
        }
    };

    const renderStatusBadge = (status) => {
        let color;
        switch (status) {
            case 'New':
            case 'Submitted':
                color = '#3498db';
                break;
            case 'In Progress':
                color = '#f39c12';
                break;
            case 'Assigned':
                color = '#f39c12';
                break;
            case 'Intervention Scheduled':
                color = '#f39c12';
                break;
            case 'Resolved':
                color = '#2ecc71';
                break;
            default:
                color = theme.colors.secondary_text;
        }

        return (
            <View style={[styles.statusBadge, { backgroundColor: color }]}>
                <Text style={[styles.statusText, { textAlign: 'center' }]}>
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
            <View style={[
                styles.categoryIcon,
                { backgroundColor: `${iconColor}20` },
                getMarginDirection(0, 12)
            ]}>
                <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
            </View>
        );
    };

    const getMediaUrl = (complaint) => {
        if (complaint.media && complaint.media.length > 0) {
            return complaint.media[0].url;
        }
        return null;
    };

    const renderComplaintItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.complaintCard,
                {
                    backgroundColor: theme.colors.cardBackground,
                    shadowColor: theme.colors.shadow,
                },
            ]}
            onPress={() => navigation.navigate('ComplaintDetail', { complaintId: item.complaintId })}
            activeOpacity={0.8}
        >
            <View style={[styles.complaintHeader, { flexDirection: getFlexDirection() }]}>
                {renderCategoryIcon(item.category)}
                <View style={styles.complaintHeaderText}>
                    <Text
                        style={[styles.complaintCategory, { color: theme.colors.text, textAlign: getTextAlign() }]}
                        numberOfLines={1}
                    >
                        {item.category?.label || t('unknown_category')}
                    </Text>
                    <View style={[styles.complaintMeta, { flexDirection: getFlexDirection() }]}>
                        <Text style={[styles.complaintDate, { color: theme.colors.secondary_text, textAlign: getTextAlign() }, getMarginDirection(0, 8)]}>
                            {formatDate(item.creationDate)}
                        </Text>
                        {renderStatusBadge(item.status)}
                    </View>
                </View>
            </View>

            <View style={[styles.complaintContent, { flexDirection: getFlexDirection() }]}>
                <View style={[styles.complaintTextContainer, getMarginDirection(0, 12)]}>
                    <Text
                        style={[styles.complaintDescription, { color: theme.colors.text, textAlign: getTextAlign() }]}
                        numberOfLines={2}
                    >
                        {item.description}
                    </Text>
                    <View style={[styles.complaintAddressContainer, { flexDirection: getFlexDirection() }]}>
                        <MaterialCommunityIcons
                            name="map-marker"
                            size={14}
                            color={theme.colors.secondary_text}
                            style={getMarginDirection(0, 4)}
                        />
                        <Text
                            style={[styles.complaintAddress, { color: theme.colors.secondary_text, textAlign: getTextAlign() }]}
                            numberOfLines={1}
                        >
                            {t('coordinates')}: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                        </Text>
                    </View>
                </View>
                {getMediaUrl(item) && (
                    <Image
                        source={{ uri: API_URL + getMediaUrl(item) }}
                        style={styles.complaintImage}
                        resizeMode="cover"
                    />
                )}
            </View>
        </TouchableOpacity>
    );

    const renderListHeader = () => (
        <View style={styles.listHeader}>
            <View
                style={[
                    styles.searchContainer,
                    {
                        backgroundColor: theme.colors.cardBackground,
                        borderColor: theme.colors.border,
                        flexDirection: getFlexDirection(),
                    },
                ]}
            >
                <MaterialCommunityIcons
                    name="magnify"
                    size={20}
                    color={theme.colors.secondary_text}
                    style={[styles.searchIcon, getMarginDirection(0, 8)]}
                />
                <TextInput
                    style={[styles.searchInput, { color: theme.colors.text, textAlign: getTextAlign(), writingDirection: getWritingDirection() }]}
                    placeholder={t('search_complaints')}
                    placeholderTextColor={theme.colors.placeholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearSearch}
                        onPress={() => setSearchQuery('')}
                    >
                        <MaterialCommunityIcons
                            name="close-circle"
                            size={16}
                            color={theme.colors.secondary_text}
                        />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.filtersContainer}>
                <FlatList
                    data={FILTER_OPTIONS}
                    keyExtractor={(item) => item.id}
                    horizontal={!isRTL()}
                    inverted={isRTL()}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterOption,
                                filterStatus === item.id && styles.activeFilterOption,
                                {
                                    backgroundColor:
                                        filterStatus === item.id
                                            ? theme.colors.selected_option_background
                                            : theme.colors.option_background,
                                    borderColor:
                                        filterStatus === item.id
                                            ? theme.colors.primary
                                            : theme.colors.border,
                                    flexDirection: getFlexDirection(),
                                },
                                getMarginDirection(0, 8),
                            ]}
                            onPress={() => setFilterStatus(item.id)}
                        >
                            {item.id !== 'all' && (
                                <View
                                    style={[
                                        styles.filterStatusDot,
                                        { backgroundColor: item.color },
                                        getMarginDirection(0, 8),
                                    ]}
                                />
                            )}
                            <Text
                                style={[
                                    styles.filterOptionText,
                                    filterStatus === item.id && styles.activeFilterOptionText,
                                    { color: theme.colors.text, textAlign: getTextAlign() },
                                ]}
                            >
                                {t(item.label)}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.resultsInfo}>
                <Text style={[styles.resultsCount, { color: theme.colors.secondary_text, textAlign: getTextAlign() }]}>
                    {filteredComplaints.length} {t('results_found')}
                </Text>
            </View>
        </View>
    );

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
                name="alert-circle-outline"
                size={60}
                color={theme.colors.secondary_text}
            />
            {searchQuery.length > 0 || filterStatus !== 'all' ? (
                <>
                    <Text style={[styles.emptyText, { color: theme.colors.text, textAlign: 'center' }]}>
                        {t('no_matching_complaints')}
                    </Text>
                    <TouchableOpacity
                        style={[styles.clearFiltersButton, { borderColor: theme.colors.border }]}
                        onPress={() => {
                            setSearchQuery('');
                            setFilterStatus('all');
                        }}
                    >
                        <Text style={[styles.clearFiltersText, { color: theme.colors.primary, textAlign: 'center' }]}>
                            {t('clear_filters')}
                        </Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text style={[styles.emptyText, { color: theme.colors.text, textAlign: 'center' }]}>
                        {t('no_complaints')}
                    </Text>
                    <TouchableOpacity
                        style={[styles.emptyButton, { backgroundColor: theme.colors.buttonPrimary }]}
                        onPress={() => navigation.navigate('Report')}
                    >
                        <Text style={[styles.emptyButtonText, { textAlign: 'center' }]}>{t('submit_new')}</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.text, textAlign: 'center' }]}>
                    {t('loading_complaints')}
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={filteredComplaints}
                renderItem={renderComplaintItem}
                keyExtractor={(item) => item.complaintId}
                contentContainerStyle={[
                    styles.listContent,
                    filteredComplaints.length === 0 && { flex: 1 },
                ]}
                ListHeaderComponent={renderListHeader}
                ListEmptyComponent={renderEmptyComponent}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={Platform.OS === 'android'}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={10}
                refreshing={refreshing}
                onRefresh={handleRefresh}
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
    listContent: {
        padding: 16,
    },
    listHeader: {
        marginBottom: 16,
    },
    searchContainer: {
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    searchIcon: {
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    clearSearch: {
        padding: 4,
    },
    filtersContainer: {
        marginBottom: 16,
    },
    filterOption: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    activeFilterOption: {
        borderWidth: 1,
    },
    filterStatusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    filterOptionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    activeFilterOptionText: {
        fontWeight: '600',
    },
    resultsInfo: {
        marginBottom: 12,
    },
    resultsCount: {
        fontSize: 14,
    },
    complaintCard: {
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        overflow: 'hidden',
    },
    complaintHeader: {
        padding: 12,
    },
    categoryIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    complaintHeaderText: {
        flex: 1,
        justifyContent: 'center',
    },
    complaintCategory: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    complaintMeta: {
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
        padding: 12,
        paddingTop: 0,
    },
    complaintTextContainer: {
        flex: 1,
    },
    complaintDescription: {
        fontSize: 14,
        marginBottom: 8,
    },
    complaintAddressContainer: {
        alignItems: 'center',
    },
    complaintAddress: {
        fontSize: 12,
        flex: 1,
    },
    complaintImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        marginVertical: 16,
    },
    emptyButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    clearFiltersButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 8,
    },
    clearFiltersText: {
        fontWeight: '600',
    },
});

export default ComplaintHistoryScreen;