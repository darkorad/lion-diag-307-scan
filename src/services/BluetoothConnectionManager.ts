import { BluetoothDevice } from '@/services/MasterBluetoothService';
import {
  ConnectionError,
  BluetoothNotAvailableError,
  ConnectionFailedError,
  NoDataReceivedError,
  handleError
} from './connection-errors';
import { obd2Service } from './OBD2Service';

export interface ConnectionState {
  isConnected: boolean;
  device: BluetoothDevice | null;
  connectionTime: number | null;
  lastSeen: number | null;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | null;
  error: ConnectionError | null;
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
    connectionQuality: null,
    error: null,
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

  subscribe(listener: (state: ConnectionState) => void): () => void {
    this.listeners.add(listener);
    listener(this.connectionState);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.connectionState));
  }

  setConnected(device: BluetoothDevice): void {
    const now = Date.now();
    
    this.connectionState = {
      isConnected: true,
      device,
      connectionTime: now,
      lastSeen: now,
      connectionQuality: 'good',
      error: null,
    };
    
    this.startHeartbeat();
    this.notifyListeners();
    this.saveConnectionState();
  }

  setDisconnected(error?: ConnectionError): void {
    if (this.connectionState.isConnected && this.connectionState.device) {
      this.addToHistory(this.connectionState.device, !error, !!error);
    }
    
    this.connectionState = {
      ...this.connectionState,
      isConnected: false,
      connectionTime: null,
      connectionQuality: null,
      error: error || null,
    };
    
    this.stopHeartbeat();
    this.notifyListeners();
    this.clearConnectionState();
  }

  updateConnectionQuality(latency: number, success: boolean): void {
    if (!this.connectionState.isConnected) return;
    
    this.connectionState.lastSeen = Date.now();
    
    if (success) {
      if (latency < 250) this.connectionState.connectionQuality = 'excellent';
      else if (latency < 750) this.connectionState.connectionQuality = 'good';
      else this.connectionState.connectionQuality = 'fair';
    } else {
      this.connectionState.connectionQuality = 'poor';
    }
    
    this.notifyListeners();
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(async () => {
      if (!this.connectionState.isConnected) {
        this.stopHeartbeat();
        return;
      }
      
      try {
        const startTime = Date.now();
        await obd2Service.sendCommandPublic('ATI'); // Simple command
        const latency = Date.now() - startTime;
        
        this.updateConnectionQuality(latency, true);
        this.lastHeartbeat = Date.now();
        
      } catch (error) {
        console.warn('Heartbeat failed:', error);
        this.updateConnectionQuality(2000, false);
        
        if (Date.now() - this.lastHeartbeat > 20000) {
          this.setDisconnected(new ConnectionFailedError('Device', 'Connection lost'));
        }
      }
    }, 5000); // Check every 5 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
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
    
    if (this.connectionHistory.length > 20) {
      this.connectionHistory = this.connectionHistory.slice(0, 20);
    }
    
    this.saveConnectionHistory();
  }

  getConnectionHistory(): ConnectionHistory[] {
    return [...this.connectionHistory];
  }

  clearConnectionHistory(): void {
    this.connectionHistory = [];
    localStorage.removeItem('obd2_connection_history');
    this.notifyListeners(); // To update UI
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
    localStorage.removeItem('obd2_connection_state');
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

  initialize(): void {
    this.loadConnectionHistory();
  }

  async refreshConnectionState(): Promise<void> {
    if (!obd2Service.isDeviceConnected()) {
      if (this.connectionState.isConnected) {
        this.setDisconnected();
      }
      return;
    }

    try {
      await obd2Service.sendCommandPublic('ATI');
    } catch (error) {
      this.setDisconnected(handleError(error));
    }
  }
}

export const bluetoothConnectionManager = BluetoothConnectionManager.getInstance();
