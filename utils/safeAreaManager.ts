import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hasNotchOrCutout, getBottomInset } from './statusBarManager';

/**
 * Create platform-specific safe area styles
 * This helps create consistent UI margins that respect safe areas on all devices
 */
export function createSafeAreaStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    safeAreaTop: {
      paddingTop: Platform.OS === 'ios' ? 0 : 8,
    },
    safeAreaBottom: {
      paddingBottom: Platform.OS === 'ios' ? 0 : 8,
    },
    safeAreaLeft: {
      paddingLeft: Platform.OS === 'ios' ? 0 : 8,
    },
    safeAreaRight: {
      paddingRight: Platform.OS === 'ios' ? 0 : 8,
    },
    // Enhanced iOS shadow styling that matches native iOS appearance
    iosShadow: Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 5,
    } : {},
    // Android elevation shadow equivalent
    androidShadow: Platform.OS === 'android' ? {
      elevation: 4,
    } : {},
    // Cross-platform shadow
    shadow: Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    } : {
      elevation: 3,
    },
  });
}

/**
 * Safe area hook with additional utilities beyond react-native-safe-area-context
 * @returns Enhanced safe area insets with additional utility properties
 */
export function useSafeArea() {
  const insets = useSafeAreaInsets();
  
  return {
    ...insets,
    hasNotch: hasNotchOrCutout(),
    // Add extra bottom padding for iOS devices with home indicator
    bottomInset: insets.bottom > 0 ? insets.bottom : getBottomInset(),
    // Helper function to create padding style that respects safe areas
    createPadding: (additionalPadding = 0) => ({
      paddingTop: insets.top + additionalPadding,
      paddingBottom: insets.bottom + additionalPadding,
      paddingLeft: insets.left + additionalPadding,
      paddingRight: insets.right + additionalPadding,
    }),
    // Helper to create padding for only specific edges
    createSelectivePadding: (
      options: {
        top?: number,
        bottom?: number,
        left?: number,
        right?: number
      } = {}
    ) => ({
      paddingTop: options.top !== undefined ? insets.top + options.top : 0,
      paddingBottom: options.bottom !== undefined ? insets.bottom + options.bottom : 0,
      paddingLeft: options.left !== undefined ? insets.left + options.left : 0,
      paddingRight: options.right !== undefined ? insets.right + options.right : 0,
    }),
  };
}

/**
 * Get common platform-specific UI styles that match native appearances
 * This helps maintain iOS-specific styling in cross-platform components
 */
export function getPlatformUIStyles() {
  const isIOS = Platform.OS === 'ios';
  
  return {
    // Button styles
    button: {
      borderRadius: isIOS ? 10 : 4,
      paddingVertical: isIOS ? 12 : 8,
      paddingHorizontal: isIOS ? 16 : 12,
    },
    // Input field styles
    input: {
      borderRadius: isIOS ? 10 : 4,
      borderWidth: isIOS ? 0.5 : 1,
      paddingVertical: isIOS ? 12 : 8,
      paddingHorizontal: isIOS ? 12 : 8,
    },
    // Card styles
    card: {
      borderRadius: isIOS ? 12 : 4,
      padding: isIOS ? 16 : 12,
      ...StyleSheet.flatten(
        isIOS ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 5,
        } : {
          elevation: 3,
        }
      ),
    },
    // Typography styles that match platform conventions
    typography: {
      title: {
        fontSize: isIOS ? 20 : 18,
        fontWeight: isIOS ? '600' : '700',
        letterSpacing: isIOS ? 0.5 : 0,
      },
      subtitle: {
        fontSize: isIOS ? 16 : 14,
        fontWeight: isIOS ? '500' : '500',
        letterSpacing: isIOS ? 0.15 : 0.1,
      },
      body: {
        fontSize: isIOS ? 16 : 14,
        fontWeight: 'normal',
        letterSpacing: isIOS ? 0 : 0.25,
      },
    },
  };
}

/**
 * Calculate adaptive text size based on platform conventions
 * @param baseSize The base font size
 * @param options Options for adjusting the size
 * @returns Appropriate font size for the current platform
 */
export function getAdaptiveTextSize(
  baseSize: number,
  options: { 
    scale?: number;
    minSize?: number;
    maxSize?: number;
    reduceForAndroid?: boolean;
  } = {}
) {
  const {
    scale = 1,
    minSize = 8,
    maxSize = 40,
    reduceForAndroid = true,
  } = options;
  
  // iOS-specific adjustment based on preferences found in iOS code
  let size = baseSize * scale;
  
  // Adjust for Android platform conventions if specified
  if (Platform.OS === 'android' && reduceForAndroid) {
    size = size * 0.92; // Slightly smaller text on Android
  }
  
  // Clamp to min/max
  return Math.min(Math.max(size, minSize), maxSize);
}