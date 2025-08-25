
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Wifi, WifiOff, Bluetooth, Search, Loader2 } from 'lucide-react';
import { unifiedBluetoothService } from '@/services/UnifiedBluetoothService';
import { bluetoothConnectionManager, ConnectionState, ConnectionHistory } from '@/services/BluetoothConnectionManager';
import { BluetoothDevice } from '@/services/bluetooth/types';
import { toast } from 'sonner';

interface ConnectionAttempt {
  deviceId: string;
  timestamp: number;
  strategy: string;
  success: boolean;
  error?: string;
}

const ProfessionalConnectionPanel: React.FC = () => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    device: null,
    connectionTime: null,
    lastSeen: null,
    connectionQuality: null
  });
  const [connectionHistory, setConnectionHistory] = useState<ConnectionHistory[]>([]);
  const [connectionAttempts, setConnectionAttempts] = useState<ConnectionAttempt[]>([]);

  useEffect(() => {
    const unsubscribe = bluetoothConnectionManager.subscribe(setConnectionState);
    loadConnectionHistory();
    return unsubscribe;
  }, []);

  const loadConnectionHistory = () => {
    const history = bluetoothConnectionManager.getConnectionHistory();
    setConnectionHistory(history);
  };

  const handleScanDevices = useCallback(async () => {
    setIsScanning(true);
    try {
      const foundDevices = await unifiedBluetoothService.scanForDevices();
      setDevices(foundDevices);
      toast.success(`Found ${foundDevices.length} devices`);
    } catch (error) {
      toast.error('Scan failed');
      console.error('Scan error:', error);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleConnectDevice = async (device: BluetoothDevice) => {
    setIsConnecting(true);
    const attempt: ConnectionAttempt = {
      deviceId: device.address,
      timestamp: Date.now(),
      strategy: 'direct',
      success: false
    };

    try {
      const result = await unifiedBluetoothService.connectToDevice(device);
      if (result.success) {
        bluetoothConnectionManager.setConnected(device);
        attempt.success = true;
        toast.success(`Connected to ${device.name}`);
      } else {
        attempt.error = result.error;
        toast.error(`Connection failed: ${result.error}`);
      }
    } catch (error) {
      attempt.error = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Connection failed');
    } finally {
      setConnectionAttempts(prev => [attempt, ...prev.slice(0, 9)]);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await unifiedBluetoothService.disconnect();
      bluetoothConnectionManager.setDisconnected();
      toast.info('Disconnected');
    } catch (error) {
      toast.error('Disconnect failed');
    }
  };

  const getSignalStrength = (rssi?: number) => {
    if (!rssi) return 50;
    return Math.max(0, Math.min(100, (rssi + 100) * 2));
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bluetooth className="h-5 w-5" />
          Professional Connection Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="devices" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleScanDevices} disabled={isScanning} className="flex-1">
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Scan Devices
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              {devices.map((device) => (
                <Card key={device.address} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{device.name}</h3>
                        <Badge variant={device.isPaired ? "default" : "secondary"}>
                          {device.isPaired ? "Paired" : "Unpaired"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{device.address}</p>
                      {device.rssi && (
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={getSignalStrength(device.rssi)} className="w-16 h-1" />
                          <span className="text-xs text-muted-foreground">{device.rssi}dBm</span>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleConnectDevice(device)}
                      disabled={isConnecting || connectionState.isConnected}
                      size="sm"
                    >
                      {isConnecting ? "Connecting..." : "Connect"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="connection" className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {connectionState.isConnected ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="font-medium">
                    {connectionState.isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <Badge variant={connectionState.isConnected ? "default" : "secondary"}>
                  {connectionState.connectionQuality || 'Unknown'}
                </Badge>
              </div>

              {connectionState.device && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Device:</span>
                    <span>{connectionState.device.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-mono">{connectionState.device.address}</span>
                  </div>
                  {connectionState.connectionTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Connected at:</span>
                      <span>{formatTimestamp(connectionState.connectionTime)}</span>
                    </div>
                  )}
                </div>
              )}

              {connectionState.isConnected && (
                <Button onClick={handleDisconnect} variant="destructive" className="w-full mt-4">
                  Disconnect
                </Button>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Recent Connections</h3>
              {connectionHistory.length > 0 ? (
                connectionHistory.slice(0, 10).map((entry, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{entry.deviceName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(entry.connectionTime)}
                        </p>
                      </div>
                      <Badge variant={entry.success ? "default" : "destructive"}>
                        {entry.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No connection history</p>
              )}
            </div>

            {connectionAttempts.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Recent Attempts</h3>
                {connectionAttempts.map((attempt, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{attempt.deviceId}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(attempt.timestamp)} - {attempt.strategy}
                        </p>
                      </div>
                      <Badge variant={attempt.success ? "default" : "destructive"}>
                        {attempt.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                    {attempt.error && (
                      <p className="text-xs text-red-500 mt-1">{attempt.error}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProfessionalConnectionPanel;
