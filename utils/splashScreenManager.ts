import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { DeviceModel, detectDeviceModel } from './statusBarManager';

// Prevent native splash screen from auto hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

/**
 * Colors extracted from iOS SplashScreenBackground.colorset
 * These match the iOS configuration for light/dark mode
 */
export const SPLASH_COLORS = {
  light: {
    background: '#e8f3f5', // RGB: 0.909, 0.952, 0.960
  },
  dark: {
    background: '#1e1f22', // RGB: 0.118, 0.125, 0.137
  }
};

/**
 * Hook to handle splash screen hiding with custom timing
 * @param isAppReady Boolean indicating if the app is ready to display
 * @param delayMs Optional delay in ms before hiding splash screen
 */
export function useSplashScreen(isAppReady: boolean, delayMs: number = 500) {
  useEffect(() => {
    if (isAppReady) {
      // Add a timeout to give the app time to prepare the UI
      const timeout = setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, delayMs);
      
      return () => clearTimeout(timeout);
    }
  }, [isAppReady, delayMs]);
}

/**
 * Get splash screen configuration based on device model
 * This helps adjust any splash screen parameters based on the device
 */
export function getSplashScreenConfig() {
  const deviceModel = detectDeviceModel();
  
  // Default configuration
  const config = {
    logoSize: { width: 200, height: 200 },
    animation: 'fade',
    animationDuration: 800,
  };
  
  // Adjust configuration based on device model
  if (Platform.OS === 'ios') {
    if (deviceModel === DeviceModel.DYNAMIC_ISLAND || deviceModel === DeviceModel.NOTCHED) {
      // For notched iPhones, adjust the logo size
      config.logoSize = { width: 220, height: 220 };
    }
  }
  
  return config;
}