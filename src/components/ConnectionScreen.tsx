
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bluetooth, 
  Smartphone, 
  Settings,
  Wifi,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import ConnectionPanel from './ConnectionPanel';
import ProfessionalConnectionPanel from './ProfessionalConnectionPanel';
import SimplifiedBluetoothConnection from './SimplifiedBluetoothConnection';
import BackButton from './BackButton';
import { BluetoothDevice } from '@/services/bluetooth/types';
import { toast } from 'sonner';

const ConnectionScreen: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [vehicleInfo] = useState({
    make: 'Unknown',
    model: 'Unknown',
    engine: 'Unknown'
  });

  const handleDeviceConnected = (device: BluetoothDevice) => {
    setConnectedDevice(device);
    setIsConnected(true);
    setConnectionStatus('Connected');
    toast.success(`Successfully connected to ${device.name}`);
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
    if (!connected) {
      setConnectedDevice(null);
      setConnectionStatus('Disconnected');
    }
  };

  const handleStatusChange = (status: string) => {
    setConnectionStatus(status);
  };

  const handleMobileSetupGuide = () => {
    toast.info('Opening Mobile Setup Guide...', {
      description: 'This will show you how to properly configure your mobile device for OBD2 diagnostics'
    });
    console.log('Mobile Setup Guide clicked');
    // Add your mobile setup guide logic here
  };

  const handleTroubleshooting = () => {
    toast.info('Opening Troubleshooting Guide...', {
      description: 'This will help you resolve common connection issues'
    });
    console.log('Troubleshooting clicked');
    // Add your troubleshooting logic here
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <BackButton fallbackRoute="/" />
        <h1 className="text-3xl font-bold">OBD2 Connection Center</h1>
      </div>

      {/* Connection Status Overview */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bluetooth className="h-5 w-5 text-primary" />
              <span>Connection Status</span>
            </div>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {connectedDevice ? connectedDevice.name : 'None'}
              </div>
              <div className="text-sm text-muted-foreground">Device</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {connectionStatus}
              </div>
              <div className="text-sm text-muted-foreground">Connection</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Methods */}
      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="standard" className="text-xs sm:text-sm py-2 px-2">
            Standard
          </TabsTrigger>
          <TabsTrigger value="professional" className="text-xs sm:text-sm py-2 px-2">
            Professional
          </TabsTrigger>
          <TabsTrigger value="simplified" className="text-xs sm:text-sm py-2 px-2">
            Quick Connect
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bluetooth className="h-5 w-5" />
                <span>Standard OBD2 Connection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConnectionPanel
                isConnected={isConnected}
                onConnectionChange={handleConnectionChange}
                connectionStatus={connectionStatus}
                onStatusChange={handleStatusChange}
                vehicleInfo={vehicleInfo}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Professional Connection Mode</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfessionalConnectionPanel
                onDeviceConnected={handleDeviceConnected}
                isConnected={isConnected}
                currentDevice={connectedDevice}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simplified" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wifi className="h-5 w-5" />
                <span>Quick Connect Mode</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimplifiedBluetoothConnection
                onDeviceConnected={handleDeviceConnected}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Action Buttons */}
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2"
                onClick={handleMobileSetupGuide}
              >
                <Smartphone className="h-6 w-6" />
                <span className="text-center">Mobile Setup Guide</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2"
                onClick={handleTroubleshooting}
              >
                <HelpCircle className="h-6 w-6" />
                <span className="text-center">Troubleshooting</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConnectionScreen;
