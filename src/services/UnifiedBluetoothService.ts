
import { Capacitor } from '@capacitor/core';
import { webBluetoothService } from './WebBluetoothService';
import { androidNativeBluetoothService } from './AndroidNativeBluetoothService';
import { BluetoothDevice, ConnectionResult, ConnectionStatus } from './bluetooth/types';

export class UnifiedBluetoothService {
  private static instance: UnifiedBluetoothService;
  private currentService: any = null;
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    device: null,
    strategy: null,
    lastConnected: null
  };
  private isInitialized = false;

  static getInstance(): UnifiedBluetoothService {
    if (!UnifiedBluetoothService.instance) {
      UnifiedBluetoothService.instance = new UnifiedBluetoothService();
    }
    return UnifiedBluetoothService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🔧 Initializing UnifiedBluetoothService...');
      console.log('📱 Platform:', Capacitor.getPlatform());
      console.log('🏠 Native platform:', Capacitor.isNativePlatform());
      
      const platform = Capacitor.getPlatform();
      
      if (platform === 'android' && Capacitor.isNativePlatform()) {
        console.log('🤖 Initializing Android native Bluetooth...');
        
        // Wait for the plugin to be available
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          if ((window as any).CustomBluetoothSerial) {
            console.log('✅ CustomBluetoothSerial plugin found');
            break;
          }
          console.log(`⏳ Waiting for CustomBluetoothSerial plugin... (${attempts + 1}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
        
        if (!(window as any).CustomBluetoothSerial) {
          console.error('❌ CustomBluetoothSerial plugin not found after waiting');
          this.isInitialized = false;
          return false;
        }
        
        const androidInitialized = await androidNativeBluetoothService.initialize();
        if (androidInitialized) {
          this.currentService = androidNativeBluetoothService;
          console.log('✅ Android native Bluetooth service initialized');
          this.isInitialized = true;
          return true;
        } else {
          console.log('❌ Android native Bluetooth initialization failed');
        }
      }
      
      // Fallback to Web Bluetooth for web platform or if native fails
      console.log('🌐 Falling back to Web Bluetooth...');
      const webInitialized = await webBluetoothService.initialize();
      if (webInitialized) {
        this.currentService = webBluetoothService;
        console.log('✅ Web Bluetooth service initialized');
        this.isInitialized = true;
        return true;
      }
      
      console.log('❌ All Bluetooth initialization attempts failed');
      this.isInitialized = false;
      return false;
      
    } catch (error) {
      console.error('❌ Bluetooth initialization error:', error);
      this.isInitialized = false;
      return false;
    }
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        console.log('🔄 Service not initialized, attempting initialization...');
        await this.initialize();
      }
      
      if (!this.currentService) {
        console.log('❌ No Bluetooth service available');
        return false;
      }
      
      const enabled = await this.currentService.isBluetoothEnabled();
      console.log(`🔵 Bluetooth enabled: ${enabled}`);
      return enabled;
      
    } catch (error) {
      console.error('❌ Error checking Bluetooth status:', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    try {
      if (!this.currentService) {
        await this.initialize();
      }
      
      if (!this.currentService) {
        console.log('❌ No Bluetooth service available for enable');
        return false;
      }
      
      return await this.currentService.enableBluetooth();
      
    } catch (error) {
      console.error('❌ Error enabling Bluetooth:', error);
      return false;
    }
  }

  async scanForDevices(timeout: number = 10000): Promise<BluetoothDevice[]> {
    try {
      if (!this.currentService) {
        await this.initialize();
      }
      
      if (!this.currentService) {
        console.log('❌ No Bluetooth service available for scanning');
        return [];
      }
      
      // Ensure Bluetooth is enabled before scanning
      const isEnabled = await this.isBluetoothEnabled();
      if (!isEnabled) {
        console.log('🔵 Bluetooth not enabled, attempting to enable...');
        const enabled = await this.enableBluetooth();
        if (!enabled) {
          throw new Error('Bluetooth could not be enabled');
        }
      }
      
      if (this.currentService === androidNativeBluetoothService) {
        // For Android, get both paired and discovered devices
        const bondedDevices = await androidNativeBluetoothService.getBondedDevices();
        
        // Start discovery for new devices
        const discoveryStarted = await androidNativeBluetoothService.startDiscovery();
        if (discoveryStarted) {
          // Wait for discovery to complete
          await new Promise(resolve => setTimeout(resolve, timeout));
          await androidNativeBluetoothService.stopDiscovery();
        }
        
        const allDevices = await androidNativeBluetoothService.getAllDevices();
        console.log(`📱 Found ${allDevices.length} Android devices`);
        return allDevices;
      } else {
        return await this.currentService.scanForDevices();
      }
      
    } catch (error) {
      console.error('❌ Device scan failed:', error);
      return [];
    }
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      if (!this.currentService) {
        await this.initialize();
      }
      
      if (!this.currentService) {
        throw new Error('No Bluetooth service available');
      }
      
      const result = await this.currentService.connectToDevice(device);
      
      if (result.success && result.device) {
        this.connectionStatus = {
          isConnected: true,
          device: result.device,
          strategy: result.strategy || 'Unknown',
          lastConnected: new Date()
        };
      }
      
      return result;
      
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
      if (!this.currentService) {
        return false;
      }
      
      const result = await this.currentService.disconnect();
      
      if (result) {
        this.connectionStatus = {
          isConnected: false,
          device: null,
          strategy: null,
          lastConnected: this.connectionStatus.lastConnected
        };
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Disconnect failed:', error);
      return false;
    }
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.currentService || !this.connectionStatus.isConnected) {
      throw new Error('No device connected');
    }
    
    return await this.currentService.sendCommand(command);
  }

  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  isConnectedToDevice(): boolean {
    return this.connectionStatus.isConnected;
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.connectionStatus.device;
  }

  getCurrentService(): string {
    if (this.currentService === androidNativeBluetoothService) {
      return 'Android Native';
    } else if (this.currentService === webBluetoothService) {
      return 'Web Bluetooth';
    }
    return 'None';
  }
}

export const unifiedBluetoothService = UnifiedBluetoothService.getInstance();
