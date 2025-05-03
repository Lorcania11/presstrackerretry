import { Platform, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';

/**
 * Types for deep linking
 */
interface DeepLinkConfig {
  /**
   * Scheme for the deep link (e.g., "myapp://")
   */
  scheme: string;
  
  /**
   * Host patterns to match for universal links/app links
   * e.g., ["example.com", "www.example.com"]
   */
  hosts: string[];
  
  /**
   * Paths to handle specifically, with wildcards using *
   * e.g., ["/profile/*", "/match/*"]
   */
  paths?: string[];
}

/**
 * Default configuration based on common app patterns
 * This preserves the functionality from the iOS AppDelegate
 */
const DEFAULT_CONFIG: DeepLinkConfig = {
  scheme: 'presstracker://',
  hosts: ['presstracker.app', 'www.presstracker.app'],
  paths: ['/match/*', '/profile/*', '/settings', '/history']
};

/**
 * Check if a URL matches our deep link configuration
 * @param url URL to check
 * @param config Deep link configuration
 * @returns boolean indicating if the URL matches
 */
export function matchesDeepLink(url: string, config: DeepLinkConfig = DEFAULT_CONFIG): boolean {
  if (url.startsWith(config.scheme)) {
    return true;
  }
  
  try {
    const parsedUrl = new URL(url);
    
    // Check if host matches
    if (!config.hosts.some(host => 
      parsedUrl.host === host || 
      parsedUrl.host.endsWith(`.${host}`)
    )) {
      return false;
    }
    
    // If no paths specified, any path on the host is valid
    if (!config.paths || config.paths.length === 0) {
      return true;
    }
    
    // Check if path matches any path pattern
    return config.paths.some(pattern => {
      // Convert pattern to regex
      const regexPattern = pattern
        .replace(/\*/g, '.*') // Convert * to regex .*
        .replace(/\//g, '\\/'); // Escape /
      
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(parsedUrl.pathname);
    });
  } catch (e) {
    console.error('Error parsing URL:', e);
    return false;
  }
}

/**
 * Parse deep link URL to extract route information
 * @param url Deep link URL
 * @param config Deep link configuration
 * @returns Object with route information
 */
export function parseDeepLink(url: string, config: DeepLinkConfig = DEFAULT_CONFIG) {
  // Default return if no match or parsing fails
  const defaultReturn = { screen: 'Home', params: {} };
  
  if (!matchesDeepLink(url, config)) {
    return defaultReturn;
  }
  
  try {
    let path: string;
    let queryParams: Record<string, string> = {};
    
    if (url.startsWith(config.scheme)) {
      // Handle custom scheme URLs
      const schemeSpecificPart = url.substring(config.scheme.length);
      const queryIndex = schemeSpecificPart.indexOf('?');
      
      if (queryIndex >= 0) {
        path = schemeSpecificPart.substring(0, queryIndex);
        const queryString = schemeSpecificPart.substring(queryIndex + 1);
        queryParams = Object.fromEntries(
          new URLSearchParams(queryString).entries()
        );
      } else {
        path = schemeSpecificPart;
      }
    } else {
      // Handle HTTP/HTTPS URLs
      const parsedUrl = new URL(url);
      path = parsedUrl.pathname;
      queryParams = Object.fromEntries(parsedUrl.searchParams.entries());
    }
    
    // Remove trailing slash if present
    path = path.endsWith('/') ? path.slice(0, -1) : path;
    
    // Path mapping logic based on your app's routing
    if (path.startsWith('/match/')) {
      const matchId = path.replace('/match/', '');
      return {
        screen: 'Match',
        params: { id: matchId, ...queryParams }
      };
    } else if (path === '/history') {
      return {
        screen: 'History',
        params: queryParams
      };
    } else if (path === '/settings') {
      return {
        screen: 'Settings',
        params: queryParams
      };
    } else if (path === '/new-match') {
      return {
        screen: 'NewMatch',
        params: queryParams
      };
    }
    
    // Default fallback
    return defaultReturn;
  } catch (e) {
    console.error('Error parsing deep link:', e);
    return defaultReturn;
  }
}

/**
 * Hook to handle incoming deep links
 * @param config Deep link configuration
 * @returns Object with deep link information
 */
export function useDeepLinks(config: DeepLinkConfig = DEFAULT_CONFIG) {
  const [deepLink, setDeepLink] = useState<string | null>(null);
  
  // Handle incoming links
  const handleUrl = useCallback((event: { url: string }) => {
    if (matchesDeepLink(event.url, config)) {
      setDeepLink(event.url);
    }
  }, [config]);
  
  useEffect(() => {
    // Get the initial URL if the app was opened from a deep link
    Linking.getInitialURL().then(url => {
      if (url && matchesDeepLink(url, config)) {
        setDeepLink(url);
      }
    });
    
    // Listen for deep link events
    const subscription = Linking.addEventListener('url', handleUrl);
    
    return () => {
      subscription.remove();
    };
  }, [handleUrl, config]);
  
  // Parse the deep link
  const parsedDeepLink = deepLink ? parseDeepLink(deepLink, config) : null;
  
  return {
    url: deepLink,
    parsed: parsedDeepLink,
    clearDeepLink: () => setDeepLink(null)
  };
}

/**
 * Open a URL, handling both external websites and app deep links
 * @param url URL to open
 * @param config Deep link configuration
 * @returns Promise that resolves when the URL is opened
 */
export async function openURL(url: string, config: DeepLinkConfig = DEFAULT_CONFIG): Promise<void> {
  // Check if this is a deep link to our app
  if (matchesDeepLink(url, config)) {
    return Linking.openURL(url);
  }
  
  // Otherwise, open in browser
  if (Platform.OS === 'ios') {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (e) {
      // Fallback to Linking if WebBrowser fails
      await Linking.openURL(url);
    }
  } else {
    // On Android, just use Linking
    await Linking.openURL(url);
  }
}