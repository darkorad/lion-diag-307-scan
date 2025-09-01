import { VehicleProfile } from '@/types/vehicle';

export const skodaOctaviaModels: VehicleProfile[] = [
  // 2010-2013 Octavia II (1Z) Facelift
  {
    id: 'skoda-octavia-2010-1.2-tsi',
    make: 'Skoda',
    model: 'Octavia II',
    year: 2010,
    engine: '1.2 TSI',
    fuel: 'Petrol',
    displayName: 'Skoda Octavia II 1.2 TSI (2010-2013)',
    vinPatterns: ['TMBAD1NP*', 'TMBAD2NP*'],
    supportedPids: {
      standard: ['01', '05', '06', '0A', '0B', '0C', '0D', '0E', '0F', '10', '11', '13', '14', '15', '1C', '1F', '21', '2F', '33', '40'],
      manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456'],
      dpf: []
    },
    pidMappings: {
      'rpm': '0C',
      'speed': '0D',
      'coolantTemp': '05',
      'intakeTemp': '0F',
      'maf': '10',
      'throttle': '11'
    },
    specificParameters: {
      maxRpm: 6500,
      maxSpeed: 190,
      displacement: 1.2,
      power: 105,
      torque: 175
    }
  },
  {
    id: 'skoda-octavia-2010-1.4-tsi',
    make: 'Skoda',
    model: 'Octavia II',
    year: 2010,
    engine: '1.4 TSI',
    fuel: 'Petrol',
    displayName: 'Skoda Octavia II 1.4 TSI (2010-2013)',
    vinPatterns: ['TMBAD1NP*', 'TMBAD2NP*'],
    supportedPids: {
      standard: ['01', '05', '06', '0A', '0B', '0C', '0D', '0E', '0F', '10', '11', '13', '14', '15', '1C', '1F', '21', '2F', '33', '40'],
      manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456'],
      dpf: []
    },
    pidMappings: {
      'rpm': '0C',
      'speed': '0D',
      'coolantTemp': '05',
      'intakeTemp': '0F',
      'maf': '10',
      'throttle': '11'
    },
    specificParameters: {
      maxRpm: 6000,
      maxSpeed: 210,
      displacement: 1.4,
      power: 122,
      torque: 200
    }
  },
  {
    id: 'skoda-octavia-2010-1.6-tdi',
    make: 'Skoda',
    model: 'Octavia II',
    year: 2010,
    engine: '1.6 TDI',
    fuel: 'Diesel',
    displayName: 'Skoda Octavia II 1.6 TDI (2010-2013)',
    vinPatterns: ['TMBAD1NP*', 'TMBAD2NP*'],
    supportedPids: {
      standard: ['01', '05', '06', '0A', '0B', '0C', '0D', '0E', '0F', '10', '11', '13', '14', '15', '1C', '1F', '21', '2F', '33', '40'],
      manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456', '22F4F0', '22F4F4'],
      dpf: ['22F4F0', '22F4F4', '22F4F8', '22F4FC']
    },
    pidMappings: {
      'rpm': '0C',
      'speed': '0D',
      'coolantTemp': '05',
      'intakeTemp': '0F',
      'maf': '10',
      'throttle': '11',
      'dpfSoot': '22F4F0'
    },
    specificParameters: {
      maxRpm: 4500,
      maxSpeed: 190,
      displacement: 1.6,
      power: 105,
      torque: 250,
      hasDPF: true
    }
  },
  {
    id: 'skoda-octavia-2010-2.0-tdi',
    make: 'Skoda',
    model: 'Octavia II',
    year: 2010,
    engine: '2.0 TDI',
    fuel: 'Diesel',
    displayName: 'Skoda Octavia II 2.0 TDI (2010-2013)',
    vinPatterns: ['TMBAD1NP*', 'TMBAD2NP*'],
    supportedPids: {
      standard: ['01', '05', '06', '0A', '0B', '0C', '0D', '0E', '0F', '10', '11', '13', '14', '15', '1C', '1F', '21', '2F', '33', '40'],
      manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456', '22F4F0', '22F4F4'],
      dpf: ['22F4F0', '22F4F4', '22F4F8', '22F4FC']
    },
    pidMappings: {
      'rpm': '0C',
      'speed': '0D',
      'coolantTemp': '05',
      'intakeTemp': '0F',
      'maf': '10',
      'throttle': '11',
      'dpfSoot': '22F4F0'
    },
    specificParameters: {
      maxRpm: 4500,
      maxSpeed: 220,
      displacement: 2.0,
      power: 140,
      torque: 320,
      hasDPF: true
    }
  },

  // 2013-2020 Octavia III (5E)
  {
    id: 'skoda-octavia-2013-1.0-tsi',
    make: 'Skoda',
    model: 'Octavia III',
    year: 2013,
    engine: '1.0 TSI',
    fuel: 'Petrol',
    displayName: 'Skoda Octavia III 1.0 TSI (2013-2020)',
    vinPatterns: ['TMBCE1NP*', 'TMBCF1NP*'],
    supportedPids: {
      standard: ['01', '05', '06', '0A', '0B', '0C', '0D', '0E', '0F', '10', '11', '13', '14', '15', '1C', '1F', '21', '2F', '33', '40', '42', '43', '44', '45', '46', '47'],
      manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456', '22F187', '22F18C'],
      dpf: []
    },
    pidMappings: {
      'rpm': '0C',
      'speed': '0D',
      'coolantTemp': '05',
      'intakeTemp': '0F',
      'maf': '10',
      'throttle': '11'
    },
    specificParameters: {
      maxRpm: 6200,
      maxSpeed: 190,
      displacement: 1.0,
      power: 115,
      torque: 200
    }
  },
  {
    id: 'skoda-octavia-2013-1.2-tsi',
    make: 'Skoda',
    model: 'Octavia III',
    year: 2013,
    engine: '1.2 TSI',
    fuel: 'Petrol',
    displayName: 'Skoda Octavia III 1.2 TSI (2013-2020)',
    vinPatterns: ['TMBCE1NP*', 'TMBCF1NP*'],
    supportedPids: {
      standard: ['01', '05', '06', '0A', '0B', '0C', '0D', '0E', '0F', '10', '11', '13', '14', '15', '1C', '1F', '21', '2F', '33', '40', '42', '43', '44', '45', '46', '47'],
      manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456', '22F187', '22F18C'],
      dpf: []
    },
    pidMappings: {
      'rpm': '0C',
      'speed': '0D',
      'coolantTemp': '05',
      'intakeTemp': '0F',
      'maf': '10',
      'throttle': '11'
    },
    specificParameters: {
      maxRpm: 6500,
      maxSpeed: 190,
      displacement: 1.2,
      power: 105,
      torque: 175
    }
  },
  {
    id: 'skoda-octavia-2013-1.4-tsi',
    make: 'Skoda',
    model: 'Octavia III',
    year: 2013,
    engine: '1.4 TSI',
    fuel: 'Petrol',
    displayName: 'Skoda Octavia III 1.4 TSI (2013-2020)',
    vinPatterns: ['TMBCE1NP*', 'TMBCF1NP*'],
    supportedPids: {
      standard: ['01', '05', '06', '0A', '0B', '0C', '0D', '0E', '0F', '10', '11', '13', '14', '15', '1C', '1F', '21', '2F', '33', '40', '42', '43', '44', '45', '46', '47'],
      manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456', '22F187', '22F18C'],
      dpf: []
    },
    pidMappings: {
      'rpm': '0C',
      'speed': '0D',
      'coolantTemp': '05',
      'intakeTemp': '0F',
      'maf': '10',
      'throttle': '11'
    },
    specificParameters: {
      maxRpm: 6000,
      maxSpeed: 210,
      displacement: 1.4,
      power: 150,
      torque: 250
    }
  },
  {
    id: 'skoda-octavia-2013-1.6-tdi',
    make: 'Skoda',
    model: 'Octavia III',
    year: 2013,
    engine: '1.6 TDI',
    fuel: 'Diesel',
    displayName: 'Skoda Octavia III 1.6 TDI (2013-2020)',
    vinPatterns: ['TMBCE1NP*', 'TMBCF1NP*'],
    supportedPids: {
      standard: ['01', '05', '06', '0A', '0B', '0C', '0D', '0E', '0F', '10', '11', '13', '14', '15', '1C', '1F', '21', '2F', '33', '40', '42', '43', '44', '45', '46', '47'],
      manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456', '22F4F0', '22F4F4', '22F187', '22F18C'],
      dpf: ['22F4F0', '22F4F4', '22F4F8', '22F4FC', '22F500', '22F504']
    },
    pidMappings: {
      'rpm': '0C',
      'speed': '0D',
      'coolantTemp': '05',
      'intakeTemp': '0F',
      'maf': '10',
      'throttle': '11',
      'dpfSoot': '22F4F0'
    },
    specificParameters: {
      maxRpm: 4500,
      maxSpeed: 200,
      displacement: 1.6,
      power: 110,
      torque: 250,
      hasDPF: true
    }
  },
  {
    id: 'skoda-octavia-2013-2.0-tdi',
    make: 'Skoda',
    model: 'Octavia III',
    year: 2013,
    engine: '2.0 TDI',
    fuel: 'Diesel',
    displayName: 'Skoda Octavia III 2.0 TDI (2013-2020)',
    vinPatterns: ['TMBCE1NP*', 'TMBCF1NP*'],
    supportedPids: {
      standard: ['01', '05', '06', '0A', '0B', '0C', '0D', '0E', '0F', '10', '11', '13', '14', '15', '1C', '1F', '21', '2F', '33', '40', '42', '43', '44', '45', '46', '47'],
      manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456', '22F4F0', '22F4F4', '22F187', '22F18C'],
      dpf: ['22F4F0', '22F4F4', '22F4F8', '22F4FC', '22F500', '22F504']
    },
    pidMappings: {
      'rpm': '0C',
      'speed': '0D',
      'coolantTemp': '05',
      'intakeTemp': '0F',
      'maf': '10',
      'throttle': '11',
      'dpfSoot': '22F4F0'
    },
    specificParameters: {
      maxRpm: 4500,
      maxSpeed: 230,
      displacement: 2.0,
      power: 150,
      torque: 340,
      hasDPF: true
    }
  },

  // 2020+ Octavia IV (NX)
  {
    id: 'skoda-octavia-2020-1.0-tsi',
    make: 'Skoda',
    model: 'Octavia IV',
    year: 2020,
    engine: '1.0 TSI',
    fuel: 'Petrol',
    displayName: 'Skoda Octavia IV 1.0 TSI (2020+)',
    vinPatterns: ['TMBMD1NP*', 'TMBME1NP*'],
    supportedPids: {
      standard: ['01', '05', '06', '0A', '0B', '0C', '0D', '0E', '0F', '10', '11', '13', '14', '15', '1C', '1F', '21', '2F', '33', '40', '42', '43', '44', '45', '46', '47', '49', '4A', '4B', '4C'],
      manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456', '22F187', '22F18C', '22F1E0', '22F1E4'],
      dpf: []
    },
    pidMappings: {
      'rpm': '0C',
      'speed': '0D',
      'coolantTemp': '05',
      'intakeTemp': '0F',
      'maf': '10',
      'throttle': '11'
    },
    specificParameters: {
      maxRpm: 6200,
      maxSpeed: 195,
      displacement: 1.0,
      power: 110,
      torque: 200
    }
  },
  {
    id: 'skoda-octavia-2020-1.5-tsi',
    make: 'Skoda',
    model: 'Octavia IV',
    year: 2020,
    engine: '1.5 TSI',
    fuel: 'Petrol',
    displayName: 'Skoda Octavia IV 1.5 TSI (2020+)',
    vinPatterns: ['TMBMD1NP*', 'TMBME1NP*'],
    supportedPids: {
      standard: ['01', '05', '06', '0A', '0B', '0C', '0D', '0E', '0F', '10', '11', '13', '14', '15', '1C', '1F', '21', '2F', '33', '40', '42', '43', '44', '45', '46', '47', '49', '4A', '4B', '4C'],
      manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456', '22F187', '22F18C', '22F1E0', '22F1E4'],
      dpf: []
    },
    pidMappings: {
      'rpm': '0C',
      'speed': '0D',
      'coolantTemp': '05',
      'intakeTemp': '0F',
      'maf': '10',
      'throttle': '11'
    },
    specificParameters: {
      maxRpm: 6000,
      maxSpeed: 215,
      displacement: 1.5,
      power: 150,
      torque: 250
    }
  },
  {
    id: 'skoda-octavia-2020-2.0-tsi',
    make: 'Skoda',
    model: 'Octavia IV',
    year: 2020,
    engine: '2.0 TSI',
    fuel: 'Petrol',
    displayName: 'Skoda Octavia IV 2.0 TSI RS (2020+)',
    vinPatterns: ['TMBMD1NP*', 'TMBME1NP*'],
    supportedPids: {
      standard: ['01', '05', '06', '0A', '0B', '0C', '0D', '0E', '0F', '10', '11', '13', '14', '15', '1C', '1F', '21', '2F', '33', '40', '42', '43', '44', '45', '46', '47', '49', '4A', '4B', '4C'],
      manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456', '22F187', '22F18C', '22F1E0', '22F1E4'],
      dpf: []
    },
    pidMappings: {
      'rpm': '0C',
      'speed': '0D',
      'coolantTemp': '05',
      'intakeTemp': '0F',
      'maf': '10',
      'throttle': '11'
    },
    specificParameters: {
      maxRpm: 6500,
      maxSpeed: 250,
      displacement: 2.0,
      power: 245,
      torque: 370
    }
  },
  {
    id: 'skoda-octavia-2020-2.0-tdi',
    make: 'Skoda',
    model: 'Octavia IV',
    year: 2020,
    engine: '2.0 TDI',
    fuel: 'Diesel',
    displayName: 'Skoda Octavia IV 2.0 TDI (2020+)',
    vinPatterns: ['TMBMD1NP*', 'TMBME1NP*'],
    supportedPids: {
      standard: ['01', '05', '06', '0A', '0B', '0C', '0D', '0E', '0F', '10', '11', '13', '14', '15', '1C', '1F', '21', '2F', '33', '40', '42', '43', '44', '45', '46', '47', '49', '4A', '4B', '4C'],
      manufacturer: ['22F190', '22F1A3', '22F1A6', '22F40E', '22F456', '22F4F0', '22F4F4', '22F187', '22F18C', '22F1E0', '22F1E4'],
      dpf: ['22F4F0', '22F4F4', '22F4F8', '22F4FC', '22F500', '22F504', '22F508', '22F50C']
    },
    pidMappings: {
      'rpm': '0C',
      'speed': '0D',
      'coolantTemp': '05',
      'intakeTemp': '0F',
      'maf': '10',
      'throttle': '11',
      'dpfSoot': '22F4F0'
    },
    specificParameters: {
      maxRpm: 4500,
      maxSpeed: 225,
      displacement: 2.0,
      power: 150,
      torque: 360,
      hasDPF: true
    }
  }
];