import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  History, 
  Settings, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Bluetooth
} from 'lucide-react';
import { autoConnectService, StoredDevice, AutoConnectSettings } from '@/services/AutoConnectService';
import { useToast } from '@/hooks/use-toast';
import { BluetoothDevice } from '@/services/MasterBluetoothService';

interface AutoConnectManagerProps {
  onDeviceSelected?: (device: BluetoothDevice) => void;
  onAutoConnectAttempt?: () => void;
}

const AutoConnectManager: React.FC<AutoConnectManagerProps> = ({
  onDeviceSelected,
  onAutoConnectAttempt
}) => {
  const [rememberedDevices, setRememberedDevices] = useState<StoredDevice[]>([]);
  const [settings, setSettings] = useState<AutoConnectSettings>(autoConnectService.getSettings());
  const [isAttemptingAutoConnect, setIsAttemptingAutoConnect] = useState(false);
  const [stats, setStats] = useState(autoConnectService.getConnectionStats());
  const { toast } = useToast();

  useEffect(() => {
    loadRememberedDevices();
  }, []);

  const loadRememberedDevices = () => {
    const devices = autoConnectService.getRememberedDevices();
    setRememberedDevices(devices);
    setStats(autoConnectService.getConnectionStats());
  };

  const handleAutoConnectToggle = (enabled: boolean) => {
    const newSettings = { ...settings, enabled };
    setSettings(newSettings);
    autoConnectService.updateSettings(newSettings);
    
    toast({
      title: enabled ? "Auto-Connect Enabled" : "Auto-Connect Disabled",
      description: enabled ? "App will try to connect to last device automatically" : "Manual connection required",
    });
  };

  const handleSettingsChange = (key: keyof AutoConnectSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    autoConnectService.updateSettings(newSettings);
  };

  const attemptAutoConnect = async () => {
    if (isAttemptingAutoConnect) return;
    
    setIsAttemptingAutoConnect(true);
    onAutoConnectAttempt?.();
    
    try {
      const result = await autoConnectService.attemptAutoConnect();
      
      if (result.success && result.device) {
        toast({
          title: "Auto-Connect Successful",
          description: `Connected to ${result.device.name}`,
        });
        
        // Convert StoredDevice to BluetoothDevice for callback
        const bluetoothDevice: BluetoothDevice = {
          id: result.device.id,
          address: result.device.address,
          name: result.device.name,
          isPaired: true,
          isConnected: true,
          deviceType: 'OBD2' as const,
          compatibility: 1
        };
        onDeviceSelected?.(bluetoothDevice);
      } else {
        toast({
          title: "Auto-Connect Failed",
          description: result.error || "Could not connect to last device",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Auto-Connect Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsAttemptingAutoConnect(false);
    }
  };

  const forgetDevice = (deviceAddress: string) => {
    autoConnectService.forgetDevice(deviceAddress);
    loadRememberedDevices();
    toast({
      title: "Device Forgotten",
      description: "Device removed from auto-connect list",
    });
  };

  const forgetAllDevices = () => {
    autoConnectService.forgetAllDevices();
    loadRememberedDevices();
    toast({
      title: "All Devices Forgotten",
      description: "Cleared all remembered devices",
    });
  };

  const formatLastConnected = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getDeviceIcon = (adapterType?: string) => {
    return <Bluetooth className="h-5 w-5 text-blue-500" />;
  };

  const handleDeviceConnect = (device: StoredDevice) => {
    // Convert StoredDevice to BluetoothDevice for callback
    const bluetoothDevice: BluetoothDevice = {
      id: device.id,
      address: device.address,
      name: device.name,
      isPaired: true,
      isConnected: false,
      deviceType: 'OBD2' as const,
      compatibility: 1
    };
    onDeviceSelected?.(bluetoothDevice);
  };

  return (
    <div className="space-y-4">
      {/* Auto-Connect Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Auto-Connect Manager
            </div>
            <Badge variant={settings.enabled ? "default" : "secondary"}>
              {settings.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-2xl">{stats.totalDevices}</div>
              <div className="text-muted-foreground">Remembered</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-2xl text-green-600">{stats.successfulDevices}</div>
              <div className="text-muted-foreground">Successful</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-2xl">
                {stats.lastConnectionTime ? formatLastConnected(stats.lastConnectionTime) : 'Never'}
              </div>
              <div className="text-muted-foreground">Last Connect</div>
            </div>
          </div>

          {/* Auto-Connect Controls */}
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Enable Auto-Connect</span>
              <Switch
                checked={settings.enabled}
                onCheckedChange={handleAutoConnectToggle}
              />
            </div>
            
            {settings.enabled && (
              <Button
                onClick={attemptAutoConnect}
                disabled={isAttemptingAutoConnect || rememberedDevices.length === 0}
                className="w-full"
                size="sm"
              >
                {isAttemptingAutoConnect ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Connecting to Last Device...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Connect to Last Device
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Remembered Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Remembered Devices ({rememberedDevices.length})
            </div>
            {rememberedDevices.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={forgetAllDevices}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rememberedDevices.length === 0 ? (
            <Alert>
              <History className="h-4 w-4" />
              <AlertDescription>
                No remembered devices yet. Successfully connect to an OBD2 adapter and it will be remembered for quick reconnection.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {rememberedDevices.map((device) => (
                <Card key={device.address} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getDeviceIcon(device.adapterType)}
                      <div className="flex-1">
                        <p className="font-medium">{device.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{device.address}</span>
                          <span>•</span>
                          <span>{device.adapterType || 'Unknown'}</span>
                          <span>•</span>
                          <span>{formatLastConnected(device.lastConnected)}</span>
                        </div>
                        {device.protocol && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {device.protocol}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {device.connectionSuccess ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeviceConnect(device)}
                      >
                        Connect
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => forgetDevice(device.address)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Auto-Connect Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Attempts</label>
              <select
                value={settings.maxAttempts}
                onChange={(e) => handleSettingsChange('maxAttempts', parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
              >
                <option value={1}>1 attempt</option>
                <option value={2}>2 attempts</option>
                <option value={3}>3 attempts</option>
                <option value={5}>5 attempts</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Timeout (seconds)</label>
              <select
                value={settings.timeoutMs / 1000}
                onChange={(e) => handleSettingsChange('timeoutMs', parseInt(e.target.value) * 1000)}
                className="w-full p-2 border rounded-md"
              >
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={45}>45 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Try Last Device First</span>
            <Switch
              checked={settings.tryLastDevice}
              onCheckedChange={(checked) => handleSettingsChange('tryLastDevice', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Fallback to Device Scan</span>
            <Switch
              checked={settings.fallbackToScan}
              onCheckedChange={(checked) => handleSettingsChange('fallbackToScan', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoConnectManager;
