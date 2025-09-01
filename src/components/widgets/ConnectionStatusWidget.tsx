import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bluetooth, CheckCircle, XCircle } from 'lucide-react';
import { unifiedBluetoothService } from '@/services/UnifiedBluetoothService';

const ConnectionStatusWidget = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = () => {
      const status = unifiedBluetoothService.getConnectionStatus();
      setIsConnected(status.isConnected);
      setDeviceName(status.device?.name || null);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bluetooth className="h-5 w-5" />
          Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {isConnected ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Connected</p>
                <p className="text-xs">{deviceName}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <p className="font-semibold">Disconnected</p>
            </div>
          )}
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionStatusWidget;
