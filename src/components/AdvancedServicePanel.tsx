import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Wrench, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Car, 
  Gauge,
  Thermometer,
  Battery,
  Wind,
  Droplets,
  Zap,
  Timer,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface ServiceFunction {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  command: string;
  parameters?: ServiceParameter[];
  riskLevel: 'low' | 'medium' | 'high';
  requiresEngine: boolean;
  estimatedTime: number; // in seconds
}

interface ServiceParameter {
  name: string;
  type: 'number' | 'select' | 'boolean';
  options?: string[];
  min?: number;
  max?: number;
  default?: string | number | boolean;
  unit?: string;
}

interface AdvancedServicePanelProps {
  isConnected: boolean;
  onCommand?: (command: string) => Promise<string>;
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
  };
}

export const AdvancedServicePanel: React.FC<AdvancedServicePanelProps> = ({
  isConnected,
  onCommand,
  vehicleInfo
}) => {
  const [activeService, setActiveService] = useState<string | null>(null);
  const [serviceProgress, setServiceProgress] = useState(0);
  const [serviceResults, setServiceResults] = useState<{ [key: string]: { success: boolean; response: string; timestamp: Date; duration: number } }>({});
  const [parameters, setParameters] = useState<{ [key: string]: string | number | boolean }>({});

  const serviceFunctions: ServiceFunction[] = [
    // Oil Service Functions
    {
      id: 'oil_reset',
      name: 'Oil Service Reset',
      description: 'Reset oil service interval counter',
      category: 'maintenance',
      icon: Droplets,
      command: '31010203FF',
      riskLevel: 'low',
      requiresEngine: false,
      estimatedTime: 10
    },
    {
      id: 'oil_quality_reset',
      name: 'Oil Quality Reset',
      description: 'Reset oil quality sensor readings',
      category: 'maintenance',
      icon: Droplets,
      command: '31010204FF',
      riskLevel: 'low',
      requiresEngine: false,
      estimatedTime: 15
    },

    // DPF Functions
    {
      id: 'dpf_regeneration',
      name: 'Force DPF Regeneration',
      description: 'Manually trigger DPF regeneration cycle',
      category: 'emissions',
      icon: Wind,
      command: '31010301FF',
      riskLevel: 'medium',
      requiresEngine: true,
      estimatedTime: 1800, // 30 minutes
      parameters: [
        {
          name: 'temperature',
          type: 'number',
          min: 450,
          max: 650,
          default: 550,
          unit: '°C'
        }
      ]
    },
    {
      id: 'dpf_status_reset',
      name: 'DPF Status Reset',
      description: 'Reset DPF status and counters',
      category: 'emissions',
      icon: Wind,
      command: '31010302FF',
      riskLevel: 'medium',
      requiresEngine: false,
      estimatedTime: 20
    },

    // Calibration Functions
    {
      id: 'throttle_adaptation',
      name: 'Throttle Body Adaptation',
      description: 'Calibrate throttle body position sensors',
      category: 'calibration',
      icon: Gauge,
      command: '31010401FF',
      riskLevel: 'medium',
      requiresEngine: true,
      estimatedTime: 120
    },
    {
      id: 'egr_adaptation',
      name: 'EGR Valve Learning',
      description: 'Perform EGR valve position learning',
      category: 'calibration',
      icon: RefreshCw,
      command: '31010402FF',
      riskLevel: 'medium',
      requiresEngine: true,
      estimatedTime: 180,
      parameters: [
        {
          name: 'learningType',
          type: 'select',
          options: ['Basic', 'Extended', 'Complete'],
          default: 'Basic'
        }
      ]
    },
    {
      id: 'steering_angle_reset',
      name: 'Steering Angle Calibration',
      description: 'Reset and calibrate steering angle sensor',
      category: 'calibration',
      icon: Target,
      command: '31010403FF',
      riskLevel: 'high',
      requiresEngine: false,
      estimatedTime: 60
    },

    // Battery & Electrical
    {
      id: 'battery_registration',
      name: 'Battery Registration',
      description: 'Register new battery with BMS system',
      category: 'electrical',
      icon: Battery,
      command: '31010501FF',
      riskLevel: 'medium',
      requiresEngine: false,
      estimatedTime: 30,
      parameters: [
        {
          name: 'capacity',
          type: 'number',
          min: 40,
          max: 120,
          default: 70,
          unit: 'Ah'
        },
        {
          name: 'type',
          type: 'select',
          options: ['AGM', 'GEL', 'Standard', 'Lithium'],
          default: 'AGM'
        }
      ]
    },
    {
      id: 'alternator_test',
      name: 'Alternator Output Test',
      description: 'Test alternator charging performance',
      category: 'electrical',
      icon: Zap,
      command: '31010502FF',
      riskLevel: 'low',
      requiresEngine: true,
      estimatedTime: 300
    },

    // Brake System
    {
      id: 'brake_bleeding',
      name: 'Electronic Brake Bleeding',
      description: 'Perform electronic brake bleeding sequence',
      category: 'brakes',
      icon: Car,
      command: '31010601FF',
      riskLevel: 'high',
      requiresEngine: false,
      estimatedTime: 900 // 15 minutes
    },
    {
      id: 'abs_calibration',
      name: 'ABS Sensor Calibration',
      description: 'Calibrate ABS wheel speed sensors',
      category: 'brakes',
      icon: Settings,
      command: '31010602FF',
      riskLevel: 'medium',
      requiresEngine: false,
      estimatedTime: 180
    },

    // Climate Control
    {
      id: 'climate_calibration',
      name: 'Climate Control Calibration',
      description: 'Calibrate climate control actuators',
      category: 'comfort',
      icon: Thermometer,
      command: '31010701FF',
      riskLevel: 'low',
      requiresEngine: false,
      estimatedTime: 120
    },

    // Timing and Injection
    {
      id: 'injection_adaptation',
      name: 'Injector Adaptation',
      description: 'Perform fuel injector flow adaptation',
      category: 'fuel',
      icon: Droplets,
      command: '31010801FF',
      riskLevel: 'medium',
      requiresEngine: true,
      estimatedTime: 600 // 10 minutes
    },
    {
      id: 'timing_reset',
      name: 'Engine Timing Reset',
      description: 'Reset engine timing parameters',
      category: 'engine',
      icon: Timer,
      command: '31010802FF',
      riskLevel: 'high',
      requiresEngine: false,
      estimatedTime: 45
    }
  ];

  const executeService = async (service: ServiceFunction) => {
    if (!onCommand || !isConnected) {
      toast.error('Not connected to vehicle');
      return;
    }

    // Safety checks
    if (service.riskLevel === 'high') {
      const confirmed = window.confirm(
        `⚠️ HIGH RISK OPERATION\n\n${service.name}\n${service.description}\n\nThis operation can potentially damage your vehicle if performed incorrectly. Are you sure you want to continue?`
      );
      if (!confirmed) return;
    }

    if (service.requiresEngine) {
      const engineRunning = window.confirm(
        `This service requires the engine to be running. Please ensure:\n\n✓ Engine is running\n✓ Vehicle is in Park/Neutral\n✓ Parking brake is engaged\n\nContinue?`
      );
      if (!engineRunning) return;
    }

    setActiveService(service.id);
    setServiceProgress(0);
    
    try {
      toast.info(`Starting ${service.name}...`);
      
      // Build command with parameters
      let command = service.command;
      if (service.parameters) {
        for (const param of service.parameters) {
          const value = parameters[`${service.id}_${param.name}`] || param.default;
          // Convert parameter to hex if needed
          command += (value as string | number).toString(16).padStart(2, '0');
        }
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setServiceProgress(prev => {
          const newProgress = prev + (100 / (service.estimatedTime / 2));
          return Math.min(newProgress, 95);
        });
      }, 2000);

      // Execute the service command
      const response = await onCommand(command);
      
      clearInterval(progressInterval);
      setServiceProgress(100);
      
      // Parse response and determine success
      const success = !response.includes('NEGATIVE') && !response.includes('ERROR');
      
      setServiceResults(prev => ({
        ...prev,
        [service.id]: {
          success,
          response,
          timestamp: new Date(),
          duration: service.estimatedTime
        }
      }));

      if (success) {
        toast.success(`${service.name} completed successfully`);
      } else {
        toast.error(`${service.name} failed: ${response}`);
      }

    } catch (error) {
      console.error('Service execution failed:', error);
      toast.error(`Service failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setServiceResults(prev => ({
        ...prev,
        [service.id]: {
          success: false,
          response: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
          duration: 0
        }
      }));
    } finally {
      setActiveService(null);
      setServiceProgress(0);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskLevelVariant = (level: string): 'secondary' | 'default' | 'destructive' | 'outline' => {
    switch (level) {
      case 'low': return 'secondary';
      case 'medium': return 'default';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const categories = [...new Set(serviceFunctions.map(f => f.category))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Advanced Service Functions
          </CardTitle>
        </CardHeader>
      </Card>

      {activeService && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Executing service function...</span>
              </div>
              <Progress value={serviceProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Progress: {Math.round(serviceProgress)}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceFunctions
                .filter(service => service.category === category)
                .map(service => {
                  const result = serviceResults[service.id];
                  const Icon = service.icon;
                  
                  return (
                    <Card key={service.id} className="relative">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5" />
                            <div>
                              <CardTitle className="text-lg">{service.name}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {service.description}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Badge variant={getRiskLevelVariant(service.riskLevel)}>
                              {service.riskLevel.toUpperCase()}
                            </Badge>
                            {service.requiresEngine && (
                              <Badge variant="outline">Engine Required</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {service.parameters && (
                          <div className="space-y-3">
                            <h4 className="font-medium">Parameters:</h4>
                            {service.parameters.map(param => (
                              <div key={param.name} className="space-y-1">
                                <Label>{param.name} {param.unit && `(${param.unit})`}</Label>
                                {param.type === 'number' ? (
                                  <Input
                                    type="number"
                                    min={param.min}
                                    max={param.max}
                                    defaultValue={param.default as number}
                                    onChange={(e) => setParameters(prev => ({
                                      ...prev,
                                      [`${service.id}_${param.name}`]: Number(e.target.value)
                                    }))}
                                  />
                                ) : param.type === 'select' ? (
                                  <Select
                                    defaultValue={param.default as string}
                                    onValueChange={(value) => setParameters(prev => ({
                                      ...prev,
                                      [`${service.id}_${param.name}`]: value
                                    }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {param.options?.map(option => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        )}

                        {result && (
                          <Alert>
                            <div className="flex items-center gap-2">
                              {result.success ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                              <AlertDescription>
                                <div>
                                  <p className="font-medium">
                                    {result.success ? 'Success' : 'Failed'}
                                  </p>
                                  <p className="text-sm">
                                    {result.timestamp.toLocaleString()}
                                  </p>
                                  {result.duration > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      Duration: {Math.round(result.duration / 60)}min
                                    </p>
                                  )}
                                </div>
                              </AlertDescription>
                            </div>
                          </Alert>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Est. time: {Math.round(service.estimatedTime / 60)}min
                          </span>
                          <Button
                            onClick={() => executeService(service)}
                            disabled={!isConnected || activeService !== null}
                            variant={service.riskLevel === 'high' ? 'destructive' : 'default'}
                          >
                            Execute
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {!isConnected && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Connect to vehicle to access service functions.</strong>
            <br />
            Advanced service functions require active OBD2 connection and may need specific adapter capabilities.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AdvancedServicePanel;
