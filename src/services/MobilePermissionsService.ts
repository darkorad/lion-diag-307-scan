import { permissionService } from './PermissionService';

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
  private isRequestingPermissions = false;
  private permissionTimeouts = new Map<string, NodeJS.Timeout>();

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
    
    if (this.isRequestingPermissions) {
      console.log('Permission request already in progress, skipping...');
      return await this.checkAllPermissionStatus();
    }

    this.isRequestingPermissions = true;
    
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
      // Request permissions with timeouts to prevent hanging
      status.location = await this.requestWithTimeout('location', () => this.requestLocationPermission(), 10000);
      await this.delay(500);
      
      status.locationPrecise = await this.requestWithTimeout('locationPrecise', () => this.requestPreciseLocationPermission(), 5000);
      await this.delay(500);
      
      status.bluetooth = await this.requestWithTimeout('bluetooth', () => this.requestBluetoothPermission(), 8000);
      await this.delay(500);
      
      status.bluetoothScan = await this.requestWithTimeout('bluetoothScan', () => this.requestBluetoothScanPermission(), 5000);
      await this.delay(500);
      
      status.bluetoothConnect = await this.requestWithTimeout('bluetoothConnect', () => this.requestBluetoothConnectPermission(), 5000);
      await this.delay(500);
      
      status.storage = await this.requestWithTimeout('storage', () => this.requestStoragePermission(), 5000);
      await this.delay(500);
      
      status.camera = await this.requestWithTimeout('camera', () => this.requestCameraPermission(), 5000);
      await this.delay(500);
      
      status.notifications = await this.requestWithTimeout('notifications', () => this.requestNotificationPermission(), 5000);

      console.log('Mobile permission results:', status);
      return status;
    } catch (error) {
      console.error('Mobile permission request failed:', error);
      return status;
    } finally {
      this.isRequestingPermissions = false;
      this.clearAllTimeouts();
    }
  }

  private async requestWithTimeout<T>(
    name: string, 
    requestFn: () => Promise<T>, 
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn(`Permission request for ${name} timed out after ${timeoutMs}ms`);
        resolve(false as T);
      }, timeoutMs);

      this.permissionTimeouts.set(name, timeout);

      requestFn()
        .then(result => {
          clearTimeout(timeout);
          this.permissionTimeouts.delete(name);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeout);
          this.permissionTimeouts.delete(name);
          console.error(`Permission request for ${name} failed:`, error);
          resolve(false as T);
        });
    });
  }

  private clearAllTimeouts(): void {
    this.permissionTimeouts.forEach(timeout => clearTimeout(timeout));
    this.permissionTimeouts.clear();
  }

  private async requestLocationPermission(): Promise<boolean> {
    try {
      console.log('Requesting location permission...');
      
      // Try Capacitor Geolocation first
      if (window.Capacitor?.Plugins?.Geolocation) {
        try {
          const permission = await window.Capacitor.Plugins.Geolocation.requestPermissions();
          console.log('Capacitor location permission:', permission);
          return permission.location === 'granted';
        } catch (error) {
          console.warn('Capacitor geolocation failed:', error);
        }
      }

      // Try Cordova permissions
      if (window.cordova?.plugins?.permissions) {
        const permissions = window.cordova.plugins.permissions;
        
        return new Promise((resolve) => {
          const timeoutId = setTimeout(() => resolve(false), 8000);
          
          permissions.requestPermissions(
            [permissions.ACCESS_COARSE_LOCATION, permissions.ACCESS_FINE_LOCATION],
            (status: any) => {
              clearTimeout(timeoutId);
              console.log('Cordova location permissions:', status);
              resolve(status.hasPermission || false);
            },
            (error: any) => {
              clearTimeout(timeoutId);
              console.warn('Location permission failed:', error);
              resolve(false);
            }
          );
        });
      }

      // Try web geolocation as fallback
      if (navigator.geolocation) {
        return new Promise((resolve) => {
          const timeoutId = setTimeout(() => resolve(false), 5000);
          
          navigator.geolocation.getCurrentPosition(
            () => {
              clearTimeout(timeoutId);
              console.log('Web location permission granted');
              resolve(true);
            },
            (error) => {
              clearTimeout(timeoutId);
              console.warn('Web location permission denied:', error);
              resolve(false);
            },
            { timeout: 4000, enableHighAccuracy: false }
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
          const timeoutId = setTimeout(() => resolve(false), 4000);
          
          permissions.requestPermission(
            permissions.ACCESS_FINE_LOCATION,
            (status: any) => {
              clearTimeout(timeoutId);
              console.log('Precise location permission:', status.hasPermission);
              resolve(status.hasPermission || false);
            },
            () => {
              clearTimeout(timeoutId);
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
          const timeoutId = setTimeout(() => resolve(false), 6000);
          
          window.bluetoothSerial.isEnabled(
            () => {
              clearTimeout(timeoutId);
              console.log('Bluetooth enabled');
              resolve(true);
            },
            () => {
              console.log('Bluetooth disabled, requesting enable...');
              window.bluetoothSerial.enable(
                () => {
                  clearTimeout(timeoutId);
                  console.log('Bluetooth enabled successfully');
                  resolve(true);
                },
                (error) => {
                  clearTimeout(timeoutId);
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
          const timeoutId = setTimeout(() => resolve(true), 3000);
          
          permissions.requestPermission(
            'android.permission.BLUETOOTH_SCAN',
            (status: any) => {
              clearTimeout(timeoutId);
              console.log('Bluetooth scan permission:', status.hasPermission);
              resolve(status.hasPermission || true);
            },
            () => {
              clearTimeout(timeoutId);
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
          const timeoutId = setTimeout(() => resolve(true), 3000);
          
          permissions.requestPermission(
            'android.permission.BLUETOOTH_CONNECT',
            (status: any) => {
              clearTimeout(timeoutId);
              console.log('Bluetooth connect permission:', status.hasPermission);
              resolve(status.hasPermission || true);
            },
            () => {
              clearTimeout(timeoutId);
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
          const timeoutId = setTimeout(() => resolve(true), 3000);
          
          permissions.requestPermissions(
            [permissions.READ_EXTERNAL_STORAGE, permissions.WRITE_EXTERNAL_STORAGE],
            (status: any) => {
              clearTimeout(timeoutId);
              console.log('Storage permissions:', status);
              resolve(status.hasPermission || true);
            },
            () => {
              clearTimeout(timeoutId);
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
          const timeoutId = setTimeout(() => resolve(false), 3000);
          
          permissions.requestPermission(
            permissions.CAMERA,
            (status: any) => {
              clearTimeout(timeoutId);
              console.log('Camera permission:', status.hasPermission);
              resolve(status.hasPermission || false);
            },
            () => {
              clearTimeout(timeoutId);
              console.warn('Camera permission failed');
              resolve(false);
            }
          );
        });
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
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
          const timeoutId = setTimeout(() => resolve(false), 2000);
          window.bluetoothSerial.isEnabled(
            () => {
              clearTimeout(timeoutId);
              resolve(true);
            },
            () => {
              clearTimeout(timeoutId);
              resolve(false);
            }
          );
        });
      }

      // Check Location
      if (window.Capacitor?.Plugins?.Geolocation) {
        try {
          const permission = await window.Capacitor.Plugins.Geolocation.checkPermissions();
          status.location = permission.location === 'granted';
        } catch (error) {
          console.warn('Failed to check location permission:', error);
        }
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
