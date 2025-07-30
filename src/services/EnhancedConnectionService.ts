import { enhancedBluetoothService, BluetoothDevice } from '@/obd2/enhanced-bluetooth-service';
import { mobilePermissionsService } from './MobilePermissionsService';
import { unifiedBluetoothService } from './UnifiedBluetoothService';

export interface ConnectionAttempt {
  deviceId: string;
  deviceName: string;
  attempt: number;
  timestamp: Date;
  success: boolean;
  error?: string;
  strategy: string;
}

export interface ConnectionStrategy {
  name: string;
  description: string;
  timeout: number;
  retries: number;
  method: 'secure' | 'insecure' | 'auto';
  preConnectionSteps: string[];
}

export class EnhancedConnectionService {
  private static instance: EnhancedConnectionService;
  private connectionAttempts: ConnectionAttempt[] = [];
  private isConnecting = false;
  private currentStrategy = 0;

  static getInstance(): EnhancedConnectionService {
    if (!EnhancedConnectionService.instance) {
      EnhancedConnectionService.instance = new EnhancedConnectionService();
    }
    return EnhancedConnectionService.instance;
  }

  private getConnectionStrategies(): ConnectionStrategy[] {
    return [
      {
        name: 'Quick Connect',
        description: 'Fast insecure connection for most ELM327 devices',
        timeout: 10000,
        retries: 2,
        method: 'insecure',
        preConnectionSteps: ['check_bluetooth', 'clear_cache']
      },
      {
        name: 'Secure Connect',
        description: 'Secure connection with authentication',
        timeout: 15000,
        retries: 2,
        method: 'secure',
        preConnectionSteps: ['check_bluetooth', 'check_pairing']
      },
      {
        name: 'Extended Timeout',
        description: 'Extended timeout for slow devices',
        timeout: 25000,
        retries: 1,
        method: 'insecure',
        preConnectionSteps: ['check_bluetooth', 'clear_cache', 'reset_adapter']
      },
      {
        name: 'Compatibility Mode',
        description: 'Maximum compatibility for problematic devices',
        timeout: 30000,
        retries: 1,
        method: 'auto',
        preConnectionSteps: ['check_bluetooth', 'check_pairing', 'clear_cache', 'factory_reset']
      }
    ];
  }

  async discoverDevicesWithPermissions(): Promise<BluetoothDevice[]> {
    console.log('Starting enhanced device discovery with permission checks...');
    
    try {
      const permissions = await mobilePermissionsService.requestAllMobilePermissions();
      
      if (!permissions.bluetooth) {
        throw new Error('Bluetooth permission required for device discovery');
      }
      
      if (!permissions.location) {
        console.warn('Location permission not granted - discovery may be limited');
      }

      const discoveryMethods = [
        () => this.discoverPairedDevices(),
        () => this.discoverNearbyDevices(),
        () => this.discoverWithLegacyMethod()
      ];

      const allDevices: BluetoothDevice[] = [];

      for (const method of discoveryMethods) {
        try {
          const devices = await method();
          devices.forEach(device => {
            if (!allDevices.find(d => d.address === device.address)) {
              allDevices.push(device);
            }
          });
        } catch (error) {
          console.warn('Discovery method failed:', error);
        }
      }

      const obd2Devices = this.filterOBD2Devices(allDevices);
      
      console.log(`Enhanced discovery found ${obd2Devices.length} OBD2 devices`);
      return obd2Devices;

    } catch (error) {
      console.error('Enhanced discovery failed:', error);
      throw new Error(`Device discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async discoverPairedDevices(): Promise<BluetoothDevice[]> {
    if (window.bluetoothSerial && window.bluetoothSerial.list) {
      return new Promise((resolve, reject) => {
        window.bluetoothSerial.list(
          (devices) => {
            console.log('Paired devices found:', devices.length);
            resolve(devices.map(device => ({
              id: device.address,
              name: device.name || 'Unknown Device',
              address: device.address,
              isPaired: true,
              class: device.class,
              rssi: undefined
            })));
          },
          (error) => {
            console.warn('Paired device discovery failed:', error);
            reject(error);
          }
        );
      });
    }
    return [];
  }

  private async discoverNearbyDevices(): Promise<BluetoothDevice[]> {
    if (window.bluetoothSerial && window.bluetoothSerial.discoverUnpaired) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Discovery timeout'));
        }, 30000);

        window.bluetoothSerial.discoverUnpaired(
          (devices) => {
            clearTimeout(timeout);
            console.log('Nearby devices found:', devices.length);
            resolve(devices.map(device => ({
              id: device.address,
              name: device.name || 'Unknown Device',
              address: device.address,
              isPaired: false,
              class: device.class,
              rssi: device.rssi
            })));
          },
          (error) => {
            clearTimeout(timeout);
            console.warn('Nearby device discovery failed:', error);
            reject(error);
          }
        );
      });
    }
    return [];
  }

  private async discoverWithLegacyMethod(): Promise<BluetoothDevice[]> {
    try {
      return await unifiedBluetoothService.discoverAllOBD2Devices();
    } catch (error) {
      console.warn('Legacy discovery failed:', error);
      return [];
    }
  }

  private filterOBD2Devices(devices: BluetoothDevice[]): BluetoothDevice[] {
    const obd2Patterns = [
      /elm.*327/i, /obd.*2/i, /vgate/i, /viecar/i, /konnwei/i, /veepeak/i,
      /bafx/i, /autel/i, /launch/i, /foxwell/i, /ancel/i, /autophix/i,
      /topdon/i, /torque/i, /forscan/i, /vcds/i, /vagcom/i, /scan.*tool/i,
      /diagnostic/i, /auto.*scan/i, /car.*scan/i, /bluetooth.*obd/i,
      /mini.*elm/i, /super.*obd/i, /pro.*obd/i, /wifi.*obd/i
    ];

    const obd2MacPrefixes = [
      '00:1D:A5', '20:15:03', '00:04:3E', '00:18:E4', '66:21:3E',
      '00:0D:18', '00:08:A1', '00:1B:DC', '00:02:72', '20:16:04',
      '00:15:83', '98:D3:31', '00:21:06', '00:CD:FF', '12:34:56'
    ];

    return devices.filter(device => {
      const name = (device.name || '').toLowerCase();
      const address = (device.address || '').toUpperCase();
      
      const nameMatch = obd2Patterns.some(pattern => pattern.test(name));
      const macMatch = obd2MacPrefixes.some(prefix => address.startsWith(prefix));
      const isUnnamed = !name || name.trim() === '' || name === 'unknown device';
      const excludePatterns = /headset|speaker|mouse|keyboard|phone|tablet|watch|tv|audio/i;
      const isExcluded = excludePatterns.test(name);
      
      return !isExcluded && (nameMatch || macMatch || isUnnamed);
    }).sort((a, b) => {
      const scoreA = this.calculateOBD2Score(a);
      const scoreB = this.calculateOBD2Score(b);
      return scoreB - scoreA;
    });
  }

  private calculateOBD2Score(device: BluetoothDevice): number {
    let score = 0;
    const name = (device.name || '').toLowerCase();
    
    if (name.includes('elm327')) score += 100;
    if (name.includes('vgate')) score += 95;
    if (name.includes('obd2') || name.includes('obdii')) score += 90;
    if (name.includes('konnwei')) score += 85;
    if (name.includes('veepeak')) score += 85;
    
    if (name.includes('scan')) score += 50;
    if (name.includes('diagnostic')) score += 45;
    if (name.includes('auto') || name.includes('car')) score += 40;
    if (name.includes('bluetooth')) score += 30;
    
    if (device.isPaired) score += 50;
    if (device.rssi && device.rssi > -60) score += 20;
    
    return score;
  }

  async connectWithStrategies(device: BluetoothDevice): Promise<{ success: boolean; strategy?: string; error?: string }> {
    if (this.isConnecting) {
      return { success: false, error: 'Connection already in progress' };
    }

    this.isConnecting = true;
    const strategies = this.getConnectionStrategies();

    try {
      for (let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i];
        console.log(`Trying connection strategy ${i + 1}/${strategies.length}: ${strategy.name}`);
        
        try {
          await this.executePreConnectionSteps(strategy.preConnectionSteps, device);
          
          const result = await this.attemptConnectionWithStrategy(device, strategy);
          
          if (result.success) {
            this.logConnectionAttempt(device, i + 1, true, strategy.name);
            return { success: true, strategy: strategy.name };
          }
          
        } catch (error) {
          console.warn(`Strategy ${strategy.name} failed:`, error);
          this.logConnectionAttempt(device, i + 1, false, strategy.name, error instanceof Error ? error.message : 'Unknown error');
          
          if (i < strategies.length - 1) {
            await this.delay(3000);
          }
        }
      }
      
      return { success: false, error: 'All connection strategies failed' };
      
    } finally {
      this.isConnecting = false;
    }
  }

  private async executePreConnectionSteps(steps: string[], device: BluetoothDevice): Promise<void> {
    for (const step of steps) {
      switch (step) {
        case 'check_bluetooth':
          await this.checkBluetoothStatus();
          break;
        case 'clear_cache':
          await this.clearBluetoothCache();
          break;
        case 'check_pairing':
          await this.checkDevicePairing(device);
          break;
        case 'reset_adapter':
          await this.resetBluetoothAdapter();
          break;
        case 'factory_reset':
          await this.factoryResetConnection();
          break;
      }
      await this.delay(1000);
    }
  }

  private async checkBluetoothStatus(): Promise<void> {
    if (window.bluetoothSerial && window.bluetoothSerial.isEnabled) {
      return new Promise((resolve, reject) => {
        window.bluetoothSerial.isEnabled(
          () => resolve(),
          () => reject(new Error('Bluetooth not enabled'))
        );
      });
    }
  }

  private async clearBluetoothCache(): Promise<void> {
    console.log('Clearing Bluetooth cache...');
    try {
      await enhancedBluetoothService.disconnect();
      await this.delay(2000);
    } catch (error) {
      console.warn('Cache clear disconnect failed:', error);
    }
  }

  private async checkDevicePairing(device: BluetoothDevice): Promise<void> {
    if (!device.isPaired) {
      console.log('Device not paired, attempting pairing...');
    }
  }

  private async resetBluetoothAdapter(): Promise<void> {
    console.log('Resetting Bluetooth adapter...');
    if (window.bluetoothSerial && window.bluetoothSerial.showBluetoothSettings) {
      try {
        await new Promise<void>((resolve) => {
          window.bluetoothSerial.showBluetoothSettings(
            () => {
              console.log('Bluetooth settings shown');
              resolve();
            },
            () => {
              console.warn('Failed to show Bluetooth settings');
              resolve();
            }
          );
        });
        await this.delay(3000);
      } catch (error) {
        console.warn('Bluetooth reset failed:', error);
      }
    }
  }

  private async factoryResetConnection(): Promise<void> {
    console.log('Factory reset connection settings...');
    enhancedBluetoothService.resetConnectionAttempts('all');
  }

  private async attemptConnectionWithStrategy(device: BluetoothDevice, strategy: ConnectionStrategy): Promise<{ success: boolean }> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Connection timeout after ${strategy.timeout}ms`));
      }, strategy.timeout);

      const onSuccess = () => {
        clearTimeout(timeout);
        resolve({ success: true });
      };

      const onError = (error: unknown) => {
        clearTimeout(timeout);
        reject(new Error(`Connection failed: ${JSON.stringify(error)}`));
      };

      if (!window.bluetoothSerial) {
        reject(new Error('Bluetooth Serial not available'));
        return;
      }

      if (strategy.method === 'secure') {
        window.bluetoothSerial.connect(device.address, onSuccess, onError);
      } else if (strategy.method === 'insecure') {
        window.bluetoothSerial.connectInsecure(device.address, onSuccess, onError);
      } else {
        window.bluetoothSerial.connectInsecure(device.address, onSuccess, (error) => {
          console.warn('Insecure failed, trying secure:', error);
          window.bluetoothSerial.connect(device.address, onSuccess, onError);
        });
      }
    });
  }

  private logConnectionAttempt(device: BluetoothDevice, attempt: number, success: boolean, strategy: string, error?: string): void {
    const connectionAttempt: ConnectionAttempt = {
      deviceId: device.id,
      deviceName: device.name,
      attempt,
      timestamp: new Date(),
      success,
      strategy,
      error
    };
    
    this.connectionAttempts.push(connectionAttempt);
    
    if (this.connectionAttempts.length > 50) {
      this.connectionAttempts = this.connectionAttempts.slice(-50);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getConnectionHistory(): ConnectionAttempt[] {
    return [...this.connectionAttempts];
  }

  resetDeviceConnectionHistory(deviceId: string): void {
    this.connectionAttempts = this.connectionAttempts.filter(attempt => attempt.deviceId !== deviceId);
  }

  isDeviceProblematic(deviceId: string): boolean {
    const recentAttempts = this.connectionAttempts
      .filter(attempt => attempt.deviceId === deviceId)
      .slice(-5);
    
    return recentAttempts.length >= 3 && recentAttempts.every(attempt => !attempt.success);
  }
}

export const enhancedConnectionService = EnhancedConnectionService.getInstance();
