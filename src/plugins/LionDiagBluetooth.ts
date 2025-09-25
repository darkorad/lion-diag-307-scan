import { PluginListenerHandle } from '@capacitor/core';

export interface BluetoothDevice {
  name?: string;
  address: string;
  bondState?: number;
}

export interface LionDiagBluetoothPlugin {
  initialize(): Promise<void>;
  enableBluetooth(): Promise<{ enabled: boolean }>;
  startDiscovery(): Promise<void>;
  stopDiscovery(): Promise<void>;
  pairDevice(options: { address: string }): Promise<void>;
  connectToDevice(options: { address: string }): Promise<void>;
  disconnectDevice(): Promise<void>;
  sendCommand(options: { command: string }): Promise<void>;
  isConnected(): Promise<{ connected: boolean }>;
  
  addListener(
    eventName: 'deviceFound',
    listenerFunc: (device: BluetoothDevice) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  
  addListener(
    eventName: 'discoveryFinished',
    listenerFunc: () => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  
  addListener(
    eventName: 'pairingStarted',
    listenerFunc: (data: { address: string }) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  
  addListener(
    eventName: 'pairingSuccess',
    listenerFunc: (data: { address: string }) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  
  addListener(
    eventName: 'pairingFailed',
    listenerFunc: (data: { address: string; error: string }) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  
  addListener(
    eventName: 'deviceConnected',
    listenerFunc: (data: { address: string }) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  
  addListener(
    eventName: 'connectionFailed',
    listenerFunc: (data: { address: string; error: string }) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  
  addListener(
    eventName: 'dataReceived',
    listenerFunc: (data: { data: string }) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  
  removeAllListeners(): Promise<void>;
}