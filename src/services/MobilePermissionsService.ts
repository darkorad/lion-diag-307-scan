
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

      // Wait for plugins to be ready
      if (window.Capacitor.isNativePlatform?.()) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return true;
    } catch (error) {
      console.warn('Capacitor readiness check failed:', error);
      return false;
    }
  }

  async checkAllPermissionStatus(): Promise<MobilePermissionStatus> {
    try {
      const isCapacitorReady = await this.ensureCapacitorReady();
      
      if (!isCapacitorReady) {
        // Return web-friendly defaults
        return {
          bluetooth: true, // Assume available in web
          bluetoothScan: true,
          bluetoothConnect: true,
          location: true,
          locationPrecise: false,
          storage: true,
          camera: true,
          notifications: true
        };
      }

      // Check actual permissions on mobile
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

      // Safely check each permission
      try {
        // Check location permission
        if (window.Capacitor?.Plugins?.Geolocation) {
          const locationResult = await window.Capacitor.Plugins.Geolocation.checkPermissions();
          status.location = locationResult.location === 'granted';
          status.locationPrecise = locationResult.coarseLocation === 'granted';
        }
      } catch (error) {
        console.warn('Location permission check failed:', error);
      }

      try {
        // Check Bluetooth permissions (Android 12+)
        if (window.Capacitor?.Plugins?.Device) {
          const deviceInfo = await window.Capacitor.Plugins.Device.getInfo();
          if (deviceInfo.platform === 'android') {
            // For Android, assume Bluetooth permissions based on location
            status.bluetooth = status.location;
            status.bluetoothScan = status.location;
            status.bluetoothConnect = status.location;
          } else {
            // For iOS, Bluetooth is usually available
            status.bluetooth = true;
            status.bluetoothScan = true;
            status.bluetoothConnect = true;
          }
        }
      } catch (error) {
        console.warn('Bluetooth permission check failed:', error);
      }

      // Default other permissions to true for now
      status.storage = true;
      status.camera = true;
      status.notifications = true;

      console.log('Permission status checked:', status);
      return status;

    } catch (error) {
      console.error('Permission status check failed completely:', error);
      
      // Return safe defaults
      return {
        bluetooth: false,
        bluetoothScan: false,
        bluetoothConnect: false,
        location: false,
        locationPrecise: false,
        storage: true,
        camera: true,
        notifications: true
      };
    }
  }

  async requestAllMobilePermissions(): Promise<MobilePermissionStatus> {
    try {
      console.log('Requesting mobile permissions...');
      
      const isCapacitorReady = await this.ensureCapacitorReady();
      if (!isCapacitorReady) {
        console.log('Capacitor not ready, returning web defaults');
        return await this.checkAllPermissionStatus();
      }

      // Request location permission first (required for Bluetooth on Android)
      try {
        if (window.Capacitor?.Plugins?.Geolocation) {
          console.log('Requesting location permission...');
          await window.Capacitor.Plugins.Geolocation.requestPermissions();
        }
      } catch (error) {
        console.warn('Location permission request failed:', error);
      }

      // Small delay to let permissions settle
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Return updated status
      return await this.checkAllPermissionStatus();

    } catch (error) {
      console.error('Permission request failed:', error);
      return await this.checkAllPermissionStatus();
    }
  }

  async openAppSettings(): Promise<void> {
    try {
      if (window.Capacitor?.Plugins?.App) {
        await window.Capacitor.Plugins.App.openUrl({ url: 'app-settings:' });
      } else {
        console.warn('Cannot open settings - not on mobile platform');
      }
    } catch (error) {
      console.error('Failed to open app settings:', error);
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
