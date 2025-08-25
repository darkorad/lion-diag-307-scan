import { BluetoothDevice, ConnectionResult } from './bluetooth/types';
import { Capacitor } from '@capacitor/core';
import { androidNativeBluetoothService } from './AndroidNativeBluetoothService';

interface BluetoothSerialPlugin {
  isEnabled(): Promise<{ value: boolean }>;
  enable(): Promise<{ value: boolean }>;
  scan(): Promise<{ devices: any[] }>;
  list(): Promise<{ devices: any[] }>;
  connect(options: { address: string }): Promise<{ success: boolean }>;
  disconnect(): Promise<{ success: boolean }>;
  isConnected(): Promise<{ connected: boolean }>;
  write(options: { data: string }): Promise<{ success: boolean }>;
  read(): Promise<{ data: string }>;
  subscribeRawData(): Promise<void>;
  unsubscribeRawData(): Promise<void>;
}

export class RealBluetoothService {
  private static instance: RealBluetoothService;
  private bluetoothSerial: BluetoothSerialPlugin | null = null;
  private connectedDevice: BluetoothDevice | null = null;
  private isInitialized = false;
  private bluetoothEnabled = false;

  static getInstance(): RealBluetoothService {
    if (!RealBluetoothService.instance) {
      RealBluetoothService.instance = new RealBluetoothService();
    }
    return RealBluetoothService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      console.log('🔧 Initializing RealBluetoothService...');

      const platform = Capacitor.getPlatform();
      console.log('📱 Platform:', platform);

      if (platform === 'web') {
        console.log('🌐 Web platform - checking Web Bluetooth API');
        this.bluetoothEnabled = 'bluetooth' in navigator;
        this.isInitialized = true;
        return true;
      }

      if (platform === 'android') {
        console.log('🤖 Android platform - initializing native Bluetooth service');
        const androidInitialized = await androidNativeBluetoothService.initialize();
        if (androidInitialized) {
          console.log('✅ Android native Bluetooth service initialized');
          this.isInitialized = true;
          return true;
        }
      }

      // Fallback: Try to access Bluetooth plugins
      try {
        // Check for @e-is/capacitor-bluetooth-serial plugin
        const { BluetoothSerial } = await import('@e-is/capacitor-bluetooth-serial');
        if (BluetoothSerial) {
          console.log('✅ Found @e-is/capacitor-bluetooth-serial plugin');
          this.bluetoothSerial = BluetoothSerial as any;
        }
      } catch (error) {
        console.log('ℹ️ @e-is/capacitor-bluetooth-serial not available');
      }

      // Check for custom Bluetooth Serial plugin
      if (!this.bluetoothSerial && (window as any).CustomBluetoothSerial) {
        this.bluetoothSerial = (window as any).CustomBluetoothSerial;
        console.log('✅ CustomBluetoothSerial plugin found');
      }

      if (!this.bluetoothSerial && !androidNativeBluetoothService) {
        console.log('⚠️ No Bluetooth plugin found, using mock data');
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize RealBluetoothService:', error);
      return false;
    }
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      await this.initialize();

      const platform = Capacitor.getPlatform();

      if (platform === 'web') {
        // For web, check if Web Bluetooth is available
        if ('bluetooth' in navigator) {
          try {
            const available = await (navigator.bluetooth as any).getAvailability();
            console.log('🌐 Web Bluetooth availability:', available);
            this.bluetoothEnabled = available;
            return available;
          } catch (error) {
            console.log('🌐 Web Bluetooth availability check failed, assuming available');
            this.bluetoothEnabled = true;
            return true;
          }
        }
        return false;
      }

      if (platform === 'android') {
        // Use Android native service first
        const enabled = await androidNativeBluetoothService.isBluetoothEnabled();
        console.log('🤖 Android Bluetooth enabled:', enabled);
        this.bluetoothEnabled = enabled;
        return enabled;
      }

      // Fallback to plugin check
      if (this.bluetoothSerial) {
        try {
          const result = await this.bluetoothSerial.isEnabled();
          console.log('📱 Plugin Bluetooth status:', result);
          this.bluetoothEnabled = result.value;
          return result.value;
        } catch (error) {
          console.log('📱 Plugin Bluetooth check failed, assuming enabled');
          this.bluetoothEnabled = true;
          return true;
        }
      }

      // Default to enabled if we can't determine the status
      console.log('🔵 Cannot determine Bluetooth status, assuming enabled');
      this.bluetoothEnabled = true;
      return true;

    } catch (error) {
      console.error('❌ Error checking Bluetooth status:', error);
      this.bluetoothEnabled = true;
      return true;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    try {
      console.log('🔵 Attempting to enable Bluetooth...');

      const platform = Capacitor.getPlatform();

      if (platform === 'web') {
        this.bluetoothEnabled = 'bluetooth' in navigator;
        return this.bluetoothEnabled;
      }

      if (platform === 'android') {
        const enabled = await androidNativeBluetoothService.enableBluetooth();
        console.log('🤖 Android Bluetooth enable result:', enabled);
        this.bluetoothEnabled = enabled;
        return enabled;
      }

      if (this.bluetoothSerial) {
        try {
          const result = await this.bluetoothSerial.enable();
          console.log('📱 Plugin Bluetooth enable result:', result);
          this.bluetoothEnabled = result.value;
          return result.value;
        } catch (error) {
          console.error('❌ Failed to enable Bluetooth via plugin:', error);
          return await this.isBluetoothEnabled();
        }
      }

      console.log('📱 No method available to enable Bluetooth');
      this.bluetoothEnabled = true;
      return true;

    } catch (error) {
      console.error('❌ Error enabling Bluetooth:', error);
      return await this.isBluetoothEnabled();
    }
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      console.log('🔍 Starting real Bluetooth device scan...');
      await this.initialize();

      const platform = Capacitor.getPlatform();

      if (platform === 'web') {
        return this.scanForDevicesWeb();
      }

      if (platform === 'android') {
        console.log('🤖 Using Android native Bluetooth scanning...');
        
        // Get bonded devices first
        const bondedDevices = await androidNativeBluetoothService.getBondedDevices();
        console.log(`📱 Found ${bondedDevices.length} bonded devices`);

        // Start discovery for new devices
        const discoveryStarted = await androidNativeBluetoothService.startDiscovery();
        console.log('📡 Discovery started:', discoveryStarted);

        if (discoveryStarted) {
          // Wait for discovery to complete (usually takes 12 seconds)
          console.log('⏳ Waiting for device discovery to complete...');
          await new Promise(resolve => setTimeout(resolve, 15000));
          
          // Stop discovery
          await androidNativeBluetoothService.stopDiscovery();
        }

        // Get all devices (bonded + discovered)
        const allDevices = await androidNativeBluetoothService.getAllDevices();
        console.log(`✅ Total devices found: ${allDevices.length}`);
        
        if (allDevices.length > 0) {
          return allDevices;
        }
      }

      // Fallback to plugin scanning
      console.log('📱 Fallback to plugin scanning...');
      const pairedDevices = await this.getPairedDevices();
      console.log(`📱 Found ${pairedDevices.length} paired devices via plugin`);

      if (pairedDevices.length > 0) {
        return pairedDevices;
      }

      // If no real devices found, provide mock devices for testing
      console.log('🧪 No real devices found, providing mock devices for testing');
      return this.getMockDevices();

    } catch (error) {
      console.error('❌ Device scan failed:', error);
      console.log('🧪 Scan failed, providing mock devices for testing');
      return this.getMockDevices();
    }
  }

  async getPairedDevices(): Promise<BluetoothDevice[]> {
    try {
      console.log('📱 Getting paired Bluetooth devices...');

      if (Capacitor.getPlatform() === 'web') {
        return [];
      }

      if (!this.bluetoothSerial) {
        console.log('⚠️ No Bluetooth plugin available for paired devices');
        return [];
      }

      const result = await Promise.race([
        this.bluetoothSerial.list(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('List timeout')), 5000))
      ]);

      console.log('📱 Paired devices result:', result);

      if (result && (result as any).devices && Array.isArray((result as any).devices)) {
        const devices = (result as any).devices.map((device: any) => ({
          id: device.address || device.id,
          name: device.name || `Device ${device.address?.slice(-4) || 'Unknown'}`,
          address: device.address || device.id,
          isPaired: true,
          isConnected: false,
          deviceType: this.identifyDeviceType(device.name || ''),
          compatibility: this.calculateCompatibility(device.name || ''),
          rssi: device.rssi
        }));

        console.log(`✅ Found ${devices.length} paired devices`);
        return devices;
      }

      return [];
    } catch (error) {
      console.error('❌ Failed to get paired devices:', error);
      return [];
    }
  }

  private async scanForDevicesWeb(): Promise<BluetoothDevice[]> {
    try {
      if (!('bluetooth' in navigator)) {
        console.log('🌐 Web Bluetooth not supported');
        return this.getMockDevices();
      }

      console.log('🌐 Attempting Web Bluetooth scan...');
      
      const device = await (navigator.bluetooth as any).requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '00001101-0000-1000-8000-00805f9b34fb', // SPP
          '0000110a-0000-1000-8000-00805f9b34fb'  // Audio
        ]
      });

      return [{
        id: device.id,
        name: device.name || 'Web Bluetooth Device',
        address: device.id,
        isPaired: false,
        isConnected: false,
        deviceType: this.identifyDeviceType(device.name || ''),
        compatibility: 0.8,
        rssi: -50
      }];

    } catch (error) {
      console.log('🌐 Web Bluetooth scan cancelled or failed, showing mock data');
      return this.getMockDevices();
    }
  }

  private getMockDevices(): BluetoothDevice[] {
    return [
      {
        id: 'mock-elm327',
        name: 'ELM327 OBDII',
        address: '00:0D:18:12:34:56',
        isPaired: false,
        isConnected: false,
        deviceType: 'ELM327' as const,
        compatibility: 0.95,
        rssi: -42
      },
      {
        id: 'mock-vgate',
        name: 'Vgate iCar Pro',
        address: '98:D3:31:AB:CD:EF',
        isPaired: true,
        isConnected: false,
        deviceType: 'OBD2' as const,
        compatibility: 0.9,
        rssi: -38
      },
      {
        id: 'mock-paired-obd',
        name: 'OBD2 Scanner',
        address: '12:34:56:78:90:AB',
        isPaired: true,
        isConnected: false,
        deviceType: 'OBD2' as const,
        compatibility: 0.85,
        rssi: -45
      }
    ];
  }

  private identifyDeviceType(name: string): 'ELM327' | 'OBD2' | 'Generic' {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('elm327')) return 'ELM327';
    if (lowerName.includes('obd') || 
        lowerName.includes('vgate') || 
        lowerName.includes('konnwei') ||
        lowerName.includes('autel') ||
        lowerName.includes('foxwell')) return 'OBD2';
    return 'Generic';
  }

  private calculateCompatibility(name: string): number {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('elm327')) return 0.95;
    if (lowerName.includes('vgate')) return 0.9;
    if (lowerName.includes('konnwei')) return 0.85;
    if (lowerName.includes('obd')) return 0.8;
    if (lowerName.includes('bluetooth')) return 0.3;
    
    return 0.5;
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      console.log(`🔗 Connecting to ${device.name} (${device.address})...`);

      const platform = Capacitor.getPlatform();

      if (platform === 'web') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.connectedDevice = { ...device, isConnected: true };
        return { success: true, device: this.connectedDevice };
      }

      if (platform === 'android') {
        console.log('🤖 Using Android native connection...');
        const result = await androidNativeBluetoothService.connectToDevice(device);
        
        if (result.success) {
          this.connectedDevice = result.device || { ...device, isConnected: true };
          console.log(`✅ Android native connection successful`);
          return result;
        } else {
          console.log('⚠️ Android native connection failed, trying plugin fallback...');
        }
      }

      // Plugin fallback
      if (this.bluetoothSerial) {
        try {
          const isConnected = await this.bluetoothSerial.isConnected();
          if (isConnected.connected) {
            console.log('📱 Already connected, disconnecting first...');
            await this.bluetoothSerial.disconnect();
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.log('📱 Could not check connection status, proceeding...');
        }

        const result = await this.bluetoothSerial.connect({ address: device.address });
        
        if (result.success) {
          this.connectedDevice = { ...device, isConnected: true };
          console.log(`✅ Plugin connection successful`);
          
          return { 
            success: true, 
            device: this.connectedDevice,
            strategy: 'Plugin Connection'
          };
        }
      }

      throw new Error('All connection methods failed');

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
      const platform = Capacitor.getPlatform();
      
      if (platform === 'android') {
        const result = await androidNativeBluetoothService.disconnect();
        if (result) {
          this.connectedDevice = null;
          return true;
        }
      }
      
      if (this.bluetoothSerial) {
        await this.bluetoothSerial.disconnect();
      }
      
      this.connectedDevice = null;
      console.log('🔌 Disconnected from device');
      return true;
    } catch (error) {
      console.error('❌ Disconnect failed:', error);
      return false;
    }
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    const platform = Capacitor.getPlatform();

    if (platform === 'web') {
      await new Promise(resolve => setTimeout(resolve, 500));
      return `41 ${command.substring(2)} OK\r>`;
    }

    if (platform === 'android') {
      try {
        return await androidNativeBluetoothService.sendCommand(command);
      } catch (error) {
        console.log('⚠️ Android native command failed, trying plugin...');
      }
    }

    if (!this.bluetoothSerial) {
      throw new Error('Bluetooth plugin not available');
    }

    try {
      await this.bluetoothSerial.write({ data: command + '\r' });
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await this.bluetoothSerial.read();
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
}

export const realBluetoothService = RealBluetoothService.getInstance();
