
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Bluetooth, 
  Wifi, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Search,
  Zap,
  Shield,
  Settings
} from 'lucide-react';
import { 
  comprehensiveBluetoothService, 
  BluetoothDevice, 
  BluetoothDiscoveryResult 
} from '@/services/ComprehensiveBluetoothService';
import { useToast } from '@/hooks/use-toast';

interface EnhancedBluetoothScannerProps {
  onDeviceConnected: (device: BluetoothDevice) => void;
}

const EnhancedBluetoothScanner: React.FC<EnhancedBluetoothScannerProps> = ({ onDeviceConnected }) => {
  const [discoveryResult, setDiscoveryResult] = useState<BluetoothDiscoveryResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isPairing, setIsPairing] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const granted = await comprehensiveBluetoothService.requestAllBluetoothPermissions();
      setPermissionsGranted(granted);
      
      if (granted) {
        toast({
          title: "Permissions Granted",
          description: "Bluetooth and location permissions are active",
        });
      } else {
        toast({
          title: "Permissions Required",
          description: "Please grant Bluetooth and location permissions",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Permission check failed:', error);
    }
  };

  const startComprehensiveScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setDiscoveryResult(null);

    try {
      // Simulate progress during scan
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 1000);

      console.log('Starting comprehensive Bluetooth scan...');
      const result = await comprehensiveBluetoothService.discoverAllDevices();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setDiscoveryResult(result);

      if (result.success) {
        toast({
          title: "Scan Complete",
          description: `Found ${result.devices.length} potential OBD2 device(s)`,
        });

        if (result.devices.length === 0) {
          toast({
            title: "No OBD2 Devices Found",
            description: "Make sure your ELM327 is powered on and try pairing it manually first",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Scan Failed",
          description: result.error || "Failed to scan for devices",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Scan failed:', error);
      toast({
        title: "Scan Error",
        description: error instanceof Error ? error.message : "Scan failed",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanProgress(0), 2000);
    }
  };

  const pairWithDevice = async (device: BluetoothDevice) => {
    setIsPairing(device.id);

    try {
      const success = await comprehensiveBluetoothService.pairDevice(device);
      
      if (success) {
        toast({
          title: "Pairing Successful",
          description: `Paired with ${device.name}`,
        });
        
        // Refresh the device list
        await startComprehensiveScan();
      } else {
        toast({
          title: "Pairing Failed",
          description: `Could not pair with ${device.name}. Try pairing manually in system settings.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Pairing failed:', error);
      toast({
        title: "Pairing Error",
        description: error instanceof Error ? error.message : "Pairing failed",
        variant: "destructive"
      });
    } finally {
      setIsPairing(null);
    }
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    setIsConnecting(device.id);

    try {
      console.log(`Attempting connection to ${device.name}...`);
      const result = await comprehensiveBluetoothService.connectToDevice(device);
      
      if (result.success) {
        toast({
          title: "Connection Successful",
          description: `Connected to ${device.name}`,
        });
        
        onDeviceConnected(device);
      } else {
        throw new Error(result.error || 'Connection failed');
      }
      
    } catch (error) {
      console.error('Connection failed:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Connection failed",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const getDeviceIcon = (device: BluetoothDevice) => {
    switch (device.deviceType) {
      case 'ELM327':
        return <Zap className="h-5 w-5 text-green-500" />;
      case 'OBD2':
        return <Settings className="h-5 w-5 text-blue-500" />;
      default:
        return <Bluetooth className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDeviceStatus = (device: BluetoothDevice) => {
    const badges = [];
    
    if (device.isPaired) {
      badges.push(<Badge key="paired" variant="default">Paired</Badge>);
    }
    
    if (device.deviceType === 'ELM327') {
      badges.push(<Badge key="elm327" variant="secondary" className="bg-green-100">ELM327</Badge>);
    } else if (device.deviceType === 'OBD2') {
      badges.push(<Badge key="obd2" variant="secondary" className="bg-blue-100">OBD2</Badge>);
    }
    
    return <div className="flex gap-1 flex-wrap">{badges}</div>;
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Enhanced OBD2 Device Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Permission Status */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                permissionsGranted ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">
                {permissionsGranted ? 'Permissions Granted' : 'Permissions Required'}
              </span>
            </div>
            {!permissionsGranted && (
              <Button onClick={checkPermissions} size="sm" variant="outline">
                <Shield className="mr-1 h-3 w-3" />
                Grant Permissions
              </Button>
            )}
          </div>

          {/* Scan Button */}
          <Button 
            onClick={startComprehensiveScan} 
            disabled={isScanning || !permissionsGranted}
            className="w-full"
            size="lg"
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning All Bluetooth Devices...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find ALL OBD2 Devices (ELM327 + Chinese)
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {isScanning && (
            <div className="space-y-2">
              <Progress value={scanProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Discovering paired and unpaired devices... {scanProgress}%
              </p>
            </div>
          )}

          {/* Results */}
          {discoveryResult && discoveryResult.success && discoveryResult.devices.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Found {discoveryResult.devices.length} Potential OBD2 Device(s)</h3>
              
              {discoveryResult.devices.map((device) => (
                <Card key={device.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getDeviceIcon(device)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {device.name || `Device ${device.address.slice(-4)}`}
                            </p>
                            <span className={`text-xs font-mono ${getCompatibilityColor(device.compatibility)}`}>
                              Score: {(device.compatibility * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">
                            {device.address}
                          </p>
                          {device.rssi && (
                            <p className="text-xs text-muted-foreground">
                              Signal: {device.rssi}dBm
                            </p>
                          )}
                          <div className="mt-1">
                            {getDeviceStatus(device)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!device.isPaired && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pairWithDevice(device)}
                            disabled={isPairing !== null}
                          >
                            {isPairing === device.id ? (
                              <>
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
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
                          onClick={() => connectToDevice(device)}
                          disabled={isConnecting !== null}
                          size="sm"
                          variant={device.deviceType === 'ELM327' ? 'default' : 'outline'}
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

          {/* No devices found */}
          {discoveryResult && discoveryResult.success && discoveryResult.devices.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>No OBD2 devices found.</strong><br />
                Try these steps:
                <ul className="mt-2 ml-4 list-disc">
                  <li>Ensure your ELM327 adapter is powered on (plugged into OBD2 port)</li>
                  <li>Make sure vehicle ignition is ON</li>
                  <li>Try pairing the device manually in system Bluetooth settings first</li>
                  <li>Check if the device name contains numbers/letters you recognize</li>
                  <li>Some Chinese adapters have generic names like "Unknown" or show only MAC addresses</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Universal ELM327 Scanner:</strong>
              <ul className="mt-2 text-sm space-y-1">
                <li>• <strong>Finds ALL devices:</strong> ELM327, Vgate, Konnwei, Chinese clones, generic adapters</li>
                <li>• <strong>Smart detection:</strong> Identifies devices even with generic names or MAC addresses</li>
                <li>• <strong>Auto-pairing:</strong> Attempts to pair unpaired devices automatically</li>
                <li>• <strong>Multiple strategies:</strong> Tries different connection methods for maximum compatibility</li>
                <li>• Works with $3 Temu/AliExpress adapters and professional $200+ scanners</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedBluetoothScanner;
