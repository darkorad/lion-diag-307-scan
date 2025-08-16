
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
  const [isConnected] = useState(true);

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToMenu}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Professional Diagnostics</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToMenu}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Professional Diagnostics</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToMenu}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Professional Diagnostics</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToMenu}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Professional Diagnostics</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToMenu}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Professional Diagnostics</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
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
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToMain}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Main Menu</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
          <Badge variant="default" className="bg-green-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Professional OBD2 Diagnostics</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Complete diagnostic suite with advanced features and professional-grade tools
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Fault Code Diagnostics */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('dtc')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span>Fault Code Diagnostics</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Read, analyze, and clear diagnostic trouble codes
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Standard DTCs</span>
                    <Badge variant="default" className="text-xs">✓</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Manufacturer DTCs</span>
                    <Badge variant="default" className="text-xs">✓</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Data Monitoring */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('live-data')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                  <Activity className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <span>Live Data Monitoring</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Real-time monitoring of vehicle parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Standard PIDs</span>
                    <Badge variant="default" className="text-xs">200+</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Data Logging</span>
                    <Badge variant="default" className="text-xs">✓</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bi-directional Controls */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('bidirectional')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                  <Zap className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <span>Bi-directional Controls</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Active component testing and control
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Component Testing</span>
                    <Badge variant="default" className="text-xs">✓</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Safety Monitoring</span>
                    <Badge variant="default" className="text-xs">✓</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Functions */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('service')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                  <Wrench className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  <span>Service Functions</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Service procedures and resets
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Service Resets</span>
                    <Badge variant="default" className="text-xs">✓</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Adaptations</span>
                    <Badge variant="default" className="text-xs">✓</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Diagnostics */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('advanced')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                  <Database className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>Advanced Diagnostics</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Professional-grade system analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>All ECU Systems</span>
                    <Badge variant="default" className="text-xs">✓</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>System Testing</span>
                    <Badge variant="default" className="text-xs">✓</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Testing */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('testing')}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                  <TestTube className="h-5 w-5 text-cyan-500 flex-shrink-0" />
                  <span>Vehicle Testing</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Comprehensive system testing
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>System Tests</span>
                    <Badge variant="default" className="text-xs">✓</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Performance Tests</span>
                    <Badge variant="default" className="text-xs">✓</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Professional Features Include:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs sm:text-sm">
              <div>• 500+ Standard OBD2 PIDs</div>
              <div>• Manufacturer-Specific PIDs</div>
              <div>• All DTC Types</div>
              <div>• Bi-directional Testing</div>
              <div>• DPF Regeneration</div>
              <div>• Service Light Resets</div>
              <div>• ECU Coding</div>
              <div>• Live Data Graphing</div>
              <div>• Data Logging & Export</div>
              <div>• Multi-System Diagnostics</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDiagnostics;
