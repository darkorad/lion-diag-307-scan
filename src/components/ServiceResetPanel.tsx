import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Wrench, 
  Gauge,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Settings,
  RefreshCw,
  Car,
  Fuel,
  Thermometer,
  Zap,
  Clock,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceResetPanelProps {
  isConnected: boolean;
  vehicleInfo?: Record<string, unknown>;
}

const ServiceResetPanel: React.FC<ServiceResetPanelProps> = ({ isConnected, vehicleInfo }) => {
  const [isPerformingReset, setIsPerformingReset] = useState(false);
  const [resetProgress, setResetProgress] = useState(0);
  const [lastResetType, setLastResetType] = useState<string>('');
  const [supportedResets, setSupportedResets] = useState<string[]>([]);
  const { toast } = useToast();

  const serviceResets = React.useMemo(() => [
    {
      id: 'oil',
      name: 'Oil Service Reset',
      description: 'Reset oil change interval and service light',
      icon: <Fuel className="h-5 w-5" />,
      category: 'maintenance',
      supported: true
    },
    {
      id: 'dpf',
      name: 'DPF Regeneration',
      description: 'Force diesel particulate filter regeneration',
      icon: <Gauge className="h-5 w-5" />,
      category: 'emission',
      supported: true
    },
    {
      id: 'epb',
      name: 'Electronic Parking Brake',
      description: 'Reset EPB after brake pad replacement',
      icon: <Shield className="h-5 w-5" />,
      category: 'brake',
      supported: true
    },
    {
      id: 'abs_bleeding',
      name: 'ABS Brake Bleeding',
      description: 'Automated ABS brake system bleeding procedure',
      icon: <RefreshCw className="h-5 w-5" />,
      category: 'brake',
      supported: true
    },
    {
      id: 'throttle',
      name: 'Throttle Body Adaptation',
      description: 'Reset throttle body learning values',
      icon: <Zap className="h-5 w-5" />,
      category: 'engine',
      supported: true
    },
    {
      id: 'battery',
      name: 'Battery Registration',
      description: 'Register new battery to BMS system',
      icon: <Zap className="h-5 w-5" />,
      category: 'electrical',
      supported: true
    },
    {
      id: 'sas',
      name: 'Steering Angle Sensor',
      description: 'Calibrate steering angle sensor after alignment',
      icon: <Settings className="h-5 w-5" />,
      category: 'steering',
      supported: true
    },
    {
      id: 'transmission',
      name: 'Transmission Adaptation',
      description: 'Reset automatic transmission learning values',
      icon: <Car className="h-5 w-5" />,
      category: 'transmission',
      supported: true
    },
    {
      id: 'injector',
      name: 'Injector Coding',
      description: 'Code new fuel injectors after replacement',
      icon: <Fuel className="h-5 w-5" />,
      category: 'engine',
      supported: true
    },
    {
      id: 'tpms',
      name: 'TPMS Reset',
      description: 'Reset tire pressure monitoring system',
      icon: <Gauge className="h-5 w-5" />,
      category: 'tire',
      supported: true
    },
    {
      id: 'windows',
      name: 'Window Initialization',
      description: 'Initialize power windows after battery disconnect',
      icon: <Settings className="h-5 w-5" />,
      category: 'comfort',
      supported: true
    },
    {
      id: 'suspension',
      name: 'Suspension Calibration',
      description: 'Calibrate air suspension height sensors',
      icon: <Car className="h-5 w-5" />,
      category: 'suspension',
      supported: false
    }
  ], []);

  const checkSupportedResets = React.useCallback(async () => {
    // Simulate checking which resets are supported by the vehicle
    const supported = serviceResets
      .filter(reset => reset.supported)
      .map(reset => reset.id);
    setSupportedResets(supported);
  }, [serviceResets]);

  useEffect(() => {
    if (isConnected) {
      checkSupportedResets();
    }
  }, [isConnected, vehicleInfo, checkSupportedResets]);

  const performServiceReset = async (resetType: string) => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to your vehicle first",
        variant: "destructive"
      });
      return;
    }

    setIsPerformingReset(true);
    setLastResetType(resetType);
    setResetProgress(0);

    try {
      const reset = serviceResets.find(r => r.id === resetType);
      
      // Simulate reset progress
      const progressInterval = setInterval(() => {
        setResetProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);

      // Simulate actual reset procedure based on type
      await simulateResetProcedure(resetType);
      
      clearInterval(progressInterval);
      setResetProgress(100);
      
      toast({
        title: "Reset Complete",
        description: `${reset?.name} completed successfully`,
      });

    } catch (error) {
      toast({
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsPerformingReset(false);
      setTimeout(() => setResetProgress(0), 2000);
    }
  };

  const simulateResetProcedure = async (resetType: string): Promise<void> => {
    const procedures: { [key: string]: () => Promise<void> } = {
      oil: async () => {
        // Oil service reset procedure
        await new Promise(resolve => setTimeout(resolve, 2000));
      },
      dpf: async () => {
        // DPF regeneration procedure (longer process)
        await new Promise(resolve => setTimeout(resolve, 8000));
      },
      epb: async () => {
        // EPB reset procedure
        await new Promise(resolve => setTimeout(resolve, 3000));
      },
      abs_bleeding: async () => {
        // ABS bleeding procedure
        await new Promise(resolve => setTimeout(resolve, 5000));
      },
      throttle: async () => {
        // Throttle adaptation procedure
        await new Promise(resolve => setTimeout(resolve, 3000));
      },
      battery: async () => {
        // Battery registration procedure
        await new Promise(resolve => setTimeout(resolve, 2000));
      },
      sas: async () => {
        // Steering angle sensor calibration
        await new Promise(resolve => setTimeout(resolve, 4000));
      },
      transmission: async () => {
        // Transmission adaptation
        await new Promise(resolve => setTimeout(resolve, 6000));
      },
      injector: async () => {
        // Injector coding procedure
        await new Promise(resolve => setTimeout(resolve, 4000));
      },
      tpms: async () => {
        // TPMS reset procedure
        await new Promise(resolve => setTimeout(resolve, 2000));
      },
      windows: async () => {
        // Window initialization procedure
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    };

    const procedure = procedures[resetType];
    if (procedure) {
      await procedure();
    } else {
      throw new Error(`Reset procedure for ${resetType} not implemented`);
    }
  };

  const getResetsByCategory = (category: string) => {
    return serviceResets.filter(reset => reset.category === category);
  };

  const categories = [
    { id: 'maintenance', name: 'Maintenance', icon: <Wrench className="h-4 w-4" /> },
    { id: 'engine', name: 'Engine', icon: <Zap className="h-4 w-4" /> },
    { id: 'brake', name: 'Brake System', icon: <Shield className="h-4 w-4" /> },
    { id: 'electrical', name: 'Electrical', icon: <Zap className="h-4 w-4" /> },
    { id: 'emission', name: 'Emission', icon: <Gauge className="h-4 w-4" /> },
    { id: 'steering', name: 'Steering', icon: <Settings className="h-4 w-4" /> },
    { id: 'transmission', name: 'Transmission', icon: <Car className="h-4 w-4" /> },
    { id: 'tire', name: 'Tire Systems', icon: <Gauge className="h-4 w-4" /> },
    { id: 'comfort', name: 'Comfort', icon: <Settings className="h-4 w-4" /> },
    { id: 'suspension', name: 'Suspension', icon: <Car className="h-4 w-4" /> }
  ];

  const renderResetCard = (reset: {
    id: string;
    name: string;
    description: string;
    icon: JSX.Element;
    category: string;
    supported: boolean;
  }) => {
    const isSupported = supportedResets.includes(reset.id);
    const isInProgress = isPerformingReset && lastResetType === reset.id;

    return (
      <Card key={reset.id} className={`p-4 ${!isSupported ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isSupported ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
              {reset.icon}
            </div>
            <div>
              <h4 className="font-medium">{reset.name}</h4>
              <p className="text-sm text-muted-foreground">{reset.description}</p>
              {!isSupported && (
                <Badge variant="secondary" className="mt-1">
                  Not Supported
                </Badge>
              )}
            </div>
          </div>
          
          <Button
            onClick={() => performServiceReset(reset.id)}
            disabled={!isConnected || !isSupported || isPerformingReset}
            size="sm"
          >
            {isInProgress ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset'
            )}
          </Button>
        </div>
        
        {isInProgress && (
          <div className="mt-3 space-y-1">
            <Progress value={resetProgress} className="w-full" />
            <p className="text-xs text-muted-foreground">
              {resetProgress < 100 ? `Progress: ${resetProgress}%` : 'Completing...'}
            </p>
          </div>
        )}
      </Card>
    );
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Service Reset Functions
          </CardTitle>
          <CardDescription>
            Professional service reset and adaptation procedures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please connect to your vehicle to access service reset functions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Professional Service Resets
        </CardTitle>
        <CardDescription>
          Advanced service reset and adaptation procedures ({supportedResets.length} supported)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="maintenance" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full">
            {categories.slice(0, 5).map(category => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                <div className="flex items-center gap-1">
                  {category.icon}
                  <span className="hidden sm:inline">{category.name}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsList className="grid grid-cols-5 w-full">
            {categories.slice(5).map(category => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                <div className="flex items-center gap-1">
                  {category.icon}
                  <span className="hidden sm:inline">{category.name}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                {category.icon}
                <h3 className="font-medium">{category.name} Resets</h3>
                <Badge variant="outline">
                  {getResetsByCategory(category.id).filter(r => supportedResets.includes(r.id)).length} available
                </Badge>
              </div>
              
              {getResetsByCategory(category.id).map(renderResetCard)}
              
              {getResetsByCategory(category.id).length === 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No {category.name.toLowerCase()} reset functions available for this vehicle.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <Alert className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important Safety Notice:</strong>
            <ul className="mt-2 text-sm space-y-1">
              <li>• Only perform resets you understand and that are necessary</li>
              <li>• Some procedures require engine running or specific conditions</li>
              <li>• Always refer to your vehicle's service manual before proceeding</li>
              <li>• Incorrect resets may cause vehicle malfunction</li>
              <li>• DPF regeneration requires driving at highway speeds</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ServiceResetPanel;