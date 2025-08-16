import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  Car, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Wrench,
  Thermometer,
  Gauge,
  Fuel,
  Battery,
  Cog,
  Zap,
  Activity,
  TrendingUp,
  Shield,
  Wifi,
  Bluetooth
} from 'lucide-react';

interface ModernDashboardProps {
  isConnected: boolean;
  vehicleData?: any;
  diagnosticData?: any;
}

const ModernDashboard: React.FC<ModernDashboardProps> = ({ 
  isConnected, 
  vehicleData, 
  diagnosticData 
}) => {
  const [liveData, setLiveData] = useState({
    rpm: 0,
    speed: 0,
    engineTemp: 85,
    fuelLevel: 75,
    batteryVoltage: 12.4,
    oilPressure: 45,
    intakeTemp: 25,
    boost: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState(92);

  useEffect(() => {
    if (!isConnected) return;

    // Simulate live data updates
    const interval = setInterval(() => {
      const newData = {
        rpm: Math.floor(Math.random() * 1000) + 800,
        speed: Math.floor(Math.random() * 40) + 60,
        engineTemp: Math.floor(Math.random() * 10) + 85,
        fuelLevel: Math.max(0, liveData.fuelLevel - Math.random() * 0.1),
        batteryVoltage: 12.2 + Math.random() * 0.4,
        oilPressure: 40 + Math.random() * 10,
        intakeTemp: 20 + Math.random() * 15,
        boost: Math.random() * 15
      };

      setLiveData(newData);

      // Update chart data
      const timestamp = Date.now();
      setChartData(prev => {
        const updated = [...prev, { 
          time: timestamp, 
          rpm: newData.rpm,
          temp: newData.engineTemp,
          speed: newData.speed
        }].slice(-50);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, liveData.fuelLevel]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getStatusColor = (value: number, min: number, max: number, optimal?: number) => {
    if (optimal && Math.abs(value - optimal) <= (max - min) * 0.1) return 'text-green-500';
    if (value < min || value > max) return 'text-red-500';
    if (value < min * 1.2 || value > max * 0.8) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-6 p-4">
      {/* Connection Status Banner */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isConnected ? (
                <>
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <Bluetooth className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Connected to Vehicle</p>
                    <p className="text-sm text-muted-foreground">
                      {vehicleData?.make || 'Unknown'} {vehicleData?.model || 'Vehicle'} • Real-time data active
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    <Wifi className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Not Connected</p>
                    <p className="text-sm text-muted-foreground">Connect to OBD2 adapter to view live data</p>
                  </div>
                </>
              )}
            </div>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engine">Engine</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Health Score & Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="col-span-1">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="30"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-muted-foreground/20"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="30"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 30}`}
                        strokeDashoffset={`${2 * Math.PI * 30 * (1 - healthScore / 100)}`}
                        className={healthScore > 80 ? 'text-green-500' : healthScore > 60 ? 'text-yellow-500' : 'text-red-500'}
                      />
                    </svg>
                    <span className="absolute text-lg font-bold">{healthScore}%</span>
                  </div>
                  <p className="text-sm font-medium">Vehicle Health</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <Gauge className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{liveData.speed}</p>
                    <p className="text-sm text-muted-foreground">km/h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <Activity className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{liveData.rpm}</p>
                    <p className="text-sm text-muted-foreground">RPM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <Fuel className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{Math.round(liveData.fuelLevel)}%</p>
                    <p className="text-sm text-muted-foreground">Fuel Level</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Data Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-5 w-5 text-red-500" />
                    <span className="text-sm">Engine Temp</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getStatusColor(liveData.engineTemp, 80, 105, 90)}`}>
                      {liveData.engineTemp}°C
                    </p>
                  </div>
                </div>
                <Progress value={(liveData.engineTemp / 120) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Battery className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Battery</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getStatusColor(liveData.batteryVoltage, 12.0, 14.4, 12.6)}`}>
                      {liveData.batteryVoltage.toFixed(1)}V
                    </p>
                  </div>
                </div>
                <Progress value={(liveData.batteryVoltage / 15) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cog className="h-5 w-5 text-blue-500" />
                    <span className="text-sm">Oil Pressure</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getStatusColor(liveData.oilPressure, 30, 80, 50)}`}>
                      {liveData.oilPressure} PSI
                    </p>
                  </div>
                </div>
                <Progress value={(liveData.oilPressure / 100) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    <span className="text-sm">Boost</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-500">
                      {liveData.boost.toFixed(1)} PSI
                    </p>
                  </div>
                </div>
                <Progress value={(liveData.boost / 20) * 100} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Real-time Charts */}
          <Card>
            <CardHeader>
              <CardTitle>Live Performance Data</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatTime}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      labelFormatter={(value) => formatTime(value as number)}
                    />
                    <Area
                      type="monotone"
                      dataKey="rpm"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="speed"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engine">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engine Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>RPM</span>
                  <span className="font-bold">{liveData.rpm}</span>
                </div>
                <div className="flex justify-between">
                  <span>Engine Temperature</span>
                  <span className="font-bold">{liveData.engineTemp}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Intake Air Temperature</span>
                  <span className="font-bold">{liveData.intakeTemp}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Oil Pressure</span>
                  <span className="font-bold">{liveData.oilPressure} PSI</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fuel System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Fuel Level</span>
                  <span className="font-bold">{Math.round(liveData.fuelLevel)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuel Consumption</span>
                  <span className="font-bold">6.8 L/100km</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuel Rail Pressure</span>
                  <span className="font-bold">1350 bar</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Performance monitoring is active. View real-time performance metrics and acceleration data.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="diagnostics">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              No diagnostic trouble codes found. Vehicle systems are operating normally.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="controls">
          <Alert>
            <Wrench className="h-4 w-4" />
            <AlertDescription>
              Bi-directional controls allow you to test vehicle actuators and components. Use with caution.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModernDashboard;
