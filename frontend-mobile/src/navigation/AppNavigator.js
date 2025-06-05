import React, { useContext, useRef, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {
    useColorScheme,
    View,
    Text,
    ActivityIndicator,
    I18nManager,
    TouchableOpacity,
} from 'react-native';
import { ThemeContext } from '../themes/ThemeProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../localization/i18n';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

import HomeScreen from '../screens/main/HomeScreen';
import ComplaintFormScreen from '../screens/main/ComplaintFormScreen';
import MapScreen from '../screens/main/MapScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ComplaintDetailScreen from '../screens/main/ComplaintDetailScreen';
import ComplaintHistoryScreen from '../screens/main/ComplaintHistoryScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import ChangePasswordScreen from '../screens/auth/ChangePasswordScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import SupportScreen from '../screens/main/SupportScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import SearchComplaintScreen from '../screens/main/SearchComplaintScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const MainStack = createStackNavigator();

const AuthNavigator = () => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.primary,
                },
                headerTintColor: theme.colors.white,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerTitleAlign: 'center',
            }}
        >
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ title: 'CitizenSpeak' }}
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ title: t('create_account') }}
            />
            <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{ title: t('reset_password') }}
            />
        </Stack.Navigator>
    );
};

const MainTabNavigator = () => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Report') {
                        iconName = focused ? 'plus-circle' : 'plus-circle-outline';
                    } else if (route.name === 'Map') {
                        iconName = focused ? 'map' : 'map-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'account' : 'account-outline';
                    }

                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.moutarde,
                tabBarInactiveTintColor: theme.colors.secondary_text,
                tabBarStyle: {
                    backgroundColor: theme.colors.card,
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowColor: theme.colors.shadow,
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                },
                headerStyle: {
                    backgroundColor: theme.colors.primary,
                    elevation: 5,
                    shadowColor: theme.colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                },
                headerTintColor: theme.colors.white,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerTitleAlign: 'center',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeStackNavigator}
                options={{
                    headerShown: false,
                    tabBarLabel: t('home'),
                }}
            />
            <Tab.Screen
                name="Report"
                component={ComplaintFormScreen}
                options={{
                    title: t('submit_complaint'),
                    tabBarLabel: t('report'),
                }}
            />
            <Tab.Screen
                name="Map"
                component={MapScreen}
                options={{
                    title: t('issue_map'),
                    tabBarLabel: t('map'),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStackNavigator}
                options={{
                    headerShown: false,
                    tabBarLabel: t('profile'),
                }}
            />
        </Tab.Navigator>
    );
};

const HomeStack = createStackNavigator();
const HomeStackNavigator = () => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();

    return (
        <HomeStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.primary,
                },
                headerTintColor: theme.colors.white,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerTitleAlign: 'center',
            }}
        >
            <HomeStack.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={({ navigation }) => ({
                    title: 'CitizenSpeak',
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('SearchComplaint')}
                            style={{
                                marginRight: 15,
                                padding: 8,
                                borderRadius: 20,
                                backgroundColor: 'rgba(255,255,255,0.1)'
                            }}
                        >
                            <MaterialCommunityIcons
                                name="magnify"
                                size={24}
                                color={theme.colors.white}
                            />
                        </TouchableOpacity>
                    ),
                })}
            />
        </HomeStack.Navigator>
    );
};

const ProfileStack = createStackNavigator();
const ProfileStackNavigator = () => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();

    return (
        <ProfileStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.primary,
                },
                headerTintColor: theme.colors.white,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerTitleAlign: 'center',
            }}
        >
            <ProfileStack.Screen
                name="ProfileScreen"
                component={ProfileScreen}
                options={{ title: t('profile') }}
            />
        </ProfileStack.Navigator>
    );
};
const MainStackNavigator = () => {
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();

    return (
        <MainStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.primary,
                },
                headerTintColor: theme.colors.white,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerTitleAlign: 'center',
            }}
        >
            <MainStack.Screen
                name="MainTabs"
                component={MainTabNavigator}
                options={{ headerShown: false }}
            />
            <MainStack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ title: t('notifications') }}
            />
            <MainStack.Screen
                name="ComplaintDetail"
                component={ComplaintDetailScreen}
                options={{ title: t('complaint_details') }}
            />
            <MainStack.Screen
                name="SearchComplaint"
                component={SearchComplaintScreen}
                options={{ title: t('search_complaints') }}
            />
            <MainStack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ title: t('edit_profile') }}
            />
            <MainStack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
                options={{ title: t('change_password') }}
            />
            <MainStack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: t('settings') }}
            />
            <MainStack.Screen
                name="Support"
                component={SupportScreen}
                options={{ title: t('help_support') }}
            />
            <MainStack.Screen
                name="ComplaintHistory"
                component={ComplaintHistoryScreen}
                options={{ title: t('my_reports') }}
            />
        </MainStack.Navigator>
    );
};

const RootNavigator = () => {
    // Obtenir l'état d'authentification du contexte
    const { isAuthenticated, loading } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();

    if (loading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.colors.background
            }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{
                    marginTop: 16,
                    color: theme.colors.text,
                    textAlign: 'center',
                }}>
                    {t('loading')}...
                </Text>
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                <Stack.Screen name="Main" component={MainStackNavigator} />
            ) : (
                <Stack.Screen name="Auth" component={AuthNavigator} />
            )}
        </Stack.Navigator>
    );
};

const AppNavigator = () => {
    const colorScheme = useColorScheme();
    const { theme } = useContext(ThemeContext);
    const { t } = useTranslation();
    const navigationRef = useRef(null);

    useEffect(() => {
        const isRTLLayout = isRTL();
        if (I18nManager.isRTL !== isRTLLayout) {
            I18nManager.allowRTL(isRTLLayout);
            I18nManager.forceRTL(isRTLLayout);
        }
    }, []);

    return (
        <NavigationContainer
            ref={navigationRef}
            theme={theme.navigation}
            onReady={() => {
                console.log('Navigation container is ready');
            }}
        >
            <RootNavigator />
        </NavigationContainer>
    );
};

export default AppNavigator;