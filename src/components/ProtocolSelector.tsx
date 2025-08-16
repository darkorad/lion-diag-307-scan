import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Settings,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface ProtocolSelectorProps {
  onProtocolSelected: (protocol: string) => void;
  currentProtocol: string;
  elmVersion?: string;
  isConnected: boolean;
}

const ProtocolSelector: React.FC<ProtocolSelectorProps> = ({
  onProtocolSelected,
  currentProtocol,
  elmVersion,
  isConnected
}) => {
  const [selectedProtocol, setSelectedProtocol] = useState(currentProtocol);

  const protocols = {
    '0': { name: 'Automatic (auto-detection)', recommended: true, description: 'Let ELM327 detect the protocol automatically' },
    '1': { name: 'SAE J1850 PWM (41.6 Kbaud)', recommended: false, description: 'Older Ford vehicles' },
    '2': { name: 'SAE J1850 VPWM (10.4 Kbaud)', recommended: false, description: 'Older GM vehicles' },
    '3': { name: 'ISO 9141 (5 baud initialization)', recommended: false, description: 'European vehicles 1996-2003' },
    '4': { name: 'ISO 14230-4 (5 baud init)', recommended: false, description: 'KWP2000 slow init' },
    '5': { name: 'ISO 14230-4 (fast init)', recommended: false, description: 'KWP2000 fast init' },
    '6': { name: 'ISO 15765-4 (11 bit ID, 500 Kbaud)', recommended: true, description: 'CAN-BUS 11 bit, 500K' },
    '7': { name: 'ISO 15765-4 (29 bit ID, 500 Kbaud)', recommended: true, description: 'CAN-BUS 29 bit, 500K' },
    '8': { name: 'ISO 15765-4 (11 bit ID, 250 Kbaud)', recommended: false, description: 'CAN-BUS 11 bit, 250K' },
    '9': { name: 'ISO 15765-4 (29 bit ID, 250 Kbaud)', recommended: false, description: 'CAN-BUS 29 bit, 250K' }
  };

  const handleProtocolChange = (protocol: string) => {
    setSelectedProtocol(protocol);
    onProtocolSelected(protocol);
  };

  const getProtocolBadge = (protocol: string) => {
    const info = protocols[protocol as keyof typeof protocols];
    if (!info) return null;
    
    if (info.recommended) {
      return <Badge className="ml-2 bg-green-100 text-green-800">Recommended</Badge>;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Protocol Selection
        </CardTitle>
        {elmVersion && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            ELM Version: {elmVersion}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Protocol:</strong> {protocols[currentProtocol as keyof typeof protocols]?.name || 'Unknown'}
          </AlertDescription>
        </Alert>

        <RadioGroup 
          value={selectedProtocol} 
          onValueChange={handleProtocolChange}
          className="space-y-3"
        >
          {Object.entries(protocols).map(([value, info]) => (
            <div key={value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50">
              <RadioGroupItem value={value} id={value} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={value} className="flex items-center cursor-pointer">
                  <span className="font-medium">{info.name}</span>
                  {getProtocolBadge(value)}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {info.description}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>

        {selectedProtocol !== currentProtocol && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Protocol change will be applied on next connection. Disconnect and reconnect to use the new protocol.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use "Automatic" for most vehicles (recommended)</li>
            <li>European vehicles often use CAN-BUS protocols (6, 7)</li>
            <li>Older vehicles may need ISO protocols (3, 4, 5)</li>
            <li>If connection fails, try manual protocol selection</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProtocolSelector;