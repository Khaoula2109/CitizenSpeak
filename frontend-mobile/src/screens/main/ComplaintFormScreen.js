import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ThemeContext } from '../../themes/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import CategoryService from '../../services/categories';
import ComplaintService from '../../services/complaints';
import { isRTL } from '../../localization/i18n';

const ComplaintFormScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();
    const [media, setMedia] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [globalLoading, setGlobalLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [location, setLocation] = useState(null);

    const schema = yup.object().shape({
        title: yup.string().required(t('title_required')),
        description: yup
            .string()
            .min(10, t('description_min_length'))
            .required(t('description_required')),
        categoryId: yup.string().required(t('category_required')),
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

    const getWritingDirection = () => {
        return isRTL() ? 'rtl' : 'ltr';
    };

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            title: '',
            description: '',
            categoryId: '',
        },
    });

    const selectedCategoryId = watch('categoryId');

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setCategoriesLoading(true);
                const data = await CategoryService.getAllCategories();
                setCategories(data);
                console.log('Categories loaded:', data.length);
            } catch (error) {
                console.error('Failed to load categories:', error);
                Alert.alert(t('error'), t('failed_to_load_categories'));
            } finally {
                setCategoriesLoading(false);
            }
        };

        loadCategories();
    }, []);

    useEffect(() => {
        setGlobalLoading(isLoading || locationLoading || categoriesLoading);
    }, [isLoading, locationLoading, categoriesLoading]);

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(t('permission_required'), t('location_permission_required'));
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error requesting location permission:', error);
            return false;
        }
    };

    const getCurrentLocation = async () => {
        try {
            setLocationLoading(true);
            const hasPermission = await requestLocationPermission();

            if (hasPermission) {
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });

                console.log('Location received:', location.coords);

                setLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                });
            }
        } catch (error) {
            Alert.alert(t('error'), t('failed_to_get_location'));
            console.error(error);
        } finally {
            setLocationLoading(false);
        }
    };

    const handleMediaSelection = async (type) => {
        try {
            let permissionResult;

            if (type === 'camera') {
                permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            } else {
                permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            }

            if (!permissionResult.granted) {
                Alert.alert(t('permission_required'), t(`${type}_permission_required`));
                return;
            }

            let result;
            const options = {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                allowsMultipleSelection: type !== 'camera',
            };

            if (type === 'camera') {
                result = await ImagePicker.launchCameraAsync(options);
            } else {
                result = await ImagePicker.launchImageLibraryAsync(options);
            }

            if (!result.canceled && result.assets && result.assets.length > 0) {
                if (media.length + result.assets.length > 5) {
                    Alert.alert(t('limit_reached'), t('max_photos_limit'));
                    return;
                }

                const newMedia = [...media];
                result.assets.forEach(asset => {
                    console.log('Selected media:', asset.uri);
                    newMedia.push({
                        uri: asset.uri,
                        type: asset.type || 'image/jpeg',
                        name: asset.fileName || `image_${Date.now()}.jpg`,
                    });
                });

                setMedia(newMedia);
            }
        } catch (error) {
            Alert.alert(t('error'), t('failed_to_select_media'));
            console.error(error);
        }
    };

    const removeMedia = (index) => {
        setMedia(prevMedia => {
            const newMedia = [...prevMedia];
            newMedia.splice(index, 1);
            return newMedia;
        });
    };

    const onSubmit = async (data) => {
        if (media.length === 0) {
            Alert.alert(t('media_required'), t('media_required_message'));
            return;
        }

        if (!location) {
            Alert.alert(t('location_required'), t('location_required_message'));
            return;
        }

        try {
            setIsLoading(true);
            console.log('Starting complaint submission...');

            const complaintData = {
                title: data.title,
                description: data.description,
                categoryId: data.categoryId,
                latitude: location.latitude,
                longitude: location.longitude
            };

            console.log('Submitting complaint:', complaintData);
            console.log(`Attaching ${media.length} media files`);

            const result = await ComplaintService.createComplaint(complaintData, media);
            console.log('Complaint submission successful:', result);

            setIsLoading(false);

            setMedia([]);
            reset({
                title: '',
                description: '',
                categoryId: '',
            });

            getCurrentLocation();

            Alert.alert(
                '✅ ' + t('complaint_submitted'),
                `${t('complaint_submitted_message')}\n\n🆔 ID de votre plainte: ${result.complaintId}\n\nVous allez être redirigé vers les détails de votre plainte.`,
                [
                    {
                        text: '📋 Copier l\'ID',
                        onPress: () => {
                            console.log('ID copied:', result.complaintId);
                            Alert.alert('✅ Copié', `L'ID ${result.complaintId} a été copié dans le presse-papiers.`);
                        },
                    },
                    {
                        text: '👁️ Voir maintenant',
                        onPress: () => {
                            navigation.navigate('ComplaintDetail', { complaintId: result.complaintId });
                        },
                        style: 'default'
                    },
                ],
                {
                    cancelable: false,
                    onDismiss: () => {
                        setTimeout(() => {
                            navigation.navigate('ComplaintDetail', { complaintId: result.complaintId });
                        }, 100);
                    }
                }
            );

            setTimeout(() => {
                navigation.navigate('ComplaintDetail', { complaintId: result.complaintId });
            }, 5000);

        } catch (error) {
            setIsLoading(false);
            console.error('Error submitting complaint:', error);
            Alert.alert(
                t('submission_error'),
                error.message || t('submission_error_message')
            );
        }
    };

    const renderCategories = () => {
        if (categoriesLoading) {
            return (
                <View style={[styles.loadingCategoriesContainer, { flexDirection: getFlexDirection() }]}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={[
                        { color: theme.colors.text, textAlign: getTextAlign() },
                        getMarginDirection(8, 0)
                    ]}>
                        {t('loading_categories')}
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.categoriesContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                    {t('select_category')}
                </Text>
                <View style={styles.categoriesGrid}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.categoryId}
                            style={[
                                styles.categoryItem,
                                {
                                    backgroundColor:
                                        selectedCategoryId === category.categoryId
                                            ? theme.colors.selected_option_background
                                            : theme.colors.option_background,
                                    borderColor:
                                        selectedCategoryId === category.categoryId
                                            ? theme.colors.primary
                                            : theme.colors.border,
                                },
                            ]}
                            onPress={() => setValue('categoryId', category.categoryId)}
                        >
                            <MaterialCommunityIcons
                                name={getCategoryIcon(category.label.toLowerCase())}
                                size={28}
                                color={theme.colors.primary}
                            />
                            <Text
                                style={[
                                    styles.categoryLabel,
                                    { color: theme.colors.text, textAlign: 'center' },
                                ]}
                            >
                                {category.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {errors.categoryId && (
                    <Text style={[styles.errorText, { textAlign: getTextAlign() }]}>{errors.categoryId.message}</Text>
                )}
            </View>
        );
    };

    const getCategoryIcon = (label) => {
        switch (label) {
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

    if (globalLoading) {
        return (
            <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                <View style={[styles.loadingContainer, { backgroundColor: theme.colors.card }]}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.loadingText, { color: theme.colors.text, textAlign: 'center' }]}>
                        {t('please_wait')}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.contentContainer}
        >
            {/* Title Input */}
            <View style={styles.inputSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                    {t('title')}
                </Text>
                <Controller
                    control={control}
                    name="title"
                    render={({ field: { onChange, value, onBlur } }) => (
                        <View>
                            <TextInput
                                style={[
                                    styles.textInput,
                                    {
                                        backgroundColor: theme.colors.inputBackground,
                                        borderColor: errors.title
                                            ? 'red'
                                            : theme.colors.border,
                                        color: theme.colors.text,
                                        textAlign: getTextAlign(),
                                        writingDirection: getWritingDirection(),
                                    },
                                ]}
                                placeholder={t('title_placeholder')}
                                placeholderTextColor={theme.colors.placeholder}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                            />
                            {errors.title && (
                                <Text style={[styles.errorText, { textAlign: getTextAlign() }]}>
                                    {errors.title.message}
                                </Text>
                            )}
                        </View>
                    )}
                />
            </View>

            {renderCategories()}

            <View style={styles.inputSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                    {t('description')}
                </Text>
                <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, value, onBlur } }) => (
                        <View>
                            <TextInput
                                style={[
                                    styles.textArea,
                                    {
                                        backgroundColor: theme.colors.inputBackground,
                                        borderColor: errors.description
                                            ? 'red'
                                            : theme.colors.border,
                                        color: theme.colors.text,
                                        textAlign: getTextAlign(),
                                        writingDirection: getWritingDirection(),
                                    },
                                ]}
                                placeholder={t('description_placeholder')}
                                placeholderTextColor={theme.colors.placeholder}
                                multiline
                                numberOfLines={5}
                                textAlignVertical="top"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                            />
                            {errors.description && (
                                <Text style={[styles.errorText, { textAlign: getTextAlign() }]}>
                                    {errors.description.message}
                                </Text>
                            )}
                        </View>
                    )}
                />
            </View>

            <View style={styles.inputSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                    {t('add_media')}
                </Text>
                <View style={[styles.mediaButtonsContainer, { flexDirection: getFlexDirection() }]}>
                    <TouchableOpacity
                        style={[
                            styles.mediaButton,
                            { backgroundColor: theme.colors.buttonSecondary },
                            getMarginDirection(0, isRTL() ? 8 : 0),
                        ]}
                        onPress={() => handleMediaSelection('camera')}
                    >
                        <MaterialCommunityIcons
                            name="camera"
                            size={24}
                            color={theme.colors.white}
                        />
                        <Text style={[styles.mediaButtonText, getMarginDirection(8, 0)]}>
                            {t('take_photo')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.mediaButton,
                            { backgroundColor: theme.colors.buttonPrimary },
                            getMarginDirection(isRTL() ? 0 : 8, 0),
                        ]}
                        onPress={() => handleMediaSelection('gallery')}
                    >
                        <MaterialCommunityIcons
                            name="image-multiple"
                            size={24}
                            color={theme.colors.white}
                        />
                        <Text style={[styles.mediaButtonText, getMarginDirection(8, 0)]}>
                            {t('choose_from_gallery')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {media.length > 0 && (
                    <ScrollView
                        horizontal={!isRTL()}
                        inverted={isRTL()}
                        showsHorizontalScrollIndicator={false}
                        style={styles.mediaPreviewScroll}
                    >
                        {media.map((item, index) => (
                            <View key={index} style={[
                                styles.mediaPreviewContainer,
                                getMarginDirection(0, 12),
                            ]}>
                                <Image
                                    source={{ uri: item.uri }}
                                    style={styles.mediaPreview}
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.removeMediaButton,
                                        { backgroundColor: theme.colors.primary },
                                    ]}
                                    onPress={() => removeMedia(index)}
                                >
                                    <MaterialCommunityIcons
                                        name="close"
                                        size={16}
                                        color={theme.colors.white}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>

            <View style={styles.inputSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                    {t('location')}
                </Text>

                <View style={[styles.mapContainer, { borderColor: theme.colors.border }]}>
                    {location ? (
                        <MapView
                            style={styles.map}
                            initialRegion={location}
                            region={location}
                        >
                            <Marker
                                coordinate={{
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                }}
                                draggable
                                onDragEnd={(e) => {
                                    const newLocation = {
                                        ...location,
                                        latitude: e.nativeEvent.coordinate.latitude,
                                        longitude: e.nativeEvent.coordinate.longitude,
                                    };
                                    setLocation(newLocation);
                                }}
                            />
                        </MapView>
                    ) : (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator
                                size="large"
                                color={theme.colors.primary}
                            />
                            <Text style={[
                                { color: theme.colors.text, marginTop: 10, textAlign: 'center' }
                            ]}>
                                {t('loading_map')}
                            </Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={[
                        styles.refreshLocationButton,
                        { backgroundColor: theme.colors.buttonSecondary, flexDirection: getFlexDirection() },
                    ]}
                    onPress={getCurrentLocation}
                    disabled={locationLoading}
                >
                    {locationLoading ? (
                        <ActivityIndicator size="small" color={theme.colors.white} />
                    ) : (
                        <>
                            <MaterialCommunityIcons
                                name="crosshairs-gps"
                                size={20}
                                color={theme.colors.white}
                            />
                            <Text style={[styles.refreshLocationText, getMarginDirection(8, 0)]}>
                                {t('refresh_location')}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[
                    styles.submitButton,
                    { backgroundColor: theme.colors.buttonPrimary, flexDirection: getFlexDirection() },
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                    <>
                        <MaterialCommunityIcons
                            name="send"
                            size={20}
                            color={theme.colors.white}
                            style={[styles.submitIcon, getMarginDirection(0, 8)]}
                        />
                        <Text style={[styles.submitButtonText, { textAlign: 'center' }]}>
                            {t('submit_complaint')}
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        padding: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    inputSection: {
        marginBottom: 24,
    },
    textInput: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },
    categoriesContainer: {
        marginBottom: 24,
    },
    loadingCategoriesContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryItem: {
        width: '48%',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryLabel: {
        marginTop: 8,
        fontWeight: '500',
    },
    mediaButtonsContainer: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    mediaButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        width: '48%',
    },
    mediaButtonText: {
        color: 'white',
        fontWeight: '500',
    },
    mediaPreviewScroll: {
        marginBottom: 8,
    },
    mediaPreviewContainer: {
        position: 'relative',
    },
    mediaPreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removeMediaButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapContainer: {
        height: 200,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        marginBottom: 12,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    refreshLocationButton: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        borderRadius: 8,
        marginTop: 8,
    },
    refreshLocationText: {
        color: 'white',
        fontWeight: '500',
    },
    submitButton: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    submitIcon: {
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    }
});

export default ComplaintFormScreen;