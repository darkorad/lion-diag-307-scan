
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Gauge, Thermometer, Fuel, Car, Wind, Battery, Zap } from 'lucide-react';

const LiveDataPage: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [liveData, setLiveData] = useState({
    engineRPM: 850,
    vehicleSpeed: 0,
    engineTemp: 85,
    fuelLevel: 65,
    throttlePosition: 15,
    mafSensorRate: 2.5,
    boostPressure: 1200,
    batteryVoltage: 14.2,
    oilTemp: 90,
    intakeAirTemp: 25,
    fuelPressure: 1800,
    turbochargerPressure: 1150
  });

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setLiveData(prev => ({
          ...prev,
          engineRPM: Math.max(600, prev.engineRPM + (Math.random() - 0.5) * 100),
          vehicleSpeed: Math.max(0, prev.vehicleSpeed + (Math.random() - 0.5) * 5),
          engineTemp: Math.max(70, Math.min(110, prev.engineTemp + (Math.random() - 0.5) * 2)),
          throttlePosition: Math.max(0, Math.min(100, prev.throttlePosition + (Math.random() - 0.5) * 10)),
          batteryVoltage: Math.max(12, Math.min(15, prev.batteryVoltage + (Math.random() - 0.5) * 0.2))
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const getStatusColor = (value: number, min: number, max: number, optimal?: number) => {
    if (optimal && Math.abs(value - optimal) <= (max - min) * 0.1) return 'text-green-600';
    if (value < min * 1.2 || value > max * 0.8) return 'text-red-600';
    return 'text-yellow-600';
  };

  const engineParams = [
    { name: 'Engine RPM', value: liveData.engineRPM, unit: 'rpm', icon: Activity, max: 6000 },
    { name: 'Engine Temp', value: liveData.engineTemp, unit: '°C', icon: Thermometer, max: 120 },
    { name: 'Oil Temperature', value: liveData.oilTemp, unit: '°C', icon: Thermometer, max: 120 },
    { name: 'Throttle Position', value: liveData.throttlePosition, unit: '%', icon: Gauge, max: 100 },
    { name: 'MAF Sensor', value: liveData.mafSensorRate, unit: 'g/s', icon: Wind, max: 10 },
    { name: 'Intake Air Temp', value: liveData.intakeAirTemp, unit: '°C', icon: Thermometer, max: 60 }
  ];

  const fuelParams = [
    { name: 'Fuel Level', value: liveData.fuelLevel, unit: '%', icon: Fuel, max: 100 },
    { name: 'Fuel Pressure', value: liveData.fuelPressure, unit: 'bar', icon: Gauge, max: 2000 },
    { name: 'Boost Pressure', value: liveData.boostPressure, unit: 'mbar', icon: Wind, max: 2000 },
    { name: 'Turbo Pressure', value: liveData.turbochargerPressure, unit: 'mbar', icon: Wind, max: 2000 }
  ];

  const vehicleParams = [
    { name: 'Vehicle Speed', value: liveData.vehicleSpeed, unit: 'km/h', icon: Car, max: 200 },
    { name: 'Battery Voltage', value: liveData.batteryVoltage, unit: 'V', icon: Battery, max: 15 }
  ];

  const ParamCard = ({ param }: { param: any }) => {
    const Icon = param.icon;
    const percentage = (param.value / param.max) * 100;
    
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{param.name}</span>
            </div>
            <Badge variant="outline">{param.unit}</Badge>
          </div>
          <div className="text-2xl font-bold mb-2">{param.value.toFixed(1)}</div>
          <Progress value={percentage} className="h-2" />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Live Data Monitor</h1>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Button 
            onClick={() => setIsConnected(!isConnected)}
            variant={isConnected ? "destructive" : "default"}
            size="sm"
          >
            {isConnected ? "Disconnect" : "Connect"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="engine" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="engine">Engine</TabsTrigger>
          <TabsTrigger value="fuel">Fuel System</TabsTrigger>
          <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
        </TabsList>

        <TabsContent value="engine" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {engineParams.map((param, index) => (
              <ParamCard key={index} param={param} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fuel" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fuelParams.map((param, index) => (
              <ParamCard key={index} param={param} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vehicle" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicleParams.map((param, index) => (
              <ParamCard key={index} param={param} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveDataPage;
