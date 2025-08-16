
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Car, 
  Settings, 
  Wrench, 
  Shield, 
  Radio, 
  Wind, 
  Zap, 
  Gauge, 
  AlertTriangle, 
  CheckCircle,
  Database,
  Activity,
  Lock,
  Key,
  Thermometer,
  Battery
} from 'lucide-react';

interface DiagnosticModule {
  id: string;
  name: string;
  icon: any;
  description: string;
  functions: string[];
  status: 'available' | 'connected' | 'error';
  ecuAddress: string;
}

const PeugeotComprehensiveDiagnostics: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);

  const diagnosticModules: DiagnosticModule[] = [
    {
      id: 'engine',
      name: 'Engine Management',
      icon: Car,
      description: 'HDi engine control, injection system, turbo management',
      functions: ['Read/Clear DTCs', 'Live Data', 'Actuator Tests', 'Injector Coding', 'DPF Regeneration'],
      status: 'available',
      ecuAddress: '10'
    },
    {
      id: 'abs_esp',
      name: 'ABS/ESP System',
      icon: Shield,
      description: 'Anti-lock braking system and electronic stability program',
      functions: ['Brake Bleeding', 'Sensor Calibration', 'System Test', 'Pump Activation'],
      status: 'available',
      ecuAddress: '20'
    },
    {
      id: 'airbag',
      name: 'Airbag System',
      icon: Shield,
      description: 'SRS airbag and seatbelt pretensioner system',
      functions: ['Crash Data', 'Sensor Status', 'Reset Crash Flag', 'Component Test'],
      status: 'available',
      ecuAddress: '15'
    },
    {
      id: 'bsi',
      name: 'BSI (Body Control)',
      icon: Zap,
      description: 'Built-in Systems Interface - central body control unit',
      functions: ['Configuration', 'Key Programming', 'Module Coding', 'Service Reset'],
      status: 'available',
      ecuAddress: '36'
    },
    {
      id: 'radio_nav',
      name: 'Radio/Navigation',
      icon: Radio,
      description: 'RT3/RT4 navigation and audio system',
      functions: ['Code Entry', 'Region Coding', 'Software Update', 'Display Test'],
      status: 'available',
      ecuAddress: '80'
    },
    {
      id: 'climate',
      name: 'Climate Control',
      icon: Wind,
      description: 'Air conditioning and heating system',
      functions: ['Actuator Calibration', 'Sensor Test', 'Compressor Test', 'Blend Door Reset'],
      status: 'available',
      ecuAddress: '22'
    },
    {
      id: 'immobilizer',
      name: 'Anti-Start System',
      icon: Key,
      description: 'Engine immobilizer and anti-theft system',
      functions: ['Key Learning', 'Transponder Test', 'System Status', 'Emergency Start'],
      status: 'available',
      ecuAddress: '98'
    },
    {
      id: 'instrument',
      name: 'Instrument Cluster',
      icon: Gauge,
      description: 'Dashboard display and warning systems',
      functions: ['Display Test', 'Service Reset', 'Mileage Correction', 'Warning Lights'],
      status: 'available',
      ecuAddress: '83'
    },
    {
      id: 'parking',
      name: 'Parking Aid',
      icon: Car,
      description: 'Parking sensors and camera system',
      functions: ['Sensor Test', 'Calibration', 'Zone Configuration', 'Sound Test'],
      status: 'available',
      ecuAddress: '46'
    },
    {
      id: 'alarm',
      name: 'Factory Alarm',
      icon: Shield,
      description: 'OEM security and alarm system',
      functions: ['Siren Test', 'Sensor Calibration', 'Remote Programming', 'Zone Status'],
      status: 'connected',
      ecuAddress: '47'
    }
  ];

  const ecuFunctions = {
    engine: [
      { name: 'Read Engine DTCs', command: '03', description: 'Read stored diagnostic trouble codes' },
      { name: 'Clear Engine DTCs', command: '04', description: 'Clear all stored DTCs' },
      { name: 'Live Engine Data', command: '01', description: 'Monitor real-time engine parameters' },
      { name: 'DPF Forced Regen', command: '31010F', description: 'Force diesel particulate filter regeneration' },
      { name: 'Injector Flow Test', command: '2F1234', description: 'Test fuel injector flow rates' },
      { name: 'EGR Valve Test', command: '2F110E', description: 'Test exhaust gas recirculation valve' },
      { name: 'Turbo Actuator', command: '2F1132', description: 'Test turbocharger wastegate actuator' },
      { name: 'Glow Plug Test', command: '2F1167', description: 'Test glow plug operation' }
    ],
    abs_esp: [
      { name: 'ABS Pump Test', command: '2F0301', description: 'Test ABS hydraulic pump' },
      { name: 'Brake Bleeding', command: '2F0302', description: 'Automated brake system bleeding' },
      { name: 'Wheel Speed Test', command: '2F0303', description: 'Test wheel speed sensors' },
      { name: 'ESP Calibration', command: '2F0304', description: 'Calibrate ESP steering angle sensor' }
    ],
    bsi: [
      { name: 'Read BSI Version', command: '2209F1', description: 'Read BSI software version' },
      { name: 'Key Programming', command: '2FE101', description: 'Program new transponder keys' },
      { name: 'Service Reset', command: '2F1001', description: 'Reset service indicators' },
      { name: 'Module Coding', command: '2E2001', description: 'Code BSI configuration' },
      { name: 'Window Calibration', command: '2F2001', description: 'Calibrate electric windows' },
      { name: 'Central Locking', command: '2F2002', description: 'Test central locking system' }
    ],
    alarm: [
      { name: 'Siren Test', command: '2F4701', description: 'Test factory alarm siren' },
      { name: 'Sensor Status', command: '224701', description: 'Check alarm sensor status' },
      { name: 'Remote Test', command: '2F4702', description: 'Test remote control functions' },
      { name: 'Zone Configuration', command: '2E4701', description: 'Configure alarm zones' },
      { name: 'Shock Sensor Cal', command: '2F4703', description: 'Calibrate shock sensor sensitivity' },
      { name: 'LED Test', command: '2F4704', description: 'Test alarm status LED' }
    ]
  };

  const executeFunction = async (functionData: any) => {
    setIsExecuting(true);
    setExecutionProgress(0);
    
    // Simulate execution progress
    const progressInterval = setInterval(() => {
      setExecutionProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsExecuting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const ModuleCard = ({ module }: { module: DiagnosticModule }) => {
    const Icon = module.icon;
    const isSelected = selectedModule === module.id;
    
    return (
      <Card 
        className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={() => setSelectedModule(isSelected ? null : module.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="h-6 w-6" />
              <div>
                <CardTitle className="text-lg">{module.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={module.status === 'connected' ? 'default' : 'outline'}>
                {module.status}
              </Badge>
              <span className="text-xs text-muted-foreground">ECU: {module.ecuAddress}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium">Available Functions:</p>
            <div className="flex flex-wrap gap-1">
              {module.functions.slice(0, 3).map((func, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">{func}</Badge>
              ))}
              {module.functions.length > 3 && (
                <Badge variant="outline" className="text-xs">+{module.functions.length - 3} more</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Peugeot 307 Comprehensive Diagnostics</h2>
          <p className="text-muted-foreground">Professional diagnostic functions for all vehicle systems</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {diagnosticModules.filter(m => m.status === 'available').length} Modules Available
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {diagnosticModules.map(module => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>

      {selectedModule && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {diagnosticModules.find(m => m.id === selectedModule)?.name} Functions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isExecuting && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Executing function...</span>
                  <span className="text-sm">{executionProgress}%</span>
                </div>
                <Progress value={executionProgress} />
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-3">
              {ecuFunctions[selectedModule as keyof typeof ecuFunctions]?.map((func, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{func.name}</p>
                    <p className="text-sm text-muted-foreground">{func.description}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      Command: {func.command}
                    </Badge>
                  </div>
                  <Button 
                    onClick={() => executeFunction(func)}
                    disabled={isExecuting}
                    size="sm"
                  >
                    Execute
                  </Button>
                </div>
              )) || (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Functions for this module are being loaded...
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PeugeotComprehensiveDiagnostics;
