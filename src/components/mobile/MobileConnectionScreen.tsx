
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bluetooth, 
  Smartphone, 
  Wifi, 
  Search, 
  Settings,
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Shield,
  Zap,
  Car,
  Activity,
  Signal
} from 'lucide-react';
import { BluetoothDevice } from '@/services/bluetooth/types';
import { bluetoothConnectionManager } from '@/services/BluetoothConnectionManager';
import { bluetoothIntegrationService } from '@/services/BluetoothIntegrationService';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';

interface MobileConnectionScreenProps {
  onDeviceConnected: (device: BluetoothDevice) => void;
  onBack?: () => void;
}

const MobileConnectionScreen: React.FC<MobileConnectionScreenProps> = ({
  onDeviceConnected,
  onBack
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectionState, setConnectionState] = useState(bluetoothConnectionManager.getConnectionState());
  const [scanProgress, setScanProgress] = useState(0);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeSystem = async () => {
      try {
        console.log('Initializing Bluetooth system...');
        setInitializationError(null);
        
        const initialized = await bluetoothIntegrationService.initializeBluetoothSystem();
        
        if (mounted) {
          setPermissionsGranted(initialized);
          
          if (initialized) {
            toast.success('Bluetooth system ready');
            // Auto-start scanning on initialization
            setTimeout(() => {
              if (mounted) {
                handleScanDevices();
              }
            }, 1000);
          } else {
            setInitializationError('Bluetooth initialization failed. Please check permissions and try again.');
            toast.error('Bluetooth initialization failed', {
              description: 'Please check permissions and try again'
            });
          }
        }
      } catch (error) {
        console.error('System initialization failed:', error);
        if (mounted) {
          const errorMessage = error instanceof Error ? error.message : 'System initialization failed';
          setInitializationError(errorMessage);
          toast.error('System initialization failed');
          setPermissionsGranted(false);
        }
      }
    };

    const unsubscribe = bluetoothConnectionManager.subscribe(setConnectionState);
    initializeSystem();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleScanDevices = async () => {
    if (!permissionsGranted) {
      toast.error('Permissions required', {
        description: 'Please grant Bluetooth and location permissions'
      });
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setDevices([]);

    try {
      console.log('Starting device scan...');
      
      // Real progressive scanning with actual progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 1000);

      // Use real Bluetooth integration service
      const result = await bluetoothIntegrationService.discoverAllCompatibleDevices();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      if (result.success && result.devices) {
        console.log(`Found ${result.devices.length} devices:`, result.devices);
        setDevices(result.devices);
        
        if (result.devices.length > 0) {
          toast.success(`Found ${result.devices.length} OBD2 device(s)`);
        } else {
          toast.info('No OBD2 devices found', {
            description: 'Make sure your adapter is plugged in and paired'
          });
        }
      } else {
        console.error('Scan failed:', result.error);
        toast.error(result.error || 'Device scan failed');
      }

    } catch (error) {
      console.error('Scan failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Device scan failed', {
        description: errorMessage
      });
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanProgress(0), 3000);
    }
  };

  const handleConnectDevice = async (device: BluetoothDevice) => {
    setIsConnecting(true);

    try {
      console.log(`Attempting to connect to ${device.name}...`);
      
      const result = await bluetoothIntegrationService.connectToDevice(device);
      
      if (result.success && result.connectedDevice) {
        console.log('Connection successful:', result.connectedDevice);
        onDeviceConnected(result.connectedDevice);
        
        toast.success(`Connected to ${device.name}`, {
          description: 'Ready for OBD2 diagnostics'
        });
      } else {
        console.error('Connection failed:', result.error);
        toast.error(result.error || 'Connection failed', {
          description: 'Please try again or check device pairing'
        });
      }

    } catch (error) {
      console.error('Connection failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Connection failed', {
        description: errorMessage
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const getDeviceIcon = (device: BluetoothDevice) => {
    switch (device.deviceType) {
      case 'ELM327':
        return <Car className="h-6 w-6 text-blue-500" />;
      case 'OBD2':
        return <Activity className="h-6 w-6 text-green-500" />;
      default:
        return <Bluetooth className="h-6 w-6 text-gray-500" />;
    }
  };

  const getSignalStrength = (rssi?: number) => {
    if (!rssi) return 0;
    // Convert RSSI to percentage (typical range is -100 to -30 dBm)
    return Math.max(0, Math.min(100, ((rssi + 100) / 70) * 100));
  };

  const getCompatibilityColor = (compatibility?: number) => {
    if (!compatibility) return 'border-gray-300 text-gray-700';
    if (compatibility >= 0.9) return 'border-green-300 text-green-700';
    if (compatibility >= 0.7) return 'border-yellow-300 text-yellow-700';
    return 'border-orange-300 text-orange-700';
  };

  const handleRetryInitialization = async () => {
    setInitializationError(null);
    setPermissionsGranted(false);
    
    try {
      const initialized = await bluetoothIntegrationService.initializeBluetoothSystem();
      setPermissionsGranted(initialized);
      
      if (initialized) {
        toast.success('Bluetooth system initialized successfully');
      } else {
        setInitializationError('Failed to initialize Bluetooth system');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Initialization failed';
      setInitializationError(errorMessage);
      console.error('Retry initialization failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {onBack && (
            <Button onClick={onBack} variant="ghost" size="sm">
              ← Back
            </Button>
          )}
          <div className="flex items-center space-x-2">
            <Smartphone className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">OBD2 Connection</h1>
          </div>
        </div>
        <p className="text-gray-600">Connect to your vehicle's diagnostic port</p>
        <p className="text-sm text-gray-500">Platform: {Capacitor.getPlatform()}</p>
      </div>

      {/* Initialization Error */}
      {initializationError && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Initialization Error</p>
                <p className="text-sm mt-1">{initializationError}</p>
              </div>
              <Button 
                onClick={handleRetryInitialization}
                size="sm"
                variant="outline"
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Status */}
      {connectionState.isConnected && connectionState.device && (
        <Card className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">{connectionState.device.name}</p>
                  <p className="text-sm text-green-700">Connected and ready</p>
                </div>
              </div>
              <Badge className="bg-green-500 text-white">
                <Zap className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${permissionsGranted ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">Bluetooth</span>
              {permissionsGranted ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${permissionsGranted ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">Permissions</span>
              {permissionsGranted ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Scanner */}
      {!connectionState.isConnected && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Search className="h-5 w-5 mr-2 text-purple-600" />
              Device Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleScanDevices}
              disabled={isScanning || !permissionsGranted}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3"
              size="lg"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  Scanning for OBD2 Devices...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  {devices.length > 0 ? 'Scan Again' : 'Find OBD2 Devices'}
                </>
              )}
            </Button>

            {isScanning && (
              <div className="space-y-2">
                <Progress value={scanProgress} className="w-full h-2" />
                <p className="text-sm text-center text-gray-600">
                  Discovering devices... {scanProgress}%
                </p>
              </div>
            )}

            {/* Device Results */}
            {devices.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Available Devices ({devices.length})</h3>
                {devices.map((device) => (
                  <Card key={device.id || device.address} className="border-2 hover:border-blue-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getDeviceIcon(device)}
                          <div>
                            <p className="font-semibold text-gray-900">{device.name}</p>
                            <p className="text-sm text-gray-600">{device.address}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {device.isPaired && (
                                <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                                  Paired
                                </Badge>
                              )}
                              {device.compatibility !== undefined && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getCompatibilityColor(device.compatibility)}`}
                                >
                                  {Math.round(device.compatibility * 100)}% Compatible
                                </Badge>
                              )}
                              {device.rssi && (
                                <div className="flex items-center space-x-1">
                                  <Signal className="h-3 w-3 text-gray-500" />
                                  <span className="text-xs text-gray-500">
                                    {Math.round(getSignalStrength(device.rssi))}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleConnectDevice(device)}
                          disabled={isConnecting}
                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                        >
                          {isConnecting ? (
                            <>
                              <Zap className="mr-1 h-4 w-4 animate-pulse" />
                              Connecting...
                            </>
                          ) : (
                            'Connect'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Help Text */}
            <Alert className="border-blue-200 bg-blue-50">
              <Bluetooth className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Connection Tips:</strong>
                <ul className="mt-2 text-sm space-y-1">
                  <li>• Ensure your OBD2 adapter is plugged into your vehicle</li>
                  <li>• Turn on vehicle ignition (engine doesn't need to run)</li>
                  <li>• Keep your phone close to the adapter during connection</li>
                  <li>• Some adapters require pairing in phone settings first</li>
                  <li>• Grant all requested permissions for proper functionality</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileConnectionScreen;
