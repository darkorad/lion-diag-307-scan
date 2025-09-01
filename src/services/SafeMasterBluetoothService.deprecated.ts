import { BluetoothDevice } from './bluetooth/types';
import { ConnectionStatus, ConnectionResult, ConnectionHistory } from './bluetooth/types';
import { Emitter } from '../utils/emitter';

export type BluetoothServiceEvent = {
  deviceFound: BluetoothDevice;
  scanStarted: void;
  scanStopped: void;
  connected: BluetoothDevice;
  disconnected: void;
};

class SafeMasterBluetoothService {
  private static instance: SafeMasterBluetoothService;
  private isInitialized = false;
  private isScanning = false;
  private discoveredDevices: Map<string, BluetoothDevice> = new Map();
  private connectedDevice: BluetoothDevice | null = null;
  private connectionHistory: ConnectionHistory[] = [];
  public emitter = new Emitter<BluetoothServiceEvent>();

  private constructor() {
    this.loadConnectionHistory();
  }

  public static getInstance(): SafeMasterBluetoothService {
    if (!SafeMasterBluetoothService.instance) {
      SafeMasterBluetoothService.instance = new SafeMasterBluetoothService();
    }
    return SafeMasterBluetoothService.instance;
  }

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    console.log('🔧 Initializing Safe Master Bluetooth Service...');
    try {
      this.isInitialized = true;
      console.log('✅ Safe Master Bluetooth service initialized');
      return true;
    } catch (error) {
      console.error('❌ Safe Master Bluetooth initialization failed:', error);
      return false;
    }
  }

  public async checkBluetoothStatus(): Promise<{ enabled: boolean; hasPermissions: boolean }> {
    return { enabled: true, hasPermissions: true };
  }

  public async requestPermissions(): Promise<{ granted: boolean; message: string }> {
    return { granted: true, message: 'Permissions granted' };
  }

  public async enableBluetooth(): Promise<{ requested: boolean; message: string }> {
    return { requested: true, message: 'Bluetooth enabled' };
  }

  public async scanForDevices(): Promise<BluetoothDevice[]> {
    this.isScanning = true;
    this.discoveredDevices.clear();
    this.emitter.emit('scanStarted', undefined);

    // Simulate device discovery
    const mockDevices: BluetoothDevice[] = [
      {
        id: '1',
        address: '00:11:22:33:44:55',
        name: 'OBDII Device 1',
        isPaired: true,
        isConnected: false,
        deviceType: 'OBD2',
        compatibility: 90,
      },
      {
        id: '2',
        address: 'AA:BB:CC:DD:EE:FF',
        name: 'ELM327 Device',
        isPaired: false,
        isConnected: false,
        deviceType: 'ELM327',
        compatibility: 80,
      },
    ];

    mockDevices.forEach(device => {
      this.discoveredDevices.set(device.address, device);
      this.emitter.emit('deviceFound', device);
    });

    setTimeout(() => {
      this.isScanning = false;
      this.emitter.emit('scanStopped', undefined);
    }, 3000);

    return Array.from(this.discoveredDevices.values());
  }

  public async stopDiscovery(): Promise<boolean> {
    this.isScanning = false;
    this.emitter.emit('scanStopped', undefined);
    return true;
  }

  public async getPairedDevices(): Promise<BluetoothDevice[]> {
    return Array.from(this.discoveredDevices.values()).filter(device => device.isPaired);
  }

  public async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connectedDevice = { ...device, isConnected: true };
        this.emitter.emit('connected', this.connectedDevice);
        this.addConnectionToHistory(device, true);
        resolve({ success: true, device });
      }, 1000);
    });
  }

  public async disconnect(): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.connectedDevice) {
          this.addConnectionToHistory(this.connectedDevice, false);
          this.connectedDevice.isConnected = false;
        }
        this.connectedDevice = null;
        this.emitter.emit('disconnected', undefined);
        resolve(true);
      }, 500);
    });
  }

  public async sendCommand(command: string, timeout?: number): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!this.connectedDevice) {
          reject(new Error('No device connected'));
          return;
        }
        const response = `Response to ${command}`;
        resolve(response);
      }, 200);
    });
  }

  public getDiscoveredDevices(): BluetoothDevice[] {
    return Array.from(this.discoveredDevices.values());
  }

  public getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  public isDeviceScanning(): boolean {
    return this.isScanning;
  }

  getConnectionStatus(): ConnectionStatus {
    if (this.connectedDevice?.isConnected) {
      return 'connected';
    }
    return 'disconnected';
  }

  private addConnectionToHistory(device: BluetoothDevice, success: boolean, error?: string): void {
    const historyEntry: ConnectionHistory = {
      deviceId: device.id,
      timestamp: new Date(),
      connectionTime: Date.now(),
      success,
      error
    };

    this.connectionHistory.unshift(historyEntry);
    if (this.connectionHistory.length > 10) {
      this.connectionHistory = this.connectionHistory.slice(0, 10);
    }

    this.saveConnectionHistory();
  }

  public getConnectionHistory(): ConnectionHistory[] {
    return this.connectionHistory;
  }

  private loadConnectionHistory(): void {
    try {
      const storedHistory = localStorage.getItem('connectionHistory');
      if (storedHistory) {
        this.connectionHistory = JSON.parse(storedHistory);
        this.connectionHistory.forEach(entry => {
          entry.timestamp = new Date(entry.timestamp);
        });
      }
    } catch (error) {
      console.error('Failed to load connection history:', error);
    }
  }

  private saveConnectionHistory(): void {
    try {
      localStorage.setItem('connectionHistory', JSON.stringify(this.connectionHistory));
    } catch (error) {
      console.error('Failed to save connection history:', error);
    }
  }
}

export const safeMasterBluetoothService = SafeMasterBluetoothService.getInstance();
