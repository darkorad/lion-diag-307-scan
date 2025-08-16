
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
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { mobileSafeBluetoothService, BluetoothDevice } from '@/services/MobileSafeBluetoothService';
import { vehicleModulesService } from '@/services/VehicleModulesService';
import BluetoothDeviceScanner from '@/components/BluetoothDeviceScanner';
import PeugeotAlarmPanel from '@/components/PeugeotAlarmPanel';

const VehicleSpecific: React.FC = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('peugeot307');
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializePage = async () => {
      try {
        setIsLoading(true);
        setInitError(null);
        
        console.log('Initializing Vehicle Specific page...');
        
        // Initialize services with proper error handling
        const bluetoothInit = await mobileSafeBluetoothService.initialize();
        const vehicleInit = await vehicleModulesService.initialize();
        
        if (!bluetoothInit) {
          console.warn('Bluetooth service initialization failed');
        }
        
        if (!vehicleInit) {
          console.warn('Vehicle modules service initialization failed');
        }
        
        // Check connection status safely
        if (mounted) {
          await checkConnection();
        }
        
      } catch (error) {
        console.error('Page initialization error:', error);
        if (mounted) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
          setInitError(errorMessage);
          toast.error('Failed to initialize page: ' + errorMessage);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializePage();

    return () => {
      mounted = false;
    };
  }, []);

  const checkConnection = async () => {
    try {
      const status = mobileSafeBluetoothService.getConnectionStatus();
      console.log('Connection status:', status);
      
      setIsConnected(status.isConnected);
      setConnectedDevice(status.device || null);
      
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
      setConnectedDevice(null);
    }
  };

  const handleSendCommand = async (command: string): Promise<string> => {
    try {
      if (!isConnected) {
        throw new Error('Not connected to OBD2 device');
      }
      
      return await mobileSafeBluetoothService.sendCommand(command);
    } catch (error) {
      console.error('Command failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Command failed: ' + errorMessage);
      throw error;
    }
  };

  const handleDeviceConnected = async (device: BluetoothDevice) => {
    try {
      setConnectedDevice(device);
      setIsConnected(true);
      toast.success(`Connected to ${device.name || 'OBD2 Device'}`);
      await checkConnection(); // Refresh status
    } catch (error) {
      console.error('Device connection handling failed:', error);
      toast.error('Failed to handle device connection');
    }
  };

  const handleDisconnect = async () => {
    try {
      await mobileSafeBluetoothService.disconnect();
      setIsConnected(false);
      setConnectedDevice(null);
      toast.info('Disconnected from device');
    } catch (error) {
      console.error('Disconnect failed:', error);
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

  const handleVehicleSelection = (vehicleId: string) => {
    try {
      console.log('Selecting vehicle:', vehicleId);
      setSelectedVehicle(vehicleId);
      toast.success(`Selected ${vehicles.find(v => v.id === vehicleId)?.name}`);
    } catch (error) {
      console.error('Vehicle selection error:', error);
      toast.error('Failed to select vehicle');
    }
  };

  // Error state
  if (initError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Initialization Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Failed to initialize the Vehicle Specific page:
            </p>
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
              {initError}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
              <Button onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Loading Vehicle Specific Features...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Vehicle Specific</h1>
              <p className="text-sm text-muted-foreground">Advanced diagnostics for specific models</p>
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
                          Ready for diagnostics
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
                <TabsTrigger value="vehicle-selection">Vehicles</TabsTrigger>
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
                          className="h-20 flex flex-col items-center space-y-2 text-sm"
                          onClick={() => handleVehicleSelection(vehicle.id)}
                        >
                          <span className="text-2xl">{vehicle.logo}</span>
                          <span className="text-xs text-center">{vehicle.name}</span>
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
