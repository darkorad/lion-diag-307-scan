
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { realBluetoothService } from '@/services/RealBluetoothService';
import { BluetoothDevice } from '@/services/bluetooth/types';
import { toast } from 'sonner';
import { Bluetooth, Search, CheckCircle, AlertCircle, Zap, Bug, Wifi, Signal, Settings } from 'lucide-react';
import BluetoothDebugInfo from '@/components/debug/BluetoothDebugInfo';

const Connections = () => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [connectingToDevice, setConnectingToDevice] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);

  const checkBluetoothStatus = async () => {
    try {
      const enabled = await realBluetoothService.isBluetoothEnabled();
      setBluetoothEnabled(enabled);
      return enabled;
    } catch (error) {
      console.error('Failed to check Bluetooth status:', error);
      return false;
    }
  };

  const enableBluetooth = async () => {
    try {
      toast.info('Enabling Bluetooth...', {
        description: 'Please allow Bluetooth access when prompted'
      });

      const enabled = await realBluetoothService.enableBluetooth();
      
      if (enabled) {
        setBluetoothEnabled(true);
        toast.success('Bluetooth enabled successfully');
        return true;
      } else {
        toast.error('Failed to enable Bluetooth', {
          description: 'Please enable Bluetooth manually in system settings'
        });
        return false;
      }
    } catch (error) {
      console.error('Error enabling Bluetooth:', error);
      toast.error('Error enabling Bluetooth');
      return false;
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setDevices([]);

    try {
      // Initialize service first
      console.log('🔧 Initializing Bluetooth service...');
      const initialized = await realBluetoothService.initialize();
      
      if (!initialized) {
        throw new Error('Failed to initialize Bluetooth service');
      }

      // Check if Bluetooth is enabled
      const isEnabled = await checkBluetoothStatus();
      
      if (!isEnabled) {
        console.log('📱 Bluetooth not enabled, attempting to enable...');
        const enabled = await enableBluetooth();
        
        if (!enabled) {
          throw new Error('Bluetooth is required for device scanning');
        }
      }

      // Start progress animation
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 15;
        });
      }, 1000);

      toast.info('Scanning for Bluetooth devices...', {
        description: 'Looking for paired and nearby OBD2 adapters'
      });

      console.log('🔍 Starting comprehensive device scan...');
      
      // Perform real device scan
      const foundDevices = await realBluetoothService.scanForDevices();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      console.log(`✅ Scan completed. Found ${foundDevices.length} devices:`, foundDevices);
      setDevices(foundDevices);
      
      if (foundDevices.length > 0) {
        toast.success(`Scan completed successfully!`, {
          description: `Found ${foundDevices.length} Bluetooth device(s)`
        });

        // Highlight OBD2 devices
        const obd2Devices = foundDevices.filter(d => 
          d.deviceType === 'ELM327' || d.deviceType === 'OBD2'
        );
        
        if (obd2Devices.length > 0) {
          toast.info(`Found ${obd2Devices.length} OBD2 compatible device(s)`, {
            description: 'Look for devices marked as ELM327 or OBD2'
          });
        }
      } else {
        toast.info('No devices found', {
          description: 'Make sure your OBD2 adapter is powered on and in pairing mode'
        });
      }

    } catch (error) {
      console.error('❌ Bluetooth scan failed:', error);
      toast.error('Scan failed', {
        description: error instanceof Error ? error.message : 'Could not scan for Bluetooth devices'
      });
      setDevices([]);
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanProgress(0), 3000);
    }
  };

  const handleConnect = async (device: BluetoothDevice) => {
    setConnectingToDevice(device.id);
    
    toast.info(`Connecting to ${device.name}...`, {
      description: 'Establishing Bluetooth connection'
    });

    try {
      console.log(`🔗 Attempting to connect to ${device.name} (${device.address})`);
      
      const result = await realBluetoothService.connectToDevice(device);
      
      if (result.success && result.device) {
        const connectedDev = result.device;
        setConnectedDevice(connectedDev);
        
        // Update device in list
        setDevices(prev => prev.map(d => 
          d.id === device.id 
            ? { ...d, isConnected: true }
            : { ...d, isConnected: false }
        ));
        
        toast.success(`Connected to ${device.name}`, {
          description: `Ready for OBD2 diagnostics using ${result.strategy || 'standard'} method`
        });
        
        console.log(`✅ Successfully connected to ${device.name}`);

        // Test basic communication
        try {
          console.log('🧪 Testing basic OBD2 communication...');
          const response = await realBluetoothService.sendCommand('ATZ');
          console.log('🧪 ATZ Response:', response);
          
          toast.success('OBD2 communication test passed', {
            description: 'Device is responding to commands'
          });
        } catch (testError) {
          console.warn('⚠️ Communication test failed:', testError);
          toast.warning('Connected but communication test failed', {
            description: 'Device may need initialization or different settings'
          });
        }
        
      } else {
        throw new Error(result.error || 'Connection failed');
      }
    } catch (error) {
      console.error('❌ Connection failed:', error);
      toast.error(`Failed to connect to ${device.name}`, {
        description: error instanceof Error ? error.message : 'Unknown connection error'
      });
    } finally {
      setConnectingToDevice(null);
    }
  };

  const handleDisconnect = async () => {
    if (!connectedDevice) return;
    
    toast.info(`Disconnecting from ${connectedDevice.name}...`);
    
    try {
      await realBluetoothService.disconnect();
      
      setDevices(prev => prev.map(d => ({ ...d, isConnected: false })));
      setConnectedDevice(null);
      
      toast.success('Device disconnected', {
        description: 'Bluetooth connection terminated'
      });
    } catch (error) {
      toast.error('Disconnect failed', {
        description: 'Could not disconnect from device'
      });
    }
  };

  const getDeviceIcon = (device: BluetoothDevice) => {
    if (device.deviceType === 'ELM327') {
      return <Zap className="h-6 w-6 text-green-500" />;
    }
    if (device.deviceType === 'OBD2') {
      return <Settings className="h-6 w-6 text-blue-500" />;
    }
    return <Bluetooth className="h-6 w-6 text-gray-500" />;
  };

  const getCompatibilityColor = (compatibility: number) => {
    if (compatibility >= 0.9) return 'text-green-600 bg-green-50 border-green-200';
    if (compatibility >= 0.8) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (compatibility >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSignalStrength = (rssi?: number) => {
    if (!rssi) return { text: 'Unknown', icon: '📶' };
    if (rssi > -40) return { text: 'Excellent', icon: '📶' };
    if (rssi > -60) return { text: 'Good', icon: '📶' };
    if (rssi > -80) return { text: 'Fair', icon: '📱' };
    return { text: 'Weak', icon: '📵' };
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Bluetooth Device Scanner</h1>
        <Button
          onClick={() => setShowDebug(!showDebug)}
          variant="outline"
          size="sm"
        >
          <Bug className="h-4 w-4 mr-2" />
          Debug
        </Button>
      </div>

      {/* Debug Info Panel */}
      {showDebug && (
        <div className="mb-6">
          <BluetoothDebugInfo />
        </div>
      )}

      {/* Bluetooth Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bluetooth className="h-5 w-5" />
              <span>Bluetooth System Status</span>
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
            <Badge variant="outline" className="ml-auto">
              Real Hardware Scanning
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Current Connection Status */}
      {connectedDevice && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">{connectedDevice.name}</p>
                  <p className="text-sm text-green-700">{connectedDevice.address}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-green-500 text-white">Connected & Ready</Badge>
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

      {/* Scan Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Device Discovery</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleScan}
              disabled={isScanning}
              className="w-full h-12"
            >
              {isScanning ? (
                <>
                  <Search className="mr-2 h-4 w-4 animate-spin" />
                  Scanning for Real Devices...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Scan for Bluetooth Devices
                </>
              )}
            </Button>

            {isScanning && (
              <div className="space-y-2">
                <Progress value={scanProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  🔍 Discovering paired and nearby devices... {scanProgress}%
                </p>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p className="mb-2"><strong>This scanner will find:</strong></p>
              <ul className="space-y-1">
                <li>• ✅ Paired Bluetooth devices (most reliable)</li>
                <li>• 🔍 Nearby discoverable devices</li>
                <li>• 🚗 ELM327 and OBD2 adapters specifically</li>
                <li>• 📱 All Bluetooth Classic devices in range</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Results */}
      {devices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Found Devices ({devices.length} total)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {devices.map((device) => {
              const signal = getSignalStrength(device.rssi);
              const compatibilityClass = getCompatibilityColor(device.compatibility || 0);

              return (
                <Card key={device.id} className="border-2 hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getDeviceIcon(device)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{device.name}</h3>
                            {device.isConnected && (
                              <Badge className="bg-green-500 text-white text-xs">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Connected
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2 font-mono">
                            📍 {device.address}
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            {device.isPaired && (
                              <Badge variant="outline" className="text-xs bg-blue-50">
                                📱 Paired
                              </Badge>
                            )}
                            
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${compatibilityClass}`}
                            >
                              🎯 {Math.round((device.compatibility || 0) * 100)}% Compatible
                            </Badge>
                            
                            {device.rssi && (
                              <Badge variant="outline" className="text-xs">
                                {signal.icon} {signal.text} ({device.rssi}dBm)
                              </Badge>
                            )}
                            
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                device.deviceType === 'ELM327' ? 'bg-green-100 text-green-800' :
                                device.deviceType === 'OBD2' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              🔧 {device.deviceType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {device.isConnected ? (
                          <Button
                            onClick={handleDisconnect}
                            variant="outline"
                            className="border-green-300 text-green-700 hover:bg-green-100"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Connected
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleConnect(device)}
                            disabled={connectingToDevice === device.id || !!connectedDevice}
                            className={device.deviceType === 'ELM327' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                          >
                            {connectingToDevice === device.id ? (
                              <>
                                <Wifi className="mr-2 h-4 w-4 animate-pulse" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <Wifi className="mr-2 h-4 w-4" />
                                Connect
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      {!isScanning && devices.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Ready to scan for real devices</h3>
            <p className="text-muted-foreground mb-4">
              Click "Scan for Bluetooth Devices" to discover your OBD2 adapter
            </p>
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="flex items-center justify-center gap-2">
                🚗 <strong>Connect your OBD2 adapter to your vehicle's diagnostic port</strong>
              </p>
              <p className="flex items-center justify-center gap-2">
                🔌 <strong>Make sure the adapter is powered on (ignition on)</strong>
              </p>
              <p className="flex items-center justify-center gap-2">
                📱 <strong>For best results, pair the device in Bluetooth settings first</strong>
              </p>
              <p className="flex items-center justify-center gap-2">
                🔍 <strong>This scanner finds both paired and discoverable devices</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Connections;
