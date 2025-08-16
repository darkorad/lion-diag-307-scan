import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft,
  Radio, 
  Volume2, 
  VolumeX,
  Settings,
  Info,
  RefreshCw,
  Car
} from 'lucide-react';
import { toast } from 'sonner';

interface Peugeot307RadioPanelProps {
  isConnected: boolean;
  onBack?: () => void;
}

const Peugeot307RadioPanel: React.FC<Peugeot307RadioPanelProps> = ({ isConnected, onBack }) => {
  const [auxPortEnabled, setAuxPortEnabled] = useState(false);
  const [radioInfo, setRadioInfo] = useState({
    model: 'RD4',
    version: '6.03',
    serialNumber: 'PE307RD4001',
    auxSupported: true,
    currentSource: 'Radio'
  });
  const [isLoading, setIsLoading] = useState(false);

  const toggleAuxPort = async () => {
    if (!isConnected) {
      toast.error('Not connected to OBD2 device');
      return;
    }

    setIsLoading(true);
    try {
      const command = auxPortEnabled ? '220F40' : '220F41'; // Mock OBD2 commands for Peugeot radio
      toast.info(auxPortEnabled ? 'Disabling AUX port...' : 'Enabling AUX port...');
      
      // Simulate OBD2 command execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAuxPortEnabled(!auxPortEnabled);
      setRadioInfo(prev => ({
        ...prev,
        currentSource: !auxPortEnabled ? 'AUX' : 'Radio'
      }));
      
      toast.success(auxPortEnabled ? 'AUX port disabled' : 'AUX port enabled');
    } catch (error) {
      console.error('Failed to toggle AUX port:', error);
      toast.error('Failed to toggle AUX port');
    } finally {
      setIsLoading(false);
    }
  };

  const readRadioInfo = async () => {
    if (!isConnected) {
      toast.error('Not connected to OBD2 device');
      return;
    }

    setIsLoading(true);
    try {
      toast.info('Reading radio information...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate reading radio info via OBD2
      setRadioInfo({
        model: 'RD4',
        version: '6.03',
        serialNumber: 'PE307RD4001',
        auxSupported: true,
        currentSource: auxPortEnabled ? 'AUX' : 'Radio'
      });
      
      toast.success('Radio information updated');
    } catch (error) {
      console.error('Failed to read radio info:', error);
      toast.error('Failed to read radio information');
    } finally {
      setIsLoading(false);
    }
  };

  const resetRadio = async () => {
    if (!isConnected) {
      toast.error('Not connected to OBD2 device');
      return;
    }

    setIsLoading(true);
    try {
      toast.info('Resetting radio to factory settings...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setAuxPortEnabled(false);
      setRadioInfo(prev => ({
        ...prev,
        currentSource: 'Radio'
      }));
      
      toast.success('Radio reset to factory settings');
    } catch (error) {
      console.error('Failed to reset radio:', error);
      toast.error('Failed to reset radio');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}

      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Radio className="h-5 w-5 text-primary" />
              <span>Peugeot 307 Radio Control</span>
            </div>
            <Badge variant="outline">2006 1.6 HDI</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {!isConnected && (
        <Card className="diagnostic-border">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Radio className="h-8 w-8 mx-auto mb-2" />
              <p>Connect to an OBD2 device to access radio control functions</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Radio Information */}
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5" />
              <span>Radio Information</span>
            </div>
            <Button
              onClick={readRadioInfo}
              disabled={!isConnected || isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Model</p>
              <p className="font-semibold">{radioInfo.model}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="font-semibold">{radioInfo.version}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Serial Number</p>
              <p className="font-mono text-sm">{radioInfo.serialNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Source</p>
              <Badge variant={radioInfo.currentSource === 'AUX' ? 'default' : 'secondary'}>
                {radioInfo.currentSource}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AUX Port Control */}
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5" />
            <span>AUX Port Control</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                {auxPortEnabled ? (
                  <Volume2 className="h-5 w-5 text-green-500" />
                ) : (
                  <VolumeX className="h-5 w-5 text-gray-500" />
                )}
                <div>
                  <p className="font-medium">AUX Input Port</p>
                  <p className="text-sm text-muted-foreground">
                    {auxPortEnabled ? 'AUX port is active and ready for input' : 'AUX port is disabled'}
                  </p>
                </div>
              </div>
              <Switch
                checked={auxPortEnabled}
                onCheckedChange={toggleAuxPort}
                disabled={!isConnected || isLoading}
              />
            </div>

            {auxPortEnabled && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>AUX Port Active:</strong> You can now connect external audio devices 
                  to the AUX input. The radio will automatically switch to AUX source when a 
                  device is connected and playing.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Controls */}
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Additional Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={resetRadio}
              disabled={!isConnected || isLoading}
              variant="outline"
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              Reset Radio
            </Button>
            
            <Button
              disabled={!isConnected || isLoading}
              variant="outline"
              className="w-full"
            >
              <Radio className="h-4 w-4 mr-2" />
              Radio Code
            </Button>
            
            <Button
              disabled={!isConnected || isLoading}
              variant="outline"
              className="w-full"
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Audio Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Compatible Models & Information */}
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Compatibility & Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Compatible Models:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <Badge variant="outline">Peugeot 307 (2005-2008)</Badge>
                <Badge variant="outline">Peugeot 407 (2004-2010)</Badge>
                <Badge variant="outline">Peugeot 607 (2004-2010)</Badge>
                <Badge variant="outline">Peugeot 807 (2004-2014)</Badge>
                <Badge variant="outline">Citroën C4 (2004-2010)</Badge>
                <Badge variant="outline">Citroën C5 (2004-2008)</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Supported Radio Models:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                <span>• RD4 (Standard)</span>
                <span>• RD43 (Navigation)</span>
                <span>• RT3 (Navigation)</span>
                <span>• RT4 (Navigation)</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This feature uses manufacturer-specific OBD2 commands 
                to control the radio/infotainment system. Functionality may vary depending 
                on the specific radio model and software version installed in your vehicle.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Peugeot307RadioPanel;