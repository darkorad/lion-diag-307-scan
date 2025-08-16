
import { enhancedBluetoothService } from '@/obd2/enhanced-bluetooth-service';
import { masterBluetoothService, BluetoothDevice } from './MasterBluetoothService';
import { permissionService } from './PermissionService';
import { bluetoothConnectionManager } from './BluetoothConnectionManager';

export type { BluetoothDevice };

export interface UnifiedConnectionResult {
  success: boolean;
  device?: BluetoothDevice;
  error?: string;
  protocol?: string;
}

export class UnifiedBluetoothService {
  private static instance: UnifiedBluetoothService;
  private connecting = false;
  private connectionAttempts = new Map<string, number>();
  private maxAttempts = 3;

  private obd2Patterns = [
    'elm327', 'elm 327', 'elm-327', 'elm_327', 'elm',
    'vgate', 'viecar', 'konnwei', 'veepeak', 'bafx', 'autel', 
    'launch', 'foxwell', 'ancel', 'autophix', 'topdon', 'panlong',
    'obdlink', 'scantool', 'innovate', 'cobb', 'hp tuners',
    'obd2', 'obd-2', 'obdii', 'obd ii', 'obd-ii', 'obd',
    'scan', 'diagnostic', 'auto', 'car', 'vehicle', 'engine',
    'bluetooth', 'adapter', 'interface', 'scanner', 'reader',
    'code', 'fault', 'trouble', 'dtc', 'pid', 'ecu',
    'v1.5', 'v2.1', 'v2.2', 'mini', 'super', 'pro', 'plus',
    'wifi', 'wireless', 'bt', 'usb', 'serial',
    'torque', 'forscan', 'vcds', 'vagcom', 'opcom', 'pp2000',
    'diagbox', 'lexia', 'can', 'iso', 'kwp', 'j1850',
    'psa', 'vag', 'bmw', 'mercedes', 'audi', 'vw', 'ford',
    'citroen', 'peugeot', 'renault', 'fiat', 'opel'
  ];

  private obd2MacPrefixes = [
    '00:1D:A5', '20:15:03', '00:04:3E', '00:18:E4',
    '66:21:3E', '00:0D:18', '00:08:A1', '00:1B:DC',
    '00:02:72', '20:16:04', '00:15:83', '98:D3:31',
    '00:19:5D', '00:07:80', '00:13:EF', '00:12:6F',
    '20:14:05', '20:13:07', '00:21:13', '00:11:22',
    '66:22:3E', '68:27:19', '30:14:08', '34:14:B5'
  ];

  static getInstance(): UnifiedBluetoothService {
    if (!UnifiedBluetoothService.instance) {
      UnifiedBluetoothService.instance = new UnifiedBluetoothService();
    }
    return UnifiedBluetoothService.instance;
  }

  async discoverAllOBD2Devices(): Promise<BluetoothDevice[]> {
    console.log('Starting comprehensive OBD2 device discovery...');
    
    try {
      const permissions = await permissionService.requestAllPermissions();
      if (!permissions.bluetooth || !permissions.location) {
        throw new Error('Bluetooth and Location permissions are required for device discovery');
      }

      const isEnabled = await masterBluetoothService.isBluetoothEnabled();
      if (!isEnabled) {
        throw new Error('Bluetooth is not enabled. Please enable Bluetooth and try again.');
      }

      console.log('Scanning for all devices...');
      const allDevices = await masterBluetoothService.scanForDevices();

      const obd2Devices = allDevices
        .filter(device => this.isOBD2DeviceEnhanced(device))
        .sort((a, b) => this.calculateOBD2Score(b) - this.calculateOBD2Score(a));

      console.log(`Discovery complete. Found ${obd2Devices.length} potential OBD2 devices`);
      
      return obd2Devices;

    } catch (error) {
      console.error('Device discovery failed:', error);
      throw new Error(`Discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private isOBD2DeviceEnhanced(device: BluetoothDevice): boolean {
    const name = (device.name || '').toLowerCase().trim();
    const address = (device.address || '').toUpperCase();
    
    if (!name && !address) return false;
    
    const hasOBD2Pattern = this.obd2Patterns.some(pattern => 
      name.includes(pattern.toLowerCase())
    );
    
    const hasOBD2Mac = this.obd2MacPrefixes.some(prefix => 
      address.startsWith(prefix)
    );
    
    const isGenericBluetooth = name.includes('bluetooth') || 
                              name.includes('bt') || 
                              name === '' || 
                              name === 'unknown' ||
                              !!name.match(/^[a-f0-9]{12}$/i);
    
    const excludePatterns = [
      'headset', 'speaker', 'mouse', 'keyboard', 'phone', 'tablet', 
      'watch', 'tv', 'remote', 'controller', 'gamepad', 'joystick',
      'printer', 'camera', 'laptop', 'computer', 'headphone', 'earphone',
      'fitness', 'band', 'tracker', 'smart', 'home', 'alexa', 'google'
    ];
    
    const isExcluded = excludePatterns.some(pattern => 
      name.includes(pattern.toLowerCase())
    );
    
    return !isExcluded && (hasOBD2Pattern || hasOBD2Mac || isGenericBluetooth);
  }

  private calculateOBD2Score(device: BluetoothDevice): number {
    let score = 0;
    const name = (device.name || '').toLowerCase();
    const address = device.address.toUpperCase();
    
    if (name.includes('elm327')) score += 200;
    if (name.includes('vgate')) score += 190;
    if (name.includes('viecar')) score += 190;
    if (name.includes('konnwei')) score += 185;
    
    if (name.includes('obd2') || name.includes('obdii')) score += 180;
    if (name.includes('diagnostic')) score += 160;
    if (name.includes('scanner')) score += 150;
    
    if (name.includes('auto') || name.includes('car')) score += 100;
    if (name.includes('scan')) score += 90;
    if (name.includes('bluetooth')) score += 80;
    
    if (name.includes('v2.1') || name.includes('v2.2')) score += 50;
    if (name.includes('v1.5')) score += 40;
    
    if (device.isPaired) score += 100;
    if (device.rssi && device.rssi > -60) score += 30;
    if (device.rssi && device.rssi > -40) score += 50;
    
    const hasKnownMac = this.obd2MacPrefixes.some(prefix => 
      address.startsWith(prefix)
    );
    if (hasKnownMac) score += 120;
    
    if (name === '' || name === 'unknown' || name.match(/^[a-f0-9]{12}$/i)) {
      score -= 50;
    }
    
    return score;
  }

  async smartConnect(device: BluetoothDevice): Promise<UnifiedConnectionResult> {
    if (this.connecting) {
      return { success: false, error: 'Connection already in progress' };
    }

    this.connecting = true;
    const startTime = Date.now();
    
    console.log(`Starting smart connection to ${device.name} (${device.address})`);

    try {
      const attempts = this.connectionAttempts.get(device.address) || 0;
      if (attempts >= this.maxAttempts) {
        this.connectionAttempts.delete(device.address);
        return { 
          success: false, 
          error: `Max connection attempts (${this.maxAttempts}) reached. Device may be incompatible or out of range.` 
        };
      }

      this.connectionAttempts.set(device.address, attempts + 1);

      try {
        await masterBluetoothService.disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        // Ignore cleanup errors
      }

      const result = await masterBluetoothService.connectToDevice(device);
      
      if (result.success) {
        console.log('Connection established, initializing...');
        await this.initializeConnectedDevice(device);
        
        bluetoothConnectionManager.setConnected({
          ...device,
          isConnected: true
        });
        
        this.connectionAttempts.delete(device.address);
        
        const connectionTime = Date.now() - startTime;
        
        console.log(`Successfully connected in ${connectionTime}ms using ${result.strategy}`);
        
        return {
          success: true,
          device,
          protocol: result.strategy || 'Auto-detected'
        };
      } else {
        return { 
          success: false, 
          error: result.error || 'Connection failed'
        };
      }

    } catch (error) {
      console.error('Smart connection failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown connection error' 
      };
    } finally {
      this.connecting = false;
    }
  }

  private async initializeConnectedDevice(device: BluetoothDevice): Promise<void> {
    console.log('Initializing connected device...');
    
    try {
      let initSuccess = false;
      const maxInitAttempts = 3;
      
      for (let attempt = 1; attempt <= maxInitAttempts; attempt++) {
        try {
          console.log(`ELM327 initialization attempt ${attempt}/${maxInitAttempts}...`);
          
          await enhancedBluetoothService.initializeELM327CarScannerStyle();
          initSuccess = true;
          console.log('ELM327 initialized successfully');
          break;
          
        } catch (error) {
          console.warn(`Init attempt ${attempt} failed:`, error);
          
          if (attempt < maxInitAttempts) {
            console.log('Waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      if (!initSuccess) {
        console.warn('ELM327 initialization failed after all attempts');
      }
      
    } catch (error) {
      console.error('Device initialization failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await masterBluetoothService.disconnect();
      bluetoothConnectionManager.setDisconnected();
    } catch (error) {
      console.error('Disconnect failed:', error);
      throw error;
    }
  }

  resetConnectionAttempts(deviceAddress: string): void {
    if (deviceAddress === 'all') {
      this.connectionAttempts.clear();
    } else {
      this.connectionAttempts.delete(deviceAddress);
    }
  }

  getConnectionAttempts(deviceAddress: string): number {
    return this.connectionAttempts.get(deviceAddress) || 0;
  }
}

export const unifiedBluetoothService = UnifiedBluetoothService.getInstance();
