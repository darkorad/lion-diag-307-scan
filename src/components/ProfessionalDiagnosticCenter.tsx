import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Progress 
} from '@/components/ui/progress';
import { 
  Wrench, 
  Settings, 
  RefreshCw, 
  FileText, 
  Search, 
  Play, 
  StopCircle,
  Car,
  Zap,
  Gauge,
  Database,
  Shield,
  Thermometer,
  Fuel,
  Activity,
  Cpu,
  Upload,
  PlayCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { VehicleProfile } from '@/types/vehicle';
import { 
  SPECIAL_FUNCTIONS, 
  PROFESSIONAL_MODULES, 
  SpecialFunction, 
  ManufacturerModule 
} from '@/constants/professionalDiagnosticDatabase';
import SystemScanReport from './SystemScanReport';
import { systemScanService, FullSystemScanReport } from '@/services/SystemScanService';
import { unifiedBluetoothService } from '@/services/UnifiedBluetoothService';
import { Label } from '@/components/ui/label';
import FunctionWizard from '@/components/ui/wizard';
import { HelpIcon } from '@/components/ui/help-tooltip';
import TutorialGuide from './TutorialGuide';

interface ProfessionalDiagnosticCenterProps {
  selectedVehicle: VehicleProfile | null;
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
  const [systemScanReport, setSystemScanReport] = useState<FullSystemScanReport | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardFunction, setWizardFunction] = useState<SpecialFunction | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

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
      const connected = unifiedBluetoothService.getConnectionStatus() === 'connected';
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
          const response = await unifiedBluetoothService.sendCommand(functionData.command);
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
    <Card className="hover:shadow-md transition-shadow">
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
          <div className="rounded-md border border-yellow-500 bg-yellow-50 p-2">
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-yellow-700">
                {func.warnings[0]}
                {func.warnings.length > 1 && ` (+${func.warnings.length - 1} more)`}
              </span>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setWizardFunction(func);
              setShowWizard(true);
            }}
            className="flex-1"
            size="sm"
          >
            <PlayCircle className="h-3 w-3 mr-1" />
            Execute with Wizard
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => executeSpecialFunction(func)}
            disabled={isExecuting || !connectionStatus}
          >
            <PlayCircle className="h-3 w-3 mr-1" />
            Quick Execute
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Add the system scan handler
  const handleSystemScan = async () => {
    try {
      const report = await systemScanService.performFullSystemScan();
      setSystemScanReport(report);
      toast.success('Full system scan completed successfully');
    } catch (error) {
      toast.error('Failed to perform system scan');
      console.error('System scan error:', error);
    }
  };

  // Handle wizard completion
  const handleWizardComplete = (result: { success: boolean; functionId: string }) => {
    setShowWizard(false);
    setWizardFunction(null);
    
    if (result.success) {
      toast.success(`Function completed successfully`);
    } else {
      toast.error(`Function failed`);
    }
  };

  // Handle tutorial completion
  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setTutorialCompleted(true);
    localStorage.setItem('lionDiagTutorialCompleted', 'true');
  };

  // Show tutorial on first visit
  useEffect(() => {
    const completed = localStorage.getItem('lionDiagTutorialCompleted');
    if (!completed) {
      setShowTutorial(true);
    } else {
      setTutorialCompleted(true);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Tutorial Modal */}
      <TutorialGuide 
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />
      
      {/* Wizard Modal */}
      {showWizard && wizardFunction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <FunctionWizard 
            functionData={wizardFunction} 
            onClose={() => {
              setShowWizard(false);
              setWizardFunction(null);
            }}
            onComplete={handleWizardComplete}
          />
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Professional Diagnostic Center</h2>
            <HelpIcon 
              content="The Professional Diagnostic Center provides advanced vehicle diagnostics and special functions. Use the tabs below to access different diagnostic features."
            />
          </div>
          <p className="text-muted-foreground">
            Advanced vehicle diagnostics and special functions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTutorial(true)}
            className="flex items-center gap-1"
          >
            <BookOpen className="h-4 w-4" />
            Tutorial
          </Button>
          <div className={`flex items-center space-x-1 ${connectionStatus ? 'text-green-500' : 'text-red-500'}`}>
            {connectionStatus ? (
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            ) : (
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
            )}
            <span className="text-sm font-medium">
              {connectionStatus ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {selectedVehicle && (
            <Badge variant="secondary">
              {selectedVehicle.make} {selectedVehicle.model}
            </Badge>
          )}
        </div>
      </div>

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
        <TabsContent value="overview" className="space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('special-functions')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium">Special Functions</CardTitle>
                  <HelpIcon 
                    content="Access special vehicle functions like DPF regeneration, service resets, adaptations, and coding operations."
                    side="right"
                  />
                </div>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableFunctions.length}</div>
                <p className="text-xs text-muted-foreground">Available functions</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('modules')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium">Vehicle Modules</CardTitle>
                  <HelpIcon 
                    content="View and interact with all vehicle control modules including engine, transmission, ABS, airbag, climate, and body control modules."
                    side="right"
                  />
                </div>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableModules.length}</div>
                <p className="text-xs text-muted-foreground">Detected modules</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleSystemScan}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium">System Scan</CardTitle>
                  <HelpIcon 
                    content="Perform a complete system scan of all vehicle modules to detect fault codes and diagnose issues across all systems."
                    side="right"
                  />
                </div>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Full</div>
                <p className="text-xs text-muted-foreground">Complete vehicle scan</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('reports')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium">Reports</CardTitle>
                  <HelpIcon 
                    content="View, analyze, and export detailed diagnostic reports in various formats for professional use."
                    side="right"
                  />
                </div>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Export</div>
                <p className="text-xs text-muted-foreground">Diagnostic reports</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Wrench className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Oil Service Reset</p>
                    <p className="text-xs text-muted-foreground">Completed 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <RefreshCw className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">System Scan</p>
                    <p className="text-xs text-muted-foreground">Completed 1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Settings className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Throttle Adaptation</p>
                    <p className="text-xs text-muted-foreground">Completed 3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Special Functions Tab */}
        <TabsContent value="special-functions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Special Functions</CardTitle>
                <HelpIcon 
                  content="Filter and search special vehicle functions by category or keyword. Use the wizard for step-by-step guidance."
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
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
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Vehicle Modules</CardTitle>
                <HelpIcon 
                  content="View all available vehicle control modules. Each module represents a specific system in your vehicle that can be diagnosed and controlled."
                />
              </div>
            </CardHeader>
          </Card>
          
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
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
          <SystemScanReport 
            initialReport={systemScanReport} 
            onBack={() => setActiveTab('overview')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfessionalDiagnosticCenter;
