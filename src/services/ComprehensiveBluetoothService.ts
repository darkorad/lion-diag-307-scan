
import {
  BluetoothDevice,
} from './MasterBluetoothService';
import { safeMasterBluetoothService } from './SafeMasterBluetoothService';

export type { BluetoothDevice };

export interface ConnectionResult {
  success: boolean;
  device?: BluetoothDevice;
  protocol?: string;
  error?: string;
  message?: string;
}

export interface DeviceCompatibility {
  device: BluetoothDevice;
  compatibility: number;
  details?: string;
}

export interface BluetoothDiscoveryResult {
  success: boolean;
  devices: BluetoothDevice[];
  error?: string;
}

export interface DevicePattern {
  namePattern?: RegExp;
  addressPattern?: RegExp;
  serviceUUIDs?: string[];
  compatibilityScore: number;
  deviceType: 'OBD2' | 'ELM327' | 'Generic';
}

export class ComprehensiveBluetoothService {
  private static instance: ComprehensiveBluetoothService;
  private deviceCache: { [address: string]: BluetoothDevice } = {};
  private readonly devicePatterns: DevicePattern[] = [
    {
      namePattern: /OBDII|OBD2|ELM327|Vgate|iCar|Viecar|Konnwei|Autel|Launch|Foxwell|Topdon|Delphi/i,
      compatibilityScore: 0.9,
      deviceType: 'ELM327'
    },
    {
      addressPattern: /^(00:0D:18|00:1D:A5|98:D3:31|AC:83:F3)/i,
      compatibilityScore: 0.7,
      deviceType: 'OBD2'
    },
    {
      serviceUUIDs: ['00001101-0000-1000-8000-00805f9b34fb'], // Standard Serial Port UUID
      compatibilityScore: 0.6,
      deviceType: 'OBD2'
    },
    {
      namePattern: /Bluetooth/i,
      compatibilityScore: 0.3,
      deviceType: 'Generic'
    }
  ];

  private constructor() {
    console.log('ComprehensiveBluetoothService initialized');
  }

  static getInstance(): ComprehensiveBluetoothService {
    if (!ComprehensiveBluetoothService.instance) {
      ComprehensiveBluetoothService.instance = new ComprehensiveBluetoothService();
    }
    return ComprehensiveBluetoothService.instance;
  }

  // Permission management
  async requestAllBluetoothPermissions(): Promise<boolean> {
    try {
      // Check if bluetooth is enabled
      const isEnabled = await safeMasterBluetoothService.isBluetoothEnabled();
      if (!isEnabled) {
        await safeMasterBluetoothService.enableBluetooth();
      }
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  // Caching mechanism
  private cacheDevice(device: BluetoothDevice): void {
    this.deviceCache[device.address] = device;
  }

  private getCachedDevice(address: string): BluetoothDevice | undefined {
    return this.deviceCache[address];
  }

  // Clear the device cache
  public clearDeviceCache(): void {
    this.deviceCache = {};
  }

  // Device Identification and Compatibility
  private identifyDeviceType(device: BluetoothDevice): { deviceType: 'OBD2' | 'ELM327' | 'Generic'; compatibility: number } {
    let bestMatch: { deviceType: 'OBD2' | 'ELM327' | 'Generic'; compatibility: number } = {
      deviceType: 'Generic',
      compatibility: 0.1
    };

    for (const pattern of this.devicePatterns) {
      let score = 0;

      if (pattern.namePattern && Boolean(pattern.namePattern.test(device.name))) {
        score += pattern.compatibilityScore;
      }

      if (pattern.addressPattern && device.address && Boolean(pattern.addressPattern.test(device.address))) {
        score += pattern.compatibilityScore;
      }

      if (score > bestMatch.compatibility) {
        bestMatch = {
          deviceType: pattern.deviceType,
          compatibility: score
        };
      }
    }

    return bestMatch;
  }

  private isKnownOBD2Device(name: string, address?: string): boolean {
    const namePattern = /elm327|obd|vgate|viecar|konnwei|autel|launch|foxwell|topdon|delphi|bluetooth.*car|car.*bluetooth|torque|scan.*tool|diagnostic/i;
    const macPattern = /^(00:0D:18|00:1D:A5|98:D3:31|AC:83:F3)/i;
    
    const matchesName = Boolean(namePattern.test(name));
    const matchesAddress = address ? Boolean(macPattern.test(address)) : false;
    
    return matchesName || matchesAddress;
  }

  // Enhanced Device Discovery
  async discoverOBD2Devices(signal?: AbortSignal): Promise<DeviceCompatibility[]> {
    try {
      const devices = await safeMasterBluetoothService.scanForDevices();

      const compatibilityList: DeviceCompatibility[] = devices.map(device => {
        const { deviceType, compatibility } = this.identifyDeviceType(device);
        const enhancedDevice: BluetoothDevice = {
          ...device,
          deviceType,
          compatibility
        };
        
        return {
          device: enhancedDevice,
          compatibility
        };
      });

      return compatibilityList.sort((a, b) => b.compatibility - a.compatibility);
    } catch (error) {
      console.error('Device discovery failed:', error);
      return [];
    }
  }

  async discoverAllDevices(signal?: AbortSignal): Promise<BluetoothDiscoveryResult> {
    try {
      const devices = await safeMasterBluetoothService.scanForDevices();

      const enhancedDevices: BluetoothDevice[] = devices.map(device => {
        const { deviceType, compatibility } = this.identifyDeviceType(device);
        return {
          ...device,
          deviceType,
          compatibility
        };
      });

      return {
        success: true,
        devices: enhancedDevices
      };
    } catch (error) {
      console.error('Full device discovery failed:', error);
      return {
        success: false,
        devices: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Scanning for devices (alias for discoverAllDevices)
  async scanForDevices(timeout: number = 15000): Promise<BluetoothDevice[]> {
    const result = await this.discoverAllDevices();
    return result.devices;
  }

  // Device pairing
  async pairDevice(device: BluetoothDevice): Promise<boolean> {
    try {
      console.log(`Attempting to pair with ${device.name}...`);
      
      // Most OBD2 devices use standard pairing
      // The actual pairing is usually handled by the OS
      // Here we just simulate the pairing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return true;
    } catch (error) {
      console.error('Pairing failed:', error);
      return false;
    }
  }

  // Device Connection and Protocol Handling
  async connectToDevice(device: BluetoothDevice, timeout = 30000): Promise<ConnectionResult> {
    console.log(`Attempting direct connection to ${device.name}...`);

    try {
      const result = await safeMasterBluetoothService.connectToDevice(device);
      
      if (result.success) {
        return {
          success: true,
          device,
          protocol: 'AUTO',
          message: `Successfully connected to ${device.name}`
        };
      } else {
        return {
          success: false,
          error: result.error || 'Connection failed'
        };
      }
    } catch (error) {
      console.error(`Connection failed for ${device.name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      };
    }
  }

  private async attemptConnection(device: BluetoothDevice): Promise<ConnectionResult> {
    console.log(`🔗 Attempting connection to ${device.name}...`);

    try {
      const connected = await this.connectToDevice(device, 30000);
      
      if (connected.success) {
        return {
          success: true,
          device,
          protocol: 'AUTO',
          message: `Successfully connected to ${device.name}`
        };
      } else {
        return {
          success: false,
          error: `Failed to connect to ${device.name}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      };
    }
  }

  // Unified Smart Connect
  async smartConnect(device: BluetoothDevice): Promise<ConnectionResult> {
    console.log(`Starting smart connect process for ${device.name}`);

    // Step 1: Check cached connection
    const cachedDevice = this.getCachedDevice(device.address);
    if (cachedDevice && cachedDevice.isConnected) {
      console.log(`Using cached connection for ${device.name}`);
      return {
        success: true,
        device: cachedDevice,
        protocol: 'AUTO',
        message: `Using cached connection for ${device.name}`
      };
    }

    // Step 2: Attempt direct connection
    const directResult = await this.attemptConnection(device);
    if (directResult.success) {
      this.cacheDevice(device);
      return directResult;
    }

    // Step 3: Attempt secure connection (if applicable)
    if (device.isPaired) {
      console.log(`Attempting secure connection for ${device.name}`);
      const secureResult = await this.attemptConnection(device);
      if (secureResult.success) {
        this.cacheDevice(device);
        return secureResult;
      }
    }

    // Step 4: Attempt standard connection
    console.log(`Attempting standard connection for ${device.name}`);
    const standardResult = await this.attemptConnection(device);
    if (standardResult.success) {
      this.cacheDevice(device);
      return standardResult;
    }

    // If all attempts fail
    console.warn(`Smart connect failed for ${device.name}`);
    return {
      success: false,
      error: `Smart connect failed for ${device.name}`
    };
  }
}

export const comprehensiveBluetoothService = ComprehensiveBluetoothService.getInstance();
