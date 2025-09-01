
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Bluetooth, 
  MapPin, 
  HardDrive, 
  Camera, 
  Bell,
  CheckCircle, 
  XCircle, 
  Settings,
  Shield,
  AlertTriangle,
  Info
} from 'lucide-react';
import { mobilePermissionsService, MobilePermissionStatus } from '@/services/MobilePermissionsService';
import { toast } from 'sonner';

interface MobilePermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionsGranted: () => void;
  requiredFeatures?: string[];
}

const MobilePermissionDialog: React.FC<MobilePermissionDialogProps> = ({
  isOpen,
  onClose,
  onPermissionsGranted,
  requiredFeatures = ['full_diagnostics']
}) => {
  const [permissionStatus, setPermissionStatus] = useState<MobilePermissionStatus>({
    bluetooth: false,
    bluetoothScan: false,
    bluetoothConnect: false,
    location: false,
    locationPrecise: false,
    storage: false,
    camera: false,
    notifications: false
  });
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestProgress, setRequestProgress] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (isOpen && !hasInitialized) {
      checkCurrentPermissions();
      setHasInitialized(true);
    }
  }, [isOpen, hasInitialized]);

  const checkCurrentPermissions = async () => {
    try {
      console.log('Checking current permissions...');
      const status = await mobilePermissionsService.checkAllPermissionStatus();
      console.log('Permission status:', status);
      setPermissionStatus(status);
    } catch (error) {
      console.error('Failed to check permissions:', error);
      toast.error('Failed to check current permissions');
    }
  };

  const getPermissionInfo = () => {
    return [
      {
        key: 'bluetooth' as keyof MobilePermissionStatus,
        icon: Bluetooth,
        title: 'Bluetooth Access',
        description: 'Connect to OBD2 adapters and diagnostic tools',
        required: true,
        reason: 'Essential for communicating with vehicle diagnostic ports'
      },
      {
        key: 'location' as keyof MobilePermissionStatus,
        icon: MapPin,
        title: 'Location Access',
        description: 'Required by Android for Bluetooth device discovery',
        required: true,
        reason: 'Android security requirement for discovering nearby Bluetooth devices'
      },
      {
        key: 'bluetoothScan' as keyof MobilePermissionStatus,
        icon: Shield,
        title: 'Bluetooth Scanning',
        description: 'Scan for nearby OBD2 devices (Android 12+)',
        required: true,
        reason: 'Find all available diagnostic adapters automatically'
      },
      {
        key: 'bluetoothConnect' as keyof MobilePermissionStatus,
        icon: Shield,
        title: 'Bluetooth Connection',
        description: 'Establish secure connections to devices (Android 12+)',
        required: true,
        reason: 'Create reliable connections to diagnostic equipment'
      },
      {
        key: 'storage' as keyof MobilePermissionStatus,
        icon: HardDrive,
        title: 'Storage Access',
        description: 'Save diagnostic reports and vehicle data',
        required: false,
        reason: 'Store professional diagnostic reports and vehicle history'
      },
      {
        key: 'camera' as keyof MobilePermissionStatus,
        icon: Camera,
        title: 'Camera Access',
        description: 'Scan VIN codes and capture diagnostic images',
        required: false,
        reason: 'Quickly identify vehicles and document issues'
      },
      {
        key: 'notifications' as keyof MobilePermissionStatus,
        icon: Bell,
        title: 'Notifications',
        description: 'Alert about critical vehicle issues and diagnostics',
        required: false,
        reason: 'Receive important alerts about vehicle health'
      }
    ];
  };

  const requestAllPermissions = async () => {
    if (isRequesting) {
      console.log('Permission request already in progress');
      return;
    }

    setIsRequesting(true);
    setRequestProgress(0);
    
    try {
      console.log('Starting permission request process...');
      
      // Show progress updates
      const progressSteps = [
        'Preparing permission requests...',
        'Requesting location access...',
        'Requesting Bluetooth permissions...',
        'Requesting additional permissions...',
        'Verifying permissions...'
      ];

      for (let i = 0; i < progressSteps.length - 1; i++) {
        setRequestProgress((i / progressSteps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Request all permissions
      console.log('Requesting all mobile permissions...');
      const newStatus = await mobilePermissionsService.requestAllMobilePermissions();
      console.log('Permission request completed:', newStatus);
      
      setPermissionStatus(newStatus);
      setRequestProgress(100);

      // Check if essential permissions are granted
      const essentialGranted = newStatus.bluetooth && newStatus.location;
      
      if (essentialGranted) {
        toast.success('Essential permissions granted! Ready for diagnostics.');
        setTimeout(() => {
          onPermissionsGranted();
          onClose();
        }, 1500);
      } else {
        const missingPerms = [];
        if (!newStatus.bluetooth) missingPerms.push('Bluetooth');
        if (!newStatus.location) missingPerms.push('Location');
        
        toast.error(`Missing essential permissions: ${missingPerms.join(', ')}. Please enable manually.`);
      }

    } catch (error) {
      console.error('Permission request failed:', error);
      toast.error('Permission request failed. Please try again or enable manually.');
    } finally {
      setIsRequesting(false);
      setTimeout(() => setRequestProgress(0), 2000);
    }
  };

  const openSettings = async () => {
    try {
      await mobilePermissionsService.openAppSettings();
      toast.info('Please enable permissions manually and return to the app');
    } catch (error) {
      console.error('Failed to open settings:', error);
      toast.error('Unable to open settings. Please open them manually.');
    }
  };

  const getRequiredPermissions = () => {
    const permissionInfo = getPermissionInfo();
    const requiredPerms = mobilePermissionsService.getFeaturePermissions();
    
    const needed = new Set<string>();
    requiredFeatures.forEach(feature => {
      if (requiredPerms[feature]) {
        requiredPerms[feature].forEach(perm => needed.add(perm));
      }
    });
    
    return permissionInfo.filter(info => needed.has(info.key) || info.required);
  };

  const getPermissionIcon = (granted: boolean) => {
    return granted ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getOverallStatus = () => {
    const required = getRequiredPermissions();
    const grantedCount = required.filter(perm => permissionStatus[perm.key]).length;
    return { granted: grantedCount, total: required.length };
  };

  if (!isOpen) return null;

  const status = getOverallStatus();
  const allEssentialGranted = permissionStatus.bluetooth && permissionStatus.location;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            Mobile Permissions Required
          </CardTitle>
          <CardDescription>
            Professional OBD2 diagnostics require several permissions for full functionality
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Status */}
          <Alert className={allEssentialGranted ? "border-green-500" : "border-yellow-500"}>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  {allEssentialGranted 
                    ? "Essential permissions granted! Optional permissions enhance functionality."
                    : "Essential permissions needed for OBD2 diagnostics."
                  }
                </span>
                <Badge variant={allEssentialGranted ? "default" : "destructive"}>
                  {status.granted}/{status.total} Granted
                </Badge>
              </div>
            </AlertDescription>
          </Alert>

          {/* Permission Request Progress */}
          {isRequesting && (
            <Card className="border-blue-500">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Requesting Permissions...</span>
                    <span className="text-sm text-muted-foreground">{Math.round(requestProgress)}%</span>
                  </div>
                  <Progress value={requestProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Please allow all permission dialogs for optimal functionality
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Permission List */}
          <div className="space-y-3">
            <h4 className="font-semibold">Required Permissions</h4>
            {getRequiredPermissions().map((permission) => {
              const IconComponent = permission.icon;
              const isGranted = permissionStatus[permission.key];
              
              return (
                <Card key={permission.key} className={`border ${isGranted ? 'border-green-200' : 'border-red-200'}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <IconComponent className="h-5 w-5 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{permission.title}</h5>
                          <div className="flex items-center space-x-2">
                            {permission.required && (
                              <Badge variant="outline" className="text-xs">Required</Badge>
                            )}
                            {getPermissionIcon(isGranted)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {permission.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          Why needed: {permission.reason}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={requestAllPermissions} 
              disabled={isRequesting}
              size="lg"
              className="w-full"
            >
              {isRequesting ? 'Requesting Permissions...' : 'Grant All Permissions'}
            </Button>
            
            <div className="flex space-x-3">
              <Button 
                onClick={openSettings} 
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={isRequesting}
              >
                <Settings className="mr-2 h-4 w-4" />
                Open Settings
              </Button>
              
              <Button 
                onClick={checkCurrentPermissions} 
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={isRequesting}
              >
                Refresh Status
              </Button>
            </div>

            {allEssentialGranted && (
              <Button 
                onClick={() => {
                  onPermissionsGranted();
                  onClose();
                }}
                variant="secondary"
                size="sm"
                className="w-full"
                disabled={isRequesting}
              >
                Continue with Current Permissions
              </Button>
            )}
          </div>

          {/* Help Text */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Troubleshooting:</strong>
              <ul className="mt-2 space-y-1">
                <li>• Make sure Bluetooth is enabled before granting permissions</li>
                <li>• Location permission is required by Android for Bluetooth scanning</li>
                <li>• If permissions fail, try enabling them manually in Settings</li>
                <li>• Restart the app after changing permissions in system settings</li>
                <li>• Some devices may require precise location for optimal discovery</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobilePermissionDialog;
