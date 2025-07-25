export interface VehicleMake {
  id: string;
  name: string;
  logo: string;
  country: string;
  models: VehicleModel[];
}

export interface VehicleModel {
  id: string;
  name: string;
  generations: VehicleGeneration[];
}

export interface VehicleGeneration {
  id: string;
  name: string;
  yearRange: {
    start: number;
    end: number;
  };
  engines: VehicleEngine[];
  bodyTypes: string[];
  image?: string;
}

export interface VehicleEngine {
  id: string;
  name: string;
  displacement: string;
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  power: {
    hp: number;
    kw: number;
  };
  engineCode: string;
  emissionStandard: string;
  supportedPids: {
    standard: string[];
    manufacturer: string[];
    dpf?: string[];
  };
  pidMappings: { [key: string]: string };
  specificParameters: {
    hasDPF?: boolean;
    hasEGR?: boolean;
    hasTurbo?: boolean;
    fuelType: string;
    emissionStandard: string;
    manufacturerProtocol: string;
    useOlderProtocol?: boolean;
    dpfRegenerationSupported?: boolean;
    advancedDiagnostics?: boolean;
    hasAdvancedFunctions?: boolean;
    supportsComfortFunctions?: boolean;
    supportsBSIAccess?: boolean;
  };
}

export const VEHICLE_DATABASE: VehicleMake[] = [
  {
    id: 'peugeot',
    name: 'Peugeot',
    logo: '/src/assets/logos/peugeot-logo.png',
    country: 'France',
    models: [
      {
        id: 'peugeot-208',
        name: '208',
        generations: [
          {
            id: 'peugeot-208-gen1',
            name: '208 I',
            yearRange: { start: 2012, end: 2019 },
            bodyTypes: ['Hatchback'],
            engines: [
              {
                id: 'peugeot-208-1.6-bluehdi-2015',
                name: '1.6 BlueHDi 100',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 100, kw: 73 },
                engineCode: 'DV6FC',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2270', '2271', '2272', '2273', '2274', '2275'],
                  dpf: ['2272', '2273', '2274']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2272',
                  DPF_OUTLET_TEMP: '2273',
                  DPF_SOOT_LOAD: '2274',
                  TURBO_PRESSURE: '2270',
                  RAIL_PRESSURE: '2271',
                  EGR_POSITION: '2275'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'PSA',
                  advancedDiagnostics: true,
                  dpfRegenerationSupported: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'peugeot-2008',
        name: '2008',
        generations: [
          {
            id: 'peugeot-2008-gen1',
            name: '2008 I',
            yearRange: { start: 2013, end: 2019 },
            bodyTypes: ['Crossover'],
            engines: [
              {
                id: 'peugeot-2008-1.6-bluehdi-2016',
                name: '1.6 BlueHDi 120',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 120, kw: 88 },
                engineCode: 'DV6FC',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2276', '2277', '2278', '2279', '227A', '227B'],
                  dpf: ['2278', '2279', '227A']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2278',
                  DPF_OUTLET_TEMP: '2279',
                  DPF_SOOT_LOAD: '227A',
                  TURBO_PRESSURE: '2276',
                  RAIL_PRESSURE: '2277',
                  EGR_POSITION: '227B'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'PSA',
                  advancedDiagnostics: true,
                  dpfRegenerationSupported: true
                }
              }
            ]
          },
          {
            id: 'peugeot-2008-gen2',
            name: '2008 II',
            yearRange: { start: 2019, end: 2024 },
            bodyTypes: ['Crossover'],
            engines: [
              {
                id: 'peugeot-2008-1.5-bluehdi-2020',
                name: '1.5 BlueHDi 130',
                displacement: '1.5L',
                fuelType: 'Diesel',
                power: { hp: 130, kw: 96 },
                engineCode: 'DV5RD',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['227C', '227D', '227E', '227F', '2200', '2201'],
                  dpf: ['227E', '227F', '2200']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '227E',
                  DPF_OUTLET_TEMP: '227F',
                  DPF_SOOT_LOAD: '2200',
                  TURBO_PRESSURE: '227C',
                  RAIL_PRESSURE: '227D',
                  EGR_POSITION: '2201'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'PSA',
                  advancedDiagnostics: true,
                  dpfRegenerationSupported: true
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
            name: '307 Phase 1',
            yearRange: { start: 2001, end: 2005 },
            bodyTypes: ['Hatchback', 'Estate', 'Sedan'],
            engines: [
              {
                id: 'peugeot-307-1.6-hdi-2006',
                name: '1.6 HDI 110',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 110, kw: 81 },
                engineCode: 'DV6TED4',
                emissionStandard: 'Euro4',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F', '0133', '013C'],
                  manufacturer: ['2260', '2261', '2262', '2263', '2264', '2265', '2266', '2267', '2268', '2269'],
                  dpf: ['2262', '2263', '2264', '2265']
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
                  ENGINE_OIL_TEMP: '2269'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro4',
                  manufacturerProtocol: 'PSA',
                  useOlderProtocol: true,
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true,
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
        id: 'peugeot-308',
        name: '308',
        generations: [
          {
            id: 'peugeot-308-gen1',
            name: '308 I',
            yearRange: { start: 2013, end: 2021 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'peugeot-308-1.6-bluehdi-2015',
                name: '1.6 BlueHDi 120',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 120, kw: 88 },
                engineCode: 'DV6FC',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2202', '2203', '2204', '2205', '2206', '2207'],
                  dpf: ['2204', '2205', '2206']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2204',
                  DPF_OUTLET_TEMP: '2205',
                  DPF_SOOT_LOAD: '2206',
                  TURBO_PRESSURE: '2202',
                  RAIL_PRESSURE: '2203',
                  EGR_POSITION: '2207'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'PSA',
                  advancedDiagnostics: true,
                  dpfRegenerationSupported: true
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
            name: '508 I',
            yearRange: { start: 2010, end: 2018 },
            bodyTypes: ['Sedan', 'Estate'],
            engines: [
              {
                id: 'peugeot-508-2.0-bluehdi-2015',
                name: '2.0 BlueHDi 180',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 180, kw: 132 },
                engineCode: 'DW10CTED4',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2208', '2209', '220A', '220B', '220C', '220D'],
                  dpf: ['220A', '220B', '220C']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '220A',
                  DPF_OUTLET_TEMP: '220B',
                  DPF_SOOT_LOAD: '220C',
                  TURBO_PRESSURE: '2208',
                  RAIL_PRESSURE: '2209',
                  EGR_POSITION: '220D'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'PSA',
                  advancedDiagnostics: true,
                  dpfRegenerationSupported: true
                }
              }
            ]
          },
          {
            id: 'peugeot-508-gen2',
            name: '508 II',
            yearRange: { start: 2018, end: 2024 },
            bodyTypes: ['Sedan', 'Estate'],
            engines: [
              {
                id: 'peugeot-508-2.0-bluehdi-2019',
                name: '2.0 BlueHDi 180',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 177, kw: 130 },
                engineCode: 'DW10RLD',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['220E', '220F', '2210', '2211', '2212', '2213'],
                  dpf: ['2210', '2211', '2212']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2210',
                  DPF_OUTLET_TEMP: '2211',
                  DPF_SOOT_LOAD: '2212',
                  TURBO_PRESSURE: '220E',
                  RAIL_PRESSURE: '220F',
                  EGR_POSITION: '2213'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'PSA',
                  advancedDiagnostics: true,
                  dpfRegenerationSupported: true
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
            name: '3008 I',
            yearRange: { start: 2010, end: 2016 },
            bodyTypes: ['Crossover'],
            engines: [
              {
                id: 'peugeot-3008-1.6-hdi-2012',
                name: '1.6 HDi 115',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 115, kw: 84 },
                engineCode: 'DV6TED4',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2214', '2215', '2216', '2217', '2218', '2219'],
                  dpf: ['2216', '2217', '2218']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2216',
                  DPF_OUTLET_TEMP: '2217',
                  DPF_SOOT_LOAD: '2218',
                  TURBO_PRESSURE: '2214',
                  RAIL_PRESSURE: '2215',
                  EGR_POSITION: '2219'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'PSA',
                  advancedDiagnostics: true,
                  dpfRegenerationSupported: true
                }
              }
            ]
          },
          {
            id: 'peugeot-3008-gen2',
            name: '3008 SUV',
            yearRange: { start: 2017, end: 2024 },
            bodyTypes: ['SUV'],
            engines: [
              {
                id: 'peugeot-3008-1.5-bluehdi-2020',
                name: '1.5 BlueHDi 130',
                displacement: '1.5L',
                fuelType: 'Diesel',
                power: { hp: 130, kw: 96 },
                engineCode: 'DV5RC',
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
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'PSA'
                }
              }
            ]
          }
        ]
      },
      {
        id: 'peugeot-5008',
        name: '5008',
        generations: [
          {
            id: 'peugeot-5008-gen1',
            name: '5008 I',
            yearRange: { start: 2010, end: 2017 },
            bodyTypes: ['MPV'],
            engines: [
              {
                id: 'peugeot-5008-1.6-hdi-2012',
                name: '1.6 HDi 115',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 115, kw: 84 },
                engineCode: 'DV6TED4',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221A', '221B', '221C', '221D', '221E', '221F'],
                  dpf: ['221C', '221D', '221E']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C',
                  DPF_OUTLET_TEMP: '221D',
                  DPF_SOOT_LOAD: '221E',
                  TURBO_PRESSURE: '221A',
                  RAIL_PRESSURE: '221B',
                  EGR_POSITION: '221F'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'PSA',
                  advancedDiagnostics: true,
                  dpfRegenerationSupported: true
                }
              }
            ]
          },
          {
            id: 'peugeot-5008-gen2',
            name: '5008 SUV',
            yearRange: { start: 2017, end: 2024 },
            bodyTypes: ['SUV'],
            engines: [
              {
                id: 'peugeot-5008-1.5-bluehdi-2019',
                name: '1.5 BlueHDi 130',
                displacement: '1.5L',
                fuelType: 'Diesel',
                power: { hp: 130, kw: 96 },
                engineCode: 'DV5RC',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2220', '2221', '2222', '2223', '2224', '2225'],
                  dpf: ['2222', '2223', '2224']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2222',
                  DPF_OUTLET_TEMP: '2223',
                  DPF_SOOT_LOAD: '2224',
                  TURBO_PRESSURE: '2220',
                  RAIL_PRESSURE: '2221',
                  EGR_POSITION: '2225'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'PSA',
                  advancedDiagnostics: true,
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
    id: 'seat',
    name: 'SEAT',
    logo: '/src/assets/logos/seat-logo.png',
    country: 'Spain',
    models: [
      {
        id: 'seat-ibiza',
        name: 'Ibiza',
        generations: [
          {
            id: 'seat-ibiza-gen4',
            name: 'Ibiza MK4',
            yearRange: { start: 2008, end: 2017 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'seat-ibiza-1.6-tdi-2010',
                name: '1.6 TDI',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 105, kw: 77 },
                engineCode: 'CAYB',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221A', '221B', '221C', '221D', '221E', '221F'],
                  dpf: ['221C', '221D', '221E']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C',
                  DPF_OUTLET_TEMP: '221D',
                  DPF_SOOT_LOAD: '221E',
                  TURBO_PRESSURE: '221A',
                  RAIL_PRESSURE: '221B',
                  EGR_POSITION: '221F'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  useOlderProtocol: true
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
    logo: '/src/assets/logos/volkswagen-logo.png',
    country: 'Germany',
    models: [
      {
        id: 'volkswagen-golf',
        name: 'Golf',
        generations: [
          {
            id: 'volkswagen-golf-mk6',
            name: 'Golf MK6',
            yearRange: { start: 2008, end: 2013 },
            bodyTypes: ['Hatchback', 'Estate', 'Cabriolet'],
            engines: [
              {
                id: 'volkswagen-golf-2.0-tdi-2010',
                name: '2.0 TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 140, kw: 103 },
                engineCode: 'CBAA',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221A', '221B', '221C', '221D', '221E', '221F', '2220'],
                  dpf: ['221C', '221D', '221E']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C',
                  DPF_OUTLET_TEMP: '221D',
                  DPF_SOOT_LOAD: '221E',
                  TURBO_PRESSURE: '221A',
                  RAIL_PRESSURE: '221B',
                  EGR_POSITION: '221F',
                  BOOST_SENSOR: '2220'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
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
    logo: '/src/assets/logos/renault-logo.png',
    country: 'France',
    models: [
      {
        id: 'renault-megane',
        name: 'Mégane',
        generations: [
          {
            id: 'renault-megane-gen3',
            name: 'Mégane III',
            yearRange: { start: 2008, end: 2016 },
            bodyTypes: ['Hatchback', 'Estate', 'Coupe', 'Cabriolet'],
            engines: [
              {
                id: 'renault-megane-1.5-dci-2010',
                name: '1.5 dCi',
                displacement: '1.5L',
                fuelType: 'Diesel',
                power: { hp: 110, kw: 81 },
                engineCode: 'K9K 636',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2280', '2281', '2282', '2283', '2284', '2285'],
                  dpf: ['2282', '2283', '2284']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2282',
                  DPF_OUTLET_TEMP: '2283',
                  DPF_SOOT_LOAD: '2284',
                  TURBO_PRESSURE: '2280',
                  RAIL_PRESSURE: '2281',
                  EGR_POSITION: '2285'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'Renault'
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
            id: 'renault-clio-gen4',
            name: 'Clio IV',
            yearRange: { start: 2012, end: 2019 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'renault-clio-1.5-dci-2014',
                name: '1.5 dCi',
                displacement: '1.5L',
                fuelType: 'Diesel',
                power: { hp: 90, kw: 66 },
                engineCode: 'K9K 612',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2290', '2291', '2292', '2293', '2294', '2295'],
                  dpf: ['2292', '2293', '2294']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2292',
                  DPF_OUTLET_TEMP: '2293',
                  DPF_SOOT_LOAD: '2294',
                  TURBO_PRESSURE: '2290',
                  RAIL_PRESSURE: '2291',
                  EGR_POSITION: '2295'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'Renault',
                  advancedDiagnostics: true,
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
    id: 'skoda',
    name: 'Škoda',
    logo: '/src/assets/logos/skoda-logo.png',
    country: 'Czech Republic',
    models: [
      {
        id: 'skoda-octavia',
        name: 'Octavia',
        generations: [
          {
            id: 'skoda-octavia-gen2',
            name: 'Octavia II',
            yearRange: { start: 2010, end: 2013 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'skoda-octavia-1.2-tsi-2010',
                name: '1.2 TSI',
                displacement: '1.2L',
                fuelType: 'Petrol',
                power: { hp: 105, kw: 77 },
                engineCode: 'CBZB',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456']
                },
                pidMappings: {
                  INTAKE_TEMP: '22F190',
                  BOOST_PRESSURE: '22F1A3',
                  THROTTLE_POSITION: '22F1A6',
                  IGNITION_TIMING: '22F40E',
                  FUEL_PRESSURE: '22F456'
                },
                specificParameters: {
                  hasTurbo: true,
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-octavia-1.6-tdi-2010',
                name: '1.6 TDI',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 105, kw: 77 },
                engineCode: 'CAYC',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221A', '221B', '221C', '221D', '221E', '221F'],
                  dpf: ['221C', '221D', '221E']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C',
                  DPF_OUTLET_TEMP: '221D',
                  DPF_SOOT_LOAD: '221E',
                  TURBO_PRESSURE: '221A',
                  RAIL_PRESSURE: '221B',
                  EGR_POSITION: '221F'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-octavia-2.0-tdi-2010',
                name: '2.0 TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 140, kw: 103 },
                engineCode: 'CBAA',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221A', '221B', '221C', '221D', '221E', '221F', '2220'],
                  dpf: ['221C', '221D', '221E']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C',
                  DPF_OUTLET_TEMP: '221D',
                  DPF_SOOT_LOAD: '221E',
                  TURBO_PRESSURE: '221A',
                  RAIL_PRESSURE: '221B',
                  EGR_POSITION: '221F',
                  BOOST_SENSOR: '2220'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              }
            ]
          },
          {
            id: 'skoda-octavia-gen3',
            name: 'Octavia III',
            yearRange: { start: 2013, end: 2020 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'skoda-octavia-1.0-tsi-2015',
                name: '1.0 TSI',
                displacement: '1.0L',
                fuelType: 'Petrol',
                power: { hp: 115, kw: 85 },
                engineCode: 'CHZB',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456', '22F187']
                },
                pidMappings: {
                  INTAKE_TEMP: '22F190',
                  BOOST_PRESSURE: '22F1A3',
                  THROTTLE_POSITION: '22F1A6',
                  IGNITION_TIMING: '22F40E',
                  FUEL_PRESSURE: '22F456',
                  CYLINDER_ACTIVATION: '22F187'
                },
                specificParameters: {
                  hasTurbo: true,
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-octavia-1.4-tsi-2015',
                name: '1.4 TSI',
                displacement: '1.4L',
                fuelType: 'Petrol',
                power: { hp: 150, kw: 110 },
                engineCode: 'CZEA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456', '22F187']
                },
                pidMappings: {
                  INTAKE_TEMP: '22F190',
                  BOOST_PRESSURE: '22F1A3',
                  THROTTLE_POSITION: '22F1A6',
                  IGNITION_TIMING: '22F40E',
                  FUEL_PRESSURE: '22F456',
                  CYLINDER_ACTIVATION: '22F187'
                },
                specificParameters: {
                  hasTurbo: true,
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-octavia-2.0-tdi-2015',
                name: '2.0 TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 150, kw: 110 },
                engineCode: 'CRLB',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221A', '221B', '221C', '221D', '221E', '221F', '2220', '2221'],
                  dpf: ['221C', '221D', '221E']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C',
                  DPF_OUTLET_TEMP: '221D',
                  DPF_SOOT_LOAD: '221E',
                  TURBO_PRESSURE: '221A',
                  RAIL_PRESSURE: '221B',
                  EGR_POSITION: '221F',
                  BOOST_SENSOR: '2220',
                  EXHAUST_TEMP: '2221'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true,
                  dpfRegenerationSupported: true
                }
              }
            ]
          },
          {
            id: 'skoda-octavia-gen4',
            name: 'Octavia IV',
            yearRange: { start: 2020, end: 2024 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'skoda-octavia-1.0-tsi-2020',
                name: '1.0 TSI',
                displacement: '1.0L',
                fuelType: 'Petrol',
                power: { hp: 110, kw: 81 },
                engineCode: 'DKLA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456', '22F187', '22F1E0']
                },
                pidMappings: {
                  INTAKE_TEMP: '22F190',
                  BOOST_PRESSURE: '22F1A3',
                  THROTTLE_POSITION: '22F1A6',
                  IGNITION_TIMING: '22F40E',
                  FUEL_PRESSURE: '22F456',
                  CYLINDER_ACTIVATION: '22F187',
                  MILD_HYBRID_STATUS: '22F1E0'
                },
                specificParameters: {
                  hasTurbo: true,
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-octavia-1.5-tsi-2020',
                name: '1.5 TSI',
                displacement: '1.5L',
                fuelType: 'Petrol',
                power: { hp: 150, kw: 110 },
                engineCode: 'DADA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456', '22F187', '22F1E0']
                },
                pidMappings: {
                  INTAKE_TEMP: '22F190',
                  BOOST_PRESSURE: '22F1A3',
                  THROTTLE_POSITION: '22F1A6',
                  IGNITION_TIMING: '22F40E',
                  FUEL_PRESSURE: '22F456',
                  CYLINDER_ACTIVATION: '22F187',
                  MILD_HYBRID_STATUS: '22F1E0'
                },
                specificParameters: {
                  hasTurbo: true,
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-octavia-2.0-tdi-2020',
                name: '2.0 TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 150, kw: 110 },
                engineCode: 'DFGA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221A', '221B', '221C', '221D', '221E', '221F', '2220', '2221', '2222'],
                  dpf: ['221C', '221D', '221E']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C',
                  DPF_OUTLET_TEMP: '221D',
                  DPF_SOOT_LOAD: '221E',
                  TURBO_PRESSURE: '221A',
                  RAIL_PRESSURE: '221B',
                  EGR_POSITION: '221F',
                  BOOST_SENSOR: '2220',
                  EXHAUST_TEMP: '2221',
                  AdBlue_LEVEL: '2222'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true,
                  dpfRegenerationSupported: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'skoda-fabia',
        name: 'Fabia',
        generations: [
          {
            id: 'skoda-fabia-gen2',
            name: 'Fabia II',
            yearRange: { start: 2010, end: 2014 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'skoda-fabia-1.2-tsi-2010',
                name: '1.2 TSI',
                displacement: '1.2L',
                fuelType: 'Petrol',
                power: { hp: 105, kw: 77 },
                engineCode: 'CBZB',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456']
                },
                pidMappings: {
                  INTAKE_TEMP: '22F190',
                  BOOST_PRESSURE: '22F1A3',
                  THROTTLE_POSITION: '22F1A6',
                  IGNITION_TIMING: '22F40E',
                  FUEL_PRESSURE: '22F456'
                },
                specificParameters: {
                  hasTurbo: true,
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-fabia-1.6-tdi-2010',
                name: '1.6 TDI',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 105, kw: 77 },
                engineCode: 'CAYC',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221A', '221B', '221C', '221D', '221E', '221F'],
                  dpf: ['221C', '221D', '221E']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C',
                  DPF_OUTLET_TEMP: '221D',
                  DPF_SOOT_LOAD: '221E',
                  TURBO_PRESSURE: '221A',
                  RAIL_PRESSURE: '221B',
                  EGR_POSITION: '221F'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              }
            ]
          },
          {
            id: 'skoda-fabia-gen3',
            name: 'Fabia III',
            yearRange: { start: 2014, end: 2021 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'skoda-fabia-1.0-tsi-2015',
                name: '1.0 TSI',
                displacement: '1.0L',
                fuelType: 'Petrol',
                power: { hp: 95, kw: 70 },
                engineCode: 'CHZB',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456']
                },
                pidMappings: {
                  INTAKE_TEMP: '22F190',
                  BOOST_PRESSURE: '22F1A3',
                  THROTTLE_POSITION: '22F1A6',
                  IGNITION_TIMING: '22F40E',
                  FUEL_PRESSURE: '22F456'
                },
                specificParameters: {
                  hasTurbo: true,
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'skoda-superb',
        name: 'Superb',
        generations: [
          {
            id: 'skoda-superb-gen2',
            name: 'Superb II',
            yearRange: { start: 2010, end: 2015 },
            bodyTypes: ['Sedan', 'Estate'],
            engines: [
              {
                id: 'skoda-superb-2.0-tdi-2010',
                name: '2.0 TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 140, kw: 103 },
                engineCode: 'CBAA',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221A', '221B', '221C', '221D', '221E', '221F', '2220'],
                  dpf: ['221C', '221D', '221E']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C',
                  DPF_OUTLET_TEMP: '221D',
                  DPF_SOOT_LOAD: '221E',
                  TURBO_PRESSURE: '221A',
                  RAIL_PRESSURE: '221B',
                  EGR_POSITION: '221F',
                  BOOST_SENSOR: '2220'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              }
            ]
          },
          {
            id: 'skoda-superb-gen3',
            name: 'Superb III',
            yearRange: { start: 2015, end: 2023 },
            bodyTypes: ['Sedan', 'Estate'],
            engines: [
              {
                id: 'skoda-superb-1.4-tsi-2015',
                name: '1.4 TSI',
                displacement: '1.4L',
                fuelType: 'Petrol',
                power: { hp: 150, kw: 110 },
                engineCode: 'CZEA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456', '22F187']
                },
                pidMappings: {
                  INTAKE_TEMP: '22F190',
                  BOOST_PRESSURE: '22F1A3',
                  THROTTLE_POSITION: '22F1A6',
                  IGNITION_TIMING: '22F40E',
                  FUEL_PRESSURE: '22F456',
                  CYLINDER_ACTIVATION: '22F187'
                },
                specificParameters: {
                  hasTurbo: true,
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-superb-2.0-tdi-2018',
                name: '2.0 TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 190, kw: 140 },
                engineCode: 'DFGA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221A', '221B', '221C', '221D', '221E', '221F', '2220', '2221', '2222'],
                  dpf: ['221C', '221D', '221E']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C',
                  DPF_OUTLET_TEMP: '221D',
                  DPF_SOOT_LOAD: '221E',
                  TURBO_PRESSURE: '221A',
                  RAIL_PRESSURE: '221B',
                  EGR_POSITION: '221F',
                  BOOST_SENSOR: '2220',
                  EXHAUST_TEMP: '2221',
                  AdBlue_LEVEL: '2222'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true,
                  dpfRegenerationSupported: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'skoda-kodiaq',
        name: 'Kodiaq',
        generations: [
          {
            id: 'skoda-kodiaq-gen1',
            name: 'Kodiaq I',
            yearRange: { start: 2016, end: 2024 },
            bodyTypes: ['SUV'],
            engines: [
              {
                id: 'skoda-kodiaq-2.0-tdi-2017',
                name: '2.0 TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 190, kw: 140 },
                engineCode: 'DFGA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221A', '221B', '221C', '221D', '221E', '221F', '2220', '2221', '2222'],
                  dpf: ['221C', '221D', '221E']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C',
                  DPF_OUTLET_TEMP: '221D',
                  DPF_SOOT_LOAD: '221E',
                  TURBO_PRESSURE: '221A',
                  RAIL_PRESSURE: '221B',
                  EGR_POSITION: '221F',
                  BOOST_SENSOR: '2220',
                  EXHAUST_TEMP: '2221',
                  AdBlue_LEVEL: '2222'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true,
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
    id: 'toyota',
    name: 'Toyota',
    logo: '/src/assets/logos/toyota-logo.png',
    country: 'Japan',
    models: [
      {
        id: 'toyota-corolla',
        name: 'Corolla',
        generations: [
          {
            id: 'toyota-corolla-gen11',
            name: 'Corolla XI',
            yearRange: { start: 2013, end: 2019 },
            bodyTypes: ['Hatchback', 'Sedan'],
            engines: [
              {
                id: 'toyota-corolla-1.4-d4d-2015',
                name: '1.4 D-4D',
                displacement: '1.4L',
                fuelType: 'Diesel',
                power: { hp: 90, kw: 66 },
                engineCode: '1ND-TV',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2300', '2301', '2302', '2303', '2304', '2305'],
                  dpf: ['2302', '2303', '2304']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2302',
                  DPF_OUTLET_TEMP: '2303',
                  DPF_SOOT_LOAD: '2304',
                  TURBO_PRESSURE: '2300',
                  RAIL_PRESSURE: '2301',
                  EGR_POSITION: '2305'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: false,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'Toyota',
                  advancedDiagnostics: true
                }
              }
            ]
          },
          {
            id: 'toyota-corolla-gen12',
            name: 'Corolla XII',
            yearRange: { start: 2019, end: 2024 },
            bodyTypes: ['Hatchback', 'Sedan', 'Estate'],
            engines: [
              {
                id: 'toyota-corolla-1.8-hybrid-2020',
                name: '1.8 Hybrid',
                displacement: '1.8L',
                fuelType: 'Hybrid',
                power: { hp: 122, kw: 90 },
                engineCode: '2ZR-FXE',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2310', '2311', '2312', '2313', '2314', '2315'],
                  dpf: []
                },
                pidMappings: {
                  HYBRID_BATTERY_SOC: '2310',
                  HYBRID_BATTERY_TEMP: '2311',
                  ENGINE_EFFICIENCY: '2312',
                  ELECTRIC_MOTOR_TEMP: '2313',
                  REGENERATIVE_BRAKING: '2314',
                  FUEL_EFFICIENCY: '2315'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: false,
                  fuelType: 'hybrid',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'Toyota',
                  advancedDiagnostics: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'toyota-yaris',
        name: 'Yaris',
        generations: [
          {
            id: 'toyota-yaris-gen3',
            name: 'Yaris III',
            yearRange: { start: 2011, end: 2020 },
            bodyTypes: ['Hatchback'],
            engines: [
              {
                id: 'toyota-yaris-1.4-d4d-2012',
                name: '1.4 D-4D',
                displacement: '1.4L',
                fuelType: 'Diesel',
                power: { hp: 90, kw: 66 },
                engineCode: '1ND-TV',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2330', '2331', '2332', '2333', '2334', '2335'],
                  dpf: ['2332', '2333', '2334']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2332',
                  DPF_OUTLET_TEMP: '2333',
                  DPF_SOOT_LOAD: '2334',
                  TURBO_PRESSURE: '2330',
                  RAIL_PRESSURE: '2331',
                  EGR_POSITION: '2335'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: false,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'Toyota',
                  advancedDiagnostics: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'toyota-auris',
        name: 'Auris',
        generations: [
          {
            id: 'toyota-auris-gen1',
            name: 'Auris I',
            yearRange: { start: 2012, end: 2018 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'toyota-auris-1.4-d4d-2014',
                name: '1.4 D-4D',
                displacement: '1.4L',
                fuelType: 'Diesel',
                power: { hp: 90, kw: 66 },
                engineCode: '1ND-TV',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2340', '2341', '2342', '2343', '2344', '2345'],
                  dpf: ['2342', '2343', '2344']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2342',
                  DPF_OUTLET_TEMP: '2343',
                  DPF_SOOT_LOAD: '2344',
                  TURBO_PRESSURE: '2340',
                  RAIL_PRESSURE: '2341',
                  EGR_POSITION: '2345'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: false,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'Toyota',
                  advancedDiagnostics: true
                }
              },
              {
                id: 'toyota-auris-1.8-hybrid-2016',
                name: '1.8 Hybrid',
                displacement: '1.8L',
                fuelType: 'Hybrid',
                power: { hp: 136, kw: 100 },
                engineCode: '2ZR-FXE',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2346', '2347', '2348', '2349', '234A', '234B'],
                  dpf: []
                },
                pidMappings: {
                  HYBRID_BATTERY_SOC: '2346',
                  HYBRID_BATTERY_TEMP: '2347',
                  ENGINE_EFFICIENCY: '2348',
                  ELECTRIC_MOTOR_TEMP: '2349',
                  REGENERATIVE_BRAKING: '234A',
                  FUEL_EFFICIENCY: '234B'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: false,
                  fuelType: 'hybrid',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'Toyota',
                  advancedDiagnostics: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'toyota-avensis',
        name: 'Avensis',
        generations: [
          {
            id: 'toyota-avensis-gen3',
            name: 'Avensis III',
            yearRange: { start: 2012, end: 2018 },
            bodyTypes: ['Sedan', 'Estate'],
            engines: [
              {
                id: 'toyota-avensis-2.0-d4d-2014',
                name: '2.0 D-4D',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 124, kw: 91 },
                engineCode: '1AD-FTV',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2350', '2351', '2352', '2353', '2354', '2355'],
                  dpf: ['2352', '2353', '2354']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2352',
                  DPF_OUTLET_TEMP: '2353',
                  DPF_SOOT_LOAD: '2354',
                  TURBO_PRESSURE: '2350',
                  RAIL_PRESSURE: '2351',
                  EGR_POSITION: '2355'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'Toyota',
                  advancedDiagnostics: true,
                  dpfRegenerationSupported: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'toyota-rav4',
        name: 'RAV4',
        generations: [
          {
            id: 'toyota-rav4-gen3',
            name: 'RAV4 III',
            yearRange: { start: 2010, end: 2013 },
            bodyTypes: ['SUV'],
            engines: [
              {
                id: 'toyota-rav4-2.2-d4d-2011',
                name: '2.2 D-4D',
                displacement: '2.2L',
                fuelType: 'Diesel',
                power: { hp: 150, kw: 110 },
                engineCode: '2AD-FHV',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2360', '2361', '2362', '2363', '2364', '2365'],
                  dpf: ['2362', '2363', '2364']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2362',
                  DPF_OUTLET_TEMP: '2363',
                  DPF_SOOT_LOAD: '2364',
                  TURBO_PRESSURE: '2360',
                  RAIL_PRESSURE: '2361',
                  EGR_POSITION: '2365'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'Toyota',
                  advancedDiagnostics: true,
                  dpfRegenerationSupported: true
                }
              }
            ]
          },
          {
            id: 'toyota-rav4-gen4',
            name: 'RAV4 IV',
            yearRange: { start: 2013, end: 2019 },
            bodyTypes: ['SUV'],
            engines: [
              {
                id: 'toyota-rav4-2.0-d4d-2015',
                name: '2.0 D-4D',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 124, kw: 91 },
                engineCode: '1AD-FTV',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2320', '2321', '2322', '2323', '2324', '2325'],
                  dpf: ['2322', '2323', '2324']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2322',
                  DPF_OUTLET_TEMP: '2323',
                  DPF_SOOT_LOAD: '2324',
                  TURBO_PRESSURE: '2320',
                  RAIL_PRESSURE: '2321',
                  EGR_POSITION: '2325'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'Toyota',
                  advancedDiagnostics: true,
                  dpfRegenerationSupported: true
                }
              },
              {
                id: 'toyota-rav4-2.5-hybrid-2016',
                name: '2.5 Hybrid AWD',
                displacement: '2.5L',
                fuelType: 'Hybrid',
                power: { hp: 197, kw: 145 },
                engineCode: '2AR-FXE',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2326', '2327', '2328', '2329', '232A', '232B'],
                  dpf: []
                },
                pidMappings: {
                  HYBRID_BATTERY_SOC: '2326',
                  HYBRID_BATTERY_TEMP: '2327',
                  ENGINE_EFFICIENCY: '2328',
                  ELECTRIC_MOTOR_TEMP: '2329',
                  AWD_STATUS: '232A',
                  REGENERATIVE_BRAKING: '232B'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: false,
                  fuelType: 'hybrid',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'Toyota',
                  advancedDiagnostics: true
                }
              }
            ]
          },
          {
            id: 'toyota-rav4-gen5',
            name: 'RAV4 V',
            yearRange: { start: 2019, end: 2024 },
            bodyTypes: ['SUV'],
            engines: [
              {
                id: 'toyota-rav4-2.5-hybrid-2020',
                name: '2.5 Hybrid AWD',
                displacement: '2.5L',
                fuelType: 'Hybrid',
                power: { hp: 218, kw: 160 },
                engineCode: 'A25A-FXS',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2370', '2371', '2372', '2373', '2374', '2375'],
                  dpf: []
                },
                pidMappings: {
                  HYBRID_BATTERY_SOC: '2370',
                  HYBRID_BATTERY_TEMP: '2371',
                  ENGINE_EFFICIENCY: '2372',
                  ELECTRIC_MOTOR_TEMP: '2373',
                  AWD_STATUS: '2374',
                  REGENERATIVE_BRAKING: '2375'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: false,
                  fuelType: 'hybrid',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'Toyota',
                  advancedDiagnostics: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'toyota-chr',
        name: 'C-HR',
        generations: [
          {
            id: 'toyota-chr-gen1',
            name: 'C-HR I',
            yearRange: { start: 2017, end: 2024 },
            bodyTypes: ['Crossover'],
            engines: [
              {
                id: 'toyota-chr-1.8-hybrid-2018',
                name: '1.8 Hybrid',
                displacement: '1.8L',
                fuelType: 'Hybrid',
                power: { hp: 122, kw: 90 },
                engineCode: '2ZR-FXE',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2380', '2381', '2382', '2383', '2384', '2385'],
                  dpf: []
                },
                pidMappings: {
                  HYBRID_BATTERY_SOC: '2380',
                  HYBRID_BATTERY_TEMP: '2381',
                  ENGINE_EFFICIENCY: '2382',
                  ELECTRIC_MOTOR_TEMP: '2383',
                  REGENERATIVE_BRAKING: '2384',
                  FUEL_EFFICIENCY: '2385'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: false,
                  fuelType: 'hybrid',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'Toyota',
                  advancedDiagnostics: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'toyota-prius',
        name: 'Prius',
        generations: [
          {
            id: 'toyota-prius-gen3',
            name: 'Prius III',
            yearRange: { start: 2010, end: 2015 },
            bodyTypes: ['Hatchback'],
            engines: [
              {
                id: 'toyota-prius-1.8-hybrid-2012',
                name: '1.8 Hybrid',
                displacement: '1.8L',
                fuelType: 'Hybrid',
                power: { hp: 136, kw: 100 },
                engineCode: '2ZR-FXE',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2390', '2391', '2392', '2393', '2394', '2395'],
                  dpf: []
                },
                pidMappings: {
                  HYBRID_BATTERY_SOC: '2390',
                  HYBRID_BATTERY_TEMP: '2391',
                  ENGINE_EFFICIENCY: '2392',
                  ELECTRIC_MOTOR_TEMP: '2393',
                  REGENERATIVE_BRAKING: '2394',
                  FUEL_EFFICIENCY: '2395'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: false,
                  fuelType: 'hybrid',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'Toyota',
                  advancedDiagnostics: true
                }
              }
            ]
          },
          {
            id: 'toyota-prius-gen4',
            name: 'Prius IV',
            yearRange: { start: 2016, end: 2024 },
            bodyTypes: ['Hatchback'],
            engines: [
              {
                id: 'toyota-prius-1.8-hybrid-2018',
                name: '1.8 Hybrid',
                displacement: '1.8L',
                fuelType: 'Hybrid',
                power: { hp: 122, kw: 90 },
                engineCode: '2ZR-FXE',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2396', '2397', '2398', '2399', '239A', '239B'],
                  dpf: []
                },
                pidMappings: {
                  HYBRID_BATTERY_SOC: '2396',
                  HYBRID_BATTERY_TEMP: '2397',
                  ENGINE_EFFICIENCY: '2398',
                  ELECTRIC_MOTOR_TEMP: '2399',
                  REGENERATIVE_BRAKING: '239A',
                  FUEL_EFFICIENCY: '239B'
                },
                specificParameters: {
                  hasDPF: false,
                  hasEGR: true,
                  hasTurbo: false,
                  fuelType: 'hybrid',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'Toyota',
                  advancedDiagnostics: true
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
    logo: '/src/assets/logos/audi-logo.png',
    country: 'Germany',
    models: [
      {
        id: 'audi-a3',
        name: 'A3',
        generations: [
          {
            id: 'audi-a3-gen3',
            name: 'A3 8V',
            yearRange: { start: 2012, end: 2020 },
            bodyTypes: ['Hatchback', 'Sedan', 'Cabriolet'],
            engines: [
              {
                id: 'audi-a3-2.0-tdi-2015',
                name: '2.0 TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 150, kw: 110 },
                engineCode: 'CRLB',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221A', '221B', '221C', '221D', '221E', '221F', '2220', '2221', '2222'],
                  dpf: ['221C', '221D', '221E']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C',
                  DPF_OUTLET_TEMP: '221D',
                  DPF_SOOT_LOAD: '221E',
                  TURBO_PRESSURE: '221A',
                  RAIL_PRESSURE: '221B',
                  EGR_POSITION: '221F',
                  BOOST_SENSOR: '2220',
                  EXHAUST_TEMP: '2221',
                  AdBlue_LEVEL: '2222'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true,
                  dpfRegenerationSupported: true
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
            id: 'audi-a4-gen4',
            name: 'A4 B8',
            yearRange: { start: 2012, end: 2015 },
            bodyTypes: ['Sedan', 'Estate'],
            engines: [
              {
                id: 'audi-a4-2.0-tdi-2013',
                name: '2.0 TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 177, kw: 130 },
                engineCode: 'CGLC',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221A', '221B', '221C', '221D', '221E', '221F', '2220', '2221'],
                  dpf: ['221C', '221D', '221E']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C',
                  DPF_OUTLET_TEMP: '221D',
                  DPF_SOOT_LOAD: '221E',
                  TURBO_PRESSURE: '221A',
                  RAIL_PRESSURE: '221B',
                  EGR_POSITION: '221F',
                  BOOST_SENSOR: '2220',
                  EXHAUST_TEMP: '2221'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true,
                  dpfRegenerationSupported: true
                }
              }
            ]
          },
          {
            id: 'audi-a4-gen5',
            name: 'A4 B9',
            yearRange: { start: 2016, end: 2024 },
            bodyTypes: ['Sedan', 'Estate'],
            engines: [
              {
                id: 'audi-a4-2.0-tdi-2018',
                name: '2.0 TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 190, kw: 140 },
                engineCode: 'DFGA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221A', '221B', '221C', '221D', '221E', '221F', '2220', '2221', '2222'],
                  dpf: ['221C', '221D', '221E']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C',
                  DPF_OUTLET_TEMP: '221D',
                  DPF_SOOT_LOAD: '221E',
                  TURBO_PRESSURE: '221A',
                  RAIL_PRESSURE: '221B',
                  EGR_POSITION: '221F',
                  BOOST_SENSOR: '2220',
                  EXHAUST_TEMP: '2221',
                  AdBlue_LEVEL: '2222'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true,
                  dpfRegenerationSupported: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'audi-q5',
        name: 'Q5',
        generations: [
          {
            id: 'audi-q5-gen2',
            name: 'Q5 FY',
            yearRange: { start: 2017, end: 2024 },
            bodyTypes: ['SUV'],
            engines: [
              {
                id: 'audi-q5-2.0-tdi-2019',
                name: '2.0 TDI quattro',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 190, kw: 140 },
                engineCode: 'DFGA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['221A', '221B', '221C', '221D', '221E', '221F', '2220', '2221', '2222', '2223'],
                  dpf: ['221C', '221D', '221E']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '221C',
                  DPF_OUTLET_TEMP: '221D',
                  DPF_SOOT_LOAD: '221E',
                  TURBO_PRESSURE: '221A',
                  RAIL_PRESSURE: '221B',
                  EGR_POSITION: '221F',
                  BOOST_SENSOR: '2220',
                  EXHAUST_TEMP: '2221',
                  AdBlue_LEVEL: '2222',
                  QUATTRO_STATUS: '2223'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true,
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
    id: 'skoda',
    name: 'Skoda',
    logo: '/src/assets/logos/skoda-logo.png',
    country: 'Czech Republic',
    models: [
      {
        id: 'skoda-fabia',
        name: 'Fabia',
        generations: [
          {
            id: 'skoda-fabia-5j',
            name: 'Fabia 5J',
            yearRange: { start: 2007, end: 2014 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'skoda-fabia-1.2-tdi-2010',
                name: '1.2 TDI',
                displacement: '1.2L',
                fuelType: 'Diesel',
                power: { hp: 75, kw: 55 },
                engineCode: 'CFWA',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2400', '2401', '2402', '2403', '2404', '2405']
                },
                pidMappings: {
                  RAIL_PRESSURE: '2400',
                  TURBO_PRESSURE: '2401',
                  EGR_POSITION: '2402',
                  FUEL_TEMP: '2403',
                  INTAKE_TEMP: '2404',
                  ENGINE_LOAD: '2405'
                },
                specificParameters: {
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-fabia-1.4-tdi-2010',
                name: '1.4 TDI',
                displacement: '1.4L',
                fuelType: 'Diesel',
                power: { hp: 105, kw: 77 },
                engineCode: 'CUSB',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2406', '2407', '2408', '2409', '240A', '240B'],
                  dpf: ['2408', '2409', '240A']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2408',
                  DPF_OUTLET_TEMP: '2409',
                  DPF_SOOT_LOAD: '240A',
                  RAIL_PRESSURE: '2406',
                  TURBO_PRESSURE: '2407',
                  EGR_POSITION: '240B'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-fabia-1.6-tdi-2010',
                name: '1.6 TDI',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 90, kw: 66 },
                engineCode: 'CAYC',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2416', '2417', '2418', '2419', '241A', '241B'],
                  dpf: ['2418', '2419', '241A']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2418',
                  DPF_OUTLET_TEMP: '2419',
                  DPF_SOOT_LOAD: '241A',
                  RAIL_PRESSURE: '2416',
                  TURBO_PRESSURE: '2417',
                  EGR_POSITION: '241B'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-fabia-1.2-tsi-2010',
                name: '1.2 TSI',
                displacement: '1.2L',
                fuelType: 'Petrol',
                power: { hp: 105, kw: 77 },
                engineCode: 'CBZB',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['241C', '241D', '241E', '241F', '2420', '2421']
                },
                pidMappings: {
                  TURBO_PRESSURE: '241C',
                  INTAKE_TEMP: '241D',
                  THROTTLE_POSITION: '241E',
                  IGNITION_TIMING: '241F',
                  FUEL_PRESSURE: '2420',
                  LAMBDA_SENSOR: '2421'
                },
                specificParameters: {
                  hasTurbo: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-fabia-1.6-mpi-2010',
                name: '1.6 MPI',
                displacement: '1.6L',
                fuelType: 'Petrol',
                power: { hp: 105, kw: 77 },
                engineCode: 'CWVA',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2422', '2423', '2424', '2425', '2426', '2427']
                },
                pidMappings: {
                  INTAKE_TEMP: '2422',
                  THROTTLE_POSITION: '2423',
                  IGNITION_TIMING: '2424',
                  FUEL_PRESSURE: '2425',
                  LAMBDA_SENSOR: '2426',
                  ENGINE_LOAD: '2427'
                },
                specificParameters: {
                  fuelType: 'petrol',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              }
            ]
          },
          {
            id: 'skoda-fabia-nj',
            name: 'Fabia NJ',
            yearRange: { start: 2014, end: 2021 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'skoda-fabia-1.0-mpi-2015',
                name: '1.0 MPI',
                displacement: '1.0L',
                fuelType: 'Petrol',
                power: { hp: 75, kw: 55 },
                engineCode: 'CHYA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['240C', '240D', '240E', '240F', '2410', '2411']
                },
                pidMappings: {
                  INTAKE_TEMP: '240C',
                  THROTTLE_POSITION: '240D',
                  IGNITION_TIMING: '240E',
                  FUEL_PRESSURE: '240F',
                  OIL_TEMP: '2410',
                  LAMBDA_SENSOR: '2411'
                },
                specificParameters: {
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-fabia-1.4-tdi-2015',
                name: '1.4 TDI',
                displacement: '1.4L',
                fuelType: 'Diesel',
                power: { hp: 105, kw: 77 },
                engineCode: 'CYZC',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2412', '2413', '2414', '2415', '2416', '2417'],
                  dpf: ['2414', '2415', '2416']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2414',
                  DPF_OUTLET_TEMP: '2415',
                  DPF_SOOT_LOAD: '2416',
                  RAIL_PRESSURE: '2412',
                  TURBO_PRESSURE: '2413',
                  EGR_POSITION: '2417'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-fabia-1.4-tdi-2015',
                name: '1.4 TDI',
                displacement: '1.4L',
                fuelType: 'Diesel',
                power: { hp: 90, kw: 66 },
                engineCode: 'CUSB',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2428', '2429', '242A', '242B', '242C', '242D'],
                  dpf: ['242A', '242B', '242C']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '242A',
                  DPF_OUTLET_TEMP: '242B',
                  DPF_SOOT_LOAD: '242C',
                  RAIL_PRESSURE: '2428',
                  TURBO_PRESSURE: '2429',
                  EGR_POSITION: '242D'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-fabia-1.0-tsi-2015',
                name: '1.0 TSI',
                displacement: '1.0L',
                fuelType: 'Petrol',
                power: { hp: 95, kw: 70 },
                engineCode: 'CHZJ',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['242E', '242F', '2430', '2431', '2432', '2433']
                },
                pidMappings: {
                  TURBO_PRESSURE: '242E',
                  INTAKE_TEMP: '242F',
                  THROTTLE_POSITION: '2430',
                  IGNITION_TIMING: '2431',
                  FUEL_PRESSURE: '2432',
                  LAMBDA_SENSOR: '2433'
                },
                specificParameters: {
                  hasTurbo: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'skoda-rapid',
        name: 'Rapid',
        generations: [
          {
            id: 'skoda-rapid-nh',
            name: 'Rapid NH',
            yearRange: { start: 2012, end: 2019 },
            bodyTypes: ['Hatchback', 'Sedan'],
            engines: [
              {
                id: 'skoda-rapid-1.2-tsi-2012',
                name: '1.2 TSI',
                displacement: '1.2L',
                fuelType: 'Petrol',
                power: { hp: 105, kw: 77 },
                engineCode: 'CBZB',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2418', '2419', '241A', '241B', '241C', '241D']
                },
                pidMappings: {
                  INTAKE_TEMP: '2418',
                  BOOST_PRESSURE: '2419',
                  THROTTLE_POSITION: '241A',
                  IGNITION_TIMING: '241B',
                  FUEL_PRESSURE: '241C',
                  OIL_TEMP: '241D'
                },
                specificParameters: {
                  hasTurbo: true,
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-rapid-1.6-tdi-2013',
                name: '1.6 TDI',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 105, kw: 77 },
                engineCode: 'CAYC',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['241E', '241F', '2420', '2421', '2422', '2423'],
                  dpf: ['2420', '2421', '2422']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2420',
                  DPF_OUTLET_TEMP: '2421',
                  DPF_SOOT_LOAD: '2422',
                  RAIL_PRESSURE: '241E',
                  TURBO_PRESSURE: '241F',
                  EGR_POSITION: '2423'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-rapid-1.6-tdi-2012',
                name: '1.6 TDI',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 105, kw: 77 },
                engineCode: 'CAYC',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2440', '2441', '2442', '2443', '2444', '2445'],
                  dpf: ['2442', '2443', '2444']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2442',
                  DPF_OUTLET_TEMP: '2443',
                  DPF_SOOT_LOAD: '2444',
                  RAIL_PRESSURE: '2440',
                  TURBO_PRESSURE: '2441',
                  EGR_POSITION: '2445'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-rapid-1.4-tsi-2012',
                name: '1.4 TSI',
                displacement: '1.4L',
                fuelType: 'Petrol',
                power: { hp: 122, kw: 90 },
                engineCode: 'CAXA',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2446', '2447', '2448', '2449', '244A', '244B']
                },
                pidMappings: {
                  TURBO_PRESSURE: '2446',
                  INTAKE_TEMP: '2447',
                  THROTTLE_POSITION: '2448',
                  IGNITION_TIMING: '2449',
                  FUEL_PRESSURE: '244A',
                  LAMBDA_SENSOR: '244B'
                },
                specificParameters: {
                  hasTurbo: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
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
            id: 'skoda-octavia-1z',
            name: 'Octavia 1Z',
            yearRange: { start: 2004, end: 2013 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'skoda-octavia-1.9-tdi-2008',
                name: '1.9 TDI',
                displacement: '1.9L',
                fuelType: 'Diesel',
                power: { hp: 105, kw: 77 },
                engineCode: 'BJB',
                emissionStandard: 'Euro4',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2424', '2425', '2426', '2427', '2428', '2429'],
                  dpf: ['2426', '2427', '2428']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2426',
                  DPF_OUTLET_TEMP: '2427',
                  DPF_SOOT_LOAD: '2428',
                  RAIL_PRESSURE: '2424',
                  TURBO_PRESSURE: '2425',
                  EGR_POSITION: '2429'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro4',
                  manufacturerProtocol: 'VAG',
                  useOlderProtocol: true,
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-octavia-2.0-tdi-2010',
                name: '2.0 TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 140, kw: 103 },
                engineCode: 'CBAA',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['242A', '242B', '242C', '242D', '242E', '242F'],
                  dpf: ['242C', '242D', '242E']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '242C',
                  DPF_OUTLET_TEMP: '242D',
                  DPF_SOOT_LOAD: '242E',
                  RAIL_PRESSURE: '242A',
                  TURBO_PRESSURE: '242B',
                  EGR_POSITION: '242F'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-octavia-1.6-tdi-2013',
                name: '1.6 TDI',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 105, kw: 77 },
                engineCode: 'CAYC',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2460', '2461', '2462', '2463', '2464', '2465'],
                  dpf: ['2462', '2463', '2464']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2462',
                  DPF_OUTLET_TEMP: '2463',
                  DPF_SOOT_LOAD: '2464',
                  RAIL_PRESSURE: '2460',
                  TURBO_PRESSURE: '2461',
                  EGR_POSITION: '2465'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-octavia-1.8-tsi-2013',
                name: '1.8 TSI',
                displacement: '1.8L',
                fuelType: 'Petrol',
                power: { hp: 180, kw: 132 },
                engineCode: 'CDAA',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2466', '2467', '2468', '2469', '246A', '246B']
                },
                pidMappings: {
                  TURBO_PRESSURE: '2466',
                  INTAKE_TEMP: '2467',
                  THROTTLE_POSITION: '2468',
                  IGNITION_TIMING: '2469',
                  FUEL_PRESSURE: '246A',
                  LAMBDA_SENSOR: '246B'
                },
                specificParameters: {
                  hasTurbo: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              }
            ]
          },
          {
            id: 'skoda-octavia-nv',
            name: 'Octavia NV',
            yearRange: { start: 2020, end: 2024 },
            bodyTypes: ['Hatchback', 'Estate'],
            engines: [
              {
                id: 'skoda-octavia-1.5-tsi-2020',
                name: '1.5 TSI',
                displacement: '1.5L',
                fuelType: 'Petrol',
                power: { hp: 150, kw: 110 },
                engineCode: 'DADA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['243C', '243D', '243E', '243F', '2440', '2441']
                },
                pidMappings: {
                  INTAKE_TEMP: '243C',
                  BOOST_PRESSURE: '243D',
                  THROTTLE_POSITION: '243E',
                  IGNITION_TIMING: '243F',
                  FUEL_PRESSURE: '2440',
                  OIL_TEMP: '2441'
                },
                specificParameters: {
                  hasTurbo: true,
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-octavia-2.0-tdi-2020',
                name: '2.0 TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 150, kw: 110 },
                engineCode: 'DFEA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2442', '2443', '2444', '2445', '2446', '2447'],
                  dpf: ['2444', '2445', '2446']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2444',
                  DPF_OUTLET_TEMP: '2445',
                  DPF_SOOT_LOAD: '2446',
                  RAIL_PRESSURE: '2442',
                  TURBO_PRESSURE: '2443',
                  EGR_POSITION: '2447'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-octavia-1.6-tdi-2020',
                name: '1.6 TDI',
                displacement: '1.6L',
                fuelType: 'Diesel',
                power: { hp: 115, kw: 85 },
                engineCode: 'DGDB',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2480', '2481', '2482', '2483', '2484', '2485'],
                  dpf: ['2482', '2483', '2484']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2482',
                  DPF_OUTLET_TEMP: '2483',
                  DPF_SOOT_LOAD: '2484',
                  RAIL_PRESSURE: '2480',
                  TURBO_PRESSURE: '2481',
                  EGR_POSITION: '2485'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'skoda-superb',
        name: 'Superb',
        generations: [
          {
            id: 'skoda-superb-3t',
            name: 'Superb 3T',
            yearRange: { start: 2008, end: 2015 },
            bodyTypes: ['Sedan', 'Estate'],
            engines: [
              {
                id: 'skoda-superb-2.0-tdi-2010',
                name: '2.0 TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 170, kw: 125 },
                engineCode: 'CFGB',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2448', '2449', '244A', '244B', '244C', '244D'],
                  dpf: ['244A', '244B', '244C']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '244A',
                  DPF_OUTLET_TEMP: '244B',
                  DPF_SOOT_LOAD: '244C',
                  RAIL_PRESSURE: '2448',
                  TURBO_PRESSURE: '2449',
                  EGR_POSITION: '244D'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-superb-1.8-tsi-2011',
                name: '1.8 TSI',
                displacement: '1.8L',
                fuelType: 'Petrol',
                power: { hp: 160, kw: 118 },
                engineCode: 'CDAA',
                emissionStandard: 'Euro5',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['244E', '244F', '2450', '2451', '2452', '2453']
                },
                pidMappings: {
                  INTAKE_TEMP: '244E',
                  BOOST_PRESSURE: '244F',
                  THROTTLE_POSITION: '2450',
                  IGNITION_TIMING: '2451',
                  FUEL_PRESSURE: '2452',
                  OIL_TEMP: '2453'
                },
                specificParameters: {
                  hasTurbo: true,
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro5',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              }
            ]
          },
          {
            id: 'skoda-superb-3v',
            name: 'Superb 3V',
            yearRange: { start: 2015, end: 2023 },
            bodyTypes: ['Sedan', 'Estate'],
            engines: [
              {
                id: 'skoda-superb-2.0-tsi-2015',
                name: '2.0 TSI',
                displacement: '2.0L',
                fuelType: 'Petrol',
                power: { hp: 280, kw: 206 },
                engineCode: 'CJXA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2454', '2455', '2456', '2457', '2458', '2459']
                },
                pidMappings: {
                  INTAKE_TEMP: '2454',
                  BOOST_PRESSURE: '2455',
                  THROTTLE_POSITION: '2456',
                  IGNITION_TIMING: '2457',
                  FUEL_PRESSURE: '2458',
                  OIL_TEMP: '2459'
                },
                specificParameters: {
                  hasTurbo: true,
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-superb-2.0-tdi-2015',
                name: '2.0 TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 190, kw: 140 },
                engineCode: 'DFGA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['245A', '245B', '245C', '245D', '245E', '245F'],
                  dpf: ['245C', '245D', '245E']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '245C',
                  DPF_OUTLET_TEMP: '245D',
                  DPF_SOOT_LOAD: '245E',
                  RAIL_PRESSURE: '245A',
                  TURBO_PRESSURE: '245B',
                  EGR_POSITION: '245F'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'skoda-kodiaq',
        name: 'Kodiaq',
        generations: [
          {
            id: 'skoda-kodiaq-ns',
            name: 'Kodiaq NS',
            yearRange: { start: 2016, end: 2024 },
            bodyTypes: ['SUV'],
            engines: [
              {
                id: 'skoda-kodiaq-1.4-tsi-2017',
                name: '1.4 TSI',
                displacement: '1.4L',
                fuelType: 'Petrol',
                power: { hp: 150, kw: 110 },
                engineCode: 'CZEA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2460', '2461', '2462', '2463', '2464', '2465']
                },
                pidMappings: {
                  INTAKE_TEMP: '2460',
                  BOOST_PRESSURE: '2461',
                  THROTTLE_POSITION: '2462',
                  IGNITION_TIMING: '2463',
                  FUEL_PRESSURE: '2464',
                  OIL_TEMP: '2465'
                },
                specificParameters: {
                  hasTurbo: true,
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-kodiaq-2.0-tdi-2017',
                name: '2.0 TDI',
                displacement: '2.0L',
                fuelType: 'Diesel',
                power: { hp: 190, kw: 140 },
                engineCode: 'DFGA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2466', '2467', '2468', '2469', '246A', '246B'],
                  dpf: ['2468', '2469', '246A']
                },
                pidMappings: {
                  DPF_INLET_TEMP: '2468',
                  DPF_OUTLET_TEMP: '2469',
                  DPF_SOOT_LOAD: '246A',
                  RAIL_PRESSURE: '2466',
                  TURBO_PRESSURE: '2467',
                  EGR_POSITION: '246B'
                },
                specificParameters: {
                  hasDPF: true,
                  hasEGR: true,
                  hasTurbo: true,
                  fuelType: 'diesel',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  dpfRegenerationSupported: true,
                  advancedDiagnostics: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'skoda-kamiq',
        name: 'Kamiq',
        generations: [
          {
            id: 'skoda-kamiq-nv',
            name: 'Kamiq NV',
            yearRange: { start: 2019, end: 2024 },
            bodyTypes: ['SUV'],
            engines: [
              {
                id: 'skoda-kamiq-1.0-tsi-2019',
                name: '1.0 TSI',
                displacement: '1.0L',
                fuelType: 'Petrol',
                power: { hp: 115, kw: 85 },
                engineCode: 'CHZD',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['246C', '246D', '246E', '246F', '2470', '2471']
                },
                pidMappings: {
                  INTAKE_TEMP: '246C',
                  BOOST_PRESSURE: '246D',
                  THROTTLE_POSITION: '246E',
                  IGNITION_TIMING: '246F',
                  FUEL_PRESSURE: '2470',
                  OIL_TEMP: '2471'
                },
                specificParameters: {
                  hasTurbo: true,
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-kamiq-1.5-tsi-2019',
                name: '1.5 TSI',
                displacement: '1.5L',
                fuelType: 'Petrol',
                power: { hp: 150, kw: 110 },
                engineCode: 'DADA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2472', '2473', '2474', '2475', '2476', '2477']
                },
                pidMappings: {
                  INTAKE_TEMP: '2472',
                  BOOST_PRESSURE: '2473',
                  THROTTLE_POSITION: '2474',
                  IGNITION_TIMING: '2475',
                  FUEL_PRESSURE: '2476',
                  OIL_TEMP: '2477'
                },
                specificParameters: {
                  hasTurbo: true,
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              }
            ]
          }
        ]
      },
      {
        id: 'skoda-scala',
        name: 'Scala',
        generations: [
          {
            id: 'skoda-scala-nw',
            name: 'Scala NW',
            yearRange: { start: 2019, end: 2024 },
            bodyTypes: ['Hatchback'],
            engines: [
              {
                id: 'skoda-scala-1.0-tsi-2019',
                name: '1.0 TSI',
                displacement: '1.0L',
                fuelType: 'Petrol',
                power: { hp: 115, kw: 85 },
                engineCode: 'CHZD',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['2478', '2479', '247A', '247B', '247C', '247D']
                },
                pidMappings: {
                  INTAKE_TEMP: '2478',
                  BOOST_PRESSURE: '2479',
                  THROTTLE_POSITION: '247A',
                  IGNITION_TIMING: '247B',
                  FUEL_PRESSURE: '247C',
                  OIL_TEMP: '247D'
                },
                specificParameters: {
                  hasTurbo: true,
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              },
              {
                id: 'skoda-scala-1.5-tsi-2019',
                name: '1.5 TSI',
                displacement: '1.5L',
                fuelType: 'Petrol',
                power: { hp: 150, kw: 110 },
                engineCode: 'DADA',
                emissionStandard: 'Euro6',
                supportedPids: {
                  standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                  manufacturer: ['247E', '247F', '2480', '2481', '2482', '2483']
                },
                pidMappings: {
                  INTAKE_TEMP: '247E',
                  BOOST_PRESSURE: '247F',
                  THROTTLE_POSITION: '2480',
                  IGNITION_TIMING: '2481',
                  FUEL_PRESSURE: '2482',
                  OIL_TEMP: '2483'
                },
                specificParameters: {
                  hasTurbo: true,
                  hasEGR: true,
                  fuelType: 'petrol',
                  emissionStandard: 'Euro6',
                  manufacturerProtocol: 'VAG',
                  advancedDiagnostics: true
                }
              }
            ]
          }
        ]
      }
    ]
  }
];

export const findVehicleEngine = (makeId: string, modelId: string, generationId: string, engineId: string): VehicleEngine | null => {
  const make = VEHICLE_DATABASE.find(m => m.id === makeId);
  if (!make) return null;
  
  const model = make.models.find(m => m.id === modelId);
  if (!model) return null;
  
  const generation = model.generations.find(g => g.id === generationId);
  if (!generation) return null;
  
  return generation.engines.find(e => e.id === engineId) || null;
};

export const getAllMakes = (): VehicleMake[] => VEHICLE_DATABASE;
export const getMakeById = (id: string): VehicleMake | null => VEHICLE_DATABASE.find(m => m.id === id) || null;