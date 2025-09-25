import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { SpecialFunction } from '@/constants/professionalDiagnosticDatabase';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  isValid?: boolean;
}

interface FunctionWizardProps {
  functionData: SpecialFunction;
  onClose: () => void;
  onComplete: (result: { success: boolean; functionId: string }) => void;
}

const FunctionWizard: React.FC<FunctionWizardProps> = ({ 
  functionData, 
  onClose, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [executionResult, setExecutionResult] = useState<'pending' | 'success' | 'error'>('pending');

  // Define wizard steps based on function data
  const steps: WizardStep[] = [
    {
      id: 'overview',
      title: 'Function Overview',
      description: 'Review the function details and requirements',
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <HelpCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium">{functionData.name}</h3>
              <p className="text-sm text-muted-foreground">{functionData.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2">Category</h4>
              <Badge variant="secondary">{functionData.category}</Badge>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2">Difficulty</h4>
              <Badge variant="secondary">{functionData.difficulty}</Badge>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2">Estimated Time</h4>
              <p className="text-sm">{functionData.estimatedTime}</p>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2">Supported Manufacturers</h4>
              <div className="flex flex-wrap gap-1">
                {functionData.manufacturer.slice(0, 3).map((make, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {make}
                  </Badge>
                ))}
                {functionData.manufacturer.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{functionData.manufacturer.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'prerequisites',
      title: 'Prerequisites Check',
      description: 'Verify all requirements are met before proceeding',
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <HelpCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium">Prerequisites</h3>
              <p className="text-sm text-muted-foreground">Ensure all conditions are met before continuing</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {functionData.prerequisites.map((prereq, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <input 
                  type="checkbox" 
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                />
                <span className="text-sm">{prereq}</span>
              </div>
            ))}
          </div>
          
          {functionData.warnings && functionData.warnings.length > 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Important Warnings</h4>
                  <ul className="mt-2 space-y-1">
                    {functionData.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-yellow-700">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'procedure',
      title: 'Execution Procedure',
      description: 'Follow the step-by-step procedure',
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <HelpCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium">Procedure Steps</h3>
              <p className="text-sm text-muted-foreground">Follow each step carefully</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {functionData.procedure.map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {index + 1}
                </div>
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'execute',
      title: 'Execute Function',
      description: 'Run the function with real-time monitoring',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium">{functionData.name}</h3>
            <p className="text-sm text-muted-foreground">Ready to execute the function</p>
          </div>
          
          {isExecuting ? (
            <div className="space-y-4">
              <Progress value={executionProgress} className="w-full" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Executing function... {executionProgress}%
                </p>
              </div>
            </div>
          ) : executionResult === 'success' ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h4 className="mt-2 font-medium text-green-800">Function Completed Successfully</h4>
              <p className="mt-1 text-sm text-green-700">
                The {functionData.name} has been executed successfully.
              </p>
            </div>
          ) : executionResult === 'error' ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h4 className="mt-2 font-medium text-red-800">Function Failed</h4>
              <p className="mt-1 text-sm text-red-700">
                There was an error executing the function. Please try again.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Ready to Execute</h4>
                  <p className="mt-1 text-sm text-blue-700">
                    Click the Execute button below to run this function. 
                    The process will take approximately {functionData.estimatedTime}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionResult('pending');
    
    try {
      // Simulate execution with progress updates
      for (let i = 0; i <= 100; i += 10) {
        setExecutionProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setExecutionResult('success');
      onComplete({ success: true, functionId: functionData.id });
    } catch (error) {
      setExecutionResult('error');
      console.error('Execution error:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleFinish = () => {
    onComplete({ success: executionResult === 'success', functionId: functionData.id });
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{functionData.name} Wizard</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                    index <= currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-8 ${index < currentStep ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="pt-4">
            {steps[currentStep].content}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        
        {currentStep === steps.length - 1 ? (
          isExecuting ? (
            <Button disabled>
              Executing...
            </Button>
          ) : executionResult === 'success' ? (
            <Button onClick={handleFinish}>
              Finish
            </Button>
          ) : executionResult === 'error' ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleExecute}>
                Retry
              </Button>
            </div>
          ) : (
            <Button onClick={handleExecute}>
              Execute Function
            </Button>
          )
        ) : (
          <Button onClick={handleNext}>
            Next
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FunctionWizard;