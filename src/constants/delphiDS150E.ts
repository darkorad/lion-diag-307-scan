
export interface DelphiAdapter {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  protocols: string[];
  capabilities: string[];
  supportedVehicles: string[];
  maxBaudRate: number;
  canChannels: number;
  features: AdapterFeatures;
}

export interface AdapterFeatures {
  bidirectionalControl: boolean;
  liveDataStreaming: boolean;
  dpfRegeneration: boolean;
  serviceResets: boolean;
  coding: boolean;
  adaptation: boolean;
  actuatorTests: boolean;
  oscilloscope: boolean;
  multimeter: boolean;
  keyProgramming: boolean;
}

export interface DelphiFunction {
  id: string;
  name: string;
  category: string;
  description: string;
  command: string;
  parameters?: any;
  riskLevel: 'low' | 'medium' | 'high';
  requiresKey?: boolean;
  vehicleSupport: string[];
}

export const DELPHI_DS150E: DelphiAdapter = {
  id: 'delphi-ds150e',
  name: 'Delphi DS150E',
  model: 'DS150E',
  manufacturer: 'Delphi',
  protocols: [
    'ISO 9141-2',
    'ISO 14230-4 (KWP2000)',
    'ISO 15765-4 (CAN)',
    'SAE J1850 VPW',
    'SAE J1850 PWM',
    'ISO 11898 (CAN)',
    'SAE J2534',
    'DoIP (Diagnostics over IP)'
  ],
  capabilities: [
    'OBD2 Diagnostics',
    'Manufacturer Specific Diagnostics', 
    'Live Data Streaming',
    'DTC Reading/Clearing',
    'Bi-directional Control',
    'ECU Coding',
    'Service Functions',
    'Actuator Testing',
    'DPF Regeneration',
    'Key Programming',
    'Module Programming',
    'Oscilloscope Function',
    'Multimeter Function',
    'Wiring Diagrams',
    'Technical Service Bulletins'
  ],
  supportedVehicles: [
    'Volkswagen', 'Audi', 'Seat', 'Skoda', 'Porsche',
    'BMW', 'Mercedes-Benz', 'Ford', 'Peugeot', 'Citroen',
    'Renault', 'Opel', 'Fiat', 'Alfa Romeo', 'Lancia',
    'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru',
    'Hyundai', 'Kia', 'Mitsubishi', 'Volvo', 'Saab'
  ],
  maxBaudRate: 500000,
  canChannels: 2,
  features: {
    bidirectionalControl: true,
    liveDataStreaming: true,
    dpfRegeneration: true,
    serviceResets: true,
    coding: true,
    adaptation: true,
    actuatorTests: true,
    oscilloscope: true,
    multimeter: true,
    keyProgramming: true
  }
};

export const DELPHI_FUNCTIONS: DelphiFunction[] = [
  // DPF Functions
  {
    id: 'dpf_force_regen',
    name: 'Force DPF Regeneration',
    category: 'DPF',
    description: 'Force diesel particulate filter regeneration cycle',
    command: '31010F42',
    riskLevel: 'medium',
    vehicleSupport: ['VAG', 'PSA', 'Ford', 'BMW', 'Mercedes']
  },
  {
    id: 'dpf_stationary_regen',
    name: 'Stationary DPF Regeneration',
    category: 'DPF',
    description: 'Perform stationary DPF regeneration with full monitoring',
    command: '31011F42',
    riskLevel: 'medium',
    vehicleSupport: ['VAG', 'PSA']
  },
  {
    id: 'dpf_test_mode',
    name: 'DPF Test Mode',
    category: 'DPF',
    description: 'Enable DPF test mode for diagnostics',
    command: '31012F42',
    riskLevel: 'low',
    vehicleSupport: ['VAG', 'PSA', 'Ford']
  },
  
  // Engine Functions
  {
    id: 'injector_test',
    name: 'Injector Test',
    category: 'Engine',
    description: 'Test fuel injectors individually',
    command: '2F1201',
    riskLevel: 'medium',
    vehicleSupport: ['VAG', 'PSA', 'Ford', 'BMW']
  },
  {
    id: 'egr_test',
    name: 'EGR Valve Test',
    category: 'Engine',
    description: 'Test EGR valve operation',
    command: '2F110E',
    riskLevel: 'low',
    vehicleSupport: ['VAG', 'PSA', 'Ford']
  },
  {
    id: 'turbo_test',
    name: 'Turbocharger Test',
    category: 'Engine',
    description: 'Test turbocharger actuator',
    command: '2F1301',
    riskLevel: 'medium',
    vehicleSupport: ['VAG', 'PSA', 'BMW']
  },
  
  // Service Functions
  {
    id: 'oil_service_reset',
    name: 'Oil Service Reset',
    category: 'Service',
    description: 'Reset oil service interval',
    command: '31030000FF',
    riskLevel: 'low',
    vehicleSupport: ['VAG', 'BMW', 'Mercedes', 'Ford']
  },
  {
    id: 'inspection_reset',
    name: 'Inspection Reset',
    category: 'Service',
    description: 'Reset inspection service interval',
    command: '31030001FF',
    riskLevel: 'low',
    vehicleSupport: ['VAG', 'BMW', 'Mercedes']
  },
  
  // Body Functions
  {
    id: 'window_calibration',
    name: 'Window Calibration',
    category: 'Body',
    description: 'Calibrate electric windows',
    command: '31040001',
    riskLevel: 'low',
    vehicleSupport: ['VAG', 'BMW', 'Mercedes']
  },
  {
    id: 'sunroof_calibration',
    name: 'Sunroof Calibration',
    category: 'Body',
    description: 'Calibrate sunroof position',
    command: '31040002',
    riskLevel: 'low',
    vehicleSupport: ['VAG', 'BMW']
  },
  
  // ABS Functions
  {
    id: 'abs_bleeding',
    name: 'ABS Bleeding',
    category: 'Brakes',
    description: 'Automated ABS bleeding procedure',
    command: '31050001',
    riskLevel: 'medium',
    vehicleSupport: ['VAG', 'BMW', 'Mercedes', 'Ford']
  },
  {
    id: 'esp_calibration',
    name: 'ESP Calibration',
    category: 'Brakes',
    description: 'Calibrate ESP system',
    command: '31050002',
    riskLevel: 'medium',
    vehicleSupport: ['VAG', 'BMW', 'Mercedes']
  },
  
  // Airbag Functions
  {
    id: 'airbag_reset',
    name: 'Airbag System Reset',
    category: 'Safety',
    description: 'Reset airbag system after repair',
    command: '31060001',
    riskLevel: 'high',
    requiresKey: true,
    vehicleSupport: ['VAG', 'BMW', 'Mercedes']
  },
  
  // Climate Functions
  {
    id: 'ac_test',
    name: 'A/C System Test',
    category: 'Climate',
    description: 'Test A/C compressor and components',
    command: '2F1401',
    riskLevel: 'low',
    vehicleSupport: ['VAG', 'BMW', 'Mercedes', 'Ford']
  },
  
  // Coding Functions
  {
    id: 'module_coding',
    name: 'Module Coding',
    category: 'Coding',
    description: 'Code ECU modules',
    command: '2701',
    parameters: { codingData: 'required' },
    riskLevel: 'high',
    requiresKey: true,
    vehicleSupport: ['VAG', 'BMW']
  },
  
  // Key Programming
  {
    id: 'key_programming',
    name: 'Key Programming',
    category: 'Security',
    description: 'Program new keys',
    command: '27E1',
    parameters: { keyData: 'required', pin: 'required' },
    riskLevel: 'high',
    requiresKey: true,
    vehicleSupport: ['VAG', 'BMW', 'Mercedes', 'Ford']
  }
];

export const DELPHI_DPF_MONITORING = {
  parameters: [
    {
      name: 'DPF Inlet Temperature',
      pid: '22F604',
      unit: '°C',
      range: { min: 200, max: 800, critical: 700 }
    },
    {
      name: 'DPF Outlet Temperature', 
      pid: '22F605',
      unit: '°C',
      range: { min: 200, max: 850, critical: 750 }
    },
    {
      name: 'DPF Differential Pressure',
      pid: '22F602',
      unit: 'mbar',
      range: { min: 0, max: 300, critical: 200 }
    },
    {
      name: 'DPF Soot Load',
      pid: '22F603',
      unit: '%',
      range: { min: 0, max: 100, critical: 85 }
    },
    {
      name: 'DPF Soot Mass',
      pid: '22F606',
      unit: 'g',
      range: { min: 0, max: 50, critical: 40 }
    },
    {
      name: 'DPF Ash Load',
      pid: '22F607',
      unit: '%',
      range: { min: 0, max: 100, critical: 90 }
    },
    {
      name: 'Exhaust Gas Temperature 1',
      pid: '221140',
      unit: '°C',
      range: { min: 150, max: 900, critical: 800 }
    },
    {
      name: 'Exhaust Gas Temperature 2',
      pid: '221141',
      unit: '°C', 
      range: { min: 150, max: 900, critical: 800 }
    },
    {
      name: 'DPF Regeneration Status',
      pid: '22F608',
      unit: 'Status',
      values: {
        0: 'Inactive',
        1: 'Request',
        2: 'Active - Heating',
        3: 'Active - Burning', 
        4: 'Active - Cooling',
        5: 'Complete',
        6: 'Aborted',
        7: 'Failed'
      }
    }
  ],
  
  regenerationStages: [
    {
      stage: 1,
      name: 'Pre-heating',
      description: 'Engine warming up to operating temperature',
      targetTemp: 250,
      duration: 180
    },
    {
      stage: 2,
      name: 'DPF Heating',
      description: 'Heating DPF to ignition temperature',
      targetTemp: 550,
      duration: 300
    },
    {
      stage: 3,
      name: 'Soot Burning',
      description: 'Active soot burning phase',
      targetTemp: 600,
      duration: 600
    },
    {
      stage: 4,
      name: 'Cool Down',
      description: 'DPF cooling down to normal operation',
      targetTemp: 400,
      duration: 240
    }
  ]
};
