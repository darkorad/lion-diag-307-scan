
import { BluetoothDevice } from './MasterBluetoothService';
import { ConnectionStateManager, ConnectionState, ConnectionHistory } from './bluetooth/ConnectionState';
import { HeartbeatManager } from './bluetooth/HeartbeatManager';
import { unifiedBluetoothService } from './UnifiedBluetoothService';

export class BluetoothConnectionManager {
  private static instance: BluetoothConnectionManager;
  private stateManager = new ConnectionStateManager();
  private heartbeatManager = new HeartbeatManager();
  private isInitialized = false;

  static getInstance(): BluetoothConnectionManager {
    if (!BluetoothConnectionManager.instance) {
      BluetoothConnectionManager.instance = new BluetoothConnectionManager();
    }
    return BluetoothConnectionManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing Bluetooth Connection Manager...');
      this.stateManager.loadConnectionHistory();
      this.isInitialized = true;
      console.log('Bluetooth Connection Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Bluetooth Connection Manager:', error);
    }
  }

  subscribe(listener: (state: ConnectionState) => void): () => void {
    return this.stateManager.subscribe(listener);
  }

  setConnected(device: BluetoothDevice): void {
    this.stateManager.setConnected(device);
    
    this.heartbeatManager.startHeartbeat(
      (latency) => this.stateManager.updateConnectionQuality(latency, true),
      () => this.stateManager.updateConnectionQuality(5000, false)
    );
    
    console.log('Connection manager: Device connected', device.name);
  }

  setDisconnected(): void {
    this.heartbeatManager.stopHeartbeat();
    this.stateManager.setDisconnected();
    console.log('Connection manager: Device disconnected');
  }

  updateConnectionQuality(latency: number, success: boolean): void {
    this.stateManager.updateConnectionQuality(latency, success);
  }

  getConnectionState(): ConnectionState {
    return this.stateManager.getConnectionState();
  }

  isConnected(): boolean {
    return this.stateManager.isConnected();
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.stateManager.getConnectedDevice();
  }

  getConnectionHistory(): ConnectionHistory[] {
    return this.stateManager.getConnectionHistory();
  }

  clearConnectionHistory(): void {
    this.stateManager.clearConnectionHistory();
  }

  async refreshConnectionState(): Promise<void> {
    try {
      console.log('Refreshing connection state...');
      // Use safe bluetooth service to check actual connection status
      const status = unifiedBluetoothService.getConnectionStatus();
      
      if (status.isConnected && status.device) {
        this.setConnected(status.device);
      } else {
        this.setDisconnected();
      }
    } catch (error) {
      console.error('Failed to refresh connection state:', error);
    }
  }
}

export const bluetoothConnectionManager = BluetoothConnectionManager.getInstance();
export type { ConnectionState, ConnectionHistory };
