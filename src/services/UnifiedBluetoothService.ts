import { BluetoothDevice, ConnectionResult, ConnectionStatus } from './bluetooth/types';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';
import { realBluetoothService } from './RealBluetoothService';
import { androidBluetoothPermissionService } from './AndroidBluetoothPermissionService';

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
      console.log('🔧 Initializing UnifiedBluetoothService...');
      
      const platform = Capacitor.getPlatform();
      console.log('📱 Platform:', platform);
      
      // Initialize the real Bluetooth service
      const realServiceInitialized = await realBluetoothService.initialize();
      
      if (platform === 'web') {
        console.log('🌐 Running on web - using real service with limitations');
        this.isInitialized = realServiceInitialized;
        return this.isInitialized;
      }

      // For Android, check and request Bluetooth permissions
      if (platform === 'android') {
        console.log('🤖 Android detected - checking Bluetooth permissions...');
        
        const status = await androidBluetoothPermissionService.checkBluetoothStatus();
        console.log('📊 Bluetooth status:', status);
        
        if (!status.enabled) {
          console.log('🔵 Bluetooth not enabled - requesting permissions...');
          const granted = await androidBluetoothPermissionService.requestBluetoothPermissions();
          
          if (!granted) {
            console.error('❌ Bluetooth permissions not granted');
            await androidBluetoothPermissionService.showBluetoothInstructions();
            return false;
          }
        }
      }

      // Check if device supports Bluetooth
      const deviceInfo = await Device.getInfo();
      console.log('📱 Device info:', deviceInfo);
      
      this.isInitialized = realServiceInitialized;
      console.log('✅ UnifiedBluetoothService initialized successfully');
      return this.isInitialized;
      
    } catch (error) {
      console.error('❌ Failed to initialize UnifiedBluetoothService:', error);
      return false;
    }
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      console.log('🔍 Checking if Bluetooth is enabled...');
      return await realBluetoothService.isBluetoothEnabled();
    } catch (error) {
      console.error('❌ Error checking Bluetooth status:', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    try {
      console.log('🔵 Attempting to enable Bluetooth...');
      return await realBluetoothService.enableBluetooth();
    } catch (error) {
      console.error('❌ Error enabling Bluetooth:', error);
      return false;
    }
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      console.log('🔍 Starting Bluetooth device scan...');
      
      await this.initialize();
      
      console.log('Using real Bluetooth service for device scan');
      return await realBluetoothService.scanForDevices();
      
    } catch (error) {
      console.error('❌ Bluetooth scan failed:', error);
      throw new Error(`Bluetooth scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async discoverAllOBD2Devices(): Promise<BluetoothDevice[]> {
    console.log('🔍 Discovering all OBD2 devices...');
    return this.scanForDevices();
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      console.log(`🔗 Attempting to connect to ${device.name}...`);
      
      const result = await realBluetoothService.connectToDevice(device);
      
      if (result.success && result.device) {
        this.connectedDevice = result.device;
        console.log(`✅ Successfully connected to ${device.name}`);
      }
      
      return result;
      
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
      const result = await realBluetoothService.disconnect();
      if (result) {
        this.connectedDevice = null;
      }
      return result;
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
    
    const response = await realBluetoothService.sendCommand(command);
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
