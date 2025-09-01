import { BluetoothDevice } from './bluetooth/types';
import { ConnectionStatus } from './bluetooth/types';

class MobileSafeBluetoothService {
  private static instance: MobileSafeBluetoothService;
  private connectedDevice: BluetoothDevice | null = null;

  private constructor() {}

  public static getInstance(): MobileSafeBluetoothService {
    if (!MobileSafeBluetoothService.instance) {
      MobileSafeBluetoothService.instance = new MobileSafeBluetoothService();
    }
    return MobileSafeBluetoothService.instance;
  }

  public setConnectedDevice(device: BluetoothDevice): void {
    this.connectedDevice = { ...device, isConnected: true };
  }

  public clearConnectedDevice(): void {
    if (this.connectedDevice) {
      this.connectedDevice.isConnected = false;
    }
    this.connectedDevice = null;
  }

  public getDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  getConnectionStatus(): ConnectionStatus {
    if (this.connectedDevice?.isConnected) {
      return 'connected';
    }
    return 'disconnected';
  }
}

export const mobileSafeBluetoothService = MobileSafeBluetoothService.getInstance();
