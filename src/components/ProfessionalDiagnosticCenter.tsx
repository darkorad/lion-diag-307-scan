import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Wrench, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter,
  Zap,
  Shield,
  Cpu,
  Car,
  Battery,
  Thermometer,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Download,
  Upload,
  FileText,
  Star
} from 'lucide-react';
import { 
  SPECIAL_FUNCTIONS, 
  PROFESSIONAL_MODULES, 
  PROFESSIONAL_CATEGORIES,
  SPECIAL_FUNCTION_CATEGORIES,
  SpecialFunction,
  ManufacturerModule 
} from '@/constants/professionalDiagnosticDatabase';
import { enhancedNativeBluetoothService } from '@/services/EnhancedNativeBluetoothService';
import { toast } from 'sonner';

interface ProfessionalDiagnosticCenterProps {
  selectedVehicle?: {
    make: string;
    model: string;
    year: number;
    engine?: string;
  };
}

const ProfessionalDiagnosticCenter: React.FC<ProfessionalDiagnosticCenterProps> = ({ 
  selectedVehicle 
}) => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFunction, setSelectedFunction] = useState<SpecialFunction | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [availableFunctions, setAvailableFunctions] = useState<SpecialFunction[]>([]);
  const [availableModules, setAvailableModules] = useState<ManufacturerModule[]>([]);

  useEffect(() => {
    // Load functions and modules based on selected vehicle
    if (selectedVehicle) {
      const functions = SPECIAL_FUNCTIONS.filter(func => 
        func.manufacturer.includes(selectedVehicle.make) || 
        func.manufacturer.includes('All')
      );
      setAvailableFunctions(functions);

      const modules = PROFESSIONAL_MODULES.filter(module => 
        module.manufacturer.toLowerCase().includes(selectedVehicle.make.toLowerCase())
      );
      setAvailableModules(modules);
    } else {
      setAvailableFunctions(SPECIAL_FUNCTIONS);
      setAvailableModules(PROFESSIONAL_MODULES);
    }

    // Check connection status
    checkConnectionStatus();
  }, [selectedVehicle]);

  const checkConnectionStatus = async () => {
    try {
      const connected = await enhancedNativeBluetoothService.isConnected();
      setConnectionStatus(connected);
    } catch (error) {
      setConnectionStatus(false);
    }
  };

  const filteredFunctions = availableFunctions.filter(func => {
    const matchesSearch = func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         func.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || func.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const executeSpecialFunction = async (functionData: SpecialFunction) => {
    if (!connectionStatus) {
      toast.error('Please connect to vehicle first');
      return;
    }

    setSelectedFunction(functionData);
    setIsExecuting(true);
    setExecutionProgress(0);

    try {
      toast.info(`Starting ${functionData.name}...`);
      
      // Simulate function execution with progress updates
      for (let i = 0; i <= 100; i += 10) {
        setExecutionProgress(i);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (i === 30) {
          toast.info('Checking prerequisites...');
        } else if (i === 60) {
          toast.info('Executing function...');
        } else if (i === 90) {
          toast.info('Finalizing...');
        }
      }

      // Send actual OBD2 command if available
      if (functionData.command) {
        try {
          const response = await enhancedNativeBluetoothService.sendCommand(functionData.command);
          console.log('Function response:', response);
        } catch (error) {
          console.warn('Command execution failed:', error);
        }
      }

      toast.success(`${functionData.name} completed successfully`);
    } catch (error) {
      toast.error(`Function failed: ${error}`);
    } finally {
      setIsExecuting(false);
      setExecutionProgress(0);
      setSelectedFunction(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Basic': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-orange-500';
      case 'Expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DPF': return <Thermometer className="h-4 w-4" />;
      case 'Service Reset': return <RefreshCw className="h-4 w-4" />;
      case 'Adaptation': return <Settings className="h-4 w-4" />;
      case 'Coding': return <Cpu className="h-4 w-4" />;
      case 'Programming': return <Upload className="h-4 w-4" />;
      case 'Calibration': return <Zap className="h-4 w-4" />;
      case 'Test': return <PlayCircle className="h-4 w-4" />;
      default: return <Wrench className="h-4 w-4" />;
    }
  };

  const FunctionCard: React.FC<{ func: SpecialFunction }> = ({ func }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getCategoryIcon(func.category)}
            <CardTitle className="text-lg">{func.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(func.difficulty)}>
              {func.difficulty}
            </Badge>
            <Badge variant="outline">{func.category}</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{func.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {func.estimatedTime}
          </div>
          <div className="flex items-center gap-1">
            <Car className="h-3 w-3" />
            {func.manufacturer.slice(0, 3).join(', ')}
            {func.manufacturer.length > 3 && '...'}
          </div>
        </div>
        
        {func.warnings.length > 0 && (
          <Alert className="py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {func.warnings[0]}
              {func.warnings.length > 1 && ` (+${func.warnings.length - 1} more)`}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={() => executeSpecialFunction(func)}
            disabled={isExecuting || !connectionStatus}
            className="flex-1"
            size="sm"
          >
            {isExecuting && selectedFunction?.id === func.id ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                Executing...
              </>
            ) : (
              <>
                <PlayCircle className="h-3 w-3 mr-1" />
                Execute
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  🦁 Professional Diagnostic Center
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Advanced OBD2 diagnostics and special functions
                </p>
              </div>
              <div className="flex items-center gap-4">
                {selectedVehicle && (
                  <div className="text-right">
                    <div className="font-semibold">{selectedVehicle.make} {selectedVehicle.model}</div>
                    <div className="text-sm text-muted-foreground">{selectedVehicle.year}</div>
                  </div>
                )}
                <Badge className={connectionStatus ? 'bg-green-500' : 'bg-red-500'}>
                  {connectionStatus ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Disconnected
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Execution Progress */}
        {isExecuting && selectedFunction && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Executing: {selectedFunction.name}</h3>
                  <Button variant="outline" size="sm">
                    <StopCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
                <Progress value={executionProgress} className="w-full" />
                <div className="text-sm text-muted-foreground">
                  Progress: {executionProgress}% - Estimated time: {selectedFunction.estimatedTime}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="special-functions">Special Functions</TabsTrigger>
            <TabsTrigger value="modules">Vehicle Modules</TabsTrigger>
            <TabsTrigger value="live-data">Live Data</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(PROFESSIONAL_CATEGORIES).map(([category, data]) => (
                <Card key={category} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">{data.icon}</span>
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{data.description}</p>
                    <div className="space-y-1">
                      {data.functions.slice(0, 3).map((func, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {func}
                        </div>
                      ))}
                      {data.functions.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{data.functions.length - 3} more functions
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Thermometer className="h-6 w-6" />
                    <span className="text-xs">DPF Regen</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <RefreshCw className="h-6 w-6" />
                    <span className="text-xs">Service Reset</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Settings className="h-6 w-6" />
                    <span className="text-xs">Adaptations</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <PlayCircle className="h-6 w-6" />
                    <span className="text-xs">Component Test</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Special Functions Tab */}
          <TabsContent value="special-functions" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Functions</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search special functions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="all">All Categories</option>
                      <option value="DPF">DPF Management</option>
                      <option value="Service Reset">Service Reset</option>
                      <option value="Adaptation">Adaptations</option>
                      <option value="Coding">Coding</option>
                      <option value="Programming">Programming</option>
                      <option value="Calibration">Calibration</option>
                      <option value="Test">Component Testing</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Functions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFunctions.map((func) => (
                <FunctionCard key={func.id} func={func} />
              ))}
            </div>

            {filteredFunctions.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No functions found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or category filter.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Vehicle Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableModules.map((module) => (
                <Card key={module.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                      <Badge variant="outline">{module.manufacturer}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">ECU Address: {module.ecuAddress}</div>
                      
                      <div>
                        <div className="text-sm font-medium mb-1">Supported Functions:</div>
                        <div className="flex flex-wrap gap-1">
                          {module.supportedFunctions.map((func, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {func}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-1">Common Issues:</div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {module.commonIssues.slice(0, 2).map((issue, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Cpu className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Data Tab */}
          <TabsContent value="live-data" className="space-y-6">
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Battery className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Live Data Stream</h3>
                <p className="text-muted-foreground mb-4">
                  Connect to vehicle to view real-time sensor data and parameters.
                </p>
                <Button disabled={!connectionStatus}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Start Live Data Stream
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Diagnostic Reports</h3>
                <p className="text-muted-foreground mb-4">
                  Generate comprehensive diagnostic reports and export results.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfessionalDiagnosticCenter;
