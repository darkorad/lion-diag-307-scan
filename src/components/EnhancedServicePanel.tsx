import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Settings,
  Wrench,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Car,
  Database,
  TestTube,
  Shield,
  Zap,
  Wind,
  OilCan,
  Battery,
  Activity,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';
import { enhancedOBD2Service } from '@/services/EnhancedOBD2Service';
import BackButton from './BackButton';

interface AdvancedServicePanelProps {
  isConnected: boolean;
  onBack?: () => void;
}

interface ServiceExecution {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  startTime: Date;
  endTime?: Date;
}

const AdvancedServicePanel: React.FC<AdvancedServicePanelProps> = ({
  isConnected,
  onBack,
}) => {
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [availableFunctions, setAvailableFunctions] = useState<any[]>([]);
  const [serviceExecutions, setServiceExecutions] = useState<ServiceExecution[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [functionParameters, setFunctionParameters] = useState<{ [key: string]: any }>({});
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadVehicleInfo();
    }
  }, [isConnected]);

  const loadVehicleInfo = async () => {
    try {
      const info = enhancedOBD2Service.getVehicleInfo();
      setVehicleInfo(info);

      const functions = enhancedOBD2Service.getAdvancedFunctions();
      setAvailableFunctions(functions);
    } catch (error) {
      console.error('Failed to load vehicle info:', error);
    }
  };

  const executeFunction = async (functionId: string) => {
    const func = availableFunctions.find((f) => f.id === functionId);
    if (!func) {
      toast.error('Function not found');
      return;
    }

    if (func.riskLevel === 'high') {
      const confirmed = window.confirm(
        `⚠️ HIGH RISK OPERATION\n\n${func.name}\n${func.description}\n\nThis operation can potentially damage your vehicle or affect safety systems. Are you sure you want to continue?`,
      );
      if (!confirmed) return;
    }

    setIsExecuting(true);
    const execution: ServiceExecution = {
      id: Date.now().toString(),
      name: func.name,
      status: 'running',
      progress: 0,
      startTime: new Date(),
    };

    setServiceExecutions((prev) => [...prev, execution]);

    try {
      toast.info(`Starting ${func.name}...`);

      const progressInterval = setInterval(() => {
        setServiceExecutions((prev) =>
          prev.map((exec) =>
            exec.id === execution.id
              ? { ...exec, progress: Math.min(exec.progress + 10, 90) }
              : exec,
          ),
        );
      }, 500);

      const result = await enhancedOBD2Service.executeAdvancedFunction(functionId);

      clearInterval(progressInterval);

      setServiceExecutions((prev) =>
        prev.map((exec) =>
          exec.id === execution.id
            ? {
                ...exec,
                status: result.success ? 'completed' : 'failed',
                progress: 100,
                result: result.result,
                error: result.error,
                endTime: new Date(),
              }
            : exec,
        ),
      );

      if (result.success) {
        toast.success(`${func.name} completed successfully`);
      } else {
        toast.error(`${func.name} failed: ${result.error}`);
      }
    } catch (error) {
      setServiceExecutions((prev) =>
        prev.map((exec) =>
          exec.id === execution.id
            ? {
                ...exec,
                status: 'failed',
                progress: 100,
                error: error instanceof Error ? error.message : 'Unknown error',
                endTime: new Date(),
              }
            : exec,
        ),
      );
      toast.error(`Function failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRiskVariant = (level: string) => {
    switch (level) {
      case 'low':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'high':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      service: Wrench,
      adaptation: Settings,
      calibration: Target,
      testing: TestTube,
      security: Shield,
      emissions: Wind,
      fuel: OilCan,
      electrical: Zap,
      brakes: Car,
      engine: Activity,
      hybrid: Battery,
      comfort: Settings,
      coding: Database,
      reset: RefreshCw,
    };
    return icons[category] || Settings;
  };

  const groupedFunctions = availableFunctions.reduce((acc, func) => {
    if (!acc[func.category]) acc[func.category] = [];
    acc[func.category].push(func);
    return acc;
  }, {} as { [key: string]: any[] });

  const categories = Object.keys(groupedFunctions);

  return (
    <div className="space-y-4 p-2 sm:p-4">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <BackButton
          onBack={onBack}
          fallbackRoute="/professional-diagnostics"
          variant="ghost"
          size="sm"
          label="Back"
          showIcon={true}
        />
        <div className="h-6 w-px bg-border" />
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Advanced Service Functions</h1>
      </div>

      {/* Vehicle Info */}
      {vehicleInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Manufacturer</p>
                <p className="text-sm font-semibold">{vehicleInfo.manufacturer || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Model</p>
                <p className="text-sm font-semibold">{vehicleInfo.model || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">VIN</p>
                <p className="text-xs font-mono">{vehicleInfo.vin || 'Not detected'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Available Functions</p>
                <p className="text-sm font-semibold">{availableFunctions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Executions */}
      {serviceExecutions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5" />
              Service Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {serviceExecutions.slice(-3).map((execution) => (
                <div key={execution.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {execution.status === 'running' && <RefreshCw className="h-4 w-4 animate-spin" />}
                      {execution.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {execution.status === 'failed' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      <span className="text-sm font-medium">{execution.name}</span>
                    </div>
                    <Badge
                      variant={
                        execution.status === 'completed'
                          ? 'default'
                          : execution.status === 'failed'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {execution.status}
                    </Badge>
                  </div>
                  <Progress value={execution.progress} className="w-full" />
                  {execution.error && <p className="text-xs text-red-500">{execution.error}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Function Categories */}
      {categories.length > 0 && (
        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
            {categories.slice(0, 6).map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize text-xs">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {groupedFunctions[category].map((func) => {
                  const Icon = getCategoryIcon(func.category);
                  const execution = serviceExecutions.find((e) => e.name === func.name);

                  return (
                    <Card key={func.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <div className="min-w-0">
                              <CardTitle className="text-base leading-tight">{func.name}</CardTitle>
                              <p className="text-xs text-muted-foreground mt-1 break-words">
                                {func.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            <Badge variant={getRiskVariant(func.riskLevel || 'low')} className="text-xs">
                              {(func.riskLevel || 'low').toUpperCase()}
                            </Badge>
                            {func.requiresPin && (
                              <Badge variant="outline" className="text-xs">
                                PIN Required
                              </Badge>
                            )}
                            {func.manufacturer && (
                              <Badge variant="outline" className="text-xs">
                                {func.manufacturer}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {func.parameters && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">Parameters:</h4>
                            {Object.entries(func.parameters).map(([key]) => (
                              <div key={key} className="space-y-1">
                                <Label className="text-xs capitalize">{key.replace(/_/g, ' ')}</Label>
                                <Input
                                  type="text"
                                  placeholder={`Enter ${key}`}
                                  className="text-sm"
                                  onChange={(e) =>
                                    setFunctionParameters((prev) => ({
                                      ...prev,
                                      [func.id]: {
                                        ...prev[func.id],
                                        [key]: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {execution && (
                          <Alert>
                            <div className="flex items-center gap-2">
                              {execution.status === 'completed' ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : execution.status === 'failed' ? (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              ) : (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              )}
                              <AlertDescription>
                                <div>
                                  <p className="text-sm font-medium">
                                    {execution.status === 'completed'
                                      ? 'Success'
                                      : execution.status === 'failed'
                                      ? 'Failed'
                                      : 'Running'}
                                  </p>
                                  <p className="text-xs">
                                    {execution.endTime?.toLocaleString() || 'In progress...'}
                                  </p>
                                </div>
                              </AlertDescription>
                            </div>
                          </Alert>
                        )}

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <span className="text-xs text-muted-foreground">Category: {func.category}</span>
                          <Button
                            onClick={() => executeFunction(func.id)}
                            disabled={!isConnected || isExecuting}
                            variant={func.riskLevel === 'high' ? 'destructive' : 'default'}
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            Execute
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {!isConnected && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Connect to vehicle to access advanced service functions.</strong>
            <br />
            Advanced functions require active OBD2 connection and may need specific capabilities.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AdvancedServicePanel;
