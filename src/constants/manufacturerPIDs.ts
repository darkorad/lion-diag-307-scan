
export interface ManufacturerPID {
  manufacturer: string;
  pid: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  minValue: number;
  maxValue: number;
  formula: (value: number) => number;
}

export const MANUFACTURER_PIDS: ManufacturerPID[] = [
  {
    manufacturer: 'Peugeot',
    pid: '227C',
    name: 'DPF Inlet Temperature',
    description: 'Diesel Particulate Filter inlet temperature',
    category: 'Emissions',
    unit: '°C',
    minValue: -40,
    maxValue: 1000,
    formula: (value: number) => value - 40
  },
  {
    manufacturer: 'Peugeot',
    pid: '227D',
    name: 'DPF Outlet Temperature',
    description: 'Diesel Particulate Filter outlet temperature',
    category: 'Emissions',
    unit: '°C',
    minValue: -40,
    maxValue: 1000,
    formula: (value: number) => value - 40
  },
  {
    manufacturer: 'Peugeot',
    pid: '227E',
    name: 'DPF Differential Pressure',
    description: 'Diesel Particulate Filter differential pressure',
    category: 'Emissions',
    unit: 'kPa',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => value / 4
  },
  {
    manufacturer: 'Seat',
    pid: '2280',
    name: 'Turbo Boost Pressure',
    description: 'Turbocharger boost pressure',
    category: 'Engine',
    unit: 'bar',
    minValue: 0,
    maxValue: 3,
    formula: (value: number) => value / 100
  },
  {
    manufacturer: 'VW',
    pid: '2281',
    name: 'EGR Position',
    description: 'Exhaust Gas Recirculation valve position',
    category: 'Emissions',
    unit: '%',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => (value / 255) * 100
  }
];
