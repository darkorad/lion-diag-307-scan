import { LionDiagBluetooth, BluetoothDevice, BluetoothStatus } from '@/plugins/LionDiagBluetooth';
import { toast } from 'sonner';

export interface ConnectionInfo {
  isConnected: boolean;
  device?: BluetoothDevice;
  lastConnected?: Date;
  connectionAttempts: number;
}

export interface DeviceMemory {
  devices: BluetoothDevice[];
  lastSuccessful?: BluetoothDevice;
  blacklistedDevices: string[];
  preferences: {
    autoConnect: boolean;
    preferredDevice?: string;
  };
}

/**
 * Enhanced Native Bluetooth Service for Lion Diag Scan
 * Uses the native Android plugin for reliable OBD2 connectivity
 */
export class EnhancedNativeBluetoothService {
  private static instance: EnhancedNativeBluetoothService;
  private connectionInfo: ConnectionInfo = {
    isConnected: false,
    connectionAttempts: 0
  };
  
  private deviceMemory: DeviceMemory = {
    devices: [],
    blacklistedDevices: [],
    preferences: {
      autoConnect: true
    }
  };
  
  private isScanning = false;
  private scanTimeout?: NodeJS.Timeout;
  private reconnectTimeout?: NodeJS.Timeout;
  private readonly SCAN_TIMEOUT = 15000; // 15 seconds
  private readonly RECONNECT_DELAY = 5000; // 5 seconds
  private readonly MAX_RECONNECT_ATTEMPTS = 3;
  
  // Event listeners
  private eventListeners: { [key: string]: Function[] } = {};
  
  private constructor() {
    this.loadDeviceMemory();
    this.setupEventListeners();
  }
  
  static getInstance(): EnhancedNativeBluetoothService {
    if (!EnhancedNativeBluetoothService.instance) {
      EnhancedNativeBluetoothService.instance = new EnhancedNativeBluetoothService();
    }
    return EnhancedNativeBluetoothService.instance;
  }
  
  /**
   * Setup event listeners for the native plugin
   */
  private setupEventListeners(): void {
    // Device discovery events
    LionDiagBluetooth.addListener('deviceFound', (device: BluetoothDevice) => {
      console.log('Device found:', device);
      this.emit('deviceFound', device);
    });
    
    LionDiagBluetooth.addListener('discoveryStarted', () => {
      console.log('Discovery started');
      this.isScanning = true;
      this.emit('scanStarted');
    });
    
    LionDiagBluetooth.addListener('discoveryFinished', (result) => {
      console.log('Discovery finished:', result);
      this.isScanning = false;
      this.deviceMemory.devices = result.devices;
      this.saveDeviceMemory();
      this.emit('scanFinished', result.devices);
    });
    
    LionDiagBluetooth.addListener('discoveryError', (error) => {
      console.error('Discovery error:', error);
      this.isScanning = false;
      this.emit('scanError', error.error);
    });
    
    // Connection events
    LionDiagBluetooth.addListener('connected', (result) => {
      console.log('Connected:', result);
      this.connectionInfo.isConnected = true;
      this.connectionInfo.lastConnected = new Date();
      this.connectionInfo.connectionAttempts = 0;
      
      // Update device memory
      const device = this.deviceMemory.devices.find(d => d.address === result.address);
      if (device) {
        this.deviceMemory.lastSuccessful = device;
        this.saveDeviceMemory();
      }
      
      this.emit('connected', result);
    });
    
    LionDiagBluetooth.addListener('disconnected', (result) => {
      console.log('Disconnected:', result);
      this.connectionInfo.isConnected = false;
      this.connectionInfo.device = undefined;
      this.emit('disconnected', result);
      
      // Attempt reconnect if enabled
      if (this.deviceMemory.preferences.autoConnect && 
          this.connectionInfo.connectionAttempts < this.MAX_RECONNECT_ATTEMPTS) {
        this.scheduleReconnect();
      }
    });
    
    // Pairing events
    LionDiagBluetooth.addListener('pairingState', (state) => {
      console.log('Pairing state:', state);
      this.emit('pairingStateChanged', state);
    });
  }
  
  /**
   * Check Bluetooth status
   */
  async checkBluetoothStatus(): Promise<BluetoothStatus> {
    try {
      return await LionDiagBluetooth.checkBluetoothStatus();
    } catch (error) {
      console.error('Error checking Bluetooth status:', error);
      return {
        supported: false,
        enabled: false,
        hasPermissions: false
      };
    }
  }
  
  /**
   * Initialize Bluetooth service
   */
  async initialize(): Promise<boolean> {
    try {
      const status = await this.checkBluetoothStatus();
      
      if (!status.supported) {
        toast.error('Bluetooth not supported on this device');
        return false;
      }
      
      if (!status.hasPermissions) {
        console.log('Requesting Bluetooth permissions...');
        const permissionResult = await LionDiagBluetooth.requestPermissions();
        if (!permissionResult.granted) {
          toast.error('Bluetooth permissions are required for OBD2 scanning');
          return false;
        }
      }
      
      if (!status.enabled) {
        console.log('Requesting to enable Bluetooth...');
        const enableResult = await LionDiagBluetooth.enableBluetooth();
        if (!enableResult.requested) {
          toast.error('Please enable Bluetooth manually');
          return false;
        }
        
        // Wait a moment for Bluetooth to enable
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log('Bluetooth service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Bluetooth service:', error);
      toast.error('Failed to initialize Bluetooth');
      return false;
    }
  }
  
  /**
   * Start device scanning
   */
  async startScan(): Promise<boolean> {
    try {
      if (this.isScanning) {
        console.warn('Scan already in progress');
        return false;
      }
      
      // Initialize if needed
      const initialized = await this.initialize();
      if (!initialized) {
        return false;
      }
      
      console.log('Starting device scan...');
      const result = await LionDiagBluetooth.startDiscovery();
      
      if (result.success) {
        this.isScanning = true;
        
        // Set scan timeout
        this.scanTimeout = setTimeout(() => {
          if (this.isScanning) {
            console.log('Scan timeout reached, stopping...');
            this.stopScan();
          }
        }, this.SCAN_TIMEOUT);
        
        return true;
      } else {
        toast.error('Failed to start device scan');
        return false;
      }
    } catch (error) {
      console.error('Error starting scan:', error);
      toast.error('Error starting device scan');
      return false;
    }
  }
  
  /**
   * Stop device scanning
   */
  async stopScan(): Promise<void> {
    try {
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
        this.scanTimeout = undefined;
      }
      
      if (this.isScanning) {
        await LionDiagBluetooth.stopDiscovery();
        this.isScanning = false;
        console.log('Device scan stopped');
      }
    } catch (error) {
      console.error('Error stopping scan:', error);
    }
  }
  
  /**
   * Get paired devices
   */
  async getPairedDevices(): Promise<BluetoothDevice[]> {
    try {
      const result = await LionDiagBluetooth.getPairedDevices();
      return result.devices;
    } catch (error) {
      console.error('Error getting paired devices:', error);
      return [];
    }
  }
  
  /**
   * Get all discovered devices
   */
  getDiscoveredDevices(): BluetoothDevice[] {
    return this.deviceMemory.devices;
  }
  
  /**
   * Get devices sorted by OBD2 compatibility
   */
  getOBD2Devices(): BluetoothDevice[] {
    return this.deviceMemory.devices
      .filter(device => !this.deviceMemory.blacklistedDevices.includes(device.address))
      .sort((a, b) => {
        // Sort by compatibility score, then by signal strength
        const compatibilityDiff = b.compatibility - a.compatibility;
        if (compatibilityDiff !== 0) return compatibilityDiff;
        
        const rssiA = a.rssi || -100;
        const rssiB = b.rssi || -100;
        return rssiB - rssiA;
      });
  }
  
  /**
   * Pair with a device
   */
  async pairDevice(device: BluetoothDevice): Promise<boolean> {
    try {
      console.log(`Pairing with ${device.name} (${device.address})...`);
      
      const result = await LionDiagBluetooth.pairDevice({ address: device.address });
      
      if (result.success) {
        toast.success(`Successfully paired with ${device.name}`);
        // Update device in memory
        const deviceIndex = this.deviceMemory.devices.findIndex(d => d.address === device.address);
        if (deviceIndex >= 0) {
          this.deviceMemory.devices[deviceIndex].bonded = true;
          this.saveDeviceMemory();
        }
        return true;
      } else {
        toast.error(`Failed to pair with ${device.name}`);
        return false;
      }
    } catch (error) {
      console.error('Pairing error:', error);
      toast.error(`Pairing failed: ${error}`);
      return false;
    }
  }
  
  /**
   * Connect to a device
   */
  async connectToDevice(device: BluetoothDevice): Promise<boolean> {
    try {
      this.connectionInfo.connectionAttempts++;
      console.log(`Connecting to ${device.name} (${device.address})... Attempt ${this.connectionInfo.connectionAttempts}`);
      
      const result = await LionDiagBluetooth.connectToDevice({ address: device.address });
      
      if (result.success && result.connected) {
        this.connectionInfo.isConnected = true;
        this.connectionInfo.device = device;
        this.connectionInfo.lastConnected = new Date();
        
        // Initialize ELM327
        try {
          await this.initializeELM327();
        } catch (initError) {
          console.warn('ELM327 initialization failed, but connection established:', initError);
        }
        
        toast.success(`Connected to ${device.name}`);
        return true;
      } else {
        toast.error(`Failed to connect to ${device.name}`);
        return false;
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error(`Connection failed: ${error}`);
      
      // Add to blacklist if multiple failures
      if (this.connectionInfo.connectionAttempts >= 3) {
        this.blacklistDevice(device.address);
      }
      
      return false;
    }
  }
  
  /**
   * Smart connect - tries to connect to the best available device
   */
  async smartConnect(): Promise<boolean> {
    try {
      // First, try to connect to the last successful device
      if (this.deviceMemory.lastSuccessful) {
        console.log('Attempting to reconnect to last successful device...');
        const success = await this.connectToDevice(this.deviceMemory.lastSuccessful);
        if (success) return true;
      }
      
      // Try to connect to preferred device
      if (this.deviceMemory.preferences.preferredDevice) {
        const preferredDevice = this.deviceMemory.devices.find(
          d => d.address === this.deviceMemory.preferences.preferredDevice
        );
        if (preferredDevice) {
          console.log('Attempting to connect to preferred device...');
          const success = await this.connectToDevice(preferredDevice);
          if (success) return true;
        }
      }
      
      // Try OBD2 compatible devices in order of compatibility
      const obd2Devices = this.getOBD2Devices();
      for (const device of obd2Devices.slice(0, 3)) { // Try top 3 devices
        console.log(`Attempting smart connect to ${device.name}...`);
        const success = await this.connectToDevice(device);
        if (success) return true;
        
        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('Smart connect failed - no suitable devices found');
      return false;
    } catch (error) {
      console.error('Smart connect error:', error);
      return false;
    }
  }
  
  /**
   * Disconnect from current device
   */
  async disconnect(): Promise<void> {
    try {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = undefined;
      }
      
      await LionDiagBluetooth.disconnect();
      this.connectionInfo.isConnected = false;
      this.connectionInfo.device = undefined;
      console.log('Disconnected from device');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }
  
  /**
   * Check if connected
   */
  async isConnected(): Promise<boolean> {
    try {
      const result = await LionDiagBluetooth.isConnected();
      this.connectionInfo.isConnected = result.connected;
      return result.connected;
    } catch (error) {
      console.error('Error checking connection status:', error);
      return false;
    }
  }
  
  /**
   * Send OBD2 command
   */
  async sendCommand(command: string, timeout: number = 5000): Promise<string> {
    try {
      if (!this.connectionInfo.isConnected) {
        throw new Error('Not connected to any device');
      }
      
      console.log(`Sending command: ${command}`);
      const result = await LionDiagBluetooth.sendCommand({ command, timeout });
      
      if (result.success) {
        console.log(`Command response: ${result.response}`);
        return result.response;
      } else {
        throw new Error(`Command failed: ${command}`);
      }
    } catch (error) {
      console.error(`Command error (${command}):`, error);
      throw error;
    }
  }
  
  /**
   * Initialize ELM327 adapter
   */
  async initializeELM327(): Promise<boolean> {
    try {
      console.log('Initializing ELM327...');
      const result = await LionDiagBluetooth.initializeELM327();
      
      if (result.success) {
        console.log('ELM327 initialized successfully');
        console.log('Initialization responses:', result.responses);
        return true;
      } else {
        console.warn('ELM327 initialization failed');
        return false;
      }
    } catch (error) {
      console.error('ELM327 initialization error:', error);
      return false;
    }
  }
  
  /**
   * Auto-connect functionality
   */
  async attemptAutoConnect(): Promise<boolean> {
    if (!this.deviceMemory.preferences.autoConnect) {
      return false;
    }
    
    try {
      // Check if already connected
      const connected = await this.isConnected();
      if (connected) {
        console.log('Already connected, skipping auto-connect');
        return true;
      }
      
      // Start scan if no devices in memory
      if (this.deviceMemory.devices.length === 0) {
        console.log('No devices in memory, starting scan for auto-connect...');
        await this.startScan();
        
        // Wait for scan to complete
        await new Promise(resolve => setTimeout(resolve, this.SCAN_TIMEOUT + 1000));
      }
      
      // Attempt smart connect
      return await this.smartConnect();
    } catch (error) {
      console.error('Auto-connect error:', error);
      return false;
    }
  }
  
  /**
   * Schedule a reconnect attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectTimeout = setTimeout(async () => {
      console.log('Attempting scheduled reconnect...');
      await this.attemptAutoConnect();
    }, this.RECONNECT_DELAY);
  }
  
  /**
   * Blacklist a device
   */
  private blacklistDevice(address: string): void {
    if (!this.deviceMemory.blacklistedDevices.includes(address)) {
      this.deviceMemory.blacklistedDevices.push(address);
      this.saveDeviceMemory();
      console.log(`Device ${address} blacklisted due to repeated failures`);
    }
  }
  
  /**
   * Remove device from blacklist
   */
  removeFromBlacklist(address: string): void {
    const index = this.deviceMemory.blacklistedDevices.indexOf(address);
    if (index >= 0) {
      this.deviceMemory.blacklistedDevices.splice(index, 1);
      this.saveDeviceMemory();
      console.log(`Device ${address} removed from blacklist`);
    }
  }
  
  /**
   * Set preferred device
   */
  setPreferredDevice(address: string): void {
    this.deviceMemory.preferences.preferredDevice = address;
    this.saveDeviceMemory();
  }
  
  /**
   * Enable/disable auto-connect
   */
  setAutoConnect(enabled: boolean): void {
    this.deviceMemory.preferences.autoConnect = enabled;
    this.saveDeviceMemory();
  }
  
  /**
   * Get connection info
   */
  getConnectionInfo(): ConnectionInfo {
    return { ...this.connectionInfo };
  }
  
  /**
   * Get device memory
   */
  getDeviceMemory(): DeviceMemory {
    return { ...this.deviceMemory };
  }
  
  /**
   * Clear device memory
   */
  clearDeviceMemory(): void {
    this.deviceMemory = {
      devices: [],
      blacklistedDevices: [],
      preferences: {
        autoConnect: true
      }
    };
    this.saveDeviceMemory();
  }
  
  /**
   * Load device memory from localStorage
   */
  private loadDeviceMemory(): void {
    try {
      const stored = localStorage.getItem('liondiag_device_memory');
      if (stored) {
        this.deviceMemory = { ...this.deviceMemory, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load device memory:', error);
    }
  }
  
  /**
   * Save device memory to localStorage
   */
  private saveDeviceMemory(): void {
    try {
      localStorage.setItem('liondiag_device_memory', JSON.stringify(this.deviceMemory));
    } catch (error) {
      console.warn('Failed to save device memory:', error);
    }
  }
  
  /**
   * Event system
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
  
  off(event: string, callback: Function): void {
    if (this.eventListeners[event]) {
      const index = this.eventListeners[event].indexOf(callback);
      if (index >= 0) {
        this.eventListeners[event].splice(index, 1);
      }
    }
  }
  
  private emit(event: string, ...args: any[]): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.stopScan();
    await this.disconnect();
    
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.eventListeners = {};
  }
}

// Export singleton instance
export const enhancedNativeBluetoothService = EnhancedNativeBluetoothService.getInstance();
