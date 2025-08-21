import { unifiedBluetoothService } from './UnifiedBluetoothService';
import { BluetoothDevice, ConnectionResult, ConnectionStatus } from './MasterBluetoothService';

// This service is now a wrapper around the UnifiedBluetoothService.
// This is to ensure that all parts of the app use the same Bluetooth logic.
// The long-term goal should be to refactor the components to use the UnifiedBluetoothService directly.

export class MobileSafeBluetoothService {
  private static instance: MobileSafeBluetoothService;

  static getInstance(): MobileSafeBluetoothService {
    if (!MobileSafeBluetoothService.instance) {
      MobileSafeBluetoothService.instance = new MobileSafeBluetoothService();
    }
    return MobileSafeBluetoothService.instance;
  }

  async isBluetoothEnabled(): Promise<boolean> {
    return unifiedBluetoothService.isBluetoothEnabled();
  }

  async enableBluetooth(): Promise<boolean> {
    return unifiedBluetoothService.enableBluetooth();
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    return unifiedBluetoothService.scanForDevices();
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    return unifiedBluetoothService.connectToDevice(device);
  }

  async disconnect(): Promise<boolean> {
    return unifiedBluetoothService.disconnect();
  }

  async sendCommand(command: string): Promise<string> {
    return unifiedBluetoothService.sendCommand(command);
  }

  getConnectionStatus(): ConnectionStatus {
    return unifiedBluetoothService.getConnectionStatus();
  }

  isConnected(): boolean {
    return unifiedBluetoothService.isConnectedToDevice();
  }

  getConnectedDevice(): BluetoothDevice | null {
    return unifiedBluetoothService.getConnectedDevice();
  }
}

export const mobileSafeBluetoothService = MobileSafeBluetoothService.getInstance();
export type { BluetoothDevice, ConnectionResult, ConnectionStatus };
