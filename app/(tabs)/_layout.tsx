import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Plus, Award, Settings } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { getStatusBarHeight } from '@/utils/statusBarManager';

export default function TabLayout() {
  const statusBarHeight = Platform.OS === 'ios' ? getStatusBarHeight() : 0;

  return (
    <>
      <StatusBar style="dark" />
      {/* @ts-ignore - Known issue with expo-router types */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#666666',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#EEEEEE',
          },
          tabBarLabelStyle: { fontSize: 12 },
          headerStyle: {
            backgroundColor: '#FFFFFF',
            height: Platform.OS === 'ios' ? 44 + statusBarHeight : 56,
            paddingTop: Platform.OS === 'ios' ? statusBarHeight : 0,
          },
          headerTintColor: '#333333',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerStatusBarHeight: statusBarHeight,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="new-match"
          options={{
            title: 'New Match',
            tabBarIcon: ({ color, size }) => (
              <Plus size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color, size }) => (
              <Award size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}