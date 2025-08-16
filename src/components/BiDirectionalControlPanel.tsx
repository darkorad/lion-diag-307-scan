
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Play, 
  Square, 
  Settings, 
  Zap,
  Fan,
  Fuel,
  Wind,
  Car,
  Wrench,
  Shield,
  CheckCircle
} from 'lucide-react';
import { biDirectionalControlService, ActuatorTest, BiDirectionalResult } from '@/services/BiDirectionalControlService';

interface BiDirectionalControlPanelProps {
  isConnected: boolean;
  vehicleMake?: string;
  vehicleModel?: string;
}

const BiDirectionalControlPanel: React.FC<BiDirectionalControlPanelProps> = ({
  isConnected,
  vehicleMake = 'Unknown',
  vehicleModel = ''
}) => {
  const [availableTests, setAvailableTests] = useState<ActuatorTest[]>([]);
  const [runningTest, setRunningTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: BiDirectionalResult }>({});
  const [testProgress, setTestProgress] = useState(0);

  React.useEffect(() => {
    if (isConnected && vehicleMake !== 'Unknown') {
      const tests = biDirectionalControlService.getAvailableTests(vehicleMake, vehicleModel);
      setAvailableTests(tests);
    }
  }, [isConnected, vehicleMake, vehicleModel]);

  const handleTestExecution = async (test: ActuatorTest) => {
    if (runningTest) {
      return;
    }

    setRunningTest(test.id);
    setTestProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setTestProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, test.duration ? test.duration / 10 : 200);

    try {
      const result = await biDirectionalControlService.executeTest(test);
      setTestResults(prev => ({ ...prev, [test.id]: result }));
      setTestProgress(100);
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [test.id]: {
          success: false,
          message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }));
    } finally {
      setTimeout(() => {
        setRunningTest(null);
        setTestProgress(0);
        clearInterval(progressInterval);
      }, 1000);
    }
  };

  const handleEmergencyStop = async () => {
    await biDirectionalControlService.emergencyStop();
    setRunningTest(null);
    setTestProgress(0);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engine': return <Zap className="h-5 w-5" />;
      case 'climate': return <Wind className="h-5 w-5" />;
      case 'brake': return <Car className="h-5 w-5" />;
      case 'body': return <Fan className="h-5 w-5" />;
      case 'electrical': return <Settings className="h-5 w-5" />;
      default: return <Wrench className="h-5 w-5" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRiskVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const groupedTests = availableTests.reduce((acc, test) => {
    if (!acc[test.category]) {
      acc[test.category] = [];
    }
    acc[test.category].push(test);
    return acc;
  }, {} as { [key: string]: ActuatorTest[] });

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Connect to an OBD2 adapter to access bi-directional control functions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Warning:</strong> Bi-directional controls directly activate vehicle components. 
          Ensure the vehicle is in a safe location and follow all safety precautions before testing.
        </AlertDescription>
      </Alert>

      {/* Emergency Stop */}
      {runningTest && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-red-600">Test in Progress</p>
                <p className="text-sm text-muted-foreground">
                  {availableTests.find(t => t.id === runningTest)?.name}
                </p>
                <Progress value={testProgress} className="mt-2 w-48" />
              </div>
              <Button 
                variant="destructive" 
                onClick={handleEmergencyStop}
                className="ml-4"
              >
                <Square className="h-4 w-4 mr-2" />
                Emergency Stop
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Connected Vehicle</p>
              <p className="text-sm text-muted-foreground">
                {vehicleMake} {vehicleModel} • {availableTests.length} tests available
              </p>
            </div>
            <Badge variant="default">
              {vehicleMake !== 'Unknown' ? 'Supported' : 'Generic'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Test Categories */}
      <Tabs defaultValue={Object.keys(groupedTests)[0]} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          {Object.keys(groupedTests).map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(groupedTests).map(([category, tests]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tests.map((test) => (
                <Card key={test.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(test.category)}
                        <span>{test.name}</span>
                      </div>
                      <Badge variant={getRiskVariant(test.riskLevel)}>
                        {test.riskLevel.toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Component:</strong> {test.component}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {test.description}
                        </p>
                        {test.duration && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Duration: {test.duration / 1000}s
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          onClick={() => handleTestExecution(test)}
                          disabled={!!runningTest}
                          variant={test.riskLevel === 'high' ? 'destructive' : 'default'}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Run Test
                        </Button>

                        {testResults[test.id] && (
                          <div className="flex items-center space-x-2">
                            {testResults[test.id].success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-sm ${testResults[test.id].success ? 'text-green-600' : 'text-red-600'}`}>
                              {testResults[test.id].success ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                        )}
                      </div>

                      {testResults[test.id] && (
                        <Alert>
                          <AlertDescription className="text-sm">
                            {testResults[test.id].message}
                            {testResults[test.id].duration && (
                              <span className="text-muted-foreground">
                                {' '}({testResults[test.id].duration}ms)
                              </span>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {availableTests.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No bi-directional tests available for this vehicle. This may be due to:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Unsupported vehicle make/model</li>
              <li>Limited OBD2 adapter capabilities</li>
              <li>Vehicle communication protocol not supported</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default BiDirectionalControlPanel;
