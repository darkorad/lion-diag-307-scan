
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bluetooth, 
  Search, 
  Settings,
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Shield,
  Zap,
  Signal,
  Clock,
  Wifi,
  Car,
  Info,
  AlertTriangle,
  History
} from 'lucide-react';
import { masterBluetoothService, BluetoothDevice, ConnectionResult } from '@/services/MasterBluetoothService';
import { toast } from 'sonner';

interface ProfessionalConnectionPanelProps {
  onDeviceConnected: (device: BluetoothDevice) => void;
  isConnected: boolean;
  currentDevice?: BluetoothDevice | null;
}

const ProfessionalConnectionPanel: React.FC<ProfessionalConnectionPanelProps> = ({
  onDeviceConnected,
  isConnected,
  currentDevice
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [connectionHistory, setConnectionHistory] = useState<any[]>([]);
  const [connectionResult, setConnectionResult] = useState<ConnectionResult | null>(null);

  useEffect(() => {
    checkCurrentConnection();
    loadConnectionHistory();
  }, []);

  const checkCurrentConnection = () => {
    const status = masterBluetoothService.getConnectionStatus();
    if (status.isConnected && status.device) {
      onDeviceConnected(status.device);
    }
  };

  const loadConnectionHistory = () => {
    const history = masterBluetoothService.getConnectionHistory();
    setConnectionHistory(history);
  };

  const handleScanDevices = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setDevices([]);

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

      // Discover devices
      const foundDevices = await masterBluetoothService.discoverAllDevices();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      setDevices(foundDevices);

      toast.success(`Found ${foundDevices.length} OBD2 device(s)`, {
        description: foundDevices.length > 0 ? 'Devices ranked by compatibility' : 'Make sure your adapter is powered on'
      });

    } catch (error) {
      console.error('Scan failed:', error);
      toast.error('Device scan failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanProgress(0), 3000);
    }
  };

  const handleConnectDevice = async (device: BluetoothDevice) => {
    setIsConnecting(true);
    setSelectedDevice(device);
    setConnectionResult(null);

    try {
      // Reset problematic device history if needed
      if (masterBluetoothService.isDeviceProblematic(device.address)) {
        masterBluetoothService.resetDeviceHistory(device.address);
        toast.info('Resetting connection history for better compatibility');
      }

      const result = await masterBluetoothService.connectToDevice(device);
      setConnectionResult(result);
      
      if (result.success) {
        onDeviceConnected(device);
        toast.success(`Connected to ${device.name}`, {
          description: `Strategy: ${result.strategy} (${result.connectionTime}ms)`
        });
        loadConnectionHistory();
      } else {
        toast.error('Connection failed', {
          description: result.error
        });
      }

    } catch (error) {
      console.error('Connection failed:', error);
      toast.error('Connection error', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsConnecting(false);
      setSelectedDevice(null);
    }
  };

  const handleDisconnect = async () => {
    try {
      await masterBluetoothService.disconnect();
      toast.info('Disconnected from OBD2 device');
      // Reset connection state handled by parent component
    } catch (error) {
      console.error('Disconnect failed:', error);
      toast.error('Failed to disconnect properly');
    }
  };

  const getDeviceIcon = (device: BluetoothDevice) => {
    const quality = device.connectionQuality;
    const iconColor = quality === 'excellent' ? 'text-green-500' : 
                     quality === 'good' ? 'text-blue-500' : 
                     quality === 'fair' ? 'text-yellow-500' : 'text-gray-500';
    
    return <Bluetooth className={`h-5 w-5 ${iconColor}`} />;
  };

  const getQualityBadge = (quality?: string) => {
    const variant = quality === 'excellent' ? 'default' : 
                   quality === 'good' ? 'secondary' : 
                   quality === 'fair' ? 'outline' : 'destructive';
    
    return (
      <Badge variant={variant as any} className="text-xs">
        {quality || 'Unknown'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Professional Connection Status */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-primary" />
              <span>Professional OBD2 Connection</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected && currentDevice ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-300">
                      {currentDevice.name || 'OBD2 Device'}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {currentDevice.address} • Active Connection
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getQualityBadge(currentDevice.connectionQuality)}
                  <Button onClick={handleDisconnect} variant="outline" size="sm">
                    <Wifi className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
              </div>
              
              {connectionResult && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Strategy:</span>
                    <span className="font-medium">{connectionResult.strategy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{connectionResult.connectionTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quality:</span>
                    {getQualityBadge(currentDevice.connectionQuality)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline" className="text-xs">
                      <Signal className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">No Device Connected</p>
              <p className="text-muted-foreground">Scan for OBD2 adapters to begin diagnostics</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Connection Interface */}
      <Tabs defaultValue="scan" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scan">Device Scanner</TabsTrigger>
          <TabsTrigger value="history">Connection History</TabsTrigger>
          <TabsTrigger value="troubleshoot">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Professional OBD2 Scanner</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleScanDevices}
                  disabled={isScanning || isConnected}
                  className="flex-1"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Scanning for Devices...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Find All OBD2 Devices
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

              {devices.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Found Devices ({devices.length})</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {devices.map((device) => {
                      const isProblematic = masterBluetoothService.isDeviceProblematic(device.address);
                      
                      return (
                        <Card key={device.address} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getDeviceIcon(device)}
                              <div className="flex-1">
                                <p className="font-medium">
                                  {device.name || 'Unknown OBD2 Device'}
                                </p>
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <span className="font-mono">{device.address}</span>
                                  {device.rssi && (
                                    <span>Signal: {device.rssi}dBm</span>
                                  )}
                                  <span>Score: {device.compatibilityScore || 0}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="flex flex-col items-end space-y-1">
                                <div className="flex items-center space-x-1">
                                  <Badge variant={device.isPaired ? "default" : "secondary"} className="text-xs">
                                    {device.isPaired ? "Paired" : "Available"}
                                  </Badge>
                                  {getQualityBadge(device.connectionQuality)}
                                </div>
                                {isProblematic && (
                                  <Badge variant="destructive" className="text-xs">
                                    Connection Issues
                                  </Badge>
                                )}
                              </div>
                              
                              <Button
                                onClick={() => handleConnectDevice(device)}
                                disabled={isConnecting || isConnected}
                                size="sm"
                              >
                                {isConnecting && selectedDevice?.address === device.address ? (
                                  <>
                                    <Zap className="mr-1 h-3 w-3 animate-pulse" />
                                    Connecting...
                                  </>
                                ) : isConnected ? (
                                  'Connected'
                                ) : (
                                  'Connect'
                                )}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Connection History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {connectionHistory.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {connectionHistory.slice(-10).reverse().map((attempt, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        {attempt.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{attempt.deviceId}</p>
                          <p className="text-xs text-muted-foreground">
                            {attempt.strategy} • {new Date(attempt.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={attempt.success ? "default" : "destructive"} className="text-xs">
                        {attempt.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No connection history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshoot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Professional Troubleshooting</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Professional OBD2 Connection System</strong>
                  <ul className="mt-2 text-sm space-y-1">
                    <li>• Smart device ranking by compatibility score</li>
                    <li>• Multiple connection strategies (Quick, Secure, Extended, Auto)</li>
                    <li>• Support for all major brands (ELM327, Vgate, Konnwei, Autel, etc.)</li>
                    <li>• Automatic protocol detection and initialization</li>
                    <li>• Connection quality assessment and monitoring</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Quick Setup Guide:</strong>
                  <ol className="mt-2 text-sm space-y-1">
                    <li>1. Connect OBD2 adapter to vehicle's diagnostic port</li>
                    <li>2. Turn on vehicle ignition (engine can stay off)</li>
                    <li>3. Grant Bluetooth and Location permissions</li>
                    <li>4. Tap "Find All OBD2 Devices" to scan</li>
                    <li>5. Select highest-rated device and connect</li>
                    <li>6. System automatically initializes ELM327 protocol</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Common Issues & Solutions:</strong>
                  <ul className="mt-2 text-sm space-y-1">
                    <li>• No devices found: Ensure adapter is powered and in pairing mode</li>
                    <li>• Connection fails: Try different strategy or reset adapter</li>
                    <li>• Poor quality: Check distance and interference</li>
                    <li>• Vehicle comm fails: Verify ignition on and OBD2 port connection</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfessionalConnectionPanel;
