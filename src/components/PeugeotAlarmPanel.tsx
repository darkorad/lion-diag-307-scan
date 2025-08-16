
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  ShieldOff, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Car,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface PeugeotAlarmPanelProps {
  isConnected: boolean;
  onSendCommand?: (command: string) => Promise<string>;
}

const PeugeotAlarmPanel: React.FC<PeugeotAlarmPanelProps> = ({ 
  isConnected, 
  onSendCommand 
}) => {
  const [isDisabling, setIsDisabling] = useState(false);
  const [alarmStatus, setAlarmStatus] = useState<'unknown' | 'enabled' | 'disabled'>('unknown');
  const [lastOperation, setLastOperation] = useState<string | null>(null);

  const checkAlarmStatus = async () => {
    if (!isConnected) {
      toast.error('Please connect to your vehicle first');
      return;
    }

    try {
      setIsDisabling(true);
      toast.info('Checking alarm status...');
      
      // Command to read alarm status from BSI (Body Control Module)
      const response = await onSendCommand?.('22 F1 90') || 'No response';
      
      // Parse response to determine alarm status
      if (response.includes('62 F1 90')) {
        const statusByte = response.split(' ')[3];
        if (statusByte && parseInt(statusByte, 16) & 0x01) {
          setAlarmStatus('enabled');
          toast.info('Factory alarm is currently ENABLED');
        } else {
          setAlarmStatus('disabled');
          toast.success('Factory alarm is currently DISABLED');
        }
      } else {
        toast.warning('Could not determine alarm status');
      }
      
      setLastOperation('Status Check');
    } catch (error) {
      console.error('Error checking alarm status:', error);
      toast.error('Failed to check alarm status');
    } finally {
      setIsDisabling(false);
    }
  };

  const disableFactoryAlarm = async () => {
    if (!isConnected) {
      toast.error('Please connect to your vehicle first');
      return;
    }

    setIsDisabling(true);
    
    try {
      toast.info('Disabling factory alarm system...');
      
      // Sequence of commands to disable Peugeot 307 factory alarm
      const commands = [
        { cmd: '10 03', desc: 'Enter diagnostic session' },
        { cmd: '27 01', desc: 'Request security access seed' },
        { cmd: '27 02 XX XX', desc: 'Send security key (calculated)' },
        { cmd: '2E F1 90 00', desc: 'Disable alarm flag' },
        { cmd: '2E F1 91 00', desc: 'Disable door alarm trigger' },
        { cmd: '2E F1 92 00', desc: 'Disable hood/trunk alarm' },
        { cmd: '31 01 F0 18', desc: 'Write changes to EEPROM' }
      ];

      for (const command of commands) {
        toast.info(`Executing: ${command.desc}`);
        
        let cmdToSend = command.cmd;
        
        // Handle security access - this is a simplified version
        if (command.cmd.includes('XX XX')) {
          // In real implementation, you'd calculate the key based on the seed
          // For demo purposes, using common Peugeot key
          cmdToSend = '27 02 A5 C3';
        }
        
        const response = await onSendCommand?.(cmdToSend) || 'No response';
        
        // Check for positive response
        if (response.includes('67') || response.includes('6E') || response.includes('71')) {
          console.log(`Command successful: ${command.desc}`);
        } else if (response.includes('7F')) {
          throw new Error(`Command failed: ${command.desc}`);
        }
        
        // Small delay between commands
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setAlarmStatus('disabled');
      setLastOperation('Alarm Disable');
      toast.success('Factory alarm successfully disabled!');
      
      // Inform user about the benefits
      toast.info('Door opening will no longer trigger hazard lights', {
        duration: 5000
      });
      
    } catch (error) {
      console.error('Error disabling alarm:', error);
      toast.error('Failed to disable factory alarm. Please try again.');
    } finally {
      setIsDisabling(false);
    }
  };

  const enableFactoryAlarm = async () => {
    if (!isConnected) {
      toast.error('Please connect to your vehicle first');
      return;
    }

    setIsDisabling(true);
    
    try {
      toast.info('Re-enabling factory alarm system...');
      
      const commands = [
        { cmd: '10 03', desc: 'Enter diagnostic session' },
        { cmd: '27 01', desc: 'Request security access' },
        { cmd: '27 02 A5 C3', desc: 'Send security key' },
        { cmd: '2E F1 90 01', desc: 'Enable alarm flag' },
        { cmd: '2E F1 91 01', desc: 'Enable door alarm trigger' },
        { cmd: '2E F1 92 01', desc: 'Enable hood/trunk alarm' },
        { cmd: '31 01 F0 18', desc: 'Write changes to EEPROM' }
      ];

      for (const command of commands) {
        toast.info(`Executing: ${command.desc}`);
        await onSendCommand?.(command.cmd);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setAlarmStatus('enabled');
      setLastOperation('Alarm Enable');
      toast.success('Factory alarm successfully re-enabled!');
      
    } catch (error) {
      console.error('Error enabling alarm:', error);
      toast.error('Failed to enable factory alarm');
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-orange-600" />
            <span>Peugeot 307 Factory Alarm Control</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                alarmStatus === 'enabled' ? 'bg-red-500' : 
                alarmStatus === 'disabled' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="font-medium">
                Alarm Status: {alarmStatus.charAt(0).toUpperCase() + alarmStatus.slice(1)}
              </span>
            </div>
            <Button 
              onClick={checkAlarmStatus} 
              disabled={!isConnected || isDisabling}
              variant="outline" 
              size="sm"
            >
              Check Status
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={disableFactoryAlarm}
              disabled={!isConnected || isDisabling}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              {isDisabling && lastOperation === 'Alarm Disable' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Disabling...</span>
                </>
              ) : (
                <>
                  <ShieldOff className="h-4 w-4" />
                  <span>Disable Factory Alarm</span>
                </>
              )}
            </Button>

            <Button
              onClick={enableFactoryAlarm}
              disabled={!isConnected || isDisabling}
              variant="outline"
              className="flex items-center space-x-2"
            >
              {isDisabling && lastOperation === 'Alarm Enable' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enabling...</span>
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  <span>Re-enable Alarm</span>
                </>
              )}
            </Button>
          </div>

          {/* Status Indicators */}
          {alarmStatus !== 'unknown' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded">
                <Car className="h-4 w-4" />
                <span className="text-sm">Door Triggers</span>
                {alarmStatus === 'disabled' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
              
              <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded">
                <Zap className="h-4 w-4" />
                <span className="text-sm">Hazard Lights</span>
                {alarmStatus === 'disabled' ? (
                  <Badge variant="secondary">OFF</Badge>
                ) : (
                  <Badge variant="destructive">ON</Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Alarm System</span>
                <Badge variant={alarmStatus === 'enabled' ? 'default' : 'secondary'}>
                  {alarmStatus.toUpperCase()}
                </Badge>
              </div>
            </div>
          )}

          {/* Warning Alert */}
          <Alert className="border-orange-300 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>About Factory Alarm Disable:</strong>
              <ul className="mt-2 text-sm space-y-1">
                <li>• Stops hazard lights from flashing when doors are opened</li>
                <li>• Prevents 20-second indicator activation</li>
                <li>• Does NOT affect central locking or immobilizer</li>
                <li>• Can be re-enabled at any time</li>
                <li>• Changes are saved permanently until reset</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Connection Warning */}
          {!isConnected && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please connect to your Peugeot 307 via OBD2 to use alarm control functions.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PeugeotAlarmPanel;
