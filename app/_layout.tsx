import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MatchProvider } from '@/context/MatchContext';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MatchProvider>
          <Stack>
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
