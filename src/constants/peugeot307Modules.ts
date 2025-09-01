import { VehicleModule } from '@/types/vehicleModules';

export const PEUGEOT_307_MODULES: VehicleModule[] = [
  {
    id: 'peugeot-307-engine-ecu',
    name: 'Engine Control Unit (Bosch EDC15C2)',
    description: 'Main engine management system for Peugeot 307 HDi engines',
    category: 'engine',
    ecuAddress: '01',
    protocols: ['ISO14230-4', 'KWP2000'],
    makeSpecific: ['Peugeot'],
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
    id: 'peugeot-307-bcm',
    name: 'Body Control Module (BSI)',
    description: 'Central body electronics and comfort functions',
    category: 'body',
    ecuAddress: 'BSI', // PSA uses a specific name for the BSI
    protocols: ['VAN', 'CAN'],
    makeSpecific: ['Peugeot'],
    supportedFunctions: [
      {
        id: 'bcm-dtc-read',
        name: 'Read Body Control DTCs',
        type: 'read',
        description: 'Read body control system fault codes',
        command: '03' // This might be different for BSI
      },
    ]
  },
];
