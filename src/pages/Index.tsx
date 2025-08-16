
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  Car, 
  Bluetooth, 
  Activity, 
  AlertTriangle,
  Settings,
  Smartphone,
  Gauge,
  Zap,
  Shield
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if running on mobile platform
    const checkMobile = () => {
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        setIsMobile(true);
        // Initialize mobile-specific features
        window.Capacitor.Plugins.App.addListener('backButton', () => {
          // Handle back button
        });
      }
    };

    checkMobile();
  }, []);

  const features = [
    {
      icon: <Bluetooth className="h-8 w-8" />,
      title: 'Universal Connectivity',
      description: 'Bluetooth Classic + BLE support for all ELM327 adapters',
      color: 'bg-blue-500'
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: 'Live Data Streaming',
      description: 'Real-time gauges, graphs, and multi-threaded polling',
      color: 'bg-green-500'
    },
    {
      icon: <AlertTriangle className="h-8 w-8" />,
      title: 'Professional Diagnostics',
      description: 'Complete DTC analysis with manufacturer-specific codes',
      color: 'bg-yellow-500'
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      title: 'Bidirectional Control',
      description: 'DPF regen, actuator tests, and ECU programming',
      color: 'bg-red-500'
    },
    {
      icon: <Car className="h-8 w-8" />,
      title: 'European Car Support',
      description: 'Specialized modules for Peugeot, VW, Seat, Skoda',
      color: 'bg-purple-500'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Professional Security',
      description: 'Safe ECU write operations with confirmation dialogs',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-xl">
              <Gauge className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Universal OBD2 Tool
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional OBD2 diagnostic tool matching industry-leading apps like Torque Pro and Car Scanner
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="outline" className="px-3 py-1">
              <Smartphone className="h-3 w-3 mr-1" />
              {isMobile ? 'Native Mobile' : 'Web App'}
            </Badge>
            <Badge className="bg-green-500 px-3 py-1">
              <Zap className="h-3 w-3 mr-1" />
              Professional Grade
            </Badge>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                Professional Diagnostics
              </CardTitle>
              <CardDescription>
                Access the complete professional OBD2 diagnostic suite with live data, 
                trouble codes, and advanced vehicle control functions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/professional-diagnostics')} 
                className="w-full"
                size="lg"
              >
                <Wrench className="h-5 w-5 mr-2" />
                Launch Diagnostics
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Car className="h-6 w-6 text-blue-500" />
                </div>
                Vehicle-Specific Modules
              </CardTitle>
              <CardDescription>
                Specialized diagnostic modules for European vehicles including 
                advanced manufacturer-specific functions and coding capabilities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/vehicle-specific')} 
                variant="outline" 
                className="w-full"
                size="lg"
              >
                <Settings className="h-5 w-5 mr-2" />
                Vehicle Modules
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Technical Specifications */}
        <Card className="bg-gradient-to-r from-secondary/50 to-secondary/30 border-none">
          <CardHeader>
            <CardTitle className="text-center">Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary mb-1">2000+</div>
                <div className="text-sm text-muted-foreground">Standard PIDs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Manufacturer PIDs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-1">50Hz</div>
                <div className="text-sm text-muted-foreground">Max Data Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-1">100%</div>
                <div className="text-sm text-muted-foreground">ELM327 Compatible</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-muted-foreground">
            © 2024 Universal OBD2 Tool. Professional automotive diagnostics for everyone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
