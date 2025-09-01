
import { VehicleMake } from '@/types/vehicle';

export const COMPREHENSIVE_VEHICLE_DATABASE: VehicleMake[] = [
  {
    id: 'audi',
    name: 'Audi',
    country: 'Germany',
    logo: '/src/assets/logos/audi-logo.png',
    models: [
      {
        id: 'audi-a3',
        name: 'A3',
        generations: [
          {
            id: 'audi-a3-gen1',
            name: 'First Generation (8L)',
            yearRange: { start: 1996, end: 2003 },
            bodyTypes: ['Hatchback'],
            engines: [
              {
                id: 'audi-a3-2000-1.8t',
                name: '1.8L TFSI Turbo',
                displacement: '1.8L',
                fuelType: 'Petrol',
                power: { hp: 150, kw: 110 },
                engineCode: 'AUM',
                emissionStandard: 'Euro3',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F40C', '22F40D', '22F446', '22F447', '22F190', '22F191']
                },
                pidMappings: {
                  BOOST_PRESSURE: '22F40C',
                  BOOST_PRESSURE_SPECIFIED: '22F40D',
                  EGR_POSITION: '22F446',
                  EGR_DUTY_CYCLE: '22F447',
                  GLOW_PLUG_RELAY: '22F190',
                  GLOW_PLUG_STATUS: '22F191'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'VAG',
                  hasAdvancedFunctions: true,
                  supportsLongCoding: true,
                  supportsBasicSettings: true,
                  supportsOutputTests: true,
                  hasSecurityAccess: true
                }
              },
              {
                id: 'audi-a3-2002-1.9tdi',
                name: '1.9L TDI',
                displacement: '1.9L',
                fuelType: 'Diesel',
                power: { hp: 130, kw: 96 },
                engineCode: 'ASZ',
                emissionStandard: 'Euro3',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F40C', '22F446', '22F190', '22F191'],
                  dpf: []
                },
                pidMappings: {
                  BOOST_PRESSURE: '22F40C',
                  EGR_POSITION: '22F446',
                  GLOW_PLUG_RELAY: '22F190',
                  GLOW_PLUG_STATUS: '22F191'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'VAG',
                  hasAdvancedFunctions: true,
                  supportsLongCoding: true,
                  supportsBasicSettings: true,
                  supportsOutputTests: true
                }
              }
            ]
          },
          {
            id: 'audi-a3-gen2',
            name: 'Second Generation (8P)',
            yearRange: { start: 2003, end: 2012 },
            bodyTypes: ['Hatchback', 'Convertible'],
            engines: [
              {
                id: 'audi-a3-2005-2.0tdi',
                name: '2.0L TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 140, kw: 103 },
                engineCode: 'BKD',
                emissionStandard: 'Euro4',
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
          },
          {
            id: 'audi-a3-gen3',
            name: 'Third Generation (8V)',
            yearRange: { start: 2012, end: 2020 },
            bodyTypes: ['Hatchback', 'Sedan', 'Convertible'],
            engines: [
              {
                id: 'audi-a3-2015-2.0-tdi',
                name: '2.0 TDI',
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
      },
      {
        id: 'audi-a4',
        name: 'A4',
        generations: [
          {
            id: 'audi-a4-b6',
            name: 'B6 Generation',
            yearRange: { start: 2000, end: 2005 },
            bodyTypes: ['Sedan', 'Avant'],
            engines: [
              {
                id: 'audi-a4-2002-1.9tdi',
                name: '1.9L TDI',
                displacement: '1.9L',
                fuelType: 'Diesel',
                power: { hp: 130, kw: 96 },
                engineCode: 'AWX',
                emissionStandard: 'Euro3',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F40C', '22F446', '22F190']
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
          }
        ]
      }
    ]
  },
  {
    id: 'bmw',
    name: 'BMW',
    country: 'Germany',
    logo: '/src/assets/logos/bmw-logo.png',
    models: [
      {
        id: 'bmw-3series',
        name: '3 Series',
        generations: [
          {
            id: 'bmw-3series-e46',
            name: 'E46 Generation',
            yearRange: { start: 1998, end: 2006 },
            bodyTypes: ['Sedan', 'Touring', 'Coupe', 'Convertible'],
            engines: [
              {
                id: 'bmw-320d-2002',
                name: '2.0L Diesel',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 150, kw: 110 },
                engineCode: 'M47D20',
                emissionStandard: 'Euro3',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F300', '22F310', '22F320', '22F330']
                },
                pidMappings: {
                  SUSPENSION_FL: '22F300',
                  STEERING_ANGLE: '22F310',
                  BRAKE_PEDAL: '22F320',
                  TIRE_PRESSURE_FL: '22F330'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'BMW',
                  hasAdvancedFunctions: true,
                  suspensionCalibration: true,
                  steeringAngleReset: true,
                  serviceReset: true
                }
              }
            ]
          },
          {
            id: 'bmw-3series-e90',
            name: 'E90 Generation',
            yearRange: { start: 2005, end: 2012 },
            bodyTypes: ['Sedan', 'Touring', 'Coupe', 'Convertible'],
            engines: [
              {
                id: 'bmw-320d-2008',
                name: '2.0L Diesel',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 177, kw: 130 },
                engineCode: 'N47D20',
                emissionStandard: 'Euro4',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F300', '22F301', '22F302', '22F303', '22F310', '22F320', '22F330'],
                  dpf: ['22F602', '22F603', '22F604']
                },
                pidMappings: {
                  SUSPENSION_FL: '22F300',
                  SUSPENSION_FR: '22F301',
                  SUSPENSION_RL: '22F302',
                  SUSPENSION_RR: '22F303',
                  STEERING_ANGLE: '22F310',
                  BRAKE_PEDAL: '22F320',
                  TIRE_PRESSURE_FL: '22F330'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'BMW',
                  hasAdvancedFunctions: true,
                  dpfRegenerationSupported: true,
                  suspensionCalibration: true,
                  steeringAngleReset: true,
                  serviceReset: true,
                  brakeAdaptation: true
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'mercedes',
    name: 'Mercedes-Benz',
    country: 'Germany',
    logo: '/src/assets/logos/mercedes-logo.png',
    models: [
      {
        id: 'mercedes-c-class',
        name: 'C-Class',
        generations: [
          {
            id: 'mercedes-c-class-w203',
            name: 'W203 Generation',
            yearRange: { start: 2000, end: 2007 },
            bodyTypes: ['Sedan', 'Estate', 'Coupe'],
            engines: [
              {
                id: 'mercedes-c220-2003',
                name: '2.2L CDI',
                displacement: '2.2L',
                fuelType: 'Diesel',
                power: { hp: 150, kw: 110 },
                engineCode: 'OM646',
                emissionStandard: 'Euro3',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F300', '22F310', '22F320']
                },
                pidMappings: {
                  SUSPENSION_POSITION: '22F300',
                  STEERING_ANGLE: '22F310',
                  BRAKE_PEDAL: '22F320'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'Mercedes',
                  hasAdvancedFunctions: true,
                  serviceReset: true,
                  brakeAdaptation: true
                }
              }
            ]
          },
          {
            id: 'mercedes-c-class-w204',
            name: 'W204 Generation',
            yearRange: { start: 2007, end: 2014 },
            bodyTypes: ['Sedan', 'Estate', 'Coupe'],
            engines: [
              {
                id: 'mercedes-c220-2010',
                name: '2.2L CDI BlueEFFICIENCY',
                displacement: '2.2L',
                fuelType: 'Diesel',
                power: { hp: 170, kw: 125 },
                engineCode: 'OM651',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F300', '22F310', '22F320', '22F330'],
                  dpf: ['22F602', '22F603', '22F604']
                },
                pidMappings: {
                  SUSPENSION_POSITION: '22F300',
                  STEERING_ANGLE: '22F310',
                  BRAKE_PEDAL: '22F320',
                  TIRE_PRESSURE: '22F330'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'Mercedes',
                  hasAdvancedFunctions: true,
                  dpfRegenerationSupported: true,
                  serviceReset: true,
                  brakeAdaptation: true
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'volkswagen',
    name: 'Volkswagen',
    country: 'Germany',
    logo: '/src/assets/logos/volkswagen-logo.png',
    models: [
      {
        id: 'volkswagen-golf',
        name: 'Golf',
        generations: [
          {
            id: 'volkswagen-golf-mk4',
            name: 'Mk4 Generation',
            yearRange: { start: 1997, end: 2003 },
            bodyTypes: ['Hatchback', 'Estate', 'Convertible'],
            engines: [
              {
                id: 'volkswagen-golf-2001-1.9tdi',
                name: '1.9L TDI',
                displacement: '1.9L',
                fuelType: 'Diesel',
                power: { hp: 110, kw: 81 },
                engineCode: 'ALH',
                emissionStandard: 'Euro3',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F40C', '22F446', '22F190']
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
                  supportsBasicSettings: true,
                  supportsOutputTests: true
                }
              }
            ]
          },
          {
            id: 'volkswagen-golf-mk5',
            name: 'Mk5 Generation',
            yearRange: { start: 2003, end: 2008 },
            bodyTypes: ['Hatchback', 'Estate', 'Plus'],
            engines: [
              {
                id: 'volkswagen-golf-2005-2.0tdi',
                name: '2.0L TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 140, kw: 103 },
                engineCode: 'BKD',
                emissionStandard: 'Euro4',
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
          },
          {
            id: 'volkswagen-golf-mk7',
            name: 'Mk7 Generation',
            yearRange: { start: 2012, end: 2020 },
            bodyTypes: ['Hatchback', 'Estate', 'Sportsvan'],
            engines: [
              {
                id: 'volkswagen-golf-2013-2.0-tdi',
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
      },
      {
        id: 'volkswagen-passat',
        name: 'Passat',
        generations: [
          {
            id: 'volkswagen-passat-b5',
            name: 'B5 Generation',
            yearRange: { start: 1996, end: 2005 },
            bodyTypes: ['Sedan', 'Estate'],
            engines: [
              {
                id: 'volkswagen-passat-2002-1.9tdi',
                name: '1.9L TDI',
                displacement: '1.9L',
                fuelType: 'Diesel',
                power: { hp: 130, kw: 96 },
                engineCode: 'AWX',
                emissionStandard: 'Euro3',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F40C', '22F446', '22F190']
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
          }
        ]
      }
    ]
  },
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
            name: 'First Generation',
            yearRange: { start: 1998, end: 2012 },
            bodyTypes: ['Hatchback', 'Estate', 'Convertible'],
            engines: [
              {
                id: 'peugeot-206-2002-1.4hdi',
                name: '1.4L HDI',
                displacement: '1.4L',
                fuelType: 'Diesel',
                power: { hp: 68, kw: 50 },
                engineCode: '8HX',
                emissionStandard: 'Euro3',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221C50', '221C60', '221C40']
                },
                pidMappings: {
                  TURBO_PRESSURE: '221C50',
                  RAIL_PRESSURE: '221C60',
                  EGR_POSITION: '221C40'
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
                id: 'peugeot-206-2005-1.6petrol',
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
            name: 'First Generation',
            yearRange: { start: 2001, end: 2005 },
            bodyTypes: ['Hatchback', 'Estate', 'Sedan'],
            engines: [
              {
                id: 'peugeot-307-2001-1.4-petrol',
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
              }
            ]
          },
          {
            id: 'peugeot-307-gen2-restyling',
            name: 'Restyling (Phase 2)',
            yearRange: { start: 2005, end: 2008 },
            bodyTypes: ['Hatchbook', 'Estate', 'SW'],
            engines: [
              {
                id: 'peugeot-307-2006-1.6-hdi-110hp',
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
                id: 'peugeot-307-2006-1.6-hdi-80kw-110hp-restyling',
                name: '1.6L HDI 80kW/110HP Restyling',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 110, kw: 80 },
                engineCode: '9HZ (DV6TED4)',
                emissionStandard: 'Euro4',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F', '0133', '013C'],
                  manufacturer: ['2260', '2261', '2262', '2263', '2264', '2265', '2266', '2267', '2268', '2269', '226A', '226B', '226C', '226D'],
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
                  INJECTOR_CORRECTION: '226B',
                  EXHAUST_TEMP: '226C',
                  TURBO_ACTUATOR: '226D'
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
                  turboType: 'Variable Geometry',
                  isRestylingVersion: true
                }
              },
              {
                id: 'peugeot-307-2006-1.6-hdi-90hp',
                name: '1.6L HDI 90HP',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 90, kw: 66 },
                engineCode: '9HX (DV6ATED4)',
                emissionStandard: 'Euro4',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2250', '2251', '2252', '2253', '2254', '2255', '2256', '2257']
                },
                pidMappings: {
                  TURBO_PRESSURE: '2250',
                  RAIL_PRESSURE: '2251',
                  EGR_POSITION: '2252',
                  FUEL_TEMP: '2253',
                  ENGINE_OIL_TEMP: '2254',
                  BOOST_PRESSURE: '2255',
                  INTAKE_TEMP: '2256',
                  EXHAUST_TEMP: '2257'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'PSA',
                  useOlderProtocol: false,
                  advancedDiagnostics: true,
                  hasAdvancedFunctions: true,
                  supportsComfortFunctions: true,
                  supportsBSIAccess: true,
                  fuelSystem: 'Common Rail',
                  turboType: 'Fixed Geometry'
                }
              },
              {
                id: 'peugeot-307-2006-2.0-hdi-136hp',
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
          }
        ]
      },
      {
        id: 'peugeot-3008',
        name: '3008',
        generations: [
          {
            id: 'peugeot-3008-gen1',
            name: 'First Generation',
            yearRange: { start: 2009, end: 2016 },
            bodyTypes: ['SUV'],
            engines: [
              {
                id: 'peugeot-3008-2020-diesel',
                name: '1.5L BlueHDi',
                displacement: '1.5L',
                fuelType: 'Diesel',
                power: { hp: 130, kw: 96 },
                engineCode: 'YHZ',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['227C', '227D', '227E', '227F', '2200', '2201', '2202'],
                  dpf: ['227C', '227D', '227E', '227F']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '227C',
                  DPF_OUTLET_TEMP: '227D',
                  DPF_DIFF_PRESSURE: '227E',
                  DPF_SOOT_LOAD: '227F',
                  TURBO_PRESSURE: '2200',
                  RAIL_PRESSURE: '2201',
                  EGR_POSITION: '2202'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'PSA',
                  hasAdvancedFunctions: true
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'seat',
    name: 'Seat',
    country: 'Spain',
    logo: '/src/assets/logos/seat-logo.png',
    models: [
      {
        id: 'seat-ibiza',
        name: 'Ibiza',
        generations: [
          {
            id: 'seat-ibiza-gen3',
            name: 'Third Generation (6L)',
            yearRange: { start: 2002, end: 2008 },
            bodyTypes: ['Hatchback'],
            engines: [
              {
                id: 'seat-ibiza-2005-1.4tdi',
                name: '1.4L TDI',
                displacement: '1.4L',
                fuelType: 'Diesel',
                power: { hp: 75, kw: 55 },
                engineCode: 'AMF',
                emissionStandard: 'Euro4',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F40C', '22F446', '22F190']
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
            name: 'Fourth Generation (6J)',
            yearRange: { start: 2008, end: 2017 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'seat-ibiza-2010-1.2-tsi',
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
                id: 'seat-ibiza-2010-1.6tdi',
                name: '1.6L TDI',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 105, kw: 77 },
                engineCode: 'CAYC',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F40C', '22F446', '22F602', '22F603', '22F604', '22F605'],
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
                  supportsOutputTests: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'seat-leon',
        name: 'Leon',
        generations: [
          {
            id: 'seat-leon-gen1',
            name: 'First Generation (1M)',
            yearRange: { start: 1999, end: 2006 },
            bodyTypes: ['Hatchback'],
            engines: [
              {
                id: 'seat-leon-2003-1.9tdi',
                name: '1.9L TDI',
                displacement: '1.9L',
                fuelType: 'Diesel',
                power: { hp: 150, kw: 110 },
                engineCode: 'ASZ',
                emissionStandard: 'Euro3',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F40C', '22F446', '22F190']
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
          }
        ]
      }
    ]
  },
  {
    id: 'skoda',
    name: 'Skoda',
    country: 'Czech Republic',
    logo: '/src/assets/logos/skoda-logo.png',
    models: [
      {
        id: 'skoda-fabia',
        name: 'Fabia',
        generations: [
          {
            id: 'skoda-fabia-gen1',
            name: 'First Generation (6Y)',
            yearRange: { start: 1999, end: 2007 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'skoda-fabia-2003-1.4tdi',
                name: '1.4L TDI',
                displacement: '1.4L',
                fuelType: 'Diesel',
                power: { hp: 75, kw: 55 },
                engineCode: 'AMF',
                emissionStandard: 'Euro3',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F40C', '22F446', '22F190']
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
          }
        ]
      },
      {
        id: 'skoda-octavia',
        name: 'Octavia',
        generations: [
          {
            id: 'skoda-octavia-gen1',
            name: 'First Generation (1U)',
            yearRange: { start: 1996, end: 2010 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'skoda-octavia-2002-1.9tdi',
                name: '1.9L TDI',
                displacement: '1.9L',
                fuelType: 'Diesel',
                power: { hp: 130, kw: 96 },
                engineCode: 'ASZ',
                emissionStandard: 'Euro3',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F40C', '22F446', '22F190']
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
            id: 'skoda-octavia-gen3',
            name: 'Third Generation (5E)',
            yearRange: { start: 2013, end: 2020 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'skoda-octavia-2015-2.0-tdi',
                name: '2.0 TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 150, kw: 110 },
                engineCode: 'CRMB',
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
  },
  {
    id: 'renault',
    name: 'Renault',
    country: 'France',
    logo: '/src/assets/logos/renault-logo.png',
    models: [
      {
        id: 'renault-megane',
        name: 'Megane',
        generations: [
          {
            id: 'renault-megane-gen2',
            name: 'Second Generation',
            yearRange: { start: 2002, end: 2008 },
            bodyTypes: ['Hatchback', 'Estate', 'Coupe', 'Convertible'],
            engines: [
              {
                id: 'renault-megane-2005-1.5dci',
                name: '1.5 dCi',
                displacement: '1.5L',
                fuelType: 'Diesel',
                power: { hp: 105, kw: 77 },
                engineCode: 'K9K',
                emissionStandard: 'Euro4',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2230', '2231', '2232', '2233', '2234', '2235']
                },
                pidMappings: {
                  BOOST_PRESSURE: '2230',
                  EGR_FEEDBACK: '2231',
                  FUEL_RAIL_PRESSURE: '2232',
                  AIR_FLOW: '2233',
                  INJECTOR_TIMING: '2234',
                  COOLANT_TEMP: '2235'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'Renault',
                  hasAdvancedFunctions: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'renault-clio',
        name: 'Clio',
        generations: [
          {
            id: 'renault-clio-gen3',
            name: 'Third Generation',
            yearRange: { start: 2005, end: 2012 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'renault-clio-2008-1.5dci',
                name: '1.5 dCi',
                displacement: '1.5L',
                fuelType: 'Diesel',
                power: { hp: 85, kw: 63 },
                engineCode: 'K9K',
                emissionStandard: 'Euro4',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2230', '2231', '2232', '2233', '2234', '2235']
                },
                pidMappings: {
                  BOOST_PRESSURE: '2230',
                  EGR_FEEDBACK: '2231',
                  FUEL_RAIL_PRESSURE: '2232',
                  AIR_FLOW: '2233',
                  INJECTOR_TIMING: '2234',
                  COOLANT_TEMP: '2235'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'Renault',
                  hasAdvancedFunctions: true
                }
              }
            ]
          },
          {
            id: 'renault-clio-gen4',
            name: 'Fourth Generation',
            yearRange: { start: 2012, end: 2019 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'renault-clio-2015-1.5-dci',
                name: '1.5 dCi 90',
                displacement: '1.5L',
                fuelType: 'Diesel',
                power: { hp: 90, kw: 66 },
                engineCode: 'K9K',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2230', '2231', '2232', '2233', '2234', '2235']
                },
                pidMappings: {
                  BOOST_PRESSURE: '2230',
                  EGR_FEEDBACK: '2231',
                  FUEL_RAIL_PRESSURE: '2232',
                  AIR_FLOW: '2233',
                  INJECTOR_TIMING: '2234',
                  COOLANT_TEMP: '2235'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'Renault'
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'toyota',
    name: 'Toyota',
    country: 'Japan',
    logo: '/src/assets/logos/toyota-logo.png',
    models: [
      {
        id: 'toyota-yaris',
        name: 'Yaris',
        generations: [
          {
            id: 'toyota-yaris-gen2',
            name: 'Second Generation (XP90)',
            yearRange: { start: 2005, end: 2011 },
            bodyTypes: ['Hatchback', 'Sedan'],
            engines: [
              {
                id: 'toyota-yaris-2008-1.4d4d',
                name: '1.4 D-4D',
                displacement: '1.4L',
                fuelType: 'Diesel',
                power: { hp: 90, kw: 66 },
                engineCode: '1ND-TV',
                emissionStandard: 'Euro4',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2250', '2251', '2252', '2253', '2254', '2255']
                },
                pidMappings: {
                  THROTTLE_POS: '2250',
                  MAF_RATE: '2251',
                  IGNITION_ADVANCE: '2252',
                  O2_SENSOR_1: '2253',
                  O2_SENSOR_2: '2254',
                  ENGINE_LOAD: '2255'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: false,
                  manufacturerProtocol: 'Toyota',
                  hasAdvancedFunctions: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'toyota-corolla',
        name: 'Corolla',
        generations: [
          {
            id: 'toyota-corolla-e120',
            name: 'Ninth Generation (E120)',
            yearRange: { start: 2000, end: 2006 },
            bodyTypes: ['Sedan', 'Hatchback', 'Estate'],
            engines: [
              {
                id: 'toyota-corolla-2004-2.0d4d',
                name: '2.0 D-4D',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 116, kw: 85 },
                engineCode: '1CD-FTV',
                emissionStandard: 'Euro3',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2250', '2251', '2252', '2253', '2254', '2255']
                },
                pidMappings: {
                  THROTTLE_POS: '2250',
                  MAF_RATE: '2251',
                  IGNITION_ADVANCE: '2252',
                  O2_SENSOR_1: '2253',
                  O2_SENSOR_2: '2254',
                  ENGINE_LOAD: '2255'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'Toyota',
                  hasAdvancedFunctions: true
                }
              }
            ]
          },
          {
            id: 'toyota-corolla-e170',
            name: 'Eleventh Generation (E170)',
            yearRange: { start: 2013, end: 2019 },
            bodyTypes: ['Sedan', 'Hatchback', 'Estate'],
            engines: [
              {
                id: 'toyota-corolla-2015-1.8-vvt',
                name: '1.8L VVT-i',
                displacement: '1.8L',
                fuelType: 'Petrol',
                power: { hp: 140, kw: 103 },
                engineCode: '2ZR-FAE',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2250', '2251', '2252', '2253', '2254', '2255']
                },
                pidMappings: {
                  THROTTLE_POS: '2250',
                  MAF_RATE: '2251',
                  IGNITION_ADVANCE: '2252',
                  O2_SENSOR_1: '2253',
                  O2_SENSOR_2: '2254',
                  ENGINE_LOAD: '2255'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: false,
                  hasTurbo: false,
                  manufacturerProtocol: 'Toyota'
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ford',
    name: 'Ford',
    country: 'United States',
    logo: '/src/assets/logos/ford-logo.png',
    models: [
      {
        id: 'ford-focus',
        name: 'Focus',
        generations: [
          {
            id: 'ford-focus-gen1',
            name: 'First Generation',
            yearRange: { start: 1998, end: 2004 },
            bodyTypes: ['Hatchback', 'Sedan', 'Estate'],
            engines: [
              {
                id: 'ford-focus-2002-1.8tdci',
                name: '1.8L TDCi',
                displacement: '1.8L',
                fuelType: 'Diesel',
                power: { hp: 115, kw: 85 },
                engineCode: 'FFDA',
                emissionStandard: 'Euro3',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2280', '2281', '2282', '2283', '2284', '2285']
                },
                pidMappings: {
                  BOOST_PRESSURE: '2280',
                  EGR_POSITION: '2281',
                  RAIL_PRESSURE: '2282',
                  TURBO_ACTUATOR: '2283',
                  EXHAUST_TEMP: '2284',
                  FUEL_TEMP: '2285'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'Ford',
                  hasAdvancedFunctions: true
                }
              }
            ]
          },
          {
            id: 'ford-focus-gen2',
            name: 'Second Generation',
            yearRange: { start: 2004, end: 2010 },
            bodyTypes: ['Hatchback', 'Sedan', 'Estate'],
            engines: [
              {
                id: 'ford-focus-2008-1.6tdci',
                name: '1.6L TDCi',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 109, kw: 80 },
                engineCode: 'HHDA',
                emissionStandard: 'Euro4',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2280', '2281', '2282', '2283', '2284', '2285', '2286'],
                  dpf: ['2286', '2287', '2288', '2289']
                },
                pidMappings: {
                  BOOST_PRESSURE: '2280',
                  EGR_POSITION: '2281',
                  RAIL_PRESSURE: '2282',
                  TURBO_ACTUATOR: '2283',
                  EXHAUST_TEMP: '2284',
                  FUEL_TEMP: '2285',
                  DPF_PRESSURE: '2286'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'Ford',
                  hasAdvancedFunctions: true,
                  dpfRegenerationSupported: true
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'opel',
    name: 'Opel',
    country: 'Germany',
    logo: '/src/assets/logos/opel-logo.png',
    models: [
      {
        id: 'opel-astra',
        name: 'Astra',
        generations: [
          {
            id: 'opel-astra-g',
            name: 'Astra G',
            yearRange: { start: 1998, end: 2009 },
            bodyTypes: ['Hatchback', 'Estate', 'Sedan', 'Coupe', 'Convertible'],
            engines: [
              {
                id: 'opel-astra-2003-1.7cdti',
                name: '1.7L CDTI',
                displacement: '1.7L',
                fuelType: 'Diesel',
                power: { hp: 100, kw: 74 },
                engineCode: 'Z17DTH',
                emissionStandard: 'Euro3',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2290', '2291', '2292', '2293', '2294', '2295']
                },
                pidMappings: {
                  BOOST_PRESSURE: '2290',
                  EGR_POSITION: '2291',
                  RAIL_PRESSURE: '2292',
                  TURBO_ACTUATOR: '2293',
                  EXHAUST_TEMP: '2294',
                  FUEL_TEMP: '2295'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'GM',
                  hasAdvancedFunctions: true
                }
              }
            ]
          },
          {
            id: 'opel-astra-h',
            name: 'Astra H',
            yearRange: { start: 2004, end: 2014 },
            bodyTypes: ['Hatchback', 'Estate', 'Sedan', 'Coupe', 'Convertible'],
            engines: [
              {
                id: 'opel-astra-2008-1.9cdti',
                name: '1.9L CDTI',
                displacement: '1.9L',
                fuelType: 'Diesel',
                power: { hp: 150, kw: 110 },
                engineCode: 'Z19DTH',
                emissionStandard: 'Euro4',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2290', '2291', '2292', '2293', '2294', '2295', '2296'],
                  dpf: ['2296', '2297', '2298', '2299']
                },
                pidMappings: {
                  BOOST_PRESSURE: '2290',
                  EGR_POSITION: '2291',
                  RAIL_PRESSURE: '2292',
                  TURBO_ACTUATOR: '2293',
                  EXHAUST_TEMP: '2294',
                  FUEL_TEMP: '2295',
                  DPF_PRESSURE: '2296'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'GM',
                  hasAdvancedFunctions: true,
                  dpfRegenerationSupported: true
                }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'fiat',
    name: 'Fiat',
    country: 'Italy',
    logo: '/src/assets/logos/fiat-logo.png',
    models: [
      {
        id: 'fiat-punto',
        name: 'Punto',
        generations: [
          {
            id: 'fiat-punto-gen2',
            name: 'Second Generation (188)',
            yearRange: { start: 1999, end: 2010 },
            bodyTypes: ['Hatchback'],
            engines: [
              {
                id: 'fiat-punto-2005-1.3multijet',
                name: '1.3L Multijet',
                displacement: '1.3L',
                fuelType: 'Diesel',
                power: { hp: 75, kw: 55 },
                engineCode: '188A9.000',
                emissionStandard: 'Euro4',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22A0', '22A1', '22A2', '22A3', '22A4', '22A5']
                },
                pidMappings: {
                  BOOST_PRESSURE: '22A0',
                  EGR_POSITION: '22A1',
                  RAIL_PRESSURE: '22A2',
                  TURBO_ACTUATOR: '22A3',
                  EXHAUST_TEMP: '22A4',
                  FUEL_TEMP: '22A5'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'Fiat',
                  hasAdvancedFunctions: true
                }
              }
            ]
          },
          {
            id: 'fiat-punto-gen3',
            name: 'Third Generation (199)',
            yearRange: { start: 2005, end: 2018 },
            bodyTypes: ['Hatchbook'],
            engines: [
              {
                id: 'fiat-punto-2009-1.3multijet',
                name: '1.3L Multijet 16V',
                displacement: '1.3L',
                fuelType: 'Diesel',
                power: { hp: 90, kw: 66 },
                engineCode: '199A2.000',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22A0', '22A1', '22A2', '22A3', '22A4', '22A5', '22A6'],
                  dpf: ['22A6', '22A7', '22A8', '22A9']
                },
                pidMappings: {
                  BOOST_PRESSURE: '22A0',
                  EGR_POSITION: '22A1',
                  RAIL_PRESSURE: '22A2',
                  TURBO_ACTUATOR: '22A3',
                  EXHAUST_TEMP: '22A4',
                  FUEL_TEMP: '22A5',
                  DPF_PRESSURE: '22A6'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'Fiat',
                  hasAdvancedFunctions: true,
                  dpfRegenerationSupported: true
                }
              }
            ]
          }
        ]
      }
    ]
  }
];
