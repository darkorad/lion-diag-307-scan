import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Bluetooth, 
  Loader2, 
  Signal, 
  Wifi,
  WifiOff,
  Search,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings
} from 'lucide-react';
import { BluetoothDevice, enhancedBluetoothService } from '@/obd2/enhanced-bluetooth-service';
import { obd2Service } from '@/services/OBD2Service';
import { useToast } from '@/hooks/use-toast';
import ProtocolSelector from './ProtocolSelector';

interface EnhancedBluetoothScannerProps {
  onDeviceSelected: (device: BluetoothDevice) => void;
  isConnected: boolean;
}

const EnhancedBluetoothScanner: React.FC<EnhancedBluetoothScannerProps> = ({
  onDeviceSelected,
  isConnected
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [bluetoothEnabled, setBluetoothEnabled] = useState<boolean | null>(null);
  const [showProtocolSelector, setShowProtocolSelector] = useState(false);
  const [currentProtocol, setCurrentProtocol] = useState('0');
  const [elmVersion, setElmVersion] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    checkBluetoothStatus();
    setCurrentProtocol(enhancedBluetoothService.getProtocol());
  }, []);

  const checkBluetoothStatus = async () => {
    try {
      const status = await obd2Service.scanForDevices();
      setBluetoothEnabled(true);
      if (status.length > 0) {
        setDevices(status);
      }
    } catch (error) {
      setBluetoothEnabled(false);
      console.error('Bluetooth check failed:', error);
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setDevices([]);

    try {
      // Simulate progress during scan
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1500);

      const foundDevices = await obd2Service.scanForDevices();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setDevices(foundDevices);
      
      toast({
        title: "Scan Complete",
        description: `Found ${foundDevices.length} OBD2-compatible device(s)`,
      });

      if (foundDevices.length === 0) {
        toast({
          title: "No Devices Found",
          description: "Make sure your ELM327 is in pairing mode and nearby",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Scan failed:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to scan for devices. Check Bluetooth permissions.",
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

    try {
      await obd2Service.connect(device);
      
      // Get ELM version after connection
      const version = enhancedBluetoothService.getElmVersion();
      setElmVersion(version);
      
      onDeviceSelected(device);
      
      toast({
        title: "Connected",
        description: `Successfully connected to ${device.name}`,
      });
    } catch (error) {
      console.error('Connection failed:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to device",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
      setSelectedDeviceId(null);
    }
  };

  const handleProtocolChange = (protocol: string) => {
    enhancedBluetoothService.setProtocol(protocol);
    setCurrentProtocol(protocol);
    
    toast({
      title: "Protocol Updated",
      description: `Protocol set to ${enhancedBluetoothService.getAvailableProtocols()[protocol]}`,
    });
  };

  const getDeviceIcon = (device: BluetoothDevice) => {
    if (device.name.toLowerCase().includes('elm327')) {
      return <Bluetooth className="h-5 w-5 text-blue-500" />;
    }
    return <Bluetooth className="h-5 w-5 text-gray-500" />;
  };

  const getSignalIcon = (device: BluetoothDevice) => {
    if (device.isPaired) {
      return <Signal className="h-4 w-4 text-green-500" />;
    }
    return <Wifi className="h-4 w-4 text-orange-500" />;
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
          <Bluetooth className="h-5 w-5" />
          Enhanced Bluetooth Scanner
        </CardTitle>
        <CardDescription>
          Scan for paired and discoverable OBD2 devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleScan} 
            disabled={isScanning || isConnected}
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
                Scan for Devices
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={checkBluetoothStatus}
            disabled={isScanning}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowProtocolSelector(!showProtocolSelector)}
            disabled={isScanning}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {showProtocolSelector && (
          <ProtocolSelector
            onProtocolSelected={handleProtocolChange}
            currentProtocol={currentProtocol}
            elmVersion={elmVersion}
            isConnected={isConnected}
          />
        )}

        {isScanning && (
          <div className="space-y-2">
            <Progress value={scanProgress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Scanning for OBD2 devices... {scanProgress}%
            </p>
          </div>
        )}

        {devices.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Available Devices ({devices.length})</h4>
            {devices.map((device) => (
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
              </Card>
            ))}
          </div>
        )}

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Connection Tips:</strong>
            <ul className="mt-2 text-sm space-y-1">
              <li>• Ensure your ELM327 is powered on and in range</li>
              <li>• For unpaired devices, put ELM327 in pairing mode</li>
              <li>• Default PIN is usually 1234 or 0000</li>
              <li>• Make sure your vehicle's ignition is on</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default EnhancedBluetoothScanner;