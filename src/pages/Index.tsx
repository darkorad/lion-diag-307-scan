
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  Car, 
  Bluetooth, 
  Activity, 
  Settings,
  Gauge
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if running on mobile platform
    const checkMobile = () => {
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        setIsMobile(true);
      }
    };
    checkMobile();
  }, []);

  const mainOptions = [
    {
      title: 'Professional Diagnostics',
      description: 'Access complete diagnostic tools',
      icon: <Wrench className="h-6 w-6" />,
      action: () => navigate('/professional-diagnostics'),
      color: 'bg-blue-500'
    },
    {
      title: 'Vehicle-Specific Modules',
      description: 'Specialized vehicle diagnostics',
      icon: <Car className="h-6 w-6" />,
      action: () => navigate('/vehicle-specific'),
      color: 'bg-green-500'
    },
    {
      title: 'Bluetooth Connection',
      description: 'Connect to OBD2 adapter',
      icon: <Bluetooth className="h-6 w-6" />,
      action: () => navigate('/connections'),
      color: 'bg-purple-500'
    },
    {
      title: 'Live Data Monitor',
      description: 'Real-time vehicle data',
      icon: <Activity className="h-6 w-6" />,
      action: () => navigate('/live-data'),
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Simple Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gauge className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">OBD2 Diagnostics</h1>
          </div>
          {isMobile && (
            <Badge variant="outline" className="text-xs">
              Mobile App
            </Badge>
          )}
        </div>

        {/* Main Action Cards */}
        <div className="grid gap-4">
          {mainOptions.map((option, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className={`p-2 ${option.color} rounded-lg text-white`}>
                    {option.icon}
                  </div>
                  <div>
                    <div>{option.title}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {option.description}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  onClick={option.action}
                  className="w-full"
                  size="lg"
                >
                  Open
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Settings */}
        <Card>
          <CardContent className="p-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
