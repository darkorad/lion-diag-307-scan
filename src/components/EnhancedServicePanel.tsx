import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Wrench, 
  Oil, 
  Filter, 
  Battery, 
  Brake, 
  Thermometer,
  CheckCircle,
  AlertTriangle,
  Clock,
  Car,
  Zap
} from 'lucide-react';

interface ServiceFunction {
  id: string;
  name: string;
  description: string;
  category: 'maintenance' | 'emissions' | 'electrical' | 'brakes' | 'engine';
  icon: React.ComponentType<{ className?: string }>;
  riskLevel: 'low' | 'medium' | 'high';
  duration: number; // in seconds
  supported: boolean;
}

interface ServiceResult {
  success: boolean;
  message: string;
  duration?: number;
}

interface EnhancedServicePanelProps {
  isConnected: boolean;
  vehicleInfo?: Record<string, unknown>;
}

export const EnhancedServicePanel: React.FC<EnhancedServicePanelProps> = ({
  isConnected,
  vehicleInfo
}) => {
  const [activeFunction, setActiveFunction] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, ServiceResult>>({});
  const [progress, setProgress] = useState(0);

  const serviceFunctions: ServiceFunction[] = [
    {
      id: 'oil_reset',
      name: 'Oil Service Reset',
      description: 'Reset oil service indicator and maintenance timer',
      category: 'maintenance',
      icon: Oil,
      riskLevel: 'low',
      duration: 5,
      supported: true
    },
    {
      id: 'dpf_regen',
      name: 'DPF Regeneration',
      description: 'Force diesel particulate filter regeneration cycle',
      category: 'emissions',
      icon: Filter,
      riskLevel: 'medium',
      duration: 300, // 5 minutes
      supported: true
    },
    {
      id: 'battery_reset',
      name: 'Battery Registration',
      description: 'Register new battery with battery management system',
      category: 'electrical',
      icon: Battery,
      riskLevel: 'medium',
      duration: 10,
      supported: true
    },
    {
      id: 'abs_bleed',
      name: 'ABS Brake Bleed',
      description: 'Activate ABS pump for brake system bleeding',
      category: 'brakes',
      icon: Brake,
      riskLevel: 'high',
      duration: 60,
      supported: true
    },
    {
      id: 'throttle_adapt',
      name: 'Throttle Adaptation',
      description: 'Perform throttle body adaptation and learning',
      category: 'engine',
      icon: Zap,
      riskLevel: 'medium',
      duration: 15,
      supported: true
    },
    {
      id: 'coolant_bleed',
      name: 'Coolant System Bleed',
      description: 'Activate electric water pump for coolant bleeding',
      category: 'engine',
      icon: Thermometer,
      riskLevel: 'medium',
      duration: 120,
      supported: true
    },
    {
      id: 'injector_adapt',
      name: 'Injector Adaptation',
      description: 'Perform fuel injector adaptation and coding',
      category: 'engine',
      icon: Car,
      riskLevel: 'high',
      duration: 45,
      supported: false // Example of unsupported function
    },
    {
      id: 'steering_adapt',
      name: 'Steering Angle Adaptation',
      description: 'Calibrate steering angle sensor after alignment',
      category: 'maintenance',
      icon: Wrench,
      riskLevel: 'medium',
      duration: 20,
      supported: true
    }
  ];

  const executeService = async (serviceFunction: ServiceFunction) => {
    if (!isConnected || activeFunction) {
      return;
    }

    setActiveFunction(serviceFunction.id);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const increment = 100 / (serviceFunction.duration * 10); // Update every 100ms
          const newProgress = prev + increment;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 100);

      // Simulate service execution
      await new Promise(resolve => setTimeout(resolve, serviceFunction.duration * 1000));

      const result: ServiceResult = {
        success: true,
        message: `${serviceFunction.name} completed successfully`,
        duration: serviceFunction.duration
      };

      setResults(prev => ({ ...prev, [serviceFunction.id]: result }));
      
    } catch (error) {
      const result: ServiceResult = {
        success: false,
        message: `${serviceFunction.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
      
      setResults(prev => ({ ...prev, [serviceFunction.id]: result }));
    } finally {
      setActiveFunction(null);
      setProgress(0);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const groupedFunctions = serviceFunctions.reduce((acc, func) => {
    if (!acc[func.category]) {
      acc[func.category] = [];
    }
    acc[func.category].push(func);
    return acc;
  }, {} as Record<string, ServiceFunction[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Service Functions & Adaptations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Service functions directly modify vehicle systems. 
              Ensure vehicle is in a safe location and follow proper procedures.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Active Function Progress */}
      {activeFunction && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Service in Progress</p>
                  <p className="text-sm text-muted-foreground">
                    {serviceFunctions.find(f => f.id === activeFunction)?.name}
                  </p>
                </div>
                <Badge variant="default">
                  <Clock className="h-3 w-3 mr-1" />
                  {Math.ceil((100 - progress) * (serviceFunctions.find(f => f.id === activeFunction)?.duration || 0) / 100)}s
                </Badge>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Categories */}
      <Tabs defaultValue={Object.keys(groupedFunctions)[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {Object.keys(groupedFunctions).map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(groupedFunctions).map(([category, functions]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {functions.map((serviceFunction) => {
                const Icon = serviceFunction.icon;
                const result = results[serviceFunction.id];
                const isActive = activeFunction === serviceFunction.id;
                
                return (
                  <Card key={serviceFunction.id} className={isActive ? 'border-primary' : ''}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-lg">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          <span>{serviceFunction.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getRiskVariant(serviceFunction.riskLevel)}>
                            {serviceFunction.riskLevel.toUpperCase()}
                          </Badge>
                          {!serviceFunction.supported && (
                            <Badge variant="outline">Not Supported</Badge>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {serviceFunction.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Duration: {serviceFunction.duration}s</span>
                          <span className={getRiskColor(serviceFunction.riskLevel)}>
                            Risk: {serviceFunction.riskLevel}
                          </span>
                        </div>

                        <Button
                          onClick={() => executeService(serviceFunction)}
                          disabled={!isConnected || !serviceFunction.supported || isActive || !!activeFunction}
                          className="w-full"
                          variant={serviceFunction.riskLevel === 'high' ? 'destructive' : 'default'}
                        >
                          {isActive ? 'Executing...' : `Execute ${serviceFunction.name}`}
                        </Button>

                        {result && (
                          <Alert>
                            {result.success ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <AlertTriangle className="h-4 w-4" />
                            )}
                            <AlertDescription className="text-sm">
                              {result.message}
                              {result.duration && (
                                <span className="text-muted-foreground">
                                  {' '}(Completed in {result.duration}s)
                                </span>
                              )}
                            </AlertDescription>
                          </Alert>
                        )}
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
            Connect to an OBD2 adapter to access service functions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
