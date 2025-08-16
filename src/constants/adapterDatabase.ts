import { OBD2Adapter } from '@/types/adapters';

export const OBD2_ADAPTERS: OBD2Adapter[] = [
  // ===== GENERIC ELM327 BLUETOOTH ADAPTERS =====
  {
    id: 'elm327-bt-v15',
    name: 'ELM327 Bluetooth v1.5',
    brand: 'Generic',
    model: 'ELM327 v1.5',
    connectionType: 'bluetooth',
    description: 'Standard Bluetooth OBD2 scanner with ELM327 chipset',
    features: [
      'Bluetooth 2.0/3.0 support',
      'Compatible with most vehicles',
      'Standard OBD2 protocols',
      'Low power consumption'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD'],
    price: '$8-15',
    defaultPin: '1234'
  },
  {
    id: 'elm327-bt-v21',
    name: 'ELM327 Bluetooth v2.1',
    brand: 'Generic',
    model: 'ELM327 v2.1',
    connectionType: 'bluetooth',
    description: 'Enhanced Bluetooth OBD2 scanner with better compatibility',
    features: [
      'Bluetooth 2.1 EDR',
      'Improved error handling',
      'Faster connection',
      'Better protocol support'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN'],
    price: '$12-20',
    defaultPin: '1234'
  },
  {
    id: 'elm327-bt-v23',
    name: 'ELM327 Bluetooth v2.3',
    brand: 'Generic',
    model: 'ELM327 v2.3',
    connectionType: 'bluetooth',
    description: 'Advanced Bluetooth OBD2 adapter with improved compatibility',
    features: [
      'Bluetooth 4.0 support',
      'Faster data transmission',
      'Enhanced protocol support',
      'Better error handling'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN'],
    price: '$15-25',
    defaultPin: '1234'
  },

  // ===== VGATE BLUETOOTH ADAPTERS =====
  {
    id: 'vgate-icar-pro',
    name: 'Vgate iCar Pro',
    brand: 'Vgate',
    model: 'iCar Pro',
    connectionType: 'bluetooth',
    description: 'Professional-grade Bluetooth OBD2 adapter',
    features: [
      'Bluetooth 4.0 LE',
      'Professional diagnostics',
      'Multi-protocol support',
      'Compact design'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'ISO'],
    price: '$45-60',
    defaultPin: '0000'
  },
  {
    id: 'vgate-icar-2',
    name: 'Vgate iCar 2',
    brand: 'Vgate',
    model: 'iCar 2',
    connectionType: 'bluetooth',
    description: 'Reliable Bluetooth OBD2 scanner with good performance',
    features: [
      'Bluetooth 3.0',
      'Stable connection',
      'Good compatibility',
      'Reasonable price'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN'],
    price: '$25-35',
    defaultPin: '1234'
  },
  {
    id: 'vgate-icar-3',
    name: 'Vgate iCar 3',
    brand: 'Vgate',
    model: 'iCar 3',
    connectionType: 'bluetooth',
    description: 'Latest Vgate Bluetooth scanner with enhanced features',
    features: [
      'Bluetooth 5.0',
      'Fast diagnostics',
      'Extended range',
      'All protocols support'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'ISO', 'KWP'],
    price: '$55-75',
    defaultPin: '0000'
  },

  // ===== VEEPEAK BLUETOOTH ADAPTERS =====
  {
    id: 'veepeak-vpecker-e1',
    name: 'Veepeak Vpecker E1',
    brand: 'Veepeak',
    model: 'Vpecker E1',
    connectionType: 'bluetooth',
    description: 'Professional Bluetooth OBD2 scanner with advanced features',
    features: [
      'Bluetooth 4.0',
      'Enhanced diagnostics',
      'Real-time data streaming',
      'Professional software'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'ISO', 'KWP'],
    price: '$35-50',
    defaultPin: '1234'
  },
  {
    id: 'veepeak-obd-check',
    name: 'Veepeak OBDCheck',
    brand: 'Veepeak',
    model: 'OBDCheck BLE',
    connectionType: 'bluetooth',
    description: 'Bluetooth Low Energy OBD2 adapter for smartphones',
    features: [
      'Bluetooth Low Energy',
      'Smartphone optimized',
      'Long battery life',
      'Easy pairing'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN'],
    price: '$25-40',
    defaultPin: '0000'
  },
  {
    id: 'veepeak-mini',
    name: 'Veepeak Mini BLE',
    brand: 'Veepeak',
    model: 'Mini BLE+',
    connectionType: 'bluetooth',
    description: 'Ultra-compact Bluetooth Low Energy scanner',
    features: [
      'Ultra-compact design',
      'Bluetooth LE 4.0',
      'iOS/Android support',
      'Easy installation'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN'],
    price: '$30-45',
    defaultPin: '0000'
  },

  // ===== KONNWEI BLUETOOTH ADAPTERS =====
  {
    id: 'konnwei-kw902',
    name: 'KONNWEI KW902',
    brand: 'KONNWEI',
    model: 'KW902',
    connectionType: 'bluetooth',
    description: 'Professional ELM327 Bluetooth scanner',
    features: [
      'ELM327 v2.1 chip',
      'Bluetooth 3.0',
      'All OBD protocols',
      'Real-time data'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'ISO'],
    price: '$20-35',
    defaultPin: '1234'
  },
  {
    id: 'konnwei-kw903',
    name: 'KONNWEI KW903',
    brand: 'KONNWEI',
    model: 'KW903',
    connectionType: 'bluetooth',
    description: 'Enhanced Bluetooth OBD2 scanner with better compatibility',
    features: [
      'Improved ELM327 chip',
      'Bluetooth 4.0',
      'Enhanced protocols',
      'Stable connection'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'ISO', 'KWP'],
    price: '$25-40',
    defaultPin: '1234'
  },
  {
    id: 'konnwei-kw850',
    name: 'KONNWEI KW850',
    brand: 'KONNWEI',
    model: 'KW850',
    connectionType: 'bluetooth',
    description: 'Professional handheld scanner with Bluetooth',
    features: [
      'Handheld scanner',
      'Bluetooth connectivity',
      'Full system diagnostics',
      'Code reader functions'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'Manufacturer Specific'],
    price: '$80-120',
    defaultPin: '0000'
  },

  // ===== BAFX BLUETOOTH ADAPTERS =====
  {
    id: 'bafx-34t5',
    name: 'BAFX Products 34t5',
    brand: 'BAFX',
    model: '34t5 Bluetooth',
    connectionType: 'bluetooth',
    description: 'High-quality Bluetooth OBD2 scanner made in USA',
    features: [
      'Made in USA',
      'High build quality',
      'Bluetooth 2.1',
      'Excellent compatibility'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN'],
    price: '$25-35',
    defaultPin: '1234'
  },

  // ===== AUTEL BLUETOOTH ADAPTERS =====
  {
    id: 'autel-ap200',
    name: 'Autel AP200',
    brand: 'Autel',
    model: 'AP200',
    connectionType: 'bluetooth',
    description: 'Professional Bluetooth scanner with full system diagnostics',
    features: [
      'Full system scan',
      'Bluetooth 4.0',
      'Professional diagnostics',
      'Regular updates'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'Manufacturer Protocols'],
    price: '$150-200',
    defaultPin: '0000'
  },
  {
    id: 'autel-maxicom',
    name: 'Autel MaxiCOM',
    brand: 'Autel',
    model: 'MaxiCOM MK808',
    connectionType: 'bluetooth',
    description: 'Advanced diagnostic scanner with tablet interface',
    features: [
      'Tablet interface',
      'All systems diagnostics',
      'Special functions',
      'Bi-directional control'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'Manufacturer Protocols'],
    price: '$300-500',
    defaultPin: '1234'
  },

  // ===== LAUNCH BLUETOOTH ADAPTERS =====
  {
    id: 'launch-x431-creader',
    name: 'Launch X431 Creader',
    brand: 'Launch',
    model: 'X431 Creader',
    connectionType: 'bluetooth',
    description: 'Professional diagnostic tool with advanced features',
    features: [
      'Professional diagnostics',
      'Multiple vehicle systems',
      'Advanced functions',
      'Regular updates'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'Manufacturer Specific'],
    price: '$150-250',
    defaultPin: '0000'
  },
  {
    id: 'launch-dbscar7',
    name: 'Launch DBSCar7',
    brand: 'Launch',
    model: 'DBSCar7',
    connectionType: 'bluetooth',
    description: 'Bluetooth connector for professional diagnostics',
    features: [
      'Professional grade',
      'Bluetooth 4.0',
      'All protocols',
      'High reliability'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'ISO', 'KWP'],
    price: '$100-150',
    defaultPin: '1234'
  },

  // ===== FOXWELL BLUETOOTH ADAPTERS =====
  {
    id: 'foxwell-nt301',
    name: 'Foxwell NT301',
    brand: 'Foxwell',
    model: 'NT301',
    connectionType: 'bluetooth',
    description: 'Professional OBD2 scanner with Bluetooth capability',
    features: [
      'Professional scanner',
      'Bluetooth connectivity',
      'Full OBD2 functions',
      'Easy to use'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN'],
    price: '$60-90',
    defaultPin: '0000'
  },
  {
    id: 'foxwell-nt624',
    name: 'Foxwell NT624 Elite',
    brand: 'Foxwell',
    model: 'NT624 Elite',
    connectionType: 'bluetooth',
    description: 'Advanced scanner with Bluetooth and special functions',
    features: [
      'Full system diagnostics',
      'Bluetooth support',
      'Special functions',
      'Professional grade'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'Manufacturer Specific'],
    price: '$200-300',
    defaultPin: '1234'
  },

  // ===== ANCEL BLUETOOTH ADAPTERS =====
  {
    id: 'ancel-bd310',
    name: 'ANCEL BD310',
    brand: 'ANCEL',
    model: 'BD310',
    connectionType: 'bluetooth',
    description: 'Bluetooth OBD2 scanner with enhanced features',
    features: [
      'Bluetooth 4.0',
      'Enhanced diagnostics',
      'Real-time data',
      'Good value'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN'],
    price: '$20-30',
    defaultPin: '1234'
  },
  {
    id: 'ancel-fx6000',
    name: 'ANCEL FX6000',
    brand: 'ANCEL',
    model: 'FX6000',
    connectionType: 'bluetooth',
    description: 'Professional scanner with Bluetooth and full system access',
    features: [
      'Full system scanner',
      'Bluetooth connectivity',
      'Professional functions',
      'All vehicle systems'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'Manufacturer Protocols'],
    price: '$150-200',
    defaultPin: '0000'
  },

  // ===== TOPDON BLUETOOTH ADAPTERS =====
  {
    id: 'topdon-artilink200',
    name: 'TOPDON ArtiLink 200',
    brand: 'TOPDON',
    model: 'ArtiLink 200',
    connectionType: 'bluetooth',
    description: 'Bluetooth LE adapter with professional features',
    features: [
      'Bluetooth Low Energy',
      'Professional diagnostics',
      'All protocols support',
      'Compact design'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'ISO'],
    price: '$40-60',
    defaultPin: '0000'
  },
  {
    id: 'topdon-phoenix-lite',
    name: 'TOPDON Phoenix Lite',
    brand: 'TOPDON',
    model: 'Phoenix Lite',
    connectionType: 'bluetooth',
    description: 'Advanced scanner with Bluetooth and special functions',
    features: [
      'Full system diagnostics',
      'Bluetooth 4.0',
      'Special functions',
      'Regular updates'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'Manufacturer Specific'],
    price: '$200-300',
    defaultPin: '1234'
  },

  // ===== FOSEAL BLUETOOTH ADAPTERS =====
  {
    id: 'foseal-bluetooth',
    name: 'FOSEAL Bluetooth OBD2',
    brand: 'FOSEAL',
    model: 'F-16',
    connectionType: 'bluetooth',
    description: 'Compact Bluetooth OBD2 adapter with good build quality',
    features: [
      'Bluetooth 2.1',
      'Compact design',
      'LED status indicators',
      'Good value for money'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN'],
    price: '$20-30',
    defaultPin: '1234'
  },

  // ===== KUNGBER BLUETOOTH ADAPTERS =====
  {
    id: 'kungber-mini',
    name: 'KUNGBER Mini OBD2',
    brand: 'KUNGBER',
    model: 'K-Mini',
    connectionType: 'bluetooth',
    description: 'Ultra-compact Bluetooth OBD2 scanner',
    features: [
      'Ultra-compact size',
      'Bluetooth 4.0',
      'Low power consumption',
      'Easy installation'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN'],
    price: '$18-28',
    defaultPin: '1234'
  },

  // ===== SCANTOOL BLUETOOTH ADAPTERS =====
  {
    id: 'scantool-obdlink-lx',
    name: 'ScanTool OBDLink LX',
    brand: 'ScanTool',
    model: 'OBDLink LX',
    connectionType: 'bluetooth',
    description: 'Professional Bluetooth OBD2 adapter',
    features: [
      'Professional grade',
      'Bluetooth 2.1',
      'All OBD protocols',
      'High reliability'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'ISO', 'KWP', 'PWM'],
    price: '$100-150',
    defaultPin: '1234'
  },
  {
    id: 'scantool-obdlink-mx',
    name: 'ScanTool OBDLink MX',
    brand: 'ScanTool',
    model: 'OBDLink MX',
    connectionType: 'bluetooth',
    description: 'Advanced Bluetooth scanner with enhanced features',
    features: [
      'Advanced diagnostics',
      'Bluetooth 2.1',
      'Fast processing',
      'Professional quality'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'ISO', 'KWP', 'PWM'],
    price: '$120-180',
    defaultPin: '1234'
  },

  // ===== PANLONG BLUETOOTH ADAPTERS =====
  {
    id: 'panlong-bluetooth',
    name: 'Panlong Bluetooth OBD2',
    brand: 'Panlong',
    model: 'PL-BT',
    connectionType: 'bluetooth',
    description: 'Affordable Bluetooth OBD2 scanner',
    features: [
      'Affordable price',
      'Bluetooth 2.1',
      'Basic diagnostics',
      'Easy setup'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN'],
    price: '$15-25',
    defaultPin: '1234'
  },

  // ===== INNOVA BLUETOOTH ADAPTERS =====
  {
    id: 'innova-3160g',
    name: 'Innova 3160g',
    brand: 'Innova',
    model: '3160g',
    connectionType: 'bluetooth',
    description: 'Professional scanner with Bluetooth connectivity',
    features: [
      'Professional diagnostics',
      'Bluetooth support',
      'Live data stream',
      'Freeze frame data'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN'],
    price: '$80-120',
    defaultPin: '0000'
  },

  // ===== THINKDRIVER BLUETOOTH ADAPTERS =====
  {
    id: 'thinkdriver-bluetooth',
    name: 'ThinkDriver Bluetooth',
    brand: 'ThinkDriver',
    model: 'TD-BT',
    connectionType: 'bluetooth',
    description: 'Advanced Bluetooth scanner with app support',
    features: [
      'App-based diagnostics',
      'Bluetooth 4.0',
      'Full system access',
      'Regular updates'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'Manufacturer Specific'],
    price: '$60-100',
    defaultPin: '1234'
  },

  // ===== CREATOR BLUETOOTH ADAPTERS =====
  {
    id: 'creator-c110',
    name: 'Creator C110+',
    brand: 'Creator',
    model: 'C110+',
    connectionType: 'bluetooth',
    description: 'Professional BMW/MINI scanner with Bluetooth',
    features: [
      'BMW/MINI specialist',
      'Bluetooth connectivity',
      'Professional functions',
      'Coding capability'
    ],
    compatibility: ['OBD2', 'BMW ISTA', 'MINI Protocols'],
    price: '$200-350',
    defaultPin: '0000'
  },

  // ===== CHINESE TEMU BUDGET OPTIONS =====
  {
    id: 'mini-elm327-bt',
    name: 'Mini ELM327 Bluetooth',
    brand: 'No-Name',
    model: 'Mini-BT',
    connectionType: 'bluetooth',
    description: 'Ultra-compact budget Bluetooth adapter',
    features: [
      'Tiny size',
      'Basic functionality',
      'Very cheap',
      'Plug and forget'
    ],
    compatibility: ['OBD2'],
    price: '$3-8',
    defaultPin: '1234'
  },
  {
    id: 'generic-obd2-bt',
    name: 'Generic OBD2 Bluetooth',
    brand: 'Generic',
    model: 'Universal BT',
    connectionType: 'bluetooth',
    description: 'Universal Bluetooth adapter - works with most vehicles',
    features: [
      'Universal compatibility',
      'Standard protocols',
      'Reliable connection',
      'Good value'
    ],
    compatibility: ['OBD2', 'EOBD'],
    price: '$8-18',
    defaultPin: '1234'
  },
  {
    id: 'no-name-bt-basic',
    name: 'No-Name Bluetooth Basic',
    brand: 'No-Name',
    model: 'BT-Basic',
    connectionType: 'bluetooth',
    description: 'Budget Bluetooth OBD2 adapter - works with most cars',
    features: [
      'Basic Bluetooth 2.0',
      'Standard OBD2 only',
      'Very affordable',
      'Simple setup'
    ],
    compatibility: ['OBD2'],
    price: '$5-10',
    defaultPin: '1234'
  },
  {
    id: 'no-name-bt-advanced',
    name: 'No-Name Bluetooth Pro',
    brand: 'No-Name',
    model: 'BT-Pro',
    connectionType: 'bluetooth',
    description: 'Enhanced no-name Bluetooth adapter with better features',
    features: [
      'Bluetooth 3.0',
      'Multiple protocols',
      'LED indicators',
      'Auto-sleep mode'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN'],
    price: '$8-15',
    defaultPin: '0000'
  },

  // ===== MORE CHINESE/TEMU BRANDS =====
  {
    id: 'autder-obd2',
    name: 'AUTDER OBD2 Bluetooth',
    brand: 'AUTDER',
    model: 'AD310',
    connectionType: 'bluetooth',
    description: 'Chinese OBD2 scanner with ELM327 chip',
    features: [
      'ELM327 v2.1',
      'Bluetooth 3.0',
      'Multi-language support',
      'Car Scanner Pro compatible'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN'],
    price: '$12-20',
    defaultPin: '1234'
  },
  {
    id: 'motopower-mp69033',
    name: 'MOTOPOWER MP69033',
    brand: 'MOTOPOWER',
    model: 'MP69033',
    connectionType: 'bluetooth',
    description: 'Popular Temu OBD2 scanner with good reviews',
    features: [
      'Bluetooth 4.0',
      'Compatible with most apps',
      'Automatic protocol detection',
      'LED status lights'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN'],
    price: '$15-25',
    defaultPin: '1234'
  },
  {
    id: 'nexas-nt301',
    name: 'NEXAS NT301',
    brand: 'NEXAS',
    model: 'NT301',
    connectionType: 'bluetooth',
    description: 'Chinese handheld scanner with Bluetooth',
    features: [
      'Handheld display',
      'Bluetooth connectivity',
      'One-click readiness',
      'Live data stream'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN'],
    price: '$40-60',
    defaultPin: '0000'
  },
  {
    id: 'kzyee-kc501',
    name: 'KZYEE KC501',
    brand: 'KZYEE',
    model: 'KC501',
    connectionType: 'bluetooth',
    description: 'Enhanced Chinese OBD2 scanner with advanced features',
    features: [
      'Enhanced ELM327',
      'Bluetooth 4.0',
      'All protocols support',
      'OBD2 Facile compatible'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'ISO'],
    price: '$18-30',
    defaultPin: '1234'
  },
  {
    id: 'vxdas-vcx-nano',
    name: 'VXDAS VCX NANO',
    brand: 'VXDAS',
    model: 'VCX NANO',
    connectionType: 'bluetooth',
    description: 'Professional Chinese diagnostic interface',
    features: [
      'Multi-brand support',
      'Bluetooth connectivity',
      'Professional software',
      'Regular updates'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN', 'Manufacturer Specific'],
    price: '$35-55',
    defaultPin: '0000'
  },
  {
    id: 'autophix-7710',
    name: 'AUTOPHIX 7710',
    brand: 'AUTOPHIX',
    model: '7710',
    connectionType: 'bluetooth',
    description: 'Professional scanner with Bluetooth and special functions',
    features: [
      'Full system diagnostics',
      'Bluetooth connectivity',
      'Special functions',
      'Oil reset capability'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'Manufacturer Specific'],
    price: '$100-150',
    defaultPin: '0000'
  },
  {
    id: 'mucar-cdp',
    name: 'MUCAR CDP+',
    brand: 'MUCAR',
    model: 'CDP+',
    connectionType: 'bluetooth',
    description: 'Multi-brand diagnostic tool with Bluetooth',
    features: [
      'Multi-brand support',
      'Bluetooth 4.0',
      'Professional diagnostics',
      'Car programming'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN', 'Manufacturer Protocols'],
    price: '$150-250',
    defaultPin: '1234'
  },
  {
    id: 'xtool-a30m',
    name: 'XTOOL A30M',
    brand: 'XTOOL',
    model: 'A30M',
    connectionType: 'bluetooth',
    description: 'Professional scanner with Bluetooth capability',
    features: [
      'Full system scan',
      'Bluetooth support',
      'Special functions',
      'Manufacturer specific'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'Manufacturer Specific'],
    price: '$120-180',
    defaultPin: '0000'
  },
  {
    id: 'humzor-nexzdas',
    name: 'HUMZOR NexzDAS',
    brand: 'HUMZOR',
    model: 'NexzDAS',
    connectionType: 'bluetooth',
    description: 'Advanced Chinese scanner with tablet interface',
    features: [
      'Android tablet interface',
      'Bluetooth connectivity',
      'All systems diagnostics',
      'Regular software updates'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN', 'Manufacturer Protocols'],
    price: '$200-300',
    defaultPin: '1234'
  },
  {
    id: 'launch-thinkdiag',
    name: 'Launch ThinkDiag',
    brand: 'Launch',
    model: 'ThinkDiag',
    connectionType: 'bluetooth',
    description: 'Popular app-based diagnostic tool',
    features: [
      'App-based diagnostics',
      'Bluetooth 4.0',
      'Multi-brand support',
      'Regular app updates'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN', 'Manufacturer Specific'],
    price: '$80-120',
    defaultPin: '0000'
  },

  // ===== ULTRA-BUDGET TEMU SPECIALS =====
  {
    id: 'super-mini-elm327',
    name: 'Super Mini ELM327 v2.1',
    brand: 'Generic',
    model: 'Super Mini v2.1',
    connectionType: 'bluetooth',
    description: 'Ultra-compact ELM327 with enhanced chip',
    features: [
      'Super mini design',
      'Enhanced ELM327 chip',
      'Bluetooth 3.0',
      'Better error handling'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN'],
    price: '$10-18',
    defaultPin: '1234'
  },
  {
    id: 'temu-special-obd2',
    name: 'Temu Special OBD2',
    brand: 'No-Name',
    model: 'TS-BT',
    connectionType: 'bluetooth',
    description: 'Ultra-cheap Temu special OBD2 adapter',
    features: [
      'Rock bottom price',
      'Basic ELM327',
      'Bluetooth 2.0',
      'Works with most apps'
    ],
    compatibility: ['OBD2'],
    price: '$2-6',
    defaultPin: '1234'
  },
  {
    id: 'chinese-elm327-pro',
    name: 'Chinese ELM327 Pro',
    brand: 'Generic',
    model: 'ELM327-PRO',
    connectionType: 'bluetooth',
    description: 'Enhanced Chinese ELM327 with better features',
    features: [
      'Enhanced chip design',
      'Bluetooth 4.0',
      'Auto-reconnect',
      'Multiple app support'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN'],
    price: '$8-16',
    defaultPin: '0000'
  },
  {
    id: 'obd365-scanner',
    name: 'OBD365 Scanner',
    brand: 'OBD365',
    model: 'BT-365',
    connectionType: 'bluetooth',
    description: 'Chinese OBD2 scanner with app support',
    features: [
      'Dedicated app support',
      'Bluetooth 3.0',
      'Real-time monitoring',
      'Good compatibility'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN'],
    price: '$20-35',
    defaultPin: '1234'
  },
  {
    id: 'carscan-elm327',
    name: 'CarScan ELM327',
    brand: 'CarScan',
    model: 'CS-327',
    connectionType: 'bluetooth',
    description: 'Car Scanner Pro optimized adapter',
    features: [
      'Car Scanner Pro optimized',
      'Bluetooth 4.0',
      'Fast data rate',
      'Stable connection'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN'],
    price: '$15-28',
    defaultPin: '1234'
  },
  {
    id: 'universal-elm327',
    name: 'Universal ELM327 Plus',
    brand: 'Generic',
    model: 'ELM327-PLUS',
    connectionType: 'bluetooth',
    description: 'Universal ELM327 with enhanced compatibility',
    features: [
      'Universal compatibility',
      'Enhanced protocol support',
      'Bluetooth 3.0',
      'LED indicators'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN'],
    price: '$12-22',
    defaultPin: '1234'
  },
  {
    id: 'china-pro-obd2',
    name: 'China Pro OBD2',
    brand: 'No-Name',
    model: 'CP-OBD2',
    connectionType: 'bluetooth',
    description: 'Professional Chinese OBD2 scanner',
    features: [
      'Professional grade',
      'Bluetooth 4.0',
      'All protocols',
      'Carly compatible'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN', 'ISO'],
    price: '$18-32',
    defaultPin: '0000'
  },
  {
    id: 'bluetooth-obd2-v25',
    name: 'Bluetooth OBD2 v2.5',
    brand: 'Generic',
    model: 'BT-OBD2-v2.5',
    connectionType: 'bluetooth',
    description: 'Latest version Chinese Bluetooth adapter',
    features: [
      'Latest v2.5 chip',
      'Bluetooth 5.0',
      'Extended range',
      'Power saving mode'
    ],
    compatibility: ['OBD2', 'EOBD', 'JOBD', 'CAN'],
    price: '$16-28',
    defaultPin: '1234'
  },
  {
    id: 'mini-scan-tool',
    name: 'Mini Scan Tool BT',
    brand: 'Generic',
    model: 'MST-BT',
    connectionType: 'bluetooth',
    description: 'Tiny scanning tool with Bluetooth',
    features: [
      'Smallest size available',
      'Bluetooth 3.0',
      'Plug and play',
      'Works with all apps'
    ],
    compatibility: ['OBD2', 'EOBD'],
    price: '$6-14',
    defaultPin: '1234'
  },
  {
    id: 'pocket-obd2',
    name: 'Pocket OBD2 Scanner',
    brand: 'No-Name',
    model: 'POB2-BT',
    connectionType: 'bluetooth',
    description: 'Pocket-sized OBD2 scanner',
    features: [
      'Pocket-sized design',
      'Bluetooth 2.1',
      'Basic diagnostics',
      'Very portable'
    ],
    compatibility: ['OBD2'],
    price: '$4-12',
    defaultPin: '1234'
  },

  // ===== APP-SPECIFIC OPTIMIZED ADAPTERS =====
  {
    id: 'torque-optimized',
    name: 'Torque Optimized ELM327',
    brand: 'Generic',
    model: 'TO-327',
    connectionType: 'bluetooth',
    description: 'Torque Pro app optimized adapter',
    features: [
      'Torque Pro optimized',
      'Fast PIDs response',
      'Bluetooth 3.0',
      'Stable data stream'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN'],
    price: '$14-24',
    defaultPin: '1234'
  },
  {
    id: 'carly-compatible',
    name: 'Carly Compatible Scanner',
    brand: 'Generic',
    model: 'CC-BT',
    connectionType: 'bluetooth',
    description: 'Specially designed for Carly app',
    features: [
      'Carly app compatible',
      'Enhanced protocols',
      'Bluetooth 4.0',
      'Coding support'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN', 'Manufacturer Specific'],
    price: '$25-45',
    defaultPin: '0000'
  },
  {
    id: 'obd2-facile-ready',
    name: 'OBD2 Facile Ready',
    brand: 'Generic',
    model: 'OF-Ready',
    connectionType: 'bluetooth',
    description: 'Pre-configured for OBD2 Facile app',
    features: [
      'OBD2 Facile ready',
      'Pre-configured settings',
      'Bluetooth 3.0',
      'French car optimized'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN'],
    price: '$16-28',
    defaultPin: '1234'
  },

  // ===== PROFESSIONAL CHINESE BRANDS =====
  {
    id: 'lonsdor-k518',
    name: 'Lonsdor K518',
    brand: 'Lonsdor',
    model: 'K518ISE',
    connectionType: 'bluetooth',
    description: 'Professional Chinese programmer with Bluetooth',
    features: [
      'Key programming',
      'Bluetooth support',
      'Multi-brand coverage',
      'Professional functions'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN', 'Manufacturer Protocols'],
    price: '$300-500',
    defaultPin: '0000'
  },
  {
    id: 'obdstar-x300m',
    name: 'OBDSTAR X300M',
    brand: 'OBDSTAR',
    model: 'X300M',
    connectionType: 'bluetooth',
    description: 'Professional odometer correction tool',
    features: [
      'Odometer correction',
      'Bluetooth connectivity',
      'Multi-brand support',
      'Professional grade'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN', 'Manufacturer Specific'],
    price: '$400-600',
    defaultPin: '1234'
  },
  {
    id: 'yanhua-mini-acdp',
    name: 'Yanhua Mini ACDP',
    brand: 'Yanhua',
    model: 'Mini ACDP',
    connectionType: 'bluetooth',
    description: 'Advanced programming tool with Bluetooth',
    features: [
      'Advanced programming',
      'Bluetooth support',
      'Multiple modules',
      'Professional use'
    ],
    compatibility: ['OBD2', 'EOBD', 'CAN', 'Manufacturer Protocols'],
    price: '$500-800',
    defaultPin: '0000'
  }
];

export const getAdaptersByType = (type: 'bluetooth' | 'wifi' | 'usb') => {
  return OBD2_ADAPTERS.filter(adapter => adapter.connectionType === type);
};

export const getAdapterById = (id: string) => {
  return OBD2_ADAPTERS.find(adapter => adapter.id === id);
};

export const getBudgetAdapters = () => {
  return OBD2_ADAPTERS.filter(adapter => 
    adapter.brand === 'No-Name' || 
    adapter.brand === 'Generic' || 
    adapter.price.includes('$2') ||
    adapter.price.includes('$3') || 
    adapter.price.includes('$4') ||
    adapter.price.includes('$5') || 
    adapter.price.includes('$6') ||
    adapter.price.includes('$8')
  );
};

export const getProfessionalAdapters = () => {
  return OBD2_ADAPTERS.filter(adapter => 
    adapter.price.includes('$80') || 
    adapter.price.includes('$150') || 
    adapter.price.includes('$300') ||
    adapter.price.includes('$400') ||
    adapter.price.includes('$500') ||
    adapter.brand === 'Launch' ||
    adapter.brand === 'Autel' ||
    adapter.brand === 'ScanTool' ||
    adapter.brand === 'Foxwell' ||
    adapter.brand === 'TOPDON' ||
    adapter.brand === 'Lonsdor' ||
    adapter.brand === 'OBDSTAR' ||
    adapter.brand === 'Yanhua'
  );
};

export const getChineseAdapters = () => {
  return OBD2_ADAPTERS.filter(adapter => 
    adapter.brand === 'No-Name' || 
    adapter.brand === 'Generic' ||
    adapter.brand === 'AUTDER' ||
    adapter.brand === 'MOTOPOWER' ||
    adapter.brand === 'NEXAS' ||
    adapter.brand === 'KZYEE' ||
    adapter.brand === 'VXDAS' ||
    adapter.brand === 'MUCAR' ||
    adapter.brand === 'XTOOL' ||
    adapter.brand === 'HUMZOR' ||
    adapter.brand === 'OBD365' ||
    adapter.brand === 'CarScan' ||
    adapter.price.includes('$2') ||
    adapter.price.includes('$3') ||
    adapter.price.includes('$4') ||
    adapter.price.includes('$5') ||
    adapter.price.includes('$6') ||
    adapter.price.includes('$8') ||
    adapter.price.includes('$10') ||
    adapter.price.includes('$12') ||
    adapter.price.includes('$15') ||
    adapter.price.includes('$18') ||
    adapter.price.includes('$20')
  );
};

export const getAppCompatibleAdapters = (appName: 'torque' | 'carly' | 'obd2facile' | 'carscanner') => {
  const appKeywords = {
    torque: ['torque', 'elm327'],
    carly: ['carly', 'coding', 'manufacturer'],
    obd2facile: ['facile', 'french'],
    carscanner: ['scanner', 'carscan', 'car scanner']
  };
  
  const keywords = appKeywords[appName] || [];
  
  return OBD2_ADAPTERS.filter(adapter => 
    keywords.some(keyword => 
      adapter.name.toLowerCase().includes(keyword) ||
      adapter.description.toLowerCase().includes(keyword) ||
      adapter.features.some(feature => feature.toLowerCase().includes(keyword))
    )
  );
};
