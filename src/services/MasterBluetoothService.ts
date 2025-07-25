import { bluetoothConnectionManager } from './BluetoothConnectionManager';

export interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
  isPaired: boolean;
  isConnected: boolean;
  deviceType: 'ELM327' | 'OBD2' | 'Unknown';
  compatibility: number;
  compatibilityScore?: number;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  rssi?: number;
  class?: number;
}

export interface ConnectionResult {
  success: boolean;
  error?: string;
  protocol?: string;
  deviceInfo?: any;
  strategy?: string;
  connectionTime?: number;
}

export interface ConnectionAttempt {
  deviceId: string;
  deviceName: string;
  timestamp: number;
  success: boolean;
  error?: string;
  strategy: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  device?: BluetoothDevice | null;
  connectionTime?: number;
  strategy?: string;
}

export class MasterBluetoothService {
  private static instance: MasterBluetoothService;
  private isConnecting = false;
  private connectionHistory: ConnectionAttempt[] = [];
  private deviceProblematicList: Set<string> = new Set();

  static getInstance(): MasterBluetoothService {
    if (!MasterBluetoothService.instance) {
      MasterBluetoothService.instance = new MasterBluetoothService();
    }
    return MasterBluetoothService.instance;
  }

  getConnectionStatus(): ConnectionStatus {
    const state = bluetoothConnectionManager.getConnectionState();
    return {
      isConnected: state.isConnected,
      device: state.device,
      connectionTime: state.connectionTime || undefined,
      strategy: 'bluetooth'
    };
  }

  getConnectionHistory(): ConnectionAttempt[] {
    return [...this.connectionHistory];
  }

  isDeviceProblematic(deviceAddress: string): boolean {
    return this.deviceProblematicList.has(deviceAddress);
  }

  resetDeviceHistory(deviceAddress: string): void {
    this.deviceProblematicList.delete(deviceAddress);
    this.connectionHistory = this.connectionHistory.filter(
      attempt => attempt.deviceId !== deviceAddress
    );
  }

  async discoverAllDevices(): Promise<BluetoothDevice[]> {
    try {
      console.log('Discovering all Bluetooth devices...');
      
      const devices: BluetoothDevice[] = [];
      
      // Get paired devices
      const pairedDevices = await this.getPairedDevices();
      devices.push(...pairedDevices);
      
      // Get discoverable devices
      const discoverableDevices = await this.getDiscoverableDevices();
      devices.push(...discoverableDevices);
      
      // Remove duplicates and sort by compatibility
      const uniqueDevices = this.removeDuplicateDevices(devices);
      return this.sortDevicesByCompatibility(uniqueDevices);
      
    } catch (error) {
      console.error('Device discovery failed:', error);
      throw error;
    }
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    return this.discoverAllDevices();
  }

  private async getPairedDevices(): Promise<BluetoothDevice[]> {
    return new Promise((resolve, reject) => {
      if (!window.bluetoothSerial) {
        reject(new Error('Bluetooth not available'));
        return;
      }

      window.bluetoothSerial.list(
        (devices) => {
          const pairedDevices = devices.map(device => ({
            id: device.id || device.address,
            name: device.name || 'Unknown Device',
            address: device.address,
            isPaired: true,
            isConnected: false,
            deviceType: this.detectDeviceType(device.name),
            compatibility: this.calculateCompatibility(device.name),
            compatibilityScore: this.calculateCompatibility(device.name),
            connectionQuality: this.calculateConnectionQuality(device),
            rssi: device.rssi,
            class: device.class
          }));
          resolve(pairedDevices);
        },
        (error) => reject(new Error(`Failed to list paired devices: ${error}`))
      );
    });
  }

  private async getDiscoverableDevices(): Promise<BluetoothDevice[]> {
    return new Promise((resolve, reject) => {
      if (!window.bluetoothSerial) {
        reject(new Error('Bluetooth not available'));
        return;
      }

      window.bluetoothSerial.discoverUnpaired(
        (devices) => {
          const discoverableDevices = devices.map(device => ({
            id: device.id || device.address,
            name: device.name || 'Unknown Device',
            address: device.address,
            isPaired: false,
            isConnected: false,
            deviceType: this.detectDeviceType(device.name),
            compatibility: this.calculateCompatibility(device.name),
            compatibilityScore: this.calculateCompatibility(device.name),
            connectionQuality: this.calculateConnectionQuality(device),
            rssi: device.rssi,
            class: device.class
          }));
          resolve(discoverableDevices);
        },
        (error) => {
          console.warn('Discovery failed, using empty list:', error);
          resolve([]);
        }
      );
    });
  }

  private detectDeviceType(deviceName: string): 'ELM327' | 'OBD2' | 'Unknown' {
    const name = deviceName.toLowerCase();
    
    if (name.includes('elm') || name.includes('327')) {
      return 'ELM327';
    }
    
    if (name.includes('obd') || name.includes('obdii') || name.includes('scan')) {
      return 'OBD2';
    }
    
    return 'Unknown';
  }

  private calculateCompatibility(deviceName: string): number {
    const name = deviceName.toLowerCase();
    let score = 0;
    
    // ELM327 keywords
    if (name.includes('elm327')) score += 100;
    if (name.includes('elm')) score += 80;
    if (name.includes('327')) score += 70;
    
    // OBD2 keywords
    if (name.includes('obd2') || name.includes('obdii')) score += 90;
    if (name.includes('obd')) score += 75;
    if (name.includes('scan')) score += 60;
    if (name.includes('diag')) score += 50;
    
    // Brand keywords
    if (name.includes('vgate')) score += 40;
    if (name.includes('veepeak')) score += 40;
    if (name.includes('bafx')) score += 35;
    if (name.includes('panlong')) score += 30;
    
    return Math.min(score, 100);
  }

  private calculateConnectionQuality(device: any): 'excellent' | 'good' | 'fair' | 'poor' {
    const compatibility = this.calculateCompatibility(device.name || '');
    const rssi = device.rssi || -70;
    
    if (compatibility >= 80 && rssi > -50) return 'excellent';
    if (compatibility >= 60 && rssi > -60) return 'good';
    if (compatibility >= 40 && rssi > -70) return 'fair';
    return 'poor';
  }

  private removeDuplicateDevices(devices: BluetoothDevice[]): BluetoothDevice[] {
    const seen = new Set<string>();
    return devices.filter(device => {
      const key = device.address || device.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private sortDevicesByCompatibility(devices: BluetoothDevice[]): BluetoothDevice[] {
    return devices.sort((a, b) => {
      // First by device type (ELM327 > OBD2 > Unknown)
      const typeOrder = { 'ELM327': 3, 'OBD2': 2, 'Unknown': 1 };
      const typeDiff = typeOrder[b.deviceType] - typeOrder[a.deviceType];
      if (typeDiff !== 0) return typeDiff;
      
      // Then by compatibility score
      const compatDiff = b.compatibility - a.compatibility;
      if (compatDiff !== 0) return compatDiff;
      
      // Finally by paired status
      return (b.isPaired ? 1 : 0) - (a.isPaired ? 1 : 0);
    });
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    if (this.isConnecting) {
      return { success: false, error: 'Already connecting to a device' };
    }

    this.isConnecting = true;
    const startTime = Date.now();
    
    console.log(`Attempting to connect to ${device.name} (${device.address})`);

    try {
      // Clean up any existing connection
      await this.forceDisconnect();
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Try multiple connection strategies
      const result = await this.tryMultipleConnectionStrategies(device);
      
      if (result.success) {
        const connectionTime = Date.now() - startTime;
        
        // Update the centralized connection manager
        bluetoothConnectionManager.setConnected({ ...device, isConnected: true });
        
        // Initialize ELM327 communication
        await this.initializeELM327Enhanced();
        
        // Log successful connection
        this.logConnectionAttempt(device, 1, true, result.strategy!);
        
        console.log(`Successfully connected to ${device.name} in ${connectionTime}ms`);
        return { 
          success: true, 
          protocol: 'Bluetooth',
          deviceInfo: device,
          strategy: result.strategy,
          connectionTime: connectionTime
        };
      } else {
        this.logConnectionAttempt(device, 1, false, 'multiple', result.error);
        return result;
      }
      
    } catch (error) {
      console.error('Connection failed:', error);
      this.logConnectionAttempt(device, 1, false, 'error', error.message);
      this.deviceProblematicList.add(device.address);
      return { success: false, error: error.message };
    } finally {
      this.isConnecting = false;
    }
  }

  private async tryMultipleConnectionStrategies(device: BluetoothDevice): Promise<ConnectionResult> {
    const strategies = [
      {
        name: 'insecure',
        description: 'Insecure connection (most compatible)',
        timeout: 30000,
        method: 'connectInsecure'
      },
      {
        name: 'secure',
        description: 'Secure connection with pairing',
        timeout: 45000,
        method: 'connect'
      },
      {
        name: 'paired_insecure',
        description: 'Pair first, then insecure connect',
        timeout: 60000,
        method: 'connectInsecure',
        pairFirst: true
      }
    ];

    for (const strategy of strategies) {
      try {
        console.log(`Trying ${strategy.description}...`);
        
        // Pre-strategy setup
        if (strategy.pairFirst && !device.isPaired) {
          await this.attemptPairing(device);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // Attempt connection
        const connected = await this.establishConnectionWithStrategy(device, strategy);
        
        if (connected) {
          return { 
            success: true, 
            strategy: strategy.name 
          };
        }
        
      } catch (error) {
        console.warn(`Strategy ${strategy.name} failed:`, error);
        
        // Wait before trying next strategy
        if (strategy !== strategies[strategies.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    return { 
      success: false, 
      error: 'All connection strategies failed. Please ensure device is powered on, in range, and vehicle ignition is on.' 
    };
  }

  private async establishConnectionWithStrategy(device: BluetoothDevice, strategy: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`${strategy.name} connection timeout after ${strategy.timeout}ms`));
      }, strategy.timeout);

      const onSuccess = () => {
        clearTimeout(timeout);
        console.log(`${strategy.name} connection successful`);
        resolve(true);
      };

      const onError = (error: any) => {
        clearTimeout(timeout);
        const errorMsg = typeof error === 'string' ? error : JSON.stringify(error);
        reject(new Error(`${strategy.name} connection failed: ${errorMsg}`));
      };

      // Use appropriate connection method
      if (strategy.method === 'connect') {
        window.bluetoothSerial.connect(device.address, onSuccess, onError);
      } else {
        window.bluetoothSerial.connectInsecure(device.address, onSuccess, onError);
      }
    });
  }

  private async attemptPairing(device: BluetoothDevice): Promise<void> {
    console.log(`Attempting to pair with ${device.name}...`);
    
    // Most OBD2 devices use default PINs
    const commonPins = ['1234', '0000', '6666', '1111'];
    
    for (const pin of commonPins) {
      try {
        // This is a simplified pairing attempt
        // In reality, pairing is often handled by the OS
        console.log(`Trying PIN: ${pin}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        break;
      } catch (error) {
        console.warn(`PIN ${pin} failed:`, error);
      }
    }
  }

  private async initializeELM327Enhanced(): Promise<void> {
    console.log('Initializing ELM327 with enhanced sequence...');
    
    const initCommands = [
      { cmd: 'ATZ', desc: 'Reset', timeout: 5000 },
      { cmd: 'ATE0', desc: 'Echo off', timeout: 3000 },
      { cmd: 'ATL0', desc: 'Linefeeds off', timeout: 3000 },
      { cmd: 'ATS0', desc: 'Spaces off', timeout: 3000 },
      { cmd: 'ATH1', desc: 'Headers on', timeout: 3000 },
      { cmd: 'ATSP0', desc: 'Auto protocol', timeout: 5000 },
      { cmd: 'ATAT2', desc: 'Adaptive timing', timeout: 3000 },
      { cmd: 'ATST62', desc: 'Set timeout', timeout: 3000 }
    ];
    
    for (const command of initCommands) {
      try {
        console.log(`Sending ${command.desc}: ${command.cmd}`);
        await this.sendCommandWithTimeout(command.cmd, command.timeout);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.warn(`Init command ${command.cmd} failed:`, error);
        // Continue with other commands
      }
    }
    
    console.log('ELM327 initialization complete');
  }

  private async sendCommandWithTimeout(command: string, timeout: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Command timeout: ${command}`));
      }, timeout);

      const commandWithCR = command + '\r';
      
      window.bluetoothSerial.write(
        commandWithCR,
        () => {
          // Wait for response
          setTimeout(() => {
            window.bluetoothSerial.read(
              (data) => {
                clearTimeout(timeoutId);
                resolve(data);
              },
              (error) => {
                clearTimeout(timeoutId);
                reject(new Error(`Read failed: ${error}`));
              }
            );
          }, 200);
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(new Error(`Write failed: ${error}`));
        }
      );
    });
  }

  private async forceDisconnect(): Promise<void> {
    try {
      await new Promise((resolve) => {
        if (!window.bluetoothSerial) {
          resolve(void 0);
          return;
        }

        window.bluetoothSerial.disconnect(
          () => resolve(void 0),
          () => resolve(void 0) // Resolve even on error
        );
      });
      console.log('Force disconnect completed');
    } catch (error) {
      console.warn('Force disconnect failed:', error);
    }
  }

  private logConnectionAttempt(device: BluetoothDevice, attempt: number, success: boolean, strategy: string, error?: string): void {
    const connectionAttempt: ConnectionAttempt = {
      deviceId: device.address,
      deviceName: device.name,
      timestamp: Date.now(),
      success,
      strategy,
      error
    };
    
    this.connectionHistory.push(connectionAttempt);
    
    // Keep only last 50 attempts
    if (this.connectionHistory.length > 50) {
      this.connectionHistory = this.connectionHistory.slice(-50);
    }
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Update connection manager first
      bluetoothConnectionManager.setDisconnected();
      
      if (!window.bluetoothSerial) {
        resolve();
        return;
      }

      window.bluetoothSerial.disconnect(
        () => {
          console.log('Disconnected from device');
          resolve();
        },
        (error) => {
          console.error('Disconnect failed:', error);
          resolve(); // Resolve anyway as we consider it disconnected
        }
      );
    });
  }

  isConnected(): boolean {
    return bluetoothConnectionManager.isConnected();
  }

  getConnectedDevice(): BluetoothDevice | null {
    return bluetoothConnectionManager.getConnectedDevice();
  }

  async isBluetoothEnabled(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!window.bluetoothSerial) {
        resolve(false);
        return;
      }

      window.bluetoothSerial.isEnabled(
        () => resolve(true),
        () => resolve(false)
      );
    });
  }

  async enableBluetooth(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!window.bluetoothSerial) {
        resolve(false);
        return;
      }

      window.bluetoothSerial.enable(
        () => resolve(true),
        () => resolve(false)
      );
    });
  }

  async sendCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!bluetoothConnectionManager.isConnected()) {
        reject(new Error('No device connected'));
        return;
      }

      if (!window.bluetoothSerial) {
        reject(new Error('Bluetooth not available'));
        return;
      }

      const startTime = Date.now();
      const commandWithCR = command + '\r';
      
      window.bluetoothSerial.write(
        commandWithCR,
        () => {
          // Wait for response
          setTimeout(() => {
            window.bluetoothSerial.read(
              (data) => {
                const latency = Date.now() - startTime;
                bluetoothConnectionManager.updateConnectionQuality(latency, true);
                console.log(`Command: ${command}, Response: ${data}`);
                resolve(data);
              },
              (error) => {
                bluetoothConnectionManager.updateConnectionQuality(5000, false);
                console.error(`Failed to read response for command ${command}:`, error);
                reject(new Error(`Read failed: ${error}`));
              }
            );
          }, 100);
        },
        (error) => {
          bluetoothConnectionManager.updateConnectionQuality(5000, false);
          console.error(`Failed to send command ${command}:`, error);
          reject(new Error(`Write failed: ${error}`));
        }
      );
    });
  }

  async readData(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!bluetoothConnectionManager.isConnected()) {
        reject(new Error('No device connected'));
        return;
      }

      if (!window.bluetoothSerial) {
        reject(new Error('Bluetooth not available'));
        return;
      }

      window.bluetoothSerial.read(
        (data) => {
          bluetoothConnectionManager.updateConnectionQuality(100, true);
          resolve(data);
        },
        (error) => {
          bluetoothConnectionManager.updateConnectionQuality(5000, false);
          reject(new Error(`Read failed: ${error}`));
        }
      );
    });
  }
}

export const masterBluetoothService = MasterBluetoothService.getInstance();
