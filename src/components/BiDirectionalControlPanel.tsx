import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { 
  biDirectionalControlService, 
  ActuatorTestResult, 
  ActuatorTestProgress 
} from '@/services/BiDirectionalControlService';
import { enhancedVehicleService } from '@/services/EnhancedVehicleService';
import { VehicleModule, ModuleFunction } from '@/types/vehicleModules';

interface TestItem {
  module: VehicleModule;
  func: ModuleFunction;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: ActuatorTestResult;
}

const BiDirectionalControlPanel: React.FC = () => {
  const [modules, setModules] = useState<VehicleModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<VehicleModule | null>(null);
  const [testItems, setTestItems] = useState<TestItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load modules on component mount
  useEffect(() => {
    const loadedModules = enhancedVehicleService.getAllModules();
    setModules(loadedModules);
    
    if (loadedModules.length > 0) {
      setSelectedModule(loadedModules[0]);
    }
  }, []);

  // Update test items when module changes
  useEffect(() => {
    if (selectedModule) {
      const actuatorFunctions = biDirectionalControlService.getActuatorFunctions(selectedModule);
      const items: TestItem[] = actuatorFunctions.map(func => ({
        module: selectedModule,
        func,
        status: 'pending'
      }));
      setTestItems(items);
    }
  }, [selectedModule]);

  // Handle module selection
  const handleModuleSelect = (module: VehicleModule) => {
    if (!isRunning) {
      setSelectedModule(module);
      setError(null);
    }
  };

  // Execute a single test
  const executeTest = async (item: TestItem) => {
    if (isRunning) return;
    
    setIsRunning(true);
    setError(null);
    setCurrentTest(item.func.id);
    
    try {
      // Update item status to running
      setTestItems(prev => prev.map(test => 
        test.func.id === item.func.id 
          ? { ...test, status: 'running' } 
          : test
      ));
      
      // Execute the test
      const result = await biDirectionalControlService.executeActuatorTest(
        item.module, 
        item.func
      );
      
      // Update item with result
      setTestItems(prev => prev.map(test => 
        test.func.id === item.func.id 
          ? { ...test, status: result.success ? 'completed' : 'failed', result } 
          : test
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      // Update item status to failed
      setTestItems(prev => prev.map(test => 
        test.func.id === item.func.id 
          ? { ...test, status: 'failed' } 
          : test
      ));
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  };

  // Execute all tests
  const executeAllTests = async () => {
    if (isRunning || testItems.length === 0) return;
    
    setIsRunning(true);
    setError(null);
    setProgress(0);
    
    try {
      // Convert test items to the format expected by the service
      const tests = testItems.map(item => ({
        module: item.module,
        func: item.func
      }));
      
      // Execute all tests with progress tracking
      const results = await biDirectionalControlService.executeMultipleTests(
        tests,
        (progress: ActuatorTestProgress) => {
          setProgress(progress.progress);
          setCurrentTest(progress.functionName);
          
          // Update test item status
          setTestItems(prev => prev.map(item => {
            if (item.func.name === progress.functionName) {
              return {
                ...item,
                status: progress.status as 'pending' | 'running' | 'completed' | 'failed'
              };
            }
            return item;
          }));
        }
      );
      
      // Update all items with results
      setTestItems(prev => prev.map((item, index) => {
        if (results[index]) {
          return {
            ...item,
            status: results[index].success ? 'completed' : 'failed',
            result: results[index]
          };
        }
        return item;
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setIsRunning(false);
      setProgress(0);
      setCurrentTest(null);
    }
  };

  // Stop current test
  const stopTest = async () => {
    try {
      await biDirectionalControlService.stopCurrentTest();
      setIsRunning(false);
      setCurrentTest(null);
      setProgress(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop test';
      setError(errorMessage);
    }
  };

  // Get status icon for test item
  const getStatusIcon = (status: TestItem['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get status badge for test item
  const getStatusBadge = (status: TestItem['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Bi-Directional Control Panel</span>
            <Badge variant="outline">Advanced</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Execute actuator tests and control vehicle components directly. 
            Use with caution and ensure vehicle is in a safe testing environment.
          </p>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Module Selection */}
            <div className="md:col-span-1">
              <h3 className="font-medium mb-2">Vehicle Modules</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {modules.map(module => (
                  <Button
                    key={module.id}
                    variant={selectedModule?.id === module.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleModuleSelect(module)}
                    disabled={isRunning}
                  >
                    <span className="truncate">{module.name}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Test Controls */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">
                  {selectedModule ? selectedModule.name : 'Select a Module'}
                </h3>
                <div className="flex space-x-2">
                  <Button
                    onClick={executeAllTests}
                    disabled={isRunning || !selectedModule || testItems.length === 0}
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run All
                  </Button>
                  {isRunning && (
                    <Button
                      onClick={stopTest}
                      variant="destructive"
                      size="sm"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  )}
                </div>
              </div>
              
              {isRunning && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  {currentTest && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Running: {currentTest}
                    </p>
                  )}
                </div>
              )}
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testItems.map((item, index) => (
                  <div 
                    key={`${item.module.id}-${item.func.id}`}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <p className="font-medium">{item.func.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.func.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(item.status)}
                      <Button
                        size="sm"
                        onClick={() => executeTest(item)}
                        disabled={isRunning || item.status === 'running'}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {testItems.length === 0 && selectedModule && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No actuator tests available for this module</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Test Results */}
      {testItems.some(item => item.result) && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testItems
                .filter(item => item.result)
                .map(item => item.result)
                .map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{result?.functionName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Duration: {result?.duration}ms
                        </p>
                      </div>
                      <Badge variant={result?.success ? "default" : "destructive"}>
                        {result?.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-mono bg-muted p-2 rounded">
                        {result?.response}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BiDirectionalControlPanel;