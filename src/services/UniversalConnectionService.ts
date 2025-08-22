
import { Capacitor } from '@capacitor/core';
import { BluetoothSerial } from '@e-is/capacitor-bluetooth-serial';
import { BluetoothDevice } from './MasterBluetoothService';

export type ConnectionType = 'bluetooth' | 'wifi' | 'usb';

export interface UniversalConnectionResult {
  success: boolean;
  connectionType: ConnectionType;
  device?: BluetoothDevice;
  protocol?: string;
  error?: string;
}

export interface NetworkAdapter {
  name: string;
  ip: string;
  port: number;
  type: 'wifi';
}

export class UniversalConnectionService {
  private static instance: UniversalConnectionService;
  private currentConnection: { type: ConnectionType; device?: any } | null = null;
  private isNative = false;

  static getInstance(): UniversalConnectionService {
    if (!UniversalConnectionService.instance) {
      UniversalConnectionService.instance = new UniversalConnectionService();
    }
    return UniversalConnectionService.instance;
  }

  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
    console.log(`UniversalConnectionService - Platform: ${Capacitor.getPlatform()}, Native: ${this.isNative}`);
  }

  // Bluetooth Connection Methods
  async connectBluetooth(device: BluetoothDevice): Promise<UniversalConnectionResult> {
    if (!this.isNative) {
      return {
        success: false,
        connectionType: 'bluetooth',
        error: 'Bluetooth not available on web platform'
      };
    }

    try {
      console.log(`Connecting to Bluetooth device: ${device.name}`);
      
      await BluetoothSerial.connect({ address: device.address });
      
      // Initialize ELM327
      await this.initializeAdapter('bluetooth');
      
      this.currentConnection = { type: 'bluetooth', device };
      
      return {
        success: true,
        connectionType: 'bluetooth',
        device,
        protocol: 'ISO 15765-4 (CAN)'
      };
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      return {
        success: false,
        connectionType: 'bluetooth',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async scanBluetoothDevices(): Promise<BluetoothDevice[]> {
    if (!this.isNative) {
      console.warn('Bluetooth scanning not available on web');
      return [];
    }

    try {
      const result = await BluetoothSerial.scan();
      return result.devices.map(d => ({
        id: d.id,
        address: d.id,
        name: d.name || 'Unknown Device',
        isPaired: false,
        isConnected: false,
        deviceType: this.detectDeviceType(d.name || ''),
        compatibility: this.calculateCompatibility(d.name || ''),
        rssi: d.rssi
      }));
    } catch (error) {
      console.error('Bluetooth scan failed:', error);
      return [];
    }
  }

  // WiFi Connection Methods
  async connectWiFi(adapter: NetworkAdapter): Promise<UniversalConnectionResult> {
    try {
      console.log(`Connecting to WiFi adapter: ${adapter.ip}:${adapter.port}`);
      
      // For web platform or testing, create a mock TCP connection
      const socket = await this.createTCPConnection(adapter.ip, adapter.port);
      
      if (socket) {
        await this.initializeAdapter('wifi');
        
        this.currentConnection = { type: 'wifi', device: adapter };
        
        return {
          success: true,
          connectionType: 'wifi',
          protocol: 'TCP/IP'
        };
      }
      
      throw new Error('Failed to establish TCP connection');
    } catch (error) {
      console.error('WiFi connection failed:', error);
      return {
        success: false,
        connectionType: 'wifi',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async scanWiFiAdapters(): Promise<NetworkAdapter[]> {
    // Common ELM327 WiFi adapter configurations
    const commonAdapters: NetworkAdapter[] = [
      { name: 'ELM327 WiFi', ip: '192.168.0.10', port: 35000, type: 'wifi' },
      { name: 'OBDLink WiFi', ip: '192.168.4.1', port: 35000, type: 'wifi' },
      { name: 'Veepeak WiFi', ip: '192.168.1.1', port: 35000, type: 'wifi' }
    ];

    // In a real implementation, this would scan the network for available devices
    return commonAdapters;
  }

  // USB OTG Connection Methods
  async connectUSB(): Promise<UniversalConnectionResult> {
    if (!this.isNative) {
      return {
        success: false,
        connectionType: 'usb',
        error: 'USB connections not available on web platform'
      };
    }

    try {
      console.log('Attempting USB OTG connection...');
      
      // This would use Android USB Host API
      // For now, simulate the connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await this.initializeAdapter('usb');
      
      this.currentConnection = { type: 'usb' };
      
      return {
        success: true,
        connectionType: 'usb',
        protocol: 'USB Serial'
      };
    } catch (error) {
      console.error('USB connection failed:', error);
      return {
        success: false,
        connectionType: 'usb',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Universal Communication Methods
  async sendCommand(command: string): Promise<string> {
    if (!this.currentConnection) {
      throw new Error('No active connection');
    }

    try {
      switch (this.currentConnection.type) {
        case 'bluetooth':
          if (this.isNative && this.currentConnection.device) {
            await BluetoothSerial.write({ 
              address: this.currentConnection.device.address, 
              value: command + '\r' 
            });
            // In real implementation, would wait for response
            return this.simulateResponse(command);
          }
          break;
        
        case 'wifi':
          // Send via TCP socket
          return this.sendTCPCommand(command);
        
        case 'usb':
          // Send via USB serial
          return this.sendUSBCommand(command);
      }
      
      throw new Error('Unsupported connection type');
    } catch (error) {
      console.error('Command failed:', error);
      throw error;
    }
  }

  // Helper Methods
  private async initializeAdapter(type: ConnectionType): Promise<void> {
    const initCommands = ['ATZ', 'ATE0', 'ATL0', 'ATSP0'];
    
    for (const cmd of initCommands) {
      try {
        await this.sendInitCommand(cmd, type);
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Init command ${cmd} failed:`, error);
      }
    }
  }

  private async sendInitCommand(command: string, type: ConnectionType): Promise<void> {
    // Simulate sending initialization commands
    console.log(`Sending ${type} init command: ${command}`);
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  private async createTCPConnection(ip: string, port: number): Promise<any> {
    // In a real implementation, this would create a TCP socket
    console.log(`Creating TCP connection to ${ip}:${port}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { connected: true };
  }

  private async sendTCPCommand(command: string): Promise<string> {
    console.log(`Sending TCP command: ${command}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.simulateResponse(command);
  }

  private async sendUSBCommand(command: string): Promise<string> {
    console.log(`Sending USB command: ${command}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.simulateResponse(command);
  }

  private simulateResponse(command: string): string {
    // Simulate realistic OBD2 responses
    const responses: { [key: string]: string } = {
      'ATZ': 'ELM327 v1.5',
      'ATE0': 'OK',
      'ATL0': 'OK',
      'ATSP0': 'OK',
      '0100': '41 00 BE 3E B8 11',
      '010C': '41 0C 1A F8',
      '010D': '41 0D 00',
      '0105': '41 05 4C',
      '0111': '41 11 80'
    };
    
    return responses[command.replace('\r', '')] || '41 00 00 00';
  }

  private detectDeviceType(name: string): 'ELM327' | 'OBD2' | 'Generic' {
    if (/elm327|obd|vgate|viecar/i.test(name)) {
      return 'ELM327';
    }
    if (/bluetooth/i.test(name)) {
      return 'OBD2';
    }
    return 'Generic';
  }

  private calculateCompatibility(name: string): number {
    if (/elm327|obd2/i.test(name)) return 0.9;
    if (/vgate|viecar|konnwei/i.test(name)) return 0.8;
    if (/bluetooth/i.test(name)) return 0.6;
    return 0.3;
  }

  // Status and Control Methods
  isConnected(): boolean {
    return this.currentConnection !== null;
  }

  getConnectionInfo() {
    return this.currentConnection;
  }

  async disconnect(): Promise<void> {
    if (this.currentConnection) {
      try {
        switch (this.currentConnection.type) {
          case 'bluetooth':
            if (this.isNative && this.currentConnection.device) {
              await BluetoothSerial.disconnect({ address: this.currentConnection.device.address });
            }
            break;
          case 'wifi':
            // Close TCP connection
            break;
          case 'usb':
            // Close USB connection
            break;
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
      
      this.currentConnection = null;
    }
  }
}

export const universalConnectionService = UniversalConnectionService.getInstance();
