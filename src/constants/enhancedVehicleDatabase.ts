import { VehicleMake } from '@/types/vehicle';
import { VehicleModule } from '@/types/vehicleModules';

// Enhanced vehicle database with comprehensive coverage for Peugeot and SEAT (2000-present)
export const ENHANCED_VEHICLE_DATABASE: VehicleMake[] = [
  // PEUGEOT VEHICLES
  {
    id: 'peugeot',
    name: 'Peugeot',
    country: 'France',
    logo: '/src/assets/logos/peugeot-logo.png',
    models: [
      {
        id: 'peugeot-206',
        name: '206',
        generations: [
          {
            id: 'peugeot-206-gen1',
            name: 'First Generation (2000-2012)',
            yearRange: { start: 2000, end: 2012 },
            bodyTypes: ['Hatchback', 'Estate', 'Convertible'],
            engines: [
              {
                id: 'peugeot-206-1.4-hdi',
                name: '1.4L HDI',
                displacement: '1.4L',
                fuelType: 'Diesel',
                power: { hp: 68, kw: 50 },
                engineCode: '8HX',
                emissionStandard: 'Euro3',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221C50', '221C60', '221C40', '221C80', '221C81'],
                  dpf: []
                },
                pidMappings: {
                  TURBO_PRESSURE: '221C50',
                  RAIL_PRESSURE: '221C60',
                  EGR_POSITION: '221C40',
                  ENGINE_OIL_TEMP: '221C80',
                  OIL_PRESSURE: '221C81'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: false,
                  manufacturerProtocol: 'PSA',
                  hasAdvancedFunctions: true,
                  supportsComfortFunctions: true,
                  supportsBSIAccess: true,
                  serviceResetSupported: true
                }
              },
              {
                id: 'peugeot-206-1.6-petrol',
                name: '1.6L 16V Petrol',
                displacement: '1.6L',
                fuelType: 'Petrol',
                power: { hp: 110, kw: 81 },
                engineCode: 'TU5JP4',
                emissionStandard: 'Euro4',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2180', '2181', '2182', '2183', '2184', '2185']
                },
                pidMappings: {
                  ENGINE_TEMP: '2180',
                  THROTTLE_POS: '2181',
                  INTAKE_TEMP: '2182',
                  LAMBDA_VOLTAGE: '2183',
                  IGNITION_ADVANCE: '2184',
                  IDLE_SPEED: '2185'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: false,
                  hasTurbo: false,
                  manufacturerProtocol: 'PSA',
                  hasAdvancedFunctions: true,
                  supportsComfortFunctions: true,
                  supportsBSIAccess: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'peugeot-307',
        name: '307',
        generations: [
          {
            id: 'peugeot-307-gen1',
            name: 'First Generation (2001-2008)',
            yearRange: { start: 2001, end: 2008 },
            bodyTypes: ['Hatchback', 'Estate', 'Sedan'],
            engines: [
              {
                id: 'peugeot-307-1.4-petrol',
                name: '1.4L 16V Petrol',
                displacement: '1.4L',
                fuelType: 'Petrol',
                power: { hp: 88, kw: 65 },
                engineCode: 'TU3JP4',
                emissionStandard: 'Euro3',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2180', '2181', '2182', '2183', '2184', '2185']
                },
                pidMappings: {
                  ENGINE_TEMP: '2180',
                  THROTTLE_POS: '2181',
                  INTAKE_TEMP: '2182',
                  LAMBDA_VOLTAGE: '2183',
                  IGNITION_ADVANCE: '2184',
                  IDLE_SPEED: '2185'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: false,
                  hasTurbo: false,
                  manufacturerProtocol: 'PSA',
                  hasAdvancedFunctions: true,
                  supportsComfortFunctions: true,
                  supportsBSIAccess: true
                }
              },
              {
                id: 'peugeot-307-1.6-hdi-110hp',
                name: '1.6L HDI 110HP',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 110, kw: 80 },
                engineCode: '9HZ (DV6TED4)',
                emissionStandard: 'Euro4',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F', '0133', '013C'],
                  manufacturer: ['2260', '2261', '2262', '2263', '2264', '2265', '2266', '2267', '2268', '2269', '226A', '226B'],
                  dpf: ['2262', '2263', '2264', '2265', '226A', '226B']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2262',
                  DPF_OUTLET_TEMP: '2263',
                  DPF_DIFF_PRESSURE: '2264',
                  DPF_SOOT_LOAD: '2265',
                  TURBO_PRESSURE: '2260',
                  RAIL_PRESSURE: '2261',
                  EGR_POSITION: '2266',
                  BOOST_PRESSURE: '2267',
                  FUEL_TEMP: '2268',
                  ENGINE_OIL_TEMP: '2269',
                  DPF_REGENERATION_STATUS: '226A',
                  INJECTOR_CORRECTION: '226B'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'PSA',
                  useOlderProtocol: false,
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true,
                  hasAdvancedFunctions: true,
                  supportsComfortFunctions: true,
                  supportsBSIAccess: true,
                  injectorCodingSupported: true,
                  serviceResetSupported: true,
                  particleFilterType: 'FAP',
                  fuelSystem: 'Common Rail',
                  turboType: 'Variable Geometry'
                }
              },
              {
                id: 'peugeot-307-2.0-hdi-136hp',
                name: '2.0L HDI 136HP',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 136, kw: 100 },
                engineCode: 'RHR (DW10BTED4)',
                emissionStandard: 'Euro4',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F', '0133'],
                  manufacturer: ['2270', '2271', '2272', '2273', '2274', '2275', '2276', '2277', '2278', '2279'],
                  dpf: ['2272', '2273', '2274', '2275']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2272',
                  DPF_OUTLET_TEMP: '2273',
                  DPF_DIFF_PRESSURE: '2274',
                  DPF_SOOT_LOAD: '2275',
                  TURBO_PRESSURE: '2270',
                  RAIL_PRESSURE: '2271',
                  EGR_POSITION: '2276',
                  BOOST_PRESSURE: '2277',
                  ENGINE_OIL_TEMP: '2278',
                  EXHAUST_TEMP: '2279'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'PSA',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true,
                  hasAdvancedFunctions: true,
                  supportsComfortFunctions: true,
                  supportsBSIAccess: true,
                  injectorCodingSupported: true,
                  serviceResetSupported: true,
                  particleFilterType: 'FAP',
                  fuelSystem: 'Common Rail',
                  turboType: 'Variable Geometry'
                }
              }
            ]
          },
          {
            id: 'peugeot-307-gen2',
            name: 'Second Generation (2008-2014)',
            yearRange: { start: 2008, end: 2014 },
            bodyTypes: ['Hatchback', 'Estate', 'SW'],
            engines: [
              {
                id: 'peugeot-307-1.6-thp-150hp',
                name: '1.6L THP 150HP',
                displacement: '1.6L',
                fuelType: 'Petrol',
                power: { hp: 150, kw: 110 },
                engineCode: 'EP6DT',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221C50', '221C60', '221C40', '221C80', '221C81', '221C90']
                },
                pidMappings: {
                  TURBO_PRESSURE: '221C50',
                  RAIL_PRESSURE: '221C60',
                  EGR_POSITION: '221C40',
                  ENGINE_OIL_TEMP: '221C80',
                  OIL_PRESSURE: '221C81',
                  GLOW_PLUG_STATUS: '221C90'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'PSA',
                  hasAdvancedFunctions: true,
                  supportsComfortFunctions: true,
                  supportsBSIAccess: true,
                  turboType: 'Variable Geometry'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'peugeot-308',
        name: '308',
        generations: [
          {
            id: 'peugeot-308-gen1',
            name: 'First Generation (2007-2013)',
            yearRange: { start: 2007, end: 2013 },
            bodyTypes: ['Hatchback', 'SW'],
            engines: [
              {
                id: 'peugeot-308-1.6-hdi-112hp',
                name: '1.6L HDI 112HP',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 112, kw: 82 },
                engineCode: 'DV6C',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221C30', '221C31', '221C32', '221C34', '221C40', '221C50', '221C60', '221C80'],
                  dpf: ['221C30', '221C31', '221C32', '221C34']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C30',
                  DPF_OUTLET_TEMP: '221C31',
                  DPF_DIFF_PRESSURE: '221C32',
                  DPF_SOOT_LOAD: '221C34',
                  EGR_POSITION: '221C40',
                  TURBO_PRESSURE: '221C50',
                  RAIL_PRESSURE: '221C60',
                  ENGINE_OIL_TEMP: '221C80'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'PSA',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true,
                  hasAdvancedFunctions: true,
                  supportsComfortFunctions: true,
                  supportsBSIAccess: true,
                  particleFilterType: 'FAP',
                  fuelSystem: 'Common Rail'
                }
              }
            ]
          },
          {
            id: 'peugeot-308-gen2',
            name: 'Second Generation (2013-2019)',
            yearRange: { start: 2013, end: 2019 },
            bodyTypes: ['Hatchback', 'SW'],
            engines: [
              {
                id: 'peugeot-308-1.6-bluehdi-120hp',
                name: '1.6L BlueHDi 120HP',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 120, kw: 88 },
                engineCode: 'DK5C',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221C30', '221C31', '221C32', '221C34', '221C40', '221C50', '221C60', '221C70', '221C71', '221C72', '221C80'],
                  dpf: ['221C30', '221C31', '221C32', '221C34']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C30',
                  DPF_OUTLET_TEMP: '221C31',
                  DPF_DIFF_PRESSURE: '221C32',
                  DPF_SOOT_LOAD: '221C34',
                  EGR_POSITION: '221C40',
                  TURBO_PRESSURE: '221C50',
                  RAIL_PRESSURE: '221C60',
                  ADBLUE_LEVEL: '221C70',
                  NOX_SENSOR_UPSTREAM: '221C71',
                  NOX_SENSOR_DOWNSTREAM: '221C72',
                  ENGINE_OIL_TEMP: '221C80'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  hasAdBlue: true,
                  manufacturerProtocol: 'PSA',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true,
                  hasAdvancedFunctions: true,
                  supportsComfortFunctions: true,
                  supportsBSIAccess: true,
                  particleFilterType: 'FAP',
                  fuelSystem: 'Common Rail'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'peugeot-508',
        name: '508',
        generations: [
          {
            id: 'peugeot-508-gen1',
            name: 'First Generation (2011-2018)',
            yearRange: { start: 2011, end: 2018 },
            bodyTypes: ['Sedan', 'SW'],
            engines: [
              {
                id: 'peugeot-508-2.0-hdi-163hp',
                name: '2.0L HDI 163HP',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 163, kw: 120 },
                engineCode: 'DW12U',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221C30', '221C31', '221C32', '221C34', '221C40', '221C50', '221C60', '221C80'],
                  dpf: ['221C30', '221C31', '221C32', '221C34']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C30',
                  DPF_OUTLET_TEMP: '221C31',
                  DPF_DIFF_PRESSURE: '221C32',
                  DPF_SOOT_LOAD: '221C34',
                  EGR_POSITION: '221C40',
                  TURBO_PRESSURE: '221C50',
                  RAIL_PRESSURE: '221C60',
                  ENGINE_OIL_TEMP: '221C80'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'PSA',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true,
                  hasAdvancedFunctions: true,
                  supportsComfortFunctions: true,
                  supportsBSIAccess: true,
                  particleFilterType: 'FAP',
                  fuelSystem: 'Common Rail'
                }
              }
            ]
          }
        ]
      }
    ]
  },
  // SEAT VEHICLES
  {
    id: 'seat',
    name: 'SEAT',
    country: 'Spain',
    logo: '/src/assets/logos/seat-logo.png',
    models: [
      {
        id: 'seat-ibiza',
        name: 'Ibiza',
        generations: [
          {
            id: 'seat-ibiza-gen3',
            name: 'Third Generation (2002-2008)',
            yearRange: { start: 2002, end: 2008 },
            bodyTypes: ['Hatchback'],
            engines: [
              {
                id: 'seat-ibiza-1.4tdi',
                name: '1.4L TDI',
                displacement: '1.4L',
                fuelType: 'Diesel',
                power: { hp: 75, kw: 55 },
                engineCode: 'AMF',
                emissionStandard: 'Euro4',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F40C', '22F446', '22F190'],
                  dpf: []
                },
                pidMappings: {
                  BOOST_PRESSURE: '22F40C',
                  EGR_POSITION: '22F446',
                  GLOW_PLUG_RELAY: '22F190'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'VAG',
                  hasAdvancedFunctions: true,
                  supportsLongCoding: true,
                  supportsBasicSettings: true
                }
              }
            ]
          },
          {
            id: 'seat-ibiza-gen4',
            name: 'Fourth Generation (2008-2017)',
            yearRange: { start: 2008, end: 2017 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'seat-ibiza-1.2-tsi',
                name: '1.2L TSI',
                displacement: '1.2L',
                fuelType: 'Petrol',
                power: { hp: 105, kw: 77 },
                engineCode: 'CBZB',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2201', '2202', '2203', '2204', '2205', '2206']
                },
                pidMappings: {
                  BOOST_PRESSURE: '2201',
                  INTAKE_TEMP: '2202',
                  MAF_RATE: '2203',
                  THROTTLE_POS: '2204',
                  IGNITION_ADVANCE: '2205',
                  LAMBDA_VOLTAGE: '2206'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'VAG'
                }
              },
              {
                id: 'seat-ibiza-1.6tdi',
                name: '1.6L TDI',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 90, kw: 66 },
                engineCode: 'CAYC',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F40C', '22F40D', '22F446', '22F447', '22F602', '22F603', '22F604', '22F605'],
                  dpf: ['22F602', '22F603', '22F604', '22F605']
                },
                pidMappings: {
                  BOOST_PRESSURE: '22F40C',
                  EGR_POSITION: '22F446',
                  DPF_PRESSURE: '22F602',
                  DPF_SOOT_MASS: '22F603',
                  DPF_TEMP_BEFORE: '22F604',
                  DPF_TEMP_AFTER: '22F605'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'VAG',
                  hasAdvancedFunctions: true,
                  dpfRegenerationSupported: true,
                  supportsLongCoding: true,
                  supportsBasicSettings: true,
                  supportsOutputTests: true,
                  hasSecurityAccess: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'seat-leon',
        name: 'León',
        generations: [
          {
            id: 'seat-leon-gen2',
            name: 'Second Generation (2005-2012)',
            yearRange: { start: 2005, end: 2012 },
            bodyTypes: ['Hatchback', 'Sportstourer'],
            engines: [
              {
                id: 'seat-leon-1.9tdi',
                name: '1.9L TDI',
                displacement: '1.9L',
                fuelType: 'Diesel',
                power: { hp: 105, kw: 77 },
                engineCode: 'BKC',
                emissionStandard: 'Euro4',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F40C', '22F446', '22F190'],
                  dpf: []
                },
                pidMappings: {
                  BOOST_PRESSURE: '22F40C',
                  EGR_POSITION: '22F446',
                  GLOW_PLUG_RELAY: '22F190'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'VAG',
                  hasAdvancedFunctions: true,
                  supportsLongCoding: true,
                  supportsBasicSettings: true
                }
              }
            ]
          },
          {
            id: 'seat-leon-gen3',
            name: 'Third Generation (2012-2020)',
            yearRange: { start: 2012, end: 2020 },
            bodyTypes: ['Hatchback', 'ST'],
            engines: [
              {
                id: 'seat-leon-2.0tdi',
                name: '2.0L TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 150, kw: 110 },
                engineCode: 'CRBC',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F40C', '22F40D', '22F446', '22F447', '22F602', '22F603', '22F604', '22F605', '22F1A0', '22F1A1', '22F1A2', '22F1A3']
                },
                pidMappings: {
                  BOOST_PRESSURE: '22F40C',
                  EGR_POSITION: '22F446',
                  DPF_PRESSURE: '22F602',
                  DPF_SOOT_MASS: '22F603',
                  ADBLUE_LEVEL: '22F1A0',
                  ADBLUE_QUALITY: '22F1A1',
                  NOX_SENSOR_1: '22F1A2',
                  NOX_SENSOR_2: '22F1A3'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  hasAdBlue: true,
                  manufacturerProtocol: 'VAG',
                  hasAdvancedFunctions: true,
                  dpfRegenerationSupported: true,
                  supportsLongCoding: true,
                  supportsBasicSettings: true,
                  supportsOutputTests: true,
                  hasSecurityAccess: true
                }
              }
            ]
          }
        ]
      }
    ]
  }
];

// Enhanced modules with bi-directional controls for all systems
export const ENHANCED_VEHICLE_MODULES: VehicleModule[] = [
  // ENGINE MODULES
  {
    id: 'engine-ecu',
    name: 'Engine ECU',
    description: 'Main engine control unit with full bi-directional capabilities',
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
      },
      {
        id: 'egr-learning',
        name: 'EGR Valve Learning',
        type: 'adaptation',
        description: 'Perform EGR valve position learning',
        requiredLevel: 'advanced'
      },
      {
        id: 'dpf-regeneration',
        name: 'DPF Force Regeneration',
        type: 'actuator',
        description: 'Force diesel particulate filter regeneration',
        requiredLevel: 'advanced'
      },
      {
        id: 'fuel-pump-test',
        name: 'Fuel Pump Test',
        type: 'actuator',
        description: 'Test fuel pump operation',
        requiredLevel: 'advanced'
      },
      {
        id: 'glow-plug-test',
        name: 'Glow Plug Test',
        type: 'actuator',
        description: 'Test glow plug operation',
        requiredLevel: 'basic'
      },
      {
        id: 'ignition-coil-test',
        name: 'Ignition Coil Test',
        type: 'actuator',
        description: 'Test ignition coil operation',
        requiredLevel: 'basic'
      }
    ]
  },
  
  // TRANSMISSION MODULE
  {
    id: 'transmission-ecu',
    name: 'Transmission ECU',
    description: 'Automatic transmission control unit with adaptation capabilities',
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
      },
      {
        id: 'torque-converter-test',
        name: 'Torque Converter Test',
        type: 'actuator',
        description: 'Test torque converter clutch operation',
        requiredLevel: 'advanced'
      },
      {
        id: 'shift-solenoid-test',
        name: 'Shift Solenoid Test',
        type: 'actuator',
        description: 'Test transmission shift solenoids',
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
      },
      {
        id: 'esp-calibration',
        name: 'ESP Calibration',
        type: 'calibration',
        description: 'Calibrate steering angle and yaw rate sensors',
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
      },
      {
        id: 'airbag-reset',
        name: 'Airbag System Reset',
        type: 'write',
        description: 'Reset airbag system after deployment or repair',
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
      },
      {
        id: 'blower-test',
        name: 'Blower Motor Test',
        type: 'actuator',
        description: 'Test blower motor operation'
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
      },
      {
        id: 'horn-test',
        name: 'Horn Test',
        type: 'actuator',
        description: 'Test horn operation'
      },
      {
        id: 'wiper-test',
        name: 'Wiper Test',
        type: 'actuator',
        description: 'Test wiper motor operation'
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
      },
      {
        id: 'dpf-clear',
        name: 'Clear DPF Data',
        type: 'write',
        description: 'Clear DPF soot load data',
        requiredLevel: 'advanced'
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
  },

  // STEERING MODULE
  {
    id: 'steering-module',
    name: 'Steering Control Module',
    description: 'Electric power steering system',
    category: 'body',
    ecuAddress: '26',
    protocols: ['CAN'],
    supportedFunctions: [
      {
        id: 'steering-angle-reset',
        name: 'Steering Angle Reset',
        type: 'adaptation',
        description: 'Reset steering angle sensor',
        requiredLevel: 'advanced'
      },
      {
        id: 'steering-motor-test',
        name: 'Steering Motor Test',
        type: 'actuator',
        description: 'Test electric power steering motor',
        requiredLevel: 'advanced'
      }
    ]
  },

  // INSTRUMENT CLUSTER
  {
    id: 'instrument-cluster',
    name: 'Instrument Cluster',
    description: 'Dashboard display and gauges control',
    category: 'comfort',
    ecuAddress: '17',
    protocols: ['CAN'],
    supportedFunctions: [
      {
        id: 'cluster-dtc',
        name: 'Read Cluster Codes',
        type: 'read',
        description: 'Read instrument cluster fault codes'
      },
      {
        id: 'cluster-reset',
        name: 'Cluster Reset',
        type: 'adaptation',
        description: 'Reset instrument cluster settings',
        requiredLevel: 'basic'
      },
      {
        id: 'service-reset',
        name: 'Service Indicator Reset',
        type: 'write',
        description: 'Reset service interval indicator',
        requiredLevel: 'basic'
      },
      {
        id: 'oil-reset',
        name: 'Oil Change Reset',
        type: 'write',
        description: 'Reset oil change service indicator',
        requiredLevel: 'basic'
      },
      {
        id: 'gauge-test',
        name: 'Gauge Test',
        type: 'actuator',
        description: 'Test all instrument cluster gauges',
        requiredLevel: 'basic'
      }
    ]
  },
  
  // SUSPENSION MODULE
  {
    id: 'suspension-module',
    name: 'Suspension Control Module',
    description: 'Air suspension and damping control system',
    category: 'comfort',
    ecuAddress: '3A',
    protocols: ['CAN'],
    supportedFunctions: [
      {
        id: 'suspension-dtc',
        name: 'Read Suspension Codes',
        type: 'read',
        description: 'Read air suspension fault codes'
      },
      {
        id: 'height-calibration',
        name: 'Height Calibration',
        type: 'calibration',
        description: 'Calibrate suspension height sensors',
        requiredLevel: 'advanced'
      },
      {
        id: 'compressor-test',
        name: 'Compressor Test',
        type: 'actuator',
        description: 'Test air suspension compressor',
        requiredLevel: 'advanced'
      },
      {
        id: 'damper-test',
        name: 'Damper Test',
        type: 'actuator',
        description: 'Test adaptive damping actuators',
        requiredLevel: 'advanced'
      }
    ]
  },
  
  // LIGHTING MODULE
  {
    id: 'lighting-module',
    name: 'Lighting Control Module',
    description: 'Advanced lighting system control',
    category: 'body',
    ecuAddress: '3C',
    protocols: ['CAN', 'LIN'],
    supportedFunctions: [
      {
        id: 'lighting-dtc',
        name: 'Read Lighting Codes',
        type: 'read',
        description: 'Read lighting system fault codes'
      },
      {
        id: 'adaptive-light-test',
        name: 'Adaptive Light Test',
        type: 'actuator',
        description: 'Test adaptive headlight actuators',
        requiredLevel: 'advanced'
      },
      {
        id: 'led-calibration',
        name: 'LED Calibration',
        type: 'calibration',
        description: 'Calibrate LED lighting modules',
        requiredLevel: 'advanced'
      }
    ]
  },
  
  // PARKING ASSIST MODULE
  {
    id: 'parking-assist-module',
    name: 'Parking Assist Module',
    description: 'Parking sensors and camera system',
    category: 'comfort',
    ecuAddress: '40',
    protocols: ['CAN'],
    supportedFunctions: [
      {
        id: 'parking-dtc',
        name: 'Read Parking Assist Codes',
        type: 'read',
        description: 'Read parking assist system fault codes'
      },
      {
        id: 'sensor-test',
        name: 'Sensor Test',
        type: 'actuator',
        description: 'Test parking sensors',
        requiredLevel: 'basic'
      },
      {
        id: 'camera-calibration',
        name: 'Camera Calibration',
        type: 'calibration',
        description: 'Calibrate parking camera',
        requiredLevel: 'advanced'
      }
    ]
  },
  
  // INFOTAINMENT MODULE
  {
    id: 'infotainment-module',
    name: 'Infotainment Module',
    description: 'Navigation and entertainment system',
    category: 'comfort',
    ecuAddress: '6C',
    protocols: ['CAN', 'MOST', 'Ethernet'],
    supportedFunctions: [
      {
        id: 'infotainment-dtc',
        name: 'Read Infotainment Codes',
        type: 'read',
        description: 'Read infotainment system fault codes'
      },
      {
        id: 'bluetooth-reset',
        name: 'Bluetooth Reset',
        type: 'adaptation',
        description: 'Reset Bluetooth module',
        requiredLevel: 'basic'
      },
      {
        id: 'nav-calibration',
        name: 'Navigation Calibration',
        type: 'calibration',
        description: 'Calibrate navigation system',
        requiredLevel: 'advanced'
      }
    ]
  },
  
  // BATTERY MANAGEMENT MODULE
  {
    id: 'battery-module',
    name: 'Battery Management Module',
    description: 'Battery monitoring and charging system',
    category: 'engine',
    ecuAddress: '19',
    protocols: ['CAN'],
    supportedFunctions: [
      {
        id: 'battery-dtc',
        name: 'Read Battery Codes',
        type: 'read',
        description: 'Read battery management fault codes'
      },
      {
        id: 'battery-registration',
        name: 'Battery Registration',
        type: 'coding',
        description: 'Register new battery',
        requiredLevel: 'advanced'
      },
      {
        id: 'charging-test',
        name: 'Charging System Test',
        type: 'actuator',
        description: 'Test alternator and charging',
        requiredLevel: 'basic'
      }
    ]
  }
];