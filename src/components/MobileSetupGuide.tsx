
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Bluetooth, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Wifi,
  Battery
} from 'lucide-react';

const MobileSetupGuide: React.FC = () => {
  const setupSteps = [
    {
      icon: Settings,
      title: 'Enable Bluetooth',
      description: 'Go to Settings > Bluetooth and turn it on',
      details: 'Make sure Bluetooth is enabled and your device is discoverable'
    },
    {
      icon: Wifi,
      title: 'Location Services',
      description: 'Enable location services for Bluetooth scanning',
      details: 'Android requires location permission for Bluetooth device discovery'
    },
    {
      icon: Battery,
      title: 'Power Management',
      description: 'Disable battery optimization for this app',
      details: 'Prevents the system from killing the app during diagnostics'
    },
    {
      icon: Bluetooth,
      title: 'Pair OBD2 Adapter',
      description: 'Put your ELM327 adapter in pairing mode',
      details: 'Default PIN is usually 0000 or 1234'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Smartphone className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold">Mobile Setup Guide</h2>
        <p className="text-muted-foreground">
          Follow these steps to configure your mobile device for OBD2 diagnostics
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Make sure your vehicle's ignition is ON before attempting to connect to the OBD2 port.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {setupSteps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>Step {index + 1}: {step.title}</span>
                      <Badge variant="outline">Required</Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {step.description}
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {step.details}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Ready to Connect
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600">
            Once you've completed all steps above, return to the connection screen and try connecting to your OBD2 adapter.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileSetupGuide;
