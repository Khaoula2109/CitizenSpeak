import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { ThemeContext } from '../../themes/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ComplaintService from '../../services/complaints';
import { isRTL } from '../../localization/i18n';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';
import ErrorService from '../../services/error';

const SearchComplaintScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();
    const [complaintId, setComplaintId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const {
        toastConfig,
        showError,
        showSuccess,
        hideToast
    } = useToast();

    React.useEffect(() => {
        ErrorService.setDisplayCallbacks(showError, showSuccess);
    }, [showError, showSuccess]);

    const getTextAlign = () => {
        return isRTL() ? 'right' : 'left';
    };

    const getFlexDirection = () => {
        return isRTL() ? 'row-reverse' : 'row';
    };

    const getMarginDirection = (leftValue, rightValue) => {
        return isRTL()
            ? { marginRight: leftValue, marginLeft: rightValue }
            : { marginLeft: leftValue, marginRight: rightValue };
    };

    const validateInput = (input) => {
        if (!input || input.trim().length === 0) {
            showError(t('complaint_id_required'));
            return false;
        }

        const trimmedInput = input.trim();

        const regex = /^#\d{4}-\d{3}$/;
        if (!regex.test(trimmedInput)) {
            showError(t('invalid_complaint_id_format', { id: trimmedInput }));
            return false;
        }

        return true;
    };

    const handleSearch = async () => {
        const trimmedId = complaintId.trim();

        if (!validateInput(trimmedId)) {
            return;
        }

        setIsLoading(true);

        try {
            console.log('🔍 Searching for complaint:', trimmedId);

            const complaint = await ComplaintService.searchComplaintById(trimmedId);

            setIsLoading(false);

            showSuccess(t('complaint_found_success'));

            navigation.navigate('ComplaintDetail', {
                complaintId: complaint.complaintId,
                fromSearch: true
            });

        } catch (error) {
            setIsLoading(false);
            console.error('❌ Search error:', error);

            showError(error.message || t('search_unexpected_error'));

            console.error('🔍 Search error details:', {
                code: error.code,
                status: error.status,
                message: error.message,
                complaintId: trimmedId,
                originalError: error.originalError
            });
        }
    };

    const formatComplaintId = (text) => {
        let formatted = text.toUpperCase();

        formatted = formatted.replace(/[^#0-9-]/g, '');

        if (!formatted.startsWith('#')) {
            formatted = '#' + formatted;
        }

        if (formatted.length > 9) {
            formatted = formatted.substring(0, 9);
        }

        if (formatted.length === 6 && !formatted.includes('-', 5)) {
            formatted = formatted.substring(0, 5) + '-' + formatted.substring(5);
        }

        return formatted;
    };

    const isValidFormat = (id) => {
        const regex = /^#\d{4}-\d{3}$/;
        return regex.test(id.trim());
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <MaterialCommunityIcons
                            name="magnify"
                            size={48}
                            color={theme.colors.primary}
                            style={styles.headerIcon}
                        />
                        <Text style={[
                            styles.title,
                            { color: theme.colors.text, textAlign: 'center' }
                        ]}>
                            {t('search_complaint_title')}
                        </Text>
                        <Text style={[
                            styles.subtitle,
                            { color: theme.colors.secondary_text, textAlign: 'center' }
                        ]}>
                            {t('search_complaint_subtitle')}
                        </Text>
                    </View>

                    <View style={styles.searchForm}>
                        <Text style={[
                            styles.label,
                            { color: theme.colors.text, textAlign: getTextAlign() }
                        ]}>
                            {t('complaint_id_label')}
                        </Text>

                        <View style={[
                            styles.inputContainer,
                            {
                                backgroundColor: theme.colors.inputBackground,
                                borderColor: isValidFormat(complaintId) ? theme.colors.primary : theme.colors.border,
                                borderWidth: isValidFormat(complaintId) ? 2 : 1,
                                flexDirection: getFlexDirection()
                            }
                        ]}>
                            <MaterialCommunityIcons
                                name="identifier"
                                size={20}
                                color={isValidFormat(complaintId) ? theme.colors.primary : theme.colors.secondary_text}
                                style={[styles.inputIcon, getMarginDirection(0, 12)]}
                            />
                            <TextInput
                                style={[
                                    styles.textInput,
                                    {
                                        color: theme.colors.text,
                                        textAlign: getTextAlign(),
                                        flex: 1
                                    }
                                ]}
                                placeholder={t('complaint_id_placeholder')}
                                placeholderTextColor={theme.colors.placeholder}
                                value={complaintId}
                                onChangeText={(text) => setComplaintId(formatComplaintId(text))}
                                autoCapitalize="characters"
                                maxLength={9} // #YYYY-XXX
                                returnKeyType="search"
                                onSubmitEditing={handleSearch}
                            />
                        </View>

                        <View style={styles.hintContainer}>
                            <Text style={[
                                styles.hint,
                                {
                                    color: isValidFormat(complaintId) ? theme.colors.success : theme.colors.secondary_text,
                                    textAlign: getTextAlign()
                                }
                            ]}>
                                {t('complaint_id_format_hint')}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.searchButton,
                                {
                                    backgroundColor: theme.colors.primary,
                                    flexDirection: getFlexDirection(),
                                    opacity: (isLoading || !isValidFormat(complaintId)) ? 0.6 : 1
                                }
                            ]}
                            onPress={handleSearch}
                            disabled={isLoading || !isValidFormat(complaintId)}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={theme.colors.white} />
                            ) : (
                                <>
                                    <MaterialCommunityIcons
                                        name="magnify"
                                        size={20}
                                        color={theme.colors.white}
                                        style={[getMarginDirection(0, 8)]}
                                    />
                                    <Text style={styles.searchButtonText}>
                                        {t('search_button')}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={[
                        styles.tipsContainer,
                        { backgroundColor: theme.colors.card }
                    ]}>
                        <Text style={[
                            styles.tipsTitle,
                            { color: theme.colors.text, textAlign: getTextAlign() }
                        ]}>
                            {t('search_help_title')}
                        </Text>

                        <View style={[styles.tipItem, { flexDirection: getFlexDirection() }]}>
                            <MaterialCommunityIcons
                                name="format-text"
                                size={16}
                                color={theme.colors.primary}
                                style={getMarginDirection(0, 8)}
                            />
                            <Text style={[
                                styles.tipsText,
                                { color: theme.colors.secondary_text, textAlign: getTextAlign(), flex: 1 }
                            ]}>
                                {t('search_help_format')}
                            </Text>
                        </View>

                        <View style={[styles.tipItem, { flexDirection: getFlexDirection() }]}>
                            <MaterialCommunityIcons
                                name="bell-outline"
                                size={16}
                                color={theme.colors.primary}
                                style={getMarginDirection(0, 8)}
                            />
                            <Text style={[
                                styles.tipsText,
                                { color: theme.colors.secondary_text, textAlign: getTextAlign(), flex: 1 }
                            ]}>
                                {t('search_help_notifications')}
                            </Text>
                        </View>

                        <View style={[styles.tipItem, { flexDirection: getFlexDirection() }]}>
                            <MaterialCommunityIcons
                                name="clock-outline"
                                size={16}
                                color={theme.colors.warning}
                                style={getMarginDirection(0, 8)}
                            />
                            <Text style={[
                                styles.tipsText,
                                { color: theme.colors.secondary_text, textAlign: getTextAlign(), flex: 1 }
                            ]}>
                                {t('search_help_processing_time')}
                            </Text>
                        </View>
                    </View>

                    <View style={[
                        styles.examplesContainer,
                        { backgroundColor: theme.colors.card }
                    ]}>
                        <Text style={[
                            styles.examplesTitle,
                            { color: theme.colors.text, textAlign: getTextAlign() }
                        ]}>
                            {t('search_examples_title')}
                        </Text>

                        <View style={[styles.exampleRow, { flexDirection: getFlexDirection() }]}>
                            <Text style={[styles.exampleId, { color: theme.colors.primary }]}>
                                #2025-001
                            </Text>
                            <Text style={[styles.exampleDesc, { color: theme.colors.secondary_text }]}>
                                {t('search_example_first_2025')}
                            </Text>
                        </View>

                        <View style={[styles.exampleRow, { flexDirection: getFlexDirection() }]}>
                            <Text style={[styles.exampleId, { color: theme.colors.primary }]}>
                                #2024-156
                            </Text>
                            <Text style={[styles.exampleDesc, { color: theme.colors.secondary_text }]}>
                                {t('search_example_complaint_156')}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <Toast
                visible={toastConfig.visible}
                message={toastConfig.message}
                type={toastConfig.type}
                duration={toastConfig.duration}
                position={toastConfig.position}
                onHide={hideToast}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    content: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    headerIcon: {
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 22,
    },
    searchForm: {
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputContainer: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    inputIcon: {
    },
    textInput: {
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 1,
    },
    hintContainer: {
        marginBottom: 24,
    },
    hint: {
        fontSize: 12,
        fontStyle: 'italic',
        fontWeight: '500',
    },
    searchButton: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    tipsContainer: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    tipItem: {
        alignItems: 'flex-start',
        marginBottom: 8,
        paddingVertical: 4,
    },
    tipsText: {
        fontSize: 14,
        lineHeight: 20,
    },
    examplesContainer: {
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    examplesTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    exampleRow: {
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 8,
        marginBottom: 8,
    },
    exampleId: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    exampleDesc: {
        fontSize: 12,
        fontStyle: 'italic',
    },
});

export default SearchComplaintScreen;