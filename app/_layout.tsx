import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MatchProvider } from '@/context/MatchContext';

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
              presentation: 'card',
              animation: 'slide_from_right',
            }} 
          />
          <Stack.Screen 
            name="match/press-log/[id]" 
            options={{ 
              headerShown: false,
              presentation: 'card',
              animation: 'slide_from_bottom',
            }} 
          />
        </Stack>
        <StatusBar style="light" />
      </MatchProvider>
    </GestureHandlerRootView>
  );
}
