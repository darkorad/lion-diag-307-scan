import React from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Car,
  BarChart3,
  Cog,
  Wrench,
  Bluetooth,
  MapPin,
  AlertTriangle,
  HelpCircle
} from "lucide-react"

interface StartScreenProps {
  onViewChange: (view: string) => void;
  isConnected: boolean;
  permissionsGranted: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onViewChange, isConnected, permissionsGranted }) => {
  const quickActions = [
    {
      title: 'Connect to OBD2',
      description: 'Connect to your vehicle\'s OBD2 port via Bluetooth for diagnostics.',
      icon: Bluetooth,
      view: 'connection' as const,
      category: 'connection',
      requiresConnection: false
    },
    {
      title: 'Read Diagnostic Codes',
      description: 'Retrieve and display diagnostic trouble codes (DTCs) from the vehicle\'s ECU.',
      icon: AlertTriangle,
      view: 'trouble-codes' as const,
      category: 'diagnostics',
      requiresConnection: true
    },
    {
      title: 'Live Data Monitoring',
      description: 'Monitor real-time data parameters such as engine RPM, speed, and temperature.',
      icon: BarChart3,
      view: 'live-data' as const,
      category: 'diagnostics',
      requiresConnection: true
    },
    {
      title: 'Vehicle Information',
      description: 'Display vehicle details such as VIN, make, model, and engine type.',
      icon: Car,
      view: 'vehicle-info' as const,
      category: 'vehicle',
      requiresConnection: false
    }
  ];

  const diagnosticOptions = [
    {
      title: 'Readiness Status',
      description: 'Check emission system readiness and monitor status',
      icon: Car,
      view: 'readiness' as const,
      category: 'diagnostics',
      requiresConnection: true
    },
    {
      title: 'Advanced Diagnostics',
      description: 'Access advanced diagnostic functions and manufacturer-specific data',
      icon: Cog,
      view: 'advanced-diagnostics' as const,
      category: 'diagnostics',
      requiresConnection: true,
      badge: 'Enhanced'
    },
    {
      title: 'Settings and Preferences',
      description: 'Configure app settings, customize data displays, and manage vehicle profiles',
      icon: Cog,
      view: 'settings' as const,
      category: 'app',
      requiresConnection: false
    }
  ];

  const professionalOptions = [
    {
      title: 'Professional Diagnostics',
      description: 'Access manufacturer-specific diagnostic tools and emulators',
      icon: Wrench,
      view: 'professional-diagnostics' as const,
      category: 'professional',
      requiresConnection: false,
      badge: 'Professional'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Vehicle Diagnostics</h1>
        <p className="text-muted-foreground">
          Connect to your vehicle and explore a wide range of diagnostic and monitoring options.
        </p>
        {!isConnected && (
          <div className="flex items-center justify-center gap-2 text-yellow-500 bg-yellow-50/50 p-3 rounded-md">
            <AlertTriangle className="h-4 w-4" />
            <span>Not connected to OBD2 device</span>
          </div>
        )}
        {!permissionsGranted && (
          <div className="flex items-center justify-center gap-2 text-orange-500 bg-orange-50/50 p-3 rounded-md">
            <AlertTriangle className="h-4 w-4" />
            <span>Bluetooth permissions required for device connection</span>
          </div>
        )}
      </section>

      {/* Quick Actions Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            const isDisabled = action.requiresConnection && !isConnected;
            return (
              <Card
                key={action.title}
                className={`hover:shadow-md transition-shadow cursor-pointer group ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isDisabled && onViewChange(action.view)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Diagnostic Options Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Diagnostic Options</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {diagnosticOptions.map((option) => {
            const IconComponent = option.icon;
            const isDisabled = option.requiresConnection && !isConnected;
            return (
              <Card
                key={option.title}
                className={`hover:shadow-md transition-shadow cursor-pointer group ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isDisabled && onViewChange(option.view)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{option.title}</h3>
                        {option.badge && (
                          <Badge variant="outline" className="text-xs">
                            {option.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Professional Tools Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Professional Tools</h2>
          <Badge variant="secondary">Advanced</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {professionalOptions.map((option) => {
            const IconComponent = option.icon;
            const isDisabled = option.requiresConnection && !isConnected;
            return (
              <Card 
                key={option.view} 
                className={`hover:shadow-md transition-shadow cursor-pointer group ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isDisabled && onViewChange(option.view)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{option.title}</h3>
                        {option.badge && (
                          <Badge variant="outline" className="text-xs">
                            {option.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Help and Support Section */}
      <section className="text-center">
        <HelpCircle className="h-6 w-6 inline-block mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Need help? Check out our <Button variant="link">Help Center</Button> or <Button variant="link">Contact Support</Button>.
        </p>
      </section>
    </div>
  );
};

export default StartScreen;
