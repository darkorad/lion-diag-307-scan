import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Car, 
  Bluetooth, 
  Settings, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Wifi,
  Battery,
  Thermometer,
  Gauge,
  Wrench,
  FileText,
  Shield
} from 'lucide-react';
import ConnectionStatus from './ConnectionStatus';
import VehicleInfoPanel from './VehicleInfoPanel';
import LiveDataPanel from './LiveDataPanel';
import DTCPanel from './DTCPanel';
import { AdvancedDiagnosticsPanel } from './AdvancedDiagnosticsPanel';
import { useQuery } from '@tanstack/react-query';

interface DashboardProps {
  isConnected: boolean;
  connectionStrength: number;
  vehicleData: any;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
}

const Dashboard: React.FC<DashboardProps> = ({
  isConnected,
  connectionStrength,
  vehicleData,
  onConnect,
  onDisconnect,
}) => {
  const [activePanel, setActivePanel] = useState<string>('overview');

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Universal OBD2 Tool</h1>
        <p className="text-xl text-muted-foreground">Professional OBD2 Diagnostic Tool</p>
      </div>

      {/* Connection Status */}
      <ConnectionStatus
        onDisconnect={onDisconnect}
        showDetails={true}
      />

      {!isConnected ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Bluetooth className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Connect to Vehicle</h3>
                <p className="text-muted-foreground">
                  Connect your OBD2 adapter to start diagnostics
                </p>
              </div>
              <Button onClick={onConnect} size="lg">
                <Bluetooth className="mr-2 h-4 w-4" />
                Connect Now
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Engine Status</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">Running</div>
                  <p className="text-xs text-muted-foreground">Normal operation</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Engine Temp</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">87°C</div>
                  <p className="text-xs text-muted-foreground">Optimal range</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  <Gauge className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">RPM</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">850</div>
                  <p className="text-xs text-muted-foreground">Idle speed</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">DTC Count</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">No errors</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VehicleInfoPanel isConnected={isConnected} />
            <LiveDataPanel isConnected={isConnected} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DTCPanel isConnected={isConnected} />
            <AdvancedDiagnosticsPanel isConnected={isConnected} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
