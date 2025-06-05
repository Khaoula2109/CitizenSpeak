import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { isRTL, getCurrentLanguage } from '../../localization/i18n';

const StatusTimeline = ({ statusHistory, theme }) => {
    const { t } = useTranslation();
    const currentLanguage = getCurrentLanguage();

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

    if (!statusHistory || statusHistory.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text
                    style={[
                        styles.emptyText,
                        {
                            color: theme.colors.secondary_text,
                            textAlign: getTextAlign(),
                        }
                    ]}
                >
                    {t('no_status_history')}
                </Text>
            </View>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);

        // Configuration de la locale selon la langue courante
        let locale = 'en-US';
        if (currentLanguage === 'fr') {
            locale = 'fr-FR';
        } else if (currentLanguage === 'ar') {
            locale = 'ar-MA';
        }

        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'New':
            case 'Submitted':
                return 'file-document-outline';
            case 'In Progress':
                return 'progress-clock';
            case 'Assigned':
                return 'account-check-outline';
            case 'Intervention Scheduled':
                return 'calendar-clock';
            case 'Resolved':
                return 'check-circle-outline';
            default:
                return 'information-outline';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New':
            case 'Submitted':
                return theme.colors.statusSubmitted;
            case 'In Progress':
                return theme.colors.statusInProgress;
            case 'Assigned':
                return theme.colors.statusInProgress;
            case 'Intervention Scheduled':
                return theme.colors.statusInProgress;
            case 'Resolved':
                return theme.colors.statusResolved;
            default:
                return theme.colors.secondary_text;
        }
    };

    const getTranslatedStatus = (status) => {
        switch (status.toLowerCase()) {
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

    const getUserDisplayName = (user) => {
        if (!user?.name) {
            return t('system');
        }
        return user.name;
    };

    const getRoleBadge = (role) => {
        if (role === 'Admin') {
            return t('staff');
        }
        return '';
    };

    return (
        <View style={styles.container}>
            {statusHistory.map((item, index) => (
                <View key={item.id || index} style={[styles.timelineItem, { flexDirection: getFlexDirection() }]}>
                    <View style={[styles.timelineLine, isRTL() && { alignItems: 'center' }]}>
                        <View
                            style={[
                                styles.timelineDot,
                                { backgroundColor: getStatusColor(item.status) },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name={getStatusIcon(item.status)}
                                size={12}
                                color="white"
                            />
                        </View>
                        {index < statusHistory.length - 1 && (
                            <View
                                style={[
                                    styles.timelineVerticalLine,
                                    { backgroundColor: theme.colors.border },
                                ]}
                            />
                        )}
                    </View>
                    <View style={[styles.timelineContent, getMarginDirection(8, 0)]}>
                        <View style={[styles.timelineHeader, { flexDirection: getFlexDirection() }]}>
                            <Text
                                style={[
                                    styles.timelineStatus,
                                    {
                                        color: theme.colors.text,
                                        textAlign: getTextAlign(),
                                    }
                                ]}
                            >
                                {getTranslatedStatus(item.status)}
                            </Text>
                            <Text
                                style={[
                                    styles.timelineDate,
                                    {
                                        color: theme.colors.secondary_text,
                                        textAlign: getTextAlign(),
                                    }
                                ]}
                            >
                                {formatDate(item.statusDate)}
                            </Text>
                        </View>
                        {item.notes && (
                            <Text
                                style={[
                                    styles.timelineNotes,
                                    {
                                        color: theme.colors.text,
                                        textAlign: getTextAlign(),
                                        writingDirection: isRTL() ? 'rtl' : 'ltr',
                                    }
                                ]}
                            >
                                {item.notes}
                            </Text>
                        )}
                        {item.updatedBy && (
                            <View style={[styles.userContainer, { flexDirection: getFlexDirection() }]}>
                                <Text
                                    style={[
                                        styles.timelineUser,
                                        {
                                            color: theme.colors.secondary_text,
                                            textAlign: getTextAlign(),
                                        }
                                    ]}
                                >
                                    {getUserDisplayName(item.updatedBy)}
                                </Text>
                                {item.updatedBy.role === 'Admin' && (
                                    <Text
                                        style={[
                                            styles.roleBadge,
                                            {
                                                color: theme.colors.primary,
                                                textAlign: getTextAlign(),
                                            },
                                            getMarginDirection(4, 0),
                                        ]}
                                    >
                                        ({getRoleBadge(item.updatedBy.role)})
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 4,
    },
    emptyContainer: {
        padding: 12,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    timelineLine: {
        width: 24,
        alignItems: 'center',
    },
    timelineDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timelineVerticalLine: {
        width: 2,
        flex: 1,
        marginTop: 4,
        marginBottom: -8,
    },
    timelineContent: {
        flex: 1,
        marginLeft: 8,
    },
    timelineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    timelineStatus: {
        fontWeight: '600',
        fontSize: 14,
        flex: 1,
    },
    timelineDate: {
        fontSize: 12,
    },
    timelineNotes: {
        fontSize: 14,
        marginBottom: 4,
        lineHeight: 20,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    timelineUser: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    roleBadge: {
        fontSize: 12,
        fontStyle: 'italic',
    },
});

export default StatusTimeline;