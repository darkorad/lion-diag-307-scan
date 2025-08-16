
// Real OBD2 and manufacturer-specific diagnostic codes and PIDs
export interface DiagnosticCode {
  code: string;
  description: string;
  system: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
  possibleCauses: string[];
  repairProcedure: string[];
  estimatedCost: string;
}

export interface ManufacturerPID {
  pid: string;
  name: string;
  description: string;
  unit: string;
  formula: string;
  range?: string;
  manufacturer: string[];
}

// Real OBD2 Diagnostic Trouble Codes
export const REAL_DTC_CODES: DiagnosticCode[] = [
  // Engine Codes
  {
    code: 'P0001',
    description: 'Fuel Volume Regulator Control Circuit/Open',
    system: 'Fuel System',
    severity: 'medium',
    symptoms: ['Hard starting', 'Poor fuel economy', 'Engine hesitation'],
    possibleCauses: ['Faulty fuel volume regulator', 'Open circuit', 'ECM failure'],
    repairProcedure: ['Check fuel volume regulator', 'Test circuit continuity', 'Replace if necessary'],
    estimatedCost: '$150-$400'
  },
  {
    code: 'P0016',
    description: 'Crankshaft Position - Camshaft Position Correlation (Bank 1 Sensor A)',
    system: 'Engine Timing',
    severity: 'high',
    symptoms: ['Engine won\'t start', 'Rough idle', 'Metal rattling noise'],
    possibleCauses: ['Timing chain stretched', 'Timing chain jumped', 'Camshaft/crankshaft sensor fault'],
    repairProcedure: ['Check timing alignment', 'Inspect timing chain', 'Replace sensors if needed'],
    estimatedCost: '$500-$1500'
  },
  {
    code: 'P0101',
    description: 'Mass Air Flow Circuit Range/Performance Problem',
    system: 'Air Intake',
    severity: 'medium',
    symptoms: ['Check engine light', 'Poor acceleration', 'Black smoke'],
    possibleCauses: ['Dirty MAF sensor', 'Vacuum leak', 'Faulty MAF sensor'],
    repairProcedure: ['Clean MAF sensor', 'Check for vacuum leaks', 'Replace MAF if necessary'],
    estimatedCost: '$100-$350'
  },
  {
    code: 'P0171',
    description: 'System Too Lean (Bank 1)',
    system: 'Fuel System',
    severity: 'medium',
    symptoms: ['Rough idle', 'Lack of power', 'Engine hesitation'],
    possibleCauses: ['Vacuum leak', 'Faulty MAF sensor', 'Fuel pump issue', 'Dirty fuel injectors'],
    repairProcedure: ['Check for vacuum leaks', 'Test fuel pressure', 'Clean injectors'],
    estimatedCost: '$200-$800'
  },
  {
    code: 'P0300',
    description: 'Random/Multiple Cylinder Misfire Detected',
    system: 'Ignition System',
    severity: 'high',
    symptoms: ['Engine shaking', 'Loss of power', 'Poor fuel economy'],
    possibleCauses: ['Faulty spark plugs', 'Bad ignition coils', 'Fuel injector problems'],
    repairProcedure: ['Replace spark plugs', 'Test ignition coils', 'Check fuel injectors'],
    estimatedCost: '$150-$600'
  },
  {
    code: 'P0420',
    description: 'Catalyst System Efficiency Below Threshold (Bank 1)',
    system: 'Emission Control',
    severity: 'medium',
    symptoms: ['Check engine light', 'Failed emissions test', 'Reduced performance'],
    possibleCauses: ['Faulty catalytic converter', 'O2 sensor failure', 'Engine misfire'],
    repairProcedure: ['Test O2 sensors', 'Check catalytic converter', 'Repair misfires first'],
    estimatedCost: '$400-$2000'
  },
  // DPF Codes
  {
    code: 'P2002',
    description: 'Diesel Particulate Filter Efficiency Below Threshold (Bank 1)',
    system: 'DPF System',
    severity: 'high',
    symptoms: ['DPF warning light', 'Reduced power', 'Limp mode'],
    possibleCauses: ['Clogged DPF', 'DPF sensor failure', 'Short trip driving'],
    repairProcedure: ['Force DPF regeneration', 'Check DPF sensors', 'Replace DPF if needed'],
    estimatedCost: '$1000-$4000'
  },
  {
    code: 'P2463',
    description: 'Diesel Particulate Filter Soot Accumulation',
    system: 'DPF System',
    severity: 'medium',
    symptoms: ['DPF light', 'Reduced performance', 'Higher fuel consumption'],
    possibleCauses: ['Excessive soot buildup', 'Failed regeneration cycles', 'Faulty DPF sensor'],
    repairProcedure: ['Perform forced regeneration', 'Drive at highway speeds', 'Check sensors'],
    estimatedCost: '$200-$800'
  },
  // ABS Codes
  {
    code: 'C1095',
    description: 'ABS Hydraulic Pump Motor Circuit Malfunction',
    system: 'ABS System',
    severity: 'high',
    symptoms: ['ABS light on', 'No ABS function', 'Brake pedal pulsation'],
    possibleCauses: ['Faulty ABS pump motor', 'Electrical connection issue', 'ABS module failure'],
    repairProcedure: ['Test ABS pump motor', 'Check electrical connections', 'Replace ABS module'],
    estimatedCost: '$800-$2000'
  },
  // Airbag Codes  
  {
    code: 'B1318',
    description: 'Battery Voltage Low',
    system: 'SRS Airbag',
    severity: 'medium',
    symptoms: ['Airbag light on', 'System malfunction'],
    possibleCauses: ['Low battery voltage', 'Charging system issue', 'Poor connections'],
    repairProcedure: ['Test battery and charging system', 'Check connections', 'Clear codes after repair'],
    estimatedCost: '$100-$300'
  }
];

// Real Manufacturer-Specific PIDs
export const MANUFACTURER_PIDS: ManufacturerPID[] = [
  // Peugeot/Citroën PSA PIDs
  {
    pid: '2180',
    name: 'DPF Soot Load',
    description: 'Diesel Particulate Filter soot accumulation percentage',
    unit: '%',
    formula: 'A*100/255',
    range: '0-100%',
    manufacturer: ['Peugeot', 'Citroën']
  },
  {
    pid: '2181',
    name: 'DPF Regeneration Status',
    description: 'Current DPF regeneration process status',
    unit: 'status',
    formula: 'A',
    manufacturer: ['Peugeot', 'Citroën']
  },
  {
    pid: '2182',
    name: 'Turbo Boost Pressure',
    description: 'Turbocharger boost pressure actual value',
    unit: 'mbar',
    formula: 'A*10',
    range: '0-2550 mbar',
    manufacturer: ['Peugeot', 'Citroën']
  },
  {
    pid: '2183',
    name: 'EGR Valve Position',
    description: 'Exhaust Gas Recirculation valve position',
    unit: '%',
    formula: 'A*100/255',
    range: '0-100%',
    manufacturer: ['Peugeot', 'Citroën']
  },
  {
    pid: '2184',
    name: 'Fuel Rail Pressure',
    description: 'Common rail fuel pressure',
    unit: 'bar',
    formula: 'A*10',
    range: '0-2550 bar',
    manufacturer: ['Peugeot', 'Citroën']
  },
  // BMW PIDs
  {
    pid: '22F190',
    name: 'Oil Temperature',
    description: 'Engine oil temperature',
    unit: '°C',
    formula: 'A-40',
    range: '-40 to 215°C',
    manufacturer: ['BMW']
  },
  {
    pid: '22F191',
    name: 'Transmission Temperature',
    description: 'Automatic transmission fluid temperature',
    unit: '°C',
    formula: 'A-40',
    range: '-40 to 215°C',
    manufacturer: ['BMW']
  },
  // Mercedes PIDs
  {
    pid: '22F1A0',
    name: 'AdBlue Level',
    description: 'AdBlue/DEF tank level',
    unit: '%',
    formula: 'A*100/255',
    range: '0-100%',
    manufacturer: ['Mercedes-Benz']
  },
  {
    pid: '22F1A1',
    name: 'AdBlue Quality',
    description: 'AdBlue/DEF fluid quality status',
    unit: 'status',
    formula: 'A',
    manufacturer: ['Mercedes-Benz']
  },
  // Volkswagen Group PIDs
  {
    pid: '221A',
    name: 'DPF Temperature',
    description: 'Diesel Particulate Filter temperature',
    unit: '°C',
    formula: '(A*256+B)*0.1-40',
    range: '-40 to 6513.5°C',
    manufacturer: ['Volkswagen', 'Audi', 'Seat', 'Skoda']
  },
  {
    pid: '221B',
    name: 'Turbo Speed',
    description: 'Turbocharger shaft speed',
    unit: 'rpm',
    formula: 'A*256+B',
    range: '0-65535 rpm',
    manufacturer: ['Volkswagen', 'Audi', 'Seat', 'Skoda']
  }
];

// Real Actuator Test Commands
export const ACTUATOR_TESTS = {
  // PSA Group (Peugeot/Citroën)
  PSA: {
    EGR_TEST: '2F110E01',
    FUEL_PUMP_TEST: '2F120101',
    RADIATOR_FAN_TEST: '2F130101',
    AC_COMPRESSOR_TEST: '2F140101',
    TURBO_ACTUATOR_TEST: '2F150101',
    DPF_REGENERATION: '31010F01',
    INJECTOR_TEST: '2F160101'
  },
  // BMW
  BMW: {
    COOLING_FAN_TEST: '2F3001',
    FUEL_PUMP_TEST: '2F3101',
    EGR_TEST: '2F3201',
    THERMOSTAT_TEST: '2F3301'
  },
  // Mercedes
  MERCEDES: {
    SBC_PUMP_TEST: '2F4001',
    AIRMATIC_TEST: '2F4101',
    FAN_TEST: '2F4201'
  },
  // VAG Group
  VAG: {
    THROTTLE_TEST: '2F5001',
    TURBO_TEST: '2F5101',
    EGR_TEST: '2F5201',
    FUEL_PUMP_TEST: '2F5301'
  }
};

// Service Reset Procedures
export const SERVICE_PROCEDURES = {
  PEUGEOT_OIL_RESET: {
    name: 'Oil Service Reset',
    commands: ['3101FF00', '2F1001FF', '3101FF01'],
    description: 'Reset oil change service indicator',
    preconditions: ['Ignition ON', 'Engine OFF', 'All doors closed']
  },
  BMW_CBS_RESET: {
    name: 'Condition Based Service Reset',
    commands: ['3101', '2F1001', '3103'],
    description: 'Reset BMW CBS service indicators',
    preconditions: ['Ignition ON', 'Engine OFF']
  },
  VAG_SERVICE_RESET: {
    name: 'Service Interval Reset',
    commands: ['2801', '10F0', '2F1001'],
    description: 'Reset service interval display',
    preconditions: ['Ignition ON', 'Engine OFF']
  }
};

// Coding Examples
export const VEHICLE_CODING = {
  PEUGEOT_BSI: {
    AUTO_LOCK: { code: '0101FF', description: 'Enable automatic door locking when driving' },
    DRL_DISABLE: { code: '0201FF', description: 'Disable daytime running lights' },
    FOLLOW_HOME: { code: '0301FF', description: 'Enable follow-me-home lighting' }
  },
  BMW_CODING: {
    ANGEL_EYES: { code: '3F01', description: 'Enable angel eyes as DRL' },
    AUTO_LOCK: { code: '3F02', description: 'Auto lock doors at 15 km/h' },
    COMFORT_TURN: { code: '3F03', description: 'Enable comfort turn signals' }
  },
  VAG_CODING: {
    NEEDLE_SWEEP: { code: 'Long_15', description: 'Enable needle sweep on startup' },
    AUTO_LOCK: { code: 'Long_16', description: 'Auto lock doors when driving' },
    CORNERING_LIGHTS: { code: 'Long_17', description: 'Enable cornering lights' }
  }
};
