import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../localization/i18n';

const CommentsPreview = ({
                             comments = [],
                             theme,
                             onViewAllComments,
                             showLatest = 2
                         }) => {
    const { t } = useTranslation();

    const getFlexDirection = () => isRTL() ? 'row-reverse' : 'row';
    const getTextAlign = () => isRTL() ? 'right' : 'left';
    const getMarginDirection = (leftValue, rightValue) => {
        return isRTL()
            ? { marginRight: leftValue, marginLeft: rightValue }
            : { marginLeft: leftValue, marginRight: rightValue };
    };

    const getUserTypeColor = (citizen) => {
        if (!citizen) return theme.colors.secondary_text || '#666';

        const role = citizen.role?.toLowerCase();
        switch (role) {
            case 'admin':
                return '#FF6B6B';
            case 'agent':
            case 'municipal_agent':
                return '#4ECDC4';
            default:
                return theme.colors.primary || '#007AFF';
        }
    };

    const getRoleInfo = (citizen) => {
        if (!citizen) return { icon: 'account', text: t('unknown_user') };

        const role = citizen.role?.toLowerCase();
        switch (role) {
            case 'admin':
                return { icon: 'shield-crown', text: t('admin') };
            case 'agent':
            case 'municipal_agent':
                return { icon: 'account-tie', text: t('municipal_agent') };
            default:
                return { icon: 'account', text: t('citizen') };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.abs(now - date) / 36e5;

        if (diffInHours < 1) {
            return t('just_now');
        } else if (diffInHours < 24) {
            const hours = Math.floor(diffInHours);
            return t('hours_ago', { count: hours });
        } else {
            const days = Math.floor(diffInHours / 24);
            return t('days_ago', { count: days });
        }
    };

    if (!comments || comments.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.header, { flexDirection: getFlexDirection() }]}>
                    <MaterialCommunityIcons
                        name="comment-outline"
                        size={20}
                        color={theme.colors.secondary_text}
                        style={getMarginDirection(0, 8)}
                    />
                    <Text style={[
                        styles.title,
                        {
                            color: theme.colors.text,
                            textAlign: getTextAlign()
                        }
                    ]}>
                        {t('comments')} (0)
                    </Text>
                </View>

                <View style={styles.emptyState}>
                    <Text style={[
                        styles.emptyText,
                        {
                            color: theme.colors.secondary_text,
                            textAlign: getTextAlign()
                        }
                    ]}>
                        {t('no_comments_yet')}
                    </Text>
                </View>
            </View>
        );
    }

    const latestComments = comments.slice(0, showLatest);
    const remainingCount = Math.max(0, comments.length - showLatest);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.header, { flexDirection: getFlexDirection() }]}>
                <MaterialCommunityIcons
                    name="comment-multiple"
                    size={20}
                    color={theme.colors.primary}
                    style={getMarginDirection(0, 8)}
                />
                <Text style={[
                    styles.title,
                    {
                        color: theme.colors.text,
                        textAlign: getTextAlign()
                    }
                ]}>
                    {t('comments')} ({comments.length})
                </Text>
            </View>

            {latestComments.map((comment, index) => {
                const roleInfo = getRoleInfo(comment.citizen);
                const userColor = getUserTypeColor(comment.citizen);

                return (
                    <View
                        key={comment.id || index}
                        style={[
                            styles.commentPreview,
                            index === latestComments.length - 1 && styles.lastComment
                        ]}
                    >
                        <View style={[styles.userRow, { flexDirection: getFlexDirection() }]}>
                            <View style={[styles.userInfo, { flexDirection: getFlexDirection() }]}>
                                <MaterialCommunityIcons
                                    name={roleInfo.icon}
                                    size={14}
                                    color={userColor}
                                    style={getMarginDirection(0, 6)}
                                />
                                <Text style={[
                                    styles.userName,
                                    {
                                        color: userColor,
                                        textAlign: getTextAlign()
                                    }
                                ]}>
                                    {comment.citizen?.name || t('unknown_user')}
                                </Text>

                                {(comment.citizen?.role === 'Admin' || comment.citizen?.role?.toLowerCase().includes('agent')) && (
                                    <View style={[
                                        styles.roleBadge,
                                        { backgroundColor: `${userColor}20` },
                                        getMarginDirection(6, 0)
                                    ]}>
                                        <Text style={[
                                            styles.roleBadgeText,
                                            { color: userColor }
                                        ]}>
                                            {roleInfo.text}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <Text style={[
                                styles.timestamp,
                                {
                                    color: theme.colors.secondary_text,
                                    textAlign: getTextAlign()
                                }
                            ]}>
                                {formatDate(comment.commentDate)}
                            </Text>
                        </View>

                        <Text style={[
                            styles.commentText,
                            {
                                color: theme.colors.text,
                                textAlign: getTextAlign(),
                                writingDirection: isRTL() ? 'rtl' : 'ltr'
                            }
                        ]} numberOfLines={2}>
                            {comment.description}
                        </Text>
                    </View>
                );
            })}

            {(remainingCount > 0 || comments.length > showLatest) && (
                <TouchableOpacity
                    style={[styles.viewAllButton, { flexDirection: getFlexDirection() }]}
                    onPress={onViewAllComments}
                    activeOpacity={0.7}
                >
                    <Text style={[
                        styles.viewAllText,
                        {
                            color: theme.colors.primary,
                            textAlign: getTextAlign()
                        }
                    ]}>
                        {remainingCount > 0
                            ? t('view_all_comments_with_count', { count: remainingCount })
                            : t('view_all_comments')
                        }
                    </Text>
                    <MaterialCommunityIcons
                        name={isRTL() ? "chevron-left" : "chevron-right"}
                        size={16}
                        color={theme.colors.primary}
                        style={getMarginDirection(4, 0)}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        elevation: 2,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    header: {
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    commentPreview: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    lastComment: {
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 0,
    },
    userRow: {
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userInfo: {
        alignItems: 'center',
        flex: 1,
    },
    userName: {
        fontSize: 13,
        fontWeight: '600',
    },
    roleBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    roleBadgeText: {
        fontSize: 9,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    timestamp: {
        fontSize: 11,
        fontWeight: '500',
    },
    commentText: {
        fontSize: 13,
        lineHeight: 18,
        opacity: 0.9,
    },
    viewAllButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        marginTop: 4,
    },
    viewAllText: {
        fontSize: 13,
        fontWeight: '600',
    },
});

export default CommentsPreview;