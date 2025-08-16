
import React, { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VehicleSpecific from "./pages/VehicleSpecific";
import ProfessionalDiagnostics from "./pages/ProfessionalDiagnostics";
import MobilePermissionDialog from "./components/MobilePermissionDialog";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(true); // Start as true to prevent blocking
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        
        // Add a small delay to ensure native plugins are ready
        if (window.Capacitor?.isNativePlatform?.()) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Check if we're on mobile and might need permissions
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                         window.innerWidth <= 768 ||
                         window.Capacitor?.isNativePlatform?.();

        if (isMobile) {
          console.log('Mobile platform detected');
          
          // Only check permissions if services are available
          try {
            const { mobilePermissionsService } = await import('./services/MobilePermissionsService');
            const status = await mobilePermissionsService.checkAllPermissionStatus();
            const hasEssentialPermissions = status.bluetooth && status.location;
            
            if (!hasEssentialPermissions) {
              console.log('Essential permissions missing, showing dialog');
              setShowPermissionDialog(true);
              setPermissionsGranted(false);
            }
          } catch (error) {
            console.warn('Permission check failed, continuing anyway:', error);
            // Don't block the app if permission checking fails
          }
        } else {
          console.log('Desktop platform detected');
        }
      } catch (error) {
        console.error('App initialization error (non-critical):', error);
        // Don't block the app for initialization errors
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  const handlePermissionsGranted = () => {
    console.log('Permissions granted, continuing with app...');
    setPermissionsGranted(true);
    setShowPermissionDialog(false);
  };

  const handlePermissionDialogClose = () => {
    setShowPermissionDialog(false);
    // Allow app to continue even if user closes dialog
    setPermissionsGranted(true);
  };

  // Show loading state until initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Starting OBD2 Diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          {showPermissionDialog && (
            <MobilePermissionDialog
              isOpen={true}
              onClose={handlePermissionDialogClose}
              onPermissionsGranted={handlePermissionsGranted}
              requiredFeatures={['full_diagnostics']}
            />
          )}
          
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/vehicle-specific" element={<VehicleSpecific />} />
            <Route path="/professional-diagnostics" element={<ProfessionalDiagnostics />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
