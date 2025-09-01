
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  RefreshCw, 
  Cpu, 
  Hash, 
  Fuel, 
  Shield,
  Info,
  Database,
  ArrowLeft
} from 'lucide-react';
import { diagnosticService, VehicleInfo } from '@/services/DiagnosticService';
import { toast } from 'sonner';

interface VehicleInfoPanelProps {
  isConnected: boolean;
  onBack?: () => void;
}

const VehicleInfoPanel: React.FC<VehicleInfoPanelProps> = ({ isConnected, onBack }) => {
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    vin: 'Not Available',
    ecuName: 'Not Available',
    protocolName: 'Not Available',
    supportedPids: [],
    fuelType: 'Not Available',
    emissionStandard: 'Not Available'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchVehicleInfo();
    }
  }, [isConnected]);

  const fetchVehicleInfo = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      const info = await diagnosticService.getVehicleInfo();
      setVehicleInfo(info);
      toast.success('Vehicle information updated');
    } catch (error) {
      console.error('Failed to fetch vehicle info:', error);
      toast.error('Failed to read vehicle information');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}
      
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-primary" />
              <span>Vehicle Information</span>
            </div>
            <Button
              onClick={fetchVehicleInfo}
              disabled={!isConnected || isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Reading...' : 'Refresh'}
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {!isConnected && (
        <Card className="diagnostic-border">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Car className="h-8 w-8 mx-auto mb-2" />
              <p>Connect to an OBD2 device to read vehicle information</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Vehicle Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="diagnostic-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Hash className="h-5 w-5" />
              <span>Vehicle Identification</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">VIN (Vehicle Identification Number)</p>
              <p className="font-mono text-lg font-semibold">{vehicleInfo.vin}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fuel Type</p>
              <div className="flex items-center space-x-2">
                <Fuel className="h-4 w-4 text-automotive-fuel-level" />
                <p className="font-semibold">{vehicleInfo.fuelType}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Emission Standard</p>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <p className="font-semibold">{vehicleInfo.emissionStandard}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="diagnostic-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cpu className="h-5 w-5" />
              <span>ECU Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">ECU Name</p>
              <p className="font-semibold">{vehicleInfo.ecuName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Communication Protocol</p>
              <p className="font-semibold">{vehicleInfo.protocolName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Supported PIDs</p>
              <Badge variant="outline">
                {vehicleInfo.supportedPids.length} PIDs Available
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supported PIDs */}
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Supported Parameter IDs (PIDs)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vehicleInfo.supportedPids.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                These are the diagnostic parameters that your vehicle's ECU supports:
              </p>
              <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2">
                {vehicleInfo.supportedPids.map((pid, index) => (
                  <Badge key={index} variant="outline" className="font-mono text-xs">
                    {pid}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Database className="h-8 w-8 mx-auto mb-2" />
              <p>No supported PIDs information available</p>
              <p className="text-xs">Connect to vehicle to retrieve supported parameters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Note */}
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              • Vehicle information is read directly from the ECU via OBD2 protocol.
            </p>
            <p>
              • Some information may not be available depending on the vehicle's year and ECU capabilities.
            </p>
            <p>
              • PIDs (Parameter IDs) determine which diagnostic data your vehicle can provide.
            </p>
            <p>
              • Modern vehicles typically support more PIDs than older ones.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleInfoPanel;
