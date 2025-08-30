
import { BluetoothDevice } from './bluetooth/types';
import { comprehensiveBluetoothService } from './ComprehensiveBluetoothService';
import { bluetoothConnectionManager } from './BluetoothConnectionManager';

export interface ConnectionResult {
  success: boolean;
  device?: BluetoothDevice;
  strategy?: string;
  error?: string;
}

export class EnhancedConnectionService {
  private static instance: EnhancedConnectionService;
  private problematicDevices = new Set<string>();
  private deviceConnectionHistory = new Map<string, number>();

  static getInstance(): EnhancedConnectionService {
    if (!EnhancedConnectionService.instance) {
      EnhancedConnectionService.instance = new EnhancedConnectionService();
    }
    return EnhancedConnectionService.instance;
  }

  async discoverDevicesWithPermissions(): Promise<BluetoothDevice[]> {
    console.log('Discovering devices with enhanced permissions...');
    
    try {
      // Use the comprehensive Bluetooth service for real device discovery
      const result = await comprehensiveBluetoothService.scanForDevices(15000);
      
      console.log(`Found ${result.length} devices`);
      return result;

    } catch (error) {
      console.error('Device discovery failed:', error);
      throw error;
    }
  }

  async connectWithStrategies(device: BluetoothDevice): Promise<ConnectionResult> {
    console.log(`Connecting to ${device.name} with multiple strategies...`);

    const strategies = [
      { name: 'Direct Connection', timeout: 10000 },
      { name: 'Secure Connection', timeout: 15000 },
      { name: 'Insecure Fallback', timeout: 20000 }
    ];

    for (const strategy of strategies) {
      try {
        console.log(`Trying ${strategy.name}...`);
        
        // Use the comprehensive Bluetooth service for real connection attempts
        const result = await comprehensiveBluetoothService.connectToDevice(device, strategy.timeout);
        
        if (result.success) {
          // Update connection manager
          bluetoothConnectionManager.setConnected(device);
          
          return {
            success: true,
            device: result.device || device,
            strategy: strategy.name
          };
        }

      } catch (error) {
        console.warn(`${strategy.name} failed:`, error);
        continue;
      }
    }

    // Mark device as problematic
    this.problematicDevices.add(device.id);
    
    return {
      success: false,
      error: 'All connection strategies failed'
    };
  }

  isDeviceProblematic(deviceId: string): boolean {
    return this.problematicDevices.has(deviceId);
  }

  resetDeviceConnectionHistory(deviceId: string): void {
    this.deviceConnectionHistory.delete(deviceId);
    this.problematicDevices.delete(deviceId);
    console.log(`Reset connection history for device ${deviceId}`);
  }
}

export const enhancedConnectionService = EnhancedConnectionService.getInstance();
