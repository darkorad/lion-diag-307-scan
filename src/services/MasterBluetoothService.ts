
export interface BluetoothDevice {
  id: string;
  address: string;
  name: string;
  isPaired: boolean;
  isConnected: boolean;
  deviceType: 'ELM327' | 'OBD2' | 'Generic';
  compatibility: number;
  rssi?: number;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ConnectionResult {
  success: boolean;
  device?: BluetoothDevice;
  error?: string;
  strategy?: string;
  connectionTime?: number;
}

export interface ConnectionStatus {
  isConnected: boolean;
  device?: BluetoothDevice;
  lastConnected?: Date;
  quality?: string;
}

export interface ConnectionHistory {
  deviceName: string;
  deviceId: string;
  connectionTime: number;
  success: boolean;
  dataReceived?: boolean;
}

export class MasterBluetoothService {
  private static instance: MasterBluetoothService;
  private currentDevice: BluetoothDevice | null = null;
  private connectionHistory: ConnectionHistory[] = [];
  private problematicDevices = new Set<string>();

  static getInstance(): MasterBluetoothService {
    if (!MasterBluetoothService.instance) {
      MasterBluetoothService.instance = new MasterBluetoothService();
    }
    return MasterBluetoothService.instance;
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      // Mock implementation for now
      return true;
    } catch (error) {
      console.error('Error checking Bluetooth status:', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    try {
      // Mock implementation for now
      console.log('Enabling Bluetooth...');
      return true;
    } catch (error) {
      console.error('Error enabling Bluetooth:', error);
      return false;
    }
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    console.log('Scanning for Bluetooth devices...');
    
    try {
      // Mock implementation for now
      const mockDevices: BluetoothDevice[] = [
        {
          id: 'device-1',
          address: '00:1D:A5:68:98:8B',
          name: 'ELM327 OBD2',
          isPaired: true,
          isConnected: false,
          deviceType: 'ELM327',
          compatibility: 0.95,
          rssi: -45
        },
        {
          id: 'device-2', 
          address: '00:1D:A5:68:98:8C',
          name: 'Vgate iCar Pro',
          isPaired: false,
          isConnected: false,
          deviceType: 'OBD2',
          compatibility: 0.85,
          rssi: -60
        }
      ];
      
      return mockDevices;
    } catch (error) {
      console.error('Device scan failed:', error);
      throw error;
    }
  }

  async discoverAllDevices(): Promise<BluetoothDevice[]> {
    return this.scanForDevices();
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    console.log(`Connecting to device: ${device.name}`);
    const startTime = Date.now();
    
    try {
      // Mock connection logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.currentDevice = { ...device, isConnected: true };
      const connectionTime = Date.now() - startTime;
      
      // Add to connection history
      this.connectionHistory.unshift({
        deviceName: device.name,
        deviceId: device.id,
        connectionTime: Date.now(),
        success: true,
        dataReceived: true
      });
      
      return {
        success: true,
        device: this.currentDevice,
        strategy: 'direct',
        connectionTime
      };
    } catch (error) {
      console.error('Connection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        connectionTime: Date.now() - startTime
      };
    }
  }

  getConnectionStatus(): ConnectionStatus {
    return {
      isConnected: this.currentDevice?.isConnected || false,
      device: this.currentDevice || undefined,
      lastConnected: this.connectionHistory[0] ? new Date(this.connectionHistory[0].connectionTime) : undefined,
      quality: this.currentDevice?.connectionQuality || 'unknown'
    };
  }

  getConnectionHistory(): ConnectionHistory[] {
    return [...this.connectionHistory];
  }

  isDeviceProblematic(address: string): boolean {
    return this.problematicDevices.has(address);
  }

  resetDeviceHistory(address: string): void {
    this.problematicDevices.delete(address);
    console.log(`Reset device history for ${address}`);
  }

  isConnectedToDevice(): boolean {
    return this.currentDevice?.isConnected || false;
  }

  async disconnect(): Promise<boolean> {
    try {
      if (this.currentDevice) {
        this.currentDevice.isConnected = false;
        this.currentDevice = null;
      }
      return true;
    } catch (error) {
      console.error('Disconnect failed:', error);
      return false;
    }
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.currentDevice?.isConnected) {
      throw new Error('Not connected to device');
    }
    
    console.log(`Sending command: ${command}`);
    
    // Mock response
    await new Promise(resolve => setTimeout(resolve, 100));
    return `41 ${command.substring(2)} FF FF`;
  }

  async checkBluetoothStatus(): Promise<boolean> {
    return this.isBluetoothEnabled();
  }

  async requestPermissions(): Promise<boolean> {
    return true;
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.currentDevice;
  }
}

export const masterBluetoothService = MasterBluetoothService.getInstance();
