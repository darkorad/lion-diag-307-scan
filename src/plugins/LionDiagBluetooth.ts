import { registerPlugin } from '@capacitor/core';

export interface BluetoothDevice {
  name: string;
  address: string;
  type: number;
  bonded: boolean;
  rssi?: number;
  compatibility: number;
}

export interface BluetoothStatus {
  supported: boolean;
  enabled: boolean;
  hasPermissions: boolean;
}

export interface PermissionResult {
  granted: boolean;
  message: string;
}

export interface DiscoveryResult {
  devices: BluetoothDevice[];
  count: number;
}

export interface ConnectionResult {
  success: boolean;
  device?: string;
  address?: string;
  connected: boolean;
  message?: string;
}

export interface CommandResult {
  success: boolean;
  command: string;
  response: string;
  timestamp: number;
}

export interface LionDiagBluetoothPlugin {
  /**
   * Check Bluetooth status and permissions
   */
  checkBluetoothStatus(): Promise<BluetoothStatus>;

  /**
   * Request all required Bluetooth permissions
   */
  requestPermissions(): Promise<PermissionResult>;

  /**
   * Enable Bluetooth if not enabled
   */
  enableBluetooth(): Promise<{ requested: boolean; message: string }>;

  /**
   * Start device discovery/scanning
   */
  startDiscovery(): Promise<{ success: boolean; message: string }>;

  /**
   * Stop device discovery
   */
  stopDiscovery(): Promise<{ success: boolean; message: string }>;

  /**
   * Get paired/bonded devices
   */
  getPairedDevices(): Promise<DiscoveryResult>;

  /**
   * Pair with a device
   */
  pairDevice(options: { address: string }): Promise<ConnectionResult>;

  /**
   * Connect to a device
   */
  connectToDevice(options: { address: string }): Promise<ConnectionResult>;

  /**
   * Disconnect from current device
   */
  disconnect(): Promise<{ success: boolean; message: string }>;

  /**
   * Check connection status
   */
  isConnected(): Promise<ConnectionResult>;

  /**
   * Send OBD2 command to connected device
   */
  sendCommand(options: { command: string; timeout?: number }): Promise<CommandResult>;

  /**
   * Initialize ELM327 adapter with optimal settings
   */
  initializeELM327(): Promise<{ success: boolean; message: string; responses: string }>;

  // Event listeners
  addListener(
    eventName: 'deviceFound',
    listenerFunc: (device: BluetoothDevice) => void,
  ): Promise<void>;

  addListener(
    eventName: 'discoveryStarted',
    listenerFunc: () => void,
  ): Promise<void>;

  addListener(
    eventName: 'discoveryFinished',
    listenerFunc: (result: DiscoveryResult) => void,
  ): Promise<void>;

  addListener(
    eventName: 'discoveryError',
    listenerFunc: (error: { error: string }) => void,
  ): Promise<void>;

  addListener(
    eventName: 'pairingState',
    listenerFunc: (state: { state: string; device: string }) => void,
  ): Promise<void>;

  addListener(
    eventName: 'connectionState',
    listenerFunc: (state: { state: string; device: string }) => void,
  ): Promise<void>;

  addListener(
    eventName: 'connected',
    listenerFunc: (result: ConnectionResult) => void,
  ): Promise<void>;

  addListener(
    eventName: 'disconnected',
    listenerFunc: (result: { device: string; connected: boolean }) => void,
  ): Promise<void>;

  removeAllListeners(): Promise<void>;
}

export const LionDiagBluetooth = registerPlugin<LionDiagBluetoothPlugin>('BluetoothPlugin');
