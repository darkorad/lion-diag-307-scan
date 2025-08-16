
import { VehicleModule } from '@/types/vehicleModules';

export const VEHICLE_MODULES: VehicleModule[] = [
  // ENGINE MODULES
  {
    id: 'engine-ecu',
    name: 'Engine ECU',
    description: 'Main engine control unit',
    category: 'engine',
    ecuAddress: '01',
    protocols: ['CAN', 'KWP2000', 'ISO14230'],
    supportedFunctions: [
      {
        id: 'read-dtc',
        name: 'Read Diagnostic Trouble Codes',
        type: 'read',
        description: 'Read all stored engine fault codes'
      },
      {
        id: 'clear-dtc',
        name: 'Clear Fault Codes',
        type: 'write',
        description: 'Clear all diagnostic trouble codes'
      },
      {
        id: 'live-data',
        name: 'Live Data Stream',
        type: 'read',
        description: 'Real-time engine parameters'
      },
      {
        id: 'injector-coding',
        name: 'Injector Coding',
        type: 'coding',
        description: 'Code new injectors with correction values',
        requiredLevel: 'advanced'
      },
      {
        id: 'throttle-adaptation',
        name: 'Throttle Body Adaptation',
        type: 'adaptation',
        description: 'Adapt throttle body position',
        requiredLevel: 'advanced'
      }
    ]
  },
  
  // TRANSMISSION MODULE
  {
    id: 'transmission-ecu',
    name: 'Transmission ECU',
    description: 'Automatic transmission control unit',
    category: 'transmission',
    ecuAddress: '02',
    protocols: ['CAN', 'KWP2000'],
    supportedFunctions: [
      {
        id: 'trans-dtc',
        name: 'Read Transmission Codes',
        type: 'read',
        description: 'Read transmission fault codes'
      },
      {
        id: 'gear-adaptation',
        name: 'Gear Shift Adaptation',
        type: 'adaptation',
        description: 'Adapt gear shift points',
        requiredLevel: 'advanced'
      },
      {
        id: 'clutch-adaptation',
        name: 'Clutch Adaptation',
        type: 'adaptation',
        description: 'Adapt clutch engagement points',
        requiredLevel: 'advanced'
      }
    ]
  },

  // ABS MODULE
  {
    id: 'abs-ecu',
    name: 'ABS/ESP Module',
    description: 'Anti-lock braking system and electronic stability program',
    category: 'abs',
    ecuAddress: '03',
    protocols: ['CAN'],
    supportedFunctions: [
      {
        id: 'abs-dtc',
        name: 'Read ABS Codes',
        type: 'read',
        description: 'Read ABS and ESP fault codes'
      },
      {
        id: 'brake-test',
        name: 'Brake System Test',
        type: 'actuator',
        description: 'Test ABS pump and valves',
        requiredLevel: 'advanced'
      },
      {
        id: 'wheel-speed-cal',
        name: 'Wheel Speed Calibration',
        type: 'calibration',
        description: 'Calibrate wheel speed sensors',
        requiredLevel: 'advanced'
      },
      {
        id: 'brake-bleeding',
        name: 'Brake Bleeding',
        type: 'actuator',
        description: 'Automated brake bleeding procedure',
        requiredLevel: 'advanced'
      }
    ]
  },

  // AIRBAG MODULE
  {
    id: 'airbag-ecu',
    name: 'Airbag/SRS Module',
    description: 'Supplemental restraint system',
    category: 'airbag',
    ecuAddress: '15',
    protocols: ['CAN', 'KWP2000'],
    supportedFunctions: [
      {
        id: 'srs-dtc',
        name: 'Read SRS Codes',
        type: 'read',
        description: 'Read airbag system fault codes'
      },
      {
        id: 'crash-data',
        name: 'Read Crash Data',
        type: 'read',
        description: 'Read crash sensor data and events',
        requiredLevel: 'advanced'
      }
    ]
  },

  // CLIMATE CONTROL
  {
    id: 'climate-ecu',
    name: 'Climate Control',
    description: 'Air conditioning and heating system',
    category: 'climate',
    ecuAddress: '08',
    protocols: ['CAN', 'LIN'],
    supportedFunctions: [
      {
        id: 'ac-test',
        name: 'A/C Compressor Test',
        type: 'actuator',
        description: 'Test air conditioning compressor'
      },
      {
        id: 'blend-door-cal',
        name: 'Blend Door Calibration',
        type: 'calibration',
        description: 'Calibrate temperature blend doors'
      }
    ]
  },

  // BODY CONTROL MODULE
  {
    id: 'body-ecu',
    name: 'Body Control Module',
    description: 'Central body electronics',
    category: 'body',
    ecuAddress: '09',
    protocols: ['CAN', 'LIN'],
    supportedFunctions: [
      {
        id: 'light-test',
        name: 'Light System Test',
        type: 'actuator',
        description: 'Test all exterior lights'
      },
      {
        id: 'window-cal',
        name: 'Window Calibration',
        type: 'calibration',
        description: 'Calibrate power window positions'
      },
      {
        id: 'central-locking',
        name: 'Central Locking Test',
        type: 'actuator',
        description: 'Test central locking system'
      }
    ]
  },

  // TPMS MODULE
  {
    id: 'tpms-ecu',
    name: 'TPMS Module',
    description: 'Tire pressure monitoring system',
    category: 'comfort',
    ecuAddress: '65',
    protocols: ['CAN', 'RF'],
    supportedFunctions: [
      {
        id: 'tpms-learn',
        name: 'TPMS Sensor Learning',
        type: 'adaptation',
        description: 'Learn new TPMS sensor IDs'
      },
      {
        id: 'tire-pressure',
        name: 'Read Tire Pressures',
        type: 'read',
        description: 'Read current tire pressures'
      }
    ]
  },

  // DPF MANAGEMENT
  {
    id: 'dpf-module',
    name: 'DPF Management',
    description: 'Diesel particulate filter system',
    category: 'engine',
    ecuAddress: '01',
    protocols: ['CAN'],
    makeSpecific: ['Peugeot', 'Citroen', 'Renault', 'Volkswagen', 'Audi', 'BMW'],
    supportedFunctions: [
      {
        id: 'dpf-regen',
        name: 'Force DPF Regeneration',
        type: 'actuator',
        description: 'Force diesel particulate filter regeneration',
        requiredLevel: 'advanced'
      },
      {
        id: 'dpf-status',
        name: 'DPF Status',
        type: 'read',
        description: 'Read DPF soot load and temperature'
      }
    ]
  },

  // EPB MODULE
  {
    id: 'epb-module',
    name: 'Electronic Parking Brake',
    description: 'Electronic parking brake system',
    category: 'abs',
    ecuAddress: '53',
    protocols: ['CAN'],
    supportedFunctions: [
      {
        id: 'epb-service',
        name: 'EPB Service Mode',
        type: 'actuator',
        description: 'Retract EPB for brake service',
        requiredLevel: 'advanced'
      },
      {
        id: 'epb-calibration',
        name: 'EPB Calibration',
        type: 'calibration',
        description: 'Calibrate parking brake position',
        requiredLevel: 'advanced'
      }
    ]
  }
];

export const getModulesByCategory = (category: string) => {
  return VEHICLE_MODULES.filter(module => module.category === category);
};

export const getModuleById = (id: string) => {
  return VEHICLE_MODULES.find(module => module.id === id);
};

export const getSupportedModulesForMake = (make: string) => {
  return VEHICLE_MODULES.filter(module => 
    !module.makeSpecific || module.makeSpecific.includes(make)
  );
};
