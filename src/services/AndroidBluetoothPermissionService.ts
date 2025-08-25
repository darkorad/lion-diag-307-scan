
import { Capacitor } from '@capacitor/core';

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

      // Check if our custom Bluetooth plugin is available
      if ((window as any).CustomBluetoothSerial) {
        console.log('📱 CustomBluetoothSerial plugin found, requesting permissions...');
        
        try {
          // Try to use our custom plugin to request permissions
          const result = await (window as any).CustomBluetoothSerial.requestPermissions();
          console.log('✅ Custom Bluetooth permissions result:', result);
          return result.granted || false;
        } catch (error) {
          console.error('❌ Custom Bluetooth permission request failed:', error);
        }
      }

      // Fallback: Try to enable Bluetooth through system dialog
      console.log('⚠️ Using fallback Bluetooth enable method');
      return await this.requestSystemBluetoothEnable();

    } catch (error) {
      console.error('❌ Bluetooth permission request failed:', error);
      return false;
    }
  }

  private async requestSystemBluetoothEnable(): Promise<boolean> {
    try {
      // On Android, we need to request the user to enable Bluetooth
      // This would typically show a system dialog
      console.log('🔵 Requesting system Bluetooth enable...');

      // For now, we'll return true and let the user manually enable it
      // In a real implementation, this would trigger the Android Bluetooth enable dialog
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
        // Check if CustomBluetoothSerial plugin is available
        if ((window as any).CustomBluetoothSerial) {
          try {
            const status = await (window as any).CustomBluetoothSerial.getStatus();
            console.log('📊 Bluetooth status from plugin:', status);
            
            return {
              enabled: status.enabled || false,
              permissions: {
                bluetooth: status.permissions?.bluetooth || false,
                bluetoothConnect: status.permissions?.connect || false,
                bluetoothScan: status.permissions?.scan || false,
                location: status.permissions?.location || false
              }
            };
          } catch (error) {
            console.error('❌ Failed to get Bluetooth status from plugin:', error);
          }
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
