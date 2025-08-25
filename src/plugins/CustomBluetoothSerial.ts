
// Plugin interface for the CustomBluetoothSerial Capacitor plugin
export interface CustomBluetoothSerialPlugin {
  isEnabled(): Promise<{ enabled: boolean }>;
  requestEnable(): Promise<{ enabled: boolean }>;
  getState(): Promise<{ state: string }>;
  
  requestPermissions(): Promise<{ granted: boolean }>;
  checkPermissions(): Promise<{ granted: boolean }>;
  
  startDiscovery(): Promise<{ success: boolean }>;
  stopDiscovery(): Promise<{ success: boolean }>;
  isDiscovering(): Promise<{ discovering: boolean }>;
  
  getBondedDevices(): Promise<{ devices: any[] }>;
  createBond(options: { address: string }): Promise<{ success: boolean }>;
  
  connect(options: { address: string; uuid?: string }): Promise<{ success: boolean }>;
  disconnect(): Promise<{ success: boolean }>;
  isConnected(): Promise<{ connected: boolean }>;
  
  write(options: { data: string }): Promise<{ success: boolean }>;
  read(): Promise<{ data: string }>;
  
  addListener(eventName: string, callback: (data: any) => void): Promise<void>;
  removeAllListeners(): Promise<void>;
}

// Register the plugin with Capacitor
import { registerPlugin } from '@capacitor/core';

export const CustomBluetoothSerial = registerPlugin<CustomBluetoothSerialPlugin>('CustomBluetoothSerial');
