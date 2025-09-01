
import { permissionService } from './PermissionService';
import { mobilePermissionsService } from './MobilePermissionsService';

export interface StartupPermissionResult {
  allGranted: boolean;
  granted: string[];
  denied: string[];
  errors: string[];
  needsManualSetup: boolean;
}

export class StartupPermissionService {
  private static instance: StartupPermissionService;
  private permissionGranted = false;
  private isInitialized = false;

  static getInstance(): StartupPermissionService {
    if (!StartupPermissionService.instance) {
      StartupPermissionService.instance = new StartupPermissionService();
    }
    return StartupPermissionService.instance;
  }

  // Request all permissions at app startup
  async requestAllStartupPermissions(): Promise<StartupPermissionResult> {
    console.log('🚀 Requesting all startup permissions for OBD2 Diagnostic App...');
    
    const result: StartupPermissionResult = {
      allGranted: false,
      granted: [],
      denied: [],
      errors: [],
      needsManualSetup: false
    };

    try {
      // Show startup permission dialog
      this.showStartupDialog();

      // Request desktop/web permissions first
      const webPermissions = await this.requestWebPermissions();
      this.mergePermissionResults(result, webPermissions, 'web');

      // Request mobile permissions if on mobile
      if (this.isMobile()) {
        const mobilePermissions = await this.requestMobilePermissions();
        this.mergePermissionResults(result, mobilePermissions, 'mobile');
      }

      // Check if all critical permissions are granted
      result.allGranted = this.areAllCriticalPermissionsGranted(result);
      
      // Set initialization status
      this.isInitialized = true;
      this.permissionGranted = result.allGranted;

      // Save permission status
      this.savePermissionStatus(result);

      console.log('📋 Startup permissions result:', result);
      
      if (!result.allGranted) {
        result.needsManualSetup = true;
        this.showManualSetupInstructions(result);
      }

      return result;
    } catch (error) {
      console.error('❌ Startup permission request failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown permission error');
      return result;
    }
  }

  private async requestWebPermissions(): Promise<any> {
    try {
      return await permissionService.requestAllPermissions();
    } catch (error) {
      console.warn('Web permissions failed:', error);
      return {
        bluetooth: false,
        location: false,
        storage: false,
        bluetoothScan: false,
        bluetoothConnect: false
      };
    }
  }

  private async requestMobilePermissions(): Promise<any> {
    try {
      return await mobilePermissionsService.requestAllMobilePermissions();
    } catch (error) {
      console.warn('Mobile permissions failed:', error);
      return {
        bluetooth: false,
        bluetoothScan: false,
        bluetoothConnect: false,
        location: false,
        locationPrecise: false,
        storage: false,
        camera: false,
        notifications: false
      };
    }
  }

  private mergePermissionResults(result: StartupPermissionResult, permissions: any, type: string): void {
    Object.entries(permissions).forEach(([key, value]) => {
      const permissionName = `${type}_${key}`;
      if (value === true) {
        result.granted.push(permissionName);
      } else {
        result.denied.push(permissionName);
      }
    });
  }

  private areAllCriticalPermissionsGranted(result: StartupPermissionResult): boolean {
    const criticalPermissions = [
      'web_bluetooth',
      'web_location'
    ];

    if (this.isMobile()) {
      criticalPermissions.push(
        'mobile_bluetooth',
        'mobile_bluetoothScan',
        'mobile_bluetoothConnect',
        'mobile_location'
      );
    }

    return criticalPermissions.every(permission => 
      result.granted.some(granted => granted.includes(permission.split('_')[1]))
    );
  }

  private showStartupDialog(): void {
    if (this.isMobile() && (window as any).navigator?.notification) {
      (window as any).navigator.notification.alert(
        'OBD2 Professional Diagnostic Tool requires comprehensive permissions to provide full vehicle diagnostics.\n\n' +
        'Permissions needed:\n' +
        '🔵 Bluetooth - Connect to OBD2 adapters\n' +
        '📍 Location - Required for Bluetooth scanning\n' +
        '💾 Storage - Save diagnostic reports\n' +
        '📷 Camera - Scan VIN codes\n' +
        '🔔 Notifications - Alert critical issues\n\n' +
        'Please grant ALL permissions for optimal performance.',
        () => console.log('Startup dialog acknowledged'),
        'Professional OBD2 Permissions',
        'Grant All Permissions'
      );
    } else {
      console.log('🔐 Requesting comprehensive OBD2 diagnostic permissions...');
    }
  }

  private showManualSetupInstructions(result: StartupPermissionResult): void {
    const deniedPermissions = result.denied.join(', ');
    const instructions = this.generateManualInstructions(result.denied);

    if (this.isMobile() && (window as any).navigator?.notification) {
      (window as any).navigator.notification.alert(
        `Some permissions were denied: ${deniedPermissions}\n\n` +
        'For full functionality, please:\n' +
        instructions,
        () => console.log('Manual setup instructions shown'),
        'Manual Permission Setup Required',
        'Open Settings'
      );
    } else {
      console.warn('⚠️ Manual permission setup required:', {
        denied: result.denied,
        instructions
      });
    }
  }

  private generateManualInstructions(deniedPermissions: string[]): string {
    const instructions = [];
    
    if (deniedPermissions.some(p => p.includes('bluetooth'))) {
      instructions.push('1. Enable Bluetooth in device settings');
      instructions.push('2. Allow app to use Bluetooth');
    }
    
    if (deniedPermissions.some(p => p.includes('location'))) {
      instructions.push('3. Enable Location services');
      instructions.push('4. Set location permission to "Allow always"');
    }
    
    if (deniedPermissions.some(p => p.includes('storage'))) {
      instructions.push('5. Allow storage/file access');
    }
    
    if (deniedPermissions.some(p => p.includes('camera'))) {
      instructions.push('6. Allow camera access for VIN scanning');
    }
    
    instructions.push('7. Restart the app after granting permissions');
    
    return instructions.join('\n');
  }

  private savePermissionStatus(result: StartupPermissionResult): void {
    try {
      const status = {
        timestamp: Date.now(),
        allGranted: result.allGranted,
        granted: result.granted,
        denied: result.denied,
        version: '1.0'
      };
      localStorage.setItem('obd2_startup_permissions', JSON.stringify(status));
    } catch (error) {
      console.warn('Failed to save permission status:', error);
    }
  }

  // Check if app has been properly initialized with permissions
  isAppInitialized(): boolean {
    return this.isInitialized && this.permissionGranted;
  }

  // Get last permission check result
  getLastPermissionStatus(): StartupPermissionResult | null {
    try {
      const stored = localStorage.getItem('obd2_startup_permissions');
      if (stored) {
        const data = JSON.parse(stored);
        
        // Check if stored data is recent (within 24 hours)
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return {
            allGranted: data.allGranted,
            granted: data.granted || [],
            denied: data.denied || [],
            errors: [],
            needsManualSetup: !data.allGranted
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load last permission status:', error);
    }
    return null;
  }

  // Force re-check all permissions
  async recheckAllPermissions(): Promise<StartupPermissionResult> {
    console.log('🔄 Rechecking all permissions...');
    this.isInitialized = false;
    this.permissionGranted = false;
    localStorage.removeItem('obd2_startup_permissions');
    
    return await this.requestAllStartupPermissions();
  }

  // Open system settings for manual permission setup
  async openSystemSettings(): Promise<void> {
    try {
      if (this.isMobile()) {
        await mobilePermissionsService.openAppSettings();
      } else {
        // For web, show instructions
        console.log('🔧 Web permissions must be granted through browser settings');
        alert('Please check your browser settings to allow:\n• Bluetooth access\n• Location access\n• Storage access');
      }
    } catch (error) {
      console.error('Failed to open system settings:', error);
    }
  }

  private isMobile(): boolean {
    return !!(window.cordova || window.Capacitor || window.navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i));
  }

  // Quick permission status check (cached)
  async quickPermissionCheck(): Promise<boolean> {
    try {
      if (this.isMobile()) {
        const status = await mobilePermissionsService.checkAllPermissionStatus();
        return status.bluetooth && status.location;
      } else {
        const status = await permissionService.checkPermissionStatus();
        return status.bluetooth && status.location;
      }
    } catch (error) {
      console.warn('Quick permission check failed:', error);
      return false;
    }
  }
}

export const startupPermissionService = StartupPermissionService.getInstance();
