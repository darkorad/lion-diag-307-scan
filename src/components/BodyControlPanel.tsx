import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, Radio, Settings, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { VehicleProfile } from '@/types/vehicle';
import { obd2Service } from '@/services/OBD2Service';

interface BodyControlPanelProps {
  isConnected: boolean;
  vehicleProfile: VehicleProfile | null;
}

interface LightStatus {
  id: string;
  name: string;
  status: 'ok' | 'error' | 'unknown';
  errorCode?: string;
}

interface RadioSetting {
  id: string;
  name: string;
  enabled: boolean;
  canToggle: boolean;
}

export function BodyControlPanel({ isConnected, vehicleProfile }: BodyControlPanelProps) {
  const [lightStatuses, setLightStatuses] = useState<LightStatus[]>([]);
  const [radioSettings, setRadioSettings] = useState<RadioSetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Initialize light statuses for Peugeot 307
  useEffect(() => {
    if (vehicleProfile?.id === 'peugeot-307-1.6-hdi-2006') {
      setLightStatuses([
        { id: 'headlight_left', name: 'Left Headlight', status: 'unknown' },
        { id: 'headlight_right', name: 'Right Headlight', status: 'unknown' },
        { id: 'taillight_left', name: 'Left Taillight', status: 'unknown' },
        { id: 'taillight_right', name: 'Right Taillight', status: 'unknown' },
        { id: 'brake_left', name: 'Left Brake Light', status: 'unknown' },
        { id: 'brake_right', name: 'Right Brake Light', status: 'unknown' },
        { id: 'turn_left', name: 'Left Turn Signal', status: 'unknown' },
        { id: 'turn_right', name: 'Right Turn Signal', status: 'unknown' },
        { id: 'reverse_left', name: 'Left Reverse Light', status: 'unknown' },
        { id: 'reverse_right', name: 'Right Reverse Light', status: 'unknown' },
        { id: 'fog_front', name: 'Front Fog Lights', status: 'unknown' },
        { id: 'fog_rear', name: 'Rear Fog Light', status: 'unknown' },
      ]);

      setRadioSettings([
        { id: 'aux1', name: 'AUX1 Input', enabled: false, canToggle: true },
        { id: 'aux2', name: 'AUX2 Input', enabled: false, canToggle: true },
        { id: 'bluetooth', name: 'Bluetooth Audio', enabled: false, canToggle: true },
        { id: 'speed_volume', name: 'Speed Dependent Volume', enabled: false, canToggle: true },
        { id: 'parking_beep', name: 'Parking Sensors Beep', enabled: true, canToggle: true },
        { id: 'auto_door_lock', name: 'Auto Door Lock', enabled: false, canToggle: true },
      ]);
    }
  }, [vehicleProfile]);

  const scanLightStatuses = async () => {
    if (!isConnected || !vehicleProfile) return;
    
    setIsLoading(true);
    try {
      // PSA Body Control Module PIDs for Peugeot 307
      const lightPids = [
        { pid: '2240', lights: ['headlight_left', 'headlight_right'] },
        { pid: '2241', lights: ['taillight_left', 'taillight_right'] },
        { pid: '2242', lights: ['brake_left', 'brake_right'] },
        { pid: '2243', lights: ['turn_left', 'turn_right'] },
        { pid: '2244', lights: ['reverse_left', 'reverse_right'] },
        { pid: '2245', lights: ['fog_front', 'fog_rear'] },
      ];

      const updatedStatuses = [...lightStatuses];

      for (const { pid, lights } of lightPids) {
        try {
          const response = await obd2Service.sendCommandPublic(pid);
          
          if (response && !response.includes('NO DATA')) {
            // Parse response - simplified logic for demo
            const statusByte = parseInt(response.split(' ')[2] || '00', 16);
            
            lights.forEach((lightId, index) => {
              const lightIndex = updatedStatuses.findIndex(l => l.id === lightId);
              if (lightIndex !== -1) {
                const bitMask = 1 << index;
                const hasError = (statusByte & bitMask) !== 0;
                
                updatedStatuses[lightIndex] = {
                  ...updatedStatuses[lightIndex],
                  status: hasError ? 'error' : 'ok',
                  errorCode: hasError ? `P${pid.substring(1)}${index}` : undefined
                };
              }
            });
          }
        } catch (error) {
          console.error(`Error reading PID ${pid}:`, error);
        }
      }

      setLightStatuses(updatedStatuses);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error scanning light statuses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRadioSetting = async (settingId: string) => {
    if (!isConnected || !vehicleProfile) return;

    const setting = radioSettings.find(s => s.id === settingId);
    if (!setting || !setting.canToggle) return;

    try {
      // PSA Radio/BSI Control PIDs for Peugeot 307
      const radioPids: { [key: string]: string } = {
        aux1: '2250',
        aux2: '2251',
        bluetooth: '2252',
        speed_volume: '2253',
        parking_beep: '2254',
        auto_door_lock: '2255',
      };

      const pid = radioPids[settingId];
      if (pid) {
        const command = `${pid} ${setting.enabled ? '00' : '01'}`; // Toggle on/off
        const response = await obd2Service.sendCommandPublic(command);
        
        if (response && !response.includes('NO DATA')) {
          setRadioSettings(prev => 
            prev.map(s => 
              s.id === settingId 
                ? { ...s, enabled: !s.enabled }
                : s
            )
          );
        }
      }
    } catch (error) {
      console.error(`Error toggling ${settingId}:`, error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok': return <Badge variant="secondary" className="bg-green-100 text-green-800">OK</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!vehicleProfile || vehicleProfile.id !== 'peugeot-307-1.6-hdi-2006') {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Body control features are only available for Peugeot 307 1.6 HDI 2006.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Light Diagnostics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              <CardTitle>Light Diagnostics</CardTitle>
            </div>
            <Button 
              onClick={scanLightStatuses}
              disabled={!isConnected || isLoading}
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                'Scan Lights'
              )}
            </Button>
          </div>
          <CardDescription>
            Check bulb status and diagnose lighting system errors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lightStatuses.map((light) => (
              <div key={light.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(light.status)}
                  <span className="font-medium">{light.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(light.status)}
                  {light.errorCode && (
                    <Badge variant="outline" className="text-xs">
                      {light.errorCode}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {lastUpdate && (
            <div className="mt-4 text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Radio & Body Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            <CardTitle>Radio & Body Settings</CardTitle>
          </div>
          <CardDescription>
            Configure radio inputs and body control features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {radioSettings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">{setting.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={() => toggleRadioSetting(setting.id)}
                    disabled={!isConnected || !setting.canToggle}
                  />
                  <Badge variant={setting.enabled ? "default" : "outline"}>
                    {setting.enabled ? "ON" : "OFF"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Changes to radio and body settings require the vehicle to be running 
              and may need ignition cycle to take effect. Some features may require dealer-level access.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}