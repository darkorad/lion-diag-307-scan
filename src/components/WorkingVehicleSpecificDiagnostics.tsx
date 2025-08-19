
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Car, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  RefreshCw, 
  Settings, 
  Wrench,
  Activity,
  Database,
  TestTube,
  Zap,
  Wind,
  Shield
} from 'lucide-react';
import { workingDiagnosticService, DiagnosticResult, LivePIDData } from '@/services/WorkingDiagnosticService';
import { MANUFACTURER_PIDS } from '@/constants/realDiagnosticCodes';
import { toast } from 'sonner';
import BackButton from './BackButton';
import SeatIbizaAdvancedPanel from './SeatIbizaAdvancedPanel';
import VwGolfAdvancedPanel from './VwGolfAdvancedPanel';

interface WorkingVehicleSpecificDiagnosticsProps {
  vehicleInfo: {
    manufacturer: string;
    model: string;
    year: number;
    engine: string;
  };
  isConnected: boolean;
  onBack?: () => void;
}

const WorkingVehicleSpecificDiagnostics: React.FC<WorkingVehicleSpecificDiagnosticsProps> = ({
  vehicleInfo,
  isConnected,
  onBack
}) => {
  const [dtcCodes, setDtcCodes] = useState<any[]>([]);
  const [livePidData, setLivePidData] = useState<{ [key: string]: LivePIDData }>({});
  const [availableFunctions, setAvailableFunctions] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionResults, setExecutionResults] = useState<{ [key: string]: DiagnosticResult }>({});
  const [codingInput, setCodingInput] = useState('');

  useEffect(() => {
    if (isConnected) {
      loadAvailableFunctions();
      readDTCs();
      startLivePidMonitoring();
    }
  }, [isConnected, vehicleInfo]);

  const loadAvailableFunctions = () => {
    const functions = workingDiagnosticService.getAvailableFunctions(vehicleInfo.manufacturer);
    setAvailableFunctions(functions);
  };

  const readDTCs = async () => {
    try {
      const result = await workingDiagnosticService.readDTCs();
      if (result.success) {
        setDtcCodes(result.data || []);
        toast.success(`Found ${result.data?.length || 0} diagnostic codes`);
      } else {
        toast.error(`Failed to read DTCs: ${result.error}`);
      }
    } catch (error) {
      toast.error('Error reading diagnostic codes');
    }
  };

  const clearDTCs = async () => {
    try {
      const result = await workingDiagnosticService.clearDTCs();
      if (result.success) {
        setDtcCodes([]);
        toast.success('Diagnostic codes cleared successfully');
      } else {
        toast.error(`Failed to clear DTCs: ${result.error}`);
      }
    } catch (error) {
      toast.error('Error clearing diagnostic codes');
    }
  };

  const startLivePidMonitoring = () => {
    const manufacturerPids = MANUFACTURER_PIDS.filter(pid => 
      pid.manufacturer.includes(vehicleInfo.manufacturer)
    );

    const interval = setInterval(async () => {
      for (const pidInfo of manufacturerPids.slice(0, 6)) {
        try {
          const data = await workingDiagnosticService.readLivePID(pidInfo.pid, vehicleInfo.manufacturer);
          if (data) {
            setLivePidData(prev => ({
              ...prev,
              [pidInfo.pid]: data
            }));
          }
        } catch (error) {
          console.error(`Failed to read PID ${pidInfo.pid}:`, error);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const executeFunction = async (func: any) => {
    setIsExecuting(true);
    setExecutionProgress(0);

    try {
      toast.info(`Starting ${func.name}...`);

      // Progress simulation
      const progressInterval = setInterval(() => {
        setExecutionProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      let result: DiagnosticResult;

      switch (func.type) {
        case 'actuator_test':
          const testType = func.id.replace('actuator_', '');
          result = await workingDiagnosticService.performActuatorTest(vehicleInfo.manufacturer, testType);
          break;
        case 'service_reset':
          const procedure = func.id.replace('service_', '');
          result = await workingDiagnosticService.performServiceReset(procedure);
          break;
        case 'coding':
          result = await workingDiagnosticService.performCoding(vehicleInfo.manufacturer, 'BSI', codingInput);
          break;
        case 'dpf_regen':
          result = await workingDiagnosticService.performDPFRegeneration();
          break;
        default:
          throw new Error('Unknown function type');
      }

      clearInterval(progressInterval);
      setExecutionProgress(100);

      setExecutionResults(prev => ({
        ...prev,
        [func.id]: result
      }));

      if (result.success) {
        toast.success(`${func.name} completed successfully`);
      } else {
        toast.error(`${func.name} failed: ${result.error}`);
      }

    } catch (error) {
      toast.error(`Function failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
      setTimeout(() => setExecutionProgress(0), 2000);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4 p-2 sm:p-4">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <BackButton 
          onBack={onBack}
          fallbackRoute="/vehicle-selection"
          variant="ghost"
          size="sm"
          label="Back"
          showIcon={true}
        />
        <div className="h-6 w-px bg-border" />
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
            {vehicleInfo.manufacturer} {vehicleInfo.model} Advanced Diagnostics
          </h1>
          <p className="text-sm text-muted-foreground">
            {vehicleInfo.year} • {vehicleInfo.engine} • Real diagnostic functions
          </p>
        </div>
      </div>

      {/* Execution Progress */}
      {isExecuting && (
        <Card className="border-blue-500">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Executing diagnostic function...</span>
                <span className="text-sm">{executionProgress}%</span>
              </div>
              <Progress value={executionProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="live-data" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="live-data">Live Data</TabsTrigger>
          <TabsTrigger value="dtc-codes">DTC Codes</TabsTrigger>
          <TabsTrigger value="actuator-tests">Tests</TabsTrigger>
          <TabsTrigger value="service-functions">Service</TabsTrigger>
          <TabsTrigger value="coding">Coding</TabsTrigger>
          {vehicleInfo.manufacturer === 'Seat' && (
            <TabsTrigger value="seat-ibiza-advanced">Seat Ibiza</TabsTrigger>
          )}
          {vehicleInfo.manufacturer === 'VW' && (
            <TabsTrigger value="vw-golf-advanced">VW Golf</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="live-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Parameters - {vehicleInfo.manufacturer} Specific
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(livePidData).map((data) => (
                  <Card key={data.pid} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{data.name}</h4>
                        <Badge variant="secondary" className="text-xs">PID {data.pid}</Badge>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {typeof data.value === 'number' ? data.value.toFixed(1) : data.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{data.unit}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated: {data.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
              {Object.keys(livePidData).length === 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No live data available. Ensure vehicle is connected and engine is running.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dtc-codes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Diagnostic Trouble Codes
                </div>
                <div className="space-x-2">
                  <Button onClick={readDTCs} size="sm" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={clearDTCs} size="sm" variant="destructive">
                    Clear DTCs
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {dtcCodes.length > 0 ? (
                  <div className="space-y-4">
                    {dtcCodes.map((dtc, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{dtc.code}</h4>
                          <Badge variant={getSeverityVariant(dtc.severity)}>
                            {dtc.severity?.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{dtc.description}</p>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium">Symptoms:</p>
                            <p className="text-xs text-muted-foreground">
                              {dtc.symptoms?.join(', ')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium">Possible Causes:</p>
                            <p className="text-xs text-muted-foreground">
                              {dtc.possibleCauses?.join(', ')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium">Estimated Repair Cost:</p>
                            <p className="text-xs font-semibold text-green-600">
                              {dtc.estimatedCost}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      No diagnostic trouble codes found. Vehicle systems are operating normally.
                    </AlertDescription>
                  </Alert>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actuator-tests" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableFunctions.filter(f => f.type === 'actuator_test').map((func) => (
              <Card key={func.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TestTube className="h-5 w-5" />
                      {func.name}
                    </div>
                    <Badge variant="outline">{func.category}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{func.description}</p>
                  
                  {executionResults[func.id] && (
                    <Alert>
                      <div className="flex items-center gap-2">
                        {executionResults[func.id].success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription>
                          {executionResults[func.id].success 
                            ? 'Test completed successfully' 
                            : `Test failed: ${executionResults[func.id].error}`}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}

                  <Button 
                    onClick={() => executeFunction(func)}
                    disabled={!isConnected || isExecuting}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Test
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="service-functions" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {availableFunctions.filter(f => f.type === 'service_reset' || f.type === 'dpf_regen').map((func) => (
              <Card key={func.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      {func.name}
                    </div>
                    <Badge variant="outline">{func.category}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{func.description}</p>
                  
                  {executionResults[func.id] && (
                    <Alert>
                      <div className="flex items-center gap-2">
                        {executionResults[func.id].success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription>
                          <div>
                            <p className="font-medium">
                              {executionResults[func.id].success ? 'Success' : 'Failed'}
                            </p>
                            <p className="text-xs">
                              {executionResults[func.id].data?.message || 
                               executionResults[func.id].error}
                            </p>
                          </div>
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}

                  <Button 
                    onClick={() => executeFunction(func)}
                    disabled={!isConnected || isExecuting}
                    className="w-full"
                    variant={func.type === 'dpf_regen' ? 'default' : 'outline'}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Execute Function
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Vehicle Coding & Programming
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> Vehicle coding can permanently alter vehicle behavior.
                  Only use verified coding data for your specific vehicle.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="coding-input">Coding Data (Hex)</Label>
                  <Input
                    id="coding-input"
                    placeholder="Enter coding data (e.g., 0101FF)"
                    value={codingInput}
                    onChange={(e) => setCodingInput(e.target.value)}
                  />
                </div>

                {executionResults['coding_' + vehicleInfo.manufacturer.toLowerCase()] && (
                  <Alert>
                    <div className="flex items-center gap-2">
                      {executionResults['coding_' + vehicleInfo.manufacturer.toLowerCase()].success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription>
                        Coding {executionResults['coding_' + vehicleInfo.manufacturer.toLowerCase()].success ? 'successful' : 'failed'}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                <Button 
                  onClick={() => executeFunction({
                    id: 'coding_' + vehicleInfo.manufacturer.toLowerCase(),
                    name: 'Apply Coding',
                    type: 'coding',
                    description: 'Apply custom coding data'
                  })}
                  disabled={!isConnected || isExecuting || !codingInput}
                  className="w-full"
                  variant="destructive"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Apply Coding
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {vehicleInfo.manufacturer === 'Seat' && (
          <TabsContent value="seat-ibiza-advanced">
            <SeatIbizaAdvancedPanel isConnected={isConnected} />
          </TabsContent>
        )}
        {vehicleInfo.manufacturer === 'VW' && (
          <TabsContent value="vw-golf-advanced">
            <VwGolfAdvancedPanel isConnected={isConnected} />
          </TabsContent>
        )}
      </Tabs>

      {!isConnected && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Connect to vehicle to access diagnostic functions.</strong>
            <br />
            All functions require active OBD2 connection with vehicle ignition ON.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default WorkingVehicleSpecificDiagnostics;
