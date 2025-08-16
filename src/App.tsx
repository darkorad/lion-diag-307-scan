
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProfessionalDiagnostics from "./pages/ProfessionalDiagnostics";
import MobileErrorBoundary from "./components/mobile/MobileErrorBoundary";
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        
        // Wait for Capacitor to be ready if on mobile
        if (window.Capacitor) {
          console.log('Waiting for Capacitor platform ready...');
          await new Promise(resolve => {
            document.addEventListener('deviceready', resolve, false);
            // Fallback timeout in case deviceready doesn't fire
            setTimeout(resolve, 3000);
          });
          console.log('Capacitor platform ready');
        }

        // Add a small delay to ensure everything is fully initialized
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('App initialization complete');
        setIsAppReady(true);
        
      } catch (error) {
        console.error('App initialization failed:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
        // Still set app as ready to show error UI
        setIsAppReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing OBD2 Diagnostic Tool...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-destructive text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-destructive mb-2">Initialization Error</h1>
          <p className="text-muted-foreground mb-4">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <MobileErrorBoundary fallbackTitle="OBD2 App Error">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/professional" element={<ProfessionalDiagnostics />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </MobileErrorBoundary>
  );
}

export default App;
