
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Wrench, 
  Calendar,
  Battery,
  Thermometer,
  Fuel,
  Shield
} from 'lucide-react';
import { vehicleHealthService, MaintenanceAlert, HealthMetric } from '@/services/VehicleHealthService';

interface VehicleHealthDashboardProps {
  isConnected: boolean;
}

const VehicleHealthDashboard: React.FC<VehicleHealthDashboardProps> = ({ isConnected }) => {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([]);
  const [healthScore, setHealthScore] = useState(85);
  const [predictions, setPredictions] = useState<string[]>([]);

  useEffect(() => {
    if (!isConnected) return;

    // Simulate real-time health monitoring
    const interval = setInterval(() => {
      const mockOBD2Data = {
        engineTemp: Math.floor(Math.random() * 20) + 85,
        batteryVoltage: 12.5 + (Math.random() * 1.5),
        fuelLevel: Math.floor(Math.random() * 40) + 40
      };

      const metrics = vehicleHealthService.analyzeHealthMetrics(mockOBD2Data);
      setHealthMetrics(metrics);
      vehicleHealthService.recordHealthSnapshot(metrics);

      const alerts = vehicleHealthService.generateMaintenanceAlerts(125000, 118000);
      setMaintenanceAlerts(alerts);

      const newPredictions = vehicleHealthService.predictiveAnalysis(metrics);
      setPredictions(newPredictions);

      // Calculate overall health score
      const avgStatus = metrics.reduce((acc, metric) => {
        const score = metric.status === 'good' ? 100 : metric.status === 'warning' ? 70 : 30;
        return acc + score;
      }, 0) / metrics.length;
      setHealthScore(Math.round(avgStatus));
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const getMetricIcon = (metricName: string) => {
    switch (metricName) {
      case 'Engine Temperature':
        return <Thermometer className="h-5 w-5" />;
      case 'Battery Voltage':
        return <Battery className="h-5 w-5" />;
      case 'Fuel Level':
        return <Fuel className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const healthTrends = vehicleHealthService.getHealthTrends();

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-primary" />
            <span>Vehicle Health Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-2">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - healthScore / 100)}`}
                    className={healthScore > 80 ? 'text-green-500' : healthScore > 60 ? 'text-yellow-500' : 'text-red-500'}
                  />
                </svg>
                <span className="absolute text-xl font-bold">{healthScore}%</span>
              </div>
              <p className="text-sm text-muted-foreground">Overall Health</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {healthMetrics.filter(m => m.status === 'good').length}
              </div>
              <p className="text-sm text-muted-foreground">Systems OK</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">
                {healthMetrics.filter(m => m.status === 'warning').length}
              </div>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">
                {healthMetrics.filter(m => m.status === 'critical').length}
              </div>
              <p className="text-sm text-muted-foreground">Critical Issues</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {healthMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={getStatusColor(metric.status)}>
                    {getMetricIcon(metric.name)}
                  </div>
                  <div>
                    <p className="font-medium">{metric.name}</p>
                    <p className="text-2xl font-bold">
                      {metric.value} {metric.unit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={metric.status === 'good' ? 'default' : metric.status === 'warning' ? 'secondary' : 'destructive'}>
                    {metric.status.toUpperCase()}
                  </Badge>
                  <div className="flex items-center mt-1">
                    {metric.trend === 'improving' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : metric.trend === 'declining' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                    <span className="text-xs text-muted-foreground ml-1">
                      {metric.trend}
                    </span>
                  </div>
                </div>
              </div>
              {metric.threshold && (
                <div className="mt-2">
                  <Progress 
                    value={(metric.value / (metric.threshold.critical * 1.2)) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Warning: {metric.threshold.warning}</span>
                    <span>Critical: {metric.threshold.critical}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Maintenance Alerts */}
      {maintenanceAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-orange-500" />
              <span>Maintenance Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {maintenanceAlerts.map((alert) => (
              <Alert key={alert.id}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{alert.title}</p>
                      <p className="text-sm">{alert.description}</p>
                      {alert.mileageInterval && alert.lastServiceMileage && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last service: {alert.lastServiceMileage.toLocaleString()} km | 
                          Current: {alert.currentMileage.toLocaleString()} km
                        </p>
                      )}
                    </div>
                    <Badge variant={getSeverityVariant(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Predictive Analysis */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span>Predictive Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {predictions.map((prediction, index) => (
                <Alert key={index}>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{prediction}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Trends Chart */}
      {healthTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Health Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthTrends[0]?.data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VehicleHealthDashboard;
