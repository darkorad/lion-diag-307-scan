
export interface ScannerProfile {
  id: string;
  brand: string;
  model: string;
  type: 'bluetooth_classic' | 'bluetooth_le' | 'wifi' | 'usb';
  chipset: string;
  protocols: string[];
  specialFeatures: string[];
  connectionString?: string;
  initCommands: string[];
  capabilities: {
    biDirectional: boolean;
    realTimeData: boolean;
    dtcManagement: boolean;
    manufacturerSpecific: boolean;
    ecuCoding: boolean;
    adaptations: boolean;
    maxBaudRate: number;
    canBus: boolean;
    kwp2000: boolean;
    iso14230: boolean;
    j1850: boolean;
  };
  knownCompatibility: {
    works: string[];
    issues: string[];
    notSupported: string[];
  };
}

export const SCANNER_DATABASE: ScannerProfile[] = [
  // PROFESSIONAL SCANNERS
  {
    id: 'lexia3',
    brand: 'Citroen/Peugeot',
    model: 'Lexia-3 PP2000/Diagbox',
    type: 'usb',
    chipset: 'Custom',
    protocols: ['CAN', 'KWP2000', 'ISO14230', 'VAN'],
    specialFeatures: ['BSI_ACCESS', 'RADIO_CODING', 'IMMOBILIZER', 'ECU_FLASHING'],
    initCommands: ['ATWS', 'ATZ', 'ATE0', 'ATL0', 'ATS0', 'ATH1', 'ATSP0'],
    capabilities: {
      biDirectional: true,
      realTimeData: true,
      dtcManagement: true,
      manufacturerSpecific: true,
      ecuCoding: true,
      adaptations: true,
      maxBaudRate: 500000,
      canBus: true,
      kwp2000: true,
      iso14230: true,
      j1850: false
    },
    knownCompatibility: {
      works: ['Peugeot', 'Citroen', 'DS'],
      issues: [],
      notSupported: ['Volkswagen', 'BMW', 'Mercedes']
    }
  },
  {
    id: 'vcds_hex_can',
    brand: 'Ross-Tech',
    model: 'HEX-NET/HEX-V2',
    type: 'wifi',
    chipset: 'Custom',
    protocols: ['CAN', 'KWP2000', 'KWP1281'],
    specialFeatures: ['VAG_CODING', 'BASIC_SETTINGS', 'OUTPUT_TESTS', 'MEASURING_BLOCKS'],
    initCommands: ['CONNECT', 'LOGIN'],
    capabilities: {
      biDirectional: true,
      realTimeData: true,
      dtcManagement: true,
      manufacturerSpecific: true,
      ecuCoding: true,
      adaptations: true,
      maxBaudRate: 1000000,
      canBus: true,
      kwp2000: true,
      iso14230: true,
      j1850: false
    },
    knownCompatibility: {
      works: ['Volkswagen', 'Audi', 'Seat', 'Skoda', 'Bentley', 'Lamborghini'],
      issues: [],
      notSupported: ['Peugeot', 'Renault', 'BMW']
    }
  },

  // ELM327 BASED ADAPTERS
  {
    id: 'elm327_v15',
    brand: 'Generic',
    model: 'ELM327 v1.5',
    type: 'bluetooth_classic',
    chipset: 'ELM327',
    protocols: ['CAN', 'ISO14230', 'ISO9141', 'J1850VPW', 'J1850PWM'],
    specialFeatures: ['STANDARD_OBD2'],
    connectionString: '00:1D:A5:68:98:8A',
    initCommands: ['ATZ', 'ATE0', 'ATL0', 'ATS0', 'ATH1', 'ATSP0'],
    capabilities: {
      biDirectional: false,
      realTimeData: true,
      dtcManagement: true,
      manufacturerSpecific: false,
      ecuCoding: false,
      adaptations: false,
      maxBaudRate: 38400,
      canBus: true,
      kwp2000: true,
      iso14230: true,
      j1850: true
    },
    knownCompatibility: {
      works: ['Most 2001+ vehicles'],
      issues: ['Slow response', 'Limited functions'],
      notSupported: ['Pre-2001 vehicles', 'Some luxury cars']
    }
  },
  {
    id: 'elm327_v23',
    brand: 'Generic',
    model: 'ELM327 v2.3',
    type: 'bluetooth_classic',
    chipset: 'ELM327',
    protocols: ['CAN', 'ISO14230', 'ISO9141', 'J1850VPW', 'J1850PWM'],
    specialFeatures: ['STANDARD_OBD2', 'ENHANCED_CAN'],
    initCommands: ['ATZ', 'ATE0', 'ATL0', 'ATS0', 'ATH1', 'ATSP0'],
    capabilities: {
      biDirectional: true,
      realTimeData: true,
      dtcManagement: true,
      manufacturerSpecific: true,
      ecuCoding: false,
      adaptations: true,
      maxBaudRate: 115200,
      canBus: true,
      kwp2000: true,
      iso14230: true,
      j1850: true
    },
    knownCompatibility: {
      works: ['Most vehicles', 'Some bi-directional'],
      issues: ['Variable quality'],
      notSupported: ['Advanced coding functions']
    }
  },
  {
    id: 'elm327_wifi',
    brand: 'Generic',
    model: 'ELM327 WiFi',
    type: 'wifi',
    chipset: 'ELM327',
    protocols: ['CAN', 'ISO14230', 'ISO9141', 'J1850VPW', 'J1850PWM'],
    specialFeatures: ['WIFI_CONNECTION', 'STANDARD_OBD2'],
    connectionString: '192.168.0.10:35000',
    initCommands: ['ATZ', 'ATE0', 'ATL0', 'ATS0', 'ATH1', 'ATSP0'],
    capabilities: {
      biDirectional: false,
      realTimeData: true,
      dtcManagement: true,
      manufacturerSpecific: false,
      ecuCoding: false,
      adaptations: false,
      maxBaudRate: 115200,
      canBus: true,
      kwp2000: true,
      iso14230: true,
      j1850: true
    },
    knownCompatibility: {
      works: ['Most vehicles'],
      issues: ['WiFi connection stability'],
      notSupported: ['Advanced functions']
    }
  },

  // ADVANCED OBD2 ADAPTERS
  {
    id: 'obdlink_sx',
    brand: 'OBDLink',
    model: 'SX USB',
    type: 'usb',
    chipset: 'STN1170',
    protocols: ['CAN', 'ISO14230', 'ISO9141', 'J1850VPW', 'J1850PWM'],
    specialFeatures: ['HIGH_SPEED', 'RELIABLE', 'MULTIPLE_CAN'],
    initCommands: ['STDI', 'ATE0', 'ATL0', 'ATS0', 'ATH1', 'ATSP0'],
    capabilities: {
      biDirectional: true,
      realTimeData: true,
      dtcManagement: true,
      manufacturerSpecific: true,
      ecuCoding: false,
      adaptations: true,
      maxBaudRate: 2000000,
      canBus: true,
      kwp2000: true,
      iso14230: true,
      j1850: true
    },
    knownCompatibility: {
      works: ['All OBD2 vehicles', 'Many European cars'],
      issues: [],
      notSupported: ['ECU coding without manufacturer tools']
    }
  },
  {
    id: 'obdlink_lx',
    brand: 'OBDLink',
    model: 'LX Bluetooth',
    type: 'bluetooth_classic',
    chipset: 'STN1170',
    protocols: ['CAN', 'ISO14230', 'ISO9141', 'J1850VPW', 'J1850PWM'],
    specialFeatures: ['HIGH_SPEED', 'LOW_POWER', 'SLEEP_MODE'],
    initCommands: ['STDI', 'ATE0', 'ATL0', 'ATS0', 'ATH1', 'ATSP0'],
    capabilities: {
      biDirectional: true,
      realTimeData: true,
      dtcManagement: true,
      manufacturerSpecific: true,
      ecuCoding: false,
      adaptations: true,
      maxBaudRate: 2000000,
      canBus: true,
      kwp2000: true,
      iso14230: true,
      j1850: true
    },
    knownCompatibility: {
      works: ['All OBD2 vehicles', 'Excellent European car support'],
      issues: [],
      notSupported: ['Factory-level coding']
    }
  },

  // CHINESE/GENERIC ADAPTERS
  {
    id: 'veepeak_mini',
    brand: 'Veepeak',
    model: 'Mini WiFi',
    type: 'wifi',
    chipset: 'ELM327 Clone',
    protocols: ['CAN', 'ISO14230', 'ISO9141'],
    specialFeatures: ['COMPACT', 'BUDGET'],
    connectionString: '192.168.0.10:35000',
    initCommands: ['ATZ', 'ATE0', 'ATL0', 'ATS0', 'ATH1', 'ATSP0'],
    capabilities: {
      biDirectional: false,
      realTimeData: true,
      dtcManagement: true,
      manufacturerSpecific: false,
      ecuCoding: false,
      adaptations: false,
      maxBaudRate: 38400,
      canBus: true,
      kwp2000: true,
      iso14230: true,
      j1850: false
    },
    knownCompatibility: {
      works: ['Basic OBD2 functions'],
      issues: ['Limited compatibility', 'Slow response'],
      notSupported: ['Advanced functions', 'Some European cars']
    }
  },
  {
    id: 'konnwei_kw902',
    brand: 'KONNWEI',
    model: 'KW902 Bluetooth',
    type: 'bluetooth_classic',
    chipset: 'ELM327 Compatible',
    protocols: ['CAN', 'ISO14230', 'ISO9141', 'J1850VPW'],
    specialFeatures: ['COLOR_LED', 'SLEEP_MODE'],
    initCommands: ['ATZ', 'ATE0', 'ATL0', 'ATS0', 'ATH1', 'ATSP0'],
    capabilities: {
      biDirectional: false,
      realTimeData: true,
      dtcManagement: true,
      manufacturerSpecific: false,
      ecuCoding: false,
      adaptations: false,
      maxBaudRate: 38400,
      canBus: true,
      kwp2000: true,
      iso14230: true,
      j1850: true
    },
    knownCompatibility: {
      works: ['Most post-2005 vehicles'],
      issues: ['Variable build quality'],
      notSupported: ['Pre-2005 vehicles', 'Advanced diagnostics']
    }
  },

  // BLUETOOTH LE ADAPTERS
  {
    id: 'carista_ble',
    brand: 'Carista',
    model: 'OBD2 BLE',
    type: 'bluetooth_le',
    chipset: 'Custom BLE',
    protocols: ['CAN', 'ISO14230'],
    specialFeatures: ['SMARTPHONE_APP', 'BASIC_CODING'],
    initCommands: ['CONNECT_BLE'],
    capabilities: {
      biDirectional: true,
      realTimeData: true,
      dtcManagement: true,
      manufacturerSpecific: true,
      ecuCoding: true,
      adaptations: true,
      maxBaudRate: 500000,
      canBus: true,
      kwp2000: true,
      iso14230: true,
      j1850: false
    },
    knownCompatibility: {
      works: ['Volkswagen', 'Audi', 'BMW', 'Mercedes', 'Toyota'],
      issues: ['Limited to app functions'],
      notSupported: ['Deep diagnostics', 'Professional coding']
    }
  }
];

export const getScannersByType = (type: string) => {
  return SCANNER_DATABASE.filter(scanner => scanner.type === type);
};

export const getScannerById = (id: string) => {
  return SCANNER_DATABASE.find(scanner => scanner.id === id);
};

export const getScannersForManufacturer = (manufacturer: string) => {
  return SCANNER_DATABASE.filter(scanner => 
    scanner.knownCompatibility.works.some(make => 
      make.toLowerCase().includes(manufacturer.toLowerCase()) || 
      make.includes('Most') || 
      make.includes('All')
    )
  );
};

export const getAllScannerBrands = () => {
  return [...new Set(SCANNER_DATABASE.map(scanner => scanner.brand))].sort();
};
