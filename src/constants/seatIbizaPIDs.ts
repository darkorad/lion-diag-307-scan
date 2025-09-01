export interface SeatIbizaPID {
  pid: string;
  name: string;
  category: 'engine' | 'transmission' | 'abs' | 'airbag' | 'comfort' | 'climate' | 'lighting' | 'security';
  unit: string;
  description: string;
  minValue?: number;
  maxValue?: number;
  formula?: (value: number) => number;
}

export const SEAT_IBIZA_PIDS: SeatIbizaPID[] = [
  // Engine Control Module (ECM) PIDs
  {
    pid: '010C',
    name: 'Engine RPM',
    category: 'engine',
    unit: 'rpm',
    description: 'Engine revolutions per minute',
    minValue: 0,
    maxValue: 8000,
    formula: (value: number) => value / 4
  },
  {
    pid: '010D',
    name: 'Vehicle Speed',
    category: 'engine',
    unit: 'km/h',
    description: 'Vehicle speed sensor reading',
    minValue: 0,
    maxValue: 255
  },
  {
    pid: '0105',
    name: 'Engine Coolant Temperature',
    category: 'engine',
    unit: '°C',
    description: 'Engine coolant temperature',
    minValue: -40,
    maxValue: 215,
    formula: (value: number) => value - 40
  },
  {
    pid: '0110',
    name: 'Mass Air Flow',
    category: 'engine',
    unit: 'g/s',
    description: 'Mass air flow sensor reading',
    minValue: 0,
    maxValue: 655.35,
    formula: (value: number) => value / 100
  },
  {
    pid: '0111',
    name: 'Throttle Position',
    category: 'engine',
    unit: '%',
    description: 'Throttle position sensor',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => (value * 100) / 255
  },
  {
    pid: '0104',
    name: 'Engine Load',
    category: 'engine',
    unit: '%',
    description: 'Calculated engine load value',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => (value * 100) / 255
  },
  {
    pid: '0106',
    name: 'Short Term Fuel Trim Bank 1',
    category: 'engine',
    unit: '%',
    description: 'Short term fuel trim for bank 1',
    minValue: -100,
    maxValue: 99.22,
    formula: (value: number) => (value - 128) * 100 / 128
  },
  {
    pid: '0107',
    name: 'Long Term Fuel Trim Bank 1',
    category: 'engine',
    unit: '%',
    description: 'Long term fuel trim for bank 1',
    minValue: -100,
    maxValue: 99.22,
    formula: (value: number) => (value - 128) * 100 / 128
  },
  {
    pid: '010A',
    name: 'Fuel Pressure',
    category: 'engine',
    unit: 'kPa',
    description: 'Fuel pressure (gauge pressure)',
    minValue: 0,
    maxValue: 765,
    formula: (value: number) => value * 3
  },
  {
    pid: '010B',
    name: 'Intake Manifold Pressure',
    category: 'engine',
    unit: 'kPa',
    description: 'Intake manifold absolute pressure',
    minValue: 0,
    maxValue: 255
  },
  {
    pid: '010E',
    name: 'Timing Advance',
    category: 'engine',
    unit: '°',
    description: 'Timing advance (cylinder 1)',
    minValue: -64,
    maxValue: 63.5,
    formula: (value: number) => (value - 128) / 2
  },
  {
    pid: '010F',
    name: 'Intake Air Temperature',
    category: 'engine',
    unit: '°C',
    description: 'Intake air temperature',
    minValue: -40,
    maxValue: 215,
    formula: (value: number) => value - 40
  },
  {
    pid: '0114',
    name: 'Oxygen Sensor 1 Voltage',
    category: 'engine',
    unit: 'V',
    description: 'Oxygen sensor 1 voltage',
    minValue: 0,
    maxValue: 1.275,
    formula: (value: number) => value / 200
  },
  {
    pid: '0115',
    name: 'Oxygen Sensor 2 Voltage',
    category: 'engine',
    unit: 'V',
    description: 'Oxygen sensor 2 voltage',
    minValue: 0,
    maxValue: 1.275,
    formula: (value: number) => value / 200
  },
  {
    pid: '011C',
    name: 'OBD Standards',
    category: 'engine',
    unit: '',
    description: 'OBD standards this vehicle conforms to',
    minValue: 0,
    maxValue: 255
  },
  {
    pid: '011F',
    name: 'Run Time Since Engine Start',
    category: 'engine',
    unit: 's',
    description: 'Run time since engine start',
    minValue: 0,
    maxValue: 65535
  },
  {
    pid: '0121',
    name: 'Distance Traveled with MIL On',
    category: 'engine',
    unit: 'km',
    description: 'Distance traveled with malfunction indicator lamp on',
    minValue: 0,
    maxValue: 65535
  },
  {
    pid: '0122',
    name: 'Fuel Rail Pressure',
    category: 'engine',
    unit: 'kPa',
    description: 'Fuel rail pressure (relative to manifold vacuum)',
    minValue: 0,
    maxValue: 5177.265,
    formula: (value: number) => value * 0.079
  },
  {
    pid: '0123',
    name: 'Fuel Rail Gauge Pressure',
    category: 'engine',
    unit: 'kPa',
    description: 'Fuel rail gauge pressure (diesel, or gasoline direct injection)',
    minValue: 0,
    maxValue: 655350,
    formula: (value: number) => value * 10
  },
  {
    pid: '0124',
    name: 'Oxygen Sensor 1 Fuel-Air Equivalence Ratio',
    category: 'engine',
    unit: 'ratio',
    description: 'Oxygen sensor 1 fuel-air equivalence ratio',
    minValue: 0,
    maxValue: 2,
    formula: (value: number) => value / 32768
  },
  {
    pid: '0125',
    name: 'Oxygen Sensor 2 Fuel-Air Equivalence Ratio',
    category: 'engine',
    unit: 'ratio',
    description: 'Oxygen sensor 2 fuel-air equivalence ratio',
    minValue: 0,
    maxValue: 2,
    formula: (value: number) => value / 32768
  },
  {
    pid: '0126',
    name: 'Oxygen Sensor 3 Fuel-Air Equivalence Ratio',
    category: 'engine',
    unit: 'ratio',
    description: 'Oxygen sensor 3 fuel-air equivalence ratio',
    minValue: 0,
    maxValue: 2,
    formula: (value: number) => value / 32768
  },
  {
    pid: '0127',
    name: 'Oxygen Sensor 4 Fuel-Air Equivalence Ratio',
    category: 'engine',
    unit: 'ratio',
    description: 'Oxygen sensor 4 fuel-air equivalence ratio',
    minValue: 0,
    maxValue: 2,
    formula: (value: number) => value / 32768
  },
  {
    pid: '0128',
    name: 'Oxygen Sensor 5 Fuel-Air Equivalence Ratio',
    category: 'engine',
    unit: 'ratio',
    description: 'Oxygen sensor 5 fuel-air equivalence ratio',
    minValue: 0,
    maxValue: 2,
    formula: (value: number) => value / 32768
  },
  {
    pid: '0129',
    name: 'Oxygen Sensor 6 Fuel-Air Equivalence Ratio',
    category: 'engine',
    unit: 'ratio',
    description: 'Oxygen sensor 6 fuel-air equivalence ratio',
    minValue: 0,
    maxValue: 2,
    formula: (value: number) => value / 32768
  },
  {
    pid: '012A',
    name: 'Oxygen Sensor 7 Fuel-Air Equivalence Ratio',
    category: 'engine',
    unit: 'ratio',
    description: 'Oxygen sensor 7 fuel-air equivalence ratio',
    minValue: 0,
    maxValue: 2,
    formula: (value: number) => value / 32768
  },
  {
    pid: '012B',
    name: 'Oxygen Sensor 8 Fuel-Air Equivalence Ratio',
    category: 'engine',
    unit: 'ratio',
    description: 'Oxygen sensor 8 fuel-air equivalence ratio',
    minValue: 0,
    maxValue: 2,
    formula: (value: number) => value / 32768
  },
  {
    pid: '012C',
    name: 'Commanded EGR',
    category: 'engine',
    unit: '%',
    description: 'Commanded EGR',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => (value * 100) / 255
  },
  {
    pid: '012D',
    name: 'EGR Error',
    category: 'engine',
    unit: '%',
    description: 'EGR Error',
    minValue: -100,
    maxValue: 99.22,
    formula: (value: number) => (value - 128) * 100 / 128
  },
  {
    pid: '012E',
    name: 'Commanded Evaporative Purge',
    category: 'engine',
    unit: '%',
    description: 'Commanded evaporative purge',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => (value * 100) / 255
  },
  {
    pid: '012F',
    name: 'Fuel Tank Level Input',
    category: 'engine',
    unit: '%',
    description: 'Fuel tank level input',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => (value * 100) / 255
  },
  {
    pid: '0130',
    name: 'Warm-ups Since Codes Cleared',
    category: 'engine',
    unit: 'count',
    description: 'Warm-ups since codes cleared',
    minValue: 0,
    maxValue: 255
  },
  {
    pid: '0131',
    name: 'Distance Traveled Since Codes Cleared',
    category: 'engine',
    unit: 'km',
    description: 'Distance traveled since codes cleared',
    minValue: 0,
    maxValue: 65535
  },
  {
    pid: '0132',
    name: 'Evap System Vapor Pressure',
    category: 'engine',
    unit: 'Pa',
    description: 'Evap. system vapor pressure',
    minValue: -8192,
    maxValue: 8191.75,
    formula: (value: number) => (value - 32768) / 4
  },
  {
    pid: '0133',
    name: 'Absolute Barometric Pressure',
    category: 'engine',
    unit: 'kPa',
    description: 'Absolute barometric pressure',
    minValue: 0,
    maxValue: 255
  },
  {
    pid: '0134',
    name: 'Oxygen Sensor 1 Current',
    category: 'engine',
    unit: 'mA',
    description: 'Oxygen sensor 1 current',
    minValue: -128,
    maxValue: 127.996,
    formula: (value: number) => (value - 128) / 256
  },
  {
    pid: '0135',
    name: 'Oxygen Sensor 2 Current',
    category: 'engine',
    unit: 'mA',
    description: 'Oxygen sensor 2 current',
    minValue: -128,
    maxValue: 127.996,
    formula: (value: number) => (value - 128) / 256
  },
  {
    pid: '0136',
    name: 'Oxygen Sensor 3 Current',
    category: 'engine',
    unit: 'mA',
    description: 'Oxygen sensor 3 current',
    minValue: -128,
    maxValue: 127.996,
    formula: (value: number) => (value - 128) / 256
  },
  {
    pid: '0137',
    name: 'Oxygen Sensor 4 Current',
    category: 'engine',
    unit: 'mA',
    description: 'Oxygen sensor 4 current',
    minValue: -128,
    maxValue: 127.996,
    formula: (value: number) => (value - 128) / 256
  },
  {
    pid: '0138',
    name: 'Oxygen Sensor 5 Current',
    category: 'engine',
    unit: 'mA',
    description: 'Oxygen sensor 5 current',
    minValue: -128,
    maxValue: 127.996,
    formula: (value: number) => (value - 128) / 256
  },
  {
    pid: '0139',
    name: 'Oxygen Sensor 6 Current',
    category: 'engine',
    unit: 'mA',
    description: 'Oxygen sensor 6 current',
    minValue: -128,
    maxValue: 127.996,
    formula: (value: number) => (value - 128) / 256
  },
  {
    pid: '013A',
    name: 'Oxygen Sensor 7 Current',
    category: 'engine',
    unit: 'mA',
    description: 'Oxygen sensor 7 current',
    minValue: -128,
    maxValue: 127.996,
    formula: (value: number) => (value - 128) / 256
  },
  {
    pid: '013B',
    name: 'Oxygen Sensor 8 Current',
    category: 'engine',
    unit: 'mA',
    description: 'Oxygen sensor 8 current',
    minValue: -128,
    maxValue: 127.996,
    formula: (value: number) => (value - 128) / 256
  },
  {
    pid: '013C',
    name: 'Catalyst Temperature Bank 1 Sensor 1',
    category: 'engine',
    unit: '°C',
    description: 'Catalyst temperature: Bank 1, Sensor 1',
    minValue: -40,
    maxValue: 6513.5,
    formula: (value: number) => (value / 10) - 40
  },
  {
    pid: '013D',
    name: 'Catalyst Temperature Bank 2 Sensor 1',
    category: 'engine',
    unit: '°C',
    description: 'Catalyst temperature: Bank 2, Sensor 1',
    minValue: -40,
    maxValue: 6513.5,
    formula: (value: number) => (value / 10) - 40
  },
  {
    pid: '013E',
    name: 'Catalyst Temperature Bank 1 Sensor 2',
    category: 'engine',
    unit: '°C',
    description: 'Catalyst temperature: Bank 1, Sensor 2',
    minValue: -40,
    maxValue: 6513.5,
    formula: (value: number) => (value / 10) - 40
  },
  {
    pid: '013F',
    name: 'Catalyst Temperature Bank 2 Sensor 2',
    category: 'engine',
    unit: '°C',
    description: 'Catalyst temperature: Bank 2, Sensor 2',
    minValue: -40,
    maxValue: 6513.5,
    formula: (value: number) => (value / 10) - 40
  },
  {
    pid: '0142',
    name: 'Control Module Voltage',
    category: 'engine',
    unit: 'V',
    description: 'Control module voltage',
    minValue: 0,
    maxValue: 65.535,
    formula: (value: number) => value / 1000
  },
  {
    pid: '0143',
    name: 'Absolute Load Value',
    category: 'engine',
    unit: '%',
    description: 'Absolute load value',
    minValue: 0,
    maxValue: 25700,
    formula: (value: number) => (value * 100) / 255
  },
  {
    pid: '0144',
    name: 'Fuel-Air Commanded Equivalence Ratio',
    category: 'engine',
    unit: 'ratio',
    description: 'Fuel-air commanded equivalence ratio',
    minValue: 0,
    maxValue: 2,
    formula: (value: number) => value / 32768
  },
  {
    pid: '0145',
    name: 'Relative Throttle Position',
    category: 'engine',
    unit: '%',
    description: 'Relative throttle position',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => (value * 100) / 255
  },
  {
    pid: '0146',
    name: 'Ambient Air Temperature',
    category: 'engine',
    unit: '°C',
    description: 'Ambient air temperature',
    minValue: -40,
    maxValue: 215,
    formula: (value: number) => value - 40
  },
  {
    pid: '0147',
    name: 'Absolute Throttle Position B',
    category: 'engine',
    unit: '%',
    description: 'Absolute throttle position B',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => (value * 100) / 255
  },
  {
    pid: '0148',
    name: 'Absolute Throttle Position C',
    category: 'engine',
    unit: '%',
    description: 'Absolute throttle position C',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => (value * 100) / 255
  },
  {
    pid: '0149',
    name: 'Accelerator Pedal Position D',
    category: 'engine',
    unit: '%',
    description: 'Accelerator pedal position D',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => (value * 100) / 255
  },
  {
    pid: '014A',
    name: 'Accelerator Pedal Position E',
    category: 'engine',
    unit: '%',
    description: 'Accelerator pedal position E',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => (value * 100) / 255
  },
  {
    pid: '014B',
    name: 'Accelerator Pedal Position F',
    category: 'engine',
    unit: '%',
    description: 'Accelerator pedal position F',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => (value * 100) / 255
  },
  {
    pid: '014C',
    name: 'Commanded Throttle Actuator',
    category: 'engine',
    unit: '%',
    description: 'Commanded throttle actuator',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => (value * 100) / 255
  },
  {
    pid: '014D',
    name: 'Time Run with MIL On',
    category: 'engine',
    unit: 'min',
    description: 'Time run with MIL on',
    minValue: 0,
    maxValue: 65535
  },
  {
    pid: '014E',
    name: 'Time Since Trouble Codes Cleared',
    category: 'engine',
    unit: 'min',
    description: 'Time since trouble codes cleared',
    minValue: 0,
    maxValue: 65535
  },
  {
    pid: '014F',
    name: 'Maximum Value for Fuel-Air Equivalence Ratio',
    category: 'engine',
    unit: 'ratio',
    description: 'Maximum value for fuel-air equivalence ratio, oxygen sensor voltage, oxygen sensor current, and intake manifold absolute pressure',
    minValue: 0,
    maxValue: 255
  },
  {
    pid: '0150',
    name: 'Maximum Value for Air Flow Rate',
    category: 'engine',
    unit: 'g/s',
    description: 'Maximum value for air flow rate from mass air flow sensor',
    minValue: 0,
    maxValue: 2550,
    formula: (value: number) => value * 10
  },
  {
    pid: '0151',
    name: 'Fuel Type',
    category: 'engine',
    unit: '',
    description: 'Fuel Type',
    minValue: 0,
    maxValue: 255
  },
  {
    pid: '0152',
    name: 'Ethanol Fuel Percentage',
    category: 'engine',
    unit: '%',
    description: 'Ethanol fuel percentage',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => (value * 100) / 255
  },
  {
    pid: '0153',
    name: 'Absolute Evap System Vapor Pressure',
    category: 'engine',
    unit: 'kPa',
    description: 'Absolute Evap system vapor pressure',
    minValue: 0,
    maxValue: 327.675,
    formula: (value: number) => value / 200
  },
  {
    pid: '0154',
    name: 'Evap System Vapor Pressure',
    category: 'engine',
    unit: 'Pa',
    description: 'Evap system vapor pressure',
    minValue: -32767,
    maxValue: 32768
  },
  {
    pid: '0155',
    name: 'Short Term Secondary Oxygen Sensor Trim Bank 1',
    category: 'engine',
    unit: '%',
    description: 'Short term secondary oxygen sensor trim, A: bank 1, B: bank 3',
    minValue: -100,
    maxValue: 99.22,
    formula: (value: number) => (value - 128) * 100 / 128
  },
  {
    pid: '0156',
    name: 'Long Term Secondary Oxygen Sensor Trim Bank 1',
    category: 'engine',
    unit: '%',
    description: 'Long term secondary oxygen sensor trim, A: bank 1, B: bank 3',
    minValue: -100,
    maxValue: 99.22,
    formula: (value: number) => (value - 128) * 100 / 128
  },
  {
    pid: '0157',
    name: 'Short Term Secondary Oxygen Sensor Trim Bank 2',
    category: 'engine',
    unit: '%',
    description: 'Short term secondary oxygen sensor trim, A: bank 2, B: bank 4',
    minValue: -100,
    maxValue: 99.22,
    formula: (value: number) => (value - 128) * 100 / 128
  },
  {
    pid: '0158',
    name: 'Long Term Secondary Oxygen Sensor Trim Bank 2',
    category: 'engine',
    unit: '%',
    description: 'Long term secondary oxygen sensor trim, A: bank 2, B: bank 4',
    minValue: -100,
    maxValue: 99.22,
    formula: (value: number) => (value - 128) * 100 / 128
  },
  {
    pid: '0159',
    name: 'Fuel Rail Absolute Pressure',
    category: 'engine',
    unit: 'kPa',
    description: 'Fuel rail absolute pressure',
    minValue: 0,
    maxValue: 655350,
    formula: (value: number) => value * 10
  },
  {
    pid: '015A',
    name: 'Relative Accelerator Pedal Position',
    category: 'engine',
    unit: '%',
    description: 'Relative accelerator pedal position',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => (value * 100) / 255
  },
  {
    pid: '015B',
    name: 'Hybrid Battery Pack Remaining Life',
    category: 'engine',
    unit: '%',
    description: 'Hybrid battery pack remaining life',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => (value * 100) / 255
  },
  {
    pid: '015C',
    name: 'Engine Oil Temperature',
    category: 'engine',
    unit: '°C',
    description: 'Engine oil temperature',
    minValue: -40,
    maxValue: 215,
    formula: (value: number) => value - 40
  },
  {
    pid: '015D',
    name: 'Fuel Injection Timing',
    category: 'engine',
    unit: '°',
    description: 'Fuel injection timing',
    minValue: -210,
    maxValue: 301.992,
    formula: (value: number) => (value - 26880) / 128
  },
  {
    pid: '015E',
    name: 'Engine Fuel Rate',
    category: 'engine',
    unit: 'L/h',
    description: 'Engine fuel rate',
    minValue: 0,
    maxValue: 3276.75,
    formula: (value: number) => value * 0.05
  },
  {
    pid: '015F',
    name: 'Emission Requirements',
    category: 'engine',
    unit: '',
    description: 'Emission requirements to which vehicle is designed',
    minValue: 0,
    maxValue: 255
  },
  // Seat-specific PIDs (manufacturer-specific)
  {
    pid: '221A01',
    name: 'Engine Speed',
    category: 'engine',
    unit: 'rpm',
    description: 'Engine speed from ECU',
    minValue: 0,
    maxValue: 8000,
    formula: (value: number) => value * 0.25
  },
  {
    pid: '221A02',
    name: 'Vehicle Speed',
    category: 'engine',
    unit: 'km/h',
    description: 'Vehicle speed from ECU',
    minValue: 0,
    maxValue: 300
  },
  {
    pid: '221A03',
    name: 'Coolant Temperature',
    category: 'engine',
    unit: '°C',
    description: 'Engine coolant temperature from ECU',
    minValue: -40,
    maxValue: 150,
    formula: (value: number) => value - 40
  },
  {
    pid: '221A04',
    name: 'Intake Air Temperature',
    category: 'engine',
    unit: '°C',
    description: 'Intake air temperature from ECU',
    minValue: -40,
    maxValue: 150,
    formula: (value: number) => value - 40
  },
  {
    pid: '221A05',
    name: 'Mass Air Flow',
    category: 'engine',
    unit: 'kg/h',
    description: 'Mass air flow from ECU',
    minValue: 0,
    maxValue: 1000,
    formula: (value: number) => value * 0.1
  },
  {
    pid: '221A06',
    name: 'Throttle Position',
    category: 'engine',
    unit: '%',
    description: 'Throttle position from ECU',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => value * 0.4
  },
  {
    pid: '221A07',
    name: 'Lambda Bank 1',
    category: 'engine',
    unit: 'λ',
    description: 'Lambda value bank 1',
    minValue: 0.5,
    maxValue: 1.5,
    formula: (value: number) => value / 32768
  },
  {
    pid: '221A08',
    name: 'Lambda Bank 2',
    category: 'engine',
    unit: 'λ',
    description: 'Lambda value bank 2',
    minValue: 0.5,
    maxValue: 1.5,
    formula: (value: number) => value / 32768
  },
  {
    pid: '221A09',
    name: 'Fuel Pressure',
    category: 'engine',
    unit: 'bar',
    description: 'Fuel system pressure',
    minValue: 0,
    maxValue: 10,
    formula: (value: number) => value * 0.01
  },
  {
    pid: '221A0A',
    name: 'Boost Pressure',
    category: 'engine',
    unit: 'mbar',
    description: 'Turbocharger boost pressure',
    minValue: 0,
    maxValue: 2500,
    formula: (value: number) => value * 0.1
  },
  {
    pid: '221A0B',
    name: 'EGR Position',
    category: 'engine',
    unit: '%',
    description: 'EGR valve position',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => value * 0.4
  },
  {
    pid: '221A0C',
    name: 'Injection Quantity',
    category: 'engine',
    unit: 'mg/stroke',
    description: 'Fuel injection quantity',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => value * 0.01
  },
  {
    pid: '221A0D',
    name: 'Rail Pressure Actual',
    category: 'engine',
    unit: 'bar',
    description: 'Actual fuel rail pressure',
    minValue: 0,
    maxValue: 2000,
    formula: (value: number) => value * 0.1
  },
  {
    pid: '221A0E',
    name: 'Rail Pressure Desired',
    category: 'engine',
    unit: 'bar',
    description: 'Desired fuel rail pressure',
    minValue: 0,
    maxValue: 2000,
    formula: (value: number) => value * 0.1
  },
  {
    pid: '221A0F',
    name: 'Turbo Speed',
    category: 'engine',
    unit: 'rpm',
    description: 'Turbocharger speed',
    minValue: 0,
    maxValue: 300000,
    formula: (value: number) => value * 10
  },
  {
    pid: '221A10',
    name: 'DPF Pressure Difference',
    category: 'engine',
    unit: 'mbar',
    description: 'Diesel particulate filter pressure difference',
    minValue: 0,
    maxValue: 1000,
    formula: (value: number) => value * 0.1
  },
  {
    pid: '221A11',
    name: 'DPF Temperature',
    category: 'engine',
    unit: '°C',
    description: 'Diesel particulate filter temperature',
    minValue: 0,
    maxValue: 1000,
    formula: (value: number) => value - 40
  },
  {
    pid: '221A12',
    name: 'AdBlue Level',
    category: 'engine',
    unit: '%',
    description: 'AdBlue (DEF) tank level',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => value * 0.4
  },
  {
    pid: '221A13',
    name: 'Battery Voltage',
    category: 'engine',
    unit: 'V',
    description: 'Vehicle battery voltage',
    minValue: 0,
    maxValue: 20,
    formula: (value: number) => value * 0.01
  },
  {
    pid: '221A14',
    name: 'Alternator Load',
    category: 'engine',
    unit: '%',
    description: 'Alternator load percentage',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => value * 0.4
  },
  {
    pid: '221A15',
    name: 'Oil Pressure',
    category: 'engine',
    unit: 'bar',
    description: 'Engine oil pressure',
    minValue: 0,
    maxValue: 10,
    formula: (value: number) => value * 0.01
  },
  {
    pid: '221A16',
    name: 'Oil Temperature',
    category: 'engine',
    unit: '°C',
    description: 'Engine oil temperature',
    minValue: -40,
    maxValue: 200,
    formula: (value: number) => value - 40
  },
  {
    pid: '221A17',
    name: 'Gearbox Oil Temperature',
    category: 'transmission',
    unit: '°C',
    description: 'Transmission oil temperature',
    minValue: -40,
    maxValue: 200,
    formula: (value: number) => value - 40
  },
  {
    pid: '221A18',
    name: 'Current Gear',
    category: 'transmission',
    unit: '',
    description: 'Currently engaged gear',
    minValue: 0,
    maxValue: 8
  },
  {
    pid: '221A19',
    name: 'Clutch Position',
    category: 'transmission',
    unit: '%',
    description: 'Clutch pedal position',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => value * 0.4
  },
  {
    pid: '221A1A',
    name: 'Steering Angle',
    category: 'comfort',
    unit: '°',
    description: 'Steering wheel angle',
    minValue: -720,
    maxValue: 720,
    formula: (value: number) => (value - 32768) * 0.1
  },
  {
    pid: '221A1B',
    name: 'Brake Pressure',
    category: 'abs',
    unit: 'bar',
    description: 'Brake system pressure',
    minValue: 0,
    maxValue: 200,
    formula: (value: number) => value * 0.1
  },
  {
    pid: '221A1C',
    name: 'ABS Active',
    category: 'abs',
    unit: '',
    description: 'ABS system active status',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A1D',
    name: 'ESP Active',
    category: 'abs',
    unit: '',
    description: 'ESP system active status',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A1E',
    name: 'Wheel Speed FL',
    category: 'abs',
    unit: 'km/h',
    description: 'Front left wheel speed',
    minValue: 0,
    maxValue: 300,
    formula: (value: number) => value * 0.1
  },
  {
    pid: '221A1F',
    name: 'Wheel Speed FR',
    category: 'abs',
    unit: 'km/h',
    description: 'Front right wheel speed',
    minValue: 0,
    maxValue: 300,
    formula: (value: number) => value * 0.1
  },
  {
    pid: '221A20',
    name: 'Wheel Speed RL',
    category: 'abs',
    unit: 'km/h',
    description: 'Rear left wheel speed',
    minValue: 0,
    maxValue: 300,
    formula: (value: number) => value * 0.1
  },
  {
    pid: '221A21',
    name: 'Wheel Speed RR',
    category: 'abs',
    unit: 'km/h',
    description: 'Rear right wheel speed',
    minValue: 0,
    maxValue: 300,
    formula: (value: number) => value * 0.1
  },
  {
    pid: '221A22',
    name: 'Outside Temperature',
    category: 'climate',
    unit: '°C',
    description: 'Outside air temperature',
    minValue: -40,
    maxValue: 80,
    formula: (value: number) => value - 40
  },
  {
    pid: '221A23',
    name: 'AC Compressor',
    category: 'climate',
    unit: '',
    description: 'AC compressor status',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A24',
    name: 'AC Pressure',
    category: 'climate',
    unit: 'bar',
    description: 'AC system pressure',
    minValue: 0,
    maxValue: 30,
    formula: (value: number) => value * 0.1
  },
  {
    pid: '221A25',
    name: 'Interior Temperature',
    category: 'climate',
    unit: '°C',
    description: 'Interior cabin temperature',
    minValue: -40,
    maxValue: 80,
    formula: (value: number) => value - 40
  },
  {
    pid: '221A26',
    name: 'Fan Speed',
    category: 'climate',
    unit: '%',
    description: 'Climate control fan speed',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => value * 0.4
  },
  {
    pid: '221A27',
    name: 'Headlight Status',
    category: 'lighting',
    unit: '',
    description: 'Headlight on/off status',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A28',
    name: 'Turn Signal Left',
    category: 'lighting',
    unit: '',
    description: 'Left turn signal status',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A29',
    name: 'Turn Signal Right',
    category: 'lighting',
    unit: '',
    description: 'Right turn signal status',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A2A',
    name: 'Brake Light',
    category: 'lighting',
    unit: '',
    description: 'Brake light status',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A2B',
    name: 'Reverse Light',
    category: 'lighting',
    unit: '',
    description: 'Reverse light status',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A2C',
    name: 'Door Status FL',
    category: 'comfort',
    unit: '',
    description: 'Front left door open/closed',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A2D',
    name: 'Door Status FR',
    category: 'comfort',
    unit: '',
    description: 'Front right door open/closed',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A2E',
    name: 'Door Status RL',
    category: 'comfort',
    unit: '',
    description: 'Rear left door open/closed',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A2F',
    name: 'Door Status RR',
    category: 'comfort',
    unit: '',
    description: 'Rear right door open/closed',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A30',
    name: 'Window Position FL',
    category: 'comfort',
    unit: '%',
    description: 'Front left window position',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => value * 0.4
  },
  {
    pid: '221A31',
    name: 'Window Position FR',
    category: 'comfort',
    unit: '%',
    description: 'Front right window position',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => value * 0.4
  },
  {
    pid: '221A32',
    name: 'Sunroof Position',
    category: 'comfort',
    unit: '%',
    description: 'Sunroof position',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => value * 0.4
  },
  {
    pid: '221A33',
    name: 'Central Locking',
    category: 'security',
    unit: '',
    description: 'Central locking status',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A34',
    name: 'Alarm Status',
    category: 'security',
    unit: '',
    description: 'Vehicle alarm status',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A35',
    name: 'Immobilizer',
    category: 'security',
    unit: '',
    description: 'Engine immobilizer status',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A36',
    name: 'Key Status',
    category: 'security',
    unit: '',
    description: 'Key recognition status',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A37',
    name: 'Seatbelt Driver',
    category: 'airbag',
    unit: '',
    description: 'Driver seatbelt status',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A38',
    name: 'Seatbelt Passenger',
    category: 'airbag',
    unit: '',
    description: 'Passenger seatbelt status',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A39',
    name: 'Airbag Warning',
    category: 'airbag',
    unit: '',
    description: 'Airbag system warning',
    minValue: 0,
    maxValue: 1
  },
  {
    pid: '221A3A',
    name: 'Seat Position Driver',
    category: 'comfort',
    unit: '%',
    description: 'Driver seat position',
    minValue: 0,
    maxValue: 100,
    formula: (value: number) => value * 0.4
  },
  {
    pid: '221A85',
    name: 'Fuel Rail Pressure',
    category: 'engine',
    unit: 'bar',
    description: 'Current fuel rail pressure',
    minValue: 0,
    maxValue: 250,
    formula: (value: number) => value * 0.1
  }
];
