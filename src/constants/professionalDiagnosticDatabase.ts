// Professional Diagnostic Database for Lion Diag Scan
// Comprehensive manufacturer-specific functions and advanced OBD2 capabilities

export interface SpecialFunction {
  id: string;
  name: string;
  description: string;
  category: 'DPF' | 'Service Reset' | 'Adaptation' | 'Coding' | 'Programming' | 'Calibration' | 'Test';
  manufacturer: string[];
  requiredEquipment?: string[];
  supportedModels?: string[];
  command?: string;
  procedure: string[];
  warnings?: string[]; // Made optional since not all functions need warnings
  prerequisites: string[];
  estimatedTime: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';
  risksWarnings: string[];
  supportedAdapters: string[];
}

export interface ManufacturerModule {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  ecuAddress: string;
  supportedFunctions: string[];
  commonIssues: string[];
  diagnosticProcedures: string[];
}

// Professional Special Functions Database
export const SPECIAL_FUNCTIONS: SpecialFunction[] = [
  // ===== DPF FUNCTIONS =====
  {
    id: 'dpf_regeneration_forced',
    name: 'DPF Forced Regeneration',
    description: 'Force diesel particulate filter regeneration cycle',
    category: 'DPF',
    manufacturer: ['Peugeot', 'Citroën', 'DS', 'Opel', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Ford', 'Renault'],
    requiredEquipment: ['Professional OBD2 scanner', 'Laptop with diagnostic software'],
    supportedModels: ['All diesel models with DPF 2009+'],
    command: '31FF00',
    procedure: [
      '1. Connect OBD2 scanner to vehicle',
      '2. Turn ignition ON, engine OFF',
      '3. Select Engine Control Module (ECM)',
      '4. Navigate to Special Functions > DPF Regeneration',
      '5. Check prerequisites: Engine temperature > 70°C, fuel level > 25%',
      '6. Start forced regeneration process',
      '7. Keep engine running during entire process (15-20 minutes)',
      '8. Monitor exhaust temperature and soot levels',
      '9. Process complete when soot level drops below 2g',
      '10. Clear DTC codes if regeneration successful'
    ],
    warnings: [
      'Vehicle must be in well-ventilated area',
      'Exhaust temperature can exceed 600°C',
      'Do not interrupt process once started',
      'Engine must run continuously during regeneration'
    ],
    prerequisites: [
      'Engine coolant temperature > 70°C',
      'Fuel level > 25%',
      'No critical engine fault codes',
      'DPF soot load > 45%',
      'Vehicle stationary with parking brake applied'
    ],
    estimatedTime: '15-25 minutes',
    difficulty: 'Intermediate',
    risksWarnings: [
      'Hot exhaust gases - keep away from flammable materials',
      'Extended idle time - ensure adequate ventilation',
      'May cause temporary increase in fuel consumption'
    ],
    supportedAdapters: ['Professional scanners', 'Autel', 'Launch', 'TOPDON', 'Foxwell']
  },
  {
    id: 'dpf_cleaning_cycle',
    name: 'DPF Cleaning Cycle',
    description: 'Deep cleaning cycle for severely clogged DPF systems',
    category: 'DPF',
    manufacturer: ['Peugeot', 'Citroën', 'DS', 'BMW', 'Mercedes', 'Audi', 'Volkswagen'],
    procedure: [
      '1. Ensure DPF temperature > 200°C',
      '2. Start deep cleaning cycle',
      '3. Monitor for 30-45 minutes',
      '4. Check post-cleaning soot levels'
    ],
    warnings: ['Extremely high exhaust temperatures', 'Professional use only'],
    prerequisites: ['Severely clogged DPF (>8g soot load)', 'Professional equipment required'],
    estimatedTime: '30-45 minutes',
    difficulty: 'Expert',
    risksWarnings: ['Risk of DPF damage if interrupted', 'Requires professional supervision'],
    supportedAdapters: ['Professional scanners only']
  },

  // ===== SERVICE RESET FUNCTIONS =====
  {
    id: 'oil_service_reset',
    name: 'Oil Service Light Reset',
    description: 'Reset oil change service indicator',
    category: 'Service Reset',
    manufacturer: ['BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Peugeot', 'Citroën', 'Ford', 'Opel', 'Renault', 'Volvo'],
    procedure: [
      '1. Connect scanner and select vehicle',
      '2. Navigate to Body Control Module (BCM)',
      '3. Select Service Reset functions',
      '4. Choose Oil Service Reset',
      '5. Enter service interval (km or miles)',
      '6. Confirm reset operation',
      '7. Verify reset successful in instrument cluster'
    ],
    prerequisites: ['Recent oil change completed'],
    estimatedTime: '2-5 minutes',
    difficulty: 'Basic',
    risksWarnings: ['Incorrect service intervals may damage engine'],
    supportedAdapters: ['Most OBD2 scanners', 'ELM327 compatible']
  },
  {
    id: 'brake_pad_service_reset',
    name: 'Brake Pad Service Reset',
    description: 'Reset brake pad wear service indicator',
    category: 'Service Reset',
    manufacturer: ['BMW', 'Mercedes', 'Audi', 'Volkswagen'],
    procedure: [
      '1. Select ABS/Brake module',
      '2. Navigate to Service Functions',
      '3. Select Brake Pad Reset',
      '4. Confirm new brake pads installed',
      '5. Reset wear indicators'
    ],
    prerequisites: ['New brake pads installed'],
    estimatedTime: '3-5 minutes',
    difficulty: 'Basic',
    risksWarnings: ['Only reset with new brake pads'],
    supportedAdapters: ['Professional scanners', 'Manufacturer specific tools']
  },

  // ===== ECU ADAPTATION & CODING =====
  {
    id: 'throttle_body_adaptation',
    name: 'Throttle Body Adaptation',
    description: 'Adapt throttle body position after cleaning or replacement',
    category: 'Adaptation',
    manufacturer: ['BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Ford', 'GM'],
    procedure: [
      '1. Engine at operating temperature',
      '2. Connect scanner to Engine Control Module',
      '3. Select Adaptations > Throttle Body',
      '4. Start basic setting procedure',
      '5. Follow on-screen prompts for throttle cycling',
      '6. Save adaptation values',
      '7. Clear adaptation codes',
      '8. Test drive to verify proper operation'
    ],
    prerequisites: ['Throttle body cleaned or replaced', 'Engine at operating temperature'],
    estimatedTime: '10-15 minutes',
    difficulty: 'Intermediate',
    risksWarnings: ['Improper adaptation may cause idle issues'],
    supportedAdapters: ['Professional scanners', 'VCDS', 'BMW INPA']
  },
  {
    id: 'abs_brake_bleed',
    name: 'ABS Electronic Brake Bleeding',
    description: 'Electronic brake bleeding procedure for ABS systems',
    category: 'Calibration',
    manufacturer: ['BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Ford', 'GM', 'Toyota', 'Honda'],
    procedure: [
      '1. Fill brake fluid reservoir',
      '2. Connect scanner to ABS module',
      '3. Select Special Functions > Brake Bleeding',
      '4. Follow bleeding sequence: RR, LR, RF, LF',
      '5. Activate ABS pump cycles during bleeding',
      '6. Monitor brake fluid level continuously',
      '7. Test brake pedal feel and ABS operation'
    ],
    prerequisites: ['New brake fluid', 'Proper bleeding equipment'],
    estimatedTime: '20-30 minutes',
    difficulty: 'Advanced',
    risksWarnings: ['Critical safety system - professional recommended'],
    supportedAdapters: ['Professional scanners only']
  },

  // ===== PROGRAMMING FUNCTIONS =====
  {
    id: 'key_programming_bmw',
    name: 'BMW Key Programming',
    description: 'Program new keys for BMW vehicles',
    category: 'Programming',
    manufacturer: ['BMW', 'MINI'],
    procedure: [
      '1. Ensure all existing keys available',
      '2. Connect to CAS module (Car Access System)',
      '3. Read ISN (Internal Secret Number)',
      '4. Calculate key data using BMW algorithm',
      '5. Write key data to new key',
      '6. Test key operation'
    ],
    prerequisites: ['All existing keys', 'Professional equipment', 'Key blank'],
    estimatedTime: '30-60 minutes',
    difficulty: 'Expert',
    risksWarnings: ['May disable existing keys if procedure fails'],
    supportedAdapters: ['BMW INPA', 'Creator C110+', 'Lonsdor K518']
  },
  {
    id: 'injector_coding_bosch',
    name: 'Bosch Injector Coding',
    description: 'Code new injectors with correction values',
    category: 'Coding',
    manufacturer: ['Audi', 'Volkswagen', 'Mercedes', 'BMW'],
    procedure: [
      '1. Read injector correction codes from new injectors',
      '2. Connect to Engine Control Module',
      '3. Navigate to Component Coding',
      '4. Enter correction codes for each cylinder',
      '5. Save coding and clear adaptation values',
      '6. Perform injector quantity adaptation'
    ],
    prerequisites: ['New injectors with coding labels', 'Professional scanner'],
    estimatedTime: '15-30 minutes',
    difficulty: 'Advanced',
    risksWarnings: ['Incorrect codes may damage engine'],
    supportedAdapters: ['VCDS', 'OBDeleven', 'Professional VAG tools']
  },

  // ===== BODY CONTROL FUNCTIONS =====
  {
    id: 'window_calibration',
    name: 'Power Window Calibration',
    description: 'Calibrate power window auto up/down function',
    category: 'Calibration',
    manufacturer: ['BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Ford', 'GM'],
    procedure: [
      '1. Connect to Body Control Module',
      '2. Select Window Calibration function',
      '3. Lower window completely',
      '4. Raise window completely',
      '5. Hold for 2 seconds in up position',
      '6. Test auto up/down function'
    ],
    prerequisites: ['Functional window motors'],
    estimatedTime: '5-10 minutes',
    difficulty: 'Basic',
    risksWarnings: ['Ensure fingers clear of window during calibration'],
    supportedAdapters: ['Most professional scanners']
  },

  // ===== MANUFACTURER SPECIFIC FUNCTIONS =====
  {
    id: 'peugeot_bsi_reset',
    name: 'Peugeot BSI Reset',
    description: 'Reset Body System Interface after replacement',
    category: 'Programming',
    manufacturer: ['Peugeot', 'Citroën', 'DS'],
    procedure: [
      '1. Connect to BSI module',
      '2. Read vehicle configuration',
      '3. Configure new BSI with vehicle data',
      '4. Program keys and immobilizer',
      '5. Validate all systems'
    ],
    prerequisites: ['Replacement BSI', 'Vehicle documentation', 'All keys'],
    estimatedTime: '45-90 minutes',
    difficulty: 'Expert',
    risksWarnings: ['Vehicle may be immobilized if procedure fails'],
    supportedAdapters: ['Lexia 3', 'DiagBox', 'Professional PSA tools']
  },
  {
    id: 'bmw_cbs_reset',
    name: 'BMW CBS Reset',
    description: 'Reset Condition Based Service system',
    category: 'Service Reset',
    manufacturer: ['BMW', 'MINI'],
    procedure: [
      '1. Connect to instrument cluster',
      '2. Navigate to CBS functions',
      '3. Select service item to reset',
      '4. Enter service data',
      '5. Reset counter'
    ],
    prerequisites: ['Service completed'],
    estimatedTime: '5-10 minutes',
    difficulty: 'Basic',
    risksWarnings: ['Only reset after actual service'],
    supportedAdapters: ['BMW INPA', 'Creator C110+', 'ISTA']
  },
  {
    id: 'audi_adaptation_channels',
    name: 'Audi/VW Adaptation Channels',
    description: 'Modify adaptation channels for various functions',
    category: 'Adaptation',
    manufacturer: ['Audi', 'Volkswagen', 'Seat', 'Skoda'],
    procedure: [
      '1. Connect to target control module',
      '2. Select Adaptations menu',
      '3. Choose adaptation channel',
      '4. Modify value as required',
      '5. Save changes and test'
    ],
    prerequisites: ['Knowledge of adaptation channels'],
    estimatedTime: '10-20 minutes',
    difficulty: 'Advanced',
    risksWarnings: ['Incorrect values may cause system malfunction'],
    supportedAdapters: ['VCDS', 'OBDeleven', 'VAG-COM']
  },

  // ===== ADVANCED DIAGNOSTIC FUNCTIONS =====
  {
    id: 'component_testing',
    name: 'Active Component Testing',
    description: 'Test actuators and components actively',
    category: 'Test',
    manufacturer: ['All'],
    procedure: [
      '1. Connect to relevant control module',
      '2. Select Output Tests/Actuator Tests',
      '3. Choose component to test',
      '4. Activate component and observe operation',
      '5. Record results'
    ],
    prerequisites: ['Safe testing environment'],
    estimatedTime: '5-15 minutes per component',
    difficulty: 'Intermediate',
    risksWarnings: ['Some tests may move vehicle parts'],
    supportedAdapters: ['Professional scanners']
  },
  {
    id: 'ecu_flash_programming',
    name: 'ECU Flash Programming',
    description: 'Update ECU software/firmware',
    category: 'Programming',
    manufacturer: ['All modern vehicles'],
    procedure: [
      '1. Identify current software version',
      '2. Download latest software file',
      '3. Ensure stable power supply (12V+)',
      '4. Connect programming interface',
      '5. Erase and program ECU',
      '6. Verify programming success'
    ],
    prerequisites: ['Stable power supply', 'Correct software file', 'Professional equipment'],
    estimatedTime: '30-120 minutes',
    difficulty: 'Expert',
    risksWarnings: ['ECU may be permanently damaged if interrupted'],
    supportedAdapters: ['Manufacturer tools only']
  }
];

// Enhanced Vehicle Modules Database
export const PROFESSIONAL_MODULES: ManufacturerModule[] = [
  // BMW Modules
  {
    id: 'bmw_dme',
    name: 'Digital Motor Electronics (DME)',
    description: 'Engine control module for BMW vehicles',
    manufacturer: 'BMW',
    ecuAddress: '12',
    supportedFunctions: ['Engine diagnostics', 'Fuel adaptation', 'Throttle adaptation', 'Coding'],
    commonIssues: ['Throttle position faults', 'Fuel trim issues', 'Ignition timing problems'],
    diagnosticProcedures: ['Read fault codes', 'Check live data', 'Perform adaptations', 'Test actuators']
  },
  {
    id: 'bmw_cas',
    name: 'Car Access System (CAS)',
    description: 'Security and access control module',
    manufacturer: 'BMW',
    ecuAddress: '51',
    supportedFunctions: ['Key programming', 'Immobilizer reset', 'Security coding'],
    commonIssues: ['Key not recognized', 'Immobilizer active', 'CAS communication errors'],
    diagnosticProcedures: ['Read security status', 'Check key data', 'Program new keys']
  },
  {
    id: 'bmw_ihka',
    name: 'Integrated Automatic Heating/Air Conditioning (IHKA)',
    description: 'Climate control system',
    manufacturer: 'BMW',
    ecuAddress: '5B',
    supportedFunctions: ['Climate diagnostics', 'Actuator testing', 'Sensor calibration'],
    commonIssues: ['Temperature sensor faults', 'Actuator problems', 'Refrigerant issues'],
    diagnosticProcedures: ['Test temperature sensors', 'Calibrate actuators', 'Check refrigerant pressure']
  },

  // Mercedes Modules
  {
    id: 'mercedes_me',
    name: 'Motor Electronics (ME)',
    description: 'Engine management system for Mercedes',
    manufacturer: 'Mercedes',
    ecuAddress: '10',
    supportedFunctions: ['Engine diagnostics', 'Component adaptation', 'Service reset'],
    commonIssues: ['MAF sensor faults', 'O2 sensor problems', 'EGR valve issues'],
    diagnosticProcedures: ['Scan for codes', 'Test components', 'Perform adaptations']
  },
  {
    id: 'mercedes_sam',
    name: 'Signal Acquisition Module (SAM)',
    description: 'Central control unit for electrical systems',
    manufacturer: 'Mercedes',
    ecuAddress: '46',
    supportedFunctions: ['Electrical diagnostics', 'Component coding', 'System configuration'],
    commonIssues: ['Electrical faults', 'Component communication errors', 'Coding issues'],
    diagnosticProcedures: ['Check electrical systems', 'Verify coding', 'Test communication']
  },

  // Audi/VW Modules
  {
    id: 'vag_engine',
    name: 'Engine Control Unit',
    description: 'Engine management for VAG vehicles',
    manufacturer: 'Audi/VW',
    ecuAddress: '01',
    supportedFunctions: ['Engine diagnostics', 'Long coding', 'Adaptations', 'Component testing'],
    commonIssues: ['Carbon buildup', 'Coil pack failures', 'Sensor faults'],
    diagnosticProcedures: ['Read measuring blocks', 'Perform adaptations', 'Test components']
  },
  {
    id: 'vag_airbag',
    name: 'Airbag Control Unit',
    description: 'Safety system control',
    manufacturer: 'Audi/VW',
    ecuAddress: '15',
    supportedFunctions: ['Airbag diagnostics', 'Crash data reset', 'Component testing'],
    commonIssues: ['Seat occupancy sensor faults', 'Airbag warning light', 'Crash sensor problems'],
    diagnosticProcedures: ['Read crash data', 'Test sensors', 'Reset airbag light']
  },

  // Peugeot/Citroën Modules
  {
    id: 'psa_bsi',
    name: 'Built-in Systems Interface (BSI)',
    description: 'Central body control module',
    manufacturer: 'Peugeot/Citroën',
    ecuAddress: 'A2',
    supportedFunctions: ['Body electronics', 'Key programming', 'Service reset', 'Configuration'],
    commonIssues: ['Central locking faults', 'Window problems', 'Lighting issues'],
    diagnosticProcedures: ['Check body systems', 'Program keys', 'Configure modules']
  },
  {
    id: 'psa_engine',
    name: 'Engine Management System',
    description: 'Engine control for PSA vehicles',
    manufacturer: 'Peugeot/Citroën',
    ecuAddress: '10',
    supportedFunctions: ['Engine diagnostics', 'DPF regeneration', 'Injector coding'],
    commonIssues: ['DPF clogging', 'Injector problems', 'Turbo issues'],
    diagnosticProcedures: ['DPF status check', 'Injector testing', 'Turbo diagnostics']
  }
];

// Professional Diagnostic Categories
export const PROFESSIONAL_CATEGORIES = {
  'Engine Management': {
    icon: '🔧',
    description: 'Complete engine diagnostics and management',
    functions: [
      'Live engine data monitoring',
      'Fuel system diagnostics',
      'Ignition system testing',
      'Emission control diagnostics',
      'Turbocharger diagnostics',
      'Direct injection testing'
    ]
  },
  'Transmission Systems': {
    icon: '⚙️',
    description: 'Automatic and manual transmission diagnostics',
    functions: [
      'Gear position monitoring',
      'Transmission temperature',
      'Shift point analysis',
      'Torque converter diagnostics',
      'CVT belt diagnostics',
      'Dual-clutch system testing'
    ]
  },
  'Brake & Safety Systems': {
    icon: '🛡️',
    description: 'Advanced brake and safety system diagnostics',
    functions: [
      'ABS diagnostics',
      'ESP/ESC system testing',
      'Brake pressure monitoring',
      'Electronic brake force distribution',
      'Hill hold assist testing',
      'Parking brake diagnostics'
    ]
  },
  'Body Electronics': {
    icon: '💡',
    description: 'Complete body control and comfort systems',
    functions: [
      'Central locking diagnostics',
      'Window and sunroof control',
      'Lighting system testing',
      'Mirror and seat adjustment',
      'Keyless entry systems',
      'Alarm system diagnostics'
    ]
  },
  'Climate Control': {
    icon: '❄️',
    description: 'HVAC and climate control systems',
    functions: [
      'A/C compressor testing',
      'Temperature sensor diagnostics',
      'Blend door calibration',
      'Refrigerant pressure monitoring',
      'Cabin air quality sensors',
      'Automatic climate control'
    ]
  },
  'Hybrid/Electric Systems': {
    icon: '🔋',
    description: 'Hybrid and electric vehicle diagnostics',
    functions: [
      'Battery pack diagnostics',
      'Motor/generator testing',
      'Charging system analysis',
      'High voltage safety',
      'Energy management',
      'Regenerative braking'
    ]
  },
  'Advanced Driver Assistance': {
    icon: '🎯',
    description: 'ADAS and autonomous driving features',
    functions: [
      'Radar sensor calibration',
      'Camera alignment',
      'Lane keeping assist',
      'Adaptive cruise control',
      'Collision avoidance systems',
      'Parking assistance'
    ]
  },
  'Network & Communication': {
    icon: '📡',
    description: 'Vehicle communication networks',
    functions: [
      'CAN bus diagnostics',
      'LIN bus testing',
      'FlexRay diagnostics',
      'Ethernet diagnostics',
      'Gateway testing',
      'Module communication'
    ]
  }
};

// Special Function Categories
export const SPECIAL_FUNCTION_CATEGORIES = {
  'DPF Management': {
    functions: SPECIAL_FUNCTIONS.filter(f => f.category === 'DPF'),
    description: 'Diesel Particulate Filter maintenance and regeneration'
  },
  'Service Resets': {
    functions: SPECIAL_FUNCTIONS.filter(f => f.category === 'Service Reset'),
    description: 'Reset service indicators and maintenance reminders'
  },
  'ECU Programming': {
    functions: SPECIAL_FUNCTIONS.filter(f => f.category === 'Programming'),
    description: 'ECU programming and key coding functions'
  },
  'System Adaptations': {
    functions: SPECIAL_FUNCTIONS.filter(f => f.category === 'Adaptation'),
    description: 'Adapt and calibrate vehicle systems'
  },
  'Component Testing': {
    functions: SPECIAL_FUNCTIONS.filter(f => f.category === 'Test'),
    description: 'Active component and actuator testing'
  },
  'Calibrations': {
    functions: SPECIAL_FUNCTIONS.filter(f => f.category === 'Calibration'),
    description: 'Sensor and system calibration procedures'
  }
};

export const getSpecialFunctionsByManufacturer = (manufacturer: string) => {
  return SPECIAL_FUNCTIONS.filter(func => 
    func.manufacturer.includes(manufacturer) || func.manufacturer.includes('All')
  );
};

export const getModulesByManufacturer = (manufacturer: string) => {
  return PROFESSIONAL_MODULES.filter(module => 
    module.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())
  );
};

export const getFunctionsByDifficulty = (difficulty: string) => {
  return SPECIAL_FUNCTIONS.filter(func => func.difficulty === difficulty);
};

export const getFunctionsByCategory = (category: string) => {
  return SPECIAL_FUNCTIONS.filter(func => func.category === category);
};

export default {
  SPECIAL_FUNCTIONS,
  PROFESSIONAL_MODULES,
  PROFESSIONAL_CATEGORIES,
  SPECIAL_FUNCTION_CATEGORIES,
  getSpecialFunctionsByManufacturer,
  getModulesByManufacturer,
  getFunctionsByDifficulty,
  getFunctionsByCategory
};
