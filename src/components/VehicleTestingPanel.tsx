
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Car, 
  Zap, 
  Thermometer, 
  Gauge,
  Volume2,
  Fan,
  Lightbulb,
  Battery,
  Fuel,
  Wind,
  AlertTriangle,
  CheckCircle,
  Play,
  Square,
  RefreshCw
} from 'lucide-react';
import { VehicleModulesService } from '@/services/VehicleModulesService';
import { useToast } from '@/hooks/use-toast';

interface VehicleTestingPanelProps {
  isConnected: boolean;
  onCommand?: (command: string) => Promise<string>;
  vehicleInfo?: Record<string, unknown>;
}

const VehicleTestingPanel: React.FC<VehicleTestingPanelProps> = ({
  isConnected,
  onCommand,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message?: string; error?: string }>>({});
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [realOdometer, setRealOdometer] = useState<number | null>(null);
  const { toast } = useToast();

  const vehicleModulesService = onCommand 
    ? new VehicleModulesService(onCommand)
    : null;

  const systemTests = [
    {
      id: 'horn',
      name: 'Horn Test',
      icon: Volume2,
      description: 'Test horn functionality',
      category: 'Comfort'
    },
    {
      id: 'wipers',
      name: 'Wiper Test',
      icon: Wind,
      description: 'Test windshield wipers',
      category: 'Comfort'
    },
    {
      id: 'climate',
      name: 'Climate Control',
      icon: Fan,
      description: 'Test AC/heating system',
      category: 'Climate'
    },
    {
      id: 'lights',
      name: 'Light Systems',
      icon: Lightbulb,
      description: 'Test all vehicle lights',
      category: 'Lighting'
    },
    {
      id: 'battery',
      name: 'Charging System',
      icon: Battery,
      description: 'Test battery and alternator',
      category: 'Electrical'
    },
    {
      id: 'fuel',
      name: 'Fuel System',
      icon: Fuel,
      description: 'Test fuel pressure and delivery',
      category: 'Engine'
    },
    {
      id: 'egr',
      name: 'EGR Learning',
      icon: RefreshCw,
      description: 'Perform EGR valve learning',
      category: 'Emissions'
    }
  ];

  const runSystemTest = async (testId: string) => {
    if (!vehicleModulesService || !isConnected) {
      toast({
        title: "Connection Required",
        description: "Please connect to vehicle first",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setSelectedTest(testId);

    try {
      let result;
      
      switch (testId) {
        case 'horn':
          await vehicleModulesService.testHorn(2000);
          result = { success: true, message: 'Horn test completed' };
          break;
          
        case 'wipers':
          await vehicleModulesService.testWipers(2);
          result = { success: true, message: 'Wiper test completed' };
          break;
          
        case 'climate':
          result = await vehicleModulesService.testClimate();
          break;
          
        case 'lights':
          result = await vehicleModulesService.testAllBulbs();
          break;
          
        case 'battery':
          result = await vehicleModulesService.testChargingSystem();
          break;
          
        case 'fuel':
          result = await vehicleModulesService.testFuelPressure();
          break;
          
        case 'egr':
          result = await vehicleModulesService.performEGRLearning();
          break;
          
        default:
          throw new Error('Unknown test');
      }

      setTestResults(prev => ({ ...prev, [testId]: result }));
      
      toast({
        title: "Test Completed",
        description: `${systemTests.find(t => t.id === testId)?.name} test finished successfully`
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Test failed';
      setTestResults(prev => ({ 
        ...prev, 
        [testId]: { success: false, error: errorMessage } 
      }));
      
      toast({
        title: "Test Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setSelectedTest(null);
    }
  };

  const readRealOdometer = async () => {
    if (!vehicleModulesService || !isConnected) {
      toast({
        title: "Connection Required",
        description: "Please connect to vehicle first",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    
    try {
      const km = await vehicleModulesService.getRealOdometer();
      setRealOdometer(km);
      
      toast({
        title: "Odometer Read",
        description: `Real odometer: ${km.toLocaleString()} km`
      });
    } catch (error) {
      toast({
        title: "Failed to Read Odometer",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const renderTestResult = (testId: string) => {
    const result = testResults[testId];
    if (!result) return null;

    if (result.error) {
      return (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      );
    }

    switch (testId) {
      case 'climate':
        return (
          <div className="mt-2 p-3 bg-muted rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Temperature:</span>
                <br />
                {result.temperature}°C
              </div>
              <div>
                <span className="font-medium">Fan Speed:</span>
                <br />
                Level {result.fanSpeed}
              </div>
              <div>
                <span className="font-medium">Mode:</span>
                <br />
                {result.mode}
              </div>
            </div>
          </div>
        );

      case 'lights':
        return (
          <div className="mt-2 p-3 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(result).map(([bulb, working]) => (
                <div key={bulb} className="flex items-center justify-between">
                  <span className="capitalize">{bulb.replace('_', ' ')}:</span>
                  <Badge variant={working ? "default" : "destructive"}>
                    {working ? "OK" : "FAIL"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        );

      case 'battery':
        return (
          <div className="mt-2 p-3 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Voltage:</span>
                <br />
                {result.voltage}V
              </div>
              <div>
                <span className="font-medium">Current:</span>
                <br />
                {result.current}A
              </div>
              <div>
                <span className="font-medium">Temperature:</span>
                <br />
                {result.temperature}°C
              </div>
              <div>
                <span className="font-medium">Health:</span>
                <br />
                <Badge variant={result.health === 'Good' ? "default" : "destructive"}>
                  {result.health}
                </Badge>
              </div>
            </div>
          </div>
        );

      case 'fuel':
        return (
          <div className="mt-2 p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">Pressure: {result.pressure} bar</span>
              </div>
              <Badge variant={result.status === 'Normal' ? "default" : "destructive"}>
                {result.status}
              </Badge>
            </div>
          </div>
        );

      case 'egr':
        return (
          <div className="mt-2 p-3 bg-muted rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Learning Status:</span>
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "SUCCESS" : "FAILED"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>EGR Position:</span>
                <span>{result.position}%</span>
              </div>
              <div className="flex justify-between">
                <span>Condition:</span>
                <Badge variant={result.condition === 'Good' ? "default" : "secondary"}>
                  {result.condition}
                </Badge>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <Alert className="mt-2">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{result.message || 'Test completed successfully'}</AlertDescription>
          </Alert>
        );
    }
  };

  const groupedTests = systemTests.reduce((acc, test) => {
    if (!acc[test.category]) acc[test.category] = [];
    acc[test.category].push(test);
    return acc;
  }, {} as Record<string, typeof systemTests>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Professional Vehicle Testing
          </CardTitle>
          <CardDescription>
            Comprehensive system testing and diagnostics for all vehicle components
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="systems" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="systems">System Tests</TabsTrigger>
          <TabsTrigger value="readings">Live Readings</TabsTrigger>
          <TabsTrigger value="odometer">Real Odometer</TabsTrigger>
        </TabsList>

        <TabsContent value="systems">
          <div className="space-y-6">
            {Object.entries(groupedTests).map(([category, tests]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category} Systems</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tests.map((test) => {
                      const Icon = test.icon;
                      const result = testResults[test.id];
                      const isTestRunning = isRunning && selectedTest === test.id;
                      
                      return (
                        <Card key={test.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icon className="h-5 w-5 text-primary" />
                                <h4 className="font-medium">{test.name}</h4>
                              </div>
                              {result && (
                                <Badge variant={result.success !== false ? "default" : "destructive"}>
                                  {result.success !== false ? "PASS" : "FAIL"}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              {test.description}
                            </p>
                            
                            <Button
                              onClick={() => runSystemTest(test.id)}
                              disabled={!isConnected || isRunning}
                              className="w-full"
                              variant="outline"
                            >
                              {isTestRunning ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Testing...
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Run Test
                                </>
                              )}
                            </Button>
                            
                            {renderTestResult(test.id)}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="readings">
          <Card>
            <CardHeader>
              <CardTitle>Live Vehicle Parameters</CardTitle>
              <CardDescription>
                Real-time readings from all vehicle systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Live readings functionality will be integrated with the existing live data panel.
                  This would show parameters like real fuel level, actual engine hours, 
                  precise temperatures, pressures, and other hidden values.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="odometer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Real Odometer Reading
              </CardTitle>
              <CardDescription>
                Read the actual odometer value from instrument cluster ECU
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This reads the real odometer value directly from the ECU, 
                  which may differ from the displayed value if the instrument cluster has been changed.
                </AlertDescription>
              </Alert>

              <Button
                onClick={readRealOdometer}
                disabled={!isConnected || isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Reading Odometer...
                  </>
                ) : (
                  <>
                    <Gauge className="mr-2 h-4 w-4" />
                    Read Real Odometer
                  </>
                )}
              </Button>

              {realOdometer !== null && (
                <Card className="p-4 bg-muted">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-primary">
                      {realOdometer.toLocaleString()} km
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Real odometer reading from ECU
                    </p>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleTestingPanel;
