
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bluetooth, 
  Wifi, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import { enhancedBluetoothService as bluetoothService, BluetoothDevice } from '@/obd2/enhanced-bluetooth-service';
import { toast } from 'sonner';

interface BluetoothDevicePickerProps {
  onConnected: (device: BluetoothDevice) => void;
}

const BluetoothDevicePicker: React.FC<BluetoothDevicePickerProps> = ({ onConnected }) => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanForDevices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const foundDevices = await bluetoothService.getPairedDevices();
      setDevices(foundDevices);
      
      if (foundDevices.length === 0) {
        setError('No paired Bluetooth devices found. Please pair your ELM327 adapter first.');
      } else {
        toast.success(`Found ${foundDevices.length} paired devices`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan for devices';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    setConnecting(device.id);
    setError(null);

    try {
      await bluetoothService.connectToDevice(device);
      toast.success(`Connected to ${device.name}`);
      
      // Initialize ELM327
      toast.info('Initializing ELM327...');
      await bluetoothService.initializeELM327CarScannerStyle();
      toast.success('ELM327 ready for diagnostics');
      
      onConnected(device);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setConnecting(null);
    }
  };

  const isELM327Device = (device: BluetoothDevice): boolean => {
    const deviceName = device.name.toLowerCase();
    return deviceName.includes('elm327') || 
           deviceName.includes('obd') || 
           deviceName.includes('obdii') ||
           deviceName.includes('elm');
  };

  useEffect(() => {
    scanForDevices();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bluetooth className="h-5 w-5 text-primary" />
            <span>Bluetooth Device Selection</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Select your ELM327 Bluetooth adapter from the list below
            </p>
            <Button
              onClick={scanForDevices}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Scanning...' : 'Refresh'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-3">
            {devices.length === 0 && !loading && !error && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Smartphone className="h-8 w-8 mx-auto mb-2" />
                    <p>No devices found. Make sure your ELM327 is paired.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {devices.map((device) => (
              <Card key={device.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Bluetooth className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">{device.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {device.address}
                        </p>
                        {isELM327Device(device) && (
                          <Badge variant="secondary" className="mt-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            ELM327 Compatible
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => connectToDevice(device)}
                      disabled={connecting !== null}
                      variant={isELM327Device(device) ? "default" : "outline"}
                    >
                      {connecting === device.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Wifi className="h-4 w-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Setup Instructions:</strong>
              <br />
              1. Make sure your ELM327 adapter is plugged into the vehicle's OBD2 port
              <br />
              2. Pair the ELM327 with your device via Bluetooth settings
              <br />
              3. Return here and select your adapter from the list
              <br />
              4. Turn on ignition (engine can be off for most diagnostics)
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default BluetoothDevicePicker;
