import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  Settings, 
  Wrench, 
  Droplets, 
  Navigation, 
  Zap, 
  Car 
} from 'lucide-react';
import { 
  resetRelearnService, 
  ResetOperation, 
  RelearnOperation, 
  ResetResult, 
  RelearnResult 
} from '@/services/ResetRelearnService';

const ResetRelearnPanel: React.FC = () => {
  const [resetOperations, setResetOperations] = useState<ResetOperation[]>([]);
  const [relearnOperations, setRelearnOperations] = useState<RelearnOperation[]>([]);
  const [selectedReset, setSelectedReset] = useState<ResetOperation | null>(null);
  const [selectedRelearn, setSelectedRelearn] = useState<RelearnOperation | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ResetResult | RelearnResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load operations on component mount
  useEffect(() => {
    const resets = resetRelearnService.getResetOperations();
    const relearns = resetRelearnService.getRelearnOperations();
    
    setResetOperations(resets);
    setRelearnOperations(relearns);
    
    if (resets.length > 0) {
      setSelectedReset(resets[0]);
    }
    
    if (relearns.length > 0) {
      setSelectedRelearn(relearns[0]);
    }
  }, []);

  // Handle reset selection
  const handleResetSelect = (operation: ResetOperation) => {
    setSelectedReset(operation);
    setError(null);
    setSuccess(null);
    setResult(null);
  };

  // Handle relearn selection
  const handleRelearnSelect = (operation: RelearnOperation) => {
    setSelectedRelearn(operation);
    setError(null);
    setSuccess(null);
    setResult(null);
  };

  // Execute reset operation
  const executeReset = async () => {
    if (!selectedReset) {
      setError('Please select a reset operation');
      return;
    }
    
    setIsExecuting(true);
    setError(null);
    setSuccess(null);
    setResult(null);
    
    try {
      // Validate prerequisites
      const validation = resetRelearnService.validatePrerequisites(selectedReset.prerequisites);
      if (!validation.valid) {
        throw new Error(`Missing prerequisites: ${validation.missing.join(', ')}`);
      }
      
      const resetResult = await resetRelearnService.executeResetOperation(selectedReset);
      setResult(resetResult);
      
      if (resetResult.success) {
        setSuccess(`${selectedReset.name} completed successfully`);
      } else {
        setError(`Reset failed: ${resetResult.response}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute reset operation';
      setError(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  };

  // Execute relearn operation
  const executeRelearn = async () => {
    if (!selectedRelearn) {
      setError('Please select a relearn operation');
      return;
    }
    
    setIsExecuting(true);
    setError(null);
    setSuccess(null);
    setResult(null);
    
    try {
      // Validate prerequisites
      const validation = resetRelearnService.validatePrerequisites(selectedRelearn.prerequisites);
      if (!validation.valid) {
        throw new Error(`Missing prerequisites: ${validation.missing.join(', ')}`);
      }
      
      const relearnResult = await resetRelearnService.executeRelearnOperation(selectedRelearn);
      setResult(relearnResult);
      
      if (relearnResult.success) {
        setSuccess(`${selectedRelearn.name} completed successfully`);
      } else {
        setError(`Relearn failed: ${relearnResult.response}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute relearn operation';
      setError(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  };

  // Get icon for reset operation
  const getResetIcon = (operation: ResetOperation) => {
    switch (operation.category) {
      case 'service':
        return <Settings className="h-5 w-5" />;
      case 'maintenance':
        return <Wrench className="h-5 w-5" />;
      default:
        return <Droplets className="h-5 w-5" />;
    }
  };

  // Get icon for relearn operation
  const getRelearnIcon = (operation: RelearnOperation) => {
    switch (operation.category) {
      case 'steering':
        return <Navigation className="h-5 w-5" />;
      case 'throttle':
        return <Zap className="h-5 w-5" />;
      case 'epb':
        return <Car className="h-5 w-5" />;
      case 'tpms':
        return <Settings className="h-5 w-5" />;
      default:
        return <RotateCcw className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reset & Relearn Functions</span>
            <Badge variant="outline">Professional</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Perform vehicle reset and relearn operations. These functions require 
            specific conditions and should be used with caution.
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reset Operations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center">
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reset Operations
                </h3>
                <Badge variant="secondary">
                  {resetOperations.length} operations
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {resetOperations.map(operation => (
                  <div
                    key={operation.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedReset?.id === operation.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleResetSelect(operation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getResetIcon(operation)}
                        <div>
                          <h4 className="font-medium">{operation.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {operation.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {operation.requiredLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {resetOperations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No reset operations available</p>
                  </div>
                )}
              </div>
              
              {selectedReset && (
                <div className="mt-4 p-4 border rounded-lg bg-muted">
                  <h4 className="font-medium mb-2">{selectedReset.name}</h4>
                  <p className="text-sm mb-3">{selectedReset.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <h5 className="text-sm font-medium mb-1">Estimated Time</h5>
                      <p className="text-sm text-muted-foreground">{selectedReset.estimatedTime}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-1">Required Level</h5>
                      <Badge variant="secondary">{selectedReset.requiredLevel}</Badge>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h5 className="text-sm font-medium mb-1">Prerequisites</h5>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      {selectedReset.prerequisites.map((prereq, index) => (
                        <li key={index}>{prereq}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium mb-1">Procedure</h5>
                    <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                      {selectedReset.procedure.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  
                  <div className="mt-3">
                    <h5 className="text-sm font-medium mb-1 text-yellow-600">Warnings</h5>
                    <ul className="text-sm text-yellow-600 list-disc list-inside space-y-1">
                      {selectedReset.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button
                    onClick={executeReset}
                    disabled={isExecuting}
                    className="w-full mt-4"
                  >
                    {isExecuting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Execute Reset
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
            
            {/* Relearn Operations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Relearn Operations
                </h3>
                <Badge variant="secondary">
                  {relearnOperations.length} operations
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {relearnOperations.map(operation => (
                  <div
                    key={operation.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRelearn?.id === operation.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleRelearnSelect(operation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getRelearnIcon(operation)}
                        <div>
                          <h4 className="font-medium">{operation.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {operation.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {operation.requiredLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {relearnOperations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No relearn operations available</p>
                  </div>
                )}
              </div>
              
              {selectedRelearn && (
                <div className="mt-4 p-4 border rounded-lg bg-muted">
                  <h4 className="font-medium mb-2">{selectedRelearn.name}</h4>
                  <p className="text-sm mb-3">{selectedRelearn.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <h5 className="text-sm font-medium mb-1">Estimated Time</h5>
                      <p className="text-sm text-muted-foreground">{selectedRelearn.estimatedTime}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-1">Required Level</h5>
                      <Badge variant="secondary">{selectedRelearn.requiredLevel}</Badge>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h5 className="text-sm font-medium mb-1">Prerequisites</h5>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      {selectedRelearn.prerequisites.map((prereq, index) => (
                        <li key={index}>{prereq}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium mb-1">Procedure</h5>
                    <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                      {selectedRelearn.procedure.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  
                  <div className="mt-3">
                    <h5 className="text-sm font-medium mb-1 text-yellow-600">Warnings</h5>
                    <ul className="text-sm text-yellow-600 list-disc list-inside space-y-1">
                      {selectedRelearn.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button
                    onClick={executeRelearn}
                    disabled={isExecuting}
                    className="w-full mt-4"
                  >
                    {isExecuting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Settings className="h-4 w-4 mr-2" />
                        Execute Relearn
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Operation Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Operation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{result.operationName}</h4>
                  <p className="text-sm text-muted-foreground">
                    Duration: {result.duration}ms
                  </p>
                </div>
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? 'Success' : 'Failed'}
                </Badge>
              </div>
              <div className="mt-2">
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {result.response}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResetRelearnPanel;