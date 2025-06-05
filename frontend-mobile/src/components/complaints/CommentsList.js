import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    TextInput,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isRTL } from '../../localization/i18n';

const API_BASE_URL = process.env.API_URL;

const CommentsList = ({
                          comments = [],
                          theme,
                          currentUserId,
                          currentUserEmail,
                          onCommentUpdated,
                          onCommentDeleted,
                          apiBaseUrl
                      }) => {
    const { t } = useTranslation();
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(null);
    const editInputRef = useRef(null);

    const baseUrl = apiBaseUrl || API_BASE_URL;

    const getFlexDirection = () => isRTL() ? 'row-reverse' : 'row';
    const getTextAlign = () => isRTL() ? 'right' : 'left';
    const getAlignSelf = (isOwn) => {
        if (isRTL()) {
            return isOwn ? 'flex-start' : 'flex-end';
        }
        return isOwn ? 'flex-end' : 'flex-start';
    };
    const getMarginDirection = (leftValue, rightValue) => {
        return isRTL()
            ? { marginRight: leftValue, marginLeft: rightValue }
            : { marginLeft: leftValue, marginRight: rightValue };
    };

    const getAuthorInfo = (comment) => {
        const isCorruptedData = (data) => {
            return !data ||
                data.id === "unknown" ||
                data.name === "Utilisateur inconnu" ||
                data.id?.startsWith("invalid-") ||
                !data.id ||
                !data.name;
        };

        if (comment.author && !isCorruptedData(comment.author)) {
            return {
                source: 'author',
                data: comment.author
            };
        }

        if (comment.authorType === 'CITIZEN' && comment.citizen && !isCorruptedData(comment.citizen)) {
            return {
                source: 'citizen',
                data: comment.citizen
            };
        }

        if (comment.authorType === 'AGENT' && comment.agent && !isCorruptedData(comment.agent)) {
            return {
                source: 'agent',
                data: comment.agent
            };
        }

        if (!comment.authorType || comment.authorType === null) {
            // Vérifier agent en premier (plus spécifique)
            if (comment.agent && !isCorruptedData(comment.agent)) {
                return {
                    source: 'agent-autodetect',
                    data: {
                        ...comment.agent,
                        type: 'AGENT'
                    }
                };
            }

            if (comment.citizen && !isCorruptedData(comment.citizen)) {
                return {
                    source: 'citizen-autodetect',
                    data: {
                        ...comment.citizen,
                        type: 'CITIZEN'
                    }
                };
            }
        }

        if (comment.citizen && !isCorruptedData(comment.citizen)) {
            return {
                source: 'citizen-fallback',
                data: {
                    ...comment.citizen,
                    type: 'CITIZEN'
                }
            };
        }

        if (comment.agent && !isCorruptedData(comment.agent)) {
            return {
                source: 'agent-fallback',
                data: {
                    ...comment.agent,
                    type: 'AGENT'
                }
            };
        }

        if (comment.authorType === 'INVALID' || comment.authorType === 'CORRUPTED') {
            return {
                source: 'corrupted',
                data: {
                    id: comment.id,
                    name: '[Commentaire corrompu]',
                    email: '',
                    role: 'corrupted',
                    type: 'CORRUPTED'
                }
            };
        }

        return {
            source: 'none',
            data: {
                id: comment.id,
                name: '[Données manquantes]',
                email: '',
                role: 'unknown',
                type: 'UNKNOWN'
            }
        };
    };

    const getUserType = (author, sourceType) => {
        if (!author) return 'unknown';

        if (author.type === 'CORRUPTED' || author.role === 'corrupted') {
            return 'corrupted';
        }

        if (author.type === 'UNKNOWN' || sourceType === 'none') {
            return 'unknown';
        }

        if (author.type === 'AGENT') {
            return 'agent';
        }

        if (author.type === 'CITIZEN') {
            return 'citizen';
        }

        if (sourceType === 'agent-autodetect' || sourceType === 'agent-fallback' || sourceType === 'agent') {
            return 'agent';
        }

        const role = author.role?.toLowerCase();
        switch (role) {
            case 'admin':
                return 'admin';
            case 'agent':
            case 'municipal_agent':
                return 'agent';
            case 'citizen':
                return 'citizen';
            default:
                if (author.service) {
                    return 'agent';
                }
                return 'citizen';
        }
    };

    const getUserColors = (userType, isOwn) => {
        if (isOwn) {
            return {
                bubble: theme.colors.primary || '#007AFF',
                text: '#FFFFFF',
                name: '#FFFFFF',
                time: 'rgba(255, 255, 255, 0.8)',
                badge: 'rgba(255, 255, 255, 0.2)',
                badgeText: '#FFFFFF'
            };
        }

        switch (userType) {
            case 'admin':
                return {
                    bubble: '#FF6B6B',
                    text: '#FFFFFF',
                    name: '#FFFFFF',
                    time: 'rgba(255, 255, 255, 0.8)',
                    badge: 'rgba(255, 255, 255, 0.2)',
                    badgeText: '#FFFFFF'
                };
            case 'agent':
                return {
                    bubble: '#4ECDC4',
                    text: '#FFFFFF',
                    name: '#FFFFFF',
                    time: 'rgba(255, 255, 255, 0.8)',
                    badge: 'rgba(255, 255, 255, 0.2)',
                    badgeText: '#FFFFFF'
                };
            case 'corrupted':
                return {
                    bubble: '#FF9500',
                    text: '#FFFFFF',
                    name: '#FFFFFF',
                    time: 'rgba(255, 255, 255, 0.8)',
                    badge: 'rgba(255, 255, 255, 0.2)',
                    badgeText: '#FFFFFF'
                };
            case 'unknown':
                return {
                    bubble: '#8E8E93',
                    text: '#FFFFFF',
                    name: '#FFFFFF',
                    time: 'rgba(255, 255, 255, 0.8)',
                    badge: 'rgba(255, 255, 255, 0.2)',
                    badgeText: '#FFFFFF'
                };
            default:
                return {
                    bubble: theme.colors.card || '#F0F0F0',
                    text: theme.colors.text || '#000000',
                    name: theme.colors.primary || '#007AFF',
                    time: theme.colors.secondary_text || '#666666',
                    badge: theme.colors.primary || '#007AFF',
                    badgeText: '#FFFFFF'
                };
        }
    };

    const getRoleBadge = (userType, author) => {
        switch (userType) {
            case 'admin':
                return {
                    icon: 'shield-crown',
                    text: t('admin'),
                    show: true
                };
            case 'agent':
                const serviceText = author?.service ?
                    `${t('municipal_agent')} (${author.service})` :
                    t('municipal_agent');
                return {
                    icon: 'account-tie',
                    text: serviceText,
                    show: true
                };
            case 'corrupted':
                return {
                    icon: 'alert-circle',
                    text: 'Données corrompues',
                    show: true
                };
            case 'unknown':
                return {
                    icon: 'help-circle',
                    text: 'Utilisateur inconnu',
                    show: true
                };
            default:
                return {
                    icon: null,
                    text: null,
                    show: false
                };
        }
    };

    const isOwnComment = (comment) => {
        if (!comment) return false;

        if (!currentUserId && !currentUserEmail) {
            return false;
        }

        const authorInfo = getAuthorInfo(comment);
        const author = authorInfo.data;

        if (!author) {
            return false;
        }

        return (
            (currentUserId && author.id === currentUserId) ||
            (currentUserEmail && author.email === currentUserEmail)
        );
    };

    const getAuthorDisplayName = (authorInfo, userType) => {
        if (!authorInfo.data) {
            return t('unknown_user');
        }

        let displayName = authorInfo.data.name || t('unknown_user');

        if (userType === 'agent' && authorInfo.data.service) {
            displayName += ` (${authorInfo.data.service})`;
        }

        return displayName;
    };

    const formatCommentDate = (dateString) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.abs(now - date) / 36e5;

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (diffInHours < 168) { // Less than a week
            return date.toLocaleDateString([], {
                weekday: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const handleEditComment = (comment) => {
        setEditingComment(comment.id);
        setEditText(comment.description);
        setTimeout(() => {
            editInputRef.current?.focus();
        }, 100);
    };

    const handleSaveEdit = async () => {
        if (!editText.trim() || !editingComment || isUpdating) return;

        try {
            setIsUpdating(true);

            const token = await AsyncStorage.getItem('auth_token');
            if (!token) {
                throw new Error(t('authentication_required'));
            }

            const response = await fetch(`${baseUrl}/api/comments/${editingComment}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ description: editText.trim() })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur serveur (${response.status}): ${errorText}`);
            }

            const updatedComment = await response.json();

            setEditingComment(null);
            setEditText('');

            if (onCommentUpdated) {
                onCommentUpdated(updatedComment);
            }

            Alert.alert(t('success'), t('comment_updated_successfully'));
        } catch (error) {
            Alert.alert(t('error'), error.message || t('comment_update_error'));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingComment(null);
        setEditText('');
    };

    const handleDeleteComment = (commentId) => {
        Alert.alert(
            t('delete_comment'),
            t('delete_comment_confirmation'),
            [
                {
                    text: t('cancel'),
                    style: 'cancel'
                },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: () => confirmDeleteComment(commentId)
                }
            ]
        );
    };

    const confirmDeleteComment = async (commentId) => {
        try {
            setIsDeleting(commentId);

            const token = await AsyncStorage.getItem('auth_token');
            if (!token) {
                throw new Error(t('authentication_required'));
            }

            const response = await fetch(`${baseUrl}/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erreur serveur (${response.status}): ${errorText}`);
            }

            if (onCommentDeleted) {
                onCommentDeleted(commentId);
            }

            Alert.alert(t('success'), t('comment_deleted_successfully'));
        } catch (error) {
            Alert.alert(t('error'), error.message || t('comment_delete_error'));
        } finally {
            setIsDeleting(null);
        }
    };

    const showCommentOptions = (comment) => {
        if (!isOwnComment(comment)) return;

        Alert.alert(
            t('comment_options'),
            '',
            [
                {
                    text: t('edit'),
                    onPress: () => handleEditComment(comment)
                },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: () => handleDeleteComment(comment.id)
                },
                {
                    text: t('cancel'),
                    style: 'cancel'
                }
            ]
        );
    };

    if (!comments || comments.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                    name="comment-outline"
                    size={48}
                    color={theme.colors.secondary_text || '#999'}
                />
                <Text style={[
                    styles.emptyText,
                    {
                        color: theme.colors.secondary_text || '#999',
                        textAlign: getTextAlign()
                    }
                ]}>
                    {t('no_comments_yet')}
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {comments.map((comment, index) => {
                const authorInfo = getAuthorInfo(comment);
                const author = authorInfo.data;
                const userType = getUserType(author, authorInfo.source);
                const isOwn = isOwnComment(comment);

                const colors = getUserColors(userType, isOwn);
                const badge = getRoleBadge(userType, author);
                const isBeingDeleted = isDeleting === comment.id;

                return (
                    <View
                        key={comment.id || index}
                        style={[
                            styles.commentContainer,
                            { alignSelf: getAlignSelf(isOwn) },
                            isOwn && styles.ownCommentContainer
                        ]}
                    >
                        <TouchableOpacity
                            style={[
                                styles.commentBubble,
                                {
                                    backgroundColor: colors.bubble,
                                    alignSelf: getAlignSelf(isOwn),
                                },
                                isOwn && styles.ownCommentBubble,
                                !isOwn && styles.otherCommentBubble
                            ]}
                            onLongPress={() => showCommentOptions(comment)}
                            disabled={isBeingDeleted}
                        >
                            {!isOwn && badge.show && (
                                <View style={[
                                    styles.roleBadge,
                                    {
                                        backgroundColor: colors.badge,
                                        alignSelf: isRTL() ? 'flex-end' : 'flex-start'
                                    }
                                ]}>
                                    <MaterialCommunityIcons
                                        name={badge.icon}
                                        size={12}
                                        color={colors.badgeText}
                                        style={getMarginDirection(0, 4)}
                                    />
                                    <Text style={[
                                        styles.roleBadgeText,
                                        {
                                            color: colors.badgeText,
                                            textAlign: getTextAlign()
                                        }
                                    ]}>
                                        {badge.text}
                                    </Text>
                                </View>
                            )}

                            {!isOwn && (
                                <Text style={[
                                    styles.userName,
                                    {
                                        color: colors.name,
                                        textAlign: getTextAlign()
                                    }
                                ]}>
                                    {getAuthorDisplayName(authorInfo, userType)}
                                </Text>
                            )}

                            {editingComment === comment.id ? (
                                <View style={styles.editContainer}>
                                    <TextInput
                                        ref={editInputRef}
                                        style={[
                                            styles.editInput,
                                            {
                                                color: colors.text,
                                                textAlign: getTextAlign(),
                                                writingDirection: isRTL() ? 'rtl' : 'ltr'
                                            }
                                        ]}
                                        value={editText}
                                        onChangeText={setEditText}
                                        multiline
                                        maxLength={500}
                                        placeholder={t('edit_comment')}
                                        placeholderTextColor={`${colors.text}80`}
                                    />
                                    <View style={[
                                        styles.editActions,
                                        { flexDirection: getFlexDirection() }
                                    ]}>
                                        <TouchableOpacity
                                            style={[
                                                styles.editButton,
                                                styles.cancelButton,
                                                getMarginDirection(0, 8)
                                            ]}
                                            onPress={handleCancelEdit}
                                            disabled={isUpdating}
                                        >
                                            <MaterialCommunityIcons
                                                name="close"
                                                size={16}
                                                color={colors.text}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.editButton,
                                                styles.saveButton,
                                                !editText.trim() && { opacity: 0.5 }
                                            ]}
                                            onPress={handleSaveEdit}
                                            disabled={!editText.trim() || isUpdating}
                                        >
                                            {isUpdating ? (
                                                <ActivityIndicator size="small" color={colors.text} />
                                            ) : (
                                                <MaterialCommunityIcons
                                                    name="check"
                                                    size={16}
                                                    color={colors.text}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <Text style={[
                                    styles.commentText,
                                    {
                                        color: colors.text,
                                        textAlign: getTextAlign(),
                                        writingDirection: isRTL() ? 'rtl' : 'ltr'
                                    }
                                ]}>
                                    {comment.description}
                                </Text>
                            )}

                            <Text style={[
                                styles.timestamp,
                                {
                                    color: colors.time,
                                    textAlign: isOwn ? (isRTL() ? 'left' : 'right') : getTextAlign(),
                                    alignSelf: isOwn ? (isRTL() ? 'flex-start' : 'flex-end') : (isRTL() ? 'flex-end' : 'flex-start')
                                }
                            ]}>
                                {formatCommentDate(comment.commentDate)}
                            </Text>

                            {isBeingDeleted && (
                                <View style={styles.deletingOverlay}>
                                    <ActivityIndicator size="small" color={colors.text} />
                                    <Text style={[
                                        styles.deletingText,
                                        { color: colors.text }
                                    ]}>
                                        {t('deleting')}...
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {isOwn && (
                            <View style={[
                                styles.ownIndicator,
                                { alignSelf: getAlignSelf(isOwn) },
                                getMarginDirection(8, 0)
                            ]}>
                                <MaterialCommunityIcons
                                    name="account-check"
                                    size={12}
                                    color={theme.colors.primary || '#007AFF'}
                                />
                                <Text style={[
                                    styles.ownIndicatorText,
                                    {
                                        color: theme.colors.primary || '#007AFF',
                                        textAlign: getTextAlign()
                                    }
                                ]}>
                                    {t('you')}
                                </Text>
                            </View>
                        )}
                    </View>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        fontStyle: 'italic',
    },
    commentContainer: {
        marginVertical: 4,
        marginHorizontal: 8,
        maxWidth: '85%',
    },
    ownCommentContainer: {
        alignSelf: 'flex-end',
    },
    commentBubble: {
        padding: 12,
        borderRadius: 18,
        minWidth: 80,
        elevation: 1,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    ownCommentBubble: {
        borderBottomRightRadius: 4,
    },
    otherCommentBubble: {
        borderBottomLeftRadius: 4,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginBottom: 4,
        alignSelf: 'flex-start',
    },
    roleBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    userName: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
        opacity: 0.9,
    },
    commentText: {
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 4,
    },
    timestamp: {
        fontSize: 11,
        marginTop: 2,
        fontWeight: '500',
    },
    ownIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    ownIndicatorText: {
        fontSize: 10,
        fontWeight: '500',
        marginLeft: 2,
    },
    editContainer: {
        width: '100%',
    },
    editInput: {
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 8,
        minHeight: 40,
        textAlignVertical: 'top',
    },
    editActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    editButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    cancelButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    saveButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    deletingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
        flexDirection: 'row',
    },
    deletingText: {
        marginLeft: 8,
        fontSize: 12,
        fontWeight: '500',
    },
});

export default CommentsList;