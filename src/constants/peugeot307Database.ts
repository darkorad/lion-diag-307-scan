import { VehicleProfile } from '@/types/vehicle';
import { PSA_PIDS } from '../obd2/psa-pids';

const supportedPids = PSA_PIDS.map(p => `${p.mode}${p.pid}`);

export const PEUGEOT_307_PROFILES: VehicleProfile[] = [
  {
    id: 'peugeot-307-2004-2.0-hdi',
    make: 'Peugeot',
    model: '307',
    year: 2004,
    engine: '2.0L HDi',
    fuel: 'Diesel',
    displayName: 'Peugeot 307 2004 2.0 HDi',
    vinPatterns: ['VF3*'],
    supportedPids: {
      standard: supportedPids,
      manufacturer: [],
      dpf: [],
    },
    pidMappings: {
      DPF_INLET_TEMP: '221C30',
      DPF_OUTLET_TEMP: '221C31',
      DPF_SOOT_LOAD: '221C34',
      DPF_DIFF_PRESSURE: '221C32',
      EGR_POSITION: '221C40',
      EGR_TEMPERATURE: '221C41',
      TURBO_PRESSURE: '221C50',
      FUEL_RAIL_PRESSURE: '221C60',
      FUEL_TEMPERATURE: '221C61',
      ADBLUE_LEVEL: '221C70',
      NOX_SENSOR_UPSTREAM: '221C71',
      NOX_SENSOR_DOWNSTREAM: '221C72',
      ENGINE_OIL_TEMP: '221C80',
      OIL_PRESSURE: '221C81',
      GLOW_PLUG_STATUS: '221C90'
    },
    specificParameters: {
      hasDPF: true,
      hasEGR: true,
      hasTurbo: true,
      fuelType: 'diesel',
      emissionStandard: 'Euro 3',
      manufacturerProtocol: 'PSA',
      supportedSystems: [
        'Engine', 'ABS', 'Airbag', 'BCM', 'Instrument'
      ]
    }
  },
];
