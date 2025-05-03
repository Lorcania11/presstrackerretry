import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MatchProvider } from '@/context/MatchContext';
import { Platform } from 'react-native';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MatchProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="match/[id]" 
            options={{ 
              headerShown: false,
              presentation: Platform.OS === 'ios' ? 'modal' : 'card',
              animation: Platform.OS === 'ios' ? 'modal' : 'slide_from_right',
              gestureEnabled: true, // Enable swipe gestures on iOS
              gestureResponseDistance: Platform.OS === 'ios' ? 50 : 25, // Better iOS swipe response
            }} 
          />
          <Stack.Screen 
            name="match/press-log/[id]" 
            options={{ 
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
              gestureEnabled: true, // Enable swipe gestures on iOS
            }} 
          />
          <Stack.Screen 
            name="match/score-input/[id]" 
            options={{ 
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_right',
              gestureEnabled: false, // Disable swipe back on iOS to prevent accidental exits
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
  );
}
