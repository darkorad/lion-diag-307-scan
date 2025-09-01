import { enhancedAndroidBluetoothService } from './EnhancedAndroidBluetoothService';

class EnhancedOBD2Service {
  private static instance: EnhancedOBD2Service;
  private connectionService = enhancedAndroidBluetoothService;

  private constructor() {}

  public static getInstance(): EnhancedOBD2Service {
    if (!EnhancedOBD2Service.instance) {
      EnhancedOBD2Service.instance = new EnhancedOBD2Service();
    }
    return EnhancedOBD2Service.instance;
  }

  public async initialize(): Promise<boolean> {
    return this.connectionService.initialize();
  }

  public async scanForDevices(): Promise<BluetoothDevice[]> {
    return this.connectionService.scanForDevices();
  }

  public async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    return this.connectionService.connectToDevice(device);
  }

  public async disconnect(): Promise<boolean> {
    return this.connectionService.disconnect();
  }

  public async sendCommand(command: string, timeout?: number): Promise<string> {
    return this.connectionService.sendCommand(command, timeout);
  }

  public async getDeviceInfo(): Promise<BluetoothDevice | null> {
    return this.connectionService.getConnectedDevice();
  }

  public async getPairedDevices(): Promise<BluetoothDevice[]> {
    return this.connectionService.getPairedDevices();
  }

  public async checkBluetoothStatus() {
    return this.connectionService.checkBluetoothStatus();
  }

  public async requestPermissions() {
    return this.connectionService.requestPermissions();
  }

  public async enableBluetooth() {
    return this.connectionService.enableBluetooth();
  }

  async sendRawCommand(command: string): Promise<string> {
    const response = await this.connectionService.sendCommand(command);
    return response;
  }
}

export const enhancedOBD2Service = EnhancedOBD2Service.getInstance();

