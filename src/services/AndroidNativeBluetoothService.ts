import { BluetoothDevice, ConnectionResult } from './bluetooth/types';
import { Capacitor } from '@capacitor/core';

interface AndroidBluetoothPlugin {
  isEnabled(): Promise<{ value: boolean }>;
  enable(): Promise<{ value: boolean }>;
  requestEnable(): Promise<{ value: boolean }>;
  startDiscovery(): Promise<{ success: boolean }>;
  stopDiscovery(): Promise<{ success: boolean }>;
  getBondedDevices(): Promise<{ devices: any[] }>;
  createBond(options: { address: string }): Promise<{ success: boolean }>;
  connect(options: { address: string; uuid?: string }): Promise<{ success: boolean }>;
  disconnect(): Promise<{ success: boolean }>;
  isConnected(): Promise<{ connected: boolean }>;
  write(options: { data: string }): Promise<{ success: boolean }>;
  read(): Promise<{ data: string }>;
  registerReceiver(): Promise<void>;
  unregisterReceiver(): Promise<void>;
  getAdapterState(): Promise<{ state: string }>;
  isDiscovering(): Promise<{ discovering: boolean }>;
}

export class AndroidNativeBluetoothService {
  private static instance: AndroidNativeBluetoothService;
  private bluetoothPlugin: AndroidBluetoothPlugin | null = null;
  private discoveredDevices = new Map<string, BluetoothDevice>();
  private isDiscovering = false;
  private connectedDevice: BluetoothDevice | null = null;
  private receiverRegistered = false;
  private discoveryTimeout: NodeJS.Timeout | null = null;

  // Standard SPP UUID for OBD2 devices
  private readonly SPP_UUID = '00001101-0000-1000-8000-00805F9B34FB';
  
  // OBD2 device name patterns for better detection
  private readonly OBD2_PATTERNS = [
    'elm327', 'elm 327', 'obd', 'obdii', 'obd2', 'vgate', 'icar', 'konnwei', 
    'autel', 'foxwell', 'launch', 'topdon', 'bafx', 'veepeak', 'panlong',
    'wifi327', 'bt327', 'mini elm', 'bluetooth obd', 'scan tool'
  ];

  static getInstance(): AndroidNativeBluetoothService {
    if (!AndroidNativeBluetoothService.instance) {
      AndroidNativeBluetoothService.instance = new AndroidNativeBluetoothService();
    }
    return AndroidNativeBluetoothService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🤖 Initializing Android Native Bluetooth Service...');
      
      if (Capacitor.getPlatform() !== 'android') {
        console.log('⚠️ Not on Android platform');
        return false;
      }

      // Check for our custom Bluetooth plugin
      if ((window as any).CustomBluetoothSerial) {
        this.bluetoothPlugin = (window as any).CustomBluetoothSerial;
        console.log('✅ CustomBluetoothSerial plugin found');
        
        // Register broadcast receiver for device discovery
        await this.registerBroadcastReceiver();
        return true;
      }

      console.log('❌ No Android Bluetooth plugin available');
      return false;
      
    } catch (error) {
      console.error('❌ Android Bluetooth initialization failed:', error);
      return false;
    }
  }

  private async registerBroadcastReceiver(): Promise<void> {
    try {
      if (this.bluetoothPlugin && !this.receiverRegistered) {
        await this.bluetoothPlugin.registerReceiver();
        this.receiverRegistered = true;
        console.log('📡 Broadcast receiver registered for device discovery');
        
        // Listen for discovered devices
        this.listenForDiscoveredDevices();
      }
    } catch (error) {
      console.error('❌ Failed to register broadcast receiver:', error);
    }
  }

  private listenForDiscoveredDevices(): void {
    // Listen for device discovery events
    document.addEventListener('bluetoothDeviceFound', (event: any) => {
      const deviceData = event.detail;
      console.log('📱 Device discovered via broadcast:', deviceData);
      
      const device: BluetoothDevice = {
        id: deviceData.address,
        address: deviceData.address,
        name: deviceData.name || `Device ${deviceData.address?.slice(-4)}`,
        isPaired: false,
        isConnected: false,
        deviceType: this.identifyDeviceType(deviceData.name || ''),
        compatibility: this.calculateCompatibility(deviceData.name || ''),
        rssi: deviceData.rssi
      };
      
      this.discoveredDevices.set(device.address, device);
    });

    document.addEventListener('bluetoothDiscoveryFinished', () => {
      console.log('📱 Device discovery finished');
      this.isDiscovering = false;
      if (this.discoveryTimeout) {
        clearTimeout(this.discoveryTimeout);
        this.discoveryTimeout = null;
      }
    });

    document.addEventListener('bluetoothDiscoveryStarted', () => {
      console.log('📱 Device discovery started');
      this.isDiscovering = true;
    });
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      if (!this.bluetoothPlugin) {
        await this.initialize();
      }
      
      if (this.bluetoothPlugin) {
        // Try multiple methods to check Bluetooth status
        try {
          const result = await this.bluetoothPlugin.isEnabled();
          console.log('📱 Bluetooth enabled status (isEnabled):', result.value);
          return result.value;
        } catch (error) {
          console.log('⚠️ isEnabled failed, trying getAdapterState...');
          
          try {
            const stateResult = await this.bluetoothPlugin.getAdapterState();
            console.log('📱 Bluetooth adapter state:', stateResult.state);
            return stateResult.state === 'STATE_ON' || stateResult.state === 'ON';
          } catch (stateError) {
            console.log('⚠️ getAdapterState also failed, assuming enabled');
            return true; // Optimistic fallback
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error checking Bluetooth status:', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    try {
      console.log('🔵 Attempting to enable Bluetooth...');
      
      if (!this.bluetoothPlugin) {
        console.log('❌ No Bluetooth plugin available');
        return false;
      }
      
      // First check if already enabled
      const isAlreadyEnabled = await this.isBluetoothEnabled();
      if (isAlreadyEnabled) {
        console.log('✅ Bluetooth is already enabled');
        return true;
      }

      // Try requestEnable first (shows system dialog)
      try {
        console.log('🔵 Requesting Bluetooth enable via system dialog...');
        const requestResult = await this.bluetoothPlugin.requestEnable();
        console.log('🔵 Request enable result:', requestResult.value);
        
        if (requestResult.value) {
          // Wait a moment for Bluetooth to actually turn on
          await new Promise(resolve => setTimeout(resolve, 2000));
          return await this.isBluetoothEnabled();
        }
      } catch (requestError) {
        console.log('⚠️ requestEnable failed, trying direct enable...');
      }

      // Fallback to direct enable
      try {
        const result = await this.bluetoothPlugin.enable();
        console.log('🔵 Direct enable result:', result.value);
        
        if (result.value) {
          // Wait for Bluetooth to turn on
          await new Promise(resolve => setTimeout(resolve, 3000));
          return await this.isBluetoothEnabled();
        }
      } catch (enableError) {
        console.error('❌ Direct enable also failed:', enableError);
      }

      return false;
      
    } catch (error) {
      console.error('❌ Error enabling Bluetooth:', error);
      return false;
    }
  }

  async startDiscovery(): Promise<boolean> {
    try {
      console.log('🔍 Starting Android Bluetooth discovery...');
      
      if (!this.bluetoothPlugin) {
        throw new Error('Bluetooth plugin not available');
      }

      // Ensure Bluetooth is enabled first
      const isEnabled = await this.isBluetoothEnabled();
      if (!isEnabled) {
        console.log('🔵 Bluetooth not enabled, attempting to enable...');
        const enabled = await this.enableBluetooth();
        if (!enabled) {
          throw new Error('Failed to enable Bluetooth');
        }
      }

      // Stop any ongoing discovery
      if (this.isDiscovering) {
        console.log('🛑 Stopping previous discovery...');
        await this.stopDiscovery();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Clear previous discoveries
      this.discoveredDevices.clear();
      
      // Start discovery with timeout
      console.log('📡 Starting Bluetooth device discovery...');
      const result = await this.bluetoothPlugin.startDiscovery();
      
      if (result.success) {
        this.isDiscovering = true;
        console.log('✅ Discovery started successfully');
        
        // Set a timeout to automatically stop discovery (Android typically runs for 12 seconds)
        this.discoveryTimeout = setTimeout(async () => {
          console.log('⏰ Discovery timeout reached, stopping...');
          await this.stopDiscovery();
        }, 15000);
        
        return true;
      } else {
        console.error('❌ Failed to start discovery');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Failed to start discovery:', error);
      this.isDiscovering = false;
      return false;
    }
  }

  async stopDiscovery(): Promise<boolean> {
    try {
      if (!this.bluetoothPlugin) {
        return false;
      }

      if (this.discoveryTimeout) {
        clearTimeout(this.discoveryTimeout);
        this.discoveryTimeout = null;
      }
      
      const result = await this.bluetoothPlugin.stopDiscovery();
      this.isDiscovering = false;
      
      console.log('🛑 Discovery stopped:', result.success);
      return result.success;
      
    } catch (error) {
      console.error('❌ Failed to stop discovery:', error);
      this.isDiscovering = false;
      return false;
    }
  }

  async getBondedDevices(): Promise<BluetoothDevice[]> {
    try {
      console.log('🔗 Getting bonded (paired) devices...');
      
      if (!this.bluetoothPlugin) {
        return [];
      }
      
      const result = await this.bluetoothPlugin.getBondedDevices();
      
      if (result.devices && Array.isArray(result.devices)) {
        const bondedDevices = result.devices.map(device => ({
          id: device.address,
          address: device.address,
          name: device.name || `Device ${device.address?.slice(-4)}`,
          isPaired: true,
          isConnected: false,
          deviceType: this.identifyDeviceType(device.name || ''),
          compatibility: this.calculateCompatibility(device.name || ''),
          rssi: device.rssi
        }));
        
        console.log(`✅ Found ${bondedDevices.length} bonded devices`);
        return bondedDevices;
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ Failed to get bonded devices:', error);
      return [];
    }
  }

  async getDiscoveredDevices(): Promise<BluetoothDevice[]> {
    return Array.from(this.discoveredDevices.values());
  }

  async getAllDevices(): Promise<BluetoothDevice[]> {
    const bondedDevices = await this.getBondedDevices();
    const discoveredDevices = await this.getDiscoveredDevices();
    
    // Merge and deduplicate, prioritizing bonded devices
    const allDevices = new Map<string, BluetoothDevice>();
    
    // Add bonded devices first
    bondedDevices.forEach(device => allDevices.set(device.address, device));
    
    // Add discovered devices (won't override bonded ones)
    discoveredDevices.forEach(device => {
      if (!allDevices.has(device.address)) {
        allDevices.set(device.address, device);
      } else {
        // Update RSSI if available
        const existing = allDevices.get(device.address);
        if (existing && device.rssi) {
          existing.rssi = device.rssi;
        }
      }
    });
    
    const devices = Array.from(allDevices.values());
    
    // Sort by OBD2 compatibility, pairing status, and signal strength
    devices.sort((a, b) => {
      // OBD2 devices first
      const aIsOBD2 = a.deviceType === 'ELM327' || a.deviceType === 'OBD2';
      const bIsOBD2 = b.deviceType === 'ELM327' || b.deviceType === 'OBD2';
      if (aIsOBD2 && !bIsOBD2) return -1;
      if (!aIsOBD2 && bIsOBD2) return 1;
      
      // Paired devices next
      if (a.isPaired && !b.isPaired) return -1;
      if (!a.isPaired && b.isPaired) return 1;
      
      // Then by compatibility score
      return (b.compatibility || 0) - (a.compatibility || 0);
    });
    
    return devices;
  }

  async pairDevice(device: BluetoothDevice): Promise<boolean> {
    try {
      console.log(`🤝 Attempting to pair with ${device.name}...`);
      
      if (!this.bluetoothPlugin) {
        throw new Error('Bluetooth plugin not available');
      }
      
      const result = await this.bluetoothPlugin.createBond({ address: device.address });
      console.log(`🤝 Pairing result for ${device.name}:`, result.success);
      
      return result.success;
      
    } catch (error) {
      console.error(`❌ Pairing failed for ${device.name}:`, error);
      return false;
    }
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      console.log(`🔗 Connecting to ${device.name} via RFCOMM socket...`);
      
      if (!this.bluetoothPlugin) {
        throw new Error('Bluetooth plugin not available');
      }

      // If device is not paired, try to pair first
      if (!device.isPaired) {
        console.log(`🤝 Device not paired, attempting pairing first...`);
        const paired = await this.pairDevice(device);
        if (!paired) {
          return {
            success: false,
            error: 'Device pairing failed'
          };
        }
      }

      // Connect using SPP UUID for OBD2 compatibility
      const result = await this.bluetoothPlugin.connect({
        address: device.address,
        uuid: this.SPP_UUID
      });
      
      if (result.success) {
        this.connectedDevice = { ...device, isConnected: true };
        console.log(`✅ Successfully connected to ${device.name}`);
        
        return {
          success: true,
          device: this.connectedDevice,
          strategy: 'Android RFCOMM Socket'
        };
      } else {
        return {
          success: false,
          error: 'RFCOMM socket connection failed'
        };
      }
      
    } catch (error) {
      console.error(`❌ Connection failed for ${device.name}:`, error);
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
      
      if (result.success) {
        this.connectedDevice = null;
        console.log('🔌 Disconnected from device');
      }
      
      return result.success;
      
    } catch (error) {
      console.error('❌ Disconnect failed:', error);
      return false;
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      if (!this.bluetoothPlugin) {
        return false;
      }
      
      const result = await this.bluetoothPlugin.isConnected();
      return result.connected;
      
    } catch (error) {
      console.error('❌ Error checking connection status:', error);
      return false;
    }
  }

  async sendCommand(command: string): Promise<string> {
    try {
      if (!this.bluetoothPlugin || !this.connectedDevice) {
        throw new Error('No device connected');
      }
      
      console.log(`📤 Sending OBD2 command: ${command}`);
      
      // Send command with carriage return
      await this.bluetoothPlugin.write({ data: command + '\r' });
      
      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await this.bluetoothPlugin.read();
      console.log(`📥 OBD2 response: ${response.data}`);
      
      return response.data || 'NO DATA';
      
    } catch (error) {
      console.error('❌ Command failed:', error);
      throw error;
    }
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  getDiscoveringState(): boolean {
    return this.isDiscovering;
  }

  private identifyDeviceType(name: string): 'ELM327' | 'OBD2' | 'Generic' {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('elm327') || lowerName.includes('elm 327')) return 'ELM327';
    
    // Check for OBD2 patterns
    for (const pattern of this.OBD2_PATTERNS) {
      if (lowerName.includes(pattern)) {
        return 'OBD2';
      }
    }
    
    return 'Generic';
  }

  private calculateCompatibility(name: string): number {
    const lowerName = name.toLowerCase();
    
    // ELM327 devices are most compatible
    if (lowerName.includes('elm327')) return 0.95;
    if (lowerName.includes('elm 327')) return 0.95;
    
    // Known good OBD2 brands
    if (lowerName.includes('vgate')) return 0.9;
    if (lowerName.includes('icar')) return 0.9;
    if (lowerName.includes('konnwei')) return 0.85;
    if (lowerName.includes('autel')) return 0.85;
    if (lowerName.includes('veepeak')) return 0.8;
    if (lowerName.includes('bafx')) return 0.8;
    
    // Generic OBD2 mentions
    if (lowerName.includes('obd') || lowerName.includes('scan')) return 0.75;
    
    // Bluetooth devices might be OBD2
    if (lowerName.includes('bluetooth')) return 0.3;
    
    return 0.5;
  }

  async cleanup(): Promise<void> {
    try {
      if (this.isDiscovering) {
        await this.stopDiscovery();
      }
      
      if (this.bluetoothPlugin && this.receiverRegistered) {
        await this.bluetoothPlugin.unregisterReceiver();
        this.receiverRegistered = false;
      }
      
      console.log('🧹 Android Bluetooth service cleaned up');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }
}

export const androidNativeBluetoothService = AndroidNativeBluetoothService.getInstance();
