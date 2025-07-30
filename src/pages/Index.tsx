import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import StartScreen from '@/components/StartScreen';
import ConnectionPanel from '@/components/ConnectionPanel';
import LiveDataPanel from '@/components/LiveDataPanel';
import TroubleCodesPanel from '@/components/TroubleCodesPanel';
import VehicleInfoPanel from '@/components/VehicleInfoPanel';
import ReadinessPanel from '@/components/ReadinessPanel';
import { AdvancedDiagnosticsPanel } from '@/components/AdvancedDiagnosticsPanel';
import PeugeotDiagboxEmulator from '@/components/PeugeotDiagboxEmulator';
import { bluetoothConnectionManager } from '@/services/BluetoothConnectionManager';
import { bluetoothIntegrationService, BluetoothIntegrationResult } from '@/services/BluetoothIntegrationService';
import { masterBluetoothService, BluetoothDevice } from '@/services/MasterBluetoothService';
import { permissionService } from '@/services/PermissionService';
import { Button } from '@/components/ui/button';
import DTCPanel from '@/components/DTCPanel';

const Index = () => {
  const [currentView, setCurrentView] = useState('start'); // Fixed: Always start with start screen
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState({
    make: 'Peugeot',
    model: '307',
    engine: '1.6 HDi',
    year: 2005
  });

  useEffect(() => {
    // Initialize connection manager
    bluetoothConnectionManager.initialize();
    
    // Subscribe to connection state changes
    const unsubscribe = bluetoothConnectionManager.subscribe((state) => {
      setIsConnected(state.isConnected);
      setConnectionStatus(state.isConnected ? 'connected' : 'disconnected');
      
      if (state.isConnected && state.device) {
        toast.success(`Connected to ${state.device.name}`);
      }
    });

    // Check permissions status (don't request automatically)
    checkPermissionsStatus();

    return unsubscribe;
  }, []);

  const checkPermissionsStatus = async () => {
    try {
      const permissions = await permissionService.checkPermissionStatus();
      const allGranted = permissions.bluetooth && permissions.location;
      setPermissionsGranted(allGranted);
      
      if (!allGranted) {
        console.log('Some permissions not granted - user will need to grant them manually');
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      setPermissionsGranted(false);
    }
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
    setConnectionStatus(connected ? 'connected' : 'disconnected');
  };

  const handleStatusChange = (status: string) => {
    setConnectionStatus(status);
  };

  const handleDeviceConnected = async (device: BluetoothDevice) => {
    try {
      // Update connection manager state
      bluetoothConnectionManager.setConnected(device);
      
      // Update local state
      setIsConnected(true);
      setConnectionStatus('connected');
      
      toast.success(`Successfully connected to ${device.name}`);
    } catch (error) {
      console.error('Connection handling failed:', error);
      toast.error('Connection successful but initialization failed');
    }
  };

  const handleDisconnect = async () => {
    try {
      await masterBluetoothService.disconnect();
      bluetoothConnectionManager.setDisconnected();
      
      setIsConnected(false);
      setConnectionStatus('disconnected');
      
      toast.info('Disconnected from OBD2 device');
    } catch (error) {
      console.error('Disconnect failed:', error);
      toast.error('Disconnect failed');
    }
  };

  const handleBack = () => {
    setCurrentView('start');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'start':
        return (
          <StartScreen 
            onViewChange={handleNavigate} 
            isConnected={isConnected}
            permissionsGranted={permissionsGranted}
          />
        );
      case 'connection':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => setCurrentView('start')}
                className="flex items-center gap-2"
              >
                <span>← Back to Main Menu</span>
              </Button>
            </div>
            
            <ConnectionPanel
              isConnected={isConnected}
              onConnectionChange={handleConnectionChange}
              connectionStatus={connectionStatus}
              onStatusChange={handleStatusChange}
              vehicleInfo={vehicleInfo}
            />
          </div>
        );
      case 'live-data':
        return (
          <LiveDataPanel
            isConnected={isConnected}
            onBack={handleBack}
          />
        );
      case 'trouble-codes':
        return (
          <DTCPanel />
        );
      case 'vehicle-info':
        return (
          <VehicleInfoPanel
            isConnected={isConnected}
            onBack={handleBack}
          />
        );
      case 'readiness':
        return (
          <ReadinessPanel
            isConnected={isConnected}
            onBack={handleBack}
          />
        );
      case 'advanced-diagnostics':
        return (
          <AdvancedDiagnosticsPanel
            isConnected={isConnected}
          />
        );
      case 'professional-diagnostics':
        return (
          <PeugeotDiagboxEmulator
            isConnected={isConnected}
            onBack={handleBack}
          />
        );
      case 'settings':
        return <div>Settings Panel - Coming Soon</div>;
      default:
        return (
          <StartScreen 
            onViewChange={handleNavigate} 
            isConnected={isConnected}
            permissionsGranted={permissionsGranted}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default Index;
