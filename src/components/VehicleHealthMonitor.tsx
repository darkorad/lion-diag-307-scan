
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface VehicleHealthData {
  overallHealth: number;
  engineHealth: number;
  transmissionHealth: number;
  emissionsHealth: number;
  batteryVoltage: number;
  coolantTemp: number;
  oilPressure: number;
}

interface VehicleHealthMonitorProps {
  healthData?: VehicleHealthData;
}

const VehicleHealthMonitor: React.FC<VehicleHealthMonitorProps> = ({ healthData }) => {
  const defaultData: VehicleHealthData = {
    overallHealth: 85,
    engineHealth: 88,
    transmissionHealth: 82,
    emissionsHealth: 90,
    batteryVoltage: 12.6,
    coolantTemp: 85,
    oilPressure: 35
  };

  const data = healthData || defaultData;

  const getHealthStatus = (value: number) => {
    if (value >= 80) return { status: 'Good', color: 'bg-green-500', icon: CheckCircle };
    if (value >= 60) return { status: 'Fair', color: 'bg-yellow-500', icon: AlertTriangle };
    return { status: 'Poor', color: 'bg-red-500', icon: AlertTriangle };
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Vehicle Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{data.overallHealth}%</div>
            <div className="text-muted-foreground">Overall Health Score</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Engine</span>
                <Badge variant={data.engineHealth >= 80 ? 'default' : 'destructive'}>
                  {getHealthStatus(data.engineHealth).status}
                </Badge>
              </div>
              <Progress value={data.engineHealth} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Transmission</span>
                <Badge variant={data.transmissionHealth >= 80 ? 'default' : 'destructive'}>
                  {getHealthStatus(data.transmissionHealth).status}
                </Badge>
              </div>
              <Progress value={data.transmissionHealth} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Emissions</span>
                <Badge variant={data.emissionsHealth >= 80 ? 'default' : 'destructive'}>
                  {getHealthStatus(data.emissionsHealth).status}
                </Badge>
              </div>
              <Progress value={data.emissionsHealth} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <div className="text-sm font-medium">Battery</div>
            </div>
            <div className="text-2xl font-bold">{data.batteryVoltage}V</div>
            <div className="text-xs text-muted-foreground">Normal range: 12.0-14.4V</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div className="text-sm font-medium">Coolant Temp</div>
            </div>
            <div className="text-2xl font-bold">{data.coolantTemp}°C</div>
            <div className="text-xs text-muted-foreground">Normal range: 80-100°C</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div className="text-sm font-medium">Oil Pressure</div>
            </div>
            <div className="text-2xl font-bold">{data.oilPressure} PSI</div>
            <div className="text-xs text-muted-foreground">Normal range: 25-65 PSI</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleHealthMonitor;
