
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Database, 
  Settings, 
  Key, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Wrench,
  Activity
} from 'lucide-react';

const PeugeotECUCodingPanel: React.FC = () => {
  const [selectedECU, setSelectedECU] = useState('');
  const [codingData, setCodingData] = useState('');
  const [adaptationValue, setAdaptationValue] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const ecuModules = [
    { id: 'bsi', name: 'BSI (Body Control)', address: '36', functions: ['Configuration', 'Key Programming', 'Service Reset'] },
    { id: 'engine', name: 'Engine ECU', address: '10', functions: ['Injector Coding', 'DPF Parameters', 'Turbo Calibration'] },
    { id: 'abs', name: 'ABS/ESP', address: '20', functions: ['Sensor Calibration', 'Pump Parameters', 'System Configuration'] },
    { id: 'airbag', name: 'Airbag SRS', address: '15', functions: ['Crash Reset', 'Sensor Configuration', 'Component Coding'] },
    { id: 'radio', name: 'Radio/Nav', address: '80', functions: ['Region Coding', 'Feature Activation', 'Display Configuration'] }
  ];

  const adaptationChannels = {
    bsi: [
      { channel: '001', name: 'Central Locking', options: ['Standard', 'Anti-Hijack', 'Selective'] },
      { channel: '002', name: 'Lighting', options: ['Standard', 'Daylight', 'Auto'] },
      { channel: '003', name: 'Windows', options: ['Manual', 'One-Touch', 'Anti-Pinch'] },
      { channel: '004', name: 'Welcome Function', options: ['Off', 'Lighting Only', 'Full Welcome'] }
    ],
    engine: [
      { channel: '010', name: 'Idle Speed', options: ['750 RPM', '800 RPM', '850 RPM'] },
      { channel: '011', name: 'DPF Threshold', options: ['Standard', 'Extended', 'Sport'] },
      { channel: '012', name: 'Turbo Response', options: ['Eco', 'Standard', 'Sport'] },
      { channel: '013', name: 'EGR Strategy', options: ['Standard', 'Reduced', 'Performance'] }
    ],
    radio: [
      { channel: '020', name: 'Region Code', options: ['Europe', 'UK', 'France', 'Germany'] },
      { channel: '021', name: 'Speed Volume', options: ['Off', 'Low', 'Medium', 'High'] },
      { channel: '022', name: 'Parking Aid', options: ['Off', 'Visual', 'Audio', 'Both'] }
    ]
  };

  const codingExamples = {
    bsi: [
      { name: 'Enable Auto-Lock', code: '0101FF', description: 'Automatically lock doors when driving' },
      { name: 'Disable Daytime Running Lights', code: '0201FF', description: 'Turn off DRL function' },
      { name: 'Enable Follow-Me-Home', code: '0301FF', description: 'Keep headlights on after ignition off' }
    ],
    engine: [
      { name: 'Injector Cylinder 1', code: 'IQA001234', description: 'Injector correction code' },
      { name: 'DPF Reset Counter', code: '0F0100', description: 'Reset DPF soot accumulation' },
      { name: 'Turbo Calibration', code: '113200FF', description: 'Reset turbo actuator position' }
    ]
  };

  const performCoding = async () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
    }, 3000);
  };

  const performAdaptation = async () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6" />
          ECU Coding & Adaptation
        </h2>
        <p className="text-muted-foreground">Configure and adapt vehicle control modules</p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>WARNING:</strong> ECU coding and adaptation can permanently alter vehicle behavior. 
          Ensure you have the correct codes and understand the implications before proceeding.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Select ECU Module</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedECU} onValueChange={setSelectedECU}>
            <SelectTrigger>
              <SelectValue placeholder="Choose ECU to configure" />
            </SelectTrigger>
            <SelectContent>
              {ecuModules.map(ecu => (
                <SelectItem key={ecu.id} value={ecu.id}>
                  {ecu.name} (Address: {ecu.address})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedECU && (
        <Tabs defaultValue="coding" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="coding">Coding</TabsTrigger>
            <TabsTrigger value="adaptation">Adaptation</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="coding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  ECU Coding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coding-data">Coding Data (Hex)</Label>
                  <Input
                    id="coding-data"
                    placeholder="Enter coding data (e.g., 0101FF)"
                    value={codingData}
                    onChange={(e) => setCodingData(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="coding-description">Description</Label>
                  <Textarea
                    id="coding-description"
                    placeholder="Describe what this coding does..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={performCoding}
                  disabled={!codingData || isExecuting}
                  className="w-full"
                  variant="destructive"
                >
                  {isExecuting ? 'Coding in Progress...' : 'Apply Coding'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adaptation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Adaptation Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {adaptationChannels[selectedECU as keyof typeof adaptationChannels]?.map((channel, idx) => (
                  <div key={idx} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{channel.name}</p>
                        <p className="text-sm text-muted-foreground">Channel {channel.channel}</p>
                      </div>
                      <Badge variant="outline">Adaptation</Badge>
                    </div>
                    
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select value" />
                      </SelectTrigger>
                      <SelectContent>
                        {channel.options.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      onClick={performAdaptation}
                      disabled={isExecuting}
                      size="sm"
                      className="w-full"
                    >
                      Apply Adaptation
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Common Coding Examples
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {codingExamples[selectedECU as keyof typeof codingExamples]?.map((example, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{example.name}</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setCodingData(example.code)}
                      >
                        Use Code
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{example.description}</p>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {example.code}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PeugeotECUCodingPanel;
