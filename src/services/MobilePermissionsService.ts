
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

class MobilePermissionsService {
  private static instance: MobilePermissionsService;
  private isInitialized = false;
  private isSafeToAccessPlugins = false;

  static getInstance(): MobilePermissionsService {
    if (!MobilePermissionsService.instance) {
      MobilePermissionsService.instance = new MobilePermissionsService();
    }
    return MobilePermissionsService.instance;
  }

  private async ensureCapacitorReady(): Promise<boolean> {
    try {
      if (!window.Capacitor) {
        console.log('Capacitor not available, running in web mode');
        return false;
      }

      // Wait longer for plugins to be ready on mobile
      if (window.Capacitor.isNativePlatform?.()) {
        console.log('Waiting for native plugins to be ready...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if plugins object exists
        if (!window.Capacitor.Plugins) {
          console.warn('Capacitor Plugins not available');
          return false;
        }
      }

      this.isSafeToAccessPlugins = true;
      return true;
    } catch (error) {
      console.warn('Capacitor readiness check failed:', error);
      return false;
    }
  }

  async checkAllPermissionStatus(): Promise<MobilePermissionStatus> {
    try {
      const isCapacitorReady = await this.ensureCapacitorReady();
      
      // Return safe defaults for web or when Capacitor isn't ready
      const defaultStatus: MobilePermissionStatus = {
        bluetooth: !isCapacitorReady, // true for web, false for mobile until checked
        bluetoothScan: !isCapacitorReady,
        bluetoothConnect: !isCapacitorReady,
        location: !isCapacitorReady,
        locationPrecise: false,
        storage: true,
        camera: !isCapacitorReady,
        notifications: !isCapacitorReady
      };

      if (!isCapacitorReady || !this.isSafeToAccessPlugins) {
        console.log('Returning default permission status');
        return defaultStatus;
      }

      const status: MobilePermissionStatus = { ...defaultStatus };

      // Safely check location permission
      try {
        if (window.Capacitor?.Plugins?.Geolocation) {
          console.log('Checking location permissions...');
          const locationResult = await window.Capacitor.Plugins.Geolocation.checkPermissions();
          status.location = locationResult.location === 'granted';
          status.locationPrecise = locationResult.coarseLocation === 'granted';
        }
      } catch (error) {
        console.warn('Location permission check failed safely:', error);
      }

      // For Android, Bluetooth permissions depend on location
      try {
        if (window.Capacitor?.Plugins?.Device) {
          const deviceInfo = await window.Capacitor.Plugins.Device.getInfo();
          if (deviceInfo.platform === 'android') {
            status.bluetooth = status.location;
            status.bluetoothScan = status.location;
            status.bluetoothConnect = status.location;
          } else {
            // iOS typically has Bluetooth available
            status.bluetooth = true;
            status.bluetoothScan = true;
            status.bluetoothConnect = true;
          }
        }
      } catch (error) {
        console.warn('Device info check failed safely:', error);
      }

      console.log('Permission status checked safely:', status);
      return status;

    } catch (error) {
      console.error('Permission status check failed, returning safe defaults:', error);
      
      // Return ultra-safe defaults
      return {
        bluetooth: false,
        bluetoothScan: false,
        bluetoothConnect: false,
        location: false,
        locationPrecise: false,
        storage: true,
        camera: false,
        notifications: false
      };
    }
  }

  async requestAllMobilePermissions(): Promise<MobilePermissionStatus> {
    try {
      console.log('Requesting mobile permissions safely...');
      
      const isCapacitorReady = await this.ensureCapacitorReady();
      if (!isCapacitorReady || !this.isSafeToAccessPlugins) {
        console.log('Capacitor not ready, skipping permission requests');
        return await this.checkAllPermissionStatus();
      }

      // Only request location if Geolocation plugin is available
      try {
        if (window.Capacitor?.Plugins?.Geolocation) {
          console.log('Requesting location permission safely...');
          await window.Capacitor.Plugins.Geolocation.requestPermissions();
        }
      } catch (error) {
        console.warn('Location permission request failed safely:', error);
      }

      // Give permissions time to settle
      await new Promise(resolve => setTimeout(resolve, 2000));

      return await this.checkAllPermissionStatus();

    } catch (error) {
      console.error('Permission request failed safely, returning current status:', error);
      return await this.checkAllPermissionStatus();
    }
  }

  async openAppSettings(): Promise<void> {
    try {
      if (this.isSafeToAccessPlugins && window.Capacitor?.Plugins?.App) {
        await window.Capacitor.Plugins.App.openUrl({ url: 'app-settings:' });
      } else {
        console.warn('Cannot open settings - plugins not available');
      }
    } catch (error) {
      console.error('Failed to open app settings safely:', error);
    }
  }

  getFeaturePermissions(): Record<string, string[]> {
    return {
      'bluetooth_diagnostics': ['bluetooth', 'location'],
      'full_diagnostics': ['bluetooth', 'bluetoothScan', 'bluetoothConnect', 'location'],
      'professional_mode': ['bluetooth', 'bluetoothScan', 'bluetoothConnect', 'location', 'storage', 'camera']
    };
  }
}

export const mobilePermissionsService = MobilePermissionsService.getInstance();
export { MobilePermissionsService };
