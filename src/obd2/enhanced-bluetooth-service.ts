// Enhanced Bluetooth Service for OBD2 scanning and connection management

export interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
  isPaired: boolean;
  class?: number;
  rssi?: number;
}

export interface ConnectionInfo {
  isConnected: boolean;
  deviceName?: string;
  deviceAddress?: string;
  connectionTime?: Date;
}

export class EnhancedBluetoothService {
  private static instance: EnhancedBluetoothService;
  private isScanning = false;
  private connectedDevice: BluetoothDevice | null = null;
  private connectionInfo: ConnectionInfo = { isConnected: false };
  private elmVersion = '';
  private connectionAttempts = new Map<string, number>();

  static getInstance(): EnhancedBluetoothService {
    if (!EnhancedBluetoothService.instance) {
      EnhancedBluetoothService.instance = new EnhancedBluetoothService();
    }
    return EnhancedBluetoothService.instance;
  }

  async checkBluetoothStatus(): Promise<boolean> {
    if (window.bluetoothSerial && window.bluetoothSerial.isEnabled) {
      return new Promise((resolve) => {
        window.bluetoothSerial.isEnabled(
          () => resolve(true),
          () => resolve(false)
        );
      });
    }
    return false;
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    console.log('Starting Bluetooth device scan...');
    
    if (this.isScanning) {
      console.log('Scan already in progress');
      return [];
    }

    this.isScanning = true;

    try {
      if (window.bluetoothSerial) {
        return new Promise((resolve, reject) => {
          window.bluetoothSerial.list(
            (devices) => {
              console.log('Found devices:', devices);
              this.isScanning = false;
              const bluetoothDevices = devices.map(device => ({
                id: device.address,
                name: device.name || 'Unknown Device',
                address: device.address,
                isPaired: true,
                rssi: undefined
              }));
              resolve(bluetoothDevices);
            },
            (error) => {
              console.error('Bluetooth scan error:', error);
              this.isScanning = false;
              reject(error);
            }
          );
        });
      }

      console.warn('Bluetooth Serial not available');
      this.isScanning = false;
      return [];
    } catch (error) {
      console.error('Error during Bluetooth scan:', error);
      this.isScanning = false;
      return [];
    }
  }

  async getPairedDevices(): Promise<BluetoothDevice[]> {
    try {
      return await this.scanForDevices();
    } catch (error) {
      console.error('Failed to get paired devices:', error);
      return [];
    }
  }

  async discoverDevices(): Promise<BluetoothDevice[]> {
    if (window.bluetoothSerial && window.bluetoothSerial.discoverUnpaired) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Discovery timeout'));
        }, 30000);

        window.bluetoothSerial.discoverUnpaired(
          (devices) => {
            clearTimeout(timeout);
            const bluetoothDevices = devices.map(device => ({
              id: device.address,
              name: device.name || 'Unknown Device',
              address: device.address,
              isPaired: false,
              rssi: device.rssi
            }));
            resolve(bluetoothDevices);
          },
          (error) => {
            clearTimeout(timeout);
            reject(error);
          }
        );
      });
    }
    return [];
  }

  async getAllDevices(): Promise<BluetoothDevice[]> {
    try {
      const [pairedDevices, discoveredDevices] = await Promise.all([
        this.getPairedDevices(),
        this.discoverDevices()
      ]);
      
      const allDevices = [...pairedDevices];
      
      // Add discovered devices that aren't already paired
      discoveredDevices.forEach(device => {
        if (!allDevices.find(d => d.address === device.address)) {
          allDevices.push(device);
        }
      });
      
      return allDevices;
    } catch (error) {
      console.error('Failed to get all devices:', error);
      return [];
    }
  }

  async connectToDevice(device: BluetoothDevice | string): Promise<boolean> {
    const deviceAddress = typeof device === 'string' ? device : device.address;
    const deviceName = typeof device === 'string' ? 'Unknown' : device.name;
    
    console.log('Connecting to device:', deviceAddress);

    if (window.bluetoothSerial) {
      return new Promise((resolve) => {
        window.bluetoothSerial.connect(
          deviceAddress,
          () => {
            console.log('Successfully connected to device');
            this.connectedDevice = typeof device === 'string' 
              ? { id: deviceAddress, name: deviceName, address: deviceAddress, isPaired: true }
              : device;
            this.connectionInfo = {
              isConnected: true,
              deviceName,
              deviceAddress,
              connectionTime: new Date()
            };
            resolve(true);
          },
          (error) => {
            console.error('Failed to connect to device:', error);
            resolve(false);
          }
        );
      });
    }

    return false;
  }

  async disconnect(): Promise<void> {
    if (window.bluetoothSerial && this.connectedDevice) {
      return new Promise((resolve) => {
        window.bluetoothSerial.disconnect(
          () => {
            console.log('Disconnected from device');
            this.connectedDevice = null;
            this.connectionInfo = { isConnected: false };
            resolve();
          },
          (error) => {
            console.error('Disconnect error:', error);
            this.connectedDevice = null;
            this.connectionInfo = { isConnected: false };
            resolve();
          }
        );
      });
    }
  }

  async initializeELM327CarScannerStyle(): Promise<void> {
    console.log('Initializing ELM327 in car scanner style...');
    
    const initCommands = [
      'ATZ\r',        // Reset
      'ATE0\r',       // Echo off
      'ATL1\r',       // Line feed on
      'ATS0\r',       // Spaces off
      'ATH1\r',       // Headers on
      'ATSP0\r',      // Auto protocol
      'ATAT1\r'       // Adaptive timing auto
    ];

    for (const command of initCommands) {
      try {
        await this.sendRawCommand(command);
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.warn(`Init command ${command} failed:`, error);
      }
    }

    // Try to get ELM version
    try {
      const versionResponse = await this.sendRawCommand('ATI\r');
      this.elmVersion = versionResponse || 'Unknown';
      console.log('ELM327 Version:', this.elmVersion);
    } catch (error) {
      console.warn('Failed to get ELM version:', error);
    }
  }

  async sendObdCommand(command: string, timeout: number = 5000): Promise<string> {
    if (!this.isConnected()) {
      throw new Error('Device not connected');
    }

    const formattedCommand = command.endsWith('\r') ? command : command + '\r';
    
    try {
      return await this.sendRawCommand(formattedCommand, timeout);
    } catch (error) {
      console.error('OBD command failed:', error);
      throw error;
    }
  }

  private async sendRawCommand(command: string, timeout: number = 5000): Promise<string> {
    if (!window.bluetoothSerial) {
      throw new Error('Bluetooth Serial not available');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Command timeout'));
      }, timeout);

      let responseData = '';

      const onData = (data: string) => {
        responseData += data;
        if (data.includes('>') || data.includes('NO DATA') || data.includes('ERROR')) {
          clearTimeout(timeoutId);
          window.bluetoothSerial.unsubscribe(() => {}, () => {});
          resolve(responseData.trim());
        }
      };

      window.bluetoothSerial.subscribe('\r', onData, (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });

      window.bluetoothSerial.write(command, () => {
        console.log('Command sent:', command.trim());
      }, (error) => {
        clearTimeout(timeoutId);
        window.bluetoothSerial.unsubscribe(() => {}, () => {});
        reject(error);
      });
    });
  }

  isConnected(): boolean {
    return !!this.connectedDevice && this.connectionInfo.isConnected;
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  getConnectionInfo(): ConnectionInfo {
    return { ...this.connectionInfo };
  }

  getElmVersion(): string {
    return this.elmVersion;
  }

  resetConnectionAttempts(deviceAddress: string): void {
    if (deviceAddress === 'all') {
      this.connectionAttempts.clear();
    } else {
      this.connectionAttempts.delete(deviceAddress);
    }
  }

  incrementConnectionAttempt(deviceAddress: string): number {
    const currentAttempts = this.connectionAttempts.get(deviceAddress) || 0;
    const newAttempts = currentAttempts + 1;
    this.connectionAttempts.set(deviceAddress, newAttempts);
    return newAttempts;
  }

  getConnectionAttempts(deviceAddress: string): number {
    return this.connectionAttempts.get(deviceAddress) || 0;
  }
}

export const enhancedBluetoothService = EnhancedBluetoothService.getInstance();
