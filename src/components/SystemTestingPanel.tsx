import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TestTube,
  Zap,
  Gauge,
  Settings,
  Car,
  Thermometer,
  Fuel,
  Wind,
  Shield,
  Volume2,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Play,
  Square
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemTestingPanelProps {
  isConnected: boolean;
  vehicleInfo?: Record<string, unknown>;
}

const SystemTestingPanel: React.FC<SystemTestingPanelProps> = ({ isConnected }) => {
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [testResults, setTestResults] = useState<Record<string, unknown>>({});
  const [activeTests, setActiveTests] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const systemTests = [
    {
      id: 'actuator_test',
      category: 'engine',
      name: 'Actuator Test',
      description: 'Test fuel injectors, ignition coils, and other actuators',
      icon: <Zap className="h-5 w-5" />,
      duration: 5000,
      steps: [
        'Initializing actuator test sequence',
        'Testing fuel injector 1',
        'Testing fuel injector 2',
        'Testing fuel injector 3',
        'Testing fuel injector 4',
        'Testing ignition coils',
        'Analyzing results'
      ]
    },
    {
      id: 'compression_test',
      category: 'engine',
      name: 'Compression Test',
      description: 'Virtual compression test using engine data',
      icon: <Gauge className="h-5 w-5" />,
      duration: 8000,
      steps: [
        'Preparing compression test',
        'Cranking engine simulation',
        'Measuring cylinder 1 pressure',
        'Measuring cylinder 2 pressure',
        'Measuring cylinder 3 pressure',
        'Measuring cylinder 4 pressure',
        'Calculating compression ratio',
        'Generating report'
      ]
    },
    {
      id: 'cooling_test',
      category: 'cooling',
      name: 'Cooling System Test',
      description: 'Test thermostat, radiator fan, and cooling system',
      icon: <Thermometer className="h-5 w-5" />,
      duration: 6000,
      steps: [
        'Starting cooling system test',
        'Testing thermostat operation',
        'Testing radiator fan low speed',
        'Testing radiator fan high speed',
        'Checking coolant temperature sensor',
        'Verifying system operation'
      ]
    },
    {
      id: 'fuel_system_test',
      category: 'fuel',
      name: 'Fuel System Test',
      description: 'Test fuel pump, pressure regulator, and delivery',
      icon: <Fuel className="h-5 w-5" />,
      duration: 7000,
      steps: [
        'Initializing fuel system test',
        'Testing fuel pump pressure',
        'Testing pressure regulator',
        'Testing fuel delivery rate',
        'Testing return system',
        'Checking for leaks',
        'Finalizing test results'
      ]
    },
    {
      id: 'abs_test',
      category: 'brake',
      name: 'ABS System Test',
      description: 'Test ABS pump, valves, and wheel sensors',
      icon: <Shield className="h-5 w-5" />,
      duration: 4000,
      steps: [
        'Starting ABS system test',
        'Testing ABS pump motor',
        'Testing solenoid valves',
        'Testing wheel speed sensors',
        'Verifying system communication'
      ]
    },
    {
      id: 'climate_test',
      category: 'comfort',
      name: 'Climate Control Test',
      description: 'Test A/C compressor, blend doors, and fans',
      icon: <Wind className="h-5 w-5" />,
      duration: 5000,
      steps: [
        'Initializing climate test',
        'Testing A/C compressor',
        'Testing blend door actuators',
        'Testing blower motor speeds',
        'Testing temperature sensors',
        'Completing system check'
      ]
    },
    {
      id: 'lighting_test',
      category: 'electrical',
      name: 'Lighting System Test',
      description: 'Test all vehicle lights and circuits',
      icon: <Zap className="h-5 w-5" />,
      duration: 3000,
      steps: [
        'Starting lighting test',
        'Testing headlights',
        'Testing taillights',
        'Testing turn signals',
        'Testing brake lights',
        'Completing circuit check'
      ]
    },
    {
      id: 'horn_test',
      category: 'electrical',
      name: 'Horn & Audio Test',
      description: 'Test horn, speakers, and audio system',
      icon: <Volume2 className="h-5 w-5" />,
      duration: 2000,
      steps: [
        'Testing horn circuit',
        'Testing audio amplifier',
        'Testing speaker outputs',
        'Verifying system operation'
      ]
    },
    {
      id: 'transmission_test',
      category: 'transmission',
      name: 'Transmission Test',
      description: 'Test transmission solenoids and pressure',
      icon: <Car className="h-5 w-5" />,
      duration: 6000,
      steps: [
        'Initializing transmission test',
        'Testing shift solenoids',
        'Testing pressure control',
        'Testing torque converter',
        'Analyzing shift patterns',
        'Completing diagnostics'
      ]
    }
  ];

  const categories = [
    { id: 'engine', name: 'Engine', icon: <Zap className="h-4 w-4" /> },
    { id: 'brake', name: 'Brake', icon: <Shield className="h-4 w-4" /> },
    { id: 'electrical', name: 'Electrical', icon: <Zap className="h-4 w-4" /> },
    { id: 'cooling', name: 'Cooling', icon: <Thermometer className="h-4 w-4" /> },
    { id: 'fuel', name: 'Fuel', icon: <Fuel className="h-4 w-4" /> },
    { id: 'comfort', name: 'Comfort', icon: <Settings className="h-4 w-4" /> },
    { id: 'transmission', name: 'Transmission', icon: <Car className="h-4 w-4" /> }
  ];

  const runSystemTest = async (testId: string) => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to your vehicle first",
        variant: "destructive"
      });
      return;
    }

    const test = systemTests.find(t => t.id === testId);
    if (!test) return;

    setIsRunningTest(true);
    setCurrentTest(testId);
    setActiveTests(prev => new Set(prev).add(testId));

    try {
      const results: {
        startTime: Date;
        steps: {
          step: number;
          description: string;
          status: string;
          timestamp: Date;
          result?: { value: string; status: string };
        }[];
        status: string;
        endTime?: Date;
        overallResult?: {
          score: number;
          status: string;
          summary: string;
          recommendations: string[];
        };
      } = {
        startTime: new Date(),
        steps: [],
        status: 'running'
      };

      // Simulate test execution with steps
      for (let i = 0; i < test.steps.length; i++) {
        const step = test.steps[i];
        results.steps.push({
          step: i + 1,
          description: step,
          status: 'running',
          timestamp: new Date()
        });

        setTestResults(prev => ({ ...prev, [testId]: { ...results } }));

        // Simulate step duration
        await new Promise(resolve => setTimeout(resolve, test.duration / test.steps.length));

        // Mark step as completed
        results.steps[i].status = 'completed';
        results.steps[i].result = generateStepResult(test.id, i);

        setTestResults(prev => ({ ...prev, [testId]: { ...results } }));
      }

      // Complete the test
      results.status = 'completed';
      results.endTime = new Date();
      results.overallResult = generateOverallResult(test.id);
      
      setTestResults(prev => ({ ...prev, [testId]: results }));

      toast({
        title: "Test Complete",
        description: `${test.name} completed successfully`,
      });

    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testId]: {
          ...prev[testId],
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));

      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRunningTest(false);
      setCurrentTest('');
      setActiveTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
    }
  };

  const generateStepResult = (testId: string, stepIndex: number): { value: string; status: string } => {
    // Generate realistic test results based on test type and step
    const results: { [key: string]: { value: string; status: string }[] } = {
      actuator_test: [
        { value: '12.5ms', status: 'good' },
        { value: '11.8ms', status: 'good' },
        { value: '12.2ms', status: 'good' },
        { value: '13.1ms', status: 'warning' },
        { value: '15.2ms', status: 'good' },
        { value: 'All coils OK', status: 'good' },
        { value: '1 minor deviation', status: 'warning' }
      ],
      compression_test: [
        { value: 'Ready', status: 'good' },
        { value: 'Simulation active', status: 'good' },
        { value: '145 PSI', status: 'good' },
        { value: '142 PSI', status: 'good' },
        { value: '144 PSI', status: 'good' },
        { value: '138 PSI', status: 'warning' },
        { value: '9.8:1', status: 'good' },
        { value: 'Cylinder 4 low', status: 'warning' }
      ],
      cooling_test: [
        { value: 'System ready', status: 'good' },
        { value: '87°C opening', status: 'good' },
        { value: '850 RPM', status: 'good' },
        { value: '1200 RPM', status: 'good' },
        { value: '±2°C accuracy', status: 'good' },
        { value: 'All tests passed', status: 'good' }
      ],
      fuel_system_test: [
        { value: 'System active', status: 'good' },
        { value: '3.2 bar', status: 'good' },
        { value: 'Operating normally', status: 'good' },
        { value: '45 L/h', status: 'good' },
        { value: 'No backpressure', status: 'good' },
        { value: 'No leaks detected', status: 'good' },
        { value: 'System OK', status: 'good' }
      ],
      abs_test: [
        { value: 'Test started', status: 'good' },
        { value: '12V, 2.5A draw', status: 'good' },
        { value: 'All operational', status: 'good' },
        { value: 'All responding', status: 'good' },
        { value: 'CAN bus OK', status: 'good' }
      ],
      climate_test: [
        { value: 'System ready', status: 'good' },
        { value: 'Engaging normally', status: 'good' },
        { value: 'All positions OK', status: 'good' },
        { value: 'All speeds OK', status: 'good' },
        { value: '±1°C accuracy', status: 'good' },
        { value: 'System optimal', status: 'good' }
      ],
      lighting_test: [
        { value: 'Test active', status: 'good' },
        { value: 'High/Low OK', status: 'good' },
        { value: 'All functioning', status: 'good' },
        { value: 'L/R operational', status: 'good' },
        { value: 'All working', status: 'good' },
        { value: 'No faults found', status: 'good' }
      ],
      horn_test: [
        { value: '12V present', status: 'good' },
        { value: 'Output normal', status: 'good' },
        { value: 'All channels OK', status: 'good' },
        { value: 'Test complete', status: 'good' }
      ],
      transmission_test: [
        { value: 'Test initiated', status: 'good' },
        { value: 'All responding', status: 'good' },
        { value: '4.5 bar nominal', status: 'good' },
        { value: 'Lock-up OK', status: 'good' },
        { value: 'Within spec', status: 'good' },
        { value: 'System healthy', status: 'good' }
      ]
    };

    return results[testId]?.[stepIndex] || { value: 'OK', status: 'good' };
  };

  const generateOverallResult = (testId: string): {
    score: number;
    status: string;
    summary: string;
    recommendations: string[];
  } => {
    const overallResults: { [key: string]: {
      score: number;
      status: string;
      summary: string;
      recommendations: string[];
    } } = {
      actuator_test: {
        score: 85,
        status: 'warning',
        summary: 'Minor timing deviation on injector 4',
        recommendations: ['Check injector 4 wiring', 'Consider cleaning fuel system']
      },
      compression_test: {
        score: 78,
        status: 'warning',
        summary: 'Cylinder 4 showing lower compression',
        recommendations: ['Check valve clearances', 'Inspect cylinder 4 rings', 'Consider compression test']
      },
      cooling_test: {
        score: 95,
        status: 'good',
        summary: 'Cooling system operating optimally',
        recommendations: ['Continue regular maintenance']
      },
      fuel_system_test: {
        score: 92,
        status: 'good',
        summary: 'Fuel system functioning normally',
        recommendations: ['Replace fuel filter at next service']
      },
      abs_test: {
        score: 98,
        status: 'good',
        summary: 'ABS system fully operational',
        recommendations: ['No action required']
      },
      climate_test: {
        score: 88,
        status: 'good',
        summary: 'Climate control working properly',
        recommendations: ['Replace cabin filter at next service']
      },
      lighting_test: {
        score: 100,
        status: 'good',
        summary: 'All lighting circuits operational',
        recommendations: ['No action required']
      },
      horn_test: {
        score: 95,
        status: 'good',
        summary: 'Audio systems functioning normally',
        recommendations: ['No action required']
      },
      transmission_test: {
        score: 91,
        status: 'good',
        summary: 'Transmission operating within parameters',
        recommendations: ['Check transmission fluid level']
      }
    };

    return overallResults[testId] || {
      score: 90,
      status: 'good',
      summary: 'System test completed successfully',
      recommendations: ['No action required']
    };
  };

  const stopTest = (testId: string) => {
    setActiveTests(prev => {
      const newSet = new Set(prev);
      newSet.delete(testId);
      return newSet;
    });
    
    if (currentTest === testId) {
      setIsRunningTest(false);
      setCurrentTest('');
    }

    setTestResults(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        status: 'stopped',
        endTime: new Date()
      }
    }));
  };

  const getTestsByCategory = (category: string) => {
    return systemTests.filter(test => test.category === category);
  };

  const renderTestCard = (test: {
    id: string;
    category: string;
    name: string;
    description: string;
    icon: JSX.Element;
    duration: number;
    steps: string[];
  }) => {
    const isActive = activeTests.has(test.id);
    const result = testResults[test.id] as {
      status: string;
      steps: {
        description: string;
        status: string;
        result?: { value: string; status: string };
      }[];
      overallResult?: {
        score: number;
        status: string;
        summary: string;
        recommendations: string[];
      };
    };

    return (
      <Card key={test.id} className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
              {test.icon}
            </div>
            <div>
              <h4 className="font-medium">{test.name}</h4>
              <p className="text-sm text-muted-foreground">{test.description}</p>
              {result && (
                <Badge 
                  variant={result.status === 'completed' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}
                  className="mt-1"
                >
                  {result.status === 'completed' ? `Score: ${result.overallResult?.score}%` : result.status}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isActive ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => stopTest(test.id)}
              >
                <Square className="mr-1 h-3 w-3" />
                Stop
              </Button>
            ) : (
              <Button
                onClick={() => runSystemTest(test.id)}
                disabled={isRunningTest}
                size="sm"
              >
                <Play className="mr-1 h-3 w-3" />
                Run Test
              </Button>
            )}
          </div>
        </div>

        {/* Test Progress */}
        {isActive && result && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Test Progress:</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {result.steps?.map((step, index: number) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className={step.status === 'completed' ? 'text-green-600' : 'text-muted-foreground'}>
                    {step.description}
                  </span>
                  {step.status === 'completed' && step.result && (
                    <Badge
                      variant={step.result.status === 'good' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {step.result.value}
                    </Badge>
                  )}
                  {step.status === 'running' && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Results */}
        {result && result.status === 'completed' && result.overallResult && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Test Results</span>
              <Badge variant={result.overallResult.status === 'good' ? 'default' : 'destructive'}>
                {result.overallResult.score}% Score
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {result.overallResult.summary}
            </p>
            {result.overallResult.recommendations && (
              <div className="text-xs space-y-1">
                <div className="font-medium">Recommendations:</div>
                {result.overallResult.recommendations.map((rec, index: number) => (
                  <div key={index} className="text-muted-foreground">• {rec}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Professional System Testing
          </CardTitle>
          <CardDescription>
            Advanced vehicle system testing and diagnostics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please connect to your vehicle to access system testing functions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Professional System Testing
        </CardTitle>
        <CardDescription>
          Advanced vehicle system testing and diagnostic procedures
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="engine" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            {categories.slice(0, 4).map(category => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                <div className="flex items-center gap-1">
                  {category.icon}
                  <span className="hidden sm:inline">{category.name}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsList className="grid grid-cols-3 w-full">
            {categories.slice(4).map(category => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                <div className="flex items-center gap-1">
                  {category.icon}
                  <span className="hidden sm:inline">{category.name}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                {category.icon}
                <h3 className="font-medium">{category.name} System Tests</h3>
                <Badge variant="outline">
                  {getTestsByCategory(category.id).length} tests available
                </Badge>
              </div>
              
              {getTestsByCategory(category.id).map(renderTestCard)}
              
              {getTestsByCategory(category.id).length === 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No {category.name.toLowerCase()} tests available for this vehicle.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <Alert className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important Testing Guidelines:</strong>
            <ul className="mt-2 text-sm space-y-1">
              <li>• Ensure engine is at operating temperature for accurate results</li>
              <li>• Some tests require specific conditions (idle, RPM, etc.)</li>
              <li>• Stop tests immediately if unusual sounds or behaviors occur</li>
              <li>• Professional interpretation may be required for complex results</li>
              <li>• Do not perform tests on a public road</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default SystemTestingPanel;