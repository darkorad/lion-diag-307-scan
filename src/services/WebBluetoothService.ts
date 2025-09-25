import { BluetoothDevice } from './bluetooth/types';

interface WebBluetoothDevice extends BluetoothDevice {
  gatt?: BluetoothRemoteGATTServer;
  characteristic?: BluetoothRemoteGATTCharacteristic;
}

export class WebBluetoothService {
  private static instance: WebBluetoothService;
  private connectedDevice: WebBluetoothDevice | null = null;
  private bluetoothDevice: BluetoothDevice | null = null;

  private constructor() {}

  static getInstance(): WebBluetoothService {
    if (!WebBluetoothService.instance) {
      WebBluetoothService.instance = new WebBluetoothService();
    }
    return WebBluetoothService.instance;
  }

  /**
   * Check if Web Bluetooth is supported
   */
  isWebBluetoothSupported(): boolean {
    return 'bluetooth' in navigator;
  }

  /**
   * Request Bluetooth device
   */
  async requestDevice(): Promise<BluetoothDevice | null> {
    if (!this.isWebBluetoothSupported()) {
      throw new Error('Web Bluetooth is not supported in this browser');
    }

    try {
      // Request a Bluetooth device with specific services
      const device = await navigator.bluetooth.requestDevice({
        // For OBD2 devices, we typically look for serial port profile
        acceptAllDevices: true,
        optionalServices: [
          '00001101-0000-1000-8000-00805f9b34fb', // SPP UUID
          0x1101, // Serial Port Profile
          'battery_service'
        ]
      });

      // Add event listeners for disconnection
      device.addEventListener('gattserverdisconnected', () => {
        this.onDeviceDisconnected();
      });

      // Convert to our standard BluetoothDevice format
      const bluetoothDevice: BluetoothDevice = {
        id: device.id,
        name: device.name || 'Unknown Device',
        address: device.id, // Web Bluetooth uses ID as address
        isPaired: true, // Web Bluetooth devices are effectively paired when selected
        isConnected: false,
        deviceType: this.determineDeviceType(device.name || 'Unknown Device'),
        compatibility: this.calculateCompatibility(device.name || 'Unknown Device')
      };

      this.bluetoothDevice = bluetoothDevice;
      return bluetoothDevice;
    } catch (error) {
      console.error('Error requesting Bluetooth device:', error);
      throw error;
    }
  }

  /**
   * Connect to a Bluetooth device
   */
  async connectToDevice(device: BluetoothDevice): Promise<boolean> {
    if (!this.isWebBluetoothSupported()) {
      throw new Error('Web Bluetooth is not supported in this browser');
    }

    try {
      // Request the device again to get the BluetoothDevice object with GATT server
      const bluetoothDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '00001101-0000-1000-8000-00805f9b34fb', // SPP UUID
          0x1101, // Serial Port Profile
          'battery_service'
        ]
      });

      // Connect to GATT server
      const server = await bluetoothDevice.gatt!.connect();
      
      // Look for the serial port service
      let service: BluetoothRemoteGATTService | null = null;
      try {
        service = await server.getPrimaryService('00001101-0000-1000-8000-00805f9b34fb');
      } catch {
        // Try alternative service UUIDs
        try {
          service = await server.getPrimaryService(0x1101);
        } catch {
          // If we can't find the specific service, we'll use the first available service
          const services = await server.getPrimaryServices();
          if (services.length > 0) {
            service = services[0];
          }
        }
      }

      if (!service) {
        throw new Error('Could not find compatible service on device');
      }

      // Get characteristics (we'll use the first writable characteristic)
      const characteristics = await service.getCharacteristics();
      if (characteristics.length === 0) {
        throw new Error('No characteristics found on service');
      }

      // Store the connected device with GATT information
      this.connectedDevice = {
        ...device,
        isConnected: true,
        gatt: server,
        characteristic: characteristics[0]
      };

      return true;
    } catch (error) {
      console.error('Error connecting to device:', error);
      throw error;
    }
  }

  /**
   * Disconnect from current device
   */
  async disconnect(): Promise<void> {
    try {
      if (this.connectedDevice && this.connectedDevice.gatt) {
        this.connectedDevice.gatt.disconnect();
      }
      this.connectedDevice = null;
      this.bluetoothDevice = null;
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }

  /**
   * Send command to connected device
   */
  async sendCommand(command: string): Promise<string> {
    if (!this.connectedDevice || !this.connectedDevice.characteristic) {
      throw new Error('Not connected to any device');
    }

    try {
      // Convert command to ArrayBuffer
      const encoder = new TextEncoder();
      const data = encoder.encode(command);
      
      // Write to characteristic
      await this.connectedDevice.characteristic.writeValueWithoutResponse(data);
      
      // For OBD2 responses, we might need to read the response
      // This depends on the specific device implementation
      try {
        const response = await this.connectedDevice.characteristic.readValue();
        const decoder = new TextDecoder();
        return decoder.decode(response);
      } catch {
        // If we can't read a response, return a default OK response
        return 'OK\r>';
      }
    } catch (error) {
      console.error('Error sending command:', error);
      throw error;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return !!this.connectedDevice && this.connectedDevice.isConnected;
  }

  /**
   * Get connected device
   */
  getConnectedDevice(): BluetoothDevice | null {
    return this.connectedDevice;
  }

  /**
   * Handle device disconnection
   */
  private onDeviceDisconnected(): void {
    console.log('Device disconnected');
    this.connectedDevice = null;
    this.bluetoothDevice = null;
  }

  /**
   * Determine device type based on name
   */
  private determineDeviceType(name: string): BluetoothDevice['deviceType'] {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('elm327') || lowerName.includes('obd')) {
      return 'ELM327';
    } else if (lowerName.includes('scanner') || lowerName.includes('diagnostic')) {
      return 'OBD2';
    } else {
      return 'Generic';
    }
  }

  /**
   * Calculate compatibility score
   */
  private calculateCompatibility(name: string): number {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('elm327')) {
      return 95; // High compatibility
    } else if (lowerName.includes('obd')) {
      return 85; // Good compatibility
    } else if (lowerName.includes('scanner') || lowerName.includes('diagnostic')) {
      return 75; // Moderate compatibility
    } else {
      return 50; // Unknown compatibility
    }
  }

  /**
   * Scan for devices (Web Bluetooth doesn't support general scanning)
   */
  async scanForDevices(): Promise<BluetoothDevice[]> {
    // Web Bluetooth doesn't support general scanning
    // We need to use requestDevice to let the user select a device
    throw new Error('Web Bluetooth requires user interaction to select devices. Use requestDevice() instead.');
  }
}

export const webBluetoothService = WebBluetoothService.getInstance();