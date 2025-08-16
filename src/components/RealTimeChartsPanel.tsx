
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, TrendingUp, Gauge, Thermometer, Fuel, Zap, Play, Pause, RotateCcw } from 'lucide-react';

interface ChartData {
  timestamp: string;
  rpm: number;
  speed: number;
  engineTemp: number;
  throttlePosition: number;
  fuelLevel: number;
  mafRate: number;
}

interface RealTimeChartsPanelProps {
  isConnected: boolean;
}

const RealTimeChartsPanel: React.FC<RealTimeChartsPanelProps> = ({ isConnected }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(['rpm', 'speed', 'engineTemp']);

  useEffect(() => {
    if (!isConnected || !isRecording) return;

    const interval = setInterval(() => {
      // Simulate real-time data
      const newDataPoint: ChartData = {
        timestamp: new Date().toLocaleTimeString(),
        rpm: Math.floor(Math.random() * 1000) + 1500,
        speed: Math.floor(Math.random() * 60) + 20,
        engineTemp: Math.floor(Math.random() * 15) + 85,
        throttlePosition: Math.floor(Math.random() * 60) + 20,
        fuelLevel: Math.floor(Math.random() * 20) + 60,
        mafRate: Math.floor(Math.random() * 30) + 10
      };

      setChartData(prev => {
        const updated = [...prev, newDataPoint];
        return updated.length > 50 ? updated.slice(-50) : updated; // Keep last 50 points
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, isRecording]);

  const handleStartStop = () => {
    setIsRecording(!isRecording);
  };

  const handleClear = () => {
    setChartData([]);
  };

  const chartConfig = {
    rpm: { label: "RPM", color: "#8884d8" },
    speed: { label: "Speed (km/h)", color: "#82ca9d" },
    engineTemp: { label: "Engine Temp (°C)", color: "#ffc658" },
    throttlePosition: { label: "Throttle (%)", color: "#ff7300" },
    fuelLevel: { label: "Fuel Level (%)", color: "#00ff00" },
    mafRate: { label: "MAF Rate (g/s)", color: "#ff0000" }
  };

  const metrics = [
    { key: 'rpm', label: 'Engine RPM', icon: Gauge, color: 'text-blue-500' },
    { key: 'speed', label: 'Vehicle Speed', icon: TrendingUp, color: 'text-green-500' },
    { key: 'engineTemp', label: 'Engine Temperature', icon: Thermometer, color: 'text-yellow-500' },
    { key: 'throttlePosition', label: 'Throttle Position', icon: Zap, color: 'text-orange-500' },
    { key: 'fuelLevel', label: 'Fuel Level', icon: Fuel, color: 'text-green-600' },
    { key: 'mafRate', label: 'MAF Rate', icon: Activity, color: 'text-red-500' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Real-Time Data Visualization</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleStartStop}
                disabled={!isConnected}
                variant={isRecording ? "destructive" : "default"}
                size="sm"
              >
                {isRecording ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-sm font-medium">Recording Status:</span>
            <Badge variant={isRecording ? "default" : "secondary"}>
              {isRecording ? "Recording" : "Stopped"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Data Points: {chartData.length}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
            {metrics.map(metric => (
              <Button
                key={metric.key}
                variant={selectedMetrics.includes(metric.key) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedMetrics(prev => 
                    prev.includes(metric.key)
                      ? prev.filter(m => m !== metric.key)
                      : [...prev, metric.key]
                  );
                }}
              >
                <metric.icon className={`h-4 w-4 mr-1 ${metric.color}`} />
                {metric.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="line-chart" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="line-chart">Line Chart</TabsTrigger>
          <TabsTrigger value="area-chart">Area Chart</TabsTrigger>
          <TabsTrigger value="individual">Individual Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="line-chart">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Parameter Line Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {selectedMetrics.map(metric => (
                      <Line
                        key={metric}
                        type="monotone"
                        dataKey={metric}
                        stroke={chartConfig[metric as keyof typeof chartConfig]?.color}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="area-chart">
          <Card>
            <CardHeader>
              <CardTitle>Area Chart View</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {selectedMetrics.map(metric => (
                      <Area
                        key={metric}
                        type="monotone"
                        dataKey={metric}
                        stroke={chartConfig[metric as keyof typeof chartConfig]?.color}
                        fill={chartConfig[metric as keyof typeof chartConfig]?.color}
                        fillOpacity={0.3}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedMetrics.map(metric => {
              const metricInfo = metrics.find(m => m.key === metric);
              if (!metricInfo) return null;

              return (
                <Card key={metric}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <metricInfo.icon className={`h-5 w-5 ${metricInfo.color}`} />
                      <span>{metricInfo.label}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="timestamp" 
                            tick={{ fontSize: 10 }}
                            interval="preserveStartEnd"
                          />
                          <YAxis tick={{ fontSize: 10 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey={metric}
                            stroke={chartConfig[metric as keyof typeof chartConfig]?.color}
                            strokeWidth={3}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                    {chartData.length > 0 && (
                      <div className="mt-2 text-center">
                        <span className="text-2xl font-bold">
                          {chartData[chartData.length - 1][metric as keyof ChartData]}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {chartConfig[metric as keyof typeof chartConfig]?.label}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeChartsPanel;
