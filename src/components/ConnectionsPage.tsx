
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bluetooth, 
  Wifi, 
  Usb, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Settings,
  Smartphone,
  Monitor
} from 'lucide-react';

const ConnectionsPage: React.FC = () => {
  const [bluetoothDevices, setBluetoothDevices] = useState([
    { id: '1', name: 'ELM327 v1.5', address: '00:1D:A5:68:98:8B', connected: false, rssi: -45 },
    { id: '2', name: 'OBD2 Scanner', address: '00:1B:DC:0F:BB:1C', connected: true, rssi: -38 },
    { id: '3', name: 'OBDII Bluetooth', address: '00:15:83:0C:BF:EB', connected: false, rssi: -65 }
  ]);
  
  const [wifiNetworks, setWifiNetworks] = useState([
    { id: '1', ssid: 'ELM327-WiFi', security: 'WPA2', signal: 85, connected: false },
    { id: '2', ssid: 'OBD2-WIFI-01A5', security: 'Open', signal: 72, connected: true },
    { id: '3', ssid: 'VGATE-iCar', security: 'WPA', signal: 45, connected: false }
  ]);

  const [isScanning, setIsScanning] = useState(false);
  const [wifiPassword, setWifiPassword] = useState('');

  const startBluetoothScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Add a new device to simulate scan result
      const newDevice = {
        id: Date.now().toString(),
        name: 'New ELM327',
        address: '00:' + Math.random().toString(16).substr(2, 2).toUpperCase() + ':A5:68:98:8C',
        connected: false,
        rssi: -Math.floor(Math.random() * 50 + 30)
      };
      setBluetoothDevices(prev => [...prev, newDevice]);
    }, 3000);
  };

  const connectBluetooth = (deviceId: string) => {
    setBluetoothDevices(prev => prev.map(device => ({
      ...device,
      connected: device.id === deviceId ? !device.connected : false
    })));
  };

  const connectWifi = (networkId: string) => {
    setWifiNetworks(prev => prev.map(network => ({
      ...network,
      connected: network.id === networkId ? !network.connected : false
    })));
  };

  const getSignalIcon = (rssi: number) => {
    if (rssi > -40) return '📶';
    if (rssi > -60) return '📶';
    return '📶';
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Connection Manager</h1>

      <Tabs defaultValue="bluetooth" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bluetooth" className="flex items-center gap-2">
            <Bluetooth className="h-4 w-4" />
            Bluetooth
          </TabsTrigger>
          <TabsTrigger value="wifi" className="flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            WiFi
          </TabsTrigger>
          <TabsTrigger value="usb" className="flex items-center gap-2">
            <Usb className="h-4 w-4" />
            USB
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bluetooth" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bluetooth className="h-5 w-5" />
                  Bluetooth Devices
                </CardTitle>
                <Button 
                  onClick={startBluetoothScan}
                  disabled={isScanning}
                  size="sm"
                >
                  {isScanning ? (
                    <>
                      <Search className="h-4 w-4 animate-spin mr-2" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Scan
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {bluetoothDevices.map(device => (
                <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {device.connected ? '🔗' : '📱'}
                    </div>
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-sm text-muted-foreground">{device.address}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          RSSI: {device.rssi}dBm
                        </Badge>
                        {device.connected && (
                          <Badge variant="default" className="text-xs">Connected</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => connectBluetooth(device.id)}
                    variant={device.connected ? "destructive" : "default"}
                    size="sm"
                  >
                    {device.connected ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wifi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                WiFi Networks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {wifiNetworks.map(network => (
                <div key={network.id} className="space-y-3 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📶</div>
                      <div>
                        <p className="font-medium">{network.ssid}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {network.security}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Signal: {network.signal}%
                          </Badge>
                          {network.connected && (
                            <Badge variant="default" className="text-xs">Connected</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => connectWifi(network.id)}
                      variant={network.connected ? "destructive" : "default"}
                      size="sm"
                    >
                      {network.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                  
                  {network.security !== 'Open' && !network.connected && (
                    <div className="space-y-2">
                      <Label htmlFor={`password-${network.id}`}>Password</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`password-${network.id}`}
                          type="password"
                          placeholder="Enter WiFi password"
                          value={wifiPassword}
                          onChange={(e) => setWifiPassword(e.target.value)}
                        />
                        <Button size="sm">Connect</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usb" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Usb className="h-5 w-5" />
                USB Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Monitor className="h-4 w-4" />
                <AlertDescription>
                  USB OBD2 adapters are not supported on mobile devices. Please use Bluetooth or WiFi adapters for mobile diagnostics.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 space-y-4">
                <div className="p-4 border rounded-lg opacity-50">
                  <div className="flex items-center gap-3">
                    <Usb className="h-8 w-8" />
                    <div>
                      <p className="font-medium">USB OBD2 Interface</p>
                      <p className="text-sm text-muted-foreground">Connect via desktop application</p>
                      <Badge variant="outline" className="mt-1">Desktop Only</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Connection Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Bluetooth Setup</p>
              <p className="text-sm text-muted-foreground">
                Pair your ELM327 adapter in phone settings first, then connect here
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">WiFi Setup</p>
              <p className="text-sm text-muted-foreground">
                Connect to adapter's WiFi network (usually password: 12345)
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium">Vehicle Requirements</p>
              <p className="text-sm text-muted-foreground">
                Turn ignition ON, engine can be off for most functions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionsPage;
