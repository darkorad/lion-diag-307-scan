
import { VehicleModule } from '@/types/vehicleModules';

export const SEAT_IBIZA_MODULES: VehicleModule[] = [
  // ENGINE CONTROL MODULES
  {
    id: 'seat-ibiza-engine-ecu',
    name: 'Engine Control Unit (EDC16)',
    description: 'Main engine management system for SEAT Ibiza TDI engines',
    category: 'engine',
    ecuAddress: '01',
    protocols: ['CAN', 'KWP2000'],
    makeSpecific: ['Seat'],
    supportedFunctions: [
      {
        id: 'engine-dtc-read',
        name: 'Read Engine DTCs',
        type: 'read',
        description: 'Read diagnostic trouble codes from engine ECU',
        command: '03'
      },
      {
        id: 'engine-live-data',
        name: 'Engine Live Data',
        type: 'read',
        description: 'Real-time engine parameters monitoring',
        command: '01'
      },
      {
        id: 'injector-coding',
        name: 'Injector Coding/Calibration',
        type: 'coding',
        description: 'Code new injectors with IMA correction values',
        command: '2E1090',
        requiredLevel: 'advanced'
      },
      {
        id: 'dpf-regeneration',
        name: 'DPF Force Regeneration',
        type: 'actuator',
        description: 'Force diesel particulate filter regeneration',
        command: '31010F',
        requiredLevel: 'advanced'
      },
      {
        id: 'egr-learning',
        name: 'EGR Valve Learning',
        type: 'adaptation',
        description: 'Perform EGR valve position learning',
        command: '31010E',
        requiredLevel: 'advanced'
      }
    ]
  },

  // BODY CONTROL MODULE (BCM) - COMFORT SYSTEM
  {
    id: 'seat-ibiza-bcm',
    name: 'Body Control Module (BCM)',
    description: 'Central body electronics and comfort functions',
    category: 'body',
    ecuAddress: '09',
    protocols: ['CAN', 'LIN'],
    makeSpecific: ['Seat'],
    supportedFunctions: [
      {
        id: 'bcm-dtc-read',
        name: 'Read Body Control DTCs',
        type: 'read',
        description: 'Read body control system fault codes',
        command: '03'
      },
      {
        id: 'window-calibration',
        name: 'Window Calibration',
        type: 'calibration',
        description: 'Calibrate power window positions and auto-up/down',
        command: '31010A',
        requiredLevel: 'advanced'
      },
      {
        id: 'window-reset',
        name: 'Window Reset',
        type: 'adaptation',
        description: 'Reset window control modules after battery disconnect',
        command: '31020A',
        requiredLevel: 'basic'
      },
      {
        id: 'window-status',
        name: 'Window Status Check',
        type: 'read',
        description: 'Check status of all power windows',
        command: '225002'
      },
      {
        id: 'central-locking-test',
        name: 'Central Locking Test',
        type: 'actuator',
        description: 'Test central locking system operation',
        command: '2F1001',
        requiredLevel: 'basic'
      },
      {
        id: 'mirror-fold-test',
        name: 'Mirror Folding Test',
        type: 'actuator',
        description: 'Test electric mirror folding function',
        command: '2F1101',
        requiredLevel: 'basic'
      }
    ]
  },

  // WINDOW CONTROL MODULES (Individual)
  {
    id: 'seat-ibiza-window-fl',
    name: 'Front Left Window Module',
    description: 'Driver side window control module',
    category: 'comfort',
    ecuAddress: '52',
    protocols: ['LIN'],
    makeSpecific: ['Seat'],
    supportedFunctions: [
      {
        id: 'window-fl-calibration',
        name: 'FL Window Calibration',
        type: 'calibration',
        description: 'Calibrate driver window position sensors',
        command: '31010B'
      },
      {
        id: 'window-fl-auto-reset',
        name: 'FL Window Auto Function Reset',
        type: 'adaptation',
        description: 'Reset auto up/down function for driver window',
        command: '31020B'
      },
      {
        id: 'window-fl-position',
        name: 'FL Window Position',
        type: 'read',
        description: 'Read current driver window position',
        command: '225010'
      }
    ]
  },

  {
    id: 'seat-ibiza-window-fr',
    name: 'Front Right Window Module',
    description: 'Passenger side window control module',
    category: 'comfort',
    ecuAddress: '53',
    protocols: ['LIN'],
    makeSpecific: ['Seat'],
    supportedFunctions: [
      {
        id: 'window-fr-calibration',
        name: 'FR Window Calibration',
        type: 'calibration',
        description: 'Calibrate passenger window position sensors',
        command: '31010C'
      },
      {
        id: 'window-fr-auto-reset',
        name: 'FR Window Auto Function Reset',
        type: 'adaptation',
        description: 'Reset auto up/down function for passenger window',
        command: '31020C'
      },
      {
        id: 'window-fr-position',
        name: 'FR Window Position',
        type: 'read',
        description: 'Read current passenger window position',
        command: '225011'
      }
    ]
  },

  // INSTRUMENT CLUSTER
  {
    id: 'seat-ibiza-instrument',
    name: 'Instrument Cluster',
    description: 'Dashboard display and gauges control',
    category: 'comfort',
    ecuAddress: '17',
    protocols: ['CAN'],
    makeSpecific: ['Seat'],
    supportedFunctions: [
      {
        id: 'cluster-dtc-read',
        name: 'Read Cluster DTCs',
        type: 'read',
        description: 'Read instrument cluster fault codes',
        command: '03'
      },
      {
        id: 'service-reset',
        name: 'Service Interval Reset',
        type: 'adaptation',
        description: 'Reset service reminder intervals',
        command: '31013F',
        requiredLevel: 'advanced'
      },
      {
        id: 'odometer-read',
        name: 'Read Real Odometer',
        type: 'read',
        description: 'Read actual vehicle mileage',
        command: '221A0C'
      },
      {
        id: 'cluster-test',
        name: 'Cluster Self Test',
        type: 'actuator',
        description: 'Perform instrument cluster self-test',
        command: '2F1201'
      }
    ]
  },

  // CLIMATE CONTROL
  {
    id: 'seat-ibiza-climate',
    name: 'Climate Control (Climatronic)',
    description: 'Air conditioning and heating system',
    category: 'climate',
    ecuAddress: '08',
    protocols: ['CAN'],
    makeSpecific: ['Seat'],
    supportedFunctions: [
      {
        id: 'climate-dtc-read',
        name: 'Read Climate DTCs',
        type: 'read',
        description: 'Read climate control fault codes',
        command: '03'
      },
      {
        id: 'ac-compressor-test',
        name: 'A/C Compressor Test',
        type: 'actuator',
        description: 'Test air conditioning compressor',
        command: '2F1301',
        requiredLevel: 'basic'
      },
      {
        id: 'blend-door-calibration',
        name: 'Blend Door Calibration',
        type: 'calibration',
        description: 'Calibrate temperature blend doors',
        command: '31010D',
        requiredLevel: 'advanced'
      },
      {
        id: 'recirculation-test',
        name: 'Recirculation Flap Test',
        type: 'actuator',
        description: 'Test recirculation air flap operation',
        command: '2F1302'
      }
    ]
  },

  // ABS/ESP SYSTEM
  {
    id: 'seat-ibiza-abs',
    name: 'ABS/ESP Control Module',
    description: 'Anti-lock braking and electronic stability program',
    category: 'abs',
    ecuAddress: '03',
    protocols: ['CAN'],
    makeSpecific: ['Seat'],
    supportedFunctions: [
      {
        id: 'abs-dtc-read',
        name: 'Read ABS/ESP DTCs',
        type: 'read',
        description: 'Read ABS and ESP system fault codes',
        command: '03'
      },
      {
        id: 'brake-test',
        name: 'Brake System Test',
        type: 'actuator',
        description: 'Test ABS pump and valve operation',
        command: '2F0901',
        requiredLevel: 'advanced'
      },
      {
        id: 'wheel-speed-test',
        name: 'Wheel Speed Sensor Test',
        type: 'read',
        description: 'Test all four wheel speed sensors',
        command: '224003'
      },
      {
        id: 'brake-bleeding',
        name: 'Electronic Brake Bleeding',
        type: 'actuator',
        description: 'Automated brake bleeding procedure',
        command: '31010C',
        requiredLevel: 'advanced'
      }
    ]
  },

  // AIRBAG SYSTEM
  {
    id: 'seat-ibiza-airbag',
    name: 'Airbag Control Module',
    description: 'Supplemental restraint system control',
    category: 'airbag',
    ecuAddress: '15',
    protocols: ['CAN'],
    makeSpecific: ['Seat'],
    supportedFunctions: [
      {
        id: 'airbag-dtc-read',
        name: 'Read Airbag DTCs',
        type: 'read',
        description: 'Read airbag system fault codes',
        command: '03'
      },
      {
        id: 'crash-data-read',
        name: 'Read Crash Data',
        type: 'read',
        description: 'Read crash sensor data and events',
        command: '223001',
        requiredLevel: 'advanced'
      },
      {
        id: 'seat-occupancy-test',
        name: 'Seat Occupancy Sensor Test',
        type: 'read',
        description: 'Test passenger seat occupancy detection',
        command: '223010'
      }
    ]
  },

  // RADIO/INFOTAINMENT
  {
    id: 'seat-ibiza-radio',
    name: 'Radio/Navigation System',
    description: 'Infotainment and audio system control',
    category: 'comfort',
    ecuAddress: '56',
    protocols: ['CAN', 'MOST'],
    makeSpecific: ['Seat'],
    supportedFunctions: [
      {
        id: 'radio-dtc-read',
        name: 'Read Radio DTCs',
        type: 'read',
        description: 'Read radio system fault codes',
        command: '03'
      },
      {
        id: 'radio-coding',
        name: 'Radio Coding',
        type: 'coding',
        description: 'Code radio unit to vehicle',
        command: '2E2007',
        requiredLevel: 'dealer'
      },
      {
        id: 'bluetooth-reset',
        name: 'Bluetooth Module Reset',
        type: 'adaptation',
        description: 'Reset Bluetooth pairing and settings',
        command: '31014F'
      }
    ]
  },

  // STEERING WHEEL MODULE
  {
    id: 'seat-ibiza-steering',
    name: 'Steering Wheel Electronics',
    description: 'Steering wheel controls and airbag',
    category: 'comfort',
    ecuAddress: '16',
    protocols: ['LIN'],
    makeSpecific: ['Seat'],
    supportedFunctions: [
      {
        id: 'steering-dtc-read',
        name: 'Read Steering DTCs',
        type: 'read',
        description: 'Read steering control fault codes',
        command: '03'
      },
      {
        id: 'steering-angle-calibration',
        name: 'Steering Angle Calibration',
        type: 'calibration',
        description: 'Calibrate steering angle sensor',
        command: '31010G',
        requiredLevel: 'advanced'
      },
      {
        id: 'horn-test',
        name: 'Horn Test',
        type: 'actuator',
        description: 'Test horn operation',
        command: '2F1601'
      }
    ]
  },

  // TIRE PRESSURE MONITORING SYSTEM
  {
    id: 'seat-ibiza-tpms',
    name: 'TPMS Control Module',
    description: 'Tire pressure monitoring system',
    category: 'comfort',
    ecuAddress: '65',
    protocols: ['CAN', 'RF'],
    makeSpecific: ['Seat'],
    supportedFunctions: [
      {
        id: 'tpms-dtc-read',
        name: 'Read TPMS DTCs',
        type: 'read',
        description: 'Read tire pressure system fault codes',
        command: '03'
      },
      {
        id: 'tpms-sensor-learn',
        name: 'TPMS Sensor Learning',
        type: 'adaptation',
        description: 'Learn new TPMS sensor IDs',
        command: '31016F',
        requiredLevel: 'basic'
      },
      {
        id: 'tire-pressure-read',
        name: 'Read Tire Pressures',
        type: 'read',
        description: 'Read current tire pressure values',
        command: '226501'
      }
    ]
  },

  // GATEWAY MODULE
  {
    id: 'seat-ibiza-gateway',
    name: 'Central Gateway',
    description: 'CAN bus gateway and network control',
    category: 'body',
    ecuAddress: '19',
    protocols: ['CAN'],
    makeSpecific: ['Seat'],
    supportedFunctions: [
      {
        id: 'gateway-dtc-read',
        name: 'Read Gateway DTCs',
        type: 'read',
        description: 'Read gateway communication fault codes',
        command: '03'
      },
      {
        id: 'can-bus-test',
        name: 'CAN Bus Test',
        type: 'read',
        description: 'Test CAN bus communication integrity',
        command: '221900'
      },
      {
        id: 'network-scan',
        name: 'Network Module Scan',
        type: 'read',
        description: 'Scan for all connected modules',
        command: '221901'
      }
    ]
  },

  // ADVANCED MODULES

  // PARKING AID
  {
    id: 'seat-ibiza-parking',
    name: 'Parking Aid System',
    description: 'Park assist and parking sensors',
    category: 'comfort',
    ecuAddress: '10',
    protocols: ['CAN'],
    makeSpecific: ['Seat'],
    supportedFunctions: [
      {
        id: 'parking-dtc-read',
        name: 'Read Parking Aid DTCs',
        type: 'read',
        description: 'Read parking sensor fault codes',
        command: '03'
      },
      {
        id: 'sensor-test',
        name: 'Parking Sensor Test',
        type: 'actuator',
        description: 'Test individual parking sensors',
        command: '2F1001'
      },
      {
        id: 'sensor-calibration',
        name: 'Sensor Calibration',
        type: 'calibration',
        description: 'Calibrate parking sensor sensitivity',
        command: '31011F',
        requiredLevel: 'advanced'
      }
    ]
  },

  // HEADLIGHT CONTROL
  {
    id: 'seat-ibiza-headlight',
    name: 'Headlight Control Module',
    description: 'Xenon/LED headlight control and leveling',
    category: 'body',
    ecuAddress: 'A0',
    protocols: ['LIN'],
    makeSpecific: ['Seat'],
    supportedFunctions: [
      {
        id: 'headlight-dtc-read',
        name: 'Read Headlight DTCs',
        type: 'read',
        description: 'Read headlight control fault codes',
        command: '03'
      },
      {
        id: 'headlight-leveling-test',
        name: 'Headlight Leveling Test',
        type: 'actuator',
        description: 'Test automatic headlight leveling',
        command: '2FA001',
        requiredLevel: 'advanced'
      },
      {
        id: 'xenon-igniter-test',
        name: 'Xenon Igniter Test',
        type: 'actuator',
        description: 'Test xenon bulb igniters',
        command: '2FA002',
        requiredLevel: 'advanced'
      }
    ]
  },

  // FABRIC MODULE (for fabric roof/convertible models)
  {
    id: 'seat-ibiza-fabric',
    name: 'Fabric Roof Control',
    description: 'Convertible/fabric roof control system',
    category: 'body',
    ecuAddress: '46',
    protocols: ['CAN'],
    makeSpecific: ['Seat'],
    supportedFunctions: [
      {
        id: 'fabric-dtc-read',
        name: 'Read Fabric Roof DTCs',
        type: 'read',
        description: 'Read fabric roof system fault codes',
        command: '03'
      },
      {
        id: 'roof-calibration',
        name: 'Roof Position Calibration',
        type: 'calibration',
        description: 'Calibrate fabric roof position sensors',
        command: '31014F',
        requiredLevel: 'advanced'
      },
      {
        id: 'roof-motor-test',
        name: 'Roof Motor Test',
        type: 'actuator',
        description: 'Test fabric roof motors individually',
        command: '2F4601',
        requiredLevel: 'advanced'
      },
      {
        id: 'window-sync-reset',
        name: 'Window Sync Reset',
        type: 'adaptation',
        description: 'Reset window synchronization for roof operation',
        command: '31024F',
        requiredLevel: 'advanced'
      }
    ]
  },

  // ELECTRONIC POWER STEERING
  {
    id: 'seat-ibiza-eps',
    name: 'Electronic Power Steering',
    description: 'Electric power steering assistance',
    category: 'body',
    ecuAddress: '44',
    protocols: ['CAN'],
    makeSpecific: ['Seat'],
    supportedFunctions: [
      {
        id: 'eps-dtc-read',
        name: 'Read EPS DTCs',
        type: 'read',
        description: 'Read power steering fault codes',
        command: '03'
      },
      {
        id: 'steering-torque-calibration',
        name: 'Steering Torque Calibration',
        type: 'calibration',
        description: 'Calibrate steering torque sensor',
        command: '31014F',
        requiredLevel: 'advanced'
      },
      {
        id: 'eps-motor-test',
        name: 'EPS Motor Test',
        type: 'actuator',
        description: 'Test power steering motor operation',
        command: '2F4401',
        requiredLevel: 'advanced'
      }
    ]
  }
];

export const getSeatIbizaModulesByCategory = (category: string) => {
  return SEAT_IBIZA_MODULES.filter(module => module.category === category);
};

export const getSeatIbizaModuleById = (id: string) => {
  return SEAT_IBIZA_MODULES.find(module => module.id === id);
};

export const getSeatIbizaWindowModules = () => {
  return SEAT_IBIZA_MODULES.filter(module => 
    module.id.includes('window') || 
    module.id === 'seat-ibiza-bcm' ||
    module.id === 'seat-ibiza-fabric'
  );
};
