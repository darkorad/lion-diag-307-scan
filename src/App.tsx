
import React, { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from './components/MainLayout';
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import VehicleSpecific from "./pages/VehicleSpecific";
import ProfessionalDiagnostics from "./pages/ProfessionalDiagnostics";
import VehicleSpecificErrorBoundary from "./components/VehicleSpecificErrorBoundary";
import MobileErrorBoundary from "./components/mobile/MobileErrorBoundary";
import Diagnostics from './pages/Diagnostics';
import VehicleSelection from './pages/VehicleSelection';
import Connections from './pages/Connections';
import Settings from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Starting app initialization...');
        
        // Wait for Capacitor to be ready on native platforms
        if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
          console.log('Native platform detected, waiting for Capacitor...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check if Capacitor plugins are ready
          if (window.Capacitor?.Plugins) {
            console.log('Capacitor plugins available');
          } else {
            console.warn('Capacitor plugins not ready, continuing anyway');
          }
        } else {
          console.log('Web platform detected');
        }

        console.log('App initialization complete');
        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
        setIsInitialized(true); // Still try to render the app
      }
    };

    initializeApp();
  }, []);

  // Show loading state until initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-lg font-semibold">Starting OBD2 Diagnostics...</h2>
          <p className="text-sm text-muted-foreground">Initializing native services...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed critically
  if (initError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-4xl">⚠️</div>
          <h2 className="text-lg font-semibold text-destructive">Startup Error</h2>
          <p className="text-sm text-muted-foreground">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Restart App
          </button>
        </div>
      </div>
    );
  }

  return (
    <MobileErrorBoundary fallbackTitle="App Startup Error">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route
                  path="/vehicle-specific"
                  element={
                    <VehicleSpecificErrorBoundary>
                      <VehicleSpecific />
                    </VehicleSpecificErrorBoundary>
                  }
                />
                <Route
                  path="/vehicle-specific/:make/:model/:generation/:engine"
                  element={
                    <VehicleSpecificErrorBoundary>
                      <VehicleSpecific />
                    </VehicleSpecificErrorBoundary>
                  }
                />
                <Route path="/professional-diagnostics" element={<ProfessionalDiagnostics />} />
                <Route path="/diagnostics" element={<Diagnostics />} />
                <Route path="/vehicle-selection" element={<VehicleSelection />} />
                <Route path="/connections" element={<Connections />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </MobileErrorBoundary>
  );
};

export default App;
