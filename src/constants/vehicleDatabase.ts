import { VehicleMake } from '@/types/vehicle';

export const VEHICLE_DATABASE: VehicleMake[] = [
  {
    id: 'peugeot',
    name: 'Peugeot',
    country: 'France',
    logo: '/src/assets/logos/peugeot-logo.png',
    models: [
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
            bodyTypes: ['Hatchback', 'Estate', 'SW'],
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
            id: 'volkswagen-golf-gen7',
            name: 'Seventh Generation (Mk7)',
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
                  manufacturer: ['2220', '2221', '2222', '2223', '2224', '2225']
                },
                pidMappings: {
                  BOOST_PRESSURE: '2220',
                  EGR_DUTY_CYCLE: '2221',
                  DPF_PRESSURE: '2222',
                  DPF_TEMP: '2223',
                  INJECTOR_PULSE: '2224',
                  MAF_RATE: '2225'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'VAG'
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
        id: 'renault-clio',
        name: 'Clio',
        generations: [
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
    id: 'skoda',
    name: 'Skoda',
    country: 'Czech Republic',
    logo: '/src/assets/logos/skoda-logo.png',
    models: [
      {
        id: 'skoda-octavia',
        name: 'Octavia',
        generations: [
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
                  manufacturer: ['2240', '2241', '2242', '2243', '2244', '2245']
                },
                pidMappings: {
                  BOOST_PRESSURE: '2240',
                  EGR_DUTY_CYCLE: '2241',
                  DPF_PRESSURE: '2242',
                  DPF_TEMP: '2243',
                  INJECTOR_PULSE: '2244',
                  MAF_RATE: '2245'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'VAG'
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
        id: 'toyota-corolla',
        name: 'Corolla',
        generations: [
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
                  manufacturer: ['2260', '2261', '2262', '2263', '2264', '2265']
                },
                pidMappings: {
                  BOOST_PRESSURE: '2260',
                  EGR_DUTY_CYCLE: '2261',
                  DPF_PRESSURE: '2262',
                  DPF_TEMP: '2263',
                  INJECTOR_PULSE: '2264',
                  MAF_RATE: '2265'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  manufacturerProtocol: 'VAG'
                }
              }
            ]
          }
        ]
      }
    ]
  }
];

export const getVehicleMakeById = (id: string): VehicleMake | undefined => {
  return VEHICLE_DATABASE.find(make => make.id === id);
};

export type { VehicleMake, VehicleModel, VehicleGeneration, VehicleEngine } from '@/types/vehicle';
