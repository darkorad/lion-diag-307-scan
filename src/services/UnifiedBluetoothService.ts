import { Capacitor } from '@capacitor/core';
import { BluetoothSerial, BluetoothScanResult } from '@e-is/capacitor-bluetooth-serial';
import { BluetoothDevice, ConnectionResult, ConnectionStatus, ConnectionHistory } from './bluetooth/types';
import { parseObdResponse } from '../utils/obd2Utils';

interface Command {
  command: string;
  resolve: (value: string) => void;
  reject: (reason?: any) => void;
  timeout: number;
}

export class UnifiedBluetoothService {
  private static instance: UnifiedBluetoothService;
  private currentDevice: BluetoothDevice | null = null;
  private isInitialized = false;
  private initPromise: Promise<boolean> | null = null;
  private commandQueue: Command[] = [];
  private isProcessingQueue = false;
  private dataListener: any = null;
  private incomingDataBuffer: string = "";
  private isNative = false;
  private connectionHistory: ConnectionHistory[] = [];
  private problematicDevices = new Set<string>();
  private connectionAttempts = new Map<string, number>();

  static getInstance(): UnifiedBluetoothService {
    if (!UnifiedBluetoothService.instance) {
      UnifiedBluetoothService.instance = new UnifiedBluetoothService();
    }
    return UnifiedBluetoothService.instance;
  }

  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
    console.log(`UnifiedBluetoothService - Platform: ${Capacitor.getPlatform()}, Native: ${this.isNative}`);
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    if (this.initPromise) {
      return this.initPromise;
    }
    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  private async performInitialization(): Promise<boolean> {
    if (!this.isNative) {
        this.isInitialized = true;
        return true;
    }
    console.log('Initializing UnifiedBluetoothService...');
    this.loadConnectionHistory();
    this.isInitialized = true;
    console.log('UnifiedBluetoothService initialized successfully.');
    return true;
  }

  private loadConnectionHistory(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }

      const stored = localStorage.getItem('bluetooth_connection_history');
      if (stored) {
        const data = JSON.parse(stored);
        this.connectionHistory = Array.isArray(data.history) ? data.history : [];
      }
    } catch (error) {
      console.warn('Failed to load connection history:', error);
      this.connectionHistory = [];
    }
  }

  private saveConnectionHistory(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }

      const data = {
        history: this.connectionHistory.slice(0, 50), // Keep last 50 entries
        timestamp: Date.now()
      };
      localStorage.setItem('bluetooth_connection_history', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save connection history:', error);
    }
  }

  async isBluetoothEnabled(): Promise<boolean> {
    if (!this.isNative) return true; // Assume enabled on web
    await this.initialize();
    try {
      const result = await BluetoothSerial.isEnabled();
      return result.enabled;
    } catch (error) {
      console.error('Error checking bluetooth status', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    if (!this.isNative) return true; // Assume enabled on web
    await this.initialize();
    try {
      const result = await BluetoothSerial.enable();
      return result.enabled;
    } catch (error) {
      console.error('Error enabling bluetooth', error);
      return false;
    }
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    if (!this.isNative) {
      console.warn('Bluetooth scanning not available in web environment.');
      return [];
    }
    await this.initialize();
    try {
      console.log('Scanning for Bluetooth devices...');
      const isEnabled = await this.isBluetoothEnabled();
      if (!isEnabled) {
        const enabled = await this.enableBluetooth();
        if (!enabled) {
          throw new Error('Bluetooth is not enabled.');
        }
      }

      const result: BluetoothScanResult = await BluetoothSerial.scan();
      const devices: BluetoothDevice[] = result.devices.map(d => ({
        id: d.id,
        address: d.id,
        name: d.name || 'Unknown Device',
        isPaired: false, // This info is not available from the new plugin's scan
        isConnected: false,
        deviceType: (d.name?.toLowerCase().includes('obd') || d.name?.toLowerCase().includes('elm327')) ? 'ELM327' : 'Generic',
        compatibility: (d.name?.toLowerCase().includes('obd') || d.name?.toLowerCase().includes('elm327')) ? 0.9 : 0.5,
        rssi: d.rssi,
      }));
      console.log(`Found ${devices.length} devices`);
      return devices;
    } catch (error) {
      console.error('Device scan failed:', error);
      return [];
    }
  }

  async discoverAllOBD2Devices(): Promise<BluetoothDevice[]> {
    return this.scanForDevices();
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    if (!this.isNative) {
      console.warn('Bluetooth connection not available in web environment.');
      return { success: false, error: 'Bluetooth not available on web' };
    }
    await this.initialize();
    console.log(`Connecting to device: ${device.name} (${device.address})`);

    try {
      if (this.currentDevice && this.currentDevice.isConnected) {
        await this.disconnect();
      }

      // Track connection attempts
      const attempts = this.connectionAttempts.get(device.address) || 0;
      this.connectionAttempts.set(device.address, attempts + 1);

      await BluetoothSerial.connect({ address: device.address });
      this.currentDevice = { ...device, isConnected: true };
      this.setupSubscription();

      const initResult = await this.initializeElm327();
      if (initResult.success) {
        this.saveConnectionHistory();
        console.log('ELM327 initialized successfully.');
        return { success: true, device: this.currentDevice };
      } else {
         console.error('ELM327 initialization failed:', initResult.error);
         await this.disconnect();
         return { success: false, error: initResult.error };
      }
    } catch (error) {
      console.error('Connection process failed:', error);
      this.problematicDevices.add(device.address);
      this.saveConnectionHistory();
      return { success: false, error: `Connection process failed: ${error}` };
    }
  }

  async smartConnect(device: BluetoothDevice): Promise<ConnectionResult> {
    return this.connectToDevice(device);
  }

  private setupSubscription(): void {
    if (this.dataListener) {
      this.dataListener.remove();
    }
    this.dataListener = BluetoothSerial.addListener('onRead', (data: { value: string }) => {
      this.incomingDataBuffer += data.value;
      if (this.incomingDataBuffer.includes('>')) {
        this.processQueue();
      }
    });
  }

  private async initializeElm327(): Promise<{success: boolean, error?: string}> {
    const commands = ['ATZ', 'ATE0', 'ATL0', 'ATSP0'];
    console.log('Queueing ELM327 initialization commands...');
    for (const cmd of commands) {
      try {
        await this.sendCommand(`${cmd}\r`, 2000);
      } catch (error) {
        console.error(`Error sending command ${cmd}:`, error);
        return { success: false, error: `Failed to initialize ELM327 with command: ${cmd}` };
      }
    }
    return { success: true };
  }

  getConnectionStatus(): ConnectionStatus {
    return {
      isConnected: this.currentDevice?.isConnected || false,
      device: this.currentDevice || undefined,
      lastConnected: this.connectionHistory[0] ? new Date(this.connectionHistory[0].connectionTime) : undefined,
      quality: 'unknown'
    };
  }

  async disconnect(): Promise<boolean> {
    if (!this.isNative || !this.currentDevice) return true;
    try {
      await BluetoothSerial.disconnect({ address: this.currentDevice.address });
      if (this.dataListener) {
        this.dataListener.remove();
        this.dataListener = null;
      }
      this.currentDevice = null;
      this.commandQueue = [];
      this.isProcessingQueue = false;
      return true;
    } catch (error) {
      console.error('Error disconnecting', error);
      return false;
    }
  }

  async sendCommand(command: string, timeout: number = 5000): Promise<string> {
    if (!this.currentDevice?.isConnected) {
      return Promise.reject(new Error('Not connected to a device.'));
    }

    return new Promise<string>((resolve, reject) => {
      const commandObject: Command = { command, resolve, reject, timeout };
      this.commandQueue.push(commandObject);
      if (!this.isProcessingQueue) {
        this.processQueue(true);
      }
    });
  }

  private async processQueue(isNewCommand: boolean = false): Promise<void> {
    if (this.isProcessingQueue && !isNewCommand) return;
    if (this.commandQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;
    const command = this.commandQueue[0];
    
    const timeoutId = setTimeout(() => {
      command.reject(new Error(`Command timed out: ${command.command.trim()}`));
      this.commandQueue.shift();
      this.isProcessingQueue = false;
      this.processQueue();
    }, command.timeout);

    try {
      if (isNewCommand) {
        this.incomingDataBuffer = ""; // Clear buffer for new command
        await BluetoothSerial.write({ address: this.currentDevice!.address, value: command.command });
      }
      
      if (this.incomingDataBuffer.includes('>')) {
        const response = this.incomingDataBuffer;
        this.incomingDataBuffer = "";
        clearTimeout(timeoutId);
        command.resolve(response.replace('>', '').trim());
        this.commandQueue.shift();
        this.isProcessingQueue = false;
        this.processQueue();
      }
    } catch (error) {
      clearTimeout(timeoutId);
      command.reject(new Error(`Failed to write command: ${error}`));
      this.commandQueue.shift();
      this.isProcessingQueue = false;
      this.processQueue();
    }
  }

  public async getVehicleData(pid: string): Promise<{ pid: string; rawResponse: string; parsedResponse: { value: any; unit: string; } }> {
    if (!this.currentDevice?.isConnected) {
      throw new Error('Not connected to a device.');
    }

    const rawResponse = await this.sendCommand(`${pid}\r`);
    const parsedResponse = parseObdResponse(pid, rawResponse);

    return {
      pid,
      rawResponse,
      parsedResponse,
    };
  }

  getConnectionHistory(): ConnectionHistory[] {
    return [...this.connectionHistory];
  }

  isDeviceProblematic(address: string): boolean {
    return this.problematicDevices.has(address);
  }

  resetDeviceHistory(address: string): void {
    this.problematicDevices.delete(address);
    console.log(`Reset device history for ${address}`);
  }

  resetConnectionAttempts(deviceAddress: string): void {
    this.connectionAttempts.delete(deviceAddress);
    this.problematicDevices.delete(deviceAddress);
    console.log(`Reset connection attempts for ${deviceAddress}`);
  }

  getConnectionAttempts(deviceAddress: string): number {
    return this.connectionAttempts.get(deviceAddress) || 0;
  }

  isConnectedToDevice(): boolean {
    return this.currentDevice?.isConnected || false;
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.currentDevice;
  }
}

export const unifiedBluetoothService = UnifiedBluetoothService.getInstance();
// Export the BluetoothDevice type
export type { BluetoothDevice, ConnectionResult, ConnectionStatus, ConnectionHistory };
