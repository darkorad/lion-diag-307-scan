
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
  AlertTriangle
} from "lucide-react"

interface StartScreenProps {
  onViewChange: (view: string) => void;
  isConnected: boolean;
  permissionsGranted: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onViewChange, isConnected, permissionsGranted }) => {
  const quickActions = [
    {
      title: 'Connect OBD2',
      description: 'Connect via Bluetooth',
      icon: Bluetooth,
      view: 'connection' as const,
      requiresConnection: false
    },
    {
      title: 'Read Codes',
      description: 'Get diagnostic codes',
      icon: AlertTriangle,
      view: 'trouble-codes' as const,
      requiresConnection: true
    },
    {
      title: 'Live Data',
      description: 'Real-time monitoring',
      icon: BarChart3,
      view: 'live-data' as const,
      requiresConnection: true
    },
    {
      title: 'Vehicle Info',
      description: 'Display vehicle details',
      icon: Car,
      view: 'vehicle-info' as const,
      requiresConnection: false
    }
  ];

  const diagnosticOptions = [
    {
      title: 'Readiness Status',
      description: 'Check emission readiness',
      icon: Car,
      view: 'readiness' as const,
      requiresConnection: true
    },
    {
      title: 'Advanced Diagnostics',
      description: 'Professional functions',
      icon: Cog,
      view: 'advanced-diagnostics' as const,
      requiresConnection: true,
      badge: 'Pro'
    },
    {
      title: 'Settings',
      description: 'App configuration',
      icon: Cog,
      view: 'settings' as const,
      requiresConnection: false
    }
  ];

  const professionalOptions = [
    {
      title: 'Professional Tools',
      description: 'Manufacturer diagnostics',
      icon: Wrench,
      view: 'professional-diagnostics' as const,
      requiresConnection: false,
      badge: 'Pro'
    }
  ];

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* Status Alerts */}
      {!isConnected && (
        <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-md text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Not connected to OBD2 device</span>
        </div>
      )}

      {!permissionsGranted && (
        <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-md text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Bluetooth permissions required</span>
        </div>
      )}

      {/* Quick Actions */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            const isDisabled = action.requiresConnection && !isConnected;
            return (
              <Card
                key={action.title}
                className={`cursor-pointer transition-shadow hover:shadow-md ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isDisabled && onViewChange(action.view)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm">{action.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">
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

      {/* Diagnostic Options */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Diagnostics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {diagnosticOptions.map((option) => {
            const IconComponent = option.icon;
            const isDisabled = option.requiresConnection && !isConnected;
            return (
              <Card
                key={option.title}
                className={`cursor-pointer transition-shadow hover:shadow-md ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isDisabled && onViewChange(option.view)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{option.title}</h3>
                        {option.badge && (
                          <Badge variant="outline" className="text-xs">
                            {option.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
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

      {/* Professional Tools */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Professional</h2>
          <Badge variant="secondary" className="text-xs">Advanced</Badge>
        </div>
        <div className="grid gap-3">
          {professionalOptions.map((option) => {
            const IconComponent = option.icon;
            const isDisabled = option.requiresConnection && !isConnected;
            return (
              <Card 
                key={option.view} 
                className={`cursor-pointer transition-shadow hover:shadow-md ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isDisabled && onViewChange(option.view)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{option.title}</h3>
                        {option.badge && (
                          <Badge variant="outline" className="text-xs">
                            {option.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
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
    </div>
  );
};

export default StartScreen;
