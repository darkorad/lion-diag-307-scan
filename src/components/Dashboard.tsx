import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Wrench, 
  Activity, 
  FileText, 
  Wifi, 
  Battery,
  Zap,
  Thermometer,
  Gauge,
  Fuel
} from 'lucide-react';

const Dashboard = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState({
    make: 'Toyota',
    model: 'Camry',
    year: '2020',
    vin: '1HGBH41JXMN109186',
    engine: '2.5L 4-Cylinder'
  });

  const [systemStatus, setSystemStatus] = useState([
    { name: 'Engine', status: 'OK', color: 'green' },
    { name: 'Emissions', status: 'Warning', color: 'yellow' },
    { name: 'Transmission', status: 'OK', color: 'green' },
    { name: 'Brakes', status: 'OK', color: 'green' }
  ]);

  const [liveData, setLiveData] = useState([
    { name: 'Engine RPM', value: 1200, unit: 'RPM', min: 0, max: 8000, color: 'green' },
    { name: 'Vehicle Speed', value: 65, unit: 'MPH', min: 0, max: 120, color: 'yellow' },
    { name: 'Engine Temp', value: 92, unit: '°C', min: 0, max: 120, color: 'green' },
    { name: 'Fuel Level', value: 75, unit: '%', min: 0, max: 100, color: 'green' },
    { name: 'Throttle Position', value: 32, unit: '%', min: 0, max: 100, color: 'green' }
  ]);

  // Simulate live data updates
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setLiveData(prev => prev.map(item => {
          const variation = (Math.random() - 0.5) * 10;
          const newValue = Math.max(item.min, Math.min(item.max, item.value + variation));
          let color = 'green';
          if (item.name === 'Engine Temp' && newValue > 100) color = 'red';
          if (item.name === 'Engine Temp' && newValue > 85) color = 'yellow';
          if (item.name === 'Engine RPM' && newValue > 6000) color = 'red';
          if (item.name === 'Engine RPM' && newValue > 4000) color = 'yellow';
          return { ...item, value: Math.round(newValue), color };
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'bg-green-500';
      case 'Warning': return 'bg-yellow-500';
      case 'Critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressPercentage = (item: any) => {
    return ((item.value - item.min) / (item.max - item.min)) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">TopScan Pro</h1>
          <div className="flex items-center space-x-2">
            <Wifi className={`h-5 w-5 ${isConnected ? 'text-green-300' : 'text-gray-300'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Vehicle Information */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Car className="mr-2 h-5 w-5" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <div><span className="font-semibold">Make/Model:</span> {vehicleInfo.make} {vehicleInfo.model}</div>
            <div><span className="font-semibold">Year:</span> {vehicleInfo.year}</div>
            <div><span className="font-semibold">VIN:</span> {vehicleInfo.vin}</div>
            <div><span className="font-semibold">Engine:</span> {vehicleInfo.engine}</div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Status */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {systemStatus.map((system, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{system.name}</span>
                <Badge className={`${getStatusColor(system.status)} text-white`}>
                  {system.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Features */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center">
            <Wrench className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-semibold">Diagnostics</h3>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center">
            <Activity className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-semibold">Live Data</h3>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center">
            <Zap className="h-8 w-8 text-yellow-600 mb-2" />
            <h3 className="font-semibold">Maintenance</h3>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center">
            <FileText className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="font-semibold">Reports</h3>
          </CardContent>
        </Card>
      </div>

      {/* Live Data Monitoring */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Live Data Monitoring
            </span>
            <Button 
              onClick={() => setIsScanning(!isScanning)}
              className={`${isScanning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
            >
              {isScanning ? 'Stop Recording' : 'Start Recording'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {liveData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{item.name}</span>
                  <span>{item.value} {item.unit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getProgressColor(item.color)}`} 
                    style={{ width: `${getProgressPercentage(item)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diagnostic Scan Button */}
      <Button 
        onClick={handleScan}
        disabled={isScanning}
        className="w-full py-6 text-lg bg-red-600 hover:bg-red-700"
      >
        {isScanning ? 'Scanning...' : 'Perform Full System Scan'}
      </Button>
    </div>
  );
};

export default Dashboard;