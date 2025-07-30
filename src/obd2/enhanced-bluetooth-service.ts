type BluetoothSerial = {
  list: (success: (devices: unknown[]) => void, error: (error: unknown) => void) => void;
  connect: (address: string, success: () => void, error: (error: unknown) => void) => void;
  connectInsecure: (address: string, success: () => void, error: (error: unknown) => void) => void;
  disconnect: (success: () => void, error: (error: unknown) => void) => void;
  write: (data: string, success: () => void, error: (error: unknown) => void) => void;
  available: (success: (count: number) => void, error: (error: unknown) => void) => void;
  read: (success: (data: string) => void, error: (error: unknown) => void) => void;
  readUntil: (delimiter: string, success: (data: string) => void, error: (error: unknown) => void) => void;
  isConnected: (success: () => void, error: () => void) => void;
  isEnabled: (success: () => void, error: () => void) => void;
  enable: (success: () => void, error: (error: unknown) => void) => void;
  discoverUnpaired: (success: (devices: unknown[]) => void, error: (error: unknown) => void) => void;
  setDeviceDiscoveredListener: (notify: (device: unknown) => void) => void;
  clearDeviceDiscoveredListener: () => void;
  setName: (name: string, success: () => void, error: (error: unknown) => void) => void;
  setDiscoverable: (duration: number, success: () => void, error: (error: unknown) => void) => void;
  subscribe: (delimiter: string, success: (data: string) => void, error: (error: unknown) => void) => void;
  unsubscribe: (success: () => void, error: (error: unknown) => void) => void;
  showBluetoothSettings: (success: () => void, error: (error: unknown) => void) => void;
};

declare global {
  interface Window {
    bluetoothSerial: BluetoothSerial;
  }
}

export interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
  class?: number;
  isPaired?: boolean;
  rssi?: number;
}

export class EnhancedBluetoothService {
  private isConnected = false;
  private currentDevice: BluetoothDevice | null = null;
  private selectedProtocol: string = '4'; // ISO 14230-4 KWP - most compatible
  private elmVersion: string = '';
  private connectionAttempts: Map<string, number> = new Map();
  private maxConnectionAttempts = 3; // Reduced for better UX
  private connectionTimeout = 15000; // Reduced timeout
  private commandQueue: Array<{ command: string; resolve: (value: string | PromiseLike<string>) => void; reject: (reason?: unknown) => void; }> = [];
  private isProcessingQueue = false;
  private commandTimeout = 15000;

  // Enhanced protocol definitions with success rates
  private protocols: Record<string, { name: string; successRate: number }> = {
    '0': { name: 'Automatic', successRate: 85 },
    '4': { name: 'ISO 14230-4 KWP (5 baud init)', successRate: 90 }, // Best for older cars
    '5': { name: 'ISO 14230-4 KWP (fast init)', successRate: 88 },
    '6': { name: 'ISO 15765-4 CAN (11 bit ID, 500 Kbaud)', successRate: 95 }, // Best for newer cars
    '7': { name: 'ISO 15765-4 CAN (29 bit ID, 500 Kbaud)', successRate: 93 },
    '8': { name: 'ISO 15765-4 CAN (11 bit ID, 250 Kbaud)', successRate: 92 },
    '9': { name: 'ISO 15765-4 CAN (29 bit ID, 250 Kbaud)', successRate: 90 },
    '1': { name: 'SAE J1850 PWM (41.6 Kbaud)', successRate: 70 },
    '2': { name: 'SAE J1850 VPWM (10.4 Kbaud)', successRate: 65 },
    '3': { name: 'ISO 9141 (5 baud initialization)', successRate: 75 },
    'A': { name: 'SAE J1939 CAN (29 bit ID, 250 Kbaud)', successRate: 80 }
  };

  // Check if Bluetooth is available and enabled with enhanced error handling
  async checkBluetoothStatus(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!window.bluetoothSerial) {
        console.error('Bluetooth Serial plugin not available - ensure Cordova plugin is installed');
        resolve(false);
        return;
      }

      window.bluetoothSerial.isEnabled(
        () => {
          console.log('Bluetooth is enabled and ready');
          resolve(true);
        },
        () => {
          console.log('Bluetooth is disabled, attempting to enable...');
          window.bluetoothSerial.enable(
            () => {
              console.log('Bluetooth enabled successfully');
              resolve(true);
            },
            (error) => {
              console.error('Failed to enable Bluetooth:', error);
              resolve(false);
            }
          );
        }
      );
    });
  }

  // Enhanced paired device detection with better filtering
  async getPairedDevices(): Promise<BluetoothDevice[]> {
    return new Promise((resolve, reject) => {
      if (!window.bluetoothSerial) {
        reject(new Error('Bluetooth Serial plugin not available'));
        return;
      }

      window.bluetoothSerial.list(
        (devices) => {
          console.log('Raw paired devices found:', devices.length);
          const bluetoothDevices: BluetoothDevice[] = devices
            .map(device => ({
              id: device.id || device.address,
              name: device.name || 'Unknown OBD2 Device',
              address: device.address || device.id,
              class: device.class,
              isPaired: true
            }))
            .filter(device => this.isLikelyOBD2Device(device))
            .sort((a, b) => this.calculateDeviceScore(b) - this.calculateDeviceScore(a));
          
          console.log('Filtered and ranked paired OBD2 devices:', bluetoothDevices);
          resolve(bluetoothDevices);
        },
        (error) => {
          console.error('Failed to list paired devices:', error);
          resolve([]); // Don't reject, return empty array for better UX
        }
      );
    });
  }

  // Enhanced device discovery with better timeout and error handling
  async discoverDevices(): Promise<BluetoothDevice[]> {
    return new Promise((resolve, reject) => {
      if (!window.bluetoothSerial) {
        reject(new Error('Bluetooth Serial plugin not available'));
        return;
      }

      const discoveredDevices: BluetoothDevice[] = [];
      let discoveryCompleted = false;
      
      // Shorter discovery timeout for better UX
      const discoveryTimeout = setTimeout(() => {
        if (!discoveryCompleted) {
          discoveryCompleted = true;
          window.bluetoothSerial.clearDeviceDiscoveredListener();
          console.log('Discovery completed by timeout, found devices:', discoveredDevices.length);
          resolve(discoveredDevices);
        }
      }, 20000);

      // Enhanced device discovery listener
      window.bluetoothSerial.setDeviceDiscoveredListener((device) => {
        const bluetoothDevice: BluetoothDevice = {
          id: device.id || device.address,
          name: device.name || `ELM327-${device.address?.slice(-4)}`,
          address: device.address || device.id,
          class: device.class,
          isPaired: false,
          rssi: device.rssi
        };
        
        console.log('Device discovered:', bluetoothDevice);
        
        // Only add OBD2-like devices
        if (this.isLikelyOBD2Device(bluetoothDevice)) {
          const existingIndex = discoveredDevices.findIndex(d => d.address === bluetoothDevice.address);
          if (existingIndex >= 0) {
            discoveredDevices[existingIndex] = bluetoothDevice; // Update with latest info
          } else {
            discoveredDevices.push(bluetoothDevice);
            console.log('Added OBD2 device to discovery list:', bluetoothDevice.name);
          }
        }
      });

      window.bluetoothSerial.discoverUnpaired(
        (devices) => {
          if (!discoveryCompleted) {
            discoveryCompleted = true;
            clearTimeout(discoveryTimeout);
            window.bluetoothSerial.clearDeviceDiscoveredListener();
            
            // Process any additional devices from the final callback
            devices.forEach(device => {
              const bluetoothDevice: BluetoothDevice = {
                id: device.id || device.address,
                name: device.name || `ELM327-${device.address?.slice(-4)}`,
                address: device.address || device.id,
                class: device.class,
                isPaired: false
              };
              
              if (this.isLikelyOBD2Device(bluetoothDevice)) {
                const exists = discoveredDevices.some(d => d.address === bluetoothDevice.address);
                if (!exists) {
                  discoveredDevices.push(bluetoothDevice);
                }
              }
            });
            
            // Sort by likelihood of being OBD2
            const sortedDevices = discoveredDevices.sort((a, b) => 
              this.calculateDeviceScore(b) - this.calculateDeviceScore(a)
            );
            
            console.log('Discovery completed successfully, found devices:', sortedDevices.length);
            resolve(sortedDevices);
          }
        },
        (error) => {
          if (!discoveryCompleted) {
            discoveryCompleted = true;
            clearTimeout(discoveryTimeout);
            window.bluetoothSerial.clearDeviceDiscoveredListener();
            console.error('Discovery failed:', error);
            resolve(discoveredDevices); // Return partial results
          }
        }
      );
    });
  }

  // Improved OBD2 device detection algorithm
  private isLikelyOBD2Device(device: BluetoothDevice): boolean {
    const name = (device.name || '').toLowerCase();
    const address = (device.address || '').toUpperCase();
    
    // High confidence OBD2 device patterns
    const highConfidencePatterns = [
      'elm327', 'elm 327', 'elm-327',
      'obd2', 'obd-2', 'obdii', 'obd ii',
      'vgate', 'viecar', 'konnwei', 'veepeak',
      'bafx', 'autel', 'launch', 'foxwell'
    ];
    
    // Medium confidence patterns
    const mediumConfidencePatterns = [
      'scan', 'diagnostic', 'auto', 'car',
      'bluetooth', 'adapter', 'interface',
      'v1.5', 'v2.1', 'v2.2', 'mini'
    ];
    
    // Known ELM327 MAC prefixes
    const knownElmPrefixes = [
      '00:1D:A5', '20:15:03', '00:04:3E', 
      '00:18:E4', '66:21:3E', '00:0D:18'
    ];
    
    // Check high confidence patterns
    if (highConfidencePatterns.some(pattern => name.includes(pattern))) {
      return true;
    }
    
    // Check MAC address patterns
    if (knownElmPrefixes.some(prefix => address.startsWith(prefix))) {
      return true;
    }
    
    // Check medium confidence with additional criteria
    if (mediumConfidencePatterns.some(pattern => name.includes(pattern))) {
      // Additional validation for medium confidence
      return name.length < 30 && !name.includes('headset') && !name.includes('speaker');
    }
    
    // Include unnamed devices that might be ELM327
    if (!name || name.trim() === '' || name === 'unknown device') {
      return true;
    }
    
    return false;
  }

  // Enhanced device scoring algorithm
  private calculateDeviceScore(device: BluetoothDevice): number {
    let score = 0;
    const name = (device.name || '').toLowerCase();
    
    // High value indicators
    if (name.includes('elm327')) score += 100;
    if (name.includes('vgate')) score += 95;
    if (name.includes('viecar')) score += 95;
    if (name.includes('konnwei')) score += 90;
    if (name.includes('obd2') || name.includes('obdii')) score += 85;
    
    // Medium value indicators
    if (name.includes('scan')) score += 50;
    if (name.includes('diagnostic')) score += 45;
    if (name.includes('auto') || name.includes('car')) score += 40;
    if (name.includes('bluetooth')) score += 30;
    
    // Version indicators
    if (name.includes('v1.5')) score += 25;
    if (name.includes('v2.1')) score += 35;
    if (name.includes('v2.2')) score += 35;
    
    // Pairing bonus
    if (device.isPaired) score += 50;
    
    // Signal strength bonus
    if (device.rssi && device.rssi > -70) score += 20;
    if (device.rssi && device.rssi > -50) score += 10;
    
    // Penalize very long names (likely not OBD2)
    if (name.length > 25) score -= 20;
    
    return score;
  }

  // Enhanced connection with smart retry logic
  async connectToDevice(device: BluetoothDevice): Promise<void> {
    if (!window.bluetoothSerial) {
      throw new Error('Bluetooth Serial plugin not available');
    }

    const deviceKey = device.address;
    const attempts = this.connectionAttempts.get(deviceKey) || 0;
    
    if (attempts >= this.maxConnectionAttempts) {
      this.connectionAttempts.delete(deviceKey);
      throw new Error(`Connection failed after ${this.maxConnectionAttempts} attempts. Please check device and try again.`);
    }

    this.connectionAttempts.set(deviceKey, attempts + 1);

    // Connection strategies ordered by success probability
    const strategies = [
      { name: 'insecure', priority: 1 },
      { name: 'secure', priority: 2 }
    ];

    // Sort strategies by device type
    if (device.isPaired) {
      strategies.reverse(); // Try secure first for paired devices
    }

    for (const strategy of strategies) {
      try {
        console.log(`Attempting ${strategy.name} connection to ${device.name} (attempt ${attempts + 1}/${this.maxConnectionAttempts})`);
        
        await this.attemptConnection(device, strategy.name);
        
        // Connection successful
        this.isConnected = true;
        this.currentDevice = device;
        this.connectionAttempts.delete(deviceKey);
        
        console.log(`Successfully connected using ${strategy.name} method`);
        return;
        
      } catch (error) {
        console.warn(`${strategy.name} connection failed:`, error);
        
        // Wait before trying next strategy
        if (strategy !== strategies[strategies.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    // All strategies failed
    throw new Error(`Failed to connect to ${device.name}. Check device power and proximity.`);
  }

  private async attemptConnection(device: BluetoothDevice, method: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Connection timeout after ${this.connectionTimeout}ms`));
      }, this.connectionTimeout);

      const onSuccess = () => {
        clearTimeout(timeout);
        resolve();
      };

      const onError = (error: unknown) => {
        clearTimeout(timeout);
        reject(new Error(`${method} connection error: ${JSON.stringify(error)}`));
      };

      // Attempt connection based on method
      if (method === 'secure') {
        window.bluetoothSerial.connect(device.address, onSuccess, onError);
      } else {
        window.bluetoothSerial.connectInsecure(device.address, onSuccess, onError);
      }
    });
  }

  // Enhanced ELM327 initialization with smart protocol detection
  async initializeELM327CarScannerStyle(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Device not connected');
    }

    console.log('Starting enhanced ELM327 initialization...');
    
    try {
      // Step 1: Reset with extended wait
      console.log('Resetting ELM327...');
      try {
        await this.sendObdCommandDirect('ATZ', 10000);
      } catch (e) {
        console.warn('Reset command failed, continuing...');
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Step 2: Get version info
      try {
        const version = await this.sendObdCommandDirect('ATI', 5000);
        this.elmVersion = version || 'Unknown';
        console.log('ELM327 Version:', this.elmVersion);
      } catch (e) {
        console.warn('Version read failed, continuing...');
      }
      
      // Step 3: Configure ELM327 (essential settings only)
      const essentialSettings = [
        { cmd: 'ATE0', desc: 'Turn off echo' },
        { cmd: 'ATL0', desc: 'Turn off line feeds' },
        { cmd: 'ATS0', desc: 'Turn off spaces' },
        { cmd: 'ATH0', desc: 'Turn off headers' },
        { cmd: 'ATAT1', desc: 'Adaptive timing' },
        { cmd: 'ATST32', desc: 'Set timeout' }
      ];
      
      for (const setting of essentialSettings) {
        try {
          console.log(`Setting: ${setting.desc}`);
          await this.sendObdCommandDirect(setting.cmd, 3000);
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (e) {
          console.warn(`Setting ${setting.cmd} failed:`, e);
        }
      }
      
      // Step 4: Smart protocol detection
      await this.detectAndSetOptimalProtocol();
      
      console.log('ELM327 initialization completed successfully');
      
    } catch (error) {
      console.error('ELM327 initialization failed:', error);
      throw new Error(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Smart protocol detection based on vehicle response
  private async detectAndSetOptimalProtocol(): Promise<void> {
    console.log('Starting smart protocol detection...');
    
    // Try protocols in order of success probability
    const protocolOrder = ['6', '7', '4', '5', '8', '9', '0']; // CAN first, then KWP, then auto
    
    for (const protocol of protocolOrder) {
      try {
        console.log(`Testing protocol ${protocol}: ${this.protocols[protocol as keyof typeof this.protocols].name}`);
        
        await this.sendObdCommandDirect(`ATSP${protocol}`, 5000);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test communication with multiple PIDs
        const testPids = ['0100', '010C', '010D', '0104'];
        let successCount = 0;
        
        for (const pid of testPids) {
          try {
            const response = await this.sendObdCommandDirect(pid, 6000);
            if (this.isValidResponse(response)) {
              successCount++;
              console.log(`Protocol ${protocol} - PID ${pid} success`);
            }
          } catch (e) {
            console.log(`Protocol ${protocol} - PID ${pid} failed`);
          }
        }
        
        // If at least 2 PIDs work, consider protocol successful
        if (successCount >= 2) {
          this.selectedProtocol = protocol;
          console.log(`Selected protocol ${protocol} with ${successCount}/4 successful PIDs`);
          return;
        }
        
      } catch (error) {
        console.log(`Protocol ${protocol} failed:`, error);
      }
    }
    
    // If no protocol worked specifically, try auto mode as last resort
    try {
      console.log('Falling back to automatic protocol detection...');
      await this.sendObdCommandDirect('ATSP0', 5000);
      
      const testResponse = await this.sendObdCommandDirect('0100', 10000);
      if (this.isValidResponse(testResponse)) {
        this.selectedProtocol = '0';
        console.log('Auto protocol detection successful');
        return;
      }
    } catch (e) {
      console.warn('Auto protocol failed');
    }
    
    throw new Error('No compatible protocol found. Vehicle may not support OBD2 or adapter issue.');
  }

  private isValidResponse(response: string): boolean {
    if (!response || response.length < 4) return false;
    
    const cleanResponse = response.replace(/\s/g, '').toUpperCase();
    
    // Check for error patterns
    const errorPatterns = [
      'NODATA', 'ERROR', 'UNABLETOCONNECT', 'BUSINIT',
      '?', 'SEARCHING', 'BUSBUSY', 'FBERROR', 'DATAERROR'
    ];
    
    if (errorPatterns.some(pattern => cleanResponse.includes(pattern))) {
      return false;
    }
    
    // Check if response looks like valid hex data
    return /^[0-9A-F\s]{4,}$/.test(cleanResponse);
  }

  // Enhanced command sending with queue management
  async sendObdCommand(command: string, timeout: number = 8000): Promise<string> {
    return new Promise((resolve, reject) => {
      this.commandQueue.push({ command, resolve, reject });
      
      if (!this.isProcessingQueue) {
        this.processCommandQueue();
      }
    });
  }

  private async processCommandQueue(): Promise<void> {
    if (this.isProcessingQueue || this.commandQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.commandQueue.length > 0) {
      const { command, resolve, reject } = this.commandQueue.shift()!;
      
      try {
        const result = await this.sendObdCommandDirect(command, 8000);
        resolve(result);
      } catch (error) {
        reject(error);
      }
      
      // Small delay between commands
      await new Promise(r => setTimeout(r, 100));
    }
    
    this.isProcessingQueue = false;
  }

  // Direct command sending without queue
  private async sendObdCommandDirect(command: string, timeout: number = 8000): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Device not connected');
    }

    return new Promise((resolve, reject) => {
      const commandTimeout = setTimeout(() => {
        reject(new Error(`Command timeout: ${command}`));
      }, timeout);

      const commandWithCR = command.trim() + '\r';
      
      window.bluetoothSerial.write(
        commandWithCR,
        () => {
          // Wait a bit for command to be processed
          setTimeout(() => {
            window.bluetoothSerial.readUntil(
              '>',
              (data) => {
                clearTimeout(commandTimeout);
                const cleanData = data.replace(/[\r\n>]/g, '').trim();
                resolve(cleanData);
              },
              (error) => {
                clearTimeout(commandTimeout);
                reject(new Error(`Read failed for ${command}: ${error}`));
              }
            );
          }, 200);
        },
        (error) => {
          clearTimeout(commandTimeout);
          reject(new Error(`Write failed for ${command}: ${error}`));
        }
      );
    });
  }

  // Enhanced disconnect with cleanup
  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      // Clear command queue
      this.commandQueue = [];
      this.isProcessingQueue = false;
      
      if (!window.bluetoothSerial) {
        this.cleanup();
        resolve();
        return;
      }

      window.bluetoothSerial.disconnect(
        () => {
          this.cleanup();
          console.log('Bluetooth disconnected successfully');
          resolve();
        },
        (error) => {
          this.cleanup();
          console.warn('Disconnect error (cleaned up anyway):', error);
          resolve();
        }
      );
    });
  }

  private cleanup(): void {
    this.isConnected = false;
    this.currentDevice = null;
    this.commandQueue = [];
    this.isProcessingQueue = false;
  }

  // Get all devices with enhanced error handling
  async getAllDevices(): Promise<BluetoothDevice[]> {
    try {
      const bluetoothEnabled = await this.checkBluetoothStatus();
      if (!bluetoothEnabled) {
        throw new Error('Bluetooth not available');
      }

      console.log('Getting all devices (paired + discoverable)...');
      
      // Run both operations with timeout protection
      const operations = [
        this.getPairedDevices().catch(e => { console.warn('Paired scan failed:', e); return []; }),
        this.discoverDevices().catch(e => { console.warn('Discovery failed:', e); return []; })
      ];
      
      const [pairedDevices, discoveredDevices] = await Promise.all(operations);
      
      // Merge and deduplicate
      const allDevices: BluetoothDevice[] = [...pairedDevices];
      
      discoveredDevices.forEach(device => {
        const exists = allDevices.some(d => d.address === device.address);
        if (!exists) {
          allDevices.push(device);
        }
      });
      
      // Final ranking
      const rankedDevices = allDevices.sort((a, b) => 
        this.calculateDeviceScore(b) - this.calculateDeviceScore(a)
      );
      
      console.log(`Total devices found: ${rankedDevices.length}`);
      return rankedDevices;
      
    } catch (error) {
      console.error('Get all devices failed:', error);
      throw error;
    }
  }

  resetConnectionAttempts(deviceAddress: string): void {
    this.connectionAttempts.delete(deviceAddress);
  }

  getConnectionInfo(): { isConnected: boolean; device: BluetoothDevice | null } {
    return {
      isConnected: this.isConnected,
      device: this.currentDevice
    };
  }

  getElmVersion(): string {
    return this.elmVersion;
  }

  getProtocol(): string {
    return this.selectedProtocol;
  }

  setProtocol(protocol: string): void {
    if (protocol in this.protocols) {
      this.selectedProtocol = protocol;
      console.log(`Protocol set to: ${this.protocols[protocol as keyof typeof this.protocols].name}`);
    } else {
      console.warn(`Invalid protocol: ${protocol}`);
    }
  }

  getAvailableProtocols(): { [key: string]: { name: string; successRate: number } } {
    return this.protocols;
  }

  async checkConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!window.bluetoothSerial) {
        this.isConnected = false;
        resolve(false);
        return;
      }

      window.bluetoothSerial.isConnected(
        () => {
          this.isConnected = true;
          resolve(true);
        },
        () => {
          this.isConnected = false;
          this.currentDevice = null;
          resolve(false);
        }
      );
    });
  }
}

export const enhancedBluetoothService = new EnhancedBluetoothService();
