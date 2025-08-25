
import { BluetoothDevice, ConnectionResult } from './bluetooth/types';

export class WebBluetoothService {
  private static instance: WebBluetoothService;
  private connectedDevice: BluetoothDevice | null = null;

  static getInstance(): WebBluetoothService {
    if (!WebBluetoothService.instance) {
      WebBluetoothService.instance = new WebBluetoothService();
    }
    return WebBluetoothService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🌐 Initializing Web Bluetooth Service...');
      
      if (!navigator.bluetooth) {
        console.log('❌ Web Bluetooth not available');
        return false;
      }
      
      console.log('✅ Web Bluetooth service initialized');
      return true;
      
    } catch (error) {
      console.error('❌ Web Bluetooth initialization failed:', error);
      return false;
    }
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      if (!navigator.bluetooth) {
        return false;
      }
      
      // Web Bluetooth API doesn't have a direct way to check if Bluetooth is enabled
      // We'll assume it's enabled if the API is available
      return true;
      
    } catch (error) {
      console.error('❌ Error checking Web Bluetooth status:', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    // Web Bluetooth API doesn't allow programmatically enabling Bluetooth
    // This would require user interaction
    return true;
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      console.log('🔍 Starting Web Bluetooth device scan...');
      
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth not available');
      }
      
      // Request device with OBD2 service filters
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['0000fff0-0000-1000-8000-00805f9b34fb'] }, // Common OBD2 service
          { namePrefix: 'ELM327' },
          { namePrefix: 'OBD' },
          { namePrefix: 'VGATE' },
        ],
        optionalServices: ['00001101-0000-1000-8000-00805f9b34fb'] // SPP UUID
      });
      
      const bluetoothDevice: BluetoothDevice = {
        id: device.id,
        address: device.id, // Web Bluetooth doesn't expose MAC address
        name: device.name || 'Unknown Device',
        isPaired: false,
        isConnected: false,
        deviceType: this.identifyDeviceType(device.name || ''),
        compatibility: this.calculateCompatibility(device.name || '')
      };
      
      return [bluetoothDevice];
      
    } catch (error) {
      console.error('❌ Web Bluetooth scan failed:', error);
      return [];
    }
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      console.log(`🔗 Connecting to ${device.name} via Web Bluetooth...`);
      
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth not available');
      }
      
      // For Web Bluetooth, we need to get the device again
      const webDevice = await navigator.bluetooth.requestDevice({
        filters: [{ name: device.name }],
        optionalServices: ['00001101-0000-1000-8000-00805f9b34fb']
      });
      
      const server = await webDevice.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to GATT server');
      }
      
      this.connectedDevice = { ...device, isConnected: true };
      
      return {
        success: true,
        device: this.connectedDevice,
        strategy: 'Web Bluetooth GATT'
      };
      
    } catch (error) {
      console.error(`❌ Web Bluetooth connection failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      this.connectedDevice = null;
      console.log('🔌 Web Bluetooth disconnected');
      return true;
      
    } catch (error) {
      console.error('❌ Web Bluetooth disconnect failed:', error);
      return false;
    }
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }
    
    // Web Bluetooth command sending would require GATT characteristics
    console.log(`📤 Web Bluetooth command: ${command}`);
    return 'NO DATA'; // Placeholder
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  private identifyDeviceType(name: string): 'ELM327' | 'OBD2' | 'Generic' {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('elm327') || lowerName.includes('elm 327')) return 'ELM327';
    if (lowerName.includes('obd')) return 'OBD2';
    
    return 'Generic';
  }

  private calculateCompatibility(name: string): number {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('elm327')) return 0.95;
    if (lowerName.includes('obd')) return 0.75;
    
    return 0.5;
  }
}

export const webBluetoothService = WebBluetoothService.getInstance();
