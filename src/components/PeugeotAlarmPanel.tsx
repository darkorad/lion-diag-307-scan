import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Power, 
  Battery, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface PeugeotAlarmPanelProps {
  isConnected: boolean;
  onSendCommand: (command: string) => Promise<string>;
}

const PeugeotAlarmPanel: React.FC<PeugeotAlarmPanelProps> = ({ 
  isConnected, 
  onSendCommand 
}) => {
  const [alarmStatus, setAlarmStatus] = useState<'unknown' | 'enabled' | 'disabled'>('unknown');
  const [batteryVoltage, setBatteryVoltage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastOperation, setLastOperation] = useState<string>('');

  useEffect(() => {
    if (isConnected) {
      checkAlarmStatus();
      checkBatteryVoltage();
    }
  }, [isConnected]);

  const checkAlarmStatus = async () => {
    if (!isConnected) {
      toast.error('Not connected to OBD2 adapter');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Checking Peugeot 307 alarm status...');
      const response = await onSendCommand('221801');
      console.log('Alarm status response:', response);
      
      if (response.includes('621801')) {
        const statusByte = response.split(' ')[2];
        if (statusByte === '01') {
          setAlarmStatus('enabled');
          toast.success('Factory alarm is currently enabled');
        } else if (statusByte === '00') {
          setAlarmStatus('disabled');
          toast.success('Factory alarm is currently disabled');
        } else {
          setAlarmStatus('unknown');
          toast.warning('Alarm status unclear');
        }
      } else {
        setAlarmStatus('unknown');
        toast.error('Could not read alarm status');
      }
    } catch (error) {
      console.error('Failed to check alarm status:', error);
      toast.error('Failed to check alarm status');
      setAlarmStatus('unknown');
    } finally {
      setIsLoading(false);
    }
  };

  const checkBatteryVoltage = async () => {
    if (!isConnected) return;

    try {
      console.log('Reading battery voltage...');
      const response = await onSendCommand('0142');
      console.log('Battery voltage response:', response);
      
      if (response.includes('4142')) {
        const hexValue = response.split(' ').slice(-2).join('');
        const voltage = parseInt(hexValue, 16) / 1000;
        setBatteryVoltage(voltage);
      }
    } catch (error) {
      console.error('Failed to read battery voltage:', error);
    }
  };

  const disableAlarm = async () => {
    if (!isConnected) {
      toast.error('Not connected to OBD2 adapter');
      return;
    }

    setIsLoading(true);
    setLastOperation('Disabling factory alarm...');
    
    try {
      console.log('Disabling Peugeot 307 factory alarm...');
      
      toast.info('Sending disable command to ECU...');
      const response = await onSendCommand('2F180100');
      console.log('Disable alarm response:', response);
      
      if (response.includes('6F1801')) {
        setAlarmStatus('disabled');
        toast.success('Factory alarm disabled successfully!', {
          description: 'Door indicators will no longer flash when doors are opened'
        });
        setLastOperation('Alarm disabled');
        
        setTimeout(() => {
          checkAlarmStatus();
        }, 2000);
      } else {
        toast.error('Failed to disable alarm - Invalid response');
        setLastOperation('Disable failed');
      }
    } catch (error) {
      console.error('Failed to disable alarm:', error);
      toast.error('Failed to disable factory alarm');
      setLastOperation('Disable failed');
    } finally {
      setIsLoading(false);
    }
  };

  const enableAlarm = async () => {
    if (!isConnected) {
      toast.error('Not connected to OBD2 adapter');
      return;
    }

    setIsLoading(true);
    setLastOperation('Enabling factory alarm...');
    
    try {
      console.log('Enabling Peugeot 307 factory alarm...');
      
      toast.info('Sending enable command to ECU...');
      const response = await onSendCommand('2F180101');
      console.log('Enable alarm response:', response);
      
      if (response.includes('6F1801')) {
        setAlarmStatus('enabled');
        toast.success('Factory alarm enabled successfully!');
        setLastOperation('Alarm enabled');
        
        setTimeout(() => {
          checkAlarmStatus();
        }, 2000);
      } else {
        toast.error('Failed to enable alarm - Invalid response');
        setLastOperation('Enable failed');
      }
    } catch (error) {
      console.error('Failed to enable alarm:', error);
      toast.error('Failed to enable factory alarm');
      setLastOperation('Enable failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Peugeot 307 Factory Alarm Control</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please connect to your OBD2 adapter first to access alarm control functions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Peugeot 307 Factory Alarm Control</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
            <div className="flex items-center space-x-2">
              {alarmStatus === 'enabled' && <ShieldAlert className="h-5 w-5 text-red-500" />}
              {alarmStatus === 'disabled' && <ShieldCheck className="h-5 w-5 text-green-500" />}
              {alarmStatus === 'unknown' && <Shield className="h-5 w-5 text-gray-500" />}
              <span className="font-medium">Alarm Status:</span>
            </div>
            <Badge 
              variant={alarmStatus === 'enabled' ? 'destructive' : alarmStatus === 'disabled' ? 'default' : 'secondary'}
            >
              {alarmStatus === 'enabled' && 'ENABLED'}
              {alarmStatus === 'disabled' && 'DISABLED'}
              {alarmStatus === 'unknown' && 'UNKNOWN'}
            </Badge>
          </div>

          {/* Battery Voltage */}
          {batteryVoltage && (
            <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg">
              <div className="flex items-center space-x-2">
                <Battery className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Battery Voltage:</span>
              </div>
              <Badge variant="outline">
                {batteryVoltage.toFixed(2)}V
              </Badge>
            </div>
          )}

          {/* Control Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={checkAlarmStatus}
              disabled={isLoading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              <span>Check Status</span>
            </Button>

            <Button 
              onClick={disableAlarm}
              disabled={isLoading || alarmStatus === 'disabled'}
              className="flex items-center space-x-2"
              variant="destructive"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Power className="h-4 w-4" />
              )}
              <span>Disable Alarm</span>
            </Button>

            <Button 
              onClick={enableAlarm}
              disabled={isLoading || alarmStatus === 'enabled'}
              className="flex items-center space-x-2"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>Enable Alarm</span>
            </Button>
          </div>

          {/* Status Messages */}
          {lastOperation && (
            <Alert>
              <AlertDescription>
                {lastOperation}
              </AlertDescription>
            </Alert>
          )}

          {/* Information */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> This function disables the factory alarm that causes all turn signals 
              to flash for 20 seconds when opening doors. This is specifically for Peugeot 307 models 
              with factory anti-theft systems.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeugeotAlarmPanel;
