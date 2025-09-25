import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Save, 
  X, 
  Lock, 
  Unlock, 
  Settings, 
  Wrench 
} from 'lucide-react';
import { 
  ecuCodingService, 
  CodingSession, 
  CodingParameter, 
  AdaptationResult 
} from '@/services/ECUCodingService';
import { enhancedVehicleService } from '@/services/EnhancedVehicleService';
import { VehicleModule, ModuleFunction } from '@/types/vehicleModules';

const ECUCodingPanel: React.FC = () => {
  const [modules, setModules] = useState<VehicleModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<VehicleModule | null>(null);
  const [codingSession, setCodingSession] = useState<CodingSession | null>(null);
  const [adaptationFunctions, setAdaptationFunctions] = useState<ModuleFunction[]>([]);
  const [selectedAdaptation, setSelectedAdaptation] = useState<ModuleFunction | null>(null);
  const [isCodingSessionActive, setIsCodingSessionActive] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptationResult, setAdaptationResult] = useState<AdaptationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load modules on component mount
  useEffect(() => {
    const loadedModules = enhancedVehicleService.getAllModules();
    setModules(loadedModules);
    
    if (loadedModules.length > 0) {
      setSelectedModule(loadedModules[0]);
    }
  }, []);

  // Update adaptation functions when module changes
  useEffect(() => {
    if (selectedModule) {
      const adaptations = ecuCodingService.getAdaptationFunctions(selectedModule);
      setAdaptationFunctions(adaptations);
      
      if (adaptations.length > 0) {
        setSelectedAdaptation(adaptations[0]);
      }
    }
  }, [selectedModule]);

  // Handle module selection
  const handleModuleSelect = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      setSelectedModule(module);
      setError(null);
      setSuccess(null);
    }
  };

  // Start coding session
  const startCodingSession = async () => {
    if (!selectedModule) {
      setError('Please select a module first');
      return;
    }
    
    try {
      const session = await ecuCodingService.startCodingSession(selectedModule);
      setCodingSession(session);
      setIsCodingSessionActive(true);
      setSuccess('Coding session started successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start coding session';
      setError(errorMessage);
    }
  };

  // Save coding changes
  const saveCodingChanges = async () => {
    if (!codingSession) {
      setError('No active coding session');
      return;
    }
    
    try {
      const success = await ecuCodingService.saveCodingChanges();
      if (success) {
        setSuccess('Coding changes saved successfully');
      } else {
        setError('Failed to save coding changes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save coding changes';
      setError(errorMessage);
    }
  };

  // Cancel coding session
  const cancelCodingSession = () => {
    ecuCodingService.cancelCodingSession();
    setCodingSession(null);
    setIsCodingSessionActive(false);
    setSuccess('Coding session cancelled');
  };

  // Handle parameter change
  const handleParameterChange = (parameterId: string, value: string) => {
    if (!codingSession) return;
    
    // Update the parameter in the local state
    const updatedParameters = codingSession.parameters.map(param => 
      param.id === parameterId ? { ...param, currentValue: value } : param
    );
    
    setCodingSession({
      ...codingSession,
      parameters: updatedParameters
    });
  };

  // Execute adaptation
  const executeAdaptation = async () => {
    if (!selectedModule || !selectedAdaptation) {
      setError('Please select a module and adaptation function');
      return;
    }
    
    setIsAdapting(true);
    setError(null);
    setSuccess(null);
    setAdaptationResult(null);
    
    try {
      const result = await ecuCodingService.executeAdaptation(selectedModule, selectedAdaptation);
      setAdaptationResult(result);
      
      if (result.success) {
        setSuccess(`Adaptation completed successfully: ${result.adaptationName}`);
      } else {
        setError(`Adaptation failed: ${result.response}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute adaptation';
      setError(errorMessage);
    } finally {
      setIsAdapting(false);
    }
  };

  // Get parameter input component based on data type
  const getParameterInput = (parameter: CodingParameter) => {
    if (parameter.readOnly) {
      return (
        <Input
          value={parameter.currentValue}
          readOnly
          className="bg-muted"
        />
      );
    }
    
    switch (parameter.dataType) {
      case 'boolean':
        return (
          <Select
            value={parameter.currentValue}
            onValueChange={(value) => handleParameterChange(parameter.id, value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
        
      case 'number':
        return (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={parameter.currentValue}
              onChange={(e) => handleParameterChange(parameter.id, e.target.value)}
              min={parameter.minValue}
              max={parameter.maxValue}
            />
            {parameter.minValue !== undefined && parameter.maxValue !== undefined && (
              <span className="text-sm text-muted-foreground">
                ({parameter.minValue} - {parameter.maxValue})
              </span>
            )}
          </div>
        );
        
      default:
        return (
          <Input
            value={parameter.currentValue}
            onChange={(e) => handleParameterChange(parameter.id, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>ECU Coding & Adaptation</span>
            <Badge variant="outline">Advanced</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Configure ECU parameters, perform adaptations, and manage vehicle coding.
            Requires security access for advanced functions.
          </p>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Module Selection */}
            <div className="md:col-span-1">
              <Label htmlFor="module-select" className="mb-2 block">
                Select Module
              </Label>
              <Select
                value={selectedModule?.id || ''}
                onValueChange={handleModuleSelect}
              >
                <SelectTrigger id="module-select">
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map(module => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="mt-4 space-y-2">
                <Button
                  onClick={startCodingSession}
                  disabled={!selectedModule || isCodingSessionActive}
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Start Coding Session
                </Button>
                
                {isCodingSessionActive && (
                  <>
                    <Button
                      onClick={saveCodingChanges}
                      disabled={!codingSession}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={cancelCodingSession}
                      variant="outline"
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Session
                    </Button>
                  </>
                )}
              </div>
              
              {/* Security Access Indicator */}
              <div className="mt-4 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Security Access</span>
                  {codingSession?.securityAccessLevel ? (
                    <Badge variant="default">
                      <Unlock className="h-3 w-3 mr-1" />
                      Level {codingSession.securityAccessLevel}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {codingSession?.securityAccessLevel 
                    ? 'Access granted for coding operations' 
                    : 'Security access required for advanced functions'}
                </p>
              </div>
            </div>
            
            {/* Coding Parameters */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">
                  {selectedModule ? selectedModule.name : 'Select a Module'}
                </h3>
                <Badge variant={codingSession ? "default" : "secondary"}>
                  {codingSession ? 'Session Active' : 'No Session'}
                </Badge>
              </div>
              
              {codingSession ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {codingSession.parameters.map(parameter => (
                    <div key={parameter.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border rounded-lg">
                      <div className="md:col-span-1">
                        <Label className="font-medium">{parameter.name}</Label>
                        <p className="text-sm text-muted-foreground">{parameter.description}</p>
                      </div>
                      <div className="md:col-span-1">
                        {getParameterInput(parameter)}
                      </div>
                      <div className="md:col-span-1 flex items-center">
                        <div className="text-sm">
                          <p>Default: {parameter.defaultValue}</p>
                          {parameter.readOnly && (
                            <Badge variant="secondary" className="mt-1">
                              Read-only
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {codingSession.parameters.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No coding parameters available for this module</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start a coding session to view and modify ECU parameters</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Adaptation Functions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="h-5 w-5 mr-2" />
            Adaptation Functions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="adaptation-select" className="mb-2 block">
                Select Adaptation
              </Label>
              <Select
                value={selectedAdaptation?.id || ''}
                onValueChange={(value) => {
                  const adaptation = adaptationFunctions.find(a => a.id === value);
                  if (adaptation) setSelectedAdaptation(adaptation);
                }}
              >
                <SelectTrigger id="adaptation-select">
                  <SelectValue placeholder="Select an adaptation" />
                </SelectTrigger>
                <SelectContent>
                  {adaptationFunctions.map(adaptation => (
                    <SelectItem key={adaptation.id} value={adaptation.id}>
                      {adaptation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedAdaptation && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <h4 className="font-medium">{selectedAdaptation.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedAdaptation.description}
                  </p>
                  {selectedAdaptation.requiredLevel && (
                    <Badge variant="secondary" className="mt-2">
                      Requires: {selectedAdaptation.requiredLevel} access
                    </Badge>
                  )}
                </div>
              )}
              
              <Button
                onClick={executeAdaptation}
                disabled={!selectedAdaptation || isAdapting}
                className="w-full mt-4"
              >
                {isAdapting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Execute Adaptation
                  </>
                )}
              </Button>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="font-medium mb-4">Adaptation Results</h3>
              
              {adaptationResult ? (
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{adaptationResult.adaptationName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Duration: {adaptationResult.duration}ms
                      </p>
                    </div>
                    <Badge variant={adaptationResult.success ? "default" : "destructive"}>
                      {adaptationResult.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-mono bg-muted p-2 rounded">
                      {adaptationResult.response}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Execute an adaptation to see results</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ECUCodingPanel;