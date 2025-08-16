
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bluetooth, 
  Search, 
  Wifi, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Plus
} from 'lucide-react';
import { BluetoothDevice, mobileSafeBluetoothService } from '@/services/MobileSafeBluetoothService';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';

interface BluetoothDeviceScannerProps {
  onDeviceConnected: (device: BluetoothDevice) => void;
}

const BluetoothDeviceScanner: React.FC<BluetoothDeviceScannerProps> = ({ onDeviceConnected }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);

  useEffect(() => {
    checkBluetoothStatus();
    loadPairedDevices();
  }, []);

  const checkBluetoothStatus = async () => {
    try {
      const isEnabled = await mobileSafeBluetoothService.isBluetoothEnabled();
      setBluetoothEnabled(isEnabled);
    } catch (error) {
      console.error('Error checking Bluetooth status:', error);
      setBluetoothEnabled(false);
    }
  };

  const enableBluetooth = async () => {
    try {
      if (Capacitor.isNativePlatform() && window.bluetoothSerial?.enable) {
        window.bluetoothSerial.enable(
          () => {
            setBluetoothEnabled(true);
            toast.success('Bluetooth enabled');
          },
          (error) => {
            console.error('Failed to enable Bluetooth:', error);
            toast.error('Failed to enable Bluetooth');
          }
        );
      } else {
        toast.info('Bluetooth management not available on web platform');
        setBluetoothEnabled(true); // Assume enabled for web
      }
    } catch (error) {
      console.error('Error enabling Bluetooth:', error);
      toast.error('Error enabling Bluetooth');
    }
  };

  const loadPairedDevices = async () => {
    try {
      const pairedDeviceList = await mobileSafeBluetoothService.scanForDevices();
      setDevices(pairedDeviceList);
    } catch (error) {
      console.error('Failed to load paired devices:', error);
      setDevices([]);
    }
  };

  const scanForDevices = async () => {
    if (!bluetoothEnabled) {
      toast.error('Please enable Bluetooth first');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Scan for devices
      const discoveredDevices = await mobileSafeBluetoothService.scanForDevices();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setDevices(discoveredDevices);
      toast.success(`Found ${discoveredDevices.length} devices`);
      
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error('Device scan failed');
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(0);
      }, 1000);
    }
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    setIsConnecting(device.id);

    try {
      const result = await mobileSafeBluetoothService.connectToDevice(device);
      
      if (result.success && result.device) {
        toast.success(`Connected to ${device.name}`);
        onDeviceConnected(result.device);
      } else {
        toast.error(`Failed to connect to ${device.name}: ${result.error}`);
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(null);
    }
  };

  const getDeviceIcon = (device: BluetoothDevice) => {
    switch (device.deviceType) {
      case 'ELM327':
        return <Bluetooth className="h-5 w-5 text-blue-500" />;
      case 'OBD2':
        return <Bluetooth className="h-5 w-5 text-green-500" />;
      default:
        return <Bluetooth className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Bluetooth Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bluetooth className="h-5 w-5" />
              <span>Bluetooth Status</span>
            </div>
            {!bluetoothEnabled && (
              <Button onClick={enableBluetooth} size="sm">
                Enable Bluetooth
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${bluetoothEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{bluetoothEnabled ? 'Bluetooth Ready' : 'Bluetooth Disabled'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Device Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Available Devices</span>
            </div>
            <Button onClick={scanForDevices} disabled={isScanning || !bluetoothEnabled} size="sm">
              <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={scanForDevices}
            disabled={isScanning || !bluetoothEnabled}
            className="w-full"
            size="lg"
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning for Devices...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Scan for Devices
              </>
            )}
          </Button>

          {isScanning && (
            <div className="space-y-2">
              <Progress value={scanProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Discovering Bluetooth devices... {scanProgress}%
              </p>
            </div>
          )}

          {/* Device List */}
          {devices.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-semibold">Found Devices ({devices.length})</h4>
              {devices.map((device) => (
                <Card key={device.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getDeviceIcon(device)}
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <p className="text-sm text-muted-foreground">{device.address}</p>
                          {device.rssi && (
                            <p className="text-xs text-muted-foreground">Signal: {device.rssi}dBm</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={device.deviceType === 'ELM327' ? 'default' : 'secondary'}>
                          {device.deviceType}
                        </Badge>
                        <Button
                          onClick={() => connectToDevice(device)}
                          disabled={isConnecting !== null}
                          size="sm"
                        >
                          {isConnecting === device.id ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Wifi className="mr-1 h-3 w-3" />
                              Connect
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Bluetooth className="h-8 w-8 mx-auto mb-2" />
              <p>No devices found</p>
              <p className="text-sm">Make sure your OBD2 device is powered on and try scanning</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Instructions:</strong>
          <ul className="mt-2 text-sm space-y-1">
            <li>1. Make sure your OBD2 adapter is powered on</li>
            <li>2. Enable Bluetooth on your device</li>
            <li>3. Pair your OBD2 adapter in device settings first</li>
            <li>4. Scan and connect to start diagnostics</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BluetoothDeviceScanner;
