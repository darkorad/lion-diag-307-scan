import { Capacitor } from '@capacitor/core';
import { BluetoothSerial, BluetoothState, BluetoothScanResult, BluetoothConnectOptions, BluetoothReadResult, BluetoothWriteOptions } from '@e-is/capacitor-bluetooth-serial';

export interface BluetoothDevice {
  id: string; // mac address
  name: string;
  address: string; // mac address
  class?: number; // Class of device
  isPaired?: boolean; // not provided by new plugin, will need to manage this
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
  private initPromise: Promise<boolean> | null = null;
  private isNative = false;
  private dataListener: any = null; // To hold the listener instance
  private incomingDataBuffer: string = "";
  private resolveCommand: ((value: string | PromiseLike<string>) => void) | null = null;


  static getInstance(): MobileSafeBluetoothService {
    if (!MobileSafeBluetoothService.instance) {
      MobileSafeBluetoothService.instance = new MobileSafeBluetoothService();
    }
    return MobileSafeBluetoothService.instance;
  }

  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
    console.log(`MobileSafeBluetoothService - Platform: ${Capacitor.getPlatform()}, Native: ${this.isNative}`);
    this.initialize();
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    if (this.initPromise) {
      return this.initPromise;
    }
    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  private async performInitialization(): Promise<boolean> {
    if (!this.isNative) {
        this.isInitialized = true;
        return true;
    }
    console.log('Initializing MobileSafeBluetoothService...');
    // The new plugin doesn't require explicit initialization call.
    // We can set up listeners here if needed.
    this.isInitialized = true;
    console.log('MobileSafeBluetoothService initialized successfully.');
    return true;
  }

  private setupDataListener() {
    if (this.dataListener) {
      this.dataListener.remove();
    }
    this.dataListener = BluetoothSerial.addListener('onRead', (data: { value: string }) => {
        console.log('Received data from bluetooth:', data.value);
        this.incomingDataBuffer += data.value;

        // If there is a pending command, check if the response is complete
        if (this.resolveCommand) {
            // This is a simplified response handling. In a real OBD2 app, this would be more complex.
            // We'll assume the response ends with a '>' character.
            if (this.incomingDataBuffer.includes('>')) {
                const response = this.incomingDataBuffer;
                this.incomingDataBuffer = "";
                this.resolveCommand(response);
                this.resolveCommand = null;
            }
        }
    });
  }

  async isBluetoothEnabled(): Promise<boolean> {
    if (!this.isNative) return true;
    try {
      const result = await BluetoothSerial.isEnabled();
      return result.enabled;
    } catch (error) {
      console.error('Error checking bluetooth status', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    if (!this.isNative) return true;
    try {
      const result = await BluetoothSerial.enable();
      return result.enabled;
    } catch (error) {
      console.error('Error enabling bluetooth', error);
      return false;
    }
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    if (!this.isNative) return [];
    try {
      const result: BluetoothScanResult = await BluetoothSerial.scan();
      return result.devices.map(d => ({
        id: d.id,
        address: d.id, // The new plugin uses 'id' for the mac address
        name: d.name || 'Unknown Device',
        class: d.class,
        isPaired: false, // This information is not available from the new plugin's scan
        deviceType: this.identifyDeviceType(d.name),
        compatibility: this.getCompatibilityScore(d.name),
      }));
    } catch (error) {
      console.error('Error scanning for devices', error);
      return [];
    }
  }

  private identifyDeviceType(name: string): string {
    if (!name) return 'Generic';
    const lowerName = name.toLowerCase();
    if (lowerName.includes('elm327') || lowerName.includes('obd') || lowerName.includes('vgate') || 
        lowerName.includes('icar') || lowerName.includes('viecar') || lowerName.includes('konnwei')) {
      return 'ELM327';
    }
    if (lowerName.includes('diagnostic') || lowerName.includes('scan')) {
      return 'OBD2';
    }
    return 'Generic';
  }

  private getCompatibilityScore(name: string): number {
    if (!name) return 0.3;
    const lowerName = name.toLowerCase();
    if (lowerName.includes('elm327') || lowerName.includes('obd')) {
      return 0.9;
    }
    if (lowerName.includes('vgate') || lowerName.includes('diagnostic') || lowerName.includes('icar')) {
      return 0.7;
    }
    return 0.3;
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    if (!this.isNative) {
      this.currentDevice = { ...device, isConnected: true };
      return { success: true, device: this.currentDevice };
    }
    try {
      // The new plugin doesn't have a separate 'connectInsecure'. We assume 'connect' handles both cases.
      await BluetoothSerial.connect({ address: device.address });
      this.currentDevice = { ...device, isConnected: true };
      this.setupDataListener(); // Setup listener after successful connection
      return { success: true, device: this.currentDevice };
    } catch (error) {
      console.error(`Error connecting to ${device.address}`, error);
      return { success: false, error: (error as Error).message };
    }
  }

  async disconnect(): Promise<boolean> {
    if (!this.isNative || !this.currentDevice) return true;
    try {
      await BluetoothSerial.disconnect({ address: this.currentDevice.address });
      if (this.dataListener) {
        this.dataListener.remove();
        this.dataListener = null;
      }
      this.currentDevice = null;
      return true;
    } catch (error) {
      console.error('Error disconnecting', error);
      return false;
    }
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.currentDevice?.isConnected) {
      throw new Error('Not connected to device');
    }

    if (this.isNative) {
      return new Promise(async (resolve, reject) => {
        try {
          this.resolveCommand = resolve;
          this.incomingDataBuffer = ""; // Clear buffer before sending new command
          await BluetoothSerial.write({ address: this.currentDevice!.address, value: command + '\r' });

          // Set a timeout for the command response
          setTimeout(() => {
            if (this.resolveCommand) {
              this.resolveCommand = null;
              reject(new Error('Command timeout'));
            }
          }, 5000); // 5 second timeout

        } catch (error) {
          console.error('Error writing to device', error);
          this.resolveCommand = null;
          reject(error);
        }
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
