
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Bluetooth, 
  Search, 
  Settings,
  BarChart3,
  AlertTriangle,
  Wrench
} from 'lucide-react';
import ConnectionStatusWidget from '../components/widgets/ConnectionStatusWidget';
import VehicleProfileWidget from '../components/widgets/VehicleProfileWidget';
import QuickActionsWidget from '../components/widgets/QuickActionsWidget';

const Dashboard = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Connect to Vehicle',
      description: 'Establish Bluetooth connection with your OBD2 adapter',
      icon: <Bluetooth className="h-6 w-6" />,
      onClick: () => navigate('/connections'),
      color: 'text-blue-500'
    },
    {
      title: 'Vehicle Diagnostics',
      description: 'Run comprehensive diagnostic scans and read trouble codes',
      icon: <Search className="h-6 w-6" />,
      onClick: () => navigate('/diagnostics'),
      color: 'text-green-500'
    },
    {
      title: 'Professional Tools',
      description: 'Access advanced diagnostic functions and professional features',
      icon: <Wrench className="h-6 w-6" />,
      onClick: () => navigate('/professional-diagnostics'),
      color: 'text-purple-500'
    },
    {
      title: 'Vehicle Selection',
      description: 'Select your specific vehicle for optimized diagnostics',
      icon: <Car className="h-6 w-6" />,
      onClick: () => navigate('/vehicle-selection'),
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Car className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            LionDiag Dashboard
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Professional-grade vehicle diagnostics for all makes and models. 
          Connect to your OBD2 adapter and unlock comprehensive diagnostic capabilities.
        </p>
      </div>

      {/* Status Widgets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <ConnectionStatusWidget />
        <VehicleProfileWidget />
        <QuickActionsWidget />
      </div>

      {/* Quick Actions Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className={`${action.color} group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{action.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                      <Button 
                        onClick={action.onClick}
                        size="sm"
                        className="w-full"
                      >
                        Get Started
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Start Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <span>Plug OBD2 adapter into vehicle port</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <span>Turn on vehicle ignition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <span>Connect via Bluetooth in the Connections tab</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
