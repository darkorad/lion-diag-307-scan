
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Activity, 
  Gauge, 
  Thermometer, 
  Fuel, 
  Zap, 
  Wind,
  Car,
  Settings,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface LiveDataPoint {
  pid: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  category: 'engine' | 'fuel' | 'emissions' | 'electrical' | 'transmission';
  icon: React.ComponentType<{ className?: string }>;
}

interface ChartDataPoint {
  time: string;
  [key: string]: string | number;
}

interface EnhancedLiveDataMonitorProps {
  isConnected: boolean;
  vehicleInfo?: Record<string, unknown>;
}

export const EnhancedLiveDataMonitor: React.FC<EnhancedLiveDataMonitorProps> = ({
  isConnected,
  vehicleInfo
}) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedPids, setSelectedPids] = useState<string[]>(['010C', '010D', '0105', '0111']);
  const [liveData, setLiveData] = useState<LiveDataPoint[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [viewMode, setViewMode] = useState<'gauges' | 'charts' | 'list'>('gauges');

  const availablePids: LiveDataPoint[] = [
    {
      pid: '010C',
      name: 'Engine RPM',
      value: 0,
      unit: 'rpm',
      min: 0,
      max: 6000,
      category: 'engine',
      icon: Zap
    },
    {
      pid: '010D',
      name: 'Vehicle Speed',
      value: 0,
      unit: 'km/h',
      min: 0,
      max: 200,
      category: 'engine',
      icon: Gauge
    },
    {
      pid: '0105',
      name: 'Engine Temperature',
      value: 0,
      unit: '°C',
      min: -40,
      max: 150,
      category: 'engine',
      icon: Thermometer
    },
    {
      pid: '0111',
      name: 'Throttle Position',
      value: 0,
      unit: '%',
      min: 0,
      max: 100,
      category: 'engine',
      icon: Activity
    },
    {
      pid: '0104',
      name: 'Engine Load',
      value: 0,
      unit: '%',
      min: 0,
      max: 100,
      category: 'engine',
      icon: Car
    },
    {
      pid: '0106',
      name: 'Fuel Trim Bank 1',
      value: 0,
      unit: '%',
      min: -100,
      max: 100,
      category: 'fuel',
      icon: Fuel
    },
    {
      pid: '010A',
      name: 'Fuel Pressure',
      value: 0,
      unit: 'kPa',
      min: 0,
      max: 800,
      category: 'fuel',
      icon: Fuel
    },
    {
      pid: '010B',
      name: 'Intake MAP',
      value: 0,
      unit: 'kPa',
      min: 0,
      max: 300,
      category: 'engine',
      icon: Wind
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isMonitoring && isConnected) {
      interval = setInterval(async () => {
        // Simulate reading live data
        const updatedData = availablePids
          .filter(pid => selectedPids.includes(pid.pid))
          .map(pid => ({
            ...pid,
            value: generateRealisticValue(pid)
          }));

        setLiveData(updatedData);

        // Update chart data
        const timestamp = new Date().toLocaleTimeString();
        const newDataPoint: ChartDataPoint = { time: timestamp };
        
        updatedData.forEach(pid => {
          newDataPoint[pid.name] = pid.value;
        });

        setChartData(prev => {
          const newData = [...prev, newDataPoint];
          return newData.slice(-20); // Keep last 20 points
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring, isConnected, selectedPids]);

  const generateRealisticValue = (pid: LiveDataPoint): number => {
    switch (pid.pid) {
      case '010C': // RPM
        return Math.random() * 2000 + 800;
      case '010D': // Speed
        return Math.random() * 80;
      case '0105': // Temperature
        return Math.random() * 30 + 80;
      case '0111': // Throttle
        return Math.random() * 50;
      case '0104': // Load
        return Math.random() * 60 + 20;
      case '0106': // Fuel Trim
        return (Math.random() - 0.5) * 20;
      case '010A': // Fuel Pressure
        return Math.random() * 200 + 300;
      case '010B': // MAP
        return Math.random() * 100 + 100;
      default:
        return Math.random() * (pid.max - pid.min) + pid.min;
    }
  };

  const togglePid = (pidId: string) => {
    setSelectedPids(prev => 
      prev.includes(pidId) 
        ? prev.filter(id => id !== pidId)
        : [...prev, pidId]
    );
  };

  const getGaugeColor = (value: number, min: number, max: number): string => {
    const percentage = (value - min) / (max - min);
    if (percentage < 0.3) return 'text-green-500';
    if (percentage < 0.7) return 'text-yellow-500';
    return 'text-red-500';
  };

  const renderGaugeView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {liveData.map((dataPoint) => {
        const percentage = ((dataPoint.value - dataPoint.min) / (dataPoint.max - dataPoint.min)) * 100;
        const Icon = dataPoint.icon;
        
        return (
          <Card key={dataPoint.pid}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className="h-6 w-6 text-primary" />
                <Badge variant="outline">{dataPoint.category}</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{dataPoint.name}</span>
                  <span className={`text-2xl font-bold ${getGaugeColor(dataPoint.value, dataPoint.min, dataPoint.max)}`}>
                    {dataPoint.value.toFixed(1)}
                  </span>
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{dataPoint.min}</span>
                  <span>{dataPoint.unit}</span>
                  <span>{dataPoint.max}</span>
                </div>
                
                <Progress value={Math.max(0, Math.min(100, percentage))} className="h-2" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderChartView = () => (
    <div className="space-y-6">
      {liveData.map((dataPoint) => (
        <Card key={dataPoint.pid}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <dataPoint.icon className="h-4 w-4" />
              {dataPoint.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={[dataPoint.min, dataPoint.max]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey={dataPoint.name}
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <Card>
      <CardContent className="p-0">
        <div className="space-y-0">
          {liveData.map((dataPoint, index) => {
            const Icon = dataPoint.icon;
            return (
              <div key={dataPoint.pid} className={`p-4 flex items-center justify-between ${index !== liveData.length - 1 ? 'border-b' : ''}`}>
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{dataPoint.name}</p>
                    <p className="text-sm text-muted-foreground">PID: {dataPoint.pid}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold">{dataPoint.value.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">{dataPoint.unit}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Data Monitor
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Recording</span>
                <Switch 
                  checked={isMonitoring}
                  onCheckedChange={setIsMonitoring}
                  disabled={!isConnected}
                />
              </div>
              
              <Button
                onClick={() => setIsMonitoring(!isMonitoring)}
                disabled={!isConnected}
                variant={isMonitoring ? "destructive" : "default"}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gauges">Gauges</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="gauges" className="mt-6">
          {renderGaugeView()}
        </TabsContent>

        <TabsContent value="charts" className="mt-6">
          {renderChartView()}
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          {renderListView()}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                PID Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePids.map((pid) => {
                  const Icon = pid.icon;
                  return (
                    <div key={pid.pid} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{pid.name}</p>
                          <p className="text-sm text-muted-foreground">PID: {pid.pid}</p>
                        </div>
                      </div>
                      
                      <Switch
                        checked={selectedPids.includes(pid.pid)}
                        onCheckedChange={() => togglePid(pid.pid)}
                      />
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
