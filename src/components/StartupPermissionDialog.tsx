
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings,
  Bluetooth,
  MapPin,
  HardDrive,
  Camera,
  Bell,
  Loader2
} from 'lucide-react';
import { startupPermissionService, StartupPermissionResult } from '@/services/StartupPermissionService';

interface StartupPermissionDialogProps {
  open: boolean;
  onComplete: (result: StartupPermissionResult) => void;
  onClose: () => void;
}

const StartupPermissionDialog: React.FC<StartupPermissionDialogProps> = ({
  open,
  onComplete,
  onClose
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [result, setResult] = useState<StartupPermissionResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const permissionIcons = {
    bluetooth: Bluetooth,
    location: MapPin,
    storage: HardDrive,
    camera: Camera,
    notifications: Bell
  };

  const requiredPermissions = [
    { 
      key: 'bluetooth', 
      name: 'Bluetooth Access', 
      description: 'Connect to OBD2 adapters and diagnostic tools',
      critical: true
    },
    { 
      key: 'location', 
      name: 'Location Services', 
      description: 'Required for Bluetooth device discovery on Android',
      critical: true
    },
    { 
      key: 'storage', 
      name: 'Storage Access', 
      description: 'Save diagnostic reports and vehicle profiles',
      critical: false
    },
    { 
      key: 'camera', 
      name: 'Camera Access', 
      description: 'Scan VIN codes and take diagnostic photos',
      critical: false
    },
    { 
      key: 'notifications', 
      name: 'Push Notifications', 
      description: 'Alert about critical vehicle issues',
      critical: false
    }
  ];

  const requestAllPermissions = async () => {
    setIsRequesting(true);
    setProgress(0);
    setCurrentStep('Initializing permission requests...');

    try {
      // Simulate progress steps
      const steps = [
        'Checking device capabilities...',
        'Requesting Bluetooth permissions...',
        'Requesting Location permissions...',
        'Requesting Storage permissions...',
        'Requesting Camera permissions...',
        'Requesting Notification permissions...',
        'Finalizing setup...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i]);
        setProgress(((i + 1) / steps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const permissionResult = await startupPermissionService.requestAllStartupPermissions();
      setResult(permissionResult);
      onComplete(permissionResult);

    } catch (error) {
      console.error('Permission request failed:', error);
      const errorResult: StartupPermissionResult = {
        allGranted: false,
        granted: [],
        denied: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        needsManualSetup: true
      };
      setResult(errorResult);
      onComplete(errorResult);
    } finally {
      setIsRequesting(false);
      setCurrentStep('Complete');
    }
  };

  const openSystemSettings = async () => {
    try {
      await startupPermissionService.openSystemSettings();
    } catch (error) {
      console.error('Failed to open settings:', error);
    }
  };

  const getPermissionStatus = (permissionKey: string): 'granted' | 'denied' | 'unknown' => {
    if (!result) return 'unknown';
    
    const granted = result.granted.some(p => p.includes(permissionKey));
    const denied = result.denied.some(p => p.includes(permissionKey));
    
    if (granted) return 'granted';
    if (denied) return 'denied';
    return 'unknown';
  };

  const getStatusIcon = (status: 'granted' | 'denied' | 'unknown') => {
    switch (status) {
      case 'granted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'denied': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Loader2 className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: 'granted' | 'denied' | 'unknown') => {
    switch (status) {
      case 'granted': return <Badge className="bg-green-500">Granted</Badge>;
      case 'denied': return <Badge variant="destructive">Denied</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Professional OBD2 Setup
          </DialogTitle>
          <DialogDescription>
            This diagnostic app needs comprehensive permissions to provide professional-grade vehicle diagnostics and monitoring.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isRequesting && !result && (
            <>
              {/* Permission List */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Required Permissions:</h4>
                {requiredPermissions.map((permission) => {
                  const IconComponent = permissionIcons[permission.key as keyof typeof permissionIcons];
                  return (
                    <div key={permission.key} className="flex items-start space-x-3 p-2 rounded-lg bg-muted/50">
                      <IconComponent className="h-4 w-4 mt-0.5 text-blue-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{permission.name}</span>
                          {permission.critical && <Badge variant="outline" className="text-xs">Critical</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Why these permissions?</strong> Professional OBD2 diagnostics require comprehensive system access to communicate with vehicle adapters, save reports, and provide real-time monitoring.
                </AlertDescription>
              </Alert>

              <Button onClick={requestAllPermissions} className="w-full" size="lg">
                <Shield className="mr-2 h-4 w-4" />
                Grant All Permissions
              </Button>
            </>
          )}

          {isRequesting && (
            <div className="space-y-4 text-center">
              <div className="space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <h4 className="font-medium">Setting up permissions...</h4>
                <p className="text-sm text-muted-foreground">{currentStep}</p>
              </div>
              
              <Progress value={progress} className="w-full" />
              
              <p className="text-xs text-muted-foreground">
                Please allow all permission requests that appear
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Result Summary */}
              <div className={`p-3 rounded-lg border ${
                result.allGranted 
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                  : 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.allGranted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  )}
                  <span className="font-medium">
                    {result.allGranted ? 'Setup Complete!' : 'Partial Setup'}
                  </span>
                </div>
                <p className="text-sm">
                  {result.allGranted 
                    ? 'All critical permissions granted. You can now use all diagnostic features.'
                    : `${result.granted.length} granted, ${result.denied.length} denied. Some features may be limited.`
                  }
                </p>
              </div>

              {/* Permission Details */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full"
                >
                  {showDetails ? 'Hide' : 'Show'} Permission Details
                </Button>

                {showDetails && (
                  <div className="space-y-2">
                    {requiredPermissions.map((permission) => {
                      const status = getPermissionStatus(permission.key);
                      return (
                        <div key={permission.key} className="flex items-center justify-between p-2 rounded border">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status)}
                            <span className="text-sm">{permission.name}</span>
                          </div>
                          {getStatusBadge(status)}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {result.allGranted ? (
                  <Button onClick={onClose} className="w-full">
                    Continue to App
                  </Button>
                ) : (
                  <>
                    <Button onClick={openSystemSettings} variant="outline" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Open System Settings
                    </Button>
                    <Button onClick={onClose} className="w-full">
                      Continue with Limited Features
                    </Button>
                  </>
                )}
              </div>

              {result.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Errors occurred:</strong>
                    <ul className="mt-1 text-sm list-disc list-inside">
                      {result.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StartupPermissionDialog;
