
import { BluetoothDevice, ConnectionResult } from './bluetooth/types';
import { Capacitor } from '@capacitor/core';

interface BluetoothSerialPlugin {
  isEnabled(): Promise<{ value: boolean }>;
  enable(): Promise<{ value: boolean }>;
  scan(): Promise<{ devices: any[] }>;
  list(): Promise<{ devices: any[] }>;
  connect(options: { address: string }): Promise<{ success: boolean }>;
  disconnect(): Promise<{ success: boolean }>;
  isConnected(): Promise<{ connected: boolean }>;
  write(options: { data: string }): Promise<{ success: boolean }>;
  read(): Promise<{ data: string }>;
  subscribeRawData(): Promise<void>;
  unsubscribeRawData(): Promise<void>;
}

export class RealBluetoothService {
  private static instance: RealBluetoothService;
  private bluetoothSerial: BluetoothSerialPlugin | null = null;
  private connectedDevice: BluetoothDevice | null = null;
  private isInitialized = false;

  static getInstance(): RealBluetoothService {
    if (!RealBluetoothService.instance) {
      RealBluetoothService.instance = new RealBluetoothService();
    }
    return RealBluetoothService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      console.log('🔧 Initializing RealBluetoothService...');

      const platform = Capacitor.getPlatform();
      console.log('📱 Platform:', platform);

      if (platform === 'web') {
        console.log('🌐 Web platform - limited Bluetooth functionality');
        this.isInitialized = true;
        return true;
      }

      // Try to access the native Bluetooth Serial plugin
      if ((window as any).CustomBluetoothSerial) {
        this.bluetoothSerial = (window as any).CustomBluetoothSerial;
        console.log('✅ CustomBluetoothSerial plugin found');
      } else if ((window as any).BluetoothSerial) {
        this.bluetoothSerial = (window as any).BluetoothSerial;
        console.log('✅ BluetoothSerial plugin found');
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize RealBluetoothService:', error);
      return false;
    }
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      await this.initialize();

      if (Capacitor.getPlatform() === 'web') {
        return 'bluetooth' in navigator;
      }

      if (this.bluetoothSerial) {
        const result = await this.bluetoothSerial.isEnabled();
        return result.value;
      }

      return false;
    } catch (error) {
      console.error('❌ Error checking Bluetooth status:', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    try {
      if (Capacitor.getPlatform() === 'web') {
        return false;
      }

      if (this.bluetoothSerial) {
        const result = await this.bluetoothSerial.enable();
        return result.value;
      }

      return false;
    } catch (error) {
      console.error('❌ Error enabling Bluetooth:', error);
      return false;
    }
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      console.log('🔍 Starting real Bluetooth device scan...');
      await this.initialize();

      const platform = Capacitor.getPlatform();

      if (platform === 'web') {
        return this.scanForDevicesWeb();
      }

      // First get paired devices
      const pairedDevices = await this.getPairedDevices();
      console.log('📱 Found paired devices:', pairedDevices.length);

      // Try to scan for nearby devices
      let discoveredDevices: BluetoothDevice[] = [];
      try {
        if (this.bluetoothSerial && this.bluetoothSerial.scan) {
          console.log('🔍 Scanning for discoverable devices...');
          const scanResult = await this.bluetoothSerial.scan();
          
          if (scanResult && scanResult.devices) {
            discoveredDevices = scanResult.devices.map((device: any) => ({
              id: device.address || device.id,
              name: device.name || `Device ${device.address?.slice(-4) || 'Unknown'}`,
              address: device.address || device.id,
              isPaired: false,
              isConnected: false,
              deviceType: this.identifyDeviceType(device.name || ''),
              compatibility: this.calculateCompatibility(device.name || ''),
              rssi: device.rssi
            }));
            
            console.log('🔍 Found discoverable devices:', discoveredDevices.length);
          }
        }
      } catch (scanError) {
        console.warn('⚠️ Device scanning failed, using paired devices only:', scanError);
      }

      // Combine and deduplicate devices
      const allDevices = [...pairedDevices, ...discoveredDevices];
      const uniqueDevices = allDevices.filter((device, index, self) => 
        index === self.findIndex(d => d.address === device.address)
      );

      // Sort by compatibility score
      uniqueDevices.sort((a, b) => (b.compatibility || 0) - (a.compatibility || 0));

      console.log(`✅ Total devices found: ${uniqueDevices.length}`);
      return uniqueDevices;

    } catch (error) {
      console.error('❌ Device scan failed:', error);
      throw new Error(`Bluetooth scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPairedDevices(): Promise<BluetoothDevice[]> {
    try {
      console.log('📱 Getting paired Bluetooth devices...');

      if (Capacitor.getPlatform() === 'web') {
        return [];
      }

      if (!this.bluetoothSerial) {
        console.warn('⚠️ Bluetooth plugin not available');
        return [];
      }

      const result = await this.bluetoothSerial.list();
      console.log('📱 Paired devices result:', result);

      if (result && result.devices) {
        const devices = result.devices.map((device: any) => ({
          id: device.address || device.id,
          name: device.name || `Device ${device.address?.slice(-4) || 'Unknown'}`,
          address: device.address || device.id,
          isPaired: true,
          isConnected: false,
          deviceType: this.identifyDeviceType(device.name || ''),
          compatibility: this.calculateCompatibility(device.name || ''),
          rssi: device.rssi
        }));

        console.log(`✅ Found ${devices.length} paired devices`);
        return devices;
      }

      return [];
    } catch (error) {
      console.error('❌ Failed to get paired devices:', error);
      return [];
    }
  }

  private async scanForDevicesWeb(): Promise<BluetoothDevice[]> {
    try {
      if (!('bluetooth' in navigator)) {
        console.log('🌐 Web Bluetooth not supported');
        return this.getMockDevices();
      }

      console.log('🌐 Attempting Web Bluetooth scan...');
      
      const device = await (navigator.bluetooth as any).requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '00001101-0000-1000-8000-00805f9b34fb', // SPP
          '0000110a-0000-1000-8000-00805f9b34fb'  // Audio
        ]
      });

      return [{
        id: device.id,
        name: device.name || 'Web Bluetooth Device',
        address: device.id,
        isPaired: false,
        isConnected: false,
        deviceType: this.identifyDeviceType(device.name || ''),
        compatibility: 0.8,
        rssi: -50
      }];

    } catch (error) {
      console.log('🌐 Web Bluetooth scan cancelled or failed, showing mock data');
      return this.getMockDevices();
    }
  }

  private getMockDevices(): BluetoothDevice[] {
    return [
      {
        id: 'mock-elm327',
        name: 'ELM327 OBDII',
        address: '00:0D:18:12:34:56',
        isPaired: false,
        isConnected: false,
        deviceType: 'ELM327' as const,
        compatibility: 0.95,
        rssi: -42
      },
      {
        id: 'mock-vgate',
        name: 'Vgate iCar Pro',
        address: '98:D3:31:AB:CD:EF',
        isPaired: true,
        isConnected: false,
        deviceType: 'OBD2' as const,
        compatibility: 0.9,
        rssi: -38
      }
    ];
  }

  private identifyDeviceType(name: string): 'ELM327' | 'OBD2' | 'Generic' {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('elm327')) return 'ELM327';
    if (lowerName.includes('obd') || 
        lowerName.includes('vgate') || 
        lowerName.includes('konnwei') ||
        lowerName.includes('autel') ||
        lowerName.includes('foxwell')) return 'OBD2';
    return 'Generic';
  }

  private calculateCompatibility(name: string): number {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('elm327')) return 0.95;
    if (lowerName.includes('vgate')) return 0.9;
    if (lowerName.includes('konnwei')) return 0.85;
    if (lowerName.includes('obd')) return 0.8;
    if (lowerName.includes('bluetooth')) return 0.3;
    
    return 0.5;
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      console.log(`🔗 Connecting to ${device.name} (${device.address})...`);

      if (Capacitor.getPlatform() === 'web') {
        // Simulate web connection
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.connectedDevice = { ...device, isConnected: true };
        return { success: true, device: this.connectedDevice };
      }

      if (!this.bluetoothSerial) {
        throw new Error('Bluetooth plugin not available');
      }

      // Check if already connected
      const isConnected = await this.bluetoothSerial.isConnected();
      if (isConnected.connected) {
        console.log('📱 Already connected, disconnecting first...');
        await this.bluetoothSerial.disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Attempt connection
      const result = await this.bluetoothSerial.connect({ address: device.address });
      
      if (result.success) {
        this.connectedDevice = { ...device, isConnected: true };
        console.log(`✅ Successfully connected to ${device.name}`);
        
        return { 
          success: true, 
          device: this.connectedDevice,
          strategy: 'Direct Connection'
        };
      } else {
        throw new Error('Connection failed');
      }

    } catch (error) {
      console.error(`❌ Connection to ${device.name} failed:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      if (this.bluetoothSerial) {
        await this.bluetoothSerial.disconnect();
      }
      
      this.connectedDevice = null;
      console.log('🔌 Disconnected from device');
      return true;
    } catch (error) {
      console.error('❌ Disconnect failed:', error);
      return false;
    }
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    if (Capacitor.getPlatform() === 'web') {
      // Simulate command response for web
      await new Promise(resolve => setTimeout(resolve, 500));
      return `41 ${command.substring(2)} OK\r>`;
    }

    if (!this.bluetoothSerial) {
      throw new Error('Bluetooth plugin not available');
    }

    try {
      await this.bluetoothSerial.write({ data: command + '\r' });
      
      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await this.bluetoothSerial.read();
      return response.data || 'NO DATA';
      
    } catch (error) {
      console.error('❌ Command failed:', error);
      throw error;
    }
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  isConnected(): boolean {
    return !!this.connectedDevice;
  }
}

export const realBluetoothService = RealBluetoothService.getInstance();
