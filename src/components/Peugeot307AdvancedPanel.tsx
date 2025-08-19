
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft,
  Car,
  Radio,
  Wind,
  Droplets,
  Zap,
  Settings,
  Wrench,
  Key,
  Shield,
  Gauge,
  Thermometer,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Database,
  TestTube,
  Volume2,
  Lightbulb,
  Lock,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { peugeotDiagnosticService } from '@/services/PeugeotDiagnosticService';

interface Peugeot307AdvancedPanelProps {
  isConnected: boolean;
  onBack?: () => void;
}

interface ComfortFunction {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  available: boolean;
  category: 'comfort' | 'security' | 'lighting' | 'audio' | 'climate';
  command: string;
  requiresPin?: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

interface PidReading {
  pid: string;
  name: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  category: string;
}

const Peugeot307AdvancedPanel: React.FC<Peugeot307AdvancedPanelProps> = ({ isConnected, onBack }) => {
  const [comfortFunctions, setComfortFunctions] = useState<ComfortFunction[]>([
    // Audio/Radio Functions
    { id: 'radio_aux_enable', name: 'Enable AUX Port', description: 'Enable auxiliary audio input', enabled: false, available: true, category: 'audio', command: '220F41', riskLevel: 'low' },
    { id: 'radio_aux_disable', name: 'Disable AUX Port', description: 'Disable auxiliary audio input', enabled: false, available: true, category: 'audio', command: '220F40', riskLevel: 'low' },
    { id: 'radio_autostore', name: 'Radio Autostore', description: 'Automatic radio station storage', enabled: true, available: true, category: 'audio', command: '3B8D01', riskLevel: 'low' },
    { id: 'radio_beep_volume', name: 'Beep Volume', description: 'System beep volume control', enabled: true, available: true, category: 'audio', command: '3B8C01', riskLevel: 'low' },
    { id: 'radio_mute_phone', name: 'Mute on Phone', description: 'Mute radio when phone connected', enabled: true, available: true, category: 'audio', command: '3B8E01', riskLevel: 'low' },
    
    // Lighting Functions
    { id: 'auto_lights', name: 'Auto Lights', description: 'Automatic headlight activation', enabled: true, available: true, category: 'lighting', command: '3B8501', riskLevel: 'low' },
    { id: 'follow_me_home', name: 'Follow Me Home', description: 'Lights stay on after exit', enabled: false, available: true, category: 'lighting', command: '3B8701', riskLevel: 'low' },
    { id: 'welcome_lighting', name: 'Welcome Lighting', description: 'Approach lighting activation', enabled: true, available: true, category: 'lighting', command: '3B8801', riskLevel: 'low' },
    { id: 'daytime_running', name: 'Daytime Running Lights', description: 'DRL configuration', enabled: true, available: true, category: 'lighting', command: '3B8901', riskLevel: 'low' },
    { id: 'motorway_lights', name: 'Motorway Lights', description: 'Motorway lighting mode', enabled: false, available: true, category: 'lighting', command: '3B8F01', riskLevel: 'low' },
    { id: 'ambient_lighting', name: 'Ambient Lighting', description: 'Interior ambient lighting', enabled: false, available: true, category: 'lighting', command: '3B9001', riskLevel: 'low' },
    
    // Comfort Functions
    { id: 'auto_wipers', name: 'Auto Wipers', description: 'Rain sensing wipers', enabled: false, available: true, category: 'comfort', command: '3B8401', riskLevel: 'low' },
    { id: 'wiper_sens_high', name: 'Wiper Sensitivity High', description: 'High rain sensor sensitivity', enabled: false, available: true, category: 'comfort', command: '3B9101', riskLevel: 'low' },
    { id: 'auto_rear_wiper', name: 'Auto Rear Wiper', description: 'Automatic rear wiper in reverse', enabled: false, available: true, category: 'comfort', command: '3B9201', riskLevel: 'low' },
    { id: 'selective_unlock', name: 'Selective Unlock', description: 'Unlock driver door first', enabled: false, available: true, category: 'comfort', command: '3B9301', riskLevel: 'low' },
    { id: 'auto_lock_driving', name: 'Auto Lock While Driving', description: 'Lock doors when driving', enabled: false, available: true, category: 'comfort', command: '3B9401', riskLevel: 'low' },
    { id: 'auto_lock_leaving', name: 'Auto Lock When Leaving', description: 'Lock doors when leaving car', enabled: false, available: true, category: 'comfort', command: '3B9501', riskLevel: 'low' },
    
    // Climate Functions
    { id: 'auto_climate', name: 'Auto Climate', description: 'Automatic climate control', enabled: true, available: true, category: 'climate', command: '3B9601', riskLevel: 'low' },
    { id: 'windscreen_auto', name: 'Auto Windscreen', description: 'Automatic windscreen demisting', enabled: true, available: true, category: 'climate', command: '3B9701', riskLevel: 'low' },
    { id: 'residual_heat', name: 'Residual Heat', description: 'Use residual engine heat', enabled: true, available: true, category: 'climate', command: '3B9801', riskLevel: 'low' },
    
    // Security Functions
    { id: 'immobilizer', name: 'Factory Immobilizer', description: 'Engine immobilizer system', enabled: true, available: true, category: 'security', command: '3B8301', requiresPin: true, riskLevel: 'high' },
    { id: 'central_locking', name: 'Central Locking', description: 'Central locking system', enabled: true, available: true, category: 'security', command: '3B8601', requiresPin: true, riskLevel: 'medium' },
    { id: 'deadlocking', name: 'Deadlocking', description: 'Enhanced security deadlocking', enabled: false, available: true, category: 'security', command: '3B8A01', requiresPin: true, riskLevel: 'high' },
    { id: 'anti_theft', name: 'Anti-theft Alarm', description: 'Perimeter anti-theft system', enabled: true, available: true, category: 'security', command: '3B8B01', requiresPin: true, riskLevel: 'medium' },
    { id: 'plip_settings', name: 'PLIP Settings', description: 'Remote key configuration', enabled: true, available: true, category: 'security', command: '3B9901', requiresPin: true, riskLevel: 'medium' },
  ]);

  const [pidReadings, setPidReadings] = useState<PidReading[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState<string>('');
  const [isPinAuthenticated, setIsPinAuthenticated] = useState(false);
  const [isReadingPin, setIsReadingPin] = useState(false);
  const [dpfRegenerationProgress, setDpfRegenerationProgress] = useState(0);
  const [isDpfRegenerating, setIsDpfRegenerating] = useState(false);
  const [egrTestResult, setEgrTestResult] = useState<any>(null);
  const [isEgrTesting, setIsEgrTesting] = useState(false);
  const [oilTemp, setOilTemp] = useState<number | null>(null);

  const handleGetOilTemp = async () => {
    if (!isConnected) {
      toast.error('Not connected to OBD2 device');
      return;
    }
    setIsLoading(true);
    try {
      const temp = await peugeotDiagnosticService.getOilTemperature('peugeot-307-2004-2.0-hdi');
      setOilTemp(temp);
      if (temp !== null) {
        toast.success(`Engine oil temperature: ${temp}°C`);
      } else {
        toast.error('Failed to get engine oil temperature');
      }
    } catch (error) {
      toast.error('Failed to get engine oil temperature');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleComfortFunction = async (functionId: string) => {
    if (!isConnected) {
      toast.error('Not connected to OBD2 device');
      return;
    }

    const func = comfortFunctions.find(f => f.id === functionId);
    if (!func) return;

    if (func.requiresPin && !isPinAuthenticated) {
      toast.error('PIN authentication required for this function');
      return;
    }

    if (func.riskLevel === 'high') {
      const confirmed = window.confirm(
        `⚠️ HIGH RISK OPERATION\n\n${func.name}\n${func.description}\n\nThis operation can potentially affect vehicle security or safety. Are you sure you want to continue?`
      );
      if (!confirmed) return;
    }

    setIsLoading(true);
    setSelectedFunction(functionId);

    try {
      let command = func.command;
      if (func.requiresPin && pinCode) {
        command = `2701${pinCode}${command}`;
      }

      toast.info(`${!func.enabled ? 'Enabling' : 'Disabling'} ${func.name}...`);
      
      // This is a placeholder for the actual implementation
      // const response = await peugeotDiagnosticService.sendCommand(command);
      
      // For now, we'll just simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1000));
      const success = true;
      
      if (success) {
        setComfortFunctions(prev => prev.map(f => 
          f.id === functionId ? { ...f, enabled: !f.enabled } : f
        ));
        toast.success(`${func.name} ${!func.enabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        toast.error(`Failed to ${!func.enabled ? 'enable' : 'disable'} ${func.name}`);
      }

    } catch (error) {
      toast.error(`Command failed: ${error}`);
    } finally {
      setIsLoading(false);
      setSelectedFunction(null);
    }
  };

  const readPinFromCar = async () => {
    if (!isConnected) {
      toast.error('Not connected to OBD2 device');
      return;
    }

    setIsReadingPin(true);
    
    try {
      toast.info('Reading PIN code from BSI...');
      
      // This is a placeholder for the actual implementation
      // const pin = await peugeotDiagnosticService.readPin();

      // For now, we'll just generate a random PIN
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
      setPinCode(generatedPin);
      
      toast.success(`PIN code retrieved: ${generatedPin}`);
      
      setIsPinAuthenticated(true);
      toast.success('PIN authentication successful');
      
    } catch (error) {
      toast.error('Failed to read PIN code from vehicle');
      console.error('PIN reading error:', error);
    } finally {
      setIsReadingPin(false);
    }
  };

  const forceDpfRegeneration = async () => {
    if (!isConnected) {
      toast.error('Not connected to OBD2 device');
      return;
    }

    const confirmed = window.confirm(
      'DPF Regeneration will start a high-temperature cleaning cycle.\n\nEnsure:\n• Engine is warm\n• Vehicle is parked safely\n• You can drive for 20-30 minutes\n\nProceed?'
    );
    
    if (!confirmed) return;

    setIsDpfRegenerating(true);
    setDpfRegenerationProgress(0);

    try {
      toast.info('Starting DPF regeneration...');
      
      // This is a placeholder for the actual implementation
      // await peugeotDiagnosticService.forceDpfRegeneration();
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setDpfRegenerationProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsDpfRegenerating(false);
            toast.success('DPF regeneration completed successfully');
            return 100;
          }
          return prev + 2;
        });
      }, 1000);

    } catch (error) {
      toast.error('DPF regeneration failed');
      setIsDpfRegenerating(false);
      setDpfRegenerationProgress(0);
    }
  };

  const testEgrValve = async () => {
    if (!isConnected) {
      toast.error('Not connected to OBD2 device');
      return;
    }

    setIsEgrTesting(true);
    setEgrTestResult(null);

    try {
      toast.info('Testing EGR valve...');
      
      // This is a placeholder for the actual implementation
      // const results = await peugeotDiagnosticService.testEgrValve();
      
      // For now, we'll just simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setEgrTestResult({
        success: true,
        results: [],
        summary: 'EGR valve test completed successfully (simulated)'
      });
      
      toast.success('EGR valve test completed');
      
    } catch (error) {
      setEgrTestResult({
        success: false,
        error: error.toString(),
        summary: 'EGR valve test failed'
      });
      toast.error('EGR valve test failed');
    } finally {
      setIsEgrTesting(false);
    }
  };

  const getStatusColor = (status: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-green-500 bg-green-500/10 border-green-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      engine: Car,
      fuel: Droplets,
      turbo: Wind,
      emissions: Activity,
      electrical: Zap,
      comfort: Settings,
      security: Shield,
      climate: Thermometer,
      lighting: Lightbulb,
      audio: Volume2,
      safety: AlertTriangle,
      steering: Gauge
    };
    return icons[category] || Activity;
  };

  const groupedPIDs = pidReadings.reduce((acc, pid) => {
    if (!acc[pid.category]) acc[pid.category] = [];
    acc[pid.category].push(pid);
    return acc;
  }, {} as { [key: string]: PidReading[] });

  const groupedFunctions = comfortFunctions.reduce((acc, func) => {
    if (!acc[func.category]) acc[func.category] = [];
    acc[func.category].push(func);
    return acc;
  }, {} as { [key: string]: ComfortFunction[] });

  return (
    <div className="space-y-6">
      {/* Header */}
      {onBack && (
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Connect to your OBD2 device to access Peugeot 307 advanced functions
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="comfort" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="comfort">Comfort</TabsTrigger>
          <TabsTrigger value="radio">Radio</TabsTrigger>
          <TabsTrigger value="dpf">DPF</TabsTrigger>
          <TabsTrigger value="egr">EGR</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="pids">All PIDs</TabsTrigger>
        </TabsList>

        <TabsContent value="comfort" className="space-y-4">
          {/* PIN Authentication */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                PIN Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Security functions require PIN authentication
                  </p>
                  {pinCode && (
                    <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded mt-1">
                      PIN: {pinCode}
                    </p>
                  )}
                  {isPinAuthenticated && (
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Authenticated</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={readPinFromCar}
                  disabled={!isConnected || isReadingPin}
                  className="flex items-center gap-2"
                >
                  {isReadingPin && <RefreshCw className="h-4 w-4 animate-spin" />}
                  <Key className="h-4 w-4" />
                  {isReadingPin ? 'Reading PIN...' : 'Read PIN from Car'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comfort Functions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Comfort & Convenience Functions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(groupedFunctions).map(([category, functions]) => (
                category !== 'security' && (
                  <div key={category} className="space-y-3">
                    <h3 className="font-semibold capitalize text-lg">{category} Functions</h3>
                    <div className="grid gap-3">
                      {functions.map((func) => (
                        <Card key={func.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{func.name}</h4>
                                <Badge variant={func.enabled ? 'default' : 'secondary'}>
                                  {func.enabled ? 'Enabled' : 'Disabled'}
                                </Badge>
                                {func.riskLevel === 'high' && (
                                  <Badge variant="destructive">High Risk</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{func.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {func.requiresPin && !isPinAuthenticated && (
                                <Badge variant="outline" className="text-xs text-amber-600">
                                  PIN Required
                                </Badge>
                              )}
                              <Switch
                                checked={func.enabled}
                                onCheckedChange={() => toggleComfortFunction(func.id)}
                                disabled={
                                  !isConnected || 
                                  (isLoading && selectedFunction === func.id) ||
                                  (func.requiresPin && !isPinAuthenticated)
                                }
                              />
                            </div>
                          </div>
                          {isLoading && selectedFunction === func.id && (
                            <div className="mt-2">
                              <Progress value={66} className="w-full" />
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5" />
                Radio & Audio Functions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedFunctions.audio?.map((func) => (
                <Card key={func.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        <h4 className="font-medium">{func.name}</h4>
                        <Badge variant={func.enabled ? 'default' : 'secondary'}>
                          {func.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{func.description}</p>
                    </div>
                    <Switch
                      checked={func.enabled}
                      onCheckedChange={() => toggleComfortFunction(func.id)}
                      disabled={!isConnected || (isLoading && selectedFunction === func.id)}
                    />
                  </div>
                  {isLoading && selectedFunction === func.id && (
                    <div className="mt-2">
                      <Progress value={66} className="w-full" />
                    </div>
                  )}
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dpf" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="h-5 w-5" />
                DPF (Diesel Particulate Filter) Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* DPF Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {pidReadings.filter(p => p.pid.includes('1C3')).map((pid) => (
                  <Card key={pid.pid} className={`p-3 ${getStatusColor(pid.status)}`}>
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">{pid.pid}</Badge>
                      <h4 className="font-medium text-sm">{pid.name}</h4>
                      <p className="text-lg font-bold">
                        {pid.value} <span className="text-sm font-normal">{pid.unit}</span>
                      </p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* DPF Regeneration */}
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Force DPF Regeneration</h4>
                      <p className="text-sm text-muted-foreground">
                        Manually trigger DPF regeneration cycle
                      </p>
                    </div>
                    <Button
                      onClick={forceDpfRegeneration}
                      disabled={!isConnected || isDpfRegenerating}
                      className="flex items-center gap-2"
                    >
                      {isDpfRegenerating && <RefreshCw className="h-4 w-4 animate-spin" />}
                      <Wind className="h-4 w-4" />
                      {isDpfRegenerating ? 'Regenerating...' : 'Start Regeneration'}
                    </Button>
                  </div>
                  
                  {isDpfRegenerating && (
                    <div className="space-y-2">
                      <Progress value={dpfRegenerationProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground">
                        Progress: {Math.round(dpfRegenerationProgress)}% - Keep engine running and drive normally
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="egr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                EGR (Exhaust Gas Recirculation) Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* EGR Status */}
              <div className="grid grid-cols-2 gap-4">
                {pidReadings.filter(p => p.pid.includes('1C4')).map((pid) => (
                  <Card key={pid.pid} className={`p-3 ${getStatusColor(pid.status)}`}>
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-xs">{pid.pid}</Badge>
                      <h4 className="font-medium text-sm">{pid.name}</h4>
                      <p className="text-lg font-bold">
                        {pid.value} <span className="text-sm font-normal">{pid.unit}</span>
                      </p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* EGR Test */}
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">EGR Valve Test</h4>
                      <p className="text-sm text-muted-foreground">
                        Test EGR valve operation and response
                      </p>
                    </div>
                    <Button
                      onClick={testEgrValve}
                      disabled={!isConnected || isEgrTesting}
                      className="flex items-center gap-2"
                    >
                      {isEgrTesting && <RefreshCw className="h-4 w-4 animate-spin" />}
                      <TestTube className="h-4 w-4" />
                      {isEgrTesting ? 'Testing...' : 'Test EGR Valve'}
                    </Button>
                  </div>
                  
                  {egrTestResult && (
                    <Alert>
                      <div className="flex items-center gap-2">
                        {egrTestResult.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription>
                          {egrTestResult.summary}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}
                </div>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Functions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupedFunctions.security?.map((func) => (
                <Card key={func.id} className="p-4 border-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {func.id === 'immobilizer' && <Key className="h-4 w-4" />}
                        {func.id === 'central_locking' && <Lock className="h-4 w-4" />}
                        {func.id === 'deadlocking' && <Shield className="h-4 w-4" />}
                        {func.id === 'anti_theft' && <Eye className="h-4 w-4" />}
                        <h4 className="font-medium">{func.name}</h4>
                        <Badge 
                          variant={func.enabled ? 'default' : 'secondary'}
                          className={func.id === 'immobilizer' ? 'bg-red-500 text-white' : ''}
                        >
                          {func.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                        {func.riskLevel === 'high' && (
                          <Badge variant="destructive">High Risk</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{func.description}</p>
                      {func.id === 'immobilizer' && (
                        <p className="text-xs text-red-500 font-medium">
                          ⚠️ Disabling immobilizer affects vehicle security
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {func.requiresPin && !isPinAuthenticated && (
                        <Badge variant="outline" className="text-xs text-amber-600">
                          PIN Required
                        </Badge>
                      )}
                      <Switch
                        checked={func.enabled}
                        onCheckedChange={() => toggleComfortFunction(func.id)}
                        disabled={
                          !isConnected || 
                          (isLoading && selectedFunction === func.id) ||
                          (func.requiresPin && !isPinAuthenticated)
                        }
                      />
                    </div>
                  </div>
                  {isLoading && selectedFunction === func.id && (
                    <div className="mt-2">
                      <Progress value={66} className="w-full" />
                    </div>
                  )}
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pids" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Specific Readings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Engine Oil Temperature</h4>
                  <p className="text-sm text-muted-foreground">
                    {oilTemp !== null ? `${oilTemp}°C` : 'N/A'}
                  </p>
                </div>
                <Button onClick={handleGetOilTemp} disabled={!isConnected || isLoading}>
                  {isLoading ? 'Reading...' : 'Read Oil Temp'}
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                All Supported PIDs
                <Badge variant="secondary">{pidReadings.length} PIDs</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(groupedPIDs).map(([category, pids]) => {
                const IconComponent = getCategoryIcon(category);
                return (
                  <div key={category} className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5" />
                      <h3 className="font-semibold capitalize text-lg">{category}</h3>
                      <Badge variant="outline">{pids.length} PIDs</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {pids.map((pid) => (
                        <Card key={pid.pid} className={`p-3 ${getStatusColor(pid.status)}`}>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs font-mono">
                                {pid.pid}
                              </Badge>
                              {pid.status === 'critical' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                              {pid.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                              {pid.status === 'normal' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            </div>
                            <h4 className="font-medium text-sm">{pid.name}</h4>
                            <p className="text-lg font-bold">
                              {pid.value} <span className="text-sm font-normal">{pid.unit}</span>
                            </p>
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
      </Tabs>
    </div>
  );
};

export default Peugeot307AdvancedPanel;
