
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
import { BluetoothDevice } from '@/services/MasterBluetoothService';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';

interface BluetoothDeviceScannerProps {
  onDeviceConnected: (device: BluetoothDevice) => void;
}

const BluetoothDeviceScanner: React.FC<BluetoothDeviceScannerProps> = ({ onDeviceConnected }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isPairing, setIsPairing] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);

  useEffect(() => {
    checkBluetoothStatus();
    loadPairedDevices();
  }, []);

  const checkBluetoothStatus = async () => {
    try {
      if (Capacitor.isNativePlatform() && window.bluetoothSerial) {
        window.bluetoothSerial.isEnabled(
          () => setBluetoothEnabled(true),
          () => setBluetoothEnabled(false)
        );
      } else {
        // Web fallback - assume enabled
        setBluetoothEnabled(true);
      }
    } catch (error) {
      console.error('Error checking Bluetooth status:', error);
    }
  };

  const enableBluetooth = async () => {
    try {
      if (Capacitor.isNativePlatform() && window.bluetoothSerial) {
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
      }
    } catch (error) {
      console.error('Error enabling Bluetooth:', error);
    }
  };

  const loadPairedDevices = async () => {
    try {
      if (Capacitor.isNativePlatform() && window.bluetoothSerial) {
        window.bluetoothSerial.list(
          (devices) => {
            const pairedDeviceList = devices.map((device: any) => ({
              id: device.id || device.address,
              address: device.address,
              name: device.name || 'Unknown Device',
              isPaired: true,
              isConnected: false,
              deviceType: isOBD2Device(device.name) ? 'ELM327' as const : 'Generic' as const,
              compatibility: isOBD2Device(device.name) ? 0.9 : 0.3
            }));
            setPairedDevices(pairedDeviceList);
          },
          (error) => {
            console.error('Failed to get paired devices:', error);
          }
        );
      } else {
        // Web fallback with mock data
        setPairedDevices([
          {
            id: 'mock-paired-1',
            address: '00:1D:A5:68:98:8B',
            name: 'ELM327 OBD2',
            isPaired: true,
            isConnected: false,
            deviceType: 'ELM327' as const,
            compatibility: 0.95
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading paired devices:', error);
    }
  };

  const scanForDevices = async () => {
    if (!bluetoothEnabled) {
      toast.error('Please enable Bluetooth first');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setDevices([]);

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      if (Capacitor.isNativePlatform() && window.bluetoothSerial) {
        window.bluetoothSerial.discoverUnpaired(
          (devices) => {
            clearInterval(progressInterval);
            setScanProgress(100);
            
            const deviceList = devices.map((device: any) => ({
              id: device.id || device.address,
              address: device.address,
              name: device.name || 'Unknown Device',
              isPaired: false,
              isConnected: false,
              deviceType: isOBD2Device(device.name) ? 'ELM327' as const : 'Generic' as const,
              compatibility: isOBD2Device(device.name) ? 0.9 : 0.3,
              rssi: device.rssi
            }));
            
            setDevices(deviceList);
            toast.success(`Found ${deviceList.length} available devices`);
          },
          (error) => {
            clearInterval(progressInterval);
            console.error('Scan failed:', error);
            toast.error('Device scan failed');
          }
        );
      } else {
        // Web fallback with mock data
        setTimeout(() => {
          clearInterval(progressInterval);
          setScanProgress(100);
          setDevices([
            {
              id: 'mock-unpaired-1',
              address: '00:1D:A5:68:98:8C',
              name: 'Vgate iCar Pro',
              isPaired: false,
              isConnected: false,
              deviceType: 'OBD2' as const,
              compatibility: 0.85,
              rssi: -60
            },
            {
              id: 'mock-unpaired-2',
              address: '98:D3:31:F5:A2:BC',
              name: 'ELM327-WiFi',
              isPaired: false,
              isConnected: false,
              deviceType: 'ELM327' as const,
              compatibility: 0.92,
              rssi: -45
            }
          ]);
          toast.success('Found 2 available devices');
        }, 3000);
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan for devices');
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(0);
      }, 4000);
    }
  };

  const pairDevice = async (device: BluetoothDevice) => {
    setIsPairing(device.id);

    try {
      if (Capacitor.isNativePlatform() && window.bluetoothSerial) {
        window.bluetoothSerial.pair(
          device.address,
          () => {
            toast.success(`Paired with ${device.name}`);
            // Move device to paired list
            setPairedDevices(prev => [...prev, { ...device, isPaired: true }]);
            setDevices(prev => prev.filter(d => d.id !== device.id));
          },
          (error) => {
            console.error('Pairing failed:', error);
            toast.error(`Failed to pair with ${device.name}`);
          }
        );
      } else {
        // Web fallback
        setTimeout(() => {
          toast.success(`Paired with ${device.name}`);
          setPairedDevices(prev => [...prev, { ...device, isPaired: true }]);
          setDevices(prev => prev.filter(d => d.id !== device.id));
        }, 2000);
      }
    } catch (error) {
      console.error('Pairing error:', error);
      toast.error('Pairing failed');
    } finally {
      setIsPairing(null);
    }
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    setIsConnecting(device.id);

    try {
      if (Capacitor.isNativePlatform() && window.bluetoothSerial) {
        window.bluetoothSerial.connect(
          device.address,
          () => {
            toast.success(`Connected to ${device.name}`);
            onDeviceConnected({ ...device, isConnected: true });
          },
          (error) => {
            console.error('Connection failed:', error);
            toast.error(`Failed to connect to ${device.name}`);
          }
        );
      } else {
        // Web fallback
        setTimeout(() => {
          toast.success(`Connected to ${device.name}`);
          onDeviceConnected({ ...device, isConnected: true });
        }, 2000);
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Connection failed');
    } finally {
      setIsConnecting(null);
    }
  };

  const isOBD2Device = (name: string) => {
    const lowerName = name.toLowerCase();
    return lowerName.includes('elm327') || 
           lowerName.includes('obd') || 
           lowerName.includes('vgate') ||
           lowerName.includes('icar') ||
           lowerName.includes('konnwei') ||
           lowerName.includes('autel');
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
            <span>{bluetoothEnabled ? 'Bluetooth Enabled' : 'Bluetooth Disabled'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Device Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Scan for New Devices</span>
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
                Start Device Scan
              </>
            )}
          </Button>

          {isScanning && (
            <div className="space-y-2">
              <Progress value={scanProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Discovering nearby Bluetooth devices... {scanProgress}%
              </p>
            </div>
          )}

          {/* Discovered Devices */}
          {devices.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Available Devices ({devices.length})</h4>
              {devices.map((device) => (
                <Card key={device.id} className="border-2 border-dashed">
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
                          onClick={() => pairDevice(device)}
                          disabled={isPairing !== null}
                          size="sm"
                          variant="outline"
                        >
                          {isPairing === device.id ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Pairing...
                            </>
                          ) : (
                            <>
                              <Plus className="mr-1 h-3 w-3" />
                              Pair
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paired Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Paired Devices</span>
            </div>
            <Button onClick={loadPairedDevices} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pairedDevices.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Bluetooth className="h-8 w-8 mx-auto mb-2" />
              <p>No paired devices found</p>
              <p className="text-sm">Scan for devices and pair them first</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pairedDevices.map((device) => (
                <Card key={device.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getDeviceIcon(device)}
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <p className="text-sm text-muted-foreground">{device.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">Paired</Badge>
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
            <li>3. Scan for available devices</li>
            <li>4. Pair with your OBD2 adapter</li>
            <li>5. Connect to start diagnostics</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BluetoothDeviceScanner;
