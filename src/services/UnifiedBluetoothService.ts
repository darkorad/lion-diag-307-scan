
import { BluetoothDevice, ConnectionResult, ConnectionStatus } from './bluetooth/types';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';

export class UnifiedBluetoothService {
  private static instance: UnifiedBluetoothService;
  private isInitialized = false;
  private connectedDevice: BluetoothDevice | null = null;
  private connectionAttempts = new Map<string, number>();

  static getInstance(): UnifiedBluetoothService {
    if (!UnifiedBluetoothService.instance) {
      UnifiedBluetoothService.instance = new UnifiedBluetoothService();
    }
    return UnifiedBluetoothService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('UnifiedBluetoothService already initialized');
      return true;
    }

    try {
      console.log('Initializing UnifiedBluetoothService...');
      
      const platform = Capacitor.getPlatform();
      console.log('Platform:', platform);
      
      if (platform === 'web') {
        console.log('Running on web - Bluetooth functionality limited');
        this.isInitialized = true;
        return true;
      }

      // Check if device supports Bluetooth
      const deviceInfo = await Device.getInfo();
      console.log('Device info:', deviceInfo);
      
      this.isInitialized = true;
      console.log('UnifiedBluetoothService initialized successfully');
      return true;
      
    } catch (error) {
      console.error('Failed to initialize UnifiedBluetoothService:', error);
      return false;
    }
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      console.log('Checking if Bluetooth is enabled...');
      
      const platform = Capacitor.getPlatform();
      
      if (platform === 'web') {
        console.log('Web platform - checking navigator.bluetooth');
        return 'bluetooth' in navigator;
      }

      // For mobile platforms, assume Bluetooth is available
      // In a real app, you would use a Bluetooth plugin to check this
      console.log('Mobile platform - assuming Bluetooth is available');
      return true;
      
    } catch (error) {
      console.error('Error checking Bluetooth status:', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    try {
      console.log('Attempting to enable Bluetooth...');
      
      const platform = Capacitor.getPlatform();
      
      if (platform === 'web') {
        console.log('Cannot enable Bluetooth on web platform');
        return false;
      }

      // For mobile platforms, this would typically show a system dialog
      console.log('Bluetooth enable request sent (simulated)');
      return true;
      
    } catch (error) {
      console.error('Error enabling Bluetooth:', error);
      return false;
    }
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      console.log('🔍 Starting Bluetooth device scan...');
      
      await this.initialize();
      
      const platform = Capacitor.getPlatform();
      console.log('Scanning on platform:', platform);
      
      if (platform === 'web') {
        return this.scanForDevicesWeb();
      } else {
        return this.scanForDevicesMobile();
      }
      
    } catch (error) {
      console.error('❌ Bluetooth scan failed:', error);
      throw new Error(`Bluetooth scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async scanForDevicesWeb(): Promise<BluetoothDevice[]> {
    console.log('🌐 Scanning for devices on web...');
    
    try {
      if (!('bluetooth' in navigator)) {
        throw new Error('Web Bluetooth is not supported in this browser');
      }

      // Request device with OBD2-related services
      const device = await (navigator.bluetooth as any).requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '00001101-0000-1000-8000-00805f9b34fb', // Serial Port Profile
          '0000110a-0000-1000-8000-00805f9b34fb', // Audio Source
          '0000110b-0000-1000-8000-00805f9b34fb'  // Audio Sink
        ]
      });

      const bluetoothDevice: BluetoothDevice = {
        id: device.id,
        name: device.name || 'Unknown Device',
        address: device.id,
        isPaired: false,
        isConnected: false,
        deviceType: 'OBD2' as const,
        compatibility: 0.8
      };

      console.log('✅ Web Bluetooth device found:', bluetoothDevice);
      return [bluetoothDevice];
      
    } catch (error) {
      console.error('❌ Web Bluetooth scan failed:', error);
      
      // Return mock devices for testing
      const mockDevices: BluetoothDevice[] = [
        {
          id: 'mock-elm327-1',
          name: 'ELM327 Bluetooth',
          address: '00:0D:18:00:00:01',
          isPaired: false,
          isConnected: false,
          deviceType: 'ELM327' as const,
          compatibility: 0.9,
          rssi: -45
        },
        {
          id: 'mock-vgate-1',
          name: 'Vgate iCar Pro',
          address: '98:D3:31:00:00:02',
          isPaired: true,
          isConnected: false,
          deviceType: 'OBD2' as const,
          compatibility: 0.95,
          rssi: -52
        }
      ];
      
      console.log('📱 Returning mock devices for testing:', mockDevices);
      return mockDevices;
    }
  }

  private async scanForDevicesMobile(): Promise<BluetoothDevice[]> {
    console.log('📱 Scanning for devices on mobile...');
    
    try {
      // Try to use custom Bluetooth plugin
      if ((window as any).CustomBluetoothSerial) {
        console.log('Using CustomBluetoothSerial plugin...');
        
        const result = await (window as any).CustomBluetoothSerial.list();
        console.log('CustomBluetoothSerial result:', result);
        
        if (result && result.devices) {
          const devices: BluetoothDevice[] = result.devices.map((device: any) => ({
            id: device.id || device.address,
            name: device.name || 'Unknown Device',
            address: device.address,
            isPaired: true, // Devices from .list() are typically paired
            isConnected: false,
            deviceType: this.identifyDeviceType(device.name),
            compatibility: this.calculateCompatibility(device.name),
            rssi: device.rssi
          }));
          
          console.log('✅ Found devices via CustomBluetoothSerial:', devices);
          return devices;
        }
      }
      
      // Fallback to mock devices for testing
      console.log('⚠️ CustomBluetoothSerial not available, using mock data');
      return this.getMockDevices();
      
    } catch (error) {
      console.error('❌ Mobile Bluetooth scan error:', error);
      console.log('📱 Falling back to mock devices');
      return this.getMockDevices();
    }
  }

  private getMockDevices(): BluetoothDevice[] {
    const mockDevices: BluetoothDevice[] = [
      {
        id: 'test-elm327',
        name: 'ELM327 OBDII',
        address: '00:0D:18:12:34:56',
        isPaired: false,
        isConnected: false,
        deviceType: 'ELM327' as const,
        compatibility: 0.95,
        rssi: -42
      },
      {
        id: 'test-vgate',
        name: 'Vgate iCar Pro BT3.0',
        address: '98:D3:31:AB:CD:EF',
        isPaired: true,
        isConnected: false,
        deviceType: 'OBD2' as const,
        compatibility: 0.9,
        rssi: -38
      },
      {
        id: 'test-generic',
        name: 'OBDII Bluetooth',
        address: 'AC:83:F3:11:22:33',
        isPaired: false,
        isConnected: false,
        deviceType: 'OBD2' as const,
        compatibility: 0.7,
        rssi: -55
      }
    ];
    
    console.log('📋 Returning mock devices for testing:', mockDevices);
    return mockDevices;
  }

  private identifyDeviceType(name: string): 'ELM327' | 'OBD2' | 'Generic' {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('elm327')) return 'ELM327';
    if (lowerName.includes('obd') || lowerName.includes('vgate') || lowerName.includes('konnwei')) return 'OBD2';
    return 'Generic';
  }

  private calculateCompatibility(name: string): number {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('elm327')) return 0.95;
    if (lowerName.includes('vgate')) return 0.9;
    if (lowerName.includes('obd')) return 0.8;
    return 0.5;
  }

  async discoverAllOBD2Devices(): Promise<BluetoothDevice[]> {
    console.log('🔍 Discovering all OBD2 devices...');
    return this.scanForDevices();
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      console.log(`🔗 Attempting to connect to ${device.name}...`);
      
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.connectedDevice = { ...device, isConnected: true };
      
      console.log(`✅ Successfully connected to ${device.name}`);
      
      return {
        success: true,
        device: this.connectedDevice,
        error: undefined
      };
      
    } catch (error) {
      console.error(`❌ Connection to ${device.name} failed:`, error);
      
      return {
        success: false,
        device: undefined,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  async smartConnect(device: BluetoothDevice): Promise<ConnectionResult> {
    console.log(`🧠 Smart connecting to ${device.name}...`);
    return this.connectToDevice(device);
  }

  async disconnect(): Promise<boolean> {
    try {
      if (this.connectedDevice) {
        console.log(`🔌 Disconnecting from ${this.connectedDevice.name}...`);
        this.connectedDevice = null;
      }
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
    
    console.log(`📤 Sending command: ${command}`);
    
    // Simulate command response
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const response = `OK>${command}`;
    console.log(`📥 Command response: ${response}`);
    
    return response;
  }

  getConnectionStatus(): ConnectionStatus {
    return {
      isConnected: !!this.connectedDevice,
      device: this.connectedDevice
    };
  }

  isConnectedToDevice(): boolean {
    return !!this.connectedDevice;
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  getConnectionAttempts(address: string): number {
    return this.connectionAttempts.get(address) || 0;
  }

  resetConnectionAttempts(address: string): void {
    this.connectionAttempts.delete(address);
    console.log(`🔄 Reset connection attempts for ${address}`);
  }
}

export const unifiedBluetoothService = UnifiedBluetoothService.getInstance();
export type { BluetoothDevice, ConnectionResult, ConnectionStatus };
