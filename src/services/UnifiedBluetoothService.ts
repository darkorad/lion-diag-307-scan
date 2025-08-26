import { Capacitor } from '@capacitor/core';
import { webBluetoothService } from './WebBluetoothService';
import { androidNativeBluetoothService } from './AndroidNativeBluetoothService';
import { androidBluetoothPermissionService } from './AndroidBluetoothPermissionService';
import { BluetoothDevice, ConnectionResult, ConnectionStatus } from './bluetooth/types';

export type { BluetoothDevice } from './bluetooth/types';

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
  private connectionAttempts = new Map<string, number>();

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
        
        // First request permissions
        console.log('🔐 Requesting Android Bluetooth permissions...');
        const permissionsGranted = await androidBluetoothPermissionService.requestBluetoothPermissions();
        console.log('📋 Permissions granted:', permissionsGranted);
        
        if (!permissionsGranted) {
          console.warn('⚠️ Bluetooth permissions not granted, but continuing...');
        }
        
        // Wait for the plugin to be available
        let attempts = 0;
        const maxAttempts = 20;
        
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
          console.log('🌐 Falling back to Web Bluetooth...');
        } else {
          const androidInitialized = await androidNativeBluetoothService.initialize();
          if (androidInitialized) {
            this.currentService = androidNativeBluetoothService;
            console.log('✅ Android native Bluetooth service initialized');
            this.isInitialized = true;
            return true;
          } else {
            console.log('❌ Android native Bluetooth initialization failed, falling back...');
          }
        }
      }
      
      // Fallback to Web Bluetooth for web platform or if native fails
      console.log('🌐 Using Web Bluetooth...');
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
        const initialized = await this.initialize();
        if (!initialized) {
          console.log('❌ Failed to initialize Bluetooth service');
          return false;
        }
      }
      
      if (!this.currentService) {
        console.log('❌ No Bluetooth service available');
        return false;
      }
      
      // For Android native, check system Bluetooth state
      if (this.currentService === androidNativeBluetoothService) {
        console.log('🤖 Checking Android Bluetooth status...');
        
        // Check if the plugin is available
        if (!(window as any).CustomBluetoothSerial) {
          console.log('❌ CustomBluetoothSerial plugin not available');
          return false;
        }
        
        try {
          const result = await (window as any).CustomBluetoothSerial.isEnabled();
          console.log('🔵 Android Bluetooth enabled result:', result);
          return result.enabled === true;
        } catch (error) {
          console.error('❌ Error checking Android Bluetooth status:', error);
          return false;
        }
      }
      
      // For Web Bluetooth
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
      
      // For Android native, try to enable Bluetooth through the system
      if (this.currentService === androidNativeBluetoothService) {
        console.log('🤖 Attempting to enable Android Bluetooth...');
        
        if (!(window as any).CustomBluetoothSerial) {
          console.log('❌ CustomBluetoothSerial plugin not available');
          return false;
        }
        
        try {
          const result = await (window as any).CustomBluetoothSerial.requestEnable();
          console.log('🔵 Android Bluetooth enable result:', result);
          return result.enabled === true;
        } catch (error) {
          console.error('❌ Error enabling Android Bluetooth:', error);
          // Show instructions to user
          await androidBluetoothPermissionService.showBluetoothInstructions();
          return false;
        }
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
          throw new Error('Bluetooth could not be enabled. Please enable it manually in system settings.');
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
      throw error; // Re-throw to let the UI handle the error
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

  async discoverAllOBD2Devices(): Promise<BluetoothDevice[]> {
    try {
      console.log('🔍 Starting comprehensive OBD2 device discovery...');
      
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (!this.currentService) {
        console.log('❌ No Bluetooth service available for OBD2 discovery');
        return [];
      }
      
      const devices = await this.scanForDevices();
      
      // Filter for OBD2 compatible devices
      const obd2Devices = devices.filter(device => 
        device.deviceType === 'ELM327' || 
        device.deviceType === 'OBD2' || 
        device.compatibility > 0.5
      );
      
      console.log(`📱 Found ${obd2Devices.length} OBD2 compatible devices`);
      return obd2Devices;
      
    } catch (error) {
      console.error('❌ OBD2 device discovery failed:', error);
      return [];
    }
  }

  async smartConnect(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      console.log(`🧠 Smart connecting to ${device.name}...`);
      
      // Track connection attempts
      const attempts = this.connectionAttempts.get(device.address) || 0;
      this.connectionAttempts.set(device.address, attempts + 1);
      
      if (attempts > 3) {
        return {
          success: false,
          error: 'Too many failed connection attempts'
        };
      }
      
      const result = await this.connectToDevice(device);
      
      if (result.success) {
        // Reset attempts on successful connection
        this.connectionAttempts.set(device.address, 0);
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Smart connection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Smart connection failed'
      };
    }
  }

  resetConnectionAttempts(deviceAddress: string): void {
    this.connectionAttempts.set(deviceAddress, 0);
    console.log(`🔄 Reset connection attempts for ${deviceAddress}`);
  }

  getConnectionAttempts(deviceAddress: string): number {
    return this.connectionAttempts.get(deviceAddress) || 0;
  }
}

export const unifiedBluetoothService = UnifiedBluetoothService.getInstance();
