
export interface PermissionStatus {
  bluetooth: boolean;
  location: boolean;
  bluetoothScan: boolean;
  bluetoothConnect: boolean;
  storage: boolean;
}

export interface PermissionRationale {
  title: string;
  description: string;
}

export class PermissionService {
  private static instance: PermissionService;

  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  getPermissionRationale(): PermissionRationale {
    return {
      title: "Permissions Required",
      description: "This app needs certain permissions to connect to your OBD2 device and provide diagnostic functionality."
    };
  }

  async requestAllPermissions(): Promise<PermissionStatus> {
    console.log('Requesting all required permissions...');
    
    const status: PermissionStatus = {
      bluetooth: false,
      location: false,
      bluetoothScan: false,
      bluetoothConnect: false,
      storage: false
    };

    try {
      // Check if we're in a mobile environment
      if (window.DeviceMotionEvent !== undefined) {
        // Mobile device detected
        status.bluetooth = await this.requestBluetoothPermission();
        status.location = await this.requestLocationPermission();
        status.bluetoothScan = true; // Assume granted if bluetooth is granted
        status.bluetoothConnect = true; // Assume granted if bluetooth is granted
        status.storage = true; // Usually granted by default
      } else {
        // Web browser - permissions work differently
        status.bluetooth = true; // Web Bluetooth API handles its own permissions
        status.location = await this.requestLocationPermission();
        status.bluetoothScan = true;
        status.bluetoothConnect = true;
        status.storage = true;
      }

      console.log('Permission status:', status);
      return status;

    } catch (error) {
      console.error('Permission request failed:', error);
      return status;
    }
  }

  private async requestBluetoothPermission(): Promise<boolean> {
    try {
      // For Capacitor/Cordova apps, permissions are handled at the native level
      if (navigator.bluetooth) {
        // Web Bluetooth API available
        return true;
      }
      
      // Check if bluetoothSerial plugin is available (Cordova)
      if (window.bluetoothSerial) {
        return new Promise((resolve) => {
          window.bluetoothSerial.isEnabled(
            () => resolve(true),
            () => {
              // Try to enable bluetooth
              window.bluetoothSerial.enable(
                () => resolve(true),
                () => resolve(false)
              );
            }
          );
        });
      }

      return false;
    } catch (error) {
      console.error('Bluetooth permission request failed:', error);
      return false;
    }
  }

  private async requestLocationPermission(): Promise<boolean> {
    try {
      if ('geolocation' in navigator) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            (error) => {
              console.warn('Location permission denied:', error);
              resolve(false);
            },
            { timeout: 5000 }
          );
        });
      }
      return false;
    } catch (error) {
      console.error('Location permission request failed:', error);
      return false;
    }
  }

  async checkPermissionStatus(): Promise<PermissionStatus> {
    const status: PermissionStatus = {
      bluetooth: false,
      location: false,
      bluetoothScan: false,
      bluetoothConnect: false,
      storage: true // Usually available
    };

    try {
      // Check bluetooth availability
      if (window.bluetoothSerial) {
        status.bluetooth = await new Promise((resolve) => {
          window.bluetoothSerial.isEnabled(
            () => resolve(true),
            () => resolve(false)
          );
        });
        status.bluetoothScan = status.bluetooth;
        status.bluetoothConnect = status.bluetooth;
      } else if (navigator.bluetooth) {
        status.bluetooth = true;
        status.bluetoothScan = true;
        status.bluetoothConnect = true;
      }

      // Check location permission
      if ('permissions' in navigator) {
        try {
          const locationPermission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          status.location = locationPermission.state === 'granted';
        } catch (error) {
          // Fallback to trying to get location
          status.location = await this.requestLocationPermission();
        }
      }

      return status;
    } catch (error) {
      console.error('Permission status check failed:', error);
      return status;
    }
  }
}

export const permissionService = PermissionService.getInstance();
