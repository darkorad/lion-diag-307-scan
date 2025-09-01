import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  STANDARD_OBD2_PIDS, 
  MANUFACTURER_SPECIFIC_PIDS, 
  COMPREHENSIVE_DTC_DATABASE,
  VEHICLE_SYSTEM_MODULES,
  DIAGNOSTIC_FUNCTIONS,
  DIAGNOSTIC_CATEGORIES
} from '@/constants/comprehensiveVehicleDatabase';
import { 
  DIAGNOSTIC_MODULES,
  getPIDsForModule,
  getAdvancedFunctionsForModule
} from '@/constants/diagnosticCapabilities';
import { AlertTriangle, CheckCircle, Car, Wrench, Activity, Database, TestTube, Zap, Shield, Gauge } from 'lucide-react';
import { enhancedBluetoothService } from '@/obd2/enhanced-bluetooth-service';
import { useToast } from '@/hooks/use-toast';
import ServiceResetPanel from './ServiceResetPanel';
import VehicleCodingPanel from './VehicleCodingPanel';
import SystemTestingPanel from './SystemTestingPanel';
import VehicleTestingPanel from './VehicleTestingPanel';

interface DiagnosticResult {
  system: string;
  result: string;
  timestamp: Date;
}

interface AdvancedDiagnosticsPanelProps {
  vehicleMake?: string;
  onCommand?: (command: string) => Promise<string>;
  isConnected?: boolean;
  vehicleInfo?: Record<string, unknown>;
}

export const AdvancedDiagnosticsPanel: React.FC<AdvancedDiagnosticsPanelProps> = ({
  vehicleMake = 'Generic',
  onCommand,
  isConnected = false,
  vehicleInfo
}) => {
  const [activeSystems, setActiveSystems] = useState<string[]>([]);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<string>('engine_control');

  const availablePids = vehicleMake in MANUFACTURER_SPECIFIC_PIDS 
    ? [...STANDARD_OBD2_PIDS, ...MANUFACTURER_SPECIFIC_PIDS[vehicleMake]]
    : STANDARD_OBD2_PIDS;

  const runSystemScan = async (systemId: string) => {
    if (!onCommand) return;
    
    setIsScanning(true);
    try {
      const system = VEHICLE_SYSTEM_MODULES.find(s => s.id === systemId);
      if (system) {
        // Simulate system scan
        const result = await onCommand('0103'); // Read DTCs
        setDiagnosticResults(prev => [...prev, { system: systemId, result, timestamp: new Date() }]);
      }
    } catch (error) {
      console.error('System scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'default';
      case 'LOW':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Professional Diagnostics - {vehicleMake}
          </CardTitle>
          <CardDescription>
            Advanced diagnostic capabilities for all vehicle systems - Professional Grade
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="live-data" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="live-data">Live Data</TabsTrigger>
          <TabsTrigger value="dtc-codes">DTC Codes</TabsTrigger>
          <TabsTrigger value="systems">ECU Systems</TabsTrigger>
          <TabsTrigger value="advanced-functions">Advanced</TabsTrigger>
          <TabsTrigger value="vehicle-testing">Testing</TabsTrigger>
          <TabsTrigger value="service">Service</TabsTrigger>
          <TabsTrigger value="coding">Coding</TabsTrigger>
        </TabsList>

        <TabsContent value="live-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Real-time Parameters - All Systems
              </CardTitle>
              <CardDescription>
                Live data from engine, transmission, ABS, airbag, climate, and all other ECUs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="engine-ecu">
                <TabsList className="mb-4">
                  {DIAGNOSTIC_MODULES.map(module => (
                    <TabsTrigger key={module.id} value={module.id}>
                      {module.name.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {DIAGNOSTIC_MODULES.map(module => (
                  <TabsContent key={module.id} value={module.id}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {module.supportedPIDs.slice(0, 12).map((pid) => (
                        <Card key={pid.id} className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-sm">{pid.name}</h4>
                              <Badge variant="secondary">{pid.id}</Badge>
                            </div>
                            <p className="text-2xl font-bold text-primary">--</p>
                            <p className="text-xs text-muted-foreground">{pid.unit || 'N/A'}</p>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }} />
                            </div>
                            <p className="text-xs text-muted-foreground">{pid.description}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dtc-codes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Comprehensive Diagnostic Trouble Codes
              </CardTitle>
              <CardDescription>
                Complete DTC database with descriptions, symptoms, and repair procedures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {COMPREHENSIVE_DTC_DATABASE.slice(0, 25).map((dtc) => (
                  <div key={dtc.code} className="mb-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{dtc.code}</h4>
                      <Badge variant={getSeverityVariant(dtc.severity)}>
                        {dtc.severity}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{dtc.description}</p>
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Symptoms:</p>
                      <p className="text-xs text-muted-foreground">{dtc.symptoms.join(', ')}</p>
                      <p className="text-xs font-medium">Possible Causes:</p>
                      <p className="text-xs text-muted-foreground">{dtc.possibleCauses?.join(', ') || 'Various electrical/mechanical issues'}</p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="systems" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DIAGNOSTIC_MODULES.map((module) => {
              const moduleIcon = () => {
                switch(module.id) {
                  case 'engine-ecu': return <Zap className="h-4 w-4" />;
                  case 'abs-esp': return <Shield className="h-4 w-4" />;
                  case 'transmission-ecu': return <Gauge className="h-4 w-4" />;
                  default: return <Car className="h-4 w-4" />;
                }
              };
              
              return (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {moduleIcon()}
                      {module.name}
                    </CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        <span className="text-sm">{module.supportedPIDs.length} PIDs Available</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {module.advancedFunctions.slice(0, 3).map((func) => (
                          <Badge key={func.id} variant="outline">{func.name}</Badge>
                        ))}
                        {module.advancedFunctions.length > 3 && (
                          <Badge variant="secondary">+{module.advancedFunctions.length - 3} more</Badge>
                        )}
                      </div>
                      <Button 
                        onClick={() => runSystemScan(module.id)}
                        disabled={isScanning || !isConnected}
                        className="w-full"
                        variant="outline"
                      >
                        {isScanning ? 'Scanning...' : 'Scan System'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="vehicle-testing">
          <VehicleTestingPanel 
            isConnected={isConnected}
            onCommand={onCommand}
            vehicleInfo={vehicleInfo}
          />
        </TabsContent>
        
        <TabsContent value="service">
          <ServiceResetPanel 
            isConnected={isConnected}
            vehicleInfo={vehicleInfo}
          />
        </TabsContent>

        <TabsContent value="coding">
          <VehicleCodingPanel 
            isConnected={isConnected}
            vehicleInfo={vehicleInfo}
          />
        </TabsContent>

        <TabsContent value="advanced-functions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Advanced Manufacturer Functions
              </CardTitle>
              <CardDescription>
                Professional-grade diagnostic functions requiring security access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="engine-ecu">
                <TabsList className="mb-4">
                  {DIAGNOSTIC_MODULES.map(module => (
                    <TabsTrigger key={module.id} value={module.id}>
                      {module.name.split(' ')[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {DIAGNOSTIC_MODULES.map(module => (
                  <TabsContent key={module.id} value={module.id}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {module.advancedFunctions.map((func) => (
                        <Card key={func.id} className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">{func.name}</h4>
                              {func.requiresSecurityAccess && (
                                <Badge variant={func.securityLevel && func.securityLevel > 3 ? "destructive" : "secondary"}>
                                  Security Level {func.securityLevel || 1}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{func.description}</p>
                            <Button 
                              className="w-full mt-2" 
                              variant="outline"
                              disabled={!isConnected}
                            >
                              Execute Function
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {!isConnected && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Professional diagnostics require active OBD2 connection.</strong>
            <br />
            Connect your ELM327 adapter and ensure vehicle ignition is ON for full functionality.
            Some advanced features may require engine running and specific vehicle conditions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
