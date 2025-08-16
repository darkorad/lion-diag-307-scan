
import { BluetoothDevice, ConnectionResult, ConnectionStatus, ConnectionHistory } from './MasterBluetoothService';

export class SafeMasterBluetoothService {
  private static instance: SafeMasterBluetoothService;
  private currentDevice: BluetoothDevice | null = null;
  private connectionHistory: ConnectionHistory[] = [];
  private problematicDevices = new Set<string>();
  private isInitialized = false;
  private initializationPromise: Promise<boolean> | null = null;

  static getInstance(): SafeMasterBluetoothService {
    if (!SafeMasterBluetoothService.instance) {
      SafeMasterBluetoothService.instance = new SafeMasterBluetoothService();
    }
    return SafeMasterBluetoothService.instance;
  }

  private async ensureInitialized(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.initialize();
    return this.initializationPromise;
  }

  private async initialize(): Promise<boolean> {
    try {
      console.log('Initializing SafeMasterBluetoothService...');
      
      // Wait for Capacitor to be ready on mobile
      if (window.Capacitor) {
        await new Promise(resolve => {
          if (window.Capacitor?.isPluginAvailable) {
            resolve(true);
          } else {
            setTimeout(resolve, 1000);
          }
        });
      }

      // Load connection history from storage
      this.loadConnectionHistory();
      
      this.isInitialized = true;
      console.log('SafeMasterBluetoothService initialized successfully');
      return true;
    } catch (error) {
      console.error('SafeMasterBluetoothService initialization failed:', error);
      return false;
    }
  }

  private loadConnectionHistory(): void {
    try {
      const stored = localStorage.getItem('bluetooth_connection_history');
      if (stored) {
        const data = JSON.parse(stored);
        this.connectionHistory = data.history || [];
        this.problematicDevices = new Set(data.problematic || []);
      }
    } catch (error) {
      console.warn('Failed to load connection history:', error);
    }
  }

  private saveConnectionHistory(): void {
    try {
      const data = {
        history: this.connectionHistory.slice(0, 50), // Keep last 50 entries
        problematic: Array.from(this.problematicDevices),
        timestamp: Date.now()
      };
      localStorage.setItem('bluetooth_connection_history', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save connection history:', error);
    }
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      
      // Check if Bluetooth is available
      if (window.bluetoothSerial) {
        return new Promise((resolve) => {
          window.bluetoothSerial.isEnabled(
            () => resolve(true),
            () => resolve(false)
          );
        });
      }
      
      // Fallback for web
      return true;
    } catch (error) {
      console.error('Error checking Bluetooth status:', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      
      if (window.bluetoothSerial) {
        return new Promise((resolve) => {
          window.bluetoothSerial.enable(
            () => {
              console.log('Bluetooth enabled successfully');
              resolve(true);
            },
            (error) => {
              console.error('Failed to enable Bluetooth:', error);
              resolve(false);
            }
          );
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error enabling Bluetooth:', error);
      return false;
    }
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      await this.ensureInitialized();
      console.log('Scanning for Bluetooth devices...');
      
      // Check if Bluetooth is enabled first
      const isEnabled = await this.isBluetoothEnabled();
      if (!isEnabled) {
        console.warn('Bluetooth not enabled, returning mock devices');
        return this.getMockDevices();
      }
      
      // Return mock devices for now (replace with actual scanning later)
      return this.getMockDevices();
    } catch (error) {
      console.error('Device scan failed:', error);
      return [];
    }
  }

  private getMockDevices(): BluetoothDevice[] {
    return [
      {
        id: 'mock-device-1',
        address: '00:1D:A5:68:98:8B',
        name: 'ELM327 OBD2',
        isPaired: true,
        isConnected: false,
        deviceType: 'ELM327',
        compatibility: 0.95,
        rssi: -45
      },
      {
        id: 'mock-device-2', 
        address: '00:1D:A5:68:98:8C',
        name: 'Vgate iCar Pro',
        isPaired: false,
        isConnected: false,
        deviceType: 'OBD2',
        compatibility: 0.85,
        rssi: -60
      }
    ];
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      await this.ensureInitialized();
      console.log(`Connecting to device: ${device.name}`);
      
      const startTime = Date.now();
      
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.currentDevice = { ...device, isConnected: true };
      const connectionTime = Date.now() - startTime;
      
      // Add to connection history
      const historyEntry: ConnectionHistory = {
        deviceName: device.name,
        deviceId: device.id,
        connectionTime: Date.now(),
        success: true,
        dataReceived: true
      };
      
      this.connectionHistory.unshift(historyEntry);
      this.saveConnectionHistory();
      
      return {
        success: true,
        device: this.currentDevice,
        strategy: 'safe_connection',
        connectionTime
      };
    } catch (error) {
      console.error('Connection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
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

  getConnectionHistory(): ConnectionHistory[] {
    return [...this.connectionHistory];
  }

  isDeviceProblematic(address: string): boolean {
    return this.problematicDevices.has(address);
  }

  resetDeviceHistory(address: string): void {
    this.problematicDevices.delete(address);
    this.saveConnectionHistory();
    console.log(`Reset device history for ${address}`);
  }

  isConnectedToDevice(): boolean {
    return this.currentDevice?.isConnected || false;
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.currentDevice;
  }
}

export const safeMasterBluetoothService = SafeMasterBluetoothService.getInstance();
