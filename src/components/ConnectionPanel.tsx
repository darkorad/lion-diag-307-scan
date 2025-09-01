
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BluetoothDevice } from '@/services/bluetooth/types';
import { 
  CheckCircle, 
  AlertCircle,
  Car,
  Wifi,
  Signal,
  Bluetooth,
  Search,
  Loader2,
  RefreshCw,
  Info,
  Battery,
  Zap,
  Shield,
  Clock,
  History,
  Star,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { bluetoothIntegrationService } from '@/services/BluetoothIntegrationService';
import ConnectionStatus from '@/components/ConnectionStatus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ConnectionPanelProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
  connectionStatus: string;
  onStatusChange: (status: string) => void;
  vehicleInfo: any;
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
      <Card className="border-primary/20 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <span>LionDiag Pro Connection Center</span>
              <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Pro
              </Badge>
            </div>
            <ConnectionStatus showDetails={true} onDisconnect={handleDisconnect} />
          </CardTitle>
          <CardDescription>
            Connect to your vehicle's OBD2 port for advanced diagnostics
          </CardDescription>
        </CardHeader>
        {isConnected && (
          <CardContent className="pt-6">
            <div className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
                <span className="font-medium text-green-700 dark:text-green-300">
                  Connected and Ready for Diagnostics
                </span>
                <Badge className="ml-auto bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-6 text-sm mt-3">
                <div className="flex items-center">
                  <Car className="h-4 w-4 text-slate-500 mr-2" />
                  <span className="text-muted-foreground">Vehicle:</span>
                  <span className="ml-2 font-medium">{vehicleInfo.make} {vehicleInfo.model}</span>
                </div>
                <div className="flex items-center">
                  <Zap className="h-4 w-4 text-slate-500 mr-2" />
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
            <Tabs defaultValue="scan" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="scan" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span>Scan for Devices</span>
                </TabsTrigger>
                <TabsTrigger value="recent" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span>Recent Devices</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="scan" className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleScanForDevices}
                    disabled={isScanning || isConnecting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
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
                  <div className="space-y-2 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <Bluetooth className="h-4 w-4 text-blue-500 mr-2 animate-pulse" />
                        Scanning for OBD2 devices...
                      </span>
                      <span className="font-medium">{scanProgress}%</span>
                    </div>
                    <Progress value={scanProgress} className="h-2 bg-blue-100 dark:bg-blue-800" />
                  </div>
                )}

                {availableDevices.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center">
                      <Shield className="h-4 w-4 text-green-500 mr-2" />
                      Found {availableDevices.length} Compatible Device(s)
                    </h4>
                    {availableDevices.map((device) => (
                      <Card key={device.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                              {getDeviceIcon(device)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">
                                {device.name || 'Unknown OBD2 Device'}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-mono">{device.address}</span>
                                {device.rssi && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Signal: {device.rssi}dBm
                                  </Badge>
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
                              className="bg-green-600 hover:bg-green-700"
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
                
                {availableDevices.length === 0 && !isScanning && (
                  <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="flex flex-col gap-2">
                      <span>No OBD2 devices found. Make sure your adapter is:</span>
                      <ul className="list-disc pl-5 text-sm">
                        <li>Powered on (check LED indicators)</li>
                        <li>In pairing mode (may require button press)</li>
                        <li>Within range of your device</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              
              <TabsContent value="recent" className="space-y-4">
                <div className="grid gap-3">
                  {[
                    { name: "ELM327 v1.5", address: "00:1D:A5:68:98:8A", lastConnected: "Today", favorite: true },
                    { name: "VGATE Scan", address: "00:1A:7D:DA:71:13", lastConnected: "Yesterday", favorite: false }
                  ].map((device, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                          <Bluetooth className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center">
                            {device.name}
                            {device.favorite && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 ml-2" />}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Last connected: {device.lastConnected}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleConnectToDevice({ id: device.address, name: device.name, address: device.address })}
                      >
                        Quick Connect
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>Connection Tips</span>
                </div>
                <Badge variant="outline">Pro Feature</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                  <CardContent className="p-3 text-xs">
                    <div className="font-medium mb-1 flex items-center">
                      <Battery className="h-3 w-3 mr-1 text-green-500" />
                      Check Adapter Power
                    </div>
                    <p>Ensure your OBD2 adapter has power (LED on) when plugged into the vehicle port.</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                  <CardContent className="p-3 text-xs">
                    <div className="font-medium mb-1 flex items-center">
                      <Zap className="h-3 w-3 mr-1 text-amber-500" />
                      Vehicle Ignition
                    </div>
                    <p>Turn ignition to position II (ON) without starting the engine for best connection.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
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
