
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
import { mobilePermissionsService } from "./services/MobilePermissionsService";

const queryClient = new QueryClient();

const App = () => {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    // Check if we're on mobile and need permissions
    const checkMobilePermissions = async () => {
      try {
        // Detect if we're on a mobile platform
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                         window.innerWidth <= 768 ||
                         window.Capacitor?.isNativePlatform?.();

        if (isMobile) {
          console.log('Mobile platform detected, checking permissions...');
          
          // Check current permission status
          const status = await mobilePermissionsService.checkAllPermissionStatus();
          const hasEssentialPermissions = status.bluetooth && status.location;
          
          if (!hasEssentialPermissions) {
            console.log('Essential permissions missing, showing dialog');
            setShowPermissionDialog(true);
          } else {
            console.log('Permissions already granted');
            setPermissionsGranted(true);
          }
        } else {
          console.log('Desktop platform detected, skipping mobile permissions');
          setPermissionsGranted(true);
        }
      } catch (error) {
        console.error('Error checking mobile permissions:', error);
        // On error, still allow app to continue
        setPermissionsGranted(true);
      }
    };

    checkMobilePermissions();
  }, []);

  const handlePermissionsGranted = () => {
    console.log('Permissions granted, continuing with app...');
    setPermissionsGranted(true);
    setShowPermissionDialog(false);
  };

  const handlePermissionDialogClose = () => {
    setShowPermissionDialog(false);
    // Even if user closes dialog, still allow app to continue
    setPermissionsGranted(true);
  };

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
