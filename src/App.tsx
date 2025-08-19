
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

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        
        // Add a small delay to ensure native plugins are ready
        if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('App initialization complete');
      } catch (error) {
        console.error('App initialization error (non-critical):', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

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
  );
};

export default App;
