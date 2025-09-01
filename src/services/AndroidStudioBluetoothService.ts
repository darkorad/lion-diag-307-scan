
import { BluetoothDevice, ConnectionResult } from './bluetooth/types';
import { Capacitor } from '@capacitor/core';

interface AndroidStudioBluetoothPlugin {
  requestPermissions(): Promise<{ granted: boolean }>;
  isEnabled(): Promise<{ enabled: boolean }>;
  requestEnable(): Promise<{ enabled: boolean }>;
  startDiscovery(): Promise<{ success: boolean }>;
  stopDiscovery(): Promise<{ success: boolean }>;
  getBondedDevices(): Promise<{ devices: any[] }>;
  connect(options: { address: string; uuid?: string }): Promise<{ success: boolean }>;
  disconnect(): Promise<{ success: boolean }>;
  write(options: { data: string }): Promise<{ success: boolean }>;
  read(): Promise<{ data: string }>;
  isConnected(): Promise<{ connected: boolean }>;
  addListener(eventName: string, callback: (data: any) => void): Promise<void>;
  removeAllListeners(): Promise<void>;
}

export class AndroidStudioBluetoothService {
  private static instance: AndroidStudioBluetoothService;
  private plugin: AndroidStudioBluetoothPlugin | null = null;
  private isInitialized = false;
  private connectedDevice: BluetoothDevice | null = null;
  private discoveredDevices: BluetoothDevice[] = [];
  private isScanning = false;

  private readonly SPP_UUID = '00001101-0000-1000-8000-00805F9B34FB';

  static getInstance(): AndroidStudioBluetoothService {
    if (!AndroidStudioBluetoothService.instance) {
      AndroidStudioBluetoothService.instance = new AndroidStudioBluetoothService();
    }
    return AndroidStudioBluetoothService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      console.log('🔧 Initializing Android Studio Bluetooth Service...');

      if (Capacitor.getPlatform() !== 'android') {
        console.log('⚠️ Not on Android platform');
        return false;
      }

      // Import the plugin
      try {
        const { CustomBluetoothSerial } = await import('../plugins/CustomBluetoothSerial');
        this.plugin = CustomBluetoothSerial as AndroidStudioBluetoothPlugin;
        console.log('✅ CustomBluetoothSerial plugin loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load CustomBluetoothSerial plugin:', error);
        return false;
      }

      // Setup event listeners
      await this.setupEventListeners();
      
      // Request permissions immediately
      const hasPermissions = await this.requestAllPermissions();
      if (!hasPermissions) {
        console.warn('⚠️ Some Bluetooth permissions may be missing');
      }

      this.isInitialized = true;
      console.log('✅ Android Studio Bluetooth Service initialized');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Android Studio Bluetooth Service:', error);
      return false;
    }
  }

  private async setupEventListeners(): Promise<void> {
    if (!this.plugin) return;

    try {
      // Listen for device discovery
      await this.plugin.addListener('deviceFound', (data: any) => {
        console.log('📱 Device found:', data);
        this.handleDeviceFound(data);
      });

      await this.plugin.addListener('discoveryFinished', () => {
        console.log('🔍 Discovery finished');
        this.isScanning = false;
      });

      await this.plugin.addListener('discoveryStarted', () => {
        console.log('🔍 Discovery started');
        this.isScanning = true;
      });

      console.log('📡 Event listeners setup complete');
    } catch (error) {
      console.error('❌ Failed to setup event listeners:', error);
    }
  }

  private handleDeviceFound(deviceData: any): void {
    const device: BluetoothDevice = {
      id: deviceData.address,
      name: deviceData.name || `Device ${deviceData.address?.slice(-4)}`,
      address: deviceData.address,
      isPaired: false,
      isConnected: false,
      deviceType: this.identifyDeviceType(deviceData.name || ''),
      compatibility: this.calculateCompatibility(deviceData.name || ''),
      rssi: deviceData.rssi
    };

    // Avoid duplicates
    if (!this.discoveredDevices.find(d => d.address === device.address)) {
      this.discoveredDevices.push(device);
      console.log(`📱 Added device: ${device.name} (${device.address})`);
    }
  }

  async requestAllPermissions(): Promise<boolean> {
    if (!this.plugin) {
      console.error('❌ Plugin not available for permissions');
      return false;
    }

    try {
      console.log('🔐 Requesting all Bluetooth permissions...');
      const result = await this.plugin.requestPermissions();
      console.log('🔐 Permission result:', result.granted);
      return result.granted;
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      return false;
    }
  }

  async isBluetoothEnabled(): Promise<boolean> {
    if (!this.plugin) {
      await this.initialize();
    }

    if (!this.plugin) return false;

    try {
      const result = await this.plugin.isEnabled();
      console.log('📡 Bluetooth enabled:', result.enabled);
      return result.enabled;
    } catch (error) {
      console.error('❌ Error checking Bluetooth status:', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    if (!this.plugin) return false;

    try {
      console.log('🔵 Requesting Bluetooth enable...');
      const result = await this.plugin.requestEnable();
      console.log('🔵 Enable result:', result.enabled);
      return result.enabled;
    } catch (error) {
      console.error('❌ Failed to enable Bluetooth:', error);
      return false;
    }
  }

  async scanForDevices(timeout: number = 12000): Promise<BluetoothDevice[]> {
    try {
      console.log('🔍 Starting Android Studio Bluetooth scan...');
      
      // Reset discovered devices
      this.discoveredDevices = [];

      // Ensure permissions and Bluetooth enabled
      const hasPermissions = await this.requestAllPermissions();
      if (!hasPermissions) {
        throw new Error('Bluetooth permissions not granted');
      }

      const isEnabled = await this.isBluetoothEnabled();
      if (!isEnabled) {
        const enabled = await this.enableBluetooth();
        if (!enabled) {
          throw new Error('Failed to enable Bluetooth');
        }
      }

      if (!this.plugin) {
        throw new Error('Bluetooth plugin not available');
      }

      // Get bonded devices first
      const bondedResult = await this.plugin.getBondedDevices();
      if (bondedResult.devices && bondedResult.devices.length > 0) {
        console.log(`📱 Found ${bondedResult.devices.length} bonded devices`);
        
        bondedResult.devices.forEach((device: any) => {
          const bluetoothDevice: BluetoothDevice = {
            id: device.address,
            name: device.name || `Device ${device.address?.slice(-4)}`,
            address: device.address,
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
      const discoveryResult = await this.plugin.startDiscovery();
      if (discoveryResult.success) {
        console.log('✅ Discovery started, waiting for results...');
        
        // Wait for discovery to complete
        await new Promise<void>((resolve) => {
          const timeoutId = setTimeout(() => {
            console.log('⏰ Discovery timeout reached');
            this.stopDiscovery();
            resolve();
          }, timeout);

          // Check if discovery finished periodically
          const checkInterval = setInterval(() => {
            if (!this.isScanning) {
              clearTimeout(timeoutId);
              clearInterval(checkInterval);
              resolve();
            }
          }, 1000);
        });
      }

      // Sort devices by OBD2 compatibility
      this.discoveredDevices.sort((a, b) => {
        if (a.deviceType !== 'Generic' && b.deviceType === 'Generic') return -1;
        if (a.deviceType === 'Generic' && b.deviceType !== 'Generic') return 1;
        return (b.compatibility || 0) - (a.compatibility || 0);
      });

      console.log(`✅ Scan complete: Found ${this.discoveredDevices.length} devices`);
      return [...this.discoveredDevices];

    } catch (error) {
      console.error('❌ Device scan failed:', error);
      this.isScanning = false;
      throw error;
    }
  }

  async stopDiscovery(): Promise<boolean> {
    if (!this.plugin || !this.isScanning) return true;

    try {
      const result = await this.plugin.stopDiscovery();
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

      if (!this.plugin) {
        throw new Error('Bluetooth plugin not available');
      }

      // Stop discovery
      await this.stopDiscovery();

      // Connect with OBD2 SPP UUID
      const result = await this.plugin.connect({
        address: device.address,
        uuid: this.SPP_UUID
      });

      if (result.success) {
        this.connectedDevice = { ...device, isConnected: true };
        console.log(`✅ Successfully connected to ${device.name}`);
        
        return {
          success: true,
          device: this.connectedDevice,
          strategy: 'Android Studio Native'
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
    if (!this.plugin) return false;

    try {
      const result = await this.plugin.disconnect();
      this.connectedDevice = null;
      console.log('🔌 Disconnected from device');
      return result.success;
    } catch (error) {
      console.error('❌ Disconnect failed:', error);
      return false;
    }
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.connectedDevice || !this.plugin) {
      throw new Error('No device connected');
    }

    try {
      // Write command
      await this.plugin.write({ data: command + '\r' });
      
      // Wait and read response
      await new Promise(resolve => setTimeout(resolve, 300));
      const response = await this.plugin.read();
      
      return response.data || 'NO DATA';
    } catch (error) {
      console.error('❌ Command failed:', error);
      throw error;
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

  private identifyDeviceType(name: string): 'ELM327' | 'OBD2' | 'Generic' {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('elm327')) return 'ELM327';
    
    const obd2Patterns = [
      /obd/i, /vgate/i, /konnwei/i, /autel/i, /foxwell/i, /topdon/i, 
      /launch/i, /xtool/i, /obdlink/i, /scan.*tool/i, /diagnostic/i
    ];
    
    if (obd2Patterns.some(pattern => pattern.test(name))) {
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
    if (lowerName.includes('obd')) return 0.8;
    
    return 0.3;
  }
}

export const androidStudioBluetoothService = AndroidStudioBluetoothService.getInstance();
