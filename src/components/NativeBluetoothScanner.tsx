import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bluetooth, 
  BluetoothConnected,
  Wifi, 
  Search, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Zap,
  Settings,
  Signal,
  Link,
  Shield
} from 'lucide-react';
import { nativeBluetoothService, BluetoothServiceDevice, ServiceConnectionResult } from '@/services/NativeBluetoothService';
import { toast } from 'sonner';

interface NativeBluetoothScannerProps {
  onDeviceConnected: (device: BluetoothServiceDevice) => void;
  onBack?: () => void;
}

const NativeBluetoothScanner: React.FC<NativeBluetoothScannerProps> = ({ 
  onDeviceConnected, 
  onBack 
}) => {
  const [devices, setDevices] = useState<BluetoothServiceDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isPairing, setIsPairing] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothServiceDevice | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    initializeBluetooth();
    
    // Setup event listeners
    const handleDeviceFound = (device: BluetoothServiceDevice) => {
      setDevices(prev => {
        const existing = prev.find(d => d.address === device.address);
        if (existing) return prev;
        return [...prev, device].sort((a, b) => b.compatibility - a.compatibility);
      });
    };

    nativeBluetoothService.addEventListener('deviceFound', handleDeviceFound);

    return () => {
      nativeBluetoothService.removeEventListener('deviceFound', handleDeviceFound);
    };
  }, []);

  const initializeBluetooth = async () => {
    try {
      setInitError(null);
      console.log('🔵 Initializing Bluetooth system...');
      
      const initialized = await nativeBluetoothService.initialize();
      
      if (initialized) {
        setIsInitialized(true);
        console.log('✅ Bluetooth system ready');
        toast.success('Bluetooth system ready');
        
        // Auto-start scanning
        setTimeout(() => startScan(), 1000);
      } else {
        throw new Error('Bluetooth initialization failed');
      }
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Initialization failed';
      console.error('❌ Bluetooth initialization failed:', error);
      setInitError(message);
      setIsInitialized(false);
      toast.error('Bluetooth initialization failed');
    }
  };

  const startScan = async () => {
    if (!isInitialized) {
      toast.error('Bluetooth not initialized');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setDevices([]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      console.log('🔍 Starting device scan...');
      const foundDevices = await nativeBluetoothService.scanForDevices(15000);
      
      clearInterval(progressInterval);
      setScanProgress(100);
      setDevices(foundDevices);

      if (foundDevices.length > 0) {
        toast.success(`Found ${foundDevices.length} device(s)`);
      } else {
        toast.info('No devices found', {
          description: 'Make sure your OBD2 adapter is powered on'
        });
      }

    } catch (error) {
      console.error('❌ Scan failed:', error);
      toast.error('Device scan failed');
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanProgress(0), 3000);
    }
  };

  const handlePairDevice = async (device: BluetoothServiceDevice) => {
    setIsPairing(device.id);

    try {
      console.log(`📱 Pairing with ${device.name}...`);
      const success = await nativeBluetoothService.pairDevice(device);
      
      if (success) {
        // Update device in list
        setDevices(prev => prev.map(d => 
          d.address === device.address 
            ? { ...d, isPaired: true }
            : d
        ));
        
        toast.success(`Paired with ${device.name}`);
      }

    } catch (error) {
      console.error('❌ Pairing failed:', error);
      toast.error('Pairing failed');
    } finally {
      setIsPairing(null);
    }
  };

  const handleConnectDevice = async (device: BluetoothServiceDevice) => {
    setIsConnecting(device.id);

    try {
      console.log(`🔗 Connecting to ${device.name}...`);
      const result: ServiceConnectionResult = await nativeBluetoothService.connectToDevice(device);
      
      if (result.success && result.device) {
        setConnectedDevice(result.device);
        onDeviceConnected(result.device);
        
        toast.success(`Connected to ${device.name}`, {
          description: 'Ready for OBD2 diagnostics'
        });
      } else {
        throw new Error(result.error || 'Connection failed');
      }

    } catch (error) {
      console.error('❌ Connection failed:', error);
      const message = error instanceof Error ? error.message : 'Connection failed';
      toast.error(`Connection failed: ${message}`);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async () => {
    try {
      await nativeBluetoothService.disconnect();
      setConnectedDevice(null);
      toast.success('Disconnected');
    } catch (error) {
      console.error('❌ Disconnect failed:', error);
      toast.error('Disconnect failed');
    }
  };

  const getDeviceIcon = (device: BluetoothServiceDevice) => {
    switch (device.deviceType) {
      case 'ELM327':
        return <Zap className="h-5 w-5 text-green-500" />;
      case 'OBD2':
        return <Settings className="h-5 w-5 text-blue-500" />;
      default:
        return <Bluetooth className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCompatibilityBadge = (compatibility: number) => {
    if (compatibility >= 95) {
      return <Badge className="bg-green-500 text-white">Excellent</Badge>;
    } else if (compatibility >= 80) {
      return <Badge className="bg-blue-500 text-white">Good</Badge>;
    } else if (compatibility >= 60) {
      return <Badge className="bg-yellow-500 text-white">Fair</Badge>;
    } else {
      return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getSignalStrength = (rssi?: number) => {
    if (!rssi) return 0;
    return Math.max(0, Math.min(100, ((rssi + 100) / 70) * 100));
  };

  if (initError) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            Bluetooth Initialization Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {initError}
            </AlertDescription>
          </Alert>
          
          <div className="flex space-x-2">
            <Button onClick={initializeBluetooth} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Initialization
            </Button>
            {onBack && (
              <Button onClick={onBack} variant="outline">
                Back
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BluetoothConnected className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold">Native Bluetooth Scanner</h2>
        </div>
        {onBack && (
          <Button onClick={onBack} variant="outline" size="sm">
            Back
          </Button>
        )}
      </div>

      {/* Connected Device */}
      {connectedDevice && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">{connectedDevice.name}</p>
                  <p className="text-sm text-green-700">{connectedDevice.address}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-500 text-white">
                  <Link className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
                <Button 
                  onClick={handleDisconnect} 
                  variant="outline" 
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scanner Controls */}
      {!connectedDevice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Device Scanner</span>
              <Badge variant={isInitialized ? "default" : "secondary"}>
                <Shield className="h-3 w-3 mr-1" />
                {isInitialized ? 'Ready' : 'Initializing'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={startScan}
              disabled={isScanning || !isInitialized}
              className="w-full"
              size="lg"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Scanning for OBD2 Devices...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find OBD2 Devices
                </>
              )}
            </Button>

            {isScanning && (
              <div className="space-y-2">
                <Progress value={scanProgress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  Discovering devices... {scanProgress}%
                </p>
              </div>
            )}

            {/* Device List */}
            {devices.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Found Devices ({devices.length})</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {devices.map((device) => (
                    <Card key={device.address} className="border hover:border-blue-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getDeviceIcon(device)}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium">{device.name}</p>
                                {getCompatibilityBadge(device.compatibility)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {device.address}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                {device.isPaired && (
                                  <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Paired
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {device.deviceType}
                                </Badge>
                                {device.rssi && (
                                  <div className="flex items-center space-x-1">
                                    <Signal className="h-3 w-3 text-gray-500" />
                                    <span className="text-xs text-muted-foreground">
                                      {Math.round(getSignalStrength(device.rssi))}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!device.isPaired && (
                              <Button
                                onClick={() => handlePairDevice(device)}
                                disabled={isPairing !== null || isConnecting !== null}
                                variant="outline"
                                size="sm"
                              >
                                {isPairing === device.id ? (
                                  <>
                                    <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                                    Pairing...
                                  </>
                                ) : (
                                  <>
                                    <Bluetooth className="mr-1 h-3 w-3" />
                                    Pair
                                  </>
                                )}
                              </Button>
                            )}
                            
                            <Button
                              onClick={() => handleConnectDevice(device)}
                              disabled={isConnecting !== null}
                              size="sm"
                              className={device.deviceType === 'ELM327' ? 'bg-green-500 hover:bg-green-600' : ''}
                            >
                              {isConnecting === device.id ? (
                                <>
                                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
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
              </div>
            )}

            {/* Instructions */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Native Bluetooth Scanner:</strong>
                <ul className="mt-2 text-sm space-y-1">
                  <li>• Direct Android Bluetooth API integration</li>
                  <li>• Real-time device discovery and pairing</li>
                  <li>• Automatic ELM327 initialization</li>
                  <li>• Full OBD2 command support</li>
                  <li>• Works with all major OBD2 adapters</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NativeBluetoothScanner;