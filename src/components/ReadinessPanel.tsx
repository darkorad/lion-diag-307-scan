
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Shield, 
  Fuel, 
  Wind, 
  Zap, 
  Thermometer,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { diagnosticService, ReadinessStatus } from '@/services/DiagnosticService';
import { toast } from 'sonner';

interface ReadinessPanelProps {
  isConnected: boolean;
  onBack?: () => void;
}

const ReadinessPanel: React.FC<ReadinessPanelProps> = ({ isConnected, onBack }) => {
  const [readinessStatus, setReadinessStatus] = useState<ReadinessStatus>({
    misfire: false,
    fuelSystem: false,
    components: false,
    catalyst: false,
    heatedCatalyst: false,
    evaporativeSystem: false,
    secondaryAirSystem: false,
    acRefrigerant: false,
    oxygenSensor: false,
    oxygenSensorHeater: false,
    egr: false,
    dpf: false
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      fetchReadinessStatus();
    }
  }, [isConnected]);

  const fetchReadinessStatus = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      const status = await diagnosticService.getReadinessStatus();
      setReadinessStatus(status);
      toast.success('Readiness status updated');
    } catch (error) {
      console.error('Failed to fetch readiness status:', error);
      toast.error('Failed to read system readiness');
    } finally {
      setIsLoading(false);
    }
  };

  const getSystemIcon = (system: string) => {
    const iconProps = { className: 'h-5 w-5' };
    
    switch (system) {
      case 'misfire':
        return <Activity {...iconProps} />;
      case 'fuelSystem':
        return <Fuel {...iconProps} />;
      case 'catalyst':
      case 'heatedCatalyst':
        return <Thermometer {...iconProps} />;
      case 'evaporativeSystem':
        return <Wind {...iconProps} />;
      case 'oxygenSensor':
      case 'oxygenSensorHeater':
        return <Zap {...iconProps} />;
      case 'egr':
        return <Wind {...iconProps} />;
      case 'dpf':
        return <Shield {...iconProps} />;
      default:
        return <Shield {...iconProps} />;
    }
  };

  const getSystemName = (system: string) => {
    const names = {
      misfire: 'Misfire Monitor',
      fuelSystem: 'Fuel System Monitor',
      components: 'Comprehensive Components',
      catalyst: 'Catalyst Monitor',
      heatedCatalyst: 'Heated Catalyst Monitor',
      evaporativeSystem: 'Evaporative System',
      secondaryAirSystem: 'Secondary Air System',
      acRefrigerant: 'A/C Refrigerant Monitor',
      oxygenSensor: 'Oxygen Sensor Monitor',
      oxygenSensorHeater: 'O2 Sensor Heater Monitor',
      egr: 'EGR System Monitor',
      dpf: 'DPF Monitor'
    };
    return names[system as keyof typeof names] || system;
  };

  const getSystemDescription = (system: string) => {
    const descriptions = {
      misfire: 'Monitors engine combustion efficiency',
      fuelSystem: 'Monitors fuel delivery and air/fuel ratio',
      components: 'Monitors various engine components',
      catalyst: 'Monitors catalytic converter efficiency',
      heatedCatalyst: 'Monitors heated catalytic converter',
      evaporativeSystem: 'Monitors fuel vapor emission control',
      secondaryAirSystem: 'Monitors secondary air injection',
      acRefrigerant: 'Monitors A/C refrigerant leakage',
      oxygenSensor: 'Monitors oxygen sensor functionality',
      oxygenSensorHeater: 'Monitors oxygen sensor heating',
      egr: 'Monitors exhaust gas recirculation',
      dpf: 'Monitors diesel particulate filter'
    };
    return descriptions[system as keyof typeof descriptions] || 'System monitor';
  };

  const readySystems = Object.values(readinessStatus).filter(status => status).length;
  const totalSystems = Object.keys(readinessStatus).length;
  const readinessPercentage = (readySystems / totalSystems) * 100;

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
          <h1 className="text-2xl font-bold">System Readiness</h1>
        </div>
      )}
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>System Readiness Status</span>
            </div>
            <Button
              onClick={fetchReadinessStatus}
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
              <CheckCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Connect to an OBD2 device to view system readiness status</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Readiness */}
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle>Overall System Readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ready Systems</span>
              <span className="text-sm text-muted-foreground">
                {readySystems} of {totalSystems}
              </span>
            </div>
            <Progress value={readinessPercentage} className="w-full" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-500">{readySystems}</p>
                <p className="text-sm text-muted-foreground">Ready</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{totalSystems - readySystems}</p>
                <p className="text-sm text-muted-foreground">Not Ready</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-500">{Math.round(readinessPercentage)}%</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(readinessStatus).map(([system, isReady]) => (
          <Card key={system} className="diagnostic-border">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`${isReady ? 'text-green-500' : 'text-red-500'}`}>
                    {getSystemIcon(system)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium">{getSystemName(system)}</p>
                      <Badge variant={isReady ? "default" : "destructive"}>
                        {isReady ? "READY" : "NOT READY"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getSystemDescription(system)}
                    </p>
                  </div>
                </div>
                <div className="ml-2">
                  {isReady ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Information */}
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle>About System Readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              • System readiness indicates whether each emission control system has completed its diagnostic routine.
            </p>
            <p>
              • "Not Ready" systems may need additional drive cycles to complete their tests.
            </p>
            <p>
              • Some systems may not be supported on all vehicles (will show as "Ready").
            </p>
            <p>
              • All systems should be "Ready" before emissions testing in many jurisdictions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReadinessPanel;
