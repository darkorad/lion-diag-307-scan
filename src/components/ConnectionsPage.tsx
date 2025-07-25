
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bluetooth, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Car,
  Shield,
  History,
  RefreshCw
} from 'lucide-react';
import ProfessionalConnectionPanel from '@/components/ProfessionalConnectionPanel';
import ConnectionStatus from '@/components/ConnectionStatus';
import { BluetoothDevice } from '@/services/MasterBluetoothService';
import { enhancedOBD2Service } from '@/services/EnhancedOBD2Service';
import { bluetoothConnectionManager, ConnectionState } from '@/services/BluetoothConnectionManager';

interface ConnectionsPageProps {
  onBack: () => void;
  onConnectionChange: (connected: boolean) => void;
}

const ConnectionsPage: React.FC<ConnectionsPageProps> = ({ onBack, onConnectionChange }) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    device: null,
    connectionTime: null,
    lastSeen: null,
    connectionQuality: null
  });
  const [connectionHistory, setConnectionHistory] = useState(bluetoothConnectionManager.getConnectionHistory());

  useEffect(() => {
    // Subscribe to connection state changes
    const unsubscribe = bluetoothConnectionManager.subscribe((state) => {
      setConnectionState(state);
      onConnectionChange(state.isConnected);
      
      // Update history when connection changes
      setConnectionHistory(bluetoothConnectionManager.getConnectionHistory());
    });
    
    return unsubscribe;
  }, [onConnectionChange]);

  const handleDeviceConnected = async (device: BluetoothDevice) => {
    try {
      // Start live data collection
      await enhancedOBD2Service.startLiveData();
    } catch (error) {
      console.error('Failed to start live data:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await enhancedOBD2Service.disconnect();
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const handleRefreshState = async () => {
    try {
      await bluetoothConnectionManager.refreshConnectionState();
    } catch (error) {
      console.error('Failed to refresh connection state:', error);
    }
  };

  const clearHistory = () => {
    bluetoothConnectionManager.clearConnectionHistory();
    setConnectionHistory([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Professional Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Bluetooth className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Professional OBD2 Connection</h1>
                  <p className="text-sm text-muted-foreground">Advanced diagnostic adapter connection</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleRefreshState}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <ConnectionStatus 
                onDisconnect={handleDisconnect}
                showDetails={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Connected Device Status */}
          {connectionState.isConnected && connectionState.device && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Connected to {connectionState.device.name}</CardTitle>
                      <CardDescription>
                        {connectionState.device.address} • Professional OBD2 Adapter
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">Active</Badge>
                    <Badge variant="outline">Live Data</Badge>
                    {connectionState.connectionQuality && (
                      <Badge variant="outline" className="capitalize">
                        {connectionState.connectionQuality}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Professional Connection Panel */}
          <ProfessionalConnectionPanel 
            onDeviceConnected={handleDeviceConnected}
            isConnected={connectionState.isConnected}
            currentDevice={connectionState.device}
          />

          {/* Connection History */}
          {connectionHistory.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Connection History
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={clearHistory}>
                    Clear History
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {connectionHistory.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{entry.deviceName}</p>
                        <p className="text-sm text-muted-foreground">{entry.deviceId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {new Date(entry.connectionTime).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant={entry.success ? "default" : "destructive"}>
                            {entry.success ? 'Success' : 'Failed'}
                          </Badge>
                          {entry.dataReceived && (
                            <Badge variant="outline">Data OK</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Professional Features Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Car className="h-5 w-5" />
                  Advanced Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Real-time engine parameters monitoring</li>
                    <li>• Comprehensive trouble code analysis</li>
                    <li>• DPF system diagnostics and regeneration</li>
                    <li>• Advanced vehicle modules testing</li>
                    <li>• Professional diagnostic reports</li>
                    <li>• Multi-protocol support (CAN, K-Line, etc.)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5" />
                  Connection Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Smart device compatibility ranking</li>
                    <li>• Multiple connection strategies</li>
                    <li>• Automatic protocol detection</li>
                    <li>• Connection quality monitoring</li>
                    <li>• Universal adapter support</li>
                    <li>• Professional troubleshooting tools</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Professional Setup Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5" />
                Professional Setup Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Bluetooth className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Quick Professional Setup:</strong>
                    <ol className="mt-2 text-sm space-y-1">
                      <li>1. Connect OBD2 adapter to vehicle's diagnostic port</li>
                      <li>2. Turn on vehicle ignition (engine off is fine for most diagnostics)</li>
                      <li>3. Grant all requested permissions for full functionality</li>
                      <li>4. Use "Find All OBD2 Devices" for comprehensive scanning</li>
                      <li>5. Select highest-rated device for optimal compatibility</li>
                      <li>6. System automatically initializes professional protocols</li>
                    </ol>
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>For Peugeot 307:</strong> The OBD2 port is located under the dashboard, 
                    to the left of the steering wheel. Make sure ignition is ON and engine can be 
                    off for most diagnostic functions. DPF regeneration may require engine running.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Supported Adapters:</strong> ELM327, Vgate iCar, Konnwei KW902, 
                    Veepeak, BAFX Products, Autel, Launch, Foxwell, Ancel, and many more. 
                    The app automatically ranks devices by compatibility.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConnectionsPage;
