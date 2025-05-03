import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MatchProvider } from '@/context/MatchContext';
import { Platform, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSplashScreen } from '@/utils/splashScreenManager';
import { useDeepLinks } from '@/utils/deepLinkingManager';

// Ignore specific harmless warnings that might appear during development
LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate`',
  'Non-serializable values were found in the navigation state',
]);

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);
  const { isReady } = useFrameworkReady();
  const deepLinking = useDeepLinks();
  
  // Handle the splash screen visibility with an increased delay on iOS
  const splashDelay = Platform.OS === 'ios' ? 800 : 500;
  useSplashScreen(isAppReady, splashDelay);
  
  useEffect(() => {
    if (isReady) {
      // Wait a moment to ensure UI is fully loaded before hiding splash screen
      // Use a longer delay on iOS to ensure all native modules are properly initialized
      const timeout = setTimeout(() => {
        setIsAppReady(true);
      }, Platform.OS === 'ios' ? 400 : 200);
      
      return () => clearTimeout(timeout);
    }
  }, [isReady]);
  
  // Handle initial deep link if present - with extra safety checks for iOS
  useEffect(() => {
    if (deepLinking.parsed && isAppReady && !deepLinking.isProcessingInitialURL) {
      try {
        // Process deep link here if needed
        console.log('Deep link detected:', deepLinking.url);
        
        // Clear the deep link after processing
        deepLinking.clearDeepLink();
      } catch (error) {
        console.log('Error processing deep link:', error);
      }
    }
  }, [deepLinking.parsed, isAppReady, deepLinking.isProcessingInitialURL]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MatchProvider>
          {/* @ts-ignore - Known issue with expo-router types */}
          <Stack
            screenOptions={{
              // Apply consistent animations across platforms based on iOS patterns
              animation: Platform.OS === 'ios' ? 'default' : 'fade_from_bottom',
              // Platform-specific header styling
              headerStyle: {
                backgroundColor: '#FFFFFF',
              },
              headerShadowVisible: Platform.OS === 'ios', // Show shadow on iOS only
              // Animation configurations that match iOS conventions
              animationDuration: Platform.OS === 'ios' ? 350 : 300,
              gestureEnabled: Platform.OS === 'ios', // Enable gesture navigation on iOS
              gestureDirection: 'horizontal',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="match/[id]" 
              options={{ 
                headerShown: false,
                presentation: Platform.OS === 'ios' ? 'modal' : 'card',
                animation: Platform.OS === 'ios' ? 'fade' : 'slide_from_right',
                gestureEnabled: true
              }} 
            />
            <Stack.Screen 
              name="match/press-log/[id]" 
              options={{ 
                headerShown: false,
                presentation: 'modal',
                animation: 'slide_from_bottom',
                gestureEnabled: true,
              }} 
            />
            <Stack.Screen 
              name="match/score-input/[id]" 
              options={{ 
                headerShown: false,
                presentation: 'card',
                animation: 'slide_from_right',
                gestureEnabled: false, // Prevent accidental exits
              }} 
            />
            <Stack.Screen 
              name="match/scorecard/[id]" 
              options={{ 
                headerShown: false,
                presentation: 'card',
                animation: 'slide_from_right',
                gestureEnabled: true,
              }} 
            />
          </Stack>
          <StatusBar style="dark" />
        </MatchProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
