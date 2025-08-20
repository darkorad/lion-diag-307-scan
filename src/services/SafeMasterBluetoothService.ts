
import { BluetoothDevice, ConnectionResult, ConnectionStatus, ConnectionHistory } from './MasterBluetoothService';
import { parseObdResponse } from '../utils/obd2Utils';

interface Command {
  command: string;
  resolve: (value: string) => void;
  reject: (reason?: any) => void;
  timeout: number;
}

export class SafeMasterBluetoothService {
  private static instance: SafeMasterBluetoothService;
  private currentDevice: BluetoothDevice | null = null;
  private connectionHistory: ConnectionHistory[] = [];
  private isInitialized = false;
  private initializationPromise: Promise<boolean> | null = null;
  private commandQueue: Command[] = [];
  private isProcessingQueue = false;
  private dataCallback: ((data: string) => void) | null = null;

  static getInstance(): SafeMasterBluetoothService {
    if (!SafeMasterBluetoothService.instance) {
      SafeMasterBluetoothService.instance = new SafeMasterBluetoothService();
    }
    return SafeMasterBluetoothService.instance;
  }

  private async ensureInitialized(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.initialize();
    return this.initializationPromise;
  }

  private async initialize(): Promise<boolean> {
    try {
      console.log('Initializing SafeMasterBluetoothService...');
      
      // Wait for Capacitor to be ready on mobile
      if (typeof window !== 'undefined' && window.Capacitor) {
        try {
          // Check if we're on a native platform
          if (window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
            // Wait a bit for plugins to be ready
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.warn('Capacitor platform check failed:', error);
        }
      }

      // Load connection history from storage
      this.loadConnectionHistory();
      
      this.isInitialized = true;
      console.log('SafeMasterBluetoothService initialized successfully');
      return true;
    } catch (error) {
      console.error('SafeMasterBluetoothService initialization failed:', error);
      return false;
    }
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
    try {
      await this.ensureInitialized();
      
      // Check if Bluetooth is available
      if (typeof window !== 'undefined' && window.bluetoothSerial) {
        return new Promise((resolve) => {
          window.bluetoothSerial.isEnabled(
            () => resolve(true),
            () => resolve(false)
          );
        });
      }
      
      // Fallback for web
      return true;
    } catch (error) {
      console.error('Error checking Bluetooth status:', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      
      if (typeof window !== 'undefined' && window.bluetoothSerial) {
        return new Promise((resolve) => {
          window.bluetoothSerial.enable(
            () => {
              console.log('Bluetooth enabled successfully');
              resolve(true);
            },
            () => {
              console.error('Failed to enable Bluetooth: User denied');
              resolve(false);
            }
          );
        });
      }

      return true; // Fallback for web
    } catch (error) {
      console.error('Error enabling Bluetooth:', error);
      return false;
    }
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      await this.ensureInitialized();
      console.log('Scanning for Bluetooth devices...');

      if (typeof window === 'undefined' || !window.bluetoothSerial) {
        console.warn('Bluetooth Serial plugin not available. Are you on a mobile device?');
        return [];
      }

      const isEnabled = await this.isBluetoothEnabled();
      if (!isEnabled) {
        console.warn('Bluetooth not enabled, attempting to enable...');
        const enabled = await this.enableBluetooth();
        if (!enabled) {
          console.error('Failed to enable bluetooth');
          return [];
        }
      }

      const pairedPromise = new Promise<any[]>((resolve, reject) => {
        window.bluetoothSerial.list(resolve, reject);
      });

      const unpairedPromise = new Promise<any[]>((resolve, reject) => {
        window.bluetoothSerial.discoverUnpaired(resolve, reject);
      });

      const [paired, unpaired] = await Promise.all([pairedPromise, unpairedPromise]);

      const allDevices = new Map<string, any>();

      const formatDevice = (d: any, paired: boolean): BluetoothDevice => ({
        id: d.id || d.address,
        address: d.address || d.id,
        name: d.name || 'Unknown Device',
        isPaired: paired,
        isConnected: false,
        deviceType: (d.name?.toLowerCase().includes('obd') || d.name?.toLowerCase().includes('elm327')) ? 'ELM327' : 'Generic',
        compatibility: (d.name?.toLowerCase().includes('obd') || d.name?.toLowerCase().includes('elm327')) ? 0.9 : 0.5,
        rssi: d.rssi,
      });

      paired.forEach(device => {
        allDevices.set(device.address || device.id, formatDevice(device, true));
      });

      unpaired.forEach(device => {
        if (!allDevices.has(device.address || device.id)) {
          allDevices.set(device.address || device.id, formatDevice(device, false));
        }
      });
      
      console.log(`Found ${allDevices.size} devices`);
      return Array.from(allDevices.values());

    } catch (error) {
      console.error('Device scan failed:', error);
      // It's common for discoverUnpaired to fail if discovery is already in progress.
      // We can decide to return paired devices only in this case.
      return [];
    }
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      await this.ensureInitialized();
      console.log(`Connecting to device: ${device.name} (${device.address})`);

      if (typeof window === 'undefined' || !window.bluetoothSerial) {
        return { success: false, error: 'Bluetooth not available' };
      }

      // Disconnect from any previous connection
      if (this.currentDevice && this.currentDevice.isConnected) {
        await this.disconnect();
      }

      return new Promise<ConnectionResult>((resolve) => {
        window.bluetoothSerial.connect(
          device.address,
          async () => { // On success
            console.log('Bluetooth socket connected. Setting up listener and starting queue...');
            this.currentDevice = { ...device, isConnected: true };
            this.setupSubscription();

            try {
              const initResult = await this.initializeElm327();
              if (initResult.success) {
                this.saveConnectionHistory();
                console.log('ELM327 initialized successfully.');
                resolve({ success: true, device: this.currentDevice, strategy: 'serial_connection' });
              } else {
                 console.error('ELM327 initialization failed:', initResult.error);
                 await this.disconnect();
                 resolve({ success: false, error: initResult.error });
              }
            } catch(error) {
              console.error('Error during ELM327 initialization:', error);
              await this.disconnect();
              resolve({ success: false, error: 'ELM327 initialization failed' });
            }
          },
          (error: any) => { // On failure
            console.error('Connection failed:', error);
            resolve({ success: false, error: `Connection failed: ${error}` });
          }
        );
      });
    } catch (error) {
      console.error('Connection process failed:', error);
      return { success: false, error: 'Connection process failed' };
    }
  }

  private setupSubscription(): void {
    if (typeof window === 'undefined' || !window.bluetoothSerial) return;

    window.bluetoothSerial.subscribe('>', (data) => {
      if (this.dataCallback) {
        this.dataCallback(data);
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
        console.error(`Error queueing command ${cmd}:`, error);
        return { success: false, error: `Failed to queue command: ${cmd}` };
      }
    }
    return { success: true };
  }

  getConnectionStatus(): ConnectionStatus {
    return {
      isConnected: this.currentDevice?.isConnected || false,
      device: this.currentDevice || undefined,
      lastConnected: this.connectionHistory[0] ? new Date(this.connectionHistory[0].connectionTime) : undefined,
      quality: this.currentDevice?.connectionQuality || 'unknown'
    };
  }

  async disconnect(): Promise<boolean> {
    try {
      if (this.currentDevice && this.currentDevice.isConnected && typeof window !== 'undefined' && window.bluetoothSerial) {
        if (this.dataCallback) {
          window.bluetoothSerial.unsubscribe(() => {}, () => {}); // Unsubscribe all listeners on shutdown
          this.dataCallback = null;
        }
        this.commandQueue = [];
        this.isProcessingQueue = false;

        return new Promise<boolean>((resolve) => {
          window.bluetoothSerial.disconnect(
            () => {
              console.log('Disconnected from device:', this.currentDevice?.name);
              if(this.currentDevice) {
                this.currentDevice.isConnected = false;
              }
              this.currentDevice = null;
              resolve(true);
            },
            (error: any) => {
              console.error('Disconnect failed:', error);
              if(this.currentDevice) {
                this.currentDevice.isConnected = false;
              }
              this.currentDevice = null;
              resolve(false);
            }
          );
        });
      }
      this.currentDevice = null;
      return true;
    } catch (error) {
      console.error('Exception during disconnect:', error);
      this.currentDevice = null;
      return false;
    }
  }

  async sendCommand(command: string, timeout: number = 5000): Promise<string> {
    if (!this.currentDevice?.isConnected) {
      return Promise.reject(new Error('Not connected to a device.'));
    }

    return new Promise<string>((resolve, reject) => {
      const commandObject: Command = {
        command,
        resolve,
        reject,
        timeout,
      };

      this.commandQueue.push(commandObject);
      this.processQueue(); // Start processing if not already running
    });
  }

  private processQueue(): void {
    if (this.isProcessingQueue || this.commandQueue.length === 0 || !this.currentDevice?.isConnected) {
      return;
    }

    this.isProcessingQueue = true;
    const command = this.commandQueue[0];
    let responseData = '';

    const timeoutId = setTimeout(() => {
      command.reject(new Error(`Command timed out: ${command.command.trim()}`));
      this.finishCommand();
    }, command.timeout);

    this.dataCallback = (data: string) => {
      responseData += data;
      if (data.includes('>')) {
        clearTimeout(timeoutId);
        command.resolve(responseData.replace('>', '').trim());
        this.finishCommand();
      }
    };

    window.bluetoothSerial.write(
      command.command,
      () => {},
      (error: any) => {
        clearTimeout(timeoutId);
        command.reject(new Error(`Failed to write command: ${error}`));
        this.finishCommand();
      }
    );
  }

  private finishCommand(): void {
    this.commandQueue.shift(); // Remove the completed command
    this.isProcessingQueue = false;
    this.dataCallback = null; // Reset callback
    this.processQueue(); // Process next command
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

  isConnectedToDevice(): boolean {
    return this.currentDevice?.isConnected || false;
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.currentDevice;
  }
}

export const safeMasterBluetoothService = SafeMasterBluetoothService.getInstance();
