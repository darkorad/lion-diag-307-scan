
import { unifiedBluetoothService, BluetoothDevice } from './UnifiedBluetoothService';
import { bluetoothConnectionManager } from './BluetoothConnectionManager';
import { permissionService } from './PermissionService';

export interface BluetoothIntegrationResult {
  success: boolean;
  devices?: BluetoothDevice[];
  connectedDevice?: BluetoothDevice;
  error?: string;
}

export class BluetoothIntegrationService {
  private static instance: BluetoothIntegrationService;

  static getInstance(): BluetoothIntegrationService {
    if (!BluetoothIntegrationService.instance) {
      BluetoothIntegrationService.instance = new BluetoothIntegrationService();
    }
    return BluetoothIntegrationService.instance;
  }

  // Complete setup and verification of Bluetooth system
  async initializeBluetoothSystem(): Promise<boolean> {
    try {
      console.log('Initializing complete Bluetooth system...');
      
      // 1. Initialize connection manager
      bluetoothConnectionManager.initialize();
      
      // 2. Request all required permissions
      const permissions = await permissionService.requestAllPermissions();
      if (!permissions.bluetooth) {
        console.error('Bluetooth permission denied');
        return false;
      }
      
      // 3. Check if Bluetooth is enabled
      const isEnabled = await masterBluetoothService.isBluetoothEnabled();
      if (!isEnabled) {
        console.log('Bluetooth not enabled, attempting to enable...');
        const enabled = await masterBluetoothService.enableBluetooth();
        if (!enabled) {
          console.error('Failed to enable Bluetooth');
          return false;
        }
      }
      
      console.log('Bluetooth system initialized successfully');
      return true;
      
    } catch (error) {
      console.error('Bluetooth system initialization failed:', error);
      return false;
    }
  }

  // Comprehensive device discovery that works with any OBD2 adapter
  async discoverAllCompatibleDevices(): Promise<BluetoothIntegrationResult> {
    try {
      console.log('Starting comprehensive device discovery...');
      
      // Ensure system is initialized
      const initialized = await this.initializeBluetoothSystem();
      if (!initialized) {
        return {
          success: false,
          error: 'Bluetooth system initialization failed'
        };
      }
      
      // Discover devices using unified service
      const devices = await unifiedBluetoothService.discoverAllOBD2Devices();
      
      console.log(`Discovery complete: found ${devices.length} compatible devices`);
      
      return {
        success: true,
        devices
      };
      
    } catch (error) {
      console.error('Device discovery failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Device discovery failed'
      };
    }
  }

  // Smart connection that handles any OBD2 device
  async connectToDevice(device: BluetoothDevice): Promise<BluetoothIntegrationResult> {
    try {
      console.log(`Connecting to device: ${device.name} (${device.address})`);
      
      // Use unified service for smart connection
      const result = await unifiedBluetoothService.smartConnect(device);
      
      if (result.success && result.device) {
        console.log('Device connected successfully');
        return {
          success: true,
          connectedDevice: result.device
        };
      } else {
        console.error('Connection failed:', result.error);
        return {
          success: false,
          error: result.error
        };
      }
      
    } catch (error) {
      console.error('Connection attempt failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  // Check current connection status
  getConnectionStatus() {
    const state = bluetoothConnectionManager.getConnectionState();
    return {
      isConnected: state.isConnected,
      device: state.device,
      connectionTime: state.connectionTime,
      quality: state.connectionQuality,
      lastSeen: state.lastSeen
    };
  }

  // Disconnect from current device
  async disconnect(): Promise<boolean> {
    try {
      await unifiedBluetoothService.disconnect();
      return true;
    } catch (error) {
      console.error('Disconnect failed:', error);
      return false;
    }
  }

  // Reset connection attempts for troubleshooting
  resetConnectionAttempts(deviceAddress: string): void {
    unifiedBluetoothService.resetConnectionAttempts(deviceAddress);
  }

  // Get available connection methods for a device
  getDeviceConnectionInfo(device: BluetoothDevice) {
    return {
      isPaired: device.isPaired,
      signalStrength: device.rssi,
      compatibility: device.compatibility || 0,
      deviceType: device.deviceType || 'Unknown',
      connectionAttempts: unifiedBluetoothService.getConnectionAttempts(device.address)
    };
  }
}

export const bluetoothIntegrationService = BluetoothIntegrationService.getInstance();
