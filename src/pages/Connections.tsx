import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { unifiedBluetoothService } from '@/services/UnifiedBluetoothService';
import { BluetoothDevice } from '@/services/MasterBluetoothService';
import { toast } from 'sonner';

const Connections = () => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    toast.info('Scanning for devices...');
    try {
      const foundDevices = await unifiedBluetoothService.scanForDevices();
      setDevices(foundDevices);
      toast.success(`Found ${foundDevices.length} devices.`);
    } catch (error) {
      toast.error('Failed to scan for devices.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Connections</h1>
      <Card>
        <CardHeader>
          <CardTitle>Bluetooth Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleScan} disabled={isScanning}>
            {isScanning ? 'Scanning...' : 'Scan for Devices'}
          </Button>
          <div className="mt-4 space-y-2">
            {devices.map((device) => (
              <div key={device.id} className="p-2 border rounded-md">
                <p className="font-semibold">{device.name}</p>
                <p className="text-sm text-muted-foreground">{device.address}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Connections;
