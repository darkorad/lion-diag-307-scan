export interface DiagnosticModule {
  id: string;
  name: string;
  description: string;
  supportedPIDs: PID[];
  advancedFunctions: AdvancedFunction[];
}

export interface PID {
  id: string;
  name: string;
  description: string;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  formula?: string;
}

export interface AdvancedFunction {
  id: string;
  name: string;
  description: string;
  requiresSecurityAccess: boolean;
  securityLevel?: number;
  supportedManufacturers?: string[];
}

export const DIAGNOSTIC_MODULES: DiagnosticModule[] = [
  {
    id: 'engine-ecu',
    name: 'Engine Control Module',
    description: 'Controls engine performance, fuel efficiency, and emissions',
    supportedPIDs: [
      { id: '0104', name: 'Engine Load', description: 'Calculated engine load value', unit: '%', minValue: 0, maxValue: 100 },
      { id: '010C', name: 'Engine RPM', description: 'Engine speed', unit: 'RPM', minValue: 0, maxValue: 8000 },
      { id: '010D', name: 'Vehicle Speed', description: 'Vehicle speed', unit: 'km/h', minValue: 0, maxValue: 255 },
      { id: '010F', name: 'Intake Air Temp', description: 'Intake air temperature', unit: '°C', minValue: -40, maxValue: 215 },
      { id: '0111', name: 'Throttle Position', description: 'Absolute throttle position', unit: '%', minValue: 0, maxValue: 100 },
      { id: '0105', name: 'Coolant Temp', description: 'Engine coolant temperature', unit: '°C', minValue: -40, maxValue: 215 },
      { id: '010B', name: 'Intake Manifold Pressure', description: 'Intake manifold absolute pressure', unit: 'kPa', minValue: 0, maxValue: 255 },
      { id: '015E', name: 'Fuel Rate', description: 'Engine fuel rate', unit: 'L/h', minValue: 0, maxValue: 3212.75 }
    ],
    advancedFunctions: [
      { id: 'eng-reset-adaptations', name: 'Reset Adaptations', description: 'Reset all engine control adaptations to factory defaults', requiresSecurityAccess: true, securityLevel: 1 },
      { id: 'eng-injector-coding', name: 'Injector Coding', description: 'Program new injector calibration values', requiresSecurityAccess: true, securityLevel: 3 },
      { id: 'eng-dpf-regen', name: 'Force DPF Regeneration', description: 'Manually trigger diesel particulate filter regeneration cycle', requiresSecurityAccess: true, securityLevel: 2 },
      { id: 'eng-idle-learn', name: 'Idle Learning Procedure', description: 'Perform idle speed learning procedure', requiresSecurityAccess: false }
    ]
  },
  {
    id: 'transmission-ecu',
    name: 'Transmission Control Module',
    description: 'Controls automatic transmission shifting and clutch engagement',
    supportedPIDs: [
      { id: '0141', name: 'Transmission Temp', description: 'Transmission fluid temperature', unit: '°C', minValue: -40, maxValue: 215 },
      { id: '0143', name: 'Transmission Oil Pressure', description: 'Transmission oil pressure', unit: 'kPa', minValue: 0, maxValue: 1000 },
      { id: '0145', name: 'Current Gear', description: 'Current transmission gear', minValue: 0, maxValue: 10 },
      { id: '0146', name: 'Torque Converter Status', description: 'Torque converter clutch status', minValue: 0, maxValue: 1 }
    ],
    advancedFunctions: [
      { id: 'trans-adaptation-reset', name: 'Reset Adaptations', description: 'Reset transmission adaptations to factory defaults', requiresSecurityAccess: true, securityLevel: 1 },
      { id: 'trans-clutch-relearn', name: 'Clutch Relearn', description: 'Perform clutch engagement point learning procedure', requiresSecurityAccess: true, securityLevel: 2 }
    ]
  },
  {
    id: 'abs-esp',
    name: 'ABS/ESP System',
    description: 'Controls anti-lock braking and electronic stability program',
    supportedPIDs: [
      { id: '0151', name: 'Wheel Speed FL', description: 'Front left wheel speed', unit: 'km/h', minValue: 0, maxValue: 255 },
      { id: '0152', name: 'Wheel Speed FR', description: 'Front right wheel speed', unit: 'km/h', minValue: 0, maxValue: 255 },
      { id: '0153', name: 'Wheel Speed RL', description: 'Rear left wheel speed', unit: 'km/h', minValue: 0, maxValue: 255 },
      { id: '0154', name: 'Wheel Speed RR', description: 'Rear right wheel speed', unit: 'km/h', minValue: 0, maxValue: 255 },
      { id: '0155', name: 'Lateral Acceleration', description: 'Vehicle lateral acceleration', unit: 'm/s²', minValue: -20, maxValue: 20 }
    ],
    advancedFunctions: [
      { id: 'abs-bleed', name: 'ABS Bleeding', description: 'Perform automated ABS system bleeding procedure', requiresSecurityAccess: true, securityLevel: 2 },
      { id: 'abs-pump-test', name: 'ABS Pump Test', description: 'Test ABS pump and valve operation', requiresSecurityAccess: true, securityLevel: 1 },
      { id: 'esp-calibration', name: 'ESP Sensor Calibration', description: 'Calibrate steering angle and yaw rate sensors', requiresSecurityAccess: true, securityLevel: 2 }
    ]
  },
  {
    id: 'bsi-bcm',
    name: 'Body Control Module',
    description: 'Controls vehicle body electronics and comfort systems',
    supportedPIDs: [
      { id: '0161', name: 'Battery Voltage', description: 'Vehicle battery voltage', unit: 'V', minValue: 0, maxValue: 20 },
      { id: '0162', name: 'Outside Temperature', description: 'Outside ambient temperature', unit: '°C', minValue: -40, maxValue: 80 },
      { id: '0163', name: 'Fuel Level', description: 'Fuel tank level', unit: '%', minValue: 0, maxValue: 100 }
    ],
    advancedFunctions: [
      { id: 'bcm-key-programming', name: 'Key Programming', description: 'Program new remote keys to vehicle', requiresSecurityAccess: true, securityLevel: 5 },
      { id: 'bcm-comfort-config', name: 'Comfort Configuration', description: 'Configure comfort features like auto-lock and lighting', requiresSecurityAccess: true, securityLevel: 1 },
      { id: 'bcm-immobilizer', name: 'Immobilizer Management', description: 'Configure and reset immobilizer system', requiresSecurityAccess: true, securityLevel: 5 }
    ]
  },
  {
    id: 'airbag-srs',
    name: 'Airbag/SRS System',
    description: 'Controls supplemental restraint systems and crash sensors',
    supportedPIDs: [
      { id: '0171', name: 'Crash Sensor Status', description: 'Status of crash detection sensors', minValue: 0, maxValue: 1 },
      { id: '0172', name: 'Passenger Airbag Status', description: 'Passenger airbag activation status', minValue: 0, maxValue: 1 }
    ],
    advancedFunctions: [
      { id: 'srs-reset', name: 'SRS Reset', description: 'Reset airbag system after deployment or repair', requiresSecurityAccess: true, securityLevel: 4 },
      { id: 'srs-configuration', name: 'SRS Configuration', description: 'Configure airbag system parameters', requiresSecurityAccess: true, securityLevel: 4 }
    ]
  },
  {
    id: 'instrument-cluster',
    name: 'Instrument Cluster',
    description: 'Controls dashboard displays and warning indicators',
    supportedPIDs: [
      { id: '0181', name: 'Odometer', description: 'Vehicle odometer reading', unit: 'km', minValue: 0, maxValue: 999999 },
      { id: '0182', name: 'Service Interval', description: 'Remaining distance to service', unit: 'km', minValue: -10000, maxValue: 30000 }
    ],
    advancedFunctions: [
      { id: 'cluster-test', name: 'Gauge Test', description: 'Perform full instrument cluster test routine', requiresSecurityAccess: false },
      { id: 'cluster-service-reset', name: 'Service Indicator Reset', description: 'Reset service interval indicator', requiresSecurityAccess: true, securityLevel: 1 }
    ]
  }
];

// Helper functions
export const getPIDsForModule = (moduleId: string): PID[] => {
  const module = DIAGNOSTIC_MODULES.find(m => m.id === moduleId);
  return module ? module.supportedPIDs : [];
};

export const getAdvancedFunctionsForModule = (moduleId: string): AdvancedFunction[] => {
  const module = DIAGNOSTIC_MODULES.find(m => m.id === moduleId);
  return module ? module.advancedFunctions : [];
};