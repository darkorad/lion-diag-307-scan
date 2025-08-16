
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Car, Zap, CheckCircle, ArrowLeft } from 'lucide-react';
import { VehicleProfile, VehicleInfo } from '@/types/vehicle';
import { VisualVehicleSelector } from '@/components/VisualVehicleSelector';
import { VehicleDetectionService } from '@/services/VehicleDetectionService';

interface VehicleSelectorProps {
  isConnected: boolean;
  sendCommand: (command: string) => Promise<string>;
  onVehicleSelected: (profile: VehicleProfile) => void;
  selectedProfile: VehicleProfile | null;
  onBack?: () => void;
}

export function VehicleSelector({ 
  isConnected, 
  sendCommand, 
  onVehicleSelected, 
  selectedProfile,
  onBack
}: VehicleSelectorProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [showVisualSelector, setShowVisualSelector] = useState(false);
  const [detectionService] = useState(() => new VehicleDetectionService(sendCommand));

  const handleAutoDetect = async () => {
    if (!isConnected) return;
    
    setIsDetecting(true);
    
    try {
      const info = await detectionService.detectVehicle();
      setVehicleInfo(info);
      
      if (info.profile) {
        onVehicleSelected(info.profile);
      } else {
        // If auto-detection fails, show visual selector
        setShowVisualSelector(true);
      }
    } catch (error) {
      console.error('Auto-detection failed:', error);
      setShowVisualSelector(true);
    } finally {
      setIsDetecting(false);
    }
  };

  // If visual selector is active, show it
  if (showVisualSelector) {
    return (
      <div className="space-y-6">
        {onBack && (
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowVisualSelector(false)}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Auto Detection
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-2xl font-bold">Vehicle Selection</h1>
          </div>
        )}
        <VisualVehicleSelector 
          onVehicleSelected={onVehicleSelected}
          selectedProfile={selectedProfile}
          isConnected={isConnected}
          onCommand={sendCommand}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      {onBack && (
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-2xl font-bold">Vehicle Selection</h1>
        </div>
      )}
    
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Selection
          </CardTitle>
          <CardDescription>
            Choose how to select your vehicle profile for optimal diagnostic experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Detection Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Auto Detection</h3>
              <Button
                onClick={handleAutoDetect}
                disabled={!isConnected || isDetecting}
                variant="default"
                size="lg"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Auto Detect Vehicle
                  </>
                )}
              </Button>
            </div>

            {!isConnected && (
              <Alert>
                <AlertDescription>
                  Connect to your vehicle first to enable auto-detection
                </AlertDescription>
              </Alert>
            )}

            {vehicleInfo && vehicleInfo.isAutoDetected && vehicleInfo.profile && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div>
                      <strong>Vehicle Detected:</strong> {vehicleInfo.profile.displayName}
                    </div>
                    {vehicleInfo.vin && (
                      <div className="text-sm text-muted-foreground">
                        VIN: {vehicleInfo.vin}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {vehicleInfo && !vehicleInfo.isAutoDetected && (
              <Alert>
                <AlertDescription>
                  Auto-detection failed. Use manual selection below.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Manual Selection Button */}
          <div className="text-center">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Manual Selection</h3>
              <p className="text-muted-foreground">Browse and select from our comprehensive vehicle database</p>
            </div>
            <Button
              onClick={() => setShowVisualSelector(true)}
              variant="outline"
              size="lg"
              className="w-full max-w-md"
            >
              <Car className="h-4 w-4 mr-2" />
              Browse All Vehicles
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Includes Audi, Skoda, Peugeot, Seat, Volkswagen, Toyota, and Renault models
            </p>
          </div>

          {/* Currently Selected Vehicle */}
          {selectedProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Currently Selected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">{selectedProfile.displayName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedProfile.make} {selectedProfile.model} {selectedProfile.year} • {selectedProfile.engine}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{selectedProfile.fuel}</Badge>
                    <Badge variant="outline">
                      {String(selectedProfile.specificParameters.emissionStandard || 'Unknown')}
                    </Badge>
                    {selectedProfile.specificParameters.hasDPF && (
                      <Badge variant="secondary">DPF</Badge>
                    )}
                    {selectedProfile.specificParameters.hasEGR && (
                      <Badge variant="secondary">EGR</Badge>
                    )}
                    {selectedProfile.specificParameters.hasTurbo && (
                      <Badge variant="secondary">Turbo</Badge>
                    )}
                    <Badge variant="outline">
                      {String(selectedProfile.specificParameters.manufacturerProtocol || 'Standard')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
