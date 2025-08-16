
import { BluetoothDevice } from './MasterBluetoothService';
import { ConnectionStateManager, ConnectionState, ConnectionHistory } from './bluetooth/ConnectionState';
import { HeartbeatManager } from './bluetooth/HeartbeatManager';

export class BluetoothConnectionManager {
  private static instance: BluetoothConnectionManager;
  private stateManager = new ConnectionStateManager();
  private heartbeatManager = new HeartbeatManager();

  static getInstance(): BluetoothConnectionManager {
    if (!BluetoothConnectionManager.instance) {
      BluetoothConnectionManager.instance = new BluetoothConnectionManager();
    }
    return BluetoothConnectionManager.instance;
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

  initialize(): void {
    this.stateManager.loadConnectionHistory();
    console.log('Bluetooth Connection Manager initialized');
  }

  async refreshConnectionState(): Promise<void> {
    // Implementation for refreshing connection state
    console.log('Refreshing connection state...');
  }
}

export const bluetoothConnectionManager = BluetoothConnectionManager.getInstance();
export type { ConnectionState, ConnectionHistory };
