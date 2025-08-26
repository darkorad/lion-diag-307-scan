
import { BluetoothDevice, ConnectionResult } from './bluetooth/types';

export class AndroidNativeBluetoothService {
  private static instance: AndroidNativeBluetoothService;
  private connectedDevice: BluetoothDevice | null = null;
  private isInitialized = false;

  static getInstance(): AndroidNativeBluetoothService {
    if (!AndroidNativeBluetoothService.instance) {
      AndroidNativeBluetoothService.instance = new AndroidNativeBluetoothService();
    }
    return AndroidNativeBluetoothService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🤖 Initializing Android Native Bluetooth Service...');
      
      if (!(window as any).CustomBluetoothSerial) {
        console.log('❌ CustomBluetoothSerial plugin not available');
        return false;
      }
      
      // Test if the plugin is working
      try {
        const result = await (window as any).CustomBluetoothSerial.isEnabled();
        console.log('✅ Android Native Bluetooth service initialized, enabled:', result.enabled);
        this.isInitialized = true;
        return true;
      } catch (error) {
        console.error('❌ Plugin test failed:', error);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Android Native Bluetooth initialization failed:', error);
      return false;
    }
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      if (!(window as any).CustomBluetoothSerial) {
        console.log('❌ CustomBluetoothSerial plugin not available for status check');
        return false;
      }
      
      const result = await (window as any).CustomBluetoothSerial.isEnabled();
      console.log('🔵 Android Bluetooth status:', result);
      return result.enabled === true;
      
    } catch (error) {
      console.error('❌ Error checking Android Bluetooth status:', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    try {
      if (!(window as any).CustomBluetoothSerial) {
        console.log('❌ CustomBluetoothSerial plugin not available for enable');
        return false;
      }
      
      console.log('🔵 Requesting Bluetooth enable...');
      const result = await (window as any).CustomBluetoothSerial.requestEnable();
      console.log('✅ Bluetooth enable result:', result);
      return result.enabled === true;
      
    } catch (error) {
      console.error('❌ Error enabling Bluetooth:', error);
      return false;
    }
  }

  async getBondedDevices(): Promise<BluetoothDevice[]> {
    try {
      if (!(window as any).CustomBluetoothSerial) {
        console.log('❌ CustomBluetoothSerial plugin not available for bonded devices');
        return [];
      }
      
      console.log('📱 Getting paired/bonded devices...');
      const result = await (window as any).CustomBluetoothSerial.getPairedDevices();
      console.log('📋 Bonded devices result:', result);
      
      if (!result.devices || !Array.isArray(result.devices)) {
        console.log('⚠️ No bonded devices found or invalid response');
        return [];
      }
      
      const devices: BluetoothDevice[] = result.devices.map((device: any) => ({
        id: device.address || device.id || Math.random().toString(36),
        address: device.address || '',
        name: device.name || 'Unknown Device',
        isPaired: true,
        isConnected: false,
        deviceType: this.identifyDeviceType(device.name || ''),
        compatibility: this.calculateCompatibility(device.name || ''),
        rssi: device.rssi
      }));
      
      console.log(`📱 Found ${devices.length} bonded devices`);
      return devices;
      
    } catch (error) {
      console.error('❌ Error getting bonded devices:', error);
      return [];
    }
  }

  async startDiscovery(): Promise<boolean> {
    try {
      if (!(window as any).CustomBluetoothSerial) {
        console.log('❌ CustomBluetoothSerial plugin not available for discovery');
        return false;
      }
      
      console.log('🔍 Starting Bluetooth discovery...');
      const result = await (window as any).CustomBluetoothSerial.startScan();
      console.log('🔍 Discovery start result:', result);
      return result.success === true;
      
    } catch (error) {
      console.error('❌ Error starting discovery:', error);
      return false;
    }
  }

  async stopDiscovery(): Promise<boolean> {
    try {
      if (!(window as any).CustomBluetoothSerial) {
        return false;
      }
      
      console.log('⏹️ Stopping Bluetooth discovery...');
      const result = await (window as any).CustomBluetoothSerial.stopScan();
      console.log('⏹️ Discovery stop result:', result);
      return result.success === true;
      
    } catch (error) {
      console.error('❌ Error stopping discovery:', error);
      return false;
    }
  }

  async getAllDevices(): Promise<BluetoothDevice[]> {
    try {
      // For now, just return bonded devices
      // In the future, we could also include discovered devices
      const bondedDevices = await this.getBondedDevices();
      
      console.log(`📱 Returning ${bondedDevices.length} total devices`);
      return bondedDevices;
      
    } catch (error) {
      console.error('❌ Error getting all devices:', error);
      return [];
    }
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      if (!(window as any).CustomBluetoothSerial) {
        throw new Error('CustomBluetoothSerial plugin not available');
      }
      
      console.log(`🔗 Connecting to device: ${device.name} (${device.address})`);
      
      const result = await (window as any).CustomBluetoothSerial.connect({
        address: device.address
      });
      
      console.log('🔗 Connection result:', result);
      
      if (result.success) {
        this.connectedDevice = { ...device, isConnected: true };
        return {
          success: true,
          device: this.connectedDevice,
          strategy: 'Android Native Bluetooth'
        };
      } else {
        throw new Error('Connection failed');
      }
      
    } catch (error) {
      console.error(`❌ Android connection failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      if (!(window as any).CustomBluetoothSerial) {
        return false;
      }
      
      console.log('🔌 Disconnecting Android Bluetooth...');
      const result = await (window as any).CustomBluetoothSerial.disconnect();
      
      if (result.success) {
        this.connectedDevice = null;
        console.log('✅ Android Bluetooth disconnected');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Android disconnect failed:', error);
      return false;
    }
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }
    
    if (!(window as any).CustomBluetoothSerial) {
      throw new Error('CustomBluetoothSerial plugin not available');
    }
    
    try {
      console.log(`📤 Android sending command: ${command}`);
      
      await (window as any).CustomBluetoothSerial.write({
        data: command + '\r'
      });
      
      // Wait a bit for response
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await (window as any).CustomBluetoothSerial.read();
      console.log(`📥 Android received response: ${result.data}`);
      
      return result.data || 'NO DATA';
      
    } catch (error) {
      console.error('❌ Android command failed:', error);
      throw error;
    }
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  private identifyDeviceType(name: string): 'ELM327' | 'OBD2' | 'Generic' {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('elm327') || lowerName.includes('elm 327')) return 'ELM327';
    if (lowerName.includes('obd') || lowerName.includes('vgate') || lowerName.includes('konnwei') || lowerName.includes('bafx')) return 'OBD2';
    
    return 'Generic';
  }

  private calculateCompatibility(name: string): number {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('elm327')) return 0.95;
    if (lowerName.includes('obd') || lowerName.includes('vgate') || lowerName.includes('konnwei')) return 0.85;
    if (lowerName.includes('bluetooth')) return 0.3;
    
    return 0.1;
  }
}

export const androidNativeBluetoothService = AndroidNativeBluetoothService.getInstance();
