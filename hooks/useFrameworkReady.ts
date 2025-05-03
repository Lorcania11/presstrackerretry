import { useEffect, useState } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Call the global framework ready function if it exists
    window.frameworkReady?.();
    
    // Set the ready state to true after a short delay
    // This simulates waiting for the framework to be ready
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return { isReady };
}