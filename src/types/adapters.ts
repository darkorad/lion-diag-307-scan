export interface OBD2Adapter {
  id: string;
  name: string;
  brand: string;
  model: string;
  connectionType: 'bluetooth' | 'wifi' | 'usb';
  image?: string;
  description: string;
  features: string[];
  compatibility: string[];
  price?: string;
  defaultPin?: string;
  defaultIP?: string;
  defaultPort?: number;
}

export interface ConnectionConfig {
  adapterId: string;
  connectionType: 'bluetooth' | 'wifi' | 'usb';
  address?: string; // Bluetooth MAC or WiFi IP
  port?: number; // WiFi port
  pin?: string; // Bluetooth PIN
  timeout?: number;
}