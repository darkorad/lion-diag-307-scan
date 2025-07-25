import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Bluetooth, 
  MapPin, 
  HardDrive, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { permissionService, PermissionStatus } from '@/services/PermissionService';
import { useToast } from '@/hooks/use-toast';

interface PermissionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPermissionsGranted: (status: PermissionStatus) => void;
}

const PermissionRequestDialog: React.FC<PermissionRequestDialogProps> = ({
  open,
  onOpenChange,
  onPermissionsGranted
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);
  const [hasCheckedInitial, setHasCheckedInitial] = useState(false);
  const { toast } = useToast();

  const rationale = permissionService.getPermissionRationale();

  useEffect(() => {
    if (open && !hasCheckedInitial) {
      checkCurrentPermissions();
      setHasCheckedInitial(true);
    }
  }, [open, hasCheckedInitial]);

  const checkCurrentPermissions = async () => {
    try {
      const status = await permissionService.checkPermissionStatus();
      setPermissionStatus(status);
      
      // If all permissions are granted, auto-close
      if (status.bluetooth && status.location && status.storage) {
        onPermissionsGranted(status);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const handleRequestPermissions = async () => {
    setIsRequesting(true);
    try {
      const status = await permissionService.requestAllPermissions();
      setPermissionStatus(status);

      const grantedCount = Object.values(status).filter(Boolean).length;
      const totalCount = Object.keys(status).length;

      if (grantedCount === totalCount) {
        toast({
          title: "Permissions Granted",
          description: "All permissions have been granted successfully!",
        });
        onPermissionsGranted(status);
        onOpenChange(false);
      } else {
        toast({
          title: "Some Permissions Denied",
          description: `${grantedCount}/${totalCount} permissions granted. Some features may be limited.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast({
        title: "Permission Error",
        description: "Failed to request permissions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleContinueAnyway = () => {
    const currentStatus = permissionStatus || {
      bluetooth: false,
      location: false,
      storage: false,
      bluetoothScan: false,
      bluetoothConnect: false
    };
    onPermissionsGranted(currentStatus);
    onOpenChange(false);
  };

  const getPermissionIcon = (granted: boolean) => {
    return granted ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getPermissionBadge = (granted: boolean) => {
    return (
      <Badge variant={granted ? "default" : "destructive"}>
        {granted ? "Granted" : "Required"}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {rationale.title}
          </DialogTitle>
          <DialogDescription>
            {rationale.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Bluetooth className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Bluetooth Access</p>
                  <p className="text-sm text-muted-foreground">Connect to OBD2 scanner</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {permissionStatus && getPermissionIcon(permissionStatus.bluetooth)}
                {permissionStatus && getPermissionBadge(permissionStatus.bluetooth)}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Location Access</p>
                  <p className="text-sm text-muted-foreground">Required for Bluetooth scanning</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {permissionStatus && getPermissionIcon(permissionStatus.location)}
                {permissionStatus && getPermissionBadge(permissionStatus.location)}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <HardDrive className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Storage Access</p>
                  <p className="text-sm text-muted-foreground">Save diagnostic reports</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {permissionStatus && getPermissionIcon(permissionStatus.storage)}
                {permissionStatus && getPermissionBadge(permissionStatus.storage)}
              </div>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Why these permissions?</strong>
              <ul className="mt-2 text-sm space-y-1">
                <li>• Bluetooth: Essential for communicating with your ELM327 OBD2 adapter</li>
                <li>• Location: Android requires this for Bluetooth device discovery</li>
                <li>• Storage: Allows saving vehicle reports and diagnostic history</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={handleContinueAnyway}
            disabled={isRequesting}
          >
            Continue Anyway
          </Button>
          <Button 
            onClick={handleRequestPermissions}
            disabled={isRequesting}
            className="flex-1"
          >
            {isRequesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Requesting...
              </>
            ) : (
              "Grant Permissions"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionRequestDialog;
