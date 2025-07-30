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
            id: 'volkswagen-golf-mk7',
            name: 'Golf MK7',
            yearRange: { start: 2013, end: 2020 },
            bodyTypes: ['Hatchback', 'Estate', 'Cabriolet'],
            engines: [
              {
                id: 'volkswagen-golf-2.0-tdi-2015',
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
          }
        ]
      }
    ]
  },
  {
    id: 'ford',
    name: 'Ford',
    logo: '', // Add logo path
    country: 'USA',
    models: [
        {
            id: 'ford-focus',
            name: 'Focus',
            generations: [
                {
                    id: 'ford-focus-mk3',
                    name: 'Focus MK3',
                    yearRange: { start: 2011, end: 2018 },
                    bodyTypes: ['Hatchback', 'Sedan', 'Estate'],
                    engines: [
                        {
                            id: 'ford-focus-1.6-tdci-2012',
                            name: '1.6 TDCi',
                            displacement: '1.6L',
                            fuelType: 'Diesel',
                            power: { hp: 115, kw: 85 },
                            engineCode: 'T1DA',
                            emissionStandard: 'Euro5',
                            supportedPids: {
                                standard: ['010C', '010D', '0105', '0110', '0111', '010A', '010F', '0107', '0114', '012F'],
                                manufacturer: ['2201', '2202', '2203', '2204', '2205', '2206'],
                                dpf: ['2203', '2204', '2205']
                            },
                            pidMappings: {
                                DPF_INLET_TEMP: '2203',
                                DPF_OUTLET_TEMP: '2204',
                                DPF_SOOT_LOAD: '2205',
                                TURBO_PRESSURE: '2201',
                                RAIL_PRESSURE: '2202',
                                EGR_POSITION: '2206'
                            },
                            specificParameters: {
                                hasDPF: true,
                                hasEGR: true,
                                hasTurbo: true,
                                fuelType: 'diesel',
                                emissionStandard: 'Euro5',
                                manufacturerProtocol: 'Ford',
                                advancedDiagnostics: true,
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