import { Platform, StatusBar, Dimensions, NativeModules } from 'react-native';

const { StatusBarManager } = NativeModules;

// Define the iPhone model types
export enum iPhoneModel {
  NOTCHED = 'NOTCHED', // iPhone X, XS, 11, 12, 13
  DYNAMIC_ISLAND = 'DYNAMIC_ISLAND', // iPhone 14 Pro and onwards
  CLASSIC = 'CLASSIC', // iPhone 8 and below
  OTHER = 'OTHER'
}

// Cache the detected model
let detectedIPhoneModel: iPhoneModel | null = null;

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
 * Detect the iPhone model type based on screen dimensions and device properties
 */
export function detectIPhoneModel(): iPhoneModel {
  // Return cached value if already detected
  if (detectedIPhoneModel) return detectedIPhoneModel;
  
  // Only run this check on iOS
  if (Platform.OS !== 'ios') {
    detectedIPhoneModel = iPhoneModel.OTHER;
    return detectedIPhoneModel;
  }
  
  const { height, width } = Dimensions.get('window');
  const aspectRatio = height / width;
  
  // Check for iPhone X and later (notched models) based on aspect ratio
  if (aspectRatio > 2.1) {
    // For iPhone 14 Pro and later with Dynamic Island
    if (height >= 845) {
      detectedIPhoneModel = iPhoneModel.DYNAMIC_ISLAND;
    } else {
      detectedIPhoneModel = iPhoneModel.NOTCHED;
    }
  } else if (aspectRatio > 1.8) {
    // For iPhone 8 and earlier
    detectedIPhoneModel = iPhoneModel.CLASSIC;
  } else {
    detectedIPhoneModel = iPhoneModel.OTHER;
  }
  
  return detectedIPhoneModel;
}

/**
 * Get the status bar height based on the device
 */
export function getStatusBarHeight(): number {
  if (Platform.OS !== 'ios') {
    return StatusBar.currentHeight || 0;
  }
  
  // Use the cached value if available
  if (statusBarHeight > 0) {
    return statusBarHeight;
  }
  
  // Fallback values based on model
  const model = detectIPhoneModel();
  
  switch (model) {
    case iPhoneModel.DYNAMIC_ISLAND:
      return 54; // Height for Dynamic Island models
    case iPhoneModel.NOTCHED:
      return 47; // Height for notched models (X, XS, 11, etc.)
    case iPhoneModel.CLASSIC:
      return 20; // Height for classic iPhones (8 and below)
    default:
      return 20; // Default fallback
  }
}

/**
 * Determine if the device has a notch or Dynamic Island
 */
export function hasNotchOrDynamicIsland(): boolean {
  const model = detectIPhoneModel();
  return model === iPhoneModel.NOTCHED || model === iPhoneModel.DYNAMIC_ISLAND;
}

/**
 * Get safe padding for content below status bar
 */
export function getStatusBarPadding(): number {
  // Add extra padding for Dynamic Island on iOS
  if (Platform.OS === 'ios') {
    const model = detectIPhoneModel();
    if (model === iPhoneModel.DYNAMIC_ISLAND) {
      return getStatusBarHeight() + 10; // Extra padding for Dynamic Island
    } else if (model === iPhoneModel.NOTCHED) {
      return getStatusBarHeight() + 4; // Small extra padding for notch
    }
  }
  
  return getStatusBarHeight();
}
