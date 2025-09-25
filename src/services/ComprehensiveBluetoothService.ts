import { toast } from 'sonner';
import { BluetoothLe, BleDevice, ScanResultInternal } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';

// Export the types that other components need
export interface BluetoothDevice {
  id: string;
  address: string;
  name: string;
  isPaired: boolean;
  isConnected: boolean;
  deviceType: 'ELM327' | 'OBD2' | 'Generic';
  compatibility: number;
  rssi?: number;
  lastConnected?: Date;
}

export interface BluetoothDiscoveryResult {
  success: boolean;
  devices: BluetoothDevice[];
  error?: string;
}

export interface ConnectionResult {
  success: boolean;
  device?: BluetoothDevice;
  protocol?: string;
  error?: string;
}

export interface SavedDevice {
  address: string;
  name: string;
  lastConnected: number;
  autoReconnect: boolean;
  connectionCount: number;
}

// Define event listener types
type EventListener<T = unknown> = (data: T) => void;
type EventListeners = { [key: string]: EventListener[] };

export class ComprehensiveBluetoothService {
  private static instance: ComprehensiveBluetoothService;
  private isInitialized = false;
  private connectedDevice: BluetoothDevice | null = null;
  private connectedDeviceId: string | null = null;
  private discoveredDevices: BluetoothDevice[] = [];
  private savedDevices: SavedDevice[] = [];
  private scanning = false;
  private eventListeners: EventListeners = {};
  
  private readonly STORAGE_KEY = 'bluetooth_saved_devices';
  private readonly AUTO_RECONNECT_DELAY = 3000;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;

  static getInstance(): ComprehensiveBluetoothService {
    if (!ComprehensiveBluetoothService.instance) {
      ComprehensiveBluetoothService.instance = new ComprehensiveBluetoothService();
    }
    return ComprehensiveBluetoothService.instance;
  }

  private constructor() {
    this.loadSavedDevices();
  }

  async requestAllBluetoothPermissions(): Promise<boolean> {
    try {
      const status = await this.checkBluetoothStatus();
      if (status.hasPermissions) {
        return true;
      }

      const permissionResult = await this.requestPermissions();
      return permissionResult.granted;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async discoverAllDevices(): Promise<BluetoothDiscoveryResult> {
    try {
      const initialized = await this.initialize();
      if (!initialized) {
        return { success: false, devices: [], error: 'Initialization failed' };
      }

      const devices = await this.scanForDevices(10000);
      
      return {
        success: true,
        devices: devices
      };
    } catch (error) {
      return {
        success: false,
        devices: [],
        error: error instanceof Error ? error.message : 'Discovery failed'
      };
    }
  }

  async scanForDevices(timeout: number = 15000): Promise<BluetoothDevice[]> {
    try {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Initialization failed');
      }

      if (this.scanning) {
        console.log('⚠️ Already scanning');
        return this.discoveredDevices;
      }

      console.log('🔍 Starting device scan...');
      this.discoveredDevices = [];
      this.scanning = true;
      this.notifyListeners('scanStarted', {});

      // Get paired devices first
      const pairedDevices = await this.getPairedDevices();
      this.discoveredDevices.push(...pairedDevices);
      console.log(`📱 Found ${pairedDevices.length} paired devices`);

      // Set up scan listener
      const scanListener = await BluetoothLe.addListener('onScanResult', (result: ScanResultInternal) => {
        if (result.device) {
          const device = this.convertBleDeviceToServiceDevice(result.device);
          
          // Update or add device
          const existingIndex = this.discoveredDevices.findIndex(d => d.address === device.address);
          if (existingIndex >= 0) {
            this.discoveredDevices[existingIndex] = device;
          } else {
            this.discoveredDevices.push(device);
          }
          
          this.notifyListeners('deviceFound', device);
        }
      });

      // Start LE scanning
      await BluetoothLe.requestLEScan({
        services: [],
      });

      // Scan for specified timeout
      await new Promise(resolve => setTimeout(resolve, timeout));

      // Stop scanning
      await BluetoothLe.stopLEScan();
      await scanListener.remove();
      this.scanning = false;
      
      // Sort by compatibility
      this.discoveredDevices.sort((a, b) => b.compatibility - a.compatibility);
      this.notifyListeners('scanFinished', { devices: this.discoveredDevices });

      return this.discoveredDevices;
    } catch (error) {
      console.error('Scan for devices failed:', error);
      this.scanning = false;
      this.notifyListeners('scanFinished', { devices: this.discoveredDevices });
      return [];
    }
  }

  async smartConnect(options: { disconnect?: boolean } | BluetoothDevice): Promise<ConnectionResult> {
    if ('disconnect' in options && options.disconnect) {
      const success = await this.disconnect();
      return { success };
    }

    const device = options as BluetoothDevice;
    return await this.connectToDevice(device);
  }

  async pairDevice(device: BluetoothDevice): Promise<boolean> {
    try {
      console.log(`📱 Pairing with ${device.name}...`);
      
      await BluetoothLe.createBond({ deviceId: device.id });
      
      device.isPaired = true;
      this.saveDevice(device, true);
      toast.success(`Successfully paired with ${device.name}`);
      
      // Update device in discovered list
      const deviceIndex = this.discoveredDevices.findIndex(d => d.id === device.id);
      if (deviceIndex >= 0) {
        this.discoveredDevices[deviceIndex].isPaired = true;
      }
      
      this.notifyListeners('pairingStateChanged', { 
        state: 'bonded', 
        device: device.name, 
        address: device.address 
      });
      
      return true;
    } catch (error) {
      console.error('❌ Pairing failed:', error);
      toast.error(`Failed to pair with ${device.name}`);
      return false;
    }
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      console.log('🔵 Initializing Comprehensive Bluetooth Service...');

      const status = await this.checkBluetoothStatus();
      console.log('📊 Bluetooth status:', status);

      if (!status.supported) {
        console.error('❌ Bluetooth not supported');
        toast.error('Bluetooth not supported on this device');
        return false;
      }

      if (!status.hasPermissions) {
        console.log('🔐 Requesting permissions...');
        const permissionResult = await this.requestPermissions();
        
        if (!permissionResult.granted) {
          console.error('❌ Permissions denied');
          toast.error('Bluetooth permissions are required');
          return false;
        }
      }

      if (!status.enabled) {
        console.log('🔵 Requesting to enable Bluetooth...');
        await this.enableBluetooth();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      await BluetoothLe.initialize();
      this.isInitialized = true;
      console.log('✅ Bluetooth service initialized');
      
      setTimeout(() => this.attemptAutoReconnect(), 1000);
      
      return true;
    } catch (error) {
      console.error('❌ Bluetooth initialization failed:', error);
      toast.error('Bluetooth initialization failed');
      return false;
    }
  }

  async checkBluetoothStatus() {
    try {
      if (Capacitor.getPlatform() === 'web') {
        return {
          supported: 'bluetooth' in navigator,
          enabled: 'bluetooth' in navigator,
          hasPermissions: 'bluetooth' in navigator
        };
      }
      
      const result = await BluetoothLe.isEnabled();
      return {
        supported: true,
        enabled: result.value,
        hasPermissions: result.value
      };
    } catch (error) {
      console.error('❌ Bluetooth status check failed:', error);
      return {
        supported: false,
        enabled: false,
        hasPermissions: false
      };
    }
  }

  async requestPermissions() {
    try {
      await BluetoothLe.initialize();
      return {
        granted: true,
        message: 'Permissions granted'
      };
    } catch (error) {
      console.error('❌ Bluetooth permission request failed:', error);
      return {
        granted: false,
        message: 'Permission request failed'
      };
    }
  }

  async enableBluetooth() {
    try {
      if (Capacitor.getPlatform() === 'web') {
        // Web Bluetooth doesn't have enable API
        return { requested: true, message: 'Web Bluetooth enabled' };
      }
      
      await BluetoothLe.requestEnable();
      return { 
        requested: true, 
        message: 'Enable request sent' 
      };
    } catch (error) {
      console.error('❌ Failed to enable Bluetooth:', error);
      return { 
        requested: false, 
        message: 'Cannot request enable' 
      };
    }
  }

  async getPairedDevices(): Promise<BluetoothDevice[]> {
    try {
      if (Capacitor.getPlatform() === 'web') {
        // Web doesn't have paired devices API
        return [];
      }
      
      const result = await BluetoothLe.getBondedDevices();
      const devices: BluetoothDevice[] = result.devices.map(device => ({
        ...this.convertBleDeviceToServiceDevice(device),
        isPaired: true
      }));
      
      return devices;
    } catch (error) {
      console.error('❌ Failed to get paired devices:', error);
      return [];
    }
  }

  async connectToDevice(device: BluetoothDevice, timeout?: number): Promise<ConnectionResult> {
    try {
      console.log(`🔗 Connecting to ${device.name}...`);
      
      if (this.connectedDevice) {
        await this.disconnect();
      }

      // Connect to the device
      await BluetoothLe.connect({ deviceId: device.id });
      
      this.connectedDevice = { ...device, isConnected: true };
      this.connectedDeviceId = device.id;
      this.connectedDevice.lastConnected = new Date();
      
      this.saveDeviceConnection(this.connectedDevice);
      this.reconnectAttempts = 0;
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      toast.success(`Connected to ${this.connectedDevice.name}`);
      this.notifyListeners('connected', this.connectedDevice);
      
      // Initialize ELM327 if it's an OBD2 device
      if (device.deviceType === 'ELM327' || device.deviceType === 'OBD2') {
        console.log('✅ ELM327 device detected');
      }

      return {
        success: true,
        device: this.connectedDevice,
        protocol: device.deviceType
      };
    } catch (error) {
      console.error('❌ Connection failed:', error);
      this.connectedDevice = null;
      this.connectedDeviceId = null;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      if (this.connectedDeviceId) {
        await BluetoothLe.disconnect({ deviceId: this.connectedDeviceId });
      }
      
      if (this.connectedDevice) {
        const deviceName = this.connectedDevice.name;
        this.connectedDevice.isConnected = false;
        
        toast.info(`Disconnected from ${deviceName}`);
        this.notifyListeners('disconnected', { device: deviceName });
        
        // Attempt auto-reconnect if enabled
        const savedDevice = this.getSavedDevice(this.connectedDevice.address);
        if (savedDevice?.autoReconnect && this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
          this.scheduleReconnect();
        } else {
          this.connectedDevice = null;
          this.connectedDeviceId = null;
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Disconnect failed:', error);
      return false;
    }
  }

  async sendCommand(command: string, timeout: number = 5000): Promise<string> {
    if (!this.connectedDevice?.isConnected) {
      throw new Error('Not connected to any device');
    }

    // For now, we'll simulate a response since we don't have the actual characteristic implementation
    // In a real implementation, you would write to the appropriate characteristic
    console.log(`Sending command via BLE: ${command}`);
    
    // Simulate response for now
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return a simulated response based on the command
    if (command.trim() === 'ATI') {
      return 'ELM327 v1.5';
    } else if (command.trim() === 'ATZ') {
      return 'ELM327 v1.5\r>';
    } else {
      return 'OK\r>';
    }
  }

  async attemptAutoReconnect(): Promise<boolean> {
    const lastDevice = this.getLastConnectedDevice();
    
    if (!lastDevice) {
      console.log('ℹ️ No previous device for auto-reconnect');
      return false;
    }

    if (this.connectedDevice?.isConnected) {
      console.log('ℹ️ Already connected');
      return true;
    }

    try {
      console.log(`🔄 Auto-reconnecting to ${lastDevice.name}...`);
      
      const result = await this.connectToDevice(lastDevice);
      
      if (result.success) {
        console.log('✅ Auto-reconnect successful');
        toast.success(`Auto-reconnected to ${lastDevice.name}`);
        return true;
      } else {
        console.log('❌ Auto-reconnect failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Auto-reconnect error:', error);
      return false;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectAttempts++;
    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS}`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.attemptAutoReconnect();
    }, this.AUTO_RECONNECT_DELAY);
  }

  getDiscoveredDevices(): BluetoothDevice[] {
    return [...this.discoveredDevices].sort((a, b) => b.compatibility - a.compatibility);
  }

  getOBD2Devices(): BluetoothDevice[] {
    return this.discoveredDevices
      .filter(device => device.deviceType === 'ELM327' || device.deviceType === 'OBD2')
      .sort((a, b) => b.compatibility - a.compatibility);
  }

  getSavedDevices(): SavedDevice[] {
    return [...this.savedDevices].sort((a, b) => b.lastConnected - a.lastConnected);
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  isConnected(): boolean {
    return !!this.connectedDevice?.isConnected;
  }

  isScanning(): boolean {
    return this.scanning;
  }

  private saveDevice(device: BluetoothDevice, autoReconnect: boolean = false): void {
    const existingIndex = this.savedDevices.findIndex(d => d.address === device.address);
    const savedDevice: SavedDevice = {
      address: device.address,
      name: device.name,
      lastConnected: Date.now(),
      autoReconnect,
      connectionCount: existingIndex >= 0 ? this.savedDevices[existingIndex].connectionCount + 1 : 1
    };

    if (existingIndex >= 0) {
      this.savedDevices[existingIndex] = savedDevice;
    } else {
      this.savedDevices.push(savedDevice);
    }

    this.saveSavedDevices();
  }

  private saveDeviceConnection(device: BluetoothDevice): void {
    this.saveDevice(device, true);
  }

  private getSavedDevice(address: string): SavedDevice | undefined {
    return this.savedDevices.find(d => d.address === address);
  }

  private getLastConnectedDevice(): BluetoothDevice | null {
    const savedDevices = this.getSavedDevices();
    if (savedDevices.length === 0) return null;

    const lastDevice = savedDevices[0];
    
    // Try to find it in discovered devices first
    const discoveredDevice = this.discoveredDevices.find(d => d.address === lastDevice.address);
    if (discoveredDevice) {
      return discoveredDevice;
    }

    // Create device from saved data
    return {
      id: lastDevice.address,
      address: lastDevice.address,
      name: lastDevice.name,
      isPaired: true,
      isConnected: false,
      deviceType: this.identifyDeviceType(lastDevice.name),
      compatibility: this.calculateCompatibility(lastDevice.name),
      lastConnected: new Date(lastDevice.lastConnected)
    };
  }

  clearSavedDevices(): void {
    this.savedDevices = [];
    localStorage.removeItem(this.STORAGE_KEY);
    toast.success('Cleared saved devices');
  }

  removeSavedDevice(address: string): void {
    this.savedDevices = this.savedDevices.filter(d => d.address !== address);
    this.saveSavedDevices();
  }

  private loadSavedDevices(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.savedDevices = JSON.parse(saved);
      }
    } catch (error) {
      console.error('❌ Failed to load saved devices:', error);
      this.savedDevices = [];
    }
  }

  private saveSavedDevices(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.savedDevices));
    } catch (error) {
      console.error('❌ Failed to save devices:', error);
    }
  }

  private convertBleDeviceToServiceDevice(bleDevice: BleDevice): BluetoothDevice {
    const name = bleDevice.name || `Unknown Device (${bleDevice.deviceId.substring(0, 5)})`;
    return {
      id: bleDevice.deviceId,
      address: bleDevice.deviceId,
      name: name,
      isPaired: false, // Will be updated when we check paired status
      isConnected: false,
      deviceType: this.identifyDeviceType(name),
      compatibility: this.calculateCompatibility(name),
    };
  }

  private identifyDeviceType(name: string): 'ELM327' | 'OBD2' | 'Generic' {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('elm327') || lowerName.includes('elm 327')) {
      return 'ELM327';
    }
    
    if (lowerName.includes('obd') || lowerName.includes('vgate') || 
        lowerName.includes('konnwei') || lowerName.includes('autel') ||
        lowerName.includes('foxwell') || lowerName.includes('launch') ||
        lowerName.includes('topdon') || lowerName.includes('bafx')) {
      return 'OBD2';
    }
    
    return 'Generic';
  }

  private calculateCompatibility(name: string): number {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('elm327')) return 95;
    if (lowerName.includes('vgate')) return 90;
    if (lowerName.includes('konnwei')) return 85;
    if (lowerName.includes('autel')) return 80;
    if (lowerName.includes('obd')) return 75;
    if (lowerName.includes('bluetooth') && lowerName.includes('car')) return 60;
    
    return 30;
  }

  addEventListener<T>(event: string, callback: EventListener<T>): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback as EventListener);
  }

  removeEventListener<T>(event: string, callback: EventListener<T>): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  private notifyListeners<T>(event: string, data: T): void {
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

export const comprehensiveBluetoothService = ComprehensiveBluetoothService.getInstance();