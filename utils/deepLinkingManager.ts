import { useState, useEffect } from 'react';
import { Linking, Platform } from 'react-native';

interface DeepLinkData {
  url: string | null;
  parsed: any | null;
}

export function useDeepLinks() {
  const [deepLink, setDeepLink] = useState<DeepLinkData>({
    url: null,
    parsed: null
  });
  const [isProcessingInitialURL, setIsProcessingInitialURL] = useState(false);

  useEffect(() => {
    // Flag to prevent multiple initializations which can happen on iOS
    let isMounted = true;
    
    // Handle deep links when the app is already open
    let subscription: { remove: () => void } | null = null;
    
    try {
      subscription = Linking.addEventListener('url', handleDeepLink);
    } catch (error) {
      console.log('Error setting up deep link listener:', error);
    }

    // Get the URL that opened the app
    // Using setTimeout to delay the initial URL check on iOS to avoid startup crashes
    const delay = Platform.OS === 'ios' ? 300 : 0;
    setIsProcessingInitialURL(true);
    
    setTimeout(() => {
      try {
        Linking.getInitialURL()
          .then(url => {
            if (url && isMounted) {
              handleUrl(url);
            }
          })
          .catch(error => {
            console.log('Error getting initial URL:', error);
          })
          .finally(() => {
            if (isMounted) {
              setIsProcessingInitialURL(false);
            }
          });
      } catch (error) {
        console.log('Error in getInitialURL process:', error);
        if (isMounted) {
          setIsProcessingInitialURL(false);
        }
      }
    }, delay);

    return () => {
      isMounted = false;
      if (subscription) {
        try {
          subscription.remove();
        } catch (error) {
          console.log('Error removing deep link listener:', error);
        }
      }
    };
  }, []);

  const handleDeepLink = ({ url }: { url: string }) => {
    handleUrl(url);
  };

  const handleUrl = (url: string) => {
    // Parse the URL to extract parameters
    try {
      const parsed = parseUrl(url);
      setDeepLink({
        url,
        parsed
      });
    } catch (error) {
      console.error('Error parsing deep link:', error);
    }
  };

  const parseUrl = (url: string) => {
    if (!url) return null;
    
    try {
      // Example parsing logic - adjust based on your deep link structure
      const regex = /^com\.yourapp:\/\/([^\/]+)(?:\/([^?]+))?(?:\?(.*))?$/;
      const match = url.match(regex);

      if (!match) {
        return null;
      }

      const [, action, path, queryString] = match;
      
      // Parse query params
      const params: Record<string, string> = {};
      if (queryString) {
        queryString.split('&').forEach(param => {
          const [key, value] = param.split('=');
          if (key && value) {
            params[decodeURIComponent(key)] = decodeURIComponent(value);
          }
        });
      }

      return {
        action,
        path,
        params
      };
    } catch (error) {
      console.log('Error parsing URL:', error);
      return null;
    }
  };

  const clearDeepLink = () => {
    setDeepLink({
      url: null,
      parsed: null
    });
  };

  return {
    ...deepLink,
    isProcessingInitialURL,
    clearDeepLink
  };
}