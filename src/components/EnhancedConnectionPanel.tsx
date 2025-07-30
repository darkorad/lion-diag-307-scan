
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
  Zap
} from 'lucide-react';
import { BluetoothDevice } from '@/obd2/enhanced-bluetooth-service';
import { enhancedConnectionService } from '@/services/EnhancedConnectionService';
import { mobilePermissionsService } from '@/services/MobilePermissionsService';
import MobilePermissionDialog from './MobilePermissionDialog';
import { toast } from 'sonner';

interface EnhancedConnectionPanelProps {
  onDeviceConnected: (device: BluetoothDevice) => void;
  isConnected: boolean;
  currentDevice?: BluetoothDevice | null;
}

const EnhancedConnectionPanel: React.FC<EnhancedConnectionPanelProps> = ({
  onDeviceConnected,
  isConnected,
  currentDevice
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<{
    bluetooth: boolean;
    location: boolean;
    bluetoothScan: boolean;
    bluetoothConnect: boolean;
  } | null>(null);
  const [connectionStrategy, setConnectionStrategy] = useState<string>('');
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const status = await mobilePermissionsService.checkAllPermissionStatus();
      setPermissionStatus(status);
      
      // Auto-show permission dialog if essential permissions missing
      if (!status.bluetooth || !status.location) {
        setShowPermissionDialog(true);
      }
    } catch (error) {
      console.error('Permission check failed:', error);
    }
  };

  const handleScanDevices = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setDevices([]);

    try {
      // Check permissions first
      const status = await mobilePermissionsService.checkAllPermissionStatus();
      if (!status.bluetooth || !status.location) {
        setShowPermissionDialog(true);
        return;
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1500);

      // Enhanced device discovery
      const foundDevices = await enhancedConnectionService.discoverDevicesWithPermissions();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      setDevices(foundDevices);

      toast.success(`Found ${foundDevices.length} OBD2 device(s)`);

      if (foundDevices.length === 0) {
        toast.error('No OBD2 devices found', {
          description: 'Make sure your adapter is powered on and in pairing mode'
        });
      }

    } catch (error) {
      console.error('Scan failed:', error);
      toast.error('Device scan failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanProgress(0), 3000);
    }
  };

  const handleConnectDevice = async (device: BluetoothDevice) => {
    setIsConnecting(true);
    setSelectedDevice(device);
    setConnectionStrategy('');

    try {
      // Reset connection history for problematic devices
      if (enhancedConnectionService.isDeviceProblematic(device.id)) {
        enhancedConnectionService.resetDeviceConnectionHistory(device.id);
        toast.info('Resetting connection history for better compatibility');
      }

      // Enhanced connection with multiple strategies
      const result = await enhancedConnectionService.connectWithStrategies(device);
      
      if (result.success) {
        setConnectionStrategy(result.strategy || 'Success');
        onDeviceConnected(device);
        toast.success(`Connected to ${device.name}`, {
          description: `Using ${result.strategy} strategy`
        });
      } else {
        toast.error('Connection failed', {
          description: result.error || 'All connection strategies failed'
        });
        
        // Show troubleshooting tips
        setTimeout(() => {
          toast.info('Troubleshooting Tips', {
            description: 'Try: 1) Reset adapter 2) Clear Bluetooth cache 3) Re-pair device',
            duration: 8000
          });
        }, 2000);
      }

    } catch (error) {
      console.error('Connection failed:', error);
      toast.error('Connection error', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsConnecting(false);
      setSelectedDevice(null);
    }
  };

  const getDeviceIcon = (device: BluetoothDevice) => {
    const name = device.name.toLowerCase();
    if (name.includes('elm327') || name.includes('obd')) {
      return <Bluetooth className="h-5 w-5 text-blue-500" />;
    }
    return <Bluetooth className="h-5 w-5 text-gray-500" />;
  };

  const getDeviceScore = (device: BluetoothDevice) => {
    const name = device.name.toLowerCase();
    let score = 0;
    
    if (name.includes('elm327')) score += 100;
    if (name.includes('vgate')) score += 95;
    if (name.includes('obd')) score += 90;
    if (device.isPaired) score += 50;
    
    return score;
  };

  const getConnectionQuality = (device: BluetoothDevice) => {
    const score = getDeviceScore(device);
    if (score >= 90) return { text: 'Excellent', color: 'text-green-500' };
    if (score >= 70) return { text: 'Good', color: 'text-blue-500' };
    if (score >= 50) return { text: 'Fair', color: 'text-yellow-500' };
    return { text: 'Unknown', color: 'text-gray-500' };
  };

  return (
    <>
      <div className="space-y-6">
        {/* Permission Status */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>Mobile Permissions</span>
              </div>
              <Button
                onClick={() => setShowPermissionDialog(true)}
                variant="outline"
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {permissionStatus && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center space-x-2">
                  <Bluetooth className="h-4 w-4" />
                  <span className="text-sm">Bluetooth</span>
                  {permissionStatus.bluetooth ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Location</span>
                  {permissionStatus.location ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span className="text-sm">BT Scan</span>
                  {permissionStatus.bluetoothScan ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm">BT Connect</span>
                  {permissionStatus.bluetoothConnect ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Device Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Enhanced OBD2 Scanner</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleScanDevices}
                disabled={isScanning || isConnected}
                className="flex-1"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Scan for Devices
                  </>
                )}
              </Button>
              <Button
                onClick={checkPermissions}
                variant="outline"
                disabled={isScanning}
              >
                <Shield className="h-4 w-4" />
              </Button>
            </div>

            {isScanning && (
              <div className="space-y-2">
                <Progress value={scanProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  Discovering OBD2 devices... {scanProgress}%
                </p>
              </div>
            )}

            {/* Device List */}
            {devices.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Found Devices ({devices.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {devices.map((device) => {
                    const quality = getConnectionQuality(device);
                    const isProblematic = enhancedConnectionService.isDeviceProblematic(device.id);
                    
                    return (
                      <Card key={device.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getDeviceIcon(device)}
                            <div>
                              <p className="font-medium">
                                {device.name || 'Unknown OBD2 Device'}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>{device.address}</span>
                                {device.rssi && (
                                  <span>Signal: {device.rssi}dBm</span>
                                )}
                                <span className={quality.color}>
                                  {quality.text}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="flex flex-col items-end space-y-1">
                              <Badge variant={device.isPaired ? "default" : "secondary"}>
                                {device.isPaired ? "Paired" : "Available"}
                              </Badge>
                              {isProblematic && (
                                <Badge variant="destructive" className="text-xs">
                                  Issues
                                </Badge>
                              )}
                            </div>
                            
                            <Button
                              onClick={() => handleConnectDevice(device)}
                              disabled={isConnecting || isConnected}
                              size="sm"
                            >
                              {isConnecting && selectedDevice?.id === device.id ? (
                                <>
                                  <Zap className="mr-1 h-3 w-3 animate-pulse" />
                                  Connecting...
                                </>
                              ) : isConnected ? (
                                'Connected'
                              ) : (
                                'Connect'
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {isConnecting && selectedDevice?.id === device.id && connectionStrategy && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Strategy: {connectionStrategy}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Connection Tips */}
            <Alert>
              <Bluetooth className="h-4 w-4" />
              <AlertDescription>
                <strong>Enhanced Connection Features:</strong>
                <ul className="mt-2 text-sm space-y-1">
                  <li>• Smart device ranking by compatibility</li>
                  <li>• Multiple connection strategies for reliability</li>
                  <li>• Automatic permission management</li>
                  <li>• Connection history and troubleshooting</li>
                  <li>• Support for all major OBD2 adapter brands</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Current Connection */}
        {isConnected && currentDevice && (
          <Card className="border-green-500/20">
            <CardHeader>
              <CardTitle className="text-green-500">Connected Device</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{currentDevice.name}</p>
                  <p className="text-sm text-muted-foreground">{currentDevice.address}</p>
                </div>
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile Permission Dialog */}
      <MobilePermissionDialog
        isOpen={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
        onPermissionsGranted={() => {
          checkPermissions();
          toast.success('Permissions updated successfully!');
        }}
        requiredFeatures={['bluetooth_scan', 'device_connection']}
      />
    </>
  );
};

export default EnhancedConnectionPanel;
