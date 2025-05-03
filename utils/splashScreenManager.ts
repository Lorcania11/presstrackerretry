import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { DeviceModel, detectDeviceModel } from './statusBarManager';

// Try to prevent native splash screen from auto hiding, but don't crash if it fails
try {
  SplashScreen.preventAutoHideAsync().catch(() => {
    /* reloading the app might trigger some race conditions, ignore them */
  });
} catch (error) {
  console.log('Error preventing splash screen auto-hide:', error);
}

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
      // Track if we're still mounted when the timeout fires
      let isMounted = true;
      
      // Add a timeout to give the app time to prepare the UI
      const timeout = setTimeout(async () => {
        if (!isMounted) return;
        
        try {
          // On iOS, add a small delay to make the transition smoother
          if (Platform.OS === 'ios') {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          await SplashScreen.hideAsync();
        } catch (error) {
          console.log('Error hiding splash screen:', error);
          // Try again with a direct approach as fallback
          try {
            SplashScreen.hide();
          } catch (innerError) {
            console.log('Fallback splash screen hide also failed:', innerError);
          }
        }
      }, delayMs);
      
      return () => {
        isMounted = false;
        clearTimeout(timeout);
      };
    }
  }, [isAppReady, delayMs]);
}

/**
 * Get splash screen configuration based on device model
 * This helps adjust any splash screen parameters based on the device
 */
export function getSplashScreenConfig() {
  // Try-catch to ensure this doesn't crash app startup
  try {
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
  } catch (error) {
    console.log('Error getting splash screen config:', error);
    // Return safe default config
    return {
      logoSize: { width: 200, height: 200 },
      animation: 'fade',
      animationDuration: 800,
    };
  }
}