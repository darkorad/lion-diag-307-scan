import { Capacitor } from '@capacitor/core';
import { BluetoothLe } from '@capacitor-community/bluetooth-le';

export class AndroidBluetoothPermissionService {
  private static instance: AndroidBluetoothPermissionService;

  static getInstance(): AndroidBluetoothPermissionService {
    if (!AndroidBluetoothPermissionService.instance) {
      AndroidBluetoothPermissionService.instance = new AndroidBluetoothPermissionService();
    }
    return AndroidBluetoothPermissionService.instance;
  }

  async requestBluetoothPermissions(): Promise<boolean> {
    try {
      console.log('🔐 Requesting Android Bluetooth permissions...');

      if (Capacitor.getPlatform() !== 'android') {
        console.log('ℹ️ Not on Android, skipping permission request');
        return true;
      }

      // Request Bluetooth permissions using the Bluetooth LE plugin
      // This will automatically handle the permission requests on Android
      await BluetoothLe.initialize();
      console.log('✅ Bluetooth permissions granted');
      return true;
    } catch (error) {
      console.error('❌ Bluetooth permission request failed:', error);
      return false;
    }
  }

  async requestSystemBluetoothEnable(): Promise<boolean> {
    try {
      // On Android, request the user to enable Bluetooth
      // This will show a system dialog
      console.log('🔵 Requesting system Bluetooth enable...');
      
      // Use the Bluetooth LE plugin to request enable
      await BluetoothLe.requestEnable();
      console.log('✅ Bluetooth enabled');
      return true;
    } catch (error) {
      console.error('❌ System Bluetooth enable failed:', error);
      return false;
    }
  }

  async checkBluetoothStatus(): Promise<{
    enabled: boolean;
    permissions: {
      bluetooth: boolean;
      bluetoothConnect: boolean;
      bluetoothScan: boolean;
      location: boolean;
    };
  }> {
    try {
      const permissions = {
        bluetooth: false,
        bluetoothConnect: false,
        bluetoothScan: false,
        location: false
      };

      if (Capacitor.getPlatform() === 'android') {
        try {
          // Check if Bluetooth is enabled using the Bluetooth LE plugin
          const result = await BluetoothLe.isEnabled();
          console.log('📊 Bluetooth status:', result);
          
          return {
            enabled: result.value,
            permissions: {
              bluetooth: result.value,
              bluetoothConnect: result.value,
              bluetoothScan: result.value,
              location: true // We assume location permission is granted if we got here
            }
          };
        } catch (error) {
          console.error('❌ Failed to get Bluetooth status:', error);
        }
      }

      // Fallback for web or when plugin is not available
      return {
        enabled: 'bluetooth' in navigator,
        permissions
      };

    } catch (error) {
      console.error('❌ Bluetooth status check failed:', error);
      return {
        enabled: false,
        permissions: {
          bluetooth: false,
          bluetoothConnect: false,
          bluetoothScan: false,
          location: false
        }
      };
    }
  }

  async showBluetoothInstructions(): Promise<void> {
    console.log(`
🔵 BLUETOOTH SETUP INSTRUCTIONS:

1. 📱 Open Android Settings
2. 🔍 Navigate to "Connected devices" or "Bluetooth & device connection"
3. 🔵 Enable Bluetooth if it's disabled
4. ⚙️ Grant location permissions (required for Bluetooth scanning on Android 6+)
5. 🔄 Return to the app and try scanning again

Common issues:
- Location services must be ON for Bluetooth scanning
- App needs location permission even for Bluetooth
- Some devices require "Nearby devices" permission
- Try restarting Bluetooth if scanning fails

If problems persist:
- Clear Bluetooth cache in Android Settings > Apps > Bluetooth
- Restart the device
- Check if OBD2 adapter is in pairing mode
    `);
  }
}

export const androidBluetoothPermissionService = AndroidBluetoothPermissionService.getInstance();