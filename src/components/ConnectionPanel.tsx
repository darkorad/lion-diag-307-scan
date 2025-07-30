
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BluetoothDevice } from '@/services/MasterBluetoothService';
import { 
  CheckCircle, 
  AlertCircle,
  Car,
  Wifi,
  Signal,
  Bluetooth,
  Search,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { bluetoothIntegrationService } from '@/services/BluetoothIntegrationService';
import ConnectionStatus from '@/components/ConnectionStatus';

interface ConnectionPanelProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
  connectionStatus: string;
  onStatusChange: (status: string) => void;
  vehicleInfo: {
    make: string;
    model: string;
    engine: string;
    year: number;
  };
}

const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  isConnected,
  onConnectionChange,
  connectionStatus,
  onStatusChange,
  vehicleInfo
}) => {
  const [availableDevices, setAvailableDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    // Initialize Bluetooth system on component mount
    initializeBluetoothSystem();
  }, []);

  const initializeBluetoothSystem = async () => {
    try {
      const initialized = await bluetoothIntegrationService.initializeBluetoothSystem();
      if (initialized) {
        console.log('Bluetooth system ready');
      } else {
        toast.error('Failed to initialize Bluetooth system');
      }
    } catch (error) {
      console.error('Bluetooth initialization error:', error);
    }
  };

  const handleScanForDevices = async () => {
    setIsScanning(true);
    setScanProgress(0);
    onStatusChange('scanning');
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 1000);

      const result = await bluetoothIntegrationService.discoverAllCompatibleDevices();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      if (result.success && result.devices) {
        setAvailableDevices(result.devices);
        toast.success(`Found ${result.devices.length} compatible OBD2 device(s)`);
        
        if (result.devices.length === 0) {
          toast.info('No OBD2 devices found. Make sure your adapter is powered on and in pairing mode.');
        }
      } else {
        toast.error(result.error || 'Device scan failed');
      }
      
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error('Failed to scan for devices');
    } finally {
      setIsScanning(false);
      onStatusChange('disconnected');
      setTimeout(() => setScanProgress(0), 2000);
    }
  };

  const handleConnectToDevice = async (device: BluetoothDevice) => {
    setIsConnecting(true);
    setSelectedDeviceId(device.id);
    onStatusChange('connecting');
    
    try {
      const result = await bluetoothIntegrationService.connectToDevice(device);
      
      if (result.success && result.connectedDevice) {
        onConnectionChange(true);
        onStatusChange('connected');
        toast.success(`Successfully connected to ${device.name}`);
      } else {
        toast.error(result.error || 'Connection failed');
        onStatusChange('disconnected');
      }
      
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error('Connection attempt failed');
      onStatusChange('disconnected');
    } finally {
      setIsConnecting(false);
      setSelectedDeviceId(null);
    }
  };

  const handleDisconnect = async () => {
    try {
      const success = await bluetoothIntegrationService.disconnect();
      if (success) {
        onConnectionChange(false);
        onStatusChange('disconnected');
        toast.info('Disconnected from OBD2 device');
      } else {
        toast.error('Disconnect failed');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Disconnect failed');
    }
  };

  const resetDeviceAttempts = (device: BluetoothDevice) => {
    bluetoothIntegrationService.resetConnectionAttempts(device.address);
    toast.info(`Reset connection attempts for ${device.name}`);
  };

  const getDeviceIcon = (device: BluetoothDevice) => {
    const name = device.name.toLowerCase();
    if (name.includes('elm327') || name.includes('vgate') || name.includes('obd')) {
      return <Bluetooth className="h-5 w-5 text-blue-500" />;
    }
    return <Bluetooth className="h-5 w-5 text-gray-500" />;
  };

  const getCompatibilityBadge = (device: BluetoothDevice) => {
    const score = device.compatibility || 0;
    if (score >= 80) return <Badge className="bg-green-500">High</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-500">Medium</Badge>;
    return <Badge variant="secondary">Low</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Header */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-primary" />
              <span>OBD2 Connection Center</span>
            </div>
            <ConnectionStatus showDetails={true} onDisconnect={handleDisconnect} />
          </CardTitle>
        </CardHeader>
        {isConnected && (
          <CardContent>
            <div className="space-y-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-700 dark:text-green-300">
                  Connected and Ready for Diagnostics
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Vehicle:</span>
                  <span className="ml-2 font-medium">{vehicleInfo.make} {vehicleInfo.model}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Engine:</span>
                  <span className="ml-2 font-medium">{vehicleInfo.engine}</span>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Device Scanner */}
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Device Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={handleScanForDevices}
                disabled={isScanning || isConnecting}
                className="flex-1"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Scan for OBD2 Devices
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setAvailableDevices([])}
                disabled={isScanning || isConnecting}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {isScanning && (
              <div className="space-y-2">
                <Progress value={scanProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  Scanning for compatible OBD2 adapters... {scanProgress}%
                </p>
              </div>
            )}

            {availableDevices.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Found {availableDevices.length} Compatible Device(s)</h4>
                {availableDevices.map((device) => (
                  <Card key={device.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getDeviceIcon(device)}
                        <div className="flex-1">
                          <p className="font-medium">
                            {device.name || 'Unknown OBD2 Device'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">{device.address}</span>
                            {device.rssi && (
                              <span>Signal: {device.rssi}dBm</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={device.isPaired ? "default" : "secondary"}>
                              {device.isPaired ? "Paired" : "Unpaired"}
                            </Badge>
                            {getCompatibilityBadge(device)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetDeviceAttempts(device)}
                          disabled={isConnecting}
                        >
                          Reset
                        </Button>
                        <Button
                          onClick={() => handleConnectToDevice(device)}
                          disabled={isConnecting}
                          size="sm"
                        >
                          {isConnecting && selectedDeviceId === device.id ? (
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
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Connection Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Universal OBD2 Connection Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>This app works with ALL OBD2 adapters:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• ELM327 (all versions and brands: Vgate, Viecar, Konnwei, BAFX, etc.)</li>
                <li>• Professional adapters (Autel, Launch, Foxwell, Topdon)</li>
                <li>• Generic Bluetooth OBD2 interfaces</li>
                <li>• Both paired and unpaired devices are detected</li>
              </ul>
              
              <div className="mt-3">
                <strong>Setup Steps:</strong>
                <ol className="mt-1 space-y-1 text-sm list-decimal list-inside">
                  <li>Connect your OBD2 adapter to the vehicle's diagnostic port</li>
                  <li>Turn on vehicle ignition (engine can remain off)</li>
                  <li>Ensure Bluetooth is enabled on your device</li>
                  <li>Click "Scan for OBD2 Devices" above</li>
                  <li>Select your adapter from the list and connect</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionPanel;
