
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Activity, 
  AlertTriangle, 
  Settings, 
  Bluetooth,
  Wrench
} from 'lucide-react';

interface MobileFriendlyDashboardProps {
  onNavigate: (path: string) => void;
  isConnected?: boolean;
}

const MobileFriendlyDashboard: React.FC<MobileFriendlyDashboardProps> = ({ 
  onNavigate, 
  isConnected = false 
}) => {
  const mainFeatures = [
    {
      title: 'Connect Device',
      icon: Bluetooth,
      path: '/connections',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Bluetooth OBD2'
    },
    {
      title: 'Read Codes',
      icon: AlertTriangle,
      path: '/trouble-codes',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Diagnostic codes',
      requiresConnection: true
    },
    {
      title: 'Live Data',
      icon: Activity,
      path: '/live-data',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Real-time data',
      requiresConnection: true
    },
    {
      title: 'Vehicle Info',
      icon: Car,
      path: '/vehicle-info',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Vehicle details'
    },
    {
      title: 'Professional',
      icon: Wrench,
      path: '/professional-diagnostics',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Advanced tools'
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/settings',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      description: 'Configuration'
    }
  ];

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Ready' : 'Offline'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Features Grid */}
      <div className="grid grid-cols-2 gap-3">
        {mainFeatures.map((feature) => {
          const IconComponent = feature.icon;
          const isDisabled = feature.requiresConnection && !isConnected;
          
          return (
            <Card 
              key={feature.title}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
              }`}
              onClick={() => !isDisabled && onNavigate(feature.path)}
            >
              <CardContent className="p-4 text-center space-y-2">
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mx-auto`}>
                  <IconComponent className={`h-6 w-6 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MobileFriendlyDashboard;
