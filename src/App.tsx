
import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Dashboard from './components/Dashboard';
import MobileConnectionScreen from './components/mobile/MobileConnectionScreen';
import MobileErrorBoundary from './components/mobile/MobileErrorBoundary';
import { bluetoothIntegrationService } from './services/BluetoothIntegrationService';
import { bluetoothConnectionManager } from './services/BluetoothConnectionManager';
import { BluetoothDevice } from './services/MasterBluetoothService';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStrength, setConnectionStrength] = useState(0);
  const [vehicleData, setVehicleData] = useState({});
  const [showConnectionScreen, setShowConnectionScreen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        console.log('Initializing app for platform:', Capacitor.getPlatform());
        
        // Subscribe to connection state changes
        const unsubscribe = bluetoothConnectionManager.subscribe((state) => {
          if (!mounted) return;
          
          setIsConnected(state.isConnected);
          setConnectionStrength(state.connectionQuality === 'excellent' ? 100 : 
                               state.connectionQuality === 'good' ? 75 :
                               state.connectionQuality === 'fair' ? 50 : 25);
        });

        // Initialize Bluetooth system if on mobile
        if (Capacitor.isNativePlatform()) {
          try {
            await bluetoothIntegrationService.initializeBluetoothSystem();
            console.log('Mobile Bluetooth system initialized');
          } catch (error) {
            console.warn('Bluetooth initialization failed, will retry on connect:', error);
          }
        }

        if (mounted) {
          setIsInitializing(false);
        }

        return unsubscribe;
      } catch (error) {
        console.error('App initialization failed:', error);
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    const unsubscribePromise = initializeApp();

    return () => {
      mounted = false;
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, []);

  const handleConnect = async (): Promise<void> => {
    try {
      console.log('Connect button pressed');
      setShowConnectionScreen(true);
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error('Connection failed');
    }
  };

  const handleDisconnect = async (): Promise<void> => {
    try {
      await bluetoothIntegrationService.disconnect();
      toast.success('Disconnected from device');
    } catch (error) {
      console.error('Disconnect failed:', error);
      toast.error('Disconnect failed');
    }
  };

  const handleDeviceConnected = (device: BluetoothDevice) => {
    setShowConnectionScreen(false);
    toast.success(`Connected to ${device.name}`);
  };

  const handleBackFromConnection = () => {
    setShowConnectionScreen(false);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing OBD2 Diagnostic App...</p>
        </div>
      </div>
    );
  }

  const AppContent = () => {
    if (showConnectionScreen) {
      return (
        <MobileConnectionScreen 
          onDeviceConnected={handleDeviceConnected}
          onBack={handleBackFromConnection}
        />
      );
    }

    return (
      <Routes>
        <Route 
          path="/" 
          element={
            <Dashboard
              isConnected={isConnected}
              connectionStrength={connectionStrength}
              vehicleData={vehicleData}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          } 
        />
        {navItems.map(({ to, page }) => (
          <Route key={to} path={to} element={page} />
        ))}
      </Routes>
    );
  };

  return (
    <MobileErrorBoundary fallbackTitle="OBD2 Diagnostic App Error">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </MobileErrorBoundary>
  );
};

export default App;
