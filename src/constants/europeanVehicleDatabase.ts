
export interface VehicleEngine {
  code: string;
  name: string;
  displacement: string;
  power: string;
  torque: string;
  fuelType: 'Diesel' | 'Gasoline' | 'Hybrid' | 'Electric';
  yearRange: string;
  injectorType?: string;
  turboType?: string;
  dpfType?: string;
  emissions: string[];
}

export interface VehicleTransmission {
  code: string;
  name: string;
  type: 'Manual' | 'Automatic' | 'CVT' | 'DSG' | 'Robotized';
  gears: number;
  yearRange: string;
}

export interface EuropeanVehicle {
  id: string;
  make: string;
  model: string;
  yearRange: string;
  engines: VehicleEngine[];
  transmissions: VehicleTransmission[];
  supportedProtocols: string[];
  specialFunctions: string[];
  ecuAddresses: { [key: string]: string };
}

export const EUROPEAN_VEHICLES: EuropeanVehicle[] = [
  // PEUGEOT MODELS
  {
    id: 'peugeot-206',
    make: 'Peugeot',
    model: '206',
    yearRange: '1998-2012',
    engines: [
      { code: 'TU1JP', name: '1.0i', displacement: '1.0L', power: '68hp', torque: '93Nm', fuelType: 'Gasoline', yearRange: '1998-2012', emissions: ['Euro3', 'Euro4'] },
      { code: 'TU3JP', name: '1.4i', displacement: '1.4L', power: '75hp', torque: '120Nm', fuelType: 'Gasoline', yearRange: '1998-2012', emissions: ['Euro3', 'Euro4'] },
      { code: 'TU5JP4', name: '1.6i 16V', displacement: '1.6L', power: '110hp', torque: '147Nm', fuelType: 'Gasoline', yearRange: '1998-2012', emissions: ['Euro3', 'Euro4'] },
      { code: 'DV4TD', name: '1.4 HDi', displacement: '1.4L', power: '68hp', torque: '160Nm', fuelType: 'Diesel', yearRange: '2001-2012', dpfType: 'FAP', emissions: ['Euro3', 'Euro4'] },
      { code: 'DW8', name: '1.9D', displacement: '1.9L', power: '70hp', torque: '150Nm', fuelType: 'Diesel', yearRange: '1998-2006', emissions: ['Euro2', 'Euro3'] },
      { code: 'DW10TD', name: '2.0 HDi', displacement: '2.0L', power: '90hp', torque: '205Nm', fuelType: 'Diesel', yearRange: '1999-2012', dpfType: 'FAP', emissions: ['Euro3', 'Euro4'] }
    ],
    transmissions: [
      { code: 'BE1', name: '5-speed Manual', type: 'Manual', gears: 5, yearRange: '1998-2012' },
      { code: 'BE3', name: '5-speed Manual', type: 'Manual', gears: 5, yearRange: '1998-2012' },
      { code: 'AL4', name: '4-speed Auto', type: 'Automatic', gears: 4, yearRange: '2000-2012' }
    ],
    supportedProtocols: ['ISO14230', 'ISO9141', 'CAN'],
    specialFunctions: ['BSI_ACCESS', 'RADIO_CODING', 'IMMOBILIZER', 'SERVICE_RESET'],
    ecuAddresses: { engine: '01', abs: '03', airbag: '15', bsi: '10', radio: '56' }
  },
  {
    id: 'peugeot-307',
    make: 'Peugeot',
    model: '307',
    yearRange: '2001-2014',
    engines: [
      { code: 'TU5JP4', name: '1.6i 16V', displacement: '1.6L', power: '110hp', torque: '147Nm', fuelType: 'Gasoline', yearRange: '2001-2014', emissions: ['Euro3', 'Euro4', 'Euro5'] },
      { code: 'EW10A', name: '2.0i 16V', displacement: '2.0L', power: '136hp', torque: '190Nm', fuelType: 'Gasoline', yearRange: '2001-2014', emissions: ['Euro3', 'Euro4', 'Euro5'] },
      { code: 'DV4TD', name: '1.4 HDi', displacement: '1.4L', power: '68hp', torque: '160Nm', fuelType: 'Diesel', yearRange: '2001-2014', dpfType: 'FAP', emissions: ['Euro3', 'Euro4', 'Euro5'] },
      { code: 'DW10BTED4', name: '1.6 HDi', displacement: '1.6L', power: '110hp', torque: '240Nm', fuelType: 'Diesel', yearRange: '2004-2014', dpfType: 'FAP', turboType: 'VGT', emissions: ['Euro4', 'Euro5'] },
      { code: 'DW10TD', name: '2.0 HDi', displacement: '2.0L', power: '136hp', torque: '320Nm', fuelType: 'Diesel', yearRange: '2001-2014', dpfType: 'FAP', turboType: 'VGT', emissions: ['Euro3', 'Euro4', 'Euro5'] }
    ],
    transmissions: [
      { code: 'BE4', name: '5-speed Manual', type: 'Manual', gears: 5, yearRange: '2001-2014' },
      { code: 'ML6C', name: '6-speed Manual', type: 'Manual', gears: 6, yearRange: '2005-2014' },
      { code: 'AL4', name: '4-speed Auto', type: 'Automatic', gears: 4, yearRange: '2001-2014' }
    ],
    supportedProtocols: ['ISO14230', 'CAN'],
    specialFunctions: ['BSI_ACCESS', 'RADIO_CODING', 'IMMOBILIZER', 'SERVICE_RESET', 'DPF_REGEN', 'EGR_LEARNING'],
    ecuAddresses: { engine: '01', abs: '03', airbag: '15', bsi: '10', radio: '56', climate: '09' }
  },
  // Add more Peugeot models...
  {
    id: 'peugeot-308',
    make: 'Peugeot',
    model: '308',
    yearRange: '2007-2021',
    engines: [
      { code: 'EP6', name: '1.6 THP', displacement: '1.6L', power: '156hp', torque: '240Nm', fuelType: 'Gasoline', yearRange: '2007-2021', turboType: 'Twin-scroll', emissions: ['Euro4', 'Euro5', 'Euro6'] },
      { code: 'DV6TED4', name: '1.6 HDi', displacement: '1.6L', power: '92hp', torque: '230Nm', fuelType: 'Diesel', yearRange: '2007-2021', dpfType: 'FAP', emissions: ['Euro4', 'Euro5', 'Euro6'] },
      { code: 'DV6C', name: '1.6 BlueHDi', displacement: '1.6L', power: '120hp', torque: '300Nm', fuelType: 'Diesel', yearRange: '2013-2021', dpfType: 'SCR+DPF', emissions: ['Euro6'] }
    ],
    transmissions: [
      { code: 'ML6C', name: '6-speed Manual', type: 'Manual', gears: 6, yearRange: '2007-2021' },
      { code: 'EAT6', name: '6-speed Auto', type: 'Automatic', gears: 6, yearRange: '2013-2021' },
      { code: 'BMP6', name: '6-speed Manual', type: 'Manual', gears: 6, yearRange: '2007-2021' }
    ],
    supportedProtocols: ['CAN', 'DoIP'],
    specialFunctions: ['BSI_ACCESS', 'INJECTOR_CODING', 'DPF_REGEN', 'EGR_LEARNING', 'TURBO_ACTUATOR'],
    ecuAddresses: { engine: '01', abs: '03', airbag: '15', bsi: '10', radio: '56', climate: '09' }
  },

  // VOLKSWAGEN MODELS
  {
    id: 'vw-golf-4',
    make: 'Volkswagen',
    model: 'Golf IV',
    yearRange: '1997-2006',
    engines: [
      { code: 'AHF', name: '1.9 TDI', displacement: '1.9L', power: '110hp', torque: '235Nm', fuelType: 'Diesel', yearRange: '1997-2006', turboType: 'VNT', injectorType: 'PD', emissions: ['Euro3', 'Euro4'] },
      { code: 'ASZ', name: '1.9 TDI PD', displacement: '1.9L', power: '130hp', torque: '310Nm', fuelType: 'Diesel', yearRange: '2000-2006', turboType: 'VNT', injectorType: 'PD', emissions: ['Euro3', 'Euro4'] },
      { code: 'AXR', name: '1.9 TDI', displacement: '1.9L', power: '101hp', torque: '250Nm', fuelType: 'Diesel', yearRange: '2000-2006', turboType: 'VNT', injectorType: 'PD', emissions: ['Euro3', 'Euro4'] },
      { code: 'AUE', name: '1.6', displacement: '1.6L', power: '102hp', torque: '148Nm', fuelType: 'Gasoline', yearRange: '1997-2006', emissions: ['Euro3', 'Euro4'] }
    ],
    transmissions: [
      { code: '02J', name: '5-speed Manual', type: 'Manual', gears: 5, yearRange: '1997-2006' },
      { code: '02K', name: '6-speed Manual', type: 'Manual', gears: 6, yearRange: '2002-2006' },
      { code: '01M', name: '5-speed Auto', type: 'Automatic', gears: 5, yearRange: '1997-2006' }
    ],
    supportedProtocols: ['KWP2000', 'CAN'],
    specialFunctions: ['VCDS_ACCESS', 'IMMOBILIZER', 'BASIC_SETTINGS', 'OUTPUT_TESTS', 'INJECTOR_CODING'],
    ecuAddresses: { engine: '01', abs: '03', airbag: '15', cluster: '17', central: '46' }
  },
  {
    id: 'vw-golf-5',
    make: 'Volkswagen',
    model: 'Golf V',
    yearRange: '2003-2009',
    engines: [
      { code: 'BKD', name: '2.0 TDI', displacement: '2.0L', power: '140hp', torque: '320Nm', fuelType: 'Diesel', yearRange: '2003-2009', turboType: 'VNT', injectorType: 'PD', dpfType: 'DPF', emissions: ['Euro4'] },
      { code: 'BXE', name: '1.9 TDI', displacement: '1.9L', power: '105hp', torque: '250Nm', fuelType: 'Diesel', yearRange: '2003-2009', turboType: 'VNT', injectorType: 'PD', emissions: ['Euro4'] },
      { code: 'BWA', name: '2.0 TSI', displacement: '2.0L', power: '200hp', torque: '280Nm', fuelType: 'Gasoline', yearRange: '2004-2009', turboType: 'K03', emissions: ['Euro4'] }
    ],
    transmissions: [
      { code: '02Q', name: '6-speed Manual', type: 'Manual', gears: 6, yearRange: '2003-2009' },
      { code: '02E', name: 'DSG 6-speed', type: 'DSG', gears: 6, yearRange: '2004-2009' },
      { code: '09G', name: '6-speed Auto', type: 'Automatic', gears: 6, yearRange: '2003-2009' }
    ],
    supportedProtocols: ['CAN'],
    specialFunctions: ['VCDS_ACCESS', 'DPF_REGEN', 'INJECTOR_CODING', 'DSG_ADAPTATION', 'TURBO_ACTUATOR'],
    ecuAddresses: { engine: '01', abs: '03', airbag: '15', cluster: '17', transmission: '02' }
  },

  // SEAT MODELS
  {
    id: 'seat-ibiza-6l',
    make: 'Seat',
    model: 'Ibiza 6L',
    yearRange: '2002-2009',
    engines: [
      { code: 'ASY', name: '1.9 TDI', displacement: '1.9L', power: '100hp', torque: '240Nm', fuelType: 'Diesel', yearRange: '2002-2009', turboType: 'VNT', injectorType: 'PD', emissions: ['Euro3', 'Euro4'] },
      { code: 'BPD', name: '1.9 TDI', displacement: '1.9L', power: '130hp', torque: '310Nm', fuelType: 'Diesel', yearRange: '2005-2009', turboType: 'VNT', injectorType: 'PD', emissions: ['Euro4'] },
      { code: 'BBY', name: '1.2', displacement: '1.2L', power: '64hp', torque: '108Nm', fuelType: 'Gasoline', yearRange: '2002-2009', emissions: ['Euro3', 'Euro4'] }
    ],
    transmissions: [
      { code: '02T', name: '5-speed Manual', type: 'Manual', gears: 5, yearRange: '2002-2009' },
      { code: '02S', name: '6-speed Manual', type: 'Manual', gears: 6, yearRange: '2005-2009' }
    ],
    supportedProtocols: ['KWP2000', 'CAN'],
    specialFunctions: ['VCDS_ACCESS', 'IMMOBILIZER', 'INJECTOR_CODING', 'SERVICE_RESET'],
    ecuAddresses: { engine: '01', abs: '03', airbag: '15', cluster: '17' }
  },

  // SKODA MODELS
  {
    id: 'skoda-octavia-1u',
    make: 'Skoda',
    model: 'Octavia I',
    yearRange: '1996-2010',
    engines: [
      { code: 'ALH', name: '1.9 TDI', displacement: '1.9L', power: '90hp', torque: '210Nm', fuelType: 'Diesel', yearRange: '1996-2006', turboType: 'VNT', injectorType: 'VE', emissions: ['Euro2', 'Euro3'] },
      { code: 'ASV', name: '1.9 TDI', displacement: '1.9L', power: '110hp', torque: '235Nm', fuelType: 'Diesel', yearRange: '2000-2010', turboType: 'VNT', injectorType: 'PD', emissions: ['Euro3', 'Euro4'] },
      { code: 'AZQ', name: '2.0', displacement: '2.0L', power: '115hp', torque: '170Nm', fuelType: 'Gasoline', yearRange: '2000-2010', emissions: ['Euro3', 'Euro4'] }
    ],
    transmissions: [
      { code: '02J', name: '5-speed Manual', type: 'Manual', gears: 5, yearRange: '1996-2010' },
      { code: '01M', name: '5-speed Auto', type: 'Automatic', gears: 5, yearRange: '2000-2010' }
    ],
    supportedProtocols: ['KWP2000', 'CAN'],
    specialFunctions: ['VCDS_ACCESS', 'IMMOBILIZER', 'INJECTOR_CODING', 'BASIC_SETTINGS'],
    ecuAddresses: { engine: '01', abs: '03', airbag: '15', cluster: '17' }
  },

  // RENAULT MODELS
  {
    id: 'renault-clio-2',
    make: 'Renault',
    model: 'Clio II',
    yearRange: '1998-2012',
    engines: [
      { code: 'F9Q', name: '1.5 dCi', displacement: '1.5L', power: '82hp', torque: '185Nm', fuelType: 'Diesel', yearRange: '2001-2012', turboType: 'VGT', emissions: ['Euro3', 'Euro4'] },
      { code: 'K4M', name: '1.6 16V', displacement: '1.6L', power: '110hp', torque: '148Nm', fuelType: 'Gasoline', yearRange: '1999-2012', emissions: ['Euro3', 'Euro4'] },
      { code: 'D4F', name: '1.2 16V', displacement: '1.2L', power: '75hp', torque: '107Nm', fuelType: 'Gasoline', yearRange: '2000-2012', emissions: ['Euro3', 'Euro4'] }
    ],
    transmissions: [
      { code: 'JH3', name: '5-speed Manual', type: 'Manual', gears: 5, yearRange: '1998-2012' },
      { code: 'DP0', name: '4-speed Auto', type: 'Automatic', gears: 4, yearRange: '2001-2012' }
    ],
    supportedProtocols: ['ISO14230', 'CAN'],
    specialFunctions: ['UCH_ACCESS', 'IMMOBILIZER', 'SERVICE_RESET', 'EGR_LEARNING'],
    ecuAddresses: { engine: '10', abs: '20', airbag: '15', uch: '08' }
  },

  // BMW MODELS
  {
    id: 'bmw-e46',
    make: 'BMW',
    model: '3 Series E46',
    yearRange: '1998-2007',
    engines: [
      { code: 'M47D20', name: '320d', displacement: '2.0L', power: '150hp', torque: '330Nm', fuelType: 'Diesel', yearRange: '1998-2007', turboType: 'VNT', injectorType: 'CR', emissions: ['Euro3', 'Euro4'] },
      { code: 'M54B25', name: '325i', displacement: '2.5L', power: '192hp', torque: '245Nm', fuelType: 'Gasoline', yearRange: '2000-2007', emissions: ['Euro3', 'Euro4'] },
      { code: 'M43B19', name: '318i', displacement: '1.9L', power: '118hp', torque: '180Nm', fuelType: 'Gasoline', yearRange: '1998-2002', emissions: ['Euro3'] }
    ],
    transmissions: [
      { code: 'Getrag 250G', name: '5-speed Manual', type: 'Manual', gears: 5, yearRange: '1998-2007' },
      { code: 'ZF 5HP19', name: '5-speed Auto', type: 'Automatic', gears: 5, yearRange: '1998-2007' }
    ],
    supportedProtocols: ['DS2', 'CAN'],
    specialFunctions: ['INPA_ACCESS', 'SIA_RESET', 'INJECTOR_CODING', 'EGS_ADAPTATION'],
    ecuAddresses: { engine: '12', abs: '34', airbag: '36', komfort: '00' }
  }
];

export const getVehiclesByMake = (make: string) => {
  return EUROPEAN_VEHICLES.filter(vehicle => vehicle.make === make);
};

export const getVehicleById = (id: string) => {
  return EUROPEAN_VEHICLES.find(vehicle => vehicle.id === id);
};

export const getAllMakes = () => {
  return [...new Set(EUROPEAN_VEHICLES.map(vehicle => vehicle.make))].sort();
};

export const getAllModelsForMake = (make: string) => {
  return getVehiclesByMake(make).map(vehicle => vehicle.model).sort();
};
