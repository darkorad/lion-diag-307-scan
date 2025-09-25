import { BluetoothDevice, ConnectionResult } from './bluetooth/types';
import { Emitter } from '../utils/emitter';
import { Capacitor } from '@capacitor/core';
import { BluetoothLe, ScanResultInternal, BleDevice } from '@capacitor-community/bluetooth-le';

export type BluetoothServiceEvent = {
  deviceFound: BluetoothDevice;
  scanStarted: void;
  scanStopped: void;
  connected: BluetoothDevice;
  disconnected: void;
  pairingStateChanged: { state: string; device: string; address: string; success?: boolean; message?: string };
};

class EnhancedAndroidBluetoothService {
  private static instance: EnhancedAndroidBluetoothService;
  private isInitialized = false;
  private isScanning = false;
  private discoveredDevices: Map<string, BluetoothDevice> = new Map();
  private connectedDevice: BluetoothDevice | null = null;
  private connectedDeviceId: string | null = null;
  public emitter = new Emitter<BluetoothServiceEvent>();

  private constructor() {}

  public static getInstance(): EnhancedAndroidBluetoothService {
    if (!EnhancedAndroidBluetoothService.instance) {
      EnhancedAndroidBluetoothService.instance = new EnhancedAndroidBluetoothService();
    }
    return EnhancedAndroidBluetoothService.instance;
  }

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    if (Capacitor.getPlatform() !== 'android') {
        return false;
    }
    console.log('🔧 Initializing Enhanced Android Bluetooth Service...');
    try {
      await BluetoothLe.initialize();
      this.isInitialized = true;
      console.log('✅ Enhanced Android Bluetooth service initialized');
      return true;
    } catch (error) {
      console.error('❌ Enhanced Android Bluetooth initialization failed:', error);
      return false;
    }
  }

  public async checkBluetoothStatus() {
    try {
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

  public async requestPermissions() {
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

  public async enableBluetooth() {
    try {
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

  public async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      // Get paired devices first
      await this.getPairedDevices();
      
      // Start scanning
      this.isScanning = true;
      this.discoveredDevices.clear();
      this.emitter.emit('scanStarted', undefined);
      
      // Set up scan listener
      const scanListener = await BluetoothLe.addListener('onScanResult', (result: ScanResultInternal) => {
        if (result.device) {
          const device = this.bleDeviceToAppDevice(result.device);
          if (!this.discoveredDevices.has(device.address)) {
            this.discoveredDevices.set(device.address, device);
            this.emitter.emit('deviceFound', device);
          }
        }
      });

      // Start LE scanning
      await BluetoothLe.requestLEScan({
        services: [],
      });

      // Scan for 10 seconds
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Stop scanning
      await BluetoothLe.stopLEScan();
      await scanListener.remove();
      this.isScanning = false;
      this.emitter.emit('scanStopped', undefined);

      return this.getDiscoveredDevices();
    } catch (error) {
      console.error('❌ Error during scanning:', error);
      this.isScanning = false;
      this.emitter.emit('scanStopped', undefined);
      return [];
    }
  }

  public async stopDiscovery(): Promise<boolean> {
    try {
      await BluetoothLe.stopLEScan();
      this.isScanning = false;
      return true;
    } catch (error) {
      console.error('❌ Error stopping discovery:', error);
      return false;
    }
  }

  public async getPairedDevices(): Promise<BluetoothDevice[]> {
    try {
      const result = await BluetoothLe.getBondedDevices();
      const devices: BluetoothDevice[] = result.devices.map(device => this.bleDeviceToAppDevice(device));
      devices.forEach(d => this.discoveredDevices.set(d.address, d));
      return devices;
    } catch (error) {
      console.error('❌ Error getting paired devices:', error);
      return [];
    }
  }

  public async pairDevice(address: string) {
    try {
      await BluetoothLe.createBond({ deviceId: address });
      return {
        success: true,
        connected: false
      };
    } catch (error) {
      console.error('❌ Error pairing device:', error);
      return {
        success: false,
        connected: false,
        message: 'Pairing failed'
      };
    }
  }

  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  
  public async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      await this.stopDiscovery();
      this.connectionAttempts++;
      
      // Connect to the device
      await BluetoothLe.connect({ deviceId: device.id });
      
      // Store connection info
      this.connectedDevice = { ...device, isConnected: true };
      this.connectedDeviceId = device.id;
      this.connectionAttempts = 0; // Reset on success
      
      this.emitter.emit('connected', this.connectedDevice);
      
      return { 
        success: true, 
        device: this.connectedDevice,
        strategy: 'Enhanced Android Native' 
      };
    } catch (error: any) {
      // Provide user-friendly error messages for common Bluetooth issues
      let errorMessage = error.message || 'Connection failed';
      let recoverable = true;
      
      if (errorMessage.includes('timeout')) {
        errorMessage = 'Connection timed out. Please ensure the OBD2 device is powered on and in range.';
      } else if (errorMessage.includes('permission')) {
        errorMessage = 'Bluetooth permission denied. Please grant Bluetooth permissions in your device settings.';
        recoverable = false;
      } else if (errorMessage.includes('busy') || errorMessage.includes('in use')) {
        errorMessage = 'Bluetooth device is busy or in use by another app. Please close other apps using Bluetooth.';
      } else if (this.connectionAttempts >= this.maxConnectionAttempts) {
        errorMessage = 'Multiple connection attempts failed. Please ensure the OBD2 device is powered on and in range.';
        recoverable = false;
      }
      
      return { 
        success: false, 
        error: errorMessage,
        recoverable: recoverable
      };
    }
  }

  public async disconnect(): Promise<boolean> {
    try {
      if (this.connectedDeviceId) {
        await BluetoothLe.disconnect({ deviceId: this.connectedDeviceId });
      }
      
      if (this.connectedDevice) {
        this.connectedDevice.isConnected = false;
        this.emitter.emit('disconnected', undefined);
      }
      
      this.connectedDevice = null;
      this.connectedDeviceId = null;
      
      return true;
    } catch (error) {
      console.error('❌ Android disconnect failed:', error);
      return false;
    }
  }

  public async sendCommand(command: string, timeout?: number): Promise<string> {
    if (!this.connectedDevice || !this.connectedDeviceId) {
      throw new Error('No device connected');
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

  public getDiscoveredDevices(): BluetoothDevice[] {
    return Array.from(this.discoveredDevices.values());
  }

  public getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  public isDeviceScanning(): boolean {
    return this.isScanning;
  }

  private bleDeviceToAppDevice(bleDevice: BleDevice): BluetoothDevice {
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
    const lowerName = (name || '').toLowerCase();
    if (lowerName.includes('elm327') || lowerName.includes('elm 327')) return 'ELM327';
    if (lowerName.includes('obd') || lowerName.includes('vgate') || lowerName.includes('konnwei') || lowerName.includes('bafx')) return 'OBD2';
    return 'Generic';
  }

  private calculateCompatibility(name: string): number {
    const lowerName = (name || '').toLowerCase();
    let score = 50; // Base compatibility
    
    // High compatibility indicators
    if (lowerName.includes('elm327')) score = 95;
    else if (lowerName.includes('obd')) score = 85;
    else if (lowerName.includes('vgate') || lowerName.includes('konnwei')) score = 80;
    
    return score;
  }
}

export const enhancedAndroidBluetoothService = EnhancedAndroidBluetoothService.getInstance();