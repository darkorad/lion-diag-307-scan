
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Car, CheckCircle } from 'lucide-react';
import { VehicleDatabase } from '@/constants/vehicleDatabase';
import { mobileSafeBluetoothService } from '@/services/MobileSafeBluetoothService';
import WorkingVehicleSpecificDiagnostics from '@/components/WorkingVehicleSpecificDiagnostics';
import BackButton from '@/components/BackButton';

const VehicleSpecific = () => {
  const { make, model, generation, engine } = useParams();
  const navigate = useNavigate();
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');

  useEffect(() => {
    loadVehicleInfo();
    checkConnectionStatus();
    
    const interval = setInterval(checkConnectionStatus, 2000);
    return () => clearInterval(interval);
  }, [make, model, generation, engine]);

  const loadVehicleInfo = () => {
    try {
      const makeData = VehicleDatabase.find(m => m.id === make);
      if (!makeData) {
        throw new Error(`Make ${make} not found`);
      }

      const modelData = makeData.models?.find(m => m.id === model);
      if (!modelData) {
        throw new Error(`Model ${model} not found`);
      }

      const generationData = modelData.generations?.find(g => g.id === generation);
      if (!generationData) {
        throw new Error(`Generation ${generation} not found`);
      }

      const engineData = generationData.engines?.find(e => e.id === engine);
      if (!engineData) {
        throw new Error(`Engine ${engine} not found`);
      }

      setVehicleInfo({
        manufacturer: makeData.name,
        model: modelData.name,
        year: generationData.years,
        generation: generationData.name,
        engine: engineData.name,
        displacement: engineData.displacement,
        power: engineData.power,
        fuel: engineData.fuel,
        makeId: makeData.id,
        modelId: modelData.id,
        generationId: generationData.id,
        engineId: engineData.id
      });
    } catch (error) {
      console.error('Error loading vehicle info:', error);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const status = mobileSafeBluetoothService.getConnectionStatus();
      setIsConnected(status.isConnected);
      setConnectionStatus(status.status);
    } catch (error) {
      setIsConnected(false);
      setConnectionStatus('error');
    }
  };

  const handleConnect = async () => {
    try {
      const success = await mobileSafeBluetoothService.connectToDevice();
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
    navigate('/vehicle-selection');
  };

  if (!vehicleInfo) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <BackButton 
            onBack={handleBack}
            fallbackRoute="/vehicle-selection"
            variant="ghost"
            size="sm"
            label="Back to Selection"
            showIcon={true}
          />
        </div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Vehicle information not found. Please go back and select a vehicle.
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
