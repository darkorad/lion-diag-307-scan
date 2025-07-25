import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Bluetooth, 
  Loader2, 
  Wifi,
  CheckCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  Zap
} from 'lucide-react';
import { BluetoothDevice, unifiedBluetoothService, UnifiedConnectionResult } from '@/services/UnifiedBluetoothService';
import { permissionService } from '@/services/PermissionService';
import { useToast } from '@/hooks/use-toast';

interface SimplifiedBluetoothConnectionProps {
  onDeviceConnected: (device: BluetoothDevice) => void;
  isConnected: boolean;
}

const SimplifiedBluetoothConnection: React.FC<SimplifiedBluetoothConnectionProps> = ({
  onDeviceConnected,
  isConnected
}) => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingDevice, setConnectingDevice] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<string>('Ready to scan');
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const status = await permissionService.checkPermissionStatus();
      const allGranted = status.bluetooth && status.location;
      setPermissionsGranted(allGranted);
      
      if (allGranted) {
        setConnectionStatus('Ready to scan for OBD2 devices');
      } else {
        setConnectionStatus('Permissions required');
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      setConnectionStatus('Permission check failed');
    }
  };

  const requestPermissions = async () => {
    try {
      setConnectionStatus('Requesting permissions...');
      const permissions = await permissionService.requestAllPermissions();
      
      const granted = permissions.bluetooth && permissions.location;
      setPermissionsGranted(granted);
      
      if (granted) {
        setConnectionStatus('Permissions granted - ready to scan');
        toast({
          title: "Permissions Granted",
          description: "All required permissions have been granted successfully!",
        });
      } else {
        setConnectionStatus('Some permissions denied');
        toast({
          title: "Permissions Required",
          description: "Please grant Bluetooth and Location permissions to continue.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      setConnectionStatus('Permission request failed');
      toast({
        title: "Permission Error",
        description: "Failed to request permissions. Please try again.",
        variant: "destructive"
      });
    }
  };

  const scanForDevices = async () => {
    if (!permissionsGranted) {
      await requestPermissions();
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setDevices([]);
    setConnectionStatus('Scanning for all OBD2 devices...');

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
      }, 1500);

      const foundDevices = await unifiedBluetoothService.discoverAllOBD2Devices();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setDevices(foundDevices);
      setConnectionStatus(`Found ${foundDevices.length} OBD2 device(s)`);
      
      toast({
        title: "Scan Complete",
        description: `Found ${foundDevices.length} OBD2-compatible device(s)`,
      });

      if (foundDevices.length === 0) {
        setConnectionStatus('No OBD2 devices found');
        toast({
          title: "No Devices Found",
          description: "Make sure your OBD2 adapter is powered on and in range",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Scan failed:', error);
      setConnectionStatus('Scan failed');
      toast({
        title: "Scan Failed",
        description: error instanceof Error ? error.message : "Failed to scan for devices",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanProgress(0), 2000);
    }
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    setIsConnecting(true);
    setConnectingDevice(device.id);
    setConnectionStatus(`Connecting to ${device.name}...`);

    try {
      const result: UnifiedConnectionResult = await unifiedBluetoothService.smartConnect(device);
      
      if (result.success && result.device) {
        setConnectionStatus(`Connected to ${device.name}`);
        onDeviceConnected(result.device);
        
        toast({
          title: "Connection Successful",
          description: `Connected to ${device.name} using ${result.protocol || 'auto'} protocol`,
        });
      } else {
        setConnectionStatus(`Connection failed: ${result.error}`);
        toast({
          title: "Connection Failed",
          description: result.error || "Unknown connection error",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Connection failed:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setConnectionStatus(`Connection failed: ${errorMessage}`);
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
      setConnectingDevice(null);
    }
  };

  const resetDevice = (device: BluetoothDevice) => {
    unifiedBluetoothService.resetConnectionAttempts(device.address);
    toast({
      title: "Device Reset",
      description: `Reset connection attempts for ${device.name}`,
    });
  };

  const getDeviceIcon = (device: BluetoothDevice) => {
    return <Bluetooth className="h-5 w-5 text-blue-500" />;
  };

  const getDeviceStatus = (device: BluetoothDevice) => {
    if (device.isPaired) {
      return <Badge variant="default">Paired</Badge>;
    }
    return <Badge variant="secondary">Available</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Smart OBD2 Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 
              isScanning || isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm font-medium">{connectionStatus}</span>
          </div>
          {!permissionsGranted && (
            <Button onClick={requestPermissions} size="sm" variant="outline">
              Grant Permissions
            </Button>
          )}
        </div>

        {/* Scan Button */}
        <Button 
          onClick={scanForDevices} 
          disabled={isScanning || isConnecting || isConnected}
          className="w-full"
          size="lg"
        >
          {isScanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning for All OBD2 Devices...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Find All OBD2 Devices
            </>
          )}
        </Button>

        {/* Progress Bar */}
        {isScanning && (
          <div className="space-y-2">
            <Progress value={scanProgress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Discovering OBD2 adapters... {scanProgress}%
            </p>
          </div>
        )}

        {/* Device List */}
        {devices.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Available OBD2 Devices ({devices.length})</h4>
            {devices.map((device) => (
              <Card key={device.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(device)}
                    <div className="flex-1">
                      <p className="font-medium">
                        {device.name || `OBD2 Device ${device.address.slice(-4)}`}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{device.address}</span>
                        {device.rssi && (
                          <span>Signal: {device.rssi}dBm</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getDeviceStatus(device)}
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetDevice(device)}
                        disabled={isConnecting}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        onClick={() => connectToDevice(device)}
                        disabled={isConnecting || isConnected}
                        size="sm"
                      >
                        {isConnecting && connectingDevice === device.id ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Connecting...
                          </>
                        ) : isConnected ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Connected
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
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Help Information */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Smart Connection Tips:</strong>
            <ul className="mt-2 text-sm space-y-1">
              <li>• App automatically finds ALL OBD2 adapters (ELM327, Vgate, Konnwei, etc.)</li>
              <li>• Ensure your adapter is powered on and vehicle ignition is ON</li>
              <li>• First-time setup: Pair adapter in Android Bluetooth settings (PIN: 1234/0000)</li>
              <li>• App uses smart connection with automatic protocol detection</li>
              <li>• Reset device if connection fails repeatedly</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default SimplifiedBluetoothConnection;
