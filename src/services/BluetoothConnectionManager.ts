import { BluetoothDevice } from '@/services/MasterBluetoothService';

export interface ConnectionState {
  isConnected: boolean;
  device: BluetoothDevice | null;
  connectionTime: number | null;
  lastSeen: number | null;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | null;
}

export interface ConnectionHistory {
  deviceId: string;
  deviceName: string;
  connectionTime: number;
  disconnectionTime: number | null;
  duration: number;
  success: boolean;
  dataReceived: boolean;
}

export class BluetoothConnectionManager {
  private static instance: BluetoothConnectionManager;
  private connectionState: ConnectionState = {
    isConnected: false,
    device: null,
    connectionTime: null,
    lastSeen: null,
    connectionQuality: null
  };
  
  private connectionHistory: ConnectionHistory[] = [];
  private listeners: Set<(state: ConnectionState) => void> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat: number = 0;

  static getInstance(): BluetoothConnectionManager {
    if (!BluetoothConnectionManager.instance) {
      BluetoothConnectionManager.instance = new BluetoothConnectionManager();
    }
    return BluetoothConnectionManager.instance;
  }

  // Subscribe to connection state changes
  subscribe(listener: (state: ConnectionState) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.connectionState);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners of state changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.connectionState));
  }

  // Set connection state (called by bluetooth services)
  setConnected(device: BluetoothDevice): void {
    const now = Date.now();
    
    this.connectionState = {
      isConnected: true,
      device,
      connectionTime: now,
      lastSeen: now,
      connectionQuality: 'good'
    };
    
    this.startHeartbeat();
    this.notifyListeners();
    
    console.log('Connection manager: Device connected', device.name);
    
    // Save to localStorage for persistence
    this.saveConnectionState();
  }

  // Set disconnected state
  setDisconnected(): void {
    if (this.connectionState.isConnected && this.connectionState.device) {
      // Add to history
      this.addToHistory(this.connectionState.device, true, true);
    }
    
    this.connectionState = {
      isConnected: false,
      device: null,
      connectionTime: null,
      lastSeen: null,
      connectionQuality: null
    };
    
    this.stopHeartbeat();
    this.notifyListeners();
    
    console.log('Connection manager: Device disconnected');
    
    // Clear from localStorage
    this.clearConnectionState();
  }

  // Update connection quality based on communication
  updateConnectionQuality(latency: number, success: boolean): void {
    if (!this.connectionState.isConnected) return;
    
    this.connectionState.lastSeen = Date.now();
    
    if (success) {
      if (latency < 500) {
        this.connectionState.connectionQuality = 'excellent';
      } else if (latency < 1000) {
        this.connectionState.connectionQuality = 'good';
      } else if (latency < 2000) {
        this.connectionState.connectionQuality = 'fair';
      } else {
        this.connectionState.connectionQuality = 'poor';
      }
    } else {
      this.connectionState.connectionQuality = 'poor';
    }
    
    this.notifyListeners();
  }

  // Get current connection state
  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  // Check if connected (used by other services)
  isConnected(): boolean {
    return this.connectionState.isConnected;
  }

  // Get connected device
  getConnectedDevice(): BluetoothDevice | null {
    return this.connectionState.device;
  }

  // Start heartbeat to monitor connection
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(async () => {
      if (!this.connectionState.isConnected) {
        this.stopHeartbeat();
        return;
      }
      
      try {
        // Test connection with a simple command
        const startTime = Date.now();
        await this.testConnection();
        const latency = Date.now() - startTime;
        
        this.updateConnectionQuality(latency, true);
        this.lastHeartbeat = Date.now();
        
      } catch (error) {
        console.warn('Heartbeat failed:', error);
        this.updateConnectionQuality(5000, false);
        
        // If we haven't had a successful heartbeat in 30 seconds, consider disconnected
        if (Date.now() - this.lastHeartbeat > 30000) {
          console.error('Connection lost - no heartbeat for 30 seconds');
          this.setDisconnected();
        }
      }
    }, 10000); // Check every 10 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Test connection with OBD2 device
  private async testConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.bluetoothSerial) {
        reject(new Error('Bluetooth not available'));
        return;
      }

      // Send simple AT command to test connection
      window.bluetoothSerial.write('ATI\r', 
        () => {
          // Wait for response
          setTimeout(() => {
            window.bluetoothSerial.read(
              (data) => {
                if (data && data.length > 0) {
                  resolve();
                } else {
                  reject(new Error('No response'));
                }
              },
              () => reject(new Error('Read failed'))
            );
          }, 100);
        },
        () => reject(new Error('Write failed'))
      );
    });
  }

  // Add connection to history
  private addToHistory(device: BluetoothDevice, success: boolean, dataReceived: boolean): void {
    const now = Date.now();
    const duration = this.connectionState.connectionTime ? now - this.connectionState.connectionTime : 0;
    
    const historyEntry: ConnectionHistory = {
      deviceId: device.address,
      deviceName: device.name,
      connectionTime: this.connectionState.connectionTime || now,
      disconnectionTime: now,
      duration,
      success,
      dataReceived
    };
    
    this.connectionHistory.unshift(historyEntry);
    
    // Keep only last 50 entries
    if (this.connectionHistory.length > 50) {
      this.connectionHistory = this.connectionHistory.slice(0, 50);
    }
    
    // Save to localStorage
    this.saveConnectionHistory();
  }

  // Get connection history
  getConnectionHistory(): ConnectionHistory[] {
    return [...this.connectionHistory];
  }

  // Clear connection history
  clearConnectionHistory(): void {
    this.connectionHistory = [];
    localStorage.removeItem('obd2_connection_history');
  }

  // Save connection state to localStorage
  private saveConnectionState(): void {
    try {
      const state = {
        isConnected: this.connectionState.isConnected,
        device: this.connectionState.device,
        connectionTime: this.connectionState.connectionTime
      };
      localStorage.setItem('obd2_connection_state', JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save connection state:', error);
    }
  }

  // Clear connection state from localStorage
  private clearConnectionState(): void {
    localStorage.removeItem('obd2_connection_state');
  }

  // Save connection history to localStorage
  private saveConnectionHistory(): void {
    try {
      localStorage.setItem('obd2_connection_history', JSON.stringify(this.connectionHistory));
    } catch (error) {
      console.warn('Failed to save connection history:', error);
    }
  }

  // Load connection history from localStorage
  loadConnectionHistory(): void {
    try {
      const stored = localStorage.getItem('obd2_connection_history');
      if (stored) {
        this.connectionHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load connection history:', error);
      this.connectionHistory = [];
    }
  }

  // Initialize manager (call on app start)
  initialize(): void {
    this.loadConnectionHistory();
    console.log('Bluetooth Connection Manager initialized');
  }

  // Force refresh connection state (for manual sync)
  async refreshConnectionState(): Promise<void> {
    if (!window.bluetoothSerial) return;

    try {
      // Check if bluetooth serial thinks we're connected
      await this.testConnection();
      
      if (!this.connectionState.isConnected) {
        console.log('Found active connection, syncing state...');
        // We have an active connection but our state doesn't reflect it
        // This shouldn't happen with proper state management, but we can recover
      }
    } catch (error) {
      if (this.connectionState.isConnected) {
        console.log('Connection test failed, updating state...');
        this.setDisconnected();
      }
    }
  }
}

export const bluetoothConnectionManager = BluetoothConnectionManager.getInstance();
