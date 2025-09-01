
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseBackNavigationOptions {
  onBack?: () => void;
  fallbackRoute?: string;
}

export const useBackNavigation = (options: UseBackNavigationOptions = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onBack, fallbackRoute = '/' } = options;

  // Handle hardware back button (Android)
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault();
      
      if (onBack) {
        onBack();
      } else if (location.pathname !== '/') {
        navigate(fallbackRoute);
      }
    };

    // Handle Capacitor back button for mobile apps
    const handleCapacitorBack = () => {
      if (onBack) {
        onBack();
      } else if (location.pathname !== '/') {
        navigate(fallbackRoute);
      } else {
        // If we're on the main screen, minimize the app instead of closing
        if (window.Capacitor?.isNativePlatform()) {
          window.Capacitor.Plugins.App?.minimizeApp();
        }
      }
    };

    // Add event listeners
    window.addEventListener('popstate', handleBackButton);
    
    // Add Capacitor back button listener if available
    if (window.Capacitor?.isNativePlatform() && window.Capacitor.Plugins?.App) {
      window.Capacitor.Plugins.App.addListener('backButton', handleCapacitorBack);
    }

    return () => {
      window.removeEventListener('popstate', handleBackButton);
      if (window.Capacitor?.isNativePlatform() && window.Capacitor.Plugins?.App) {
        window.Capacitor.Plugins.App.removeAllListeners();
      }
    };
  }, [navigate, location.pathname, onBack, fallbackRoute]);

  const goBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(fallbackRoute);
    }
  };

  return { goBack };
};
