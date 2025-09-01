export interface ManufacturerData {
  id: string;
  name: string;
  logo: string;
  supportedYears: string;
  capabilities: string[];
  models: Model[];
  diagnosticFeatures: DiagnosticFeature[];
}

export interface Model {
  id: string;
  name: string;
  years: string;
  engines: Engine[];
}

export interface Engine {
  id: string;
  name: string;
  code: string;
  displacement: string;
  power: string;
}

export interface DiagnosticFeature {
  id: string;
  name: string;
  description: string;
  supportLevel: 'basic' | 'enhanced' | 'professional';
}

export const EUROPEAN_MANUFACTURERS: ManufacturerData[] = [
  {
    id: 'peugeot',
    name: 'Peugeot',
    logo: '/src/assets/logos/peugeot-logo.png',
    supportedYears: '2000-Present',
    capabilities: ['Full ECU Access', 'BSI Programming', 'Service Reset', 'Immobilizer'],
    models: [
      {
        id: '307',
        name: '307',
        years: '2001-2008',
        engines: [
          {
            id: '307-1.6-16v',
            name: '1.6 16V',
            code: 'TU5JP4',
            displacement: '1587cc',
            power: '110hp'
          },
          {
            id: '307-2.0-hdi',
            name: '2.0 HDi',
            code: 'DW10TD',
            displacement: '1997cc',
            power: '90hp'
          }
        ]
      },
      {
        id: '308',
        name: '308',
        years: '2007-Present',
        engines: [
          {
            id: '308-1.6-thp',
            name: '1.6 THP',
            code: 'EP6',
            displacement: '1598cc',
            power: '150hp'
          }
        ]
      }
    ],
    diagnosticFeatures: [
      {
        id: 'peugeot-bsi',
        name: 'BSI Programming',
        description: 'Full Body System Interface programming and coding',
        supportLevel: 'professional'
      },
      {
        id: 'peugeot-dpf',
        name: 'DPF Regeneration',
        description: 'Diesel Particulate Filter forced regeneration',
        supportLevel: 'enhanced'
      }
    ]
  },
  {
    id: 'volkswagen',
    name: 'Volkswagen',
    logo: '/src/assets/logos/volkswagen-logo.png',
    supportedYears: '2000-Present',
    capabilities: ['Full ECU Access', 'Coding', 'Adaptation', 'Long Coding'],
    models: [
      {
        id: 'golf',
        name: 'Golf',
        years: '2000-Present',
        engines: [
          {
            id: 'golf-1.9-tdi',
            name: '1.9 TDI',
            code: 'ALH',
            displacement: '1896cc',
            power: '110hp'
          }
        ]
      }
    ],
    diagnosticFeatures: [
      {
        id: 'vw-long-coding',
        name: 'Long Coding',
        description: 'Advanced module coding with bit-level modifications',
        supportLevel: 'professional'
      }
    ]
  },
  {
    id: 'bmw',
    name: 'BMW',
    logo: '/src/assets/logos/bmw-logo.png',
    supportedYears: '2000-Present',
    capabilities: ['Full ECU Access', 'Coding', 'Adaptation', 'Module Programming'],
    models: [
      {
        id: '3-series',
        name: '3 Series',
        years: '2000-Present',
        engines: [
          {
            id: 'bmw-320d',
            name: '320d',
            code: 'N47',
            displacement: '1995cc',
            power: '184hp'
          }
        ]
      }
    ],
    diagnosticFeatures: [
      {
        id: 'bmw-cas',
        name: 'CAS Programming',
        description: 'Car Access System programming and key coding',
        supportLevel: 'professional'
      }
    ]
  },
  {
    id: 'audi',
    name: 'Audi',
    logo: '/src/assets/logos/audi-logo.png',
    supportedYears: '2000-Present',
    capabilities: ['Full ECU Access', 'Coding', 'Adaptation', 'Long Coding'],
    models: [
      {
        id: 'a4',
        name: 'A4',
        years: '2000-Present',
        engines: [
          {
            id: 'audi-2.0-tfsi',
            name: '2.0 TFSI',
            code: 'EA888',
            displacement: '1984cc',
            power: '211hp'
          }
        ]
      }
    ],
    diagnosticFeatures: [
      {
        id: 'audi-vcds',
        name: 'VCDS Compatible',
        description: 'Full compatibility with VAG-COM Diagnostic System',
        supportLevel: 'professional'
      }
    ]
  },
  {
    id: 'mercedes',
    name: 'Mercedes-Benz',
    logo: '/src/assets/logos/mercedes-logo.png',
    supportedYears: '2000-Present',
    capabilities: ['Full ECU Access', 'Coding', 'SCN Coding', 'Module Programming'],
    models: [
      {
        id: 'c-class',
        name: 'C-Class',
        years: '2000-Present',
        engines: [
          {
            id: 'mercedes-c220',
            name: 'C220 CDI',
            code: 'OM651',
            displacement: '2143cc',
            power: '170hp'
          }
        ]
      }
    ],
    diagnosticFeatures: [
      {
        id: 'mercedes-scn',
        name: 'SCN Coding',
        description: 'Software Calibration Number coding for modules',
        supportLevel: 'professional'
      }
    ]
  },
  {
    id: 'volvo',
    name: 'Volvo',
    logo: '/src/assets/logos/volvo-logo.png',
    supportedYears: '2000-Present',
    capabilities: ['Full ECU Access', 'Coding', 'Module Programming'],
    models: [
      {
        id: 'v70',
        name: 'V70',
        years: '2000-Present',
        engines: [
          {
            id: 'volvo-d5',
            name: 'D5',
            code: 'D5244T',
            displacement: '2401cc',
            power: '185hp'
          }
        ]
      }
    ],
    diagnosticFeatures: [
      {
        id: 'volvo-cem',
        name: 'CEM Programming',
        description: 'Central Electronic Module programming',
        supportLevel: 'professional'
      }
    ]
  },
  {
    id: 'alfa-romeo',
    name: 'Alfa Romeo',
    logo: '/src/assets/logos/alfa-romeo-logo.png',
    supportedYears: '2000-Present',
    capabilities: ['Full ECU Access', 'Coding', 'Service Reset'],
    models: [
      {
        id: '159',
        name: '159',
        years: '2005-2011',
        engines: [
          {
            id: 'alfa-1.9-jtdm',
            name: '1.9 JTDm',
            code: '939A2000',
            displacement: '1910cc',
            power: '150hp'
          }
        ]
      }
    ],
    diagnosticFeatures: [
      {
        id: 'alfa-proxi',
        name: 'Proxi Alignment',
        description: 'Body Computer Proxy alignment procedure',
        supportLevel: 'professional'
      }
    ]
  }
];

// Helper functions
export const getManufacturerById = (id: string): ManufacturerData | undefined => {
  return EUROPEAN_MANUFACTURERS.find(manufacturer => manufacturer.id === id);
};

export const getModelsByManufacturer = (manufacturerId: string): Model[] => {
  const manufacturer = getManufacturerById(manufacturerId);
  return manufacturer ? manufacturer.models : [];
};

export const getEnginesByModel = (manufacturerId: string, modelId: string): Engine[] => {
  const models = getModelsByManufacturer(manufacturerId);
  const model = models.find(model => model.id === modelId);
  return model ? model.engines : [];
};