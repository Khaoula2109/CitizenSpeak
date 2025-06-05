import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isRTL } from '../../localization/i18n';

const API_BASE_URL = process.env.API_URL;

const CommentForm = ({ complaintId, theme, onCommentAdded, apiBaseUrl }) => {
    const { t } = useTranslation();
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRef = useRef(null);

    const baseUrl = apiBaseUrl || API_BASE_URL;

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

    const handleSubmit = async () => {
        if (!comment.trim() || isSubmitting) {
            return;
        }

        try {
            setIsSubmitting(true);
            console.log('======== COMMENT SUBMISSION START ========');
            console.log('Submitting comment for complaint ID:', complaintId);
            console.log('Comment content:', comment);
            console.log('Using API Base URL:', baseUrl);

            if (!complaintId) {
                throw new Error('ID de plainte manquant');
            }

            const token = await AsyncStorage.getItem('auth_token');
            if (!token) {
                throw new Error(t('authentication_required'));
            }

            const encodedComplaintId = encodeURIComponent(complaintId);
            console.log('Original complaint ID:', complaintId);
            console.log('Encoded complaint ID:', encodedComplaintId);

            const url = `${baseUrl}/api/complaints/${encodedComplaintId}/comments`;
            console.log('Submit URL:', url);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ description: comment.trim() })
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Erreur serveur (${response.status}): ${errorText}`);
            }

            const result = await response.json();
            console.log('Comment submission result:', result);
            console.log('======== COMMENT SUBMISSION SUCCESS ========');

            setComment('');
            inputRef.current?.blur();

            if (onCommentAdded && typeof onCommentAdded === 'function') {
                console.log('Calling onCommentAdded callback');
                onCommentAdded(result);
            } else {
                console.warn('onCommentAdded callback not provided or not a function');
            }

            Alert.alert(
                t('success'),
                t('comment_added_successfully')
            );
        } catch (error) {
            console.error('======== COMMENT SUBMISSION ERROR ========');
            console.error('Error submitting comment:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);

            Alert.alert(
                t('error'),
                error.message || t('comment_submission_error')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!complaintId) {
        console.warn('⚠️ CommentForm: No complaintId provided');
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.errorText, { color: theme.colors.error || '#FF6B6B' }]}>
                    Erreur: ID de plainte manquant
                </Text>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    flexDirection: getFlexDirection(),
                }
            ]}
        >
            <TextInput
                ref={inputRef}
                style={[
                    styles.input,
                    {
                        color: theme.colors.text,
                        textAlign: getTextAlign(),
                        writingDirection: isRTL() ? 'rtl' : 'ltr',
                    }
                ]}
                placeholder={t('add_comment')}
                placeholderTextColor={theme.colors.placeholder}
                multiline
                value={comment}
                onChangeText={setComment}
                maxLength={500}
            />
            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: theme.colors.buttonPrimary },
                    (!comment.trim() || isSubmitting) && { opacity: 0.6 },
                    getMarginDirection(8, 0),
                ]}
                onPress={handleSubmit}
                disabled={!comment.trim() || isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                    <MaterialCommunityIcons
                        name={isRTL() ? "send-outline" : "send"}
                        size={20}
                        color={theme.colors.white}
                    />
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        marginBottom: 16,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        fontSize: 14,
        padding: 4,
    },
    button: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        alignSelf: 'flex-end',
    },
    errorText: {
        fontSize: 14,
        padding: 8,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default CommentForm;