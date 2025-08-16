import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  ArrowLeft,
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Play,
  Square,
  Info,
  Wrench
} from 'lucide-react';
import { toast } from 'sonner';

interface EGRLearningPanelProps {
  isConnected: boolean;
  onBack?: () => void;
}

const EGRLearningPanel: React.FC<EGRLearningPanelProps> = ({ isConnected, onBack }) => {
  const [isLearning, setIsLearning] = useState(false);
  const [learningProgress, setLearningProgress] = useState(0);
  const [egressStatus, setEgressStatus] = useState({
    valvePosition: 0,
    learned: false,
    lastLearningDate: null as Date | null,
    faultCount: 0
  });

  const startEGRLearning = async () => {
    if (!isConnected) {
      toast.error('Not connected to OBD2 device');
      return;
    }

    setIsLearning(true);
    setLearningProgress(0);
    
    try {
      toast.info('Starting EGR valve learning procedure...');
      
      // Simulate learning process
      const steps = [
        'Initializing EGR learning...',
        'Moving EGR valve to closed position...',
        'Recording closed position...',
        'Moving EGR valve to open position...',
        'Recording open position...',
        'Calibrating intermediate positions...',
        'Verifying valve operation...',
        'Storing learned values...',
        'EGR learning completed successfully!'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLearningProgress((i + 1) / steps.length * 100);
        toast.info(steps[i]);
      }

      setEgressStatus(prev => ({
        ...prev,
        learned: true,
        lastLearningDate: new Date(),
        faultCount: 0
      }));

      toast.success('EGR valve learning completed successfully!');
    } catch (error) {
      console.error('EGR learning failed:', error);
      toast.error('EGR learning procedure failed');
    } finally {
      setIsLearning(false);
      setLearningProgress(0);
    }
  };

  const resetEGRLearning = async () => {
    if (!isConnected) {
      toast.error('Not connected to OBD2 device');
      return;
    }

    try {
      toast.info('Resetting EGR learning values...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEgressStatus(prev => ({
        ...prev,
        learned: false,
        lastLearningDate: null,
        faultCount: 0,
        valvePosition: 0
      }));

      toast.success('EGR learning values reset successfully');
    } catch (error) {
      console.error('Failed to reset EGR learning:', error);
      toast.error('Failed to reset EGR learning values');
    }
  };

  const checkEGRStatus = async () => {
    if (!isConnected) {
      toast.error('Not connected to OBD2 device');
      return;
    }

    try {
      toast.info('Reading EGR valve status...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate reading current EGR status
      setEgressStatus(prev => ({
        ...prev,
        valvePosition: Math.floor(Math.random() * 100),
        faultCount: Math.floor(Math.random() * 3)
      }));

      toast.success('EGR status updated');
    } catch (error) {
      console.error('Failed to read EGR status:', error);
      toast.error('Failed to read EGR valve status');
    }
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}

      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>EGR Valve Learning</span>
            </div>
            <Button
              onClick={checkEGRStatus}
              disabled={!isConnected || isLearning}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Check Status
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {!isConnected && (
        <Card className="diagnostic-border">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Settings className="h-8 w-8 mx-auto mb-2" />
              <p>Connect to an OBD2 device to access EGR learning functions</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current EGR Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="diagnostic-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${egressStatus.learned ? 'bg-green-500' : 'bg-red-500'}`} />
              <p className="text-sm text-muted-foreground">Learning Status</p>
              <p className="font-semibold">{egressStatus.learned ? 'Learned' : 'Not Learned'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="diagnostic-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{egressStatus.valvePosition}%</p>
              <p className="text-sm text-muted-foreground">Valve Position</p>
            </div>
          </CardContent>
        </Card>

        <Card className="diagnostic-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{egressStatus.faultCount}</p>
              <p className="text-sm text-muted-foreground">Fault Count</p>
            </div>
          </CardContent>
        </Card>

        <Card className="diagnostic-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium">
                {egressStatus.lastLearningDate 
                  ? egressStatus.lastLearningDate.toLocaleDateString()
                  : 'Never'
                }
              </p>
              <p className="text-sm text-muted-foreground">Last Learning</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress */}
      {isLearning && (
        <Card className="diagnostic-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-blue-500" />
              <span>EGR Learning in Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={learningProgress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">
                {Math.round(learningProgress)}% Complete
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Controls */}
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5" />
            <span>EGR Learning Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={!isConnected || isLearning}
                  variant="default"
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start EGR Learning
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Start EGR Valve Learning?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will initiate the EGR valve learning procedure. The engine should be at operating 
                    temperature and the vehicle should be stationary. The process takes approximately 2-3 minutes.
                    <br /><br />
                    <strong>Warning:</strong> Do not turn off the engine or disconnect the OBD2 adapter during this process.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={startEGRLearning}>
                    Start Learning
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={!isConnected || isLearning}
                  variant="destructive"
                  className="w-full"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Reset Learning
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset EGR Learning Values?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset all EGR valve learning values to factory defaults. 
                    You will need to perform the learning procedure again after resetting.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetEGRLearning}>
                    Reset Learning
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Information */}
      <Card className="diagnostic-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>EGR Learning Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">When to Perform EGR Learning:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• After replacing the EGR valve</li>
                  <li>• After cleaning the EGR valve</li>
                  <li>• After ECU replacement</li>
                  <li>• When P0401 or similar codes appear</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Prerequisites:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Engine at operating temperature</li>
                  <li>• Vehicle stationary and parking brake on</li>
                  <li>• No active EGR-related fault codes</li>
                  <li>• Battery voltage above 12V</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800">Important Notes:</p>
                  <p className="text-yellow-700">
                    EGR learning procedures vary by manufacturer and model. This function may not be 
                    supported on all vehicles. Always consult the vehicle service manual for specific procedures.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EGRLearningPanel;