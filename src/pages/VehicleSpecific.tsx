
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Car, 
  Settings, 
  Wrench, 
  Shield, 
  Radio,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PeugeotAlarmPanel from '@/components/PeugeotAlarmPanel';
import BluetoothDeviceScanner from '@/components/BluetoothDeviceScanner';
import { enhancedBluetoothService } from '@/obd2/enhanced-bluetooth-service';
import { toast } from 'sonner';

const VehicleSpecific: React.FC = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('peugeot307');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = () => {
    const connectionInfo = enhancedBluetoothService.getConnectionInfo();
    setIsConnected(connectionInfo.isConnected);
    if (connectionInfo.isConnected) {
      setConnectedDevice(enhancedBluetoothService.getConnectedDevice());
    }
  };

  const handleSendCommand = async (command: string): Promise<string> => {
    try {
      if (!isConnected) {
        throw new Error('Not connected to OBD2 device');
      }
      
      const response = await enhancedBluetoothService.sendObdCommand(command);
      return response;
    } catch (error) {
      console.error('Command failed:', error);
      toast.error('Command failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    }
  };

  const handleDeviceConnected = (device: any) => {
    setConnectedDevice(device);
    setIsConnected(true);
    toast.success(`Connected to ${device.name}`);
  };

  const handleDisconnect = async () => {
    try {
      await enhancedBluetoothService.disconnect();
      setIsConnected(false);
      setConnectedDevice(null);
      toast.info('Disconnected from device');
    } catch (error) {
      toast.error('Disconnect failed');
    }
  };

  const vehicles = [
    { id: 'peugeot307', name: 'Peugeot 307', logo: '🦁' },
    { id: 'peugeot206', name: 'Peugeot 206', logo: '🦁' },
    { id: 'citroen', name: 'Citroën', logo: '🔰' },
    { id: 'renault', name: 'Renault', logo: '♦️' },
    { id: 'volkswagen', name: 'Volkswagen', logo: '🚗' },
    { id: 'audi', name: 'Audi', logo: '⭕' }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Vehicle Specific Features</h1>
              <p className="text-muted-foreground">Advanced diagnostics for specific vehicle models</p>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-3">
            <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </Badge>
            {isConnected && connectedDevice && (
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connection Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>OBD2 Connection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-300">
                          {connectedDevice?.name || 'OBD2 Device'}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Ready for vehicle diagnostics
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-orange-700 dark:text-orange-300">
                          No Connection
                        </p>
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          Connect to OBD2 device first
                        </p>
                      </div>
                    </div>
                    <BluetoothDeviceScanner onDeviceConnected={handleDeviceConnected} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="vehicle-selection" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="vehicle-selection">Vehicle Selection</TabsTrigger>
                <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="vehicle-selection" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Car className="h-5 w-5" />
                      <span>Select Your Vehicle</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {vehicles.map((vehicle) => (
                        <Button
                          key={vehicle.id}
                          variant={selectedVehicle === vehicle.id ? "default" : "outline"}
                          className="h-20 flex flex-col items-center space-y-2"
                          onClick={() => setSelectedVehicle(vehicle.id)}
                        >
                          <span className="text-2xl">{vehicle.logo}</span>
                          <span className="text-sm">{vehicle.name}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="diagnostics" className="space-y-4">
                {selectedVehicle === 'peugeot307' ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Shield className="h-5 w-5" />
                          <span>Peugeot 307 Factory Alarm</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PeugeotAlarmPanel 
                          isConnected={isConnected}
                          onSendCommand={handleSendCommand}
                        />
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Vehicle Diagnostics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-semibold mb-2">
                          {vehicles.find(v => v.id === selectedVehicle)?.name} Diagnostics
                        </p>
                        <p className="text-muted-foreground">
                          Advanced diagnostics for this vehicle are coming soon
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Radio className="h-5 w-5" />
                      <span>Advanced Functions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-semibold mb-2">Advanced Features</p>
                      <p className="text-muted-foreground">
                        ECU coding, adaptation, and advanced diagnostics coming soon
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleSpecific;
