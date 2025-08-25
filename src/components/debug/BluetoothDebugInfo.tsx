
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  Smartphone, 
  Bluetooth, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { unifiedBluetoothService } from '@/services/UnifiedBluetoothService';

const BluetoothDebugInfo: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const collectDebugInfo = async () => {
    setIsLoading(true);
    
    try {
      const info = {
        platform: Capacitor.getPlatform(),
        isNative: Capacitor.isNativePlatform(),
        webBluetoothSupported: 'bluetooth' in navigator,
        customPluginAvailable: !!(window as any).CustomBluetoothSerial,
        bluetoothEnabled: await unifiedBluetoothService.isBluetoothEnabled(),
        serviceInitialized: await unifiedBluetoothService.initialize(),
        timestamp: new Date().toISOString()
      };
      
      console.log('🐛 Debug Info Collected:', info);
      setDebugInfo(info);
      
    } catch (error) {
      console.error('Debug info collection failed:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    collectDebugInfo();
  }, []);

  const testBluetoothScan = async () => {
    try {
      console.log('🧪 Testing Bluetooth scan...');
      const devices = await unifiedBluetoothService.scanForDevices();
      console.log('🧪 Test scan result:', devices);
    } catch (error) {
      console.error('🧪 Test scan failed:', error);
    }
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-blue-600" />
          Bluetooth Debug Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Platform Info</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Platform:</span>
                <Badge variant="outline">{debugInfo.platform || 'Unknown'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Native:</span>
                {debugInfo.isNative ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Bluetooth Support</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Web Bluetooth:</span>
                {debugInfo.webBluetoothSupported ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Custom Plugin:</span>
                {debugInfo.customPluginAvailable ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">BT Enabled:</span>
                {debugInfo.bluetoothEnabled ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={collectDebugInfo} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Refresh Info
          </Button>
          
          <Button 
            onClick={testBluetoothScan}
            variant="outline"
            size="sm"
          >
            <Bluetooth className="h-4 w-4 mr-2" />
            Test Scan
          </Button>
        </div>

        {debugInfo.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">Error: {debugInfo.error}</p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Last updated: {debugInfo.timestamp}
        </div>
      </CardContent>
    </Card>
  );
};

export default BluetoothDebugInfo;
