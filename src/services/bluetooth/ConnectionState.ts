
import { BluetoothDevice } from '../MasterBluetoothService';

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

export class ConnectionStateManager {
  private connectionState: ConnectionState = {
    isConnected: false,
    device: null,
    connectionTime: null,
    lastSeen: null,
    connectionQuality: null
  };
  
  private connectionHistory: ConnectionHistory[] = [];
  private listeners: Set<(state: ConnectionState) => void> = new Set();

  subscribe(listener: (state: ConnectionState) => void): () => void {
    this.listeners.add(listener);
    listener(this.connectionState);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.connectionState);
      } catch (error) {
        console.error('Error notifying connection state listener:', error);
      }
    });
  }

  setConnected(device: BluetoothDevice): void {
    const now = Date.now();
    
    this.connectionState = {
      isConnected: true,
      device,
      connectionTime: now,
      lastSeen: now,
      connectionQuality: 'good'
    };
    
    this.notifyListeners();
    this.saveConnectionState();
  }

  setDisconnected(): void {
    if (this.connectionState.isConnected && this.connectionState.device) {
      this.addToHistory(this.connectionState.device, true, true);
    }
    
    this.connectionState = {
      isConnected: false,
      device: null,
      connectionTime: null,
      lastSeen: null,
      connectionQuality: null
    };
    
    this.notifyListeners();
    this.clearConnectionState();
  }

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

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  isConnected(): boolean {
    return this.connectionState.isConnected;
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.connectionState.device;
  }

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
    
    if (this.connectionHistory.length > 50) {
      this.connectionHistory = this.connectionHistory.slice(0, 50);
    }
    
    this.saveConnectionHistory();
  }

  getConnectionHistory(): ConnectionHistory[] {
    return [...this.connectionHistory];
  }

  clearConnectionHistory(): void {
    this.connectionHistory = [];
    try {
      localStorage.removeItem('obd2_connection_history');
    } catch (error) {
      console.warn('Failed to clear connection history:', error);
    }
  }

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

  private clearConnectionState(): void {
    try {
      localStorage.removeItem('obd2_connection_state');
    } catch (error) {
      console.warn('Failed to clear connection state:', error);
    }
  }

  private saveConnectionHistory(): void {
    try {
      localStorage.setItem('obd2_connection_history', JSON.stringify(this.connectionHistory));
    } catch (error) {
      console.warn('Failed to save connection history:', error);
    }
  }

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
}
