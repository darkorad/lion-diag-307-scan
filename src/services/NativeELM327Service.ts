
import { CapBluetooth } from '@/plugins/CapBluetooth';
import { BluetoothDevice } from './bluetooth/types';

export interface ELM327Response {
  success: boolean;
  data?: string;
  error?: string;
}

export interface ScanResult {
  devices: BluetoothDevice[];
  success: boolean;
  error?: string;
}

export class NativeELM327Service {
  private static instance: NativeELM327Service;
  private isConnected = false;
  private connectedDevice: BluetoothDevice | null = null;
  private discoveredDevices: BluetoothDevice[] = [];

  static getInstance(): NativeELM327Service {
    if (!NativeELM327Service.instance) {
      NativeELM327Service.instance = new NativeELM327Service();
    }
    return NativeELM327Service.instance;
  }

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    CapBluetooth.addListener('deviceFound', (event) => {
      console.log('📱 Native: Device found:', event);
      const device: BluetoothDevice = {
        id: event.address,
        address: event.address,
        name: event.name,
        isPaired: event.bonded,
        isConnected: false,
        deviceType: this.detectDeviceType(event.name),
        compatibility: this.calculateCompatibility(event.name),
        rssi: event.rssi
      };
      
      // Avoid duplicates
      const existingIndex = this.discoveredDevices.findIndex(d => d.address === device.address);
      if (existingIndex >= 0) {
        this.discoveredDevices[existingIndex] = device;
      } else {
        this.discoveredDevices.push(device);
      }
    });

    CapBluetooth.addListener('discoveryFinished', () => {
      console.log('📱 Native: Discovery finished');
    });

    CapBluetooth.addListener('connected', (event) => {
      console.log('📱 Native: Connected to', event.address);
      this.isConnected = true;
      if (this.connectedDevice) {
        this.connectedDevice.isConnected = true;
      }
    });

    CapBluetooth.addListener('disconnected', (event) => {
      console.log('📱 Native: Disconnected from', event.address);
      this.isConnected = false;
      if (this.connectedDevice) {
        this.connectedDevice.isConnected = false;
      }
    });

    CapBluetooth.addListener('error', (event) => {
      console.error('📱 Native: Bluetooth error:', event.message);
    });
  }

  private detectDeviceType(name: string): 'ELM327' | 'OBD2' | 'Generic' {
    if (!name) return 'Generic';
    const upperName = name.toUpperCase();
    
    if (upperName.includes('ELM327') || upperName.includes('ELM') || upperName.includes('VGATE')) {
      return 'ELM327';
    }
    
    if (upperName.includes('OBD') || upperName.includes('DIAG') || upperName.includes('SCAN')) {
      return 'OBD2';
    }
    
    return 'Generic';
  }

  private calculateCompatibility(name: string): number {
    if (!name) return 0.1;
    const upperName = name.toUpperCase();
    
    if (upperName.includes('ELM327')) return 0.9;
    if (upperName.includes('ELM') || upperName.includes('VGATE')) return 0.8;
    if (upperName.includes('OBD')) return 0.7;
    if (upperName.includes('DIAG') || upperName.includes('SCAN')) return 0.6;
    if (upperName.includes('BLUETOOTH')) return 0.3;
    
    return 0.1;
  }

  async ensureBluetoothEnabled(): Promise<boolean> {
    try {
      const result = await CapBluetooth.ensureEnabled();
      return result.enabled;
    } catch (error) {
      console.error('Failed to ensure Bluetooth enabled:', error);
      return false;
    }
  }

  async scanForDevices(): Promise<ScanResult> {
    try {
      this.discoveredDevices = [];
      
      // Ensure Bluetooth is enabled
      const enabled = await this.ensureBluetoothEnabled();
      if (!enabled) {
        return {
          devices: [],
          success: false,
          error: 'Bluetooth is not enabled'
        };
      }

      console.log('📱 Starting native Bluetooth scan...');
      await CapBluetooth.startDiscovery();

      // Wait for discovery to complete (with timeout)
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          CapBluetooth.stopDiscovery();
          resolve({
            devices: this.discoveredDevices,
            success: true
          });
        }, 15000);

        const finishListener = CapBluetooth.addListener('discoveryFinished', () => {
          clearTimeout(timeout);
          finishListener.then(listener => listener.remove());
          resolve({
            devices: this.discoveredDevices,
            success: true
          });
        });
      });

    } catch (error) {
      console.error('Scan failed:', error);
      return {
        devices: [],
        success: false,
        error: error instanceof Error ? error.message : 'Scan failed'
      };
    }
  }

  async connectToDevice(device: BluetoothDevice): Promise<boolean> {
    try {
      console.log('📱 Attempting to connect to', device.name);
      
      // If not paired, try to pair first
      if (!device.isPaired) {
        console.log('📱 Device not paired, attempting to pair...');
        await CapBluetooth.pair({ address: device.address });
      }

      // Connect via SPP
      await CapBluetooth.connectSpp({ address: device.address });
      
      this.connectedDevice = device;
      this.isConnected = true;
      
      // Initialize ELM327
      await this.initializeELM327();
      
      return true;
    } catch (error) {
      console.error('Connection failed:', error);
      return false;
    }
  }

  private async initializeELM327(): Promise<void> {
    try {
      console.log('🔧 Initializing ELM327...');
      
      // Standard ELM327 initialization sequence
      await this.sendCommand('ATZ');      // Reset
      await this.delay(2000);             // Wait for reset
      await this.sendCommand('ATE0');     // Echo off
      await this.sendCommand('ATL0');     // Linefeeds off
      await this.sendCommand('ATS0');     // Spaces off
      await this.sendCommand('ATH1');     // Headers on
      await this.sendCommand('ATSP0');    // Auto protocol selection
      
      console.log('✅ ELM327 initialized successfully');
    } catch (error) {
      console.error('❌ ELM327 initialization failed:', error);
      throw error;
    }
  }

  async sendCommand(command: string): Promise<ELM327Response> {
    try {
      if (!this.isConnected) {
        return {
          success: false,
          error: 'Not connected to device'
        };
      }

      console.log('📤 Sending command:', command);
      const result = await CapBluetooth.sendCommand({ command });
      
      // Clean up response
      const cleanResponse = result.response
        .replace(/>/g, '')
        .replace(/\r/g, '')
        .replace(/\n/g, ' ')
        .trim();

      console.log('📥 Response:', cleanResponse);

      return {
        success: true,
        data: cleanResponse
      };
    } catch (error) {
      console.error('Command failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Command failed'
      };
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      await CapBluetooth.disconnect();
      this.isConnected = false;
      this.connectedDevice = null;
      return true;
    } catch (error) {
      console.error('Disconnect failed:', error);
      return false;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      device: this.connectedDevice
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const nativeELM327Service = NativeELM327Service.getInstance();
