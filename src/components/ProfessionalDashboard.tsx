import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Car, 
  Wifi, 
  Bluetooth, 
  Usb, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Wrench,
  Database,
  Zap
} from 'lucide-react';
import { VehicleMake } from '@/types/vehicle';
import { ManufacturerGrid } from './ManufacturerGrid';
import { AdvancedDiagnosticsPanel } from './AdvancedDiagnosticsPanel';
import { BiDirectionalControlPanel } from './BiDirectionalControlPanel';
import { LiveDataMonitor } from './LiveDataMonitor';
import { DTCPanel } from './DTCPanel';

interface ConnectionStatus {
  type: 'bluetooth' | 'wifi' | 'usb' | null;
  connected: boolean;
  device?: string;
  protocol?: string;
}

interface VehicleInfo {
  vin?: string;
  make?: string;
  model?: string;
  year?: string;
  engine?: string;
}

export const ProfessionalDashboard: React.FC = () => {
  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    type: null,
    connected: false
  });
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({});
  const [activeTab, setActiveTab] = useState('vehicle-selection');

  const connectionTypes = [
    { type: 'bluetooth' as const, icon: Bluetooth, label: 'Bluetooth OBD2', description: 'ELM327, OBDLink, Veepeak' },
    { type: 'wifi' as const, icon: Wifi, label: 'WiFi Adapter', description: 'ELM327 WiFi, OBDLink WiFi' },
    { type: 'usb' as const, icon: Usb, label: 'USB OTG', description: 'Direct cable connection' }
  ];

  const handleConnection = async (type: 'bluetooth' | 'wifi' | 'usb') => {
    setConnectionStatus({ type, connected: false });
    
    // Simulate connection process
    setTimeout(() => {
      setConnectionStatus({
        type,
        connected: true,
        device: `${type.toUpperCase()} Device`,
        protocol: 'ISO 15765-4 (CAN)'
      });
      
      // Simulate VIN reading
      setTimeout(() => {
        setVehicleInfo({
          vin: 'VF3FC9HXC12345678',
          make: selectedMake?.name || 'Unknown',
          model: 'Test Model',
          year: '2020',
          engine: '1.6 HDi'
        });
      }, 2000);
    }, 3000);
  };

  const isConnected = connectionStatus.connected;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">OBD2 Professional Scanner</h1>
            <p className="text-muted-foreground">Advanced automotive diagnostics & bi-directional control</p>
          </div>
          
          <div className="flex items-center gap-4">
            {connectionStatus.connected && (
              <Badge variant="default" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Connected via {connectionStatus.type?.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="vehicle-selection">Vehicle</TabsTrigger>
            <TabsTrigger value="connection">Connect</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
            <TabsTrigger value="live-data">Live Data</TabsTrigger>
            <TabsTrigger value="bi-directional">Bi-Directional</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Vehicle Selection Tab */}
          <TabsContent value="vehicle-selection" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Select Vehicle Manufacturer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ManufacturerGrid
                  onManufacturerSelect={setSelectedMake}
                  selectedMake={selectedMake}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connection Tab */}
          <TabsContent value="connection" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hardware Connection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {connectionTypes.map(({ type, icon: Icon, label, description }) => (
                      <Card key={type} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-6 text-center space-y-4">
                          <Icon className="h-12 w-12 mx-auto text-primary" />
                          <div>
                            <h3 className="font-semibold">{label}</h3>
                            <p className="text-sm text-muted-foreground">{description}</p>
                          </div>
                          <Button 
                            onClick={() => handleConnection(type)}
                            disabled={connectionStatus.type === type && !connectionStatus.connected}
                            className="w-full"
                          >
                            {connectionStatus.type === type && !connectionStatus.connected 
                              ? 'Connecting...' 
                              : connectionStatus.type === type && connectionStatus.connected
                              ? 'Connected'
                              : 'Connect'
                            }
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Info Card */}
              {isConnected && vehicleInfo.vin && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Vehicle Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium">VIN</p>
                        <p className="text-sm text-muted-foreground">{vehicleInfo.vin}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Make</p>
                        <p className="text-sm text-muted-foreground">{vehicleInfo.make}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Model</p>
                        <p className="text-sm text-muted-foreground">{vehicleInfo.model}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Year</p>
                        <p className="text-sm text-muted-foreground">{vehicleInfo.year}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Diagnostics Tab */}
          <TabsContent value="diagnostics" className="mt-6">
            {isConnected ? (
              <DTCPanel 
                isConnected={isConnected}
                vehicleInfo={vehicleInfo}
              />
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please connect to an OBD2 adapter first to access diagnostic functions.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Live Data Tab */}
          <TabsContent value="live-data" className="mt-6">
            {isConnected ? (
              <LiveDataMonitor 
                isConnected={isConnected}
                vehicleInfo={vehicleInfo}
              />
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please connect to an OBD2 adapter first to view live data.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Bi-Directional Tab */}
          <TabsContent value="bi-directional" className="mt-6">
            {isConnected ? (
              <BiDirectionalControlPanel 
                isConnected={isConnected}
                vehicleMake={selectedMake?.name}
                vehicleModel={vehicleInfo.model}
              />
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please connect to an OBD2 adapter first to access bi-directional controls.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="mt-6">
            {isConnected ? (
              <AdvancedDiagnosticsPanel 
                vehicleMake={selectedMake?.name}
                isConnected={isConnected}
                vehicleInfo={vehicleInfo}
              />
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please connect to an OBD2 adapter first to access advanced functions.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
