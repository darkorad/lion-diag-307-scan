
import { registerPlugin } from '@capacitor/core';

export interface CapBluetoothPlugin {
  ensureEnabled(): Promise<{ enabled: boolean }>;
  startDiscovery(): Promise<void>;
  stopDiscovery(): Promise<void>;
  pair(options: { address: string }): Promise<void>;
  connectSpp(options: { address: string }): Promise<void>;
  sendCommand(options: { command: string }): Promise<{ response: string }>;
  disconnect(): Promise<void>;
  
  addListener(eventName: 'deviceFound', listenerFunc: (event: {
    name: string;
    address: string;
    bonded: boolean;
    rssi: number;
  }) => void): Promise<void>;
  
  addListener(eventName: 'discoveryFinished', listenerFunc: () => void): Promise<void>;
  
  addListener(eventName: 'error', listenerFunc: (event: {
    message: string;
  }) => void): Promise<void>;
  
  addListener(eventName: 'pairing', listenerFunc: (event: {
    state: 'bonding' | 'bonded' | 'none';
  }) => void): Promise<void>;
  
  addListener(eventName: 'connected', listenerFunc: (event: {
    address: string;
  }) => void): Promise<void>;
  
  addListener(eventName: 'disconnected', listenerFunc: (event: {
    address: string;
  }) => void): Promise<void>;

  removeAllListeners(): Promise<void>;
}

export const CapBluetooth = registerPlugin<CapBluetoothPlugin>('CapBluetooth');
