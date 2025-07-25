export interface VehicleProfile {
  id: string;
  make: string;
  model: string;
  year: number;
  engine: string;
  fuel: string;
  displayName: string;
  vinPatterns: string[];
  supportedPids: {
    standard: string[];
    manufacturer: string[];
    dpf?: string[];
  };
  pidMappings: {
    [key: string]: string;
  };
  specificParameters: {
    [key: string]: unknown;
  };
}

export interface VehicleInfo {
  vin?: string;
  profile?: VehicleProfile;
  detectedMake?: string;
  detectedModel?: string;
  isAutoDetected: boolean;
}

export interface VehicleSelectionState {
  selectedProfile: VehicleProfile | null;
  detectedProfile: VehicleProfile | null;
  availableProfiles: VehicleProfile[];
  isDetecting: boolean;
  manualSelection: boolean;
}