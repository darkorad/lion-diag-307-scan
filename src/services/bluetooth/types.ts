export interface BluetoothDevice {
  id: string;
  address: string;
  name: string;
  isPaired: boolean;
  isConnected: boolean;
  deviceType: 'ELM327' | 'OBD2' | 'Generic';
  compatibility: number;
  rssi?: number;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ConnectionResult {
  success: boolean;
  device?: BluetoothDevice;
  error?: string;
  strategy?: string;
  connectionTime?: number;
}

export interface ConnectionStatus {
  isConnected: boolean;
  device?: BluetoothDevice;
  lastConnected?: Date;
  quality?: string;
}

export interface ConnectionHistory {
  deviceName: string;
  deviceId: string;
  connectionTime: number;
  success: boolean;
  dataReceived?: boolean;
}
