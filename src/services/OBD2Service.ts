import { unifiedBluetoothService } from './UnifiedBluetoothService';
import { BluetoothDevice } from './bluetooth/types';

export class OBD2Service {
  private isBluetoothEnabled: boolean = false;
  private isConnected: boolean = false;
  private connectedDevice: BluetoothDevice | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    this.isBluetoothEnabled = await unifiedBluetoothService.checkBluetoothStatus();
  }

  async connectToDevice(device: BluetoothDevice): Promise<boolean> {
    try {
      const result = await unifiedBluetoothService.connectToDevice(device);
      if (result.success) {
        this.isConnected = true;
        this.connectedDevice = result.device || null;
        // Initialize OBD2 communication
        await this.initializeOBD2();
      } else {
        this.isConnected = false;
        this.connectedDevice = null;
      }
      return this.isConnected;
    } catch (error) {
      console.error('Failed to connect to OBD2 device:', error);
      this.isConnected = false;
      this.connectedDevice = null;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await unifiedBluetoothService.disconnect();
      this.isConnected = false;
      this.connectedDevice = null;
    }
  }

  private async initializeOBD2(): Promise<void> {
    // Send initialization commands
    await this.sendCommand('ATZ'); // Reset
    await this.sendCommand('ATE0'); // Echo off
    await this.sendCommand('ATL1'); // Linefeeds on
    await this.sendCommand('ATS0'); // Spaces off
    await this.sendCommand('ATH1'); // Headers on
    await this.sendCommand('ATSP0'); // Auto protocol
  }

  // Make sendCommand public so it can be used by other components
  async sendCommand(command: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Not connected to OBD2 device');
    }

    try {
      // Send command via Bluetooth
      const response = await unifiedBluetoothService.sendCommand(command + '\r');
      return response;
    } catch (error) {
      console.error(`Failed to send command ${command}:`, error);
      throw new Error(`Command failed: ${error.message}`);
    }
  }

  // Add the public method that other services expect
  async sendCommandPublic(command: string): Promise<string> {
    return this.sendCommand(command);
  }

  // Get connection status
  isConnectedToDevice(): boolean {
    return this.isConnected;
  }

  // Get connected device
  getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  // Get supported PIDs
  async getSupportedPIDs(): Promise<string[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to OBD2 device');
    }

    try {
      // Query supported PIDs (Mode 01 PID 00)
      const response = await this.sendCommand('0100');
      // Parse response to extract supported PIDs
      // This is a simplified implementation
      const supportedPIDs: string[] = [];
      
      // For now, return a default set of PIDs
      supportedPIDs.push('0100', '0101', '0104', '0105', '010C', '010D', '0110', '0111', '012F', '0142');
      
      return supportedPIDs;
    } catch (error) {
      console.error('Failed to get supported PIDs:', error);
      throw error;
    }
  }
}

export const obd2Service = new OBD2Service();