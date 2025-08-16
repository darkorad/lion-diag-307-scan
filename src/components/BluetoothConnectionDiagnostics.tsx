import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bluetooth, 
  Loader2, 
  Signal, 
  WifiOff,
  Search,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Info,
  Zap
} from 'lucide-react';
import { BluetoothDevice, enhancedBluetoothService } from '@/obd2/enhanced-bluetooth-service';
import { useToast } from '@/hooks/use-toast';

interface BluetoothConnectionDiagnosticsProps {
  onDeviceSelected: (device: BluetoothDevice) => void;
  isConnected: boolean;
}

const BluetoothConnectionDiagnostics: React.FC<BluetoothConnectionDiagnosticsProps> = ({
  onDeviceSelected,
  isConnected
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [pairedDevices, setPairedDevices] = useState<BluetoothDevice[]>([]);
  const [discoveredDevices, setDiscoveredDevices] = useState<BluetoothDevice[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [bluetoothEnabled, setBluetoothEnabled] = useState<boolean | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string[]>([]);
  const [connectionAttempts, setConnectionAttempts] = useState<Map<string, number>>(new Map());
  const { toast } = useToast();

  useEffect(() => {
    checkBluetoothStatus();
  }, []);

  const addDiagnosticInfo = (message: string) => {
    setDiagnosticInfo(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkBluetoothStatus = async () => {
    addDiagnosticInfo('Checking Bluetooth status...');
    try {
      const status = await enhancedBluetoothService.checkBluetoothStatus();
      setBluetoothEnabled(status);
      if (status) {
        addDiagnosticInfo('Bluetooth is enabled and available');
        await loadPairedDevices();
      } else {
        addDiagnosticInfo('Bluetooth is not enabled or available');
      }
    } catch (error) {
      setBluetoothEnabled(false);
      addDiagnosticInfo(`Bluetooth check failed: ${error}`);
      console.error('Bluetooth check failed:', error);
    }
  };

  const loadPairedDevices = async () => {
    try {
      addDiagnosticInfo('Loading paired devices...');
      const devices = await enhancedBluetoothService.getPairedDevices();
      setPairedDevices(devices);
      addDiagnosticInfo(`Found ${devices.length} paired OBD2 devices`);
    } catch (error) {
      addDiagnosticInfo(`Failed to load paired devices: ${error}`);
      console.error('Failed to load paired devices:', error);
    }
  };

  const handleDiscoverDevices = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setDiscoveredDevices([]);
    addDiagnosticInfo('Starting device discovery...');

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

      const devices = await enhancedBluetoothService.discoverDevices();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setDiscoveredDevices(devices);
      addDiagnosticInfo(`Discovery completed: ${devices.length} unpaired OBD2 devices found`);
      
      toast({
        title: "Discovery Complete",
        description: `Found ${devices.length} unpaired OBD2 device(s)`,
      });

      if (devices.length === 0) {
        addDiagnosticInfo('No devices found - ensure ELM327 is in pairing mode');
        toast({
          title: "No Devices Found",
          description: "Make sure your ELM327 is in pairing mode and nearby",
          variant: "destructive"
        });
      }
    } catch (error) {
      addDiagnosticInfo(`Discovery failed: ${error}`);
      console.error('Discovery failed:', error);
      toast({
        title: "Discovery Failed",
        description: "Failed to discover devices. Check Bluetooth permissions.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanProgress(0), 2000);
    }
  };

  const handleConnect = async (device: BluetoothDevice) => {
    setIsConnecting(true);
    setSelectedDeviceId(device.id);
    
    const currentAttempts = connectionAttempts.get(device.address) || 0;
    setConnectionAttempts(prev => new Map(prev.set(device.address, currentAttempts + 1)));

    addDiagnosticInfo(`Attempting to connect to ${device.name} (${device.address}), attempt ${currentAttempts + 1}`);

    try {
      await enhancedBluetoothService.connectToDevice(device);
      
      addDiagnosticInfo(`Successfully connected to ${device.name}`);
      addDiagnosticInfo(`ELM327 version: ${enhancedBluetoothService.getElmVersion()}`);
      
      // Reset connection attempts on success
      setConnectionAttempts(prev => {
        const newMap = new Map(prev);
        newMap.delete(device.address);
        return newMap;
      });
      
      onDeviceSelected(device);
      
      toast({
        title: "Connected",
        description: `Successfully connected to ${device.name}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      addDiagnosticInfo(`Connection failed: ${errorMessage}`);
      console.error('Connection failed:', error);
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
      setSelectedDeviceId(null);
    }
  };

  const resetConnectionAttempts = (deviceAddress: string) => {
    enhancedBluetoothService.resetConnectionAttempts(deviceAddress);
    setConnectionAttempts(prev => {
      const newMap = new Map(prev);
      newMap.delete(deviceAddress);
      return newMap;
    });
    addDiagnosticInfo(`Reset connection attempts for device ${deviceAddress}`);
  };

  const getDeviceIcon = (device: BluetoothDevice) => {
    const name = device.name.toLowerCase();
    if (name.includes('elm327') || name.includes('obd')) {
      return <Bluetooth className="h-5 w-5 text-blue-500" />;
    }
    return <Bluetooth className="h-5 w-5 text-gray-500" />;
  };

  const getSignalIcon = (device: BluetoothDevice) => {
    if (device.isPaired) {
      return <Signal className="h-4 w-4 text-green-500" />;
    }
    return <Search className="h-4 w-4 text-orange-500" />;
  };

  const renderDeviceCard = (device: BluetoothDevice) => {
    const attempts = connectionAttempts.get(device.address) || 0;
    
    return (
      <Card key={device.id} className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getDeviceIcon(device)}
            <div className="flex-1">
              <p className="font-medium">
                {device.name || 'Unknown OBD2 Device'}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{device.address}</span>
                {device.rssi && (
                  <span>Signal: {device.rssi}dBm</span>
                )}
                {attempts > 0 && (
                  <span className="text-orange-500">Attempts: {attempts}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {getSignalIcon(device)}
              <Badge variant={device.isPaired ? "default" : "secondary"}>
                {device.isPaired ? "Paired" : "Discoverable"}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-1">
              {attempts > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resetConnectionAttempts(device.address)}
                  disabled={isConnecting}
                >
                  Reset
                </Button>
              )}
              
              <Button
                onClick={() => handleConnect(device)}
                disabled={isConnecting || isConnected}
                size="sm"
              >
                {isConnecting && selectedDeviceId === device.id ? (
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
                  'Connect'
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (bluetoothEnabled === false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WifiOff className="h-5 w-5" />
            Bluetooth Not Available
          </CardTitle>
          <CardDescription>
            Bluetooth is not enabled or available on this device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please enable Bluetooth in your device settings and try again.
            </AlertDescription>
          </Alert>
          <Button onClick={checkBluetoothStatus} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Check Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Advanced Bluetooth Diagnostics
        </CardTitle>
        <CardDescription>
          Professional-grade ELM327 connection with detailed diagnostics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="devices" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="discovery">Discovery</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="devices" className="space-y-4">
            <div className="flex items-center gap-2">
              <Button 
                onClick={loadPairedDevices}
                disabled={isScanning || isConnected}
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Paired
              </Button>
              <Button 
                onClick={handleDiscoverDevices}
                disabled={isScanning || isConnected}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Discovering...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Discover New
                  </>
                )}
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

            {pairedDevices.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Paired Devices ({pairedDevices.length})</h4>
                {pairedDevices.map(renderDeviceCard)}
              </div>
            )}

            {discoveredDevices.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Discovered Devices ({discoveredDevices.length})</h4>
                {discoveredDevices.map(renderDeviceCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discovery" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Discovery Tips:</strong>
                <ul className="mt-2 text-sm space-y-1">
                  <li>• Put your ELM327 in pairing mode (usually by powering on)</li>
                  <li>• Ensure device is within 10 meters of your phone</li>
                  <li>• Discovery takes up to 20 seconds</li>
                  <li>• Some devices only appear when not paired</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleDiscoverDevices}
              disabled={isScanning || isConnected}
              className="w-full"
            >
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Discovering Devices...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Start Advanced Discovery
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="diagnostics" className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Connection Diagnostic Log</h4>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {diagnosticInfo.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No diagnostic information yet</p>
                ) : (
                  diagnosticInfo.map((info, index) => (
                    <p key={index} className="text-xs font-mono">{info}</p>
                  ))
                )}
              </div>
            </div>
            
            <Button 
              onClick={() => setDiagnosticInfo([])}
              variant="outline"
              size="sm"
            >
              Clear Log
            </Button>
          </TabsContent>
        </Tabs>

        <Alert className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Professional Connection Tips:</strong>
            <ul className="mt-2 text-sm space-y-1">
              <li>• Ensure vehicle ignition is ON (engine doesn't need to run)</li>
              <li>• ELM327 default PIN is usually 1234 or 0000</li>
              <li>• Try connecting as "insecure" first (most common)</li>
              <li>• Reset connection attempts if device becomes unresponsive</li>
              <li>• Check adapter compatibility with your vehicle year</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default BluetoothConnectionDiagnostics;