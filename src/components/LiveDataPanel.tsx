import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Zap, 
  Thermometer,
  Gauge,
  Car,
  Wind,
  Droplets,
  Battery,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Database,
  Settings,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { enhancedOBD2Service } from '@/services/EnhancedOBD2Service';
import { OBD2Data, DPFData } from '@/types/obd2';

interface LiveDataPanelProps {
  isConnected: boolean;
  onBack?: () => void;
}

interface DataPoint {
  name: string;
  value: string | number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  category: string;
  pid?: string;
  description?: string;
}

const LiveDataPanel: React.FC<LiveDataPanelProps> = ({ isConnected, onBack }) => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [obd2Data, setObd2Data] = useState<OBD2Data | null>(null);
  const [dpfData, setDpfData] = useState<DPFData | null>(null);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState<{
    manufacturer: string;
    model: string;
    year: number;
  } | null>(null);
  const [supportedPids, setSupportedPids] = useState<string[]>([]);
  const [dataRate, setDataRate] = useState(0);

  useEffect(() => {
    if (isConnected) {
      loadVehicleInfo();
      const dataCallback = (data: OBD2Data) => {
        setObd2Data(data);
        setLastUpdate(new Date());
        updateDataPoints(data, dpfData);
      };

      const dpfCallback = (data: DPFData) => {
        setDpfData(data);
        setLastUpdate(new Date());
        updateDataPoints(obd2Data, data);
      };

      enhancedOBD2Service.onDataReceived(dataCallback);
      enhancedOBD2Service.onDPFDataReceived(dpfCallback);

      return () => {
        enhancedOBD2Service.removeDataCallback(dataCallback);
        enhancedOBD2Service.removeDPFCallback(dpfCallback);
      };
    }
  }, [isConnected, obd2Data, dpfData]);

  const loadVehicleInfo = async () => {
    try {
      const info = enhancedOBD2Service.getVehicleInfo();
      const pids = enhancedOBD2Service.getSupportedPids();
      const status = enhancedOBD2Service.getServiceStatus();
      
      setVehicleInfo(info);
      setSupportedPids(pids);
      setDataRate(status.dataRate);
    } catch (error) {
      console.error('Failed to load vehicle info:', error);
    }
  };

  const updateDataPoints = (obd2: OBD2Data | null, dpf: DPFData | null) => {
    const points: DataPoint[] = [];

    if (obd2) {
      // Engine parameters
      if (obd2.engineRPM !== undefined) {
        points.push({
          name: 'Engine RPM',
          value: Math.round(obd2.engineRPM),
          unit: 'rpm',
          status: obd2.engineRPM > 4000 ? 'warning' : 'normal',
          category: 'engine',
          pid: '010C',
          description: 'Engine revolutions per minute'
        });
      }

      if (obd2.vehicleSpeed !== undefined) {
        points.push({
          name: 'Vehicle Speed',
          value: Math.round(obd2.vehicleSpeed),
          unit: 'km/h',
          status: 'normal',
          category: 'performance',
          pid: '010D',
          description: 'Current vehicle speed'
        });
      }

      if (obd2.engineTemp !== undefined) {
        points.push({
          name: 'Coolant Temperature',
          value: Math.round(obd2.engineTemp),
          unit: '°C',
          status: obd2.engineTemp > 100 ? 'warning' : obd2.engineTemp > 110 ? 'critical' : 'normal',
          category: 'engine',
          pid: '0105',
          description: 'Engine coolant temperature'
        });
      }

      if (obd2.intakeAirTemp !== undefined) {
        points.push({
          name: 'Intake Air Temperature',
          value: Math.round(obd2.intakeAirTemp),
          unit: '°C',
          status: obd2.intakeAirTemp > 60 ? 'warning' : 'normal',
          category: 'engine',
          pid: '010F',
          description: 'Intake air temperature'
        });
      }

      if (obd2.mafSensorRate !== undefined) {
        points.push({
          name: 'MAF Air Flow',
          value: obd2.mafSensorRate.toFixed(2),
          unit: 'g/s',
          status: 'normal',
          category: 'engine',
          pid: '0110',
          description: 'Mass air flow sensor rate'
        });
      }

      if (obd2.throttlePosition !== undefined) {
        points.push({
          name: 'Throttle Position',
          value: Math.round(obd2.throttlePosition),
          unit: '%',
          status: 'normal',
          category: 'engine',
          pid: '0111',
          description: 'Throttle position sensor'
        });
      }

      if (obd2.oxygenSensor !== undefined) {
        points.push({
          name: 'Oxygen Sensor',
          value: obd2.oxygenSensor.toFixed(3),
          unit: 'V',
          status: obd2.oxygenSensor < 0.1 || obd2.oxygenSensor > 0.9 ? 'warning' : 'normal',
          category: 'emissions',
          pid: '0114',
          description: 'Primary oxygen sensor voltage'
        });
      }

      if (obd2.fuelLevel !== undefined) {
        points.push({
          name: 'Fuel Level',
          value: Math.round(obd2.fuelLevel),
          unit: '%',
          status: obd2.fuelLevel < 15 ? 'warning' : obd2.fuelLevel < 5 ? 'critical' : 'normal',
          category: 'fuel',
          pid: '012F',
          description: 'Fuel tank level'
        });
      }

      if (obd2.fuelTrim !== undefined) {
        points.push({
          name: 'Fuel Trim',
          value: obd2.fuelTrim.toFixed(1),
          unit: '%',
          status: Math.abs(obd2.fuelTrim) > 25 ? 'warning' : Math.abs(obd2.fuelTrim) > 35 ? 'critical' : 'normal',
          category: 'fuel',
          pid: '0107',
          description: 'Short term fuel trim'
        });
      }

      if (obd2.batteryVoltage !== undefined) {
        points.push({
          name: 'Battery Voltage',
          value: obd2.batteryVoltage.toFixed(1),
          unit: 'V',
          status: obd2.batteryVoltage < 12.0 ? 'warning' : obd2.batteryVoltage < 11.5 ? 'critical' : 'normal',
          category: 'electrical',
          pid: '0142',
          description: 'Battery voltage'
        });
      }

      if (obd2.oilTemp !== undefined) {
        points.push({
          name: 'Oil Temperature',
          value: Math.round(obd2.oilTemp),
          unit: '°C',
          status: obd2.oilTemp > 130 ? 'warning' : obd2.oilTemp > 150 ? 'critical' : 'normal',
          category: 'engine',
          pid: '015C',
          description: 'Engine oil temperature'
        });
      }

      if (obd2.turbochargerPressure !== undefined) {
        points.push({
          name: 'Turbo Pressure',
          value: obd2.turbochargerPressure.toFixed(2),
          unit: 'bar',
          status: obd2.turbochargerPressure > 2.5 ? 'warning' : 'normal',
          category: 'turbo',
          description: 'Turbocharger boost pressure'
        });
      }

      if (obd2.fuelRailPressure !== undefined) {
        points.push({
          name: 'Fuel Rail Pressure',
          value: Math.round(obd2.fuelRailPressure),
          unit: 'bar',
          status: obd2.fuelRailPressure < 800 || obd2.fuelRailPressure > 1800 ? 'warning' : 'normal',
          category: 'fuel',
          description: 'Common rail fuel pressure'
        });
      }
    }

    if (dpf) {
      if (dpf.dpfInletTemperature !== undefined) {
        points.push({
          name: 'DPF Inlet Temperature',
          value: Math.round(dpf.dpfInletTemperature),
          unit: '°C',
          status: dpf.dpfInletTemperature > 600 ? 'warning' : 'normal',
          category: 'emissions',
          description: 'DPF inlet temperature'
        });
      }

      if (dpf.dpfOutletTemperature !== undefined) {
        points.push({
          name: 'DPF Outlet Temperature',
          value: Math.round(dpf.dpfOutletTemperature),
          unit: '°C',
          status: dpf.dpfOutletTemperature > 650 ? 'warning' : 'normal',
          category: 'emissions',
          description: 'DPF outlet temperature'
        });
      }

      if (dpf.dpfDifferentialPressure !== undefined) {
        points.push({
          name: 'DPF Differential Pressure',
          value: Math.round(dpf.dpfDifferentialPressure),
          unit: 'mbar',
          status: dpf.dpfDifferentialPressure > 50 ? 'warning' : dpf.dpfDifferentialPressure > 80 ? 'critical' : 'normal',
          category: 'emissions',
          description: 'DPF differential pressure'
        });
      }

      if (dpf.dpfSootLoadCalculated !== undefined) {
        points.push({
          name: 'DPF Soot Load',
          value: Math.round(dpf.dpfSootLoadCalculated),
          unit: '%',
          status: dpf.dpfSootLoadCalculated > 80 ? 'critical' : dpf.dpfSootLoadCalculated > 60 ? 'warning' : 'normal',
          category: 'emissions',
          description: 'DPF soot load percentage'
        });
      }

      if (dpf.activeRegenStatus !== undefined) {
        points.push({
          name: 'DPF Regeneration',
          value: dpf.activeRegenStatus ? 'Active' : 'Inactive',
          unit: '',
          status: dpf.activeRegenStatus ? 'warning' : 'normal',
          category: 'emissions',
          description: 'DPF regeneration status'
        });
      }
    }

    setDataPoints(points);
  };

  const startDataCollection = async () => {
    if (!isConnected) return;
    
    try {
      setIsCollecting(true);
      await enhancedOBD2Service.startLiveData();
    } catch (error) {
      console.error('Failed to start data collection:', error);
      setIsCollecting(false);
    }
  };

  const stopDataCollection = () => {
    setIsCollecting(false);
    enhancedOBD2Service.stopLiveData();
  };

  const getStatusColor = (status: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-green-500 bg-green-500/10 border-green-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: React.ElementType } = {
      engine: Car,
      fuel: Droplets,
      emissions: Wind,
      electrical: Zap,
      performance: Gauge,
      turbo: Activity,
      safety: AlertTriangle
    };
    return icons[category] || Activity;
  };

  const groupedData = dataPoints.reduce((acc, point) => {
    if (!acc[point.category]) acc[point.category] = [];
    acc[point.category].push(point);
    return acc;
  }, {} as { [key: string]: DataPoint[] });

  const categories = Object.keys(groupedData);

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {onBack && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <Activity className="h-5 w-5" />
              Live Data Monitor
            </div>
            <div className="flex items-center gap-2">
              {lastUpdate && (
                <span className="text-sm text-muted-foreground">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
              <Button
                onClick={isCollecting ? stopDataCollection : startDataCollection}
                disabled={!isConnected}
                variant={isCollecting ? "destructive" : "default"}
              >
                {isCollecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Stop
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Connection Status */}
      {!isConnected && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Connect to your OBD2 device to start monitoring live data
          </AlertDescription>
        </Alert>
      )}

      {/* Vehicle Information */}
      {vehicleInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Manufacturer</p>
                <p className="font-semibold">{vehicleInfo.manufacturer || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Model</p>
                <p className="font-semibold">{vehicleInfo.model || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Supported PIDs</p>
                <p className="font-semibold">{supportedPids.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data Rate</p>
                <p className="font-semibold">{dataRate.toFixed(1)} Hz</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Overview */}
      {dataPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Overview
              <Badge variant="secondary">{dataPoints.length} parameters</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dataPoints.filter(p => p.status === 'normal').length}
                </div>
                <p className="text-sm text-muted-foreground">Normal</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {dataPoints.filter(p => p.status === 'warning').length}
                </div>
                <p className="text-sm text-muted-foreground">Warning</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {dataPoints.filter(p => p.status === 'critical').length}
                </div>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {categories.length}
                </div>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Data */}
      {dataPoints.length > 0 && (
        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            {categories.slice(0, 6).map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => {
            const Icon = getCategoryIcon(category);
            return (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="h-5 w-5" />
                  <h3 className="font-semibold capitalize text-lg">{category}</h3>
                  <Badge variant="outline">{groupedData[category].length} parameters</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedData[category].map((point, index) => (
                    <Card key={index} className={`p-4 ${getStatusColor(point.status)}`}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{point.name}</h4>
                          {point.status === 'critical' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          {point.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                          {point.status === 'normal' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                        <div className="text-2xl font-bold">
                          {point.value} 
                          {point.unit && <span className="text-sm font-normal ml-1">{point.unit}</span>}
                        </div>
                        {point.pid && (
                          <Badge variant="outline" className="text-xs">
                            PID: {point.pid}
                          </Badge>
                        )}
                        {point.description && (
                          <p className="text-xs text-muted-foreground">{point.description}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {/* No Data Message */}
      {isConnected && dataPoints.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Database className="h-8 w-8 mx-auto mb-2" />
              <p>No live data available</p>
              <p className="text-sm">Click "Start" to begin monitoring live data</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveDataPanel;
