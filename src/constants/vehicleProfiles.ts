import { VehicleProfile } from '@/types/vehicle';
import { SEAT_IBIZA_PROFILES } from './seatIbizaDatabase';
import { PEUGEOT_307_PROFILES } from './peugeot307Database';

export const VEHICLE_PROFILES: VehicleProfile[] = [
  {
    id: 'peugeot-3008-2020-diesel',
    make: 'Peugeot',
    model: '3008',
    year: 2020,
    engine: '1.5L BlueHDi',
    fuel: 'Diesel',
    displayName: 'Peugeot 3008 2020 Diesel',
    vinPatterns: ['VF3*', 'VR3*'],
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
  },
  {
    id: 'peugeot-307-2006-1.6-hdi-110hp',
    make: 'Peugeot',
    model: '307',
    year: 2006,
    engine: '1.6L HDI 110HP',
    fuel: 'Diesel',
    displayName: 'Peugeot 307 2006 1.6 HDI 110HP Restyling',
    vinPatterns: ['VF3*', 'VR3*'],
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
      fuelType: 'diesel',
      emissionStandard: 'Euro4',
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
    id: 'peugeot-307-2006-diesel',
    make: 'Peugeot',
    model: '307',
    year: 2006,
    engine: '1.6L HDI',
    fuel: 'Diesel',
    displayName: 'Peugeot 307 2006 1.6 HDI',
    vinPatterns: ['VF3*', 'VR3*'],
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
      advancedDiagnostics: true
    }
  },
  // Add all SEAT Ibiza profiles
  ...SEAT_IBIZA_PROFILES,
  // Add all Peugeot 307 profiles
  ...PEUGEOT_307_PROFILES,
  {
    id: 'seat-ibiza-2010-diesel',
    make: 'Seat',
    model: 'Ibiza',
    year: 2010,
    engine: '1.6L TDI',
    fuel: 'Diesel',
    displayName: 'Seat Ibiza 2010 Diesel',
    vinPatterns: ['VSS*', 'VSE*'],
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
];

export const getVehicleProfileById = (id: string): VehicleProfile | undefined => {
  return VEHICLE_PROFILES.find(profile => profile.id === id);
};

export const getVehicleProfileByVin = (vin: string): VehicleProfile | undefined => {
  return VEHICLE_PROFILES.find(profile => 
    profile.vinPatterns.some(pattern => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(vin);
    })
  );
};

export const getVehicleProfilesByMake = (make: string): VehicleProfile[] => {
  return VEHICLE_PROFILES.filter(profile => 
    profile.make.toLowerCase() === make.toLowerCase()
  );
};
