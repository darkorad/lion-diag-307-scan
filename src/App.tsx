
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
