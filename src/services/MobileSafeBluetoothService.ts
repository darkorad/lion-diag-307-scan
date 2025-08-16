
import { Capacitor } from '@capacitor/core';

export interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
  isPaired: boolean;
  isConnected?: boolean;
  deviceType?: 'ELM327' | 'OBD2' | 'Generic';
  compatibility?: number;
  rssi?: number;
}

export interface ConnectionResult {
  success: boolean;
  device?: BluetoothDevice;
  error?: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  device?: BluetoothDevice;
  lastConnected?: Date;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
}

export class MobileSafeBluetoothService {
  private static instance: MobileSafeBluetoothService;
  private currentDevice: BluetoothDevice | null = null;
  private isInitialized = false;

  static getInstance(): MobileSafeBluetoothService {
    if (!MobileSafeBluetoothService.instance) {
      MobileSafeBluetoothService.instance = new MobileSafeBluetoothService();
    }
    return MobileSafeBluetoothService.instance;
  }

  private constructor() {}

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      console.log('Initializing MobileSafeBluetoothService...');
      
      // Wait for Capacitor to be ready on mobile
      if (Capacitor.isNativePlatform()) {
        console.log('Running on native platform');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log('Running on web platform');
      }

      this.isInitialized = true;
      console.log('MobileSafeBluetoothService initialized successfully');
      return true;
    } catch (error) {
      console.error('MobileSafeBluetoothService initialization failed:', error);
      return false;
    }
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      await this.initialize();
      
      if (Capacitor.isNativePlatform() && window.bluetoothSerial?.isEnabled) {
        return new Promise((resolve) => {
          window.bluetoothSerial.isEnabled(
            () => resolve(true),
            () => resolve(false)
          );
        });
      }
      
      // Return true for web to avoid blocking
      return true;
    } catch (error) {
      console.warn('Error checking Bluetooth status:', error);
      return false;
    }
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      await this.initialize();
      console.log('Scanning for Bluetooth devices...');
      
      if (Capacitor.isNativePlatform() && window.bluetoothSerial?.list) {
        return new Promise((resolve) => {
          window.bluetoothSerial.list(
            (devices) => {
              console.log('Found paired devices:', devices);
              const bluetoothDevices = devices.map(device => ({
                id: device.address,
                name: device.name || 'Unknown Device',
                address: device.address,
                isPaired: true,
                deviceType: this.identifyDeviceType(device.name) as 'ELM327' | 'OBD2' | 'Generic',
                compatibility: this.getCompatibilityScore(device.name)
              }));
              resolve(bluetoothDevices);
            },
            (error) => {
              console.warn('Bluetooth scan error:', error);
              resolve([]);
            }
          );
        });
      }
      
      // Return empty array for web
      console.log('Bluetooth not available on this platform');
      return [];
    } catch (error) {
      console.error('Device scan failed:', error);
      return [];
    }
  }

  private identifyDeviceType(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('elm327') || lowerName.includes('obd') || lowerName.includes('vgate')) {
      return 'ELM327';
    }
    if (lowerName.includes('diagnostic') || lowerName.includes('scan')) {
      return 'OBD2';
    }
    return 'Generic';
  }

  private getCompatibilityScore(name: string): number {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('elm327') || lowerName.includes('obd')) {
      return 0.9;
    }
    if (lowerName.includes('vgate') || lowerName.includes('diagnostic')) {
      return 0.7;
    }
    return 0.3;
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      await this.initialize();
      console.log(`Connecting to device: ${device.name}`);
      
      if (Capacitor.isNativePlatform() && window.bluetoothSerial?.connect) {
        return new Promise((resolve) => {
          window.bluetoothSerial.connect(
            device.address,
            () => {
              console.log('Successfully connected to device:', device.address);
              this.currentDevice = { ...device, isConnected: true };
              resolve({
                success: true,
                device: this.currentDevice
              });
            },
            (error) => {
              console.error('Failed to connect to device:', error);
              resolve({
                success: false,
                error: error || 'Connection failed'
              });
            }
          );
        });
      }
      
      // Mock success for web
      this.currentDevice = { ...device, isConnected: true };
      return {
        success: true,
        device: this.currentDevice
      };
    } catch (error) {
      console.error('Connection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform() && window.bluetoothSerial?.disconnect && this.currentDevice) {
        return new Promise((resolve) => {
          window.bluetoothSerial.disconnect(
            () => {
              console.log('Disconnected from device');
              this.currentDevice = null;
              resolve(true);
            },
            (error) => {
              console.error('Disconnect error:', error);
              this.currentDevice = null;
              resolve(false);
            }
          );
        });
      }
      
      this.currentDevice = null;
      return true;
    } catch (error) {
      console.error('Disconnect failed:', error);
      this.currentDevice = null;
      return false;
    }
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.currentDevice?.isConnected) {
      throw new Error('Not connected to device');
    }
    
    console.log(`Sending command: ${command}`);
    
    if (Capacitor.isNativePlatform() && window.bluetoothSerial?.write) {
      // Real implementation for native
      return new Promise((resolve, reject) => {
        let responseData = '';
        const timeout = setTimeout(() => {
          reject(new Error('Command timeout'));
        }, 5000);

        const onData = (data: string) => {
          responseData += data;
          if (data.includes('>') || data.includes('NO DATA') || data.includes('ERROR')) {
            clearTimeout(timeout);
            window.bluetoothSerial.unsubscribe(() => {}, () => {});
            resolve(responseData.trim());
          }
        };

        window.bluetoothSerial.subscribe('\r', onData, (error) => {
          clearTimeout(timeout);
          reject(new Error(error));
        });

        window.bluetoothSerial.write(command + '\r', () => {
          console.log(`Command sent: ${command}`);
        }, (error) => {
          clearTimeout(timeout);
          reject(new Error(error));
        });
      });
    }
    
    // Mock response for web
    await new Promise(resolve => setTimeout(resolve, 100));
    return `41 ${command.substring(2)} FF FF`;
  }

  getConnectionStatus(): ConnectionStatus {
    return {
      isConnected: this.currentDevice?.isConnected || false,
      device: this.currentDevice || undefined,
      quality: 'unknown'
    };
  }

  isConnected(): boolean {
    return this.currentDevice?.isConnected || false;
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.currentDevice;
  }
}

export const mobileSafeBluetoothService = MobileSafeBluetoothService.getInstance();
