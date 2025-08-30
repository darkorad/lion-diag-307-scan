import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bluetooth, Scan, Smartphone } from 'lucide-react';
import { enhancedAndroidBluetoothService } from '../services/EnhancedAndroidBluetoothService';
import { BluetoothDevice } from '../services/bluetooth/types';

const Connections = () => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  useEffect(() => {
    const initializeService = async () => {
      const success = await enhancedAndroidBluetoothService.initialize();
      if (!success) {
        toast.error('Failed to initialize Bluetooth service');
        return;
      }

      // Check permissions
      const permissions = await enhancedAndroidBluetoothService.requestPermissions();
      if (!permissions.granted) {
        toast.error('Bluetooth permissions required');
        return;
      }

      // Check if Bluetooth is enabled
      const status = await enhancedAndroidBluetoothService.checkBluetoothStatus();
      if (!status.enabled) {
        toast.warning('Please enable Bluetooth');
        await enhancedAndroidBluetoothService.enableBluetooth();
      }
    };

    initializeService();
  }, []);

  useEffect(() => {
    // Set up event listeners
    const deviceFoundHandler = (device: BluetoothDevice) => {
      setDevices(prev => {
        const exists = prev.find(d => d.address === device.address);
        if (exists) return prev;
        return [...prev, device];
      });
    };

    const connectedHandler = (device: BluetoothDevice) => {
      setConnectedDevice(device);
      setIsConnecting(null);
      toast.success(`Connected to ${device.name}`);
    };

    const disconnectedHandler = () => {
      setConnectedDevice(null);
      toast.success('Device disconnected');
    };

    const pairingStateHandler = (state: { state: string; device: string; address: string; success?: boolean; message?: string }) => {
      if (state.success) {
        toast.success(state.message || 'Paired successfully');
      } else if (state.state === 'bonded') {
        toast.success(`Paired with ${state.device}`);
      }
    };

    const scanStartedHandler = () => {
      setIsScanning(true);
      setDevices([]);
    };

    const scanStoppedHandler = () => {
      setIsScanning(false);
    };

    // Add event listeners
    enhancedAndroidBluetoothService.emitter.on('deviceFound', deviceFoundHandler);
    enhancedAndroidBluetoothService.emitter.on('connected', connectedHandler);
    enhancedAndroidBluetoothService.emitter.on('disconnected', disconnectedHandler);
    enhancedAndroidBluetoothService.emitter.on('pairingStateChanged', pairingStateHandler);
    enhancedAndroidBluetoothService.emitter.on('scanStarted', scanStartedHandler);
    enhancedAndroidBluetoothService.emitter.on('scanStopped', scanStoppedHandler);

    return () => {
      // Clean up event listeners
      enhancedAndroidBluetoothService.emitter.off('deviceFound', deviceFoundHandler);
      enhancedAndroidBluetoothService.emitter.off('connected', connectedHandler);
      enhancedAndroidBluetoothService.emitter.off('disconnected', disconnectedHandler);
      enhancedAndroidBluetoothService.emitter.off('pairingStateChanged', pairingStateHandler);
      enhancedAndroidBluetoothService.emitter.off('scanStarted', scanStartedHandler);
      enhancedAndroidBluetoothService.emitter.off('scanStopped', scanStoppedHandler);
    };
  }, []);

  const handleScan = async () => {
    try {
      setIsScanning(true);
      await enhancedAndroidBluetoothService.scanForDevices();
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error('Failed to scan for devices');
      setIsScanning(false);
    }
  };

  const handleConnect = async (device: BluetoothDevice) => {
    try {
      setIsConnecting(device.address);
      const result = await enhancedAndroidBluetoothService.connectToDevice(device);
      
      if (!result.success) {
        throw new Error(result.error || 'Connection failed');
      }
    } catch (error: any) {
      console.error('Connection failed:', error);
      toast.error(`Failed to connect: ${error.message}`);
      setIsConnecting(null);
    }
  };

  const handlePair = async (device: BluetoothDevice) => {
    try {
      await enhancedAndroidBluetoothService.pairDevice(device.address);
    } catch (error: any) {
      console.error('Pairing failed:', error);
      toast.error(`Failed to pair: ${error.message}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await enhancedAndroidBluetoothService.disconnect();
    } catch (error: any) {
      console.error('Disconnect failed:', error);
      toast.error(`Failed to disconnect: ${error.message}`);
    }
  };

  const getDeviceIcon = (device: BluetoothDevice) => {
    if (device.deviceType === 'ELM327' || device.deviceType === 'OBD2') {
      return <Bluetooth className="h-5 w-5 text-blue-500" />;
    }
    return <Smartphone className="h-5 w-5 text-gray-500" />;
  };

  const getCompatibilityBadge = (compatibility: number) => {
    if (compatibility >= 80) {
      return <Badge className="bg-green-500">High</Badge>;
    } else if (compatibility >= 60) {
      return <Badge className="bg-yellow-500">Medium</Badge>;
    } else if (compatibility >= 40) {
      return <Badge className="bg-orange-500">Low</Badge>;
    } else {
      return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bluetooth Connections</h1>
        {connectedDevice && (
          <Badge className="bg-green-500">
            <Bluetooth className="h-4 w-4 mr-1" />
            Connected
          </Badge>
        )}
      </div>

      {connectedDevice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bluetooth className="h-5 w-5 text-green-500" />
              Connected Device
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getDeviceIcon(connectedDevice)}
                <div>
                  <div className="font-semibold">{connectedDevice.name}</div>
                  <div className="text-sm text-muted-foreground">{connectedDevice.address}</div>
                </div>
              </div>
              <Button onClick={handleDisconnect} variant="outline">
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Available Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleScan} 
              disabled={isScanning || !!connectedDevice}
              className="w-full"
            >
              {isScanning ? 'Scanning...' : 'Scan for Devices'}
            </Button>

            {devices.length > 0 && (
              <div className="space-y-2">
                {devices.map((device) => (
                  <Card key={device.address} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(device)}
                        <div className="flex-1">
                          <div className="font-medium">{device.name}</div>
                          <div className="text-sm text-muted-foreground">{device.address}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {device.isPaired && <Badge variant="outline">Paired</Badge>}
                            {device.compatibility !== undefined && getCompatibilityBadge(device.compatibility)}
                            {device.rssi && (
                              <Badge variant="outline" className="text-xs">
                                {device.rssi}dBm
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!device.isPaired && (
                          <Button 
                            onClick={() => handlePair(device)}
                            variant="outline" 
                            size="sm"
                          >
                            Pair
                          </Button>
                        )}
                        <Button
                          onClick={() => handleConnect(device)}
                          disabled={isConnecting === device.address || !!connectedDevice}
                          size="sm"
                        >
                          {isConnecting === device.address ? 'Connecting...' : 'Connect'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {devices.length === 0 && !isScanning && (
              <div className="text-center py-8 text-muted-foreground">
                <Bluetooth className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No devices found. Click "Scan for Devices" to start scanning.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Connections;
