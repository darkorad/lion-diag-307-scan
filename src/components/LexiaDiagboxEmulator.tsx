
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Car, 
  Settings, 
  Wrench, 
  Shield, 
  Radio, 
  Key, 
  AlertTriangle,
  CheckCircle,
  Cpu,
  Gauge,
  Battery,
  Thermometer
} from 'lucide-react';
import { toast } from 'sonner';

interface LexiaDiagboxEmulatorProps {
  isConnected: boolean;
  onCommand?: (command: string) => Promise<string>;
  selectedVehicle?: any;
}

interface PSAFunction {
  id: string;
  name: string;
  description: string;
  category: 'comfort' | 'security' | 'maintenance' | 'calibration' | 'coding';
  ecuAddress: string;
  command: string;
  parameters?: { [key: string]: any };
  riskLevel: 'low' | 'medium' | 'high';
  requiresPin?: boolean;
}

const LEXIA_FUNCTIONS: PSAFunction[] = [
  // BSI COMFORT FUNCTIONS
  {
    id: 'auto_wipers_enable',
    name: 'Enable Auto Wipers',
    description: 'Enable automatic windshield wipers',
    category: 'comfort',
    ecuAddress: '10',
    command: '3B8401',
    riskLevel: 'low'
  },
  {
    id: 'auto_lights_enable',
    name: 'Enable Auto Lights',
    description: 'Enable automatic headlight control',
    category: 'comfort',
    ecuAddress: '10',
    command: '3B8501',
    riskLevel: 'low'
  },
  {
    id: 'welcome_lighting',
    name: 'Welcome Lighting',
    description: 'Configure welcome lighting duration',
    category: 'comfort',
    ecuAddress: '10',
    command: '3B8601',
    parameters: { duration: 30 },
    riskLevel: 'low'
  },
  {
    id: 'follow_me_home',
    name: 'Follow Me Home Lights',
    description: 'Configure follow me home lighting',
    category: 'comfort',
    ecuAddress: '10',
    command: '3B8701',
    parameters: { duration: 60 },
    riskLevel: 'low'
  },
  {
    id: 'drl_enable',
    name: 'Enable DRL',
    description: 'Enable daytime running lights',
    category: 'comfort',
    ecuAddress: '10',
    command: '3B8801',
    riskLevel: 'low'
  },
  {
    id: 'speed_locking',
    name: 'Speed Dependent Locking',
    description: 'Enable automatic door locking at speed',
    category: 'comfort',
    ecuAddress: '10',
    command: '3B8901',
    parameters: { speed_threshold: 10 },
    riskLevel: 'medium'
  },

  // SECURITY FUNCTIONS
  {
    id: 'immobilizer_programming',
    name: 'Immobilizer Programming',
    description: 'Program new transponder keys',
    category: 'security',
    ecuAddress: '10',
    command: '3B8301',
    riskLevel: 'high',
    requiresPin: true
  },
  {
    id: 'central_locking_config',
    name: 'Central Locking Config',
    description: 'Configure central locking behavior',
    category: 'security',
    ecuAddress: '10',
    command: '3B8A01',
    parameters: { double_lock: true, selective_unlock: false },
    riskLevel: 'medium',
    requiresPin: true
  },
  {
    id: 'deadlocking_enable',
    name: 'Enable Deadlocking',
    description: 'Enable anti-theft deadlocking',
    category: 'security',
    ecuAddress: '10',
    command: '3B8B01',
    riskLevel: 'high',
    requiresPin: true
  },
  {
    id: 'alarm_config',
    name: 'Alarm Configuration',
    description: 'Configure anti-theft alarm settings',
    category: 'security',
    ecuAddress: '10',
    command: '3B8C01',
    parameters: { perimeter: true, volumetric: true, tilt: false },
    riskLevel: 'medium',
    requiresPin: true
  },

  // RADIO FUNCTIONS
  {
    id: 'radio_aux_enable',
    name: 'Enable Radio AUX',
    description: 'Enable AUX input on radio',
    category: 'comfort',
    ecuAddress: '56',
    command: '220F41',
    riskLevel: 'low'
  },
  {
    id: 'radio_cd_changer',
    name: 'CD Changer Emulation',
    description: 'Enable CD changer emulation for AUX',
    category: 'comfort',
    ecuAddress: '56',
    command: '220F42',
    riskLevel: 'low'
  },
  {
    id: 'radio_steering_controls',
    name: 'Steering Wheel Controls',
    description: 'Configure steering wheel radio controls',
    category: 'comfort',
    ecuAddress: '56',
    command: '220F43',
    parameters: { volume: true, source: true, seek: true },
    riskLevel: 'low'
  },

  // ENGINE FUNCTIONS
  {
    id: 'dpf_forced_regen',
    name: 'Force DPF Regeneration',
    description: 'Force diesel particulate filter regeneration',
    category: 'maintenance',
    ecuAddress: '01',
    command: '31010F',
    riskLevel: 'medium'
  },
  {
    id: 'egr_valve_test',
    name: 'EGR Valve Test',
    description: 'Test EGR valve operation',
    category: 'maintenance',
    ecuAddress: '01',
    command: '2F110E01',
    parameters: { test_duration: 5000 },
    riskLevel: 'medium'
  },
  {
    id: 'injector_test',
    name: 'Injector Test',
    description: 'Test individual fuel injectors',
    category: 'maintenance',
    ecuAddress: '01',
    command: '2F120101',
    parameters: { cylinder: 1, duration: 2000 },
    riskLevel: 'high'
  },
  {
    id: 'turbo_actuator_test',
    name: 'Turbo Actuator Test',
    description: 'Test turbocharger wastegate actuator',
    category: 'maintenance',
    ecuAddress: '01',
    command: '2F113201',
    parameters: { position: 50 },
    riskLevel: 'medium'
  },

  // SERVICE RESETS
  {
    id: 'oil_service_reset',
    name: 'Oil Service Reset',
    description: 'Reset oil service interval',
    category: 'maintenance',
    ecuAddress: '01',
    command: '31030000FF',
    riskLevel: 'low'
  },
  {
    id: 'inspection_reset',
    name: 'Inspection Reset',
    description: 'Reset inspection service interval',
    category: 'maintenance',
    ecuAddress: '01',
    command: '31030001FF',
    riskLevel: 'low'
  },
  {
    id: 'dpf_service_reset',
    name: 'DPF Service Reset',
    description: 'Reset DPF maintenance counter',
    category: 'maintenance',
    ecuAddress: '01',
    command: '31030002FF',
    riskLevel: 'medium'
  }
];

export const LexiaDiagboxEmulator: React.FC<LexiaDiagboxEmulatorProps> = ({
  isConnected,
  onCommand,
  selectedVehicle
}) => {
  const [activeFunction, setActiveFunction] = useState<string | null>(null);
  const [functionProgress, setFunctionProgress] = useState(0);
  const [functionResults, setFunctionResults] = useState<{ [key: string]: any }>({});
  const [pinCode, setPinCode] = useState('');
  const [parameters, setParameters] = useState<{ [key: string]: any }>({});
  const [selectedEcu, setSelectedEcu] = useState('10'); // BSI by default

  const ecuList = [
    { id: '01', name: 'Engine ECU', icon: <Cpu className="h-4 w-4" /> },
    { id: '03', name: 'ABS/ESP', icon: <Shield className="h-4 w-4" /> },
    { id: '09', name: 'Climate Control', icon: <Thermometer className="h-4 w-4" /> },
    { id: '10', name: 'BSI (Body System Interface)', icon: <Settings className="h-4 w-4" /> },
    { id: '15', name: 'Airbag SRS', icon: <Shield className="h-4 w-4" /> },
    { id: '36', name: 'Instrument Cluster', icon: <Gauge className="h-4 w-4" /> },
    { id: '56', name: 'Radio/Navigation', icon: <Radio className="h-4 w-4" /> },
    { id: '96', name: 'Battery Management', icon: <Battery className="h-4 w-4" /> }
  ];

  const executeFunction = async (func: PSAFunction) => {
    if (!onCommand || !isConnected) {
      toast.error('Not connected to vehicle');
      return;
    }

    // Security checks
    if (func.requiresPin && !pinCode) {
      toast.error('PIN code required for this function');
      return;
    }

    if (func.riskLevel === 'high') {
      const confirmed = window.confirm(
        `⚠️ HIGH RISK OPERATION\n\n${func.name}\n${func.description}\n\nThis operation can potentially damage your vehicle or security systems. Are you sure you want to continue?`
      );
      if (!confirmed) return;
    }

    setActiveFunction(func.id);
    setFunctionProgress(0);

    try {
      toast.info(`Executing ${func.name}...`);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setFunctionProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Build command with parameters and PIN if needed
      let command = func.command;
      if (func.requiresPin && pinCode) {
        command = `27E1${pinCode}${command}`;
      }

      // Add parameters if any
      if (func.parameters && Object.keys(parameters).length > 0) {
        const paramHex = Object.values(parameters).map(val => 
          typeof val === 'number' ? val.toString(16).padStart(2, '0') : val
        ).join('');
        command += paramHex;
      }

      const response = await onCommand(command);
      
      clearInterval(progressInterval);
      setFunctionProgress(100);

      const success = !response.includes('NEGATIVE') && !response.includes('ERROR');
      
      setFunctionResults(prev => ({
        ...prev,
        [func.id]: {
          success,
          response,
          timestamp: new Date(),
          function: func.name
        }
      }));

      if (success) {
        toast.success(`${func.name} completed successfully`);
      } else {
        toast.error(`${func.name} failed: ${response}`);
      }

    } catch (error) {
      console.error('Function execution failed:', error);
      toast.error(`Function failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setFunctionResults(prev => ({
        ...prev,
        [func.id]: {
          success: false,
          response: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
          function: func.name
        }
      }));
    } finally {
      setActiveFunction(null);
      setFunctionProgress(0);
    }
  };

  const getFunctionsByCategory = (category: string) => {
    return LEXIA_FUNCTIONS.filter(func => func.category === category);
  };

  const getFunctionsForEcu = (ecuAddress: string) => {
    return LEXIA_FUNCTIONS.filter(func => func.ecuAddress === ecuAddress);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-6 w-6 text-blue-600" />
            Lexia-3/Diagbox Emulator
            <Badge className="bg-blue-100 text-blue-800">PSA Group</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {isConnected ? '✓' : '✗'}
              </div>
              <div className="text-sm text-muted-foreground">Connection</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {LEXIA_FUNCTIONS.length}
              </div>
              <div className="text-sm text-muted-foreground">Functions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {ecuList.length}
              </div>
              <div className="text-sm text-muted-foreground">ECUs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {selectedVehicle?.make || 'PSA'}
              </div>
              <div className="text-sm text-muted-foreground">Vehicle</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PIN Code Input for Security Functions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Security Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="pin">PIN Code (for security functions)</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter 4-digit PIN"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                maxLength={4}
              />
            </div>
            <Button 
              onClick={() => toast.info('PIN code set for security functions')}
              disabled={pinCode.length !== 4}
            >
              Set PIN
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Function Progress */}
      {activeFunction && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 animate-spin" />
                <span>Executing function...</span>
              </div>
              <Progress value={functionProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Progress: {Math.round(functionProgress)}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Functions Tabs */}
      <Tabs defaultValue="comfort" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="comfort">Comfort</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="maintenance">Service</TabsTrigger>
          <TabsTrigger value="calibration">Calibration</TabsTrigger>
          <TabsTrigger value="ecu">By ECU</TabsTrigger>
        </TabsList>

        {/* Comfort Functions */}
        <TabsContent value="comfort" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFunctionsByCategory('comfort').map(func => {
              const result = functionResults[func.id];
              return (
                <Card key={func.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {func.name}
                      <Badge variant={func.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                        {func.riskLevel.toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{func.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result && (
                      <Alert>
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">
                            {result.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                      </Alert>
                    )}
                    
                    <Button
                      onClick={() => executeFunction(func)}
                      disabled={!isConnected || activeFunction !== null}
                      className="w-full"
                    >
                      Execute
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Security Functions */}
        <TabsContent value="security" className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Security functions require PIN code and can affect vehicle security systems.
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFunctionsByCategory('security').map(func => {
              const result = functionResults[func.id];
              return (
                <Card key={func.id} className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {func.name}
                      <div className="flex gap-2">
                        {func.requiresPin && <Badge variant="outline">PIN Required</Badge>}
                        <Badge variant="destructive">HIGH RISK</Badge>
                      </div>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{func.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result && (
                      <Alert>
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">
                            {result.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                      </Alert>
                    )}
                    
                    <Button
                      onClick={() => executeFunction(func)}
                      disabled={!isConnected || activeFunction !== null || (func.requiresPin && !pinCode)}
                      variant="destructive"
                      className="w-full"
                    >
                      Execute
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Maintenance Functions */}
        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFunctionsByCategory('maintenance').map(func => {
              const result = functionResults[func.id];
              return (
                <Card key={func.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {func.name}
                      <Badge variant={func.riskLevel === 'high' ? 'destructive' : 'default'}>
                        {func.riskLevel.toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{func.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result && (
                      <Alert>
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">
                            {result.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                      </Alert>
                    )}
                    
                    <Button
                      onClick={() => executeFunction(func)}
                      disabled={!isConnected || activeFunction !== null}
                      className="w-full"
                    >
                      Execute
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* By ECU */}
        <TabsContent value="ecu" className="space-y-4">
          <div className="mb-4">
            <Label htmlFor="ecu-select">Select ECU:</Label>
            <Select value={selectedEcu} onValueChange={setSelectedEcu}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ecuList.map(ecu => (
                  <SelectItem key={ecu.id} value={ecu.id}>
                    <div className="flex items-center gap-2">
                      {ecu.icon}
                      {ecu.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFunctionsForEcu(selectedEcu).map(func => {
              const result = functionResults[func.id];
              return (
                <Card key={func.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {func.name}
                      <Badge variant={func.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                        {func.riskLevel.toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{func.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result && (
                      <Alert>
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">
                            {result.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                      </Alert>
                    )}
                    
                    <Button
                      onClick={() => executeFunction(func)}
                      disabled={!isConnected || activeFunction !== null || (func.requiresPin && !pinCode)}
                      className="w-full"
                    >
                      Execute
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Connection Warning */}
      {!isConnected && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Not Connected:</strong> Please connect to your vehicle using a compatible Lexia-3 or professional diagnostic adapter to access these functions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default LexiaDiagboxEmulator;
