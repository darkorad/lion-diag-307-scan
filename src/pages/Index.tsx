
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  Bluetooth, 
  Search, 
  Settings,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Connect to Vehicle',
      description: 'Establish Bluetooth connection with your OBD2 adapter',
      icon: <Bluetooth className="h-6 w-6" />,
      path: '/connections',
      color: 'text-blue-500'
    },
    {
      title: 'Vehicle Diagnostics',
      description: 'Run comprehensive diagnostic scans and read trouble codes',
      icon: <Search className="h-6 w-6" />,
      path: '/diagnostics',
      color: 'text-green-500'
    },
    {
      title: 'Live Data Monitor',
      description: 'View real-time engine parameters and sensor data',
      icon: <BarChart3 className="h-6 w-6" />,
      path: '/live-data',
      color: 'text-orange-500'
    },
    {
      title: 'Trouble Codes',
      description: 'Read and clear diagnostic trouble codes (DTCs)',
      icon: <AlertTriangle className="h-6 w-6" />,
      path: '/trouble-codes',
      color: 'text-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Car className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Universal OBD2 Tool
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional-grade vehicle diagnostics for all makes and models. 
            Connect to your OBD2 adapter and unlock comprehensive diagnostic capabilities.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <div className={`${feature.color} group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{feature.description}</p>
                <Button 
                  onClick={() => navigate(feature.path)}
                  className="w-full"
                  variant="outline"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Start */}
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
                <span>Connect via Bluetooth</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
