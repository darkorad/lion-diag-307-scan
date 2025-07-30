
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Timer, 
  Zap, 
  Fuel, 
  TrendingUp, 
  Play, 
  Square, 
  RotateCcw, 
  Award,
  Gauge,
  Activity
} from 'lucide-react';
import { performanceMetricsService, PerformanceMetrics } from '@/services/PerformanceMetricsService';

interface PerformanceTestPanelProps {
  isConnected: boolean;
}

const PerformanceTestPanel: React.FC<PerformanceTestPanelProps> = ({ isConnected }) => {
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testType, setTestType] = useState<'acceleration' | 'fuel_efficiency' | 'power_test'>('acceleration');
  const [testResults, setTestResults] = useState<PerformanceMetrics | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [testProgress, setTestProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isTestRunning) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 0.1);
      
      // Simulate speed increase during acceleration test
      if (testType === 'acceleration') {
        setCurrentSpeed(prev => {
          const newSpeed = Math.min(prev + (Math.random() * 3), 100);
          setTestProgress((newSpeed / 100) * 100);
          performanceMetricsService.recordAccelerationData(newSpeed);
          
          if (newSpeed >= 60 && prev < 60) {
            // Auto-complete acceleration test at 60 km/h
            setTimeout(() => stopTest(), 1000);
          }
          
          return newSpeed;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isTestRunning, testType, stopTest]);

  const startTest = () => {
    setIsTestRunning(true);
    setElapsedTime(0);
    setCurrentSpeed(0);
    setTestProgress(0);
    
    if (testType === 'acceleration') {
      performanceMetricsService.startAccelerationTest();
    }
  };

  const stopTest = useCallback(() => {
    setIsTestRunning(false);
    
    if (testType === 'acceleration') {
      const accelerationResults = performanceMetricsService.stopAccelerationTest();
      setTestResults({
        accelerationTest: accelerationResults,
        fuelEfficiency: performanceMetricsService.calculateFuelEfficiency(25, currentSpeed),
        enginePerformance: performanceMetricsService.calculateEnginePerformance(2500, 25, 75)
      });
    }
  }, [testType, currentSpeed]);

  const resetTest = () => {
    setIsTestRunning(false);
    setTestResults(null);
    setCurrentSpeed(0);
    setTestProgress(0);
    setElapsedTime(0);
  };

  const formatTime = (seconds: number): string => {
    return seconds.toFixed(1) + 's';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" />
              <span>Performance Testing Suite</span>
            </div>
            <div className="flex items-center space-x-2">
              {!isTestRunning && !testResults && (
                <Button
                  onClick={startTest}
                  disabled={!isConnected}
                  variant="default"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Test
                </Button>
              )}
              {isTestRunning && (
                <Button onClick={stopTest} variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Stop Test
                </Button>
              )}
              {(testResults || isTestRunning) && (
                <Button onClick={resetTest} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={testType} onValueChange={(value) => setTestType(value as 'acceleration' | 'fuel_efficiency' | 'power_test')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="acceleration">Acceleration Test</TabsTrigger>
              <TabsTrigger value="fuel_efficiency">Fuel Efficiency</TabsTrigger>
              <TabsTrigger value="power_test">Power Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="acceleration" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <Timer className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Elapsed Time</p>
                        <p className="text-2xl font-bold">{formatTime(elapsedTime)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Current Speed</p>
                        <p className="text-2xl font-bold">{currentSpeed.toFixed(0)} km/h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <Progress value={testProgress} className="mt-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {testResults?.accelerationTest && (
                <Card>
                  <CardHeader>
                    <CardTitle>Acceleration Test Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">0-60 km/h</p>
                        <p className="text-3xl font-bold text-primary">
                          {testResults.accelerationTest.zeroToSixty 
                            ? formatTime(testResults.accelerationTest.zeroToSixty)
                            : 'N/A'
                          }
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Max Acceleration</p>
                        <p className="text-3xl font-bold text-green-500">
                          {testResults.accelerationTest.maxAcceleration.toFixed(1)} m/s²
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Performance Rating</p>
                        <Badge variant="default" className="text-lg">
                          {testResults.accelerationTest.zeroToSixty && testResults.accelerationTest.zeroToSixty < 12 ? 'Excellent' : 'Good'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="fuel_efficiency" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Fuel className="h-5 w-5 text-green-500" />
                    <span>Fuel Efficiency Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Instant MPG</p>
                      <p className="text-2xl font-bold">42.5</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Average MPG</p>
                      <p className="text-2xl font-bold">45.2</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Trip MPG</p>
                      <p className="text-2xl font-bold">43.8</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Fuel Rate</p>
                      <p className="text-2xl font-bold">2.1 L/h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="power_test" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gauge className="h-5 w-5 text-red-500" />
                    <span>Engine Performance Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Power Output</p>
                      <p className="text-2xl font-bold">65.2 kW</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Torque Estimate</p>
                      <p className="text-2xl font-bold">245 Nm</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Efficiency</p>
                      <p className="text-2xl font-bold">78%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Load Factor</p>
                      <p className="text-2xl font-bold">65%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceTestPanel;
