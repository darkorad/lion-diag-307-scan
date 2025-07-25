
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ConnectionsPage from "./components/ConnectionsPage";
import PermissionRequestDialog from "./components/PermissionRequestDialog";
import MobilePermissionDialog from "./components/MobilePermissionDialog";
import { PermissionStatus } from "./services/PermissionService";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

function App() {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile environment
  const detectMobile = () => {
    return !!(window.cordova || window.Capacitor || 
      window.navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i));
  };

  useEffect(() => {
    const mobile = detectMobile();
    setIsMobile(mobile);
    
    // On mobile, always check permissions on startup
    if (mobile) {
      setShowPermissionDialog(true);
    } else {
      // On web, check localStorage
      const hasShownPermissions = localStorage.getItem('permissions-requested');
      if (!hasShownPermissions) {
        setShowPermissionDialog(true);
      } else {
        setPermissionsGranted(true);
      }
    }
  }, []);

  const handlePermissionsGranted = (status?: PermissionStatus) => {
    setPermissionsGranted(true);
    setShowPermissionDialog(false);
    if (!isMobile) {
      localStorage.setItem('permissions-requested', 'true');
    }
    console.log('Permissions granted:', status);
  };

  const handleBackToIndex = () => {
    window.location.href = '/';
  };

  const handleConnectionChange = (connected: boolean) => {
    console.log('Connection status changed:', connected);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            {/* Show appropriate permission dialog based on platform */}
            {showPermissionDialog && isMobile && (
              <MobilePermissionDialog
                isOpen={showPermissionDialog}
                onClose={() => setShowPermissionDialog(false)}
                onPermissionsGranted={handlePermissionsGranted}
                requiredFeatures={['full_diagnostics']}
              />
            )}
            {showPermissionDialog && !isMobile && (
              <PermissionRequestDialog
                open={showPermissionDialog}
                onOpenChange={setShowPermissionDialog}
                onPermissionsGranted={handlePermissionsGranted}
              />
            )}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route 
                path="/connections" 
                element={
                  <ConnectionsPage 
                    onBack={handleBackToIndex}
                    onConnectionChange={handleConnectionChange}
                  />
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
