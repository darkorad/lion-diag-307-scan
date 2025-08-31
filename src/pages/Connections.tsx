import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { enhancedAndroidBluetoothService } from '@/services/EnhancedAndroidBluetoothService';
import { BluetoothDevice } from '@/services/bluetooth/types';
import { toast } from 'sonner';
import { Bluetooth, Search, CheckCircle, AlertCircle, Zap, Bug, Wifi, Signal, Settings, Link } from 'lucide-react';
import BluetoothDebugInfo from '@/components/debug/BluetoothDebugInfo';
import { enhancedAndroidBluetoothService } from '@/services/EnhancedAndroidBluetoothService';

const Connections = () => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [connectingToDevice, setConnectingToDevice] = useState<string | null>(null);
  const [pairingDevice, setPairingDevice] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);

  useEffect(() => {
    const service = enhancedAndroidBluetoothService;

    const onDeviceFound = (device: BluetoothDevice) => {
        setDevices(prev => {
            const existing = prev.find(d => d.address === device.address);
            if (existing) {
                return prev.map(d => d.address === device.address ? {...d, ...device} : d);
            }
            return [...prev, device];
        });
    };

    const onScanStarted = () => {
        setDevices([]);
        setIsScanning(true);
    };

    const onScanStopped = () => {
        setIsScanning(false);
    };

    const onConnected = (device: BluetoothDevice) => {
        setConnectedDevice(device);
        setConnectingToDevice(null);
        setDevices(prev => prev.map(d => ({...d, isConnected: d.address === device.address})));
        toast.success(`Connected to ${device.name}`);
    };

    const onDisconnected = () => {
        toast.info('Device disconnected');
        setConnectedDevice(null);
        setConnectingToDevice(null);
        setDevices(prev => prev.map(d => ({...d, isConnected: false})));
    };

    const onPairingStateChanged = (state: { state: string; device: string, address: string, success?: boolean, message?: string }) => {
        if(state.state === 'bonding') {
            setPairingDevice(state.address);
            toast.info(`Pairing with ${state.device}...`);
        } else {
            setPairingDevice(null);
            if (state.success) {
                toast.success(state.message || `Paired with ${state.device}`);
                setDevices(prev => prev.map(d => d.address === state.address ? {...d, isPaired: true} : d));
            } else if (state.state === 'none') {
                toast.error(state.message || `Failed to pair with ${state.device}`);
            }
        }
    };

    service.emitter.on('deviceFound', onDeviceFound);
    service.emitter.on('scanStarted', onScanStarted);
    service.emitter.on('scanStopped', onScanStopped);
    service.emitter.on('connected', onConnected);
    service.emitter.on('disconnected', onDisconnected);
    service.emitter.on('pairingStateChanged', onPairingStateChanged);

    service.initialize().then(() => {
        checkBluetoothStatus();
        service.getPairedDevices().then(pairedDevices => {
            setDevices(pairedDevices);
        });
    });

    return () => {
        service.emitter.off('deviceFound', onDeviceFound);
        service.emitter.off('scanStarted', onScanStarted);
        service.emitter.off('scanStopped', onScanStopped);
        service.emitter.off('connected', onConnected);
        service.emitter.off('disconnected', onDisconnected);
        service.emitter.off('pairingStateChanged', onPairingStateChanged);
    };
  }, []);

  const checkBluetoothStatus = async () => {
    try {
        const status = await enhancedAndroidBluetoothService.checkBluetoothStatus();
        setBluetoothEnabled(status.enabled);
        return status.enabled;
    } catch (error) {
      console.error('Failed to check Bluetooth status:', error);
      return false;
    }
  };

  const enableBluetooth = async () => {
    try {
      await enhancedAndroidBluetoothService.enableBluetooth();
      setBluetoothEnabled(true);
    } catch (error) {
      toast.error('Failed to enable Bluetooth');
    }
  };

  const handleScan = async () => {
    try {
      const isEnabled = await checkBluetoothStatus();
      if (!isEnabled) {
        await enableBluetooth();
      }
      toast.info('Scanning for Bluetooth devices...');
      await enhancedAndroidBluetoothService.scanForDevices();
    } catch (error) {
      toast.error('Scan failed', { description: error instanceof Error ? error.message : 'Could not scan for devices' });
    }
  };

  const handleConnect = async (device: BluetoothDevice) => {
    setConnectingToDevice(device.id);
    toast.info(`Connecting to ${device.name}...`);
    try {
      const result = await enhancedAndroidBluetoothService.connectToDevice(device);
      if (!result.success) {
        throw new Error(result.error || 'Connection failed');
      }
    } catch (error) {
      toast.error(`Failed to connect to ${device.name}`, { description: error instanceof Error ? error.message : 'Unknown connection error' });
      setConnectingToDevice(null);
    }
  };

  const handleDisconnect = async () => {
    if (!connectedDevice) return;
    toast.info(`Disconnecting from ${connectedDevice.name}...`);
    try {
      await enhancedAndroidBluetoothService.disconnect();
    } catch (error) {
      toast.error('Disconnect failed');
    }
  };

  const handlePair = async (device: BluetoothDevice) => {
    setPairingDevice(device.address);
    try {
        await enhancedAndroidBluetoothService.pairDevice(device.address);
    } catch (error) {
        toast.error(`Failed to pair with ${device.name}`, { description: error instanceof Error ? error.message : 'Unknown error' });
        setPairingDevice(null);
    }
  };

  const getDeviceIcon = (device: BluetoothDevice) => {
    if (device.deviceType === 'ELM327') return <Zap className="h-6 w-6 text-green-500" />;
    if (device.deviceType === 'OBD2') return <Settings className="h-6 w-6 text-blue-500" />;
    return <Bluetooth className="h-6 w-6 text-gray-500" />;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Bluetooth Connections</h1>
        <Button onClick={() => setShowDebug(!showDebug)} variant="outline" size="sm">
          <Bug className="h-4 w-4 mr-2" />
          Debug
        </Button>
      </div>

      {showDebug && <div className="mb-6"><BluetoothDebugInfo /></div>}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bluetooth className="h-5 w-5" />
              <span>Bluetooth Status</span>
            </div>
            {!bluetoothEnabled && <Button onClick={enableBluetooth} size="sm">Enable Bluetooth</Button>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`w-3 h-3 rounded-full ${bluetoothEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>{bluetoothEnabled ? 'Bluetooth Enabled' : 'Bluetooth Disabled'}</span>
        </CardContent>
      </Card>

      {connectedDevice && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
              <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                          <p className="font-semibold text-green-900">{connectedDevice.name}</p>
                          <p className="text-sm text-green-700">{connectedDevice.address}</p>
                      </div>
                  </div>
                  <Button onClick={handleDisconnect} variant="outline" size="sm">Disconnect</Button>
              </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader><CardTitle>Device Discovery</CardTitle></CardHeader>
        <CardContent>
          <Button onClick={handleScan} disabled={isScanning} className="w-full h-12">
            {isScanning ? 'Scanning...' : 'Scan for Devices'}
          </Button>
          {isScanning && <Progress value={undefined} className="w-full mt-2" />}
        </CardContent>
      </Card>

      {devices.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Found Devices ({devices.length})</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {devices.sort((a,b) => (b.isPaired ? 1 : -1) - (a.isPaired ? 1 : -1) || (b.rssi || -100) - (a.rssi || -100)).map((device) => (
                <Card key={device.id} className="border-2 hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getDeviceIcon(device)}
                        <div>
                          <h3 className="font-semibold text-lg">{device.name}</h3>
                          <p className="text-sm text-muted-foreground">{device.address}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {device.isPaired && <Badge variant="outline">Paired</Badge>}
                            {device.rssi && <Badge variant="outline"><Signal size={12} className="mr-1"/> {device.rssi}dBm</Badge>}
                            <Badge variant="outline">{device.deviceType}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!device.isPaired && (
                            <Button onClick={() => handlePair(device)} disabled={!!pairingDevice} variant="outline">
                                {pairingDevice === device.address ? 'Pairing...' : <Link size={16} className="mr-2"/>}
                                Pair
                            </Button>
                        )}
                        <Button onClick={() => handleConnect(device)} disabled={!!connectingToDevice || !!connectedDevice}>
                          {connectingToDevice === device.id ? 'Connecting...' : <Wifi size={16} className="mr-2"/>}
                          Connect
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </CardContent>
        </Card>
      )}

      {!isScanning && devices.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Ready to scan</h3>
            <p className="text-muted-foreground mb-4">Click "Scan for Devices" to discover your OBD2 adapter.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Connections;
