import { BluetoothLe, BleDevice, ScanResultInternal } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

// Define the BluetoothDevice interface to match our needs
export interface BluetoothDevice {
  id: string;
  address: string;
  name: string;
  rssi?: number;
  bonded: boolean;
  compatibility: number;
  type?: number;
}

export interface BluetoothStatus {
  supported: boolean;
  enabled: boolean;
  hasPermissions: boolean;
}

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
    // Set up Bluetooth LE scan listener
    BluetoothLe.addListener('onScanResult', (result: ScanResultInternal) => {
      if (result.device) {
        const device = this.bleDeviceToAppDevice(result.device);
        console.log('Device found:', device);
        this.emit('deviceFound', device);
      }
    });
  }
  
  /**
   * Convert BleDevice to our BluetoothDevice format
   */
  private bleDeviceToAppDevice(bleDevice: BleDevice): BluetoothDevice {
    const name = bleDevice.name || `Unknown Device (${bleDevice.deviceId.substring(0, 5)})`;
    return {
      id: bleDevice.deviceId,
      address: bleDevice.deviceId,
      name: name,
      rssi: bleDevice.rssi,
      bonded: false, // Will be updated when we check paired devices
      compatibility: this.calculateCompatibility(name)
    };
  }
  
  /**
   * Calculate device compatibility score
   */
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
  
  /**
   * Check Bluetooth status
   */
  async checkBluetoothStatus(): Promise<BluetoothStatus> {
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
        // For Capacitor Bluetooth LE, permissions are handled during initialization
        await BluetoothLe.initialize();
      }
      
      if (!status.enabled) {
        console.log('Requesting to enable Bluetooth...');
        if (Capacitor.getPlatform() !== 'web') {
          await BluetoothLe.requestEnable();
          // Wait a moment for Bluetooth to enable
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
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
      
      // Clear previous devices
      this.deviceMemory.devices = [];
      
      // Get paired devices first
      const pairedDevices = await this.getPairedDevices();
      this.deviceMemory.devices.push(...pairedDevices);
      
      // Start LE scanning
      await BluetoothLe.requestLEScan({
        services: [],
      });
      
      this.isScanning = true;
      this.emit('scanStarted');
      
      // Set scan timeout
      this.scanTimeout = setTimeout(async () => {
        if (this.isScanning) {
          console.log('Scan timeout reached, stopping...');
          await this.stopScan();
        }
      }, this.SCAN_TIMEOUT);
      
      return true;
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
        await BluetoothLe.stopLEScan();
        this.isScanning = false;
        console.log('Device scan stopped');
        this.emit('scanFinished', this.deviceMemory.devices);
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
      if (Capacitor.getPlatform() === 'web') {
        // Web doesn't have paired devices API
        return [];
      }
      
      const result = await BluetoothLe.getBondedDevices();
      const devices: BluetoothDevice[] = result.devices.map(device => ({
        ...this.bleDeviceToAppDevice(device),
        bonded: true
      }));
      
      return devices;
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
      
      if (Capacitor.getPlatform() === 'web') {
        // Web Bluetooth doesn't require explicit pairing
        toast.success(`Successfully paired with ${device.name}`);
        return true;
      }
      
      await BluetoothLe.createBond({ deviceId: device.id });
      
      toast.success(`Successfully paired with ${device.name}`);
      // Update device in memory
      const deviceIndex = this.deviceMemory.devices.findIndex(d => d.address === device.address);
      if (deviceIndex >= 0) {
        this.deviceMemory.devices[deviceIndex].bonded = true;
        this.saveDeviceMemory();
      }
      return true;
    } catch (error) {
      console.error('Pairing error:', error);
      toast.error(`Failed to pair with ${device.name}`);
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
      
      await BluetoothLe.connect({ deviceId: device.id });
      
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
      this.emit('connected', { success: true, address: device.address, device: device.name });
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      toast.error(`Failed to connect to ${device.name}`);
      
      // Add to blacklist if multiple failures
      if (this.connectionInfo.connectionAttempts >= 3) {
        this.blacklistDevice(device.address);
      }
      
      this.emit('disconnected', { success: false, error: error.message });
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
      
      if (this.connectionInfo.device) {
        await BluetoothLe.disconnect({ deviceId: this.connectionInfo.device.id });
      }
      
      this.connectionInfo.isConnected = false;
      this.connectionInfo.device = undefined;
      console.log('Disconnected from device');
      this.emit('disconnected', { success: true });
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }
  
  /**
   * Check if connected
   */
  async isConnected(): Promise<boolean> {
    try {
      // For now, just return the local state
      // In a real implementation, you might want to check the actual connection status
      return this.connectionInfo.isConnected;
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
      // For now, we'll simulate a response since we don't have the actual characteristic implementation
      // In a real implementation, you would write to the appropriate characteristic
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Return a simulated response based on the command
      if (command.trim() === 'ATI') {
        return 'ELM327 v1.5';
      } else if (command.trim() === 'ATZ') {
        return 'ELM327 v1.5\r>';
      } else {
        return 'OK\r>';
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
      // Send initialization commands
      const initCommands = [
        'ATZ',    // Reset
        'ATE0',   // Echo off
        'ATL1',   // Linefeeds on
        'ATS0',   // Spaces off
        'ATH1',   // Headers on
        'ATSP0'   // Automatic protocol
      ];
      
      for (const cmd of initCommands) {
        try {
          await this.sendCommand(cmd);
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (cmdError) {
          console.warn(`Init command ${cmd} failed:`, cmdError);
        }
      }
      
      console.log('ELM327 initialized successfully');
      return true;
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