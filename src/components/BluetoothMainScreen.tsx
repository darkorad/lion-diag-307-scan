
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bluetooth, 
  Car, 
  Activity,
  CheckCircle,
  Settings,
  Smartphone
} from 'lucide-react';
import NativeBluetoothScanner from './NativeBluetoothScanner';
import { BluetoothServiceDevice } from '@/services/NativeBluetoothService';
import { toast } from 'sonner';

interface BluetoothMainScreenProps {
  onBack?: () => void;
}

const BluetoothMainScreen: React.FC<BluetoothMainScreenProps> = ({ onBack }) => {
  const [connectedDevice, setConnectedDevice] = useState<BluetoothServiceDevice | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleDeviceConnected = (device: BluetoothServiceDevice) => {
    setConnectedDevice(device);
    setShowScanner(false);
    toast.success(`Connected to ${device.name}`, {
      description: 'You can now communicate with your vehicle'
    });
  };

  const handleStartScanning = () => {
    setShowScanner(true);
  };

  const handleBackToMain = () => {
    setShowScanner(false);
  };

  if (showScanner) {
    return (
      <NativeBluetoothScanner
        onDeviceConnected={handleDeviceConnected}
        onBack={handleBackToMain}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {onBack && (
            <Button onClick={onBack} variant="ghost" size="sm">
              ← Back
            </Button>
          )}
          <div className="flex items-center space-x-2">
            <Bluetooth className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">OBD2 Bluetooth</h1>
          </div>
        </div>
        <p className="text-gray-600">Connect to your vehicle's diagnostic port</p>
      </div>

      {/* Connection Status */}
      {connectedDevice ? (
        <Card className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Connected Device
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Car className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">{connectedDevice.name}</h3>
                  <p className="text-sm text-green-700">{connectedDevice.address}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className="bg-green-500 text-white text-xs">
                      {connectedDevice.deviceType}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                      Ready for diagnostics
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={handleStartScanning}
                  variant="outline"
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Bluetooth className="h-5 w-5 mr-2 text-gray-600" />
              No Device Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-gray-600 mb-4">
                Connect to your OBD2 adapter to start vehicle diagnostics
              </p>
              <Button 
                onClick={handleStartScanning}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                size="lg"
              >
                <Bluetooth className="h-5 w-5 mr-2" />
                Find OBD2 Devices
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold">Real-time Diagnostics</h3>
            </div>
            <p className="text-sm text-gray-600">
              Connect directly to your vehicle's ECU for live data monitoring and fault code reading.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold">Universal Compatibility</h3>
            </div>
            <p className="text-sm text-gray-600">
              Works with all ELM327 adapters and OBD2-compliant vehicles from 1996 onwards.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Quick Setup Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white text-sm font-semibold rounded-full flex items-center justify-center mt-0.5">1</div>
              <div>
                <p className="font-medium">Plug in your OBD2 adapter</p>
                <p className="text-sm text-gray-600">Connect the adapter to your vehicle's OBD2 port (usually under the dashboard)</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white text-sm font-semibold rounded-full flex items-center justify-center mt-0.5">2</div>
              <div>
                <p className="font-medium">Turn on ignition</p>
                <p className="text-sm text-gray-600">Turn your vehicle's ignition to ON position (engine doesn't need to run)</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white text-sm font-semibold rounded-full flex items-center justify-center mt-0.5">3</div>
              <div>
                <p className="font-medium">Scan for devices</p>
                <p className="text-sm text-gray-600">Tap "Find OBD2 Devices" to discover and connect to your adapter</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BluetoothMainScreen;
