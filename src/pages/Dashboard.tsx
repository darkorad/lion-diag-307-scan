
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Bluetooth, 
  Search, 
  Settings,
  BarChart3,
  AlertTriangle,
  Wrench,
  Shield,
  Activity,
  Gauge,
  CheckCircle,
  Cloud,
  Clock
} from 'lucide-react';
import ConnectionStatusWidget from '../components/widgets/ConnectionStatusWidget';
import VehicleProfileWidget from '../components/widgets/VehicleProfileWidget';
import QuickActionsWidget from '../components/widgets/QuickActionsWidget';
import VehicleHealthMonitor from '../components/VehicleHealthMonitor';
import { Badge } from '@/components/ui/badge';

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
    <div className="container mx-auto p-4 space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ConnectionStatusWidget />
        <VehicleProfileWidget />
        <QuickActionsWidget />
      </div>
      
      <VehicleHealthMonitor />
      
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Premium Features</h2>
          <Badge variant="outline" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            Pro Version
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded-full dark:bg-purple-900">
                  <Gauge className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Advanced Diagnostics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access professional-grade diagnostic tools, including advanced sensor readings, actuator tests, and manufacturer-specific functions.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/professional-diagnostics')}>
                Open Advanced Tools
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-full dark:bg-blue-900">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Used Car Check</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comprehensive pre-purchase inspection tool. Verify vehicle history, detect hidden issues, and get a detailed health report.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Start Vehicle Check
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-t-4 border-t-green-500">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded-full dark:bg-green-900">
                  <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Performance Tests</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Measure 0-60 acceleration, horsepower, torque, and other performance metrics. Compare results with factory specifications.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Run Performance Test
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <div className="mt-8 bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">LionDiag Pro Advantages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 p-2 rounded-full dark:bg-indigo-900">
              <Gauge className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-medium">Real-time Parameter Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Monitor up to 20 parameters simultaneously with high-frequency updates for precise diagnostics.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 p-2 rounded-full dark:bg-indigo-900">
              <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-medium">Enhanced Vehicle Compatibility</h3>
              <p className="text-sm text-muted-foreground">
                Support for over 95% of vehicles manufactured after 2000, including specialized European protocols.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 p-2 rounded-full dark:bg-indigo-900">
              <Cloud className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-medium">Cloud Backup & Sync</h3>
              <p className="text-sm text-muted-foreground">
                Securely store diagnostic history, vehicle profiles, and custom settings across all your devices.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 p-2 rounded-full dark:bg-indigo-900">
              <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-medium">Maintenance Reminders</h3>
              <p className="text-sm text-muted-foreground">
                Smart service reminders based on actual vehicle usage patterns and manufacturer recommendations.
              </p>
            </div>
          </div>
        </div>
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
