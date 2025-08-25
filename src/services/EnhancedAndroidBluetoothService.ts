
import { Capacitor } from '@capacitor/core';
import { BluetoothDevice, ConnectionResult } from './bluetooth/types';

interface AndroidBluetoothPlugin {
  // Core Bluetooth methods
  isEnabled(): Promise<{ enabled: boolean }>;
  requestEnable(): Promise<{ enabled: boolean }>;
  getState(): Promise<{ state: string }>;
  
  // Permission methods
  requestPermissions(): Promise<{ granted: boolean }>;
  checkPermissions(): Promise<{ granted: boolean }>;
  
  // Discovery methods
  startDiscovery(): Promise<{ success: boolean }>;
  stopDiscovery(): Promise<{ success: boolean }>;
  isDiscovering(): Promise<{ discovering: boolean }>;
  
  // Device methods
  getBondedDevices(): Promise<{ devices: any[] }>;
  createBond(options: { address: string }): Promise<{ success: boolean }>;
  
  // Connection methods
  connect(options: { address: string; uuid?: string }): Promise<{ success: boolean }>;
  disconnect(): Promise<{ success: boolean }>;
  isConnected(): Promise<{ connected: boolean }>;
  
  // Data methods
  write(options: { data: string }): Promise<{ success: boolean }>;
  read(): Promise<{ data: string }>;
  
  // Event listeners
  addListener(eventName: string, callback: (data: any) => void): Promise<void>;
  removeAllListeners(): Promise<void>;
}

export class EnhancedAndroidBluetoothService {
  private static instance: EnhancedAndroidBluetoothService;
  private bluetoothPlugin: AndroidBluetoothPlugin | null = null;
  private isInitialized = false;
  private discoveredDevices: BluetoothDevice[] = [];
  private isScanning = false;
  private connectedDevice: BluetoothDevice | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  // OBD2 specific UUIDs and identifiers
  private readonly OBD2_SPP_UUID = '00001101-0000-1000-8000-00805F9B34FB';
  private readonly OBD2_DEVICE_PATTERNS = [
    /elm327/i,
    /obd/i,
    /vgate/i,
    /konnwei/i,
    /autel/i,
    /foxwell/i,
    /topdon/i,
    /launch/i,
    /xtool/i,
    /obdlink/i,
    /scan.*tool/i,
    /diagnostic/i
  ];

  static getInstance(): EnhancedAndroidBluetoothService {
    if (!EnhancedAndroidBluetoothService.instance) {
      EnhancedAndroidBluetoothService.instance = new EnhancedAndroidBluetoothService();
    }
    return EnhancedAndroidBluetoothService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      console.log('🔧 Initializing Enhanced Android Bluetooth Service...');

      if (Capacitor.getPlatform() !== 'android') {
        console.log('⚠️ Not on Android platform');
        return false;
      }

      // Try to get the CustomBluetoothSerial plugin
      try {
        const { CustomBluetoothSerial } = await import('../plugins/CustomBluetoothSerial');
        this.bluetoothPlugin = CustomBluetoothSerial as AndroidBluetoothPlugin;
        console.log('✅ CustomBluetoothSerial plugin loaded');
      } catch (error) {
        console.log('⚠️ CustomBluetoothSerial not available, trying window object');
        
        // Fallback to window object
        if ((window as any).CustomBluetoothSerial) {
          this.bluetoothPlugin = (window as any).CustomBluetoothSerial;
          console.log('✅ CustomBluetoothSerial found on window');
        } else {
          throw new Error('CustomBluetoothSerial plugin not available');
        }
      }

      await this.setupEventListeners();
      this.isInitialized = true;
      console.log('✅ Enhanced Android Bluetooth Service initialized');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Enhanced Android Bluetooth Service:', error);
      return false;
    }
  }

  private async setupEventListeners(): Promise<void> {
    if (!this.bluetoothPlugin) return;

    try {
      // Listen for device discovery events
      await this.bluetoothPlugin.addListener('deviceFound', (data: any) => {
        console.log('📱 Device found:', data);
        this.handleDeviceFound(data);
      });

      await this.bluetoothPlugin.addListener('discoveryFinished', () => {
        console.log('🔍 Discovery finished');
        this.isScanning = false;
        this.emitEvent('scanComplete', { devices: this.discoveredDevices });
      });

      await this.bluetoothPlugin.addListener('bluetoothStateChanged', (data: any) => {
        console.log('📡 Bluetooth state changed:', data);
        this.emitEvent('bluetoothStateChanged', data);
      });

    } catch (error) {
      console.warn('⚠️ Failed to setup event listeners:', error);
    }
  }

  private handleDeviceFound(deviceData: any): void {
    try {
      const device: BluetoothDevice = {
        id: deviceData.address || deviceData.id,
        name: deviceData.name || `Device ${deviceData.address?.slice(-4) || 'Unknown'}`,
        address: deviceData.address || deviceData.id,
        isPaired: false,
        isConnected: false,
        deviceType: this.identifyDeviceType(deviceData.name || ''),
        compatibility: this.calculateCompatibility(deviceData.name || ''),
        rssi: deviceData.rssi
      };

      // Avoid duplicates
      if (!this.discoveredDevices.find(d => d.address === device.address)) {
        this.discoveredDevices.push(device);
        this.emitEvent('deviceFound', device);
      }

    } catch (error) {
      console.error('❌ Error processing found device:', error);
    }
  }

  private identifyDeviceType(name: string): 'ELM327' | 'OBD2' | 'Generic' {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('elm327')) return 'ELM327';
    
    if (this.OBD2_DEVICE_PATTERNS.some(pattern => pattern.test(name))) {
      return 'OBD2';
    }
    
    return 'Generic';
  }

  private calculateCompatibility(name: string): number {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('elm327')) return 0.95;
    if (lowerName.includes('vgate')) return 0.9;
    if (lowerName.includes('konnwei')) return 0.85;
    if (lowerName.includes('autel')) return 0.9;
    if (lowerName.includes('foxwell')) return 0.85;
    if (lowerName.includes('obd')) return 0.8;
    
    // Check against OBD2 patterns
    if (this.OBD2_DEVICE_PATTERNS.some(pattern => pattern.test(name))) {
      return 0.75;
    }
    
    return 0.3;
  }

  async requestAllPermissions(): Promise<boolean> {
    try {
      console.log('🔐 Requesting all Bluetooth permissions...');
      
      if (!this.bluetoothPlugin) {
        await this.initialize();
      }

      if (!this.bluetoothPlugin) {
        console.error('❌ Bluetooth plugin not available for permissions');
        return false;
      }

      const result = await this.bluetoothPlugin.requestPermissions();
      console.log('🔐 Permission result:', result);
      
      return result.granted;

    } catch (error) {
      console.error('❌ Failed to request permissions:', error);
      return false;
    }
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      if (!this.bluetoothPlugin) {
        await this.initialize();
      }

      if (!this.bluetoothPlugin) {
        console.log('⚠️ Bluetooth plugin not available');
        return false;
      }

      const result = await this.bluetoothPlugin.isEnabled();
      console.log('📡 Bluetooth enabled:', result.enabled);
      
      return result.enabled;

    } catch (error) {
      console.error('❌ Error checking Bluetooth status:', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    try {
      console.log('🔵 Requesting to enable Bluetooth...');
      
      // First check if already enabled
      const isEnabled = await this.isBluetoothEnabled();
      if (isEnabled) {
        console.log('✅ Bluetooth already enabled');
        return true;
      }

      if (!this.bluetoothPlugin) {
        console.error('❌ Bluetooth plugin not available for enabling');
        return false;
      }

      // Request to enable Bluetooth
      const result = await this.bluetoothPlugin.requestEnable();
      console.log('🔵 Enable Bluetooth result:', result);
      
      if (result.enabled) {
        console.log('✅ Bluetooth enabled successfully');
        return true;
      } else {
        console.log('⚠️ User denied Bluetooth enable request');
        return false;
      }

    } catch (error) {
      console.error('❌ Failed to enable Bluetooth:', error);
      return false;
    }
  }

  async scanForDevices(timeout: number = 12000): Promise<BluetoothDevice[]> {
    try {
      console.log('🔍 Starting enhanced OBD2 device scan...');
      
      // Reset discovered devices
      this.discoveredDevices = [];

      // Ensure Bluetooth is enabled
      const isEnabled = await this.isBluetoothEnabled();
      if (!isEnabled) {
        const enabled = await this.enableBluetooth();
        if (!enabled) {
          throw new Error('Bluetooth not enabled');
        }
      }

      // Ensure permissions are granted
      const hasPermissions = await this.requestAllPermissions();
      if (!hasPermissions) {
        throw new Error('Bluetooth permissions not granted');
      }

      if (!this.bluetoothPlugin) {
        throw new Error('Bluetooth plugin not available');
      }

      // Get bonded devices first
      console.log('📱 Getting bonded devices...');
      const bondedResult = await this.bluetoothPlugin.getBondedDevices();
      
      if (bondedResult.devices && bondedResult.devices.length > 0) {
        console.log(`📱 Found ${bondedResult.devices.length} bonded devices`);
        
        bondedResult.devices.forEach((device: any) => {
          const bluetoothDevice: BluetoothDevice = {
            id: device.address || device.id,
            name: device.name || `Device ${device.address?.slice(-4) || 'Unknown'}`,
            address: device.address || device.id,
            isPaired: true,
            isConnected: false,
            deviceType: this.identifyDeviceType(device.name || ''),
            compatibility: this.calculateCompatibility(device.name || ''),
            rssi: device.rssi
          };
          
          this.discoveredDevices.push(bluetoothDevice);
        });
      }

      // Start discovery for new devices
      console.log('🔍 Starting device discovery...');
      this.isScanning = true;
      
      const discoveryResult = await this.bluetoothPlugin.startDiscovery();
      if (!discoveryResult.success) {
        console.warn('⚠️ Failed to start discovery, using bonded devices only');
        this.isScanning = false;
      } else {
        console.log('✅ Discovery started, waiting for results...');
        
        // Wait for discovery to complete or timeout
        await new Promise<void>((resolve) => {
          const timeoutId = setTimeout(() => {
            console.log('⏰ Discovery timeout reached');
            this.stopDiscovery();
            resolve();
          }, timeout);

          const onComplete = () => {
            clearTimeout(timeoutId);
            this.removeEventListener('scanComplete', onComplete);
            resolve();
          };

          this.addEventListener('scanComplete', onComplete);
        });
      }

      // Sort devices by OBD2 compatibility
      this.discoveredDevices.sort((a, b) => {
        // Prioritize OBD2 devices
        if (a.deviceType !== 'Generic' && b.deviceType === 'Generic') return -1;
        if (a.deviceType === 'Generic' && b.deviceType !== 'Generic') return 1;
        
        // Then by compatibility score
        return (b.compatibility || 0) - (a.compatibility || 0);
      });

      console.log(`✅ Scan complete: Found ${this.discoveredDevices.length} total devices`);
      return [...this.discoveredDevices];

    } catch (error) {
      console.error('❌ Device scan failed:', error);
      this.isScanning = false;
      throw error;
    }
  }

  async stopDiscovery(): Promise<boolean> {
    try {
      if (!this.bluetoothPlugin || !this.isScanning) {
        return true;
      }

      const result = await this.bluetoothPlugin.stopDiscovery();
      this.isScanning = false;
      
      console.log('🛑 Discovery stopped');
      return result.success;

    } catch (error) {
      console.error('❌ Failed to stop discovery:', error);
      this.isScanning = false;
      return false;
    }
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      console.log(`🔗 Connecting to ${device.name} (${device.address})...`);

      if (!this.bluetoothPlugin) {
        throw new Error('Bluetooth plugin not available');
      }

      // Ensure discovery is stopped
      await this.stopDiscovery();

      // Try to connect with OBD2 SPP UUID
      const result = await this.bluetoothPlugin.connect({
        address: device.address,
        uuid: this.OBD2_SPP_UUID
      });

      if (result.success) {
        this.connectedDevice = { ...device, isConnected: true };
        console.log(`✅ Successfully connected to ${device.name}`);
        
        return {
          success: true,
          device: this.connectedDevice,
          strategy: 'Enhanced Android Native'
        };
      } else {
        throw new Error('Connection failed');
      }

    } catch (error) {
      console.error(`❌ Connection to ${device.name} failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      if (!this.bluetoothPlugin) {
        return false;
      }

      const result = await this.bluetoothPlugin.disconnect();
      this.connectedDevice = null;
      
      console.log('🔌 Disconnected from device');
      return result.success;

    } catch (error) {
      console.error('❌ Disconnect failed:', error);
      return false;
    }
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.connectedDevice || !this.bluetoothPlugin) {
      throw new Error('No device connected');
    }

    try {
      // Write command
      await this.bluetoothPlugin.write({ data: command + '\r' });
      
      // Wait a bit for response
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Read response
      const response = await this.bluetoothPlugin.read();
      return response.data || 'NO DATA';

    } catch (error) {
      console.error('❌ Command failed:', error);
      throw error;
    }
  }

  // Event management
  addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Event callback error:', error);
        }
      });
    }
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  isConnected(): boolean {
    return !!this.connectedDevice;
  }

  getDiscoveredDevices(): BluetoothDevice[] {
    return [...this.discoveredDevices];
  }

  isCurrentlyScanning(): boolean {
    return this.isScanning;
  }
}

export const enhancedAndroidBluetoothService = EnhancedAndroidBluetoothService.getInstance();
