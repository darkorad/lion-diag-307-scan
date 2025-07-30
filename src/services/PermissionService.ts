
export interface PermissionStatus {
  bluetooth: boolean;
  location: boolean;
  storage: boolean;
  bluetoothScan: boolean;
  bluetoothConnect: boolean;
}

export class PermissionService {
  private static instance: PermissionService;
  private cachedPermissions: PermissionStatus | null = null;
  private lastCheck: number = 0;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  
  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  // Load cached permissions from localStorage
  private loadCachedPermissions(): PermissionStatus | null {
    try {
      const cached = localStorage.getItem('obd2_permissions');
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp < this.cacheTimeout) {
          return data.permissions;
        }
      }
    } catch (error) {
      console.warn('Failed to load cached permissions:', error);
    }
    return null;
  }

  // Save permissions to localStorage
  private savePermissionsToCache(permissions: PermissionStatus): void {
    try {
      const data = {
        permissions,
        timestamp: Date.now()
      };
      localStorage.setItem('obd2_permissions', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save permissions to cache:', error);
    }
  }

  // Check if we're running on Android
  private isAndroid(): boolean {
    return window.navigator.userAgent.includes('Android') ||
           (window as { DeviceInfo?: { platform: string } }).DeviceInfo?.platform === 'android';
  }

  // Check current permission status without requesting
  async checkPermissionStatus(): Promise<PermissionStatus> {
    // Check cache first
    const cached = this.loadCachedPermissions();
    if (cached) {
      console.log('Using cached permissions:', cached);
      return cached;
    }

    const status: PermissionStatus = {
      bluetooth: false,
      location: false,
      storage: true,
      bluetoothScan: true,
      bluetoothConnect: true
    };

    try {
      // Check Bluetooth without requesting
      if (window.bluetoothSerial) {
        status.bluetooth = await new Promise((resolve) => {
          window.bluetoothSerial.isEnabled(
            () => resolve(true),
            () => resolve(false)
          );
        });
      }

      // Check Location permissions
      if (navigator.permissions) {
        try {
          const locationPermission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          status.location = locationPermission.state === 'granted';
        } catch (error) {
          // Fallback: assume location is available if geolocation API exists
          status.location = !!navigator.geolocation;
        }
      } else {
        status.location = !!navigator.geolocation;
      }

      // Save to cache
      this.savePermissionsToCache(status);

    } catch (error) {
      console.error('Error checking permissions:', error);
    }

    return status;
  }

  // Request all necessary permissions only when needed
  async requestAllPermissions(): Promise<PermissionStatus> {
    const results: PermissionStatus = {
      bluetooth: false,
      location: false,
      storage: false,
      bluetoothScan: false,
      bluetoothConnect: false
    };

    try {
      console.log('Requesting all permissions for OBD2 diagnostics...');
      
      // Request permissions in sequence for better compatibility
      results.location = await this.requestLocationPermissions();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      results.bluetooth = await this.requestBluetoothPermissions();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      results.bluetoothScan = await this.requestBluetoothScanPermissions();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      results.bluetoothConnect = await this.requestBluetoothConnectPermissions();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      results.storage = await this.requestStoragePermissions();

      console.log('Permission results:', results);
      
      // Save to cache
      this.savePermissionsToCache(results);
      
      return results;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return results;
    }
  }

  // Enhanced Bluetooth permissions
  private async requestBluetoothPermissions(): Promise<boolean> {
    try {
      console.log('Requesting Bluetooth permissions...');
      
      // Check if Bluetooth is available first
      if (!window.bluetoothSerial) {
        console.warn('Bluetooth Serial plugin not available');
        return false;
      }

      return new Promise((resolve) => {
        window.bluetoothSerial.isEnabled(
          () => {
            console.log('Bluetooth already enabled');
            resolve(true);
          },
          () => {
            console.log('Bluetooth disabled, attempting to enable...');
            window.bluetoothSerial.enable(
              () => {
                console.log('Bluetooth enabled successfully');
                resolve(true);
              },
              (error) => {
                console.error('Failed to enable Bluetooth:', error);
                resolve(false);
              }
            );
          }
        );
      });
    } catch (error) {
      console.error('Bluetooth permission error:', error);
      return false;
    }
  }

  // Request Bluetooth scan permissions (Android 12+)
  private async requestBluetoothScanPermissions(): Promise<boolean> {
    try {
      if ((window as { cordova?: { plugins?: { permissions: unknown } } }).cordova?.plugins?.permissions) {
        const permissions = (window as { cordova: { plugins: { permissions: { requestPermission: (permission: string, success: (status: { hasPermission: boolean }) => void, error: () => void) => void } } } }).cordova.plugins.permissions;
        
        return new Promise((resolve) => {
          permissions.requestPermission(
            'android.permission.BLUETOOTH_SCAN',
            (status: { hasPermission: boolean }) => {
              console.log('Bluetooth scan permission:', status.hasPermission);
              resolve(status.hasPermission);
            },
            () => {
              console.warn('Bluetooth scan permission request failed');
              resolve(true); // Don't block for this
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

  // Request Bluetooth connect permissions (Android 12+)
  private async requestBluetoothConnectPermissions(): Promise<boolean> {
    try {
      if ((window as { cordova?: { plugins?: { permissions: unknown } } }).cordova?.plugins?.permissions) {
        const permissions = (window as { cordova: { plugins: { permissions: { requestPermission: (permission: string, success: (status: { hasPermission: boolean }) => void, error: () => void) => void } } } }).cordova.plugins.permissions;
        
        return new Promise((resolve) => {
          permissions.requestPermission(
            'android.permission.BLUETOOTH_CONNECT',
            (status: { hasPermission: boolean }) => {
              console.log('Bluetooth connect permission:', status.hasPermission);
              resolve(status.hasPermission);
            },
            () => {
              console.warn('Bluetooth connect permission request failed');
              resolve(true); // Don't block for this
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

  // Enhanced Location permissions (required for Bluetooth scanning)
  private async requestLocationPermissions(): Promise<boolean> {
    try {
      console.log('Requesting location permissions...');
      
      // Try Capacitor first
      if ((window as { Capacitor?: { Plugins?: { Geolocation: unknown } } }).Capacitor?.Plugins?.Geolocation) {
        const permission = await (window as { Capacitor: { Plugins: { Geolocation: { requestPermissions: () => Promise<{ location: 'granted' | 'denied' }> } } } }).Capacitor.Plugins.Geolocation.requestPermissions();
        return permission.location === 'granted';
      }

      // Try Cordova permissions plugin
      if ((window as { cordova?: { plugins?: { permissions: unknown } } }).cordova?.plugins?.permissions) {
        const permissions = (window as { cordova: { plugins: { permissions: { requestPermission: (permission: string, success: (status: { hasPermission: boolean }) => void, error: () => void) => void } } } }).cordova.plugins.permissions;
        
        return new Promise((resolve) => {
          permissions.requestPermission(
            'android.permission.ACCESS_FINE_LOCATION',
            (status: { hasPermission: boolean }) => {
              console.log('Location permission:', status.hasPermission);
              resolve(status.hasPermission);
            },
            () => {
              console.warn('Location permission request failed');
              resolve(false);
            }
          );
        });
      }

      // Fallback to web API
      if (navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false),
            { timeout: 5000 }
          );
        });
      }

      return false;
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  }

  // Request Storage permissions
  private async requestStoragePermissions(): Promise<boolean> {
    try {
      // For Capacitor, storage permissions are usually handled automatically
      if ((window as { Capacitor?: { Plugins?: { Filesystem: unknown } } }).Capacitor?.Plugins?.Filesystem) {
        try {
          const permission = await (window as { Capacitor: { Plugins: { Filesystem: { requestPermissions: () => Promise<{ publicStorage: 'granted' | 'denied' }> } } } }).Capacitor.Plugins.Filesystem.requestPermissions();
          return permission.publicStorage === 'granted';
        } catch {
          return true; // Assume granted
        }
      }

      return true; // Web storage doesn't need explicit permissions
    } catch (error) {
      console.error('Storage permission error:', error);
      return true; // Don't block for storage permissions
    }
  }

  // Clear permission cache (for troubleshooting)
  clearPermissionCache(): void {
    localStorage.removeItem('obd2_permissions');
    this.cachedPermissions = null;
    console.log('Permission cache cleared');
  }

  // Show permission rationale to user
  getPermissionRationale(): { title: string; description: string; permissions: string[] } {
    return {
      title: "Permissions Required for OBD2 Diagnostics",
      description: "This app needs comprehensive permissions to provide professional vehicle diagnostics:",
      permissions: [
        "🔵 Bluetooth: Connect to any ELM327 or compatible OBD2 adapter",
        "📍 Location: Required by Android for Bluetooth device discovery",
        "💾 Storage: Save diagnostic reports and vehicle profiles",
        "🔍 Device Scanning: Find all available OBD2 adapters automatically",
        "🔗 Bluetooth Connect: Establish secure connections to adapters"
      ]
    };
  }
}

export const permissionService = PermissionService.getInstance();
