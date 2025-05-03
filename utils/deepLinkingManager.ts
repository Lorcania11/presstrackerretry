import { useState, useEffect } from 'react';
import { Linking } from 'react-native';

interface DeepLinkData {
  url: string | null;
  parsed: any | null;
}

export function useDeepLinks() {
  const [deepLink, setDeepLink] = useState<DeepLinkData>({
    url: null,
    parsed: null
  });

  useEffect(() => {
    // Handle deep links when the app is already open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Get the URL that opened the app
    Linking.getInitialURL().then(url => {
      if (url) {
        handleUrl(url);
      }
    });

    return () => {
      subscription.remove();
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
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      });
    }

    return {
      action,
      path,
      params
    };
  };

  const clearDeepLink = () => {
    setDeepLink({
      url: null,
      parsed: null
    });
  };

  return {
    ...deepLink,
    clearDeepLink
  };
}