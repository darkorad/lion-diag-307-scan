import { PluginListenerHandle } from '@capacitor/core';

export interface BluetoothDevice {
  name: string;
  address: string;
  rssi?: number;
  bonded?: boolean;
}

export interface BluetoothStatus {
  supported: boolean;
  enabled: boolean;
}

export interface DiscoveryResult {
  devices: BluetoothDevice[];
  count: number;
}

export interface SimpleBluetoothScannerPlugin {
  /**
   * Check Bluetooth status (supported and enabled)
   */
  checkBluetoothStatus(): Promise<BluetoothStatus>;

  /**
   * Enable Bluetooth if not already enabled
   */
  enableBluetooth(): Promise<{ requested: boolean; message: string }>;

  /**
   * Start scanning for Bluetooth devices
   */
  startScan(): Promise<{ success: boolean; message: string }>;

  /**
   * Stop scanning for Bluetooth devices
   */
  stopScan(): Promise<{ success: boolean; message: string }>;

  /**
   * Get list of paired devices
   */
  getPairedDevices(): Promise<DiscoveryResult>;

  /**
   * Pair with a device
   */
  pairDevice(options: { address: string }): Promise<{ success: boolean; message: string }>;

  /**
   * Add listener for device discovery events
   */
  addListener(
    eventName: 'deviceDiscovered',
    listenerFunc: (device: BluetoothDevice) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;

  /**
   * Add listener for scan start events
   */
  addListener(
    eventName: 'scanStarted',
    listenerFunc: () => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;

  /**
   * Add listener for scan finish events
   */
  addListener(
    eventName: 'scanFinished',
    listenerFunc: (result: DiscoveryResult) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;

  /**
   * Remove all listeners
   */
  removeAllListeners(): Promise<void>;
}