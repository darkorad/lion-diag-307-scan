import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Bluetooth, 
  Wifi, 
  Search, 
  Settings,
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Zap
} from 'lucide-react';
import { BluetoothDevice } from '@/services/bluetooth/types';
import { unifiedBluetoothService } from '@/services/UnifiedBluetoothService';
import { toast } from 'sonner';

interface ProfessionalConnectionPanelProps {
  onDeviceConnected: (device: BluetoothDevice) => void;
  isConnected: boolean;
  currentDevice: BluetoothDevice | null;
}

interface ConnectionHistory {
  deviceName: string;
  deviceAddress: string;
  lastConnected: Date;
  connectionCount: number;
}

const ProfessionalConnectionPanel: React.FC<ProfessionalConnectionPanelProps> = ({
  onDeviceConnected,
  isConnected,
  currentDevice
}) => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [connectionHistory, setConnectionHistory] = useState<ConnectionHistory[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState('AUTO');
  const [advancedSettings, setAdvancedSettings] = useState({
    timeout: 5000,
    retries: 3,
    baudRate: 38400
  });

  useEffect(() => {
    loadConnectionHistory();
  }, []);

  const loadConnectionHistory = () => {
    try {
      const saved = localStorage.getItem('obd2_connection_history');
      if (saved) {
        const history = JSON.parse(saved);
        setConnectionHistory(history);
      }
    } catch (error) {
      console.error('Failed to load connection history:', error);
    }
  };

  const saveConnectionHistory = (device: BluetoothDevice) => {
    try {
      const existing = connectionHistory.find(h => h.deviceAddress === device.address);
      let updatedHistory;
      
      if (existing) {
        updatedHistory = connectionHistory.map(h => 
          h.deviceAddress === device.address 
            ? { ...h, lastConnected: new Date(), connectionCount: h.connectionCount + 1 }
            : h
        );
      } else {
        const newEntry: ConnectionHistory = {
          deviceName: device.name,
          deviceAddress: device.address,
          lastConnected: new Date(),
          connectionCount: 1
        };
        updatedHistory = [...connectionHistory, newEntry];
      }
      
      setConnectionHistory(updatedHistory);
      localStorage.setItem('obd2_connection_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save connection history:', error);
    }
  };

  const handleAdvancedScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setDevices([]);

    try {
      console.log('Starting professional device scan...');
      
      // Progressive scan with detailed feedback
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 800);

      const foundDevices = await unifiedBluetoothService.scanForDevices();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      console.log(`Professional scan found ${foundDevices.length} devices:`, foundDevices);
      setDevices(foundDevices);
      
      if (foundDevices.length > 0) {
        toast.success(`Found ${foundDevices.length} OBD2 device(s)`, {
          description: 'Professional scan completed successfully'
        });
      } else {
        toast.info('No OBD2 devices found', {
          description: 'Try moving closer to your adapter or check pairing'
        });
      }

    } catch (error) {
      console.error('Professional scan failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Professional scan failed', {
        description: errorMessage
      });
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanProgress(0), 3000);
    }
  };

  const handleProfessionalConnect = async (device: BluetoothDevice) => {
    try {
      console.log(`Professional connect to ${device.name} with protocol: ${selectedProtocol}`);
      
      toast.info(`Connecting to ${device.name}...`, {
        description: `Using ${selectedProtocol} protocol`
      });

      const result = await unifiedBluetoothService.connectToDevice(device);
      
      if (result.success && result.device) {
        onDeviceConnected(result.device);
        saveConnectionHistory(result.device);
        
        toast.success(`Connected to ${device.name}`, {
          description: 'Professional connection established'
        });
      } else {
        throw new Error(result.error || 'Connection failed');
      }

    } catch (error) {
      console.error('Professional connection failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      toast.error('Professional connection failed', {
        description: errorMessage
      });
    }
  };

  const handleQuickConnect = async () => {
    if (connectionHistory.length === 0) {
      toast.info('No connection history available', {
        description: 'Please scan and connect to a device first'
      });
      return;
    }

    const lastDevice = connectionHistory[0];
    try {
      toast.info(`Quick connecting to ${lastDevice.deviceName}...`);
      
      const device: BluetoothDevice = {
        id: lastDevice.deviceAddress,
        name: lastDevice.deviceName,
        address: lastDevice.deviceAddress,
        isPaired: true,
        isConnected: false,
        deviceType: 'ELM327',
        compatibility: 0.8
      };
      
      const result = await unifiedBluetoothService.connectToDevice(device);
      
      if (result.success && result.device) {
        onDeviceConnected(result.device);
        saveConnectionHistory(result.device);
        
        toast.success(`Quick connected to ${lastDevice.deviceName}`);
      } else {
        throw new Error(result.error || 'Quick connection failed');
      }

    } catch (error) {
      console.error('Quick connect failed:', error);
      toast.error('Quick connect failed', {
        description: 'Please try a manual connection'
      });
    }
  };

  const getDeviceTypeIcon = (device: BluetoothDevice) => {
    if (device.name.toLowerCase().includes('elm') || device.name.toLowerCase().includes('obd')) {
      return <Zap className="h-5 w-5 text-blue-500" />;
    }
    return <Bluetooth className="h-5 w-5 text-gray-500" />;
  };

  const getDeviceCompatibilityScore = (device: BluetoothDevice): number => {
    let score = 0;
    
    // Name-based scoring
    if (device.name.toLowerCase().includes('elm327')) score += 40;
    if (device.name.toLowerCase().includes('obd')) score += 30;
    if (device.name.toLowerCase().includes('obdii')) score += 30;
    if (device.name.toLowerCase().includes('bluetooth')) score += 10;
    
    // Pairing status
    if (device.isPaired) score += 20;
    
    return Math.min(score, 100);
  };

  return (
    <div className="space-y-6">
      {/* Current Connection Status */}
      {isConnected && currentDevice && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">{currentDevice.name}</p>
                  <p className="text-sm text-green-700">{currentDevice.address}</p>
                </div>
              </div>
              <Badge className="bg-green-500 text-white">Connected</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Professional Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleAdvancedScan}
              disabled={isScanning}
              className="h-12"
              variant="outline"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Advanced Scan
                </>
              )}
            </Button>
            
            <Button
              onClick={handleQuickConnect}
              disabled={connectionHistory.length === 0 || isConnected}
              className="h-12"
              variant="default"
            >
              <Zap className="mr-2 h-4 w-4" />
              Quick Connect
            </Button>
          </div>

          {isScanning && (
            <div className="space-y-2">
              <Progress value={scanProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                Professional scan in progress... {scanProgress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Protocol Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Protocol Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['AUTO', 'ISO9141', 'ISO14230', 'ISO15765'].map((protocol) => (
              <Button
                key={protocol}
                onClick={() => setSelectedProtocol(protocol)}
                variant={selectedProtocol === protocol ? "default" : "outline"}
                size="sm"
              >
                {protocol}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Device Results */}
      {devices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Discovered Devices ({devices.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {devices.map((device) => (
              <Card key={device.id || device.address} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getDeviceTypeIcon(device)}
                      <div>
                        <p className="font-semibold">{device.name}</p>
                        <p className="text-sm text-muted-foreground">{device.address}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {device.isPaired && (
                            <Badge variant="outline" className="text-xs">Paired</Badge>
                          )}
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              getDeviceCompatibilityScore(device) > 70 ? 'border-green-300 text-green-700' : 
                              getDeviceCompatibilityScore(device) > 40 ? 'border-yellow-300 text-yellow-700' : 
                              'border-red-300 text-red-700'
                            }`}
                          >
                            {getDeviceCompatibilityScore(device)}% Compatible
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleProfessionalConnect(device)}
                      disabled={isConnected}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Connection History */}
      {connectionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connection History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {connectionHistory.slice(0, 3).map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{entry.deviceName}</p>
                  <p className="text-sm text-muted-foreground">{entry.deviceAddress}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Connected {entry.connectionCount} times</p>
                  <p className="text-xs text-muted-foreground">
                    Last: {entry.lastConnected.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Professional Tips */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Professional Tips:</strong>
          <ul className="mt-2 text-sm space-y-1">
            <li>• Advanced scan provides detailed device analysis</li>
            <li>• Protocol selection optimizes connection reliability</li>
            <li>• Quick connect uses your most recent successful device</li>
            <li>• Connection history helps identify reliable adapters</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ProfessionalConnectionPanel;
