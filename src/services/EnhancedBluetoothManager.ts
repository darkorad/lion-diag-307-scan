
import { enhancedBluetoothService, BluetoothDevice } from '@/obd2/enhanced-bluetooth-service';

export interface ConnectionHealth {
  signalStrength: number;
  latency: number;
  errorRate: number;
  lastSeen: Date;
  isStable: boolean;
}

export class EnhancedBluetoothManager {
  private currentDevice: BluetoothDevice | null = null;
  private connectionHealth: ConnectionHealth | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private knownGoodDevices: Set<string> = new Set();
  private blacklistedDevices: Set<string> = new Set();

  constructor() {
    this.loadDeviceHistory();
  }

  // Enhanced device discovery with better filtering
  async discoverDevicesEnhanced(): Promise<BluetoothDevice[]> {
    console.log('Starting enhanced device discovery...');
    
    try {
      // Get both paired and discoverable devices
      const allDevices = await enhancedBluetoothService.getAllDevices();
      
      // Filter and rank devices
      const rankedDevices = this.rankDevices(allDevices);
      
      console.log('Device discovery completed, found:', rankedDevices.length);
      return rankedDevices;
    } catch (error) {
      console.error('Enhanced discovery failed:', error);
      throw error;
    }
  }

  // Rank devices by likelihood of being good OBD2 adapters
  private rankDevices(devices: BluetoothDevice[]): BluetoothDevice[] {
    return devices
      .filter(device => !this.blacklistedDevices.has(device.address))
      .sort((a, b) => {
        let scoreA = this.calculateDeviceScore(a);
        let scoreB = this.calculateDeviceScore(b);
        
        // Boost score for known good devices
        if (this.knownGoodDevices.has(a.address)) scoreA += 100;
        if (this.knownGoodDevices.has(b.address)) scoreB += 100;
        
        return scoreB - scoreA;
      });
  }

  private calculateDeviceScore(device: BluetoothDevice): number {
    let score = 0;
    const name = device.name.toLowerCase();
    
    // High confidence OBD2 indicators
    if (name.includes('elm327')) score += 50;
    if (name.includes('obd')) score += 40;
    if (name.includes('vgate')) score += 45;
    if (name.includes('viecar')) score += 45;
    if (name.includes('konnwei')) score += 40;
    if (name.includes('autel')) score += 35;
    if (name.includes('foxwell')) score += 35;
    
    // Medium confidence indicators
    if (name.includes('bluetooth')) score += 20;
    if (name.includes('scan')) score += 25;
    if (name.includes('diagnostic')) score += 30;
    if (name.includes('v1.5') || name.includes('v2.1')) score += 15;
    
    // Paired devices get bonus
    if (device.isPaired) score += 30;
    
    // Signal strength bonus
    if (device.rssi && device.rssi > -60) score += 10;
    
    return score;
  }

  // Smart connection with fallback strategies
  async smartConnect(device: BluetoothDevice): Promise<void> {
    console.log(`Attempting smart connection to ${device.name}...`);
    
    try {
      // Pre-connection checks
      await this.preConnectionChecks();
      
      // Attempt connection with multiple strategies
      await this.attemptConnectionWithStrategies(device);
      
      // Post-connection setup
      await this.postConnectionSetup(device);
      
      // Mark as known good device
      this.knownGoodDevices.add(device.address);
      this.saveDeviceHistory();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      console.log('Smart connection successful');
    } catch (error) {
      console.error('Smart connection failed:', error);
      this.handleConnectionFailure(device, error);
      throw error;
    }
  }

  private async preConnectionChecks(): Promise<void> {
    // Ensure Bluetooth is enabled
    const isEnabled = await enhancedBluetoothService.checkBluetoothStatus();
    if (!isEnabled) {
      throw new Error('Bluetooth is not enabled');
    }
    
    // Disconnect any existing connection
    if (enhancedBluetoothService.getConnectionInfo().isConnected) {
      await enhancedBluetoothService.disconnect();
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  private async attemptConnectionWithStrategies(device: BluetoothDevice): Promise<void> {
    const strategies = [
      { name: 'insecure', timeout: 15000 },
      { name: 'secure', timeout: 20000 },
      { name: 'insecure_retry', timeout: 25000 }
    ];

    for (const strategy of strategies) {
      try {
        console.log(`Trying ${strategy.name} connection...`);
        
        await Promise.race([
          enhancedBluetoothService.connectToDevice(device),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), strategy.timeout)
          )
        ]);
        
        console.log(`Connection successful with ${strategy.name}`);
        return;
      } catch (error) {
        console.warn(`${strategy.name} failed:`, error);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    throw new Error('All connection strategies failed');
  }

  private async postConnectionSetup(device: BluetoothDevice): Promise<void> {
    this.currentDevice = device;
    
    // Initialize ELM327 with extended timeout and retries
    let initSuccess = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`ELM327 initialization attempt ${attempt}/3...`);
        await enhancedBluetoothService.initializeELM327CarScannerStyle();
        initSuccess = true;
        break;
      } catch (error) {
        console.warn(`Init attempt ${attempt} failed:`, error);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    if (!initSuccess) {
      throw new Error('ELM327 initialization failed after 3 attempts');
    }
    
    // Test basic communication
    await this.testBasicCommunication();
  }

  private async testBasicCommunication(): Promise<void> {
    const testCommands = ['0100', '010C', '010D'];
    let communicationWorking = false;
    
    for (const cmd of testCommands) {
      try {
        const response = await enhancedBluetoothService.sendObdCommand(cmd, 5000);
        if (response && response.length > 4 && !response.includes('NO DATA')) {
          communicationWorking = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    if (!communicationWorking) {
      throw new Error('Vehicle communication test failed');
    }
  }

  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.checkConnectionHealth();
      } catch (error) {
        console.warn('Health check failed:', error);
        this.handleUnhealthyConnection();
      }
    }, 10000); // Check every 10 seconds
  }

  private async checkConnectionHealth(): Promise<void> {
    if (!this.currentDevice) return;
    
    const startTime = Date.now();
    
    try {
      // Quick ping test
      await enhancedBluetoothService.sendObdCommand('0100', 3000);
      
      const latency = Date.now() - startTime;
      
      this.connectionHealth = {
        signalStrength: 100, // Would need RSSI if available
        latency,
        errorRate: 0, // Would track over time
        lastSeen: new Date(),
        isStable: latency < 2000
      };
      
    } catch (error) {
      if (this.connectionHealth) {
        this.connectionHealth.errorRate += 1;
        this.connectionHealth.isStable = false;
      }
      throw error;
    }
  }

  private handleUnhealthyConnection(): void {
    if (this.connectionHealth && !this.connectionHealth.isStable) {
      console.warn('Connection unhealthy, attempting reconnection...');
      this.attemptReconnect();
    }
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    
    try {
      if (this.currentDevice) {
        await enhancedBluetoothService.disconnect();
        await new Promise(resolve => setTimeout(resolve, 3000));
        await this.smartConnect(this.currentDevice);
        this.reconnectAttempts = 0; // Reset on success
      }
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  }

  private handleConnectionFailure(device: BluetoothDevice, error: unknown): void {
    // If device fails multiple times, consider blacklisting temporarily
    const errorStr = String(error).toLowerCase();
    
    if (errorStr.includes('timeout') || errorStr.includes('unreachable')) {
      // Temporary issue, don't blacklist
      return;
    }
    
    if (errorStr.includes('pairing') || errorStr.includes('authentication')) {
      console.warn(`Blacklisting problematic device: ${device.address}`);
      this.blacklistedDevices.add(device.address);
      this.saveDeviceHistory();
    }
  }

  private loadDeviceHistory(): void {
    try {
      const stored = localStorage.getItem('obd2_device_history');
      if (stored) {
        const history = JSON.parse(stored);
        this.knownGoodDevices = new Set(history.knownGood || []);
        this.blacklistedDevices = new Set(history.blacklisted || []);
      }
    } catch (error) {
      console.warn('Failed to load device history:', error);
    }
  }

  private saveDeviceHistory(): void {
    try {
      const history = {
        knownGood: Array.from(this.knownGoodDevices),
        blacklisted: Array.from(this.blacklistedDevices),
        lastUpdated: Date.now()
      };
      localStorage.setItem('obd2_device_history', JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to save device history:', error);
    }
  }

  getConnectionHealth(): ConnectionHealth | null {
    return this.connectionHealth;
  }

  getCurrentDevice(): BluetoothDevice | null {
    return this.currentDevice;
  }

  async disconnect(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    await enhancedBluetoothService.disconnect();
    this.currentDevice = null;
    this.connectionHealth = null;
    this.reconnectAttempts = 0;
  }

  clearBlacklist(): void {
    this.blacklistedDevices.clear();
    this.saveDeviceHistory();
  }
}

export const enhancedBluetoothManager = new EnhancedBluetoothManager();
