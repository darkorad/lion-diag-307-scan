
import { LionDiagBluetooth, BluetoothDevice as PluginBluetoothDevice, ConnectionResult as PluginConnectionResult } from '../plugins/LionDiagBluetooth';
import { BluetoothDevice, ConnectionResult } from './bluetooth/types';
import { Emitter } from '../utils/emitter';
import { Capacitor } from '@capacitor/core';

export type BluetoothServiceEvent = {
  deviceFound: BluetoothDevice;
  scanStarted: void;
  scanStopped: void;
  connected: BluetoothDevice;
  disconnected: void;
  pairingStateChanged: { state: string; device: string, address: string, success?: boolean, message?: string };
};

class EnhancedAndroidBluetoothService {
  private static instance: EnhancedAndroidBluetoothService;
  private isInitialized = false;
  private isScanning = false;
  private discoveredDevices: Map<string, BluetoothDevice> = new Map();
  private connectedDevice: BluetoothDevice | null = null;
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
      await this.addEventListeners();
      this.isInitialized = true;
      console.log('✅ Enhanced Android Bluetooth service initialized');
      return true;
    } catch (error) {
      console.error('❌ Enhanced Android Bluetooth initialization failed:', error);
      return false;
    }
  }

  private async addEventListeners() {
    await LionDiagBluetooth.removeAllListeners();

    LionDiagBluetooth.addListener('deviceFound', (device: PluginBluetoothDevice) => {
      const appDevice = this.pluginDeviceToAppDevice(device);
      if (!this.discoveredDevices.has(appDevice.address)) {
        this.discoveredDevices.set(appDevice.address, appDevice);
        this.emitter.emit('deviceFound', appDevice);
      }
    });

    LionDiagBluetooth.addListener('discoveryStarted', () => {
      this.isScanning = true;
      this.discoveredDevices.clear();
      this.emitter.emit('scanStarted', undefined);
    });

    LionDiagBluetooth.addListener('discoveryFinished', () => {
      this.isScanning = false;
      this.emitter.emit('scanStopped', undefined);
    });

    LionDiagBluetooth.addListener('connected', (result: PluginConnectionResult) => {
      if (result.success && result.address) {
        let device = this.discoveredDevices.get(result.address);
        if(!device) {
            device = this.pluginDeviceToAppDevice({ name: result.device || 'Unknown', address: result.address, type: 0, bonded: true, compatibility: 100 });
        }
        this.connectedDevice = { ...device, isConnected: true };
        this.emitter.emit('connected', this.connectedDevice);
      }
    });

    LionDiagBluetooth.addListener('disconnected', () => {
      if (this.connectedDevice) {
        this.connectedDevice.isConnected = false;
      }
      this.connectedDevice = null;
      this.emitter.emit('disconnected', undefined);
    });

    LionDiagBluetooth.addListener('pairingState', (state: any) => {
        // Ensure address is included in the state object
        const pairingState = {
            state: state.state || 'unknown',
            device: state.device || 'Unknown Device',
            address: state.address || '',
            success: state.success,
            message: state.message
        };
        this.emitter.emit('pairingStateChanged', pairingState);
    });
  }

  public async checkBluetoothStatus() {
    return LionDiagBluetooth.checkBluetoothStatus();
  }

  public async requestPermissions() {
    return LionDiagBluetooth.requestPermissions();
  }

  public async enableBluetooth() {
    return LionDiagBluetooth.enableBluetooth();
  }

  public async scanForDevices(): Promise<BluetoothDevice[]> {
    await this.getPairedDevices();
    await LionDiagBluetooth.startDiscovery();

    return new Promise((resolve) => {
        const onScanStopped = () => {
            resolve(this.getDiscoveredDevices());
            this.emitter.off('scanStopped', onScanStopped);
        }
        this.emitter.on('scanStopped', onScanStopped);
    });
  }

  public async stopDiscovery(): Promise<boolean> {
    try {
      const { success } = await LionDiagBluetooth.stopDiscovery();
      return success;
    } catch (error) {
      console.error('❌ Error stopping discovery:', error);
      return false;
    }
  }

  public async getPairedDevices(): Promise<BluetoothDevice[]> {
    try {
      const { devices } = await LionDiagBluetooth.getPairedDevices();
      const appDevices = devices.map(d => this.pluginDeviceToAppDevice(d));
      appDevices.forEach(d => this.discoveredDevices.set(d.address, d));
      return appDevices;
    } catch (error) {
      console.error('❌ Error getting paired devices:', error);
      return [];
    }
  }

  public async pairDevice(address: string) {
      return LionDiagBluetooth.pairDevice({ address });
  }

  public async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      await this.stopDiscovery();
      const result = await LionDiagBluetooth.connectToDevice({ address: device.address });
      if (result.success) {
        return { success: true, device, strategy: 'Enhanced Android Native' };
      } else {
        return { success: false, error: 'Connection failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Connection failed' };
    }
  }

  public async disconnect(): Promise<boolean> {
    try {
      const { success } = await LionDiagBluetooth.disconnect();
      return success;
    } catch (error) {
      console.error('❌ Android disconnect failed:', error);
      return false;
    }
  }

  public async sendCommand(command: string, timeout?: number): Promise<string> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }
    try {
      const { response } = await LionDiagBluetooth.sendCommand({ command, timeout });
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Command failed');
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

  private pluginDeviceToAppDevice(pluginDevice: PluginBluetoothDevice): BluetoothDevice {
    return {
      id: pluginDevice.address,
      address: pluginDevice.address,
      name: pluginDevice.name || 'Unknown Device',
      isPaired: pluginDevice.bonded,
      isConnected: false,
      deviceType: this.identifyDeviceType(pluginDevice.name),
      compatibility: pluginDevice.compatibility,
      rssi: pluginDevice.rssi,
    };
  }

  private identifyDeviceType(name: string): 'ELM327' | 'OBD2' | 'Generic' {
    const lowerName = (name || '').toLowerCase();
    if (lowerName.includes('elm327') || lowerName.includes('elm 327')) return 'ELM327';
    if (lowerName.includes('obd') || lowerName.includes('vgate') || lowerName.includes('konnwei') || lowerName.includes('bafx')) return 'OBD2';
    return 'Generic';
  }
}

export const enhancedAndroidBluetoothService = EnhancedAndroidBluetoothService.getInstance();
