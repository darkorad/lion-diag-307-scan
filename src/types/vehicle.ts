
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

export interface VehicleEngine {
  id: string;
  name: string;
  displacement: string;
  fuelType: string;
  power: {
    hp: number;
    kw: number;
  };
  engineCode: string;
  emissionStandard: string;
  supportedPids: {
    standard: string[];
    manufacturer: string[];
    dpf?: string[];
  };
  pidMappings: {
    [key: string]: string;
  };
  specificParameters: {
    [key: string]: any;
  };
}

export interface VehicleGeneration {
  id: string;
  name: string;
  yearRange: {
    start: number;
    end: number;
  };
  bodyTypes: string[];
  engines: VehicleEngine[];
}

export interface VehicleModel {
  id: string;
  name: string;
  generations: VehicleGeneration[];
}

export interface VehicleMake {
  id: string;
  name: string;
  country: string;
  logo: string;
  models: VehicleModel[];
}
