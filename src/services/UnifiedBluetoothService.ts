
import { Capacitor } from '@capacitor/core';
import { BluetoothDevice, ConnectionResult } from './bluetooth/types';
import { webBluetoothService } from './WebBluetoothService';
import { androidNativeBluetoothService } from './AndroidNativeBluetoothService';

export type { BluetoothDevice, ConnectionResult };

interface UnifiedBluetoothService {
  initialize(): Promise<boolean>;
  isBluetoothEnabled(): Promise<boolean>;
  enableBluetooth(): Promise<boolean>;
  scanForDevices(timeout?: number): Promise<BluetoothDevice[]>;
  discoverAllOBD2Devices(): Promise<BluetoothDevice[]>;
  connectToDevice(device: BluetoothDevice): Promise<ConnectionResult>;
  smartConnect(device: BluetoothDevice): Promise<ConnectionResult>;
  disconnect(): Promise<boolean>;
  sendCommand(command: string): Promise<string>;
  getConnectionStatus(): any;
  getCurrentService(): string;
  resetConnectionAttempts(address: string): void;
  getConnectionAttempts(address: string): number;
  isConnectedToDevice(): boolean;
  getConnectedDevice(): BluetoothDevice | null;
}

class UnifiedBluetoothServiceImpl implements UnifiedBluetoothService {
  private currentService: 'android' | 'web' | null = null;
  private isInitialized = false;
  private connectionAttempts: { [address: string]: number } = {};

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('🔄 Service already initialized, using existing service');
      return true;
    }

    console.log('🔧 Initializing UnifiedBluetoothService...');
    console.log('📱 Platform:', Capacitor.getPlatform());
    console.log('🏠 Native platform:', Capacitor.isNativePlatform());

    try {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        console.log('🤖 Attempting Android Native Bluetooth...');
        const androidInitialized = await androidNativeBluetoothService.initialize();
        
        if (androidInitialized) {
          this.currentService = 'android';
          this.isInitialized = true;
          console.log('✅ Android Native Bluetooth service initialized');
          return true;
        } else {
          console.log('❌ Android Native Bluetooth initialization failed');
        }
      }

      // Fallback to Web Bluetooth
      console.log('🌐 Using Web Bluetooth...');
      const webInitialized = await webBluetoothService.initialize();
      
      if (webInitialized) {
        this.currentService = 'web';
        this.isInitialized = true;
        console.log('✅ Web Bluetooth service initialized');
        return true;
      } else {
        console.log('❌ Web Bluetooth initialization failed');
      }

      return false;

    } catch (error) {
      console.error('❌ UnifiedBluetoothService initialization failed:', error);
      return false;
    }
  }

  async isBluetoothEnabled(): Promise<boolean> {
    if (!this.isInitialized) {
      console.log('🔄 Service not initialized, attempting initialization...');
      await this.initialize();
    }

    try {
      if (this.currentService === 'android') {
        const enabled = await androidNativeBluetoothService.isBluetoothEnabled();
        console.log('🔵 Android Bluetooth enabled:', enabled);
        return enabled;
      } else if (this.currentService === 'web') {
        const enabled = await webBluetoothService.isBluetoothEnabled();
        console.log('🔵 Web Bluetooth enabled:', enabled);
        return enabled;
      }
      return false;
    } catch (error) {
      console.error('❌ Error checking Bluetooth status:', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (this.currentService === 'android') {
        console.log('🔵 Enabling Android Bluetooth...');
        return await androidNativeBluetoothService.enableBluetooth();
      } else if (this.currentService === 'web') {
        console.log('🔵 Web Bluetooth is browser-controlled');
        return true; // Web Bluetooth is controlled by browser
      }
      return false;
    } catch (error) {
      console.error('❌ Error enabling Bluetooth:', error);
      return false;
    }
  }

  async scanForDevices(timeout: number = 10000): Promise<BluetoothDevice[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🔍 Starting device scan (timeout: ${timeout}ms)...`);
      
      if (this.currentService === 'android') {
        // For Android, get both paired and discovered devices
        console.log('📱 Using Android native scanning...');
        
        // First get paired devices
        const pairedDevices = await androidNativeBluetoothService.getBondedDevices();
        console.log(`📋 Found ${pairedDevices.length} paired devices`);
        
        // Start discovery for new devices
        const discoveryStarted = await androidNativeBluetoothService.startDiscovery();
        console.log('🔍 Discovery started:', discoveryStarted);
        
        // Wait a bit for discovery to find devices
        await new Promise(resolve => setTimeout(resolve, Math.min(timeout, 8000)));
        
        // Stop discovery
        await androidNativeBluetoothService.stopDiscovery();
        
        // For now, return paired devices (discovery results would need event listeners)
        return pairedDevices;
        
      } else if (this.currentService === 'web') {
        console.log('🌐 Using Web Bluetooth scanning...');
        return await webBluetoothService.scanForDevices();
      }
      
      console.log('❌ No Bluetooth service available');
      return [];
      
    } catch (error) {
      console.error('❌ Device scan failed:', error);
      return [];
    }
  }

  async discoverAllOBD2Devices(): Promise<BluetoothDevice[]> {
    console.log('🔍 Discovering all OBD2 devices...');
    
    try {
      const allDevices = await this.scanForDevices(12000);
      console.log(`📋 Total devices found: ${allDevices.length}`);
      
      // Filter for potential OBD2 devices
      const obd2Devices = allDevices.filter(device => {
        const name = device.name.toLowerCase();
        const isOBD2 = name.includes('elm327') || 
                      name.includes('obd') || 
                      name.includes('vgate') || 
                      name.includes('konnwei') ||
                      name.includes('autel') ||
                      name.includes('icar') ||
                      name.includes('bluetooth') ||
                      device.isPaired; // Include all paired devices as potential OBD2
        
        if (isOBD2) {
          console.log(`✅ Potential OBD2 device: ${device.name} (${device.address})`);
        }
        
        return isOBD2;
      });
      
      console.log(`🎯 OBD2 devices found: ${obd2Devices.length}`);
      return obd2Devices;
      
    } catch (error) {
      console.error('❌ OBD2 discovery failed:', error);
      return [];
    }
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🔗 Connecting to ${device.name} via ${this.currentService}...`);
      
      if (this.currentService === 'android') {
        return await androidNativeBluetoothService.connectToDevice(device);
      } else if (this.currentService === 'web') {
        return await webBluetoothService.connectToDevice(device);
      }
      
      return {
        success: false,
        error: 'No Bluetooth service available'
      };
      
    } catch (error) {
      console.error('❌ Connection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  async smartConnect(device: BluetoothDevice): Promise<ConnectionResult> {
    console.log(`🧠 Smart connecting to ${device.name}...`);
    
    // Increment connection attempts
    this.connectionAttempts[device.address] = (this.connectionAttempts[device.address] || 0) + 1;
    
    try {
      // First attempt: Direct connection
      const result = await this.connectToDevice(device);
      
      if (result.success) {
        // Reset attempts on success
        this.connectionAttempts[device.address] = 0;
        return result;
      }
      
      // If direct connection fails, try enabling Bluetooth first
      console.log('🔄 Direct connection failed, checking Bluetooth status...');
      const isEnabled = await this.isBluetoothEnabled();
      
      if (!isEnabled) {
        console.log('🔵 Bluetooth disabled, attempting to enable...');
        const enabled = await this.enableBluetooth();
        
        if (enabled) {
          // Wait a moment then try connecting again
          await new Promise(resolve => setTimeout(resolve, 1000));
          return await this.connectToDevice(device);
        }
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Smart connect failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Smart connect failed'
      };
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      if (this.currentService === 'android') {
        return await androidNativeBluetoothService.disconnect();
      } else if (this.currentService === 'web') {
        return await webBluetoothService.disconnect();
      }
      return false;
    } catch (error) {
      console.error('❌ Disconnect failed:', error);
      return false;
    }
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }

    try {
      if (this.currentService === 'android') {
        return await androidNativeBluetoothService.sendCommand(command);
      } else if (this.currentService === 'web') {
        return await webBluetoothService.sendCommand(command);
      }
      
      throw new Error('No Bluetooth service available');
    } catch (error) {
      console.error('❌ Send command failed:', error);
      throw error;
    }
  }

  isConnectedToDevice(): boolean {
    if (this.currentService === 'android') {
      const device = androidNativeBluetoothService.getConnectedDevice();
      return device !== null;
    } else if (this.currentService === 'web') {
      const device = webBluetoothService.getConnectedDevice();
      return device !== null;
    }
    
    return false;
  }

  getConnectedDevice(): BluetoothDevice | null {
    if (this.currentService === 'android') {
      return androidNativeBluetoothService.getConnectedDevice();
    } else if (this.currentService === 'web') {
      return webBluetoothService.getConnectedDevice();
    }
    
    return null;
  }

  getConnectionStatus() {
    if (this.currentService === 'android') {
      const device = androidNativeBluetoothService.getConnectedDevice();
      return {
        isConnected: device !== null,
        device: device,
        service: 'android'
      };
    } else if (this.currentService === 'web') {
      const device = webBluetoothService.getConnectedDevice();
      return {
        isConnected: device !== null,
        device: device,
        service: 'web'
      };
    }
    
    return {
      isConnected: false,
      device: null,
      service: 'none'
    };
  }

  getCurrentService(): string {
    return this.currentService || 'none';
  }

  resetConnectionAttempts(address: string): void {
    this.connectionAttempts[address] = 0;
  }

  getConnectionAttempts(address: string): number {
    return this.connectionAttempts[address] || 0;
  }
}

export const unifiedBluetoothService = new UnifiedBluetoothServiceImpl();
