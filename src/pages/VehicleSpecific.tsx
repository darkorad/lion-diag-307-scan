import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Car, CheckCircle } from 'lucide-react';
import { VEHICLE_DATABASE } from '@/constants/vehicleDatabase';
import { mobileSafeBluetoothService } from '@/services/MobileSafeBluetoothService';
import WorkingVehicleSpecificDiagnostics from '@/components/WorkingVehicleSpecificDiagnostics';
import BackButton from '@/components/BackButton';
import { VisualVehicleSelector } from '@/components/VisualVehicleSelector';

const VehicleSpecific = () => {
  const { make, model, generation, engine } = useParams();
  const navigate = useNavigate();
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);

  useEffect(() => {
    // If no vehicle parameters, show the vehicle selector
    if (!make || !model || !generation || !engine) {
      console.log('No vehicle parameters found, showing selector');
      setShowVehicleSelector(true);
      return;
    }

    loadVehicleInfo();
    checkConnectionStatus();
    
    const interval = setInterval(checkConnectionStatus, 2000);
    return () => clearInterval(interval);
  }, [make, model, generation, engine]);

  const loadVehicleInfo = () => {
    try {
      const makeData = VEHICLE_DATABASE.find(m => m.id === make);
      if (!makeData) {
        console.error(`Make ${make} not found in database`);
        setShowVehicleSelector(true);
        return;
      }

      const modelData = makeData.models?.find(m => m.id === model);
      if (!modelData) {
        console.error(`Model ${model} not found for make ${make}`);
        setShowVehicleSelector(true);
        return;
      }

      const generationData = modelData.generations?.find(g => g.id === generation);
      if (!generationData) {
        console.error(`Generation ${generation} not found for model ${model}`);
        setShowVehicleSelector(true);
        return;
      }

      const engineData = generationData.engines?.find(e => e.id === engine);
      if (!engineData) {
        console.error(`Engine ${engine} not found for generation ${generation}`);
        setShowVehicleSelector(true);
        return;
      }

      setVehicleInfo({
        manufacturer: makeData.name,
        model: modelData.name,
        year: `${generationData.yearRange.start}-${generationData.yearRange.end}`,
        generation: generationData.name,
        engine: engineData.name,
        displacement: engineData.displacement,
        power: engineData.power,
        fuel: engineData.fuelType,
        makeId: makeData.id,
        modelId: modelData.id,
        generationId: generationData.id,
        engineId: engineData.id
      });
    } catch (error) {
      console.error('Error loading vehicle info:', error);
      setShowVehicleSelector(true);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const status = mobileSafeBluetoothService.getConnectionStatus();
      setIsConnected(status.isConnected);
      setConnectionStatus(status.isConnected ? 'Connected' : 'Not Connected');
    } catch (error) {
      setIsConnected(false);
      setConnectionStatus('Error');
    }
  };

  const handleConnect = async () => {
    try {
      // Create a mock device object for connection
      const mockDevice = {
        id: 'auto-connect',
        address: '',
        name: 'Auto Connect',
        isPaired: false
      };
      
      const success = await mobileSafeBluetoothService.connectToDevice(mockDevice);
      if (success) {
        setIsConnected(true);
        setConnectionStatus('Connected');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionStatus('Connection failed');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleVehicleSelected = (profile: any) => {
    // Navigate to the vehicle-specific page with the selected parameters
    navigate(`/vehicle-specific/${profile.makeId}/${profile.modelId}/${profile.generationId}/${profile.engineId}`);
    setShowVehicleSelector(false);
  };

  // Show vehicle selector if no vehicle is selected or if there was an error loading vehicle info
  if (showVehicleSelector) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <BackButton 
            onBack={handleBack}
            fallbackRoute="/"
            variant="ghost"
            size="sm"
            label="Back to Home"
            showIcon={true}
          />
        </div>
        
        <VisualVehicleSelector 
          onVehicleSelected={handleVehicleSelected}
          selectedProfile={null}
          isConnected={isConnected}
          onCommand={async (command: string) => {
            // Mock command handler for now
            return 'OK';
          }}
        />
      </div>
    );
  }

  if (!vehicleInfo) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <BackButton 
            onBack={handleBack}
            fallbackRoute="/"
            variant="ghost"
            size="sm"
            label="Back to Home"
            showIcon={true}
          />
        </div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Loading vehicle information...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Connection Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Connection Status
            </div>
            {isConnected ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Not Connected</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Status: {connectionStatus}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isConnected 
                  ? 'All diagnostic functions are available'
                  : 'Connect to access real-time diagnostics'
                }
              </p>
            </div>
            {!isConnected && (
              <Button onClick={handleConnect} size="sm">
                Connect OBD2
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Selected Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Make</p>
              <p className="font-semibold">{vehicleInfo.manufacturer}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Model</p>
              <p className="font-semibold">{vehicleInfo.model}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Year</p>
              <p className="font-semibold">{vehicleInfo.year}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Engine</p>
              <p className="font-semibold">{vehicleInfo.engine}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Diagnostics Component */}
      <WorkingVehicleSpecificDiagnostics
        vehicleInfo={vehicleInfo}
        isConnected={isConnected}
        onBack={handleBack}
      />
    </div>
  );
};

export default VehicleSpecific;
