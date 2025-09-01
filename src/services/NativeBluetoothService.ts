
import { LionDiagBluetooth, BluetoothDevice, BluetoothStatus } from '@/plugins/LionDiagBluetooth';
import { toast } from 'sonner';

export interface BluetoothServiceDevice {
  id: string;
  address: string;
  name: string;
  isPaired: boolean;
  isConnected: boolean;
  deviceType: 'ELM327' | 'OBD2' | 'Generic';
  compatibility: number;
  rssi?: number;
}

export interface ServiceConnectionResult {
  success: boolean;
  device?: BluetoothServiceDevice;
  error?: string;
  strategy?: string;
}

export class NativeBluetoothService {
  private static instance: NativeBluetoothService;
  private connectedDevice: BluetoothServiceDevice | null = null;
  private discoveredDevices: BluetoothServiceDevice[] = [];
  private isInitialized = false;
  private eventListeners: { [key: string]: Function[] } = {};

  static getInstance(): NativeBluetoothService {
    if (!NativeBluetoothService.instance) {
      NativeBluetoothService.instance = new NativeBluetoothService();
    }
    return NativeBluetoothService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      console.log('🔵 Initializing Native Bluetooth Service...');
      
      // Setup event listeners
      await this.setupEventListeners();
      
      // Check initial status
      const status = await LionDiagBluetooth.checkBluetoothStatus();
      console.log('📊 Bluetooth status:', status);
      
      if (!status.supported) {
        console.error('❌ Bluetooth not supported on this device');
        return false;
      }

      // Request permissions if not granted
      if (!status.hasPermissions) {
        console.log('🔐 Requesting Bluetooth permissions...');
        const permissionResult = await LionDiagBluetooth.requestPermissions();
        
        if (!permissionResult.granted) {
          console.error('❌ Bluetooth permissions denied');
          toast.error('Bluetooth permissions required');
          return false;
        }
      }

      // Enable Bluetooth if not enabled
      if (!status.enabled) {
        console.log('🔵 Enabling Bluetooth...');
        const enableResult = await LionDiagBluetooth.enableBluetooth();
        console.log('✅ Bluetooth enable result:', enableResult);
      }

      this.isInitialized = true;
      console.log('✅ Native Bluetooth Service initialized');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Native Bluetooth Service:', error);
      return false;
    }
  }

  async scanForDevices(timeout: number = 15000): Promise<BluetoothServiceDevice[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('🔍 Starting Bluetooth device scan...');
      this.discoveredDevices = [];

      // Get paired devices first
      const pairedResult = await LionDiagBluetooth.getPairedDevices();
      const pairedDevices = pairedResult.devices.map(device => this.convertToServiceDevice(device, true));
      this.discoveredDevices.push(...pairedDevices);
      
      console.log(`📱 Found ${pairedDevices.length} paired devices`);

      // Start discovery for new devices
      const discoveryResult = await LionDiagBluetooth.startDiscovery();
      
      if (!discoveryResult.success) {
        console.warn('⚠️ Failed to start discovery:', discoveryResult.message);
        return this.discoveredDevices;
      }

      // Wait for discovery to complete or timeout
      await new Promise<void>((resolve) => {
        const timeoutId = setTimeout(() => {
          LionDiagBluetooth.stopDiscovery();
          resolve();
        }, timeout);

        const discoveryFinishedListener = () => {
          clearTimeout(timeoutId);
          resolve();
        };

        LionDiagBluetooth.addListener('discoveryFinished', discoveryFinishedListener);
      });

      // Sort devices by compatibility score
      this.discoveredDevices.sort((a, b) => b.compatibility - a.compatibility);
      
      console.log(`✅ Scan complete. Found ${this.discoveredDevices.length} total devices`);
      return this.discoveredDevices;

    } catch (error) {
      console.error('❌ Device scan failed:', error);
      toast.error('Device scan failed');
      return [];
    }
  }

  async connectToDevice(device: BluetoothServiceDevice): Promise<ServiceConnectionResult> {
    try {
      console.log(`🔗 Connecting to ${device.name} (${device.address})...`);

      // Disconnect from current device if connected
      if (this.connectedDevice) {
        await this.disconnect();
      }

      // Attempt connection
      const result = await LionDiagBluetooth.connectToDevice({ address: device.address });

      if (result.success) {
        this.connectedDevice = { ...device, isConnected: true };
        
        // Initialize ELM327 if it's an OBD2 device
        if (device.deviceType === 'ELM327' || device.deviceType === 'OBD2') {
          try {
            await LionDiagBluetooth.initializeELM327();
            console.log('✅ ELM327 initialized');
          } catch (error) {
            console.warn('⚠️ ELM327 initialization failed:', error);
          }
        }

        console.log(`✅ Connected to ${device.name}`);
        toast.success(`Connected to ${device.name}`);

        return {
          success: true,
          device: this.connectedDevice,
          strategy: 'Native Bluetooth'
        };
      } else {
        throw new Error('Connection failed');
      }

    } catch (error) {
      console.error(`❌ Connection to ${device.name} failed:`, error);
      const message = error instanceof Error ? error.message : 'Connection failed';
      toast.error(`Connection failed: ${message}`);

      return {
        success: false,
        error: message
      };
    }
  }

  async pairDevice(device: BluetoothServiceDevice): Promise<boolean> {
    try {
      console.log(`📱 Pairing with ${device.name}...`);
      
      const result = await LionDiagBluetooth.pairDevice({ address: device.address });
      
      if (result.success) {
        console.log(`✅ Paired with ${device.name}`);
        toast.success(`Paired with ${device.name}`);
        
        // Update device status
        const deviceIndex = this.discoveredDevices.findIndex(d => d.address === device.address);
        if (deviceIndex >= 0) {
          this.discoveredDevices[deviceIndex].isPaired = true;
        }
        
        return true;
      } else {
        throw new Error('Pairing failed');
      }

    } catch (error) {
      console.error(`❌ Pairing with ${device.name} failed:`, error);
      const message = error instanceof Error ? error.message : 'Pairing failed';
      toast.error(`Pairing failed: ${message}`);
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      if (!this.connectedDevice) {
        return true;
      }

      console.log('🔌 Disconnecting...');
      const result = await LionDiagBluetooth.disconnect();

      if (result.success) {
        this.connectedDevice = null;
        console.log('✅ Disconnected');
        toast.success('Disconnected');
        return true;
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      console.error('❌ Disconnect failed:', error);
      toast.error('Disconnect failed');
      return false;
    }
  }

  async sendCommand(command: string, timeout: number = 5000): Promise<string> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      console.log(`📤 Sending command: ${command}`);
      
      const result = await LionDiagBluetooth.sendCommand({ command, timeout });
      
      if (result.success) {
        console.log(`📥 Response: ${result.response}`);
        return result.response;
      } else {
        throw new Error('Command failed');
      }

    } catch (error) {
      console.error(`❌ Command failed: ${command}`, error);
      throw error;
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      const result = await LionDiagBluetooth.isConnected();
      return result.connected;
    } catch (error) {
      console.error('❌ Connection check failed:', error);
      return false;
    }
  }

  getConnectedDevice(): BluetoothServiceDevice | null {
    return this.connectedDevice;
  }

  getDiscoveredDevices(): BluetoothServiceDevice[] {
    return this.discoveredDevices;
  }

  // Event management
  addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  removeEventListener(event: string, callback: Function): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  private async setupEventListeners(): Promise<void> {
    // Device found during discovery
    await LionDiagBluetooth.addListener('deviceFound', (device: BluetoothDevice) => {
      const serviceDevice = this.convertToServiceDevice(device, false);
      
      // Check if device already exists
      const existing = this.discoveredDevices.find(d => d.address === device.address);
      if (!existing) {
        this.discoveredDevices.push(serviceDevice);
        console.log(`📱 New device found: ${serviceDevice.name}`);
        
        // Notify listeners
        this.notifyListeners('deviceFound', serviceDevice);
      }
    });

    // Discovery events
    await LionDiagBluetooth.addListener('discoveryStarted', () => {
      console.log('🔍 Discovery started');
      this.notifyListeners('discoveryStarted', {});
    });

    await LionDiagBluetooth.addListener('discoveryFinished', (result) => {
      console.log('✅ Discovery finished');
      this.notifyListeners('discoveryFinished', result);
    });

    // Pairing events
    await LionDiagBluetooth.addListener('pairingState', (state) => {
      console.log(`📱 Pairing state: ${state.state} for ${state.device}`);
      this.notifyListeners('pairingState', state);
    });
  }

  private convertToServiceDevice(device: BluetoothDevice, isPaired: boolean): BluetoothServiceDevice {
    return {
      id: device.address,
      address: device.address,
      name: device.name || 'Unknown Device',
      isPaired: isPaired || device.bonded,
      isConnected: false,
      deviceType: this.identifyDeviceType(device.name),
      compatibility: device.compatibility,
      rssi: device.rssi
    };
  }

  private identifyDeviceType(name: string): 'ELM327' | 'OBD2' | 'Generic' {
    if (!name) return 'Generic';
    
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('elm327') || lowerName.includes('elm 327')) {
      return 'ELM327';
    }
    
    if (lowerName.includes('obd') || lowerName.includes('vgate') || 
        lowerName.includes('konnwei') || lowerName.includes('bafx') ||
        lowerName.includes('veepeak') || lowerName.includes('bluetooth obd')) {
      return 'OBD2';
    }
    
    return 'Generic';
  }

  private notifyListeners(event: string, data: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Event listener error for ${event}:`, error);
        }
      });
    }
  }
}

export const nativeBluetoothService = NativeBluetoothService.getInstance();
