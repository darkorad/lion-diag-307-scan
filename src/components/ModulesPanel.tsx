
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Scan,
  Settings,
  Car,
  Zap,
  Gauge,
  Shield,
  Wind,
  Thermometer,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

interface ModulesPanelProps {
  isConnected: boolean;
  onBack?: () => void;
}

interface VehicleModule {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'offline' | 'error' | 'scanning';
  address: string;
  protocol: string;
  supported: boolean;
  dtcCount: number;
  lastScan: string;
  icon: React.ReactNode;
  functions: string[];
}

const ModulesPanel: React.FC<ModulesPanelProps> = ({ isConnected, onBack }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [modules, setModules] = useState<VehicleModule[]>([
    {
      id: 'ecm',
      name: 'Engine Control Module',
      description: 'Controls engine operation and fuel injection',
      status: 'online',
      address: '0x7E0',
      protocol: 'ISO 14230-4',
      supported: true,
      dtcCount: 1,
      lastScan: '2024-01-20 10:30',
      icon: <Car className="h-5 w-5" />,
      functions: ['Engine RPM', 'MAF Sensor', 'Throttle Position', 'Fuel Trim', 'O2 Sensors']
    },
    {
      id: 'abs',
      name: 'ABS Control Module',
      description: 'Anti-lock Braking System control',
      status: 'online',
      address: '0x7E1',
      protocol: 'ISO 14230-4',
      supported: true,
      dtcCount: 0,
      lastScan: '2024-01-20 10:30',
      icon: <Shield className="h-5 w-5" />,
      functions: ['Wheel Speed Sensors', 'Brake Pressure', 'ABS Activation']
    },
    {
      id: 'airbag',
      name: 'Airbag Control Module',
      description: 'Supplemental Restraint System',
      status: 'online',
      address: '0x7E2',
      protocol: 'ISO 14230-4',
      supported: true,
      dtcCount: 0,
      lastScan: '2024-01-20 10:30',
      icon: <Shield className="h-5 w-5" />,
      functions: ['Crash Sensors', 'Seat Belt Status', 'Airbag Status']
    },
    {
      id: 'hvac',
      name: 'Climate Control',
      description: 'Heating, Ventilation, and Air Conditioning',
      status: 'online',
      address: '0x7E3',
      protocol: 'ISO 14230-4',
      supported: true,
      dtcCount: 0,
      lastScan: '2024-01-20 10:30',
      icon: <Wind className="h-5 w-5" />,
      functions: ['AC Compressor', 'Blower Motor', 'Temperature Sensors']
    },
    {
      id: 'bcm',
      name: 'Body Control Module',
      description: 'Controls lighting, windows, and other body functions',
      status: 'online',
      address: '0x7E4',
      protocol: 'ISO 14230-4',
      supported: true,
      dtcCount: 0,
      lastScan: '2024-01-20 10:30',
      icon: <Zap className="h-5 w-5" />,
      functions: ['Lighting', 'Windows', 'Central Locking', 'Wipers']
    },
    {
      id: 'instrument',
      name: 'Instrument Cluster',
      description: 'Dashboard display and gauges',
      status: 'online',
      address: '0x7E5',
      protocol: 'ISO 14230-4',
      supported: true,
      dtcCount: 0,
      lastScan: '2024-01-20 10:30',
      icon: <Gauge className="h-5 w-5" />,
      functions: ['Speedometer', 'Fuel Gauge', 'Warning Lights', 'Odometer']
    },
    {
      id: 'dpf',
      name: 'DPF Control Module',
      description: 'Diesel Particulate Filter management',
      status: 'online',
      address: '0x7E6',
      protocol: 'ISO 14230-4',
      supported: true,
      dtcCount: 1,
      lastScan: '2024-01-20 10:30',
      icon: <Activity className="h-5 w-5" />,
      functions: ['DPF Pressure', 'DPF Temperature', 'Regeneration Status', 'Soot Level']
    },
    {
      id: 'gearbox',
      name: 'Transmission Control',
      description: 'Automatic transmission control (if equipped)',
      status: 'offline',
      address: '0x7E7',
      protocol: 'ISO 14230-4',
      supported: false,
      dtcCount: 0,
      lastScan: 'Never',
      icon: <Settings className="h-5 w-5" />,
      functions: ['Manual transmission - N/A']
    }
  ]);

  const handleScanAllModules = async () => {
    setIsScanning(true);
    setScanProgress(0);
    toast.info('Starting module scan...');

    const scanSteps = modules.filter(m => m.supported);
    
    for (let i = 0; i < scanSteps.length; i++) {
      const module = scanSteps[i];
      
      // Update module status to scanning
      setModules(prev => prev.map(m => 
        m.id === module.id ? { ...m, status: 'scanning' as const } : m
      ));

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate scan completion
      setModules(prev => prev.map(m => 
        m.id === module.id ? { 
          ...m, 
          status: 'online' as const,
          lastScan: new Date().toLocaleString()
        } : m
      ));

      setScanProgress(((i + 1) / scanSteps.length) * 100);
      toast.info(`Scanned ${module.name}`);
    }

    setIsScanning(false);
    toast.success('Module scan completed');
  };

  const handleScanModule = async (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module || !module.supported) return;

    setModules(prev => prev.map(m => 
      m.id === moduleId ? { ...m, status: 'scanning' as const } : m
    ));

    await new Promise(resolve => setTimeout(resolve, 2000));

    setModules(prev => prev.map(m => 
      m.id === moduleId ? { 
        ...m, 
        status: 'online' as const,
        lastScan: new Date().toLocaleString()
      } : m
    ));

    toast.success(`${module.name} scan completed`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-automotive-success" />;
      case 'offline': return <XCircle className="h-4 w-4 text-muted-foreground" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-automotive-critical" />;
      case 'scanning': return <Activity className="h-4 w-4 text-automotive-warning animate-pulse" />;
      default: return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'border-green-500/20 bg-green-500/5';
      case 'offline': return 'border-muted/20 bg-muted/5';
      case 'error': return 'border-red-500/20 bg-red-500/5';
      case 'scanning': return 'border-yellow-500/20 bg-yellow-500/5';
      default: return 'border-muted/20 bg-muted/5';
    }
  };

  const onlineModules = modules.filter(m => m.status === 'online').length;
  const totalDtcs = modules.reduce((sum, m) => sum + m.dtcCount, 0);

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
          <h1 className="text-2xl font-bold">Vehicle Modules</h1>
        </div>
      )}
      {/* Overview Card */}
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-primary" />
              <span>Vehicle Modules Overview</span>
            </div>
            <Button
              onClick={handleScanAllModules}
              disabled={!isConnected || isScanning}
              variant="default"
              size="sm"
            >
              <Scan className="h-4 w-4 mr-1" />
              {isScanning ? 'Scanning...' : 'Scan All'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-automotive-success">{onlineModules}</p>
              <p className="text-sm text-muted-foreground">Online Modules</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">{modules.length - onlineModules}</p>
              <p className="text-sm text-muted-foreground">Offline Modules</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-automotive-warning">{totalDtcs}</p>
              <p className="text-sm text-muted-foreground">Total DTCs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{modules.filter(m => m.supported).length}</p>
              <p className="text-sm text-muted-foreground">Supported</p>
            </div>
          </div>

          {isScanning && (
            <div className="space-y-2">
              <Progress value={scanProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Scanning modules... {Math.round(scanProgress)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((module) => (
          <Card key={module.id} className={`diagnostic-border ${getStatusColor(module.status)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {module.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base">{module.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(module.status)}
                  <Badge variant={module.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                    {module.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-mono">{module.address}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Protocol</p>
                  <p>{module.protocol}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">DTCs</p>
                  <p className={module.dtcCount > 0 ? 'text-automotive-warning font-semibold' : 'text-automotive-success'}>
                    {module.dtcCount}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Scan</p>
                  <p className="text-xs">{module.lastScan}</p>
                </div>
              </div>

              {module.functions && (
                <div>
                  <p className="text-sm font-semibold mb-2">Available Functions:</p>
                  <div className="flex flex-wrap gap-1">
                    {module.functions.slice(0, 3).map((func, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {func}
                      </Badge>
                    ))}
                    {module.functions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{module.functions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {module.supported && (
                <Button
                  onClick={() => handleScanModule(module.id)}
                  disabled={!isConnected || module.status === 'scanning'}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {module.status === 'scanning' ? 'Scanning...' : 'Scan Module'}
                </Button>
              )}

              {!module.supported && (
                <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                  Module not supported or not present in this vehicle configuration
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Peugeot 307 Specific Info */}
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle>Peugeot 307 1.6 HDI Specific Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Standard Equipment Modules:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Engine Management (Bosch EDC16C34)</li>
                <li>• ABS/ESP (Bosch 8.1)</li>
                <li>• Airbag System</li>
                <li>• Body Control Module (BSI)</li>
                <li>• Instrument Cluster</li>
                <li>• DPF Control System</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">DPF System Notes:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Requires specific tool for forced regeneration</li>
                <li>• DPF pressure sensors monitor filter status</li>
                <li>• Temperature sensors track regeneration cycles</li>
                <li>• Soot loading calculated via differential pressure</li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm">
              <strong>Tip:</strong> For complete diagnostics on Peugeot vehicles, consider using 
              manufacturer-specific tools like Peugeot Diagbox or Lexia-3 for advanced functions 
              and hidden modules.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModulesPanel;
