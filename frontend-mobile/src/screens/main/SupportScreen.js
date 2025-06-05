import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
    TextInput,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeContext } from '../../themes/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SupportService from '../../services/support';

import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

const Stack = createStackNavigator();

const getFAQData = (t) => [
    {
        id: '1',
        question: t('comment_soumettre_plainte'),
        answer: t('comment_soumettre_answer'),
    },
    {
        id: '2',
        question: t('combien_temps_resolution'),
        answer: t('combien_temps_answer'),
    },
    {
        id: '3',
        question: t('comment_suivre_plainte'),
        answer: t('comment_suivre_answer'),
    },
    {
        id: '4',
        question: t('quels_types_problemes'),
        answer: t('quels_types_answer'),
    },
    {
        id: '5',
        question: t('pourquoi_photos_upload'),
        answer: t('pourquoi_photos_answer'),
    },
    {
        id: '6',
        question: t('geolocalisation_fonctionne_pas'),
        answer: t('geolocalisation_answer'),
    },
    {
        id: '7',
        question: t('signaler_anonymement'),
        answer: t('signaler_anonymement_answer'),
    },
    {
        id: '8',
        question: t('comment_signaler_urgence'),
        answer: t('comment_signaler_urgence_answer'),
    },
];

const SupportHomeScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();

    const supportOptions = [
        {
            id: 'faq',
            title: t('questions_frequentes'),
            icon: 'frequently-asked-questions',
            description: t('faq_description_detailed'),
            screen: 'FAQ',
        },
        {
            id: 'contact',
            title: t('nous_contacter'),
            icon: 'email-outline',
            description: t('contact_description_detailed'),
            screen: 'Contact',
        },
        {
            id: 'guide',
            title: t('guide_utilisation'),
            icon: 'book-open-outline',
            description: t('guide_description'),
            screen: 'UserGuide',
        },
        {
            id: 'privacy',
            title: t('politique_confidentialite'),
            icon: 'shield-account-outline',
            description: t('privacy_description_detailed'),
            screen: 'Privacy',
        },
        {
            id: 'terms',
            title: t('conditions_utilisation'),
            icon: 'file-document-outline',
            description: t('terms_description_detailed'),
            screen: 'Terms',
        },
        {
            id: 'about',
            title: t('a_propos'),
            icon: 'information-outline',
            description: t('about_description'),
            screen: 'About',
        },
    ];

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.headerContainer}>
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: theme.colors.primary + '20' },
                    ]}
                >
                    <MaterialCommunityIcons
                        name="help-circle-outline"
                        size={40}
                        color={theme.colors.primary}
                    />
                </View>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                    {t('center_help')}
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.colors.secondary_text }]}>
                    {t('center_help_subtitle')}
                </Text>
            </View>

            <View style={styles.optionsContainer}>
                {supportOptions.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[
                            styles.optionCard,
                            {
                                backgroundColor: theme.colors.cardBackground,
                                shadowColor: theme.colors.shadow,
                            },
                        ]}
                        onPress={() => navigation.navigate(option.screen)}
                    >
                        <View
                            style={[
                                styles.optionIconContainer,
                                { backgroundColor: theme.colors.primary + '20' },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name={option.icon}
                                size={24}
                                color={theme.colors.primary}
                            />
                        </View>
                        <View style={styles.optionTextContainer}>
                            <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
                                {option.title}
                            </Text>
                            <Text
                                style={[
                                    styles.optionDescription,
                                    { color: theme.colors.secondary_text },
                                ]}
                                numberOfLines={3}
                            >
                                {option.description}
                            </Text>
                        </View>
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={24}
                            color={theme.colors.secondary_text}
                        />
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.emergencySection}>
                <Text style={[styles.emergencySectionTitle, { color: theme.colors.text }]}>
                    {t('urgences_contacts')}
                </Text>
                <Card variant="elevated" style={styles.emergencyCard}>
                    <Text style={[styles.emergencyText, { color: theme.colors.text }]}>
                        {t('urgence_text_detailed')}
                    </Text>

                    <View style={styles.emergencyButtons}>
                        <TouchableOpacity
                            style={[styles.emergencyButton, { backgroundColor: '#e74c3c' }]}
                            onPress={() => Linking.openURL('tel:15')}
                        >
                            <MaterialCommunityIcons name="phone" size={20} color="white" />
                            <Text style={styles.emergencyButtonText}>{t('samu')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.emergencyButton, { backgroundColor: '#3498db' }]}
                            onPress={() => Linking.openURL('tel:+212522000000')}
                        >
                            <MaterialCommunityIcons name="city" size={20} color="white" />
                            <Text style={styles.emergencyButtonText}>{t('services_municipaux')}</Text>
                        </TouchableOpacity>
                    </View>
                </Card>
            </View>

            <View style={styles.quickStatsSection}>
                <Text style={[styles.quickStatsTitle, { color: theme.colors.text }]}>
                    {t('statistiques_observatoire')}
                </Text>
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.cardBackground }]}>
                        <MaterialCommunityIcons name="clipboard-check" size={24} color={theme.colors.statusResolved} />
                        <Text style={[styles.statNumber, { color: theme.colors.text }]}>1,247</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.secondary_text }]}>{t('plaintes_resolues')}</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.cardBackground }]}>
                        <MaterialCommunityIcons name="clock-outline" size={24} color={theme.colors.statusPending} />
                        <Text style={[styles.statNumber, { color: theme.colors.text }]}>3.2</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.secondary_text }]}>{t('jours_moyen')}</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const FAQScreen = ({ navigation }) => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();
    const [expandedId, setExpandedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const FAQ_DATA = getFAQData(t);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredFAQ = FAQ_DATA.filter(item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.faqHeader}>
                <Text style={[styles.faqTitle, { color: theme.colors.text }]}>
                    {t('questions_frequentes')}
                </Text>
                <Text style={[styles.faqSubtitle, { color: theme.colors.secondary_text }]}>
                    {t('faq_description_detailed')}
                </Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBox, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}>
                    <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.secondary_text} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        placeholder={t('rechercher_questions')}
                        placeholderTextColor={theme.colors.placeholder}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.faqList}>
                {filteredFAQ.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.faqItem,
                            {
                                backgroundColor: theme.colors.cardBackground,
                                shadowColor: theme.colors.shadow,
                            },
                        ]}
                        onPress={() => toggleExpand(item.id)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.faqItemHeader}>
                            <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>
                                {item.question}
                            </Text>
                            <MaterialCommunityIcons
                                name={expandedId === item.id ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color={theme.colors.secondary_text}
                            />
                        </View>
                        {expandedId === item.id && (
                            <Text
                                style={[
                                    styles.faqAnswer,
                                    { color: theme.colors.secondary_text },
                                ]}
                            >
                                {item.answer}
                            </Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {filteredFAQ.length === 0 && (
                <View style={styles.noResultsContainer}>
                    <MaterialCommunityIcons name="file-search-outline" size={48} color={theme.colors.secondary_text} />
                    <Text style={[styles.noResultsText, { color: theme.colors.text }]}>
                        {t('aucun_resultat_trouve')}
                    </Text>
                    <Text style={[styles.noResultsSubtext, { color: theme.colors.secondary_text }]}>
                        {t('aucun_resultat_subtext')}
                    </Text>
                </View>
            )}

            <View style={styles.notFoundContainer}>
                <Text style={[styles.notFoundText, { color: theme.colors.text }]}>
                    {t('votre_question_pas_listee')}
                </Text>
                <Button
                    title={t('nous_contacter')}
                    onPress={() => navigation.navigate('Contact')}
                    variant="primary"
                    style={styles.contactButton}
                />
            </View>
        </ScrollView>
    );
};

const UserGuideScreen = () => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();

    const guideSteps = [
        {
            id: 1,
            title: t('creer_compte'),
            description: t('creer_compte_desc'),
            icon: 'account-plus'
        },
        {
            id: 2,
            title: t('signaler_probleme'),
            description: t('signaler_probleme_desc'),
            icon: 'plus-circle'
        },
        {
            id: 3,
            title: t('suivre_plainte'),
            description: t('suivre_plainte_desc'),
            icon: 'clipboard-list'
        },
        {
            id: 4,
            title: t('consulter_carte'),
            description: t('consulter_carte_desc'),
            icon: 'map'
        }
    ];

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.guideHeader}>
                <Text style={[styles.guideTitle, { color: theme.colors.text }]}>
                    {t('guide_title')}
                </Text>
                <Text style={[styles.guideSubtitle, { color: theme.colors.secondary_text }]}>
                    {t('guide_subtitle')}
                </Text>
            </View>

            <View style={styles.stepsContainer}>
                {guideSteps.map((step, index) => (
                    <View key={step.id} style={styles.stepCard}>
                        <View style={styles.stepHeader}>
                            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                                <Text style={styles.stepNumberText}>{step.id}</Text>
                            </View>
                            <MaterialCommunityIcons
                                name={step.icon}
                                size={24}
                                color={theme.colors.primary}
                                style={styles.stepIcon}
                            />
                        </View>
                        <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                            {step.title}
                        </Text>
                        <Text style={[styles.stepDescription, { color: theme.colors.secondary_text }]}>
                            {step.description}
                        </Text>
                        {index < guideSteps.length - 1 && (
                            <View style={[styles.stepConnector, { backgroundColor: theme.colors.border }]} />
                        )}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const ContactScreen = () => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            Alert.alert(
                t('form_error'),
                t('complete_all_fields')
            );
            return;
        }

        try {
            setIsLoading(true);
            await SupportService.submitContactForm(formData);

            Alert.alert(
                t('message_sent'),
                t('message_sent_description'),
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setFormData({
                                name: '',
                                email: '',
                                subject: '',
                                message: '',
                                category: 'general'
                            });
                        },
                    },
                ]
            );
        } catch (error) {
            Alert.alert(t('form_error'), 'Impossible d\'envoyer le message. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    const categories = [
        { value: 'general', label: t('question_generale') },
        { value: 'technical', label: t('probleme_technique') },
        { value: 'complaint', label: t('aide_plainte') },
        { value: 'suggestion', label: t('suggestion_amelioration') }
    ];

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.contactHeader}>
                <Text style={[styles.contactTitle, { color: theme.colors.text }]}>
                    {t('nous_contacter')}
                </Text>
                <Text style={[styles.contactSubtitle, { color: theme.colors.secondary_text }]}>
                    {t('contact_subtitle_detailed')}
                </Text>
            </View>

            <Card variant="elevated" style={styles.contactForm}>
                <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                        {t('nom_complet_required')}
                    </Text>
                    <TextInput
                        style={[
                            styles.formInput,
                            {
                                backgroundColor: theme.colors.inputBackground,
                                borderColor: theme.colors.border,
                                color: theme.colors.text,
                            },
                        ]}
                        placeholder={t('votre_nom_prenom')}
                        placeholderTextColor={theme.colors.placeholder}
                        value={formData.name}
                        onChangeText={(text) => handleChange('name', text)}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                        {t('email_required')}
                    </Text>
                    <TextInput
                        style={[
                            styles.formInput,
                            {
                                backgroundColor: theme.colors.inputBackground,
                                borderColor: theme.colors.border,
                                color: theme.colors.text,
                            },
                        ]}
                        placeholder={t('votre_email_exemple')}
                        placeholderTextColor={theme.colors.placeholder}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={formData.email}
                        onChangeText={(text) => handleChange('email', text)}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                        {t('categorie')}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category.value}
                                style={[
                                    styles.categoryChip,
                                    {
                                        backgroundColor: formData.category === category.value
                                            ? theme.colors.primary
                                            : theme.colors.cardBackground,
                                        borderColor: theme.colors.border
                                    }
                                ]}
                                onPress={() => handleChange('category', category.value)}
                            >
                                <Text style={[
                                    styles.categoryChipText,
                                    {
                                        color: formData.category === category.value
                                            ? 'white'
                                            : theme.colors.text
                                    }
                                ]}>
                                    {category.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                        {t('sujet_optionnel')}
                    </Text>
                    <TextInput
                        style={[
                            styles.formInput,
                            {
                                backgroundColor: theme.colors.inputBackground,
                                borderColor: theme.colors.border,
                                color: theme.colors.text,
                            },
                        ]}
                        placeholder={t('resume_demande')}
                        placeholderTextColor={theme.colors.placeholder}
                        value={formData.subject}
                        onChangeText={(text) => handleChange('subject', text)}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                        {t('message_required')}
                    </Text>
                    <TextInput
                        style={[
                            styles.formTextarea,
                            {
                                backgroundColor: theme.colors.inputBackground,
                                borderColor: theme.colors.border,
                                color: theme.colors.text,
                            },
                        ]}
                        placeholder={t('decrivez_probleme_detail')}
                        placeholderTextColor={theme.colors.placeholder}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        value={formData.message}
                        onChangeText={(text) => handleChange('message', text)}
                    />
                </View>

                <Button
                    title={t('envoyer_message')}
                    onPress={handleSubmit}
                    loading={isLoading}
                    variant="primary"
                    style={styles.submitButton}
                />

                <View style={styles.alternativeContact}>
                    <Text style={[styles.alternativeText, { color: theme.colors.secondary_text }]}>
                        {t('autres_moyens_contact')}
                    </Text>
                    <View style={styles.contactMethods}>
                        <TouchableOpacity
                            style={styles.contactMethod}
                            onPress={() => Linking.openURL('tel:+212522444555')}
                        >
                            <MaterialCommunityIcons
                                name="phone"
                                size={20}
                                color={theme.colors.primary}
                            />
                            <Text style={[styles.contactMethodText, { color: theme.colors.text }]}>
                                +212 522 222 222
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.contactMethod}
                            onPress={() => Linking.openURL('mailto:support@observatoire-plaintes.ma')}
                        >
                            <MaterialCommunityIcons
                                name="email"
                                size={20}
                                color={theme.colors.primary}
                            />
                            <Text style={[styles.contactMethodText, { color: theme.colors.text }]}>
                                support@observatoire-plaintes.ma
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.contactMethod}
                            onPress={() => Linking.openURL('https://observatoire-plaintes.ma')}
                        >
                            <MaterialCommunityIcons
                                name="web"
                                size={20}
                                color={theme.colors.primary}
                            />
                            <Text style={[styles.contactMethodText, { color: theme.colors.text }]}>
                                observatoire-plaintes.ma
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Card>
        </ScrollView>
    );
};

const AboutScreen = () => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.aboutHeader}>
                <View style={[styles.aboutIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                    <MaterialCommunityIcons name="city" size={48} color={theme.colors.primary} />
                </View>
                <Text style={[styles.aboutTitle, { color: theme.colors.text }]}>
                    {t('observatoire_plaintes')}
                </Text>
                <Text style={[styles.aboutVersion, { color: theme.colors.secondary_text }]}>
                    {t('version')}
                </Text>
            </View>

            <View style={styles.aboutContent}>
                <Text style={[styles.aboutSection, { color: theme.colors.text }]}>
                    {t('notre_mission')}
                </Text>
                <Text style={[styles.aboutText, { color: theme.colors.secondary_text }]}>
                    {t('mission_text')}
                </Text>

                <Text style={[styles.aboutSection, { color: theme.colors.text }]}>
                    {t('nos_objectifs')}
                </Text>
                <Text style={[styles.aboutText, { color: theme.colors.secondary_text }]}>
                    {t('objectifs_text')}
                </Text>

                <Text style={[styles.aboutSection, { color: theme.colors.text }]}>
                    {t('domaines_intervention')}
                </Text>
                <Text style={[styles.aboutText, { color: theme.colors.secondary_text }]}>
                    {t('domaines_text')}
                </Text>

                <Text style={[styles.aboutSection, { color: theme.colors.text }]}>
                    {t('contact_partenaires')}
                </Text>
                <Text style={[styles.aboutText, { color: theme.colors.secondary_text }]}>
                    {t('partenaires_text')}
                </Text>

                <View style={styles.socialLinks}>
                    <TouchableOpacity style={[styles.socialButton, { backgroundColor: theme.colors.primary + '20' }]}>
                        <MaterialCommunityIcons name="facebook" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.socialButton, { backgroundColor: theme.colors.primary + '20' }]}>
                        <MaterialCommunityIcons name="twitter" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.socialButton, { backgroundColor: theme.colors.primary + '20' }]}>
                        <MaterialCommunityIcons name="linkedin" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const PrivacyScreen = () => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.policyHeader}>
                <Text style={[styles.policyTitle, { color: theme.colors.text }]}>
                    {t('politique_confidentialite')}
                </Text>
                <Text style={[styles.policyDate, { color: theme.colors.secondary_text }]}>
                    {t('derniere_maj')}
                </Text>
            </View>

            <View style={styles.policyContent}>
                <Text style={[styles.policySection, { color: theme.colors.text }]}>
                    {t('collecte_donnees_personnelles')}
                </Text>
                <Text style={[styles.policyText, { color: theme.colors.secondary_text }]}>
                    {t('collecte_text')}
                </Text>

                <Text style={[styles.policySection, { color: theme.colors.text }]}>
                    {t('utilisation_donnees')}
                </Text>
                <Text style={[styles.policyText, { color: theme.colors.secondary_text }]}>
                    {t('utilisation_text')}
                </Text>

                <Text style={[styles.policySection, { color: theme.colors.text }]}>
                    {t('partage_donnees')}
                </Text>
                <Text style={[styles.policyText, { color: theme.colors.secondary_text }]}>
                    {t('partage_text')}
                </Text>

                <Text style={[styles.policySection, { color: theme.colors.text }]}>
                    {t('geolocalisation_photos')}
                </Text>
                <Text style={[styles.policyText, { color: theme.colors.secondary_text }]}>
                    {t('geolocalisation_text')}
                </Text>

                <Text style={[styles.policySection, { color: theme.colors.text }]}>
                    {t('vos_droits')}
                </Text>
                <Text style={[styles.policyText, { color: theme.colors.secondary_text }]}>
                    {t('droits_text')}
                </Text>

                <Text style={[styles.policySection, { color: theme.colors.text }]}>
                    {t('securite_donnees')}
                </Text>
                <Text style={[styles.policyText, { color: theme.colors.secondary_text }]}>
                    {t('securite_text')}
                </Text>
            </View>
        </ScrollView>
    );
};

const TermsScreen = () => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.policyHeader}>
                <Text style={[styles.policyTitle, { color: theme.colors.text }]}>
                    {t('conditions_utilisation')}
                </Text>
                <Text style={[styles.policyDate, { color: theme.colors.secondary_text }]}>
                    {t('derniere_maj')}
                </Text>
            </View>

            <View style={styles.policyContent}>
                <Text style={[styles.policySection, { color: theme.colors.text }]}>
                    {t('objet_champ_application')}
                </Text>
                <Text style={[styles.policyText, { color: theme.colors.secondary_text }]}>
                    {t('objet_text')}
                </Text>

                <Text style={[styles.policySection, { color: theme.colors.text }]}>
                    {t('utilisation_autorisee')}
                </Text>
                <Text style={[styles.policyText, { color: theme.colors.secondary_text }]}>
                    {t('utilisation_autorisee_text')}
                </Text>

                <Text style={[styles.policySection, { color: theme.colors.text }]}>
                    {t('obligations_utilisateur')}
                </Text>
                <Text style={[styles.policyText, { color: theme.colors.secondary_text }]}>
                    {t('obligations_text')}
                </Text>

                <Text style={[styles.policySection, { color: theme.colors.text }]}>
                    {t('contenu_responsabilite')}
                </Text>
                <Text style={[styles.policyText, { color: theme.colors.secondary_text }]}>
                    {t('contenu_text')}
                </Text>

                <Text style={[styles.policySection, { color: theme.colors.text }]}>
                    {t('propriete_intellectuelle')}
                </Text>
                <Text style={[styles.policyText, { color: theme.colors.secondary_text }]}>
                    {t('propriete_text')}
                </Text>

                <Text style={[styles.policySection, { color: theme.colors.text }]}>
                    {t('limitation_responsabilite')}
                </Text>
                <Text style={[styles.policyText, { color: theme.colors.secondary_text }]}>
                    {t('limitation_text')}
                </Text>

                <Text style={[styles.policySection, { color: theme.colors.text }]}>
                    {t('sanctions_suspension')}
                </Text>
                <Text style={[styles.policyText, { color: theme.colors.secondary_text }]}>
                    {t('sanctions_text')}
                </Text>

                <Text style={[styles.policySection, { color: theme.colors.text }]}>
                    {t('modifications_conditions')}
                </Text>
                <Text style={[styles.policyText, { color: theme.colors.secondary_text }]}>
                    {t('modifications_text')}
                </Text>
            </View>
        </ScrollView>
    );
};

const SupportScreen = () => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.primary,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: theme.colors.white,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="SupportHome"
                component={SupportHomeScreen}
                options={{ title: t('center_help') }}
            />
            <Stack.Screen
                name="FAQ"
                component={FAQScreen}
                options={{ title: t('questions_frequentes') }}
            />
            <Stack.Screen
                name="Contact"
                component={ContactScreen}
                options={{ title: t('nous_contacter') }}
            />
            <Stack.Screen
                name="UserGuide"
                component={UserGuideScreen}
                options={{ title: t('guide_utilisation') }}
            />
            <Stack.Screen
                name="Privacy"
                component={PrivacyScreen}
                options={{ title: t('politique_confidentialite') }}
            />
            <Stack.Screen
                name="Terms"
                component={TermsScreen}
                options={{ title: t('conditions_utilisation') }}
            />
            <Stack.Screen
                name="About"
                component={AboutScreen}
                options={{ title: t('a_propos') }}
            />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 16,
    },
    optionsContainer: {
        marginBottom: 32,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    optionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 6,
    },
    optionDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    emergencySection: {
        marginBottom: 24,
    },
    emergencySectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    emergencyCard: {
        padding: 20,
    },
    emergencyText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
    },
    emergencyButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    emergencyButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    emergencyButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 8,
    },
    quickStatsSection: {
        marginBottom: 16,
    },
    quickStatsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    faqHeader: {
        marginBottom: 24,
    },
    faqTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    faqSubtitle: {
        fontSize: 16,
        lineHeight: 22,
    },
    searchContainer: {
        marginBottom: 20,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    faqList: {
        marginBottom: 24,
    },
    faqItem: {
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    faqItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        paddingRight: 12,
    },
    faqAnswer: {
        fontSize: 14,
        lineHeight: 22,
        padding: 20,
        paddingTop: 0,
    },
    noResultsContainer: {
        alignItems: 'center',
        padding: 32,
    },
    noResultsText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    noResultsSubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    notFoundContainer: {
        alignItems: 'center',
        padding: 24,
        marginTop: 16,
    },
    notFoundText: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    contactButton: {
        minWidth: 150,
    },
    guideHeader: {
        marginBottom: 32,
    },
    guideTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    guideSubtitle: {
        fontSize: 16,
        lineHeight: 22,
    },
    stepsContainer: {
        position: 'relative',
    },
    stepCard: {
        marginBottom: 32,
        position: 'relative',
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    stepNumberText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    stepIcon: {
        marginLeft: 8,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    stepDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    stepConnector: {
        position: 'absolute',
        left: 15,
        top: 40,
        width: 2,
        height: 40,
    },
    contactHeader: {
        marginBottom: 24,
    },
    contactTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    contactSubtitle: {
        fontSize: 16,
        lineHeight: 22,
    },
    contactForm: {
        padding: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 8,
    },
    formInput: {
        height: 48,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    formTextarea: {
        minHeight: 120,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingTop: 16,
        fontSize: 16,
    },
    categoryScroll: {
        flexDirection: 'row',
    },
    categoryChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '500',
    },
    submitButton: {
        marginTop: 8,
        marginBottom: 24,
    },
    alternativeContact: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 20,
    },
    alternativeText: {
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    contactMethods: {
        gap: 12,
    },
    contactMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    contactMethodText: {
        marginLeft: 12,
        fontSize: 15,
    },
    aboutHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    aboutIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    aboutTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    aboutVersion: {
        fontSize: 14,
    },
    aboutContent: {
        marginBottom: 24,
    },
    socialLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 24,
    },
    socialButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    policyHeader: {
        marginBottom: 32,
    },
    policyTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    policyDate: {
        fontSize: 14,
    },
    policyContent: {
        marginBottom: 24,
    },
    policySection: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 24,
    },
    policyText: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 16,
    },
    aboutSection: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 24,
    },
    aboutText: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 16,
    },
});

export default SupportScreen;