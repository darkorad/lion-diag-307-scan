
import { BluetoothDevice, ConnectionResult, ConnectionStatus, ConnectionHistory } from './MasterBluetoothService';

export class SafeMasterBluetoothService {
  private static instance: SafeMasterBluetoothService;
  private currentDevice: BluetoothDevice | null = null;
  private connectionHistory: ConnectionHistory[] = [];
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
      if (typeof window !== 'undefined' && window.Capacitor) {
        try {
          // Check if we're on a native platform
          if (window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
            // Wait a bit for plugins to be ready
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.warn('Capacitor platform check failed:', error);
        }
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
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      
      const stored = localStorage.getItem('bluetooth_connection_history');
      if (stored) {
        const data = JSON.parse(stored);
        this.connectionHistory = Array.isArray(data.history) ? data.history : [];
      }
    } catch (error) {
      console.warn('Failed to load connection history:', error);
      this.connectionHistory = [];
    }
  }

  private saveConnectionHistory(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      
      const data = {
        history: this.connectionHistory.slice(0, 50), // Keep last 50 entries
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
      if (typeof window !== 'undefined' && window.bluetoothSerial) {
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
      
      if (typeof window !== 'undefined' && window.bluetoothSerial) {
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
        console.warn('Bluetooth not enabled');
        return [];
      }
      
      // Return empty array for now - real implementation would scan for devices
      return [];
    } catch (error) {
      console.error('Device scan failed:', error);
      return [];
    }
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      await this.ensureInitialized();
      console.log(`Connecting to device: ${device.name}`);
      
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.currentDevice = { ...device, isConnected: true };
      
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
        strategy: 'safe_connection'
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
        console.log('Disconnecting from device:', this.currentDevice.name);
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
    
    // Mock response for testing
    await new Promise(resolve => setTimeout(resolve, 100));
    return `41 ${command.substring(2)} FF FF`;
  }

  getConnectionHistory(): ConnectionHistory[] {
    return [...this.connectionHistory];
  }

  isConnectedToDevice(): boolean {
    return this.currentDevice?.isConnected || false;
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.currentDevice;
  }
}

export const safeMasterBluetoothService = SafeMasterBluetoothService.getInstance();
