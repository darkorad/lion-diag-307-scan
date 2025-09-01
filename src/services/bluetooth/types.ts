
export interface BluetoothDevice {
  id: string;
  address: string;
  name: string;
  isPaired: boolean;
  isConnected: boolean;
  deviceType: 'ELM327' | 'OBD2' | 'Generic';
  compatibility: number;
  rssi?: number;
}

export interface ConnectionResult {
  success: boolean;
  device?: BluetoothDevice;
  error?: string;
  strategy?: string;
  message?: string;
  recoverable?: boolean;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ScanResult {
  devices: BluetoothDevice[];
  success: boolean;
  error?: string;
}

export interface CommandResult {
  success: boolean;
  response?: string;
  error?: string;
}

export interface ConnectionHistory {
  deviceId: string;
  timestamp: Date;
  success: boolean;
  error?: string;
}
