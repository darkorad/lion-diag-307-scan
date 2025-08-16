
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  ShieldOff, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Settings,
  Car
} from 'lucide-react';
import { toast } from 'sonner';
import { enhancedBluetoothService } from '@/obd2/enhanced-bluetooth-service';

interface AlarmStatus {
  isActive: boolean;
  lastTriggered?: Date;
  batteryLevel?: number;
  sensorStatus?: 'OK' | 'WARNING' | 'ERROR';
}

const PeugeotAlarmPanel: React.FC = () => {
  const [alarmStatus, setAlarmStatus] = useState<AlarmStatus>({ isActive: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
    if (isConnected) {
      loadAlarmStatus();
    }
  }, [isConnected]);

  const checkConnection = () => {
    const connected = enhancedBluetoothService.isConnected();
    setIsConnected(connected);
  };

  const loadAlarmStatus = async () => {
    if (!isConnected) {
      toast.error('OBD2 device not connected');
      return;
    }

    setIsLoading(true);
    try {
      // Read alarm system status using Peugeot-specific PIDs
      const alarmActiveResponse = await enhancedBluetoothService.sendObdCommand('221801'); // BSI alarm status
      const batteryResponse = await enhancedBluetoothService.sendObdCommand('221802'); // BSI battery level
      
      // Parse responses
      const isActive = !alarmActiveResponse.includes('NO DATA') && 
                      parseInt(alarmActiveResponse.split(' ')[3] || '0', 16) & 0x01;
      
      const batteryHex = batteryResponse.split(' ')[3] || '00';
      const batteryLevel = parseInt(batteryHex, 16) * 100 / 255;

      setAlarmStatus({
        isActive: !!isActive,
        batteryLevel: batteryLevel > 0 ? batteryLevel : undefined,
        sensorStatus: batteryLevel > 20 ? 'OK' : 'WARNING'
      });

      console.log('Alarm status loaded:', { isActive, batteryLevel });
    } catch (error) {
      console.error('Failed to load alarm status:', error);
      toast.error('Failed to read alarm status');
      
      // Set default status if read fails
      setAlarmStatus({ 
        isActive: true, // Assume active if we can't read
        sensorStatus: 'ERROR' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disableAlarm = async () => {
    if (!isConnected) {
      toast.error('OBD2 device not connected');
      return;
    }

    setIsLoading(true);
    try {
      toast.info('Disabling factory alarm system...');
      
      // Send Peugeot-specific command to disable alarm
      // This uses the BSI (Body Systems Interface) to control the alarm
      await enhancedBluetoothService.sendObdCommand('2F180100'); // Disable alarm system
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Send additional command to disable door sensors
      await enhancedBluetoothService.sendObdCommand('2F180200'); // Disable door sensor alerts
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify the alarm is disabled
      await loadAlarmStatus();
      
      if (!alarmStatus.isActive) {
        toast.success('Factory alarm disabled successfully');
      } else {
        toast.warning('Alarm may still be partially active - check manually');
      }
      
    } catch (error) {
      console.error('Failed to disable alarm:', error);
      toast.error('Failed to disable alarm: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const enableAlarm = async () => {
    if (!isConnected) {
      toast.error('OBD2 device not connected');
      return;
    }

    setIsLoading(true);
    try {
      toast.info('Enabling factory alarm system...');
      
      // Send command to re-enable alarm
      await enhancedBluetoothService.sendObdCommand('2F180101'); // Enable alarm system
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Re-enable door sensors
      await enhancedBluetoothService.sendObdCommand('2F180201'); // Enable door sensor alerts
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify the alarm is enabled
      await loadAlarmStatus();
      
      toast.success('Factory alarm enabled successfully');
      
    } catch (error) {
      console.error('Failed to enable alarm:', error);
      toast.error('Failed to enable alarm: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const resetAlarmHistory = async () => {
    if (!isConnected) {
      toast.error('OBD2 device not connected');
      return;
    }

    setIsLoading(true);
    try {
      // Clear alarm history in BSI
      await enhancedBluetoothService.sendObdCommand('2F180300'); // Clear alarm events
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await loadAlarmStatus();
      toast.success('Alarm history cleared');
      
    } catch (error) {
      console.error('Failed to reset alarm history:', error);
      toast.error('Failed to reset alarm history');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!isConnected) return 'bg-gray-500';
    if (alarmStatus.isActive) return 'bg-red-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (alarmStatus.isActive) return 'Active';
    return 'Disabled';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="h-5 w-5" />
            <span>Peugeot 307 Factory Alarm Control</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                OBD2 device not connected. Please connect to your Peugeot 307 first.
              </AlertDescription>
            </Alert>
          )}

          {/* Alarm Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${getStatusColor()}`} />
              <div>
                <h3 className="font-semibold">Alarm Status</h3>
                <p className="text-sm text-muted-foreground">{getStatusText()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {alarmStatus.isActive ? (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Active</span>
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <ShieldOff className="h-3 w-3" />
                  <span>Disabled</span>
                </Badge>
              )}
            </div>
          </div>

          {/* System Information */}
          {isConnected && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">Battery Level</h4>
                <p className="text-lg font-semibold">
                  {alarmStatus.batteryLevel ? `${Math.round(alarmStatus.batteryLevel)}%` : 'Unknown'}
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">Sensor Status</h4>
                <div className="flex items-center space-x-2">
                  {alarmStatus.sensorStatus === 'OK' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {alarmStatus.sensorStatus === 'WARNING' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  {alarmStatus.sensorStatus === 'ERROR' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  <span className="text-sm">{alarmStatus.sensorStatus || 'Unknown'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={loadAlarmStatus}
              disabled={!isConnected || isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reading Status...
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  Refresh Status
                </>
              )}
            </Button>

            <Button
              onClick={disableAlarm}
              disabled={!isConnected || isLoading || !alarmStatus.isActive}
              variant="destructive"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                <>
                  <ShieldOff className="mr-2 h-4 w-4" />
                  Disable Factory Alarm
                </>
              )}
            </Button>

            <Button
              onClick={enableAlarm}
              disabled={!isConnected || isLoading || alarmStatus.isActive}
              variant="default"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enabling...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Enable Factory Alarm
                </>
              )}
            </Button>

            <Button
              onClick={resetAlarmHistory}
              disabled={!isConnected || isLoading}
              variant="outline"
              className="w-full"
            >
              Clear Alarm History
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> This function sends real commands to your vehicle's BSI (Body Systems Interface). 
          The alarm will be genuinely disabled/enabled. Use with caution and ensure your vehicle is secure.
          <br /><br />
          <strong>Peugeot 307 Notes:</strong>
          <ul className="mt-2 list-disc list-inside text-sm">
            <li>Disabling the alarm stops turn signal flashing when doors are opened</li>
            <li>The alarm can be re-enabled at any time</li>
            <li>This does not affect the central locking system</li>
            <li>Changes may persist until battery disconnect or ECU reset</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PeugeotAlarmPanel;
