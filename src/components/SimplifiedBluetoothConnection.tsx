import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Search, 
  Bluetooth, 
  BluetoothConnected, 
  BluetoothSearching,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { comprehensiveBluetoothService, BluetoothDevice } from '@/services/ComprehensiveBluetoothService';
import { autoConnectService } from '@/services/AutoConnectService';

interface SimplifiedBluetoothConnectionProps {
  onDeviceConnected?: (device: BluetoothDevice) => void;
}

const SimplifiedBluetoothConnection: React.FC<SimplifiedBluetoothConnectionProps> = ({ onDeviceConnected }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<BluetoothDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Idle');
  const [isConnecting, setIsConnecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const startScan = useCallback(async () => {
    setIsScanning(true);
    setAvailableDevices([]);
    setConnectionStatus('Scanning for devices...');

    try {
      const devices = await comprehensiveBluetoothService.scanForDevices(15000);
      setAvailableDevices(devices);
      setConnectionStatus(`Found ${devices.length} devices`);
    } catch (error) {
      console.error('Bluetooth scan failed:', error);
      setConnectionStatus(`Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error(`Bluetooth scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    if (!isScanning) return;

    const timeoutId = setTimeout(() => {
      if (isScanning) {
        setIsScanning(false);
        setConnectionStatus('Scan stopped due to timeout.');
      }
    }, 20000);

    return () => clearTimeout(timeoutId);
  }, [isScanning]);

  const handleDeviceSelected = async (device: BluetoothDevice) => {
    if (!device) return;

    setSelectedDevice(device);
    setIsConnecting(true);
    setConnectionStatus('Connecting...');

    try {
      console.log(`Attempting to connect to: ${device.name}`);
      
      const result = await comprehensiveBluetoothService.connectToDevice(device);
      
      if (result.success && result.device) {
        // Store successful connection - create a proper StoredDevice object
        const deviceToStore = {
          id: result.device.id,
          address: result.device.address,
          name: result.device.name,
          isPaired: result.device.isPaired || true,
          isConnected: result.device.isConnected || true,
          deviceType: result.device.deviceType || 'OBD2' as const,
          compatibility: 1
        };
        
        autoConnectService.rememberDevice(deviceToStore, result.protocol || 'Bluetooth');

        setConnectionStatus('Connected successfully!');
        toast.success(`Connected to ${result.device.name}`);
        
        if (onDeviceConnected) {
          onDeviceConnected(result.device);
        }
      } else {
        throw new Error(result.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionStatus(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const filteredDevices = availableDevices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bluetooth className="h-5 w-5" />
          Bluetooth Connection
        </CardTitle>
        <CardDescription>
          Connect to your OBD2 device via Bluetooth.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="search">Search for Devices:</Label>
          <Input
            id="search"
            placeholder="Filter device names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {connectionStatus !== 'Idle' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isScanning ? (
                <>
                  <BluetoothSearching className="h-4 w-4 animate-spin" />
                  Scanning for devices...
                </>
              ) : isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : connectionStatus.startsWith('Connected') ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {connectionStatus}
                </>
              ) : connectionStatus.startsWith('Scan failed') || connectionStatus.startsWith('Connection failed') ? (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  {connectionStatus}
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  {connectionStatus}
                </>
              )}
            </div>
          )}

          {filteredDevices.length > 0 ? (
            <ul className="list-none space-y-2">
              {filteredDevices.map((device) => (
                <li key={device.address} className="border rounded-md p-2 hover:bg-secondary cursor-pointer">
                  <button
                    onClick={() => handleDeviceSelected(device)}
                    className="w-full text-left"
                    disabled={isConnecting}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BluetoothConnected className="h-4 w-4 text-blue-500" />
                        <span>{device.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{device.address}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !isScanning && connectionStatus !== 'Idle' && (
              <div className="text-sm text-muted-foreground">No devices found matching the search criteria.</div>
            )
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={startScan} disabled={isScanning || isConnecting} className="w-full">
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
      </CardFooter>
    </Card>
  );
};

export default SimplifiedBluetoothConnection;
