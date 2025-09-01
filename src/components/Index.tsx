
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bluetooth, 
  Car, 
  Zap, 
  Settings, 
  Shield,
  Activity,
  Wrench
} from 'lucide-react';
import BluetoothDeviceScanner from './BluetoothDeviceScanner';
import PeugeotAlarmPanel from './PeugeotAlarmPanel';
import { BluetoothDevice } from '@/services/bluetooth/types';
import { toast } from 'sonner';

const Index = () => {
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [activePanel, setActivePanel] = useState<'scanner' | 'alarm' | 'diagnostics'>('scanner');

  const handleDeviceConnected = (device: BluetoothDevice) => {
    setConnectedDevice(device);
    setActivePanel('diagnostics');
    toast.success(`Connected to ${device.name}`, {
      description: 'Ready for vehicle diagnostics'
    });
  };

  const sendOBDCommand = async (command: string): Promise<string> => {
    if (!connectedDevice) {
      throw new Error('No device connected');
    }

    // Simulate OBD command sending
    console.log(`Sending OBD command: ${command}`);
    
    // Mock response based on command
    const mockResponses: { [key: string]: string } = {
      '22 F1 90': '62 F1 90 01', // Alarm status enabled
      '10 03': '50 03', // Diagnostic session response
      '27 01': '67 01 AB CD', // Security seed
      '27 02 A5 C3': '67 02', // Security key accepted
      '2E F1 90 00': '6E F1 90', // Write alarm disable
      '31 01 F0 18': '71 01', // Write to EEPROM
    };

    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockResponses[command] || '7F 22 12'; // Default error response
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Lion Diag 307 Scanner
        </h1>
        <p className="text-gray-600">Professional OBD2 Diagnostic Tool</p>
        
        {/* Connection Status */}
        {connectedDevice && (
          <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-medium">Connected to {connectedDevice.name}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => setActivePanel('scanner')}
            variant={activePanel === 'scanner' ? 'default' : 'outline'}
            className="flex items-center space-x-2"
          >
            <Bluetooth className="h-4 w-4" />
            <span>Bluetooth Setup</span>
          </Button>
          
          <Button
            onClick={() => setActivePanel('alarm')}
            variant={activePanel === 'alarm' ? 'default' : 'outline'}
            className="flex items-center space-x-2"
            disabled={!connectedDevice}
          >
            <Shield className="h-4 w-4" />
            <span>Peugeot Alarm</span>
          </Button>
          
          <Button
            onClick={() => setActivePanel('diagnostics')}
            variant={activePanel === 'diagnostics' ? 'default' : 'outline'}
            className="flex items-center space-x-2"
            disabled={!connectedDevice}
          >
            <Activity className="h-4 w-4" />
            <span>Diagnostics</span>
          </Button>
        </div>
      </div>

      {/* Content Panels */}
      <div className="max-w-6xl mx-auto">
        {activePanel === 'scanner' && (
          <BluetoothDeviceScanner onDeviceConnected={handleDeviceConnected} />
        )}

        {activePanel === 'alarm' && (
          <PeugeotAlarmPanel 
            isConnected={!!connectedDevice}
            onSendCommand={sendOBDCommand}
          />
        )}

        {activePanel === 'diagnostics' && connectedDevice && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Car className="h-5 w-5" />
                  <span>Vehicle Diagnostics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                    <Wrench className="h-6 w-6" />
                    <span>Read Codes</span>
                  </Button>
                  
                  <Button className="h-20 flex flex-col items-center justify-center space-y-2" variant="outline">
                    <Activity className="h-6 w-6" />
                    <span>Live Data</span>
                  </Button>
                  
                  <Button className="h-20 flex flex-col items-center justify-center space-y-2" variant="outline">
                    <Settings className="h-6 w-6" />
                    <span>Actuator Tests</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Quick Features */}
      <div className="max-w-4xl mx-auto mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center p-4">
            <Bluetooth className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-semibold">Bluetooth Pairing</h3>
            <p className="text-sm text-muted-foreground">Find and connect to any OBD2 adapter</p>
          </Card>
          
          <Card className="text-center p-4">
            <Shield className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <h3 className="font-semibold">Alarm Control</h3>
            <p className="text-sm text-muted-foreground">Disable annoying factory alarm</p>
          </Card>
          
          <Card className="text-center p-4">
            <Activity className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-semibold">Live Diagnostics</h3>
            <p className="text-sm text-muted-foreground">Real-time vehicle data monitoring</p>
          </Card>
          
          <Card className="text-center p-4">
            <Wrench className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <h3 className="font-semibold">Professional Tools</h3>
            <p className="text-sm text-muted-foreground">Advanced diagnostics and coding</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
