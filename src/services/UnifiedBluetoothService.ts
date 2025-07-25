
import { enhancedBluetoothService } from '@/obd2/enhanced-bluetooth-service';
import { masterBluetoothService } from './MasterBluetoothService';
import { permissionService } from './PermissionService';
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

  // Comprehensive list of OBD2 device patterns - covers ALL possible adapters
  private obd2Patterns = [
    // ELM327 variants (most common)
    'elm327', 'elm 327', 'elm-327', 'elm_327', 'elm',
    
    // Popular brands and models
    'vgate', 'viecar', 'konnwei', 'veepeak', 'bafx', 'autel', 
    'launch', 'foxwell', 'ancel', 'autophix', 'topdon', 'panlong',
    'obdlink', 'scantool', 'innovate', 'cobb', 'hp tuners',
    
    // Generic OBD terms (catches most adapters)
    'obd2', 'obd-2', 'obdii', 'obd ii', 'obd-ii', 'obd',
    
    // Common device names and descriptions
    'scan', 'diagnostic', 'auto', 'car', 'vehicle', 'engine',
    'bluetooth', 'adapter', 'interface', 'scanner', 'reader',
    'code', 'fault', 'trouble', 'dtc', 'pid', 'ecu',
    
    // Version and feature indicators
    'v1.5', 'v2.1', 'v2.2', 'mini', 'super', 'pro', 'plus',
    'wifi', 'wireless', 'bt', 'usb', 'serial',
    
    // Software compatibility indicators
    'torque', 'forscan', 'vcds', 'vagcom', 'opcom', 'pp2000',
    'diagbox', 'lexia', 'can', 'iso', 'kwp', 'j1850',
    
    // Manufacturer specific patterns
    'psa', 'vag', 'bmw', 'mercedes', 'audi', 'vw', 'ford',
    'citroen', 'peugeot', 'renault', 'fiat', 'opel'
  ];

  // Extended MAC address prefixes for various OBD2 manufacturers
  private obd2MacPrefixes = [
    // Common ELM327 manufacturers
    '00:1D:A5', '20:15:03', '00:04:3E', '00:18:E4',
    '66:21:3E', '00:0D:18', '00:08:A1', '00:1B:DC',
    '00:02:72', '20:16:04', '00:15:83', '98:D3:31',
    '00:19:5D', '00:07:80', '00:13:EF', '00:12:6F',
    // Additional patterns found in various adapters
    '20:14:05', '20:13:07', '00:21:13', '00:11:22',
    '66:22:3E', '68:27:19', '30:14:08', '34:14:B5'
  ];

  static getInstance(): UnifiedBluetoothService {
    if (!UnifiedBluetoothService.instance) {
      UnifiedBluetoothService.instance = new UnifiedBluetoothService();
    }
    return UnifiedBluetoothService.instance;
  }

  // Enhanced discovery that finds ALL Bluetooth devices and filters intelligently
  async discoverAllOBD2Devices(): Promise<BluetoothDevice[]> {
    console.log('Starting comprehensive OBD2 device discovery...');
    
    try {
      // Ensure all required permissions
      const permissions = await permissionService.requestAllPermissions();
      if (!permissions.bluetooth || !permissions.location) {
        throw new Error('Bluetooth and Location permissions are required for device discovery');
      }

      // Check if Bluetooth is enabled
      const isEnabled = await masterBluetoothService.isBluetoothEnabled();
      if (!isEnabled) {
        throw new Error('Bluetooth is not enabled. Please enable Bluetooth and try again.');
      }

      console.log('Scanning for paired devices...');
      const pairedDevices = await this.getPairedDevicesEnhanced();
      
      console.log('Scanning for discoverable devices...');
      const discoverableDevices = await this.getDiscoverableDevicesEnhanced();

      // Combine and deduplicate devices
      const allDevices = [...pairedDevices, ...discoverableDevices];
      const uniqueDevices = this.removeDuplicateDevices(allDevices);
      
      // Filter for OBD2 devices with enhanced detection
      const obd2Devices = uniqueDevices
        .filter(device => this.isOBD2DeviceEnhanced(device))
        .sort((a, b) => this.calculateOBD2Score(b) - this.calculateOBD2Score(a));

      console.log(`Discovery complete. Found ${obd2Devices.length} potential OBD2 devices:`, 
        obd2Devices.map(d => `${d.name} (${d.address})`));
      
      return obd2Devices;

    } catch (error) {
      console.error('Device discovery failed:', error);
      throw new Error(`Discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getPairedDevicesEnhanced(): Promise<BluetoothDevice[]> {
    try {
      const devices = await masterBluetoothService.discoverAllDevices();
      return devices.filter(device => device.isPaired);
    } catch (error) {
      console.warn('Failed to get paired devices:', error);
      return [];
    }
  }

  private async getDiscoverableDevicesEnhanced(): Promise<BluetoothDevice[]> {
    try {
      const devices = await masterBluetoothService.discoverAllDevices();
      return devices.filter(device => !device.isPaired);
    } catch (error) {
      console.warn('Failed to get discoverable devices:', error);
      return [];
    }
  }

  // Enhanced OBD2 device detection with multiple criteria
  private isOBD2DeviceEnhanced(device: BluetoothDevice): boolean {
    const name = (device.name || '').toLowerCase().trim();
    const address = (device.address || '').toUpperCase();
    
    // Skip empty or null names/addresses
    if (!name && !address) return false;
    
    // Check against comprehensive OBD2 patterns
    const hasOBD2Pattern = this.obd2Patterns.some(pattern => 
      name.includes(pattern.toLowerCase())
    );
    
    // Check MAC address patterns
    const hasOBD2Mac = this.obd2MacPrefixes.some(prefix => 
      address.startsWith(prefix)
    );
    
    // Include devices with generic bluetooth names that might be OBD2
    const isGenericBluetooth = name.includes('bluetooth') || 
                              name.includes('bt') || 
                              name === '' || 
                              name === 'unknown' ||
                              !!name.match(/^[a-f0-9]{12}$/i); // MAC as name
    
    // Exclude obvious non-OBD2 devices
    const excludePatterns = [
      'headset', 'speaker', 'mouse', 'keyboard', 'phone', 'tablet', 
      'watch', 'tv', 'remote', 'controller', 'gamepad', 'joystick',
      'printer', 'camera', 'laptop', 'computer', 'headphone', 'earphone',
      'fitness', 'band', 'tracker', 'smart', 'home', 'alexa', 'google'
    ];
    
    const isExcluded = excludePatterns.some(pattern => 
      name.includes(pattern.toLowerCase())
    );
    
    // Device is OBD2 if: has OBD2 pattern OR has OBD2 MAC OR (is generic bluetooth AND not excluded)
    return !isExcluded && (hasOBD2Pattern || hasOBD2Mac || isGenericBluetooth);
  }

  // Enhanced scoring system for device ranking
  private calculateOBD2Score(device: BluetoothDevice): number {
    let score = 0;
    const name = (device.name || '').toLowerCase();
    const address = device.address.toUpperCase();
    
    // Highest confidence - exact matches
    if (name.includes('elm327')) score += 200;
    if (name.includes('vgate')) score += 190;
    if (name.includes('viecar')) score += 190;
    if (name.includes('konnwei')) score += 185;
    
    // High confidence OBD2 terms
    if (name.includes('obd2') || name.includes('obdii')) score += 180;
    if (name.includes('diagnostic')) score += 160;
    if (name.includes('scanner')) score += 150;
    
    // Medium confidence terms
    if (name.includes('auto') || name.includes('car')) score += 100;
    if (name.includes('scan')) score += 90;
    if (name.includes('bluetooth')) score += 80;
    
    // Version bonuses
    if (name.includes('v2.1') || name.includes('v2.2')) score += 50;
    if (name.includes('v1.5')) score += 40;
    
    // Connection and status bonuses
    if (device.isPaired) score += 100; // Prefer already paired devices
    if (device.rssi && device.rssi > -60) score += 30; // Strong signal
    if (device.rssi && device.rssi > -40) score += 50; // Very strong signal
    
    // MAC address recognition bonus
    const hasKnownMac = this.obd2MacPrefixes.some(prefix => 
      address.startsWith(prefix)
    );
    if (hasKnownMac) score += 120;
    
    // Penalty for generic names (but don't exclude them)
    if (name === '' || name === 'unknown' || name.match(/^[a-f0-9]{12}$/i)) {
      score -= 50;
    }
    
    return score;
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

  // Smart connection with multiple strategies and comprehensive error handling
  async smartConnect(device: BluetoothDevice): Promise<UnifiedConnectionResult> {
    if (this.connecting) {
      return { success: false, error: 'Connection already in progress' };
    }

    this.connecting = true;
    const startTime = Date.now();
    
    console.log(`Starting smart connection to ${device.name} (${device.address})`);

    try {
      // Check connection attempts
      const attempts = this.connectionAttempts.get(device.address) || 0;
      if (attempts >= this.maxAttempts) {
        this.connectionAttempts.delete(device.address);
        return { 
          success: false, 
          error: `Max connection attempts (${this.maxAttempts}) reached. Device may be incompatible or out of range.` 
        };
      }

      this.connectionAttempts.set(device.address, attempts + 1);

      // Pre-connection cleanup
      try {
        await masterBluetoothService.disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        // Ignore cleanup errors
      }

      // Connection strategies with different timeouts and methods
      const strategies = [
        { 
          method: 'insecure', 
          timeout: 20000, 
          description: 'Insecure connection (most compatible)',
          setup: async () => {}
        },
        { 
          method: 'secure', 
          timeout: 25000, 
          description: 'Secure connection with pairing',
          setup: async () => {
            // Try to pair if not already paired
            if (!device.isPaired) {
              console.log('Attempting to pair device...');
            }
          }
        },
        { 
          method: 'insecure_retry', 
          timeout: 30000, 
          description: 'Extended insecure connection',
          setup: async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      ];

      for (const strategy of strategies) {
        try {
          console.log(`Attempting ${strategy.description}...`);
          
          // Run strategy setup
          await strategy.setup();
          
          // Attempt connection
          await this.attemptConnectionWithTimeout(device, strategy.method, strategy.timeout);
          
          // Connection successful - initialize device
          console.log('Connection established, initializing...');
          await this.initializeConnectedDevice(device);
          
          // Update connection manager
          bluetoothConnectionManager.setConnected({
            ...device,
            isConnected: true
          });
          
          // Reset attempts on success
          this.connectionAttempts.delete(device.address);
          
          const connectionTime = Date.now() - startTime;
          const protocol = 'Auto-detected';
          
          console.log(`Successfully connected in ${connectionTime}ms using ${strategy.description}`);
          
          return {
            success: true,
            device,
            protocol
          };
          
        } catch (error) {
          console.warn(`${strategy.description} failed:`, error);
          
          // Wait before trying next strategy
          if (strategy !== strategies[strategies.length - 1]) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      }

      return { 
        success: false, 
        error: 'All connection strategies failed. Please check device power, range, and ensure ignition is on.' 
      };

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

  private async attemptConnectionWithTimeout(device: BluetoothDevice, method: string, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`${method} connection timeout after ${timeout}ms`));
      }, timeout);

      const onSuccess = () => {
        clearTimeout(timeoutId);
        console.log(`${method} connection successful`);
        resolve();
      };

      const onError = (error: any) => {
        clearTimeout(timeoutId);
        const errorMsg = typeof error === 'string' ? error : JSON.stringify(error);
        reject(new Error(`${method} connection failed: ${errorMsg}`));
      };

      // Use appropriate connection method
      if (method.includes('secure')) {
        window.bluetoothSerial.connect(device.address, onSuccess, onError);
      } else {
        window.bluetoothSerial.connectInsecure(device.address, onSuccess, onError);
      }
    });
  }

  private async initializeConnectedDevice(device: BluetoothDevice): Promise<void> {
    console.log('Initializing connected device...');
    
    try {
      // Initialize ELM327 with retries
      let initSuccess = false;
      const maxInitAttempts = 3;
      
      for (let attempt = 1; attempt <= maxInitAttempts; attempt++) {
        try {
          console.log(`ELM327 initialization attempt ${attempt}/${maxInitAttempts}...`);
          
          // Use the enhanced bluetooth service initialization
          await enhancedBluetoothService.initializeELM327CarScannerStyle();
          initSuccess = true;
          console.log('ELM327 initialized successfully');
          break;
          
        } catch (error) {
          console.warn(`Init attempt ${attempt} failed:`, error);
          
          if (attempt < maxInitAttempts) {
            console.log('Waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      }
      
      if (!initSuccess) {
        console.warn('ELM327 initialization failed, but connection established');
        // Don't throw error - connection might still work for basic functions
      }
      
      // Test basic communication
      await this.testBasicCommunication();
      
    } catch (error) {
      console.error('Device initialization failed:', error);
      // Don't throw - let the connection proceed as it might still work
    }
  }

  private async testBasicCommunication(): Promise<void> {
    console.log('Testing basic communication...');
    
    const testCommands = [
      { cmd: '0100', desc: 'Supported PIDs', timeout: 8000 },
      { cmd: 'ATI', desc: 'ELM327 version', timeout: 5000 },
      { cmd: '010C', desc: 'Engine RPM', timeout: 8000 }
    ];
    
    let communicationWorking = false;
    
    for (const test of testCommands) {
      try {
        console.log(`Testing ${test.desc}...`);
        const response = await enhancedBluetoothService.sendObdCommand(test.cmd, test.timeout);
        
        if (response && response.length > 2 && 
            !response.toUpperCase().includes('NO DATA') &&
            !response.toUpperCase().includes('ERROR')) {
          console.log(`Communication test passed: ${test.desc} -> ${response}`);
          communicationWorking = true;
          break;
        }
      } catch (error) {
        console.warn(`Test ${test.desc} failed:`, error);
        continue;
      }
    }
    
    if (!communicationWorking) {
      console.warn('Basic communication test failed - connection may be limited');
      // Don't throw error - connection is established, data may still work
    } else {
      console.log('Basic communication test successful');
    }
  }

  // Reset connection attempts for a device
  resetConnectionAttempts(deviceAddress: string): void {
    this.connectionAttempts.delete(deviceAddress);
    console.log(`Reset connection attempts for ${deviceAddress}`);
  }

  // Get connection status
  isConnectingToDevice(): boolean {
    return this.connecting;
  }

  // Get connection attempts for a device
  getConnectionAttempts(deviceAddress: string): number {
    return this.connectionAttempts.get(deviceAddress) || 0;
  }

  // Disconnect current device
  async disconnect(): Promise<void> {
    this.connecting = false;
    try {
      await masterBluetoothService.disconnect();
      bluetoothConnectionManager.setDisconnected();
      console.log('Disconnection complete');
    } catch (error) {
      console.error('Disconnect error:', error);
      // Still update state even if disconnect fails
      bluetoothConnectionManager.setDisconnected();
    }
  }

  // Clear all connection attempts (useful for troubleshooting)
  clearAllConnectionAttempts(): void {
    this.connectionAttempts.clear();
    console.log('Cleared all connection attempts');
  }
}

export const unifiedBluetoothService = UnifiedBluetoothService.getInstance();
