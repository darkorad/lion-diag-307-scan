
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Download, 
  Gauge, 
  Thermometer, 
  Fuel, 
  Wind,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface LiveDataMonitorProps {
  isConnected: boolean;
  vehicleInfo?: {
    make: string;
    model: string;
  };
  onBack?: () => void;
}

// Enhanced PID definitions with comprehensive data
const ENHANCED_PIDS = {
  '010C': { name: 'Engine RPM', unit: 'RPM', category: 'engine' as const, description: 'Engine rotational speed' },
  '010D': { name: 'Vehicle Speed', unit: 'km/h', category: 'engine' as const, description: 'Vehicle speed sensor' },
  '0105': { name: 'Engine Coolant Temperature', unit: '°C', category: 'engine' as const, description: 'Engine coolant temperature' },
  '0111': { name: 'Throttle Position', unit: '%', category: 'engine' as const, description: 'Absolute throttle position' },
  '0110': { name: 'MAF Air Flow Rate', unit: 'g/s', category: 'engine' as const, description: 'Mass air flow sensor' },
  '012F': { name: 'Fuel Tank Level', unit: '%', category: 'fuel' as const, description: 'Fuel tank level input' },
  '010F': { name: 'Intake Air Temperature', unit: '°C', category: 'engine' as const, description: 'Intake air temperature' },
  '010A': { name: 'Fuel Rail Pressure', unit: 'kPa', category: 'fuel' as const, description: 'Fuel rail pressure' },
  '0143': { name: 'Absolute Load Value', unit: '%', category: 'engine' as const, description: 'Absolute load value' },
  '0104': { name: 'Engine Load', unit: '%', category: 'engine' as const, description: 'Calculated engine load' },
  '0106': { name: 'Short Term Fuel Trim Bank 1', unit: '%', category: 'fuel' as const, description: 'Short term fuel trim' },
  '0107': { name: 'Long Term Fuel Trim Bank 1', unit: '%', category: 'fuel' as const, description: 'Long term fuel trim' },
  '010B': { name: 'Intake Manifold Pressure', unit: 'kPa', category: 'engine' as const, description: 'Intake manifold absolute pressure' },
  '0142': { name: 'Control Module Voltage', unit: 'V', category: 'electrical' as const, description: 'Control module power supply' },
  '0133': { name: 'Barometric Pressure', unit: 'kPa', category: 'emission' as const, description: 'Absolute barometric pressure' },
};

type EnhancedPidDefinition = {
  name: string;
  unit: string;
  category: 'engine' | 'fuel' | 'electrical' | 'emission';
  description: string;
};

const LiveDataMonitor: React.FC<LiveDataMonitorProps> = ({ 
  isConnected, 
  vehicleInfo,
  onBack 
}) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedPIDs, setSelectedPIDs] = useState<string[]>(['010C', '010D', '0105', '0111']);
  const [pidData, setPidData] = useState<{ [pidId: string]: number }>({});
  const [historicalData, setHistoricalData] = useState<{ [pidId: string]: Array<{ time: number; value: number }> }>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock data generation for demonstration
  const generateMockData = (pidId: string): number => {
    const baseValues: { [key: string]: number } = {
      '010C': 800 + Math.random() * 2000, // RPM: 800-2800
      '010D': Math.random() * 120, // Speed: 0-120 km/h
      '0105': 80 + Math.random() * 20, // Temp: 80-100°C
      '0111': Math.random() * 100, // Throttle: 0-100%
      '0110': 2 + Math.random() * 8, // MAF: 2-10 g/s
      '012F': 50 + Math.random() * 50, // Fuel: 50-100%
      '010F': 20 + Math.random() * 40, // Intake temp: 20-60°C
      '010A': 250 + Math.random() * 100, // Fuel pressure: 250-350 kPa
    };
    return baseValues[pidId] || Math.random() * 100;
  };

  const startMonitoring = () => {
    if (!isConnected) {
      toast.error('Device not connected. Connect to OBD2 device first.');
      return;
    }

    setIsMonitoring(true);
    toast.success('Started live data monitoring');
    
    intervalRef.current = setInterval(() => {
      const newData: { [pidId: string]: number } = {};
      const timestamp = Date.now();
      
      selectedPIDs.forEach(pidId => {
        const value = generateMockData(pidId);
        newData[pidId] = value;
        
        // Update historical data
        setHistoricalData(prev => ({
          ...prev,
          [pidId]: [
            ...(prev[pidId] || []).slice(-29), // Keep last 30 points
            { time: timestamp, value }
          ]
        }));
      });
      
      setPidData(newData);
    }, 1000);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    toast.success('Stopped live data monitoring');
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getCategoryIcon = (category: EnhancedPidDefinition['category']) => {
    switch (category) {
      case 'engine': return <Gauge className="h-4 w-4" />;
      case 'fuel': return <Fuel className="h-4 w-4" />;
      case 'electrical': return <Activity className="h-4 w-4" />;
      case 'emission': return <Wind className="h-4 w-4" />;
      default: return <Gauge className="h-4 w-4" />;
    }
  };

  const getMaxValue = (pidId: string): number => {
    const maxValues: { [key: string]: number } = {
      '010C': 8000, // RPM
      '010D': 255, // Speed km/h
      '0105': 120, // Engine temp °C
      '0111': 100, // Throttle position %
      '0110': 655.35, // MAF g/s
      '012F': 100, // Fuel level %
      '010F': 120, // Intake temp °C
      '010A': 765, // Fuel pressure kPa
    };
    
    return maxValues[pidId] || 100;
  };

  const exportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      vehicle: vehicleInfo,
      currentData: pidData,
      historicalData: historicalData
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `live-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };

  const getCurrentValue = (pidId: string): number => {
    return pidData[pidId] || 0;
  };

  const formatChartData = (pidId: string) => {
    const data = historicalData[pidId] || [];
    return data.map((point, index) => ({
      time: index,
      value: point.value
    }));
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Live Data Monitor</span>
              {vehicleInfo && (
                <Badge variant="outline">
                  {vehicleInfo.make} {vehicleInfo.model}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                variant={isMonitoring ? "destructive" : "default"}
                size="sm"
              >
                {isMonitoring ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </>
                )}
              </Button>
              <Button
                onClick={exportData}
                variant="outline"
                size="sm"
                disabled={Object.keys(pidData).length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {!isConnected && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <h3 className="font-semibold mb-2">Connection Required</h3>
              <p>Connect to an OBD2 device to monitor live vehicle data</p>
              <p className="text-sm mt-2">Demo mode shows simulated data for interface testing</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="gauges" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gauges">Live Gauges</TabsTrigger>
          <TabsTrigger value="charts">Historical Charts</TabsTrigger>
          <TabsTrigger value="data">Raw Data</TabsTrigger>
        </TabsList>

        <TabsContent value="gauges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedPIDs.map(pidId => {
              const pid = ENHANCED_PIDS[pidId as keyof typeof ENHANCED_PIDS];
              if (!pid) return null;
              
              const currentValue = getCurrentValue(pidId);
              const maxValue = getMaxValue(pidId);
              
              return (
                <Card key={pidId} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(pid.category)}
                        <span className="font-medium text-sm">{pid.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {pidId}
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {currentValue.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">{pid.unit}</div>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${Math.min((currentValue / maxValue) * 100, 100)}%` 
                        }} 
                      />
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {pid.description}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedPIDs.map(pidId => {
              const pid = ENHANCED_PIDS[pidId as keyof typeof ENHANCED_PIDS];
              if (!pid) return null;
              
              const chartData = formatChartData(pidId);
              
              return (
                <Card key={pidId}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      {getCategoryIcon(pid.category)}
                      <span>{pid.name}</span>
                      <Badge variant="outline" className="text-xs">{pid.unit}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={() => 'Time'}
                            formatter={(value: number) => [value.toFixed(2), pid.unit]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current PID Values</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedPIDs.map(pidId => {
                  const pid = ENHANCED_PIDS[pidId as keyof typeof ENHANCED_PIDS];
                  if (!pid) return null;
                  
                  return (
                    <div key={pidId} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="font-mono text-xs">{pidId}</Badge>
                        <span className="text-sm">{pid.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-semibold">
                          {getCurrentValue(pidId).toFixed(2)} {pid.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveDataMonitor;
