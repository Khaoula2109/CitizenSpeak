import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { ThemeContext } from '../../themes/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import ComplaintService from '../../services/complaints';
import { isRTL, getCurrentLanguage } from '../../localization/i18n';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const currentLanguage = getCurrentLanguage();

    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-50)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;

    const getFlexDirection = () => isRTL() ? 'row-reverse' : 'row';
    const getTextAlign = () => isRTL() ? 'right' : 'left';
    const getMarginDirection = (leftValue, rightValue) => {
        return isRTL()
            ? { marginRight: leftValue, marginLeft: rightValue }
            : { marginLeft: leftValue, marginRight: rightValue };
    };

    useEffect(() => {
        const startAnimations = () => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            Animated.spring(bounceAnim, {
                toValue: 1,
                tension: 30,
                friction: 6,
                useNativeDriver: true,
            }).start();
        };

        const timer = setTimeout(startAnimations, 300);
        return () => clearTimeout(timer);
    }, []);

    const startRotateAnimation = () => {
        rotateAnim.setValue(0);
        Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    };

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            setIsLoading(true);
            console.log('🏠 HomeScreen: Loading complaints...');

            const data = await ComplaintService.getMyComplaints();
            console.log(`🏠 HomeScreen: Loaded ${data?.length || 0} complaints`);

            if (data && data.length > 0) {
                data.forEach((complaint, index) => {
                    if (!complaint.complaintId) {
                        console.warn(`⚠️ HomeScreen: Complaint ${index} missing complaintId:`, complaint);
                    } else {
                        console.log(`✅ HomeScreen: Complaint ${index} has ID: ${complaint.complaintId}`);
                    }
                });
            }

            setComplaints(data || []);
        } catch (error) {
            console.error('❌ HomeScreen: Failed to load complaints:', error);
            Alert.alert(
                t('error'),
                t('failed_to_load_complaints'),
                [{ text: t('retry'), onPress: loadComplaints }]
            );
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        startRotateAnimation();
        loadComplaints();
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
        let color, icon;
        switch (status?.toLowerCase()) {
            case 'new':
            case 'submitted':
                color = '#3498db';
                icon = 'clock-outline';
                break;
            case 'in progress':
                color = '#f39c12';
                icon = 'progress-clock';
                break;
            case 'assigned':
                color = '#f39c12';
                icon = 'account-check-outline';
                break;
            case 'intervention scheduled':
                color = '#f39c12';
                icon = 'calendar-clock';
                break;
            case 'resolved':
                color = '#2ecc71';
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
                        backgroundColor: color + '20',
                        borderColor: color,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                <MaterialCommunityIcons
                    name={icon}
                    size={12}
                    color={color}
                    style={getMarginDirection(0, 4)}
                />
                <Text style={[styles.statusText, { color: color }]}>
                    {getTranslatedStatus(status)}
                </Text>
            </Animated.View>
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
            <Animated.View
                style={[
                    styles.categoryIcon,
                    {
                        backgroundColor: `${iconColor}20`,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
            </Animated.View>
        );
    };

    const renderComplaintCard = ({ item, index }) => {
        const handlePress = () => {
            console.log(`🏠 HomeScreen: Navigating to complaint details`);
            console.log(`📄 Item data:`, {
                id: item.id,
                complaintId: item.complaintId,
                title: item.title,
                status: item.status
            });

            if (!item.complaintId) {
                console.error('❌ HomeScreen: No complaintId found for navigation!');
                Alert.alert(
                    t('error'),
                    'ID de plainte manquant. Impossible d\'ouvrir les détails.'
                );
                return;
            }

            console.log(`🔗 HomeScreen: Navigating with complaintId: ${item.complaintId}`);
            navigation.navigate('ComplaintDetail', { complaintId: item.complaintId });
        };

        return (
            <Animated.View
                style={[
                    styles.complaintCard,
                    {
                        backgroundColor: theme.colors.card,
                        shadowColor: theme.colors.shadow,
                        transform: [{ scale: scaleAnim }],
                        opacity: fadeAnim,
                    },
                ]}
            >
                <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
                    <View style={[styles.complaintHeader, { flexDirection: getFlexDirection() }]}>
                        {renderCategoryIcon(item.category)}
                        <View style={[styles.complaintHeaderText, getMarginDirection(12, 0)]}>
                            <View style={[styles.titleRow, { flexDirection: getFlexDirection() }]}>
                                <Text
                                    style={[
                                        styles.complaintTitle,
                                        { color: theme.colors.text, textAlign: getTextAlign() }
                                    ]}
                                    numberOfLines={1}
                                >
                                    {item.title}
                                </Text>
                                {item.complaintId && (
                                    <Text
                                        style={[
                                            styles.complaintId,
                                            { color: theme.colors.primary, textAlign: getTextAlign() }
                                        ]}
                                    >
                                        {item.complaintId}
                                    </Text>
                                )}
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
                            style={[styles.viewDetailsButton, { backgroundColor: theme.colors.primary + '15' }]}
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
            </Animated.View>
        );
    };

    const renderEmptyComponent = () => (
        <Animated.View
            style={[
                styles.emptyContainer,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                }
            ]}
        >
            <Animated.View
                style={[
                    styles.emptyIconContainer,
                    {
                        backgroundColor: theme.colors.primary + '20',
                        transform: [{ rotate: rotateAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg']
                            })}]
                    }
                ]}
            >
                <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={60}
                    color={theme.colors.primary}
                />
            </Animated.View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                {t('no_complaints_yet')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.secondary_text, textAlign: getTextAlign() }]}>
                {t('start_reporting_issues')}
            </Text>
            <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('Report')}
            >
                <MaterialCommunityIcons name="plus" size={20} color="white" style={getMarginDirection(0, 8)} />
                <Text style={styles.emptyButtonText}>{t('submit_new')}</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderStatsCard = (title, value, color, icon, delay = 0) => {
        return (
            <Animated.View
                style={[
                    styles.statCard,
                    {
                        backgroundColor: theme.colors.card,
                        transform: [{ scale: scaleAnim }],
                        shadowColor: color,
                    }
                ]}
            >
                <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                    <MaterialCommunityIcons name={icon} size={24} color={color} />
                </View>
                <Text style={[styles.statTitle, { color: theme.colors.secondary_text, textAlign: getTextAlign() }]}>
                    {title}
                </Text>
                <Animated.Text
                    style={[
                        styles.statValue,
                        {
                            color: color,
                            textAlign: getTextAlign(),
                            transform: [{ scale: bounceAnim }]
                        }
                    ]}
                >
                    {value}
                </Animated.Text>
            </Animated.View>
        );
    };

    if (isLoading && !refreshing) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <Animated.View style={{ transform: [{ rotate: rotateAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg']
                        }) }] }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </Animated.View>
                <Text style={[styles.loadingText, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                    {t('loading_complaints')}...
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={[
                        styles.header,
                        {
                            flexDirection: getFlexDirection(),
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }
                    ]}
                >
                    <View>
                        <Text style={[styles.welcomeText, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                            {t('welcome_back')}
                        </Text>
                        <Text style={[styles.userName, { color: theme.colors.primary, textAlign: getTextAlign() }]}>
                            {user?.name || t('user')} 👋
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.notificationButton, { backgroundColor: theme.colors.primary + '15' }]}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <MaterialCommunityIcons
                            name="bell-outline"
                            size={24}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>
                </Animated.View>

                <View style={[styles.statsContainer, { flexDirection: getFlexDirection() }]}>
                    {renderStatsCard(
                        t('total_reports'),
                        complaints.length,
                        theme.colors.primary,
                        'chart-box',
                        0
                    )}
                    {renderStatsCard(
                        t('pending'),
                        complaints.filter(c => c.status !== 'Resolved').length,
                        '#f39c12',
                        'clock-outline',
                        200
                    )}
                    {renderStatsCard(
                        t('resolved'),
                        complaints.filter(c => c.status === 'Resolved').length,
                        '#2ecc71',
                        'check-circle',
                        400
                    )}
                </View>

                <Animated.View
                    style={[
                        styles.sectionHeader,
                        {
                            flexDirection: getFlexDirection(),
                            opacity: fadeAnim,
                        }
                    ]}
                >
                    <Text style={[styles.sectionTitle, { color: theme.colors.text, textAlign: getTextAlign() }]}>
                        {t('recent_reports')}
                    </Text>
                    <TouchableOpacity
                        style={styles.seeAllButton}
                        onPress={() => navigation.navigate('ComplaintHistory')}
                    >
                        <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                            {t('see_all')}
                        </Text>
                        <MaterialCommunityIcons
                            name={isRTL() ? "arrow-left" : "arrow-right"}
                            size={16}
                            color={theme.colors.primary}
                            style={getMarginDirection(4, 0)}
                        />
                    </TouchableOpacity>
                </Animated.View>

                <FlatList
                    data={complaints.slice(0, 5)}
                    renderItem={renderComplaintCard}
                    keyExtractor={(item) => item.complaintId || item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyComponent}
                    scrollEnabled={false}
                />
            </ScrollView>

            <Animated.View
                style={[
                    styles.fabContainer,
                    {
                        transform: [
                            { scale: pulseAnim },
                            { scale: fadeAnim }
                        ],
                    },
                ]}
            >
                <TouchableOpacity
                    style={[styles.fabButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => navigation.navigate('Report')}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="plus" size={28} color="white" />
                </TouchableOpacity>
            </Animated.View>
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
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingTop: 10,
    },
    welcomeText: {
        fontSize: 16,
        opacity: 0.8,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 4,
    },
    notificationButton: {
        padding: 12,
        borderRadius: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    statCard: {
        width: '31%',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 4,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statTitle: {
        fontSize: 11,
        marginBottom: 4,
        textAlign: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '500',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
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
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    complaintHeaderText: {
        flex: 1,
    },
    titleRow: {
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 11,
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
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
    fabContainer: {
        position: 'absolute',
        bottom: 24,
        right: 24,
    },
    fabButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
});

export default HomeScreen;