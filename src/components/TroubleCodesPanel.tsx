
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Wrench, 
  Search,
  Trash2,
  Download,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

interface TroubleCodesPanelProps {
  isConnected: boolean;
  onBack?: () => void;
}

interface TroubleCode {
  id: string;
  code: string;
  status: 'active' | 'pending' | 'stored' | 'permanent';
  description: string;
  system: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  firstDetected: string;
  freezeFrameData?: any;
  symptoms?: string[];
  possibleCauses?: string[];
  repairSuggestions?: string[];
}

const TroubleCodesPanel: React.FC<TroubleCodesPanelProps> = ({ isConnected, onBack }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [activeCodes, setActiveCodes] = useState<TroubleCode[]>([
    {
      id: '1',
      code: 'P0401',
      status: 'active',
      description: 'Exhaust Gas Recirculation Flow Insufficient Detected',
      system: 'Emission Control',
      severity: 'medium',
      firstDetected: '2024-01-15 14:30',
      symptoms: ['Rough idle', 'Engine knock', 'Increased emissions'],
      possibleCauses: ['Clogged EGR valve', 'EGR valve stuck closed', 'Carbon buildup in intake'],
      repairSuggestions: ['Clean EGR valve', 'Check vacuum lines', 'Inspect intake manifold']
    }
  ]);

  const [pendingCodes, setPendingCodes] = useState<TroubleCode[]>([
    {
      id: '2',
      code: 'P2002',
      status: 'pending',
      description: 'Diesel Particulate Filter Efficiency Below Threshold',
      system: 'Emission Control',
      severity: 'high',
      firstDetected: '2024-01-20 09:15',
      symptoms: ['DPF warning light', 'Reduced power', 'Engine in limp mode'],
      possibleCauses: ['DPF clogged with soot', 'DPF temperature sensor fault', 'Incomplete regeneration cycles'],
      repairSuggestions: ['Perform forced DPF regeneration', 'Replace DPF if severely clogged', 'Check DPF sensors']
    }
  ]);

  const [storedCodes, setStoredCodes] = useState<TroubleCode[]>([]);

  const peugeotSpecificCodes = [
    { code: 'P1336', description: 'Crankshaft Position Sensor Circuit Performance' },
    { code: 'P1351', description: 'Ignition Coil A Primary Circuit' },
    { code: 'P1407', description: 'Exhaust Gas Recirculation Flow Malfunction' },
    { code: 'P1425', description: 'Tank Ventilation Valve Circuit' },
    { code: 'P1471', description: 'EVAP Emission Control System' },
    { code: 'P2563', description: 'Turbocharger Boost Control Position Sensor' },
    { code: 'P2564', description: 'Turbocharger Boost Control Position Sensor Performance' }
  ];

  const handleScanCodes = async () => {
    setIsScanning(true);
    toast.info('Scanning for trouble codes...');

    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    const scanResults = Math.random() > 0.5 ? 1 : 0; // Randomly find codes or not
    
    if (scanResults > 0) {
      toast.success(`Found ${activeCodes.length + pendingCodes.length} trouble codes`);
    } else {
      toast.success('No new trouble codes found');
    }
    
    setIsScanning(false);
  };

  const handleClearCodes = async (type: 'active' | 'pending' | 'stored' | 'all') => {
    toast.info('Clearing trouble codes...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    switch (type) {
      case 'active':
        setActiveCodes([]);
        break;
      case 'pending':
        setPendingCodes([]);
        break;
      case 'stored':
        setStoredCodes([]);
        break;
      case 'all':
        setActiveCodes([]);
        setPendingCodes([]);
        setStoredCodes([]);
        break;
    }
    
    toast.success('Trouble codes cleared successfully');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-automotive-critical bg-red-500/10 border-red-500/20';
      case 'high': return 'text-automotive-warning bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-automotive-success bg-green-500/10 border-green-500/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const CodeCard = ({ code }: { code: TroubleCode }) => (
    <Card className={`diagnostic-border ${getSeverityColor(code.severity)}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getSeverityIcon(code.severity)}
            <div>
              <CardTitle className="text-lg">{code.code}</CardTitle>
              <Badge variant="outline" className="mt-1 text-xs">
                {code.system}
              </Badge>
            </div>
          </div>
          <Badge variant={code.status === 'active' ? 'destructive' : 'secondary'}>
            {code.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm font-medium">{code.description}</p>
        
        <div className="text-xs text-muted-foreground">
          First detected: {code.firstDetected}
        </div>

        {code.symptoms && (
          <div>
            <p className="text-sm font-semibold mb-2">Symptoms:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {code.symptoms.map((symptom, index) => (
                <li key={index}>• {symptom}</li>
              ))}
            </ul>
          </div>
        )}

        {code.possibleCauses && (
          <div>
            <p className="text-sm font-semibold mb-2">Possible Causes:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {code.possibleCauses.map((cause, index) => (
                <li key={index}>• {cause}</li>
              ))}
            </ul>
          </div>
        )}

        {code.repairSuggestions && (
          <div>
            <p className="text-sm font-semibold mb-2">Repair Suggestions:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {code.repairSuggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      {onBack && (
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-2xl font-bold">Diagnostic Trouble Codes</h1>
        </div>
      )}
      {/* Control Panel */}
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <span>Diagnostic Trouble Codes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleScanCodes}
                disabled={!isConnected || isScanning}
                variant="default"
                size="sm"
              >
                <Search className="h-4 w-4 mr-1" />
                {isScanning ? 'Scanning...' : 'Scan Codes'}
              </Button>
              <Button
                onClick={() => handleClearCodes('all')}
                disabled={!isConnected}
                variant="outline"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-automotive-critical">{activeCodes.length}</p>
              <p className="text-sm text-muted-foreground">Active Codes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-automotive-warning">{pendingCodes.length}</p>
              <p className="text-sm text-muted-foreground">Pending Codes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-foreground">{storedCodes.length}</p>
              <p className="text-sm text-muted-foreground">Stored Codes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-automotive-success">0</p>
              <p className="text-sm text-muted-foreground">Permanent Codes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" className="flex items-center space-x-1">
            <XCircle className="h-4 w-4" />
            <span>Active ({activeCodes.length})</span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>Pending ({pendingCodes.length})</span>
          </TabsTrigger>
          <TabsTrigger value="stored" className="flex items-center space-x-1">
            <AlertTriangle className="h-4 w-4" />
            <span>Stored ({storedCodes.length})</span>
          </TabsTrigger>
          <TabsTrigger value="reference" className="flex items-center space-x-1">
            <Wrench className="h-4 w-4" />
            <span>Reference</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeCodes.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Active Trouble Codes</h3>
                <Button
                  onClick={() => handleClearCodes('active')}
                  disabled={!isConnected}
                  variant="outline"
                  size="sm"
                >
                  Clear Active Codes
                </Button>
              </div>
              {activeCodes.map((code) => (
                <CodeCard key={code.id} code={code} />
              ))}
            </div>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No active trouble codes found. Your vehicle's systems are operating normally.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingCodes.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Pending Trouble Codes</h3>
                <Button
                  onClick={() => handleClearCodes('pending')}
                  disabled={!isConnected}
                  variant="outline"
                  size="sm"
                >
                  Clear Pending Codes
                </Button>
              </div>
              {pendingCodes.map((code) => (
                <CodeCard key={code.id} code={code} />
              ))}
            </div>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No pending trouble codes found.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="stored" className="space-y-4">
          {storedCodes.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Stored Trouble Codes</h3>
                <Button
                  onClick={() => handleClearCodes('stored')}
                  disabled={!isConnected}
                  variant="outline"
                  size="sm"
                >
                  Clear Stored Codes
                </Button>
              </div>
              {storedCodes.map((code) => (
                <CodeCard key={code.id} code={code} />
              ))}
            </div>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No stored trouble codes found.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="reference" className="space-y-4">
          <Card className="diagnostic-border">
            <CardHeader>
              <CardTitle>Peugeot 307 HDI Specific Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {peugeotSpecificCodes.map((code, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/20 border border-muted/30">
                    <Badge variant="outline" className="shrink-0">
                      {code.code}
                    </Badge>
                    <p className="text-sm">{code.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="diagnostic-border">
            <CardHeader>
              <CardTitle>DPF Related Codes (1.6 HDI)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <Badge variant="outline" className="mb-2">P2002</Badge>
                  <p className="text-sm font-medium">Diesel Particulate Filter Efficiency Below Threshold</p>
                  <p className="text-xs text-muted-foreground mt-1">Common on 1.6 HDI engines with short-distance driving</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <Badge variant="outline" className="mb-2">P2463</Badge>
                  <p className="text-sm font-medium">Diesel Particulate Filter Restriction - Soot Accumulation</p>
                  <p className="text-xs text-muted-foreground mt-1">Requires DPF regeneration or replacement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TroubleCodesPanel;
