import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  PlayCircle, 
  Wrench, 
  Settings, 
  RefreshCw, 
  FileText,
  CheckCircle
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  highlightElement?: string;
}

const TutorialGuide: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  onComplete: () => void;
}> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const steps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to LionDiag Pro',
      description: 'Professional vehicle diagnostics at your fingertips',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Wrench className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Professional Vehicle Diagnostics</h3>
            <p className="text-sm text-muted-foreground">
              Learn how to use all the powerful features of LionDiag Pro
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-3 text-center">
              <div className="bg-blue-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="text-sm font-medium">System Scan</h4>
              <p className="text-xs text-muted-foreground">Complete vehicle diagnostics</p>
            </div>
            <div className="border rounded-lg p-3 text-center">
              <div className="bg-green-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                <Wrench className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="text-sm font-medium">Special Functions</h4>
              <p className="text-xs text-muted-foreground">Advanced vehicle operations</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'connection',
      title: 'Connecting to Your Vehicle',
      description: 'Establish a connection to your vehicle\'s OBD2 port',
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full mt-1">
              <PlayCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Connection Process</h3>
              <p className="text-sm text-muted-foreground">
                Follow these steps to connect to your vehicle:
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                1
              </div>
              <div>
                <h4 className="text-sm font-medium">Plug in OBD2 Adapter</h4>
                <p className="text-xs text-muted-foreground">
                  Connect your OBD2 adapter to the vehicle's diagnostic port (usually under the dashboard)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                2
              </div>
              <div>
                <h4 className="text-sm font-medium">Enable Bluetooth</h4>
                <p className="text-xs text-muted-foreground">
                  Make sure Bluetooth is enabled on your device
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                3
              </div>
              <div>
                <h4 className="text-sm font-medium">Scan for Devices</h4>
                <p className="text-xs text-muted-foreground">
                  Use the connection panel to scan for and connect to your OBD2 adapter
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'diagnostics',
      title: 'Running Diagnostics',
      description: 'Perform comprehensive vehicle system checks',
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-full mt-1">
              <Settings className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">Diagnostic Features</h3>
              <p className="text-sm text-muted-foreground">
                LionDiag Pro offers several diagnostic capabilities:
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <h4 className="text-sm font-medium">Full System Scan</h4>
                <p className="text-xs text-muted-foreground">
                  Check all vehicle modules for fault codes
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <h4 className="text-sm font-medium">Live Data Monitoring</h4>
                <p className="text-xs text-muted-foreground">
                  View real-time sensor data and parameters
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <h4 className="text-sm font-medium">Special Functions</h4>
                <p className="text-xs text-muted-foreground">
                  Access advanced vehicle operations with step-by-step wizards
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      title: 'Generating Reports',
      description: 'Export and analyze diagnostic results',
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-full mt-1">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium">Report Features</h3>
              <p className="text-sm text-muted-foreground">
                Generate professional diagnostic reports:
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="border rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2">Export Formats</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">PDF</Badge>
                <Badge variant="secondary">JSON</Badge>
                <Badge variant="secondary">Text</Badge>
                <Badge variant="secondary">CSV</Badge>
              </div>
            </div>
            
            <div className="border rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2">Report Contents</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Vehicle identification information</li>
                <li>Diagnostic trouble codes</li>
                <li>Module status and health</li>
                <li>Recommendations and next steps</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Tutorial Complete!',
      description: 'You\'re ready to use LionDiag Pro',
      content: (
        <div className="space-y-4 text-center">
          <div className="mx-auto bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium">Ready to Diagnose</h3>
          <p className="text-sm text-muted-foreground">
            You've completed the LionDiag Pro tutorial. You're now ready to perform professional vehicle diagnostics.
          </p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Pro Tip</h4>
            <p className="text-xs text-blue-700">
              Use the step-by-step wizards for complex operations to ensure proper execution and safety.
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleFinish = () => {
    setCompleted(true);
    onComplete();
  };

  // Reset when reopening
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setCompleted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <Badge variant="secondary" className="mb-2">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {steps[currentStep].description}
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          {steps[currentStep].content}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {currentStep === 0 ? (
            <Button variant="outline" onClick={handleSkip}>
              Skip Tutorial
            </Button>
          ) : (
            <Button variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
          )}
          
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleFinish}>
              Finish Tutorial
              <CheckCircle className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default TutorialGuide;