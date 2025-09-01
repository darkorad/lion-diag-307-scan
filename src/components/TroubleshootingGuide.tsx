
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  HelpCircle, 
  AlertTriangle, 
  Bluetooth, 
  Wifi, 
  Settings,
  RefreshCw,
  Zap
} from 'lucide-react';

const TroubleshootingGuide: React.FC = () => {
  const commonIssues = [
    {
      problem: "Can't find my OBD2 adapter",
      icon: Bluetooth,
      solutions: [
        "Make sure the adapter is plugged into the OBD2 port",
        "Turn on your vehicle's ignition (engine doesn't need to run)",
        "Put the ELM327 adapter in pairing mode (usually automatic)",
        "Clear Bluetooth cache: Settings > Apps > Bluetooth > Storage > Clear Cache",
        "Try turning Bluetooth off and on again"
      ]
    },
    {
      problem: "Connection keeps dropping",
      icon: Wifi,
      solutions: [
        "Keep your phone close to the OBD2 adapter (within 10 feet)",
        "Disable battery optimization for this app",
        "Make sure your phone isn't in power saving mode",
        "Check if other apps are using Bluetooth simultaneously",
        "Restart both your phone and the OBD2 adapter"
      ]
    },
    {
      problem: "Permission errors",
      icon: Settings,
      solutions: [
        "Enable Location Services (required for Bluetooth scanning)",
        "Grant all requested permissions in app settings",
        "Make sure 'Nearby devices' permission is enabled (Android 12+)",
        "Check that Bluetooth permissions are granted",
        "Restart the app after changing permissions"
      ]
    },
    {
      problem: "Adapter not responding",
      icon: AlertTriangle,
      solutions: [
        "Verify your vehicle is compatible with OBD2 (1996 or newer)",
        "Check that the ignition is ON",
        "Try a different OBD2 adapter if available",
        "Reset the adapter by unplugging it for 10 seconds",
        "Make sure the adapter supports your vehicle's protocol"
      ]
    },
    {
      problem: "App crashes during connection",
      icon: Zap,
      solutions: [
        "Close other apps to free up memory",
        "Restart your phone",
        "Update the app to the latest version",
        "Clear the app's cache and data",
        "Check if your phone's OS is up to date"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold">Troubleshooting Guide</h2>
        <p className="text-muted-foreground">
          Solutions for common OBD2 connection issues
        </p>
      </div>

      <Alert>
        <RefreshCw className="h-4 w-4" />
        <AlertDescription>
          <strong>Quick Fix:</strong> Try restarting your phone and the OBD2 adapter, then attempt connection again.
        </AlertDescription>
      </Alert>

      <Accordion type="single" collapsible className="w-full">
        {commonIssues.map((issue, index) => {
          const IconComponent = issue.icon;
          return (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-5 w-5 text-primary" />
                  <span>{issue.problem}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    Try these solutions in order:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    {issue.solutions.map((solution, solutionIndex) => (
                      <li key={solutionIndex} className="text-sm">
                        {solution}
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <HelpCircle className="h-5 w-5" />
            Still Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-600">
            If you're still experiencing issues, make sure your OBD2 adapter is compatible with your vehicle 
            and that you're using a quality ELM327 adapter. Cheap knockoffs often cause connection problems.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TroubleshootingGuide;
