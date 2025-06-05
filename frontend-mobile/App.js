import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';

SplashScreen.preventAutoHideAsync();

import { ThemeProvider } from './src/themes/ThemeProvider';

import AppNavigator from './src/navigation/AppNavigator';

import { initializeI18n, isRTL } from './src/localization/i18n';

import { AuthProvider } from './src/contexts/AuthContext';

LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

const cacheImages = (images) => {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
};

const cacheFonts = (fonts) => {
  return fonts.map(font => Font.loadAsync(font));
};

const App = () => {
  const [isReady, setIsReady] = useState(false);

  const loadResourcesAsync = async () => {
    try {
      await initializeI18n();

      I18nManager.allowRTL(true);
      I18nManager.forceRTL(isRTL());

      const fontAssets = cacheFonts([
      ]);

      const imageAssets = cacheImages([
      ]);

      await Promise.all([...fontAssets, ...imageAssets]);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsReady(true);
      await SplashScreen.hideAsync();
    }
  };

  useEffect(() => {
    loadResourcesAsync();
  }, []);

  if (!isReady) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#844c2c" />
        </View>
    );
  }

  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <StatusBar barStyle="light-content" />
              <AppNavigator />
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
  );
};

export default App;