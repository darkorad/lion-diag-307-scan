
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Wrench,
  Droplets,
  Thermometer,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Clock,
  Fuel,
  Battery,
  Car,
  Zap,
  RefreshCw
} from 'lucide-react';

interface ServiceFunction {
  id: string;
  name: string;
  description: string;
  category: 'oil' | 'brake' | 'airbag' | 'service' | 'battery' | 'dpf';
  icon: React.ComponentType<any>;
  available: boolean;
  requiresConnection: boolean;
}

const EnhancedServicePanel: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isPerforming, setIsPerforming] = useState(false);

  const serviceFunctions: ServiceFunction[] = [
    {
      id: 'oil_reset',
      name: 'Oil Service Reset',
      description: 'Reset oil life indicator and service intervals',
      category: 'oil',
      icon: Droplets,
      available: true,
      requiresConnection: true
    },
    {
      id: 'brake_reset',
      name: 'Brake Service Reset',
      description: 'Reset brake pad wear indicators',
      category: 'brake',
      icon: Car,
      available: true,
      requiresConnection: true
    },
    {
      id: 'airbag_reset',
      name: 'Airbag Service Reset',
      description: 'Clear airbag service indicators',
      category: 'airbag',
      icon: AlertTriangle,
      available: true,
      requiresConnection: true
    },
    {
      id: 'service_reset',
      name: 'Service Interval Reset',
      description: 'Reset general service intervals and reminders',
      category: 'service',
      icon: Wrench,
      available: true,
      requiresConnection: true
    },
    {
      id: 'battery_reset',
      name: 'Battery Registration',
      description: 'Register new battery and reset charging system',
      category: 'battery',
      icon: Battery,
      available: true,
      requiresConnection: true
    },
    {
      id: 'dpf_regen',
      name: 'DPF Regeneration',
      description: 'Force diesel particulate filter regeneration',
      category: 'dpf',
      icon: RefreshCw,
      available: true,
      requiresConnection: true
    }
  ];

  const handleServiceExecution = async (serviceId: string) => {
    setSelectedService(serviceId);
    setIsPerforming(true);
    
    // Simulate service execution
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsPerforming(false);
    setSelectedService(null);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      oil: 'bg-blue-500',
      brake: 'bg-red-500',
      airbag: 'bg-yellow-500',
      service: 'bg-green-500',
      battery: 'bg-purple-500',
      dpf: 'bg-orange-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Enhanced Service Functions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Service Functions</TabsTrigger>
            <TabsTrigger value="status">System Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {serviceFunctions.map((service) => {
                const IconComponent = service.icon;
                return (
                  <Card key={service.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(service.category)}`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{service.name}</h3>
                          <p className="text-xs text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                      <Badge variant={service.available ? "default" : "secondary"}>
                        {service.available ? "Available" : "N/A"}
                      </Badge>
                    </div>
                    
                    <Button
                      onClick={() => handleServiceExecution(service.id)}
                      disabled={!service.available || isPerforming}
                      className="w-full"
                      size="sm"
                    >
                      {selectedService === service.id && isPerforming ? (
                        <>
                          <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        'Execute Service'
                      )}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="status" className="space-y-4">
            <div className="grid gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">System Ready</span>
                  </div>
                  <Badge variant="default">Online</Badge>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Last Service</span>
                  </div>
                  <span className="text-sm text-muted-foreground">2 days ago</span>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedServicePanel;
