"import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Bluetooth, 
  BluetoothConnected, 
  Search, 
  Settings, 
  RefreshCw,
  Signal,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Shield,
  Wifi
} from 'lucide-react';
import { enhancedNativeBluetoothService } from '@/services/EnhancedNativeBluetoothService';
import { BluetoothDevice, BluetoothStatus } from '@/plugins/LionDiagBluetooth';

interface EnhancedNativeBluetoothManagerProps {
  onDeviceConnected?: (device: BluetoothDevice) => void;
  onConnectionLost?: () => void;
}

const EnhancedNativeBluetoothManager: React.FC<EnhancedNativeBluetoothManagerProps> = ({ 
  onDeviceConnected, 
  onConnectionLost 
}) => {
  // State management
  const [bluetoothStatus, setBluetoothStatus] = useState<BluetoothStatus>({
    supported: false,
    enabled: false,
    hasPermissions: false
  });
  
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [autoConnect, setAutoConnect] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [connectionStats, setConnectionStats] = useState<any>(null);
  
  // Initialization and setup
  useEffect(() => {
    initializeService();
    setupEventListeners();
    
    return () => {
      cleanupEventListeners();
    };
  }, []);
  
  const initializeService = async () => {
    try {
      const status = await enhancedNativeBluetoothService.checkBluetoothStatus();
      setBluetoothStatus(status);
      
      const deviceMemory = enhancedNativeBluetoothService.getDeviceMemory();
      setAutoConnect(deviceMemory.preferences.autoConnect);
      setDevices(deviceMemory.devices);
      
      // Load paired devices
      const paired = await enhancedNativeBluetoothService.getPairedDevices();
      setPairedDevices(paired);
      
      // Check connection status
      const connected = await enhancedNativeBluetoothService.isConnected();
      if (connected) {
        const connectionInfo = enhancedNativeBluetoothService.getConnectionInfo();
        setConnectedDevice(connectionInfo.device || null);
      }
      
    } catch (error) {
      console.error('Failed to initialize Bluetooth service:', error);
      toast.error('Failed to initialize Bluetooth service');
    }
  };
  
  const setupEventListeners = () => {
    enhancedNativeBluetoothService.on('deviceFound', handleDeviceFound);
    enhancedNativeBluetoothService.on('scanStarted', handleScanStarted);
    enhancedNativeBluetoothService.on('scanFinished', handleScanFinished);
    enhancedNativeBluetoothService.on('scanError', handleScanError);
    enhancedNativeBluetoothService.on('connected', handleDeviceConnected);
    enhancedNativeBluetoothService.on('disconnected', handleDeviceDisconnected);
    enhancedNativeBluetoothService.on('pairingStateChanged', handlePairingStateChanged);
  };
  
  const cleanupEventListeners = () => {
    enhancedNativeBluetoothService.off('deviceFound', handleDeviceFound);
    enhancedNativeBluetoothService.off('scanStarted', handleScanStarted);
    enhancedNativeBluetoothService.off('scanFinished', handleScanFinished);
    enhancedNativeBluetoothService.off('scanError', handleScanError);
    enhancedNativeBluetoothService.off('connected', handleDeviceConnected);
    enhancedNativeBluetoothService.off('disconnected', handleDeviceDisconnected);
    enhancedNativeBluetoothService.off('pairingStateChanged', handlePairingStateChanged);
  };
  
  // Event handlers
  const handleDeviceFound = useCallback((device: BluetoothDevice) => {
    setDevices(prev => {
      const exists = prev.find(d => d.address === device.address);
      if (!exists) {
        return [...prev, device].sort((a, b) => b.compatibility - a.compatibility);
      }
      return prev;
    });
  }, []);
  
  const handleScanStarted = useCallback(() => {
    setIsScanning(true);
    setScanProgress(0);
    setDevices([]);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 500);
  }, []);
  
  const handleScanFinished = useCallback((discoveredDevices: BluetoothDevice[]) => {
    setIsScanning(false);
    setScanProgress(100);
    setDevices(discoveredDevices.sort((a, b) => b.compatibility - a.compatibility));
    toast.success(`Found ${discoveredDevices.length} devices`);
    
    setTimeout(() => setScanProgress(0), 1000);
  }, []);
  
  const handleScanError = useCallback((error: string) => {
    setIsScanning(false);
    setScanProgress(0);
    toast.error(`Scan failed: ${error}`);
  }, []);
  
  const handleDeviceConnected = useCallback((result: any) => {
    const device = devices.find(d => d.address === result.address) || 
                  pairedDevices.find(d => d.address === result.address);
    
    if (device) {
      setConnectedDevice(device);
      setIsConnecting(null);
      toast.success(`Connected to ${device.name}`);
      
      if (onDeviceConnected) {
        onDeviceConnected(device);
      }
    }
  }, [devices, pairedDevices, onDeviceConnected]);
  
  const handleDeviceDisconnected = useCallback(() => {
    setConnectedDevice(null);
    setIsConnecting(null);
    toast.info('Device disconnected');
    
    if (onConnectionLost) {
      onConnectionLost();
    }
  }, [onConnectionLost]);
  
  const handlePairingStateChanged = useCallback((state: any) => {
    toast.info(`Pairing ${state.state}: ${state.device}`);
  }, []);
  
  // Action handlers
  const handleInitializeBluetooth = async () => {
    try {
      const initialized = await enhancedNativeBluetoothService.initialize();
      if (initialized) {
        const status = await enhancedNativeBluetoothService.checkBluetoothStatus();
        setBluetoothStatus(status);
        toast.success('Bluetooth initialized successfully');
      }
    } catch (error) {
      toast.error('Failed to initialize Bluetooth');
    }
  };
  
  const handleStartScan = async () => {
    try {
      const success = await enhancedNativeBluetoothService.startScan();
      if (!success) {
        toast.error('Failed to start device scan');
      }
    } catch (error) {
      toast.error('Error starting device scan');
    }
  };
  
  const handleStopScan = async () => {
    try {
      await enhancedNativeBluetoothService.stopScan();
      setIsScanning(false);
      setScanProgress(0);
    } catch (error) {
      toast.error('Error stopping scan');
    }
  };
  
  const handleConnectDevice = async (device: BluetoothDevice) => {
    try {
      setIsConnecting(device.address);
      const success = await enhancedNativeBluetoothService.connectToDevice(device);
      
      if (!success) {
        setIsConnecting(null);
        toast.error(`Failed to connect to ${device.name}`);
      }
    } catch (error) {
      setIsConnecting(null);
      toast.error(`Connection error: ${error}`);
    }
  };
  
  const handlePairDevice = async (device: BluetoothDevice) => {
    try {
      const success = await enhancedNativeBluetoothService.pairDevice(device);
      if (success) {
        // Refresh paired devices list
        const paired = await enhancedNativeBluetoothService.getPairedDevices();
        setPairedDevices(paired);
      }
    } catch (error) {
      toast.error(`Pairing error: ${error}`);
    }
  };
  
  const handleDisconnect = async () => {
    try {
      await enhancedNativeBluetoothService.disconnect();
      setConnectedDevice(null);
      toast.success('Disconnected successfully');
    } catch (error) {
      toast.error('Error disconnecting');
    }
  };
  
  const handleAutoConnect = async () => {
    try {
      const success = await enhancedNativeBluetoothService.attemptAutoConnect();
      if (!success) {
        toast.info('No suitable devices found for auto-connect');
      }
    } catch (error) {
      toast.error('Auto-connect failed');
    }
  };
  
  const handleToggleAutoConnect = (enabled: boolean) => {
    setAutoConnect(enabled);
    enhancedNativeBluetoothService.setAutoConnect(enabled);
    toast.success(`Auto-connect ${enabled ? 'enabled' : 'disabled'}`);
  };
  
  const handleSetPreferred = (device: BluetoothDevice) => {
    enhancedNativeBluetoothService.setPreferredDevice(device.address);
    toast.success(`${device.name} set as preferred device`);
  };
  
  const handleClearMemory = () => {
    enhancedNativeBluetoothService.clearDeviceMemory();
    setDevices([]);
    toast.success('Device memory cleared');
  };
  
  // Utility functions
  const getDeviceIcon = (device: BluetoothDevice) => {
    if (device.compatibility >= 0.8) {
      return <BluetoothConnected className=\"h-4 w-4 text-blue-500\" />;
    } else if (device.compatibility >= 0.5) {
      return <Bluetooth className=\"h-4 w-4 text-green-500\" />;
    } else {
      return <Bluetooth className=\"h-4 w-4 text-gray-500\" />;
    }
  };
  
  const getCompatibilityBadge = (compatibility: number) => {
    if (compatibility >= 0.8) {
      return <Badge className=\"bg-green-500 text-xs\">Excellent</Badge>;
    } else if (compatibility >= 0.6) {
      return <Badge className=\"bg-blue-500 text-xs\">Very Good</Badge>;
    } else if (compatibility >= 0.4) {
      return <Badge className=\"bg-yellow-500 text-xs\">Good</Badge>;
    } else if (compatibility >= 0.2) {
      return <Badge className=\"bg-orange-500 text-xs\">Fair</Badge>;
    } else {
      return <Badge variant=\"secondary\" className=\"text-xs\">Unknown</Badge>;
    }
  };
  
  const getStatusIcon = () => {
    if (!bluetoothStatus.supported) {
      return <XCircle className=\"h-5 w-5 text-red-500\" />;
    } else if (!bluetoothStatus.enabled) {
      return <AlertTriangle className=\"h-5 w-5 text-yellow-500\" />;
    } else if (!bluetoothStatus.hasPermissions) {
      return <Shield className=\"h-5 w-5 text-orange-500\" />;
    } else if (connectedDevice) {
      return <CheckCircle className=\"h-5 w-5 text-green-500\" />;
    } else {
      return <Bluetooth className=\"h-5 w-5 text-blue-500\" />;
    }
  };
  
  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    device.address.toLowerCase().includes(searchFilter.toLowerCase())
  );
  
  const filteredPairedDevices = pairedDevices.filter(device =>
    device.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    device.address.toLowerCase().includes(searchFilter.toLowerCase())
  );
  
  return (
    <div className=\"space-y-4\">
      {/* Bluetooth Status */}
      <Card>
        <CardHeader className=\"pb-3\">
          <CardTitle className=\"flex items-center justify-between\">
            <span className=\"flex items-center gap-2\">
              {getStatusIcon()}
              Enhanced Native Bluetooth Manager
            </span>
            <div className=\"flex items-center gap-2\">
              {connectedDevice ? (
                <Badge className=\"bg-green-500\">
                  <BluetoothConnected className=\"h-3 w-3 mr-1\" />
                  Connected
                </Badge>
              ) : (
                <Badge variant=\"secondary\">
                  <Bluetooth className=\"h-3 w-3 mr-1\" />
                  Disconnected
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className=\"space-y-4\">
          {/* Bluetooth Status Indicators */}
          <div className=\"grid grid-cols-3 gap-4 text-sm\">
            <div className=\"flex items-center gap-2\">
              {bluetoothStatus.supported ? 
                <CheckCircle className=\"h-4 w-4 text-green-500\" /> : 
                <XCircle className=\"h-4 w-4 text-red-500\" />
              }
              <span>Supported</span>
            </div>
            <div className=\"flex items-center gap-2\">
              {bluetoothStatus.enabled ? 
                <CheckCircle className=\"h-4 w-4 text-green-500\" /> : 
                <XCircle className=\"h-4 w-4 text-red-500\" />
              }
              <span>Enabled</span>
            </div>
            <div className=\"flex items-center gap-2\">
              {bluetoothStatus.hasPermissions ? 
                <CheckCircle className=\"h-4 w-4 text-green-500\" /> : 
                <XCircle className=\"h-4 w-4 text-red-500\" />
              }
              <span>Permissions</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          {(!bluetoothStatus.supported || !bluetoothStatus.enabled || !bluetoothStatus.hasPermissions) && (
            <Button onClick={handleInitializeBluetooth} className=\"w-full\">
              <Zap className=\"h-4 w-4 mr-2\" />
              Initialize Bluetooth
            </Button>
          )}
          
          {/* Connected Device */}
          {connectedDevice && (
            <div className=\"flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200\">
              <div className=\"flex items-center gap-3\">
                {getDeviceIcon(connectedDevice)}
                <div>
                  <div className=\"font-semibold text-green-800\">{connectedDevice.name}</div>
                  <div className=\"text-sm text-green-600\">{connectedDevice.address}</div>
                  <div className=\"flex items-center gap-2 mt-1\">
                    {getCompatibilityBadge(connectedDevice.compatibility)}
                    {connectedDevice.rssi && (
                      <Badge variant=\"outline\" className=\"text-xs\">
                        <Signal className=\"h-3 w-3 mr-1\" />
                        {connectedDevice.rssi}dBm
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button onClick={handleDisconnect} variant=\"outline\" size=\"sm\">
                Disconnect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader className=\"pb-3\">
          <CardTitle className=\"flex items-center gap-2\">
            <Settings className=\"h-5 w-5\" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className=\"space-y-4\">
          <div className=\"flex items-center justify-between\">
            <Label htmlFor=\"auto-connect\">Auto-connect to devices</Label>
            <Switch
              id=\"auto-connect\"
              checked={autoConnect}
              onCheckedChange={handleToggleAutoConnect}
            />
          </div>
          
          <div className=\"flex items-center justify-between\">
            <Label htmlFor=\"advanced\">Show advanced options</Label>
            <Switch
              id=\"advanced\"
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
          </div>
          
          <div className=\"flex gap-2\">
            <Button onClick={handleAutoConnect} variant=\"outline\" size=\"sm\" className=\"flex-1\">
              <Wifi className=\"h-4 w-4 mr-2\" />
              Auto Connect
            </Button>
            <Button onClick={handleClearMemory} variant=\"outline\" size=\"sm\" className=\"flex-1\">
              <RefreshCw className=\"h-4 w-4 mr-2\" />
              Clear Memory
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Device Scanner */}
      {!connectedDevice && (
        <Card>
          <CardHeader className=\"pb-3\">
            <CardTitle className=\"flex items-center gap-2\">
              <Search className=\"h-5 w-5\" />
              Device Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className=\"space-y-4\">
            {/* Search and Scan Controls */}
            <div className=\"flex gap-2\">
              <Input
                placeholder=\"Filter devices...\"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className=\"flex-1\"
              />
              <Button 
                onClick={isScanning ? handleStopScan : handleStartScan} 
                disabled={isConnecting !== null}
              >
                {isScanning ? (
                  <RefreshCw className=\"h-4 w-4 animate-spin\" />
                ) : (
                  <Search className=\"h-4 w-4\" />
                )}
                {isScanning ? 'Stop' : 'Scan'}
              </Button>
            </div>

            {/* Scan Progress */}
            {isScanning && (
              <div className=\"space-y-2\">
                <div className=\"flex justify-between text-sm\">
                  <span>Scanning for devices...</span>
                  <span>{scanProgress}%</span>
                </div>
                <Progress value={scanProgress} className=\"w-full\" />
              </div>
            )}

            {/* Paired Devices */}
            {filteredPairedDevices.length > 0 && (
              <div className=\"space-y-2\">
                <h4 className=\"font-medium text-sm flex items-center gap-2\">
                  <Star className=\"h-4 w-4 text-yellow-500\" />
                  Paired Devices
                </h4>
                {filteredPairedDevices.map((device) => (
                  <DeviceCard
                    key={`paired-${device.address}`}
                    device={device}
                    isConnecting={isConnecting === device.address}
                    onConnect={() => handleConnectDevice(device)}
                    onSetPreferred={() => handleSetPreferred(device)}
                    isPaired={true}
                  />
                ))}
              </div>
            )}

            {/* Discovered Devices */}
            {filteredDevices.length > 0 ? (
              <div className=\"space-y-2\">
                <h4 className=\"font-medium text-sm flex items-center gap-2\">
                  <Search className=\"h-4 w-4\" />
                  Discovered Devices ({filteredDevices.length})
                </h4>
                {filteredDevices.map((device) => (
                  <DeviceCard
                    key={`discovered-${device.address}`}
                    device={device}
                    isConnecting={isConnecting === device.address}
                    onConnect={() => handleConnectDevice(device)}
                    onPair={() => handlePairDevice(device)}
                    onSetPreferred={() => handleSetPreferred(device)}
                    isPaired={device.bonded}
                  />
                ))}
              </div>
            ) : !isScanning && (
              <div className=\"text-center py-8 text-muted-foreground\">
                <Bluetooth className=\"h-8 w-8 mx-auto mb-2\" />
                <p>No devices found</p>
                <p className=\"text-sm\">Click scan to discover OBD2 devices</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Device Card Component
interface DeviceCardProps {
  device: BluetoothDevice;
  isConnecting: boolean;
  onConnect: () => void;
  onPair?: () => void;
  onSetPreferred: () => void;
  isPaired: boolean;
}

const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  isConnecting,
  onConnect,
  onPair,
  onSetPreferred,
  isPaired
}) => {
  const getDeviceIcon = (device: BluetoothDevice) => {
    if (device.compatibility >= 0.8) {
      return <BluetoothConnected className=\"h-4 w-4 text-blue-500\" />;
    } else if (device.compatibility >= 0.5) {
      return <Bluetooth className=\"h-4 w-4 text-green-500\" />;
    } else {
      return <Bluetooth className=\"h-4 w-4 text-gray-500\" />;
    }
  };
  
  const getCompatibilityBadge = (compatibility: number) => {
    if (compatibility >= 0.8) {
      return <Badge className=\"bg-green-500 text-xs\">Excellent</Badge>;
    } else if (compatibility >= 0.6) {
      return <Badge className=\"bg-blue-500 text-xs\">Very Good</Badge>;
    } else if (compatibility >= 0.4) {
      return <Badge className=\"bg-yellow-500 text-xs\">Good</Badge>;
    } else if (compatibility >= 0.2) {
      return <Badge className=\"bg-orange-500 text-xs\">Fair</Badge>;
    } else {
      return <Badge variant=\"secondary\" className=\"text-xs\">Unknown</Badge>;
    }
  };

  return (
    <Card className=\"p-3 hover:bg-secondary/50 transition-colors\">
      <div className=\"flex items-center justify-between\">
        <div className=\"flex items-center gap-3 flex-1\">
          {getDeviceIcon(device)}
          <div className=\"flex-1 min-w-0\">
            <div className=\"font-medium truncate\">{device.name}</div>
            <div className=\"text-sm text-muted-foreground\">{device.address}</div>
            <div className=\"flex items-center gap-2 mt-1 flex-wrap\">
              {isPaired && <Badge variant=\"outline\" className=\"text-xs\">Paired</Badge>}
              {getCompatibilityBadge(device.compatibility)}
              {device.rssi && (
                <Badge variant=\"outline\" className=\"text-xs\">
                  <Signal className=\"h-3 w-3 mr-1\" />
                  {device.rssi}dBm
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className=\"flex items-center gap-2\">
          {!isPaired && onPair && (
            <Button onClick={onPair} variant=\"outline\" size=\"sm\">
              Pair
            </Button>
          )}
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            size=\"sm\"
          >
            {isConnecting ? (
              <>
                <RefreshCw className=\"h-3 w-3 animate-spin mr-1\" />
                Connecting...
              </>
            ) : (
              'Connect'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedNativeBluetoothManager;"
