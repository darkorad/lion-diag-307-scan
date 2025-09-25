import { BluetoothDevice, ConnectionStatus, ConnectionResult, ScanResult } from './bluetooth/types';
import { mobileSafeBluetoothService } from './MobileSafeBluetoothService';
import { enhancedBluetoothService } from '../obd2/enhanced-bluetooth-service';
import { BluetoothLe, ScanResultInternal } from '@capacitor-community/bluetooth-le';
import { androidBluetoothPermissionService } from './AndroidBluetoothPermissionService';

export class UnifiedBluetoothService {
  private static instance: UnifiedBluetoothService;
  private currentConnectionType: 'ble' | 'classic' | null = null;
  private connectedDeviceId: string | null = null;
  private isScanning = false;
  private discoveredDevices: Map<string, BluetoothDevice> = new Map();

  private constructor() {}

  public static getInstance(): UnifiedBluetoothService {
    if (!UnifiedBluetoothService.instance) {
      UnifiedBluetoothService.instance = new UnifiedBluetoothService();
    }
    return UnifiedBluetoothService.instance;
  }

  /**
   * Check if Bluetooth is available and enabled
   */
  public async checkBluetoothStatus(): Promise<boolean> {
    try {
      // Check if Bluetooth is enabled
      const result = await BluetoothLe.isEnabled();
      return result.value;
    } catch (error) {
      console.warn('Bluetooth not available:', error);
      return false;
    }
  }

  /**
   * Request Bluetooth permissions
   */
  public async requestBluetoothPermissions(): Promise<boolean> {
    try {
      // Use the Android Bluetooth permission service
      return await androidBluetoothPermissionService.requestBluetoothPermissions();
    } catch (error) {
      console.error('Failed to request Bluetooth permissions:', error);
      return false;
    }
  }

  /**
   * Enable Bluetooth
   */
  public async enableBluetooth(): Promise<boolean> {
    try {
      // Request to enable Bluetooth through system dialog
      await BluetoothLe.requestEnable();
      return true;
    } catch (error) {
      console.error('Failed to enable Bluetooth:', error);
      // Try the alternative method
      return await androidBluetoothPermissionService.requestSystemBluetoothEnable();
    }
  }

  /**
   * Scan for devices using Bluetooth LE
   */
  public async scanForDevices(): Promise<ScanResult> {
    try {
      // Request permissions
      const hasPermissions = await this.requestBluetoothPermissions();
      if (!hasPermissions) {
        return {
          devices: [],
          success: false,
          error: 'Bluetooth permissions not granted'
        };
      }

      // Enable Bluetooth if needed
      const isEnabled = await this.checkBluetoothStatus();
      if (!isEnabled) {
        const enabled = await this.enableBluetooth();
        if (!enabled) {
          return {
            devices: [],
            success: false,
            error: 'Failed to enable Bluetooth. Please enable Bluetooth in your device settings.'
          };
        }
      }

      // Initialize Bluetooth LE
      await BluetoothLe.initialize();

      // Clear previous scan results
      this.discoveredDevices.clear();
      this.isScanning = true;

      // Set up scan listener
      const scanListener = await BluetoothLe.addListener('onScanResult', (result: ScanResultInternal) => {
        if (result.device) {
          const device = result.device.name || `Unknown Device (${result.device.deviceId.substring(0, 5)})`;
          const bluetoothDevice: BluetoothDevice = {
            id: result.device.deviceId,
            name: device,
            address: result.device.deviceId,
            isPaired: false, // Will be updated when we check paired status
            isConnected: false,
            deviceType: this.determineDeviceType(device),
            compatibility: this.calculateCompatibility(device),
            rssi: result.rssi
          };
          
          // Store the device
          this.discoveredDevices.set(result.device.deviceId, bluetoothDevice);
        }
      });

      // Start LE scanning
      await BluetoothLe.startEnabledNotifications();
      await BluetoothLe.requestLEScan({
        services: [],
        allowDuplicates: false,
        scanMode: 2 // SCAN_MODE_LOW_LATENCY
      });

      // Scan for 10 seconds
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Stop scanning
      await BluetoothLe.stopLEScan();
      await scanListener.remove();
      this.isScanning = false;

      // Get paired devices
      const pairedDevices = await this.getPairedDevices();
      
      // Combine discovered and paired devices
      const allDevices = Array.from(this.discoveredDevices.values());
      
      // Update paired status for discovered devices
      pairedDevices.forEach(pairedDevice => {
        const discoveredDevice = allDevices.find(d => d.id === pairedDevice.id);
        if (discoveredDevice) {
          discoveredDevice.isPaired = true;
        } else {
          allDevices.push(pairedDevice);
        }
      });

      return {
        devices: allDevices,
        success: true
      };
    } catch (error) {
      this.isScanning = false;
      console.error('Scan error:', error);
      return {
        devices: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during scanning'
      };
    }
  }

  /**
   * Get paired devices
   */
  private async getPairedDevices(): Promise<BluetoothDevice[]> {
    try {
      // Get bonded devices
      const result = await BluetoothLe.getBondedDevices();
      const devices: BluetoothDevice[] = result.devices.map(device => ({
        id: device.deviceId,
        name: device.name || `Unknown Device (${device.deviceId.substring(0, 5)})`,
        address: device.deviceId,
        isPaired: true,
        isConnected: false,
        deviceType: this.determineDeviceType(device.name || 'Unknown Device'),
        compatibility: this.calculateCompatibility(device.name || 'Unknown Device')
      }));
      return devices;
    } catch (error) {
      console.error('Failed to get paired devices:', error);
      return [];
    }
  }

  /**
   * Pair with a device
   */
  public async pairDevice(deviceId: string): Promise<boolean> {
    try {
      // Create bond with the device
      await BluetoothLe.createBond({ deviceId });
      return true;
    } catch (error) {
      console.error('Failed to pair device:', error);
      return false;
    }
  }

  /**
   * Connect to a device using Bluetooth LE
   */
  public async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      // Request permissions
      const hasPermissions = await this.requestBluetoothPermissions();
      if (!hasPermissions) {
        return {
          success: false,
          error: 'Bluetooth permissions not granted'
        };
      }

      // Enable Bluetooth if needed
      const isEnabled = await this.checkBluetoothStatus();
      if (!isEnabled) {
        const enabled = await this.enableBluetooth();
        if (!enabled) {
          return {
            success: false,
            error: 'Failed to enable Bluetooth. Please enable Bluetooth in your device settings.'
          };
        }
      }

      // Initialize Bluetooth LE
      await BluetoothLe.initialize();

      // Connect to the device
      try {
        await BluetoothLe.connect({ deviceId: device.id, timeout: 10000 });
        
        // Store the connected device ID
        this.connectedDeviceId = device.id;
        this.currentConnectionType = 'ble';

        // Set the device in the mobile safe service
        mobileSafeBluetoothService.setConnectedDevice(device);

        return {
          success: true,
          device: {
            ...device,
            isConnected: true
          },
          strategy: 'ble'
        };
      } catch (connectError) {
        // Try to connect using the enhanced Bluetooth service as fallback
        const enhancedResult = await enhancedBluetoothService.connectToDevice(device);
        if (enhancedResult) {
          this.currentConnectionType = 'classic';
          this.connectedDeviceId = device.id;
          
          return {
            success: true,
            device: {
              ...device,
              isConnected: true
            },
            strategy: 'classic'
          };
        }
        
        throw connectError;
      }
    } catch (error) {
      console.error('Connection error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed. Please try again.'
      };
    }
  }

  /**
   * Disconnect from current device
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.connectedDeviceId) {
        await BluetoothLe.disconnect({ deviceId: this.connectedDeviceId });
      }
      
      if (this.currentConnectionType === 'classic') {
        await enhancedBluetoothService.disconnect();
      } else if (this.currentConnectionType === 'ble') {
        mobileSafeBluetoothService.clearConnectedDevice();
      }
      
      this.currentConnectionType = null;
      this.connectedDeviceId = null;
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }

  /**
   * Send command to connected device
   */
  public async sendCommand(command: string): Promise<string> {
    if (this.currentConnectionType === 'classic') {
      return enhancedBluetoothService.sendObdCommand(command);
    } else if (this.currentConnectionType === 'ble') {
      return mobileSafeBluetoothService.sendCommand(command);
    } else {
      throw new Error('No device connected');
    }
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    if (this.currentConnectionType === 'classic') {
      return enhancedBluetoothService.isConnected() ? 'connected' : 'disconnected';
    } else if (this.currentConnectionType === 'ble') {
      return mobileSafeBluetoothService.getConnectionStatus();
    } else {
      return 'disconnected';
    }
  }

  /**
   * Get connected device
   */
  public getConnectedDevice(): BluetoothDevice | null {
    if (this.currentConnectionType === 'classic') {
      const device = enhancedBluetoothService.getConnectedDevice();
      return device ? {
        ...device,
        isConnected: true,
        deviceType: this.determineDeviceType(device.name),
        compatibility: this.calculateCompatibility(device.name)
      } : null;
    } else if (this.currentConnectionType === 'ble') {
      return mobileSafeBluetoothService.getDevice();
    } else {
      return null;
    }
  }

  /**
   * Determine device type based on name
   */
  private determineDeviceType(name: string): BluetoothDevice['deviceType'] {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('elm327') || lowerName.includes('obd')) {
      return 'ELM327';
    } else if (lowerName.includes('scanner') || lowerName.includes('diagnostic')) {
      return 'OBD2';
    } else {
      return 'Generic';
    }
  }

  /**
   * Calculate compatibility score
   */
  private calculateCompatibility(name: string): number {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('elm327')) {
      return 95; // High compatibility
    } else if (lowerName.includes('obd')) {
      return 85; // Good compatibility
    } else if (lowerName.includes('scanner') || lowerName.includes('diagnostic')) {
      return 75; // Moderate compatibility
    } else {
      return 50; // Unknown compatibility
    }
  }
}

export const unifiedBluetoothService = UnifiedBluetoothService.getInstance();