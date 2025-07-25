
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  LightbulbOff, 
  AlertTriangle, 
  Shield, 
  Thermometer, 
  Battery, 
  Fuel, 
  ArrowLeft, 
  ArrowRight, 
  Zap,
  HandMetal
} from 'lucide-react';
import { diagnosticService, LightStatus } from '@/services/DiagnosticService';
import { toast } from 'sonner';

interface LightStatusPanelProps {
  isConnected: boolean;
  onBack?: () => void;
}

const LightStatusPanel: React.FC<LightStatusPanelProps> = ({ isConnected, onBack }) => {
  const [lightStatus, setLightStatus] = useState<LightStatus>({
    mil: false,
    abs: false,
    airbag: false,
    oilPressure: false,
    engineTemp: false,
    battery: false,
    fuelLevel: false,
    turnSignalLeft: false,
    turnSignalRight: false,
    highBeam: false,
    parkingBrake: false
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchLightStatus();
      const interval = setInterval(fetchLightStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const fetchLightStatus = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      const status = await diagnosticService.getLightStatus();
      setLightStatus(status);
    } catch (error) {
      console.error('Failed to fetch light status:', error);
      toast.error('Failed to read light status');
    } finally {
      setIsLoading(false);
    }
  };

  const getLightIcon = (lightType: string, isOn: boolean) => {
    const iconProps = { className: `h-6 w-6 ${isOn ? 'text-red-500' : 'text-gray-400'}` };
    
    switch (lightType) {
      case 'mil':
        return isOn ? <Lightbulb {...iconProps} /> : <LightbulbOff {...iconProps} />;
      case 'abs':
        return <Shield {...iconProps} />;
      case 'airbag':
        return <Shield {...iconProps} />;
      case 'oilPressure':
        return <AlertTriangle {...iconProps} />;
      case 'engineTemp':
        return <Thermometer {...iconProps} />;
      case 'battery':
        return <Battery {...iconProps} />;
      case 'fuelLevel':
        return <Fuel {...iconProps} />;
      case 'turnSignalLeft':
        return <ArrowLeft {...iconProps} />;
      case 'turnSignalRight':
        return <ArrowRight {...iconProps} />;
      case 'highBeam':
        return <Zap {...iconProps} />;
      case 'parkingBrake':
        return <HandMetal {...iconProps} />;
      default:
        return <Lightbulb {...iconProps} />;
    }
  };

  const getLightName = (lightType: string) => {
    const names = {
      mil: 'Check Engine Light (MIL)',
      abs: 'ABS Warning',
      airbag: 'Airbag Warning',
      oilPressure: 'Oil Pressure',
      engineTemp: 'Engine Temperature',
      battery: 'Battery Warning',
      fuelLevel: 'Low Fuel',
      turnSignalLeft: 'Left Turn Signal',
      turnSignalRight: 'Right Turn Signal',
      highBeam: 'High Beam',
      parkingBrake: 'Parking Brake'
    };
    return names[lightType as keyof typeof names] || lightType;
  };

  const getLightStatus = (isOn: boolean) => {
    return isOn ? 'ON' : 'OFF';
  };

  const getStatusColor = (isOn: boolean, lightType: string) => {
    if (!isOn) return 'text-gray-500';
    
    // Critical lights
    if (['mil', 'engineTemp', 'oilPressure', 'battery'].includes(lightType)) {
      return 'text-red-500';
    }
    
    // Warning lights
    if (['abs', 'airbag', 'fuelLevel', 'parkingBrake'].includes(lightType)) {
      return 'text-yellow-500';
    }
    
    // Indicator lights
    return 'text-blue-500';
  };

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
          <h1 className="text-2xl font-bold">Light Status</h1>
        </div>
      )}
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <span>Warning Lights & Indicators</span>
            </div>
            <Button
              onClick={fetchLightStatus}
              disabled={!isConnected || isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? 'Reading...' : 'Refresh'}
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {!isConnected && (
        <Card className="diagnostic-border">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Connect to an OBD2 device to view warning lights status</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(lightStatus).map(([lightType, isOn]) => (
          <Card key={lightType} className="diagnostic-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getLightIcon(lightType, isOn)}
                  <div>
                    <p className="font-medium">{getLightName(lightType)}</p>
                    <p className={`text-sm font-bold ${getStatusColor(isOn, lightType)}`}>
                      {getLightStatus(isOn)}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={isOn ? "destructive" : "secondary"}
                  className="ml-2"
                >
                  {isOn ? "ACTIVE" : "OK"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle>System Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {Object.values(lightStatus).filter(status => status === true).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Warnings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {Object.values(lightStatus).filter(status => status === false).length}
              </p>
              <p className="text-sm text-muted-foreground">Systems OK</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {Object.keys(lightStatus).length}
              </p>
              <p className="text-sm text-muted-foreground">Total Monitored</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LightStatusPanel;
