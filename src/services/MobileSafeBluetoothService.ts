
import { Capacitor } from '@capacitor/core';

export interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
  isPaired: boolean;
  isConnected?: boolean;
  deviceType?: 'ELM327' | 'OBD2' | 'Generic';
  compatibility?: number;
  rssi?: number;
}

export interface ConnectionResult {
  success: boolean;
  device?: BluetoothDevice;
  error?: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  device?: BluetoothDevice;
  lastConnected?: Date;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
}

export class MobileSafeBluetoothService {
  private static instance: MobileSafeBluetoothService;
  private currentDevice: BluetoothDevice | null = null;
  private isInitialized = false;
  private initPromise: Promise<boolean> | null = null;
  private isNative = false;

  static getInstance(): MobileSafeBluetoothService {
    if (!MobileSafeBluetoothService.instance) {
      MobileSafeBluetoothService.instance = new MobileSafeBluetoothService();
    }
    return MobileSafeBluetoothService.instance;
  }

  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
    console.log(`MobileSafeBluetoothService - Platform: ${Capacitor.getPlatform()}, Native: ${this.isNative}`);
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
    try {
      console.log('Initializing MobileSafeBluetoothService...');
      
      if (this.isNative) {
        console.log('Running on native platform, checking Bluetooth Serial plugin...');
        
        // Wait for native platform to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if bluetooth serial is available
        if (typeof window !== 'undefined' && window.bluetoothSerial) {
          console.log('Bluetooth Serial plugin detected');
        } else {
          console.warn('Bluetooth Serial plugin not available');
        }
      } else {
        console.log('Running on web platform');
      }

      this.isInitialized = true;
      console.log('MobileSafeBluetoothService initialized successfully');
      return true;
    } catch (error) {
      console.error('MobileSafeBluetoothService initialization failed:', error);
      this.initPromise = null;
      return false;
    }
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      await this.initialize();
      
      if (this.isNative && typeof window !== 'undefined' && window.bluetoothSerial?.isEnabled) {
        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            console.warn('Bluetooth enabled check timeout');
            resolve(false);
          }, 5000);

          window.bluetoothSerial.isEnabled(
            () => {
              clearTimeout(timeout);
              resolve(true);
            },
            () => {
              clearTimeout(timeout);
              resolve(false);
            }
          );
        });
      }
      
      // Return true for web to avoid blocking
      return true;
    } catch (error) {
      console.warn('Error checking Bluetooth status:', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<boolean> {
    try {
      await this.initialize();
      
      if (this.isNative && typeof window !== 'undefined' && window.bluetoothSerial?.enable) {
        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            console.warn('Bluetooth enable timeout');
            resolve(false);
          }, 10000);

          window.bluetoothSerial.enable(
            () => {
              clearTimeout(timeout);
              console.log('Bluetooth enabled successfully');
              resolve(true);
            },
            (error) => {
              clearTimeout(timeout);
              console.error('Failed to enable Bluetooth:', error);
              resolve(false);
            }
          );
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error enabling Bluetooth:', error);
      return false;
    }
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      await this.initialize();
      console.log('Scanning for Bluetooth devices...');
      
      if (this.isNative && typeof window !== 'undefined' && window.bluetoothSerial?.list) {
        const pairedDevices = await new Promise<BluetoothDevice[]>((resolve) => {
          const timeout = setTimeout(() => {
            console.warn('Device scan timeout');
            resolve([]);
          }, 15000);

          window.bluetoothSerial.list(
            (devices) => {
              clearTimeout(timeout);
              console.log('Found paired devices:', devices);
              const bluetoothDevices = devices.map(device => ({
                id: device.address,
                name: device.name || 'Unknown Device',
                address: device.address,
                isPaired: true,
                deviceType: this.identifyDeviceType(device.name) as 'ELM327' | 'OBD2' | 'Generic',
                compatibility: this.getCompatibilityScore(device.name),
                rssi: device.rssi
              }));
              resolve(bluetoothDevices);
            },
            (error) => {
              clearTimeout(timeout);
              console.warn('Bluetooth scan error:', error);
              resolve([]);
            }
          );
        });

        // Also try to discover unpaired devices
        if (window.bluetoothSerial.discoverUnpaired) {
          try {
            const unpairedDevices = await new Promise<BluetoothDevice[]>((resolve) => {
              const timeout = setTimeout(() => resolve([]), 10000);

              window.bluetoothSerial.discoverUnpaired(
                (devices) => {
                  clearTimeout(timeout);
                  console.log('Found unpaired devices:', devices);
                  const bluetoothDevices = devices.map(device => ({
                    id: device.address,
                    name: device.name || 'Unknown Device',
                    address: device.address,
                    isPaired: false,
                    deviceType: this.identifyDeviceType(device.name) as 'ELM327' | 'OBD2' | 'Generic',
                    compatibility: this.getCompatibilityScore(device.name),
                    rssi: device.rssi
                  }));
                  resolve(bluetoothDevices);
                },
                (error) => {
                  clearTimeout(timeout);
                  console.warn('Unpaired device discovery error:', error);
                  resolve([]);
                }
              );
            });

            return [...pairedDevices, ...unpairedDevices];
          } catch (error) {
            console.warn('Unpaired device discovery failed:', error);
            return pairedDevices;
          }
        }

        return pairedDevices;
      }
      
      // Return empty array for web
      console.log('Bluetooth not available on this platform');
      return [];
    } catch (error) {
      console.error('Device scan failed:', error);
      return [];
    }
  }

  private identifyDeviceType(name: string): string {
    if (!name) return 'Generic';
    
    const lowerName = name.toLowerCase();
    if (lowerName.includes('elm327') || lowerName.includes('obd') || lowerName.includes('vgate') || 
        lowerName.includes('icar') || lowerName.includes('viecar') || lowerName.includes('konnwei')) {
      return 'ELM327';
    }
    if (lowerName.includes('diagnostic') || lowerName.includes('scan')) {
      return 'OBD2';
    }
    return 'Generic';
  }

  private getCompatibilityScore(name: string): number {
    if (!name) return 0.3;
    
    const lowerName = name.toLowerCase();
    if (lowerName.includes('elm327') || lowerName.includes('obd')) {
      return 0.9;
    }
    if (lowerName.includes('vgate') || lowerName.includes('diagnostic') || lowerName.includes('icar')) {
      return 0.7;
    }
    return 0.3;
  }

  async connectToDevice(device: BluetoothDevice): Promise<ConnectionResult> {
    try {
      await this.initialize();
      console.log(`Connecting to device: ${device.name} (${device.address})`);
      
      if (this.isNative && typeof window !== 'undefined' && window.bluetoothSerial?.connect) {
        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            console.error('Connection timeout for device:', device.address);
            resolve({
              success: false,
              error: 'Connection timeout'
            });
          }, 30000);

          const connectMethod = device.isPaired ? 'connect' : 'connectInsecure';
          
          window.bluetoothSerial[connectMethod](
            device.address,
            () => {
              clearTimeout(timeout);
              console.log('Successfully connected to device:', device.address);
              this.currentDevice = { ...device, isConnected: true };
              resolve({
                success: true,
                device: this.currentDevice
              });
            },
            (error) => {
              clearTimeout(timeout);
              console.error('Failed to connect to device:', error);
              resolve({
                success: false,
                error: error || 'Connection failed'
              });
            }
          );
        });
      }
      
      // Mock success for web
      this.currentDevice = { ...device, isConnected: true };
      return {
        success: true,
        device: this.currentDevice
      };
    } catch (error) {
      console.error('Connection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      if (this.isNative && typeof window !== 'undefined' && window.bluetoothSerial?.disconnect && this.currentDevice) {
        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            console.warn('Disconnect timeout');
            this.currentDevice = null;
            resolve(false);
          }, 5000);

          window.bluetoothSerial.disconnect(
            () => {
              clearTimeout(timeout);
              console.log('Disconnected from device');
              this.currentDevice = null;
              resolve(true);
            },
            (error) => {
              clearTimeout(timeout);
              console.error('Disconnect error:', error);
              this.currentDevice = null;
              resolve(false);
            }
          );
        });
      }
      
      this.currentDevice = null;
      return true;
    } catch (error) {
      console.error('Disconnect failed:', error);
      this.currentDevice = null;
      return false;
    }
  }

  async sendCommand(command: string): Promise<string> {
    if (!this.currentDevice?.isConnected) {
      throw new Error('Not connected to device');
    }
    
    console.log(`Sending command: ${command}`);
    
    if (this.isNative && typeof window !== 'undefined' && window.bluetoothSerial?.write) {
      return new Promise((resolve, reject) => {
        let responseData = '';
        const timeout = setTimeout(() => {
          if (window.bluetoothSerial?.unsubscribe) {
            window.bluetoothSerial.unsubscribe(() => {}, () => {});
          }
          reject(new Error('Command timeout'));
        }, 5000);

        const onData = (data: string) => {
          responseData += data;
          if (data.includes('>') || data.includes('NO DATA') || data.includes('ERROR')) {
            clearTimeout(timeout);
            if (window.bluetoothSerial?.unsubscribe) {
              window.bluetoothSerial.unsubscribe(() => {}, () => {});
            }
            resolve(responseData.trim());
          }
        };

        if (window.bluetoothSerial.subscribe) {
          window.bluetoothSerial.subscribe('\r', onData, (error) => {
            clearTimeout(timeout);
            reject(new Error(error));
          });
        }

        window.bluetoothSerial.write(command + '\r', () => {
          console.log(`Command sent: ${command}`);
        }, (error) => {
          clearTimeout(timeout);
          reject(new Error(error));
        });
      });
    }
    
    // Mock response for web
    await new Promise(resolve => setTimeout(resolve, 100));
    return `41 ${command.substring(2)} FF FF`;
  }

  getConnectionStatus(): ConnectionStatus {
    return {
      isConnected: this.currentDevice?.isConnected || false,
      device: this.currentDevice || undefined,
      quality: 'unknown'
    };
  }

  isConnected(): boolean {
    return this.currentDevice?.isConnected || false;
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.currentDevice;
  }
}

export const mobileSafeBluetoothService = MobileSafeBluetoothService.getInstance();
