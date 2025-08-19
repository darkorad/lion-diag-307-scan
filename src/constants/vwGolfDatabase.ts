import { VehicleProfile } from '@/types/vehicle';
import { VehicleDatabase } from '../services/VehicleDatabase';

const supportedPids = VehicleDatabase.VAG_PIDS.map(p => p.pid);

export const VW_GOLF_PROFILES: VehicleProfile[] = [
  {
    id: 'vw-golf-mk5-2.0-tfsi',
    make: 'Volkswagen',
    model: 'Golf',
    year: 2005,
    engine: '2.0L TFSI',
    fuel: 'Gasoline',
    displayName: 'VW Golf Mk5 2.0L TFSI',
    vinPatterns: ['1K*'],
    supportedPids: {
      standard: supportedPids,
      manufacturer: [],
      dpf: [],
    },
    pidMappings: {
      // Mappings will be added later
    },
    specificParameters: {
      hasDPF: false,
      hasEGR: true,
      hasTurbo: true,
      fuelType: 'gasoline',
      emissionStandard: 'Euro 4',
      manufacturerProtocol: 'VAG',
      supportedSystems: [
        'Engine', 'Transmission', 'ABS', 'Airbag', 'BCM', 'Instrument'
      ]
    }
  },
];
