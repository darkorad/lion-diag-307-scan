
import React from 'react';
import EnhancedNativeBluetoothManager from '@/components/EnhancedNativeBluetoothManager';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BluetoothDevice } from '@/services/bluetooth/types';
import { toast } from 'sonner';

const BluetoothTest: React.FC = () => {
  
  const handleDeviceConnected = (device: BluetoothDevice) => {
    console.log('Device connected in test page:', device);
    toast.success(`Connected to ${device.name} - Ready for OBD2 communication!`);
  };
  
  const handleConnectionLost = () => {
    console.log('Connection lost in test page');
    toast.error('Device connection lost');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🦁 Lion Diag Scan - Enhanced Bluetooth Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">
              Test the new native Android Bluetooth plugin with improved scanning, pairing, and OBD2 connectivity.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">🚀 New Features</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ Native Android Kotlin plugin for reliable Bluetooth</li>
                <li>✅ Proper Android 12+ permission handling</li>
                <li>✅ Enhanced device discovery with OBD2 compatibility scoring</li>
                <li>✅ In-app device pairing (no manual phone settings)</li>
                <li>✅ Auto-reconnection with device memory</li>
                <li>✅ ELM327 initialization and optimization</li>
                <li>✅ Real-time connection status and error handling</li>
                <li>✅ Modern Material Design UI</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <EnhancedNativeBluetoothManager 
          onDeviceConnected={handleDeviceConnected}
          onConnectionLost={handleConnectionLost}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>📱 Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">For Android Testing:</h4>
              <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>Build and install the Android APK on a physical device</li>
                <li>Ensure your OBD2 adapter is plugged into a vehicle's OBD port</li>
                <li>Turn on your vehicle's ignition (engine doesn't need to run)</li>
                <li>Open the app and navigate to this Bluetooth test page</li>
                <li>Tap "Initialize Bluetooth" if needed to grant permissions</li>
                <li>Tap "Scan" to discover OBD2 devices</li>
                <li>Connect to your OBD2 adapter from the discovered devices list</li>
                <li>Test OBD2 commands once connected</li>
              </ol>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Expected Results:</h4>
              <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                <li>Bluetooth permissions granted automatically</li>
                <li>OBD2 devices discovered and ranked by compatibility</li>
                <li>Successful in-app pairing without leaving the app</li>
                <li>Stable connection with ELM327 initialization</li>
                <li>Auto-reconnection if connection is lost</li>
                <li>Real-time status updates and user feedback</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BluetoothTest;
