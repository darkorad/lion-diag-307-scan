import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Wrench, 
  AlertTriangle, 
  Activity, 
  Database, 
  TestTube, 
  Settings,
  Car,
  Zap,
  Monitor,
  FileText,
  Gauge
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LexiaDiagboxEmulator from '@/components/LexiaDiagboxEmulator';
import DTCPanel from '@/components/DTCPanel';
import LiveDataMonitor from '@/components/LiveDataMonitor';
import { AdvancedDiagnosticsPanel } from '@/components/AdvancedDiagnosticsPanel';
import BiDirectionalControlPanel from '@/components/BiDirectionalControlPanel';
import AdvancedServicePanel from '@/components/AdvancedServicePanel';
import VehicleTestingPanel from '@/components/VehicleTestingPanel';

type DiagnosticView = 
  | 'main' 
  | 'diagbox' 
  | 'dtc' 
  | 'live-data' 
  | 'advanced' 
  | 'bidirectional' 
  | 'service' 
  | 'testing';

const ProfessionalDiagnostics: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<DiagnosticView>('main');
  const [isConnected] = useState(true); // Simulate connection for demonstration

  const handleBackToMain = () => {
    navigate('/');
  };

  const handleBackToMenu = () => {
    setCurrentView('main');
  };

  if (currentView === 'diagbox') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <Button 
            variant="ghost" 
            onClick={handleBackToMenu}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Professional Diagnostics
          </Button>
          <LexiaDiagboxEmulator isConnected={isConnected} />
        </div>
      </div>
    );
  }

  if (currentView === 'dtc') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <DTCPanel 
            isConnected={isConnected}
            onBack={handleBackToMenu}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'live-data') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <Button 
            variant="ghost" 
            onClick={handleBackToMenu}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Professional Diagnostics
          </Button>
          <LiveDataMonitor 
            isConnected={isConnected}
            vehicleInfo={{ make: 'Generic', model: 'OBD2' }}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'advanced') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <Button 
            variant="ghost" 
            onClick={handleBackToMenu}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Professional Diagnostics
          </Button>
          <AdvancedDiagnosticsPanel 
            isConnected={isConnected}
            vehicleInfo={{ make: 'Generic', model: 'OBD2' }}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'bidirectional') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <Button 
            variant="ghost" 
            onClick={handleBackToMenu}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Professional Diagnostics
          </Button>
          <BiDirectionalControlPanel 
            isConnected={isConnected}
            vehicleMake="Generic"
            vehicleModel="OBD2"
          />
        </div>
      </div>
    );
  }

  if (currentView === 'service') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <AdvancedServicePanel 
            isConnected={isConnected}
            onBack={handleBackToMenu}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'testing') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <Button 
            variant="ghost" 
            onClick={handleBackToMenu}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Professional Diagnostics
          </Button>
          <VehicleTestingPanel 
            isConnected={isConnected}
            vehicleInfo={{ make: 'Generic', model: 'OBD2' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToMain}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Main Menu</span>
            </Button>
          </div>
          <Badge variant="default" className="bg-green-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary">Professional OBD2 Diagnostics</h1>
            <p className="text-muted-foreground">
              Complete diagnostic suite with advanced features, manufacturer-specific functions, and professional-grade tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Fault Code Diagnostics */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('dtc')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <span>Fault Code Diagnostics</span>
                </CardTitle>
                <CardDescription>
                  Read, analyze, and clear diagnostic trouble codes from all vehicle systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Standard DTCs</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Manufacturer DTCs</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Pending/Permanent</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Data Monitoring */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('live-data')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-6 w-6 text-blue-500" />
                  <span>Live Data Monitoring</span>
                </CardTitle>
                <CardDescription>
                  Real-time monitoring of all vehicle parameters with graphing and logging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Standard PIDs</span>
                    <Badge variant="default">✓ 200+ PIDs</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Manufacturer PIDs</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Data Logging</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagbox Professional */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('diagbox')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-6 w-6 text-purple-500" />
                  <span>Diagbox Professional</span>
                </CardTitle>
                <CardDescription>
                  Professional diagnostic interface with advanced features and manufacturer protocols
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>All Manufacturers</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Bi-directional</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Coding/Programming</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Diagnostics */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('advanced')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-6 w-6 text-green-500" />
                  <span>Advanced Diagnostics</span>
                </CardTitle>
                <CardDescription>
                  Professional-grade diagnostics with comprehensive vehicle system analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>All ECU Systems</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>System Testing</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Service Functions</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bi-directional Controls */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('bidirectional')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-6 w-6 text-yellow-500" />
                  <span>Bi-directional Controls</span>
                </CardTitle>
                <CardDescription>
                  Active component testing and actuator control for all vehicle systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Component Testing</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Actuator Control</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Safety Monitoring</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Functions */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('service')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wrench className="h-6 w-6 text-orange-500" />
                  <span>Service Functions</span>
                </CardTitle>
                <CardDescription>
                  Professional service procedures, resets, adaptations, and calibrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Service Resets</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Adaptations</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Calibrations</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Testing */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('testing')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="h-6 w-6 text-cyan-500" />
                  <span>Vehicle Testing</span>
                </CardTitle>
                <CardDescription>
                  Comprehensive vehicle system testing and component validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>System Tests</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Component Tests</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Performance Tests</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ECU Programming */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('advanced')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-6 w-6 text-indigo-500" />
                  <span>ECU Programming</span>
                </CardTitle>
                <CardDescription>
                  ECU coding, programming, and configuration for all vehicle systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>ECU Coding</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Key Programming</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Module Config</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Analysis */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('live-data')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gauge className="h-6 w-6 text-pink-500" />
                  <span>Data Analysis</span>
                </CardTitle>
                <CardDescription>
                  Advanced data analysis, trending, and diagnostic reporting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Live Graphing</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Data Logging</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Report Generation</span>
                    <Badge variant="default">✓ Supported</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">Professional Features Include:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
              <div>• 500+ Standard OBD2 PIDs</div>
              <div>• Manufacturer-Specific PIDs</div>
              <div>• All DTC Types (Current/Pending/Permanent)</div>
              <div>• Bi-directional Component Testing</div>
              <div>• DPF Regeneration & Monitoring</div>
              <div>• Service Light Resets</div>
              <div>• ECU Coding & Programming</div>
              <div>• Actuator Testing</div>
              <div>• Live Data Graphing</div>
              <div>• Data Logging & Export</div>
              <div>• Multi-System Diagnostics</div>
              <div>• Professional Reporting</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDiagnostics;
