import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { List, ListItem } from '@/components/ui/list';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Car, 
  Bluetooth, 
  Search, 
  Settings,
  BarChart3,
  AlertTriangle,
  Loader2,
  XCircle,
  Gauge,
  Zap,
  FileWarning,
  CheckCircle,
  RefreshCw,
  Wrench,
  ChevronRight,
  Info,
  RotateCw,
  Cpu,
  Thermometer,
  Fuel,
  Activity
} from 'lucide-react';
import { obd2Service } from '@/services/OBD2Service';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

const Diagnostics: React.FC = () => {
  const [liveData, setLiveData] = useState<any[]>([]);
  const [troubleCodes, setTroubleCodes] = useState<any[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [isReadingCodes, setIsReadingCodes] = useState(false);

  const readLiveData = async () => {
    setIsReading(true);
    setLiveData([]);

    try {
      const commonPids = ['010C', '010D', '0105', '0110', '0111'];
      const results = [];

      for (const pid of commonPids) {
        try {
          const response = await obd2Service.sendCommand(`${pid}\r`); // Changed from readPID
          if (response && !response.includes('NO DATA')) {
            results.push({
              pid,
              name: getPidName(pid),
              value: response,
              timestamp: new Date()
            });
          }
        } catch (error) {
          console.warn(`Failed to read PID ${pid}:`, error);
        }
      }

      setLiveData(results);
      toast.success(`Read ${results.length} parameters`);
    } catch (error) {
      console.error('Live data reading failed:', error);
      toast.error('Failed to read live data');
    } finally {
      setIsReading(false);
    }
  };

  const readTroubleCodes = async () => {
    setIsReadingCodes(true);
    setTroubleCodes([]);

    try {
      const response = await obd2Service.sendCommand('03\r'); // Changed from getDTCs
      
      if (response && !response.includes('NO DATA')) {
        // Parse DTC response (simplified)
        const codes = response.split(' ').filter(code => code.length >= 4);
        const formattedCodes = codes.map(code => ({
          code,
          description: `Diagnostic Trouble Code: ${code}`,
          status: 'Active' as const
        }));
        
        setTroubleCodes(formattedCodes);
        toast.success(`Found ${formattedCodes.length} trouble codes`);
      } else {
        toast.success('No trouble codes found');
      }
    } catch (error) {
      console.error('DTC reading failed:', error);
      toast.error('Failed to read trouble codes');
    } finally {
      setIsReadingCodes(false);
    }
  };

  const clearTroubleCodes = async () => {
    try {
      await obd2Service.sendCommand('04\r'); // Changed from clearDTCs
      setTroubleCodes([]);
      toast.success('Trouble codes cleared successfully');
    } catch (error) {
      console.error('Failed to clear codes:', error);
      toast.error('Failed to clear trouble codes');
    }
  };

  const getPidName = (pid: string) => {
    switch (pid) {
      case '010C': return 'Engine RPM';
      case '010D': return 'Vehicle Speed';
      case '0105': return 'Engine Coolant Temperature';
      case '0110': return 'MAF Air Flow Rate';
      case '0111': return 'Throttle Position';
      default: return 'Unknown PID';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Search className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Vehicle Diagnostics
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Run comprehensive diagnostic scans and read real-time engine data.
          </p>
        </div>

        {/* Live Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Live Data
              </span>
              <Button onClick={readLiveData} disabled={isReading} size="sm">
                {isReading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reading...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Read Live Data
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {liveData.length > 0 ? (
              <List>
                {liveData.map((item, index) => (
                  <ListItem key={index} className="flex items-center justify-between">
                    <span>{item.name} ({item.pid})</span>
                    <Badge variant="secondary">{item.value}</Badge>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert>
                <AlertDescription>
                  No live data available. Click "Read Live Data" to fetch real-time engine parameters.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Trouble Codes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Trouble Codes
              </span>
              <div className="flex items-center space-x-2">
                <Button onClick={readTroubleCodes} disabled={isReadingCodes} size="sm">
                  {isReadingCodes ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reading...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Read Codes
                    </>
                  )}
                </Button>
                <Button onClick={clearTroubleCodes} disabled={troubleCodes.length === 0} variant="outline" size="sm">
                  Clear Codes
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {troubleCodes.length > 0 ? (
              <List>
                {troubleCodes.map((code, index) => (
                  <ListItem key={index} className="flex items-center justify-between">
                    <span>{code.code}</span>
                    <Badge variant="destructive">{code.status}</Badge>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert>
                <AlertDescription>
                  No trouble codes found. Click "Read Codes" to scan for diagnostic trouble codes (DTCs).
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Diagnostics;
