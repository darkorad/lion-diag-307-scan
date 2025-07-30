import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  Search, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Globe,
  Router
} from 'lucide-react';
import { wifiOBD2Service } from '@/services/WiFiOBD2Service';
import { OBD2Adapter } from '@/types/adapters';
import { useToast } from '@/hooks/use-toast';

interface WiFiConnectionPanelProps {
  onConnected: (config: { ip: string; port: number; timeout: number }) => void;
  isConnected: boolean;
  selectedAdapter?: OBD2Adapter | null;
}

const WiFiConnectionPanel: React.FC<WiFiConnectionPanelProps> = ({
  onConnected,
  isConnected,
  selectedAdapter
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [discoveredAdapters, setDiscoveredAdapters] = useState<string[]>([]);
  const [manualIP, setManualIP] = useState('');
  const [manualPort, setManualPort] = useState('35000');
  const [connectionMethod, setConnectionMethod] = useState<'auto' | 'manual'>('auto');
  const { toast } = useToast();

  useEffect(() => {
    // Pre-fill with adapter defaults if selected
    if (selectedAdapter) {
      setManualIP(selectedAdapter.defaultIP || '192.168.0.10');
      setManualPort(String(selectedAdapter.defaultPort || 35000));
    }
  }, [selectedAdapter]);

  const handleScanForAdapters = async () => {
    setIsScanning(true);
    try {
      const adapters = await wifiOBD2Service.scanForAdapters();
      setDiscoveredAdapters(adapters);
      
      toast({
        title: "Scan Complete",
        description: `Found ${adapters.length} WiFi adapter(s)`,
      });

      if (adapters.length === 0) {
        toast({
          title: "No Adapters Found",
          description: "Try manual connection or check your WiFi settings",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('WiFi scan failed:', error);
      toast({
        title: "Scan Failed",
        description: "Unable to scan for WiFi adapters",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = async (ip?: string, port?: number) => {
    setIsConnecting(true);
    
    const connectionConfig = {
      ip: ip || manualIP,
      port: port || parseInt(manualPort),
      timeout: 10000
    };

    try {
      // Try WebSocket connection first
      try {
        await wifiOBD2Service.connect(connectionConfig);
        toast({
          title: "Connected",
          description: `Connected to WiFi adapter at ${connectionConfig.ip}:${connectionConfig.port}`,
        });
      } catch (wsError) {
        // Fallback to HTTP connection
        console.log('WebSocket failed, trying HTTP...');
        await wifiOBD2Service.connectHTTP(connectionConfig);
        toast({
          title: "Connected (HTTP)",
          description: `Connected via HTTP to ${connectionConfig.ip}:${connectionConfig.port}`,
        });
      }
      
      onConnected(connectionConfig);
    } catch (error) {
      console.error('WiFi connection failed:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to WiFi adapter",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleQuickConnect = (adapterString: string) => {
    const [ip, port] = adapterString.split(':');
    handleConnect(ip, parseInt(port));
  };

  const commonAdapters = [
    { ip: '192.168.0.10', port: 35000, name: 'ELM327 WiFi (Default)' },
    { ip: '192.168.4.1', port: 35000, name: 'ELM327 Hotspot Mode' },
    { ip: '192.168.1.5', port: 35000, name: 'Alternative Config' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-green-500" />
            WiFi Connection
          </CardTitle>
          <CardDescription>
            Connect to your WiFi-enabled OBD2 adapter wirelessly
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Connection Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auto Discovery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5" />
              Auto Discovery
            </CardTitle>
            <CardDescription>
              Automatically scan for available WiFi adapters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleScanForAdapters}
              disabled={isScanning || isConnected}
              className="w-full"
            >
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Scan for Adapters
                </>
              )}
            </Button>

            {discoveredAdapters.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Found Adapters:</h4>
                {discoveredAdapters.map((adapter, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Router className="h-4 w-4 text-green-500" />
                        <span className="font-mono text-sm">{adapter}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleQuickConnect(adapter)}
                        disabled={isConnecting || isConnected}
                      >
                        {isConnecting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Connect'
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5" />
              Manual Connection
            </CardTitle>
            <CardDescription>
              Enter your adapter's IP address and port manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ip">IP Address</Label>
                <Input
                  id="ip"
                  placeholder="192.168.0.10"
                  value={manualIP}
                  onChange={(e) => setManualIP(e.target.value)}
                  disabled={isConnected}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  placeholder="35000"
                  value={manualPort}
                  onChange={(e) => setManualPort(e.target.value)}
                  disabled={isConnected}
                />
              </div>
            </div>

            <Button 
              onClick={() => handleConnect()}
              disabled={!manualIP || !manualPort || isConnecting || isConnected}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : isConnected ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Connected
                </>
              ) : (
                'Connect'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Connect Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Connect</CardTitle>
          <CardDescription>
            Common WiFi adapter configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {commonAdapters.map((adapter, index) => (
              <Card key={index} className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="space-y-2">
                  <h4 className="font-medium">{adapter.name}</h4>
                  <p className="text-sm text-muted-foreground font-mono">
                    {adapter.ip}:{adapter.port}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleConnect(adapter.ip, adapter.port)}
                    disabled={isConnecting || isConnected}
                  >
                    Quick Connect
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connection Instructions */}
      <Alert>
        <Wifi className="h-4 w-4" />
        <AlertDescription>
          <strong>WiFi Connection Steps:</strong>
          <ol className="mt-2 text-sm space-y-1 list-decimal list-inside">
            <li>Ensure your WiFi OBD2 adapter is powered on and connected to your vehicle</li>
            <li>Connect your device to the adapter's WiFi network (usually "WiFi_OBDII" or similar)</li>
            <li>Use the scan function or manually enter the adapter's IP address</li>
            <li>Most adapters use IP 192.168.0.10 or 192.168.4.1 with port 35000</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Adapter-specific Instructions */}
      {selectedAdapter && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedAdapter.name} Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Default Configuration:</strong></p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• IP Address: {selectedAdapter.defaultIP || '192.168.0.10'}</li>
              <li>• Port: {selectedAdapter.defaultPort || 35000}</li>
              <li>• Connection: WiFi Direct or Hotspot mode</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WiFiConnectionPanel;