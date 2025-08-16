
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Bluetooth, 
  BluetoothConnected, 
  Wifi, 
  Search, 
  Settings, 
  RefreshCw,
  Signal,
  Battery,
  Clock,
  Trash2,
  Star,
  AlertTriangle
} from 'lucide-react';
import { comprehensiveBluetoothService, BluetoothDevice } from '@/services/ComprehensiveBluetoothService';
import { autoConnectService } from '@/services/AutoConnectService';
import { bluetoothConnectionManager } from '@/services/BluetoothConnectionManager';

interface EnhancedBluetoothManagerProps {
  onDeviceConnected?: (device: BluetoothDevice) => void;
}

const EnhancedBluetoothManager: React.FC<EnhancedBluetoothManagerProps> = ({ onDeviceConnected }) => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [autoConnect, setAutoConnect] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [connectionStats, setConnectionStats] = useState<any>(null);

  useEffect(() => {
    // Load auto-connect settings
    const settings = autoConnectService.getSettings();
    setAutoConnect(settings.enabled);
    
    // Load connection statistics
    setConnectionStats(autoConnectService.getConnectionStats());

    // Subscribe to connection state changes
    const unsubscribe = bluetoothConnectionManager.subscribe((state) => {
      setConnectedDevice(state.device);
    });

    // Try auto-connect on startup
    if (settings.enabled) {
      handleAutoConnect();
    }

    return unsubscribe;
  }, []);

  const handleAutoConnect = async () => {
    try {
      console.log('🔄 Attempting auto-connect...');
      const result = await autoConnectService.attemptAutoConnect();
      
      if (result.success && result.device) {
        toast.success(`Auto-connected to ${result.device.name}`);
        if (onDeviceConnected) {
          onDeviceConnected(result.device as any);
        }
      } else {
        console.log('Auto-connect failed:', result.error);
      }
    } catch (error) {
      console.warn('Auto-connect error:', error);
    }
  };

  const startScan = async () => {
    setIsScanning(true);
    setDevices([]);
    
    try {
      console.log('🔍 Starting enhanced device scan...');
      const discoveredDevices = await comprehensiveBluetoothService.scanForDevices(15000);
      
      // Sort by compatibility and signal strength
      const sortedDevices = discoveredDevices.sort((a, b) => {
        const compatibilityDiff = (b.compatibility || 0) - (a.compatibility || 0);
        if (compatibilityDiff !== 0) return compatibilityDiff;
        
        const signalDiff = (b.rssi || -100) - (a.rssi || -100);
        return signalDiff;
      });
      
      setDevices(sortedDevices);
      toast.success(`Found ${sortedDevices.length} devices`);
      
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error('Device scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    setIsConnecting(device.address);
    
    try {
      console.log(`🔗 Connecting to ${device.name}...`);
      const result = await comprehensiveBluetoothService.connectToDevice(device);
      
      if (result.success && result.device) {
        // Remember successful connection
        autoConnectService.rememberDevice(result.device, result.protocol);
        
        setConnectedDevice(result.device);
        toast.success(`Connected to ${result.device.name}`);
        
        if (onDeviceConnected) {
          onDeviceConnected(result.device);
        }
      } else {
        throw new Error(result.error || 'Connection failed');
      }
      
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(null);
    }
  };

  const disconnect = async () => {
    try {
      await comprehensiveBluetoothService.smartConnect({ disconnect: true } as any);
      setConnectedDevice(null);
      toast.success('Disconnected');
    } catch (error) {
      console.error('Disconnect failed:', error);
      toast.error('Failed to disconnect');
    }
  };

  const toggleAutoConnect = async (enabled: boolean) => {
    setAutoConnect(enabled);
    autoConnectService.updateSettings({ enabled });
    toast.success(`Auto-connect ${enabled ? 'enabled' : 'disabled'}`);
  };

  const clearDeviceHistory = () => {
    autoConnectService.forgetAllDevices();
    setConnectionStats(autoConnectService.getConnectionStats());
    toast.success('Device history cleared');
  };

  const getDeviceIcon = (device: BluetoothDevice) => {
    if (device.deviceType === 'ELM327' || device.deviceType === 'OBD2') {
      return <BluetoothConnected className="h-4 w-4 text-blue-500" />;
    }
    return <Bluetooth className="h-4 w-4 text-gray-500" />;
  };

  const getCompatibilityBadge = (compatibility: number) => {
    if (compatibility >= 0.8) {
      return <Badge className="bg-green-500">Excellent</Badge>;
    } else if (compatibility >= 0.6) {
      return <Badge className="bg-yellow-500">Good</Badge>;
    } else if (compatibility >= 0.4) {
      return <Badge className="bg-orange-500">Fair</Badge>;
    } else {
      return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    device.address.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bluetooth className="h-5 w-5" />
              Enhanced Bluetooth Manager
            </span>
            <div className="flex items-center gap-2">
              {connectedDevice ? (
                <Badge className="bg-green-500">
                  <BluetoothConnected className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Bluetooth className="h-3 w-3 mr-1" />
                  Disconnected
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        {connectedDevice && (
          <CardContent className="pt-0">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getDeviceIcon(connectedDevice)}
                <div>
                  <div className="font-semibold">{connectedDevice.name}</div>
                  <div className="text-sm text-muted-foreground">{connectedDevice.address}</div>
                </div>
              </div>
              <Button onClick={disconnect} variant="outline" size="sm">
                Disconnect
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-connect">Auto-connect to last device</Label>
            <Switch
              id="auto-connect"
              checked={autoConnect}
              onCheckedChange={toggleAutoConnect}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="advanced">Show advanced options</Label>
            <Switch
              id="advanced"
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
          </div>

          {showAdvanced && connectionStats && (
            <div className="border-t pt-4 space-y-2">
              <div className="text-sm font-medium">Connection Statistics</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Total devices: {connectionStats.totalDevices}</div>
                <div>Successful: {connectionStats.successfulDevices}</div>
              </div>
              <Button onClick={clearDeviceHistory} variant="outline" size="sm" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Device Scanner */}
      {!connectedDevice && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Device Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Filter devices..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="flex-1"
              />
              <Button onClick={startScan} disabled={isScanning}>
                {isScanning ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {filteredDevices.length > 0 ? (
              <div className="space-y-2">
                {filteredDevices.map((device) => (
                  <Card key={device.address} className="p-3 hover:bg-secondary/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(device)}
                        <div className="flex-1">
                          <div className="font-medium">{device.name}</div>
                          <div className="text-sm text-muted-foreground">{device.address}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {device.isPaired && <Badge variant="outline" className="text-xs">Paired</Badge>}
                            {device.compatibility !== undefined && getCompatibilityBadge(device.compatibility)}
                            {device.rssi && (
                              <Badge variant="outline" className="text-xs">
                                <Signal className="h-3 w-3 mr-1" />
                                {device.rssi}dBm
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => connectToDevice(device)}
                        disabled={isConnecting === device.address}
                        size="sm"
                      >
                        {isConnecting === device.address ? 'Connecting...' : 'Connect'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : isScanning ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                Scanning for devices...
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bluetooth className="h-8 w-8 mx-auto mb-2" />
                Click scan to find OBD2 devices
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedBluetoothManager;
