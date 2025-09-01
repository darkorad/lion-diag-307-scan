
export interface VehicleModule {
  id: string;
  name: string;
  description: string;
  category: 'engine' | 'transmission' | 'abs' | 'airbag' | 'climate' | 'body' | 'comfort' | 'security';
  supportedFunctions: ModuleFunction[];
  ecuAddress?: string;
  protocols: string[];
  makeSpecific?: string[];
}

export interface ModuleFunction {
  id: string;
  name: string;
  type: 'read' | 'write' | 'actuator' | 'calibration' | 'coding' | 'adaptation';
  description: string;
  command?: string;
  parameters?: { [key: string]: any };
  requiredLevel?: 'basic' | 'advanced' | 'dealer';
}

export interface DiagnosticCapabilities {
  basicOBD2: boolean;
  manufacturerSpecific: boolean;
  biDirectionalControls: boolean;
  coding: boolean;
  programming: boolean;
  calibration: boolean;
  serviceResets: boolean;
  liveData: boolean;
  graphing: boolean;
  dataLogging: boolean;
  vinDecoding: boolean;
  ecuFlashing?: boolean;
}
