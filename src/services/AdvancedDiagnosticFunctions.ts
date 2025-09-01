
export interface AdvancedFunction {
  id: string;
  name: string;
  description: string;
  category: 'adaptation' | 'calibration' | 'coding' | 'reset' | 'test' | 'learning';
  manufacturerSupport: string[];
  commands: string[];
  parameters?: { [key: string]: any };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  preconditions: string[];
  warningMessage?: string;
  estimatedTime: number;
}

export const ADVANCED_DIAGNOSTIC_FUNCTIONS: AdvancedFunction[] = [
  // INJECTOR FUNCTIONS
  {
    id: 'injector_synchronization',
    name: 'Injector Synchronization',
    description: 'Synchronize fuel injector timing and flow rates',
    category: 'adaptation',
    manufacturerSupport: ['Peugeot', 'Citroen', 'Renault', 'Volkswagen', 'Audi', 'Seat', 'Skoda', 'BMW', 'Mercedes'],
    commands: ['2F300101', '2F300102', '2F300103', '2F300104'],
    parameters: { cylinder_count: 4, adaptation_type: 'flow_rate' },
    riskLevel: 'high',
    preconditions: ['Engine warm', 'No active DTCs', 'Engine idle'],
    warningMessage: 'Incorrect synchronization can damage engine',
    estimatedTime: 600
  },
  {
    id: 'injector_coding',
    name: 'Injector Coding',
    description: 'Code new injectors with correction values',
    category: 'coding',
    manufacturerSupport: ['Volkswagen', 'Audi', 'Seat', 'Skoda', 'BMW', 'Mercedes'],
    commands: ['2E1001', '2E1002', '2E1003', '2E1004'],
    parameters: { injector_codes: [], cylinder_positions: [] },
    riskLevel: 'critical',
    preconditions: ['New injectors installed', 'Correction codes available'],
    warningMessage: 'Wrong codes will cause severe engine damage',
    estimatedTime: 300
  },
  {
    id: 'injector_flow_test',
    name: 'Injector Flow Test',
    description: 'Test individual injector flow rates and patterns',
    category: 'test',
    manufacturerSupport: ['All'],
    commands: ['2F301001', '2F301002', '2F301003', '2F301004'],
    riskLevel: 'medium',
    preconditions: ['Engine running', 'Fuel system primed'],
    estimatedTime: 180
  },

  // EGR VALVE FUNCTIONS
  {
    id: 'egr_valve_learning',
    name: 'EGR Valve Learning',
    description: 'Teach ECU the EGR valve position limits and flow characteristics',
    category: 'learning',
    manufacturerSupport: ['Peugeot', 'Citroen', 'Renault', 'Volkswagen', 'Audi', 'BMW', 'Mercedes'],
    commands: ['2F110E00', '2F110E01', '2F110EFF', '31010E'],
    parameters: { learning_type: 'full', valve_type: 'electric' },
    riskLevel: 'medium',
    preconditions: ['Engine warm', 'EGR valve clean', 'No boost pressure'],
    estimatedTime: 480
  },
  {
    id: 'egr_position_calibration',
    name: 'EGR Position Calibration',
    description: 'Calibrate EGR valve position sensor',
    category: 'calibration',
    manufacturerSupport: ['All'],
    commands: ['2F110E00', '2F110EFF', '22110E'],
    riskLevel: 'medium',
    preconditions: ['EGR valve mechanically OK', 'Engine off'],
    estimatedTime: 120
  },
  {
    id: 'egr_flow_test',
    name: 'EGR Flow Test',
    description: 'Test EGR valve flow rate and vacuum response',
    category: 'test',
    manufacturerSupport: ['All'],
    commands: ['2F110E50', '2F110E80', '2F110EFF'],
    riskLevel: 'low',
    preconditions: ['Engine running', 'Operating temperature'],
    estimatedTime: 300
  },

  // TURBOCHARGER FUNCTIONS
  {
    id: 'turbo_actuator_calibration',
    name: 'Turbo Actuator Calibration',
    description: 'Calibrate turbocharger wastegate/VNT actuator',
    category: 'calibration',
    manufacturerSupport: ['Volkswagen', 'Audi', 'Seat', 'Skoda', 'Peugeot', 'Citroen', 'BMW', 'Mercedes'],
    commands: ['2F113200', '2F1132FF', '31011332'],
    parameters: { actuator_type: 'VNT', calibration_points: 10 },
    riskLevel: 'high',
    preconditions: ['Engine running', 'No boost leaks', 'Actuator mechanically OK'],
    warningMessage: 'Incorrect calibration can cause turbo damage',
    estimatedTime: 420
  },
  {
    id: 'turbo_pressure_test',
    name: 'Turbo Pressure Test',
    description: 'Test turbocharger boost pressure control',
    category: 'test',
    manufacturerSupport: ['All'],
    commands: ['2F113250', '2F113280', '2F1132B0'],
    riskLevel: 'medium',
    preconditions: ['Engine running', 'Road test possible'],
    estimatedTime: 600
  },

  // DPF FUNCTIONS
  {
    id: 'dpf_forced_regeneration',
    name: 'DPF Forced Regeneration',
    description: 'Force diesel particulate filter regeneration cycle',
    category: 'reset',
    manufacturerSupport: ['Peugeot', 'Citroen', 'Renault', 'Volkswagen', 'Audi', 'BMW', 'Mercedes'],
    commands: ['31010F01', '22120F', '22121F'],
    parameters: { regen_type: 'stationary', temperature_target: 600 },
    riskLevel: 'medium',
    preconditions: ['Engine warm', 'Vehicle stationary', 'DPF not cracked'],
    warningMessage: 'Vehicle will get very hot during regeneration',
    estimatedTime: 1800
  },
  {
    id: 'dpf_soot_counter_reset',
    name: 'DPF Soot Counter Reset',
    description: 'Reset DPF soot accumulation counter after filter replacement',
    category: 'reset',
    manufacturerSupport: ['Peugeot', 'Citroen', 'Renault', 'Volkswagen', 'Audi'],
    commands: ['2F40000', '2E4001000'],
    riskLevel: 'medium',
    preconditions: ['DPF replaced or cleaned', 'Engine off'],
    estimatedTime: 60
  },

  // THROTTLE BODY FUNCTIONS
  {
    id: 'throttle_body_adaptation',
    name: 'Throttle Body Adaptation',
    description: 'Adapt throttle body position after cleaning or replacement',
    category: 'adaptation',
    manufacturerSupport: ['All'],
    commands: ['31010B01', '2F111100', '2F1111FF'],
    parameters: { adaptation_type: 'basic', idle_position: true },
    riskLevel: 'medium',
    preconditions: ['Throttle body clean', 'Engine warm', 'All accessories off'],
    estimatedTime: 180
  },
  {
    id: 'throttle_position_learning',
    name: 'Throttle Position Learning',
    description: 'Learn throttle position sensor min/max values',
    category: 'learning',
    manufacturerSupport: ['All'],
    commands: ['2F111100', '2F1111FF', '22111100'],
    riskLevel: 'low',
    preconditions: ['Engine off', 'Ignition on', 'Accelerator not pressed'],
    estimatedTime: 120
  },

  // GEARBOX FUNCTIONS
  {
    id: 'dsg_clutch_adaptation',
    name: 'DSG Clutch Adaptation',
    description: 'Adapt DSG dual-clutch engagement points',
    category: 'adaptation',
    manufacturerSupport: ['Volkswagen', 'Audi', 'Seat', 'Skoda'],
    commands: ['2F020101', '2F020201', '31010201'],
    parameters: { clutch_1: true, clutch_2: true, adaptation_type: 'basic' },
    riskLevel: 'high',
    preconditions: ['Transmission warm', 'Vehicle level', 'No load'],
    warningMessage: 'Incorrect adaptation affects drivability',
    estimatedTime: 900
  },
  {
    id: 'auto_trans_adaptation',
    name: 'Automatic Transmission Adaptation',
    description: 'Reset automatic transmission shift adaptations',
    category: 'adaptation',
    manufacturerSupport: ['All'],
    commands: ['2F020301', '31010203'],
    riskLevel: 'medium',
    preconditions: ['Transmission warm', 'Test drive required after'],
    estimatedTime: 300
  },

  // STEERING FUNCTIONS
  {
    id: 'steering_angle_calibration',
    name: 'Steering Angle Calibration',
    description: 'Calibrate steering angle sensor zero position',
    category: 'calibration',
    manufacturerSupport: ['All'],
    commands: ['2F440100', '31014401'],
    parameters: { wheel_alignment: 'required', zero_position: true },
    riskLevel: 'high',
    preconditions: ['Wheels straight', 'Vehicle on level surface', 'Wheel alignment OK'],
    warningMessage: 'Affects stability control systems',
    estimatedTime: 180
  },

  // BRAKE SYSTEM FUNCTIONS
  {
    id: 'brake_pad_reset',
    name: 'Brake Pad Reset',
    description: 'Reset brake pad wear indicator after pad replacement',
    category: 'reset',
    manufacturerSupport: ['BMW', 'Mercedes', 'Audi', 'Volkswagen'],
    commands: ['2F340100', '2E340100'],
    riskLevel: 'low',
    preconditions: ['New brake pads installed', 'Vehicle stationary'],
    estimatedTime: 60
  },
  {
    id: 'abs_pump_bleeding',
    name: 'ABS Pump Bleeding',
    description: 'Automated ABS hydraulic system bleeding',
    category: 'test',
    manufacturerSupport: ['All'],
    commands: ['2F030101', '2F030102', '2F030103', '2F030104'],
    riskLevel: 'high',
    preconditions: ['Brake fluid level OK', 'System pressure normal'],
    warningMessage: 'Brake system work - ensure safety',
    estimatedTime: 600
  },

  // BATTERY & CHARGING FUNCTIONS
  {
    id: 'battery_registration',
    name: 'Battery Registration',
    description: 'Register new battery with battery management system',
    category: 'coding',
    manufacturerSupport: ['BMW', 'Mercedes', 'Audi', 'Volkswagen'],
    commands: ['2E200180', '2E200181'],
    parameters: { battery_type: 'AGM', capacity: 70, part_number: '' },
    riskLevel: 'medium',
    preconditions: ['New battery installed', 'Battery type known'],
    estimatedTime: 120
  },
  {
    id: 'alternator_regulation',
    name: 'Alternator Regulation',
    description: 'Calibrate alternator voltage regulation',
    category: 'calibration',
    manufacturerSupport: ['BMW', 'Mercedes', 'Audi', 'Volkswagen'],
    commands: ['2F500114.0', '2F500114.5'],
    riskLevel: 'medium',
    preconditions: ['Engine running', 'Electrical load stable'],
    estimatedTime: 240
  },

  // SUSPENSION FUNCTIONS
  {
    id: 'suspension_calibration',
    name: 'Air Suspension Calibration',
    description: 'Calibrate air suspension ride height sensors',
    category: 'calibration',
    manufacturerSupport: ['BMW', 'Mercedes', 'Audi'],
    commands: ['2F680100', '2F680200', '2F680300', '2F680400'],
    parameters: { corner_FL: true, corner_FR: true, corner_RL: true, corner_RR: true },
    riskLevel: 'medium',
    preconditions: ['Vehicle level', 'Suspension not loaded'],
    estimatedTime: 300
  },

  // IMMOBILIZER FUNCTIONS
  {
    id: 'key_programming',
    name: 'Key Programming',
    description: 'Program new transponder keys to immobilizer',
    category: 'coding',
    manufacturerSupport: ['Peugeot', 'Citroen', 'Renault', 'Volkswagen', 'Audi'],
    commands: ['27E1', '2FE101', '2E2002'],
    parameters: { key_count: 1, transponder_type: '', security_code: '' },
    riskLevel: 'critical',
    preconditions: ['Security access granted', 'All keys present'],
    warningMessage: 'Wrong procedure can lock immobilizer permanently',
    estimatedTime: 600
  },

  // CLIMATE CONTROL
  {
    id: 'climate_actuator_calibration',
    name: 'Climate Actuator Calibration',
    description: 'Calibrate climate control blend door positions',
    category: 'calibration',
    manufacturerSupport: ['All'],
    commands: ['2F090100', '2F090200', '2F090300'],
    riskLevel: 'low',
    preconditions: ['Climate system accessible', 'No mechanical binding'],
    estimatedTime: 240
  }
];

export const getFunctionsByCategory = (category: string) => {
  return ADVANCED_DIAGNOSTIC_FUNCTIONS.filter(func => func.category === category);
};

export const getFunctionsByManufacturer = (manufacturer: string) => {
  return ADVANCED_DIAGNOSTIC_FUNCTIONS.filter(func => 
    func.manufacturerSupport.includes(manufacturer) || func.manufacturerSupport.includes('All')
  );
};

export const getFunctionById = (id: string) => {
  return ADVANCED_DIAGNOSTIC_FUNCTIONS.find(func => func.id === id);
};

export const getAllCategories = () => {
  return [...new Set(ADVANCED_DIAGNOSTIC_FUNCTIONS.map(func => func.category))].sort();
};
