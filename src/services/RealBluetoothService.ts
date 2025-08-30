
import { enhancedAndroidBluetoothService } from './EnhancedAndroidBluetoothService';
import { webBluetoothService } from './WebBluetoothService';
import { BluetoothDevice, ConnectionResult } from './bluetooth/types';
import { Capacitor } from '@capacitor/core';

class RealBluetoothService {
  private static instance: RealBluetoothService;
  private currentService: 'android' | 'web' | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): RealBluetoothService {
    if (!RealBluetoothService.instance) {
      RealBluetoothService.instance = new RealBluetoothService();
    }
    return RealBluetoothService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    console.log('🔧 Initializing RealBluetoothService...');
    console.log('📱 Platform:', Capacitor.getPlatform());

    try {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        console.log('🤖 Attempting Enhanced Android Bluetooth...');
        const androidInitialized = await enhancedAndroidBluetoothService.initialize();
        
        if (androidInitialized) {
          this.currentService = 'android';
          this.isInitialized = true;
          console.log('✅ Enhanced Android Bluetooth service initialized');
          return true;
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
      }

      return false;

    } catch (error) {
      console.error('❌ RealBluetoothService initialization failed:', error);
      return false;
    }
  }

  async isBluetoothEnabled(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (this.currentService === 'android') {
        const status = await enhancedAndroidBluetoothService.checkBluetoothStatus();
        return status.enabled;
      } else if (this.currentService === 'web') {
        return await webBluetoothService.isBluetoothEnabled();
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
        const result = await enhancedAndroidBluetoothService.enableBluetooth();
        return result.requested;
      } else if (this.currentService === 'web') {
        return true; // Web Bluetooth is browser-controlled
      }
      return false;
    } catch (error) {
      console.error('❌ Error enabling Bluetooth:', error);
      return false;
    }
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (this.currentService === 'android') {
        return await enhancedAndroidBluetoothService.scanForDevices();
      } else if (this.currentService === 'web') {
        return await webBluetoothService.scanForDevices();
      }
      
      return [];
    } catch (error) {
      console.error('❌ Device scan failed:', error);
      return [];
    }
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (this.currentService === 'android') {
        return await enhancedAndroidBluetoothService.connectToDevice(device);
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

  async disconnect(): Promise<boolean> {
    try {
      if (this.currentService === 'android') {
        return await enhancedAndroidBluetoothService.disconnect();
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
        return await enhancedAndroidBluetoothService.sendCommand(command);
      } else if (this.currentService === 'web') {
        return await webBluetoothService.sendCommand(command);
      }
      
      throw new Error('No Bluetooth service available');
    } catch (error) {
      console.error('❌ Send command failed:', error);
      throw error;
    }
  }

  getCurrentService(): string {
    return this.currentService || 'none';
  }

  isConnectedToDevice(): boolean {
    if (this.currentService === 'android') {
      const device = enhancedAndroidBluetoothService.getConnectedDevice();
      return device !== null;
    } else if (this.currentService === 'web') {
      const device = webBluetoothService.getConnectedDevice();
      return device !== null;
    }
    
    return false;
  }

  getConnectedDevice(): BluetoothDevice | null {
    if (this.currentService === 'android') {
      return enhancedAndroidBluetoothService.getConnectedDevice();
    } else if (this.currentService === 'web') {
      return webBluetoothService.getConnectedDevice();
    }
    
    return null;
  }
}

export const realBluetoothService = RealBluetoothService.getInstance();
