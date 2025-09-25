// Enhanced Bluetooth Service for OBD2 scanning and connection management
import { BluetoothLe, ScanResultInternal } from '@capacitor-community/bluetooth-le';

export interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
  isPaired: boolean;
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
  private connectedDeviceId: string | null = null;
  private discoveredDevices: Map<string, BluetoothDevice> = new Map();

  static getInstance(): EnhancedBluetoothService {
    if (!EnhancedBluetoothService.instance) {
      EnhancedBluetoothService.instance = new EnhancedBluetoothService();
    }
    return EnhancedBluetoothService.instance;
  }

  async checkBluetoothStatus(): Promise<boolean> {
    try {
      const result = await BluetoothLe.isEnabled();
      return result.value;
    } catch (error) {
      console.error('Error checking Bluetooth status:', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    try {
      await BluetoothLe.enable();
      return true;
    } catch (error) {
      console.error('Error enabling Bluetooth:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      // For Android 12+, we need to request Bluetooth permissions
      // The plugin handles this automatically when needed
      return true;
    } catch (error) {
      console.error('Error requesting Bluetooth permissions:', error);
      return false;
    }
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    console.log('Starting Bluetooth device scan...');
    
    if (this.isScanning) {
      console.log('Scan already in progress');
      return [];
    }

    this.isScanning = true;
    this.discoveredDevices.clear();

    try {
      // Request permissions first
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        console.error('Bluetooth permissions not granted');
        this.isScanning = false;
        return [];
      }

      // Enable Bluetooth if needed
      const isEnabled = await this.checkBluetoothStatus();
      if (!isEnabled) {
        const enabled = await this.enableBluetooth();
        if (!enabled) {
          console.error('Failed to enable Bluetooth');
          this.isScanning = false;
          return [];
        }
      }

      // Initialize Bluetooth LE
      await BluetoothLe.initialize();
      
      // Set up scan listener
      const scanListener = await BluetoothLe.addListener('onScanResult', (result: ScanResultInternal) => {
        if (result.device) {
          const device = result.device.name || 'Unknown Device (' + result.device.deviceId.substring(0, 5) + ')';
          const bluetoothDevice: BluetoothDevice = {
            id: result.device.deviceId,
            name: device,
            address: result.device.deviceId,
            isPaired: false, // Will be updated when we check paired status
            rssi: result.rssi
          };
          
          // Store the device
          this.discoveredDevices.set(result.device.deviceId, bluetoothDevice);
        }
      });

      // Start scanning for devices
      console.log('Scanning for devices...');
      await BluetoothLe.requestLEScan({
        services: [],
      });

      // Scan for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Stop scanning
      await BluetoothLe.stopLEScan();
      await scanListener.remove();
      this.isScanning = false;
      
      // Get paired devices and combine with discovered devices
      const pairedDevices = await this.getPairedDevices();
      const allDevices = Array.from(this.discoveredDevices.values());
      
      // Update paired status for discovered devices
      pairedDevices.forEach(pairedDevice => {
        const discoveredDevice = allDevices.find(d => d.id === pairedDevice.id);
        if (discoveredDevice) {
          discoveredDevice.isPaired = true;
        } else {
          allDevices.push(pairedDevice);
        }
      });
      
      return allDevices;
    } catch (error) {
      console.error('Error during Bluetooth scan:', error);
      this.isScanning = false;
      throw new Error('Bluetooth scan failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getPairedDevices(): Promise<BluetoothDevice[]> {
    try {
      // Get bonded devices
      const result = await BluetoothLe.getBondedDevices();
      const devices: BluetoothDevice[] = result.devices.map(device => ({
        id: device.deviceId,
        name: device.name || 'Unknown Device (' + device.deviceId.substring(0, 5) + ')',
        address: device.deviceId,
        isPaired: true,
        rssi: undefined
      }));
      return devices;
    } catch (error) {
      console.error('Failed to get paired devices:', error);
      return [];
    }
  }

  async discoverDevices(): Promise<BluetoothDevice[]> {
    // Bluetooth LE discovery implementation
    try {
      await BluetoothLe.initialize();
      
      const devices: BluetoothDevice[] = [];
      
      // This is a placeholder - actual implementation would involve scanning and discovering devices
      console.log('Discovering devices...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate discovery
      
      return devices;
    } catch (error) {
      console.error('Discovery error:', error);
      throw new Error('Device discovery failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getAllDevices(): Promise<BluetoothDevice[]> {
    try {
      const [pairedDevices, discoveredDevices] = await Promise.allSettled([
        this.getPairedDevices(),
        this.discoverDevices()
      ]);
      
      const paired = pairedDevices.status === 'fulfilled' ? pairedDevices.value : [];
      const discovered = discoveredDevices.status === 'fulfilled' ? discoveredDevices.value : [];
      
      const allDevices = [...paired];
      
      // Add discovered devices that aren't already paired
      discovered.forEach(device => {
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

    try {
      // Request permissions first
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        throw new Error('Bluetooth permissions not granted');
      }

      // Enable Bluetooth if needed
      const isEnabled = await this.checkBluetoothStatus();
      if (!isEnabled) {
        const enabled = await this.enableBluetooth();
        if (!enabled) {
          throw new Error('Failed to enable Bluetooth');
        }
      }

      // Initialize Bluetooth LE
      await BluetoothLe.initialize();
      
      // Connect to the device
      await BluetoothLe.connect({ deviceId: deviceAddress });
      
      console.log('Successfully connected to device:', deviceAddress);
      this.connectedDevice = typeof device === 'string' 
        ? { id: deviceAddress, name: deviceName, address: deviceAddress, isPaired: true }
        : device;
      this.connectionInfo = {
        isConnected: true,
        deviceName,
        deviceAddress,
        connectionTime: new Date()
      };
      this.connectedDeviceId = deviceAddress;
      
      return true;
    } catch (error) {
      console.error('Failed to connect to device:', error);
      throw new Error('Connection failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.connectedDeviceId) {
        await BluetoothLe.disconnect({ deviceId: this.connectedDeviceId });
      }
      console.log('Disconnected from device');
      this.connectedDevice = null;
      this.connectionInfo = { isConnected: false };
      this.connectedDeviceId = null;
    } catch (error) {
      console.error('Disconnect error:', error);
      this.connectedDevice = null;
      this.connectionInfo = { isConnected: false };
      this.connectedDeviceId = null;
    }
  }

  async initializeELM327CarScannerStyle(): Promise<void> {
    console.log('Initializing ELM327 in car scanner style...');
    
    if (!this.isConnected()) {
      throw new Error('Device not connected');
    }
    
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
        console.log('Sending init command: ' + command.trim());
        await this.sendRawCommand(command);
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.warn('Init command ' + command.trim() + ' failed:', error);
        // Continue with other commands even if one fails
      }
    }

    // Try to get ELM version
    try {
      const versionResponse = await this.sendRawCommand('ATI\r');
      this.elmVersion = versionResponse || 'Unknown';
      console.log('ELM327 Version:', this.elmVersion);
    } catch (error) {
      console.warn('Failed to get ELM version:', error);
      this.elmVersion = 'Unknown';
    }

    console.log('ELM327 initialization completed');
  }

  async sendObdCommand(command: string, timeout: number = 5000): Promise<string> {
    if (!this.isConnected()) {
      throw new Error('Device not connected');
    }

    const formattedCommand = command.endsWith('\r') ? command : command + '\r';
    
    try {
      console.log('Sending OBD command: ' + command);
      const response = await this.sendRawCommand(formattedCommand, timeout);
      console.log('OBD response: ' + response);
      return response;
    } catch (error) {
      console.error('OBD command failed:', error);
      throw error;
    }
  }

  private async sendRawCommand(command: string, timeout: number = 5000): Promise<string> {
    // In a real implementation, you would send the command via Bluetooth LE
    // For now, we'll simulate a response
    console.log('Sending raw command: ' + command.trim());
    
    // Simulate a response after a short delay
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