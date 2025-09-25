import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  Zap, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  ChevronRight,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { aiInterpretationService, InterpretationResult } from '@/services/AIInterpretationService';
import { toast } from 'sonner';

interface AIAssistantPanelProps {
  dtcCodes?: string[];
  liveData?: Record<string, string | number>;
  onActionSuggested?: (action: string) => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ 
  dtcCodes = [], 
  liveData = {},
  onActionSuggested 
}) => {
  const [interpretation, setInterpretation] = useState<InterpretationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Automatically interpret when data changes
    if (dtcCodes.length > 0 || Object.keys(liveData).length > 0) {
      interpretData();
    }
  }, [dtcCodes, liveData]);

  const interpretData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let result: InterpretationResult;
      
      if (dtcCodes.length > 0) {
        result = await aiInterpretationService.interpretDTCCodes(dtcCodes);
      } else if (Object.keys(liveData).length > 0) {
        result = await aiInterpretationService.interpretLiveData(liveData);
      } else {
        throw new Error('No data provided for interpretation');
      }
      
      setInterpretation(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to interpret data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const handleSuggestedAction = (action: string) => {
    if (onActionSuggested) {
      onActionSuggested(action);
    }
    toast.info(`Suggested action: ${action}`);
  };

  if (dtcCodes.length === 0 && Object.keys(liveData).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Diagnostic Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Connect to a vehicle and scan for diagnostic codes or live data to get AI-powered interpretations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Diagnostic Assistant
          </div>
          <Button 
            onClick={interpretData} 
            disabled={isLoading}
            variant="outline" 
            size="sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4 mr-2" />
                Re-analyze
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">AI is analyzing your diagnostic data...</p>
          </div>
        )}

        {interpretation && !isLoading && (
          <div className="space-y-6">
            {/* Summary */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <Info className="h-4 w-4" />
                Summary
              </h3>
              <p className="text-muted-foreground">{interpretation.summary}</p>
            </div>

            {/* Issues */}
            {interpretation.issues.length > 0 && (
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Detected Issues
                </h3>
                <div className="space-y-3">
                  {interpretation.issues.map((issue, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityVariant(issue.severity)}>
                              {issue.code}
                            </Badge>
                            <span className="font-medium">{issue.description}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {issue.relatedSystems.map((system, sysIndex) => (
                              <Badge key={sysIndex} variant="outline" className="text-xs">
                                {system}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(issue.severity)}`} />
                      </div>
                      {issue.suggestedActions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Suggested Actions:</p>
                          <ul className="space-y-1">
                            {issue.suggestedActions.map((action, actionIndex) => (
                              <li key={actionIndex} className="flex items-start text-sm">
                                <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {interpretation.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {interpretation.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Safety Notes */}
            {interpretation.safetyNotes.length > 0 && (
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Safety Notes
                </h3>
                <ul className="space-y-2">
                  {interpretation.safetyNotes.map((note, index) => (
                    <li key={index} className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-orange-500 mr-2" />
                      <span className="text-orange-700 dark:text-orange-300">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAssistantPanel;