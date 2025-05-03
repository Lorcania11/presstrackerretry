# iOS to Cross-Platform Migration Documentation

This document outlines the iOS-specific functionality that has been preserved and converted to cross-platform implementations.

## Overview of Preserved iOS Functionality

The following iOS-specific features have been migrated to cross-platform implementations:

1. **Status Bar Management**: Device-specific status bar handling including notch/Dynamic Island detection
2. **Safe Area Handling**: Proper inset management across different device types
3. **Splash Screen Configuration**: Maintaining iOS splash screen appearance and behavior
4. **Deep Linking**: Support for custom URL schemes and Universal Links
5. **Platform-Specific UI Styling**: Preserving iOS-native look and feel in a cross-platform way

## Utility Modules

### 1. Status Bar Manager (`/utils/statusBarManager.ts`)

This utility handles status bar height calculations and device type detection across platforms:

- Migrated iOS-specific device detection logic (notch/Dynamic Island)
- Added Android device detection
- Provides consistent status bar padding across platforms
- Preserves iOS-specific status bar appearance

### 2. Safe Area Manager (`/utils/safeAreaManager.ts`)

Handles safe areas and platform-specific UI adaptations:

- Enhanced the `useSafeArea` hook beyond basic insets
- Added platform-specific styling that matches iOS native appearance
- Provides component styling helpers for consistent cross-platform UI
- Implements iOS-specific shadow styling

### 3. Splash Screen Manager (`/utils/splashScreenManager.ts`)

Manages splash screen appearance and behavior:

- Preserves iOS splash screen color configuration for light/dark mode
- Maintains consistent splash screen timing and animations
- Provides device-specific configuration for splash screen elements

### 4. Deep Linking Manager (`/utils/deepLinkingManager.ts`)

Handles app deep linking capabilities:

- Preserves functionality from iOS AppDelegate.mm for URL handling
- Supports both custom URL schemes and Universal Links
- Provides consistent deep link parsing across platforms

## Usage Examples

### Status Bar and Safe Areas

```tsx
import { getStatusBarPadding } from '@/utils/statusBarManager';
import { useSafeArea, createSafeAreaStyles } from '@/utils/safeAreaManager';

function MyComponent() {
  const safeArea = useSafeArea();
  const styles = createSafeAreaStyles();
  
  return (
    <View style={[styles.container, { paddingTop: getStatusBarPadding() }]}>
      {/* Your component content */}
    </View>
  );
}
```

### Deep Linking

```tsx
import { useDeepLinks } from '@/utils/deepLinkingManager';

function MyScreen() {
  const deepLinking = useDeepLinks();
  
  useEffect(() => {
    if (deepLinking.parsed) {
      // Handle deep link
      console.log('Deep link detected:', deepLinking.url);
      // Navigate to appropriate screen
    }
  }, [deepLinking.parsed]);
  
  // Component rendering
}
```

### Splash Screen

```tsx
import { useSplashScreen } from '@/utils/splashScreenManager';

function AppRoot() {
  const [isAppReady, setIsAppReady] = useState(false);
  
  // Use the splash screen hook to manage splash screen visibility
  useSplashScreen(isAppReady);
  
  useEffect(() => {
    // Initialize your app
    initializeApp().then(() => {
      setIsAppReady(true); // This will hide the splash screen
    });
  }, []);
  
  // Component rendering
}
```

## iOS-Specific Assets

The following assets from the iOS folder have been preserved:

1. Splash screen background colors (light/dark mode)
2. Splash screen logo dimensions and configuration
3. App icon configuration

These assets are now managed through the React Native/Expo asset system instead of the iOS-specific asset catalog.

## Known Limitations

Some iOS-specific features may still require native code for full functionality:

1. **Push Notifications**: For advanced push notification handling, you may need to add native modules
2. **Native Animations**: For complex animations that match iOS exactly, you might need to use native drivers
3. **Specific Hardware Features**: For features like Apple Pay, you would need to implement native modules

## Next Steps

After removing the iOS folder, ensure you:

1. Test the app thoroughly on both iOS and Android
2. Verify deep linking functionality works as expected
3. Check that UI elements respect safe areas on all device types
4. Ensure splash screen appearance matches the original iOS configuration