
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Car, CheckCircle, ArrowLeft } from 'lucide-react';
import { VEHICLE_DATABASE } from '@/constants/vehicleDatabase';

const VehicleSpecific = () => {
  const { make, model, generation, engine } = useParams();
  const navigate = useNavigate();
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVehicleInfo();
  }, [make, model, generation, engine]);

  const loadVehicleInfo = () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading vehicle info for:', { make, model, generation, engine });

      // If no vehicle parameters, show error
      if (!make || !model || !generation || !engine) {
        setError('Vehicle parameters are missing');
        setLoading(false);
        return;
      }

      const makeData = VEHICLE_DATABASE.find(m => m.id === make.toLowerCase());
      console.log('Make data found:', makeData);
      
      if (!makeData) {
        setError(`Make ${make} not found in database`);
        setLoading(false);
        return;
      }

      const modelData = makeData.models?.find(m => m.id === model.toLowerCase());
      console.log('Model data found:', modelData);
      
      if (!modelData) {
        setError(`Model ${model} not found for make ${make}`);
        setLoading(false);
        return;
      }

      const generationData = modelData.generations?.find(g => g.id === generation.toLowerCase());
      console.log('Generation data found:', generationData);
      
      if (!generationData) {
        setError(`Generation ${generation} not found for model ${model}`);
        setLoading(false);
        return;
      }

      const engineData = generationData.engines?.find(e => e.id === engine.toLowerCase());
      console.log('Engine data found:', engineData);
      
      if (!engineData) {
        setError(`Engine ${engine} not found for generation ${generation}`);
        setLoading(false);
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
      setLoading(false);
    } catch (error) {
      console.error('Error loading vehicle info:', error);
      setError('Error loading vehicle information');
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/vehicle-selection');
  };

  const handleConnect = () => {
    // Simulate connection
    setIsConnected(!isConnected);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
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

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Debug info: Make: {make}, Model: {model}, Generation: {generation}, Engine: {engine}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Vehicle Diagnostics</h1>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              OBD2 Connection Status
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
                Status: {isConnected ? 'Connected to OBD2 adapter' : 'No connection detected'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isConnected 
                  ? 'All diagnostic functions are available'
                  : 'Connect OBD2 adapter to access diagnostics'
                }
              </p>
            </div>
            <Button onClick={handleConnect} variant={isConnected ? "outline" : "default"}>
              {isConnected ? 'Disconnect' : 'Connect OBD2'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle>Selected Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Manufacturer</p>
              <p className="font-semibold">{vehicleInfo.manufacturer}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Model</p>
              <p className="font-semibold">{vehicleInfo.model}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Year Range</p>
              <p className="font-semibold">{vehicleInfo.year}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Engine</p>
              <p className="font-semibold">{vehicleInfo.engine}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Generation</p>
              <p className="font-semibold">{vehicleInfo.generation}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Displacement</p>
              <p className="font-semibold">{vehicleInfo.displacement}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Power</p>
              <p className="font-semibold">{vehicleInfo.power}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fuel Type</p>
              <p className="font-semibold">{vehicleInfo.fuel}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostic Functions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Read Diagnostic Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Scan for diagnostic trouble codes (DTCs)
            </p>
            <Button className="w-full" disabled={!isConnected}>
              Scan DTCs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Data Stream</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Monitor real-time engine parameters
            </p>
            <Button className="w-full" disabled={!isConnected}>
              Start Live Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clear Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Clear diagnostic trouble codes
            </p>
            <Button className="w-full" variant="destructive" disabled={!isConnected}>
              Clear DTCs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Readiness Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Check emissions readiness monitors
            </p>
            <Button className="w-full" disabled={!isConnected}>
              Check Readiness
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Freeze Frame Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View freeze frame diagnostic data
            </p>
            <Button className="w-full" disabled={!isConnected}>
              Read Freeze Frame
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Read VIN and vehicle identification
            </p>
            <Button className="w-full" disabled={!isConnected}>
              Read VIN
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Information Panel */}
      {!isConnected && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Connect your OBD2 adapter to access diagnostic functions.</strong>
            <br />
            Make sure your vehicle is running and the OBD2 adapter is properly connected to the diagnostic port.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default VehicleSpecific;
