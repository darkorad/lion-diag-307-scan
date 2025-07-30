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
import ConnectionTips from './ConnectionTips';

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
                  <h1 className="text-xl font-bold">OBD2 Connection</h1>
                  <p className="text-sm text-muted-foreground">Connect to your vehicle's adapter</p>
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
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-8">
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
                          {connectionState.device.address}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">Active</Badge>
                      {connectionState.connectionQuality && (
                        <Badge variant="outline" className="capitalize">
                          {connectionState.connectionQuality} Quality
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
                    {connectionHistory.slice(0, 3).map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{entry.deviceName}</p>
                          <p className="text-sm text-muted-foreground">{entry.deviceId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            {new Date(entry.connectionTime).toLocaleString()}
                          </p>
                          <Badge variant={entry.success ? "secondary" : "destructive"}>
                            {entry.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <ConnectionTips />

            {/* Professional Features Overview */}
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Car className="h-5 w-5" />
                  Advanced Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">• Real-time engine parameters</li>
                  <li className="flex items-center gap-2">• Read & clear trouble codes (DTCs)</li>
                  <li className="flex items-center gap-2">• DPF system diagnostics</li>
                  <li className="flex items-center gap-2">• Advanced module testing</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionsPage;
