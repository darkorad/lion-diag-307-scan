
import { LionDiagBluetooth, BluetoothDevice } from '@/plugins/LionDiagBluetooth';
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
  lastConnected?: Date;
}

export interface ConnectionResult {
  success: boolean;
  device?: BluetoothServiceDevice;
  error?: string;
}

export interface SavedDevice {
  address: string;
  name: string;
  lastConnected: number;
  autoReconnect: boolean;
  connectionCount: number;
}

export class ComprehensiveBluetoothService {
  private static instance: ComprehensiveBluetoothService;
  private isInitialized = false;
  private connectedDevice: BluetoothServiceDevice | null = null;
  private discoveredDevices: BluetoothServiceDevice[] = [];
  private savedDevices: SavedDevice[] = [];
  private isScanning = false;
  private eventListeners: { [key: string]: Function[] } = {};
  
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
    this.setupEventListeners();
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      console.log('🔵 Initializing Comprehensive Bluetooth Service...');

      // Check Bluetooth status
      const status = await LionDiagBluetooth.checkBluetoothStatus();
      console.log('📊 Bluetooth status:', status);

      if (!status.supported) {
        console.error('❌ Bluetooth not supported');
        toast.error('Bluetooth not supported on this device');
        return false;
      }

      // Request permissions
      if (!status.hasPermissions) {
        console.log('🔐 Requesting permissions...');
        const permissionResult = await LionDiagBluetooth.requestPermissions();
        
        if (!permissionResult.granted) {
          console.error('❌ Permissions denied');
          toast.error('Bluetooth permissions are required');
          return false;
        }
      }

      // Enable Bluetooth if needed
      if (!status.enabled) {
        console.log('🔵 Requesting to enable Bluetooth...');
        await LionDiagBluetooth.enableBluetooth();
        // Give time for Bluetooth to enable
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      this.isInitialized = true;
      console.log('✅ Bluetooth service initialized');
      
      // Attempt auto-reconnect
      setTimeout(() => this.attemptAutoReconnect(), 1000);
      
      return true;
    } catch (error) {
      console.error('❌ Bluetooth initialization failed:', error);
      toast.error('Bluetooth initialization failed');
      return false;
    }
  }

  private setupEventListeners(): void {
    // Device discovery events
    LionDiagBluetooth.addListener('deviceFound', (device: BluetoothDevice) => {
      const serviceDevice = this.convertToServiceDevice(device);
      
      // Update or add device
      const existingIndex = this.discoveredDevices.findIndex(d => d.address === device.address);
      if (existingIndex >= 0) {
        this.discoveredDevices[existingIndex] = serviceDevice;
      } else {
        this.discoveredDevices.push(serviceDevice);
      }
      
      this.notifyListeners('deviceFound', serviceDevice);
    });

    LionDiagBluetooth.addListener('discoveryStarted', () => {
      this.isScanning = true;
      this.notifyListeners('scanStarted', {});
    });

    LionDiagBluetooth.addListener('discoveryFinished', (result) => {
      this.isScanning = false;
      // Sort by compatibility
      this.discoveredDevices.sort((a, b) => b.compatibility - a.compatibility);
      this.notifyListeners('scanFinished', { devices: this.discoveredDevices });
    });

    // Connection events
    LionDiagBluetooth.addListener('connected', (result) => {
      if (this.connectedDevice) {
        this.connectedDevice.isConnected = true;
        this.saveDeviceConnection(this.connectedDevice);
        this.reconnectAttempts = 0;
        
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        
        toast.success(`Connected to ${this.connectedDevice.name}`);
        this.notifyListeners('connected', this.connectedDevice);
      }
    });

    LionDiagBluetooth.addListener('disconnected', (result) => {
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
        }
      }
    });

    LionDiagBluetooth.addListener('pairingState', (state) => {
      this.notifyListeners('pairingStateChanged', state);
      
      if (state.state === 'bonded') {
        toast.success(`Successfully paired with ${state.device}`);
        
        // Update device in discovered list
        const deviceIndex = this.discoveredDevices.findIndex(d => d.name === state.device);
        if (deviceIndex >= 0) {
          this.discoveredDevices[deviceIndex].isPaired = true;
        }
      }
    });
  }

  async startScan(): Promise<boolean> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    if (this.isScanning) {
      console.log('⚠️ Already scanning');
      return false;
    }

    try {
      console.log('🔍 Starting device scan...');
      this.discoveredDevices = [];

      // Get paired devices first
      const pairedResult = await LionDiagBluetooth.getPairedDevices();
      const pairedDevices = pairedResult.devices.map(device => ({
        ...this.convertToServiceDevice(device),
        isPaired: true
      }));
      
      this.discoveredDevices.push(...pairedDevices);
      console.log(`📱 Found ${pairedDevices.length} paired devices`);

      // Start discovery for new devices
      const discoveryResult = await LionDiagBluetooth.startDiscovery();
      
      if (discoveryResult.success) {
        return true;
      } else {
        toast.error('Failed to start device scan');
        return false;
      }
    } catch (error) {
      console.error('❌ Scan failed:', error);
      toast.error('Device scan failed');
      return false;
    }
  }

  async stopScan(): Promise<void> {
    try {
      await LionDiagBluetooth.stopDiscovery();
      this.isScanning = false;
    } catch (error) {
      console.error('❌ Failed to stop scan:', error);
    }
  }

  async pairDevice(device: BluetoothServiceDevice): Promise<boolean> {
    try {
      console.log(`📱 Pairing with ${device.name}...`);
      
      const result = await LionDiagBluetooth.pairDevice({ address: device.address });
      
      if (result.success) {
        device.isPaired = true;
        this.saveDevice(device, true);
        return true;
      } else {
        toast.error(`Failed to pair with ${device.name}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Pairing failed:', error);
      toast.error(`Pairing failed: ${error}`);
      return false;
    }
  }

  async connectToDevice(device: BluetoothServiceDevice): Promise<ConnectionResult> {
    try {
      console.log(`🔗 Connecting to ${device.name}...`);
      
      // Disconnect from current device if any
      if (this.connectedDevice) {
        await this.disconnect();
      }

      this.connectedDevice = { ...device };
      
      const result = await LionDiagBluetooth.connectToDevice({ address: device.address });
      
      if (result.success) {
        this.connectedDevice.isConnected = true;
        this.connectedDevice.lastConnected = new Date();
        
        // Initialize ELM327 for OBD2 devices
        if (device.deviceType === 'ELM327' || device.deviceType === 'OBD2') {
          try {
            await LionDiagBluetooth.initializeELM327();
            console.log('✅ ELM327 initialized');
          } catch (initError) {
            console.warn('⚠️ ELM327 initialization failed:', initError);
          }
        }

        return {
          success: true,
          device: this.connectedDevice
        };
      } else {
        this.connectedDevice = null;
        return {
          success: false,
          error: 'Connection failed'
        };
      }
    } catch (error) {
      console.error('❌ Connection failed:', error);
      this.connectedDevice = null;
      
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
      
      await LionDiagBluetooth.disconnect();
      
      if (this.connectedDevice) {
        this.connectedDevice.isConnected = false;
        this.connectedDevice = null;
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

    try {
      const result = await LionDiagBluetooth.sendCommand({ command, timeout });
      
      if (result.success) {
        return result.response;
      } else {
        throw new Error('Command failed');
      }
    } catch (error) {
      console.error('❌ Command failed:', error);
      throw error;
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

  // Device management methods
  getDiscoveredDevices(): BluetoothServiceDevice[] {
    return [...this.discoveredDevices].sort((a, b) => b.compatibility - a.compatibility);
  }

  getOBD2Devices(): BluetoothServiceDevice[] {
    return this.discoveredDevices
      .filter(device => device.deviceType === 'ELM327' || device.deviceType === 'OBD2')
      .sort((a, b) => b.compatibility - a.compatibility);
  }

  getSavedDevices(): SavedDevice[] {
    return [...this.savedDevices].sort((a, b) => b.lastConnected - a.lastConnected);
  }

  getConnectedDevice(): BluetoothServiceDevice | null {
    return this.connectedDevice;
  }

  isConnected(): boolean {
    return !!this.connectedDevice?.isConnected;
  }

  isScanning(): boolean {
    return this.isScanning;
  }

  // Storage methods
  private saveDevice(device: BluetoothServiceDevice, autoReconnect: boolean = false): void {
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

  private saveDeviceConnection(device: BluetoothServiceDevice): void {
    this.saveDevice(device, true);
  }

  private getSavedDevice(address: string): SavedDevice | undefined {
    return this.savedDevices.find(d => d.address === address);
  }

  private getLastConnectedDevice(): BluetoothServiceDevice | null {
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

  // Helper methods
  private convertToServiceDevice(device: BluetoothDevice): BluetoothServiceDevice {
    return {
      id: device.address,
      address: device.address,
      name: device.name || 'Unknown Device',
      isPaired: device.bonded || false,
      isConnected: false,
      deviceType: this.identifyDeviceType(device.name || ''),
      compatibility: device.compatibility || this.calculateCompatibility(device.name || ''),
      rssi: device.rssi
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

  // Event system
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

export const comprehensiveBluetoothService = ComprehensiveBluetoothService.getInstance();
