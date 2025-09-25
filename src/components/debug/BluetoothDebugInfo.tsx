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

// Extend window interface for CustomBluetoothSerial
declare global {
  interface Window {
    CustomBluetoothSerial?: any;
  }
}

// Define the type for debug info
interface DebugInfo {
  platform?: string;
  isNative?: boolean;
  webBluetoothSupported?: boolean;
  customPluginAvailable?: boolean;
  bluetoothEnabled?: boolean;
  serviceInitialized?: boolean;
  error?: string;
  timestamp?: string;
}

const BluetoothDebugInfo: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const [isLoading, setIsLoading] = useState(false);

  const collectDebugInfo = async () => {
    setIsLoading(true);
    
    try {
      const platform = Capacitor.getPlatform();
      const isNative = Capacitor.isNativePlatform();
      
      console.log('🐛 Collecting debug info...');
      console.log('📱 Platform:', platform);
      console.log('🏠 Native:', isNative);
      
      // Check for custom plugin availability
      const customPluginAvailable = !!(window as any).CustomBluetoothSerial;
      console.log('🔌 CustomBluetoothSerial available:', customPluginAvailable);
      
      // Initialize the service to get accurate status
      let serviceInitialized = false;
      let bluetoothEnabled = false;
      
      try {
        serviceInitialized = await unifiedBluetoothService.checkBluetoothStatus();
        console.log('🔧 Service initialized:', serviceInitialized);
        
        if (serviceInitialized) {
          bluetoothEnabled = await unifiedBluetoothService.checkBluetoothStatus();
          console.log('🔵 Bluetooth enabled:', bluetoothEnabled);
        }
      } catch (error) {
        console.error('❌ Service initialization error:', error);
      }
      
      const info: DebugInfo = {
        platform,
        isNative,
        webBluetoothSupported: 'bluetooth' in navigator,
        customPluginAvailable,
        bluetoothEnabled,
        serviceInitialized,
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
    // Delay initial collection to ensure plugins are loaded
    setTimeout(() => {
      collectDebugInfo();
    }, 1000);
  }, []);

  const testBluetoothScan = async () => {
    try {
      console.log('🧪 Testing Bluetooth scan...');
      
      // First ensure service is initialized
      const initialized = await unifiedBluetoothService.checkBluetoothStatus();
      if (!initialized) {
        console.error('🧪 Service initialization failed');
        return;
      }
      
      // Check if Bluetooth is enabled
      const enabled = await unifiedBluetoothService.checkBluetoothStatus();
      if (!enabled) {
        console.log('🧪 Bluetooth not enabled, attempting to enable...');
        // Note: There's no direct enable method in unifiedBluetoothService
      }
      
      // Attempt scan
      const devices = await unifiedBluetoothService.scanForDevices();
      console.log('🧪 Test scan result:', devices);
      
      // Refresh debug info
      await collectDebugInfo();
      
    } catch (error) {
      console.error('🧪 Test scan failed:', error);
    }
  };

  const getStatusIcon = (status: boolean | undefined) => {
    if (status === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status === false) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
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
                {getStatusIcon(debugInfo.isNative)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Current Service:</span>
                <Badge variant="outline" className="text-xs">
                  {'Not Available'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Bluetooth Support</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Web Bluetooth:</span>
                {getStatusIcon(debugInfo.webBluetoothSupported)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Custom Plugin:</span>
                {getStatusIcon(debugInfo.customPluginAvailable)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">BT Enabled:</span>
                {getStatusIcon(debugInfo.bluetoothEnabled)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Service Init:</span>
                {getStatusIcon(debugInfo.serviceInitialized)}
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

        {/* Troubleshooting hints */}
        {debugInfo.platform === 'android' && debugInfo.isNative && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 font-medium mb-2">Android Native Platform Detected</p>
            <div className="text-xs text-blue-700 space-y-1">
              {!debugInfo.customPluginAvailable && (
                <p>• Custom Bluetooth plugin not found - check if MainActivity registers the plugin</p>
              )}
              {!debugInfo.bluetoothEnabled && (
                <p>• Bluetooth is disabled - app will attempt to enable it when scanning</p>
              )}
              {!debugInfo.serviceInitialized && (
                <p>• Service initialization failed - check Android permissions</p>
              )}
            </div>
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