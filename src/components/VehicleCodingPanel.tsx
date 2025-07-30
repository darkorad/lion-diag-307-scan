import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  Eye,
  EyeOff,
  Code,
  Lightbulb,
  Volume2,
  Lock,
  Unlock,
  Zap,
  Car,
  Shield,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VehicleCodingPanelProps {
  isConnected: boolean;
  vehicleInfo?: Record<string, unknown>;
}

const VehicleCodingPanel: React.FC<VehicleCodingPanelProps> = ({ isConnected }) => {
  const [isCoding, setIsCoding] = useState(false);
  const [currentModule, setCurrentModule] = useState('bcm');
  const [codingProgress, setCodingProgress] = useState(0);
  const [hiddenFeatures, setHiddenFeatures] = useState<{ [key: string]: boolean }>({});
  const [customValues, setCustomValues] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const vehicleModules = React.useMemo(() => [
    {
      id: 'bcm',
      name: 'Body Control Module',
      description: 'Lighting, windows, central locking',
      icon: <Car className="h-5 w-5" />,
      features: [
        { id: 'daytime_led', name: 'Daytime Running LEDs', type: 'boolean', value: false },
        { id: 'cornering_lights', name: 'Cornering Lights', type: 'boolean', value: false },
        { id: 'auto_lock_speed', name: 'Auto Lock Speed (km/h)', type: 'number', value: '15' },
        { id: 'comfort_blinker', name: 'Comfort Turn Signal', type: 'select', options: ['Off', '3 Blinks', '5 Blinks'], value: 'Off' },
        { id: 'windows_remote', name: 'Remote Window Control', type: 'boolean', value: false },
        { id: 'mirror_fold', name: 'Auto Mirror Folding', type: 'boolean', value: false }
      ]
    },
    {
      id: 'instrument',
      name: 'Instrument Cluster',
      description: 'Dashboard display and warnings',
      icon: <Gauge className="h-5 w-5" />,
      features: [
        { id: 'digital_speed', name: 'Digital Speed Display', type: 'boolean', value: false },
        { id: 'needle_sweep', name: 'Needle Sweep Test', type: 'boolean', value: false },
        { id: 'fuel_range', name: 'Fuel Range Display', type: 'boolean', value: true },
        { id: 'service_display', name: 'Service Interval Display', type: 'select', options: ['Time', 'Distance', 'Both'], value: 'Both' },
        { id: 'ambient_light', name: 'Ambient Light Color', type: 'select', options: ['White', 'Blue', 'Red', 'Green'], value: 'White' }
      ]
    },
    {
      id: 'infotainment',
      name: 'Infotainment System',
      description: 'Media, navigation, connectivity',
      icon: <Volume2 className="h-5 w-5" />,
      features: [
        { id: 'tv_function', name: 'TV Function (where legal)', type: 'boolean', value: false },
        { id: 'video_motion', name: 'Video in Motion', type: 'boolean', value: false },
        { id: 'logo_delete', name: 'Remove Startup Logo', type: 'boolean', value: false },
        { id: 'dvd_region', name: 'DVD Region', type: 'select', options: ['Region 1', 'Region 2', 'Multi-Region'], value: 'Region 2' },
        { id: 'bluetooth_name', name: 'Bluetooth Device Name', type: 'text', value: 'My Vehicle' }
      ]
    },
    {
      id: 'engine',
      name: 'Engine Control Unit',
      description: 'Engine performance parameters',
      icon: <Zap className="h-5 w-5" />,
      features: [
        { id: 'start_stop', name: 'Start/Stop System', type: 'boolean', value: true },
        { id: 'eco_mode', name: 'ECO Mode Default', type: 'boolean', value: false },
        { id: 'sport_mode', name: 'Sport Mode Available', type: 'boolean', value: false },
        { id: 'rev_limit', name: 'Rev Limiter (RPM)', type: 'number', value: '6500' },
        { id: 'idle_speed', name: 'Idle Speed (RPM)', type: 'number', value: '800' }
      ]
    },
    {
      id: 'comfort',
      name: 'Comfort Module',
      description: 'Convenience and comfort features',
      icon: <Settings className="h-5 w-5" />,
      features: [
        { id: 'coming_home', name: 'Coming Home Lights (sec)', type: 'number', value: '30' },
        { id: 'leaving_home', name: 'Leaving Home Lights (sec)', type: 'number', value: '30' },
        { id: 'auto_climate', name: 'Auto Climate on Start', type: 'boolean', value: false },
        { id: 'seat_memory', name: 'Seat Memory Function', type: 'boolean', value: false },
        { id: 'keyless_lock', name: 'Keyless Central Locking', type: 'boolean', value: false }
      ]
    },
    {
      id: 'security',
      name: 'Security & Access',
      description: 'Anti-theft and access control',
      icon: <Shield className="h-5 w-5" />,
      features: [
        { id: 'alarm_horn', name: 'Alarm Horn Sound', type: 'boolean', value: true },
        { id: 'immobilizer', name: 'Engine Immobilizer', type: 'boolean', value: true },
        { id: 'auto_relock', name: 'Auto Re-lock Time (sec)', type: 'number', value: '60' },
        { id: 'panic_mode', name: 'Panic Mode Function', type: 'boolean', value: true },
        { id: 'perimeter_alarm', name: 'Perimeter Alarm', type: 'boolean', value: false }
      ]
    }
  ], []);

  const loadCurrentCoding = React.useCallback(async () => {
    // Simulate loading current vehicle coding
    const module = vehicleModules.find(m => m.id === currentModule);
    if (module) {
      const features: { [key: string]: boolean } = {};
      const values: { [key: string]: string } = {};
      
      module.features.forEach(feature => {
        if (feature.type === 'boolean') {
          features[feature.id] = feature.value as boolean;
        } else {
          values[feature.id] = feature.value as string;
        }
      });
      
      setHiddenFeatures(features);
      setCustomValues(values);
    }
  }, [currentModule, vehicleModules]);

  useEffect(() => {
    if (isConnected) {
      loadCurrentCoding();
    }
  }, [isConnected, loadCurrentCoding]);

  const applyVehicleCoding = async () => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to your vehicle first",
        variant: "destructive"
      });
      return;
    }

    setIsCoding(true);
    setCodingProgress(0);

    try {
      // Simulate coding progress
      const progressInterval = setInterval(() => {
        setCodingProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);

      // Simulate actual coding procedure
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      clearInterval(progressInterval);
      setCodingProgress(100);
      
      toast({
        title: "Coding Applied",
        description: `Successfully applied coding to ${vehicleModules.find(m => m.id === currentModule)?.name}`,
      });

    } catch (error) {
      toast({
        title: "Coding Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCoding(false);
      setTimeout(() => setCodingProgress(0), 2000);
    }
  };

  const resetToFactory = async () => {
    if (!isConnected) return;

    setIsCoding(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Reset to factory defaults
      const module = vehicleModules.find(m => m.id === currentModule);
      if (module) {
        const features: { [key: string]: boolean } = {};
        const values: { [key: string]: string } = {};
        
        module.features.forEach(feature => {
          if (feature.type === 'boolean') {
            features[feature.id] = feature.value as boolean;
          } else {
            values[feature.id] = feature.value as string;
          }
        });
        
        setHiddenFeatures(features);
        setCustomValues(values);
      }
      
      toast({
        title: "Factory Reset Complete",
        description: "Module coding reset to factory defaults",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset to factory defaults",
        variant: "destructive"
      });
    } finally {
      setIsCoding(false);
    }
  };

  const renderFeatureControl = (feature: {
    id: string;
    name: string;
    type: string;
    value: string | boolean;
    options?: string[];
  }) => {
    const module = vehicleModules.find(m => m.id === currentModule);
    if (!module) return null;

    switch (feature.type) {
      case 'boolean':
        return (
          <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-1">
              <Label className="font-medium">{feature.name}</Label>
              <p className="text-sm text-muted-foreground">
                {hiddenFeatures[feature.id] ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <Switch
              checked={hiddenFeatures[feature.id] || false}
              onCheckedChange={(checked) => 
                setHiddenFeatures(prev => ({ ...prev, [feature.id]: checked }))
              }
            />
          </div>
        );

      case 'number':
        return (
          <div key={feature.id} className="space-y-2 p-3 border rounded-lg">
            <Label className="font-medium">{feature.name}</Label>
            <Input
              type="number"
              value={customValues[feature.id] || ''}
              onChange={(e) => 
                setCustomValues(prev => ({ ...prev, [feature.id]: e.target.value }))
              }
              placeholder="Enter value"
            />
          </div>
        );

      case 'text':
        return (
          <div key={feature.id} className="space-y-2 p-3 border rounded-lg">
            <Label className="font-medium">{feature.name}</Label>
            <Input
              type="text"
              value={customValues[feature.id] || ''}
              onChange={(e) => 
                setCustomValues(prev => ({ ...prev, [feature.id]: e.target.value }))
              }
              placeholder="Enter text"
            />
          </div>
        );

      case 'select':
        return (
          <div key={feature.id} className="space-y-2 p-3 border rounded-lg">
            <Label className="font-medium">{feature.name}</Label>
            <Select
              value={customValues[feature.id] || feature.value}
              onValueChange={(value) => 
                setCustomValues(prev => ({ ...prev, [feature.id]: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {feature.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Vehicle Coding & Hidden Features
          </CardTitle>
          <CardDescription>
            Unlock and customize your vehicle's hidden features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please connect to your vehicle to access coding functions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const currentModuleData = vehicleModules.find(m => m.id === currentModule);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Vehicle Coding & Hidden Features
        </CardTitle>
        <CardDescription>
          Unlock and customize your vehicle's hidden features and settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Module Selection */}
        <div className="space-y-2">
          <Label>Select Control Module</Label>
          <Select value={currentModule} onValueChange={setCurrentModule}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {vehicleModules.map(module => (
                <SelectItem key={module.id} value={module.id}>
                  <div className="flex items-center gap-2">
                    {module.icon}
                    <div>
                      <div>{module.name}</div>
                      <div className="text-xs text-muted-foreground">{module.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Module Info */}
        {currentModuleData && (
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              {currentModuleData.icon}
            </div>
            <div>
              <h3 className="font-medium">{currentModuleData.name}</h3>
              <p className="text-sm text-muted-foreground">{currentModuleData.description}</p>
              <Badge variant="outline" className="mt-1">
                {currentModuleData.features.length} features available
              </Badge>
            </div>
          </div>
        )}

        {/* Feature Controls */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Feature Configuration
          </h4>
          
          <div className="grid gap-4">
            {currentModuleData?.features.map(renderFeatureControl)}
          </div>
        </div>

        {/* Coding Progress */}
        {isCoding && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Applying coding changes...</span>
            </div>
            <Progress value={codingProgress} className="w-full" />
            <p className="text-xs text-muted-foreground">
              {codingProgress < 100 ? `Progress: ${codingProgress}%` : 'Finalizing changes...'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={applyVehicleCoding}
            disabled={isCoding}
            className="flex-1"
          >
            {isCoding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Coding...
              </>
            ) : (
              <>
                <Code className="mr-2 h-4 w-4" />
                Apply Coding
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={resetToFactory}
            disabled={isCoding}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Factory Reset
          </Button>
        </div>

        {/* Warning */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong>
            <ul className="mt-2 text-sm space-y-1">
              <li>• Vehicle coding can affect warranty coverage</li>
              <li>• Some features may not be legal in all regions</li>
              <li>• Always backup original coding before making changes</li>
              <li>• Incorrect coding may cause vehicle malfunction</li>
              <li>• Consider professional consultation for complex modifications</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default VehicleCodingPanel;