
export interface OBD2Adapter {
  id: string;
  name: string;
  brand: string;
  model: string;
  connectionType: 'bluetooth' | 'wifi' | 'usb';
  description: string;
  features: string[];
  compatibility: string[];
  price: string;
  defaultPin?: string;
  defaultIP?: string;
  defaultPort?: string;
  autoDetectPatterns?: string[];
  capabilities?: {
    realTimeData: boolean;
    biDirectional: boolean;
    coding: boolean;
    serviceReset: boolean;
    advancedDiagnostics: boolean;
  };
}

export interface AdapterDetectionResult {
  detected: boolean;
  adapter?: OBD2Adapter;
  connectionInfo?: {
    protocol: string;
    version: string;
    features: string[];
  };
}
