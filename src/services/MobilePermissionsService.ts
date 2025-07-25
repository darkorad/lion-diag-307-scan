import { permissionService } from './PermissionService';

// Global type declarations for Capacitor
declare global {
  interface Window {
    Capacitor?: {
      Plugins?: {
        Geolocation?: any;
        BluetoothLe?: any;
        Filesystem?: any;
        Camera?: any;
      };
    };
  }

  interface Navigator {
    notification?: {
      alert: (message: string, callback: () => void, title: string, buttonName: string) => void;
    };
  }
}

export interface MobilePermissionStatus {
  bluetooth: boolean;
  bluetoothScan: boolean;
  bluetoothConnect: boolean;
  location: boolean;
  locationPrecise: boolean;
  storage: boolean;
  camera: boolean;
  notifications: boolean;
}

export interface PermissionRequest {
  permission: string;
  rationale: string;
  required: boolean;
}

export class MobilePermissionsService {
  private static instance: MobilePermissionsService;

  static getInstance(): MobilePermissionsService {
    if (!MobilePermissionsService.instance) {
      MobilePermissionsService.instance = new MobilePermissionsService();
    }
    return MobilePermissionsService.instance;
  }

  // Check if we're running on mobile
  private isMobile(): boolean {
    return !!(window.cordova || window.Capacitor || window.navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i));
  }

  // Request all required permissions with user-friendly dialogs
  async requestAllMobilePermissions(): Promise<MobilePermissionStatus> {
    console.log('Requesting comprehensive mobile permissions...');
    
    const status: MobilePermissionStatus = {
      bluetooth: false,
      bluetoothScan: false,
      bluetoothConnect: false,
      location: false,
      locationPrecise: false,
      storage: false,
      camera: false,
      notifications: false
    };

    try {
      // Show permission rationale first
      await this.showPermissionRationale();
      
      // Request permissions in optimal order
      status.location = await this.requestLocationPermission();
      await this.delay(1000);
      
      status.locationPrecise = await this.requestPreciseLocationPermission();
      await this.delay(1000);
      
      status.bluetooth = await this.requestBluetoothPermission();
      await this.delay(1000);
      
      status.bluetoothScan = await this.requestBluetoothScanPermission();
      await this.delay(1000);
      
      status.bluetoothConnect = await this.requestBluetoothConnectPermission();
      await this.delay(1000);
      
      status.storage = await this.requestStoragePermission();
      await this.delay(1000);
      
      status.camera = await this.requestCameraPermission();
      await this.delay(1000);
      
      status.notifications = await this.requestNotificationPermission();

      console.log('Mobile permission results:', status);
      return status;
    } catch (error) {
      console.error('Mobile permission request failed:', error);
      return status;
    }
  }

  private async showPermissionRationale(): Promise<void> {
    if (this.isMobile() && window.navigator?.notification) {
      return new Promise((resolve) => {
        window.navigator.notification!.alert(
          'This professional diagnostic app needs several permissions to provide comprehensive vehicle diagnostics:\n\n' +
          '• Bluetooth: Connect to OBD2 adapters\n' +
          '• Location: Required for Bluetooth scanning\n' +
          '• Storage: Save diagnostic reports\n' +
          '• Camera: Scan VIN codes\n' +
          '• Notifications: Alert about critical issues',
          () => resolve(),
          'OBD2 Diagnostic Permissions',
          'Continue'
        );
      });
    }
  }

  private async requestLocationPermission(): Promise<boolean> {
    try {
      console.log('Requesting location permission...');
      
      if (window.Capacitor?.Plugins?.Geolocation) {
        const permission = await window.Capacitor.Plugins.Geolocation.requestPermissions();
        console.log('Capacitor location permission:', permission);
        return permission.location === 'granted';
      }

      if (window.cordova?.plugins?.permissions) {
        const permissions = window.cordova.plugins.permissions;
        
        return new Promise((resolve) => {
          permissions.requestPermissions(
            [
              permissions.ACCESS_COARSE_LOCATION,
              permissions.ACCESS_FINE_LOCATION
            ],
            (status: any) => {
              console.log('Cordova location permissions:', status);
              resolve(status.hasPermission);
            },
            (error: any) => {
              console.warn('Location permission failed:', error);
              resolve(false);
            }
          );
        });
      }

      if (navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              console.log('Web location permission granted');
              resolve(true);
            },
            (error) => {
              console.warn('Web location permission denied:', error);
              resolve(false);
            },
            { timeout: 10000 }
          );
        });
      }

      return false;
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  }

  private async requestPreciseLocationPermission(): Promise<boolean> {
    try {
      if (window.cordova?.plugins?.permissions) {
        const permissions = window.cordova.plugins.permissions;
        
        return new Promise((resolve) => {
          permissions.requestPermission(
            permissions.ACCESS_FINE_LOCATION,
            (status: any) => {
              console.log('Precise location permission:', status.hasPermission);
              resolve(status.hasPermission);
            },
            () => {
              console.warn('Precise location permission failed');
              resolve(false);
            }
          );
        });
      }
      return true;
    } catch (error) {
      console.error('Precise location permission error:', error);
      return false;
    }
  }

  private async requestBluetoothPermission(): Promise<boolean> {
    try {
      console.log('Requesting Bluetooth permission...');
      
      if (window.bluetoothSerial) {
        return new Promise((resolve) => {
          window.bluetoothSerial.isEnabled(
            () => {
              console.log('Bluetooth enabled');
              resolve(true);
            },
            () => {
              console.log('Bluetooth disabled, requesting enable...');
              window.bluetoothSerial.enable(
                () => {
                  console.log('Bluetooth enabled successfully');
                  resolve(true);
                },
                (error) => {
                  console.error('Bluetooth enable failed:', error);
                  resolve(false);
                }
              );
            }
          );
        });
      }

      if (window.Capacitor?.Plugins?.BluetoothLe) {
        try {
          await window.Capacitor.Plugins.BluetoothLe.initialize();
          return true;
        } catch (error) {
          console.warn('Capacitor Bluetooth initialization failed:', error);
        }
      }

      return false;
    } catch (error) {
      console.error('Bluetooth permission error:', error);
      return false;
    }
  }

  private async requestBluetoothScanPermission(): Promise<boolean> {
    try {
      if (window.cordova?.plugins?.permissions) {
        const permissions = window.cordova.plugins.permissions;
        
        return new Promise((resolve) => {
          permissions.requestPermission(
            'android.permission.BLUETOOTH_SCAN',
            (status: any) => {
              console.log('Bluetooth scan permission:', status.hasPermission);
              resolve(status.hasPermission);
            },
            () => {
              console.warn('Bluetooth scan permission not available');
              resolve(true);
            }
          );
        });
      }
      return true;
    } catch (error) {
      console.error('Bluetooth scan permission error:', error);
      return true;
    }
  }

  private async requestBluetoothConnectPermission(): Promise<boolean> {
    try {
      if (window.cordova?.plugins?.permissions) {
        const permissions = window.cordova.plugins.permissions;
        
        return new Promise((resolve) => {
          permissions.requestPermission(
            'android.permission.BLUETOOTH_CONNECT',
            (status: any) => {
              console.log('Bluetooth connect permission:', status.hasPermission);
              resolve(status.hasPermission);
            },
            () => {
              console.warn('Bluetooth connect permission not available');
              resolve(true);
            }
          );
        });
      }
      return true;
    } catch (error) {
      console.error('Bluetooth connect permission error:', error);
      return true;
    }
  }

  private async requestStoragePermission(): Promise<boolean> {
    try {
      if (window.Capacitor?.Plugins?.Filesystem) {
        const permission = await window.Capacitor.Plugins.Filesystem.requestPermissions();
        return permission.publicStorage === 'granted';
      }

      if (window.cordova?.plugins?.permissions) {
        const permissions = window.cordova.plugins.permissions;
        
        return new Promise((resolve) => {
          permissions.requestPermissions(
            [
              permissions.READ_EXTERNAL_STORAGE,
              permissions.WRITE_EXTERNAL_STORAGE
            ],
            (status: any) => {
              console.log('Storage permissions:', status);
              resolve(status.hasPermission);
            },
            () => {
              console.warn('Storage permission failed');
              resolve(true);
            }
          );
        });
      }

      return true;
    } catch (error) {
      console.error('Storage permission error:', error);
      return true;
    }
  }

  private async requestCameraPermission(): Promise<boolean> {
    try {
      if (window.Capacitor?.Plugins?.Camera) {
        const permission = await window.Capacitor.Plugins.Camera.requestPermissions();
        return permission.camera === 'granted';
      }

      if (window.cordova?.plugins?.permissions) {
        const permissions = window.cordova.plugins.permissions;
        
        return new Promise((resolve) => {
          permissions.requestPermission(
            permissions.CAMERA,
            (status: any) => {
              console.log('Camera permission:', status.hasPermission);
              resolve(status.hasPermission);
            },
            () => {
              console.warn('Camera permission failed');
              resolve(false);
            }
          );
        });
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
          return true;
        } catch {
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Camera permission error:', error);
      return false;
    }
  }

  private async requestNotificationPermission(): Promise<boolean> {
    try {
      if (window.Notification) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }

      if (window.cordova?.plugins?.notification?.local) {
        const hasPermission = await window.cordova.plugins.notification.local.hasPermission();
        if (!hasPermission) {
          await window.cordova.plugins.notification.local.requestPermission();
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  }

  // Check current permission status
  async checkAllPermissionStatus(): Promise<MobilePermissionStatus> {
    const status: MobilePermissionStatus = {
      bluetooth: false,
      bluetoothScan: false,
      bluetoothConnect: false,
      location: false,
      locationPrecise: false,
      storage: false,
      camera: false,
      notifications: false
    };

    try {
      // Check Bluetooth
      if (window.bluetoothSerial) {
        status.bluetooth = await new Promise((resolve) => {
          window.bluetoothSerial.isEnabled(
            () => resolve(true),
            () => resolve(false)
          );
        });
      }

      // Check Location
      if (window.Capacitor?.Plugins?.Geolocation) {
        const permission = await window.Capacitor.Plugins.Geolocation.checkPermissions();
        status.location = permission.location === 'granted';
      }

      // Check Notifications
      if (window.Notification) {
        status.notifications = Notification.permission === 'granted';
      }

      // Assume others are granted if we can't check
      status.bluetoothScan = true;
      status.bluetoothConnect = true;
      status.locationPrecise = status.location;
      status.storage = true;
      status.camera = true;

    } catch (error) {
      console.error('Error checking permissions:', error);
    }

    return status;
  }

  // Show settings if permissions are denied
  async openAppSettings(): Promise<void> {
    try {
      if (window.cordova?.plugins?.settings) {
        window.cordova.plugins.settings.open();
      } else if (this.isMobile()) {
        // Show alert to manually open settings
        if (window.navigator?.notification) {
          window.navigator.notification.alert(
            'Please go to Settings > Apps > OBD2 Diagnostic > Permissions and enable:\n' +
            '• Location (Precise)\n' +
            '• Bluetooth\n' +
            '• Storage\n' +
            '• Camera\n' +
            '• Notifications',
            () => {},
            'Enable Permissions Manually',
            'OK'
          );
        }
      }
    } catch (error) {
      console.error('Failed to open settings:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getFeaturePermissions(): { [feature: string]: string[] } {
    return {
      'bluetooth_scan': ['bluetooth', 'location', 'bluetoothScan'],
      'device_connection': ['bluetooth', 'bluetoothConnect'],
      'diagnostic_reports': ['storage'],
      'vin_scanning': ['camera'],
      'system_alerts': ['notifications'],
      'full_diagnostics': ['bluetooth', 'location', 'bluetoothScan', 'bluetoothConnect', 'storage']
    };
  }
}

export const mobilePermissionsService = MobilePermissionsService.getInstance();
