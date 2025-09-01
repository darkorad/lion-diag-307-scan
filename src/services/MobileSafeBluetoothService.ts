import { BluetoothDevice, ConnectionStatus } from './bluetooth/types';

export type { BluetoothDevice };

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

  public async initialize(): Promise<boolean> {
    return true;
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

  public getConnectionStatus(): ConnectionStatus {
    if (this.connectedDevice?.isConnected) {
      return 'connected';
    }
    return 'disconnected';
  }

  public async sendCommand(command: string): Promise<string> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }
    return `Response to ${command}`;
  }
}

export const mobileSafeBluetoothService = MobileSafeBluetoothService.getInstance();
