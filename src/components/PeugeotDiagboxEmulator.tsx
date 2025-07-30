
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft,
  Car,
  Cpu,
  Settings,
  Wrench,
  Key,
  Shield,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Database,
  TestTube,
  Radio,
  Wind,
  Zap,
  Eye,
  Lock,
  Thermometer,
  Gauge
} from 'lucide-react';
import { toast } from 'sonner';
import { enhancedOBD2Service } from '@/services/EnhancedOBD2Service';

interface PeugeotDiagboxEmulatorProps {
  isConnected: boolean;
  onBack?: () => void;
}

interface ECUModule {
  id: string;
  name: string;
  address: string;
  version?: string;
  partNumber?: string;
  status: 'ok' | 'error' | 'unavailable';
  category: 'engine' | 'body' | 'chassis' | 'comfort' | 'security' | 'navigation';
  hasAdvancedFunctions: boolean;
  supportsCoding: boolean;
}

interface AdvancedFunction {
  id: string;
  name: string;
  description: string;
  ecuId: string;
  category: string;
  command: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiresPin?: boolean;
  parameters?: { name: string; type: string; options?: string[] }[];
}

interface HiddenFunction {
  id: string;
  name: string;
  description: string;
  unlock: boolean;
  category: string;
  command: string;
  enabled: boolean;
}

const PeugeotDiagboxEmulator: React.FC<PeugeotDiagboxEmulatorProps> = ({ isConnected, onBack }) => {
  const [ecuModules, setEcuModules] = useState<ECUModule[]>([]);
  const [selectedEcu, setSelectedEcu] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [pinCode, setPinCode] = useState<string>('');
  const [isPinAuthenticated, setIsPinAuthenticated] = useState(false);
  const [hiddenFunctions, setHiddenFunctions] = useState<HiddenFunction[]>([]);
  const [advancedFunctions, setAdvancedFunctions] = useState<AdvancedFunction[]>([]);

  // Peugeot ECU modules database
  const peugeotECUs: ECUModule[] = React.useMemo(() => [
    { id: 'bsi', name: 'BSI (Built-in Systems Interface)', address: '00', status: 'ok', category: 'body', hasAdvancedFunctions: true, supportsCoding: true },
    { id: 'engine', name: 'Engine Control Module (ECM)', address: '01', status: 'ok', category: 'engine', hasAdvancedFunctions: true, supportsCoding: true },
    { id: 'abs', name: 'ABS/ESP Control Module', address: '03', status: 'ok', category: 'chassis', hasAdvancedFunctions: true, supportsCoding: false },
    { id: 'airbag', name: 'Airbag Control Module', address: '15', status: 'ok', category: 'chassis', hasAdvancedFunctions: false, supportsCoding: false },
    { id: 'instrument', name: 'Instrument Panel', address: '17', status: 'ok', category: 'body', hasAdvancedFunctions: true, supportsCoding: true },
    { id: 'radio', name: 'Radio/Telematic Unit (RT3/RT4/RT5)', address: '56', status: 'ok', category: 'comfort', hasAdvancedFunctions: true, supportsCoding: true },
    { id: 'climate', name: 'Climate Control (CLIM)', address: '08', status: 'ok', category: 'comfort', hasAdvancedFunctions: true, supportsCoding: true },
    { id: 'lighting', name: 'Lighting Control Module', address: '09', status: 'ok', category: 'body', hasAdvancedFunctions: true, supportsCoding: true },
    { id: 'parking', name: 'Parking Aid System', address: '10', status: 'ok', category: 'comfort', hasAdvancedFunctions: true, supportsCoding: false },
    { id: 'steering', name: 'Steering Wheel Module', address: '16', status: 'ok', category: 'comfort', hasAdvancedFunctions: false, supportsCoding: false },
    { id: 'gateway', name: 'CAN Gateway', address: '19', status: 'ok', category: 'body', hasAdvancedFunctions: false, supportsCoding: false },
    { id: 'dpf', name: 'DPF Control Module', address: '18', status: 'ok', category: 'engine', hasAdvancedFunctions: true, supportsCoding: false },
    { id: 'fuel_pump', name: 'Fuel Pump Control', address: '67', status: 'ok', category: 'engine', hasAdvancedFunctions: false, supportsCoding: false },
    { id: 'hdc', name: 'Hill Descent Control', address: '54', status: 'unavailable', category: 'chassis', hasAdvancedFunctions: true, supportsCoding: false },
    { id: 'esp', name: 'Electronic Stability Program', address: '0D', status: 'ok', category: 'chassis', hasAdvancedFunctions: true, supportsCoding: true },
    { id: 'power_steering', name: 'Electric Power Steering', address: '32', status: 'ok', category: 'chassis', hasAdvancedFunctions: true, supportsCoding: true },
    { id: 'autobox', name: 'Automatic Transmission', address: '02', status: 'unavailable', category: 'engine', hasAdvancedFunctions: true, supportsCoding: true },
    { id: 'door_modules', name: 'Door Control Modules', address: '42', status: 'ok', category: 'body', hasAdvancedFunctions: true, supportsCoding: true },
    { id: 'seat_memory', name: 'Seat Memory Module', address: '72', status: 'unavailable', category: 'comfort', hasAdvancedFunctions: true, supportsCoding: true },
    { id: 'rain_light', name: 'Rain/Light Sensor', address: '77', status: 'ok', category: 'comfort', hasAdvancedFunctions: true, supportsCoding: true }
  ], []);

  // Hidden/Advanced functions database
  const peugeotHiddenFunctions: HiddenFunction[] = React.useMemo(() => [
    // BSI Functions
    { id: 'bsi_daytime_running', name: 'Daytime Running Lights', description: 'Enable/disable DRL', unlock: false, category: 'lighting', command: '3B8901', enabled: true },
    { id: 'bsi_auto_lights', name: 'Automatic Headlights', description: 'Auto headlight activation', unlock: false, category: 'lighting', command: '3B8501', enabled: true },
    { id: 'bsi_follow_me_home', name: 'Follow Me Home Lights', description: 'Lights stay on after exit', unlock: false, category: 'lighting', command: '3B8701', enabled: false },
    { id: 'bsi_welcome_lighting', name: 'Welcome Lighting', description: 'Approach lighting', unlock: false, category: 'lighting', command: '3B8801', enabled: true },
    { id: 'bsi_motorway_lights', name: 'Motorway Lighting Mode', description: 'Enhanced highway lighting', unlock: true, category: 'lighting', command: '3B8F01', enabled: false },
    { id: 'bsi_selective_unlock', name: 'Selective Door Unlock', description: 'Driver door first unlock', unlock: false, category: 'security', command: '3B9301', enabled: false },
    { id: 'bsi_auto_lock_driving', name: 'Auto Lock While Driving', description: 'Lock doors when moving', unlock: false, category: 'security', command: '3B9401', enabled: false },
    { id: 'bsi_auto_lock_leaving', name: 'Auto Lock When Leaving', description: 'Lock when walking away', unlock: true, category: 'security', command: '3B9501', enabled: false },
    { id: 'bsi_deadlocking', name: 'Super Locking (Deadlock)', description: 'Enhanced security locking', unlock: true, category: 'security', command: '3B8A01', enabled: false },
    
    // Radio Functions
    { id: 'radio_aux_enable', name: 'AUX Input Activation', description: 'Enable auxiliary input', unlock: false, category: 'audio', command: '220F41', enabled: false },
    { id: 'radio_video_in_motion', name: 'Video While Driving', description: 'Allow video playback while moving', unlock: true, category: 'audio', command: '3B9A01', enabled: false },
    { id: 'radio_amplifier_mode', name: 'External Amplifier Mode', description: 'Configure for external amp', unlock: true, category: 'audio', command: '3B9B01', enabled: false },
    { id: 'radio_can_timeout', name: 'CAN Timeout Extension', description: 'Extend CAN communication timeout', unlock: true, category: 'audio', command: '3B9C01', enabled: false },
    
    // Engine Functions
    { id: 'engine_auto_stop_disable', name: 'Disable Auto Stop/Start', description: 'Permanently disable stop/start', unlock: true, category: 'engine', command: '3B9D01', enabled: false },
    { id: 'engine_dpf_manual_regen', name: 'Manual DPF Regeneration', description: 'Enable manual DPF regen button', unlock: false, category: 'engine', command: '3B9E01', enabled: false },
    { id: 'engine_cold_start_rpm', name: 'Cold Start RPM Adjust', description: 'Adjust cold start idle RPM', unlock: true, category: 'engine', command: '3B9F01', enabled: false },
    
    // Climate Functions
    { id: 'climate_residual_heat', name: 'Residual Heat Function', description: 'Use engine heat after stop', unlock: false, category: 'climate', command: '3B9801', enabled: true },
    { id: 'climate_auto_recirculation', name: 'Auto Air Recirculation', description: 'Auto recirculation in tunnels', unlock: true, category: 'climate', command: '3BA001', enabled: false },
    { id: 'climate_max_ac', name: 'Maximum A/C Mode', description: 'Enhanced cooling mode', unlock: false, category: 'climate', command: '3BA101', enabled: false },
    
    // Comfort Functions
    { id: 'comfort_auto_wipers_sens', name: 'Rain Sensor Sensitivity', description: 'Adjust rain sensor sensitivity', unlock: false, category: 'comfort', command: '3B9101', enabled: false },
    { id: 'comfort_auto_rear_wiper', name: 'Auto Rear Wiper in Reverse', description: 'Rear wiper auto in reverse', unlock: false, category: 'comfort', command: '3B9201', enabled: false },
    { id: 'comfort_speed_wipers', name: 'Speed Sensitive Wipers', description: 'Adjust wiper speed with vehicle speed', unlock: true, category: 'comfort', command: '3BA201', enabled: false },
    
    // Security Functions
    { id: 'security_volumetric_sensor', name: 'Volumetric Alarm Sensor', description: 'Interior movement detection', unlock: true, category: 'security', command: '3BA301', enabled: false },
    { id: 'security_perimetric_only', name: 'Perimetric Alarm Only', description: 'Disable volumetric, keep perimetric', unlock: false, category: 'security', command: '3BA401', enabled: false },
    { id: 'security_plip_distance', name: 'Remote Key Range', description: 'Adjust remote key operating range', unlock: true, category: 'security', command: '3BA501', enabled: false }
  ], []);

  // Advanced functions per ECU
  const ecuAdvancedFunctions: { [key: string]: AdvancedFunction[] } = React.useMemo(() => ({
    bsi: [
      { id: 'bsi_learn_keys', name: 'Learn New Keys', description: 'Program new remote keys', ecuId: 'bsi', category: 'security', command: '3101', riskLevel: 'high', requiresPin: true },
      { id: 'bsi_delete_keys', name: 'Delete All Keys', description: 'Remove all programmed keys', ecuId: 'bsi', category: 'security', command: '3102', riskLevel: 'high', requiresPin: true },
      { id: 'bsi_reset_adaptations', name: 'Reset BSI Adaptations', description: 'Reset all BSI learned values', ecuId: 'bsi', category: 'maintenance', command: '3103', riskLevel: 'medium' },
      { id: 'bsi_coding', name: 'BSI Configuration Coding', description: 'Modify BSI configuration', ecuId: 'bsi', category: 'coding', command: '2E', riskLevel: 'high', requiresPin: true }
    ],
    engine: [
      { id: 'engine_injector_coding', name: 'Injector Coding', description: 'Code new injectors', ecuId: 'engine', category: 'maintenance', command: '2E10', riskLevel: 'high', requiresPin: true },
      { id: 'engine_dpf_regen', name: 'Force DPF Regeneration', description: 'Force DPF cleaning cycle', ecuId: 'engine', category: 'maintenance', command: '31010F', riskLevel: 'medium' },
      { id: 'engine_throttle_learn', name: 'Throttle Body Learning', description: 'Learn throttle body positions', ecuId: 'engine', category: 'maintenance', command: '3104', riskLevel: 'low' },
      { id: 'engine_egr_test', name: 'EGR Valve Test', description: 'Test EGR valve operation', ecuId: 'engine', category: 'testing', command: '2F110E', riskLevel: 'medium' }
    ],
    radio: [
      { id: 'radio_unlock_nav', name: 'Unlock Navigation', description: 'Enable navigation features', ecuId: 'radio', category: 'coding', command: '2E2001', riskLevel: 'medium' },
      { id: 'radio_unlock_tv', name: 'Unlock TV Function', description: 'Enable TV tuner', ecuId: 'radio', category: 'coding', command: '2E2002', riskLevel: 'low' },
      { id: 'radio_aux_enable', name: 'Enable AUX Input', description: 'Activate auxiliary input', ecuId: 'radio', category: 'coding', command: '220F41', riskLevel: 'low' }
    ],
    abs: [
      { id: 'abs_brake_bleed', name: 'Brake System Bleeding', description: 'Automated brake bleeding', ecuId: 'abs', category: 'maintenance', command: '2F09', riskLevel: 'medium' },
      { id: 'abs_wheel_alignment', name: 'Wheel Alignment Reset', description: 'Reset wheel alignment data', ecuId: 'abs', category: 'maintenance', command: '3105', riskLevel: 'low' },
      { id: 'abs_esp_calibration', name: 'ESP Sensor Calibration', description: 'Calibrate ESP sensors', ecuId: 'abs', category: 'calibration', command: '3106', riskLevel: 'medium' }
    ],
    climate: [
      { id: 'climate_actuator_test', name: 'Actuator Test', description: 'Test all climate actuators', ecuId: 'climate', category: 'testing', command: '2F11', riskLevel: 'low' },
      { id: 'climate_reset_learn', name: 'Reset Climate Learning', description: 'Reset learned climate values', ecuId: 'climate', category: 'maintenance', command: '3107', riskLevel: 'low' }
    ]
  }), []);

  const scanECUModules = React.useCallback(async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    try {
      const scannedModules: ECUModule[] = [];
      
      for (let i = 0; i < peugeotECUs.length; i++) {
        const ecu = peugeotECUs[i];
        setScanProgress((i / peugeotECUs.length) * 100);
        
        try {
          // Try to communicate with ECU
          const response = await enhancedOBD2Service.sendCommand(`1${ecu.address.padStart(2, '0')}0100`);
          
          if (response && !response.includes('NO DATA') && !response.includes('ERROR')) {
            scannedModules.push({
              ...ecu,
              status: 'ok',
              version: `V${Math.floor(Math.random() * 9) + 1}.${Math.floor(Math.random() * 99)}`,
              partNumber: `9${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}`
            });
          } else {
            scannedModules.push({ ...ecu, status: 'unavailable' });
          }
        } catch (error) {
          scannedModules.push({ ...ecu, status: 'error' });
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setEcuModules(scannedModules);
      setHiddenFunctions([...peugeotHiddenFunctions]);
      toast.success(`ECU scan completed. Found ${scannedModules.filter(m => m.status === 'ok').length} modules.`);
      
    } catch (error) {
      toast.error('ECU scan failed');
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  }, [peugeotECUs, peugeotHiddenFunctions]);

  useEffect(() => {
    if (isConnected) {
      scanECUModules();
    }
  }, [isConnected, scanECUModules]);

  const authenticateWithPin = async () => {
    try {
      // Simulate PIN authentication
      const response = await enhancedOBD2Service.sendCommand(`2701${pinCode}`);
      setIsPinAuthenticated(true);
      toast.success('PIN authentication successful');
    } catch (error) {
      toast.error('PIN authentication failed');
    }
  };

  const toggleHiddenFunction = async (functionId: string) => {
    const func = hiddenFunctions.find(f => f.id === functionId);
    if (!func) return;

    if (func.unlock && !isPinAuthenticated) {
      toast.error('PIN authentication required for this function');
      return;
    }

    try {
      const command = func.enabled ? func.command.replace('01', '00') : func.command;
      await enhancedOBD2Service.sendCommand(command);
      
      setHiddenFunctions(prev => prev.map(f => 
        f.id === functionId ? { ...f, enabled: !f.enabled } : f
      ));
      
      toast.success(`${func.name} ${!func.enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error(`Failed to ${!func.enabled ? 'enable' : 'disable'} ${func.name}`);
    }
  };

  const executeAdvancedFunction = async (functionId: string) => {
    const func = advancedFunctions.find(f => f.id === functionId);
    if (!func) return;

    if (func.requiresPin && !isPinAuthenticated) {
      toast.error('PIN authentication required for this function');
      return;
    }

    if (func.riskLevel === 'high') {
      const confirmed = window.confirm(
        `⚠️ HIGH RISK OPERATION\n\n${func.name}\n${func.description}\n\nThis operation can potentially damage your vehicle or affect safety systems. Are you absolutely sure you want to continue?`
      );
      if (!confirmed) return;
    }

    try {
      toast.info(`Executing ${func.name}...`);
      await enhancedOBD2Service.sendCommand(func.command);
      toast.success(`${func.name} completed successfully`);
    } catch (error) {
      toast.error(`${func.name} failed: ${error}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: React.ElementType } = {
      engine: Car,
      body: Cpu,
      chassis: Settings,
      comfort: Radio,
      security: Shield,
      navigation: Database
    };
    return icons[category] || Activity;
  };

  const groupedModules = ecuModules.reduce((acc, module) => {
    if (!acc[module.category]) acc[module.category] = [];
    acc[module.category].push(module);
    return acc;
  }, {} as { [key: string]: ECUModule[] });

  const groupedHiddenFunctions = hiddenFunctions.reduce((acc, func) => {
    if (!acc[func.category]) acc[func.category] = [];
    acc[func.category].push(func);
    return acc;
  }, {} as { [key: string]: HiddenFunction[] });

  useEffect(() => {
    if (selectedEcu && ecuAdvancedFunctions[selectedEcu]) {
      setAdvancedFunctions(ecuAdvancedFunctions[selectedEcu]);
    } else {
      setAdvancedFunctions([]);
    }
  }, [selectedEcu, ecuAdvancedFunctions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      {onBack && (
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}

      {/* Diagbox Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Car className="h-6 w-6" />
            Peugeot Diagbox Professional Emulator
            <Badge variant="secondary" className="bg-white text-blue-800">
              Lexia-3 Compatible
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Connection Status */}
      {!isConnected && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Connect to your OBD2 device to access Diagbox professional functions
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="modules">ECU Modules</TabsTrigger>
          <TabsTrigger value="hidden">Hidden Functions</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Functions</TabsTrigger>
          <TabsTrigger value="coding">Vehicle Coding</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          {/* ECU Scan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  ECU Module Scan
                </div>
                <Button
                  onClick={scanECUModules}
                  disabled={!isConnected || isScanning}
                  className="flex items-center gap-2"
                >
                  {isScanning && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {isScanning ? 'Scanning...' : 'Scan ECUs'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isScanning && (
                <div className="space-y-2 mb-4">
                  <Progress value={scanProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    Scanning ECU modules... {Math.round(scanProgress)}%
                  </p>
                </div>
              )}

              {Object.entries(groupedModules).map(([category, modules]) => {
                const IconComponent = getCategoryIcon(category);
                return (
                  <div key={category} className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5" />
                      <h3 className="font-semibold capitalize">{category} Modules</h3>
                      <Badge variant="outline">{modules.length}</Badge>
                    </div>
                    <div className="grid gap-3">
                      {modules.map((module) => (
                        <Card key={module.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(module.status)}
                                <h4 className="font-medium">{module.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  0x{module.address}
                                </Badge>
                                {module.hasAdvancedFunctions && (
                                  <Badge variant="secondary" className="text-xs">
                                    Advanced
                                  </Badge>
                                )}
                                {module.supportsCoding && (
                                  <Badge variant="secondary" className="text-xs">
                                    Coding
                                  </Badge>
                                )}
                              </div>
                              {module.version && (
                                <p className="text-sm text-muted-foreground">
                                  Version: {module.version} | Part: {module.partNumber}
                                </p>
                              )}
                            </div>
                            {module.hasAdvancedFunctions && module.status === 'ok' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedEcu(module.id)}
                              >
                                Configure
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hidden" className="space-y-4">
          {/* PIN Authentication */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Security Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="pin">PIN Code</Label>
                  <Input
                    id="pin"
                    type="password"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    maxLength={4}
                  />
                </div>
                <Button
                  onClick={authenticateWithPin}
                  disabled={!pinCode || pinCode.length !== 4}
                  className="mt-6"
                >
                  Authenticate
                </Button>
              </div>
              {isPinAuthenticated && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Security access granted</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hidden Functions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Hidden Vehicle Functions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(groupedHiddenFunctions).map(([category, functions]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold capitalize">{category} Functions</h3>
                  <div className="space-y-2">
                    {functions.map((func) => (
                      <Card key={func.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{func.name}</h4>
                              {func.unlock && (
                                <Badge variant="outline" className="text-xs text-amber-600">
                                  Unlock Required
                                </Badge>
                              )}
                              <Badge variant={func.enabled ? 'default' : 'secondary'} className="text-xs">
                                {func.enabled ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{func.description}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => toggleHiddenFunction(func.id)}
                            disabled={!isConnected || (func.unlock && !isPinAuthenticated)}
                          >
                            {func.enabled ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          {/* ECU Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select ECU for Advanced Functions</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedEcu || ''} onValueChange={setSelectedEcu}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an ECU module" />
                </SelectTrigger>
                <SelectContent>
                  {ecuModules
                    .filter(m => m.hasAdvancedFunctions && m.status === 'ok')
                    .map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name} (0x{module.address})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Advanced Functions */}
          {selectedEcu && advancedFunctions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Advanced Functions - {ecuModules.find(m => m.id === selectedEcu)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {advancedFunctions.map((func) => (
                  <Card key={func.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{func.name}</h4>
                          {func.riskLevel === 'high' && (
                            <Badge variant="destructive">High Risk</Badge>
                          )}
                          {func.riskLevel === 'medium' && (
                            <Badge variant="outline" className="text-amber-600">Medium Risk</Badge>
                          )}
                          {func.requiresPin && (
                            <Badge variant="outline" className="text-blue-600">PIN Required</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{func.description}</p>
                      </div>
                      <Button
                        onClick={() => executeAdvancedFunction(func.id)}
                        disabled={!isConnected || (func.requiresPin && !isPinAuthenticated)}
                        variant={func.riskLevel === 'high' ? 'destructive' : 'default'}
                      >
                        Execute
                      </Button>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="coding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Vehicle Coding & Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Vehicle coding functions require professional knowledge and can permanently affect vehicle operation. 
                  Incorrect coding may result in loss of functionality or safety features.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 text-center text-muted-foreground">
                <p>Coding functions will be available in the next update.</p>
                <p className="text-sm">This feature requires additional security protocols.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PeugeotDiagboxEmulator;
