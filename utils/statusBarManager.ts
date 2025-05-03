import { Platform, StatusBar, Dimensions, NativeModules } from 'react-native';

const { StatusBarManager } = NativeModules;

/**
 * Device model types for UI adaptations
 * This helps identify different iOS device generations for proper UI layout
 */
export enum DeviceModel {
  // iOS specific
  NOTCHED = 'NOTCHED',           // iPhone X, XS, 11, 12, 13
  DYNAMIC_ISLAND = 'DYNAMIC_ISLAND', // iPhone 14 Pro and onwards
  CLASSIC_IOS = 'CLASSIC_IOS',   // iPhone 8 and below
  
  // Android specific
  ANDROID_NOTCHED = 'ANDROID_NOTCHED', // Android devices with notch/cutout
  ANDROID_STANDARD = 'ANDROID_STANDARD', // Standard Android devices
  
  // Fallback
  OTHER = 'OTHER'
}

// Cache the detected model
let detectedDeviceModel: DeviceModel | null = null;

// Get status bar height for iOS (either from StatusBarManager or fallback value)
let statusBarHeight = 0;
if (Platform.OS === 'ios') {
  // Try to get the status bar height from StatusBarManager
  if (StatusBarManager && StatusBarManager.getHeight) {
    StatusBarManager.getHeight((statusBarFrameData: { height: number }) => {
      statusBarHeight = statusBarFrameData.height;
    });
  } else {
    // Fallback values based on common device types
    const { height, width } = Dimensions.get('window');
    const aspectRatio = height / width;
    
    if (aspectRatio > 2) {
      // Modern iPhones with notch or Dynamic Island
      statusBarHeight = 47;
    } else {
      // Classic iPhones
      statusBarHeight = 20;
    }
  }
}

/**
 * Detect the device model type based on platform, screen dimensions and device properties
 * @returns The detected device model type
 */
export function detectDeviceModel(): DeviceModel {
  // Return cached value if already detected
  if (detectedDeviceModel) return detectedDeviceModel;
  
  if (Platform.OS === 'ios') {
    const { height, width } = Dimensions.get('window');
    const aspectRatio = height / width;
    
    // Check for iPhone X and later (notched models) based on aspect ratio
    if (aspectRatio > 2.1) {
      // For iPhone 14 Pro and later with Dynamic Island
      if (height >= 845) {
        detectedDeviceModel = DeviceModel.DYNAMIC_ISLAND;
      } else {
        detectedDeviceModel = DeviceModel.NOTCHED;
      }
    } else if (aspectRatio > 1.8) {
      // For iPhone 8 and earlier
      detectedDeviceModel = DeviceModel.CLASSIC_IOS;
    } else {
      detectedDeviceModel = DeviceModel.OTHER;
    }
  } else if (Platform.OS === 'android') {
    // Android detection logic
    // Note: This is a simple implementation. For more accurate detection,
    // you might want to use a native module or check for cutout support
    const { height, width } = Dimensions.get('window');
    const aspectRatio = height / width;
    
    if (aspectRatio > 2) {
      detectedDeviceModel = DeviceModel.ANDROID_NOTCHED;
    } else {
      detectedDeviceModel = DeviceModel.ANDROID_STANDARD;
    }
  } else {
    detectedDeviceModel = DeviceModel.OTHER;
  }
  
  return detectedDeviceModel;
}

/**
 * Get the status bar height based on the device platform and model
 * @returns The status bar height in pixels
 */
export function getStatusBarHeight(): number {
  if (Platform.OS === 'android') {
    return StatusBar.currentHeight || 0;
  }
  
  if (Platform.OS === 'ios') {
    // Use the cached value if available
    if (statusBarHeight > 0) {
      return statusBarHeight;
    }
    
    // Fallback values based on model
    const model = detectDeviceModel();
    
    switch (model) {
      case DeviceModel.DYNAMIC_ISLAND:
        return 54; // Height for Dynamic Island models
      case DeviceModel.NOTCHED:
        return 47; // Height for notched models (X, XS, 11, etc.)
      case DeviceModel.CLASSIC_IOS:
        return 20; // Height for classic iPhones (8 and below)
      default:
        return 20; // Default fallback
    }
  }
  
  return 0; // Default for other platforms
}

/**
 * Determine if the device has a notch or Dynamic Island
 * @returns Boolean indicating if the device has a notch/cutout
 */
export function hasNotchOrCutout(): boolean {
  const model = detectDeviceModel();
  return (
    model === DeviceModel.NOTCHED || 
    model === DeviceModel.DYNAMIC_ISLAND ||
    model === DeviceModel.ANDROID_NOTCHED
  );
}

/**
 * Get safe padding for content below status bar
 * This provides appropriate padding values for different device models
 * @returns The recommended padding value in pixels
 */
export function getStatusBarPadding(): number {
  if (Platform.OS === 'ios') {
    const model = detectDeviceModel();
    if (model === DeviceModel.DYNAMIC_ISLAND) {
      return getStatusBarHeight() + 10; // Extra padding for Dynamic Island
    } else if (model === DeviceModel.NOTCHED) {
      return getStatusBarHeight() + 4; // Small extra padding for notch
    }
    return getStatusBarHeight();
  } else if (Platform.OS === 'android') {
    const model = detectDeviceModel();
    if (model === DeviceModel.ANDROID_NOTCHED) {
      return getStatusBarHeight() + 8; // Extra padding for notched Android
    }
    return getStatusBarHeight();
  }
  
  return getStatusBarHeight();
}

/**
 * Get bottom inset for devices with home indicators/navigation bars
 * @returns The recommended bottom inset in pixels
 */
export function getBottomInset(): number {
  if (Platform.OS === 'ios') {
    const model = detectDeviceModel();
    if (model === DeviceModel.NOTCHED || model === DeviceModel.DYNAMIC_ISLAND) {
      return 34; // Standard bottom inset for notched iPhones
    }
    return 0; // No bottom inset for classic iPhones
  } else if (Platform.OS === 'android') {
    // For Android, could implement detection of navigation bar height
    // This is a simplified version
    return 16;
  }
  
  return 0;
}
