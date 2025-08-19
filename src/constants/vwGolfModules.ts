import { VehicleModule } from '@/types/vehicleModules';

export const VW_GOLF_MODULES: VehicleModule[] = [
  {
    id: 'vw-golf-mk5-engine-ecu',
    name: 'Engine Control Unit',
    description: 'Main engine management system for VW Golf Mk5',
    category: 'engine',
    ecuAddress: '01',
    protocols: ['CAN'],
    makeSpecific: ['VW'],
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
    ]
  },
  {
    id: 'vw-golf-mk5-abs',
    name: 'Brake Electronics (MK60)',
    description: 'Anti-lock braking and electronic stability program',
    category: 'abs',
    ecuAddress: '03',
    protocols: ['CAN'],
    makeSpecific: ['VW'],
    supportedFunctions: [
      {
        id: 'abs-dtc-read',
        name: 'Read ABS/ESP DTCs',
        type: 'read',
        description: 'Read ABS and ESP system fault codes',
        command: '03'
      },
    ]
  },
];
