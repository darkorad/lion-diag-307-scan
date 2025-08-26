import React, { useState, useEffect, useCallback } from 'react';
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
  Settings
} from 'lucide-react';
import { unifiedBluetoothService, BluetoothDevice } from '@/services/UnifiedBluetoothService';
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
  const [bluetoothChecking, setBluetoothChecking] = useState(true);
  const [mounted, setMounted] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  const checkBluetoothStatus = useCallback(async () => {
    if (!mounted) return;
    
    try {
      setBluetoothChecking(true);
      console.log('🔍 Checking Bluetooth status...');
      
      const enabled = await unifiedBluetoothService.isBluetoothEnabled();
      console.log('🔵 Bluetooth enabled status:', enabled);
      
      if (mounted) {
        setBluetoothEnabled(enabled);
        setLastError(null);
        
        if (!enabled && Capacitor.isNativePlatform()) {
          setLastError('Bluetooth is disabled. Please enable it in your device settings.');
        }
      }
    } catch (error) {
      console.error('Error checking Bluetooth status:', error);
      if (mounted) {
        setBluetoothEnabled(false);
        setLastError('Failed to check Bluetooth status. Make sure Bluetooth permissions are granted.');
      }
    } finally {
      if (mounted) {
        setBluetoothChecking(false);
      }
    }
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
    
    const initBluetooth = async () => {
      if (!mounted) return;
      
      try {
        console.log('🚀 Initializing Bluetooth system...');
        const initialized = await unifiedBluetoothService.initialize();
        console.log('✅ Bluetooth system initialized:', initialized);
        
        if (initialized) {
          await checkBluetoothStatus();
        } else {
          if (mounted) {
            setLastError('Failed to initialize Bluetooth system. Please check permissions.');
          }
        }
      } catch (error) {
        console.error("Error initializing Bluetooth:", error);
        if (mounted) {
          setLastError('Bluetooth initialization failed. Please check your device settings.');
        }
      }
    };

    initBluetooth();

    return () => {
      setMounted(false);
    };
  }, [checkBluetoothStatus, mounted]);

  const enableBluetooth = useCallback(async () => {
    if (!mounted) return;
    
    try {
      setBluetoothChecking(true);
      console.log('🔵 Attempting to enable Bluetooth...');
      
      const enabled = await unifiedBluetoothService.enableBluetooth();
      
      if (mounted) {
        if (enabled) {
          setBluetoothEnabled(true);
          setLastError(null);
          toast.success('Bluetooth enabled successfully');
          
          // Wait a moment then check for devices
          setTimeout(async () => {
            if (mounted) {
              await loadDevices();
            }
          }, 1000);
        } else {
          setLastError('Could not enable Bluetooth automatically. Please enable it manually in Settings > Bluetooth.');
          toast.error('Please enable Bluetooth manually in your device settings');
        }
      }
    } catch (error) {
      console.error('Error enabling Bluetooth:', error);
      if (mounted) {
        setLastError('Failed to enable Bluetooth. Please enable it manually in your device settings.');
        toast.error('Please enable Bluetooth in your device settings');
      }
    } finally {
      if (mounted) {
        setBluetoothChecking(false);
      }
    }
  }, [mounted]);

  const loadDevices = useCallback(async () => {
    if (!mounted || !bluetoothEnabled) return;
    
    try {
      console.log('📱 Loading paired devices...');
      const deviceList = await unifiedBluetoothService.scanForDevices(5000);
      
      if (mounted) {
        setDevices(deviceList);
        console.log(`📋 Loaded ${deviceList.length} devices`);
        
        if (deviceList.length === 0) {
          setLastError('No paired OBD2 devices found. Please pair your ELM327 adapter in Bluetooth settings first.');
        } else {
          setLastError(null);
        }
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
      if (mounted) {
        setLastError('Failed to scan for devices. ' + (error instanceof Error ? error.message : 'Please check Bluetooth permissions.'));
        setDevices([]);
      }
    }
  }, [mounted, bluetoothEnabled]);

  const scanForDevices = useCallback(async () => {
    if (!mounted) return;
    
    if (!bluetoothEnabled) {
      toast.error('Please enable Bluetooth first');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setLastError(null);

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
      }, 800);

      console.log('🔍 Starting comprehensive device scan...');
      const discoveredDevices = await unifiedBluetoothService.discoverAllOBD2Devices();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      if (mounted) {
        setDevices(discoveredDevices);
        
        if (discoveredDevices.length > 0) {
          toast.success(`Found ${discoveredDevices.length} OBD2 device(s)`);
          setLastError(null);
        } else {
          setLastError('No OBD2 devices found. Make sure your adapter is powered on and paired in Bluetooth settings.');
          toast.info('No devices found. Check if your ELM327 is paired and powered on.');
        }
      }
      
    } catch (error) {
      console.error('Scan failed:', error);
      if (mounted) {
        const errorMessage = error instanceof Error ? error.message : 'Device scan failed';
        setLastError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setTimeout(() => {
        if (mounted) {
          setIsScanning(false);
          setScanProgress(0);
        }
      }, 1500);
    }
  }, [bluetoothEnabled, mounted]);

  const connectToDevice = useCallback(async (device: BluetoothDevice) => {
    if (!mounted) return;
    
    setIsConnecting(device.id);

    try {
      console.log(`🔗 Attempting to connect to ${device.name}...`);
      const result = await unifiedBluetoothService.smartConnect(device);
      
      if (mounted) {
        if (result.success && result.device) {
          toast.success(`Connected to ${device.name}`);
          onDeviceConnected(result.device);
          setLastError(null);
        } else {
          const errorMsg = result.error || 'Connection failed';
          setLastError(`Failed to connect to ${device.name}: ${errorMsg}`);
          toast.error(`Connection failed: ${errorMsg}`);
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      if (mounted) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown connection error';
        setLastError(errorMsg);
        toast.error(`Connection failed: ${errorMsg}`);
      }
    } finally {
      if (mounted) {
        setIsConnecting(null);
      }
    }
  }, [onDeviceConnected, mounted]);

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
            <div className="flex items-center space-x-2">
              {bluetoothChecking && <Loader2 className="h-4 w-4 animate-spin" />}
              <Button 
                onClick={checkBluetoothStatus} 
                size="sm" 
                variant="outline"
                disabled={bluetoothChecking}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              {!bluetoothEnabled && !bluetoothChecking && (
                <Button onClick={enableBluetooth} size="sm">
                  Enable Bluetooth
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${bluetoothEnabled ? 'bg-green-500' : bluetoothChecking ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span>
                {bluetoothChecking ? 'Checking...' : bluetoothEnabled ? 'Bluetooth Ready' : 'Bluetooth Disabled'}
              </span>
              <span className="text-sm text-muted-foreground">
                ({Capacitor.getPlatform()}) - {unifiedBluetoothService.getCurrentService()}
              </span>
            </div>
            
            {lastError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {lastError}
                  {Capacitor.isNativePlatform() && (
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          // This would ideally open Bluetooth settings
                          toast.info('Please go to Settings &gt; Bluetooth to enable Bluetooth and pair your ELM327 adapter');
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Open Settings
                      </Button>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
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
            <Button onClick={scanForDevices} disabled={isScanning || !bluetoothEnabled || bluetoothChecking} size="sm">
              <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={scanForDevices}
            disabled={isScanning || !bluetoothEnabled || bluetoothChecking}
            className="w-full"
            size="lg"
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning for Devices...
              </>
            ) : bluetoothChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Bluetooth...
              </>
            ) : !bluetoothEnabled ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Enable Bluetooth First
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Scan for OBD2 Devices
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
                <Card key={device.id} className="border-2 hover:border-blue-300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getDeviceIcon(device)}
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <p className="text-sm text-muted-foreground">{device.address}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {device.isPaired && (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Paired
                              </Badge>
                            )}
                            <Badge variant={device.deviceType === 'ELM327' ? 'default' : 'secondary'}>
                              {device.deviceType}
                            </Badge>
                            {device.compatibility && device.compatibility > 0.5 && (
                              <Badge variant="outline" className="text-xs">
                                {Math.round(device.compatibility * 100)}% Compatible
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
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
          ) : bluetoothEnabled && !isScanning && !bluetoothChecking ? (
            <div className="text-center py-6 text-muted-foreground">
              <Bluetooth className="h-8 w-8 mx-auto mb-2" />
              <p>No devices found</p>
              <p className="text-sm">Make sure your OBD2 device is powered on and paired</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Mobile Setup Instructions:</strong>
          <ul className="mt-2 text-sm space-y-1">
            <li>1. Connect your ELM327 to the car&apos;s OBD2 port</li>
            <li>2. Turn on vehicle ignition (engine can be off)</li>
            <li>3. Go to Settings &gt; Bluetooth and pair your ELM327 manually first</li>
            <li>4. Return here and scan to connect</li>
            <li>5. Grant all Bluetooth and location permissions when asked</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BluetoothDeviceScanner;
