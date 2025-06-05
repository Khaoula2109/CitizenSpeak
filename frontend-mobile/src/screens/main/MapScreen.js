import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Modal,
    Animated,
    FlatList,
    Platform,
    Alert,
    Linking,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../themes/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../components/Badge';
import ComplaintService from '../../services/complaints';
import { isRTL } from '../../localization/i18n';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const CATEGORIES = [
    { id: 'all', label: 'all', icon: 'filter-variant' },
    { id: 'waste', label: 'waste', icon: 'trash-can' },
    { id: 'roads', label: 'roads', icon: 'road' },
    { id: 'lighting', label: 'lighting', icon: 'lightbulb' },
    { id: 'vandalism', label: 'vandalism', icon: 'spray' },
    { id: 'water', label: 'water', icon: 'water' },
    { id: 'vegetation', label: 'vegetation', icon: 'tree' },
    { id: 'noise', label: 'noise', icon: 'volume-high' },
];

const STATUSES = [
    { id: 'all', label: 'all_statuses' },
    { id: 'New', label: 'submitted', color: '#3498db' },
    { id: 'In Progress', label: 'in_progress', color: '#f39c12' },
    { id: 'Resolved', label: 'resolved', color: '#2ecc71' },
];

const MapScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();
    const mapRef = useRef(null);
    const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [complaints, setComplaints] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showComplaintDetails, setShowComplaintDetails] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const slideAnimation = useRef(new Animated.Value(0)).current;

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
        const getLocationPermission = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                setLocationPermissionGranted(status === 'granted');

                if (status === 'granted') {
                    await getCurrentLocation();
                } else {
                    setIsLoading(false);
                    Alert.alert(
                        t('location_permission_required'),
                        t('location_permission_message')
                    );
                }
            } catch (error) {
                console.error('Error requesting location permission:', error);
                setIsLoading(false);
            }

            loadComplaints();
        };

        getLocationPermission();
    }, []);

    const getCurrentLocation = async () => {
        try {
            setIsLoading(true);
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            setCurrentLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            });

            setIsLoading(false);
        } catch (error) {
            console.error('Error getting current location:', error);
            setIsLoading(false);
        }
    };

    const loadComplaints = async () => {
        try {
            setIsLoading(true);

            let location = null;
            if (locationPermissionGranted) {
                try {
                    location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    console.log('Location received:', location.coords);

                    setCurrentLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                    });
                } catch (locationError) {
                    console.warn('Failed to get current location:', locationError);
                }
            }

            console.log('Fetching complaints from server...');

            try {
                const allComplaints = await ComplaintService.getAllComplaints();
                console.log(`Retrieved ${allComplaints.length} complaints`);
                setComplaints(allComplaints);
            } catch (getAllError) {
                console.warn('Error getting all complaints:', getAllError.message);

                if (location && location.coords) {
                    try {
                        console.log('Trying to get nearby complaints instead...');
                        const nearbyComplaints = await ComplaintService.getNearbyComplaints(
                            location.coords.latitude,
                            location.coords.longitude,
                            5
                        );
                        console.log(`Retrieved ${nearbyComplaints.length} nearby complaints`);
                        setComplaints(nearbyComplaints);
                    } catch (nearbyError) {
                        console.error('Failed to get nearby complaints:', nearbyError);

                        try {
                            console.log('Trying to get user complaints as last resort...');
                            const userComplaints = await ComplaintService.getMyComplaints();
                            console.log(`Retrieved ${userComplaints.length} user complaints`);
                            setComplaints(userComplaints);
                        } catch (userError) {
                            console.error('All complaint retrieval methods failed:', userError);

                            setComplaints([]);

                            Alert.alert(
                                t('error'),
                                t('failed_to_load_complaints'),
                                [{ text: t('ok') }]
                            );
                        }
                    }
                } else {
                    try {
                        console.log('No location available, trying user complaints...');
                        const userComplaints = await ComplaintService.getMyComplaints();
                        console.log(`Retrieved ${userComplaints.length} user complaints`);
                        setComplaints(userComplaints);
                    } catch (userError) {
                        console.error('Failed to get user complaints:', userError);
                        setComplaints([]);
                        Alert.alert(
                            t('error'),
                            t('failed_to_load_complaints'),
                            [{ text: t('ok') }]
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Error loading complaints:', error);
            setComplaints([]);
            Alert.alert(
                t('error'),
                t('failed_to_load_complaints'),
                [{ text: t('ok') }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const refreshComplaints = () => {
        loadComplaints();
    };

    const filteredComplaints = complaints.filter((complaint) => {
        let matchesCategory = true;
        if (categoryFilter !== 'all') {
            const categoryLabel = complaint.category?.label;
            if (categoryLabel) {
                const categoryLower = categoryLabel.toLowerCase();
                const filterLower = categoryFilter.toLowerCase();

                const categoryMatches = {
                    'waste': ['waste', 'déchets', 'dechet'],
                    'roads': ['roads', 'routes', 'route', 'voirie'],
                    'lighting': ['lighting', 'éclairage', 'eclairage'],
                    'vandalism': ['vandalism', 'vandalisme'],
                    'water': ['water', 'eau'],
                    'vegetation': ['vegetation', 'végétation', 'vegetation'],
                    'noise': ['noise', 'bruit']
                };

                matchesCategory = false;
                if (categoryMatches[filterLower]) {
                    matchesCategory = categoryMatches[filterLower].some(cat =>
                        categoryLower.includes(cat) || cat.includes(categoryLower)
                    );
                } else {
                    matchesCategory = categoryLower.includes(filterLower) || filterLower.includes(categoryLower);
                }
            } else {
                matchesCategory = false;
            }
        }

        let matchesStatus = true;
        if (statusFilter !== 'all') {
            matchesStatus = complaint.status === statusFilter;
        }

        return matchesCategory && matchesStatus;
    });

    const centerOnUser = () => {
        if (currentLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
            });
        }
    };

    const handleMarkerPress = (complaint) => {
        setSelectedComplaint(complaint);
        setShowComplaintDetails(true);

        Animated.timing(slideAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeComplaintDetails = () => {
        Animated.timing(slideAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setShowComplaintDetails(false);
            setSelectedComplaint(null);
        });
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const getMarkerColor = (category) => {
        if (!category) return theme.colors.primary;

        const categoryLower = category.toLowerCase();

        switch (categoryLower) {
            case 'waste':
            case 'déchets':
                return '#e74c3c';
            case 'roads':
            case 'routes':
                return '#3498db';
            case 'lighting':
            case 'éclairage':
                return '#f1c40f';
            case 'vandalism':
            case 'vandalisme':
                return '#9b59b6';
            case 'water':
            case 'eau':
                return '#2980b9';
            case 'vegetation':
            case 'végétation':
                return '#27ae60';
            case 'noise':
            case 'bruit':
                return '#e67e22';
            default:
                return theme.colors.primary;
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'New':
                return 'info';
            case 'In Progress':
                return 'warning';
            case 'Resolved':
                return 'success';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderCategoryIcon = (category) => {
        if (!category) return 'alert-circle';

        const categoryLower = category.toLowerCase();

        switch (categoryLower) {
            case 'waste':
            case 'déchets':
                return 'trash-can';
            case 'roads':
            case 'routes':
                return 'road';
            case 'lighting':
            case 'éclairage':
                return 'lightbulb';
            case 'vandalism':
            case 'vandalisme':
                return 'spray';
            case 'water':
            case 'eau':
                return 'water';
            case 'vegetation':
            case 'végétation':
                return 'tree';
            case 'noise':
            case 'bruit':
                return 'volume-high';
            default:
                return 'alert-circle';
        }
    };

    const renderMarkers = () => {
        return filteredComplaints.map((complaint) => {
            if (!complaint.latitude || !complaint.longitude) {
                return null;
            }

            return (
                <Marker
                    key={complaint.complaintId}
                    coordinate={{
                        latitude: complaint.latitude,
                        longitude: complaint.longitude
                    }}
                    title={complaint.title}
                    description={complaint.description}
                    onPress={() => handleMarkerPress(complaint)}
                >
                    <View style={styles.markerContainer}>
                        <View
                            style={[
                                styles.marker,
                                { backgroundColor: getMarkerColor(complaint.category?.label) },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name={renderCategoryIcon(complaint.category?.label)}
                                size={16}
                                color="white"
                            />
                        </View>
                    </View>
                </Marker>
            );
        }).filter(marker => marker !== null);
    };

    const renderMap = () => {
        return (
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={currentLocation || {
                    latitude: 34.0132,
                    longitude: -6.8326,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                }}
                showsUserLocation={locationPermissionGranted}
                showsMyLocationButton={false}
                showsCompass={true}
                showsScale={true}
                loadingEnabled={true}
            >
                {renderMarkers()}
            </MapView>
        );
    };

    const renderLoadingIndicator = () => {
        if (!isLoading) return null;

        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    };

    const renderComplaintDetails = () => {
        if (!selectedComplaint || !showComplaintDetails) return null;

        const translationY = slideAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [300, 0],
        });

        return (
            <Animated.View
                style={[
                    styles.complaintDetailsContainer,
                    {
                        transform: [{ translateY: translationY }],
                        backgroundColor: theme.colors.background,
                    },
                ]}
            >
                <View style={[styles.complaintDetailsHeader, { flexDirection: getFlexDirection() }]}>
                    <View
                        style={[
                            styles.complaintDetailsCategoryIcon,
                            { backgroundColor: getMarkerColor(selectedComplaint.category?.label) },
                            getMarginDirection(0, 12),
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={renderCategoryIcon(selectedComplaint.category?.label)}
                            size={20}
                            color="white"
                        />
                    </View>
                    <View style={styles.complaintDetailsTitleContainer}>
                        <Text
                            style={[
                                styles.complaintDetailsTitle,
                                { color: theme.colors.text, textAlign: getTextAlign() },
                            ]}
                        >
                            {selectedComplaint.title}
                        </Text>
                        <Badge
                            text={t(selectedComplaint.status.toLowerCase().replace(' ', '_'))}
                            variant={getStatusVariant(selectedComplaint.status)}
                            size="small"
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeComplaintDetails}
                    >
                        <MaterialCommunityIcons
                            name="close"
                            size={24}
                            color={theme.colors.secondary_text}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.complaintDetailsContent}>
                    <Text
                        style={[
                            styles.complaintDetailsDescription,
                            { color: theme.colors.text, textAlign: getTextAlign() },
                        ]}
                    >
                        {selectedComplaint.description}
                    </Text>

                    <View style={styles.complaintDetailsMetaContainer}>
                        <View style={[styles.complaintDetailsMeta, { flexDirection: getFlexDirection() }]}>
                            <MaterialCommunityIcons
                                name="map-marker"
                                size={16}
                                color={theme.colors.secondary_text}
                            />
                            <Text
                                style={[
                                    styles.complaintDetailsMetaText,
                                    {
                                        color: theme.colors.secondary_text,
                                        textAlign: getTextAlign(),
                                        ...getMarginDirection(8, 0),
                                    },
                                ]}
                                numberOfLines={1}
                            >
                                {`${selectedComplaint.latitude.toFixed(4)}, ${selectedComplaint.longitude.toFixed(4)}`}
                            </Text>
                        </View>

                        <View style={[styles.complaintDetailsMeta, { flexDirection: getFlexDirection() }]}>
                            <MaterialCommunityIcons
                                name="clock-outline"
                                size={16}
                                color={theme.colors.secondary_text}
                            />
                            <Text
                                style={[
                                    styles.complaintDetailsMetaText,
                                    {
                                        color: theme.colors.secondary_text,
                                        textAlign: getTextAlign(),
                                        ...getMarginDirection(8, 0),
                                    },
                                ]}
                            >
                                {formatDate(selectedComplaint.creationDate)}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.complaintDetailsActions, { flexDirection: getFlexDirection() }]}>
                    <TouchableOpacity
                        style={[
                            styles.complaintDetailsAction,
                            { backgroundColor: theme.colors.buttonPrimary },
                            getMarginDirection(0, 4),
                        ]}
                        onPress={() => navigation.navigate('ComplaintDetail', { complaintId: selectedComplaint.complaintId })}
                    >
                        <MaterialCommunityIcons
                            name="information-outline"
                            size={16}
                            color="white"
                        />
                        <Text style={[styles.complaintDetailsActionText, getMarginDirection(8, 0)]}>
                            {t('view_details')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.complaintDetailsAction,
                            { backgroundColor: theme.colors.buttonSecondary },
                            getMarginDirection(4, 0),
                        ]}
                        onPress={() => {
                            const scheme = Platform.select({
                                ios: 'maps:',
                                android: 'geo:',
                            });
                            const latLng = `${selectedComplaint.latitude},${selectedComplaint.longitude}`;
                            const url = Platform.select({
                                ios: `${scheme}?ll=${latLng}`,
                                android: `${scheme}${latLng}`,
                            });
                            Linking.openURL(url);
                        }}
                    >
                        <MaterialCommunityIcons
                            name="directions"
                            size={16}
                            color="white"
                        />
                        <Text style={[styles.complaintDetailsActionText, getMarginDirection(8, 0)]}>
                            {t('get_directions')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    const renderFiltersModal = () => {
        return (
            <Modal
                visible={showFilters}
                transparent
                animationType="slide"
                onRequestClose={toggleFilters}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.filtersContainer,
                            { backgroundColor: theme.colors.background },
                        ]}
                    >
                        <View style={[styles.filtersHeader, { flexDirection: getFlexDirection() }]}>
                            <Text
                                style={[
                                    styles.filtersTitle,
                                    { color: theme.colors.text, textAlign: getTextAlign() },
                                ]}
                            >
                                {t('filters')}
                            </Text>
                            <TouchableOpacity
                                style={styles.closeFiltersButton}
                                onPress={toggleFilters}
                            >
                                <MaterialCommunityIcons
                                    name="close"
                                    size={24}
                                    color={theme.colors.secondary_text}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.filterSection}>
                            <Text
                                style={[
                                    styles.filterSectionTitle,
                                    {
                                        color: theme.colors.text,
                                        textAlign: getTextAlign(),
                                        ...getMarginDirection(16, 16),
                                    },
                                ]}
                            >
                                {t('category')}
                            </Text>
                            <FlatList
                                data={CATEGORIES}
                                keyExtractor={(item) => item.id}
                                horizontal={!isRTL()}
                                inverted={isRTL()}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.filterOptionsList}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.filterOption,
                                            categoryFilter === item.id && {
                                                backgroundColor: theme.colors.selected_option_background,
                                                borderColor: theme.colors.primary,
                                            },
                                            {
                                                backgroundColor: theme.colors.option_background,
                                                borderColor: theme.colors.border,
                                                flexDirection: getFlexDirection(),
                                            },
                                        ]}
                                        onPress={() => setCategoryFilter(item.id)}
                                    >
                                        <MaterialCommunityIcons
                                            name={item.icon}
                                            size={20}
                                            color={theme.colors.primary}
                                            style={[styles.filterOptionIcon, getMarginDirection(0, 8)]}
                                        />
                                        <Text
                                            style={[
                                                styles.filterOptionText,
                                                { color: theme.colors.text, textAlign: getTextAlign() },
                                            ]}
                                        >
                                            {t(item.label)}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        <View style={styles.filterSection}>
                            <Text
                                style={[
                                    styles.filterSectionTitle,
                                    {
                                        color: theme.colors.text,
                                        textAlign: getTextAlign(),
                                        ...getMarginDirection(16, 16),
                                    },
                                ]}
                            >
                                {t('status')}
                            </Text>
                            <FlatList
                                data={STATUSES}
                                keyExtractor={(item) => item.id}
                                horizontal={!isRTL()}
                                inverted={isRTL()}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.filterOptionsList}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.filterOption,
                                            statusFilter === item.id && {
                                                backgroundColor: theme.colors.selected_option_background,
                                                borderColor: theme.colors.primary,
                                            },
                                            {
                                                backgroundColor: theme.colors.option_background,
                                                borderColor: theme.colors.border,
                                                flexDirection: getFlexDirection(),
                                            },
                                        ]}
                                        onPress={() => setStatusFilter(item.id)}
                                    >
                                        {item.id !== 'all' && (
                                            <View
                                                style={[
                                                    styles.statusDot,
                                                    { backgroundColor: item.color },
                                                    getMarginDirection(0, 8),
                                                ]}
                                            />
                                        )}
                                        <Text
                                            style={[
                                                styles.filterOptionText,
                                                { color: theme.colors.text, textAlign: getTextAlign() },
                                            ]}
                                        >
                                            {t(item.label)}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        <View style={[styles.filterActions, { flexDirection: getFlexDirection() }]}>
                            <TouchableOpacity
                                style={[
                                    styles.filterActionButton,
                                    styles.resetButton,
                                    { borderColor: theme.colors.border },
                                    getMarginDirection(0, 4),
                                ]}
                                onPress={() => {
                                    setCategoryFilter('all');
                                    setStatusFilter('all');
                                }}
                            >
                                <Text
                                    style={[
                                        styles.resetButtonText,
                                        { color: theme.colors.text, textAlign: 'center' },
                                    ]}
                                >
                                    {t('reset')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.filterActionButton,
                                    styles.applyButton,
                                    { backgroundColor: theme.colors.buttonPrimary },
                                    getMarginDirection(4, 0),
                                ]}
                                onPress={toggleFilters}
                            >
                                <Text style={[styles.applyButtonText, { textAlign: 'center' }]}>
                                    {t('apply_filters')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {renderMap()}
            {renderLoadingIndicator()}

            <View style={[styles.mapControls, getPositionDirection(undefined, 16)]}>
                <TouchableOpacity
                    style={[
                        styles.mapControl,
                        { backgroundColor: theme.colors.card },
                    ]}
                    onPress={toggleFilters}
                >
                    <MaterialCommunityIcons
                        name="filter-variant"
                        size={24}
                        color={theme.colors.primary}
                    />
                    <View
                        style={[
                            styles.filterBadge,
                            {
                                opacity:
                                    categoryFilter !== 'all' || statusFilter !== 'all' ? 1 : 0,
                            },
                        ]}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.mapControl,
                        { backgroundColor: theme.colors.card },
                    ]}
                    onPress={centerOnUser}
                    disabled={!locationPermissionGranted}
                >
                    <MaterialCommunityIcons
                        name="crosshairs-gps"
                        size={24}
                        color={
                            locationPermissionGranted
                                ? theme.colors.primary
                                : theme.colors.secondary_text
                        }
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.mapControl,
                        { backgroundColor: theme.colors.card },
                    ]}
                    onPress={refreshComplaints}
                >
                    <MaterialCommunityIcons
                        name="refresh"
                        size={24}
                        color={theme.colors.primary}
                    />
                </TouchableOpacity>
            </View>

            <View
                style={[
                    styles.complaintCountContainer,
                    { backgroundColor: theme.colors.card },
                    getPositionDirection(16, undefined),
                ]}
            >
                <Text
                    style={[
                        styles.complaintCountText,
                        { color: theme.colors.text, textAlign: getTextAlign() },
                    ]}
                >
                    {filteredComplaints.length} {t('issues_found')}
                </Text>
            </View>

            {renderComplaintDetails()}
            {renderFiltersModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
    mapControls: {
        position: 'absolute',
        top: 16,
        zIndex: 1,
    },
    mapControl: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    filterBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'red',
    },
    complaintCountContainer: {
        position: 'absolute',
        top: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    complaintCountText: {
        fontSize: 14,
        fontWeight: '500',
    },
    markerContainer: {
        alignItems: 'center',
    },
    marker: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    complaintDetailsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingTop: 16,
        paddingBottom: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    complaintDetailsHeader: {
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    complaintDetailsCategoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    complaintDetailsTitleContainer: {
        flex: 1,
    },
    complaintDetailsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    closeButton: {
        padding: 4,
    },
    complaintDetailsContent: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    complaintDetailsDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    complaintDetailsMetaContainer: {
        marginTop: 8,
    },
    complaintDetailsMeta: {
        alignItems: 'center',
        marginBottom: 4,
    },
    complaintDetailsMetaText: {
        fontSize: 12,
    },
    complaintDetailsActions: {
        paddingHorizontal: 16,
    },
    complaintDetailsAction: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },
    complaintDetailsActionText: {
        color: 'white',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    filtersContainer: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    filtersHeader: {
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    filtersTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeFiltersButton: {
        padding: 4,
    },
    filterSection: {
        marginBottom: 16,
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    filterOptionsList: {
        paddingHorizontal: 12,
    },
    filterOption: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    filterOptionIcon: {
    },
    filterOptionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    filterActions: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    filterActionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    resetButton: {
        borderWidth: 1,
    },
    resetButtonText: {
        fontWeight: '600',
    },
    applyButton: {
        flex: 1.5,
    },
    applyButtonText: {
        color: 'white',
        fontWeight: '600',
    },
});

export default MapScreen;